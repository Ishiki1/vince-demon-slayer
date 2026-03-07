import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = 'C:/GameCraft/Vince';
const OUTPUT_DIR = path.join(ROOT, 'assets', 'ui', 'skills');
const SIZE = 32;
const SCALE = 8;
const CANVAS = SIZE * SCALE;

const COLORS = {
  transparent: [0, 0, 0, 0],
  black: [15, 23, 42, 255],
  white: [248, 250, 252, 255],
  steel: [203, 213, 225, 255],
  steelDark: [100, 116, 139, 255],
  gold: [251, 191, 36, 255],
  goldDark: [180, 83, 9, 255],
  red: [239, 68, 68, 255],
  redDark: [153, 27, 27, 255],
  blue: [96, 165, 250, 255],
  blueDark: [30, 64, 175, 255],
  green: [74, 222, 128, 255],
  greenDark: [22, 101, 52, 255],
  purple: [192, 132, 252, 255],
  purpleDark: [107, 33, 168, 255],
  brown: [180, 83, 9, 255],
  brownDark: [120, 53, 15, 255],
  gray: [148, 163, 184, 255],
  grayDark: [71, 85, 105, 255],
  holy: [255, 244, 171, 255],
  holyDark: [234, 179, 8, 255],
  thorn: [34, 197, 94, 255],
  thornDark: [22, 101, 52, 255],
  shadow: [51, 65, 85, 255],
  blood: [185, 28, 28, 255],
};

function createGrid() {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => COLORS.transparent.slice())
  );
}

function setPixel(grid, x, y, color) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  grid[y][x] = color.slice();
}

function fillRect(grid, x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      setPixel(grid, xx, yy, color);
    }
  }
}

function strokeRect(grid, x, y, w, h, color) {
  fillRect(grid, x, y, w, 1, color);
  fillRect(grid, x, y + h - 1, w, 1, color);
  fillRect(grid, x, y, 1, h, color);
  fillRect(grid, x + w - 1, y, 1, h, color);
}

function fillCircle(grid, cx, cy, r, color) {
  for (let y = cy - r; y <= cy + r; y += 1) {
    for (let x = cx - r; x <= cx + r; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) setPixel(grid, x, y, color);
    }
  }
}

function strokeCircle(grid, cx, cy, r, color) {
  for (let y = cy - r - 1; y <= cy + r + 1; y += 1) {
    for (let x = cx - r - 1; x <= cx + r + 1; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r * r + r && d2 >= r * r - r * 2) setPixel(grid, x, y, color);
    }
  }
}

