import { obtenerTurnos } from "./turnos.js";
import { crearAgendaDia, abrirAgendaDia, mostrarAgenda } from "./agenda.js";
import { HORARIOS } from "./config.js";
async function mostrarPendientes() {

    activarCard("cardPendientes");

    const lista =
        document.getElementById("listaTurnos");

    lista.innerHTML = "";

    const consulta =
        await obtenerTurnos();

    const pendientes = [];

    consulta.forEach(doc => {

        const turno = doc.data();

        if (turno.estado === "Pendiente") {

            pendientes.push({
                id: doc.id,
                ...turno
            });

        }

    });

    pendientes.sort((a, b) => {

        if (a.fecha === b.fecha) {
            return a.hora.localeCompare(b.hora);
        }

        return a.fecha.localeCompare(b.fecha);

    });

    if (pendientes.length === 0) {

        lista.innerHTML =
            "<p>🎉 No hay turnos pendientes.</p>";

        return;

    }

    let html = "";

    let fechaActual = "";

    pendientes.forEach(turno => {

        if (turno.fecha !== fechaActual) {

            fechaActual = turno.fecha;

            html += `<h2>${fechaActual}</h2>`;

        }

        html += crearAgendaDia(
            turno.fecha,
            [turno]
        );

    });

    lista.innerHTML = html;

}
async function mostrarSemana() {

    activarCard("cardSemana");

    const lista =
        document.getElementById("listaTurnos");

    lista.innerHTML = "";

    const consulta =
        await obtenerTurnos();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const turnosSemana = [];

    consulta.forEach(doc => {

        const turno = doc.data();

        const fechaTurno =
            new Date(turno.fecha + "T00:00:00");

        const diferencia =
            (fechaTurno - hoy) / (1000 * 60 * 60 * 24);

        if (diferencia >= 0 && diferencia < 7) {

            turnosSemana.push({
                id: doc.id,
                ...turno
            });

        }

    });

    turnosSemana.sort((a, b) => {

        if (a.fecha === b.fecha) {
            return a.hora.localeCompare(b.hora);
        }

        return a.fecha.localeCompare(b.fecha);

    });

    if (turnosSemana.length === 0) {

        lista.innerHTML =
            "<p>No hay turnos para esta semana.</p>";

        return;

    }

    let html = "";

    let fechaActual = "";

    turnosSemana.forEach(turno => {

        if (turno.fecha !== fechaActual) {

            fechaActual = turno.fecha;

            html += `<h2>${fechaActual}</h2>`;

        }

        html += crearAgendaDia(
            turno.fecha,
            [turno]
        );

    });

    lista.innerHTML = html;

}
async function abrirSemana() {

    document.getElementById("modalSemana").style.display = "flex";

    const contenido = document.getElementById("contenidoSemana");

    contenido.innerHTML = "";

    const consulta = await obtenerTurnos();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {

        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);

        const fechaTexto =
            `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

        let cantidadTurnos = 0;

        consulta.forEach(doc => {

            if (doc.data().fecha === fechaTexto) {
                cantidadTurnos++;
            }

        });

        const disponibles = HORARIOS.length - cantidadTurnos;

        contenido.innerHTML += `
            <div class="dia-semana-card" data-fecha="${fechaTexto}">

                <h3>${fecha.toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "numeric"
        })}</h3>

                <p>👥 ${cantidadTurnos} turnos</p>

                <p>🟢 ${disponibles} horarios disponibles</p>

            </div>
        `;
    }
    document
        .querySelectorAll(".dia-semana-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => abrirAgendaDia(card.dataset.fecha)
            );

        });

}
function cerrarSemana() {

    document.getElementById("modalSemana").style.display = "none";

}
function mostrarFecha(fecha) {

    document.getElementById("buscarFecha").value = fecha;

    mostrarAgenda();

}
function mostrarHoy() {

    const hoy = new Date();

    const fecha =
        `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

    activarCard("cardHoy");

    mostrarFecha(fecha);

}
function mostrarManana() {

    const fecha = new Date();

    fecha.setDate(fecha.getDate() + 1);

    const fechaTexto =
        `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

    activarCard("cardManana");

    mostrarFecha(fechaTexto);

}

function activarCard(id) {

    document
        .querySelectorAll(".dashboard-card")
        .forEach(card =>
            card.classList.remove("activa")
        );

    const card = document.getElementById(id);

    if (card) {
        card.classList.add("activa");
    }

}
export { mostrarHoy, mostrarManana, mostrarPendientes, mostrarSemana, abrirSemana, cerrarSemana };