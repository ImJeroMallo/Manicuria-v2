import { obtenerTurnos } from "./turnos.js";
async function cargarDashboard() {

    const turnos =
        await obtenerTurnos();

    let turnosHoy = 0;
    let turnosManana = 0;
    let turnosSemana = 0;
    let pendientes = 0;

    const fechaHoy = new Date();

    const fechaManana = new Date(fechaHoy);
    fechaManana.setDate(fechaManana.getDate() + 1);
    const hoyTexto =
        `${fechaHoy.getFullYear()}-${String(fechaHoy.getMonth() + 1).padStart(2, "0")}-${String(fechaHoy.getDate()).padStart(2, "0")}`;

    const mañanaTexto =
        `${fechaManana.getFullYear()}-${String(fechaManana.getMonth() + 1).padStart(2, "0")}-${String(fechaManana.getDate()).padStart(2, "0")}`;

    turnos.forEach(doc => {

        const turno = doc.data();

        const fecha =
            new Date(turno.fecha);

        if (turno.fecha === hoyTexto) {
            turnosHoy++;
        }

        if (turno.fecha === mañanaTexto) {
            turnosManana++;
        }

        const fechaTurno = new Date(
            turno.fecha + "T00:00:00"
        );

        const diferencia =
            Math.floor(
                (fechaTurno - new Date(hoyTexto + "T00:00:00"))
                / (1000 * 60 * 60 * 24)
            );

        if (diferencia >= 0 && diferencia < 7) {
            turnosSemana++;
        }

        if (turno.estado === "Pendiente") {
            pendientes++;
        }

    });

    document.getElementById("turnosHoy").textContent =
        `${turnosHoy} turnos`;

    document.getElementById("turnosManana").textContent =
        `${turnosManana} turnos`;

    document.getElementById("turnosSemana").textContent =
        `${turnosSemana} turnos`;
    document.getElementById("cantidadPendientes").textContent =
        pendientes;

}

function formatoPesos(valor) {
    return `$${Number(valor || 0).toLocaleString("es-AR")}`;
}

function obtenerNombreMesActual() {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
}

async function cargarEstadisticasMensuales(mesSeleccionado = obtenerNombreMesActual()) {
    const turnos = await obtenerTurnos();
    const [anio, mes] = mesSeleccionado.split("-").map(Number);

    let cantidadTurnos = 0;
    let cantidadServicios = 0;
    let ganancias = 0;
    const servicios = {};

    turnos.forEach((doc) => {
        const turno = doc.data();

        // Se contabilizan todos los turnos del mes, excepto los cancelados.
        if (turno.estado === "Cancelado" || !turno.fecha) return;

        const [anioTurno, mesTurno] = turno.fecha.split("-").map(Number);
        if (anioTurno !== anio || mesTurno !== mes) return;

        const nombreServicio = turno.servicio || "Servicio sin nombre";
        const precio = Number(turno.precio) || 0;

        cantidadTurnos++;
        cantidadServicios++;
        ganancias += precio;

        if (!servicios[nombreServicio]) {
            servicios[nombreServicio] = { cantidad: 0, total: 0 };
        }

        servicios[nombreServicio].cantidad++;
        servicios[nombreServicio].total += precio;
    });

    const elementoTurnos = document.getElementById("total-turnos-mes");
    const elementoServicios = document.getElementById("total-servicios-mes");
    const elementoGanancias = document.getElementById("ganancias-mes");
    const detalleServicios = document.getElementById("detalle-servicios-mes");

    if (elementoTurnos) elementoTurnos.textContent = cantidadTurnos;
    if (elementoServicios) elementoServicios.textContent = cantidadServicios;
    if (elementoGanancias) elementoGanancias.textContent = formatoPesos(ganancias);

    if (detalleServicios) {
        const nombres = Object.keys(servicios);

        if (nombres.length === 0) {
            detalleServicios.innerHTML = '<tr><td colspan="3">No hay turnos realizados en este mes.</td></tr>';
        } else {
            detalleServicios.innerHTML = nombres.map((nombre) => `
                <tr>
                    <td>${nombre.replace(/[&<>"']/g, (caracter) => ({
                        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
                    })[caracter])}</td>
                    <td>${servicios[nombre].cantidad}</td>
                    <td>${formatoPesos(servicios[nombre].total)}</td>
                </tr>
            `).join("");
        }
    }
}

export {
    cargarDashboard,
    cargarEstadisticasMensuales,
    obtenerNombreMesActual
};