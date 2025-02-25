import BaseUnit from '../model/BaseUnit.js';
import Resource from '../model/Resource.js';

/**
 * Main game controller for EvoRTS
 * Manages game state, units, and resources
 */
export default class GameController {
  constructor(scene) {
    this.scene = scene;
    this.units = new Map();
    this.resources = new Map();
    this.nextUnitId = 1;
    this.nextResourceId = 1;
    
    // Expanded world size (6x larger)
    this.worldWidth = 4200;  // 700 * 6
    this.worldHeight = 3000; // 500 * 6
    
    this.playerBase = {
      x: 300,
      y: 300,
      energy: 0,
      matter: 0
    };
    this.enemyBase = {
      x: this.worldWidth - 300,
      y: this.worldHeight - 300,
      energy: 0,
      matter: 0
    };
    
    // Player's code storage
    this.playerCode = {
      onIdle: null,
      onResourceSpotted: null,
      onEnemySpotted: null,
      onDamaged: null
    };
    
    // Initialize world
    this.initializeWorld();
  }
  
  /**
   * Initialize the game world with resources and starting units
   */
  initializeWorld() {
    // Create starting resources (more for the larger world)
    this.createRandomResources(30, 'energy');
    this.createRandomResources(30, 'matter');
    
    // Create player's starting units
    this.createUnit(this.playerBase.x + 30, this.playerBase.y + 30, 'player');
    this.createUnit(this.playerBase.x - 30, this.playerBase.y + 30, 'player');
    this.createUnit(this.playerBase.x, this.playerBase.y + 50, 'player');
    this.createUnit(this.playerBase.x + 50, this.playerBase.y, 'player');
    
    // Create enemy's starting units
    this.createUnit(this.enemyBase.x + 30, this.enemyBase.y + 30, 'enemy');
    this.createUnit(this.enemyBase.x - 30, this.enemyBase.y + 30, 'enemy');
    this.createUnit(this.enemyBase.x, this.enemyBase.y + 50, 'enemy');
    this.createUnit(this.enemyBase.x + 50, this.enemyBase.y, 'enemy');
    
    // Set up world bounds
    if (this.scene && this.scene.physics) {
      this.scene.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    }
    
    // Run quick test to validate behavior binding
    this.testBehaviorBinding();
  }
  
  /**
   * Test behavior binding to catch errors early
   */
  testBehaviorBinding() {
    try {
      console.log("Testing behavior bindings...");
      
      // Create a test unit
      const testUnit = this.createUnit(0, 0, 'test');
      
      // Test each behavior type
      console.log("Testing idle behavior...");
      testUnit.behaviors.onIdle();
      
      console.log("Testing resource behavior...");
      testUnit.behaviors.onResourceSpotted('energy', {x: 100, y: 100, id: 'test'});
      
      console.log("Testing enemy behavior...");
      testUnit.behaviors.onEnemySpotted('enemy', {x: 200, y: 200, id: 'test'});
      
      console.log("All behavior tests passed!");
      
      // Remove test unit
      this.units.delete(testUnit.id);
    } catch (error) {
      console.error("❌ Behavior binding test failed:", error);
      console.error("This indicates a problem with function binding in unit behaviors");
    }
  }
  
  /**
   * Create random resources of a given type
   * @param {number} count - Number of resources to create
   * @param {string} type - Resource type ('energy' or 'matter')
   */
  createRandomResources(count, type) {
    for (let i = 0; i < count; i++) {
      // Keep resources away from bases
      let x, y, tooClose;
      do {
        x = Math.random() * (this.worldWidth - 200) + 100;
        y = Math.random() * (this.worldHeight - 200) + 100;
        
        // Check distance from bases
        const distToPlayerBase = Math.sqrt(
          Math.pow(x - this.playerBase.x, 2) + 
          Math.pow(y - this.playerBase.y, 2)
        );
        const distToEnemyBase = Math.sqrt(
          Math.pow(x - this.enemyBase.x, 2) + 
          Math.pow(y - this.enemyBase.y, 2)
        );
        
        tooClose = distToPlayerBase < 250 || distToEnemyBase < 250;
      } while (tooClose);
      
      const quantity = Math.floor(Math.random() * 100) + 100;
      this.createResource(type, x, y, quantity);
    }
  }
  
  /**
   * Create a new resource
   * @param {string} type - Resource type ('energy' or 'matter')
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} quantity - Initial quantity
   * @return {Resource} - The created resource
   */
  createResource(type, x, y, quantity) {
    const id = `resource_${this.nextResourceId++}`;
    const resource = new Resource(type, x, y, quantity);
    this.resources.set(id, resource);
    return resource;
  }
  
  /**
   * Create a new unit
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} faction - Unit faction ('player' or 'enemy')
   * @return {BaseUnit} - The created unit
   */
  createUnit(x, y, faction = 'player') {
    const id = `${faction}_unit_${this.nextUnitId++}`;
    const unit = new BaseUnit(id, x, y);
    
    // Set parent controller reference
    unit.parent = this;
    
    // Apply faction-specific settings
    if (faction === 'enemy') {
      // Enemy units have different default behaviors
      // These would be pre-defined AI behaviors
      unit.setBehavior('onIdle', this.enemyIdleBehavior);
      unit.setBehavior('onResourceSpotted', this.enemyResourceBehavior);
      unit.setBehavior('onEnemySpotted', this.enemyAttackBehavior);
    } else {
      // Apply player-defined behaviors if available
      if (this.playerCode.onIdle) {
        unit.setBehavior('onIdle', this.playerCode.onIdle);
      }
      if (this.playerCode.onResourceSpotted) {
        unit.setBehavior('onResourceSpotted', this.playerCode.onResourceSpotted);
      }
      if (this.playerCode.onEnemySpotted) {
        unit.setBehavior('onEnemySpotted', this.playerCode.onEnemySpotted);
      }
      if (this.playerCode.onDamaged) {
        unit.setBehavior('onDamaged', this.playerCode.onDamaged);
      }
    }
    
    this.units.set(id, unit);
    return unit;
  }
  
