import WorkerModel from '../modelos/worker_model.js';
import EntityController from './entity_controller.js';
import WorkerView from '../vistas/worker_view.js';

/**
 * Worker controller for EvoRTS
 * Manages worker units with specialized behaviors for resource gathering
 */
export default class WorkerController extends EntityController {
  constructor(id, x, y, world, base) {
    // Create worker model
    const workerModel = new WorkerModel(id, x, y);
    
    // Initialize parent class
    super(workerModel);
    
    // Set controller-specific properties
    this.workerView = new WorkerView('gameCanvas');
    this.setWorld(world);
    this.setBase(base);
    
    // Track worker-specific state
    this.resourcesGathered = 0;
    this.buildingsConstructed = 0;
    this.repairsPerformed = 0;
    
    // Configure default behaviors - workers should start with basic behaviors
    // But still need to be programmable
    this.entity.behaviors = {
      onIdle: () => ({ action: 'explore' }),
      onResourceSpotted: (resourceType, position) => ({ action: 'gather', target: position }),
      onEnemySpotted: null,
      onDamaged: null,
      onNewObjectPerceived: null
    };
    
    // Initialize event listeners for worker-specific behaviors
    this.initEventListeners();
  }
  
  // Initialize worker-specific event listeners
  initEventListeners() {
    // When resources are spotted
    this.addEventListener('newObjectPerceived', (object) => {
      if (object.type === 'resource' && !this.entity.cargo.isFull()) {
        this.logActivity(`Worker ${this.entity.id} spotted a resource at (${Math.round(object.position.x)}, ${Math.round(object.position.y)})`);
      }
    });
    
    // When destination is reached
    this.addEventListener('destinationReached', (destination) => {
      // Handle reaching resource
      if (this.entity.currentState === 'gathering') {
        const resource = this.findNearbyResource();
        if (resource) {
          this.gatherResource(resource);
        }
      }
      
      // Handle reaching base
      if (this.entity.currentState === 'returning' && this.base) {
        if (this.entity.distanceTo(this.base) <= 20) {
          this.depositResources();
        }
      }
    });
    
    // When worker is injured
    this.addEventListener('gotInjured', (data) => {
      this.logActivity(`Worker ${this.entity.id} took ${data.damage} damage! Health: ${Math.round(data.newHealth)}`);
    });
    
    // When a new area is explored
    this.addEventListener('areaExplored', (area) => {
      this.logActivity(`Worker ${this.entity.id} explored new area at (${area.x}, ${area.y})`);
    });
  }
  
  // Log worker activity
  logActivity(message) {
    if (window.gameLogger) {
      window.gameLogger.log(message, this.entity.id, 'worker');
    } else {
      console.log(`[Worker ${this.entity.id}] ${message}`);
    }
  }
  
  // Find a resource near the worker
  findNearbyResource() {
    if (!this.world) return null;
    
    const resources = this.world.getObjectsInRadius(
      this.entity.x,
      this.entity.y,
      30, // Increased search radius for better detection
      'resource' // Filter by resource type
    );
    
    // Return closest resource
    if (resources.length > 0) {
      return resources.reduce((closest, current) => {
        const distToCurrent = this.entity.distanceTo(current);
        const distToClosest = this.entity.distanceTo(closest);
        return distToCurrent < distToClosest ? current : closest;
      }, resources[0]);
    }
    
    return null;
  }
  
  // Gather resource
  gatherResource(resource) {
    if (!resource || this.entity.cargo.isFull()) return false;
    
    // Check if we're close enough to gather using inReach
    if (this.inReach({ x: resource.x, y: resource.y })) {
      // Calculate gather amount based on worker's gathering speed
      const gatherAmount = Math.min(
        this.entity.gatheringSpeed,
        resource.quantity,
        this.entity.carryCapacity - this.entity.getCargoWeight()
      );
      
      if (gatherAmount <= 0) return false;
      
      // Gather the resource
      const collected = this.entity.collectResource(gatherAmount, resource.resourceType);
      
      // Update resource in world
      resource.quantity -= collected;
      
      // Track total gathered
      this.resourcesGathered += collected;
      
      // Log activity
      this.logActivity(`Gathered ${collected} ${resource.resourceType}`);
      
      // Check if inventory is full
      if (this.entity.cargo.isFull()) {
        // Return to base if full
        this.logActivity('Cargo full, returning to base');
        if (this.base) {
          this.entity.destination = { x: this.base.x, y: this.base.y };
          this.entity.isMoving = true;
          this.entity.setState('returning');
        }
      } else if (resource.quantity > 0) {
        // Continue gathering if resource still has quantity
        this.entity.setState('gathering');
      } else {
        // Resource is depleted
        this.logActivity('Resource depleted');
        this.entity.setState('idle');
      }
      
      return true;
    } else {
      // Not in reach, move closer
      this.entity.destination = { x: resource.x, y: resource.y };
      this.entity.isMoving = true;
      return false;
    }
  }
  
  // Deposit resources at base
  depositResources() {
    if (!this.base) return false;
    
    // Check if we're in reach of the base
    if (!this.inReach({ x: this.base.x, y: this.base.y })) {
      // Move closer to base
      this.entity.destination = { x: this.base.x, y: this.base.y };
      this.entity.isMoving = true;
      return false;
    }
    
    // Transfer resources to base
    const result = this.entity.transferResources(this.base);
    
    if (result.transferred) {
      this.logActivity(`Deposited ${result.energy} energy and ${result.matter} matter at base`);
      
      // Return to idle state
      this.entity.setState('idle');
      return true;
    }
    
    return false;
  }
  
