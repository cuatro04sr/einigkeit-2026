// ============================================================
// constants/mission-8.ts  —  Wordsearch pure-logic module
// Grid: 13 rows × 14 columns | 8 words
// ============================================================

// ─────────────────────── TYPES ────────────────────────────

export type Direction = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';

export interface Point {
    row: number;
    col: number;
}

export interface GridCell {
    row: number;
    col: number;
    letter: string;
}

export interface WordEntry {
    id: string;
    word: string;
    displayOrder: number;
    startRow: number;
    startCol: number;
    direction: Direction;
    endRow: number;
    endCol: number;
}

export type GameStatus = 'playing' | 'won';

export interface Selection {
    start: Point;
    current: Point;
}

export interface WordSearchState {
    words: WordEntry[];
    grid: GridCell[][];
    rows: number;
    cols: number;
    selection: Selection | null;
    foundWordIds: Set<string>;
    status: GameStatus;
}

export type WordSearchAction =
    | { type: 'START_SELECTION'; point: Point }
    | { type: 'UPDATE_SELECTION'; point: Point }
    | { type: 'END_SELECTION' }
    | { type: 'RESET' };

// ─────────────────────── DATA ─────────────────────────────

export const GRID_LETTERS: string[] = [
    'QQCIFCPXINYDTI', // row  0
    'JIZQIIUNHLHHZQ', // row  1
    'XMUABNENNATOOR', // row  2
    'HREIERETSOHSEE', // row  3
    'ZTQGLPYDZDTNMR', // row  4
    'CUFYSNBZEERATH', // row  5
    'GVICDOOVREJSCE', // row  6
    'ETLUCKZHTBCEUL', // row  7
    'ZLCHXBAATZKHJX', // row  8
    'LKCQDSLXTLNFFI', // row  9
    'MENXELEHRERINZ', // row 10
    'SUALOKINCDRHCJ', // row 11
    'TALASLEFFOTRAK', // row 12
];

export const WORD_ENTRIES: WordEntry[] = [
    { id: 'w0', word: 'KARTOFFELSALAT', displayOrder: 0, startRow: 12, startCol: 13, direction: 'W', endRow: 12, endCol: 0 },
    { id: 'w1', word: 'LATERNE', displayOrder: 1, startRow: 9, startCol: 6, direction: 'NE', endRow: 3, endCol: 12 },
    { id: 'w2', word: 'NIKOLAUS', displayOrder: 2, startRow: 11, startCol: 7, direction: 'W', endRow: 11, endCol: 0 },
    { id: 'w3', word: 'OSTERHASE', displayOrder: 3, startRow: 2, startCol: 12, direction: 'SW', endRow: 10, endCol: 4 },
    { id: 'w4', word: 'OSTEREIER', displayOrder: 4, startRow: 3, startCol: 9, direction: 'W', endRow: 3, endCol: 1 },
    { id: 'w5', word: 'TANNENBAUM', displayOrder: 5, startRow: 2, startCol: 10, direction: 'W', endRow: 2, endCol: 1 },
    { id: 'w6', word: 'LEHRER', displayOrder: 6, startRow: 7, startCol: 13, direction: 'N', endRow: 2, endCol: 13 },
    { id: 'w7', word: 'LEHRERIN', displayOrder: 7, startRow: 10, startCol: 5, direction: 'E', endRow: 10, endCol: 12 },
];

export const WORDSEARCH_REFLECTION_QUESTION =
    '¿Qué tradición alemana de la sopa de letras te recuerda más a tus años en el colegio?';

export const WORDSEARCH_SHARE_PLACEHOLDER =
    'Cuéntanos qué tradición o recuerdo te llegó al corazón y por qué la conectas con tu historia...';

// ─────────────────────── DIRECTION VECTORS ────────────────

export const DIRECTION_VECTORS: Record<Direction, { dRow: number; dCol: number }> = {
    N: { dRow: -1, dCol: 0 },
    S: { dRow: 1, dCol: 0 },
    E: { dRow: 0, dCol: 1 },
    W: { dRow: 0, dCol: -1 },
    NE: { dRow: -1, dCol: 1 },
    NW: { dRow: -1, dCol: -1 },
    SE: { dRow: 1, dCol: 1 },
    SW: { dRow: 1, dCol: -1 },
};

// ─────────────────────── GRID HELPERS ─────────────────────

export function cellKey(row: number, col: number): string {
    return `${row}-${col}`;
}

