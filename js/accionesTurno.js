import { obtenerTurnos, cambiarEstado } from "./turnos.js";
import { abrirModal } from "./modal.js";
import { cargarDashboard } from "./dashboard.js";
import { mostrarAgenda, cerrarAgenda, abrirAgenda } from "./agenda.js";
async function editarTurno(id) {

    const consulta = await obtenerTurnos();

    let turnoEditar = null;

    consulta.forEach(doc => {

        if (doc.id === id) {

            turnoEditar = {

                id: doc.id,

                ...doc.data()

            };

        }

    });

    if (!turnoEditar) return;

    cerrarAgenda();

    abrirModal("editar", turnoEditar);

}
async function confirmarPago(id) {

    await cambiarEstado(id, "Confirmado");

    abrirAgenda(
        document.getElementById("buscarFecha").value
    );

    mostrarAgenda();

    await cargarDashboard();

}
function abrirWhatsApp(telefono) {

    alert(telefono);

}
export { editarTurno, confirmarPago, abrirWhatsApp };