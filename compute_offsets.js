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

const pieces = [];

for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;
        const key = String(idx + 1);
        const w = sizes[key].w;
        const h = sizes[key].h;

        let leftTab = false;
        let topTab = false;

        if (c > 0) {
            const leftNeighbor = pieces[idx - 1];
            if (!leftNeighbor.rightTab) {
                leftTab = true;
            }
        }

        if (r > 0) {
            const topNeighbor = pieces[idx - COLS];
            if (!topNeighbor.bottomTab) {
                topTab = true;
            }
        }

        const rightTab = w > (CELL + (leftTab ? TAB : 0) + eps);
        const bottomTab = h > (CELL + (topTab ? TAB : 0) + eps);

        pieces.push({
            idx, w, h, leftTab, rightTab, topTab, bottomTab
        });
    }
}

const offsets = pieces.map(p => {
    const alignLeftX = p.leftTab ? -TAB : 0;
    const alignTopY = p.topTab ? -TAB : 0;

    return {
        id: p.idx + 1,
        cssWidth: `${(p.w / CELL) * 100}%`,
        cssHeight: `${(p.h / CELL) * 100}%`,
        cssLeft: `${(alignLeftX / CELL) * 100}%`,
        cssTop: `${(alignTopY / CELL) * 100}%`,
    };
});

console.log(JSON.stringify(offsets, null, 2));
