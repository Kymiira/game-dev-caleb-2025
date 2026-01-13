// sprites.js
(() => {
  const Sprites = (window.Sprites = window.Sprites || {});

  Sprites.enabled = (Sprites.enabled ?? false);
  Sprites.basePath = Sprites.basePath || '../assets/sprites/';

  Sprites.map = Sprites.map || {
    player: 'player.png',

    'enemy.grunt': 'enemy_grunt.png',
    'enemy.runner': 'enemy_runner.png',
    'enemy.tank': 'enemy_tank.png',
    'enemy.shooter': 'enemy_shooter.png',
    'enemy.sniper': 'enemy_sniper.png',
    'enemy.bomber': 'enemy_bomber.png',
    'enemy.pulsar': 'enemy_pulsar.png',
    'enemy.charger': 'enemy_charger.png',
    'enemy.splitter': 'enemy_splitter.png',
    'enemy.shielded': 'enemy_shielded.png',
    'enemy.leech': 'enemy_leech.png',
    'enemy.medic': 'enemy_medic.png',
    'enemy.summoner': 'enemy_summoner.png',
    'enemy.mini': 'enemy_mini.png',

    'bullet.player': 'bullet_player.png',
    'bullet.enemy': 'bullet_enemy.png',
    'bullet.sniper': 'bullet_sniper.png',
    'bullet.bomb': 'bullet_bomb.png',
  };

  Sprites.url = function (key) {
    const file = Sprites.map[key] || 'placeholder.png';
    return `${Sprites.basePath}${file}`;
  };

  Sprites.setEnabled = function (on) {
    Sprites.enabled = !!on;
  };

  Sprites.apply = function (el, key) {
    if (!Sprites.enabled || !el) return;
    el.classList.add('entitySprite');
    el.style.backgroundImage = `url('${Sprites.url(key)}')`;
    el.style.backgroundColor = 'transparent';
  };
})();
