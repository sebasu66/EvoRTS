import WorkerModel from '../modelos/worker_model.js';
import WorkerView from '../vistas/worker_view.js';

export default class WorkerController {
    constructor( terrain) {
      this.workerModel = new WorkerModel(100, 100);
      this.workerView = new WorkerView('gameCanvas');
      this.terrain = terrain; // Matriz 2D que representa el terreno
      this.contUpdate = 0;
    }
  
    moveWorker(dx, dy) {
      this.workerModel.move(dx, dy);
      this.workerView.render(this.workerModel);
    }
  
    checkForResource() {
      const x = this.workerModel.x;
      const y = this.workerModel.y;
      if (this.terrain[y][x] === 'R') { // Supongamos que 'R' en la matriz del terreno representa un recurso
        this.workerModel.collectResource(1);
        this.terrain[y][x] = '0'; // Supongamos que '0' en la matriz del terreno representa un espacio vacío
      }
    }
  
    init() {
      this.workerView.render(this.workerModel);
    }
    // Asegura que el worker solo se mueva a las celdas con valor 0
  isValidMove(dx, dy) {
    const newX = this.workerModel.x + dx;
    const newY = this.workerModel.y + dy;

    return this.terrain[newY] && this.terrain[newY][newX] === 0;
  }

  moveWorkerRandomly() {
    // Supongamos que el worker puede moverse arriba, abajo, izquierda o derecha
    const moves = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    const randomMove = moves[Math.floor(Math.random() * moves.length)];

    if (this.isValidMove(randomMove.dx, randomMove.dy)) {
      this.workerModel.move(randomMove.dx, randomMove.dy);
    }
  }

    update() {
        this.contUpdate++;
        if(this.contUpdate % 10 == 0){
            this.moveWorkerRandomly(); // Mueve al worker aleatoriamente
            this.contUpdate = 0;
        }
        this.workerView.render(this.workerModel); // Dibuja el nuevo estado del worker
    }
  }