  /**
   * Update all game entities
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    // Keep track of units to remove
    const deadUnits = [];
    const depleteResources = [];
    
    // Update all units
    for (const [id, unit] of this.units.entries()) {
      unit.update(deltaTime);
      
      // Check for resource detection
      this.checkResourceDetection(unit);
      
      // Check for enemy detection
      this.checkEnemyDetection(unit);
      
      // Mark dead units for removal
      if (unit.health <= 0) {
        deadUnits.push(id);
        if (window.gameLogger) {
          window.gameLogger.log(`${id} has been destroyed!`, null, 'system');
        }
        continue;
      }
    }
    
    // Update all resources
    for (const [id, resource] of this.resources.entries()) {
      resource.update(deltaTime);
      
      // Mark fully depleted resources for removal
      if (resource.depleted && resource.quantity <= 0) {
        depleteResources.push(id);
      }
    }
    
    // Remove dead units
    for (const id of deadUnits) {
      // Get proper access to unitView for sprite removal
      const unit = this.units.get(id);
      if (unit && unit.stateLabel) {
        unit.stateLabel.destroy();
        unit.stateLabel = null;
      }
      this.units.delete(id);
    }
    
    // Remove depleted resources
    for (const id of depleteResources) {
      this.resources.delete(id);
    }
    
    // Spawn new resources occasionally
    if (Math.random() < 0.003 && this.resources.size < 100) {
      const resourceType = Math.random() < 0.5 ? 'energy' : 'matter';
      this.createRandomResources(1, resourceType);
      if (window.gameLogger) {
        window.gameLogger.log(`New ${resourceType} resource has appeared`, null, 'system');
      }
    }
  }
  
  /**
   * Check if unit can detect any resources
   * @param {BaseUnit} unit - The unit to check
   */
  checkResourceDetection(unit) {
    for (const [id, resource] of this.resources.entries()) {
      const dx = unit.x - resource.x;
      const dy = unit.y - resource.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= unit.visionRange) {
        // Resource is within vision range, trigger detection event
        unit.behaviors.onResourceSpotted(
          resource.type, 
          { x: resource.x, y: resource.y, id }
        );
        // Only detect one resource at a time to keep it simple
        break;
      }
    }
  }
  
  /**
   * Check if unit can detect any enemies
   * @param {BaseUnit} unit - The unit to check
   */
  checkEnemyDetection(unit) {
    const isPlayerUnit = unit.id.startsWith('player');
    
    for (const [id, otherUnit] of this.units.entries()) {
      // Skip self and units of same faction
      if (
        unit.id === otherUnit.id || 
        (isPlayerUnit && id.startsWith('player')) ||
        (!isPlayerUnit && id.startsWith('enemy'))
      ) {
        continue;
      }
      
      const dx = unit.x - otherUnit.x;
      const dy = unit.y - otherUnit.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= unit.visionRange) {
        // Enemy is within vision range, trigger detection event
        unit.behaviors.onEnemySpotted(
          'enemy', 
          { x: otherUnit.x, y: otherUnit.y, id }
        );
        // Only detect one enemy at a time to keep it simple
        break;
      }
    }
  }
  
  /**
   * Set player's code for unit behaviors
   * @param {string} behaviorType - The behavior type to set
   * @param {Function} code - The behavior function
   */
  setPlayerCode(behaviorType, code) {
    if (this.playerCode.hasOwnProperty(behaviorType)) {
      try {
        // Validate code is a function
        if (typeof code === 'function') {
          this.playerCode[behaviorType] = code;
          
          // Update all existing player units with new behavior
          for (const [id, unit] of this.units.entries()) {
            if (id.startsWith('player')) {
              unit.setBehavior(behaviorType, code);
            }
          }
          
          return true;
        } else {
          console.error('Provided code is not a function');
          return false;
        }
      } catch (error) {
        console.error(`Error setting player code for ${behaviorType}:`, error);
        return false;
      }
    }
    return false;
  }
  
  // Default enemy AI behaviors
  enemyIdleBehavior = function() {
    // Random patrol between base and resources
    if (Math.random() < 0.3) {
      // Move toward a resource
      const resources = Array.from(this.parent.resources.values());
      if (resources.length > 0) {
        const randomResource = resources[Math.floor(Math.random() * resources.length)];
        this.moveTo(randomResource.x, randomResource.y);
      }
    } else if (Math.random() < 0.5) {
      // Return to base
      this.moveTo(this.parent.enemyBase.x, this.parent.enemyBase.y);
    } else {
      // Random movement
      const randomX = this.x + (Math.random() * 100 - 50);
      const randomY = this.y + (Math.random() * 100 - 50);
      this.moveTo(randomX, randomY);
    }
  }
  
  enemyResourceBehavior = function(type, position) {
    // Simple gather behavior
    if (!this.inventory.isFull()) {
      this.moveTo(position.x, position.y);
    } else {
      // Return to base if inventory full
      this.moveTo(this.parent.enemyBase.x, this.parent.enemyBase.y);
    }
  }
  
  enemyAttackBehavior = function(type, position) {
    // Attack if health is good, retreat if not
    if (this.health > this.maxHealth * 0.5) {
      this.moveTo(position.x, position.y);
    } else {
      // Retreat to base
      const dx = this.x - position.x;
      const dy = this.y - position.y;
      this.moveTo(this.x + dx, this.y + dy);
    }
  }
}