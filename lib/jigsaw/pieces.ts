import { shuffleArray } from './shuffle';
import { EXPECTED_PIECE_COUNT, PLACEHOLDER_PALETTE, type Piece } from './types';

export function mapRowsToPieces(
    rows: { id: string; order_index: number; image_url: string | null; filled_image_url: string | null }[]
): Piece[] {
    return rows.map((row) => ({
        id: row.id,
        correctIndex: row.order_index,
        emptyImageSrc: row.image_url,
        filledImageSrc: row.filled_image_url
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