function drawLine(grid, x1, y1, x2, y2, color, thickness = 1) {
  let x = x1;
  let y = y1;
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    fillRect(grid, x - Math.floor(thickness / 2), y - Math.floor(thickness / 2), thickness, thickness, color);
    if (x === x2 && y === y2) break;
    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

function drawDiamond(grid, cx, cy, radius, fill, outline) {
  for (let dy = -radius; dy <= radius; dy += 1) {
    const rowRadius = radius - Math.abs(dy);
    for (let dx = -rowRadius; dx <= rowRadius; dx += 1) {
      setPixel(grid, cx + dx, cy + dy, fill);
    }
  }
  for (let i = 0; i <= radius; i += 1) {
    setPixel(grid, cx - i, cy - (radius - i), outline);
    setPixel(grid, cx + i, cy - (radius - i), outline);
    setPixel(grid, cx - i, cy + (radius - i), outline);
    setPixel(grid, cx + i, cy + (radius - i), outline);
  }
}

function drawPips(grid, count, color = COLORS.gold, outline = COLORS.black) {
  const spacing = 4;
  const totalWidth = count * 3 + (count - 1) * spacing;
  const startX = Math.floor((SIZE - totalWidth) / 2);
  const y = 27;
  for (let i = 0; i < count; i += 1) {
    const x = startX + i * (3 + spacing);
    fillRect(grid, x, y, 3, 3, outline);
    fillRect(grid, x + 1, y + 1, 1, 1, color);
  }
}

function addBackdrop(grid, fill = COLORS.shadow) {
  fillCircle(grid, 16, 15, 11, COLORS.black);
  fillCircle(grid, 16, 15, 10, fill);
  strokeCircle(grid, 16, 15, 10, COLORS.grayDark);
}

function drawSword(grid) {
  drawLine(grid, 10, 21, 20, 8, COLORS.black, 3);
  drawLine(grid, 10, 21, 20, 8, COLORS.steel, 1);
  drawLine(grid, 8, 23, 12, 19, COLORS.black, 3);
  drawLine(grid, 8, 23, 12, 19, COLORS.brown, 1);
  drawLine(grid, 9, 19, 14, 24, COLORS.black, 3);
  drawLine(grid, 9, 19, 14, 24, COLORS.gold, 1);
}

function drawAxe(grid) {
  drawLine(grid, 11, 23, 18, 8, COLORS.black, 3);
  drawLine(grid, 11, 23, 18, 8, COLORS.brown, 1);
  fillRect(grid, 16, 7, 7, 6, COLORS.black);
  fillRect(grid, 17, 8, 5, 4, COLORS.steel);
  fillRect(grid, 19, 9, 2, 2, COLORS.white);
}

function drawShield(grid, main = COLORS.gray, accent = COLORS.blue) {
  fillRect(grid, 10, 8, 12, 2, COLORS.black);
  fillRect(grid, 9, 10, 14, 2, COLORS.black);
  fillRect(grid, 8, 12, 16, 10, COLORS.black);
  drawLine(grid, 10, 22, 16, 27, COLORS.black, 3);
  drawLine(grid, 22, 22, 16, 27, COLORS.black, 3);
  fillRect(grid, 10, 9, 12, 1, main);
  fillRect(grid, 10, 10, 12, 11, accent);
  drawLine(grid, 11, 21, 16, 25, main, 2);
  drawLine(grid, 21, 21, 16, 25, main, 2);
}

function drawHeart(grid, main = COLORS.red, accent = COLORS.redDark) {
  fillCircle(grid, 12, 12, 4, COLORS.black);
  fillCircle(grid, 20, 12, 4, COLORS.black);
  drawLine(grid, 9, 15, 16, 24, COLORS.black, 5);
  drawLine(grid, 23, 15, 16, 24, COLORS.black, 5);
  fillCircle(grid, 12, 12, 3, main);
  fillCircle(grid, 20, 12, 3, main);
  drawLine(grid, 10, 15, 16, 22, main, 3);
  drawLine(grid, 22, 15, 16, 22, main, 3);
  fillCircle(grid, 12, 11, 1, accent);
  fillCircle(grid, 20, 11, 1, accent);
}

function drawCrystal(grid, main = COLORS.blue, accent = COLORS.white) {
  drawDiamond(grid, 16, 15, 7, COLORS.black, COLORS.black);
  drawDiamond(grid, 16, 15, 6, main, COLORS.blueDark);
  drawLine(grid, 14, 11, 16, 19, accent, 1);
  drawLine(grid, 16, 11, 18, 15, accent, 1);
}

function drawBoot(grid) {
  fillRect(grid, 9, 10, 7, 11, COLORS.black);
  fillRect(grid, 10, 11, 5, 9, COLORS.gray);
  fillRect(grid, 12, 18, 11, 6, COLORS.black);
  fillRect(grid, 13, 19, 9, 4, COLORS.blue);
  drawLine(grid, 20, 10, 25, 7, COLORS.white, 1);
  drawLine(grid, 19, 13, 26, 10, COLORS.white, 1);
}

function drawCross(grid) {
  fillRect(grid, 14, 7, 4, 18, COLORS.black);
  fillRect(grid, 8, 13, 16, 4, COLORS.black);
  fillRect(grid, 15, 8, 2, 16, COLORS.holy);
  fillRect(grid, 9, 14, 14, 2, COLORS.holy);
  strokeCircle(grid, 16, 16, 10, COLORS.gold);
}

function drawSwirl(grid, color = COLORS.blue) {
  drawLine(grid, 7, 17, 16, 8, COLORS.black, 3);
  drawLine(grid, 16, 8, 25, 14, COLORS.black, 3);
  drawLine(grid, 25, 14, 18, 23, COLORS.black, 3);
  drawLine(grid, 18, 23, 9, 21, COLORS.black, 3);
  drawLine(grid, 8, 17, 16, 9, color, 1);
  drawLine(grid, 16, 9, 24, 14, color, 1);
  drawLine(grid, 24, 14, 18, 22, color, 1);
  drawLine(grid, 18, 22, 10, 20, color, 1);
}

function drawOrb(grid, main = COLORS.purple, accent = COLORS.blood) {
  fillCircle(grid, 16, 15, 7, COLORS.black);
  fillCircle(grid, 16, 15, 6, main);
  fillCircle(grid, 14, 13, 2, accent);
  drawLine(grid, 10, 23, 8, 27, COLORS.black, 2);
  drawLine(grid, 22, 23, 24, 27, COLORS.black, 2);
  drawLine(grid, 10, 23, 8, 27, COLORS.blood, 1);
  drawLine(grid, 22, 23, 24, 27, COLORS.blood, 1);
}

function drawThorns(grid) {
  drawShield(grid, COLORS.thorn, COLORS.greenDark);
  drawLine(grid, 7, 12, 11, 8, COLORS.black, 2);
  drawLine(grid, 25, 12, 21, 8, COLORS.black, 2);
  drawLine(grid, 7, 19, 10, 24, COLORS.black, 2);
  drawLine(grid, 25, 19, 22, 24, COLORS.black, 2);
  drawLine(grid, 7, 12, 11, 8, COLORS.thornDark, 1);
  drawLine(grid, 25, 12, 21, 8, COLORS.thornDark, 1);
  drawLine(grid, 7, 19, 10, 24, COLORS.thornDark, 1);
  drawLine(grid, 25, 19, 22, 24, COLORS.thornDark, 1);
}

function drawWingShield(grid) {
  drawShield(grid, COLORS.gray, COLORS.steelDark);
  drawLine(grid, 7, 18, 11, 14, COLORS.black, 2);
  drawLine(grid, 6, 21, 11, 18, COLORS.black, 2);
  drawLine(grid, 25, 18, 21, 14, COLORS.black, 2);
  drawLine(grid, 26, 21, 21, 18, COLORS.black, 2);
  drawLine(grid, 7, 18, 11, 14, COLORS.white, 1);
  drawLine(grid, 6, 21, 11, 18, COLORS.white, 1);
  drawLine(grid, 25, 18, 21, 14, COLORS.white, 1);
  drawLine(grid, 26, 21, 21, 18, COLORS.white, 1);
}

function drawSkull(grid) {
  fillCircle(grid, 16, 13, 7, COLORS.black);
  fillCircle(grid, 16, 13, 6, COLORS.steel);
  fillRect(grid, 11, 17, 10, 6, COLORS.black);
  fillRect(grid, 12, 18, 8, 4, COLORS.steel);
  fillCircle(grid, 13, 13, 2, COLORS.black);
  fillCircle(grid, 19, 13, 2, COLORS.black);
  drawLine(grid, 16, 15, 16, 19, COLORS.black, 1);
}

function drawGhost(grid, main = COLORS.blue) {
  fillCircle(grid, 16, 12, 6, COLORS.black);
  fillRect(grid, 10, 12, 12, 10, COLORS.black);
  fillRect(grid, 11, 12, 10, 9, main);
  fillRect(grid, 11, 19, 2, 3, COLORS.black);
  fillRect(grid, 15, 19, 2, 3, COLORS.black);
  fillRect(grid, 19, 19, 2, 3, COLORS.black);
  fillRect(grid, 12, 19, 1, 2, main);
  fillRect(grid, 16, 19, 1, 2, main);
  fillRect(grid, 20, 19, 1, 2, main);
  fillCircle(grid, 14, 12, 1, COLORS.white);
  fillCircle(grid, 18, 12, 1, COLORS.white);
}

function drawSpark(grid) {
  drawLine(grid, 16, 7, 16, 24, COLORS.black, 3);
  drawLine(grid, 7, 16, 24, 16, COLORS.black, 3);
  drawLine(grid, 10, 10, 22, 22, COLORS.black, 2);
  drawLine(grid, 22, 10, 10, 22, COLORS.black, 2);
  drawLine(grid, 16, 8, 16, 23, COLORS.gold, 1);
  drawLine(grid, 8, 16, 23, 16, COLORS.gold, 1);
  drawLine(grid, 11, 11, 21, 21, COLORS.holy, 1);
  drawLine(grid, 21, 11, 11, 21, COLORS.holy, 1);
}

function paintSlash(grid) {
  addBackdrop(grid, COLORS.shadow);
  drawSword(grid);
  drawLine(grid, 7, 10, 25, 22, COLORS.red, 2);
  drawLine(grid, 9, 8, 24, 18, COLORS.holy, 1);
}

function paintHeavyStrike(grid) {
  addBackdrop(grid, COLORS.shadow);
  drawAxe(grid);
  strokeCircle(grid, 19, 10, 5, COLORS.gold);
}

function paintExecute(grid) {
  addBackdrop(grid, COLORS.shadow);
  drawSkull(grid);
  drawLine(grid, 10, 23, 22, 7, COLORS.black, 3);
  drawLine(grid, 10, 23, 22, 7, COLORS.red, 1);
}

function paintIronSkin(grid) {
  addBackdrop(grid, COLORS.shadow);
  drawShield(grid, COLORS.gray, COLORS.steelDark);
}

function paintEvasion(grid) {
  addBackdrop(grid, COLORS.shadow);
  drawBoot(grid);
}

function paintHolyLight(grid) {
  addBackdrop(grid, COLORS.blueDark);
  drawCross(grid);
}

function paintWhirlwind(grid) {
  addBackdrop(grid, COLORS.shadow);
  drawSwirl(grid, COLORS.blue);
}

function paintLifeDrain(grid) {
  addBackdrop(grid, COLORS.shadow);
  drawOrb(grid, COLORS.purple, COLORS.red);
}

function paintThorncape(grid) {
  addBackdrop(grid, COLORS.shadow);
  drawThorns(grid);
}

function paintIronEvasion(grid) {
  addBackdrop(grid, COLORS.shadow);
  drawWingShield(grid);
}

function paintStrengthPassive(grid, pips) {
  addBackdrop(grid, COLORS.shadow);
  drawSword(grid);
  drawPips(grid, pips, COLORS.red);
}

function paintHealthPassive(grid, pips) {
  addBackdrop(grid, COLORS.shadow);
  drawHeart(grid);
  drawPips(grid, pips, COLORS.red);
}

function paintManaPassive(grid, pips) {
  addBackdrop(grid, COLORS.shadow);
  drawCrystal(grid);
  drawPips(grid, pips, COLORS.blue);
}

function paintDefensePassive(grid, pips) {
  addBackdrop(grid, COLORS.shadow);
  drawShield(grid, COLORS.gray, COLORS.blueDark);
  drawPips(grid, pips, COLORS.gold);
}

function paintEvasionPassive(grid, pips) {
  addBackdrop(grid, COLORS.shadow);
  drawGhost(grid, COLORS.blue);
  drawPips(grid, pips, COLORS.white);
}

const ICONS = [
  ['button-slash.png', paintSlash],
  ['button-heavy-strike.png', paintHeavyStrike],
  ['button-execute.png', paintExecute],
  ['button-iron-skin.png', paintIronSkin],
  ['button-evasion.png', paintEvasion],
  ['button-holy-light.png', paintHolyLight],
  ['button-whirlwind.png', paintWhirlwind],
  ['button-life-drain.png', paintLifeDrain],
  ['button-thorncape.png', paintThorncape],
  ['button-iron-evasion.png', paintIronEvasion],
  ['passive-str1.png', (grid) => paintStrengthPassive(grid, 1)],
  ['passive-hp2.png', (grid) => paintHealthPassive(grid, 1)],
  ['passive-mana2.png', (grid) => paintManaPassive(grid, 1)],
  ['passive-def1.png', (grid) => paintDefensePassive(grid, 1)],
  ['passive-str2.png', (grid) => paintStrengthPassive(grid, 2)],
  ['passive-hp4.png', (grid) => paintHealthPassive(grid, 2)],
  ['passive-mana4.png', (grid) => paintManaPassive(grid, 2)],
  ['passive-def2.png', (grid) => paintDefensePassive(grid, 2)],
  ['passive-translucent-skin.png', (grid) => paintEvasionPassive(grid, 1)],
  ['passive-reinforced-hide.png', (grid) => paintDefensePassive(grid, 3)],
  ['passive-brutal-might.png', (grid) => paintStrengthPassive(grid, 3)],
  ['passive-vitality.png', (grid) => paintHealthPassive(grid, 3)],
  ['passive-battle-focus.png', (grid) => paintManaPassive(grid, 3)],
  ['passive-combat-reflexes.png', (grid) => paintEvasionPassive(grid, 2)],
];

function gridToPng(grid) {
  const png = {
    width: CANVAS,
    height: CANVAS,
    data: Buffer.alloc(CANVAS * CANVAS * 4),
  };
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const color = grid[y][x];
      for (let sy = 0; sy < SCALE; sy += 1) {
        for (let sx = 0; sx < SCALE; sx += 1) {
          const px = x * SCALE + sx;
          const py = y * SCALE + sy;
          const idx = (png.width * py + px) * 4;
          png.data[idx] = color[0];
          png.data[idx + 1] = color[1];
          png.data[idx + 2] = color[2];
          png.data[idx + 3] = color[3];
        }
      }
    }
  }
  return png;
}

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function createPngBuffer(png) {
  const rawRows = [];
  for (let y = 0; y < png.height; y += 1) {
    rawRows.push(Buffer.from([0]));
    const rowStart = y * png.width * 4;
    rawRows.push(png.data.subarray(rowStart, rowStart + png.width * 4));
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(png.width, 0);
  ihdr.writeUInt32BE(png.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = zlib.deflateSync(Buffer.concat(rawRows));
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function writeIcon(fileName, painter) {
  const grid = createGrid();
  painter(grid);
  const png = gridToPng(grid);
  const buffer = createPngBuffer(png);
  await fs.promises.writeFile(path.join(OUTPUT_DIR, fileName), buffer);
}

async function main() {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
  for (const [fileName, painter] of ICONS) {
    await writeIcon(fileName, painter);
  }
  process.stdout.write(`Generated ${ICONS.length} skill icons in ${OUTPUT_DIR}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
