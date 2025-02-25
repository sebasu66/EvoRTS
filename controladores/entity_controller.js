/**
 * Base entity controller for EvoRTS
 * Handles entity behavior, interaction with game world, and events
 */
export default class EntityController {
  constructor(entity) {
    this.entity = entity;
    this.entity.parent = this; // Link the entity back to its controller
    this.listeners = {};
    this.world = null; // Reference to the game world, set by parent controller
    this.base = null; // Reference to home base, set by parent controller

    // Fog of war related properties
    this.fogOfWar = true; // Enable fog of war by default
    this.exploredAreas = []; // Areas the entity has explored
    this.visibleAreas = []; // Areas currently visible to the entity
  }

  // Event system: register event listeners
  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Trigger events with data
  triggerEvent(event, data) {
    if (this.listeners[event]) {
      try {
        this.listeners[event].forEach((callback) => callback(data));
      } catch (error) {
        console.error(`Error in ${event} event handler:`, error);
      }
    }
  }

  // Retrieve current stats from the entity
  getStats() {
    return {
      health: this.entity.health,
      maxHealth: this.entity.maxHealth,
      stamina: this.entity.stamina,
      strength: this.entity.strength,
      speed: this.entity.speed,
      carryCapacity: this.entity.carryCapacity,
      perception: this.entity.perception,
      perceptionRadius: this.entity.perceptionRadius,
      regenSpeed: this.entity.regenSpeed,
      attackPower: this.entity.attackPower,
      defense: this.entity.defense,
      level: this.entity.level,
      cargo: this.entity.cargo,
      mode: this.entity.mode,
    };
  }

  // Recalculate derived stats
  recalcStats() {
    // For example, carry capacity scales with strength
    this.entity.carryCapacity = this.entity.strength * 5;
    // Speed increases slightly with level
    this.entity.speed = 5 + this.entity.level * 0.2;
    // Health scales with stamina and level
    this.entity.maxHealth =
      100 + this.entity.stamina * 0.5 + this.entity.level * 10;
    // Regen speed scales with stamina
    this.entity.regenSpeed = 1 + this.entity.stamina / 200;

    // Trigger an event after recalculation
    this.triggerEvent("statsRecalculated", this.getStats());
  }

  // Get current speed based on cargo and health
  getCurrentSpeed() {
    let realSpeed = this.entity.speed;
    const cargoWeight = this.entity.getCargoWeight();

    if (cargoWeight > this.entity.carryCapacity) {
      realSpeed *= 0.5; // Reduce speed by 50% if overloaded
    }

    if (this.entity.health < this.entity.maxHealth * 0.3) {
      realSpeed *= 0.5; // Reduce speed by 50% if health is below 30%
    }

    return realSpeed;
  }

  // Update method - called once per game tick
  update(deltaTime = 16.66) {
    // Basic healing over time - scale healing to deltaTime
    const healingFactor = deltaTime / 1000; // Convert to seconds

    if (this.entity.health < this.entity.maxHealth) {
      this.entity.health += this.entity.regenSpeed * healingFactor;
      if (this.entity.health > this.entity.maxHealth) {
        this.entity.health = this.entity.maxHealth;
      }
    }

    // Track time for perception updates
    this._timeSinceLastPerception =
      (this._timeSinceLastPerception || 0) + deltaTime;
    this._timeSinceLastFogUpdate =
      (this._timeSinceLastFogUpdate || 0) + deltaTime;

    // Process movement if we have a destination
    this.moveToDestination(deltaTime);

    // Update fog of war (every 200ms)
    const fogUpdateInterval = 200;
    if (this._timeSinceLastFogUpdate >= fogUpdateInterval) {
      this._timeSinceLastFogUpdate = 0;
      this.updateFogOfWar();
    }

    // Check for nearby objects at reduced frequency (every 250ms)
    // Increased from 100ms to 250ms to make normal time 50% slower
    const perceptionInterval = 250;
    if (this._timeSinceLastPerception >= perceptionInterval) {
      this._timeSinceLastPerception = 0;
      this.updatePerception();
    }

    // Execute behavior based on current state - less frequent than movement
    this._timeSinceLastBehavior =
      (this._timeSinceLastBehavior || 0) + deltaTime;
    const behaviorInterval = 400; // Execute behaviors every 400ms (slower than before)

    if (this._timeSinceLastBehavior >= behaviorInterval) {
      this._timeSinceLastBehavior = 0;
      this.executeBehavior();
    }
  }

