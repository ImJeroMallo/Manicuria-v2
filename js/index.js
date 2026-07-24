let ultimoTurno = null;
let turnoPendiente = null;
let diasTrabajo = [];
import { mostrarToast } from "./toast.js";
import { HORARIOS, SERVICIOS } from "./config.js";
import { db } from "./firebase.js";
import { guardarTurno } from "./turnos.js";
import { abrirMercadoPago, limpiarFormulario, formatearFecha } from "./utils.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { obtenerConfiguracion } from "./configuracion.js";
function cargarServicios() {

    const select =
        document.getElementById("servicio");

    select.innerHTML = `
        <option value="">
            Seleccione un servicio
        </option>
    `;

    SERVICIOS.forEach((servicio) => {

        select.innerHTML += `
            <option value="${servicio.precio}">
                ${servicio.nombre}
            </option>
        `;

    });

}
function iniciarPagina() {

    cargarServicios();
    configurarCalendario();

    document
        .getElementById("fecha")
        .addEventListener(
            "change",
            actualizarHorarios
        );
    document
        .getElementById("btnConfirmarResumen")
        .addEventListener(
            "click",
            confirmarReserva
        );

    document
        .getElementById("btnCancelarResumen")
        .addEventListener(
            "click",
            cerrarResumen
        );

}

iniciarPagina();
function leerFormulario() {

    const nombre =
        document.getElementById("nombre").value.trim();

    const telefono =
        document.getElementById("telefono").value.trim();
    if (!/^[0-9]+$/.test(telefono)) {

        throw new Error(
            "El teléfono solo debe contener números."
        );

    }

    const selectServicio =
        document.getElementById("servicio");

    const servicio =
        selectServicio.options[
            selectServicio.selectedIndex
        ].text;

    const precio =
        Number(selectServicio.value);

    const fecha =
        document.getElementById("fecha").value;

    const hora =
        document.getElementById("hora").value;

    if (
        nombre === "" ||
        telefono === "" ||
        fecha === "" ||
        hora === "" ||
        selectServicio.value === ""
    ) {

        throw new Error("Complete todos los campos.");

    }

    return {

        nombre,

        telefono,

        servicio,

        precio,

        fecha,

        hora,

        estado: "Pendiente",

        senaPagada: false,

        fechaCreacion: new Date()

    };

}
async function reservar() {

    try {

        const turno = leerFormulario();

        const disponible =
            await horarioDisponible(
                turno.fecha,
                turno.hora
            );

        if (!disponible) {

            mostrarToast(
                "❌ Ese horario acaba de ser reservado.", "error"
            );

            await actualizarHorarios();

            return;

        }

        turnoPendiente = turno;

        mostrarResumen(turno);

    }
    catch (error) {

        mostrarToast(
            error.message,
            "error"
        );

    }

}
async function confirmarReserva() {

    const botonCancelar =
        document.getElementById("btnCancelarResumen");

    if (!turnoPendiente)
        return;

    const boton =
        document.getElementById("btnConfirmarResumen");

    boton.disabled = true;
    botonCancelar.disabled = true;
    boton.innerHTML = "⏳ Guardando turno...";
    try {

        await guardarTurno(turnoPendiente);

        ultimoTurno = turnoPendiente;

        turnoPendiente = null;

        cerrarResumen();

        mostrarToast(
            "✅ Turno reservado correctamente."
        );

        boton.innerHTML = "✅ Redirigiendo...";

        await new Promise(resolve =>
            setTimeout(resolve, 1000)
        );
        abrirMercadoPago();
        limpiarFormulario();
    }
    catch (error) {

        mostrarToast(
            error.message,
            "error"
        );

    }
    finally {
        boton.disabled = false;

        boton.innerHTML =
            "Confirmar y pagar";
        botonCancelar.disabled = false;
    }

}

