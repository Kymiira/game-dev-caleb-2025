// renderer.js

const Renderer = (function() {
    let ctx;
    let canvas;
    
    // --- Configuration (These will be constants across the application) ---
    const HEX_SIDE_LENGTH = 50;
    const HEX_HEIGHT = 2 * HEX_SIDE_LENGTH;
    const HEX_WIDTH = Math.sqrt(3) * HEX_SIDE_LENGTH;
    
    // We will use these map dimensions for coordinate translation
    const MAP_SIZE_X = 12; 
    const MAP_SIZE_Y = 10; 

    /**
     * Converts a grid coordinate (q, r) into screen coordinates (x, y).
     * @param {number} q Axial Q coordinate.
     * @param {number} r Axial R coordinate.
     * @returns {{x: number, y: number}} Screen coordinates.
     */
    function hexToPixel(q, r) {
        // Flat-top orientation calculation
        // Centering offset logic will depend on the final map size vs canvas size
        const x = HEX_WIDTH * (q + r / 2);
        const y = (HEX_HEIGHT * 3/4) * r;
        
        // Simple fixed margin for now; fine-tuning will happen later
        const OFFSET_X = HEX_WIDTH; 
        const OFFSET_Y = HEX_HEIGHT / 2;
        
        return { x: x + OFFSET_X, y: y + OFFSET_Y };
    }

    /**
     * Draws a single flat-top hexagon centered at screen (x, y).
     */
    function drawHex(x, y, color) {
        const sideLength = HEX_SIDE_LENGTH;
        const angleStart = 0; 
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
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    /**
     * Draws a simple circle to represent a Unit.
     */
    function drawUnit(x, y, playerColor) {
        ctx.beginPath();
        ctx.arc(x, y, HEX_SIDE_LENGTH * 0.4, 0, 2 * Math.PI); 
        ctx.fillStyle = playerColor;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    return {
        // Public initialization method
        init: function(canvasId, width, height) {
            canvas = document.getElementById(canvasId);
            ctx = canvas.getContext('2d');
            this.resizeCanvas(width, height);
        },

        // New method to handle resizing
        resizeCanvas: function(width, height) {
            canvas.width = width;
            canvas.height = height;
            // Note: When the canvas is resized, all drawing must be re-executed
            // which is handled by the main game loop calling Renderer.draw().
        },

        // Main public draw method
        draw: function(gameState) {
            // Check if context is available
            if (!ctx) return; 

            // 1. Clear the entire canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 2. Draw the Grid (Mock data for now)
            for (let q = 0; q < MAP_SIZE_X; q++) {
                for (let r = 0; r < MAP_SIZE_Y; r++) {
                    const { x, y } = hexToPixel(q, r);
                    
                    // Mock data: alternate colors for visual confirmation
                    const isWater = (q + r) % 5 === 0;
                    const color = isWater ? '#00BFFF' : '#1B5E20';
                    
                    drawHex(x, y, color);
                    
                    // Mock: Draw Coordinates for debugging
                    ctx.fillStyle = '#FFF';
                    ctx.font = '10px sans-serif';
                    ctx.fillText(`(${q},${r})`, x - 15, y + 5);
                }
            }

            // 3. Draw Units (Mock data for now)
            const mockUnits = [
                { q: 2, r: 3, playerColor: 'blue' },
                { q: 8, r: 6, playerColor: 'red' }
            ];
            mockUnits.forEach(unit => {
                const { x, y } = hexToPixel(unit.q, unit.r);
                drawUnit(x, y, unit.playerColor);
            });


            // 4. Draw UI Overlay
            this.drawUI();
        },
        
        drawUI: function() {
            // Draw a simple resource display bar
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
            
            ctx.fillStyle = '#FFF';
            ctx.font = '18px sans-serif';
            ctx.fillText('Resources: 1000 | Turn: Player 1', 10, canvas.height - 15);
        }
    };
})();