  // Move the entity toward its destination
  moveToDestination(deltaTime = 16.66) {
    if (!this.entity.destination) return;

    // Calculate distance to destination
    const dx = this.entity.destination.x - this.entity.x;
    const dy = this.entity.destination.y - this.entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if we've arrived using inReach function
    if (this.inReach(this.entity.destination)) {
      // Destination reached, trigger event
      this.triggerEvent("destinationReached", this.entity.destination);
      this.entity.destination = null;
      this.entity.isMoving = false;

      // If we were in a moving state, switch to idle
      if (this.entity.currentState === "moving") {
        this.entity.setState("idle");
      }

      return;
    }

    // Continue moving toward destination
    const baseSpeed = this.getCurrentSpeed();

    // Scale speed to deltaTime (move at consistent speed regardless of frame rate)
    // baseSpeed is units per second, so we need to convert to units per millisecond
    const speedFactor = deltaTime / 1000;
    const effectiveSpeed = baseSpeed * speedFactor;

    const moveDistance = Math.min(effectiveSpeed, distance);
    const angle = Math.atan2(dy, dx);

    // Calculate movement
    const moveX = Math.cos(angle) * moveDistance;
    const moveY = Math.sin(angle) * moveDistance;

    // Calculate new position
    let newX = this.entity.x + moveX;
    let newY = this.entity.y + moveY;

    // Get world boundaries from world if available, or use defaults
    const worldBounds = this.world?.getBounds?.() || {
      minX: 0,
      minY: 0,
      maxX: 4200, // Default from previous implementation
      maxY: 3000, // Default from previous implementation
    };

    // Prevent going outside world boundaries with larger buffer
    newX = Math.max(
      worldBounds.minX + 50,
      Math.min(worldBounds.maxX - 50, newX)
    );
    newY = Math.max(
      worldBounds.minY + 50,
      Math.min(worldBounds.maxY - 50, newY)
    );

    // Check for collision with walls
    if (this.world && this.world.isWall(newX, newY)) {
      // Collision detected, stop movement
      return;
    }

    // Update position
    this.entity.x = newX;
    this.entity.y = newY;
    this.entity.direction = angle;

    // Trigger movement event
    this.triggerEvent("moved", { x: this.entity.x, y: this.entity.y });
  }

  // Check if a location is within interaction range
  inReach(location) {
    if (!location) return false;

    const dx = location.x - this.entity.x;
    const dy = location.y - this.entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= 15; // Increased from 5 to 15 for better interaction
  }

  // Update fog of war based on entity's current position
  updateFogOfWar() {
    if (!this.fogOfWar) return;

    // Current cell position (assuming a grid-based fog of war)
    const cellSize = 50; // Size of each grid cell
    const centerX = Math.floor(this.entity.x / cellSize);
    const centerY = Math.floor(this.entity.y / cellSize);
    const visionRadius = Math.ceil(this.entity.perceptionRadius / cellSize);

    // Clear visible areas (they'll be recalculated)
    this.visibleAreas = [];

    // Mark cells as visible and explored in vision radius
    for (let y = centerY - visionRadius; y <= centerY + visionRadius; y++) {
      for (let x = centerX - visionRadius; x <= centerX + visionRadius; x++) {
        // Skip if out of bounds
        if (x < 0 || y < 0) continue;

        // Calculate distance to center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If within vision radius, mark as visible and explored
        if (distance <= visionRadius) {
          const cell = `${x},${y}`;
          this.visibleAreas.push(cell);

          // Add to explored areas if not already there
          if (!this.exploredAreas.includes(cell)) {
            this.exploredAreas.push(cell);
            this.triggerEvent("areaExplored", { x, y, cellSize });
          }
        }
      }
    }
  }

