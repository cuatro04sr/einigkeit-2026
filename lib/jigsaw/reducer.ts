import { EXPECTED_PIECE_COUNT, type GameState, type Piece } from './types';

export type GameAction =
    | { type: 'SELECT_PIECE'; pieceId: string }
    | { type: 'PLACE_ATTEMPT'; slotIndex: number }
    | { type: 'CLEAR_ERROR' }
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

        case 'CLEAR_ERROR': {
            return { ...state, lastError: null };
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
