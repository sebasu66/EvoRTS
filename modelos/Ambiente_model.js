import * as g from "../controladores/game_logic.js";

class Ambiente {
  constructor(deathLimit = 3, birthLimit = 4, iterations = 5, fillProb = 0.4) {
    console.log("=== Ambiente Initialization ===");
    this.count = 0;
    this.birthLimit = birthLimit;
    this.deathLimit = deathLimit;
    this.iterations = iterations;

    console.log("Starting cave generation...");
    console.log(
      `Parameters: birthLimit=${birthLimit}, deathLimit=${deathLimit}, iterations=${iterations}`
    );

    this.terreno = this.generateCaveWithTargetDensity(30);
    console.log(
      `Terreno array size: ${this.terreno.length}x${this.terreno[0].length}`
    );
    console.log(
      "Sample of terreno array:",
      this.terreno.slice(0, 3).map((row) => row.slice(0, 3))
    );

    this.wallCollisionMap = new Map();
    this.buildCollisionMap(this.terreno);
    console.log(`Collision map size: ${this.wallCollisionMap.size} walls`);
    console.log("Cave generation complete");
  }

  // Generate a cave with a specific target wall density percentage
  generateCaveWithTargetDensity(targetWallPercent = 25) {
    // Initial parameters
    let fillProb = 0.4;
    let iterations = 5;
    let birthLimit = 4;
    let deathLimit = 3;

    // Generate initial cave
    let cave = this.refinedCellularAutomataCave(
      fillProb,
      iterations,
      birthLimit,
      deathLimit
    );

    // Measure current wall density
    let currentWallPercent = this.calculateWallDensity(cave);
    console.log(`Initial wall density: ${currentWallPercent.toFixed(2)}%`);

    // Adjust parameters and regenerate until we get close to target density
    let attempts = 0;
    const maxAttempts = 5;

    while (
      Math.abs(currentWallPercent - targetWallPercent) > 3 &&
      attempts < maxAttempts
    ) {
      attempts++;

      // Adjust fill probability based on current density
      if (currentWallPercent > targetWallPercent) {
        // Too many walls, decrease initial fill probability
        fillProb *= 0.8;
      } else {
        // Too few walls, increase initial fill probability
        fillProb *= 1.2;
      }

      // Regenerate cave
      cave = this.refinedCellularAutomataCave(
        fillProb,
        iterations,
        birthLimit,
        deathLimit
      );
      currentWallPercent = this.calculateWallDensity(cave);
      console.log(
        `Attempt ${attempts}: wall density: ${currentWallPercent.toFixed(
          2
        )}% (target: ${targetWallPercent}%)`
      );
    }

    // Final adjustment - manually add or remove walls to achieve exact percentage
    cave = this.adjustWallDensity(cave, targetWallPercent);
    console.log(
      `Final wall density: ${this.calculateWallDensity(cave).toFixed(2)}%`
    );

    // Build a collision map for fast lookups
    this.buildCollisionMap(cave);

    return cave;
  }

  // Calculate wall density as a percentage
  calculateWallDensity(cave) {
    let wallCount = 0;
    let totalCells = 0;

    for (let i = 0; i < cave.length; i++) {
      for (let j = 0; j < cave[i].length; j++) {
        totalCells++;
        if (cave[i][j] === 1) {
          wallCount++;
        }
      }
    }

    return (wallCount / totalCells) * 100;
  }

