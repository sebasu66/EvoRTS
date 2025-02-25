export default class UIController {
  constructor(mainController) {
    this.mainController = mainController;
    this.initializeUI();
  }

  // Add missing update method
  update(deltaTime) {
    // Update UI elements if needed
    this.updateStatusDisplay();
  }

  // Add missing render method
  render() {
    // No rendering needed for basic UI
    // UI elements update through DOM
  }

  updateStatusDisplay() {
    // Update status elements if they exist
    if (this.mainController.isPaused) {
      this.playPauseBtn.textContent = 'Resume';
    }
  }

  initializeUI() {
    // Initialize UI elements
    this.playPauseBtn = document.getElementById("play-pause");
    this.statusToggleBtn = document.getElementById("status-toggle");
    this.resetGameBtn = document.getElementById("reset-game");
    this.resetCodeBtn = document.getElementById("reset-code");

    // Bind event listeners
    this.bindEventListeners();

    // Initialize logger
    this.initializeLogger();
  }

  bindEventListeners() {
    // Play/Pause
    this.playPauseBtn?.addEventListener("click", () => {
      this.mainController.togglePause();
      this.playPauseBtn.textContent = this.mainController.isPaused
        ? "Resume"
        : "Pause";
    });

    // Status Toggle
    this.statusToggleBtn?.addEventListener("click", () => {
      this.mainController.toggleStatus();
      this.statusToggleBtn.textContent = this.mainController.showStatus
        ? "Hide Status"
        : "Show Status";
    });

    // Reset Game
    this.resetGameBtn?.addEventListener("click", () => {
      if (confirm("Reset the game? All progress will be lost.")) {
        location.reload();
      }
    });

    // Reset Code
    this.resetCodeBtn?.addEventListener("click", () => {
      if (confirm("Reset all code to defaults?")) {
        this.mainController.resetCode();
      }
    });

    // Keyboard shortcuts
    window.addEventListener("keydown", this.handleKeyPress.bind(this));
  }

  handleKeyPress(event) {
    switch (event.key) {
      case "0":
        this.playPauseBtn?.click();
        break;
      case "1":
        this.mainController.setSpeed(0.1);
        break;
      case "2":
        this.mainController.setSpeed(0.5);
        break;
      case "3":
        this.mainController.setSpeed(1.0);
        break;
      case "d":
        this.mainController.toggleDebug();
        break;
      case "f":
        this.mainController.toggleFogOfWar();
        break;
    }
  }

  initializeLogger() {
    window.gameLogger = {
      log: (message, unitId, type = "system") => {
        // Implementation moved from index.html
        console.log(`[${type}] ${unitId ? unitId + ": " : ""}${message}`);
        // Add UI logging logic here
      },
    };
  }
}
