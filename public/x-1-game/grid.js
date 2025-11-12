// grid.js

/**
 * Grid System Module
 * Handles all map data, hexagonal math, and coordinate conversions.
 */
const Grid = (function() {
    // Shared Configuration
    const HEX_SIDE_LENGTH = 50;
    const HEX_WIDTH = Math.sqrt(3) * HEX_SIDE_LENGTH;
    const HEX_HEIGHT = 2 * HEX_SIDE_LENGTH;
    const MAP_SIZE_X = 12; 
    const MAP_SIZE_Y = 10; 
    
    // Fixed offsets used during rendering and interaction logic
    const OFFSET_X = HEX_WIDTH; 
    const OFFSET_Y = HEX_HEIGHT / 2;

    let map = []; // Map data structure

    /**
     * Converts a screen pixel (x, y) to floating-point axial coordinates (q, r).
     */
    function pixelToHexFloat(x, y) {
        // 1. Remove the rendering offsets
        const pt_x = x - OFFSET_X;
        const pt_y = y - OFFSET_Y;

        // 2. Inverse projection formula for flat-top hexagons
        const q_float = (pt_x * (Math.sqrt(3)/3) - pt_y / 3) / HEX_SIDE_LENGTH;
        const r_float = pt_y * 2/3 / HEX_SIDE_LENGTH;

        return { q: q_float, r: r_float };
    }

    /**
     * Rounds floating-point hex coordinates (q, r) to the nearest integer hex coordinates.
     */
    function hexRound(q_float, r_float) {
        // Cube coordinate rounding technique
        const s_float = -q_float - r_float;
        
        let q = Math.round(q_float);
        let r = Math.round(r_float);
        let s = Math.round(s_float);

        const q_diff = Math.abs(q - q_float);
        const r_diff = Math.abs(r - r_float);
        const s_diff = Math.abs(s - s_float);

        if (q_diff > r_diff && q_diff > s_diff) {
            q = -r - s;
        } else if (r_diff > s_diff) {
            r = -q - s;
        } 
        // s = -q - r is implicit here

        return { q: q, r: r };
    }

    // Public methods for the Grid module
    return {
        // Initializes the static map data
        init: function() {
            for (let q = 0; q < MAP_SIZE_X; q++) {
                map[q] = [];
                for (let r = 0; r < MAP_SIZE_Y; r++) {
                    map[q][r] = { 
                        terrain: (q + r) % 3 === 0 ? 'mountain' : 'grass',
                        unitId: null
                    };
                }
            }
            console.log('Grid initialized.');
        },

        // Converts screen click to map coordinates
        pixelToHex: function(x, y) {
            const floatCoords = pixelToHexFloat(x, y);
            const roundedCoords = hexRound(floatCoords.q, floatCoords.r);
            
            // Boundary check
            if (roundedCoords.q >= 0 && roundedCoords.q < MAP_SIZE_X && 
                roundedCoords.r >= 0 && roundedCoords.r < MAP_SIZE_Y) {
                return roundedCoords;
            }
            return null; 
        },

        // Exposes configuration for the Renderer
        getConfig: function() {
            return {
                HEX_SIDE_LENGTH,
                HEX_WIDTH,
                HEX_HEIGHT,
                MAP_SIZE_X,
                MAP_SIZE_Y,
                OFFSET_X,
                OFFSET_Y
            };
        },

        // Placeholder for pathfinding (A* implementation coming soon)
        findPath: function(startHex, endHex) {
            console.log(`Pathfinding request: ${startHex.q},${startHex.r} to ${endHex.q},${endHex.r}`);
            return [];
        },
    };
})();
