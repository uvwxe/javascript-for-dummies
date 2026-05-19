import '../styles/anim.css';

const GRID_W = 160;
const GRID_H = 120;
const CANVAS_W = 480;
const CANVAS_H = 360;
const SCALE = 3;
const ANIM_DURATION = 4000;
const FADE_AT = 3500;

const P = {
  bg: '#0f0f1a',
  skin: '#f0bf90',
  skinDark: '#d9a070',
  skinLight: '#fad8b8',
  hair: '#3d2613',
  hairLight: '#5a3920',
  hairDark: '#2a1808',
  hoodie: '#6c4fb8',
  hoodieLight: '#8b6fd4',
  hoodieDark: '#4d3296',
  hoodieAccent: '#9b7fd4',
  pants: '#2d2d44',
  pantsLight: '#3d3d58',
  shoe: '#1a1a2e',
  shoeLight: '#282840',
  eyeWhite: '#ffffff',
  eyePupil: '#1a1a2e',
  eyeShine: '#ffffff',
  mouth: '#c47a5a',
  blush: '#e8a090',
  white: '#f0f0f4',
  yellow: '#ffcc33',
  green: '#34c759',
  red: '#ff3b30',
  blue: '#6688ff',
  orange: '#ff9f0a',
  teal: '#4ecdc4',
  gray: '#666688',
  lightGray: '#9999bb',
  darkGray: '#333355',
  cloud: '#d8d8ec',
  cloudLight: '#f0f0f8',
  screen: '#141428',
  screenGlow: '#334488',
  paper: '#faf6ec',
  wood: '#6b4226',
  woodLight: '#8b5a3a',
  metal: '#9999aa',
  metalLight: '#bbbbcc',
  star: '#ffffff',
  particle: '#6688ff',
  glowGold: '#ffd700',
  glowTeal: '#4ecdc4',
  checkGreen: '#34c759',
  errorRed: '#ff3b30',
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t - 1) * (2 * Math.PI) / 0.35) + 1;
}

function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  else return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

type Ctx = CanvasRenderingContext2D;

function pset(ctx: Ctx, x: number, y: number, color: string) {
  if (x >= 0 && x < GRID_W && y >= 0 && y < GRID_H) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }
}

function hline(ctx: Ctx, x: number, y: number, w: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, 1);
}

function vline(ctx: Ctx, x: number, y: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, h);
}

