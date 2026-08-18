# Misión 7 — Rompecabezas: Handoff completo de lógica

> **Para el agente receptor:** Este archivo contiene todo el código funcional del juego de rompecabezas. Tu trabajo es envolver esta lógica con el diseño visual que el usuario te indique. **No modifiques la lógica del reducer ni los tipos.** Solo reemplaza los estilos inline de los componentes con tus clases/estilos de diseño.

---

## Arquitectura

```
Pieces (data) → PuzzleGame (orquestador)
                    ├── PuzzleBoard  (tablero 3×4, recibe clics en slots)
                    │       └── PuzzlePiece  (pieza colocada, solo visual)
                    └── PieceTray   (bandeja paginada de piezas disponibles)
                            └── PuzzlePiece  (pieza seleccionable)
```

**Flujo de interacción:**
1. Usuario clica una pieza en `PieceTray` → `SELECT_PIECE`
2. Usuario clica un slot vacío en `PuzzleBoard` → `PLACE_ATTEMPT`
3. Reducer valida: `piece.correctIndex === slotIndex`
   - ✅ Correcto → pieza pasa al tablero, se elimina de la bandeja
   - ❌ Incorrecto → `lastError` se setea (úsalo para animar shake/rojo)
4. Cuando todos los slots están llenos → `status = 'won'`

---

## Datos del juego

- **Grid:** 3 filas × 4 columnas = **12 piezas**
- **`correctIndex`:** `0–11`, es la posición que la pieza debe ocupar en `board[]`
- **`imageUrl`:** URL de imagen real (o `null` → usa color placeholder)
- **Fuente de datos:** tabla Supabase `jigsaw_pieces` (`id`, `image_url`, `order_index`)

---

## Código fuente

### `lib/jigsaw/types.ts`

```typescript
export const PUZZLE_ROWS = 3;
export const PUZZLE_COLS = 4;
export const EXPECTED_PIECE_COUNT = PUZZLE_ROWS * PUZZLE_COLS; // 12

export const PLACEHOLDER_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
];

export type GameStatus = 'playing' | 'won';

export interface Piece {
  id: string;
  correctIndex: number;    // posición correcta en el tablero (0–11)
  imageUrl: string | null;
}

export interface PieceError {
  pieceId: string;
  slotIndex: number;
}

export interface GameState {
  pieces: Piece[];              // piezas en la bandeja (aún no colocadas)
  board: (string | null)[];    // 12 slots; null = vacío, string = pieceId colocado
  selectedPieceId: string | null;
  lastError: PieceError | null;
  status: GameStatus;
}
```

---

### `lib/game/shuffle.ts`

```typescript
/** Fisher-Yates shuffle — genérico */
export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

---

### `lib/jigsaw/pieces.ts`

```typescript
import { shuffleArray } from '../game/shuffle';
import { EXPECTED_PIECE_COUNT, PLACEHOLDER_PALETTE, type Piece } from './types';

export function mapRowsToPieces(
  rows: { id: string; order_index: number; image_url: string | null }[]
): Piece[] {
  return rows.map((row) => ({
    id: row.id,
    correctIndex: row.order_index,
    imageUrl: row.image_url,
  }));
}

export function hasExpectedPieceCount(rows: { id: string }[]): boolean {
  return rows.length === EXPECTED_PIECE_COUNT;
}

export function shufflePieces(pieces: Piece[]): Piece[] {
  return shuffleArray(pieces);
}

/** Color de placeholder por posición (cíclico sobre la paleta) */
export function getPlaceholderColor(correctIndex: number): string {
  return PLACEHOLDER_PALETTE[correctIndex % PLACEHOLDER_PALETTE.length];
}
```

---

### `lib/jigsaw/reducer.ts`

```typescript
import { EXPECTED_PIECE_COUNT, type GameState, type Piece } from './types';

export type GameAction =
  | { type: 'SELECT_PIECE'; pieceId: string }
  | { type: 'PLACE_ATTEMPT'; slotIndex: number }
  | { type: 'RESET'; pieces: Piece[] };

export function createInitialState(pieces: Piece[]): GameState {
  return {
    pieces,
    board: new Array(EXPECTED_PIECE_COUNT).fill(null),
    selectedPieceId: null,
    lastError: null,
    status: 'playing',
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'SELECT_PIECE': {
      if (state.status !== 'playing') return state;
      if (!state.pieces.some((p) => p.id === action.pieceId)) return state;
      return { ...state, selectedPieceId: action.pieceId, lastError: null };
    }

    case 'PLACE_ATTEMPT': {
      if (state.status !== 'playing') return state;
      if (!state.selectedPieceId) return state;
      if (state.board[action.slotIndex] !== null) return state; // slot ocupado

      const piece = state.pieces.find((p) => p.id === state.selectedPieceId);
      if (!piece) return state;

      // ❌ Posición incorrecta: feedback de error, pieza vuelve a la bandeja
      if (piece.correctIndex !== action.slotIndex) {
        return {
          ...state,
          selectedPieceId: null,
          lastError: { pieceId: piece.id, slotIndex: action.slotIndex },
        };
      }

      // ✅ Posición correcta: colocar en el tablero
      const pieces = state.pieces.filter((p) => p.id !== piece.id);
      const board = [...state.board];
      board[action.slotIndex] = piece.id;
      const won = board.every((slot) => slot !== null);

      return {
        ...state,
        pieces,
        board,
        selectedPieceId: null,
        lastError: null,
        status: won ? 'won' : 'playing',
      };
    }

    case 'RESET':
      return createInitialState(action.pieces);

    default:
      return state;
  }
}
```

---

### `components/jigsaw/PuzzlePiece.tsx`

```tsx
'use client';

