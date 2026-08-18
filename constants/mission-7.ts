import { Piece } from "@/lib/jigsaw/types";

export const JIGSAW_PIECES: Piece[] = Array.from({ length: 18 }).map((_, i) => {
  const idNum = i + 1; // 1 a 18
  const filename = `puzzle_piece-${idNum}.png`;
  const column = Math.ceil(idNum / 3);
  const row = ((idNum - 1) % 3) + 1;
  const slotIndex = (row - 1) * 6 + (column - 1);

  return {
    id: `pieza-${idNum}`,
    correctIndex: slotIndex,
    emptyImageSrc: `/backgrounds/mission/docs/fichas del tablero/${filename}`,
    filledImageSrc: `/backgrounds/mission/docs/fichas a color/puzzle_piece_lleno-${idNum}.png`,
  };
});

export const JIGSAW_REFLECTION_QUESTION = "Comparte un aprendizaje clave de esta actividad";
export const JIGSAW_SHARE_PLACEHOLDER = "Escribe tu reflexión aquí...";


export const PIECE_OFFSETS: Record<number, { cssWidth: string, cssHeight: string, cssLeft: string, cssTop: string }> = {
  "1": {
    "cssWidth": "100.50761421319795%",
    "cssHeight": "100.50761421319795%",
    "cssLeft": "0%",
    "cssTop": "0%"
  },
  "2": {
    "cssWidth": "100.50761421319795%",
    "cssHeight": "122.58883248730963%",
    "cssLeft": "0%",
    "cssTop": "-11.040609137055837%"
  },
  "3": {
    "cssWidth": "122.58883248730963%",
    "cssHeight": "122.58883248730963%",
    "cssLeft": "0%",
    "cssTop": "0%"
  },
  "4": {
    "cssWidth": "144.6700507614213%",
    "cssHeight": "122.58883248730963%",
    "cssLeft": "-11.040609137055837%",
    "cssTop": "0%"
  },
  "5": {
    "cssWidth": "144.6700507614213%",
    "cssHeight": "100.50761421319795%",
    "cssLeft": "-11.040609137055837%",
    "cssTop": "0%"
  },
  "6": {
    "cssWidth": "122.58883248730963%",
    "cssHeight": "122.58883248730963%",
    "cssLeft": "0%",
    "cssTop": "-11.040609137055837%"
  },
  "7": {
    "cssWidth": "122.58883248730963%",
    "cssHeight": "100.50761421319795%",
    "cssLeft": "0%",
    "cssTop": "0%"
  },
  "8": {
    "cssWidth": "100.50761421319795%",
    "cssHeight": "122.58883248730963%",
    "cssLeft": "0%",
    "cssTop": "-11.040609137055837%"
  },
  "9": {
    "cssWidth": "122.58883248730963%",
    "cssHeight": "100.50761421319795%",
    "cssLeft": "0%",
    "cssTop": "0%"
  },
  "10": {
    "cssWidth": "122.58883248730963%",
    "cssHeight": "144.6700507614213%",
    "cssLeft": "0%",
    "cssTop": "0%"
  },
  "11": {
    "cssWidth": "144.6700507614213%",
    "cssHeight": "100.50761421319795%",
    "cssLeft": "-11.040609137055837%",
    "cssTop": "0%"
  },
  "12": {
    "cssWidth": "100.50761421319795%",
    "cssHeight": "100.50761421319795%",
    "cssLeft": "0%",
    "cssTop": "-11.040609137055837%"
  },
  "13": {
    "cssWidth": "100.50761421319795%",
    "cssHeight": "144.6700507614213%",
    "cssLeft": "0%",
    "cssTop": "0%"
  },
  "14": {
    "cssWidth": "100.50761421319795%",
    "cssHeight": "100.50761421319795%",
    "cssLeft": "0%",
    "cssTop": "0%"
  },
  "15": {
    "cssWidth": "122.58883248730963%",
    "cssHeight": "122.58883248730963%",
    "cssLeft": "-11.040609137055837%",
    "cssTop": "-11.040609137055837%"
  },
  "16": {
    "cssWidth": "122.58883248730963%",
    "cssHeight": "122.58883248730963%",
    "cssLeft": "-11.040609137055837%",
    "cssTop": "0%"
  },
  "17": {
    "cssWidth": "122.58883248730963%",
    "cssHeight": "100.50761421319795%",
    "cssLeft": "-11.040609137055837%",
    "cssTop": "0%"
  },
  "18": {
    "cssWidth": "122.58883248730963%",
    "cssHeight": "122.58883248730963%",
    "cssLeft": "0%",
    "cssTop": "-11.040609137055837%"
  }
};
