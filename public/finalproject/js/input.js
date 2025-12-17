export class Input {
  constructor(gameWindowEl) {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, down: false };

    window.addEventListener("keydown", (e) => this.keys.add(e.code));
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));

    gameWindowEl.addEventListener("mousemove", (e) => {
      const r = gameWindowEl.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
    });

    gameWindowEl.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.mouse.down = true;
    });
    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.mouse.down = false;
    });
  }

  axis() {
    const left  = this.keys.has("KeyA") || this.keys.has("ArrowLeft");
    const right = this.keys.has("KeyD") || this.keys.has("ArrowRight");
    const up    = this.keys.has("KeyW") || this.keys.has("ArrowUp");
    const down  = this.keys.has("KeyS") || this.keys.has("ArrowDown");

    return {
      x: (right ? 1 : 0) - (left ? 1 : 0),
      y: (down ? 1 : 0) - (up ? 1 : 0)
    };
  }
}
