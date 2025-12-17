import { loadRunState, RunState } from "./state.js";
import { Input } from "./input.js";
import { Game } from "./core/game.js";
import { normalize } from "./utils.js";

loadRunState();

const gameWindowEl = document.getElementById("gameWindow");
const entityLayerEl = document.getElementById("entityLayer");
const projectileLayerEl = document.getElementById("projectileLayer");

const hud = {
  hp: document.getElementById("hudHp"),
  score: document.getElementById("hudScore")
};

const input = new Input(gameWindowEl);

// Minimal DOM “player”
const player = {
  el: document.createElement("div"),
  x: 460,
  y: 250,
  w: 32,
  h: 32,
  speed: 240,
  input,
  aim: { x: 0, y: 0 },

  update(dt) {
    // movement
    const a = this.input.axis();
    const n = normalize(a.x, a.y);
    this.x += n.x * this.speed * dt;
    this.y += n.y * this.speed * dt;

    // aim direction (for later shooting)
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const dx = this.input.mouse.x - cx;
    const dy = this.input.mouse.y - cy;
    this.aim = normalize(dx, dy);

    // rotate to face aim (purely visual)
    const ang = Math.atan2(this.aim.y, this.aim.x);
    this.el.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${ang}rad)`;
  },

  render() {
    // transform already applied in update
  }
};

player.el.id = "player";
player.el.style.width = `${player.w}px`;
player.el.style.height = `${player.h}px`;

const game = new Game({ gameWindowEl, entityLayerEl, projectileLayerEl, hud });
game.setPlayer(player);

document.title = `Level ${RunState.level}`;
game.start();
