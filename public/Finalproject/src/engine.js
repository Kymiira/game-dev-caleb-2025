// engine.js
(() => {
  const Utils = window.Utils;
  if (!Utils) {
    console.error('[engine.js] window.Utils not found. Ensure utils.js is loaded before engine.js.');
    return;
  }

  const { clamp, normalize, getRandomMath } = Utils;

  const Engine = (window.Engine = window.Engine || {});

  Engine.viewport = document.getElementById('viewport');
  Engine.world = document.getElementById('world');
  Engine.playerEl = document.getElementById('player');
  Engine.statusMessage = document.getElementById('statusMessage');
  Engine.healthBar = document.getElementById('healthBar');
  Engine.hudCoins = document.getElementById('hudCoins');
  Engine._hudThreat = document.getElementById('hudThreat');
  Engine._hudKills = document.getElementById('hudKills');
  Engine.hudPrimaryWeapon = document.getElementById('hudPrimaryWeapon');
  Engine.hudSecondaryWeapon = document.getElementById('hudSecondaryWeapon');

  Engine.applySprite = function (el, key) {
    try {
      if (window.Sprites && typeof window.Sprites.apply === 'function') window.Sprites.apply(el, key);
    } catch {}
  };
  Engine.applySprite(Engine.playerEl, 'player');

  Engine.WORLD_W = 3000;
  Engine.WORLD_H = 3000;

  Engine.BASE = {
    playerSpeed: 235,
    maxHealth: 80,
    invincibilitySeconds: 0.40,
  };

  Engine.WEAPON_BASE = {
    damage: 1.0,
    fireCooldown: 0.18,
    bulletSpeed: 820,
    bulletTTL: 1.15,

    multishot: 1,
    spread: 0.035,

    pierce: 0,
    bounce: 0,
    homing: 0,

    critChance: 0.05,
    critMult: 1.8,

    explosiveChance: 0,
    explosiveRadius: 95,

    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,

    slowChance: 0,
    slowPercent: 0,
    slowDuration: 0,

    knockback: 0,
  };

  Engine.ENEMY_BASE = {
    health: 2.8,
    speed: 118,
    size: 28,
    contactDamage: 8,
  };

  Engine.player = {
    x: 1500,
    y: 1500,
    w: 32,
    h: 32,
    speed: Engine.BASE.playerSpeed,
    health: Engine.BASE.maxHealth,
  };

  Engine.camX = 0;
  Engine.camY = 0;
  Engine.setCamera = function (x, y) {
    Engine.camX = x;
    Engine.camY = y;
  };

  Engine.faceRad = 0;
  Engine.setFaceRad = function (val) {
    Engine.faceRad = val;
  };

  Engine.paused = false;
  Engine.setPaused = function (val) {
    Engine.paused = !!val;
  };

  Engine.gameOver = false;
  Engine.onGameOver = null;

  Engine.endRun = function (reason) {
    if (Engine.gameOver) return;

    Engine.gameOver = true;
    Engine.hostileSpawning = false;
    Engine.setPaused(true);
    Engine.setStatusMessage('');

    const stats = {
      reason: reason || 'death',
      timeAlive: Engine.timeAlive || 0,
      kills: Engine.kills || 0,
      coins: Engine.coins || 0,
      threat: Engine.difficulty || 1,
    };

    try {
      if (typeof Engine.onGameOver === 'function') Engine.onGameOver(stats);
    } catch (e) {
      console.error('[engine.js] Engine.onGameOver callback failed:', e);
    }
  };

  Engine.setStatusMessage = function (text) {
    if (!Engine.statusMessage) return;
    const msg = String(text ?? '').trim();
    Engine.statusMessage.textContent = msg;
    Engine.statusMessage.style.display = msg ? 'block' : 'none';
  };

  Engine.bullets = [];
  Engine.enemyProjectiles = [];
  Engine.hostiles = [];

  Engine.kills = 0;
  Engine.timeAlive = 0;
  Engine.difficulty = 1;

  Engine.run = Engine.run || null;

  Engine.ensureRunState = function () {
    if (Engine.run) return Engine.run;

    Engine.run = {
      version: 'gen1.9',

      started: false,

      ownedWeapons: {},
      weaponTrees: {},

      refitTokens: 0,
      resetTokens: 0,
      nextRefitAt: 25,
      nextResetAt: 100,
    };

    Engine.run.started = false;

    try {
      const WC = window.WeaponCatalog;
      if (WC && Array.isArray(WC.weapons)) {
        for (const w of WC.weapons) {
          if (!w || !w.id) continue;
          if (!Engine.run.weaponTrees[w.id]) {
            Engine.run.weaponTrees[w.id] = { unlocked: {}, spentCoins: 0 };
          }
        }
      }
    } catch (e) {
    }

    return Engine.run;
  };

  Engine.getRefitTokens = function () {
    Engine.ensureRunState();
    return Engine.run.refitTokens;
  };

  Engine.getResetTokens = function () {
    Engine.ensureRunState();
    return Engine.run.resetTokens;
  };

  Engine.ensureWeaponTreeState = function (weaponId) {
    Engine.ensureRunState();
    const id = String(weaponId || '').trim();
    if (!id) return null;
    if (!Engine.run.weaponTrees[id]) Engine.run.weaponTrees[id] = { unlocked: {}, spentCoins: 0 };
    return Engine.run.weaponTrees[id];
  };

Engine.isRunStarted = function () {
  const run = Engine.ensureRunState();
  return !!run.started;
};

Engine.listWeaponDefs = function () {
  try {
    const WC = window.WeaponCatalog;
    if (WC && Array.isArray(WC.weapons)) return WC.weapons.slice();
  } catch (e) {}
  return [];
};

Engine.getWeaponDefById = function (weaponId) {
  const id = String(weaponId || '').trim();
  if (!id) return null;
  try {
    const def = getWeaponDef(id);
    if (def) return def;
  } catch (e) {}
  const defs = Engine.listWeaponDefs();
  return defs.find((w) => w.id === id) || null;
};

Engine.isWeaponOwned = function (weaponId) {
  const run = Engine.ensureRunState();
  return !!run.ownedWeapons[String(weaponId || '').trim()];
};

Engine.setWeaponOwned = function (weaponId, owned) {
  const run = Engine.ensureRunState();
  const id = String(weaponId || '').trim();
  if (!id) return;
  if (owned) run.ownedWeapons[id] = true;
  else delete run.ownedWeapons[id];
};

Engine.getOwnedWeaponIds = function () {
  const run = Engine.ensureRunState();
  return Object.keys(run.ownedWeapons || {});
};

Engine.buyWeaponBase = function (weaponId) {
  const id = String(weaponId || '').trim();
  if (!id) return { ok: false, reason: 'invalid' };
  if (Engine.isWeaponOwned(id)) return { ok: true, alreadyOwned: true };

  const def = Engine.getWeaponDefById(id);
  if (!def) return { ok: false, reason: 'missing_def' };

  const cost = Math.max(0, Math.floor(def.cost || 0));
  if (Engine.coins < cost) return { ok: false, reason: 'coins' };

  Engine.setCoins(Engine.coins - cost);
  Engine.setWeaponOwned(id, true);
  Engine.ensureWeaponTreeState(id);

  return { ok: true };
};

function sampleDistinctIds(ids, n) {
  const pool = ids.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
  }
  return pool.slice(0, Math.max(0, n));
}

Engine.rollStartWeaponChoices = function () {
  const defs = Engine.listWeaponDefs();
  const ids = defs.map((d) => d.id).filter(Boolean);
  const pick = sampleDistinctIds(ids, Math.min(4, ids.length));
  while (pick.length < 4 && ids.length > 0) pick.push(ids[Math.floor(Math.random() * ids.length)]);

  return {
    primaries: pick.slice(0, 2),
    secondaries: pick.slice(2, 4),
  };
};

function clearWorldEntities() {
  if (!Engine.world) return;
  const kids = Array.from(Engine.world.children);
  for (const k of kids) {
    if (k && k.id === 'player') continue;
    try { k.remove(); } catch (e) {}
  }
  for (const arrName of ['bullets', 'enemyProjectiles', 'hostiles']) {
    const arr = Engine[arrName];
    if (!Array.isArray(arr)) continue;
    for (const ent of arr) {
      if (ent && ent.el && ent.el.remove) {
        try { ent.el.remove(); } catch (e) {}
      }
    }
    Engine[arrName] = [];
  }
}

Engine.resetRunState = function () {
  Engine.kills = 0;
  Engine.timeAlive = 0;
  Engine.difficulty = 1;

  Engine.player.x = 1500;
  Engine.player.y = 1500;
  Engine.playerInvincibility = 0;
  Engine.setHealthToFull();

  Engine.setCoins(0);

  clearWorldEntities();

  Engine.swapState = null;
  for (const slot of ['primary', 'secondary']) {
    const w = Engine.getWeapon(slot);
    if (!w) continue;
    w.cooldown = 0;
    w.reloadRemaining = 0;
    w.charging = false;
    w.charge = 0;
    w.burstRemaining = 0;
    w.burstTimer = 0;
  }

  Engine._globalWeaponMods = {};

  Engine.renderThreatKills();
  Engine.renderWeaponsHud();
};

Engine.startNewRun = function (primaryId, secondaryId) {
  const run = Engine.ensureRunState();

  run.started = true;
  run.ownedWeapons = {};
  run.weaponTrees = {};
  run.refitTokens = 0;
  run.resetTokens = 0;
  run.nextRefitAt = 25;
  run.nextResetAt = 100;

  try {
    const WC = window.WeaponCatalog;
    if (WC && Array.isArray(WC.weapons)) {
      for (const w of WC.weapons) {
        if (!w || !w.id) continue;
        if (!run.weaponTrees[w.id]) run.weaponTrees[w.id] = { unlocked: {}, spentCoins: 0 };
      }
    }
  } catch (e) {}

  Engine.resetRunState();

  const pId = String(primaryId || '').trim();
  const sId = String(secondaryId || '').trim();
  if (pId) run.ownedWeapons[pId] = true;
  if (sId) run.ownedWeapons[sId] = true;

  if (pId) Engine.weaponSlots.primary = makeWeaponInstance(getWeaponDef(pId), pId);
  if (sId) Engine.weaponSlots.secondary = makeWeaponInstance(getWeaponDef(sId), sId);
  Engine.activeWeaponSlot = 'primary';

  Engine.recomputeWeapons();
  Engine.renderWeaponsHud();
  Engine.renderThreatKills();
};

Engine.getWeaponTreeDef = function (weaponId) {
  const id = String(weaponId || '').trim();
  if (!id) return null;
  try {
    const WT = window.WeaponTrees;
    if (WT && typeof WT.getTree === 'function') return WT.getTree(id);
  } catch (e) {}
  return null;
};

Engine.getWeaponTreeNode = function (weaponId, nodeId) {
  const id = String(weaponId || '').trim();
  const nid = String(nodeId || '').trim();
  if (!id || !nid) return null;
  try {
    const WT = window.WeaponTrees;
    if (WT && typeof WT.getNode === 'function') return WT.getNode(id, nid);
  } catch (e) {}
  const t = Engine.getWeaponTreeDef(id);
  if (!t) return null;
  return (t.nodes || []).find((n) => n.id === nid) || null;
};

Engine.isWeaponNodeUnlocked = function (weaponId, nodeId) {
  const st = Engine.ensureWeaponTreeState(weaponId);
  return !!(st && st.unlocked && st.unlocked[String(nodeId || '').trim()]);
};

function mergeModsInto(dst, src) {
  const out = dst || {};
  if (!src) return out;
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (typeof v !== 'number' || !isFinite(v)) continue;

    if (k.endsWith('Mul')) out[k] = (out[k] || 1) * v;
    else out[k] = (out[k] || 0) + v;
  }
  return out;
}

