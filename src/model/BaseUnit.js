/**
 * Base Unit class for EvoRTS
 * Represents the fundamental unit type with basic attributes and behaviors
 */
export default class BaseUnit {
  constructor(id, x, y) {
    // Core properties
    this.id = id;
    this.x = x;
    this.y = y;
    this.health = 100;
    this.maxHealth = 100;
    this.speed = 1.5;  // Decreased speed for better control (was 3)
    this.carryingCapacity = 20; // Increased carrying capacity
    this.attackPower = 10;
    this.defense = 5;
    this.visionRange = 150; // Increased vision range
    
    // State tracking
    this.inventory = {
      energy: 0,
      matter: 0,
      isFull: () => this.inventory.energy + this.inventory.matter >= this.carryingCapacity
    };
    this.currentTask = null;
    this.targetPosition = null;
    this.isMoving = false;
    this.currentState = 'idle';
    this.stateLabel = null;
    this.direction = 0; // Direction in radians

    // Behavior code storage
    this.behaviors = {
      onIdle: () => this.defaultIdle(),
      onResourceSpotted: (type, position) => this.defaultResourceBehavior(type, position),
      onEnemySpotted: (type, position) => this.defaultEnemyBehavior(type, position),
      onDamaged: (amount, attacker) => this.defaultDamagedBehavior(amount, attacker)
    };
  }

  // Default behaviors (can be overridden by player code)
  defaultIdle() {
    // Random movement when idle
    const randomDirection = Math.floor(Math.random() * 8);
    const directions = [
      { dx: 1, dy: 0 },    // right
      { dx: -1, dy: 0 },   // left
      { dx: 0, dy: 1 },    // down
      { dx: 0, dy: -1 },   // up
      { dx: 1, dy: 1 },    // down-right
      { dx: -1, dy: 1 },   // down-left
      { dx: 1, dy: -1 },   // up-right
      { dx: -1, dy: -1 }   // up-left
    ];
    const move = directions[randomDirection];
    
    // Update direction even before actually moving
    this.direction = Math.atan2(move.dy, move.dx);
    
    this.moveTo(this.x + move.dx * 50, this.y + move.dy * 50);
  }

  defaultResourceBehavior(type, position) {
    if (!this.inventory.isFull()) {
      this.moveTo(position.x, position.y);
    }
  }

