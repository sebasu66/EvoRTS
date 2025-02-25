/**
 * Tick system for EvoRTS
 * Manages the update frequency for entity logic
 */
export default class TickSystem {
  constructor() {
    // Configuration
    this.tickRate = 10; // Number of ticks per second
    this.tickInterval = 1000 / this.tickRate; // Milliseconds between ticks
    this.lastTickTime = 0;
    this.accumulatedTime = 0;
    this.tickCount = 0;
    this.elapsedGameTime = 0;
    
    // Registered entities to update
    this.entities = new Map();
    this.timeScale = 1.0;
    this.paused = false;
    
    // Performance metrics
    this.averageTickTime = 0;
    this.tickTimeHistory = [];
    this.maxHistoryLength = 60; // Keep last 60 tick times
  }
  
  /**
   * Set the tick rate (updates per second)
   * @param {number} ticksPerSecond - Number of ticks per second
   */
  setTickRate(ticksPerSecond) {
    if (ticksPerSecond < 1) ticksPerSecond = 1;
    if (ticksPerSecond > 60) ticksPerSecond = 60;
    
    this.tickRate = ticksPerSecond;
    this.tickInterval = 1000 / this.tickRate;
    
    console.log(`Tick rate set to ${this.tickRate} ticks per second (${this.tickInterval.toFixed(2)}ms per tick)`);
  }
  
  /**
   * Set the time scale for the simulation
   * @param {number} scale - Time scale (1.0 = normal speed)
   */
  setTimeScale(scale) {
    this.timeScale = Math.max(0.1, Math.min(10, scale));
    console.log(`Time scale set to ${this.timeScale}x`);
  }
  
  /**
   * Pause or resume the simulation
   * @param {boolean} isPaused - Whether the simulation should be paused
   */
  setPaused(isPaused) {
    this.paused = isPaused;
    console.log(`Simulation ${this.paused ? 'paused' : 'resumed'}`);
  }
  
  /**
   * Register an entity to be updated on ticks
   * @param {string} id - Unique identifier for the entity
   * @param {object} entity - Entity with an update method
   */
  registerEntity(id, entity) {
    if (typeof entity.update !== 'function') {
      console.error(`Entity ${id} does not have an update method`);
      return false;
    }
    
    this.entities.set(id, entity);
    return true;
  }
  
  /**
   * Unregister an entity from the tick system
   * @param {string} id - Entity identifier to remove
   */
  unregisterEntity(id) {
    return this.entities.delete(id);
  }
  
  /**
   * Update loop - called by the game's main update function
   * @param {number} currentTime - Current timestamp
   */
  update(currentTime) {
    if (this.lastTickTime === 0) {
      this.lastTickTime = currentTime;
      return;
    }
    
    // Calculate actual delta time
    const realDeltaTime = currentTime - this.lastTickTime;
    this.lastTickTime = currentTime;
    
    // If paused, don't accumulate time
    if (this.paused) return;
    
    // Accumulate time with time scaling
    this.accumulatedTime += realDeltaTime * this.timeScale;
    this.elapsedGameTime += realDeltaTime * this.timeScale;
    
    // Process as many ticks as needed based on accumulated time
    let ticksProcessed = 0;
    
    while (this.accumulatedTime >= this.tickInterval) {
      const tickStart = performance.now();
      
      // Update all registered entities
      for (const [id, entity] of this.entities.entries()) {
        try {
          entity.update(this.tickInterval);
        } catch (error) {
          console.error(`Error updating entity ${id}:`, error);
        }
      }
      
      // Update tick metrics
      this.accumulatedTime -= this.tickInterval;
      this.tickCount++;
      ticksProcessed++;
      
      // Measure tick performance
      const tickDuration = performance.now() - tickStart;
      this.recordTickTime(tickDuration);
      
      // Safety check - if we're falling behind, skip ticks
      if (ticksProcessed > 5) {
        console.warn(`Tick system falling behind - skipping ticks. Accumulated time: ${this.accumulatedTime.toFixed(2)}ms`);
        this.accumulatedTime = 0;
        break;
      }
    }
    
    return ticksProcessed;
  }
  
  /**
   * Record tick execution time for performance monitoring
   * @param {number} tickTime - Time taken to execute the tick
   */
  recordTickTime(tickTime) {
    this.tickTimeHistory.push(tickTime);
    
    // Trim history to max length
    if (this.tickTimeHistory.length > this.maxHistoryLength) {
      this.tickTimeHistory.shift();
    }
    
    // Calculate average
    const total = this.tickTimeHistory.reduce((sum, time) => sum + time, 0);
    this.averageTickTime = total / this.tickTimeHistory.length;
    
    // Log warning if tick time exceeds interval
    if (tickTime > this.tickInterval * 0.8) {
      console.warn(`Tick took ${tickTime.toFixed(2)}ms, which is ${Math.floor(tickTime/this.tickInterval*100)}% of available time`);
    }
  }
  
  /**
   * Get performance metrics
   * @returns {object} - Performance statistics
   */
  getPerformanceMetrics() {
    return {
      tickRate: this.tickRate,
      averageTickTime: this.averageTickTime,
      tickCount: this.tickCount,
      entitiesCount: this.entities.size,
      timeScale: this.timeScale,
      elapsedGameTime: this.elapsedGameTime
    };
  }
}