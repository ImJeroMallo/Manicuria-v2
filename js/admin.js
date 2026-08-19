import { crearCabecera, crearHorarioLibre, crearBotones, crearTarjetaTurno, crearAgendaDia, crearContenidoAgenda } from "./renderAgenda.js";
import { mostrarHoy, mostrarManana, mostrarPendientes, abrirSemana, cerrarSemana } from "./dashboardViews.js";
import { editarTurno, confirmarPago, abrirWhatsApp } from "./accionesTurno.js";
import { cargarDashboard } from "./dashboard.js";
import { abrirModal, cerrarModal } from "./modal.js";
import { mostrarAgenda, abrirAgenda, abrirAgendaDia, cerrarAgenda } from "./agenda.js";
import { eliminarTurno, cambiarEstado, guardarTurno, obtenerTurnos, moverTurno } from "./turnos.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { obtenerConfiguracion, guardarDiasTrabajo } from "./configuracion.js";
onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";
            return;
        }
        mostrarHoy();
        await cargarDiasTrabajo();
        await cargarDashboard();
        document
            .getElementById("cardHoy")
            .addEventListener(
                "click",
                mostrarHoy
            );
        document
            .getElementById("cardManana")
            .addEventListener(
                "click",
                mostrarManana
            );
        document
            .getElementById("cardPendientes")
            .addEventListener(
                "click",
                mostrarPendientes
            );
        document
            .getElementById("btnBuscar")
            .addEventListener(
                "click",
                () => mostrarAgenda()
            );
        document
            .getElementById("btnCancelarModal")
            .addEventListener(
                "click",
                cerrarModal
            );
        document
            .getElementById("btnGuardarDias")
            .addEventListener(
                "click",
                guardarConfiguracionDias
            );
        document
            .getElementById("cardSemana")
            .addEventListener(
                "click",
                abrirSemana
            );

        document
            .getElementById("btnCerrarSemana")
            .addEventListener(
                "click",
                cerrarSemana
            );
        document
            .getElementById("btnCerrarAgenda")
            .addEventListener(
                "click",
                cerrarAgenda
            );
    }
);
window.eliminarTurno = async (id) => {

    await eliminarTurno(id);

    mostrarAgenda();

    await cargarDashboard();

};

window.cambiarEstado = async (id, estado) => {

    await cambiarEstado(id, estado);

    mostrarAgenda();

    await cargarDashboard();

};


async function cargarDiasTrabajo() {

    const configuracion =
        await obtenerConfiguracion();

    if (!configuracion) return;

    const dias =
        configuracion.diasTrabajo || [];

    document
        .querySelectorAll("#diasTrabajo input")
        .forEach((checkbox) => {

            checkbox.checked =
                dias.includes(Number(checkbox.value));

        });

}
async function guardarConfiguracionDias() {

    console.log("Entró a guardarConfiguracionDias");

    const dias = [];

    document
        .querySelectorAll("#diasTrabajo input:checked")
        .forEach((checkbox) => {

            dias.push(Number(checkbox.value));

        });

    console.log(dias);

    await guardarDiasTrabajo(dias);

    alert("Configuración guardada correctamente.");

}
window.moverHorario = moverHorario;
function moverHorario(turno) {

    abrirModal("mover", turno);

}
window.editarTurno = editarTurno;
window.confirmarPago = confirmarPago;
window.abrirWhatsApp = abrirWhatsApp;