  // Repair a structure
  repairStructure(structure, amount) {
    if (!structure) return 0;
    
    // Check if we're close enough to repair using inReach
    if (this.inReach({ x: structure.x, y: structure.y })) {
      const repairAmount = this.entity.repair(structure, amount);
      
      if (repairAmount > 0) {
        this.repairsPerformed += repairAmount;
        this.logActivity(`Repaired ${structure.id} for ${repairAmount} points`);
      }
      
      return repairAmount;
    } else {
      // Move closer to structure
      this.entity.destination = { x: structure.x, y: structure.y };
      this.entity.isMoving = true;
      return 0;
    }
  }
  
  // Update method - called once per game tick
  update(deltaTime = 16.66) {
    // Track time since last AI decision
    this._timeSinceLastDecision = (this._timeSinceLastDecision || 0) + deltaTime;
    this._timeSinceLastAnalysis = (this._timeSinceLastAnalysis || 0) + deltaTime;
    
    // Execute AI logic at a reduced frequency (every 200ms)
    // This prevents excessive CPU usage from constant AI calculations
    const decisionInterval = 200; // milliseconds between AI decisions
    const analysisInterval = 500; // milliseconds between object analysis
    
    // Call parent update for movement and basic actions every tick
    super.update(deltaTime);
    
    // AI decisions happen less frequently
    if (this._timeSinceLastDecision >= decisionInterval) {
      this._timeSinceLastDecision = 0;
      
      // Execute AI-specific logic
      this.executeAiDecision();
    }
    
    // Object analysis happens even less frequently
    if (this._timeSinceLastAnalysis >= analysisInterval) {
      this._timeSinceLastAnalysis = 0;
      
      // Analyze nearby objects
      this.analyzeNearbyObjects();
    }
    
    // Render is still done every frame
    this.workerView.render(this.entity);
  }
  
  // Execute AI decision logic at a reduced frequency
  executeAiDecision() {
    // Execute different logic based on current state
    switch (this.entity.currentState) {
      case 'idle':
        // If idle and no task, trigger idle behavior
        if (!this.entity.currentTask && this.entity.behaviors.onIdle) {
          const behavior = this.entity.behaviors.onIdle();
          this.processBehaviorResult(behavior);
        } else if (!this.entity.currentTask) {
          // No behavior defined for idle but we need to do something
          // Default to exploration to discover the world
          this.processBehaviorResult({ action: 'explore' });
        }
        break;
        
      case 'gathering':
        // Check if we're done gathering
        if (this.entity.cargo.isFull()) {
          // If full, head back to base
          if (this.base) {
            this.entity.destination = { x: this.base.x, y: this.base.y };
            this.entity.isMoving = true;
            this.entity.setState('returning');
          }
        }
        break;
        
      case 'returning':
        // Check if we've reached the base
        if (this.base && this.inReach(this.base)) {
          this.depositResources();
        }
        break;
        
      case 'analyzing':
        // Continue analyzing current object
        if (this.entity.currentTask && this.entity.currentTask.objectId) {
          this.analyzeObject(this.entity.currentTask.objectId);
        } else {
          // If no current object to analyze, go back to idle
          this.entity.setState('idle');
        }
        break;
        
      case 'exploring':
        // When exploration point reached, set to idle to trigger next action
        if (!this.entity.isMoving) {
          this.entity.setState('idle');
        }
        break;
    }
  }
  
  // Analyze nearby objects
  analyzeNearbyObjects() {
    if (!this.world) return;
    
    // Find the closest unanalyzed object
    const unanalyzedObjects = this.entity.memory.perceptionMap.filter(
      obj => !obj.analized && obj.analizedPercentage < 100
    );
    
    // Sort by distance
    unanalyzedObjects.sort((a, b) => {
      const distA = this.entity.distanceTo(a.position);
      const distB = this.entity.distanceTo(b.position);
      return distA - distB;
    });
    
    // Find the closest object within analysis range
    const closestObject = unanalyzedObjects.find(
      obj => this.entity.distanceTo(obj.position) <= 20
    );
    
    // If there's a close unanalyzed object, analyze it
    if (closestObject) {
      this.analyzeObject(closestObject.id);
      
      // If we're idle, set analyzing state
      if (this.entity.currentState === 'idle') {
        this.entity.setState('analyzing');
        this.entity.currentTask = { 
          type: 'analyze', 
          objectId: closestObject.id 
        };
      }
    }
  }
  
  // Initializes the worker with a discovery starting point (usually base)
  init() {
    // Begin with a single explored area around the starting point
    if (this.fogOfWar) {
      this.updateFogOfWar();
    }
    
    // If worker has no behaviors set, default to exploration
    if (!this.entity.behaviors.onIdle) {
      // Set default to explore when idle
      this.executeAiDecision();
    }
  }
  
  // Set programmable worker behaviors
  setWorkerBehavior(type, code) {
    try {
      // Create behavior function from code string
      const behaviorFn = new Function(...this.getBehaviorParams(type), code);
      
      // Set behavior in entity
      return this.setBehavior(type, behaviorFn);
    } catch (error) {
      console.error(`Error in worker behavior ${type}:`, error);
      return false;
    }
  }
  
  // Get parameters for each behavior type
  getBehaviorParams(type) {
    switch (type) {
      case 'onIdle':
        return [];
      case 'onResourceSpotted':
        return ['resourceType', 'position'];
      case 'onEnemySpotted':
        return ['enemyType', 'position'];
      case 'onDamaged':
        return ['amount', 'attacker'];
      case 'onNewObjectPerceived':
        return ['object'];
      default:
        return [];
    }
  }
}