import { HORARIOS } from "./config.js";
let modo = "";
let turnoActual = null;
function abrirModal(tipo, turno = null) {

    modo = tipo;
    turnoActual = turno;

    document.getElementById("modalTurno").style.display = "flex";

    if (tipo === "editar" && turno) {

        document.getElementById("tituloModal").textContent =
            "Editar turno";

        document.getElementById("modalNombre").value =
            turno.nombre;

        document.getElementById("modalTelefono").value =
            turno.telefono;

        document.getElementById("modalServicio").value =
            turno.precio;

        document.getElementById("modalPrecio").value =
            turno.precio;

        document.getElementById("modalFecha").value =
            turno.fecha;
        const selectHora =
            document.getElementById("modalHora");

        selectHora.innerHTML = "";

        HORARIOS.forEach(hora => {

            selectHora.innerHTML += `
        <option value="${hora}">
            ${hora}
        </option>
    `;

        });

        selectHora.value = turno.hora;

        document.getElementById("modalEstado").value =
            turno.estado;

    }

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