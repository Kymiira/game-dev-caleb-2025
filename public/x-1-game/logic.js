// logic.js

/**
 * GameLogic Module
 * Handles the fixed time step updates (movement, combat, AI).
 */
const GameLogic = (function() {
    return {
        update: function(deltaTime) {
            // Future implementation: Process movement queues, check combat, run AI
        }
    };
})();


/**
 * InputHandler Module
 * Maps mouse and keyboard events to game actions (selection, movement orders).
 */
const InputHandler = (function() {
    let selectedHex = null; // Currently selected tile {q, r}

    /**
     * Main mouse click processor.
     */
    function handleClick(event) {
        // 1. Get raw pixel coordinates relative to the canvas
        const rect = event.target.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;

        // 2. Convert raw pixels to integer hex coordinates (q, r) using Grid module
        const clickedHex = Grid.pixelToHex(canvasX, canvasY);

        if (clickedHex) {
            console.log(`Clicked Hex: (${clickedHex.q}, ${clickedHex.r})`);

            // 3. Process Game Action
            const unit = GameState.getUnitAt(clickedHex.q, clickedHex.r);

            if (unit && unit.owner === GameState.getState().currentPlayer) {
                // If we click our own unit: Select it
                selectedHex = clickedHex;
            } else if (selectedHex) {
                // If we click an empty tile or enemy unit while one of ours is selected: Move/Attack order
                console.log(`Order: Move/Attack unit at (${selectedHex.q}, ${selectedHex.r}) to target.`);
                
                // Clear selection after action attempt
                selectedHex = null;
            }
            
        } else {
            console.log('Click outside map boundaries.');
        }

        // The game loop will automatically redraw using the new selectedHex state
    }

    return {
        init: function(canvasId) {
            const canvas = document.getElementById(canvasId);
            canvas.addEventListener('mousedown', handleClick);
            console.log('Input Handler initialized (listening for clicks).');
        },
        // Exposed method for the Renderer to know what to highlight
        getSelectedHex: () => selectedHex
    };
})();
