// enemy_catalog.js
(() => {
  const C = (window.EnemyCatalog = window.EnemyCatalog || {});

  function w(minThreat, maxThreat, min, max) {
    return { minThreat, maxThreat, min, max };
  }

  C.archetypes = {
    grunt: {
      id: 'grunt',
      name: 'Grunt',
      unlock: 1.0,
      weight: w(1, 12, 0.55, 0.30),
      stats: { hp: 1.00, spd: 1.00, sz: 1.00 },
      ai: { id: 'chase', params: {} },
      abilities: {},
      coins: { base: 12, rand: 6, bonus: 0 },
      contactDamageMult: 1.0,
    },
    runner: {
      id: 'runner',
      name: 'Runner',
      unlock: 1.6,
      weight: w(1.6, 12, 0.12, 0.22),
      stats: { hp: 0.70, spd: 1.65, sz: 0.86 },
      ai: { id: 'chase', params: { jitter: 0.14 } },
      abilities: {},
      coins: { base: 12, rand: 6, bonus: 3 },
      contactDamageMult: 0.9,
    },
    tank: {
      id: 'tank',
      name: 'Tank',
      unlock: 2.0,
      weight: w(2.0, 12, 0.08, 0.16),
      stats: { hp: 2.55, spd: 0.74, sz: 1.30 },
      ai: { id: 'chase', params: {} },
      abilities: {},
      coins: { base: 14, rand: 7, bonus: 6 },
      contactDamageMult: 1.25,
    },

    shooter: {
      id: 'shooter',
      name: 'Shooter',
      unlock: 3.0,
      weight: w(3.0, 12, 0.06, 0.18),
      stats: { hp: 1.05, spd: 1.00, sz: 1.00 },
      ai: { id: 'kiter', params: { min: 240, max: 390, strafe: 0.35 } },
      abilities: {
        shoot: { kind: 'bullet', interval: 1.65, intervalScale: -0.05, speedMult: 1.00, damageMult: 1.00 },
      },
      coins: { base: 13, rand: 7, bonus: 5 },
      contactDamageMult: 1.0,
    },
    sniper: {
      id: 'sniper',
      name: 'Sniper',
      unlock: 4.6,
      weight: w(4.6, 12, 0.03, 0.12),
      stats: { hp: 0.90, spd: 0.92, sz: 0.95 },
      ai: { id: 'sniper', params: { min: 520, max: 780, strafe: 0.18 } },
      abilities: {
        shoot: { kind: 'sniper', interval: 2.55, intervalScale: -0.04, speedMult: 1.35, damageMult: 1.8 },
      },
      coins: { base: 14, rand: 7, bonus: 7 },
      contactDamageMult: 0.95,
    },
    bomber: {
      id: 'bomber',
      name: 'Bomber',
      unlock: 5.2,
      weight: w(5.2, 12, 0.03, 0.10),
      stats: { hp: 1.15, spd: 0.95, sz: 1.08 },
      ai: { id: 'kiter', params: { min: 260, max: 430, strafe: 0.22 } },
      abilities: {
        shoot: { kind: 'bomb', interval: 2.7, intervalScale: -0.03, speedMult: 0.75, damageMult: 1.6, explodeRadius: 140 },
      },
      coins: { base: 14, rand: 8, bonus: 9 },
      contactDamageMult: 1.0,
    },

    pulsar: {
      id: 'pulsar',
      name: 'Pulsar',
      unlock: 5.8,
      weight: w(5.8, 12, 0.02, 0.10),
      stats: { hp: 1.75, spd: 0.88, sz: 1.12 },
      ai: { id: 'chase', params: {} },
      abilities: {
        aoe: { interval: 3.1, intervalScale: -0.05, radius: 120, radiusScale: 6, damageMult: 1.0 },
      },
      coins: { base: 14, rand: 8, bonus: 9 },
      contactDamageMult: 1.0,
    },
    charger: {
      id: 'charger',
      name: 'Charger',
      unlock: 6.4,
      weight: w(6.4, 12, 0.02, 0.09),
      stats: { hp: 1.20, spd: 1.10, sz: 1.02 },
      ai: { id: 'charger', params: { dashEvery: 3.0, dashTime: 0.55, dashMult: 2.9 } },
      abilities: {},
      coins: { base: 14, rand: 7, bonus: 7 },
      contactDamageMult: 1.1,
    },
    splitter: {
      id: 'splitter',
      name: 'Splitter',
      unlock: 6.8,
      weight: w(6.8, 12, 0.02, 0.08),
      stats: { hp: 1.35, spd: 0.98, sz: 1.08 },
      ai: { id: 'chase', params: {} },
      abilities: {
        split: { count: 2, child: 'mini' },
      },
      coins: { base: 15, rand: 8, bonus: 10 },
      contactDamageMult: 1.0,
    },
    shielded: {
      id: 'shielded',
      name: 'Shielded',
      unlock: 7.2,
      weight: w(7.2, 12, 0.02, 0.08),
      stats: { hp: 1.10, spd: 0.92, sz: 1.05 },
      ai: { id: 'chase', params: {} },
      abilities: {
        shield: { shieldHp: 10, shieldScale: 1.7, regenPerSec: 1.4, regenDelay: 1.3 },
      },
      coins: { base: 15, rand: 7, bonus: 10 },
      contactDamageMult: 1.05,
    },
    leech: {
      id: 'leech',
      name: 'Leech',
      unlock: 7.8,
      weight: w(7.8, 12, 0.02, 0.07),
      stats: { hp: 1.10, spd: 1.18, sz: 0.96 },
      ai: { id: 'chase', params: { jitter: 0.08 } },
      abilities: {
        leech: { healOnHit: 0.35 },
      },
      coins: { base: 15, rand: 7, bonus: 9 },
      contactDamageMult: 1.0,
    },
    medic: {
      id: 'medic',
      name: 'Medic',
      unlock: 8.4,
      weight: w(8.4, 12, 0.015, 0.06),
      stats: { hp: 1.05, spd: 0.95, sz: 1.02 },
      ai: { id: 'support', params: { preferRadius: 260 } },
      abilities: {
        heal: { interval: 2.6, intervalScale: -0.03, radius: 240, amount: 2 },
      },
      coins: { base: 16, rand: 8, bonus: 12 },
      contactDamageMult: 0.95,
    },
    summoner: {
      id: 'summoner',
      name: 'Summoner',
      unlock: 9.0,
      weight: w(9.0, 12, 0.012, 0.05),
      stats: { hp: 1.15, spd: 0.92, sz: 1.06 },
      ai: { id: 'kiter', params: { min: 320, max: 520, strafe: 0.18 } },
      abilities: {
        summon: { interval: 4.2, intervalScale: -0.05, count: 2, child: 'mini', capNearby: 10, radius: 300 },
      },
      coins: { base: 16, rand: 9, bonus: 14 },
      contactDamageMult: 1.0,
    },

    mini: {
      id: 'mini',
      name: 'Minion',
      unlock: 999,
      weight: w(999, 999, 0, 0),
      stats: { hp: 0.55, spd: 1.45, sz: 0.70 },
      ai: { id: 'chase', params: { jitter: 0.18 } },
      abilities: {},
      coins: { base: 8, rand: 4, bonus: 0 },
      contactDamageMult: 0.75,
    },
  };

  C.list = Object.values(C.archetypes);
})();
