let ultimoTurno = null;
let turnoPendiente = null;
let diasTrabajo = [];
let añoCalendario = new Date().getFullYear();
let mesCalendario = new Date().getMonth();
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
async function iniciarPagina() {

    cargarServicios();
    await configurarCalendario();
    await crearCalendario();
    configurarVentanasServicios();
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
    try {
        const resumen = document.getElementById("resumenSeleccion");
        if (resumen) {
            resumen.classList.remove("activo");
            resumen.innerHTML = "Aún no seleccionaste un horario.";
        }

        const fecha = document.getElementById("fecha").value;
        if (!fecha) return;

        const estado = document.getElementById("estadoHorarios");
        const boton = document.getElementById("btnReservar");

        // 1. Corrección de zona horaria exacta
        const [anio, mes, dia] = fecha.split('-').map(Number);
        const fechaSeleccionada = new Date(anio, mes - 1, dia);
        const diaSemana = fechaSeleccionada.getDay();

        // 2. Verificamos si hay atención ese día
        if (!diasTrabajo.includes(diaSemana)) {
            estado.innerHTML = "❌ Ese día no hay atención.";
            estado.style.color = "red";
            boton.disabled = true;
            document.getElementById("horarios").innerHTML = "";
            document.getElementById("hora").value = "";
            return;
        }

        // 3. Consultamos Firebase para ver turnos ocupados
        const consulta = query(
            collection(db, "turnos"),
            where("fecha", "==", fecha)
        );

        const resultado = await getDocs(consulta);
        const ocupados = [];
        resultado.forEach((doc) => {
            ocupados.push(doc.data().hora);
        });

        // 4. Calculamos disponibilidad
        const disponibles = HORARIOS.length - ocupados.length;

        if (disponibles === 0) {
            estado.innerHTML = "😔 Lo sentimos, ya no quedan turnos disponibles para este día.";
            estado.style.color = "#ff6b6b";
            boton.disabled = true;
        } else {
            estado.innerHTML = `✨ Quedan <strong>${disponibles}</strong> horarios disponibles`;
            estado.style.color = "#2ECC71";
            boton.disabled = false;
        }

        // 5. Renderizamos los botones si hay lugar
        if (ocupados.length === HORARIOS.length) {
            boton.disabled = true;
            document.getElementById("horarios").innerHTML = "<p>No hay horarios disponibles.</p>";
            document.getElementById("hora").value = "";
            return;
        }

        mostrarHorarios(ocupados);

    } catch (error) {
        // Si algo se rompe, lo atrapamos acá para que no se quede la pantalla tildada
        console.error("🚨 Error al actualizar horarios:", error);
        const estado = document.getElementById("estadoHorarios");
        if (estado) {
            estado.innerHTML = "⚠️ Hubo un error al cargar los horarios. Revisá la consola.";
            estado.style.color = "red";
        }
    }
}
async function obtenerDisponibilidadMes(año, mes) {
    const consulta =
        await getDocs(collection(db, "turnos"));
    const disponibilidad = {};
    consulta.forEach(doc => {
        const turno = doc.data();
        const [anioTurno, mesTurno] = turno.fecha
            .split("-")
            .map(Number);
        if (
            anioTurno !== año ||
            (mesTurno - 1) !== mes
        ) {
            return;
        }
        if (!disponibilidad[turno.fecha]) {
            disponibilidad[turno.fecha] = 0;
        }
        disponibilidad[turno.fecha]++;
    });
    return disponibilidad;
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

    await crearCalendario();
}
async function crearCalendario() {

    const contenedor =
        document.getElementById("calendario");
    const año = añoCalendario;
    const mes = mesCalendario;
    const disponibilidad =
        await obtenerDisponibilidadMes(año, mes);
    const primerDia =
        new Date(año, mes, 1);
    const ultimoDia =
        new Date(año, mes + 1, 0);
    const diasMes =
        ultimoDia.getDate();
    const inicio =
        primerDia.getDay();
    const nombres = [
        "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"
    ];
    const fechaCalendario = new Date(añoCalendario, mesCalendario);
    let html = `
           <div class="calendario-header">
             <h3>${fechaCalendario.toLocaleDateString("es-AR", { month: "long", year: "numeric" })
        }</h3>
            </div>
              <div class="calendario-grid">
            `;
    nombres.forEach(nombre => {
        html += `
              <div class="dia-semana">${nombre}</div>
            `;
    });
    for (let i = 0; i < inicio; i++) {
        html += `
             <div class="dia vacio"></div>
            `;
    }
    for (let dia = 1; dia <= diasMes; dia++) {
        const fechaTexto =
            `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

        const ocupados = disponibilidad[fechaTexto] || 0;
        console.log(fechaTexto, ocupados);

        const fechaDia = new Date(año, mes, dia);

        const hoySinHora = new Date();
        hoySinHora.setHours(0, 0, 0, 0);

        let clase = "";

        if (fechaDia < hoySinHora) {
            clase = "pasado";
        }
        else if (!diasTrabajo.includes(fechaDia.getDay())) {
            clase = "sin-atencion";
        }
        else if (ocupados >= HORARIOS.length) {
            clase = "completo";
        }
        else if (ocupados >= HORARIOS.length - 2) {
            clase = "pocos";
        }
        else {
            clase = "muchos";
        }
        html += `
<button
    class="dia ${clase}"
    data-fecha="${fechaTexto}"
    type="button">
    ${dia}
</button>
`;

    }
    html += "</div>";
    contenedor.innerHTML = html;
    contenedor
        .querySelectorAll(".dia.muchos, .dia.pocos")
        .forEach(boton => {
            boton.addEventListener("click", () => {
                document
                    .querySelectorAll(".dia")
                    .forEach(d => d.classList.remove("activo"));
                boton.classList.add("activo");
                const dia =
                    boton.dataset.dia;
                const hoy =
                    new Date();
                const año =
                    hoy.getFullYear();
                const mes =
                    hoy.getMonth();
                const fecha = boton.dataset.fecha;

                document.getElementById("fecha").value = fecha;

                actualizarHorarios();
            });
        });
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
function configurarVentanasServicios() {
    const mainContainer = document.getElementById("contenedorVentanasServicios");
    // Seleccionamos el nuevo contenedor de scroll que está DENTRO del principal
    const scrollContainer = mainContainer.querySelector(".contenedor-ventanas-scroll");
    const botonInfo = document.getElementById("btnInfoServicios");

    // 1. Generamos las ventanas dinámicamente según la cantidad de servicios
    scrollContainer.innerHTML = "";
    SERVICIOS.forEach((servicio) => {
        if (servicio.descripcion) {
            scrollContainer.innerHTML += `
                <div class="ventana-servicio">
                    <div class="ventana-header">${servicio.nombre}</div>
                    <div class="ventana-body">${servicio.descripcion}</div>
                </div>
            `;
        }
    });
    // 2. Le damos la acción al botón de apretar (toggling the outer container)
    botonInfo.addEventListener("click", () => {
        if (mainContainer.classList.contains("oculto")) {
            // Mostrar ventanas
            mainContainer.classList.remove("oculto");
            botonInfo.innerHTML = "🔼 Ocultar info de servicios";
        } else {
            // Ocultar ventanas
            mainContainer.classList.add("oculto");
            botonInfo.innerHTML = "🤔 ¿Qué es cada servicio?";
        }
    });
    // --- CÓDIGO PARA ARRASTRAR CON EL MOUSE EN PC ---
    let isDown = false;
    let startX;
    let scrollLeft;

    scrollContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        scrollContainer.style.cursor = 'grabbing'; // Cambia el cursor a una manito cerrada
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
    });

    scrollContainer.addEventListener('mouseleave', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab'; // Manito abierta
    });

    scrollContainer.addEventListener('mouseup', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
    });

    scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 1; // El '* 2' es la velocidad del deslizamiento
        scrollContainer.scrollLeft = scrollLeft - walk;
    });
    // Le ponemos el cursor de manito por defecto
    scrollContainer.style.cursor = 'grab';
}
window.reservar = reservar;
window.enviarWhatsApp = enviarWhatsApp;