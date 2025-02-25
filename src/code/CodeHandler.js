export default class CodeHandler {
  constructor() {
    this.behaviors = new Map();
    this.defaultBehaviors = this.createDefaultBehaviors();
  }

  createDefaultBehaviors() {
    return {
      idle: (entity) => {
        // Default idle behavior
        const randomMove = Math.random() > 0.5;
        if (randomMove) {
          const x = entity.x + (Math.random() * 100 - 50);
          const y = entity.y + (Math.random() * 100 - 50);
          entity.moveTo(x, y);
        }
      },

      gather: (entity, resource) => {
        if (!resource) return;

        if (entity.isNextTo(resource)) {
          entity.gather(resource);
        } else {
          entity.moveTo(resource.x, resource.y);
        }
      },

      combat: (entity, target) => {
        if (!target) return;

        if (entity.health < entity.maxHealth * 0.3) {
          entity.flee(target);
        } else if (entity.canAttack(target)) {
          entity.attack(target);
        } else {
          entity.moveTo(target.x, target.y);
        }
      },
    };
  }

  compileBehavior(code, behaviorName) {
    try {
      // Create function from code string
      const behaviorFunction = new Function("entity", "context", code);
      this.behaviors.set(behaviorName, behaviorFunction);
      console.log(`Compiled behavior: ${behaviorName}`);
      return true;
    } catch (error) {
      console.error(`Failed to compile behavior ${behaviorName}:`, error);
      return false;
    }
  }

  executeBehavior(entity, behaviorName, context = {}) {
    const behavior =
      this.behaviors.get(behaviorName) || this.defaultBehaviors[behaviorName];

    if (!behavior) {
      console.warn(`No behavior found: ${behaviorName}`);
      return;
    }

    try {
      behavior(entity, context);
    } catch (error) {
      console.error(`Error executing behavior ${behaviorName}:`, error);
      // Fallback to default behavior
      if (this.defaultBehaviors[behaviorName]) {
        this.defaultBehaviors[behaviorName](entity, context);
      }
    }
  }

  resetBehavior(behaviorName) {
    if (this.defaultBehaviors[behaviorName]) {
      this.behaviors.set(behaviorName, this.defaultBehaviors[behaviorName]);
      return true;
    }
    return false;
  }

  resetAllBehaviors() {
    this.behaviors.clear();
    Object.entries(this.defaultBehaviors).forEach(([name, behavior]) => {
      this.behaviors.set(name, behavior);
    });
  }
}