Engine.getWeaponTreeMods = function (weaponId) {
  const id = String(weaponId || '').trim();
  if (!id) return {};
  const st = Engine.ensureWeaponTreeState(id);
  const t = Engine.getWeaponTreeDef(id);
  if (!st || !t) return {};
  const out = {};
  const nodes = t.nodes || [];
  for (const n of nodes) {
    if (!n || !n.id) continue;
    if (!st.unlocked[n.id]) continue;
    mergeModsInto(out, n.mods || {});
  }
  return out;
};

Engine.getWeaponCombinedMods = function (weaponId) {
  const out = {};
  mergeModsInto(out, Engine._globalWeaponMods || {});
  mergeModsInto(out, Engine.getWeaponTreeMods(weaponId));
  return out;
};

Engine.canUnlockWeaponNode = function (weaponId, nodeId) {
  const id = String(weaponId || '').trim();
  const nid = String(nodeId || '').trim();
  if (!id || !nid) return { ok: false, reason: 'invalid' };
  if (!Engine.isWeaponOwned(id)) return { ok: false, reason: 'not_owned' };

  const t = Engine.getWeaponTreeDef(id);
  const node = Engine.getWeaponTreeNode(id, nid);
  if (!t || !node) return { ok: false, reason: 'missing_node' };

  const st = Engine.ensureWeaponTreeState(id);
  if (st.unlocked[nid]) return { ok: false, reason: 'unlocked' };

  const cost = Math.max(0, Math.floor(node.cost || 0));
  if (Engine.coins < cost) return { ok: false, reason: 'coins' };

  const req = node.requires || [];
  for (const r of req) if (!st.unlocked[r]) return { ok: false, reason: 'requires' };

  const reqAny = node.requiresAny || [];
  if (reqAny.length > 0) {
    let okAny = false;
    for (const r of reqAny) if (st.unlocked[r]) { okAny = true; break; }
    if (!okAny) return { ok: false, reason: 'requiresAny' };
  }

  if (node.branchGroup) {
    const bg = node.branchGroup;
    const nodes = t.nodes || [];
    for (const n of nodes) {
      if (!n || !n.id) continue;
      if (n.id === nid) continue;
      if (n.branchGroup === bg && st.unlocked[n.id]) return { ok: false, reason: 'branch_locked' };
    }
  }

  const exc = node.excludes || [];
  for (const ex of exc) if (st.unlocked[ex]) return { ok: false, reason: 'excluded' };

  return { ok: true };
};

Engine.unlockWeaponNode = function (weaponId, nodeId) {
  const id = String(weaponId || '').trim();
  const nid = String(nodeId || '').trim();
  const can = Engine.canUnlockWeaponNode(id, nid);
  if (!can.ok) return can;

  const node = Engine.getWeaponTreeNode(id, nid);
  const cost = Math.max(0, Math.floor(node.cost || 0));

  Engine.setCoins(Engine.coins - cost);
  const st = Engine.ensureWeaponTreeState(id);
  st.unlocked[nid] = true;
  st.spentCoins = (st.spentCoins || 0) + cost;

  Engine.recomputeWeapons();
  return { ok: true };
};

Engine.resetWeaponTree = function (weaponId) {
  const run = Engine.ensureRunState();
  const id = String(weaponId || '').trim();
  if (!id) return { ok: false, reason: 'invalid' };
  if (!Engine.isWeaponOwned(id)) return { ok: false, reason: 'not_owned' };
  if ((run.resetTokens || 0) <= 0) return { ok: false, reason: 'no_token' };

  const st = Engine.ensureWeaponTreeState(id);
  const refund = Math.max(0, Math.floor(st.spentCoins || 0));

  run.resetTokens -= 1;
  st.unlocked = {};
  st.spentCoins = 0;

  Engine.setCoins(Engine.coins + refund);
  Engine.recomputeWeapons();

  return { ok: true, refund };
};

Engine.refitWeaponSlot = function (slot, weaponId, opts) {
  const run = Engine.ensureRunState();
  const s = (slot === 'secondary') ? 'secondary' : 'primary';
  const id = String(weaponId || '').trim();
  const o = opts || {};

  if (!id) return { ok: false, reason: 'invalid' };
  if (!run.started) return { ok: false, reason: 'not_started' };

  if (!o.free && Engine.isFiringHeld && Engine.isFiringHeld()) return { ok: false, reason: 'firing' };

  if (!o.free && (run.refitTokens || 0) <= 0) return { ok: false, reason: 'no_token' };

  if (!Engine.isWeaponOwned(id)) {
    if (o.autoBuy) {
      const buy = Engine.buyWeaponBase(id);
      if (!buy.ok) return { ok: false, reason: buy.reason || 'buy_failed' };
    } else {
      return { ok: false, reason: 'not_owned' };
    }
  }

  const current = Engine.getWeapon(s);
  if (current && current.id === id) return { ok: false, reason: 'same' };

  if (!o.free) run.refitTokens -= 1;

  Engine.cancelWeaponActions && Engine.cancelWeaponActions(s);
  Engine.weaponSlots[s] = makeWeaponInstance(getWeaponDef(id), id);

  Engine.recomputeWeapons();
  Engine.renderWeaponsHud();
  return { ok: true };
};


  Engine.playerInvincibility = 0;

  Engine.MAX_HEALTH = Engine.BASE.maxHealth;
  Engine.INVINCIBILITY_TIME = Engine.BASE.invincibilitySeconds;
  Engine.damageReduction = 0;
  Engine.coinMult = 1;
  Engine.regenPerSecond = 0;
  Engine._regenCarry = 0;

  Engine.weaponSlots = Engine.weaponSlots || {};
  Engine.activeWeaponSlot = Engine.activeWeaponSlot || 'primary';
  Engine.swapState = Engine.swapState || { remaining: 0, target: null };

  function getWeaponDef(id) {
    const WC = window.WeaponCatalog;
    if (WC && Array.isArray(WC.weapons)) {
      const def = WC.weapons.find((w) => w.id === id);
      if (def) return def;
    }
    return null;
  }

  function makeWeaponInstance(def, fallbackId) {
    const d = def || getWeaponDef(fallbackId);
    const base = Object.assign({}, Engine.WEAPON_BASE, (d && d.stats) ? d.stats : {});
    const magSize = (d && typeof d.magSize === 'number') ? d.magSize : (fallbackId === 'shotgun' ? 6 : 14);

    return {
      id: (d && d.id) ? d.id : (fallbackId || 'pistol'),
      name: (d && d.name) ? d.name : (fallbackId === 'shotgun' ? 'Scrap Shotgun' : 'Pulse Pistol'),

      kind: (d && d.kind) ? d.kind : 'bullet',
      props: Object.assign({}, (d && d.props) ? d.props : {}),

      base,
      stats: Object.assign({}, base),

      magSize: Math.max(1, Math.floor(magSize)),
      ammo: Math.max(1, Math.floor(magSize)),
      cooldown: 0,

      reloadSeconds: (d && typeof d.reloadSeconds === 'number') ? d.reloadSeconds : (fallbackId === 'shotgun' ? 1.55 : 1.15),
      reloadRemaining: 0,

      swapOutSeconds: (d && typeof d.swapOutSeconds === 'number') ? d.swapOutSeconds : (fallbackId === 'shotgun' ? 0.35 : 0.22),
      swapInSeconds: (d && typeof d.swapInSeconds === 'number') ? d.swapInSeconds : (fallbackId === 'shotgun' ? 0.28 : 0.18),

      burstRemaining: 0,
      burstTimer: 0,

      charging: false,
      chargeTime: 0,

      boomerangOut: false,
    };
  }

  function ensureWeaponsInitialized() {
    if (!Engine.weaponSlots.primary) {
      Engine.weaponSlots.primary = makeWeaponInstance(getWeaponDef('pistol'), 'pistol');
    }
    if (!Engine.weaponSlots.secondary) {
      Engine.weaponSlots.secondary = makeWeaponInstance(getWeaponDef('shotgun'), 'shotgun');
    }
    if (Engine.activeWeaponSlot !== 'primary' && Engine.activeWeaponSlot !== 'secondary') {
      Engine.activeWeaponSlot = 'primary';
    }
  }

  Engine.getWeapon = function (slot) {
    ensureWeaponsInitialized();
    return Engine.weaponSlots[slot];
  };

  Engine.getActiveWeapon = function () {
    return Engine.getWeapon(Engine.activeWeaponSlot);
  };

  Engine._globalWeaponMods = Engine._globalWeaponMods || {};

  Engine._triggerHeld = false;
  Engine.setTriggerHeld = function (val) {
    Engine._triggerHeld = !!val;
  };

  Engine.isFiringHeld = function () {
    const w = Engine.getActiveWeapon();
    return !!Engine._triggerHeld || !!(w && w.charging) || !!(w && (w.burstRemaining || 0) > 0);
  };

  Engine.onTriggerDown = function () {
    Engine.setTriggerHeld(true);
    const w = Engine.getActiveWeapon();
    if (w && w.kind === 'charge') {
      Engine.startCharge();
      return;
    }
    Engine.tryFire();
  };

  Engine.onTriggerUp = function () {
    Engine.setTriggerHeld(false);
    const w = Engine.getActiveWeapon();
    if (w && w.kind === 'charge') {
      Engine.releaseCharge();
    }
  };
