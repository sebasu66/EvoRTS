
class Colonia {
    constructor(id, tamaño, recursos, ubicacion) {
        this.id = id;
        this.tamaño = tamaño;
        this.recursos = recursos;
        this.ubicacion = ubicacion;
    }

    añadirSeres(cantidad) {
        this.tamaño += cantidad;
    }

    removerSeres(cantidad) {
        this.tamaño -= cantidad;
        if (this.tamaño < 0) {
            this.tamaño = 0;
        }
    }

    añadirRecursos(cantidad) {
        this.recursos += cantidad;
    }

    consumirRecursos(cantidad) {
        this.recursos -= cantidad;
        if (this.recursos < 0) {
            this.recursos = 0;
        }
    }

    mover(ubicacionNueva) {
        this.ubicacion = ubicacionNueva;
    }
}

module.exports = Colonia;
