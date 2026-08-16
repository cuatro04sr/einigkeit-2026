"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    WordSearchState,
    WordSearchAction,
    cellsAlongPath,
    wordCellKeys,
    cellFromPointerEvent,
    cellKey,
} from "@/constants/mission-8";

interface WordsearchGridProps {
    state: WordSearchState;
    dispatch: React.Dispatch<WordSearchAction>;
}

// One distinct color per word (indexes 0-7)
const FOUND_COLORS = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-indigo-500",
];

export function WordsearchGrid({ state, dispatch }: WordsearchGridProps) {
    const { grid, selection, foundWordIds, words } = state;
    const cols = state.cols; // 14
    const rows = state.rows; // 13

    // Selected cells for current drag
    const selectionKeys = new Set<string>();
    if (selection) {
        const path = cellsAlongPath(selection.start, selection.current);
        path?.forEach((p) => selectionKeys.add(cellKey(p.row, p.col)));
    }

    // Map cell-key → color index for found words
    const foundKeyColorMap = new Map<string, number>();
    words.forEach((w, idx) => {
        if (foundWordIds.has(w.id)) {
            wordCellKeys(w).forEach((k) =>
                foundKeyColorMap.set(k, idx % FOUND_COLORS.length)
            );
        }
    });

    // Global pointer handlers — uniform for mouse/touch/stylus
    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            e.preventDefault();
            const cell = cellFromPointerEvent(e.clientX, e.clientY);
            if (cell) dispatch({ type: "UPDATE_SELECTION", point: cell });
        };
        const onUp = () => dispatch({ type: "END_SELECTION" });
        window.addEventListener("pointermove", onMove, { passive: false });
        window.addEventListener("pointerup", onUp);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
    }, [dispatch]);

    return (
        /*
         * KEY: use BOTH gridTemplateRows and gridTemplateColumns with 1fr each.
         * Combined with h-full / w-full on this element and overflow-hidden on the
         * parent card, the grid fills the available space exactly — no cell overflow,
         * no scroll, all 13 rows always visible.
         * Cells have NO aspect-square; they are sized by the 2D grid tracks.
         */
        <div
            className="h-full w-full select-none touch-none"
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                gap: "2px",
            }}
        >
            {grid.flat().map((cell) => {
                const key = cellKey(cell.row, cell.col);
                const colorIdx = foundKeyColorMap.get(key);
                const isFound = colorIdx !== undefined;
                const isSelected = selectionKeys.has(key);

                return (
                    <div
                        key={key}
                        data-row={cell.row}
                        data-col={cell.col}
                        onPointerDown={(e) => {
                            e.preventDefault();
                            dispatch({
                                type: "START_SELECTION",
                                point: { row: cell.row, col: cell.col },
                            });
                        }}
                        className={cn(
                            // No aspect-square — size comes from the 2D grid tracks
                            "flex items-center justify-center rounded",
                            "font-bold cursor-pointer select-none transition-colors duration-75",
                            "text-[clamp(0.4rem,1.4cqi,0.85rem)]",
                            isFound
                                ? `${FOUND_COLORS[colorIdx!]} text-white`
                                : isSelected
                                    ? "bg-blue-500 text-white"
                                    : "bg-white/80 text-slate-800 hover:bg-blue-100",
                        )}
                    >
                        {cell.letter}
                    </div>
                );
            })}
        </div>
    );
}
