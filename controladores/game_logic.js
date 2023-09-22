//make global variables for canvas and context
const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');
const TILE_SIZE = 10;
const WORLD_WIDTH = CANVAS.width / TILE_SIZE;
const WORLD_HEIGHT = CANVAS.height / TILE_SIZE;

//export all the variables we just created
export { CANVAS, CTX, WORLD_WIDTH, WORLD_HEIGHT, TILE_SIZE };
