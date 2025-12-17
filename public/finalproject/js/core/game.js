import { RunState, saveRunState } from "../state.js";
import { clamp } from "../utils.js";

export class Game {
  constructor({ gameWindowEl, entityLayerEl, projectileLayerEl, hud }) {
    this.gameWindowEl = gameWindowEl;
    this.entityLayerEl = entityLayerEl;
    this.projectileLayerEl = projectileLayerEl;
    this.hud = hud;

    this.w = gameWindowEl.clientWidth;
    this.h = gameWindowEl.clientHeight;

    this.player = null;
    this.lastTs = 0;
    this.running = false;

    // simple “level completes after time” placeholder
    this.levelTimer = 0;
    this.levelDuration = 20; // seconds, placeholder
  }

  setPlayer(player) {
    this.player = player;
    this.entityLayerEl.appendChild(player.el);
  }

  start() {
    this.running = true;
    requestAnimationFrame((ts) => this.loop(ts));
  }

  loop(ts) {
    if (!this.running) return;
    const dt = Math.min(0.033, (ts - this.lastTs) / 1000 || 0);
    this.lastTs = ts;

    if (this.player) {
      this.player.update(dt);

      // keep player inside window
      this.player.x = clamp(this.player.x, 0, this.w - this.player.w);
      this.player.y = clamp(this.player.y, 0, this.h - this.player.h);
      this.player.render();
    }

    this.levelTimer += dt;
    if (this.levelTimer >= this.levelDuration) {
      // placeholder: “clear level” transition
      RunState.level = 2;
      saveRunState();
      this.postToNextLevel();
      return;
    }

    this.hud.hp.textContent = `HP: ${RunState.hp}/${RunState.maxHp}`;
    this.hud.score.textContent = `Score: ${RunState.score}`;

    requestAnimationFrame((t) => this.loop(t));
  }

  postToNextLevel() {
    const stateField = document.getElementById("stateField");
    stateField.value = JSON.stringify(RunState);
    document.getElementById("levelPost").submit();
  }
}
