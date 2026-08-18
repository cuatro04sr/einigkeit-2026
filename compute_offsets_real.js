const fs = require('fs');
let str = fs.readFileSync('sizes.json', 'utf16le');
if (str.charCodeAt(0) === 0xFEFF) {
    str = str.slice(1);
}
const sizes = JSON.parse(str);

const COLS = 6;
const ROWS = 3;
const CELL = 131.33333333333334;
const TAB = 14.5;
const eps = 2;

const getSlotForId = (id) => {
    const column = Math.ceil(id / 3);
    const row = ((id - 1) % 3) + 1;
    return (row - 1) * COLS + (column - 1);
};

const gridPieces = new Array(18);

for (let id = 1; id <= 18; id++) {
    const slot = getSlotForId(id);

    const w = sizes[String(id)] ? sizes[String(id)].w : 132;
    const h = sizes[String(id)] ? sizes[String(id)].h : 132;

    gridPieces[slot] = {
        id,
        w,
        h,
        leftTab: false,
        topTab: false,
        rightTab: false,
        bottomTab: false
    };
}

for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
        const slot = r * COLS + c;
        const p = gridPieces[slot];

        if (c > 0) {
            const leftNeighbor = gridPieces[slot - 1];
            if (!leftNeighbor.rightTab) {
                p.leftTab = true;
            }
        }

        if (r > 0) {
            const topNeighbor = gridPieces[slot - COLS];
            if (!topNeighbor.bottomTab) {
                p.topTab = true;
            }
        }

        p.rightTab = p.w > (CELL + (p.leftTab ? TAB : 0) + eps);
        p.bottomTab = p.h > (CELL + (p.topTab ? TAB : 0) + eps);
    }
}

const offsets = gridPieces.map(p => {
    const alignLeftX = p.leftTab ? -TAB : 0;
    const alignTopY = p.topTab ? -TAB : 0;

    return {
        id: p.id,
        cssWidth: `${(p.w / CELL) * 100}%`,
        cssHeight: `${(p.h / CELL) * 100}%`,
        cssLeft: `${(alignLeftX / CELL) * 100}%`,
        cssTop: `${(alignTopY / CELL) * 100}%`
    };
});

fs.writeFileSync('offsets_real.json', JSON.stringify(offsets, null, 2));

const target = 'c:/Users/camil/Documents/Work/ASODECA/Dev Cuadros Aleman/constants/mission-7.ts';
let content = fs.readFileSync(target, 'utf8');

const mapping = offsets.reduce((acc, o) => {
    acc[o.id] = { cssWidth: o.cssWidth, cssHeight: o.cssHeight, cssLeft: o.cssLeft, cssTop: o.cssTop };
    return acc;
}, {});

content = content.replace(/export const PIECE_OFFSETS(.|\n)*?};/m, `export const PIECE_OFFSETS: Record<number, { cssWidth: string, cssHeight: string, cssLeft: string, cssTop: string }> = ${JSON.stringify(mapping, null, 2)};`);

fs.writeFileSync(target, content);
console.log("SUCCESS");
