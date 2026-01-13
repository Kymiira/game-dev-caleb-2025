// shop.js
(() => {
  const Engine = window.Engine;
  const Catalog = window.ShopCatalog;

  if (!Engine) {
    console.error('[shop.js] window.Engine not found. Ensure engine.js is loaded before shop.js.');
    return;
  }
  if (!Catalog || !Array.isArray(Catalog.items)) {
    console.error('[shop.js] window.ShopCatalog not found. Ensure shop_catalog.js is loaded before shop.js.');
    return;
  }

  const Shop = (window.Shop = window.Shop || {});

  Shop.owned = {};
  Shop.equipped = {};

  Shop.activeTab = 'stats';
  Shop.searchText = '';
  Shop.ownedOnly = false;

  function persistUI() {}
  function saveOwned() {}
  function saveEquipped() {}


  function getItemById(id) {
    return Catalog.items.find((x) => x.id === id) || null;
  }

  function hasReqs(item) {
    const req = item.requires || [];
    for (const r of req) if (!Shop.owned[r]) return false;
    return true;
  }

  function emptyBuild() {

    return {
      stats: {
        playerSpeedMultAdd: 0,
        maxHealthAdd: 0,
        damageReductionAdd: 0,
        regenAdd: 0,
        invincibilityAdd: 0,
        coinMultAdd: 0,
      },
      weapons: {
        damageAdd: 0,
        damageMultAdd: 0,
        damageMultMul: 1,

        fireCooldownMul: 1,
        fireCooldownReduction: 0,

        bulletSpeedMul: 1,
        bulletSpeedMultAdd: 0,

        bulletTTLAdd: 0,

        multishotAdd: 0,
        spreadAdd: 0,

        pierceAdd: 0,
        bounceAdd: 0,
        homingAdd: 0,

        critChanceAdd: 0,
        critMultAdd: 0,

        explosiveChanceAdd: 0,
        explosiveRadiusAdd: 0,

        burnDpsAdd: 0,
        burnDurationAdd: 0,

        poisonDpsAdd: 0,
        poisonDurationAdd: 0,

        slowChanceAdd: 0,
        slowPercentAdd: 0,
        slowDurationAdd: 0,

        knockbackAdd: 0,
      },
      cosmetics: {
        playerSkinClass: '',
        bulletSkinClass: '',
        crosshairClass: 'crosshair--dot',
        trailClass: '',
      },
    };
  }


  function applyEffect(build, effect) {
    if (!effect || typeof effect !== 'object') return;

    const s = build.stats;
    const w = build.weapons;

    if (typeof effect.playerSpeedMultAdd === 'number') s.playerSpeedMultAdd += effect.playerSpeedMultAdd;
    if (typeof effect.maxHealthAdd === 'number') s.maxHealthAdd += effect.maxHealthAdd;
    if (typeof effect.damageReductionAdd === 'number') s.damageReductionAdd += effect.damageReductionAdd;
    if (typeof effect.regenAdd === 'number') s.regenAdd += effect.regenAdd;
    if (typeof effect.invincibilityAdd === 'number') s.invincibilityAdd += effect.invincibilityAdd;
    if (typeof effect.coinMultAdd === 'number') s.coinMultAdd += effect.coinMultAdd;

    if (typeof effect.damageAdd === 'number') w.damageAdd += effect.damageAdd;
    if (typeof effect.damageMultAdd === 'number') w.damageMultAdd += effect.damageMultAdd;
    if (typeof effect.damageMultMul === 'number') w.damageMultMul *= effect.damageMultMul;

    if (typeof effect.fireCooldownMul === 'number') w.fireCooldownMul *= effect.fireCooldownMul;
    if (typeof effect.fireCooldownReduction === 'number') w.fireCooldownReduction += effect.fireCooldownReduction;
    if (typeof effect.fireCooldownReductionAdd === 'number') w.fireCooldownReduction += effect.fireCooldownReductionAdd;

    if (typeof effect.bulletSpeedMul === 'number') w.bulletSpeedMul *= effect.bulletSpeedMul;
    if (typeof effect.bulletSpeedMultAdd === 'number') w.bulletSpeedMultAdd += effect.bulletSpeedMultAdd;

    if (typeof effect.bulletTTLAdd === 'number') w.bulletTTLAdd += effect.bulletTTLAdd;

    if (typeof effect.multishotAdd === 'number') w.multishotAdd += effect.multishotAdd;
    if (typeof effect.spreadAdd === 'number') w.spreadAdd += effect.spreadAdd;

    if (typeof effect.pierceAdd === 'number') w.pierceAdd += effect.pierceAdd;
    if (typeof effect.bounceAdd === 'number') w.bounceAdd += effect.bounceAdd;
    if (typeof effect.homingAdd === 'number') w.homingAdd += effect.homingAdd;

    if (typeof effect.critChanceAdd === 'number') w.critChanceAdd += effect.critChanceAdd;
    if (typeof effect.critMultAdd === 'number') w.critMultAdd += effect.critMultAdd;

    if (typeof effect.explosiveChanceAdd === 'number') w.explosiveChanceAdd += effect.explosiveChanceAdd;
    if (typeof effect.explosiveRadiusAdd === 'number') w.explosiveRadiusAdd += effect.explosiveRadiusAdd;

    if (typeof effect.burnDpsAdd === 'number') w.burnDpsAdd += effect.burnDpsAdd;
    if (typeof effect.burnDurationAdd === 'number') w.burnDurationAdd += effect.burnDurationAdd;

    if (typeof effect.poisonDpsAdd === 'number') w.poisonDpsAdd += effect.poisonDpsAdd;
    if (typeof effect.poisonDurationAdd === 'number') w.poisonDurationAdd += effect.poisonDurationAdd;

    if (typeof effect.slowChanceAdd === 'number') w.slowChanceAdd += effect.slowChanceAdd;
    if (typeof effect.slowPercentAdd === 'number') w.slowPercentAdd += effect.slowPercentAdd;
    if (typeof effect.slowDurationAdd === 'number') w.slowDurationAdd += effect.slowDurationAdd;

    if (typeof effect.knockbackAdd === 'number') w.knockbackAdd += effect.knockbackAdd;
  }

  function computeBuild() {
    const build = emptyBuild();

    for (const id of Object.keys(Shop.owned)) {
      if (!Shop.owned[id]) continue;
      const item = getItemById(id);
      if (!item) continue;
      if (item.section !== 'cosmetics') {
        applyEffect(build, item.effect);
      }
    }

    const idPrefixBySlot = {
      playerSkin: 'cos_skin',
      bulletSkin: 'cos_bullet',
      crosshair: 'cos_crosshair',
      trail: 'cos_trail',
    };

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

    for (const slot of (Catalog.cosmeticSlots || []).map((s) => s.slot)) {
      const value = Shop.equipped[slot];
      if (!value) continue;

      const prefix = idPrefixBySlot[slot] || `cos_${slot}`;
      const itemId = `${prefix}_${value}`;

      if (!Shop.owned[itemId]) continue;

      if (slot === 'playerSkin') {
        build.cosmetics.playerSkinClass = skinValueToClass[value] || `skin-${value}`;
      } else if (slot === 'bulletSkin') {
        build.cosmetics.bulletSkinClass = `bullet--${value}`;
      } else if (slot === 'crosshair') {
        build.cosmetics.crosshairClass = `crosshair--${value}`;
      } else if (slot === 'trail') {
        build.cosmetics.trailClass = (value === 'none') ? '' : `bullet--trail-${value}`;
      }
    }

    return build;
  }

  Shop.apply = function (opts) {
    const options = opts || {};
    const build = computeBuild();
    Engine.applyBuild(build);

    if (options && options.healFull) Engine.setHealthToFull();
    refreshUI();
  };

  const overlay = document.getElementById('shopOverlay');
  const itemsEl = document.getElementById('shopItems');
  const coinsLabel = document.getElementById('shopCoinsLabel');
  const openBtn = document.getElementById('openShopBtn');
  const closeBtn = document.getElementById('shopCloseBtn');
  const resetBtn = document.getElementById('shopResetBtn');

  const tabsEl = document.getElementById('shopTabs');
  const hintEl = document.getElementById('shopHint');
  const searchEl = document.getElementById('shopSearch');
  const ownedOnlyBtn = document.getElementById('shopOwnedOnly');
  const equippedEl = document.getElementById('shopEquipped');

  function setOverlayVisible(isVisible) {
    if (!overlay) return;
    overlay.classList.toggle('hidden', !isVisible);
    overlay.setAttribute('aria-hidden', String(!isVisible));
  }

  Shop.isOpen = function () {
    return overlay ? !overlay.classList.contains('hidden') : false;
  };

  Shop.open = function () {
    if (!overlay) return;
    if (Engine.gameOver) return;
    const run = (typeof Engine.ensureRunState === 'function') ? Engine.ensureRunState() : null;
    if (run && !run.started) return;
    Engine.setPaused(true);
    Engine.setStatusMessage('Shop open (simulation paused)');
    setOverlayVisible(true);
    Shop.apply();
  };

  Shop.close = function () {
    if (!overlay) return;
    setOverlayVisible(false);
    Engine.setPaused(false);
    Engine.setStatusMessage('');
  };

  Shop.toggle = function () {
    if (Shop.isOpen()) Shop.close();
    else Shop.open();
  };

  function renderCoins() {
    if (!coinsLabel) return;
    coinsLabel.innerText = `Coins: ${Engine.coins}`;
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function formatEquipped() {
    const slots = Catalog.cosmeticSlots || [];
    const parts = [];
    for (const s of slots) {
      const val = Shop.equipped[s.slot] || (s.slot === 'crosshair' ? 'dot' : s.slot === 'trail' ? 'none' : 'default');
      parts.push(`${s.label}: ${val}`);
    }
    return parts.join(' · ');
  }

  function setActiveTab(tabId) {
    Shop.activeTab = tabId;
    persistUI();

    if (tabsEl) {
      for (const btn of Array.from(tabsEl.querySelectorAll('button[data-tab]'))) {
        btn.classList.toggle('isActive', btn.dataset.tab === tabId);
      }
    }

    const section = (Catalog.sections || []).find((s) => s.id === tabId);
    if (hintEl) hintEl.textContent = section ? section.hint : '';

    refreshUI();
  }

  function matchesSearch(item, q) {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      String(item.name || '').toLowerCase().includes(s) ||
      String(item.desc || '').toLowerCase().includes(s)
    );
  }

  
function fmtReason(reason) {
  const r = String(reason || '');
  if (r === 'coins') return 'Not enough coins';
  if (r === 'requires') return 'Missing prerequisites';
  if (r === 'requiresAny') return 'Choose a Tier-1 identity first';
  if (r === 'branch_locked') return 'Branch locked';
  if (r === 'excluded') return 'Excluded by choice';
  if (r === 'not_owned') return 'Weapon not owned';
  if (r === 'no_token') return 'No token';
  if (r === 'unlocked') return 'Already unlocked';
  return 'Unavailable';
}

function sortWeaponDefs(defs) {
  return defs.slice().sort((a, b) => {
    const ca = Math.floor(a.cost || 0);
    const cb = Math.floor(b.cost || 0);
    if (ca !== cb) return ca - cb;
    return String(a.name || a.id).localeCompare(String(b.name || b.id));
  });
}

function renderWorkshop() {
  if (!itemsEl) return;
  itemsEl.innerHTML = '';

  const run = (typeof Engine.ensureRunState === 'function') ? Engine.ensureRunState() : { refitTokens: 0, resetTokens: 0 };
  const wrap = createEl('div', 'workshopWrap');

  const topLine = createEl('div', 'workshopTopLine');
  const left = createEl('div');
  left.textContent = `Coins: ${Engine.coins} · Refit Tokens: ${run.refitTokens} (next @ ${run.nextRefitAt || 25}) · Reset Tokens: ${run.resetTokens} (next @ ${run.nextResetAt || 100})`;
  const right = createEl('div');
  right.textContent = 'Workshop is run-only (no persistence).';
  topLine.appendChild(left);
  topLine.appendChild(right);
  wrap.appendChild(topLine);

  const market = createEl('div', 'workshopSection');
  market.appendChild(createEl('div', 'workshopSectionTitle', 'Weapon Market'));
  const marketGrid = createEl('div', 'workshopGrid');

  const defs = (typeof Engine.listWeaponDefs === 'function') ? sortWeaponDefs(Engine.listWeaponDefs()) : [];
  for (const def of defs) {
    if (!def || !def.id) continue;
    const owned = (typeof Engine.isWeaponOwned === 'function') ? Engine.isWeaponOwned(def.id) : false;

    const card = createEl('div', 'workshopCard');
    const top = createEl('div', 'workshopCardTop');
    top.appendChild(createEl('div', 'workshopCardName', def.name || def.id));
    top.appendChild(createEl('div', '', owned ? 'Owned' : `Cost: ${Math.floor(def.cost || 0)}`));
    card.appendChild(top);
    card.appendChild(createEl('div', 'workshopCardDesc', def.desc || ''));

    const row = createEl('div', 'workshopRow');
    if (!owned) {
      const buyBtn = createEl('button', 'uiBtn', `Buy (${Math.floor(def.cost || 0)})`);
      buyBtn.disabled = Engine.coins < Math.floor(def.cost || 0);
      buyBtn.addEventListener('click', () => {
        const res = Engine.buyWeaponBase(def.id);
        if (!res.ok) Engine.setStatusMessage(`Cannot buy: ${fmtReason(res.reason)}`);
        renderCoins();
        renderItems();
      });
      row.appendChild(buyBtn);

      if ((run.refitTokens || 0) > 0) {
        const buyP = createEl('button', 'uiBtn', 'Buy+Refit Primary (1)');
        buyP.disabled = Engine.coins < Math.floor(def.cost || 0);
        buyP.addEventListener('click', () => {
          const res = Engine.refitWeaponSlot('primary', def.id, { autoBuy: true });
          if (!res.ok) Engine.setStatusMessage(`Refit failed: ${fmtReason(res.reason)}`);
          renderCoins();
          renderItems();
        });
        row.appendChild(buyP);

        const buyS = createEl('button', 'uiBtn', 'Buy+Refit Secondary (1)');
        buyS.disabled = Engine.coins < Math.floor(def.cost || 0);
        buyS.addEventListener('click', () => {
          const res = Engine.refitWeaponSlot('secondary', def.id, { autoBuy: true });
          if (!res.ok) Engine.setStatusMessage(`Refit failed: ${fmtReason(res.reason)}`);
          renderCoins();
          renderItems();
        });
        row.appendChild(buyS);
      }
    } else {
      const ownedTag = createEl('div', 'workshopCardMeta', 'Owned in this run');
      card.appendChild(ownedTag);
    }

    if (row.childNodes.length) card.appendChild(row);
    marketGrid.appendChild(card);
  }
  market.appendChild(marketGrid);
  wrap.appendChild(market);

  const loadout = createEl('div', 'workshopSection');
  loadout.appendChild(createEl('div', 'workshopSectionTitle', 'Loadout Refit'));
  loadout.appendChild(createEl('div', 'workshopCardDesc', 'Refit replaces exactly one slot per Refit Token (earned every 25 Threat).'));

  const ownedIds = (typeof Engine.getOwnedWeaponIds === 'function') ? Engine.getOwnedWeaponIds() : [];
  const ownedDefs = defs.filter((d) => ownedIds.includes(d.id));
  const byName = ownedDefs.slice().sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id)));

  const primaryW = Engine.getWeapon('primary');
  const secondaryW = Engine.getWeapon('secondary');

  function makeSelect(currentId) {
    const sel = createEl('select', 'workshopSelect');
    for (const d of byName) {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.name || d.id;
      if (d.id === currentId) opt.selected = true;
      sel.appendChild(opt);
    }
    return sel;
  }

  const row1 = createEl('div', 'workshopRow');
  row1.appendChild(createEl('div', '', `Primary: ${primaryW && primaryW.id ? primaryW.id : ''}`));
  const selP = makeSelect(primaryW.id);
  row1.appendChild(selP);
  const btnP = createEl('button', 'uiBtn', 'Refit Primary (1)');
  btnP.disabled = (run.refitTokens || 0) <= 0;
  btnP.addEventListener('click', () => {
    const target = selP.value;
    const res = Engine.refitWeaponSlot('primary', target, { autoBuy: false });
    if (!res.ok) Engine.setStatusMessage(`Refit failed: ${fmtReason(res.reason)}`);
    renderCoins(); renderItems();
  });
  row1.appendChild(btnP);
  loadout.appendChild(row1);

  const row2 = createEl('div', 'workshopRow');
  row2.appendChild(createEl('div', '', `Secondary: ${secondaryW && secondaryW.id ? secondaryW.id : ''}`));
  const selS = makeSelect(secondaryW.id);
  row2.appendChild(selS);
  const btnS = createEl('button', 'uiBtn', 'Refit Secondary (1)');
  btnS.disabled = (run.refitTokens || 0) <= 0;
  btnS.addEventListener('click', () => {
    const target = selS.value;
    const res = Engine.refitWeaponSlot('secondary', target, { autoBuy: false });
    if (!res.ok) Engine.setStatusMessage(`Refit failed: ${fmtReason(res.reason)}`);
    renderCoins(); renderItems();
  });
  row2.appendChild(btnS);
  loadout.appendChild(row2);

  wrap.appendChild(loadout);

  const treeSec = createEl('div', 'workshopSection');
  treeSec.appendChild(createEl('div', 'workshopSectionTitle', 'Weapon Tech Tree'));
  treeSec.appendChild(createEl('div', 'workshopCardDesc', 'Trees are per-weapon. Buying nodes affects that weapon whenever it’s equipped.'));

  if (!Shop.workshopWeaponId) Shop.workshopWeaponId = primaryW.id;

  const treePickRow = createEl('div', 'workshopRow');
  treePickRow.appendChild(createEl('div', '', 'View tree:'));
  const treeSel = createEl('select', 'workshopSelect');
  for (const d of byName) {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.name || d.id;
    if (d.id === Shop.workshopWeaponId) opt.selected = true;
    treeSel.appendChild(opt);
  }
  treeSel.addEventListener('change', () => {
    Shop.workshopWeaponId = treeSel.value;
    renderItems();
  });
  treePickRow.appendChild(treeSel);
  treeSec.appendChild(treePickRow);

  const weaponId = Shop.workshopWeaponId;
  const treeDef = Engine.getWeaponTreeDef ? Engine.getWeaponTreeDef(weaponId) : null;
  const treeState = Engine.ensureWeaponTreeState ? Engine.ensureWeaponTreeState(weaponId) : { unlocked: {}, spentCoins: 0 };

  const summary = createEl('div', 'workshopCardMeta', `Unlocked: ${Object.keys(treeState.unlocked || {}).length} · Spent: ${treeState.spentCoins || 0}`);
  treeSec.appendChild(summary);

  if (!treeDef) {
    treeSec.appendChild(createEl('div', 'workshopCardDesc', 'No tree data found for this weapon.'));
  } else {
    const nodes = treeDef.nodes || [];
    const byTier = {};
    for (const n of nodes) {
      const t = Math.max(1, Math.floor(n.tier || 1));
      if (!byTier[t]) byTier[t] = [];
      byTier[t].push(n);
    }

    const tiers = Object.keys(byTier).map((x) => parseInt(x, 10)).sort((a, b) => a - b);
    for (const t of tiers) {
      treeSec.appendChild(createEl('div', 'workshopTierTitle', `Tier ${t}`));
      const grid = createEl('div', 'workshopTreeGrid');

      const list = byTier[t].slice().sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id)));
      for (const node of list) {
        const unlocked = Engine.isWeaponNodeUnlocked && Engine.isWeaponNodeUnlocked(weaponId, node.id);
        const card = createEl('div', 'workshopNode' + (unlocked ? ' isUnlocked' : ''));
        card.appendChild(createEl('div', 'workshopNodeTitle', node.name || node.id));
        card.appendChild(createEl('div', 'workshopNodeDesc', node.desc || ''));
        card.appendChild(createEl('div', 'workshopNodeMeta', `Cost: ${Math.floor(node.cost || 0)}`));

        const row = createEl('div', 'workshopRow');
        if (unlocked) {
          row.appendChild(createEl('div', '', 'Unlocked'));
        } else {
          const can = Engine.canUnlockWeaponNode ? Engine.canUnlockWeaponNode(weaponId, node.id) : { ok: false, reason: 'invalid' };
          const btn = createEl('button', 'uiBtn', 'Unlock');
          btn.disabled = !can.ok;
          btn.title = can.ok ? '' : fmtReason(can.reason);
          btn.addEventListener('click', () => {
            const res = Engine.unlockWeaponNode(weaponId, node.id);
            if (!res.ok) Engine.setStatusMessage(`Unlock failed: ${fmtReason(res.reason)}`);
            renderCoins(); renderItems();
          });
          row.appendChild(btn);
        }
        card.appendChild(row);
        grid.appendChild(card);
      }
      treeSec.appendChild(grid);
    }
  }

  const resetRow = createEl('div', 'workshopRow');
  const resetBtn = createEl('button', 'uiBtn uiBtnDanger', 'Reset This Tree (1)');
  resetBtn.disabled = (run.resetTokens || 0) <= 0 || !(treeState && Object.keys(treeState.unlocked || {}).length > 0);
  resetBtn.addEventListener('click', () => {
    const res = Engine.resetWeaponTree(weaponId);
    if (!res.ok) Engine.setStatusMessage(`Reset failed: ${fmtReason(res.reason)}`);
    else Engine.setStatusMessage(`Tree reset. Refunded ${res.refund} coins.`);
    renderCoins(); renderItems();
  });
  resetRow.appendChild(resetBtn);
  resetRow.appendChild(createEl('div', 'workshopCardMeta', `Reset Tokens: ${run.resetTokens}`));
  treeSec.appendChild(resetRow);

  wrap.appendChild(treeSec);

  const globalSec = createEl('div', 'workshopSection');
  globalSec.appendChild(createEl('div', 'workshopSectionTitle', 'Global Weapon Mods'));
  globalSec.appendChild(createEl('div', 'workshopCardDesc', 'These apply to all weapons. (Legacy shop upgrades retained for flexibility.)'));

  const q = (Shop.searchText || '').trim();
  const list = Catalog.items
    .filter((it) => it.section === 'weapons')
    .filter((it) => matchesSearch(it, q))
    .filter((it) => (Shop.ownedOnly ? !!Shop.owned[it.id] : true));

  for (const item of list) {
    const owned = !!Shop.owned[item.id];
    const reqOk = hasReqs(item);
    const affordable = Engine.coins >= item.cost;

    const card = createEl('div', 'shopItem');

    const top = createEl('div', 'shopItemTop');
    const left = createEl('div');
    left.appendChild(createEl('div', 'shopItemName', item.name));
    left.appendChild(createEl('div', 'shopItemDesc', item.desc || ''));
    top.appendChild(left);

    const right = createEl('div', 'shopItemRight');
    right.appendChild(createEl('div', 'shopItemCost', `${item.cost}c`));

    const btn = createEl('button', 'uiBtn', owned ? 'Owned' : 'Buy');
    btn.disabled = owned || !reqOk || !affordable;
    btn.addEventListener('click', () => {
      Shop.buy(item.id);
      renderCoins();
      renderItems();
    });

    right.appendChild(btn);
    top.appendChild(right);

    card.appendChild(top);

    if (item.requires && item.requires.length) {
      card.appendChild(createEl('div', 'shopItemReq', `Requires: ${item.requires.join(', ')}`));
    }

    marketGrid && marketGrid;
    globalSec.appendChild(card);
  }

  wrap.appendChild(globalSec);

  itemsEl.appendChild(wrap);
}

