const viewport = document.getElementById("viewport");
const world = document.getElementById("world");
const playerEl = document.getElementById("player");

// WORLD SETTINGS
const WORLD_W = 3000;
const WORLD_H = 3000;

// PLAYER STATE (world coordinates)
const player = {
  x: 1500,
  y: 1500,
  w: 32,
  h: 32,
  speed: 280,
};

// INPUT
const keys = new Set();
window.addEventListener("keydown", (e) => keys.add(e.code));
window.addEventListener("keyup", (e) => keys.delete(e.code));

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function normalize(x, y) {
  const m = Math.hypot(x, y);
  if (m === 0) return { x: 0, y: 0 };
  return { x: x / m, y: y / m };
}

// CAMERA STATE
const camera = { x: 0, y: 0 };

let last = 0;
function loop(ts) {
  const dt = Math.min(0.033, (ts - last) / 1000 || 0);
  last = ts;

  // Movement axis
  const left  = keys.has("KeyA") || keys.has("ArrowLeft");
  const right = keys.has("KeyD") || keys.has("ArrowRight");
  const up    = keys.has("KeyW") || keys.has("ArrowUp");
  const down  = keys.has("KeyS") || keys.has("ArrowDown");

  const ax = (right ? 1 : 0) - (left ? 1 : 0);
  const ay = (down ? 1 : 0) - (up ? 1 : 0);
  const n = normalize(ax, ay);

  // Update player world pos
  player.x += n.x * player.speed * dt;
  player.y += n.y * player.speed * dt;

  // Clamp player to world bounds
  player.x = clamp(player.x, 0, WORLD_W - player.w);
  player.y = clamp(player.y, 0, WORLD_H - player.h);

  // Camera follows player center
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;

  const targetX = (player.x + player.w / 2) - vw / 2;
  const targetY = (player.y + player.h / 2) - vh / 2;

  camera.x = clamp(targetX, 0, WORLD_W - vw);
  camera.y = clamp(targetY, 0, WORLD_H - vh);

  // Render player in world space
  playerEl.style.left = `${player.x}px`;
  playerEl.style.top = `${player.y}px`;

  // Render camera (move world opposite)
  world.style.transform = `translate(${-camera.x}px, ${-camera.y}px)`;

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
