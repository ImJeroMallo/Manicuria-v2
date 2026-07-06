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
const horariosDisponibles = [
    "07:30hs",
    "09:30hs",
    "13:30hs",
    "15:30hs",
    "17:30hs"
];

document
    .getElementById("fecha")
    .addEventListener(
        "change",
        actualizarHorarios
    );
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
        horariosDisponibles.length - ocupados.length;

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

    horariosDisponibles.forEach((hora) => {

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
        `Hola, soy ${nombre}. Ya realicé el pago de la seña. Mi turno es para ${fecha} a las ${hora}. Servicio: ${servicio}.`;

    window.open(
        "https://wa.me/5493482203579?text=" +
        encodeURIComponent(mensaje),
        "_blank"
    );
}
window.reservar = reservar;
window.enviarWhatsApp = enviarWhatsApp;