ensureWeaponsInitialized();

  Engine.coins = 0;

  Engine.renderCoins = function () {
    if (Engine.hudCoins) Engine.hudCoins.textContent = `Coins: ${Engine.coins}`;
  };

  Engine.setCoins = function (val) {
    Engine.coins = Math.max(0, Math.floor(val));
    Engine.renderCoins();
  };

  Engine.updateCoins = function (amount) {
    Engine.setCoins(Engine.coins + (Number(amount) || 0));
  };

  Engine.spendCoins = function (cost) {
    const c = Math.max(0, Math.floor(cost));
    if (Engine.coins < c) return false;
    Engine.setCoins(Engine.coins - c);
    return true;
  };

  Engine.tickDifficulty = function (dt) {
    Engine.timeAlive += dt;

    const t = Engine.timeAlive / 42;
    const k = Engine.kills / 26;
    Engine.difficulty = Math.max(1, 1 + t + k);

    const run = Engine.ensureRunState();
    while (Engine.difficulty + 1e-9 >= run.nextRefitAt) {
      run.refitTokens += 1;
      run.nextRefitAt += 25;
    }
    while (Engine.difficulty + 1e-9 >= run.nextResetAt) {
      run.resetTokens += 1;
      run.nextResetAt += 100;
    }

    Engine._threatHudT = (Engine._threatHudT || 0) - dt;
    if (Engine._threatHudT <= 0) {
      Engine._threatHudT = 0.25;
      Engine.renderThreatKills();
    }
  };

  Engine.getDifficulty = function () { return Engine.difficulty; };

  Engine.renderThreatKills = function () {
    if (Engine._hudThreat) {
      const run = Engine.ensureRunState();
      Engine._hudThreat.textContent = `Threat: ${Engine.difficulty.toFixed(1)} · Refit: ${run.refitTokens} · Reset: ${run.resetTokens}`;
    }
    if (Engine._hudKills) Engine._hudKills.textContent = `Kills: ${Engine.kills}`;
  };

  Engine.updatePlayerHealth = function (amount) {
    Engine.player.health = Math.min(Engine.MAX_HEALTH, Math.max(0, Engine.player.health + amount));
    const pct = Engine.MAX_HEALTH > 0 ? (Engine.player.health / Engine.MAX_HEALTH) * 100 : 0;

    if (Engine.healthBar) {
      Engine.healthBar.style.width = `${pct}%`;
      Engine.healthBar.style.background = '#00ff00';
      if (pct < 30) Engine.healthBar.style.background = '#ff0000';
      else if (pct < 60) Engine.healthBar.style.background = '#ffff00';
    }
  };

  Engine.setHealthToFull = function () {
    Engine.player.health = Engine.MAX_HEALTH;
    Engine.updatePlayerHealth(0);
  };

  Engine.tryDamagePlayer = function (absDamage) {
    const abs = Math.max(0, Number(absDamage) || 0);
    if (abs <= 0) return;
    if (Engine.playerInvincibility > 0) return;
    if (Engine.gameOver) return;

    Engine.playerInvincibility = Engine.INVINCIBILITY_TIME;

    const reduced = Math.max(1, Math.round(abs * (1 - clamp(Engine.damageReduction, 0, 0.65))));
    Engine.updatePlayerHealth(-reduced);

    if (Engine.playerEl) {
      Engine.playerEl.style.filter = 'brightness(3)';
      setTimeout(() => {
        if (Engine.playerEl) Engine.playerEl.style.filter = 'none';
      }, 90);
    }

    if (Engine.player.health <= 0) {
      Engine.endRun('death');
    }
  };

  Engine.tickRegen = function (dt) {
    if (Engine.regenPerSecond <= 0 || Engine.player.health <= 0) return;
    Engine._regenCarry += Engine.regenPerSecond * dt;
    if (Engine._regenCarry >= 1) {
      const whole = Math.floor(Engine._regenCarry);
      Engine._regenCarry -= whole;
      Engine.updatePlayerHealth(whole);
    }
  };

  Engine.getContactDamageAbs = function (hostile) {
    const d = Engine.getDifficulty();
    const base = Engine.ENEMY_BASE.contactDamage;
    const mult = hostile && hostile.contactDamageMult ? hostile.contactDamageMult : 1;
    return clamp(Math.round((base + d * 0.35) * mult), 6, 18);
  };

  function applyCosmetics(cos) {
    if (!cos) return;

    const skinValueToClass = {
      neon: 'skin-neon',
      crimson: 'skin-crimson',
      azure: 'skin-azure',
      gold: 'skin-gold',
      void: 'skin-void',
      lime: 'skin-lime',
      rose: 'skin-pink',
      ice: 'skin-frost',
      ember: 'skin-sunset',
      mono: 'skin-slate',
      default: '',
    };

    const playerSkinClass = cos.playerSkinClass || (cos.playerSkin ? (skinValueToClass[cos.playerSkin] || `skin-${cos.playerSkin}`) : '');
    const crosshairClass = cos.crosshairClass || (cos.crosshair ? `crosshair--${cos.crosshair}` : '');
    const bulletSkinClass = cos.bulletSkinClass || (cos.bulletSkin ? `bullet--${cos.bulletSkin}` : '');
    const trailClass = cos.trailClass || (cos.trail && cos.trail !== 'none' ? `bullet--trail-${cos.trail}` : '');

    if (Engine.playerEl) {
      for (const cl of Array.from(Engine.playerEl.classList)) {
        if (cl.startsWith('skin-')) Engine.playerEl.classList.remove(cl);
      }
      if (playerSkinClass) Engine.playerEl.classList.add(playerSkinClass);
    }

    const crosshair = document.getElementById('crosshair');
    if (crosshair) {
      for (const cl of Array.from(crosshair.classList)) {
        if (cl.startsWith('crosshair--')) crosshair.classList.remove(cl);
      }
      if (crosshairClass) crosshair.classList.add(crosshairClass);
    }

    Engine._bulletSkinClass = bulletSkinClass || '';
    Engine._trailClass = trailClass || '';
  }

  function computeWeaponStats(base, mods) {
    const m = mods || {};
    const dmgMult = clamp(
      (1 + (m.damageMultAdd || 0)) * (m.damageMultMul || 1),
      0.1,
      50
    );
    const dmgAdd = m.damageAdd || 0;

    const fireMul = clamp(
      (m.fireCooldownMul || 1) * (1 - (m.fireCooldownReduction || 0)),
      0.20,
      1.50
    );

    const spdMult = clamp(
      (1 + (m.bulletSpeedMultAdd || 0)) * (m.bulletSpeedMul || 1),
      0.3,
      6
    );

    const out = Object.assign({}, base);

    out.damage = clamp(base.damage * dmgMult + dmgAdd, 0.25, 1000);
    out.fireCooldown = clamp(base.fireCooldown * fireMul, 0.03, 0.80);
    out.bulletSpeed = clamp(base.bulletSpeed * spdMult, 350, 2400);
    out.bulletTTL = clamp(base.bulletTTL + (m.bulletTTLAdd || 0), 0.35, 4.0);

    out.multishot = clamp(base.multishot + (m.multishotAdd || 0), 1, 15);
    out.spread = clamp(base.spread + (m.spreadAdd || 0), 0, 0.65);

    out.pierce = clamp(base.pierce + (m.pierceAdd || 0), 0, 50);
    out.bounce = clamp(base.bounce + (m.bounceAdd || 0), 0, 20);
    out.homing = clamp(base.homing + (m.homingAdd || 0), 0, 1.0);

    out.critChance = clamp(base.critChance + (m.critChanceAdd || 0), 0, 0.65);
    out.critMult = clamp(base.critMult + (m.critMultAdd || 0), 1.1, 6.0);

    out.explosiveChance = clamp(base.explosiveChance + (m.explosiveChanceAdd || 0), 0, 0.90);
    out.explosiveRadius = clamp(base.explosiveRadius + (m.explosiveRadiusAdd || 0), 30, 520);

    out.burnDps = clamp(base.burnDps + (m.burnDpsAdd || 0), 0, 999);
    out.burnDuration = clamp(base.burnDuration + (m.burnDurationAdd || 0), 0, 20);

    out.poisonDps = clamp(base.poisonDps + (m.poisonDpsAdd || 0), 0, 999);
    out.poisonDuration = clamp(base.poisonDuration + (m.poisonDurationAdd || 0), 0, 20);

    out.slowChance = clamp(base.slowChance + (m.slowChanceAdd || 0), 0, 0.95);
    out.slowPercent = clamp(base.slowPercent + (m.slowPercentAdd || 0), 0, 0.90);
    out.slowDuration = clamp(base.slowDuration + (m.slowDurationAdd || 0), 0, 15);

    out.knockback = clamp(base.knockback + (m.knockbackAdd || 0), 0, 2200);

    return out;
  }

  Engine.recomputeWeapons = function () {

const p = Engine.getWeapon('primary');
const s = Engine.getWeapon('secondary');

for (const w of [p, s]) {
  const def = getWeaponDef(w.id);
  if (!def) continue;

  w.kind = def.kind || w.kind || 'bullet';
  w.props = Object.assign({}, def.props || {});
  w.base = Object.assign({}, Engine.WEAPON_BASE, def.stats || {});

  const mods = Engine.getWeaponCombinedMods ? Engine.getWeaponCombinedMods(w.id) : (Engine._globalWeaponMods || {});
  w.stats = computeWeaponStats(w.base, mods);

  if (w.props && mods) {
    if (typeof mods.burstCountAdd === 'number') w.props.burstCount = Math.max(1, (w.props.burstCount || 3) + mods.burstCountAdd);
    if (typeof mods.burstIntervalMul === 'number') w.props.burstInterval = Math.max(0.02, (w.props.burstInterval || 0.06) * mods.burstIntervalMul);

    if (typeof mods.beamRangeMul === 'number') w.props.beamRange = Math.max(120, (w.props.beamRange || 420) * mods.beamRangeMul);
    if (typeof mods.beamWidthMul === 'number') w.props.beamWidth = Math.max(1, (w.props.beamWidth || 2) * mods.beamWidthMul);
    if (typeof mods.beamTickMul === 'number') w.props.beamTick = Math.max(0.02, (w.props.beamTick || 0.05) * mods.beamTickMul);

    if (typeof mods.flameRangeMul === 'number') w.props.flameRange = Math.max(80, (w.props.flameRange || 220) * mods.flameRangeMul);
    if (typeof mods.flameConeMul === 'number') w.props.flameCone = Math.max(0.10, (w.props.flameCone || 0.38) * mods.flameConeMul);
    if (typeof mods.flameTickMul === 'number') w.props.flameTick = Math.max(0.02, (w.props.flameTick || 0.06) * mods.flameTickMul);

    if (typeof mods.chainCountAdd === 'number') w.props.chainCount = Math.max(1, (w.props.chainCount || 3) + mods.chainCountAdd);
    if (typeof mods.chainRangeMul === 'number') w.props.chainRange = Math.max(80, (w.props.chainRange || 160) * mods.chainRangeMul);

    if (typeof mods.chargeSecondsMul === 'number') w.props.chargeSeconds = Math.max(0.08, (w.props.chargeSeconds || 0.75) * mods.chargeSecondsMul);
    if (typeof mods.railWidthMul === 'number') w.props.railWidth = Math.max(1, (w.props.railWidth || 6) * mods.railWidthMul);
    if (typeof mods.railRangeMul === 'number') w.props.railRange = Math.max(240, (w.props.railRange || 650) * mods.railRangeMul);

    if (typeof mods.explodeRadiusAdd === 'number') w.props.explodeRadius = Math.max(10, (w.props.explodeRadius || 110) + mods.explodeRadiusAdd);
    if (typeof mods.explodeRadiusMul === 'number') w.props.explodeRadius = Math.max(10, (w.props.explodeRadius || 110) * mods.explodeRadiusMul);
    if (typeof mods.explodeDamageMul === 'number') w.props.explodeDamageMul = Math.max(0.10, (w.props.explodeDamageMul || 1.0) * mods.explodeDamageMul);

    if (typeof mods.outSecondsMul === 'number') w.props.outSeconds = Math.max(0.12, (w.props.outSeconds || 0.35) * mods.outSecondsMul);
    if (typeof mods.returnSpeedMul === 'number') w.props.returnSpeedMul = Math.max(0.25, (w.props.returnSpeedMul || 1.0) * mods.returnSpeedMul);
  }
}

p.cooldown = Math.min(p.cooldown || 0, p.stats.fireCooldown);
s.cooldown = Math.min(s.cooldown || 0, s.stats.fireCooldown);

Engine.renderWeaponsHud();

};

  Engine.isSwapping = function () {
    return !!(Engine.swapState && Engine.swapState.remaining > 0);
  };

  Engine.isReloading = function (slot) {
    const w = Engine.getWeapon(slot || Engine.activeWeaponSlot);
    return (w.reloadRemaining || 0) > 0;
  };

  Engine.cancelReload = function (slot) {
    const w = Engine.getWeapon(slot || Engine.activeWeaponSlot);
    if ((w.reloadRemaining || 0) > 0) w.reloadRemaining = 0;
  };

  Engine.cancelWeaponActions = function (slot) {
    const w = Engine.getWeapon(slot || Engine.activeWeaponSlot);
    if (!w) return;

    if ((w.reloadRemaining || 0) > 0) w.reloadRemaining = 0;

    if ((w.burstRemaining || 0) > 0) {
      w.burstRemaining = 0;
      w.burstTimer = 0;
    }
    if (w.charging) {
      w.charging = false;
      w.chargeTime = 0;
    }
  };

  Engine.requestReload = function () {
    if (Engine.paused || Engine.gameOver) return false;
    if (Engine.isSwapping()) return false;

    const w = Engine.getActiveWeapon();
    if ((w.reloadRemaining || 0) > 0) return false;
    if (w.ammo >= w.magSize) return false;

    if (w.charging || (w.burstRemaining || 0) > 0) return false;

    w.reloadRemaining = Math.max(0.25, w.reloadSeconds || 1.2);
    Engine.renderWeaponsHud();
    return true;
  };


  Engine.requestSwapTo = function (targetSlot, opts) {
    const o = opts || {};
    if (o.isFiringHeld) return false;

    if (Engine.paused || Engine.gameOver) return false;
    ensureWeaponsInitialized();

    const fromSlot = Engine.activeWeaponSlot;
    const toSlot = (targetSlot === 'primary' || targetSlot === 'secondary') ? targetSlot : null;
    if (!toSlot || toSlot === fromSlot) return false;

    if (Engine.isSwapping()) return false;

    Engine.cancelWeaponActions(fromSlot);

    const fromW = Engine.getWeapon(fromSlot);
    const toW = Engine.getWeapon(toSlot);

    const outT = Math.max(0.10, fromW.swapOutSeconds || 0.25);
    const inT = Math.max(0.10, toW.swapInSeconds || 0.20);

    Engine.swapState = { remaining: outT + inT, target: toSlot };
    Engine.renderWeaponsHud();
    return true;
  };

  Engine.requestSwapToggle = function () {
    const to = (Engine.activeWeaponSlot === 'primary') ? 'secondary' : 'primary';
    return Engine.requestSwapTo(to);
  };

  Engine.tickWeapons = function (dt) {
    ensureWeaponsInitialized();

    for (const slot of ['primary', 'secondary']) {
      const w = Engine.weaponSlots[slot];
      if (!w) continue;

      w.cooldown = Math.max(0, (w.cooldown || 0) - dt);

      if (w.charging) {
        const max = Math.max(0.10, (w.props && typeof w.props.chargeSeconds === 'number') ? w.props.chargeSeconds : 0.85);
        w.chargeTime = clamp((w.chargeTime || 0) + dt, 0, max);
      }

      if ((w.burstRemaining || 0) > 0) {
        const interval = Math.max(0.03, (w.props && typeof w.props.burstInterval === 'number') ? w.props.burstInterval : 0.06);

        w.burstTimer = (w.burstTimer || 0) - dt;

        while ((w.burstRemaining || 0) > 0 && (w.burstTimer || 0) <= 0) {
          if (Engine.paused || Engine.gameOver || Engine.isSwapping()) {
            w.burstRemaining = 0;
            w.burstTimer = 0;
            break;
          }
          if ((w.reloadRemaining || 0) > 0) break;
          if (w.ammo <= 0) {
            w.burstRemaining = 0;
            w.burstTimer = 0;
            Engine.requestReload();
            break;
          }

          if (typeof Engine._fireProjectileShot === 'function') {
            Engine._fireProjectileShot(w, 'bullet');
          } else {
            Engine.spawnBullet(w);
          }

          w.ammo = Math.max(0, w.ammo - 1);
          w.burstRemaining = Math.max(0, w.burstRemaining - 1);

          w.burstTimer += interval;

          if (w.ammo === 0) Engine.requestReload();
        }

        if ((w.burstRemaining || 0) === 0) {
          w.cooldown = Math.max(w.cooldown || 0, w.stats.fireCooldown || 0);
        }
      }

      if ((w.reloadRemaining || 0) > 0) {
        w.reloadRemaining = Math.max(0, w.reloadRemaining - dt);
        if (w.reloadRemaining === 0) {
          w.ammo = w.magSize;
        }
      }
    }

    if (Engine.swapState && Engine.swapState.remaining > 0) {
      Engine.swapState.remaining = Math.max(0, Engine.swapState.remaining - dt);
      if (Engine.swapState.remaining === 0 && Engine.swapState.target) {
        Engine.activeWeaponSlot = Engine.swapState.target;
        Engine.swapState.target = null;
      }
    }

    Engine.renderWeaponsHud();
  };

  Engine.renderWeaponsHud = function () {
    if (!Engine.hudPrimaryWeapon || !Engine.hudSecondaryWeapon) return;
    ensureWeaponsInitialized();

    const p = Engine.weaponSlots.primary;
    const s = Engine.weaponSlots.secondary;
    const active = Engine.activeWeaponSlot;

    function fmt(w, slotLabel) {
      const isActive = active === slotLabel;
      const swapTxt = (Engine.swapState && Engine.swapState.target) ? ' (Swapping...)' : '';
      const rel = (w.reloadRemaining || 0) > 0 ? ' (Reloading...)' : '';
      const activeMark = isActive ? '▶ ' : '';
      return `${activeMark}${slotLabel === 'primary' ? '1' : '2'} ${w.name} — ${w.ammo}/${w.magSize}${rel}${swapTxt}`;
    }

    Engine.hudPrimaryWeapon.textContent = fmt(p, 'primary');
    Engine.hudSecondaryWeapon.textContent = fmt(s, 'secondary');

    Engine.hudPrimaryWeapon.classList.toggle('hudWeaponActive', active === 'primary');
    Engine.hudSecondaryWeapon.classList.toggle('hudWeaponActive', active === 'secondary');
  };

  Engine.canFire = function () {
    if (Engine.paused || Engine.gameOver) return false;
    if (Engine.isSwapping()) return false;

    const w = Engine.getActiveWeapon();

    if (w.charging) return false;
    if ((w.burstRemaining || 0) > 0) return false;

    if ((w.reloadRemaining || 0) > 0) return false;
    if ((w.cooldown || 0) > 0) return false;
    if (w.ammo <= 0) return false;

    return true;
  };

  Engine.tryFire = function () {
    if (Engine.paused || Engine.gameOver) return false;
    if (Engine.isSwapping()) return false;

    const w = Engine.getActiveWeapon();

    if (w.kind === 'charge') return false;

    if ((w.burstRemaining || 0) > 0) return false;

    if (w.ammo <= 0) {
      Engine.requestReload();
      return false;
    }
    if ((w.reloadRemaining || 0) > 0) return false;
    if ((w.cooldown || 0) > 0) return false;

    if (w.kind === 'boomerang' && w.boomerangOut) return false;

    if (w.kind === 'burst') {
      return Engine.startBurst(w);
    }

    Engine.fireWeaponOnce(w);

    w.ammo = Math.max(0, w.ammo - 1);
    w.cooldown = w.stats.fireCooldown || 0;
    Engine.fireCd = w.cooldown;

    if (w.ammo === 0) Engine.requestReload();

    Engine.renderWeaponsHud();
    return true;
  };

  function aimDir() {
    return { x: Math.cos(Engine.faceRad), y: Math.sin(Engine.faceRad) };
  }

  function spawnLineFx(x1, y1, x2, y2, widthPx, lifeMs) {
    try {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.left = `${x1}px`;
      el.style.top = `${y1}px`;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.max(1, Math.hypot(dx, dy));
      el.style.width = `${len}px`;
      el.style.height = `${Math.max(1, widthPx)}px`;
      el.style.transformOrigin = '0 50%';
      el.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
      el.style.background = 'rgba(255,255,255,0.55)';
      el.style.borderRadius = '999px';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '14';
      Engine.world.appendChild(el);
      setTimeout(() => el.remove(), Math.max(20, lifeMs || 60));
    } catch {}

  function spawnConeFx(originX, originY, dirRad, rangePx, coneRad, lifeMs) {
    try {
      const r = Math.max(40, Number(rangePx) || 220);
      const cone = Math.max(0.10, Number(coneRad) || 0.7);
      const half = Math.min(1.25, Math.max(0.05, cone * 0.5));
      const hRaw = 2 * r * Math.tan(half);
      const h = clamp(hRaw, 18, 980);

      const el = document.createElement('div');
      el.className = 'fxCone fxCone--flame';

      el.style.left = `${originX}px`;
      el.style.top = `${originY - h / 2}px`;
      el.style.width = `${r}px`;
      el.style.height = `${h}px`;
      el.style.transform = `rotate(${dirRad}rad)`;

      Engine.world.appendChild(el);
      setTimeout(() => el.remove(), Math.max(30, lifeMs || 70));
    } catch {}
  }
  }

  function hostilesAlongRay(originX, originY, dirX, dirY, range, width) {
    const hits = [];
    const dx = dirX;
    const dy = dirY;
    const r = Math.max(10, range || 600);
    const w = Math.max(2, width || 10);

    for (const h of Engine.hostiles) {
      const c = hostileCenter(h);
      const vx = c.x - originX;
      const vy = c.y - originY;
      const t = vx * dx + vy * dy;
      if (t < 0 || t > r) continue;

      const px = vx - dx * t;
      const py = vy - dy * t;
      const dist = Math.hypot(px, py);

      if (dist <= (w * 0.5 + h.size * 0.5)) {
        hits.push({ h, t });
      }
    }

    hits.sort((a, b) => a.t - b.t);
    return hits;
  }

  function hostilesInCone(originX, originY, dirX, dirY, range, coneRad) {
    const hits = [];
    const r = Math.max(10, range || 250);
    const half = Math.max(0.05, (coneRad || 0.7) * 0.5);
    const cosHalf = Math.cos(half);

    for (const h of Engine.hostiles) {
      const c = hostileCenter(h);
      const vx = c.x - originX;
      const vy = c.y - originY;
      const dist = Math.hypot(vx, vy);
      if (dist > r) continue;

      const nv = normalize(vx, vy);
      const dot = nv.x * dirX + nv.y * dirY;
      if (dot < cosHalf) continue;

      hits.push({ h, dist });
    }

    hits.sort((a, b) => a.dist - b.dist);
    return hits;
  }

  function makeVirtualBulletFromWeapon(w, originX, originY, dmgOverride) {
    const s = w.stats || Engine.WEAPON_BASE;
    return {
      x: originX,
      y: originY,

      dmg: (typeof dmgOverride === 'number') ? dmgOverride : s.damage,
      pierce: 0,
      bounce: 0,
      homing: 0,

      critChance: s.critChance,
      critMult: s.critMult,

      explosiveChance: 0,
      explosiveRadius: s.explosiveRadius,

      burnDps: s.burnDps,
      burnDuration: s.burnDuration,
      poisonDps: s.poisonDps,
      poisonDuration: s.poisonDuration,

      slowChance: s.slowChance,
      slowPercent: s.slowPercent,
      slowDuration: s.slowDuration,

      knockback: s.knockback,
    };
  }

  Engine._fireProjectileShot = function (weaponInstance, projectileKind, extra) {
    const w = weaponInstance || Engine.getActiveWeapon();
    const kind = projectileKind || 'bullet';
    const ownerSlot = (extra && extra.ownerSlot) ? extra.ownerSlot : Engine.activeWeaponSlot;
    Engine.spawnBullet(w, kind, { ownerSlot });
  };

  Engine.fireWeaponOnce = function (weaponInstance) {
    const w = weaponInstance || Engine.getActiveWeapon();
    const k = w.kind || 'bullet';

    if (k === 'bullet') {
      Engine._fireProjectileShot(w, 'bullet');
      return;
    }

    if (k === 'explosive') {
      Engine._fireProjectileShot(w, 'explosive');
      return;
    }

    if (k === 'boomerang') {
      w.boomerangOut = true;
      Engine._fireProjectileShot(w, 'boomerang', { ownerSlot: Engine.activeWeaponSlot });
      return;
    }

    const pc = playerCenter();
    const dir = aimDir();

    if (k === 'beam') {
      const range = (w.props && typeof w.props.beamRange === 'number') ? w.props.beamRange : 520;
      const width = (w.props && typeof w.props.beamWidth === 'number') ? w.props.beamWidth : 14;

      const hits = hostilesAlongRay(pc.x, pc.y, dir.x, dir.y, range, width);
      const maxHits = 1 + clamp(w.stats.pierce || 0, 0, 10);

      for (let i = 0; i < Math.min(maxHits, hits.length); i++) {
        const vb = makeVirtualBulletFromWeapon(w, pc.x, pc.y);
        applyBulletHitToHostile(vb, hits[i].h);
      }

      spawnLineFx(pc.x, pc.y, pc.x + dir.x * range, pc.y + dir.y * range, Math.max(2, width * 0.35), 70);
      return;
    }

    if (k === 'flame') {
      const range = (w.props && typeof w.props.flameRange === 'number') ? w.props.flameRange : 250;
      const cone = (w.props && typeof w.props.flameCone === 'number') ? w.props.flameCone : 0.7;

      const hits = hostilesInCone(pc.x, pc.y, dir.x, dir.y, range, cone);
      for (let i = 0; i < hits.length; i++) {
        const vb = makeVirtualBulletFromWeapon(w, pc.x, pc.y);
        applyBulletHitToHostile(vb, hits[i].h);
      }

      spawnConeFx(pc.x, pc.y, Math.atan2(dir.y, dir.x), range, cone, 80);
      return;
    }

    if (k === 'arc') {
      const arcRange = (w.props && typeof w.props.arcRange === 'number') ? w.props.arcRange : 360;
      const chainCount = clamp((w.props && typeof w.props.chainCount === 'number') ? w.props.chainCount : 3, 1, 10);
      const chainRange = (w.props && typeof w.props.chainRange === 'number') ? w.props.chainRange : 170;

      const forwardHits = hostilesInCone(pc.x, pc.y, dir.x, dir.y, arcRange, 1.25);
      if (!forwardHits.length) {
        return;
      }

      const visited = new Set();
      let cur = forwardHits[0].h;
      let curPos = hostileCenter(cur);

      for (let i = 0; i < chainCount && cur; i++) {
        visited.add(cur);
        const dmg = w.stats.damage * (i === 0 ? 1 : 0.85);
        const vb = makeVirtualBulletFromWeapon(w, curPos.x, curPos.y, dmg);
        applyBulletHitToHostile(vb, cur);

        let next = null;
        let best = 1e9;
        for (const h of Engine.hostiles) {
          if (visited.has(h)) continue;
          const hc = hostileCenter(h);
          const d = Math.hypot(hc.x - curPos.x, hc.y - curPos.y);
          if (d <= chainRange && d < best) {
            best = d;
            next = h;
          }
        }

        if (next) {
          const nextPos = hostileCenter(next);
          spawnLineFx(curPos.x, curPos.y, nextPos.x, nextPos.y, 3, 90);
          cur = next;
          curPos = nextPos;
        } else {
          cur = null;
        }
      }

      return;
    }
  };

  Engine.startBurst = function (weaponInstance) {
    const w = weaponInstance || Engine.getActiveWeapon();
    if (!w || w.kind !== 'burst') return false;
    if (Engine.paused || Engine.gameOver) return false;
    if (Engine.isSwapping()) return false;

    if ((w.reloadRemaining || 0) > 0) return false;
    if ((w.cooldown || 0) > 0) return false;

    if (w.ammo <= 0) {
      Engine.requestReload();
      return false;
    }

    const total = clamp((w.props && typeof w.props.burstCount === 'number') ? w.props.burstCount : 3, 1, 10);
    const shots = Math.min(total, w.ammo);

    w.burstRemaining = shots;
    w.burstTimer = 0;

    if (typeof Engine._fireProjectileShot === 'function') Engine._fireProjectileShot(w, 'bullet');
    else Engine.spawnBullet(w);

    w.ammo = Math.max(0, w.ammo - 1);
    w.burstRemaining = Math.max(0, w.burstRemaining - 1);

    w.burstTimer = Math.max(0.03, (w.props && typeof w.props.burstInterval === 'number') ? w.props.burstInterval : 0.06);

    if (w.ammo === 0) Engine.requestReload();

    if ((w.burstRemaining || 0) === 0) w.cooldown = w.stats.fireCooldown || 0;

    Engine.renderWeaponsHud();
    return true;
  };

  Engine.startCharge = function () {
    const w = Engine.getActiveWeapon();
    if (!w || w.kind !== 'charge') return false;
    if (Engine.paused || Engine.gameOver) return false;
    if (Engine.isSwapping()) return false;

    if ((w.reloadRemaining || 0) > 0) return false;
    if ((w.cooldown || 0) > 0) return false;

    if (w.ammo <= 0) {
      Engine.requestReload();
      return false;
    }

    w.charging = true;
    w.chargeTime = 0;
    Engine.renderWeaponsHud();
    return true;
  };

  function railFire(w, dmgMul) {
    const pc = playerCenter();
    const dir = aimDir();

    const range = (w.props && typeof w.props.railRange === 'number') ? w.props.railRange : 900;
    const width = (w.props && typeof w.props.railWidth === 'number') ? w.props.railWidth : 10;

    const hits = hostilesAlongRay(pc.x, pc.y, dir.x, dir.y, range, width);
    const maxHits = 1 + clamp(w.stats.pierce || 0, 0, 30);

    const dmg = (w.stats.damage || 1) * clamp(dmgMul || 1, 0.1, 20);

    for (let i = 0; i < Math.min(maxHits, hits.length); i++) {
      const vb = makeVirtualBulletFromWeapon(w, pc.x, pc.y, dmg);
      applyBulletHitToHostile(vb, hits[i].h);
    }

    spawnLineFx(pc.x, pc.y, pc.x + dir.x * range, pc.y + dir.y * range, Math.max(2, width * 0.4), 95);
  }

  Engine.releaseCharge = function () {
    const w = Engine.getActiveWeapon();
    if (!w || w.kind !== 'charge') return false;
    if (!w.charging) return false;

    const chargeSeconds = Math.max(0.10, (w.props && typeof w.props.chargeSeconds === 'number') ? w.props.chargeSeconds : 0.85);
    const minCharge = Math.max(0, (w.props && typeof w.props.minCharge === 'number') ? w.props.minCharge : 0.25);
    const maxMult = Math.max(1, (w.props && typeof w.props.maxChargeMult === 'number') ? w.props.maxChargeMult : 2.2);

    const t = clamp(w.chargeTime || 0, 0, chargeSeconds);

    w.charging = false;
    w.chargeTime = 0;

    if (Engine.paused || Engine.gameOver) return false;
    if (Engine.isSwapping()) return false;

    if (t + 1e-9 < minCharge) {
      w.cooldown = Math.max(w.cooldown || 0, 0.10);
      Engine.renderWeaponsHud();
      return false;
    }

    const pct = clamp(t / chargeSeconds, 0, 1);
    const dmgMul = 1 + (maxMult - 1) * pct;

    railFire(w, dmgMul);

    w.ammo = Math.max(0, w.ammo - 1);
    w.cooldown = w.stats.fireCooldown || 0;
    Engine.fireCd = w.cooldown;

    if (w.ammo === 0) Engine.requestReload();

    Engine.renderWeaponsHud();
    return true;
  };

  Engine.playerExplosionAt = function (x, y, radius, weaponInstance, dmgMul) {
    const w = weaponInstance || Engine.getActiveWeapon();
    const r = clamp(radius || 140, 30, 520);

    const ring = document.createElement('div');
    ring.classList.add('explosionRing');
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.style.setProperty('--explosion-radius', `${r}px`);
    Engine.world.appendChild(ring);
    setTimeout(() => ring.remove(), 420);

    const baseDmg = (w && w.stats) ? (w.stats.damage || 1) : 1;
    const dmg = baseDmg * clamp(dmgMul || 1, 0.05, 20);

    for (const h of Engine.hostiles) {
      const hc = hostileCenter(h);
      if (Math.hypot(hc.x - x, hc.y - y) <= r) {
        const vb = makeVirtualBulletFromWeapon(w, x, y, dmg);
        vb.explosiveChance = 0;
        applyBulletHitToHostile(vb, h);
      }
    }
  };

  Engine._boomerangCanHit = function (b, h) {
    if (!b || !h) return false;
    const list = b.hitCooldownList || [];
    for (const rec of list) {
      if (rec && rec.h === h && (rec.t || 0) > 0) return false;
    }
    return true;
  };

  Engine._boomerangRecordHit = function (b, h) {
    if (!b || !h) return;
    const cd = clamp((b.hitCooldown || 0.12), 0.04, 1.0);
    if (!b.hitCooldownList) b.hitCooldownList = [];
    b.hitCooldownList.push({ h, t: cd });
  };



