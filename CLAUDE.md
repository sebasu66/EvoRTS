# EvoRTS Project Guidelines

## Build Commands
- Open `index.html` directly in a browser or use a local server
- Test: Currently no automated tests

## Code Style Guidelines
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Imports**: Group imports by type (models, views, controllers)
- **Structure**: Use MVC pattern (model/view/controller folders)
- **Function Naming**: 
  - init() for initialization
  - update() for game loop functions
  - render() for drawing functions
- **Formatting**: 2-space indentation
- **Comments**: Add comments for major sections/components
- **Game Structure**:
  - Use controller objects to handle game entity logic
  - Models define entity data
  - Views handle rendering
- **Module Pattern**: ES modules with named exports
- **Error Handling**: Add try/catch blocks for user interactions and critical operations
- **Behavior Functions**:
  - Always use function expressions with proper binding
  - Ensure units have access to their parent controller via `this.parent`
  - Unit behaviors should be properly bound functions to maintain context

## Common Errors and Solutions
- **"this.moveTo is not a function"**: Check proper binding in behavior functions
- **"Cannot read properties of undefined"**: Ensure parent references are set

Project implements a code-driven RTS game where players define unit behaviors through programming.