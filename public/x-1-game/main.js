// main.js

// --- Global Initialization ---

let animationFrameId = null;
let isMaximized = false;

/**
 * Calculates the available width and height for the canvas 
 * based on its parent container's size.
 */
function calculateCanvasSize() {
    const container = document.querySelector('.game-container');
    if (container) {
        // Use clientWidth and clientHeight to get the content area dimensions
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Use Math.floor to ensure integer dimensions for canvas attributes
        return { width: Math.floor(width), height: Math.floor(height) };
    }
    return { width: 800, height: 600 }; // Fallback
}

/**
 * Handles the resizing of the canvas and redraws the game.
 */
function handleResize() {
    const { width, height } = calculateCanvasSize();
    // This calls the resize function implemented in renderer.js
    Renderer.resizeCanvas(width, height); 
}

/**
 * Toggles the maximized state of the canvas.
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
    
    // Force a resize calculation after the DOM elements have changed visibility
    // Use setTimeout to ensure the browser has time to reflow the layout
    setTimeout(handleResize, 10);
}


/**
 * The core game loop using requestAnimationFrame.
 * @param {number} currentTime 
 */
function gameLoop(currentTime) {
    // 1. --- LOGIC UPDATE ---
    // GameLogic.update(deltaTime); // To be implemented later

    // 2. --- RENDERING ---
    // We pass a mock gameState for now
    const MockGameState = {}; 
    Renderer.draw(MockGameState); 

    animationFrameId = requestAnimationFrame(gameLoop);
}


// --- Window Load and Event Setup ---

window.onload = function() {
    // 1. Initialize Renderer and set initial size
    const { width, height } = calculateCanvasSize();
    // Ensure Renderer.init is available before calling
    if (typeof Renderer !== 'undefined' && Renderer.init) {
        Renderer.init('gameCanvas', width, height); 
    } else {
        console.error('Renderer module not loaded correctly.');
        return;
    }
    
    // 2. Attach event listeners
    window.addEventListener('resize', handleResize);
    
    const maximizeBtn = document.getElementById('maximizeBtn');
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', toggleMaximize);
    }

    // 3. Start the game loop
    console.log('Game Initialized. Starting game loop...');
    gameLoop(0); 
};