export function buildGrid(rows: string[]): GridCell[][] {
    return rows.map((rowStr, row) =>
        rowStr.split('').map((letter, col) => ({ row, col, letter }))
    );
}

function sign(n: number): number {
    return n > 0 ? 1 : n < 0 ? -1 : 0;
}

/** All points along a straight line (horiz / vert / perfect diagonal). */
export function cellsAlongPath(start: Point, end: Point): Point[] | null {
    const dRow = end.row - start.row;
    const dCol = end.col - start.col;
    if (dRow === 0 && dCol === 0) return [start];
    if (dRow !== 0 && dCol !== 0 && Math.abs(dRow) !== Math.abs(dCol)) return null;
    const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
    const sr = sign(dRow);
    const sc = sign(dCol);
    return Array.from({ length: steps + 1 }, (_, i) => ({
        row: start.row + sr * i,
        col: start.col + sc * i,
    }));
}

export function wordCellKeys(word: WordEntry): string[] {
    const path = cellsAlongPath(
        { row: word.startRow, col: word.startCol },
        { row: word.endRow, col: word.endCol },
    );
    return (path ?? []).map((p) => cellKey(p.row, p.col));
}

// ─────────────────────── MATCH LOGIC ──────────────────────

function pointsEqual(a: Point, b: Point): boolean {
    return a.row === b.row && a.col === b.col;
}

export function matchWord(
    start: Point,
    end: Point,
    words: WordEntry[],
    foundWordIds: Set<string>,
): WordEntry | null {
    for (const word of words) {
        if (foundWordIds.has(word.id)) continue;
        const wS = { row: word.startRow, col: word.startCol };
        const wE = { row: word.endRow, col: word.endCol };
        if (
            (pointsEqual(start, wS) && pointsEqual(end, wE)) ||
            (pointsEqual(start, wE) && pointsEqual(end, wS))
        ) return word;
    }
    return null;
}

export function isPuzzleSolved(foundWordIds: Set<string>, words: WordEntry[]): boolean {
    return words.length > 0 && words.every((w) => foundWordIds.has(w.id));
}

// ─────────────────────── REDUCER ──────────────────────────

export function createInitialState(
    words: WordEntry[] = WORD_ENTRIES,
    gridLetters: string[] = GRID_LETTERS,
): WordSearchState {
    const grid = buildGrid(gridLetters);
    return {
        words,
        grid,
        rows: grid.length,
        cols: grid[0]?.length ?? 0,
        selection: null,
        foundWordIds: new Set(),
        status: 'playing',
    };
}

export function wordSearchReducer(
    state: WordSearchState,
    action: WordSearchAction,
): WordSearchState {
    switch (action.type) {
        case 'START_SELECTION':
            if (state.status !== 'playing') return state;
            return { ...state, selection: { start: action.point, current: action.point } };

        case 'UPDATE_SELECTION': {
            if (!state.selection) return state;
            const path = cellsAlongPath(state.selection.start, action.point);
            if (!path) return state;
            return { ...state, selection: { start: state.selection.start, current: action.point } };
        }

        case 'END_SELECTION': {
            if (!state.selection) return state;
            const { start, current } = state.selection;
            const match = matchWord(start, current, state.words, state.foundWordIds);
            if (!match) return { ...state, selection: null };
            const foundWordIds = new Set(state.foundWordIds);
            foundWordIds.add(match.id);
            return {
                ...state,
                selection: null,
                foundWordIds,
                status: isPuzzleSolved(foundWordIds, state.words) ? 'won' : 'playing',
            };
        }

        case 'RESET':
            return createInitialState(
                state.words,
                state.grid.map((r) => r.map((c) => c.letter).join('')),
            );

        default:
            return state;
    }
}

// ─────────────────────── POINTER HELPER ───────────────────

/**
 * Returns the grid cell under the pointer position using
 * data-row / data-col attributes on each cell element.
 * Works for mouse, touch and stylus via Pointer Events API.
 */
export function cellFromPointerEvent(clientX: number, clientY: number): Point | null {
    const target = document.elementFromPoint(clientX, clientY);
    const el = target instanceof HTMLElement
        ? target.closest<HTMLElement>('[data-row][data-col]')
        : null;
    if (!el) return null;
    const row = Number(el.dataset.row);
    const col = Number(el.dataset.col);
    if (isNaN(row) || isNaN(col)) return null;
    return { row, col };
}