function fill(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawStar(ctx: Ctx, x: number, y: number, size: number, alpha: number) {
  const s = Math.max(1, Math.round(size));
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0');
  fill(ctx, x, y, s, s, P.star + a);
}

let starSeed = 0;
function starAlpha(x: number, y: number, t: number): number {
  const v = Math.sin(x * 12.9898 + y * 78.233 + t * 0.8) * 0.5 + 0.5;
  return 0.2 + v * 0.6;
}

function drawStars(ctx: Ctx, elapsed: number) {
  starSeed = 0;
  const t = elapsed / 1000;
  for (let i = 0; i < 50; i++) {
    starSeed = (starSeed * 1103515245 + 12345) | 0;
    const sx = ((starSeed & 0xffff) / 0xffff) * GRID_W;
    starSeed = (starSeed * 1103515245 + 12345) | 0;
    const sy = ((starSeed & 0xffff) / 0xffff) * GRID_H;
    starSeed = (starSeed * 1103515245 + 12345) | 0;
    const sz = 1 + ((starSeed & 0x3) === 0 ? 1 : 0);
    const alpha = starAlpha(sx, sy, t);
    drawStar(ctx, Math.floor(sx), Math.floor(sy), sz, alpha);
  }
}

const POSE_IDLE = 0;
const POSE_SITTING = 1;
const POSE_TYPING = 2;
const POSE_CASTING = 3;
const POSE_JUGGLING = 4;
const POSE_SHIELDING = 5;
const POSE_PAINTING = 6;

function drawPixelChar(ctx: Ctx, ox: number, oy: number, frame: number, pose: number) {
  const t = frame * 0.016;
  const headW = 10;
  const headH = 12;
  const bodyW = 10;
  const bodyH = 14;
  const cx = ox;

  // Hair top
  fill(ctx, cx + 1, oy + 0, 8, 1, P.hairLight);
  fill(ctx, cx, oy + 1, 9, 2, P.hair);
  pset(ctx, cx + 9, oy + 1, P.hairDark);
  fill(ctx, cx - 1, oy + 2, 10, 1, P.hair);
  fill(ctx, cx - 1, oy + 3, 2, 2, P.hair);
  pset(ctx, cx + 8, oy + 3, P.hair);
  pset(ctx, cx + 8, oy + 4, P.hairDark);
  fill(ctx, cx, oy + 5, 1, 1, P.hair);
  pset(ctx, cx + 8, oy + 5, P.hairDark);

  // Face
  fill(ctx, cx + 1, oy + 4, 8, 6, P.skin);
  fill(ctx, cx, oy + 5, 1, 4, P.skin);
  fill(ctx, cx + 9, oy + 5, 1, 4, P.skin);
  pset(ctx, cx + 1, oy + 3, P.skinLight);
  pset(ctx, cx + 8, oy + 3, P.skinLight);
  hline(ctx, cx, oy + 4, 1, P.skinLight);
  hline(ctx, cx + 9, oy + 4, 1, P.skinLight);

  // Eyes
  fill(ctx, cx + 3, oy + 6, 2, 2, P.eyeWhite);
  fill(ctx, cx + 7, oy + 6, 2, 2, P.eyeWhite);
  pset(ctx, cx + 4, oy + 6, P.eyePupil);
  pset(ctx, cx + 7, oy + 6, P.eyePupil);
  // Eye shine
  pset(ctx, cx + 4, oy + 5, P.eyeShine);
  pset(ctx, cx + 7, oy + 5, P.eyeShine);
  // Blink
  if (Math.sin(t * 3.5) > 0.92) {
    hline(ctx, cx + 3, oy + 6, 6, P.skin);
    hline(ctx, cx + 3, oy + 7, 6, P.skinDark);
  }

  // Mouth
  if (pose === POSE_SHIELDING) {
    pset(ctx, cx + 4, oy + 10, P.mouth);
    pset(ctx, cx + 5, oy + 10, P.skinDark);
    pset(ctx, cx + 6, oy + 10, P.mouth);
  } else {
    pset(ctx, cx + 4, oy + 10, P.skinDark);
    pset(ctx, cx + 5, oy + 9, P.mouth);
    pset(ctx, cx + 6, oy + 9, P.mouth);
    pset(ctx, cx + 7, oy + 10, P.skinDark);
  }

  // Blush
  pset(ctx, cx + 2, oy + 8, P.blush);
  pset(ctx, cx + 8, oy + 8, P.blush);

  // Neck
  fill(ctx, cx + 3, oy + 11, 4, 2, P.skin);
  pset(ctx, cx + 2, oy + 11, P.skinDark);
  pset(ctx, cx + 8, oy + 11, P.skinDark);

  let armAngle = 0;
  let bodyOY = oy + 13;

  if (pose === POSE_SITTING) {
    bodyOY = oy + 13;
  }

  // Hoodie body
  fill(ctx, cx + 1, bodyOY, 8, 1, P.hoodieLight);
  fill(ctx, cx, bodyOY + 1, 10, 11, P.hoodie);
  fill(ctx, cx + 1, bodyOY + 12, 8, 1, P.hoodieDark);
  // Hoodie detail
  hline(ctx, cx + 2, bodyOY + 2, 6, P.hoodieLight);
  pset(ctx, cx + 4, bodyOY + 1, P.hoodieAccent);
  pset(ctx, cx + 5, bodyOY + 1, P.hoodieAccent);
  // Pocket
  fill(ctx, cx + 3, bodyOY + 6, 4, 2, P.hoodieDark);
  hline(ctx, cx + 3, bodyOY + 6, 4, P.hoodieLight);
  // Bottom edge
  hline(ctx, cx, bodyOY + 12, 10, P.hoodieDark);

  // Arms
  if (pose === POSE_IDLE) {
    // Left arm
    fill(ctx, cx - 2, bodyOY + 2, 2, 1, P.skin);
    fill(ctx, cx - 3, bodyOY + 3, 3, 1, P.skin);
    fill(ctx, cx - 4, bodyOY + 4, 4, 8, P.hoodie);
    fill(ctx, cx - 3, bodyOY + 12, 3, 2, P.skin);
    fill(ctx, cx - 2, bodyOY + 14, 2, 1, P.skinDark);
    // Right arm
    fill(ctx, cx + 10, bodyOY + 2, 2, 1, P.skin);
    fill(ctx, cx + 10, bodyOY + 3, 3, 1, P.skin);
    fill(ctx, cx + 10, bodyOY + 4, 4, 8, P.hoodie);
    fill(ctx, cx + 11, bodyOY + 12, 3, 2, P.skin);
    fill(ctx, cx + 12, bodyOY + 14, 2, 1, P.skinDark);
  } else if (pose === POSE_SITTING || pose === POSE_PAINTING) {
    // Arms forward/working
    fill(ctx, cx - 2, bodyOY + 2, 2, 1, P.skin);
    fill(ctx, cx - 4, bodyOY + 3, 5, 1, P.skin);
    fill(ctx, cx - 5, bodyOY + 4, 7, 6, P.hoodie);
    fill(ctx, cx - 4, bodyOY + 10, 3, 2, P.skin);
    pset(ctx, cx - 3, bodyOY + 12, P.skinDark);
    // Right arm
    fill(ctx, cx + 10, bodyOY + 2, 2, 1, P.skin);
    fill(ctx, cx + 9, bodyOY + 3, 5, 1, P.skin);
    fill(ctx, cx + 8, bodyOY + 4, 7, 6, P.hoodie);
    fill(ctx, cx + 11, bodyOY + 10, 3, 2, P.skin);
    pset(ctx, cx + 13, bodyOY + 12, P.skinDark);
  } else if (pose === POSE_TYPING) {
    // Arms forward-down at keyboard
    fill(ctx, cx - 3, bodyOY + 3, 4, 1, P.skin);
    fill(ctx, cx - 5, bodyOY + 4, 7, 7, P.hoodie);
    fill(ctx, cx - 4, bodyOY + 11, 3, 1, P.skin);
    pset(ctx, cx - 3, bodyOY + 12, P.skinDark);
    // Right arm
    fill(ctx, cx + 9, bodyOY + 3, 4, 1, P.skin);
    fill(ctx, cx + 8, bodyOY + 4, 7, 7, P.hoodie);
    fill(ctx, cx + 11, bodyOY + 11, 3, 1, P.skin);
    pset(ctx, cx + 13, bodyOY + 12, P.skinDark);
  } else if (pose === POSE_CASTING) {
    // Left arm down, right arm up with rod
    fill(ctx, cx - 2, bodyOY + 2, 2, 1, P.skin);
    fill(ctx, cx - 3, bodyOY + 3, 3, 8, P.hoodie);
    fill(ctx, cx - 2, bodyOY + 11, 2, 1, P.skin);
    // Right arm raised
    fill(ctx, cx + 10, bodyOY + 1, 2, 1, P.skin);
    fill(ctx, cx + 10, bodyOY, 3, 2, P.skin);
    fill(ctx, cx + 10, bodyOY - 2, 4, 3, P.hoodie);
    fill(ctx, cx + 11, bodyOY - 4, 2, 3, P.skin);
  } else if (pose === POSE_JUGGLING) {
    // Both arms up
    fill(ctx, cx - 2, bodyOY, 2, 2, P.skin);
    fill(ctx, cx - 3, bodyOY - 1, 4, 3, P.hoodie);
    fill(ctx, cx - 2, bodyOY - 3, 2, 2, P.skin);
    fill(ctx, cx + 10, bodyOY, 2, 2, P.skin);
    fill(ctx, cx + 9, bodyOY - 1, 4, 3, P.hoodie);
    fill(ctx, cx + 10, bodyOY - 3, 2, 2, P.skin);
  } else if (pose === POSE_SHIELDING) {
    // Arms forward with shield
    fill(ctx, cx - 3, bodyOY + 3, 6, 1, P.skin);
    fill(ctx, cx - 4, bodyOY + 4, 8, 6, P.hoodie);
    fill(ctx, cx + 8, bodyOY + 3, 6, 1, P.skin);
    fill(ctx, cx + 6, bodyOY + 4, 8, 6, P.hoodie);
  }

  const legsY = bodyOY + 13;

  // Legs
  if (pose === POSE_SITTING) {
    // Legs forward
    fill(ctx, cx, legsY, 4, 6, P.pants);
    fill(ctx, cx + 6, legsY, 4, 6, P.pants);
    fill(ctx, cx, legsY, 4, 1, P.pantsLight);
    fill(ctx, cx + 6, legsY, 4, 1, P.pantsLight);
    // Shoes
    fill(ctx, cx - 1, legsY + 6, 5, 2, P.shoe);
    fill(ctx, cx + 5, legsY + 6, 5, 2, P.shoe);
    fill(ctx, cx - 1, legsY + 6, 5, 1, P.shoeLight);
    fill(ctx, cx + 5, legsY + 6, 5, 1, P.shoeLight);
  } else {
    // Standing
    fill(ctx, cx + 1, legsY, 3, 8, P.pants);
    fill(ctx, cx + 6, legsY, 3, 8, P.pants);
    hline(ctx, cx + 1, legsY, 3, P.pantsLight);
    hline(ctx, cx + 6, legsY, 3, P.pantsLight);
    // Walk cycle
    if (pose === POSE_IDLE) {
      const walk = Math.sin(t * 4) * 1.5;
      fill(ctx, cx + 1 + Math.round(walk * 0.5), legsY + 8, 3, 1, P.darkGray);
      fill(ctx, cx + 6 - Math.round(walk * 0.5), legsY + 8, 3, 1, P.darkGray);
    }
    // Shoes
    fill(ctx, cx, legsY + 8, 5, 2, P.shoe);
    fill(ctx, cx + 5, legsY + 8, 5, 2, P.shoe);
    fill(ctx, cx, legsY + 8, 5, 1, P.shoeLight);
    fill(ctx, cx + 5, legsY + 8, 5, 1, P.shoeLight);
  }
}

function drawMonitor(ctx: Ctx, x: number, y: number) {
  // Screen
  fill(ctx, x + 1, y + 1, 16, 12, P.screen);
  // Screen glow top
  fill(ctx, x + 2, y + 2, 14, 2, P.screenGlow + '44');
  // Bezel
  hline(ctx, x, y, 18, P.darkGray);
  hline(ctx, x, y + 13, 18, P.darkGray);
  vline(ctx, x, y + 1, 12, P.darkGray);
  vline(ctx, x + 17, y + 1, 12, P.darkGray);
  // Corner highlights
  pset(ctx, x, y, P.metal);
  pset(ctx, x + 17, y, P.metal);
  // Stand
  fill(ctx, x + 7, y + 13, 4, 2, P.darkGray);
  fill(ctx, x + 8, y + 15, 2, 4, P.gray);
  fill(ctx, x + 6, y + 18, 6, 1, P.darkGray);
}

function drawDesk(ctx: Ctx, x: number, y: number, w: number) {
  fill(ctx, x, y, w, 2, P.woodLight);
  fill(ctx, x, y + 1, w, 1, P.wood);
  fill(ctx, x + 1, y + 2, 2, 12, P.wood);
  fill(ctx, x + w - 3, y + 2, 2, 12, P.wood);
  hline(ctx, x, y + 2, w, '#4a2a10');
}

function drawCloud(ctx: Ctx, x: number, y: number, size: number) {
  const s = size;
  fill(ctx, x + s, y + 2, s * 2, 3, P.cloud);
  fill(ctx, x + 1, y + 4, s * 4 - 2, 3, P.cloud);
  fill(ctx, x, y + 6, s * 4, 2, P.cloud);
  fill(ctx, x + 2, y, s * 2, 3, P.cloudLight);
  fill(ctx, x + 1, y + 3, s * 4 - 2, 1, P.cloudLight);
  fill(ctx, x + 3, y + 7, 2, 1, P.cloud);
}

function drawMagnifyingGlass(ctx: Ctx, x: number, y: number) {
  fill(ctx, x, y, 8, 8, P.white + '22');
  fill(ctx, x + 1, y + 1, 6, 6, P.blue + '33');
  hline(ctx, x + 1, y + 1, 6, P.white + '66');
  vline(ctx, x + 1, y + 2, 4, P.white + '44');
  // Handle
  fill(ctx, x + 6, y + 7, 2, 6, P.gray);
  fill(ctx, x + 7, y + 7, 1, 6, P.metalLight);
  fill(ctx, x + 5, y + 12, 4, 1, P.gray);
}

function drawButton(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, pressed: boolean) {
  const cy = pressed ? y + 1 : y;
  fill(ctx, x, cy + h - 1, w, 1, '#00000033');
  fill(ctx, x + w - 1, cy, 1, h, '#00000033');
  fill(ctx, x, cy, w, pressed ? h - 1 : h, color);
  hline(ctx, x, cy, w, P.white + '44');
  if (!pressed) {
    fill(ctx, x + 1, cy + 2, Math.floor(w / 3), 1, P.white + '33');
  }
}

function drawFishingRod(ctx: Ctx, x: number, y: number, bend: number) {
  fill(ctx, x, y, 1, 10, P.wood);
  fill(ctx, x - 1, y, 1, 10, P.woodLight + '44');
  // Rod top bending
  const bx = x - Math.abs(bend);
  fill(ctx, bx, y - 6, 4, 1, P.gray);
  fill(ctx, bx + 4, y - 6, 1, 1, P.metal);
  // Line
  for (let i = 0; i < 20; i++) {
    const lx = bx + ((i * 0.2) | 0);
    pset(ctx, lx, y - 6 + i, P.gray);
  }
}

function drawShield(ctx: Ctx, x: number, y: number) {
  fill(ctx, x + 2, y, 6, 2, P.blue);
  fill(ctx, x + 1, y + 2, 8, 4, P.blue);
  fill(ctx, x, y + 6, 10, 6, P.blue);
  fill(ctx, x + 2, y + 12, 6, 2, P.blue);
  fill(ctx, x + 3, y + 14, 4, 1, P.blue);
  // Shield shine
  fill(ctx, x + 2, y + 1, 4, 1, P.white + '33');
  pset(ctx, x + 4, y + 4, P.white + '44');
  pset(ctx, x + 5, y + 3, P.white + '22');
  // Border
  hline(ctx, x + 1, y, 8, P.blue + '88');
  hline(ctx, x, y + 6, 10, P.blue + '88');
}

function drawConveyor(ctx: Ctx, x: number, y: number, w: number) {
  fill(ctx, x, y, w, 3, P.gray);
  fill(ctx, x, y + 1, w, 1, P.metalLight);
  hline(ctx, x, y + 3, w, P.darkGray);
  // Rollers
  for (let rx = x + 2; rx < x + w - 2; rx += 6) {
    vline(ctx, rx, y + 3, 2, P.metal);
    pset(ctx, rx, y + 3, P.metalLight);
  }
  // Legs
  fill(ctx, x + 2, y + 5, 2, 4, P.darkGray);
  fill(ctx, x + w - 4, y + 5, 2, 4, P.darkGray);
}

function drawSieve(ctx: Ctx, x: number, y: number) {
  // Bowl
  hline(ctx, x + 2, y, 8, P.metal);
  hline(ctx, x + 1, y + 1, 10, P.metal);
  hline(ctx, x, y + 2, 12, P.metal);
  // Holes
  for (let hx = x + 2; hx < x + 10; hx += 2) {
    for (let hy = y + 3; hy < y + 6; hy += 2) {
      pset(ctx, hx, hy, P.white + '44');
      pset(ctx, hx + 1, hy, P.white + '22');
    }
  }
  // Bottom edge
  hline(ctx, x + 1, y + 7, 10, P.metal);
  hline(ctx, x + 2, y + 8, 8, P.metal);
  // Handle
  fill(ctx, x + 11, y + 1, 1, 4, P.wood);
  fill(ctx, x + 12, y, 4, 1, P.wood);
}

function drawFunnel(ctx: Ctx, x: number, y: number) {
  // Wide top
  fill(ctx, x, y + 1, 10, 2, P.metal);
  fill(ctx, x + 1, y, 8, 1, P.metalLight);
  // Tapering body
  fill(ctx, x + 1, y + 3, 8, 1, P.metal);
  fill(ctx, x + 2, y + 4, 6, 1, P.metal);
  fill(ctx, x + 3, y + 5, 4, 1, P.metal);
  fill(ctx, x + 3, y + 6, 4, 2, P.metal);
  // Spout
  fill(ctx, x + 4, y + 8, 2, 2, P.metal);
  fill(ctx, x + 4, y + 10, 2, 1, P.metal);
  // Glow at bottom
  pset(ctx, x + 4, y + 10, P.glowGold);
  pset(ctx, x + 5, y + 10, P.glowGold);
}

function drawCodeOnScreen(ctx: Ctx, x: number, y: number, lines: number) {
  for (let i = 0; i < lines; i++) {
    const colors = [P.green, P.teal, P.blue, P.orange, P.yellow];
    const color = colors[i % colors.length];
    const len = 3 + ((i * 7 + 3) % 8);
    fill(ctx, x + 2, y + 1 + i * 3, len, 1, color);
  }
}

function drawGlowParticle(ctx: Ctx, x: number, y: number, size: number, color: string, alpha: number) {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0');
  fill(ctx, Math.round(x), Math.round(y), size, size, color + a);
}

// ── Scene renderers ──

function sceneDomSelectors(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 12;
  const charY = 30;

  drawDesk(ctx, 8, 68, 80);
  drawMonitor(ctx, 32, 48);
  const lines = Math.min(4, Math.floor(progress * 5));
  drawCodeOnScreen(ctx, 32, 48, lines);

  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_SITTING);

  // Magnifying glass moving over elements
  const mgProgress = easeInOutCubic(Math.min(progress * 1.5, 1));
  const mgX = 34 + Math.sin(mgProgress * Math.PI * 3) * 10;
  const mgY = 48 + mgProgress * 10;
  drawMagnifyingGlass(ctx, Math.round(mgX), Math.round(mgY));

  // Highlighted element
  if (progress > 0.4) {
    const hlPulse = Math.sin(elapsed * 0.008) * 0.3 + 0.7;
    fill(ctx, 40, 57, 6, 2, P.yellow + Math.round(hlPulse * 40).toString(16).padStart(2, '0'));
  }

  // Flowing particles into glass
  if (progress > 0.2) {
    for (let i = 0; i < 4; i++) {
      const pPhase = (progress * 2 + i * 0.25) % 1;
      const px = 34 + Math.sin(pPhase * Math.PI) * 8;
      const py = 52 - pPhase * 8;
      drawGlowParticle(ctx, px, py, 1, P.yellow, 0.8);
    }
  }
}

