'use client';

import { getPlaceholderColor } from '@/lib/jigsaw/pieces';
import type { Piece } from '@/lib/jigsaw/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PuzzlePieceProps {
    piece: Piece;
    imageSrc: string | null;
    selected?: boolean;   // resalta con ring al estar seleccionada
    error?: boolean;      // resalta en rojo + animación shake al ser incorrecta
    onClick?: () => void;
}

export function PuzzlePiece({ piece, imageSrc, selected = false, error = false, onClick }: PuzzlePieceProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            data-testid={`puzzle-piece-${piece.id}`}
            disabled={!onClick}
            className={cn(
                'relative flex aspect-[4/3] w-full items-center justify-center text-lg font-bold text-white transition-all overflow-hidden',
                !onClick ? 'cursor-default' : 'cursor-pointer hover:brightness-105 active:scale-95',
                selected && 'ring-4 ring-blue-500 ring-offset-2 z-10 scale-105 shadow-xl',
                error && 'animate-[shake_0.5s_ease-in-out] ring-4 ring-red-600 ring-offset-2 z-10 bg-red-100',
                !imageSrc && !error && 'shadow-sm border border-slate-200'
            )}
            style={{
                backgroundColor: imageSrc ? undefined : getPlaceholderColor(piece.correctIndex),
            }}
        >
            {imageSrc ? (
                <Image
                    src={imageSrc}
                    alt={`Pieza ${piece.correctIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 33vw, 20vw"
                    className="object-cover"
                />
            ) : (
                <span className="drop-shadow-md">{piece.correctIndex + 1}</span>
            )}

            {/* Overlay de error suave por encima de la imagen */}
            {error && <div className="absolute inset-0 bg-red-500/20 mix-blend-multiply pointer-events-none" />}
        </button>
    );
}
