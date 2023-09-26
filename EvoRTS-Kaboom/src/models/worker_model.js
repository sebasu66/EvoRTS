export default class WorkerModel {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.resourcesCollected = 0;
    }
  
    move(dx, dy) {
      this.x += dx;
      this.y += dy;
    }
  
    collectResource(amount) {
      this.resourcesCollected += amount;
    }
  }