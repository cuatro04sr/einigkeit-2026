const fs = require('fs');
const { execSync } = require('child_process');

let out = {};
for (let i = 1; i <= 18; i++) {
  const p = `puzzle_piece-${i}.png`;
  const f = `public/backgrounds/mission/docs/fichas del tablero/${p}`;
  const dim = execSync(`powershell -c "Add-Type -AssemblyName System.Drawing; [System.Drawing.Image]::FromFile('${f}').Size"`).toString();
  const w = dim.match(/Width\s+:\s+(\d+)/)[1];
  const h = dim.match(/Height\s+:\s+(\d+)/)[1];
  out[i] = { w: parseInt(w), h: parseInt(h) };
}
fs.writeFileSync('sizes.json', JSON.stringify(out));
console.log('SIZES GENERATED');