  // Manually adjust wall density to match target percentage
  adjustWallDensity(cave, targetWallPercent) {
    const adjustedCave = JSON.parse(JSON.stringify(cave)); // Deep copy

    let currentWallPercent = this.calculateWallDensity(adjustedCave);
    const totalCells = g.WORLD_WIDTH * g.WORLD_HEIGHT;
    const targetWallCount = Math.floor((targetWallPercent / 100) * totalCells);
    let currentWallCount = Math.floor((currentWallPercent / 100) * totalCells);

    // Create list of modifiable cells (not borders or center area)
    let modifiableCells = [];
    for (let i = 2; i < g.WORLD_WIDTH - 2; i++) {
      for (let j = 2; j < g.WORLD_HEIGHT - 2; j++) {
        // Skip center area to ensure player spawn area remains clear
        if (
          i > g.WORLD_WIDTH / 2 - 7 &&
          i < g.WORLD_WIDTH / 2 + 7 &&
          j > g.WORLD_HEIGHT / 2 - 7 &&
          j < g.WORLD_HEIGHT / 2 + 7
        ) {
          continue;
        }
        modifiableCells.push({ x: i, y: j });
      }
    }

    // Shuffle the cells to avoid patterns
    modifiableCells = this.shuffleArray(modifiableCells);

    let index = 0;

    // If we need more walls
    if (currentWallCount < targetWallCount) {
      while (
        currentWallCount < targetWallCount &&
        index < modifiableCells.length
      ) {
        const cell = modifiableCells[index++];
        if (adjustedCave[cell.x][cell.y] === 0) {
          adjustedCave[cell.x][cell.y] = 1;
          currentWallCount++;
        }
      }
    }
    // If we need fewer walls
    else if (currentWallCount > targetWallCount) {
      while (
        currentWallCount > targetWallCount &&
        index < modifiableCells.length
      ) {
        const cell = modifiableCells[index++];
        if (adjustedCave[cell.x][cell.y] === 1) {
          adjustedCave[cell.x][cell.y] = 0;
          currentWallCount--;
        }
      }
    }

    return adjustedCave;
  }

  // Fisher-Yates shuffle algorithm
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Build a collision map for fast lookups
  buildCollisionMap(cave) {
    this.wallCollisionMap.clear();
    for (let i = 0; i < cave.length; i++) {
      for (let j = 0; j < cave[i].length; j++) {
        if (cave[i][j] === 1) {
          this.wallCollisionMap.set(`${i},${j}`, true);
        }
      }
    }
  }

  // Original cave generation method with cellular automata
  refinedCellularAutomataCave(
    fillProb = 0.4,
    iterations = 5,
    birthLimit = 4,
    deathLimit = 3
  ) {
    // Create a 2D array of 0s (open space) and 1s (walls)
    let cave = [];
    for (let i = 0; i < g.WORLD_WIDTH; i++) {
      cave.push([]);
      for (let j = 0; j < g.WORLD_HEIGHT; j++) {
        // Keep center area clear for starting position
        if (
          i > g.WORLD_WIDTH / 2 - 7 &&
          i < g.WORLD_WIDTH / 2 + 7 &&
          j > g.WORLD_HEIGHT / 2 - 7 &&
          j < g.WORLD_HEIGHT / 2 + 7
        ) {
          cave[i].push(0);
        }
        // Ensure solid borders
        else if (
          i === 0 ||
          j === 0 ||
          i == g.WORLD_WIDTH - 1 ||
          j == g.WORLD_HEIGHT - 1
        ) {
          cave[i].push(1);
        }
        // Randomly fill the rest
        else {
          cave[i].push(Math.random() < fillProb ? 1 : 0);
        }
      }
    }

    // Apply cellular automata iterations
    for (let a = 0; a < iterations; a++) {
      cave = this.doSimulationStep(cave);
    }

    return cave;
  }

  // Check if a position is a wall
  isWall(x, y) {
    const gridX = Math.floor(x / g.TILE_SIZE);
    const gridY = Math.floor(y / g.TILE_SIZE);

    // Debug info
    if (gridX === 0 || gridY === 0) {
      console.log(`Checking wall at (${gridX}, ${gridY})`);
      console.log(`Terreno value: ${this.terreno[gridX]?.[gridY]}`);
      console.log(
        `Collision map has: ${this.wallCollisionMap.has(`${gridX},${gridY}`)}`
      );
    }

    if (
      gridX < 0 ||
      gridX >= g.WORLD_WIDTH ||
      gridY < 0 ||
      gridY >= g.WORLD_HEIGHT
    ) {
      return true;
    }

    return (
      this.wallCollisionMap.has(`${gridX},${gridY}`) ||
      (this.terreno[gridX] && this.terreno[gridX][gridY] === 1)
    );
  }