  defaultEnemyBehavior(type, position) {
    // Simple flee behavior by default
    const dx = this.x - position.x;
    const dy = this.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < this.visionRange / 2) {
      // Move away from enemy
      this.moveTo(this.x + dx, this.y + dy);
    }
  }

  defaultDamagedBehavior(amount, attacker) {
    // Move away from attacker
    if (attacker) {
      const dx = this.x - attacker.x;
      const dy = this.y - attacker.y;
      this.moveTo(this.x + dx, this.y + dy);
    }
  }

  // API methods available to player code
  moveTo(x, y) {
    // Calculate direction to target before setting movement
    const dx = x - this.x;
    const dy = y - this.y;
    
    // Only update direction if we have a valid vector
    if (dx !== 0 || dy !== 0) {
      this.direction = Math.atan2(dy, dx);
    }
    
    this.targetPosition = { x, y };
    this.isMoving = true;
    this.setState('moving');
    this.logActivity(`Moving to (${Math.round(x)}, ${Math.round(y)})`);
    return true;
  }

  gather(resourceNode) {
    if (this.distanceTo(resourceNode) < 10) {
      const amount = Math.min(5, this.carryingCapacity - this.inventory[resourceNode.type]);
      if (amount > 0) {
        this.inventory[resourceNode.type] += amount;
        resourceNode.quantity -= amount;
        this.setState('gathering');
        this.logActivity(`Gathered ${amount} ${resourceNode.type}`);
        return amount;
      }
    }
    return 0;
  }

  attack(target) {
    if (this.distanceTo(target) < 20) {
      const damage = Math.max(1, this.attackPower - target.defense);
      target.takeDamage(damage, this);
      this.setState('attacking');
      this.logActivity(`Attacked ${target.id} for ${damage} damage`);
      return damage;
    }
    return 0;
  }

  returnToBase(base) {
    this.moveTo(base.x, base.y);
    if (this.distanceTo(base) < 10) {
      // Transfer resources to base
      const energyDeposited = this.inventory.energy;
      const matterDeposited = this.inventory.matter;
      
      base.energy += this.inventory.energy;
      base.matter += this.inventory.matter;
      this.inventory.energy = 0;
      this.inventory.matter = 0;
      
      this.setState('depositing');
      this.logActivity(`Deposited ${energyDeposited} energy, ${matterDeposited} matter at base`);
      return true;
    }
    return false;
  }
  
  // Set the current state and update the status label
  setState(state) {
    this.currentState = state;
    // Update will handle displaying the state label
  }
  
  // Log unit activity to the global logger
  logActivity(message) {
    if (window.gameLogger) {
      const type = this.id.startsWith('player') ? 'player' : 'enemy';
      window.gameLogger.log(message, this.id, type);
    }
  }

  // Internal methods
  update() {
    // Handle movement
    if (this.isMoving && this.targetPosition) {
      const dx = this.targetPosition.x - this.x;
      const dy = this.targetPosition.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.speed) {
        // Arrived at destination
        this.x = this.targetPosition.x;
        this.y = this.targetPosition.y;
        this.isMoving = false;
        this.targetPosition = null;
        this.setState('idle');
        
        // Call idle behavior when movement completes
        if (!this.currentTask) {
          this.behaviors.onIdle();
        }
      } else {
        // Move toward target
        const moveX = (dx / distance) * this.speed;
        const moveY = (dy / distance) * this.speed;
        this.x += moveX;
        this.y += moveY;
        
        // Update direction
        this.direction = Math.atan2(dy, dx);
      }
    } else if (!this.currentTask) {
      // If not moving and no task, trigger idle behavior
      this.setState('idle');
      this.behaviors.onIdle();
    }
  }

  takeDamage(amount, attacker) {
    const actualDamage = Math.max(1, amount - this.defense / 2);
    this.health -= actualDamage;
    
    // Trigger damage behavior
    this.behaviors.onDamaged(actualDamage, attacker);
    
    return this.health <= 0;
  }

  distanceTo(entity) {
    const dx = this.x - entity.x;
    const dy = this.y - entity.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Method to inject player-defined behavior code
  setBehavior(type, behaviorFn) {
    if (this.behaviors.hasOwnProperty(type)) {
      try {
        // Create a more robust context for the behavior function
        // Make sure we use the current instance (this) as the context
        const boundFunction = (...args) => {
          // Create a context with the current state of the unit
          const context = {
            // Include all methods from this unit (properly bound)
            moveTo: (x, y) => this.moveTo(x, y),
            gather: (resource) => this.gather(resource),
            attack: (target) => this.attack(target),
            returnToBase: (base) => this.returnToBase(base || this.parent.playerBase),
            distanceTo: (entity) => this.distanceTo(entity),
            
            // Include all properties from the unit
            get x() { return this.unit.x; },
            get y() { return this.unit.y; },
            get health() { return this.unit.health; },
            get maxHealth() { return this.unit.maxHealth; },
            get speed() { return this.unit.speed; },
            get carryingCapacity() { return this.unit.carryingCapacity; },
            get attackPower() { return this.unit.attackPower; },
            get defense() { return this.unit.defense; },
            get visionRange() { return this.unit.visionRange; },
            get inventory() { return this.unit.inventory; },
            get id() { return this.unit.id; },
            
            // Include a reference to the parent controller and unit
            parent: this.parent,
            unit: this,
            
            // Add logging capability
            log: (message) => this.logActivity(message)
          };
          
          // Call the user-provided function with our context
          try {
            return behaviorFn.apply(context, args);
          } catch (error) {
            this.logActivity(`Error in ${type} behavior: ${error.message}`);
            console.error(`Error executing ${type} behavior:`, error);
            // On error, return a safe default action
            return { action: 'idle' };
          }
        };
        
        // Store the bound function
        this.behaviors[type] = boundFunction;
        return true;
      } catch (error) {
        console.error(`Error setting behavior for ${type}:`, error);
        return false;
      }
    }
    return false;
  }
}