function sceneDomEvents(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 70;
  const charY = 30;

  drawDesk(ctx, 8, 68, 100);
  drawMonitor(ctx, 8, 46);
  drawCodeOnScreen(ctx, 8, 46, 3);
  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_SITTING);

  // Button on screen
  const btnPress = (progress * 2.5) % 1 < 0.3;
  drawButton(ctx, 50, 52, 14, 6, P.blue, btnPress);

  // Ripple effects
  const ripples = Math.floor(progress * 3);
  for (let r = 0; r < ripples; r++) {
    const rPhase = (progress * 3 - r) * 1.3;
    const radius = rPhase * 12;
    const alpha = Math.max(0, 1 - rPhase) * 0.5;
    const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
    for (let angle = 0; angle < Math.PI * 2; angle += 0.4) {
      const rx = 57 + Math.cos(angle) * radius;
      const ry = 55 + Math.sin(angle) * radius;
      pset(ctx, Math.round(rx), Math.round(ry), P.teal + a);
    }
  }

  // Button glow pulse
  if (btnPress) {
    fill(ctx, 49, 51, 16, 8, P.teal + '15');
  }
}

function sceneDomModify(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 12;
  const charY = 28;

  drawDesk(ctx, 8, 68, 90);
  drawMonitor(ctx, 44, 42);

  // Content appearing on screen
  const revealProg = Math.min(progress * 2, 1);
  const contentLines = Math.floor(revealProg * 5);
  const colors = [P.green, P.teal, P.blue, P.orange, P.yellow];
  for (let i = 0; i < contentLines; i++) {
    const alpha = (revealProg * 5 - i) < 0.3 ? '44' : 'ff';
    fill(ctx, 46, 44 + i * 3, 3 + i * 2, 2, colors[i]);
  }

  // Character with painting pose
  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_PAINTING);

  // Brush-like effect - particles coming from character's hand toward screen
  if (progress > 0.15) {
    const bp = (progress - 0.15) / 0.85;
    for (let i = 0; i < 6; i++) {
      const pp = (bp * 3 + i * 0.16) % 1;
      const px = lerp(30, 50, pp);
      const py = lerp(50, 44 + (i % 3) * 3, pp) + Math.sin(pp * Math.PI * 4) * 2;
      drawGlowParticle(ctx, px, py, 1, colors[i % 5], 0.9 - pp * 0.5);
    }
  }
}