import { getPlaceholderColor } from '@/lib/jigsaw/pieces';
import type { Piece } from '@/lib/jigsaw/types';

interface PuzzlePieceProps {
  piece: Piece;
  selected?: boolean;   // resalta con ring al estar seleccionada
  error?: boolean;      // resalta en rojo + animación shake al ser incorrecta
  onClick?: () => void;
}

export function PuzzlePiece({ piece, selected = false, error = false, onClick }: PuzzlePieceProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      data-testid={`puzzle-piece-${piece.id}`}
      // 🎨 DISEÑO: reemplaza estas clases con tus estilos del Figma
      className={[
        'flex aspect-square w-full items-center justify-center rounded-md text-lg font-bold text-white transition-transform',
        selected ? 'ring-4 ring-blue-900 ring-offset-1' : '',
        error ? 'animate-[shake_0.5s_ease-in-out] ring-4 ring-red-600 ring-offset-1' : '',
      ].join(' ')}
      style={{
        backgroundColor: piece.imageUrl ? undefined : getPlaceholderColor(piece.correctIndex),
        backgroundImage: piece.imageUrl ? `url(${piece.imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Número visible solo cuando no hay imagen real */}
      {!piece.imageUrl && piece.correctIndex + 1}
    </button>
  );
}
```

---

### `components/jigsaw/PuzzleBoard.tsx`

```tsx
'use client';

import { PUZZLE_COLS, type Piece, type PieceError } from '@/lib/jigsaw/types';
import { PuzzlePiece } from './PuzzlePiece';

interface PuzzleBoardProps {
  board: (string | null)[];
  pieceById: Map<string, Piece>;
  lastError: PieceError | null;
  onSlotClick: (slotIndex: number) => void;
}

export function PuzzleBoard({ board, pieceById, lastError, onSlotClick }: PuzzleBoardProps) {
  return (
    // 🎨 DISEÑO: aplica tu estilo de tablero aquí (borde, fondo, sombra, etc.)
    <div
      data-testid="puzzle-board"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${PUZZLE_COLS}, minmax(0, 1fr))`,
        gap: 4,
      }}
    >
      {board.map((pieceId, slotIndex) => {
        const piece = pieceId ? pieceById.get(pieceId) : undefined;
        const isError = lastError?.slotIndex === slotIndex;

        // Slot ocupado: muestra la pieza colocada (no clickeable)
        if (piece) {
          return (
            <div key={slotIndex} data-testid={`puzzle-slot-${slotIndex}`} style={{ aspectRatio: '1' }}>
              <PuzzlePiece piece={piece} />
            </div>
          );
        }

        // Slot vacío: clickeable para recibir la pieza seleccionada
        return (
          <button
            key={slotIndex}
            type="button"
            data-testid={`puzzle-slot-${slotIndex}`}
            onClick={() => onSlotClick(slotIndex)}
            // 🎨 DISEÑO: reemplaza con tu estilo de slot vacío / slot con error
            style={{
              aspectRatio: '1',
              border: isError ? '2px solid #dc2626' : '2px dashed #93c5fd',
              borderRadius: 8,
              background: isError ? '#fef2f2' : 'transparent',
              cursor: 'pointer',
            }}
          />
        );
      })}
    </div>
  );
}
```

---

### `components/jigsaw/PieceTray.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import type { Piece } from '@/lib/jigsaw/types';
import { PuzzlePiece } from './PuzzlePiece';

const VISIBLE_COUNT = 3; // piezas visibles a la vez en la bandeja

interface PieceTrayProps {
  pieces: Piece[];
  selectedPieceId: string | null;
  errorPieceId: string | null;
  onSelectPiece: (pieceId: string) => void;
}

