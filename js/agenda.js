import { obtenerTurnos } from "./turnos.js";
import {
    crearAgendaDia,
    crearContenidoAgenda
} from "./renderAgenda.js";
async function mostrarAgenda(fecha = null) {
    if (!fecha) {
        fecha = document.getElementById("buscarFecha").value;
    }
    if (!fecha) return;
    const lista = document.getElementById("listaTurnos");
    lista.innerHTML = "";
    const consulta = await obtenerTurnos();
    const turnosDelDia = [];
    consulta.forEach((documento) => {
        const turno = documento.data();
        if (turno.fecha === fecha) {
            turnosDelDia.push({ id: documento.id, ...turno });
        }
    });
    lista.innerHTML = crearAgendaDia(fecha, turnosDelDia);
    console.log("Fecha buscada:", fecha);
    console.log("Turnos encontrados:", turnosDelDia);
}
function abrirAgenda() {
    document
        .getElementById("modalAgenda")
        .style.display = "flex";
}
async function abrirAgendaDia(fecha) {
    const consulta = await obtenerTurnos();
    const turnos = [];
    consulta.forEach(doc => {
        const turno = doc.data();
        if (turno.fecha === fecha) {
            turnos.push({ id: doc.id, ...turno });
        }
    });
    const html =
        crearContenidoAgenda(fecha, turnos)
    // Cerrar ventana semanal
    document
        .getElementById("modalSemana")
        .style.display = "none";
    // Mostrar agenda del día
    document
        .getElementById("contenidoAgenda")
        .innerHTML = html;
    document
        .getElementById("tituloAgenda")
        .textContent = "Agenda del día";
    document
        .getElementById("modalAgenda")
        .style.display = "flex";
}
function cerrarAgenda() {
    document
        .getElementById("modalAgenda")
        .style.display = "none";
}
export { crearAgendaDia, mostrarAgenda, abrirAgenda, abrirAgendaDia, cerrarAgenda };