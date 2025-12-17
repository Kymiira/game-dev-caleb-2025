const viewport = document.getElementById("viewport"); // defining what the area you see is
const world = document.getElementById("world"); // defining the world (insert jojo theme)
const playerEl = document.getElementById("player"); // this is the player (yay!)
const hudMX = document.getElementById("mouseX");
const hudMY = document.getElementById("mouseY");

let mxView = 0;
let myView = 0;
let faceRad = 0;
let hasMouse = false;

// world largeness
const WORLD_W = 3000;
const WORLD_H = 3000;

// playerstate
const player = {
  x: 1500,
  y: 1500,
  w: 32,
  h: 32,
  speed: 280,
};

// inputs
const keys = new Set();
window.addEventListener("keydown", (e) => keys.add(e.code));
window.addEventListener("keyup", (e) => keys.delete(e.code));

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function normalize(x, y) {
  const m = Math.hypot(x, y);
  if (m === 0) return { x: 0, y: 0 };
  return { x: x / m, y: y / m };
}

// camerastate
const camera = { x: 0, y: 0 };

let last = 0;
function loop(ts) {
  const dt = Math.min(0.033, (ts - last) / 1000 || 0);
  last = ts;

  // movement axis
  const left  = keys.has("KeyA") || keys.has("ArrowLeft");
  const right = keys.has("KeyD") || keys.has("ArrowRight");
  const up    = keys.has("KeyW") || keys.has("ArrowUp");
  const down  = keys.has("KeyS") || keys.has("ArrowDown");

  const ax = (right ? 1 : 0) - (left ? 1 : 0);
  const ay = (down ? 1 : 0) - (up ? 1 : 0);
  const n = normalize(ax, ay);

  // the player's position in the world because WHY NOT!!!
  player.x += n.x * player.speed * dt;
  player.y += n.y * player.speed * dt;

  // the player will be stuck to the world bnecuase of ths code
  player.x = clamp(player.x, 0, WORLD_W - player.w);
  player.y = clamp(player.y, 0, WORLD_H - player.h);

  // camera will follow the player because of this special code
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;

  const targetX = (player.x + player.w / 2) - vw / 2;
  const targetY = (player.y + player.h / 2) - vh / 2;

  camera.x = clamp(targetX, 0, WORLD_W - vw);
  camera.y = clamp(targetY, 0, WORLD_H - vh);

  // rendering the player because WHY NOT
  playerEl.style.left = `${player.x}px`;
  playerEl.style.top = `${player.y}px`;

  // Render camera (move world opposite)
  world.style.transform = `translate(${-camera.x}px, ${-camera.y}px)`;

  if (hasMouse) {
    faceToMouseViewport();
    hudMX.textContent = Math.floor(mxView);
    hudMY.textContent = Math.floor(myView);

    playerEl.style.transformOrigin = "50% 50%";
    playeEl.style.transform = `rotate(${faceRad}rad)`;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

viewport.addEventListener("pointermove", (e) => {
  const r = viewport.getBoundingClientRect();
  mxView = e.clientX - r.left;
  myView = e.clientY - r.top;
  hasMouse = true;
});

viewport.addEventListener("pointerenter", (e) => {
  const r = viewport.getBoundingClientRect();
  mxView = e.clientX - r.left;
  myView = e.clientY - r.top;
  hasMouse = true;
});

viewport.addEventListener("pointerleave", () => { hasMouse = false; });

function faceToMouseViewport() {
  const pcxView = (player.x - camera.x) + player.w / 2;
  const pcyView = (player.y - camera.y) + player.h / 2;

  const dx = mxView - pcxView;
  const dy = myView - pcyView;

  faceRad = Math.atan2(dy, dx);
}