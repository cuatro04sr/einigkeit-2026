export const PUZZLE_ROWS = 3;
export const PUZZLE_COLS = 6;
export const EXPECTED_PIECE_COUNT = PUZZLE_ROWS * PUZZLE_COLS; // 18

export const PLACEHOLDER_PALETTE = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
    '#f43f5e', '#d946ef', '#10b981', '#3b82f6',
    '#6366f1', '#8b5cf6'
];

export type GameStatus = 'playing' | 'won';

export interface Piece {
    id: string;
    correctIndex: number;    // posición correcta en el tablero (0–17)
    emptyImageSrc: string | null; // Piezas vacias
    filledImageSrc: string | null; // Piezas llenas
}

export interface PieceError {
    pieceId: string;
    slotIndex: number;
}

export interface GameState {
    pieces: Piece[];              // piezas en la bandeja (aún no colocadas)
    board: (string | null)[];     // 18 slots; null = vacío, string = pieceId colocado
    selectedPieceId: string | null;
    lastError: PieceError | null;
    status: GameStatus;
}