function sceneFormsInput(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 75;
  const charY = 28;

  drawDesk(ctx, 8, 68, 100);

  // Form on screen
  fill(ctx, 10, 40, 28, 22, P.white + '11');
  fill(ctx, 12, 42, 24, 1, P.white + '22');
  fill(ctx, 12, 46, 18, 4, P.white + '0d');
  fill(ctx, 12, 46, 1, 4, P.blue);
  fill(ctx, 12, 53, 18, 4, P.white + '0d');
  fill(ctx, 12, 53, 1, 4, P.blue);

  // Letters floating up
  const typedLen = Math.floor(progress * 14);
  const letters = 'const handleSubmit = (e) => {'.split('');
  for (let i = 0; i < Math.min(typedLen, letters.length); i++) {
    const lx = 14 + i * 1.5;
    const floatY = 46 + Math.sin(elapsed * 0.004 + i * 0.5) * 1;
    const lColor = i < 5 ? P.blue : i < 10 ? P.teal : P.green;
    pset(ctx, Math.round(lx), Math.round(floatY), lColor);
  }

  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_TYPING);

  // Keyboard
  fill(ctx, 78, 62, 20, 5, P.darkGray);
  fill(ctx, 80, 63, 2, 1, P.gray);
  fill(ctx, 84, 63, 2, 1, P.gray);
  fill(ctx, 88, 63, 2, 1, P.gray);
  fill(ctx, 92, 63, 4, 1, P.gray);
  fill(ctx, 80, 65, 2, 1, P.gray);
  fill(ctx, 84, 65, 2, 1, P.gray);
  fill(ctx, 88, 65, 8, 1, P.gray);

  // Key press highlight
  const keyIdx = Math.floor((progress * 8) % 4);
  const keyXs = [80, 84, 88, 92];
  if (progress < 0.95) {
    fill(ctx, keyXs[keyIdx], 64, 2, 1, P.yellow);
  }
}