export function PieceTray({ pieces, selectedPieceId, errorPieceId, onSelectPiece }: PieceTrayProps) {
  const [startIndex, setStartIndex] = useState(0);
  const maxStartIndex = Math.max(pieces.length - VISIBLE_COUNT, 0);

  // Mantiene startIndex válido cuando las piezas disponibles se reducen
  useEffect(() => {
    setStartIndex((current) => Math.min(current, maxStartIndex));
  }, [maxStartIndex]);

  const visiblePieces = pieces.slice(startIndex, startIndex + VISIBLE_COUNT);

  return (
    // 🎨 DISEÑO: reemplaza con tu contenedor de bandeja
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minWidth: 100 }}>
      {/* Botón paginación hacia arriba */}
      <button
        type="button"
        aria-label="Ver piezas anteriores"
        disabled={startIndex === 0}
        onClick={() => setStartIndex((c) => Math.max(c - 1, 0))}
      >
        ▲
      </button>

      {/* Piezas visibles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {visiblePieces.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 14 }}>¡Sin piezas pendientes!</p>
        )}
        {visiblePieces.map((piece) => (
          <PuzzlePiece
            key={piece.id}
            piece={piece}
            selected={selectedPieceId === piece.id}
            error={errorPieceId === piece.id}
            onClick={() => onSelectPiece(piece.id)}
          />
        ))}
      </div>

      {/* Botón paginación hacia abajo */}
      <button
        type="button"
        aria-label="Ver más piezas"
        disabled={startIndex >= maxStartIndex}
        onClick={() => setStartIndex((c) => Math.min(c + 1, maxStartIndex))}
      >
        ▼
      </button>
    </div>
  );
}
```

---

### `components/jigsaw/PuzzleGame.tsx` — Orquestador principal

```tsx
'use client';

import { useEffect, useMemo, useReducer, useState } from 'react';
import { createInitialState, gameReducer } from '@/lib/jigsaw/reducer';
import { shufflePieces } from '@/lib/jigsaw/pieces';
import type { Piece } from '@/lib/jigsaw/types';
import { PuzzleBoard } from './PuzzleBoard';
import { PieceTray } from './PieceTray';

interface PuzzleGameProps {
  pieces: Piece[];       // las 12 piezas (ordenadas, sin barajar)
  onWin?: () => void;   // callback opcional al completar el puzzle
}

export function PuzzleGame({ pieces, onWin }: PuzzleGameProps) {
  const [state, dispatch] = useReducer(gameReducer, pieces, createInitialState);
  const [showWinModal, setShowWinModal] = useState(false);

  // Al montar: barajar las piezas
  useEffect(() => {
    dispatch({ type: 'RESET', pieces: shufflePieces(pieces) });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Detectar victoria
  useEffect(() => {
    if (state.status === 'won') {
      setShowWinModal(true);
      onWin?.();
    }
  }, [state.status, onWin]);

  // Map id→Piece para lookups O(1)
  const allPieceById = useMemo(
    () => new Map(pieces.map((p) => [p.id, p])),
    [pieces]
  );

  function handleSelectPiece(pieceId: string) {
    dispatch({ type: 'SELECT_PIECE', pieceId });
  }

  function handleSlotClick(slotIndex: number) {
    dispatch({ type: 'PLACE_ATTEMPT', slotIndex });
  }

  function handleRetry() {
    dispatch({ type: 'RESET', pieces: shufflePieces(pieces) });
    setShowWinModal(false);
  }

  return (
    // 🎨 DISEÑO: envuelve con tu shell/layout de misión
    <div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <PuzzleBoard
            board={state.board}
            pieceById={allPieceById}
            lastError={state.lastError}
            onSlotClick={handleSlotClick}
          />
        </div>
        <PieceTray
          pieces={state.pieces}
          selectedPieceId={state.selectedPieceId}
          errorPieceId={state.lastError?.pieceId ?? null}
          onSelectPiece={handleSelectPiece}
        />
      </div>

      {/* 🎨 DISEÑO: reemplaza con tu modal de victoria */}
      {showWinModal && (
        <div role="dialog" aria-modal="true">
          <h2>¡Completaste el rompecabezas!</h2>
          <p>Armaste todas las piezas en el lugar correcto.</p>
          <button onClick={() => setShowWinModal(false)}>Cerrar</button>
          <button onClick={handleRetry}>Reintentar</button>
        </div>
      )}

      {/* 🎨 DISEÑO: coloca el botón de reinicio donde quieras */}
      <button type="button" onClick={handleRetry}>Reiniciar</button>
    </div>
  );
}
```

---

## Instrucciones de integración para el agente receptor

1. **Copia los archivos `lib/`** tal cual — son lógica pura sin dependencias de UI.
2. **Los componentes TSX** tienen comentarios `🎨 DISEÑO:` en cada punto donde debes aplicar los estilos del Figma.
3. **El punto de entrada** es `<PuzzleGame pieces={...} />`. Recibe las 12 piezas ya mapeadas.
4. **Para conectar datos:** usa `mapRowsToPieces(rows)` si cargas desde DB, o hardcodea un array de `Piece[]` directamente.
5. **La animación shake** (`animate-[shake_0.5s_ease-in-out]`) requiere definir el keyframe en tu CSS global:
   ```css
   @keyframes shake {
     0%, 100% { transform: translateX(0); }
     20%, 60% { transform: translateX(-6px); }
     40%, 80% { transform: translateX(6px); }
   }
   ```
6. **No toques `reducer.ts` ni `types.ts`** — toda la lógica del juego vive ahí.
