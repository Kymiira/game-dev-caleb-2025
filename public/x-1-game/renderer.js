// renderer.js

const Renderer = (function() {
    let ctx;
    let canvas;
    let config; // Stores the configuration from the Grid module
    
    /**
     * Converts a grid coordinate (q, r) into screen coordinates (x, y).
     */
    function hexToPixel(q, r) {
        // Pull dimensions from the shared configuration
        const { HEX_WIDTH, HEX_HEIGHT, OFFSET_X, OFFSET_Y } = config;
        
        // Flat-top orientation calculation
        const x = HEX_WIDTH * (q + r / 2);
        const y = (HEX_HEIGHT * 3/4) * r;
        
        return { x: x + OFFSET_X, y: y + OFFSET_Y };
    }

    /**
     * Draws a single flat-top hexagon centered at screen (x, y).
     */
    function drawHex(x, y, terrain, isSelected) {
        const sideLength = config.HEX_SIDE_LENGTH;
        const angleStart = 0; 
        
        // Determine base color based on terrain
        let color;
        let strokeColor = '#555';
        if (terrain === 'mountain') {
            color = '#8D6E63'; // Brown/Stone
        } else if (terrain === 'grass') {
            color = '#1B5E20'; // Dark Green
        } else {
            color = '#00BFFF'; // Water/Default
        }
        
        // Selection highlight
        if (isSelected) {
            strokeColor = '#FFD700'; // Gold highlight
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
            ctx.lineWidth = 3;
        } else {
            ctx.shadowBlur = 0;
            ctx.lineWidth = 2;
        }

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = angleStart + (Math.PI / 3) * i;
            const vx = x + sideLength * Math.cos(angle);
            const vy = y + sideLength * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(vx, vy);
            } else {
                ctx.lineTo(vx, vy);
            }
        }
        ctx.closePath(); 
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }
    
    /**
     * Draws a unit marker.
     */
    function drawUnit(x, y, unit) {
        const size = config.HEX_SIDE_LENGTH * 0.4;
        
        // Outer glow for unit owner
        ctx.shadowColor = unit.color === 'blue' ? '#4CAF50' : '#FF5722';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI); 
        ctx.fillStyle = unit.color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF'; // White border for contrast
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Reset shadow for subsequent drawings
        ctx.shadowBlur = 0; 
    }

    return {
        // Public initialization method
        init: function(canvasId, width, height) {
            canvas = document.getElementById(canvasId);
            ctx = canvas.getContext('2d');
            config = Grid.getConfig(); // Pull required dimensions from Grid
            this.resizeCanvas(width, height);
            console.log('Renderer initialized.');
        },

        // Handles the canvas DOM resize
        resizeCanvas: function(width, height) {
            canvas.width = width;
            canvas.height = height;
        },

        // Main public draw method
        draw: function(gameState) {
            if (!ctx) return; 

            // Get selected hex coordinates from the input handler
            const selectedHex = InputHandler.getSelectedHex();

            // 1. Clear the entire canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 2. Draw the Grid
            const { MAP_SIZE_X, MAP_SIZE_Y } = config;

            for (let q = 0; q < MAP_SIZE_X; q++) {
                for (let r = 0; r < MAP_SIZE_Y; r++) {
                    const { x, y } = hexToPixel(q, r);
                    
                    // Check if the current hex is selected
                    const isSelected = selectedHex && selectedHex.q === q && selectedHex.r === r;
                    
                    // Mock terrain is hardcoded in grid.js init, using a dummy terrain type here
                    // In a real game, this would query Grid.getTileData(q, r)
                    const mockTerrain = (q + r) % 3 === 0 ? 'mountain' : 'grass';
                    
                    drawHex(x, y, mockTerrain, isSelected);
                }
            }

            // 3. Draw Units - relies strictly on GameState
            gameState.getUnits().forEach(unit => {
                const { x, y } = hexToPixel(unit.q, unit.r);
                drawUnit(x, y, unit);
            });

            // 4. Draw UI Overlay
            this.drawUI(gameState);
        },
        
        drawUI: function(gameState) {
            const state = gameState.getState();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
            
            ctx.fillStyle = '#FFF';
            ctx.font = '18px sans-serif';
            ctx.fillText(`Resources: ${state.resources.Player} | Turn: ${state.currentPlayer}`, 10, canvas.height - 15);
        }
    };
})();
