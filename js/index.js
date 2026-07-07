import { HORARIOS, SERVICIOS } from "./config.js";
import { db } from "./firebase.js";
import { guardarTurno } from "./turnos.js";
import { abrirMercadoPago, limpiarFormulario } from "./utils.js";
import {
    collection,
    query,
    where,
    getDocs
}
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
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

        await guardarTurno(turno);

        limpiarFormulario();

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

    let nombre =
        document.getElementById("nombre").value;

    let servicio =
        document.getElementById("servicio").options[
            document.getElementById("servicio").selectedIndex
        ].text;

    let fecha =
        document.getElementById("fecha").value;

    let hora =
        document.getElementById("hora").value;

    let mensaje =
        `Hola, soy ${nombre}. Ya realicé el pago de la seña. Mí turno es para ${fecha} a las ${hora}. Servicio: ${servicio}.`;

    window.open(
        "https://wa.me/5493482203579?text=" +
        encodeURIComponent(mensaje),
        "_blank"
    );
}
window.reservar = reservar;
window.enviarWhatsApp = enviarWhatsApp;