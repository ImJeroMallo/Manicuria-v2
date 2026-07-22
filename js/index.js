let ultimoTurno = null;
import { HORARIOS, SERVICIOS, DIAS_TRABAJO } from "./config.js";
import { db } from "./firebase.js";
import { guardarTurno } from "./turnos.js";
import { abrirMercadoPago, limpiarFormulario } from "./utils.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
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

    document
        .getElementById("fecha")
        .addEventListener(
            "change",
            actualizarHorarios
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

        ultimoTurno = turno;

        await guardarTurno(turno);

        alert("Turno enviado correctamente");

        console.log("Abriendo Mercado Pago...");

        abrirMercadoPago();

    }
    catch (error) {

        console.error(error);

        alert(error.message);

    }

}
async function actualizarHorarios() {

    const fecha =
        document.getElementById("fecha").value;

    if (!fecha) return;

    const fechaSeleccionada = new Date(fecha);

    const diaSemana = fechaSeleccionada.getDay();

    if (!DIAS_TRABAJO.includes(diaSemana)) {

        estado.innerHTML =
            "❌ Ese día no hay atención.";

        estado.style.color = "red";

        boton.disabled = true;

        document.getElementById("fecha").value = "";

        document.getElementById("hora").innerHTML = `
        <option value="">
            Seleccione un horario
        </option>
    `;

        document.getElementById("estadoHorarios").innerHTML = "";

        document.getElementById("btnReservar").disabled = true;

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

    const disponibles =
        HORARIOS.length - ocupados.length;

    const estado =
        document.getElementById("estadoHorarios");

    const boton =
        document.getElementById("btnReservar");

    if (disponibles === 0) {

        estado.innerHTML =
            "❌ No quedan horarios disponibles para esta fecha";

        estado.style.color = "red";

        boton.disabled = true;

    } else {

        estado.innerHTML =
            `✅ Horarios disponibles: ${disponibles}`;

        estado.style.color = "green";

        boton.disabled = false;

    }

    const selectHora =
        document.getElementById("hora");

    selectHora.innerHTML = `
        <option value="">
            Seleccione un horario
        </option>
    `;

    HORARIOS.forEach((hora) => {

        if (!ocupados.includes(hora)) {

            selectHora.innerHTML += `
                <option value="${hora}">
                    ${hora}
                </option>
            `;

        }

    });

}

function enviarWhatsApp() {

    if (!ultimoTurno) {

        alert("Primero debes reservar un turno.");

        return;

    }

    const mensaje =
        `Hola, soy ${ultimoTurno.nombre}. Ya realicé el pago de la seña. Mí turno es para ${ultimoTurno.fecha} a las ${ultimoTurno.hora}. Servicio: ${ultimoTurno.servicio}.`;

    window.open(
        "https://wa.me/5493482203579?text=" +
        encodeURIComponent(mensaje),
        "_blank"
    );

    limpiarFormulario();

    ultimoTurno = null;

}
function configurarCalendario() {

    const hoy = new Date();

    const año = hoy.getFullYear();

    const mes = String(hoy.getMonth() + 1).padStart(2, "0");

    const dia = String(hoy.getDate()).padStart(2, "0");

    document.getElementById("fecha").min =
        `${año}-${mes}-${dia}`;

}
configurarCalendario();
window.reservar = reservar;
window.enviarWhatsApp = enviarWhatsApp;