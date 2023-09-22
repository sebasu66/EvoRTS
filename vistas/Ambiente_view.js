
class AmbienteView {
    constructor(canvasContext, tileTamaño = 10) {
        this.canvasContext = canvasContext;
        this.tileTamaño = tileTamaño;
    }
    
    renderizarSuelo(terreno) {
        for (let i = 0; i < terreno.length; i++) {
            for (let j = 0; j < terreno[i].length; j++) {
                switch (terreno[i][j]) {
                    case 0:
                        this.canvasContext.fillStyle = 'white';
                        break;
                    case 1:
                        this.canvasContext.fillStyle = 'black';
                        break;
                    case 'arboles':
                        this.canvasContext.fillStyle = 'green';
                        break;
                    case 'arena':
                        this.canvasContext.fillStyle = 'yellow';
                        break;
                    default:
                        this.canvasContext.fillStyle = 'lightgreen';  // Hierba
                }
                this.canvasContext.fillRect(i * this.tileTamaño, j * this.tileTamaño, this.tileTamaño, this.tileTamaño);
            }
        }
    }
    
    // Futuras funciones para renderizar recursos y seres vivos
    // renderizarRecursos()
    // renderizarSeresVivos()

}
            