  // Check if a position is visible to this entity
  isPositionVisible(x, y) {
    if (!this.fogOfWar) return true;

    const cellSize = 50;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cell = `${cellX},${cellY}`;

    return this.visibleAreas.includes(cell);
  }

  // Check if a position has been explored
  isPositionExplored(x, y) {
    if (!this.fogOfWar) return true;

    const cellSize = 50;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cell = `${cellX},${cellY}`;

    return this.exploredAreas.includes(cell);
  }

  // Scan for objects in perception radius
  updatePerception() {
    if (!this.world) return;

    // Get objects within perception radius
    const nearbyObjects = this.world.getObjectsInRadius(
      this.entity.x,
      this.entity.y,
      this.entity.perceptionRadius
    );

    // Process each object - only if visible through fog of war
    nearbyObjects.forEach((object) => {
      // Skip objects that are not visible due to fog of war
      if (!this.isPositionVisible(object.x, object.y)) return;

      // Skip objects that are already fully perceived
      const existingObject = this.entity.memory.perceptionMap.find(
        (obj) => obj.id === object.id
      );

      if (existingObject && existingObject.analized) return;

      // Calculate object details
      const dx = object.x - this.entity.x;
      const dy = object.y - this.entity.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const direction = Math.atan2(dy, dx);

      // Prepare object data
      const objectData = {
        id: object.id,
        distance,
        direction,
        position: { x: object.x, y: object.y },
        lastSeen: Date.now(),
        // Basic properties that can be seen from a distance
        size: object.size || "unknown",
        color: object.color || "unknown",
        type: object.type || "unknown",
        // Will be filled in by analysis
        analizedPercentage: existingObject
          ? existingObject.analizedPercentage
          : 0,
        analized: false,
        properties: existingObject ? [...existingObject.properties] : [],
      };

      // Update perception map
      this.entity.updatePerceptionMap(object.id, objectData);

      // If this is a newly perceived object, trigger event
      if (!existingObject) {
        this.triggerEvent("newObjectPerceived", objectData);

        // Call entity behavior if it exists
        if (this.entity.behaviors.onNewObjectPerceived) {
          const behavior =
            this.entity.behaviors.onNewObjectPerceived(objectData);
          this.processBehaviorResult(behavior);
        }
      }

      // Handle specific object types when first identified
      if (object.type === "resource" && !existingObject) {
        // We just spotted a resource - trigger appropriate behavior
        if (this.entity.behaviors.onResourceSpotted) {
          const behavior = this.entity.behaviors.onResourceSpotted(
            object.resourceType,
            { x: object.x, y: object.y }
          );
          this.processBehaviorResult(behavior);
        }
      } else if (object.type === "enemy" && !existingObject) {
        // We just spotted an enemy - trigger appropriate behavior
        if (this.entity.behaviors.onEnemySpotted) {
          const behavior = this.entity.behaviors.onEnemySpotted(
            object.enemyType,
            { x: object.x, y: object.y }
          );
          this.processBehaviorResult(behavior);
        }
      }
    });
  }

