
class Colonia {
    constructor(id, tamaño, recursos, ubicacion) {
        this.id = id;  // Identificador único para cada colonia
        this.tamaño = tamaño;  // Número de seres vivos en la colonia
        this.recursos = recursos;  // Recursos disponibles para la colonia
        this.ubicacion = ubicacion;  // Ubicación de la colonia en el mundo (e.g., coordenadas x, y)
    }

    // Método para añadir seres vivos a la colonia
    añadirSeres(cantidad) {
        this.tamaño += cantidad;
    }

    // Método para remover seres vivos de la colonia
    removerSeres(cantidad) {
        this.tamaño -= cantidad;
        if (this.tamaño < 0) {
            this.tamaño = 0;
        }
    }

    // Método para añadir recursos a la colonia
    añadirRecursos(cantidad) {
        this.recursos += cantidad;
    }

    // Método para consumir recursos de la colonia
    consumirRecursos(cantidad) {
        this.recursos -= cantidad;
        if (this.recursos < 0) {
            this.recursos = 0;
        }
    }

    // Método para mover la colonia a una nueva ubicación
    mover(ubicacionNueva) {
        this.ubicacion = ubicacionNueva;
    }
}

// Exportar la clase Colonia para que pueda ser usada en otros archivos
module.exports = Colonia;
