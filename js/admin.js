import { abrirModal, cerrarModal } from "./modal.js";
import { crearAgendaDia } from "./agenda.js";
import { eliminarTurno, cambiarEstado, obtenerTurnos } from "./turnos.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { HORARIOS } from "./config.js";
onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.href =
                "login.html";
            return;
        }

        mostrarHoy();
        document
            .getElementById("btnBuscar")
            .addEventListener(
                "click",
                buscarAgenda
            );
        document
            .getElementById("btnHoy")
            .addEventListener(
                "click",
                mostrarHoy
            );
        document
            .getElementById("btnCancelarModal")
            .addEventListener(
                "click",
                cerrarModal
            );

    }
);
window.eliminarTurno = async (id) => {

    await eliminarTurno(id);

    buscarAgenda();

};

window.cambiarEstado = async (id, estado) => {

    await cambiarEstado(id, estado);

    buscarAgenda();

};
async function buscarAgenda() {

    const fecha =
        document.getElementById("buscarFecha").value;

    if (!fecha) return;

    const lista =
        document.getElementById("listaTurnos");

    lista.innerHTML = "";

    const consulta =
        await obtenerTurnos();

    const turnosDelDia = [];

    consulta.forEach((documento) => {

        const turno = documento.data();

        if (turno.fecha === fecha) {

            turnosDelDia.push({

                id: documento.id,

                ...turno

            });

        }

    });
    lista.innerHTML =
        crearAgendaDia(
            fecha,
            turnosDelDia
        );
}
function mostrarHoy() {

    const hoy = new Date();

    const año = hoy.getFullYear();

    const mes = String(
        hoy.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoy.getDate()
    ).padStart(2, "0");

    document.getElementById("buscarFecha").value =
        `${año}-${mes}-${dia}`;

    buscarAgenda();

}
window.moverHorario = moverHorario;

function moverHorario(turno) {

    abrirModal("mover", turno);

}