function sceneFormsValidation(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 12;
  const charY = 30;

  drawDesk(ctx, 8, 68, 80);
  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_SITTING);

  // Clipboard
  fill(ctx, 40, 36, 18, 24, P.paper);
  fill(ctx, 42, 36, 14, 2, P.metal);
  fill(ctx, 40, 38, 18, 1, P.lightGray + '44');

  // Checkbox lines
  const items = ['Name', 'Email', 'Password'];
  for (let i = 0; i < 3; i++) {
    // Checkbox
    fill(ctx, 44, 42 + i * 6, 4, 4, P.white + '22');
    hline(ctx, 44, 42 + i * 6, 4, P.gray);
    hline(ctx, 44, 45 + i * 6, 4, P.gray);
    vline(ctx, 44, 42 + i * 6, 4, P.gray);
    vline(ctx, 47, 42 + i * 6, 4, P.gray);
    // Text placeholder
    fill(ctx, 50, 43 + i * 6, 6, 2, P.lightGray + '44');
  }

  // Checkmarks appear
  const checks = Math.min(3, Math.floor(progress * 4));
  for (let i = 0; i < checks; i++) {
    const checkProg = Math.min(1, (progress * 4 - i) * 0.8);
    const scale = easeOutBack(checkProg);
    const cx = 46, cy = 42 + i * 6;
    // Animated checkmark
    const len = Math.round(6 * scale);
    if (len > 0) pset(ctx, cx, cy + 2, P.checkGreen);
    if (len > 1) pset(ctx, cx + 1, cy + 3, P.checkGreen);
    if (len > 2) pset(ctx, cx + 2, cy + 4, P.checkGreen);
    if (len > 3) pset(ctx, cx + 3, cy + 3, P.checkGreen);
    if (len > 4) pset(ctx, cx + 4, cy + 2, P.checkGreen);
    if (len > 5) pset(ctx, cx + 5, cy + 1, P.checkGreen);
  }
}

