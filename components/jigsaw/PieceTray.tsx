'use client';

import { useEffect, useState } from 'react';
import type { Piece } from '@/lib/jigsaw/types';
import { PuzzlePiece } from './PuzzlePiece';
import { ChevronDown, ChevronUp } from 'lucide-react';

const VISIBLE_COUNT = 2; // piezas visibles a la vez en la bandeja

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
        <div className="flex flex-col items-center gap-3 min-w-[200px] w-full sm:w-[220px] bg-slate-50 border border-slate-200/60 p-4 pt-6 rounded-3xl shadow-sm h-full max-h-[80vh]">

            {/* Botón paginación hacia arriba */}
            <button
                type="button"
                aria-label="Ver piezas anteriores"
                disabled={startIndex === 0}
                onClick={() => setStartIndex((c) => Math.max(c - 1, 0))}
                className="w-full flex justify-center py-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
                <ChevronUp className="w-6 h-6" />
            </button>

            {/* Piezas visibles */}
            <div className="flex flex-col gap-4 w-full flex-1 overflow-visible px-2 py-1">
                {visiblePieces.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-center text-sm font-medium text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-4 w-full aspect-[4/3] flex items-center justify-center">
                            ¡Sin piezas<br />pendientes!
                        </p>
                    </div>
                )}
                {visiblePieces.map((piece) => (
                    <div key={piece.id} className="w-[128px] mx-auto relative shadow-transparent drop-shadow-md rounded-xl transition-transform hover:scale-105 active:scale-95 duration-200">
                        <PuzzlePiece
                            piece={piece}
                            imageSrc={piece.filledImageSrc}
                            selected={selectedPieceId === piece.id}
                            error={errorPieceId === piece.id}
                            onClick={() => onSelectPiece(piece.id)}
                        />
                    </div>
                ))}
            </div>

            {/* Botón paginación hacia abajo */}
            <button
                type="button"
                aria-label="Ver más piezas"
                disabled={startIndex >= maxStartIndex}
                onClick={() => setStartIndex((c) => Math.min(c + 1, maxStartIndex))}
                className="w-full flex justify-center py-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
                <ChevronDown className="w-6 h-6" />
            </button>
        </div>
    );
}