  // Get world bounds for entities
  getBounds() {
    return {
      minX: 0,
      minY: 0,
      maxX: g.WORLD_WIDTH * g.TILE_SIZE,
      maxY: g.WORLD_HEIGHT * g.TILE_SIZE,
    };
  }

  // Get objects in a radius (for perception)
  getObjectsInRadius(centerX, centerY, radius, type = null) {
    // This would normally search for resources, enemies, etc.
    // For now, return an empty array (implemented in child classes)
    return [];
  }

  //Returns the number of cells in a ring around (x,y) that are alive.
  countAliveNeighbours(map, x, y) {
    this.count = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        let neighbour_x = x + i;
        let neighbour_y = y + j;
        //If we're looking at the middle point
        if (i == 0 && j == 0) {
          //Do nothing, we don't want to add ourselves in!
        }
        //In case the index we're looking at it off the edge of the map
        else if (
          neighbour_x < 0 ||
          neighbour_y < 0 ||
          neighbour_x >= map.length ||
          neighbour_y >= map[0].length
        ) {
          this.count = this.count + 1;
        }
        //Otherwise, a normal check of the neighbour
        else if (map[neighbour_x][neighbour_y]) {
          this.count = this.count + 1;
        }
      }
    }
    return this.count;
  }

  doSimulationStep(oldMap) {
    let newMap = [];
    //Loop over each row and column of the map
    for (let x = 0; x < oldMap.length; x++) {
      //Create the new row
      newMap.push([]);
      for (let y = 0; y < oldMap[0].length; y++) {
        let nbs = this.countAliveNeighbours(oldMap, x, y);
        //The new value is based on our simulation rules
        //First, if a cell is alive but has too few neighbours, kill it.
        if (oldMap[x][y] == 1) {
          if (nbs < this.deathLimit) {
            newMap[x][y] = 0;
          } else {
            newMap[x][y] = 1;
          }
        } //Otherwise, if the cell is dead now, check if it has the right number of neighbours to be 'born'
        else {
          if (nbs > this.birthLimit) {
            newMap[x][y] = 1;
          } else {
            newMap[x][y] = 0;
          }
        }
      }
    }
    return newMap;
  }

  // Get the object by ID
  getObject(id) {
    // This would normally return a specific object by ID
    // For now, return null (implemented in child classes)
    return null;
  }
}

// Simple A* pathfinding implementation for navigation
class PathFinder {
  constructor(ambiente) {
    this.ambiente = ambiente;
  }

  // Find a path from start to goal
  findPath(startX, startY, goalX, goalY) {
    // Convert coordinates to grid coordinates
    const gridStartX = Math.floor(startX / g.TILE_SIZE);
    const gridStartY = Math.floor(startY / g.TILE_SIZE);
    const gridGoalX = Math.floor(goalX / g.TILE_SIZE);
    const gridGoalY = Math.floor(goalY / g.TILE_SIZE);

    // Check if goal is walkable, if not find nearest walkable tile
    if (this.ambiente.isWall(goalX, goalY)) {
      const nearest = this.findNearestWalkable(gridGoalX, gridGoalY);
      if (nearest) {
        return this.aStarSearch(gridStartX, gridStartY, nearest.x, nearest.y);
      }
      return null; // No walkable path possible
    }

    // Perform A* search
    return this.aStarSearch(gridStartX, gridStartY, gridGoalX, gridGoalY);
  }