function sceneFormsSubmit(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 70;
  const charY = 28;

  drawDesk(ctx, 8, 68, 100);

  // Form
  fill(ctx, 10, 38, 26, 24, P.white + '0a');
  fill(ctx, 12, 40, 22, 1, P.white + '1a');
  fill(ctx, 12, 44, 16, 3, P.white + '08');
  fill(ctx, 12, 50, 16, 3, P.white + '08');
  // Submit button
  fill(ctx, 12, 56, 12, 4, P.blue);
  fill(ctx, 14, 57, 4, 1, P.white + '33');

  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_TYPING);

  // Keyboard
  fill(ctx, 72, 62, 24, 5, P.darkGray);
  fill(ctx, 74, 63, 3, 1, P.gray);
  fill(ctx, 79, 63, 3, 1, P.gray);
  fill(ctx, 84, 63, 3, 1, P.gray);
  fill(ctx, 89, 63, 5, 1, P.gray);
  fill(ctx, 74, 65, 3, 1, P.gray);
  fill(ctx, 79, 65, 3, 1, P.gray);
  fill(ctx, 84, 65, 10, 1, P.gray);

  // Enter key press at 0.3
  if (progress > 0.3) {
    fill(ctx, 89, 63, 5, 1, P.yellow + '66');
  }

  // Paper airplane
  if (progress > 0.35) {
    const planeProg = (progress - 0.35) / 0.65;
    const planeX = lerp(14, 60, easeInOutCubic(planeProg));
    const planeY = lerp(54, 14, easeInOutCubic(planeProg)) - Math.sin(planeProg * Math.PI) * 8;
    // Airplane shape
    const px = Math.round(planeX);
    const py = Math.round(planeY);
    pset(ctx, px + 2, py, P.white);
    pset(ctx, px + 1, py + 1, P.white);
    pset(ctx, px + 2, py + 1, P.white);
    pset(ctx, px + 3, py + 1, P.white);
    pset(ctx, px, py + 2, P.white);
    pset(ctx, px + 1, py + 2, P.white);
    pset(ctx, px + 3, py + 2, P.white);
    pset(ctx, px + 4, py + 2, P.white);
    pset(ctx, px + 1, py + 3, P.white);
    pset(ctx, px + 3, py + 3, P.white);
    // Trail particles
    for (let t = 0; t < 3; t++) {
      const tx = px + 2 - t * 4;
      const ty = py + 1 + Math.sin(t * 0.8 + elapsed * 0.005) * 2;
      drawGlowParticle(ctx, tx, ty, 1, P.white, 0.4 - t * 0.1);
    }
  }

  // Cloud receiving the plane
  if (progress > 0.7) {
    drawCloud(ctx, 42, 6, 6);
  }
}

function sceneAsyncFetch(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 14;
  const charY = 44;

  // Ground
  fill(ctx, 0, 78, GRID_W, 2, P.darkGray + '44');

  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_CASTING);

  // Cloud
  drawCloud(ctx, 60, 14, 8);

  // Fishing rod
  const rodBend = Math.sin(progress * Math.PI * 2.5) * 3;
  drawFishingRod(ctx, 26, 58, rodBend);

  // Data packets coming from cloud
  const packets = 3;
  for (let i = 0; i < packets; i++) {
    const pProg = (progress * 1.5 + i * 0.33) % 1;
    const px = lerp(64, 26, pProg);
    const py = lerp(20, 56, easeInOutCubic(pProg)) + Math.sin(pProg * Math.PI * 3) * 4;
    const pColor = i === 0 ? P.yellow : i === 1 ? P.teal : P.blue;
    fill(ctx, Math.round(px), Math.round(py), 4, 3, pColor);
    fill(ctx, Math.round(px), Math.round(py), 4, 1, P.white + '55');
    pset(ctx, Math.round(px + 1), Math.round(py + 1), P.white + '44');
  }

  // Terminal showing fetched data
  if (progress > 0.5) {
    drawMonitor(ctx, 96, 46);
    const fetchProg = Math.min((progress - 0.5) * 3, 1);
    const fetchLines = Math.floor(fetchProg * 4);
    for (let i = 0; i < fetchLines; i++) {
      fill(ctx, 98, 48 + i * 3, 6 + i * 2, 1, P.green);
      fill(ctx, 98, 49 + i * 3, 4 + i * 2, 1, P.teal);
    }
  }
}

function sceneAsyncPromises(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 64;
  const charY = 44;

  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_JUGGLING);

  // Three glowing orbs with smooth arcs
  const orbs = [
    { color: P.blue, phase: 0, size: 5 },
    { color: P.teal, phase: 0.33, size: 5 },
    { color: P.orange, phase: 0.66, size: 5 },
  ];

  for (const orb of orbs) {
    const oProg = (progress + orb.phase) % 1;
    const arcX = Math.sin(oProg * Math.PI * 2) * 18;
    const arcY = -Math.abs(Math.cos(oProg * Math.PI)) * 20 - 4;
    const ox = Math.round(charX + 5 + arcX);
    const oy = Math.round(charY - 14 + arcY);
    const s = orb.size;

    // Glow
    fill(ctx, ox - 1, oy - 1, s + 2, s + 2, orb.color + '22');
    // Orb body
    fill(ctx, ox, oy, s, s, orb.color);
    // Highlight
    fill(ctx, ox, oy, 2, 1, P.white + '66');
    pset(ctx, ox + 1, oy + 1, P.white + '55');
    // Shadow side
    fill(ctx, ox + s - 2, oy + 1, 2, s - 1, '#00000022');
  }

  // Terminal/console at bottom
  fill(ctx, 14, 68, 36, 20, P.screen + '88');
  fill(ctx, 16, 70, 14, 1, P.green);
  fill(ctx, 16, 73, 20, 1, P.blue);
  fill(ctx, 16, 76, 8, 1, P.green);
  if (progress > 0.5) {
    fill(ctx, 16, 79, 22, 1, P.teal);
  }
  if (progress > 0.7) {
    fill(ctx, 16, 82, 16, 1, P.green);
  }

  // Promise resolution sparkles
  if (progress > 0.6) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + elapsed * 0.002;
      const dist = 14 + Math.sin(elapsed * 0.005 + i) * 4;
      const sx = Math.round(charX + 5 + Math.cos(angle) * dist);
      const sy = Math.round(charY - 8 + Math.sin(angle) * dist * 0.6);
      drawGlowParticle(ctx, sx, sy, 1, P.yellow, 0.5 + Math.sin(elapsed * 0.01 + i) * 0.3);
    }
  }
}

