let modo = "";

let turnoActual = null;

function abrirModal(tipo, turno = null) {

    modo = tipo;

    turnoActual = turno;

    document
        .getElementById("modalTurno")
        .style.display = "flex";

}

function cerrarModal() {

    document
        .getElementById("modalTurno")
        .style.display = "none";

}

export {

    abrirModal,

    cerrarModal

};