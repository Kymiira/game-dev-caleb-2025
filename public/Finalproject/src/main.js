// main.js
(() => {
  const Utils = window.Utils;
  const Engine = window.Engine;
  const Input = window.Input;

  if (!Utils || !Engine || !Input) {
    console.error('[main.js] Missing prerequisites. Ensure the scripts are loaded in this order: utils.js, engine.js, input.js, ...main.js');
    return;
  }

  const { normalize, clamp } = Utils;

  let last = 0;
  let mouseDown = false;

  let prevKeys = new Set();
  function pressed(code) {
    return Input.keys.has(code) && !prevKeys.has(code);
  }

  const hudPX = document.getElementById('hudPlayerX');
  const hudPY = document.getElementById('hudPlayerY');
  const hudMX = document.getElementById('hudMouseX');
  const hudMY = document.getElementById('hudMouseY');
  const crosshair = document.getElementById('crosshair');

  const endOverlay = document.getElementById('endOverlay');
  const endReason = document.getElementById('endReason');
  const endTime = document.getElementById('endTime');
  const endKills = document.getElementById('endKills');
  const endCoins = document.getElementById('endCoins');
  const endThreat = document.getElementById('endThreat');
  const endPrimaryWeapon = document.getElementById('endPrimaryWeapon');
  const endSecondaryWeapon = document.getElementById('endSecondaryWeapon');
  const endPrimaryNodes = document.getElementById('endPrimaryNodes');
  const endSecondaryNodes = document.getElementById('endSecondaryNodes');
  const endRestartBtn = document.getElementById('endRestartBtn');
  const endMenuBtn = document.getElementById('endMenuBtn');

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
  }

  function showEndScreen(stats) {
    if (!endOverlay) return;
    mouseDown = false;

    const reasonText = (stats && stats.reason === 'death') ? 'You were defeated.' : 'Run ended.';
    if (endReason) endReason.textContent = reasonText;

    if (endTime) endTime.textContent = formatTime(stats && stats.timeAlive);
    if (endKills) endKills.textContent = String((stats && stats.kills) ?? 0);
    if (endCoins) endCoins.textContent = String((stats && stats.coins) ?? 0);
    if (endThreat) {
      const t = (stats && typeof stats.threat === 'number') ? stats.threat : 1;
      endThreat.textContent = t.toFixed(1);
    }


    function renderWeaponSummary(slot, weaponEl, nodesEl) {
      if (!weaponEl || !nodesEl) return;

      const w = (typeof Engine.getWeapon === 'function') ? Engine.getWeapon(slot) : null;
      const id = (w && w.id) ? String(w.id) : '';
      const def = (typeof Engine.getWeaponDefById === 'function') ? Engine.getWeaponDefById(id) : null;
      weaponEl.textContent = def && def.name ? def.name : (w && w.name ? w.name : (id || '—'));

      nodesEl.innerHTML = '';
      try {
        const st = (typeof Engine.ensureWeaponTreeState === 'function') ? Engine.ensureWeaponTreeState(id) : null;
        const unlockedIds = st && st.unlocked ? Object.keys(st.unlocked).filter((k) => st.unlocked[k]) : [];
        if (!unlockedIds.length) {
          nodesEl.textContent = 'No tech unlocked.';
          return;
        }

        const rows = unlockedIds
          .map((nid) => {
            const n = (typeof Engine.getWeaponTreeNode === 'function') ? Engine.getWeaponTreeNode(id, nid) : null;
            return {
              id: nid,
              tier: n ? (n.tier || 1) : 9,
              name: n ? (n.name || nid) : nid,
            };
          })
          .sort((a, b) => (a.tier - b.tier) || a.name.localeCompare(b.name));

        const ul = document.createElement('ul');
        for (const r of rows) {
          const li = document.createElement('li');
          li.textContent = `T${Math.max(1, Math.floor(r.tier || 1))}: ${r.name}`;
          ul.appendChild(li);
        }
        nodesEl.appendChild(ul);
      } catch {
        nodesEl.textContent = 'Tech summary unavailable.';
      }
    }

    renderWeaponSummary('primary', endPrimaryWeapon, endPrimaryNodes);
    renderWeaponSummary('secondary', endSecondaryWeapon, endSecondaryNodes);

    endOverlay.classList.remove('hidden');

    const openShopBtn = document.getElementById('openShopBtn');
    if (openShopBtn) openShopBtn.setAttribute('disabled', 'disabled');

    if (endRestartBtn) endRestartBtn.focus();
  }

  Engine.onGameOver = showEndScreen;

  if (endRestartBtn) endRestartBtn.addEventListener('click', () => window.location.reload());
  if (endMenuBtn) endMenuBtn.addEventListener('click', () => { window.location.href = '../index.html'; });

  window.addEventListener('keydown', (e) => {
    if (!Engine.gameOver) return;
    if (e.code === 'Enter') {
      e.preventDefault();
      window.location.reload();
    }
  });

  function loop(ts) {
    const dt = Math.min(0.033, (ts - last) / 1000 || 0);
    last = ts;

    if (!Engine.paused) {
      Engine.tickDifficulty(dt);

      const ax = (Input.keys.has('KeyD') ? 1 : 0) - (Input.keys.has('KeyA') ? 1 : 0);
      const ay = (Input.keys.has('KeyS') ? 1 : 0) - (Input.keys.has('KeyW') ? 1 : 0);
      const n = normalize(ax, ay);

      Engine.player.x = clamp(
        Engine.player.x + n.x * Engine.player.speed * dt,
        0,
        Engine.WORLD_W - Engine.player.w
      );
      Engine.player.y = clamp(
        Engine.player.y + n.y * Engine.player.speed * dt,
        0,
        Engine.WORLD_H - Engine.player.h
      );

      Engine.updateHostiles(dt);

      if (pressed('KeyR') && !Engine.isFiringHeld()) {
        Engine.requestReload();
      }

      if (!Engine.isFiringHeld()) {
        if (pressed('Digit1')) {
          Engine.requestSwapTo('primary', { isFiringHeld: Engine.isFiringHeld() });
        } else if (pressed('Digit2')) {
          Engine.requestSwapTo('secondary', { isFiringHeld: Engine.isFiringHeld() });
        } else if (pressed('KeyQ')) {
          const to = (Engine.activeWeaponSlot === 'primary') ? 'secondary' : 'primary';
          Engine.requestSwapTo(to, { isFiringHeld: Engine.isFiringHeld() });
        }
      }

      Engine.tickWeapons(dt);

      if (mouseDown) {
        Engine.tryFire();
      }

      Engine.updateBullets(dt);
      Engine.updateEnemyProjectiles(dt);
      Engine.checkCollisions(dt);
      Engine.tickRegen(dt);
    }

    const vw = Engine.viewport.clientWidth;
    const vh = Engine.viewport.clientHeight;
    const camX = clamp((Engine.player.x + Engine.player.w / 2) - vw / 2, 0, Engine.WORLD_W - vw);
    const camY = clamp((Engine.player.y + Engine.player.h / 2) - vh / 2, 0, Engine.WORLD_H - vh);
    Engine.setCamera(camX, camY);

    Engine.world.style.transform = `translate(${-camX}px, ${-camY}px)`;
    Engine.playerEl.style.left = `${Engine.player.x}px`;
    Engine.playerEl.style.top = `${Engine.player.y}px`;
    Engine.playerEl.style.transform = `rotate(${Engine.faceRad}rad)`;

    if (crosshair) {
      if (Input.hasMouse) {
        crosshair.classList.remove('hidden');
        crosshair.style.left = `${Input.mxView}px`;
        crosshair.style.top = `${Input.myView}px`;
      } else {
        crosshair.classList.add('hidden');
      }
    }

    if (hudPX) hudPX.innerText = `PLAYER X: ${Math.floor(Engine.player.x)}`;
    if (hudPY) hudPY.innerText = `PLAYER Y: ${Math.floor(Engine.player.y)}`;
    if (hudMX) hudMX.innerText = `MOUSE X: ${Math.floor(Input.mxView)}`;
    if (hudMY) hudMY.innerText = `MOUSE Y: ${Math.floor(Input.myView)}`;

    prevKeys = new Set(Input.keys);

    requestAnimationFrame(loop);
  }

  Engine.viewport.addEventListener('pointerdown', (e) => {
    if (Engine.paused || Engine.gameOver) return;
    if (e.button === 0) {
      mouseDown = true;
      if (typeof Engine.onTriggerDown === 'function') Engine.onTriggerDown();
      else Engine.tryFire();
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (e.button === 0) {
      mouseDown = false;
      if (typeof Engine.onTriggerUp === 'function') Engine.onTriggerUp();
    }
  });

  window.addEventListener('blur', () => {
    mouseDown = false;
  });

(function setupStartOverlay() {
  const startOverlay = document.getElementById('startOverlay');
  const primaryEl = document.getElementById('startPrimaryChoices');
  const secondaryEl = document.getElementById('startSecondaryChoices');
  const beginBtn = document.getElementById('startBeginBtn');
  const shopBtn = document.getElementById('openShopBtn');

  if (!startOverlay || !primaryEl || !secondaryEl || !beginBtn) return;

  Engine.ensureRunState();
  Engine.run.started = false;

  Engine.setPaused(true);
  if (shopBtn) shopBtn.disabled = true;

  let selectedPrimary = null;
  let selectedSecondary = null;

  const rolledChoices = (typeof Engine.rollStartWeaponChoices === 'function')
    ? Engine.rollStartWeaponChoices()
    : { primaries: ['pistol','smg'], secondaries: ['shotgun','sniper'] };

  function clearEl(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  function makeChoiceCard(weaponId, selected, onPick) {
    const def = (typeof Engine.getWeaponDefById === 'function') ? Engine.getWeaponDefById(weaponId) : null;
    const name = (def && def.name) ? def.name : weaponId;
    const desc = (def && def.desc) ? def.desc : '';
    const kind = (def && def.kind) ? def.kind : '';
    const cost = (def && typeof def.cost === 'number') ? def.cost : 0;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choiceCard' + (selected ? ' isSelected' : '');
    btn.setAttribute('data-weapon', weaponId);

    const n = document.createElement('div');
    n.className = 'choiceName';
    n.textContent = name;

    const d = document.createElement('div');
    d.className = 'choiceDesc';
    d.textContent = desc;

    const meta = document.createElement('div');
    meta.className = 'choiceMeta';
    meta.textContent = `Type: ${kind || 'weapon'} · Base cost: ${cost}`;

    btn.appendChild(n);
    if (desc) btn.appendChild(d);
    btn.appendChild(meta);

    btn.addEventListener('click', () => onPick(weaponId));
    return btn;
  }

  function renderChoices() {
    const roll = rolledChoices;

    clearEl(primaryEl);
    clearEl(secondaryEl);

    for (const id of roll.primaries || []) {
      primaryEl.appendChild(makeChoiceCard(id, selectedPrimary === id, (pick) => {
        selectedPrimary = pick;
        renderChoices();
        updateBegin();
      }));
    }

    for (const id of roll.secondaries || []) {
      secondaryEl.appendChild(makeChoiceCard(id, selectedSecondary === id, (pick) => {
        selectedSecondary = pick;
        renderChoices();
        updateBegin();
      }));
    }
  }

  function updateBegin() {
    beginBtn.disabled = !(selectedPrimary && selectedSecondary);
  }

  beginBtn.addEventListener('click', () => {
    if (!(selectedPrimary && selectedSecondary)) return;

    window.dispatchEvent(new Event('run:reset'));

    if (typeof Engine.startNewRun === 'function') {
      Engine.startNewRun(selectedPrimary, selectedSecondary);
    }

    Engine.setPaused(false);
    startOverlay.classList.add('hidden');
    if (shopBtn) shopBtn.disabled = false;
  });

  renderChoices();
  updateBegin();
})();

  requestAnimationFrame(loop);
})();