function sceneAsyncErrors(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 14;
  const charY = 44;

  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_SHIELDING);

  // Shield
  drawShield(ctx, charX + 10, charY - 10);

  // Error sparks coming from right
  for (let i = 0; i < 6; i++) {
    const sparkProg = (progress * 1.2 + i * 0.15) % 1;
    const sx = lerp(70, 36, sparkProg);
    const sy = charY - 6 + Math.sin(sparkProg * Math.PI * 3 + i) * 10;
    // Spark shape (erratic)
    const color = i % 2 === 0 ? P.red : P.orange;
    fill(ctx, Math.round(sx), Math.round(sy), 2, 2, color);
    pset(ctx, Math.round(sx - 1), Math.round(sy + 1), P.red + '88');
    pset(ctx, Math.round(sx + 2), Math.round(sy - 1), P.orange + '88');
  }

  // Deflected sparks bouncing off shield
  if (progress > 0.25) {
    for (let i = 0; i < 4; i++) {
      const dProg = (progress * 1.2 + i * 0.25) % 1;
      if (dProg > 0.3) {
        const dx = 24 + Math.sin(dProg * Math.PI * 2) * 16;
        const dy = charY - 12 - dProg * 20;
        drawGlowParticle(ctx, Math.round(dx), Math.round(dy), 1, P.orange, 0.7 - dProg * 0.5);
      }
    }
  }

  // Try/catch on screen
  fill(ctx, 36, 70, 40, 18, P.screen + 'aa');
  fill(ctx, 38, 72, 8, 1, P.blue);
  fill(ctx, 38, 74, 12, 1, P.green);
  fill(ctx, 40, 77, 6, 1, P.red);
  fill(ctx, 40, 79, 14, 1, P.green);
}

function sceneArraysMap(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 12;
  const charY = 44;

  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_IDLE);

  // Conveyor belt
  drawConveyor(ctx, 30, 64, 90);

  // Items on conveyor moving right
  const items = [
    { shape: 0, color: P.red },
    { shape: 1, color: P.blue },
    { shape: 2, color: P.orange },
    { shape: 0, color: P.green },
    { shape: 1, color: P.yellow },
  ];

  const beltOffset = (progress * 40) % 80;
  for (let i = 0; i < items.length; i++) {
    const itemX = Math.round(30 + beltOffset + i * 14) % 100;
    if (itemX < 32) continue;
    const item = items[i];

    if (itemX > 75) {
      // Transformed! Different shape/color
      const tProg = ((itemX - 75) / 25);
      const growScale = easeInOutCubic(Math.min(tProg, 1));
      const s = Math.round(2 + growScale * 3);
      fill(ctx, itemX - s, 58 - s, s * 2, s * 2, P.teal);
      pset(ctx, itemX, 58 - 1, P.white + '88');
      pset(ctx, itemX - 1, 58, P.white + '44');
    } else {
      // Original item
      fill(ctx, itemX, 59, 4, 4, item.color);
      pset(ctx, itemX + 1, 59, P.white + '55');
    }
  }

  // Label arrows
  if (progress > 0.2) {
    pset(ctx, 62, 54, P.white + '66');
    pset(ctx, 63, 55, P.white + '66');
    pset(ctx, 64, 56, P.white + '66');
    pset(ctx, 63, 57, P.white + '66');
    pset(ctx, 62, 58, P.white + '66');
  }
}

function sceneArraysFilter(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 12;
  const charY = 48;

  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_IDLE);

  // Sieve
  drawSieve(ctx, 44, 44);

  // Items falling from above
  const itemDefs = [
    { shape: 'circle', color: P.green, passes: true },
    { shape: 'square', color: P.red, passes: false },
    { shape: 'circle', color: P.blue, passes: true },
    { shape: 'square', color: P.orange, passes: false },
    { shape: 'circle', color: P.teal, passes: true },
    { shape: 'square', color: P.yellow, passes: false },
    { shape: 'circle', color: P.green, passes: true },
    { shape: 'square', color: P.red, passes: false },
  ];

  for (let i = 0; i < itemDefs.length; i++) {
    const itemProg = (progress * 3 + i * 0.35) % 1.5;
    if (itemProg > 1) continue;
    const ix = 44 + Math.sin(i * 0.9 + progress * 2) * 6;
    const iy = 18 + itemProg * 30;

    if (iy < 44) {
      // Above sieve
      fill(ctx, Math.round(ix), Math.round(iy), 3, 3, itemDefs[i].color);
      pset(ctx, Math.round(ix + 1), Math.round(iy), P.white + '55');
    } else if (itemDefs[i].passes && iy < 52) {
      // Passing through sieve
      fill(ctx, Math.round(ix), Math.round(iy), 3, 3, itemDefs[i].color);
    } else if (!itemDefs[i].passes && iy >= 44 && iy < 52) {
      // Stuck on sieve (bounce to side)
      const bounceDir = i % 2 === 0 ? 1 : -1;
      const bounceX = ix + bounceDir * (iy - 44) * 2;
      fill(ctx, Math.round(bounceX), 46 + (i % 3) * 2, 3, 3, itemDefs[i].color);
    }
  }

  // Passed items collected below
  const passedCount = Math.floor(progress * 4);
  for (let i = 0; i < Math.min(passedCount, 4); i++) {
    fill(ctx, 56 + i * 6, 58, 4, 4, P.green);
    pset(ctx, 57 + i * 6, 59, P.white + '44');
  }
}