  // Analyze an object more deeply when in range
  analyzeObject(objectId) {
    if (!this.world) return false;

    // Find the object in perception map
    const perceivedObject = this.entity.memory.perceptionMap.find(
      (obj) => obj.id === objectId
    );

    if (!perceivedObject) return false;

    // Find real object data
    const worldObject = this.world.getObject(objectId);
    if (!worldObject) return false;

    // Check if we're close enough to analyze - must be in reach
    if (!this.inReach({ x: worldObject.x, y: worldObject.y })) {
      return false; // Too far to analyze, must be in interaction range
    }

    // Increase analysis percentage based on perception skill
    const analysisIncrement = 5 + this.entity.perception / 10;
    perceivedObject.analizedPercentage += analysisIncrement;

    // Update last seen
    perceivedObject.lastSeen = Date.now();
    perceivedObject.position = { x: worldObject.x, y: worldObject.y };

    // If fully analyzed, copy all properties
    if (perceivedObject.analizedPercentage >= 100) {
      perceivedObject.analizedPercentage = 100;
      perceivedObject.analized = true;

      // Copy all properties from world object
      if (worldObject.properties) {
        worldObject.properties.forEach((property) => {
          if (!perceivedObject.properties.includes(property)) {
            perceivedObject.properties.push(property);
          }
        });
      }

      // Trigger event for fully analyzed object
      this.triggerEvent("objectFullyAnalyzed", perceivedObject);
    } else {
      // Partially analyzed - reveal properties gradually
      if (worldObject.properties && worldObject.properties.length > 0) {
        // Number of properties to reveal based on analysis percentage
        const propsToReveal = Math.floor(
          (worldObject.properties.length * perceivedObject.analizedPercentage) /
            100
        );

        // Add properties that aren't already in the perceived object
        for (let i = 0; i < propsToReveal; i++) {
          if (
            i < worldObject.properties.length &&
            !perceivedObject.properties.includes(worldObject.properties[i])
          ) {
            perceivedObject.properties.push(worldObject.properties[i]);
          }
        }
      }

      // Trigger event for ongoing analysis
      this.triggerEvent("objectAnalyzed", perceivedObject);
    }

    return true;
  }

  // Get all objects in the entity's memory
  getPerceptionMap() {
    return this.entity.memory.perceptionMap;
  }

  // Apply damage to the entity and trigger behavior
  injure(damage, source) {
    const oldHealth = this.entity.health;
    this.entity.health -= damage;

    if (this.entity.health < 0) {
      this.entity.health = 0;
    }

    // Trigger the event
    this.triggerEvent("gotInjured", {
      oldHealth,
      newHealth: this.entity.health,
      damage,
      source,
    });

    // Execute damage behavior if defined
    if (this.entity.behaviors.onDamaged) {
      const behavior = this.entity.behaviors.onDamaged(damage, source);
      this.processBehaviorResult(behavior);
    }

    // Return true if entity died
    return this.entity.health <= 0;
  }

  // Process the result of a behavior function
  processBehaviorResult(behavior) {
    if (!behavior || !behavior.action) return;

    switch (behavior.action) {
      case "move":
      case "approach":
      case "flee":
        if (behavior.target) {
          this.entity.destination = behavior.target;
          this.entity.isMoving = true;
          this.entity.setState("moving");
        }
        break;

      case "gather":
        if (behavior.target) {
          this.entity.destination = behavior.target;
          this.entity.isMoving = true;
          this.entity.setState("gathering");
        }
        break;

      case "attack":
        if (behavior.target) {
          this.entity.destination = {
            x: behavior.target.x,
            y: behavior.target.y,
          };
          this.entity.isMoving = true;
          this.entity.setState("attacking");
        }
        break;

      case "moveAndAttack":
        if (behavior.target) {
          this.entity.destination = behavior.target;
          this.entity.isMoving = true;
          this.entity.setState("attacking");
        }
        break;

      case "returnToBase":
        if (this.base) {
          this.entity.destination = {
            x: this.base.x,
            y: this.base.y,
          };
          this.entity.isMoving = true;
          this.entity.setState("returning");
        }
        break;

      case "analyze":
        if (behavior.target && behavior.target.id) {
          this.entity.destination = behavior.target.position;
          this.entity.isMoving = true;
          this.entity.setState("analyzing");
          this.entity.currentTask = {
            type: "analyze",
            objectId: behavior.target.id,
          };
        }
        break;

      case "explore":
        // More sophisticated exploration - prefer unexplored areas
        let targetX, targetY;

        // Try to find an unexplored area nearby
        if (this.fogOfWar && this.exploredAreas.length > 0) {
          // Get a random direction that tends toward unexplored areas
          const angle = this.getExplorationAngle();
          const distance = this.entity.perceptionRadius * 0.8;
          targetX = this.entity.x + Math.cos(angle) * distance;
          targetY = this.entity.y + Math.sin(angle) * distance;
        } else {
          // Fallback to random exploration
          const angle = Math.random() * Math.PI * 2;
          const distance = this.entity.perceptionRadius * 0.8;
          targetX = this.entity.x + Math.cos(angle) * distance;
          targetY = this.entity.y + Math.sin(angle) * distance;
        }

        // Get world boundaries from world if available, or use defaults
        const worldBounds = this.world?.getBounds?.() || {
          minX: 0,
          minY: 0,
          maxX: 4200,
          maxY: 3000,
        };

        // Clamp to world boundaries with larger buffer
        targetX = Math.max(
          worldBounds.minX + 50,
          Math.min(worldBounds.maxX - 50, targetX)
        );
        targetY = Math.max(
          worldBounds.minY + 50,
          Math.min(worldBounds.maxY - 50, targetY)
        );

        this.entity.destination = { x: targetX, y: targetY };
        this.entity.isMoving = true;
        this.entity.setState("exploring");
        break;
    }
  }