Engine.applyBuild = function (build) {
    const b = build || {};
    const stat = b.stats || {};
    const wep = b.weapons || b.weapon || {};

    const speedMult =
      (typeof stat.playerSpeedMult === 'number')
        ? stat.playerSpeedMult
        : (1 + (stat.playerSpeedMultAdd || 0));

    Engine.player.speed = Engine.BASE.playerSpeed * clamp(speedMult, 0.6, 3.0);

    const dr =
      (typeof stat.damageReduction === 'number')
        ? stat.damageReduction
        : (stat.damageReductionAdd || 0);

    Engine.damageReduction = clamp(dr, 0, 0.65);

    const cm =
      (typeof stat.coinMult === 'number')
        ? stat.coinMult
        : clamp(1 + (stat.coinMultAdd || 0), 0.25, 6);

    Engine.coinMult = cm;

    Engine.INVINCIBILITY_TIME = clamp(
      Engine.BASE.invincibilitySeconds + (stat.invincibilityAdd || 0),
      0.2,
      2.2
    );

    Engine.regenPerSecond = clamp(
      (typeof stat.regenPerSecond === 'number') ? stat.regenPerSecond : (stat.regenAdd || 0),
      0,
      30
    );

    const oldMax = Engine.MAX_HEALTH;
    const newMax =
      (typeof stat.maxHealth === 'number')
        ? clamp(stat.maxHealth, 25, 999)
        : clamp(Engine.BASE.maxHealth + (stat.maxHealthAdd || 0), 25, 999);

    Engine.MAX_HEALTH = newMax;

    if (Engine.player.health > Engine.MAX_HEALTH) Engine.player.health = Engine.MAX_HEALTH;
    if (oldMax !== Engine.MAX_HEALTH) Engine.updatePlayerHealth(0);

    Engine._globalWeaponMods = Object.assign({}, wep || {});
    if (typeof Engine.recomputeWeapons === 'function') Engine.recomputeWeapons();

    applyCosmetics(b.cosmetics || {});

    Engine.updatePlayerHealth(0);
  };

  Engine.fireCd = 0;
  Engine.tickFireCd = function (dt) {
    Engine.tickWeapons(dt);
    Engine.fireCd = (Engine.getActiveWeapon().cooldown || 0);
  };
  Engine.resetFireCd = function () {
    const w = Engine.getActiveWeapon();
    w.cooldown = w.stats.fireCooldown;
    Engine.fireCd = w.cooldown;
  };

  function createBulletEl() {
    const el = document.createElement('div');
    el.className = 'bullet';
    if (Engine._bulletSkinClass) el.classList.add(Engine._bulletSkinClass);
    if (Engine._trailClass) el.classList.add(Engine._trailClass);
    Engine.applySprite(el, 'bullet.player');
    Engine.world.appendChild(el);
    return el;
  }

  function findNearestHostile(x, y, maxDist) {
    let best = null;
    let bestD = maxDist ?? 1e9;
    for (const h of Engine.hostiles) {
      const hx = h.x + h.size / 2;
      const hy = h.y + h.size / 2;
      const d = Math.hypot(hx - x, hy - y);
      if (d < bestD) {
        bestD = d;
        best = h;
      }
    }
    return best;
  }

  Engine.spawnBullet = function (weaponInstance, shotKind, extra) {
    const W = weaponInstance || Engine.getActiveWeapon();
    const wep = W.stats;
    const kind = shotKind || 'bullet';
    const ex = extra || {};

    const cx = Engine.player.x + Engine.player.w / 2;
    const cy = Engine.player.y + Engine.player.h / 2;

    const n = wep.multishot;
    const spread = wep.spread;

    const baseAng = Engine.faceRad;
    const total = spread * (n - 1);
    const start = baseAng - total / 2;

    for (let i = 0; i < n; i++) {
      const ang = start + spread * i;
      const dirx = Math.cos(ang);
      const diry = Math.sin(ang);

      const speed = wep.bulletSpeed;
      const ttl = wep.bulletTTL;

      const el = createBulletEl();

      let size = 6;
      if (kind === 'explosive') size = 10;
      if (kind === 'boomerang') size = 12;

      if (size !== 6) {
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = kind === 'boomerang' ? '4px' : '999px';
      }

      const b = {
        projKind: kind,
        ownerSlot: ex.ownerSlot || Engine.activeWeaponSlot,

        x: cx + dirx * 14,
        y: cy + diry * 14,
        vx: dirx * speed,
        vy: diry * speed,
        baseSpeed: speed,
        life: ttl,
        el,
        w: size,
        h: size,

        dmg: wep.damage,

        pierce: wep.pierce,
        bounce: wep.bounce,
        homing: wep.homing,

        critChance: wep.critChance,
        critMult: wep.critMult,

        explosiveChance: wep.explosiveChance,
        explosiveRadius: wep.explosiveRadius,

        burnDps: wep.burnDps,
        burnDuration: wep.burnDuration,
        poisonDps: wep.poisonDps,
        poisonDuration: wep.poisonDuration,

        slowChance: wep.slowChance,
        slowPercent: wep.slowPercent,
        slowDuration: wep.slowDuration,

        knockback: wep.knockback,
      };

      if (kind === 'explosive') {
        b.explosiveChance = 0;
        b.explodeRadius = (W.props && typeof W.props.explodeRadius === 'number') ? W.props.explodeRadius : (wep.explosiveRadius || 160);
        b.explodeDamageMul = (W.props && typeof W.props.explodeDamageMul === 'number') ? W.props.explodeDamageMul : 1.0;
        b.explodeOnHit = (W.props && typeof W.props.explodeOnHit === 'boolean') ? W.props.explodeOnHit : true;
        b.explodeOnExpire = true;
      }

      if (kind === 'boomerang') {
        b.homing = 0;
        b.phase = 'out';
        b.outRemaining = (W.props && typeof W.props.outSeconds === 'number') ? W.props.outSeconds : 0.35;
        b.returnSpeedMul = (W.props && typeof W.props.returnSpeedMul === 'number') ? W.props.returnSpeedMul : 1.3;
        b.hitCooldown = (W.props && typeof W.props.hitCooldown === 'number') ? W.props.hitCooldown : 0.12;
        b.hitCooldownList = [];
        b.ownerSlot = ex.ownerSlot || Engine.activeWeaponSlot;
        b.life = Math.max(ttl, b.outRemaining + 3.5);
      }

      Engine.bullets.push(b);

      el.style.left = `${b.x - b.w / 2}px`;
      el.style.top = `${b.y - b.h / 2}px`;
    }
  };

  Engine.updateBullets = function (dt) {
    for (let i = Engine.bullets.length - 1; i >= 0; i--) {
      const b = Engine.bullets[i];

      if (b.hitCooldownList && b.hitCooldownList.length) {
        for (let k = b.hitCooldownList.length - 1; k >= 0; k--) {
          b.hitCooldownList[k].t -= dt;
          if (b.hitCooldownList[k].t <= 0) b.hitCooldownList.splice(k, 1);
        }
      }

      if (b.projKind === 'boomerang') {
        if (b.phase === 'out') {
          b.outRemaining -= dt;
          if (b.outRemaining <= 0) b.phase = 'return';
        }

        if (b.phase === 'return') {
          const pc = playerCenter();
          const toP = normalize(pc.x - b.x, pc.y - b.y);
          const spd = (b.baseSpeed || 900) * clamp(b.returnSpeedMul || 1.3, 0.5, 4.0);
          b.vx = toP.x * spd;
          b.vy = toP.y * spd;

          const dist = Math.hypot(pc.x - b.x, pc.y - b.y);
          if (dist <= 18) {
            const w = Engine.getWeapon(b.ownerSlot);
            if (w) w.boomerangOut = false;
            b.el.remove();
            Engine.bullets.splice(i, 1);
            continue;
          }
        }
      } else {
        if (b.homing > 0 && Engine.hostiles.length) {
          const target = findNearestHostile(b.x, b.y, 540);
          if (target) {
            const tx = target.x + target.size / 2;
            const ty = target.y + target.size / 2;

            const desired = normalize(tx - b.x, ty - b.y);
            const cur = normalize(b.vx, b.vy);
            const steer = clamp(b.homing, 0, 0.95);

            const ndx = cur.x * (1 - steer) + desired.x * steer;
            const ndy = cur.y * (1 - steer) + desired.y * steer;
            const n = normalize(ndx, ndy);

            const spd = b.baseSpeed || 900;
            b.vx = n.x * spd;
            b.vy = n.y * spd;
          }
        }
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      if (b.life <= 0) {
        if (b.projKind === 'explosive' && b.explodeOnExpire) {
          const r = b.explodeRadius || 160;
          const mul = b.explodeDamageMul || 1.0;
          const w = Engine.getWeapon(b.ownerSlot);
          Engine.playerExplosionAt(b.x, b.y, r, w || Engine.getActiveWeapon(), mul);
        }

        if (b.projKind === 'boomerang') {
          const w = Engine.getWeapon(b.ownerSlot);
          if (w) w.boomerangOut = false;
        }

        b.el.remove();
        Engine.bullets.splice(i, 1);
        continue;
      }

      b.el.style.left = `${b.x - b.w / 2}px`;
      b.el.style.top = `${b.y - b.h / 2}px`;
    }
  };

  Engine.enemyBulletSpeed = 520;
  Engine.enemyBulletTTL = 4.0;
  Engine.enemyBulletDamage = 6;

  function makeEnemyProjEl(kind) {
    const el = document.createElement('div');
    el.classList.add('enemyBullet');
    if (kind === 'sniper') el.classList.add('enemyBullet--sniper');
    if (kind === 'bomb') el.classList.add('enemyBullet--bomb');
    const key = kind === 'sniper' ? 'bullet.sniper' : kind === 'bomb' ? 'bullet.bomb' : 'bullet.enemy';
    Engine.applySprite(el, key);
    Engine.world.appendChild(el);
    return el;
  }

  Engine.spawnEnemyProjectile = function (kind, x, y, dirx, diry, hostile, extra) {
    const d = Engine.getDifficulty();
    const k = kind || 'bullet';

    let speed = Engine.enemyBulletSpeed * (1 + d * 0.03);
    let ttl = Engine.enemyBulletTTL;
    let abs = Engine.enemyBulletDamage + d * 0.25;
    let radius = 0;

    if (k === 'sniper') {
      speed *= 1.35;
      abs *= 1.8;
    } else if (k === 'bomb') {
      speed *= 0.75;
      abs *= 1.6;
      ttl = 3.0;
      radius = (extra && extra.explodeRadius) ? extra.explodeRadius : 140;
    }

    if (hostile && hostile.projectileDamageMult) abs *= hostile.projectileDamageMult;
    abs = clamp(Math.round(abs), 4, 24);

    speed = clamp(speed, 420, 1180);

    const vx = dirx * speed;
    const vy = diry * speed;

    const el = makeEnemyProjEl(k);

    const w = k === 'bomb' ? 12 : 6;
    const h = k === 'bomb' ? 12 : 6;

    Engine.enemyProjectiles.push({
      kind: k,
      x,
      y,
      vx,
      vy,
      life: ttl,
      el,
      w,
      h,
      dmgAbs: abs,
      explodeRadius: radius,
    });
  };

  function explodeAt(x, y, radius, dmgAbs) {
    const ring = document.createElement('div');
    ring.classList.add('explosionRing');
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.style.setProperty('--explosion-radius', `${radius}px`);
    Engine.world.appendChild(ring);
    setTimeout(() => ring.remove(), 420);

    const px = Engine.player.x + Engine.player.w / 2;
    const py = Engine.player.y + Engine.player.h / 2;
    if (Math.hypot(px - x, py - y) <= radius) {
      Engine.tryDamagePlayer(dmgAbs);
    }
  }

  Engine.updateEnemyProjectiles = function (dt) {
    for (let i = Engine.enemyProjectiles.length - 1; i >= 0; i--) {
      const b = Engine.enemyProjectiles[i];

      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      if (b.kind === 'bomb' && b.life <= 0) {
        explodeAt(b.x, b.y, b.explodeRadius, b.dmgAbs);
        b.el.remove();
        Engine.enemyProjectiles.splice(i, 1);
        continue;
      }

      if (b.life <= 0 || b.x < -50 || b.y < -50 || b.x > Engine.WORLD_W + 50 || b.y > Engine.WORLD_H + 50) {
        b.el.remove();
        Engine.enemyProjectiles.splice(i, 1);
        continue;
      }

      b.el.style.left = `${b.x - b.w / 2}px`;
      b.el.style.top = `${b.y - b.h / 2}px`;
    }
  };

  Engine.updateEnemyBullets = Engine.updateEnemyProjectiles;

  Engine.hostileSpawning = true;
  Engine.setHostileSpawning = function (val) { Engine.hostileSpawning = !!val; };

  Engine.spawnTimer = 0;
  Engine.SPAWN_RATE = 2.0;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function curveWeight(curve, threat) {
    if (!curve) return 0;
    const t = clamp((threat - curve.minThreat) / Math.max(0.001, (curve.maxThreat - curve.minThreat)), 0, 1);
    return lerp(curve.min, curve.max, t);
  }

  Engine.pickEnemyType = function () {
    const C = window.EnemyCatalog;
    const arch = (C && C.archetypes) ? C.archetypes : null;
    if (!arch) return 'grunt';

    const d = Engine.getDifficulty();
    const pool = [];
    let total = 0;

    for (const id of Object.keys(arch)) {
      const a = arch[id];
      if (!a || a.spawn === false) continue;
      if ((a.unlock || 1) > d) continue;

      const wgt = curveWeight(a.weight, d);
      if (wgt <= 0) continue;

      total += wgt;
      pool.push({ id, w: wgt, a });
    }

    if (!pool.length || total <= 0) return 'grunt';

    let r = Math.random() * total;
    for (const p of pool) {
      r -= p.w;
      if (r <= 0) return p.id;
    }
    return pool[pool.length - 1].id;
  };

  Engine.computeEnemyStats = function (type) {
    const C = window.EnemyCatalog;
    const arch = (C && C.archetypes && C.archetypes[type]) ? C.archetypes[type] : null;

    const a = arch || (C && C.archetypes ? C.archetypes.grunt : null) || {
      id: 'grunt',
      stats: { hp: 1, spd: 1, sz: 1 },
      ai: { id: 'chase', params: {} },
      abilities: {},
      coins: { base: 12, rand: 6, bonus: 0 },
      contactDamageMult: 1,
    };

    const d = Engine.getDifficulty();

    const healthScale = 1 + d * 0.13;
    const speedScale = 1 + d * 0.05;
    const sizeScale = 1 + d * 0.02;

    const size = clamp(Math.round(Engine.ENEMY_BASE.size * sizeScale * a.stats.sz), 18, 74);
    const speed = clamp(Engine.ENEMY_BASE.speed * speedScale * a.stats.spd, 70, 360);
    const health = clamp(Math.ceil(Engine.ENEMY_BASE.health * healthScale * a.stats.hp), 1, 999);

    const abilities = JSON.parse(JSON.stringify(a.abilities || {}));

    if (abilities.shield) {
      const sh = abilities.shield;
      if (sh.hp == null) sh.hp = sh.shieldHp ?? 0;
      if (sh.regen == null) sh.regen = sh.regenPerSec ?? 0;
      if (sh.regenDelay == null) sh.regenDelay = sh.regenDelay ?? 0;
    }
    if (abilities.leech) {
      const le = abilities.leech;
      if (le.pct == null) le.pct = le.healOnHit ?? 0.10;
    }
    if (abilities.shoot) {
      const base = abilities.shoot.interval || 1.8;
      const scale = abilities.shoot.intervalScale || 0;
      abilities.shoot._interval = clamp(base + d * scale, 0.45, base);
    }
    if (abilities.aoe) {
      const base = abilities.aoe.interval || 3.0;
      const scale = abilities.aoe.intervalScale || 0;
      abilities.aoe._interval = clamp(base + d * scale, 1.1, base);
    }
    if (abilities.heal) {
      const base = abilities.heal.interval || 3.5;
      const scale = abilities.heal.intervalScale || 0;
      abilities.heal._interval = clamp(base + d * scale, 1.4, base);
    }
    if (abilities.summon) {
      const base = abilities.summon.interval || 4.5;
      const scale = abilities.summon.intervalScale || 0;
      abilities.summon._interval = clamp(base + d * scale, 1.8, base);
    }

    return {
      type: a.id,
      name: a.name || a.id,
      size,
      speed,
      health,
      ai: a.ai || { id: 'chase', params: {} },
      abilities,
      coins: a.coins || { base: 12, rand: 6, bonus: 0 },
      contactDamageMult: a.contactDamageMult || 1,
    };
  };

  function createHostileEl(type) {
    const el = document.createElement('div');
    el.classList.add('hostile', `hostile--${type}`);
    Engine.applySprite(el, `enemy.${type}`);
    Engine.world.appendChild(el);
    return el;
  }

  Engine.spawnHostile = function (forcedType) {
    const MIN_R = 260;
    const MAX_R = 720;

    const type = forcedType || Engine.pickEnemyType();
    const stats = Engine.computeEnemyStats(type);
    const s = stats.size;

    const t = Math.random();
    const r = Math.sqrt(MIN_R * MIN_R + t * (MAX_R * MAX_R - MIN_R * MIN_R));
    const a = Math.random() * Math.PI * 2;

    let x = Engine.player.x + Math.cos(a) * r;
    let y = Engine.player.y + Math.sin(a) * r;

    x = clamp(x, 0, Engine.WORLD_W - s);
    y = clamp(y, 0, Engine.WORLD_H - s);

    const el = createHostileEl(stats.type);
    el.style.width = `${s}px`;
    el.style.height = `${s}px`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    const h = {
      x,
      y,
      size: s,
      speed: stats.speed,
      health: stats.health,
      maxHealth: stats.health,

      type: stats.type,
      name: stats.name,
      el,

      aiId: (stats.ai && stats.ai.id) ? stats.ai.id : 'chase',
      aiParams: (stats.ai && stats.ai.params) ? stats.ai.params : {},

      abilities: stats.abilities || {},
      tShoot: stats.abilities && stats.abilities.shoot ? (stats.abilities.shoot._interval * (0.35 + Math.random() * 0.9)) : 0,
      tAoe: stats.abilities && stats.abilities.aoe ? (stats.abilities.aoe._interval * (0.35 + Math.random() * 0.9)) : 0,
      tHeal: stats.abilities && stats.abilities.heal ? (stats.abilities.heal._interval * (0.35 + Math.random() * 0.9)) : 0,
      tSummon: stats.abilities && stats.abilities.summon ? (stats.abilities.summon._interval * (0.35 + Math.random() * 0.9)) : 0,

      contactDamageMult: stats.contactDamageMult || 1,
      coins: stats.coins || { base: 12, rand: 6, bonus: 0 },

      kx: 0,
      ky: 0,

      burnT: 0,
      burnDps: 0,
      poisonT: 0,
      poisonDps: 0,
      slowT: 0,
      slowPct: 0,

      shield: stats.abilities && stats.abilities.shield ? (stats.abilities.shield.hp || 0) : 0,
      shieldMax: stats.abilities && stats.abilities.shield ? (stats.abilities.shield.hp || 0) : 0,
      shieldRegen: stats.abilities && stats.abilities.shield ? (stats.abilities.shield.regen || 0) : 0,
      shieldRegenDelay: stats.abilities && stats.abilities.shield ? (stats.abilities.shield.regenDelay || 0) : 0,
      shieldRegenWait: 0,

      dashT: 0,
      dashCd: 0,

      lockT: 0,

      onDeath: stats.abilities && stats.abilities.split ? stats.abilities.split : null,
    };

    Engine.hostiles.push(h);
  };

  Engine.EnemyAIs = Engine.EnemyAIs || {};

  function playerCenter() {
    return {
      x: Engine.player.x + Engine.player.w / 2,
      y: Engine.player.y + Engine.player.h / 2,
    };
  }

  function hostileCenter(h) {
    return {
      x: h.x + h.size / 2,
      y: h.y + h.size / 2,
    };
  }

  function moveToward(h, dx, dy, speed, dt) {
    const dir = normalize(dx, dy);
    h.x += dir.x * speed * dt;
    h.y += dir.y * speed * dt;
  }

  function strafe(h, dirx, diry, strength, dt) {
    h.x += (-diry) * strength * dt;
    h.y += (dirx) * strength * dt;
  }

  Engine.EnemyAIs.chase = function (h, dt, ctx) {
    const { px, py } = ctx;
    const hc = hostileCenter(h);
    const dx = px - hc.x;
    const dy = py - hc.y;
    const dist = Math.max(1, Math.hypot(dx, dy));

    let jx = 0;
    let jy = 0;
    const jitter = h.aiParams && h.aiParams.jitter ? h.aiParams.jitter : 0;
    if (jitter > 0) {
      const t = Engine.timeAlive * 2.5;
      jx = Math.cos(t + h.x * 0.001) * jitter;
      jy = Math.sin(t + h.y * 0.001) * jitter;
    }

    const slowMult = 1 - clamp(h.slowPct || 0, 0, 0.9);

    let dashMult = 1;
    if (h.dashT > 0) dashMult = h.aiParams.dashMult || 2.8;

    const spd = h.speed * slowMult * dashMult;
    moveToward(h, dx + jx * dist, dy + jy * dist, spd, dt);
  };

  Engine.EnemyAIs.kiter = function (h, dt, ctx) {
    const { px, py } = ctx;
    const hc = hostileCenter(h);
    const dx = px - hc.x;
    const dy = py - hc.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const dir = { x: dx / dist, y: dy / dist };

    const min = (h.aiParams && h.aiParams.min) ? h.aiParams.min : 240;
    const max = (h.aiParams && h.aiParams.max) ? h.aiParams.max : 380;
    const str = (h.aiParams && h.aiParams.strafe) ? h.aiParams.strafe : 0.35;

    const slowMult = 1 - clamp(h.slowPct || 0, 0, 0.9);
    const spd = h.speed * slowMult;

    if (dist < min) {
      h.x -= dir.x * spd * dt;
      h.y -= dir.y * spd * dt;
    } else if (dist > max) {
      h.x += dir.x * spd * dt;
      h.y += dir.y * spd * dt;
    }

    strafe(h, dir.x, dir.y, spd * str, dt);
  };

  Engine.EnemyAIs.sniper = function (h, dt, ctx) {
    const { px, py } = ctx;
    const hc = hostileCenter(h);
    const dx = px - hc.x;
    const dy = py - hc.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const dir = { x: dx / dist, y: dy / dist };

    const min = (h.aiParams && h.aiParams.min) ? h.aiParams.min : 520;
    const max = (h.aiParams && h.aiParams.max) ? h.aiParams.max : 780;
    const str = (h.aiParams && h.aiParams.strafe) ? h.aiParams.strafe : 0.18;

    const slowMult = 1 - clamp(h.slowPct || 0, 0, 0.9);
    const spd = h.speed * slowMult;

    if (dist < min) {
      h.x -= dir.x * spd * dt;
      h.y -= dir.y * spd * dt;
    } else if (dist > max) {
      h.x += dir.x * spd * dt;
      h.y += dir.y * spd * dt;
    }

    strafe(h, dir.x, dir.y, spd * str, dt);
  };

  Engine.EnemyAIs.charger = function (h, dt, ctx) {
    const dashEvery = (h.aiParams && h.aiParams.dashEvery) ? h.aiParams.dashEvery : 3.0;
    const dashTime = (h.aiParams && h.aiParams.dashTime) ? h.aiParams.dashTime : 0.55;

    h.dashCd -= dt;
    if (h.dashCd <= 0 && h.dashT <= 0) {
      h.dashT = dashTime;
      h.dashCd = dashEvery;
      h.el.classList.add('hostile--dashing');
      setTimeout(() => h.el && h.el.classList.remove('hostile--dashing'), dashTime * 1000);
    }

    if (h.dashT > 0) h.dashT -= dt;

    Engine.EnemyAIs.chase(h, dt, ctx);
  };

  Engine.EnemyAIs.support = function (h, dt, ctx) {
    const { px, py } = ctx;

    let cx = 0, cy = 0, n = 0;
    for (const o of Engine.hostiles) {
      if (o === h) continue;
      const d = Math.hypot((o.x - h.x), (o.y - h.y));
      if (d < 520) {
        cx += o.x;
        cy += o.y;
        n++;
      }
    }

    const hc = hostileCenter(h);
    const dxp = px - hc.x;
    const dyp = py - hc.y;
    const distp = Math.max(1, Math.hypot(dxp, dyp));
    const dirp = { x: dxp / distp, y: dyp / distp };

    const slowMult = 1 - clamp(h.slowPct || 0, 0, 0.9);
    const spd = h.speed * slowMult;

    if (n >= 2) {
      const tx = (cx / n);
      const ty = (cy / n);
      const dx = tx - h.x;
      const dy = ty - h.y;
      moveToward(h, dx, dy, spd * 0.9, dt);
    } else {
      if (distp < 320) {
        h.x -= dirp.x * spd * dt;
        h.y -= dirp.y * spd * dt;
      } else if (distp > 620) {
        h.x += dirp.x * spd * dt;
        h.y += dirp.y * spd * dt;
      }
      strafe(h, dirp.x, dirp.y, spd * 0.22, dt);
    }
  };

  function tickHostileStatuses(h, dt) {
    if (h.burnT > 0) {
      h.burnT -= dt;
      h._burnCarry = (h._burnCarry || 0) + h.burnDps * dt;
      if (h._burnCarry >= 1) {
        const whole = Math.floor(h._burnCarry);
        h._burnCarry -= whole;
        h.health -= whole;
      }
    }

    if (h.poisonT > 0) {
      h.poisonT -= dt;
      h._poisonCarry = (h._poisonCarry || 0) + h.poisonDps * dt;
      if (h._poisonCarry >= 1) {
        const whole = Math.floor(h._poisonCarry);
        h._poisonCarry -= whole;
        h.health -= whole;
      }
    }

    if (h.slowT > 0) {
      h.slowT -= dt;
      if (h.slowT <= 0) {
        h.slowPct = 0;
        h.el.classList.remove('hostile--slowed');
      }
    }

    if (h.shieldRegenWait > 0) h.shieldRegenWait = Math.max(0, h.shieldRegenWait - dt);
    if (h.shieldMax > 0 && h.shield < h.shieldMax && h.shieldRegen > 0 && h.shieldRegenWait <= 0) {
      h.shield = Math.min(h.shieldMax, h.shield + h.shieldRegen * dt);
    }

    const damp = Math.max(0, 1 - dt * 7);
    h.kx *= damp;
    h.ky *= damp;
    if (Math.abs(h.kx) + Math.abs(h.ky) > 0.001) {
      h.x += h.kx * dt;
      h.y += h.ky * dt;
    }
  }

  Engine.triggerAoePulse = function (hostile, aoeDef) {
    const d = Engine.getDifficulty();
    const hc = hostileCenter(hostile);

    const radius = clamp((aoeDef.radius || 120) + d * (aoeDef.radiusScale || 6), 90, 280);
    const abs = clamp(Math.round((7 + d * 0.35) * (aoeDef.damageMult || 1)), 5, 22);

    const pc = playerCenter();
    if (Math.hypot(pc.x - hc.x, pc.y - hc.y) <= radius) {
      Engine.tryDamagePlayer(abs);
    }

    const ring = document.createElement('div');
    ring.classList.add('aoeRing');
    ring.style.left = `${hc.x}px`;
    ring.style.top = `${hc.y}px`;
    ring.style.setProperty('--aoe-radius', `${radius}px`);
    Engine.world.appendChild(ring);
    setTimeout(() => ring.remove(), 420);
  };

  function tickHostileAbilities(h, dt, ctx) {
    const ab = h.abilities || {};

    if (ab.shoot) {
      h.tShoot -= dt;
      if (h.tShoot <= 0) {
        const hc = hostileCenter(h);
        const aim = normalize(ctx.px - hc.x, ctx.py - hc.y);
        const kind = ab.shoot.kind || 'bullet';
        const extra = {
          explodeRadius: ab.shoot.explodeRadius || 140,
        };
        h.projectileDamageMult = ab.shoot.damageMult || 1;
        Engine.spawnEnemyProjectile(kind, hc.x, hc.y, aim.x, aim.y, h, extra);
        h.tShoot = ab.shoot._interval || ab.shoot.interval || 1.8;
      }
    }

    if (ab.aoe) {
      h.tAoe -= dt;
      if (h.tAoe <= 0) {
        Engine.triggerAoePulse(h, ab.aoe);
        h.tAoe = ab.aoe._interval || ab.aoe.interval || 3.0;
      }
    }

    if (ab.heal) {
      h.tHeal -= dt;
      if (h.tHeal <= 0) {
        const radius = ab.heal.radius || 240;
        const amount = clamp(Math.round((ab.heal.amount || 3) + Engine.getDifficulty() * (ab.heal.amountScale || 0.15)), 2, 20);
        const hc = hostileCenter(h);
        for (const o of Engine.hostiles) {
          if (o === h) continue;
          const oc = hostileCenter(o);
          if (Math.hypot(oc.x - hc.x, oc.y - hc.y) <= radius) {
            o.health = Math.min(o.maxHealth, o.health + amount);
            o.el.classList.add('hostile--healed');
            setTimeout(() => o.el && o.el.classList.remove('hostile--healed'), 120);
          }
        }
        h.tHeal = ab.heal._interval || ab.heal.interval || 3.5;
      }
    }

    if (ab.summon) {
      h.tSummon -= dt;
      if (h.tSummon <= 0) {
        const cap = ab.summon.cap || 10;
        const count = ab.summon.count || 2;
        const child = ab.summon.child || 'mini';

        let minis = 0;
        for (const o of Engine.hostiles) if (o.type === child) minis++;

        if (minis < cap) {
          const hc = hostileCenter(h);
          for (let i = 0; i < count; i++) {
            Engine.spawnHostile(child);
            const m = Engine.hostiles[Engine.hostiles.length - 1];
            if (m && m.type === child) {
              m.x = clamp(hc.x - m.size / 2 + (Math.random() * 90 - 45), 0, Engine.WORLD_W - m.size);
              m.y = clamp(hc.y - m.size / 2 + (Math.random() * 90 - 45), 0, Engine.WORLD_H - m.size);
            }
          }
        }

        h.tSummon = ab.summon._interval || ab.summon.interval || 4.5;
      }
    }
  }

  Engine.updateHostiles = function (dt) {
    Engine.spawnTimer += dt;
    while (Engine.spawnTimer >= Engine.SPAWN_RATE && Engine.hostileSpawning) {
      Engine.spawnHostile();
      Engine.spawnTimer -= Engine.SPAWN_RATE;
    }

    const pc = playerCenter();
    const ctx = { px: pc.x, py: pc.y, d: Engine.getDifficulty() };

    for (let i = 0; i < Engine.hostiles.length; i++) {
      const h = Engine.hostiles[i];

      tickHostileStatuses(h, dt);
      tickHostileAbilities(h, dt, ctx);

      const ai = Engine.EnemyAIs[h.aiId] || Engine.EnemyAIs.chase;
      ai(h, dt, ctx);

      h.x = clamp(h.x, 0, Engine.WORLD_W - h.size);
      h.y = clamp(h.y, 0, Engine.WORLD_H - h.size);

      h.el.style.left = `${h.x}px`;
      h.el.style.top = `${h.y}px`;
    }
  };

  function intersectsRect(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function applyBulletHitToHostile(b, h) {
    let dmg = b.dmg;

    const isCrit = Math.random() < (b.critChance || 0);
    if (isCrit) dmg *= (b.critMult || 1.8);

    const dealt = Math.max(1, Math.round(dmg));

    if (h.shield > 0) {
      const used = Math.min(h.shield, dealt);
      h.shield -= used;
      if (used > 0 && h.shieldRegenDelay > 0) h.shieldRegenWait = h.shieldRegenDelay;
      const rem = dealt - used;
      if (rem > 0) h.health -= rem;
      h.el.classList.add('hostile--shieldHit');
      setTimeout(() => h.el && h.el.classList.remove('hostile--shieldHit'), 60);
    } else {
      h.health -= dealt;
    }

    if (b.burnDps > 0 && b.burnDuration > 0) {
      h.burnDps = Math.max(h.burnDps, b.burnDps);
      h.burnT = Math.max(h.burnT, b.burnDuration);
      h.el.classList.add('hostile--burning');
      setTimeout(() => h.el && h.el.classList.remove('hostile--burning'), 120);
    }

    if (b.poisonDps > 0 && b.poisonDuration > 0) {
      h.poisonDps = Math.max(h.poisonDps, b.poisonDps);
      h.poisonT = Math.max(h.poisonT, b.poisonDuration);
      h.el.classList.add('hostile--poisoned');
      setTimeout(() => h.el && h.el.classList.remove('hostile--poisoned'), 120);
    }

    if (b.slowChance > 0 && b.slowPercent > 0 && b.slowDuration > 0) {
      if (Math.random() < b.slowChance) {
        h.slowPct = Math.max(h.slowPct, b.slowPercent);
        h.slowT = Math.max(h.slowT, b.slowDuration);
        h.el.classList.add('hostile--slowed');
      }
    }

    if (b.knockback > 0) {
      const hc = hostileCenter(h);
      const dir = normalize(hc.x - b.x, hc.y - b.y);
      h.kx += dir.x * b.knockback;
      h.ky += dir.y * b.knockback;
    }

    if (b.explosiveChance > 0 && Math.random() < b.explosiveChance) {
      const x = h.x + h.size / 2;
      const y = h.y + h.size / 2;
      const r = b.explosiveRadius;

      const ring = document.createElement('div');
      ring.classList.add('explosionRing');
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      ring.style.setProperty('--explosion-radius', `${r}px`);
      Engine.world.appendChild(ring);
      setTimeout(() => ring.remove(), 420);

      for (const o of Engine.hostiles) {
        const oc = hostileCenter(o);
        if (Math.hypot(oc.x - x, oc.y - y) <= r) {
          if (o.shield > 0) {
            const used = Math.min(o.shield, dealt);
            o.shield -= used;
            if (used > 0 && o.shieldRegenDelay > 0) o.shieldRegenWait = o.shieldRegenDelay;
            const rem = dealt - used;
            if (rem > 0) o.health -= Math.floor(rem * 0.7);
          } else {
            o.health -= Math.floor(dealt * 0.7);
          }
        }
      }
    }

    h.el.classList.add('hostile--hit');
    setTimeout(() => h.el && h.el.classList.remove('hostile--hit'), 60);

    return dealt;
  }

  Engine.getKillCoins = function (h) {
    const d = Engine.getDifficulty();
    const c = (h && h.coins) ? h.coins : { base: 12, rand: 6, bonus: 0 };

    const base = c.base + (getRandomMath((c.rand || 6) + 1)); // 0..rand
    const scaled = base * (1 + d * 0.08);
    const total = (scaled + (c.bonus || 0)) * Engine.coinMult;
    return Math.max(1, Math.floor(total));
  };

  function onHostileDeath(h, index) {
    if (h.onDeath && h.onDeath.child) {
      const count = h.onDeath.count || 2;
      const child = h.onDeath.child;
      const cx = h.x + h.size / 2;
      const cy = h.y + h.size / 2;
      for (let i = 0; i < count; i++) {
        Engine.spawnHostile(child);
        const c = Engine.hostiles[Engine.hostiles.length - 1];
        if (c && c.type === child) {
          c.x = clamp(cx - c.size / 2 + (Math.random() * 80 - 40), 0, Engine.WORLD_W - c.size);
          c.y = clamp(cy - c.size / 2 + (Math.random() * 80 - 40), 0, Engine.WORLD_H - c.size);
        }
      }
    }

    Engine.kills += 1;
    Engine.updateCoins(Engine.getKillCoins(h));
    Engine.renderThreatKills();

    h.el.remove();
    Engine.hostiles.splice(index, 1);
  }

  Engine.checkCollisions = function (dt) {
    if (Engine.playerInvincibility > 0) Engine.playerInvincibility -= dt;

    for (let i = Engine.enemyProjectiles.length - 1; i >= 0; i--) {
      const b = Engine.enemyProjectiles[i];
      const bl = b.x - b.w / 2;
      const bt = b.y - b.h / 2;

      if (intersectsRect(Engine.player.x, Engine.player.y, Engine.player.w, Engine.player.h, bl, bt, b.w, b.h)) {
        if (b.kind === 'bomb') {
          explodeAt(b.x, b.y, b.explodeRadius, b.dmgAbs);
        } else {
          Engine.tryDamagePlayer(b.dmgAbs);
        }
        b.el.remove();
        Engine.enemyProjectiles.splice(i, 1);
      }
    }

    for (let j = Engine.hostiles.length - 1; j >= 0; j--) {
      const h = Engine.hostiles[j];

      if (intersectsRect(Engine.player.x, Engine.player.y, Engine.player.w, Engine.player.h, h.x, h.y, h.size, h.size)) {
        Engine.tryDamagePlayer(Engine.getContactDamageAbs(h));

        if (h.abilities && h.abilities.leech) {
          const pct = clamp(h.abilities.leech.pct || 0.08, 0.02, 0.35);
          const healed = Math.max(1, Math.round(Engine.getContactDamageAbs(h) * pct));
          h.health = Math.min(h.maxHealth, h.health + healed);
          h.el.classList.add('hostile--healed');
          setTimeout(() => h.el && h.el.classList.remove('hostile--healed'), 120);
        }

        h.health -= 1;
      }

      for (let i = Engine.bullets.length - 1; i >= 0; i--) {
        const b = Engine.bullets[i];
        const bl = b.x - b.w / 2;
        const bt = b.y - b.h / 2;

        if (intersectsRect(bl, bt, b.w, b.h, h.x, h.y, h.size, h.size)) {
          if (b.projKind === 'boomerang' && typeof Engine._boomerangCanHit === 'function') {
            if (!Engine._boomerangCanHit(b, h)) continue;
          }

          if (b.projKind === 'explosive' && b.explodeOnHit) {
            const hc = hostileCenter(h);
            const r = b.explodeRadius || 160;
            const mul = b.explodeDamageMul || 1.0;
            const w = Engine.getWeapon(b.ownerSlot);
            Engine.playerExplosionAt(hc.x, hc.y, r, w || Engine.getActiveWeapon(), mul);

            b.el.remove();
            Engine.bullets.splice(i, 1);
            break;
          }

          applyBulletHitToHostile(b, h);

          if (b.projKind === 'boomerang') {
            if (typeof Engine._boomerangRecordHit === 'function') Engine._boomerangRecordHit(b, h);
            break;
          }

          let removeBullet = true;

          if (b.pierce > 0) {
            b.pierce -= 1;
            removeBullet = false;
          } else if (b.bounce > 0) {
            b.bounce -= 1;
            removeBullet = false;

            const target = findNearestHostile(b.x, b.y, 650);
            if (target && target !== h) {
              const tc = hostileCenter(target);
              const dir = normalize(tc.x - b.x, tc.y - b.y);
              const spd = Math.hypot(b.vx, b.vy) || (b.baseSpeed || 900);
              b.vx = dir.x * spd;
              b.vy = dir.y * spd;
            } else {
              b.vx = -b.vx;
              b.vy = -b.vy;
            }
          }

          if (removeBullet) {
            b.el.remove();
            Engine.bullets.splice(i, 1);
          }

          break;
        }
      }

      if (h.health <= 0) onHostileDeath(h, j);
    }
  };

  Engine.renderCoins();
  Engine.renderThreatKills();
  Engine.updatePlayerHealth(0);
})();
