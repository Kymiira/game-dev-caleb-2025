const viewport = document.getElementById("viewport");
const world = document.getElementById("world");
const playerEl = document.getElementById("player");
const bulletEl = document.getElementById("bullet");
const hudMX = document.getElementById("mouseX");
const hudMY = document.getElementById("mouseY");

let mxView = 0;
let myView = 0;
let faceRad = 0;
let hasMouse = false;

const WORLD_W = 3000;
const WORLD_H = 3000;

const player = {
  x: 1500,
  y: 1500,
  w: 32,
  h: 32,
  speed: 280,
};

const keys = new Set();
window.addEventListener("keydown", (e) => keys.add(e.code));
window.addEventListener("keyup", (e) => keys.delete(e.code));

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function normalize(x, y) {
  const m = Math.hypot(x, y);
  if (m === 0) return { x: 0, y: 0 };
  return { x: x / m, y: y / m };
}

const camera = { x: 0, y: 0 };

const bullets = [];
const bullet_speed = 900;
const bullet_ttl = 1.2;
const fire_cooldown = 0.12;

let fireCd = 0;

function makeBulletElement() {
  let el = null;

  if (bulletEl) {
    el = bulletEl.cloneNode(true);
    el.removeAttribute("id");
    el.style.display = "";
    el.style.position = "absolute";
  } else {
    el = document.createElement("div");
    el.className = "bullet";
    el.style.position = "absolute";
    el.style.width = "6px";
    el.style.height = "6px";
    el.style.borderRadius = "999px";
    el.style.background = "#fff";
    el.style.zIndex = "10";
    el.style.boxShadow = "0 0 6px rgba(255,255,255,0.8)";
  }

  world.appendChild(el);

  const w = el.offsetWidth || 6;
  const h = el.offsetHeight || 6;

  return { el: el, w: w, h: h };
}

function spawnBullet() {
  const x = player.x + player.w / 2;
  const y = player.y + player.h / 2;

  const vx = Math.cos(faceRad) * bullet_speed;
  const vy = Math.sin(faceRad) * bullet_speed;

  const made = makeBulletElement();

  bullets.push({
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    life: bullet_ttl,
    w: made.w,
    h: made.h,
    el: made.el,
  });
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];

    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;

    const outOfBounds = (b.x < 0 || b.y < 0 || b.x > WORLD_W || b.y > WORLD_H);

    if (b.life <= 0 || outOfBounds) {
      b.el.remove();
      bullets.splice(i, 1);
      continue;
    }

    b.el.style.left = (b.x - b.w / 2) + "px";
    b.el.style.top  = (b.y - b.h / 2) + "px";
  }
}

viewport.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;

  const r = viewport.getBoundingClientRect();
  mxView = e.clientX - r.left;
  myView = e.clientY - r.top;
  hasMouse = true;

  if (fireCd <= 0) {
    spawnBullet();
    fireCd = fire_cooldown;
  }
});

let last = 0;
function loop(ts) {
  const dt = Math.min(0.033, (ts - last) / 1000 || 0);
  last = ts;

  const left  = keys.has("KeyA") || keys.has("ArrowLeft");
  const right = keys.has("KeyD") || keys.has("ArrowRight");
  const up    = keys.has("KeyW") || keys.has("ArrowUp");
  const down  = keys.has("KeyS") || keys.has("ArrowDown");

  const ax = (right ? 1 : 0) - (left ? 1 : 0);
  const ay = (down ? 1 : 0) - (up ? 1 : 0);
  const n = normalize(ax, ay);

  player.x += n.x * player.speed * dt;
  player.y += n.y * player.speed * dt;

  player.x = clamp(player.x, 0, WORLD_W - player.w);
  player.y = clamp(player.y, 0, WORLD_H - player.h);

  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;

  const targetX = (player.x + player.w / 2) - vw / 2;
  const targetY = (player.y + player.h / 2) - vh / 2;

  camera.x = clamp(targetX, 0, WORLD_W - vw);
  camera.y = clamp(targetY, 0, WORLD_H - vh);

  playerEl.style.left = `${player.x}px`;
  playerEl.style.top = `${player.y}px`;
  world.style.transform = `translate(${-camera.x}px, ${-camera.y}px)`;

  if (hasMouse) {
    faceToMouseViewport();
    hudMX.textContent = Math.floor(mxView);
    hudMY.textContent = Math.floor(myView);

    playerEl.style.transformOrigin = "50% 50%";
    playerEl.style.transform = `rotate(${faceRad}rad)`;
  }

  fireCd = Math.max(0, fireCd - dt);

  updateBullets(dt);

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
