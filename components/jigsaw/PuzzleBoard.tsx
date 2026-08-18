'use client';

import { PUZZLE_COLS, type Piece, type PieceError } from '@/lib/jigsaw/types';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface PuzzleBoardProps {
    board: (Piece | null)[];
    pieceById: Map<string, Piece>;
    lastError: PieceError | null;
    onSlotClick: (slotIndex: number) => void;
    isCompleted: boolean;
}

export function PuzzleBoard({ board, pieceById, lastError, onSlotClick, isCompleted }: PuzzleBoardProps) {
    return (
        <div
            data-testid="puzzle-board"
            className={cn(
                "grid transition-all relative isolate border-[6px] sm:border-[8px] border-[#0F60C9] rounded-lg bg-white overflow-hidden"
            )}
            style={{
                gridTemplateColumns: `repeat(${PUZZLE_COLS}, minmax(0, 1fr))`,
                gap: 0,
                backgroundImage: `url('/backgrounds/mission/mission 7- Solved puzzle, 18 pieces llenas.png')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                aspectRatio: '2 / 1', // 788x394 es la relacion nativa
            }}
        >
            {Array.from({ length: 18 }).map((_, slotIndex) => {
                const piece = board[slotIndex];
                const isError = lastError?.slotIndex === slotIndex;
                const isCompletedSlot = !!piece || isCompleted;

                // Calculamos las coordenadas x,y del cuadrante
                const col = slotIndex % PUZZLE_COLS; // 0 a 5
                const row = Math.floor(slotIndex / PUZZLE_COLS); // 0 a 2

                return (
                    <button
                        key={slotIndex}
                        type="button"
                        data-testid={`puzzle-slot-${slotIndex}`}
                        onClick={() => !isCompletedSlot && onSlotClick(slotIndex)}
                        className={cn(
                            "w-full h-full outline-none relative z-20 flex transition-all duration-300",
                            isError ? "scale-95 opacity-50 z-30 filter sepia saturate-200 hue-rotate-[-50deg]" : "hover:z-30 hover:shadow-lg",
                            isCompletedSlot && "opacity-0 pointer-events-none" // Cortina invisible para revelar el fondo correcto
                        )}
                        style={{
                            backgroundImage: `url('/backgrounds/mission/mision 7- Solved puzzle, 18 pieces vacias.png')`,
                            backgroundSize: '600% 300%', // 6 columnas, 3 filas
                            backgroundPosition: `${(col / 5) * 100}% ${(row / 2) * 100}%`,
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: 'transparent',
                            cursor: isCompletedSlot ? 'default' : 'pointer'
                        }}
                        aria-label={`Slot vacío ${slotIndex + 1}`}
                    />
                );
            })}
        </div>
    );
}
