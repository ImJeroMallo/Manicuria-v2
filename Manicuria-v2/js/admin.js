import { crearCabecera, crearHorarioLibre, crearBotones, crearTarjetaTurno, crearAgendaDia, crearContenidoAgenda } from "./renderAgenda.js";
import { mostrarHoy, mostrarManana, mostrarPendientes, abrirSemana, cerrarSemana } from "./dashboardViews.js";
import { editarTurno, confirmarPago, abrirWhatsApp } from "./accionesTurno.js";
import { cargarDashboard, cargarEstadisticasMensuales, obtenerNombreMesActual } from "./dashboard.js";
import { abrirModal, cerrarModal } from "./modal.js";
import { mostrarAgenda, abrirAgenda, abrirAgendaDia, cerrarAgenda } from "./agenda.js";
import { eliminarTurno, cambiarEstado, guardarTurno, obtenerTurnos, actualizarTurno, moverTurno } from "./turnos.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { obtenerConfiguracion, guardarDiasTrabajo } from "./configuracion.js";


async function guardarEdicion() {

    const id = document.getElementById("btnGuardarModal").dataset.id;

    if (!id) {
        alert("No se encontró el turno.");
        return;
    }

    const datos = {

        nombre:
            document.getElementById("modalNombre").value.trim(),

        telefono:
            document.getElementById("modalTelefono").value.trim(),

        precio:
            Number(document.getElementById("modalPrecio").value),

        fecha:
            document.getElementById("modalFecha").value,

        hora:
            document.getElementById("modalHora").value,

        estado:
            document.getElementById("modalEstado").value

    };

    if (
        datos.nombre === "" ||
        datos.telefono === "" ||
        datos.fecha === "" ||
        datos.hora === ""
    ) {
        alert("Complete todos los campos.");
        return;
    }

    try {

        await actualizarTurno(id, datos);

        alert("✅ Turno actualizado correctamente.");

        cerrarModal();

        await mostrarAgenda(datos.fecha);
        await cargarDashboard();
        const mes = document.getElementById("mesEstadisticas")?.value || obtenerNombreMesActual();
        await cargarEstadisticasMensuales(mes);

    } catch (error) {

        console.error(error);

        alert("❌ No se pudo actualizar el turno.");

    }

}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    mostrarHoy();
    await cargarDiasTrabajo();
    await cargarDashboard();

    const selectorMes = document.getElementById("mesEstadisticas");
    if (selectorMes) {
        selectorMes.value = obtenerNombreMesActual();
        await cargarEstadisticasMensuales(selectorMes.value);
        selectorMes.addEventListener("change", () => {
            if (selectorMes.value) cargarEstadisticasMensuales(selectorMes.value);
        });
    }

    // Eventos de las tarjetas
    document.getElementById("cardHoy")?.addEventListener("click", mostrarHoy);
    document.getElementById("cardManana")?.addEventListener("click", mostrarManana);
    document.getElementById("cardPendientes")?.addEventListener("click", mostrarPendientes);
    document.getElementById("cardSemana")?.addEventListener("click", abrirSemana);

    // Eventos de modales y cierres
    document.getElementById("btnCancelarModal")?.addEventListener("click", cerrarModal);
    document.getElementById("btnGuardarModal")?.addEventListener("click", guardarEdicion);
    document.getElementById("btnGuardarDias")?.addEventListener("click", guardarConfiguracionDias);
    document.getElementById("btnCerrarSemana")?.addEventListener("click", cerrarSemana);
    document.getElementById("btnCerrarAgenda")?.addEventListener("click", cerrarAgenda);

    // Configuración del nuevo botón de fecha
    const btnBuscarFecha = document.getElementById("btnBuscarFecha");
    const inputFechaOculto = document.getElementById("inputFechaOculto");

    if (btnBuscarFecha && inputFechaOculto) {
        btnBuscarFecha.addEventListener("click", () => {
            if (typeof inputFechaOculto.showPicker === "function") {
                inputFechaOculto.showPicker();
            } else {
                inputFechaOculto.click();
            }
        });

        inputFechaOculto.addEventListener("change", (event) => {
            const fechaSeleccionada = event.target.value;
            if (fechaSeleccionada) {
                // Llama a tu función real cargada desde agenda.js
                mostrarAgenda(fechaSeleccionada);
            }
        });
    }
});

// Funciones globales para el window
window.eliminarTurno = async (id) => {
    await eliminarTurno(id);
    mostrarAgenda();
    await cargarDashboard();
    const mes = document.getElementById("mesEstadisticas")?.value || obtenerNombreMesActual();
    await cargarEstadisticasMensuales(mes);
};

window.cambiarEstado = async (id, estado) => {
    await cambiarEstado(id, estado);
    mostrarAgenda();
    await cargarDashboard();
    const mes = document.getElementById("mesEstadisticas")?.value || obtenerNombreMesActual();
    await cargarEstadisticasMensuales(mes);
};
window.editarTurno = editarTurno;
window.confirmarPago = confirmarPago;
window.abrirWhatsApp = abrirWhatsApp;
async function cargarDiasTrabajo() {
    const configuracion = await obtenerConfiguracion();
    if (!configuracion) return;

    const dias = configuracion.diasTrabajo || [];

    document.querySelectorAll("#diasTrabajo input").forEach((checkbox) => {
        checkbox.checked = dias.includes(Number(checkbox.value));
    });
}

async function guardarConfiguracionDias() {
    console.log("Entró a guardarConfiguracionDias");

    const dias = [];
    document.querySelectorAll("#diasTrabajo input:checked").forEach((checkbox) => {
        dias.push(Number(checkbox.value));
    });

    console.log(dias);
    await guardarDiasTrabajo(dias);
    alert("Configuración guardada correctamente.");
}

function moverHorario(turno) {
    abrirModal("mover", turno);
}

window.moverHorario = moverHorario;
window.editarTurno = editarTurno;
window.confirmarPago = confirmarPago;
window.abrirWhatsApp = abrirWhatsApp;