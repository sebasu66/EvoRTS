export default class WorldView {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 10;
    }

    render(world, camera) {
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context state
        ctx.save();

        // Apply camera transformations
        ctx.translate(this.canvas.width/2, this.canvas.height/2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);

        // Render terrain with camera offset
        for(let x = 0; x < world.width; x++) {
            for(let y = 0; y < world.height; y++) {
                const isWall = world.terrain[x][y] === 1;
                ctx.fillStyle = isWall ? '#000' : '#333';
                ctx.fillRect(
                    x * this.tileSize,
                    y * this.tileSize,
                    this.tileSize - 1,
                    this.tileSize - 1
                );
            }
        }

        // Restore context state
        ctx.restore();

        // Draw UI elements that should not be affected by camera
        this.drawUI(world);
    }

    drawUI(world) {
        // Draw any UI elements that should stay fixed on screen
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`World Size: ${world.width}x${world.height}`, 10, 20);
    }
}
