// main.js

// --- Global Setup State ---

let animationFrameId = null;
let isMaximized = false;

/**
 * Calculates the available width and height for the canvas 
 * based on the space between the header and footer.
 */
function calculateCanvasSize() {
    const container = document.querySelector('.game-container');
    if (container) {
        // clientWidth/Height gives the size excluding padding.
        // The padding is the 1.5rem margin we want.
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        return { width: Math.floor(width), height: Math.floor(height) };
    }
    return { width: 800, height: 600 }; 
}

/**
 * Handles the resizing of the canvas and redraws the game.
 */
function handleResize() {
    const { width, height } = calculateCanvasSize();
    // Renderer is responsible for the actual canvas attributes change
    if (typeof Renderer !== 'undefined') {
        Renderer.resizeCanvas(width, height); 
    }
}

/**
 * Toggles the maximized state of the canvas by hiding header/footer.
 */
function toggleMaximize() {
    const body = document.body;
    const btn = document.getElementById('maximizeBtn');
    
    isMaximized = !isMaximized;
    
    if (isMaximized) {
        body.classList.add('maximized');
        btn.textContent = 'RESTORE';
    } else {
        body.classList.remove('maximized');
        btn.textContent = 'MAXIMIZE';
    }
    
    // Crucial: Force a resize calculation after the DOM elements have changed visibility
    setTimeout(handleResize, 10);
}


/**
 * The core game loop using requestAnimationFrame.
 */
function gameLoop(currentTime) {
    // 1. --- LOGIC UPDATE ---
    // GameLogic.update(deltaTime); // TBD

    // 2. --- RENDERING ---
    // Passes the entire GameState to the Renderer
    if (typeof Renderer !== 'undefined') {
        Renderer.draw(GameState); 
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}


// --- Window Load and Event Setup (Entry Point) ---

window.onload = function() {
    // 1. Initialize core systems (data structures first)
    if (typeof Grid !== 'undefined' && Grid.init) Grid.init();
    if (typeof GameState !== 'undefined' && GameState.init) GameState.init();

    // 2. Initialize Renderer and set initial size
    const { width, height } = calculateCanvasSize();
    if (typeof Renderer !== 'undefined' && Renderer.init) {
        Renderer.init('gameCanvas', width, height); 
    } else {
        console.error('ERROR: Renderer module not loaded correctly.');
        return;
    }

    // 3. Initialize Input Handler (attaches click listener to canvas)
    if (typeof InputHandler !== 'undefined' && InputHandler.init) {
        InputHandler.init('gameCanvas');
    }
    
    // 4. Attach environment listeners
    window.addEventListener('resize', handleResize);
    
    const maximizeBtn = document.getElementById('maximizeBtn');
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', toggleMaximize);
    }

    // 5. Start the game loop
    console.log('Game Initialized. Starting game loop...');
    gameLoop(0); 
};
