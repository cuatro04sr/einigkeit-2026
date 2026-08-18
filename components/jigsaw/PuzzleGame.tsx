'use client';

import { useEffect, useMemo, useReducer, useState } from 'react';
import { createInitialState, gameReducer } from '@/lib/jigsaw/reducer';
import { shufflePieces } from '@/lib/jigsaw/pieces';
import type { Piece } from '@/lib/jigsaw/types';
import { PuzzleBoard } from './PuzzleBoard';
import { PieceTray } from './PieceTray';
import { RotateCcw } from 'lucide-react';

interface PuzzleGameProps {
    pieces: Piece[];       // las 18 piezas (ordenadas, sin barajar)
    onWin?: () => void;   // callback opcional al completar el puzzle
}

export function PuzzleGame({ pieces, onWin }: PuzzleGameProps) {
    const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState(pieces));

    // Al montar: barajar las piezas
    useEffect(() => {
        dispatch({ type: 'RESET', pieces: shufflePieces(pieces) });
    }, [pieces]);

    // Detectar victoria o limpiar errores
    useEffect(() => {
        if (state.status === 'won') {
            const t = setTimeout(() => {
                onWin?.();
            }, 1500);
            return () => clearTimeout(t);
        }
    }, [state.status, onWin]);

    // Limpiar el error visual luego de menos de 1 segundo
    useEffect(() => {
        if (state.lastError) {
            const t = setTimeout(() => {
                dispatch({ type: 'CLEAR_ERROR' });
            }, 600); // 600ms para desaparecer rápido sin parecer roto
            return () => clearTimeout(t);
        }
    }, [state.lastError]);

    // Map id→Piece para lookups O(1)
    const allPieceById = useMemo(
        () => new Map(pieces.map((p) => [p.id, p])),
        [pieces]
    );

    function handleSelectPiece(pieceId: string) {
        dispatch({ type: 'SELECT_PIECE', pieceId });
    }

    function handleSlotClick(slotIndex: number) {
        if (state.status !== 'playing') return;
        dispatch({ type: 'PLACE_ATTEMPT', slotIndex });
    }

    function handleRetry() {
        if (!confirm('¿Seguro quieres reiniciar el rompecabezas? Perderás el progreso actual.')) return;
        dispatch({ type: 'RESET', pieces: shufflePieces(pieces) });
    }

    const isCompleted = state.status === 'won';

    return (
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-12 items-center lg:items-start w-full relative">
            <div className="flex-1 w-full order-2 lg:order-1 flex flex-col gap-2 lg:gap-4">
                <div className="relative w-full">
                    <PuzzleBoard
                        board={state.board}
                        pieceById={allPieceById}
                        lastError={state.lastError}
                        onSlotClick={handleSlotClick}
                        isCompleted={isCompleted}
                    />
                </div>
            </div>

            {!isCompleted && (
                <div className="w-full lg:w-[220px] 2xl:w-[260px] shrink-0 order-1 lg:order-2 flex justify-center sticky top-4">
                    <PieceTray
                        pieces={state.pieces}
                        selectedPieceId={state.selectedPieceId}
                        errorPieceId={state.lastError?.pieceId ?? null}
                        onSelectPiece={handleSelectPiece}
                    />
                </div>
            )}
        </div>
    );
}
