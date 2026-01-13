// input.js
(() => {
  const Engine = window.Engine;
  if (!Engine || !Engine.viewport) {
    console.error('[input.js] window.Engine (or Engine.viewport) not found. Ensure engine.js is loaded before input.js.');
    return;
  }

  const Input = (window.Input = window.Input || {});
  Input.keys = Input.keys || new Set();
  Input.mxView = 0;
  Input.myView = 0;
  Input.hasMouse = false;

  window.addEventListener('keydown', (e) => Input.keys.add(e.code));
  window.addEventListener('keyup', (e) => Input.keys.delete(e.code));

  Engine.viewport.addEventListener('pointermove', (e) => {
    const r = Engine.viewport.getBoundingClientRect();
    Input.mxView = e.clientX - r.left;
    Input.myView = e.clientY - r.top;
    Input.hasMouse = true;

    const px = (Engine.player.x - Engine.camX) + (Engine.player.w / 2);
    const py = (Engine.player.y - Engine.camY) + (Engine.player.h / 2);

    Engine.setFaceRad(Math.atan2(Input.myView - py, Input.mxView - px));
  });
})();
