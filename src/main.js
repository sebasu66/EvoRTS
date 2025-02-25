import WorldController from "./world/WorldController.js";
import UIController from "./ui/UIController.js";
import CodeHandler from "./code/CodeHandler.js";

class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    if (!this.canvas) {
      throw new Error("Canvas not found");
    }

    // Set canvas size
    this.canvas.width = 800;
    this.canvas.height = 600;

    this.worldController = new WorldController(this.canvas);
    this.uiController = null;
    this.codeHandler = null;
    this.isRunning = false;
    this.lastFrameTime = 0;
  }

  async initialize() {
    try {
      // Initialize controllers
      this.worldController = new WorldController(this.canvas);
      this.uiController = new UIController(this);
      this.codeHandler = new CodeHandler();

      // Initialize world
      await this.worldController.initialize();

      // Start game loop
      this.isRunning = true;
      this.gameLoop();

      console.log("Game initialized successfully");
    } catch (error) {
      console.error("Failed to initialize game:", error);
      throw error;
    }
  }

  gameLoop(timestamp = 0) {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Update world
    this.worldController.update(deltaTime);
    
    // Update UI if it exists
    if (this.uiController && typeof this.uiController.update === 'function') {
        this.uiController.update(deltaTime);
    }

    // Render world
    this.worldController.render();
    
    // Render UI if it exists
    if (this.uiController && typeof this.uiController.render === 'function') {
        this.uiController.render();
    }

    requestAnimationFrame(this.gameLoop.bind(this));
  }
}

// Start the game when the DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  const game = new Game();
  try {
    await game.initialize();
  } catch (error) {
    document.body.innerHTML = `<div class="error">Failed to start game: ${error.message}</div>`;
  }
});
