# PROJECT PLAN
## GAME IDENTITY
- 2D Top-Down Shooter
- Singleplayer
- Browser
- Roguelike
- Class-based
- DOM-based entities, no Canvas
## CORE GAMEPLAY LOOP
### PLAYER ACTIONS
- Ranged Attack
- Dash/Evade
- Abilities
### PROGRESSION
- Score-based Currency
- Between levels player chooses
- - Weapon changes
- - Weapon Modifiers
- - Misc Upgrades
### FAILURE
- player death = run ends
- no mid-level save
- send back to levelindex
## CORE PLAYER "FANTASY"
- "Player is fragile, but with the correct build they become unstoppable -- If they don't they will lose horribly"
- constant pressure, no idle
- mistakes punished
- smart upgrade choices turn mood from fear to dominance
- power spikes earned, not given
## COMBAT PHILOSOPHY
### TIME TO KILL
- Player dies fast if hit repeatedly (no iframes)
- Hostiles die fast if player builds correctly
- creates high tension, extreme power fantasy at late game
### NO BULLET SPONGES
- high hostile density
- high hostile variancy
- high pressure
## FINALIZED STEP-BY-STEP GAMEPLAY LOOP
- Spawn into level
- constant enemy pressure
- Clear encounters efficiently
- Gain score
- Choose ONE upgrade
- power spike OR regret
- next level
- death = restart
## DESIGN PHILOSOPHY
- no mid-level heals
- no free upgrades
- no safe zones
- off-screen enemies
- screen shake, hit flash, aggressive feedback; makes game feel "alive"
- death fair but brutal
## LEVEL STRUCTURE
### LEVEL 1 - Introduction
- teaches movement
- teaches dodging
- teaches first build choice
- moderate hostile density
- forces decision-making
### LEVEL 2 - The Test
- significantly higher pressure
- enemy combinations punish weak build
- POWER fantasy or DEATH
