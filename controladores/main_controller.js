import WorkerController from './worker_controller.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Crear el modelo del mundo
const mundo = new Ambiente(250, 250);  // 50x50 tiles

// Crear la vista del mundo y renderizar
const mundoView = new AmbienteView(ctx,10);
const workerController = new WorkerController(mundo.terreno);

// Iniciar el worker en su posición inicial
workerController.init();
function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
function gameLoop() {
    clear();
    mundoView.renderizarSuelo(mundo.terreno);
    workerController.update();
    requestAnimationFrame(gameLoop);
}
gameLoop();