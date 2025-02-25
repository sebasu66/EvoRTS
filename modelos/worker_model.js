import EntityModel from "./entity_model.js";

/**
 * Worker unit class for EvoRTS
 * Worker units are specialized in resource gathering and basic building
 */
export default class WorkerModel extends EntityModel {
  constructor(id, x, y) {
    super(id, x, y);
    
    // Worker-specific properties
    this.type = 'worker';
    this.gatheringSpeed = 5;
    this.buildingSkill = 1;
    this.resourcesCollected = 0;
    this.repairSkill = 1;
    this.miningEfficiency = 1.0; // Multiplier for resource gathering
    
    // Override base stats to worker defaults
    this.speed = 3;
    this.carryCapacity = 30;
    this.attackPower = 5;
    this.defense = 3;
    
    // Initialize worker behaviors with defaults
    this.behaviors = {
      onIdle: this.defaultIdle.bind(this),
      onResourceSpotted: this.defaultResourceBehavior.bind(this),
      onEnemySpotted: this.defaultEnemyBehavior.bind(this),
      onDamaged: this.defaultDamagedBehavior.bind(this),
      onNewObjectPerceived: this.defaultObjectPerceivedBehavior.bind(this)
    };
  }
  
  // Default behaviors (can be overridden by player code)
  defaultIdle() {
    // Worker explores the map looking for resources
    this.setState('explore');
    return { action: 'explore' };
  }
  
  defaultResourceBehavior(resourceType, position) {
    if (!this.cargo.isFull()) {
      this.setState('gathering');
      return { action: 'gather', target: position };
    } else {
      this.setState('returning');
      return { action: 'returnToBase' };
    }
  }
  
  defaultEnemyBehavior(enemyType, position) {
    // Workers are not combat units, so they run away from enemies
    const dx = this.x - position.x;
    const dy = this.y - position.y;
    const escapeX = this.x + dx;
    const escapeY = this.y + dy;
    
    this.setState('fleeing');
    return { action: 'flee', target: { x: escapeX, y: escapeY } };
  }
  
  defaultDamagedBehavior(amount, attacker) {
    // If critically damaged, flee immediately
    if (this.isCritical()) {
      this.setState('fleeing');
      
      // Flee in the opposite direction of attacker
      if (attacker) {
        const dx = this.x - attacker.x;
        const dy = this.y - attacker.y;
        const escapeX = this.x + dx;
        const escapeY = this.y + dy;
        
        return { action: 'flee', target: { x: escapeX, y: escapeY } };
      } 
      
      // If attacker unknown, just head toward base
      return { action: 'returnToBase' };
    } 
    
    // If moderately damaged but attacker is weak, stay at range and attack
    if (attacker && attacker.health < this.health * 0.5) {
      const distance = Math.sqrt(
        Math.pow(this.x - attacker.x, 2) + 
        Math.pow(this.y - attacker.y, 2)
      );
      
      // Stay at maximum attack range
      if (distance < 15) {
        const dx = this.x - attacker.x;
        const dy = this.y - attacker.y;
        const escapeX = this.x + dx * 0.5;
        const escapeY = this.y + dy * 0.5;
        
        return { action: 'moveAndAttack', target: { x: escapeX, y: escapeY }, attackTarget: attacker };
      } else {
        return { action: 'attack', target: attacker };
      }
    }
    
    // Default: flee from attacker
    return this.defaultEnemyBehavior(attacker?.type, { x: attacker?.x, y: attacker?.y });
  }
  
  defaultObjectPerceivedBehavior(object) {
    // If object not analyzed, go closer to analyze it
    if (!object.analized) {
      if (this.distanceTo(object) > 20) {
        return { action: 'approach', target: object };
      } else {
        return { action: 'analyze', target: object };
      }
    }
    
    // If it's a resource and we need resources
    if (object.type === 'resource' && !this.cargo.isFull()) {
      return this.defaultResourceBehavior(object.resourceType, { x: object.x, y: object.y });
    }
    
    // If it's an enemy
    if (object.type === 'enemy') {
      return this.defaultEnemyBehavior(object.enemyType, { x: object.x, y: object.y });
    }
    
    // Default: just continue what we were doing
    return { action: 'continue' };
  }
  
  // Helper methods
  distanceTo(target) {
    if (!target || target.x === undefined || target.y === undefined) {
      return Infinity;
    }
    
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // Worker-specific methods
  collectResource(amount, resourceType) {
    // Apply mining efficiency bonus
    const actualAmount = Math.floor(amount * this.miningEfficiency);
    
    if (resourceType === 'energy') {
      this.cargo.energy += actualAmount;
    } else if (resourceType === 'matter') {
      this.cargo.matter += actualAmount;
    }
    
    this.resourcesCollected += actualAmount;
    this.cargoWeight = this.getCargoWeight();
    
    // Grant XP for resource collection
    this.gainXP(actualAmount * 0.5);
    
    return actualAmount;
  }
  
  transferResources(target) {
    if (!target) return { transferred: false };
    
    const energyTransferred = this.cargo.energy;
    const matterTransferred = this.cargo.matter;
    
    // Transfer resources to target
    if (target.receiveResources) {
      target.receiveResources(energyTransferred, matterTransferred);
    }
    
    // Clear worker's inventory
    this.cargo.energy = 0;
    this.cargo.matter = 0;
    this.cargoWeight = this.getCargoWeight();
    
    return { 
      transferred: true,
      energy: energyTransferred,
      matter: matterTransferred
    };
  }
  
  repair(target, amount) {
    if (!target) return 0;
    
    // Calculate repair amount based on skill
    const repairAmount = Math.floor(amount * this.repairSkill);
    
    // Repairing costs matter
    if (this.cargo.matter >= repairAmount) {
      this.cargo.matter -= repairAmount;
      this.cargoWeight = this.getCargoWeight();
      
      // Apply repair to target
      if (target.receiveRepair) {
        target.receiveRepair(repairAmount);
      }
      
      // Grant XP for repair work
      this.gainXP(repairAmount);
      
      return repairAmount;
    }
    
    return 0;
  }
}