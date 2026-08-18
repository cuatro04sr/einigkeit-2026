const fs = require('fs');

let str = fs.readFileSync('offsets.json', 'utf16le');
if (str.charCodeAt(0) === 0xFEFF) {
    str = str.slice(1);
}
const off = JSON.parse(str);

const target = 'c:/Users/camil/Documents/Work/ASODECA/Dev Cuadros Aleman/constants/mission-7.ts';
let content = fs.readFileSync(target, 'utf8');

const mapping = off.reduce((acc, o) => {
    acc[o.id] = { cssWidth: o.cssWidth, cssHeight: o.cssHeight, cssLeft: o.cssLeft, cssTop: o.cssTop };
    return acc;
}, {});

content += `\n\nexport const PIECE_OFFSETS: Record<number, { cssWidth: string, cssHeight: string, cssLeft: string, cssTop: string }> = ${JSON.stringify(mapping, null, 2)};\n`;
fs.writeFileSync(target, content);
