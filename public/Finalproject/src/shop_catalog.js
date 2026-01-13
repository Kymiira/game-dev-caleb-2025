// shop_catalog.js
(() => {
  const C = (window.ShopCatalog = window.ShopCatalog || {});

  C.sections = [
    { id: 'stats', label: 'Stat Upgrades', hint: 'Permanent upgrades to mobility, survivability, and economy.' },
    { id: 'weapons', label: 'Weapon Upgrades', hint: 'Permanent upgrades to your primary weapon.' },
    { id: 'cosmetics', label: 'Cosmetics', hint: 'Visual customization (equip from this tab).' },
  ];

  C.cosmeticSlots = [
    { slot: 'playerSkin', label: 'Player Skin' },
    { slot: 'bulletSkin', label: 'Bullet Skin' },
    { slot: 'crosshair', label: 'Crosshair' },
    { slot: 'trail', label: 'Trail' },
  ];

  function tierId(prefix, t) { return `${prefix}_${t}`; }

  const items = [];

  for (let t = 1; t <= 5; t++) {
    items.push({
      id: tierId('stat_speed', t),
      section: 'stats',
      kind: 'upgrade',
      name: `Movement Speed ${t}`,
      cost: 90 + t * 85,
      requires: t === 1 ? [] : [tierId('stat_speed', t - 1)],
      desc: `Increase movement speed (+${t * 4}%).`,
      effect: { playerSpeedMultAdd: 0.04 },
    });
  }

  for (let t = 1; t <= 5; t++) {
    items.push({
      id: tierId('stat_hp', t),
      section: 'stats',
      kind: 'upgrade',
      name: `Max Health ${t}`,
      cost: 110 + t * 95,
      requires: t === 1 ? [] : [tierId('stat_hp', t - 1)],
      desc: `Increase max health (+${10 + t * 2}).`,
      effect: { maxHealthAdd: 10 + t * 2 },
      onBuy: { healFull: true },
    });
  }

  for (let t = 1; t <= 5; t++) {
    items.push({
      id: tierId('stat_armor', t),
      section: 'stats',
      kind: 'upgrade',
      name: `Armor Plating ${t}`,
      cost: 120 + t * 110,
      requires: t === 1 ? [] : [tierId('stat_armor', t - 1)],
      desc: `Reduce incoming damage (+${(t * 3)}% damage reduction).`,
      effect: { damageReductionAdd: 0.03 },
    });
  }

  for (let t = 1; t <= 5; t++) {
    items.push({
      id: tierId('stat_regen', t),
      section: 'stats',
      kind: 'upgrade',
      name: `Regeneration ${t}`,
      cost: 130 + t * 120,
      requires: t === 1 ? [] : [tierId('stat_regen', t - 1)],
      desc: `Passive healing (+${(0.35 + t * 0.15).toFixed(2)} HP/sec).`,
      effect: { regenAdd: 0.35 + t * 0.15 },
    });
  }

  for (let t = 1; t <= 3; t++) {
    items.push({
      id: tierId('stat_iframes', t),
      section: 'stats',
      kind: 'upgrade',
      name: `Impact Buffer ${t}`,
      cost: 160 + t * 140,
      requires: t === 1 ? [] : [tierId('stat_iframes', t - 1)],
      desc: `Longer invincibility after hit (+${(t * 0.10).toFixed(2)}s).`,
      effect: { invincibilityAdd: 0.10 },
    });
  }

  for (let t = 1; t <= 5; t++) {
    items.push({
      id: tierId('stat_greed', t),
      section: 'stats',
      kind: 'upgrade',
      name: `Greed ${t}`,
      cost: 140 + t * 130,
      requires: t === 1 ? [] : [tierId('stat_greed', t - 1)],
      desc: `More coins per kill (+${(t * 6)}%).`,
      effect: { coinMultAdd: 0.06 },
    });
  }

  for (let t = 1; t <= 5; t++) {
    items.push({
      id: tierId('wep_dmg', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Damage ${t}`,
      cost: 95 + t * 100,
      requires: t === 1 ? [] : [tierId('wep_dmg', t - 1)],
      desc: `Increase bullet damage (+${(0.35 + t * 0.10).toFixed(2)}).`,
      effect: { damageAdd: 0.35 + t * 0.10 },
    });
  }

  for (let t = 1; t <= 5; t++) {
    items.push({
      id: tierId('wep_firerate', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Fire Rate ${t}`,
      cost: 110 + t * 105,
      requires: t === 1 ? [] : [tierId('wep_firerate', t - 1)],
      desc: `Shoot faster (-${(t * 5)}% cooldown).`,
      effect: { fireCooldownMul: 0.95 },
    });
  }

  for (let t = 1; t <= 3; t++) {
    items.push({
      id: tierId('wep_bulletspeed', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Bullet Velocity ${t}`,
      cost: 120 + t * 120,
      requires: t === 1 ? [] : [tierId('wep_bulletspeed', t - 1)],
      desc: `Bullets travel faster (+${(t * 10)}%).`,
      effect: { bulletSpeedMul: 1.10 },
    });
  }

  for (let t = 1; t <= 3; t++) {
    items.push({
      id: tierId('wep_multishot', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Multishot ${t}`,
      cost: 175 + t * 170,
      requires: t === 1 ? [] : [tierId('wep_multishot', t - 1)],
      desc: `Fire additional projectiles (+1 shot).`,
      effect: { multishotAdd: 1, spreadAdd: 0.02 },
    });
  }

  for (let t = 1; t <= 3; t++) {
    items.push({
      id: tierId('wep_pierce', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Piercing Rounds ${t}`,
      cost: 165 + t * 165,
      requires: t === 1 ? [] : [tierId('wep_pierce', t - 1)],
      desc: `Bullets pierce (+1 enemy).`,
      effect: { pierceAdd: 1 },
    });
  }

  for (let t = 1; t <= 3; t++) {
    items.push({
      id: tierId('wep_crit', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Crit Kit ${t}`,
      cost: 155 + t * 170,
      requires: t === 1 ? [] : [tierId('wep_crit', t - 1)],
      desc: `Critical chance +${(t * 3)}% and crit damage +0.2.`,
      effect: { critChanceAdd: 0.03, critMultAdd: 0.20 },
    });
  }

  for (let t = 1; t <= 3; t++) {
    items.push({
      id: tierId('wep_explosive', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Explosive Rounds ${t}`,
      cost: 210 + t * 210,
      requires: t === 1 ? [] : [tierId('wep_explosive', t - 1)],
      desc: `Chance to explode on hit (+${(t * 5)}% chance, +${(t * 20)} radius).`,
      effect: { explosiveChanceAdd: 0.05, explosiveRadiusAdd: 20 },
    });
  }

  for (let t = 1; t <= 2; t++) {
    items.push({
      id: tierId('wep_burn', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Incendiary ${t}`,
      cost: 220 + t * 230,
      requires: t === 1 ? [] : [tierId('wep_burn', t - 1)],
      desc: `Burn damage over time (+${(t * 3)} DPS, +${(t)}s).`,
      effect: { burnDpsAdd: 3, burnDurationAdd: 1 },
    });
  }

  for (let t = 1; t <= 2; t++) {
    items.push({
      id: tierId('wep_poison', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Toxic Coating ${t}`,
      cost: 220 + t * 230,
      requires: t === 1 ? [] : [tierId('wep_poison', t - 1)],
      desc: `Poison damage over time (+${(t * 2)} DPS, +${(t * 2)}s).`,
      effect: { poisonDpsAdd: 2, poisonDurationAdd: 2 },
    });
  }

  for (let t = 1; t <= 2; t++) {
    items.push({
      id: tierId('wep_cryo', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Cryo Tips ${t}`,
      cost: 200 + t * 220,
      requires: t === 1 ? [] : [tierId('wep_cryo', t - 1)],
      desc: `Chance to slow enemies (+${(t * 6)}% chance, ${10 + t * 5}% slow).`,
      effect: { slowChanceAdd: 0.06, slowPercentAdd: 0.05, slowDurationAdd: 0.35 },
    });
  }

  for (let t = 1; t <= 3; t++) {
    items.push({
      id: tierId('wep_homing', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Guidance ${t}`,
      cost: 190 + t * 190,
      requires: t === 1 ? [] : [tierId('wep_homing', t - 1)],
      desc: `Bullets gently home toward enemies.`,
      effect: { homingAdd: 0.40 },
    });
  }

  for (let t = 1; t <= 2; t++) {
    items.push({
      id: tierId('wep_bounce', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Ricochet ${t}`,
      cost: 220 + t * 240,
      requires: t === 1 ? [] : [tierId('wep_bounce', t - 1)],
      desc: `Bullets can bounce to another target (+1 bounce).`,
      effect: { bounceAdd: 1 },
    });
  }

  for (let t = 1; t <= 3; t++) {
    items.push({
      id: tierId('wep_knockback', t),
      section: 'weapons',
      kind: 'upgrade',
      name: `Impact ${t}`,
      cost: 155 + t * 165,
      requires: t === 1 ? [] : [tierId('wep_knockback', t - 1)],
      desc: `Bullets push enemies (+${(t * 40)} force).`,
      effect: { knockbackAdd: 40 },
    });
  }

  const skins = [
    ['neon', 'Neon', 100],
    ['crimson', 'Crimson', 120],
    ['azure', 'Azure', 120],
    ['gold', 'Gold', 160],
    ['void', 'Void', 180],
    ['lime', 'Lime', 120],
    ['rose', 'Rose', 120],
    ['ice', 'Ice', 140],
    ['ember', 'Ember', 140],
    ['mono', 'Monochrome', 110],
  ];

  for (const [id, label, cost] of skins) {
    items.push({
      id: `cos_skin_${id}`,
      section: 'cosmetics',
      kind: 'cosmetic',
      slot: 'playerSkin',
      value: id,
      name: `${label} Skin`,
      cost,
      desc: `Equip the ${label} player skin.`,
    });
  }

  const bullets = [
    ['laser', 'Laser', 110],
    ['plasma', 'Plasma', 130],
    ['spark', 'Spark', 120],
    ['ink', 'Ink', 120],
    ['frost', 'Frost', 130],
  ];

  for (const [id, label, cost] of bullets) {
    items.push({
      id: `cos_bullet_${id}`,
      section: 'cosmetics',
      kind: 'cosmetic',
      slot: 'bulletSkin',
      value: id,
      name: `${label} Bullets`,
      cost,
      desc: `Change bullet visuals to ${label}.`,
    });
  }

  const crosshairs = [
    ['dot', 'Dot', 70],
    ['plus', 'Plus', 90],
    ['circle', 'Circle', 100],
    ['x', 'X', 90],
    ['diamond', 'Diamond', 110],
  ];

  for (const [id, label, cost] of crosshairs) {
    items.push({
      id: `cos_crosshair_${id}`,
      section: 'cosmetics',
      kind: 'cosmetic',
      slot: 'crosshair',
      value: id,
      name: `${label} Crosshair`,
      cost,
      desc: `Equip a ${label}-style crosshair.`,
    });
  }

  const trails = [
    ['none', 'None', 0],
    ['comet', 'Comet Trail', 140],
    ['pixel', 'Pixel Trail', 140],
    ['flame', 'Flame Trail', 160],
  ];

  for (const [id, label, cost] of trails) {
    items.push({
      id: `cos_trail_${id}`,
      section: 'cosmetics',
      kind: 'cosmetic',
      slot: 'trail',
      value: id,
      name: label,
      cost,
      desc: id === 'none' ? 'Disable bullet trail effect.' : `Enable the ${label.toLowerCase()} effect.`,
    });
  }

  C.items = items;
})();
