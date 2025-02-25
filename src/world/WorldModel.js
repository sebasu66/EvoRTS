export default class WorldModel {
  constructor(width = 80, height = 60, tileSize = 10) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.terrain = [];
    this.entities = new Map();
    this.resources = new Map();
    this.wallCollisionMap = new Map();
  }

  generateWorld() {
    console.log("Generating world...");
    this.terrain = this.initializeRandomMap();
    this.generateTerrain();
    this.buildCollisionMap();
    return this.terrain;
  }

  initializeRandomMap() {
    // Initialize empty map
    const map = Array(this.width).fill(null)
      .map(() => Array(this.height).fill(0));

    // Fill with random walls (1) and spaces (0)
    for(let x = 0; x < this.width; x++) {
      for(let y = 0; y < this.height; y++) {
        // Keep borders always as walls
        if(x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          map[x][y] = 1;
        }
        // Keep center area clear for spawn
        else if(x > this.width/2 - 5 && x < this.width/2 + 5 && 
                y > this.height/2 - 5 && y < this.height/2 + 5) {
          map[x][y] = 0;
        }
        // Random fill for the rest
        else {
          map[x][y] = Math.random() < 0.4 ? 1 : 0;
        }
      }
    }
    return map;
  }

  generateTerrain() {
    // Using cellular automata for cave generation
    for (let i = 0; i < 4; i++) {
      this.terrain = this.smoothMap(this.terrain);
    }
  }

  smoothMap(map) {
    const newMap = Array(this.width).fill(null)
      .map(() => Array(this.height).fill(0));

    for(let x = 0; x < this.width; x++) {
      for(let y = 0; y < this.height; y++) {
        const wallCount = this.countNeighborWalls(map, x, y);
        newMap[x][y] = wallCount > 4 ? 1 : 0;
        
        // Preserve borders
        if(x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          newMap[x][y] = 1;
        }
        
        // Keep center clear
        if(x > this.width/2 - 5 && x < this.width/2 + 5 && 
           y > this.height/2 - 5 && y < this.height/2 + 5) {
          newMap[x][y] = 0;
        }
      }
    }
    return newMap;
  }

  countNeighborWalls(map, x, y) {
    let count = 0;
    for(let i = -1; i <= 1; i++) {
      for(let j = -1; j <= 1; j++) {
        const neighborX = x + i;
        const neighborY = y + j;
        
        // Count out-of-bounds as walls
        if(neighborX < 0 || neighborX >= this.width || 
           neighborY < 0 || neighborY >= this.height) {
          count++;
        }
        // Count actual walls
        else if(map[neighborX][neighborY] === 1) {
          count++;
        }
      }
    }
    return count;
  }

  buildCollisionMap() {
    this.wallCollisionMap.clear();
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.terrain[x][y] === 1) {
          this.wallCollisionMap.set(`${x},${y}`, true);
        }
      }
    }
  }
}
