<details>
    <summary>project plan / development board</summary>
    <h2>game base</h2>
    - 2D Top-Down Shooter<br>
    - Singleplayer<br>
    - Browser<br>
    - Roguelike<br>
    - Class-based<br>
    - DOM-based entities, no Canvas<br>
    <h2>CORE GAMEPLAY LOOP</h2>
    <h3>PLAYER ACTIONS</h3>
    - Ranged Attack<br>
    - Dash/Evade<br>
    - Abilities<br>
    <h3>PROGRESSION</h3>
    - Score-based Currency<br>
    - Between levels player chooses<br>
    - - Weapon changes<br>
    - - Weapon Modifiers<br>
    - - Misc Upgrades<br>
    <h3>FAILURE</h3>
    - player death = run ends<br>
    - no mid-level save<br>
    - send back to levelindex<br>
    <h2>CORE PLAYER "FANTASY"</h2>
    - "Player is fragile, but with the correct build they become unstoppable -- If they don't they will lose horribly"<br>
    - constant pressure, no idle<br>
    - mistakes punished<br>
    - smart upgrade choices turn mood from fear to dominance<br>
    - power spikes earned, not given<br>
    <h2>COMBAT PHILOSOPHY</h2>
    <h3>TIME TO KILL</h3>
    - Player dies fast if hit repeatedly (no iframes)<br>
    - Hostiles die fast if player builds correctly<br>
    - creates high tension, extreme power fantasy at late game<br>
    <h3>NO BULLET SPONGES</h3>
    - high hostile density<br>
    - high hostile variancy<br>
    - high pressure<br>
    <h2>FINALIZED STEP-BY-STEP GAMEPLAY LOOP</h2>
    - Spawn into level<br>
    - constant enemy pressure<br>
    - Clear encounters efficiently<br>
    - Gain score<br>
    - Choose ONE upgrade<br>
    - power spike OR regret<br>
    - next level<br>
    - death = restart<br>
    <h2>DESIGN PHILOSOPHY</h2>
    - no mid-level heals<br>
    - no free upgrades<br>
    - no safe zones<br>
    - off-screen enemies<br>
    - screen shake, hit flash, aggressive feedback; makes game feel "alive"<br>
    - death fair but brutal<br>
    <h2>LEVEL STRUCTURE</h2>
    <h3>LEVEL 1 - Introduction</h3>
    - teaches movement<br>
    - teaches dodging<br>
    - teaches first build choice<br>
    - moderate hostile density<br>
    - forces decision-making<br>
    <h3>LEVEL 2 - The Test</h3>
    - significantly higher pressure<br>
    - enemy combinations punish weak build<br>
    - POWER fantasy or DEATH<br>
</details>
<details>
    <summary>todo</summary>
    <details>
        <summary>not started</summary>
        <ul>
            <li>implement either localstorage or sessionstorage for data transfer locally</li>
        </ul>
    </details>
    <details>
        <summary>working on</summary>
        <ul>
            <li>hostile systems (spawning, health, movement, score)</li>
        </ul>
    </details>
    <details>
        <summary>finished</summary>
        <ul>
            <li>created level 1 base</li>
            <li>set up world vs viewport</li>
            <li>created player state object</li>
            <li>camera function tracking player movement around world</li>
            <li>set up a game loop function based on delta time (different ingame tick system dealing with higher/slower fps--tick time issues)</li>
            <li>set up wasd movement for player</li>
            <li>set up mouse tracking and facetomouse function</li>
            <li>set up simple gun - bullet system</li>
            <li>find a way to locally transfer variables from one web page to another</li>
        </ul>
    </details>
</details>

