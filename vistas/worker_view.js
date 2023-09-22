export default class WorkerView {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
    }

    render(workerModel) {
      this.ctx.fillStyle = 'blue';
      this.ctx.fillRect(workerModel.x * 10, workerModel.y * 10, 10, 10);
    }
  }