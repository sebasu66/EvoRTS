import * as g from "../controladores/game_logic.js";

class AmbienteView {
  constructor(canvasContext, tileTamaño = 10) {
    this.canvasContext = canvasContext;
    this.tileTamaño = tileTamaño;
    console.log("=== AmbienteView Initialization ===");
    console.log(`Tile size: ${tileTamaño}`);
    console.log(`Canvas dimensions: ${g.CANVAS.width}x${g.CANVAS.height}`);
  }

  renderizarSuelo(ambiente) {
    console.log("=== Rendering Frame ===");
    console.log("Ambiente object:", ambiente);

    if (!ambiente || !ambiente.terreno) {
      console.error("Invalid ambiente or missing terreno array!");
      return;
    }

    const terreno = ambiente.terreno;
    console.log(`Terreno dimensions: ${terreno.length}x${terreno[0].length}`);
    console.log("First few cells:", terreno[0].slice(0, 5));

    // Clear canvas
    this.canvasContext.fillStyle = "#111";
    this.canvasContext.fillRect(0, 0, g.CANVAS.width, g.CANVAS.height);

    let wallCount = 0;
    // Render each cell
    for (let i = 0; i < terreno.length; i++) {
      for (let j = 0; j < terreno[0].length; j++) {
        const isWall = terreno[i][j] === 1;
        if (isWall) wallCount++;

        this.canvasContext.fillStyle = isWall ? "#000" : "#333";
        this.canvasContext.fillRect(
          i * this.tileTamaño + 1,
          j * this.tileTamaño + 1,
          this.tileTamaño - 1,
          this.tileTamaño - 1
        );
      }
    }

    // Draw debug info
    this.canvasContext.fillStyle = "#fff";
    this.canvasContext.font = "12px monospace";
    this.canvasContext.fillText(
      `Grid: ${terreno.length}x${terreno[0].length}`,
      10,
      20
    );
    this.canvasContext.fillText(`Walls: ${wallCount}`, 10, 40);

    console.log(`Rendered ${wallCount} walls`);
  }
}

export default AmbienteView;
