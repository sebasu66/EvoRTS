// Define constants first
const TILE_SIZE = 10;
let CANVAS = null;
let CTX = null;
let WORLD_WIDTH = 0;
let WORLD_HEIGHT = 0;

// Initialize function to be called after DOM is ready
function initializeGraphics() {
  CANVAS = document.getElementById("gameCanvas");
  if (!CANVAS) {
    throw new Error("Canvas element not found! Check your HTML.");
  }
  CTX = CANVAS.getContext("2d");
  if (!CTX) {
    throw new Error("Failed to get canvas context!");
  }

  // Set fixed dimensions
  CANVAS.width = 800; // 80 tiles wide
  CANVAS.height = 600; // 60 tiles high

  // Calculate world dimensions
  WORLD_WIDTH = Math.floor(CANVAS.width / TILE_SIZE);
  WORLD_HEIGHT = Math.floor(CANVAS.height / TILE_SIZE);

  console.log(`Graphics initialized: ${WORLD_WIDTH}x${WORLD_HEIGHT} tiles`);
  return true;
}

export {
  CANVAS,
  CTX,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  TILE_SIZE,
  initializeGraphics,
};