function renderItems() {
    if (!itemsEl) return;
    itemsEl.innerHTML = '';

if (Shop.activeTab === 'weapons') {
  renderWorkshop();
  return;
}



    const q = (Shop.searchText || '').trim();

    const list = Catalog.items
      .filter((it) => it.section === Shop.activeTab)
      .filter((it) => matchesSearch(it, q))
      .filter((it) => (Shop.ownedOnly ? !!Shop.owned[it.id] : true));

    for (const item of list) {
      const owned = !!Shop.owned[item.id];
      const reqOk = hasReqs(item);
      const affordable = Engine.coins >= item.cost;

      const card = createEl('div', 'shopItem');

      const top = createEl('div', 'shopItemTop');
      const left = createEl('div');
      left.appendChild(createEl('div', 'shopItemName', item.name));
      left.appendChild(createEl('div', 'shopItemDesc', item.desc));
      top.appendChild(left);

      let tagText = '';
      let tagClass = 'tag';
      if (owned) {
        if (item.section === 'cosmetics') {
          const isEquipped = item.slot && Shop.equipped[item.slot] === item.value;
          tagText = isEquipped ? 'Equipped' : 'Owned';
        } else {
          tagText = 'Owned';
        }
        tagClass += ' tagOwned';
      } else if (!reqOk) {
        tagText = 'Locked';
        tagClass += ' tagLocked';
      } else {
        tagText = affordable ? 'Ready' : 'Pricey';
      }

      top.appendChild(createEl('div', tagClass, tagText));
      card.appendChild(top);

      card.appendChild(createEl('div', 'shopItemMeta', `Cost: ${item.cost} coins`));

      if (!reqOk && !owned) {
        const req = (item.requires || []).map((r) => {
          const it = getItemById(r);
          return it ? it.name : r;
        });
        if (req.length) card.appendChild(createEl('div', 'shopItemDesc', `Requires: ${req.join(', ')}`));
      }

      const actions = createEl('div', 'shopItemActions');

      if (!owned) {
        const buy = createEl('button', 'uiBtn', affordable ? 'Buy' : 'Need coins');
        buy.type = 'button';
        buy.disabled = !affordable || !reqOk;
        buy.addEventListener('click', () => {
          if (!hasReqs(item)) return;
          if (!Engine.spendCoins(item.cost)) return;

          Shop.owned[item.id] = true;
          saveOwned();

          if (item.section === 'cosmetics' && item.slot && item.value) {
            Shop.equipped[item.slot] = item.value;
            saveEquipped();
          }

          const healFull = !!(item.onBuy && item.onBuy.healFull);
          Shop.apply({ healFull });
        });
        actions.appendChild(buy);
      } else {
        if (item.section === 'cosmetics') {
          const isEquipped = item.slot && Shop.equipped[item.slot] === item.value;
          const equip = createEl('button', 'uiBtn', isEquipped ? 'Equipped' : 'Equip');
          equip.type = 'button';
          equip.disabled = isEquipped;
          equip.addEventListener('click', () => {
            if (!item.slot || !item.value) return;
            Shop.equipped[item.slot] = item.value;
            saveEquipped();
            Shop.apply();
          });
          actions.appendChild(equip);

          const clear = createEl('button', 'uiBtn', 'Default');
          clear.type = 'button';
          clear.addEventListener('click', () => {
            if (!item.slot) return;
            delete Shop.equipped[item.slot];
            saveEquipped();
            Shop.apply();
          });
          actions.appendChild(clear);
        } else {
          const ownedBtn = createEl('button', 'uiBtn', 'Owned');
          ownedBtn.type = 'button';
          ownedBtn.disabled = true;
          actions.appendChild(ownedBtn);
        }
      }

      card.appendChild(actions);
      itemsEl.appendChild(card);
    }

    if (!list.length) {
      const empty = createEl('div', 'shopItem');
      empty.appendChild(createEl('div', 'shopItemName', 'No items found'));
      empty.appendChild(createEl('div', 'shopItemDesc', 'Try another tab, clear search, or toggle Owned Only.'));
      itemsEl.appendChild(empty);
    }
  }

  function refreshUI() {
    renderCoins();
    renderItems();
    if (equippedEl) equippedEl.textContent = formatEquipped();

    if (searchEl && searchEl.value !== Shop.searchText) searchEl.value = Shop.searchText;
    if (ownedOnlyBtn) ownedOnlyBtn.classList.toggle('isActive', Shop.ownedOnly);

    Engine.renderCoins();
  }

  if (openBtn) openBtn.addEventListener('click', () => Shop.toggle());
  if (closeBtn) closeBtn.addEventListener('click', () => Shop.close());

  if (tabsEl) {
    tabsEl.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('button[data-tab]') : null;
      if (!btn) return;
      setActiveTab(btn.dataset.tab);
    });
  }

  if (searchEl) {
    searchEl.value = Shop.searchText;
    searchEl.addEventListener('input', () => {
      Shop.searchText = searchEl.value;
      persistUI();
      refreshUI();
    });
  }

  if (ownedOnlyBtn) {
    ownedOnlyBtn.addEventListener('click', () => {
      Shop.ownedOnly = !Shop.ownedOnly;
      persistUI();
      refreshUI();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) Shop.close();
    });
  }
  if (resetBtn) {
    let resetArmedUntil = 0;
    let resetArmTimer = null;

    function disarmReset() {
      resetArmedUntil = 0;
      if (resetArmTimer) {
        clearTimeout(resetArmTimer);
        resetArmTimer = null;
      }
      resetBtn.classList.remove('isArmed');
      resetBtn.textContent = 'Reset Run';
    }

    function doResetRun() {
      Shop.owned = {};
      Shop.equipped = {};
      saveOwned();
      saveEquipped();

      Engine.setCoins(0);
      Shop.apply({ healFull: true });
    }

    resetBtn.addEventListener('click', () => {
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

      if (resetArmedUntil && now <= resetArmedUntil) {
        doResetRun();
        Engine.setStatusMessage('Run reset. Fresh wipe applied.');
        disarmReset();
        return;
      }

      resetArmedUntil = now + 2500;
      resetBtn.classList.add('isArmed');
      resetBtn.textContent = 'Confirm Reset';
      Engine.setStatusMessage('Press Reset Run again to confirm (2.5s).');

      if (resetArmTimer) clearTimeout(resetArmTimer);
      resetArmTimer = setTimeout(() => {
        const t = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (resetArmedUntil && t > resetArmedUntil) disarmReset();
      }, 2600);
    });
  }


window.addEventListener('run:reset', () => {
  Shop.owned = {};
  Shop.equipped = {};
  saveOwned();
  saveEquipped();

  Engine.setCoins(0);
  Shop.apply({ healFull: true });

  if (Shop.isOpen && Shop.isOpen()) Shop.close();
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyB') {
      e.preventDefault();
      const run = (typeof Engine.ensureRunState === 'function') ? Engine.ensureRunState() : null;
      if (!Engine.gameOver && (!run || run.started)) Shop.toggle();
    }

    if (e.code === 'Escape' && Shop.isOpen()) {
      e.preventDefault();
      Shop.close();
    }
  });

  setActiveTab(Shop.activeTab);
  Shop.apply({ healFull: true });
})();