async function actualizarHorarios() {

    const resumen =
        document.getElementById("resumenSeleccion");
    resumen.classList.remove("activo");
    resumen.innerHTML =
        "Aún no seleccionaste un horario.";
    const fecha =
        document.getElementById("fecha").value;
    if (!fecha) return;
    const estado =
        document.getElementById("estadoHorarios");
    const boton =
        document.getElementById("btnReservar");
    const fechaSeleccionada = new Date(fecha);
    const diaSemana = fechaSeleccionada.getDay();

    if (!diasTrabajo.includes(diaSemana)) {

        estado.innerHTML =
            "❌ Ese día no hay atención.";

        estado.style.color = "red";

        boton.disabled = true;

        document.getElementById("horarios").innerHTML = "";

        document.getElementById("hora").value = "";

        return;

    }

    const consulta = query(
        collection(db, "turnos"),
        where("fecha", "==", fecha)
    );

    const resultado =
        await getDocs(consulta);

    const ocupados = [];
    resultado.forEach((doc) => {
        ocupados.push(doc.data().hora);
    });

    const disponibles = HORARIOS.length - ocupados.length;

    if (disponibles === 0) {
        estado.innerHTML =
            "😔 Lo sentimos, ya no quedan turnos disponibles para este día.";
        estado.style.color = "#ff6b6b";
        boton.disabled = true;

    } else {
        estado.innerHTML =
            `✨ Quedan <strong>${disponibles}</strong> horarios disponibles`;
        estado.style.color = "#2ECC71";
        boton.disabled = false;
    }

    if (ocupados.length === HORARIOS.length) {
        boton.disabled = true;
        document.getElementById("horarios").innerHTML =
            "<p>No hay horarios disponibles.</p>";
        document.getElementById("hora").value = "";
        return;
    }

    mostrarHorarios(ocupados);

    console.log("Fecha:", fecha);
    console.log("Cantidad de turnos:", resultado.size);
    console.log("Horarios ocupados:", ocupados);
}
async function horarioDisponible(fecha, hora) {

    const consulta = query(
        collection(db, "turnos"),
        where("fecha", "==", fecha),
        where("hora", "==", hora)
    );

    const resultado =
        await getDocs(consulta);

    return resultado.empty;

}
async function configurarCalendario() {

    const configuracion =
        await obtenerConfiguracion();

    if (!configuracion) return;

    diasTrabajo =
        configuracion.diasTrabajo || [];

    const fecha =
        document.getElementById("fecha");

    fecha.min =
        new Date().toISOString().split("T")[0];

}
function enviarWhatsApp() {

    if (!ultimoTurno) {

        mostrarToast(
            "Primero debés reservar un turno.", "info"
        );

        return;

    }

    const mensaje =

        `Hola 😊. Ya realicé el pago de la seña.
        👤 Nombre: ${ultimoTurno.nombre}
        📞 Teléfono: ${ultimoTurno.telefono}
        📅 Fecha: ${formatearFecha(ultimoTurno.fecha)}
        🕒 Hora: ${ultimoTurno.hora}
        💅 Servicio: ${ultimoTurno.servicio}
        Muchas gracias.`;
    window.open("https://wa.me/5493482203579?text=" + encodeURIComponent(mensaje), "_blank");
    limpiarFormulario();
    ultimoTurno = null;
}
function mostrarResumen(turno) {

    const modal =
        document.getElementById("modalResumen");

    const contenido =
        document.getElementById("contenidoResumen");

    contenido.innerHTML = `

<div class="resumen-reserva">

    <div class="resumen-item">
        <span>👤 Cliente</span>
        <strong>${turno.nombre}</strong>
    </div>

    <div class="resumen-item">
        <span>📞 Teléfono</span>
        <strong>${turno.telefono}</strong>
    </div>

    <div class="resumen-item">
        <span>💅 Servicio</span>
        <strong>${turno.servicio}</strong>
    </div>

    <div class="resumen-item">
        <span>📅 Fecha</span>
        <strong>${formatearFecha(turno.fecha)}</strong>
    </div>

    <div class="resumen-item">
        <span>🕒 Hora</span>
        <strong>${turno.hora}</strong>
    </div>

    <hr>

    <div class="resumen-item">
        <span>Total</span>
        <strong>$${turno.precio.toLocaleString("es-AR")}</strong>
    </div>

    <div class="resumen-item seña">

        <span>Seña a pagar</span>

        <strong>$5.000</strong>

    </div>
    <p class="nota-reserva"> 💖 La seña será descontada del precio final del servicio el día de tu turno. </p>

</div>`;

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

}

function cerrarResumen() {

    document
        .getElementById("modalResumen")
        .style.display = "none";
    document.body.style.overflow = "auto";
}
function mostrarHorarios(ocupados) {
    const contenedor =
        document.getElementById("horarios");
    contenedor.innerHTML = "";
    document.getElementById("hora").value = "";
    HORARIOS.forEach((hora) => {
        const boton =
            document.createElement("button");
        boton.type = "button";
        boton.className = "horario";
        if (ocupados.includes(hora)) {
            boton.classList.add("ocupado");
            boton.disabled = true;
            boton.innerHTML =
                `🔒 ${hora}`;
        } else {
            boton.classList.add("disponible");
            boton.innerHTML =
                `🟢 ${hora}`;
            boton.onclick = () => {
                document
                    .querySelectorAll(".horario.disponible")
                    .forEach(b =>
                        b.classList.remove("activo")
                    );
                boton.classList.add("activo");
                document.getElementById("hora").value = hora;
                const resumen =
                    document.getElementById("resumenSeleccion");

                const fecha =
                    document.getElementById("fecha").value;

                resumen.classList.add("activo");

                resumen.innerHTML = ` <b>✅ Turno seleccionado</b><br>
                 📅 ${formatearFecha(fecha)}<br>
                🕒 ${hora} `;
            };
        }
        contenedor.appendChild(boton);
    });
}
window.reservar = reservar;
window.enviarWhatsApp = enviarWhatsApp;