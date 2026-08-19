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
export {
    cargarDashboard
};