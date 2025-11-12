// gamestate.js

/**
 * GameState Module
 * Holds all dynamic data: units, buildings, resources, current turn, etc.
 */
const GameState = (function() {
    let state = {
        turn: 1,
        currentPlayer: 'Player',
        resources: { Player: 500, AI: 500 },
        // Added a mock unit here so the Renderer can draw it and InputHandler can select it
        units: [
            { id: 101, owner: 'Player', q: 2, r: 3, type: 'infantry', health: 100, color: 'blue' },
            { id: 102, owner: 'AI', q: 8, r: 6, type: 'tank', health: 150, color: 'red' }
        ], 
        buildings: []
    };

    return {
        // Initialize state (can load from storage later)
        init: function() {
            console.log('Game State initialized.');
        },

        // Read accessors
        getUnits: () => state.units,
        getUnitAt: function(q, r) {
            return state.units.find(u => u.q === q && u.r === r);
        },

        // Expose the current state (read-only copy)
        getState: () => ({ ...state })
    };
})();
