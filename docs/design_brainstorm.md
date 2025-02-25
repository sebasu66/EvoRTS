# EvoRTS Design Brainstorm

## Market Research: RTS Game Analysis

### Highly Rated Features
- **Automation Systems** (Factorio)
- **Strategic Depth** without micromanagement burnout
- **Emergent Gameplay** where simple rules create complex scenarios
- **Meaningful Tech Trees** with distinct gameplay changes
- **Satisfying Resource Management** loops
- **Clear Visual Feedback** on unit states and actions
- **Performance** handling many units simultaneously
- **Balanced Asymmetry** between factions/races

### Common Complaints
- **Excessive Micromanagement** leading to APM-focused gameplay
- **Shallow Strategy** masked by action requirements
- **Poor Pathfinding** frustrating unit control
- **"Solved" Meta** strategies dominating competitive play
- **Steep Learning Curves** without proper tutorialization
- **Performance Issues** with large armies
- **Lack of Strategic Comeback Mechanics**

## Core Concept: Developer-Focused RTS

EvoRTS will be a programming-based RTS where players define unit behaviors through code rather than direct control. Success comes from creating efficient algorithms and systems rather than clicks-per-minute.

### Key Principles

#### Physics-Based Trade-offs
- More armor = more weight = slower movement
- More power = more energy consumption
- Longer range = less accuracy
- Higher damage = longer cooldown

#### Unit Definition System
- Players define unit templates with points-based attribute system
- Attributes include: health, armor, speed, sensing range, attack power
- Special abilities have energy/resource costs
- Units can be specialized or generalist

#### Behavior Programming Interface
- Python/JavaScript API for defining unit behaviors
- Event-driven system (on_enemy_spotted, on_resource_found, on_damage_taken)
- State machine framework for complex decision trees
- Prioritization algorithms for multi-objective scenarios

#### Progression Systems
- Units gain experience and can evolve based on their actions
- Technology research unlocks new capabilities and behavior options
- Blueprint system for base layouts and defensive formations

## Gameplay Loop

1. **Design Phase**
   - Create unit templates
   - Program behaviors
   - Define resource allocation priorities
   - Create blueprints for base expansion

2. **Execution Phase**
   - Watch your algorithms compete
   - Gather analytics on performance
   - Identity bottlenecks and optimization opportunities

3. **Refinement Phase**
   - Update code based on observations
   - Evolve unit designs based on performance data
   - Adjust resource allocation strategies

## Inspired Features

### From Factorio
- Resource extraction, processing and optimization
- Chained commands and automation systems
- Blueprint system for replicating successful patterns
- Efficiency optimization as core gameplay

### From Spore
- Evolutionary progression of units
- Specialization vs. generalization trade-offs
- Ability customization (stealth, perception, carrying capacity)
- Environmental adaptation mechanics

### Original Concepts
- Code as primary interaction method
- Sensor-based perception system (visual, acoustic, chemical)
- Communication networks between units
- Emergent group behaviors from individual programming

## Example Behavior Code

```javascript
// Example unit behavior definition
function onEnemyDetected(direction, distance, entity) {
  // Combat evaluation logic
  if (self.health > self.maxHealth / 2 && distance > 10) {
    // Engage if healthy and at range advantage
    self.weapons.primary.target(entity);
    self.movement.approach(entity, self.weapons.primary.optimalRange);
  } else {
    // Retreat and alert allies if outmatched
    self.movement.retreat(self.base.position);
    self.communications.broadcast({
      type: "THREAT_ALERT",
      position: entity.position,
      threatLevel: entity.estimateThreatLevel()
    });
  }
}

// Resource gathering behavior
function onResourceDetected(type, distance, node) {
  if (self.inventory.isFull()) {
    return; // Don't pursue if can't carry more
  }
  
  if (self.getCurrentTask().priority < PRIORITIES.RESOURCE_GATHERING) {
    // Only gather if not doing something more important
    self.setTask({
      type: "GATHER",
      target: node,
      priority: PRIORITIES.RESOURCE_GATHERING
    });
  }
}
```

## Technical Implementation Focus

1. **Extensible Entity System**
   - Component-based architecture for units
   - Pluggable behavior modules
   - Serializable designs for saving/sharing

2. **Efficient Simulation Engine**
   - Physics-based movement and interactions
   - Spatial partitioning for performance
   - Deterministic outcomes for fairness

3. **Coding Interface**
   - In-game code editor with syntax highlighting
   - Real-time debugging and visualization tools
   - Sandboxed execution environment for security

4. **Analytics Dashboard**
   - Performance metrics for units and systems
   - Resource flow visualization
   - Battle outcome analysis