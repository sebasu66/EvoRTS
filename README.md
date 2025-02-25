# EvoRTS - Code-Driven RTS Game

EvoRTS is a real-time strategy game where players program unit behaviors instead of directly controlling them. Success depends on creating efficient algorithms rather than clicks-per-minute.

## MVP Features

- **Code-Based Unit Control**: Define unit behaviors using JavaScript
- **Event-Driven Programming**: React to events like resource discovery or enemy detection
- **Resource Management**: Gather energy and matter to build units
- **Simple Combat System**: Units can attack enemies based on programmed conditions
- **In-Game Code Editor**: Modify unit behaviors in real-time

## Getting Started

1. Clone this repository
2. Create the required asset files (see below)
3. Open `index.html` in a web browser

## Required Assets

Create these files in the `/assets` directory:
- `worker.png` - A small unit sprite (blue)
- `energy.png` - Blue/cyan resource icon
- `matter.png` - Orange/yellow resource icon
- `base.png` - Base building icon

## Programming Units

Units can be programmed with behaviors for four events:
- `onIdle()` - What to do when no other tasks are active
- `onResourceSpotted(resourceType, position)` - How to respond to resources
- `onEnemySpotted(enemyType, position)` - How to respond to enemies
- `onDamaged(amount, attacker)` - What to do when taking damage

## API Methods

Units have access to these methods:
- `moveTo(x, y)` - Move to coordinates
- `gather(resourceNode)` - Gather from a resource
- `attack(target)` - Attack a target
- `returnToBase()` - Return to base

## Future Development

- Multiple unit types
- Base building and technology trees
- Unit evolution based on experience
- Multiplayer capabilities
- Advanced AI opponents