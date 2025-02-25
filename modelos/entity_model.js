/**
 * Base EntityModel class for EvoRTS
 * Foundation for all game entities with core attributes and memory system
 */
export default class EntityModel {
  constructor(id, x, y) {
    // Core properties
    this.id = id;
    this.x = x;
    this.y = y;
    this.health = 100;
    this.maxHealth = 100;
    this.stamina = 100;
    this.strength = 10;
    this.speed = 5;
    this.carryCapacity = 50;
    this.perception = 50;
    this.perceptionRadius = 150;
    this.regenSpeed = 1;
    this.attackPower = 10;
    this.defense = 5;
    
    // Memory system
    this.memory = {
      perceptionMap: [], // Objects perceived in the environment
      resources: [],     // Known resource locations
      enemies: [],       // Known enemy locations
      allies: [],        // Known ally locations
      lastPosition: { x, y },
      exploredAreas: []  // Areas the entity has already explored
    };
    
    // State tracking
    this.cargo = {
      energy: 0,
      matter: 0,
      items: [],
      isFull: () => this.getCargoWeight() >= this.carryCapacity
    };
    this.cargoWeight = 0;
    this.destination = null;
    this.currentTask = null;
    this.isMoving = false;
    this.currentState = 'idle';
    this.mode = 'idle';
    this.instructions = [];
    this.xp = 0;
    this.level = 1;
    
    // Behavior storage
    this.behaviors = {
      onIdle: null,
      onResourceSpotted: null,
      onEnemySpotted: null,
      onDamaged: null,
      onNewObjectPerceived: null
    };
  }
  
  // Calculate total cargo weight
  getCargoWeight() {
    let weight = this.cargo.energy + this.cargo.matter;
    if (this.cargo.items && this.cargo.items.length > 0) {
      weight += this.cargo.items.reduce((total, item) => total + (item.weight || 0), 0);
    }
    return weight;
  }
  
  // Memory management functions
  updatePerceptionMap(objectId, properties) {
    const existingObject = this.memory.perceptionMap.find(obj => obj.id === objectId);
    
    if (existingObject) {
      // Update existing object
      Object.assign(existingObject, properties);
    } else {
      // Add new object
      this.memory.perceptionMap.push({
        id: objectId,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        analizedPercentage: 0,
        analized: false,
        ...properties
      });
    }
  }
  
  forgetObject(objectId) {
    this.memory.perceptionMap = this.memory.perceptionMap.filter(obj => obj.id !== objectId);
  }
  
  // XP and leveling
  gainXP(amount) {
    this.xp += amount;
    const xpNeeded = this.level * 100;
    
    if (this.xp >= xpNeeded) {
      this.levelUp();
    }
  }
  
  levelUp() {
    this.level++;
    this.maxHealth += 10;
    this.health = this.maxHealth;
    this.stamina += 5;
    this.strength += 2;
    this.perception += 3;
    this.perceptionRadius += 10;
    
    // Keep track of remaining XP after leveling
    const xpNeeded = (this.level - 1) * 100;
    this.xp -= xpNeeded;
  }
  
  // Status functions
  isHealthy() {
    return this.health > this.maxHealth * 0.7;
  }
  
  isInjured() {
    return this.health <= this.maxHealth * 0.7 && this.health > this.maxHealth * 0.3;
  }
  
  isCritical() {
    return this.health <= this.maxHealth * 0.3;
  }
  
  // API method for determining if an object is analized
  isObjectAnalized(objectId) {
    const object = this.memory.perceptionMap.find(obj => obj.id === objectId);
    return object && object.analized;
  }
  
  // Update current model state
  setState(state) {
    this.currentState = state;
    this.mode = state; // Keep mode and state in sync
  }
}