  // Calculate an angle that leads toward unexplored areas
  getExplorationAngle() {
    const cellSize = 50;
    const centerX = Math.floor(this.entity.x / cellSize);
    const centerY = Math.floor(this.entity.y / cellSize);

    // Check for unexplored cells within detection range
    const checkRadius = Math.ceil(this.entity.perceptionRadius / cellSize) + 2;
    let unexploredCells = [];

    for (let y = centerY - checkRadius; y <= centerY + checkRadius; y++) {
      for (let x = centerX - checkRadius; x <= centerX + checkRadius; x++) {
        if (x < 0 || y < 0) continue;

        const cell = `${x},${y}`;
        // If cell not explored, add to candidates
        if (!this.exploredAreas.includes(cell)) {
          unexploredCells.push({ x, y });
        }
      }
    }

    // If we found unexplored cells, calculate angle toward a random one
    if (unexploredCells.length > 0) {
      // Choose a random unexplored cell
      const target =
        unexploredCells[Math.floor(Math.random() * unexploredCells.length)];
      const targetX = (target.x + 0.5) * cellSize; // Center of cell
      const targetY = (target.y + 0.5) * cellSize;

      // Calculate angle to target
      const dx = targetX - this.entity.x;
      const dy = targetY - this.entity.y;
      return Math.atan2(dy, dx);
    }

    // Default to random angle if no unexplored cells found
    return Math.random() * Math.PI * 2;
  }

  // Set programmable behavior
  setBehavior(type, behaviorFn) {
    if (!this.entity.behaviors.hasOwnProperty(type)) return false;

    try {
      // Store the function as the behavior of this type
      this.entity.behaviors[type] = behaviorFn;
      return true;
    } catch (error) {
      console.error(`Error setting behavior for ${type}:`, error);
      return false;
    }
  }

  // Execute behavior based on current state
  executeBehavior() {
    // Don't execute behaviors while moving
    if (this.entity.isMoving) return;

    // If analyzing an object, continue the analysis
    if (
      this.entity.currentState === "analyzing" &&
      this.entity.currentTask &&
      this.entity.currentTask.type === "analyze"
    ) {
      // If we're in reach of the target, analyze it
      const objectId = this.entity.currentTask.objectId;
      const object = this.entity.memory.perceptionMap.find(
        (obj) => obj.id === objectId
      );

      if (object && this.analyzeObject(objectId)) {
        // Analysis progressed successfully
        if (object.analizedPercentage >= 100) {
          // Analysis complete, clear task
          this.entity.currentTask = null;
          this.entity.setState("idle");
        }
      } else {
        // Cannot analyze (likely out of range), move to the object
        const object = this.entity.memory.perceptionMap.find(
          (obj) => obj.id === objectId
        );
        if (object && object.position) {
          this.entity.destination = object.position;
          this.entity.isMoving = true;
        } else {
          // Object not found or has no position, cancel task
          this.entity.currentTask = null;
          this.entity.setState("idle");
        }
      }
      return;
    }

    // If no current task, execute idle behavior
    if (!this.entity.currentTask && this.entity.behaviors.onIdle) {
      const behavior = this.entity.behaviors.onIdle();
      this.processBehaviorResult(behavior);
    }
  }

  // Set a reference to the game world
  setWorld(world) {
    this.world = world;
  }

  // Set a reference to the home base
  setBase(base) {
    this.base = base;
  }
}