function sceneArraysReduce(ctx: Ctx, elapsed: number) {
  const progress = Math.min(elapsed / ANIM_DURATION, 1);
  const charX = 12;
  const charY = 48;

  drawPixelChar(ctx, charX, charY, Math.floor(elapsed / 16.67), POSE_IDLE);

  // Funnel
  drawFunnel(ctx, 52, 28);

  // Many colored items pouring in from top
  const topItems = 8;
  const colors = [P.red, P.blue, P.green, P.orange, P.yellow, P.teal, P.red, P.blue];
  for (let i = 0; i < topItems; i++) {
    const itemProg = (progress * 2 + i * 0.15) % 1.2;
    if (itemProg > 1) continue;
    const ix = 52 + Math.sin(i * 0.7) * 6;
    const iy = 10 + itemProg * 18;
    if (iy < 26) {
      fill(ctx, Math.round(ix), Math.round(iy), 3, 3, colors[i]);
      pset(ctx, Math.round(ix + 1), Math.round(iy), P.white + '55');
    }
  }

  // Combined result emerging from bottom
  if (progress > 0.4) {
    const resultProg = easeOutElastic(Math.min((progress - 0.4) / 0.4, 1));
    const ry = 44 + (1 - resultProg) * 6;
    // Glowing combined orb
    fill(ctx, 54, Math.round(ry), 6, 6, P.glowGold);
    fill(ctx, 54, Math.round(ry), 6, 2, P.white + '44');
    pset(ctx, 56, Math.round(ry + 2), P.white + '88');
    // Glow aura
    fill(ctx, 53, Math.round(ry - 1), 8, 8, P.glowGold + '22');
    // Sparkles
    for (let s = 0; s < 4; s++) {
      const angle = (s / 4) * Math.PI * 2 + elapsed * 0.003;
      const dist = 5 + Math.sin(elapsed * 0.006 + s) * 2;
      const sx = 57 + Math.cos(angle) * dist;
      const sy = Math.round(ry + 3) + Math.sin(angle) * dist;
      drawGlowParticle(ctx, Math.round(sx), Math.round(sy), 1, P.yellow, 0.8);
    }
  }
}

const SCENES: Record<string, (ctx: Ctx, elapsed: number) => void> = {
  'dom-selectors-scene': sceneDomSelectors,
  'dom-events-scene': sceneDomEvents,
  'dom-modify-scene': sceneDomModify,
  'forms-input-scene': sceneFormsInput,
  'forms-validation-scene': sceneFormsValidation,
  'forms-submit-scene': sceneFormsSubmit,
  'async-fetch-scene': sceneAsyncFetch,
  'async-promises-scene': sceneAsyncPromises,
  'async-errors-scene': sceneAsyncErrors,
  'arrays-map-scene': sceneArraysMap,
  'arrays-filter-scene': sceneArraysFilter,
  'arrays-reduce-scene': sceneArraysReduce,
};

const LABELS: Record<string, { tag: string; desc: string }> = {
  'dom-selectors-scene': { tag: 'JavaScript', desc: 'Finding elements on the page' },
  'dom-events-scene': { tag: 'JavaScript', desc: 'Making the page interactive' },
  'dom-modify-scene': { tag: 'JavaScript', desc: 'Rewriting the page in real-time' },
  'forms-input-scene': { tag: 'JavaScript', desc: 'Capturing user input' },
  'forms-validation-scene': { tag: 'JavaScript', desc: 'Validating form data' },
  'forms-submit-scene': { tag: 'JavaScript', desc: 'Submitting to the server' },
  'async-fetch-scene': { tag: 'JavaScript', desc: 'Fetching data from the API' },
  'async-promises-scene': { tag: 'JavaScript', desc: 'Handling async operations' },
  'async-errors-scene': { tag: 'JavaScript', desc: 'Catching errors gracefully' },
  'arrays-map-scene': { tag: 'JavaScript', desc: 'Transforming data with map()' },
  'arrays-filter-scene': { tag: 'JavaScript', desc: 'Filtering results' },
  'arrays-reduce-scene': { tag: 'JavaScript', desc: 'Reducing to a single value' },
};

export default function renderAnimation(
  container: HTMLElement,
  animationId: string,
  onComplete: () => void,
): void {
  const scene = SCENES[animationId] || sceneDomSelectors;
  const info = LABELS[animationId] || { tag: 'JavaScript', desc: 'Loading...' };

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'anim-container';

  const canvas = document.createElement('canvas');
  canvas.className = 'anim-canvas';
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  const labelEl = document.createElement('div');
  labelEl.className = 'anim-label';
  const tagEl = document.createElement('span');
  tagEl.className = 'anim-tag';
  tagEl.textContent = info.tag;
  const descEl = document.createElement('span');
  descEl.textContent = info.desc;
  labelEl.appendChild(tagEl);
  labelEl.appendChild(descEl);

  wrapper.appendChild(canvas);
  wrapper.appendChild(labelEl);
  container.appendChild(wrapper);

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // Offscreen pixel buffer (160x120)
  const offscreen = document.createElement('canvas');
  offscreen.width = GRID_W;
  offscreen.height = GRID_H;
  const offCtx = offscreen.getContext('2d')!;
  offCtx.imageSmoothingEnabled = false;

  const startTime = performance.now();
  let completed = false;
  let fadeAlpha = 1;

  function render(timestamp: number) {
    const elapsed = timestamp - startTime;

    if (elapsed >= ANIM_DURATION && !completed) {
      completed = true;
      wrapper.style.transition = 'opacity 0.5s ease-out';
      wrapper.style.opacity = '0';
      setTimeout(() => {
        container.innerHTML = '';
        onComplete();
      }, 500);
      return;
    }

    // Fade out near the end
    if (elapsed > FADE_AT && !completed) {
      fadeAlpha = Math.max(0, 1 - (elapsed - FADE_AT) / (ANIM_DURATION - FADE_AT));
      wrapper.style.opacity = String(fadeAlpha);
    }

    // Clear offscreen buffer
    offCtx.clearRect(0, 0, GRID_W, GRID_H);
    fill(offCtx, 0, 0, GRID_W, GRID_H, P.bg);

    // Background stars
    drawStars(offCtx, elapsed);

    // Scene
    scene(offCtx, elapsed);

    // Scale up to display canvas
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.drawImage(offscreen, 0, 0, GRID_W, GRID_H, 0, 0, CANVAS_W, CANVAS_H);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
