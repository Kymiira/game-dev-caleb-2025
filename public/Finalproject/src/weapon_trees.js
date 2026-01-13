// weapon_trees.js
(() => {
  const WT = (window.WeaponTrees = window.WeaponTrees || {});
  WT.trees = WT.trees || {};

  function node(o) {
    const n = Object.assign(
      {
        id: '',
        tier: 1,
        name: '',
        desc: '',
        cost: 0,
        branchGroup: '',
        requires: [],
        requiresAny: [],
        excludes: [],
        appliesTo: 'both',
        mods: {},
      },
      o || {}
    );

    n.requires = Array.isArray(n.requires) ? n.requires : [];
    n.requiresAny = Array.isArray(n.requiresAny) ? n.requiresAny : [];
    n.excludes = Array.isArray(n.excludes) ? n.excludes : [];
    return n;
  }

  function addTree(weaponId, name, nodes) {
    WT.trees[weaponId] = {
      weaponId,
      name,
      nodes: Array.isArray(nodes) ? nodes : [],
    };
  }

  function makeStandardTree(weaponId, weaponName, kind) {
    const id = (s) => `${weaponId}_${s}`;

    const t1_power = node({
      id: id('t1_power'),
      tier: 1,
      name: 'Overpressure Rounds',
      desc: 'Heavier hits with a slower cycle.',
      cost: 150,
      branchGroup: id('bg_t1_identity'),
      mods: { damageMultMul: 1.14, fireCooldownMul: 1.05, knockbackAdd: 25 },
    });
    const t1_speed = node({
      id: id('t1_speed'),
      tier: 1,
      name: 'Lightweight Mechanism',
      desc: 'Faster fire with a small accuracy tradeoff.',
      cost: 150,
      branchGroup: id('bg_t1_identity'),
      mods: { fireCooldownMul: 0.92, spreadAdd: 0.01 },
    });

    const t1_crit = node({
      id: id('t1_crit'),
      tier: 1,
      name: 'Critical Assembly',
      desc: 'Improves critical chance and multiplier.',
      cost: 170,
      branchGroup: id('bg_t1_payload'),
      mods: { critChanceAdd: 0.05, critMultAdd: 0.25 },
    });
    const t1_dot = node({
      id: id('t1_dot'),
      tier: 1,
      name: 'Thermite Coating',
      desc: 'Adds a small burn over time on hit.',
      cost: 170,
      branchGroup: id('bg_t1_payload'),
      mods: { burnDpsAdd: 0.55, burnDurationAdd: 0.6 },
    });

    const t2_multi = node({
      id: id('t2_multi'),
      tier: 2,
      name: 'Forked Shot',
      desc: 'Adds an extra projectile with wider spread.',
      cost: 260,
      branchGroup: id('bg_t2_delivery'),
      requiresAny: [t1_power.id, t1_speed.id],
      mods: { multishotAdd: 1, spreadAdd: 0.03 },
    });
    const t2_home = node({
      id: id('t2_home'),
      tier: 2,
      name: 'Guidance Lattice',
      desc: 'Projectiles slightly guide toward targets.',
      cost: 260,
      branchGroup: id('bg_t2_delivery'),
      requiresAny: [t1_power.id, t1_speed.id],
      mods: { homingAdd: 1 },
    });

    const t2_pierce = node({
      id: id('t2_pierce'),
      tier: 2,
      name: 'Piercing Core',
      desc: 'Projectiles can pierce through additional enemies.',
      cost: 280,
      branchGroup: id('bg_t2_control'),
      requiresAny: [t1_crit.id, t1_dot.id],
      mods: { pierceAdd: 1 },
    });
    const t2_slow = node({
      id: id('t2_slow'),
      tier: 2,
      name: 'Cryo Residue',
      desc: 'Adds a chance to slow enemies on hit.',
      cost: 280,
      branchGroup: id('bg_t2_control'),
      requiresAny: [t1_crit.id, t1_dot.id],
      mods: { slowChanceAdd: 0.16, slowPercentAdd: 0.22, slowDurationAdd: 0.7 },
    });

    const t3_precision = node({
      id: id('t3_precision'),
      tier: 3,
      name: 'Precision Receiver',
      desc: 'Higher damage with better projectile speed.',
      cost: 420,
      branchGroup: id('bg_t3_signature'),
      requires: [t2_pierce.id],
      mods: { damageMultMul: 1.2, bulletSpeedMul: 1.15, spreadAdd: -0.01 },
    });
    const t3_volume = node({
      id: id('t3_volume'),
      tier: 3,
      name: 'Volume Feed',
      desc: 'Higher rate of fire and tighter cooldown handling.',
      cost: 420,
      branchGroup: id('bg_t3_signature'),
      requires: [t2_multi.id],
      mods: { fireCooldownMul: 0.83, bulletTTLAdd: 0.1 },
    });

    const cap = node({
      id: id('capstone'),
      tier: 4,
      name: 'Signature Protocol',
      desc: 'A defining weapon upgrade that enhances your chosen path.',
      cost: 650,
      branchGroup: id('bg_capstone'),
      requiresAny: [t3_precision.id, t3_volume.id],
      mods: { damageMultMul: 1.16, critChanceAdd: 0.03, critMultAdd: 0.2 },
    });

    const nodes = [
      t1_power, t1_speed,
      t1_crit, t1_dot,
      t2_multi, t2_home,
      t2_pierce, t2_slow,
      t3_precision, t3_volume,
      cap,
    ];

    if (kind === 'burst') {
      nodes.push(node({
        id: id('t2_burst'),
        tier: 2,
        name: 'Burst Extension',
        desc: 'Adds another round per burst but slightly increases burst spacing.',
        cost: 300,
        branchGroup: id('bg_t2_delivery'),
        requiresAny: [t1_power.id, t1_speed.id],
        excludes: [t2_multi.id, t2_home.id],
        mods: { burstCountAdd: 1, burstIntervalMul: 1.08 },
      }));
    } else if (kind === 'beam') {
      nodes.push(node({
        id: id('t2_beam'),
        tier: 2,
        name: 'Optics Focus',
        desc: 'Extends beam range and slightly widens it.',
        cost: 300,
        branchGroup: id('bg_t2_delivery'),
        requiresAny: [t1_power.id, t1_speed.id],
        excludes: [t2_multi.id, t2_home.id],
        mods: { beamRangeMul: 1.18, beamWidthMul: 1.12 },
      }));
    } else if (kind === 'flame') {
      nodes.push(node({
        id: id('t2_flame'),
        tier: 2,
        name: 'Pressurized Nozzle',
        desc: 'Extends flame range and cone coverage.',
        cost: 300,
        branchGroup: id('bg_t2_delivery'),
        requiresAny: [t1_power.id, t1_speed.id],
        excludes: [t2_multi.id, t2_home.id],
        mods: { flameRangeMul: 1.22, flameConeMul: 1.15 },
      }));
    } else if (kind === 'arc') {
      nodes.push(node({
        id: id('t2_arc'),
        tier: 2,
        name: 'Conductor Matrix',
        desc: 'Adds chain bounces and extends chain range.',
        cost: 320,
        branchGroup: id('bg_t2_control'),
        requiresAny: [t1_crit.id, t1_dot.id],
        excludes: [t2_pierce.id, t2_slow.id],
        mods: { chainCountAdd: 1, chainRangeMul: 1.15 },
      }));
    } else if (kind === 'explosive') {
      nodes.push(node({
        id: id('t2_blast'),
        tier: 2,
        name: 'Expanded Payload',
        desc: 'Increases blast radius.',
        cost: 320,
        branchGroup: id('bg_t2_control'),
        requiresAny: [t1_crit.id, t1_dot.id],
        excludes: [t2_pierce.id, t2_slow.id],
        mods: { explodeRadiusAdd: 40, explosiveRadiusAdd: 40 },
      }));
    } else if (kind === 'charge') {
      nodes.push(node({
        id: id('t2_charge'),
        tier: 2,
        name: 'Capacitor Upgrade',
        desc: 'Charges faster and slightly widens the shot.',
        cost: 320,
        branchGroup: id('bg_t2_delivery'),
        requiresAny: [t1_power.id, t1_speed.id],
        excludes: [t2_multi.id, t2_home.id],
        mods: { chargeSecondsMul: 0.86, railWidthMul: 1.2 },
      }));
    } else if (kind === 'boomerang') {
      nodes.push(node({
        id: id('t2_return'),
        tier: 2,
        name: 'Return Recall',
        desc: 'Boomerang returns faster and stays out a bit longer.',
        cost: 320,
        branchGroup: id('bg_t2_delivery'),
        requiresAny: [t1_power.id, t1_speed.id],
        excludes: [t2_multi.id, t2_home.id],
        mods: { returnSpeedMul: 1.25, outSecondsMul: 1.15 },
      }));
    }

    return nodes;
  }

  addTree('pistol', 'Pulse Pistol', makeStandardTree('pistol', 'Pulse Pistol', 'bullet'));
  addTree('smg', 'Rivet SMG', makeStandardTree('smg', 'Rivet SMG', 'bullet'));
  addTree('shotgun', 'Scrap Shotgun', makeStandardTree('shotgun', 'Scrap Shotgun', 'bullet'));
  addTree('burst', 'Burst Rifle', makeStandardTree('burst', 'Burst Rifle', 'burst'));
  addTree('sniper', 'Rail Sniper', makeStandardTree('sniper', 'Rail Sniper', 'bullet'));
  addTree('laser', 'Laser Emitter', makeStandardTree('laser', 'Laser Emitter', 'beam'));
  addTree('flame', 'Flamethrower', makeStandardTree('flame', 'Flamethrower', 'flame'));
  addTree('arc', 'Arc Coil', makeStandardTree('arc', 'Arc Coil', 'arc'));
  addTree('rocket', 'Rocket Launcher', makeStandardTree('rocket', 'Rocket Launcher', 'explosive'));
  addTree('grenade', 'Grenade Lobber', makeStandardTree('grenade', 'Grenade Lobber', 'explosive'));
  addTree('railgun', 'Railgun', makeStandardTree('railgun', 'Railgun', 'charge'));
  addTree('boomerang', 'Boomerang Blade', makeStandardTree('boomerang', 'Boomerang Blade', 'boomerang'));

  WT.getTree = function (weaponId) {
    return WT.trees[String(weaponId || '').trim()] || null;
  };

  WT.getNode = function (weaponId, nodeId) {
    const t = WT.getTree(weaponId);
    if (!t) return null;
    return t.nodes.find((n) => n.id === nodeId) || null;
  };

  WT.listWeaponIds = function () {
    return Object.keys(WT.trees);
  };
})();
