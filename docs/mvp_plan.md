# EvoRTS MVP Plan

## Core Functionality

### 1. Game Engine (Phaser)
- Single-player mode only
- Fixed map size (800x600)
- Basic collision detection
- Simple camera controls

### 2. Environment
- Procedurally generated terrain (existing cellular automata)
- Two resource types: Energy and Matter
- Resource nodes visible on map
- Day/night cycle (affects unit vision)

### 3. Base Unit System
- Single unit type: "Worker"
- Basic attributes: health, speed, carrying capacity
- Simple pathfinding
- Resource gathering capability
- Basic combat stats (attack, defense)

### 4. Code Interface
- JavaScript code editor panel (using CodeMirror)
- Pre-defined functions that players can modify:
  - `onIdle()`
  - `onResourceSpotted(resourceType, position)`
  - `onEnemySpotted(enemyType, position)`
  - `onDamaged(amount, attacker)`
- Simple API for unit control:
  - `unit.moveTo(x, y)`
  - `unit.gather(resourceNode)`
  - `unit.attack(target)`
  - `unit.returnToBase()`

### 5. Simple AI Opponent
- Pre-programmed behavior patterns
- Gradually increases difficulty
- Focuses on resource gathering and basic attacks

### 6. User Interface
- Split screen: game view and code editor
- Resource counters
- Simple unit selection
- Play/pause button to run simulation
- Reset button to restart with new code

## Implementation Plan

### Phase 1: Basic Engine Setup
- Set up Phaser project structure
- Implement environment generation
- Create basic unit rendering
- Set up game loop and physics

### Phase 2: Unit Behaviors
- Implement worker unit model
- Add basic movement and pathfinding
- Create resource gathering mechanics
- Add simple combat system

### Phase 3: Code Interface
- Integrate code editor
- Implement JavaScript interpreter for user code
- Create simple API for unit control
- Add event triggers for unit behaviors

### Phase 4: Game Loop and Testing
- Implement win/loss conditions
- Add basic AI opponent
- Create tutorial scenario
- Test and balance gameplay

## Technical Requirements

- Phaser 3 for game engine
- CodeMirror for code editing interface
- Basic HTML/CSS for UI layout
- JavaScript sandbox for secure code execution

## Future Expansion (Post-MVP)

- Multiple unit types
- Blueprint system for base building
- Technology research tree
- Unit evolution based on experience
- Multiplayer capabilities
- Visual programming interface alongside code