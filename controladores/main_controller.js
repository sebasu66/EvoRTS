import WorkerController from "./worker_controller.js";
import Ambiente from "../modelos/Ambiente_model.js";
import TickSystem from "./tick_system.js";
import AmbienteView from "../vistas/Ambiente_view.js";
import * as g from "./game_logic.js";

console.log("Loading MainController...");

/**
 * Main controller for EvoRTS
 * Handles game initialization, main loop, and world management
 */
export default class MainController {
  constructor(canvasId = "gameCanvas") {
    console.log("MainController constructor called");

    // Initialize graphics system first
    g.initializeGraphics();

    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error("Canvas element not found");
    }

    this.ctx = this.canvas.getContext("2d");

    // Set canvas size
    this.canvas.width = g.CANVAS.width;
    this.canvas.height = g.CANVAS.height;
    console.log(
      `Canvas dimensions: ${this.canvas.width}x${this.canvas.height}`
    );

    // Create the tick system for managing entity updates
    this.tickSystem = new TickSystem();

    console.log("Creating Ambiente...");
    this.mundo = new Ambiente();
    console.log("Ambiente created:", this.mundo);

    console.log("Creating AmbienteView...");
    this.mundoView = new AmbienteView(this.ctx, g.TILE_SIZE); // Use TILE_SIZE from game_logic

    // Game state
    this.isPaused = false;
    this.lastFrameTime = 0;
    this.showDebugInfo = false;

    // Bind the game loop
    this.gameLoop = this.gameLoop.bind(this);
  }

  // Initialize the game
  init() {
    // Initialize the worker at its starting position
    this.workerController.init();

    // Set tick rate (updates per second)
    this.tickSystem.setTickRate(30); // 30 updates per second

    // Set time scale to 50% slower than normal
    this.tickSystem.setTimeScale(0.5);

    // Start the game loop
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.gameLoop);

    console.log(
      "Game initialized with tick rate of",
      this.tickSystem.tickRate,
      "ticks per second and time scale of 0.5x"
    );
  }

  // Clear the canvas
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Main game loop
  gameLoop(currentTime) {
    // Debug first frame
    if (!this._firstFrameLogged) {
      console.log("First frame of game loop");
      console.log("Current world state:", this.mundo);
      this._firstFrameLogged = true;
    }

    // Calculate delta time
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Clear the canvas
    this.clear();

    // Debug every 100 frames
    if (Math.floor(currentTime) % 100 === 0) {
      console.log("=== Game Loop Debug ===");
      console.log(`World dimensions: ${g.WORLD_WIDTH}x${g.WORLD_HEIGHT}`);
      console.log(`Tile size: ${g.TILE_SIZE}`);
      console.log("Mundo object:", this.mundo);
    }

    // Render the world - pass the whole ambiente object
    this.mundoView.renderizarSuelo(this.mundo);

    // Update the tick system
    const ticksProcessed = this.tickSystem.update(currentTime);

    // Display debug info if needed
    if (this.showDebugInfo && ticksProcessed > 0) {
      this.displayDebugInfo();
    }

    // Continue the game loop
    requestAnimationFrame(this.gameLoop);
  }

  // Display debug information
  displayDebugInfo() {
    const metrics = this.tickSystem.getPerformanceMetrics();

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(10, 10, 200, 120);

    this.ctx.font = "12px monospace";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(
      `Tick Rate: ${metrics.tickRate.toFixed(1)} ticks/sec`,
      20,
      30
    );
    this.ctx.fillText(
      `Tick Time: ${metrics.averageTickTime.toFixed(2)}ms`,
      20,
      50
    );
    this.ctx.fillText(`Entities: ${metrics.entitiesCount}`, 20, 70);
    this.ctx.fillText(`Time Scale: ${metrics.timeScale.toFixed(1)}x`, 20, 90);
    this.ctx.fillText(
      `Game Time: ${(metrics.elapsedGameTime / 1000).toFixed(1)}s`,
      20,
      110
    );
  }

  // Toggle game pause state
  togglePause() {
    this.isPaused = !this.isPaused;
    this.tickSystem.setPaused(this.isPaused);
    console.log(this.isPaused ? "Game paused" : "Game resumed");
  }

  // Set game speed
  setSpeed(timeScale) {
    this.tickSystem.setTimeScale(timeScale);
    console.log(`Game speed set to ${timeScale}x`);
  }

  // Add a new worker to the game
  addWorker(id, x, y) {
    const workerController = new WorkerController(id, x, y, this.mundo, {
      x: 50,
      y: 50,
    });
    this.tickSystem.registerEntity(id, workerController);
    return workerController;
  }

  // Toggle fog of war for all entities
  toggleFogOfWar() {
    // Get all entity controllers
    const entities = Array.from(this.tickSystem.entities.values());

    // Toggle fog of war for each entity
    let newState = null;
    entities.forEach((entity) => {
      if (entity.fogOfWar !== undefined) {
        // Use the first entity's state to determine toggle direction
        if (newState === null) {
          newState = !entity.fogOfWar;
        }
        entity.fogOfWar = newState;
      }
    });

    console.log(`Fog of War ${newState ? "enabled" : "disabled"}`);
  }

  // Initialize the game when the window loads
  start() {
    const mainController = new MainController("gameCanvas");
    mainController.init();

    // Store reference to main controller for global access
    window.mainController = mainController;

    // Add keyboard controls for game speed
    window.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "0": // Pause/resume
          mainController.togglePause();
          break;
        case "1": // Slow speed (90% slower)
          mainController.setSpeed(0.1); // 10% of normal speed
          break;
        case "2": // Normal speed (50% slower than original)
          mainController.setSpeed(0.5);
          break;
        case "3": // Fast speed
          mainController.setSpeed(1.0); // Original normal speed
          break;
        case "d": // Toggle debug info
          mainController.showDebugInfo = !mainController.showDebugInfo;
          break;
        case "f": // Toggle fog of war
          mainController.toggleFogOfWar();
          break;
      }
    });
  }
}

console.log("Main controller script loaded");