  // Find nearest walkable position to a blocked goal
  findNearestWalkable(gridX, gridY) {
    const checked = new Set();
    const queue = [];
    const maxDistance = 10; // Maximum search distance

    // Add starting position
    queue.push({ x: gridX, y: gridY, distance: 0 });
    checked.add(`${gridX},${gridY}`);

    while (queue.length > 0) {
      const current = queue.shift();

      // If current position is walkable, return it
      if (
        !this.ambiente.isWall(current.x * g.TILE_SIZE, current.y * g.TILE_SIZE)
      ) {
        return { x: current.x, y: current.y };
      }

      // Stop if we've reached max search distance
      if (current.distance >= maxDistance) {
        continue;
      }

      // Check neighboring tiles
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (
          !checked.has(key) &&
          neighbor.x >= 0 &&
          neighbor.x < g.WORLD_WIDTH &&
          neighbor.y >= 0 &&
          neighbor.y < g.WORLD_HEIGHT
        ) {
          queue.push({
            x: neighbor.x,
            y: neighbor.y,
            distance: current.distance + 1,
          });
          checked.add(key);
        }
      }
    }

    return null; // No walkable position found
  }

  // A* search algorithm implementation
  aStarSearch(startX, startY, goalX, goalY) {
    // Initialize open and closed sets
    const openSet = new PriorityQueue();
    const closedSet = new Set();
    const cameFrom = new Map();

    // Cost from start to current node
    const gScore = new Map();
    gScore.set(`${startX},${startY}`, 0);

    // Add start node to open set
    openSet.enqueue({
      x: startX,
      y: startY,
      f: this.heuristic(startX, startY, goalX, goalY),
    });

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue();

      // If we reached the goal, reconstruct and return the path
      if (current.x === goalX && current.y === goalY) {
        return this.reconstructPath(cameFrom, current);
      }

      // Add current to closed set
      closedSet.add(`${current.x},${current.y}`);

      // Check all neighbors
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        // Skip if out of bounds or is a wall
        if (
          neighbor.x < 0 ||
          neighbor.x >= g.WORLD_WIDTH ||
          neighbor.y < 0 ||
          neighbor.y >= g.WORLD_HEIGHT ||
          this.ambiente.isWall(
            neighbor.x * g.TILE_SIZE,
            neighbor.y * g.TILE_SIZE
          )
        ) {
          continue;
        }

        // Skip if in closed set
        if (closedSet.has(neighborKey)) {
          continue;
        }

        // Calculate tentative gScore
        const tentativeGScore = gScore.get(`${current.x},${current.y}`) + 1;

        // If neighbor not in open set or has a better score
        if (
          !gScore.has(neighborKey) ||
          tentativeGScore < gScore.get(neighborKey)
        ) {
          // Update path and scores
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);

          // Calculate fScore (gScore + heuristic)
          const fScore =
            tentativeGScore +
            this.heuristic(neighbor.x, neighbor.y, goalX, goalY);

          // Add to open set if not there
          if (!openSet.contains(neighborKey)) {
            openSet.enqueue({
              x: neighbor.x,
              y: neighbor.y,
              f: fScore,
            });
          }
        }
      }
    }

    // No path found
    return null;
  }

  // Manhattan distance heuristic
  heuristic(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  // Reconstruct path from A* search
  reconstructPath(cameFrom, current) {
    const path = [current];
    let currentKey = `${current.x},${current.y}`;

    while (cameFrom.has(currentKey)) {
      const current = cameFrom.get(currentKey);
      path.unshift(current);
      currentKey = `${current.x},${current.y}`;
    }

    // Convert grid coordinates to world coordinates (center of tiles)
    return path.map((point) => ({
      x: point.x * g.TILE_SIZE + g.TILE_SIZE / 2,
      y: point.y * g.TILE_SIZE + g.TILE_SIZE / 2,
    }));
  }
}

// Priority queue for A* search
class PriorityQueue {
  constructor() {
    this.elements = [];
    this.keySet = new Set();
  }

  enqueue(element) {
    const key = `${element.x},${element.y}`;
    this.keySet.add(key);

    // Find position to insert (sort by f value)
    let insertIndex = this.elements.length;
    for (let i = 0; i < this.elements.length; i++) {
      if (element.f < this.elements[i].f) {
        insertIndex = i;
        break;
      }
    }

    this.elements.splice(insertIndex, 0, element);
  }

  dequeue() {
    const element = this.elements.shift();
    this.keySet.delete(`${element.x},${element.y}`);
    return element;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  contains(key) {
    return this.keySet.has(key);
  }
}

export default Ambiente;
