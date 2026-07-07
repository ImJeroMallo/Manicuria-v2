import {
    formatearFecha,
    obtenerColorEstado
} from "./utils.js";

function crearCabecera(fecha) {

    return `

        <div class="dia">

            📅 ${formatearFecha(fecha)}

        </div>

    `;

}

function crearTarjetaTurno(turno, id) {

    return `

        <div
        class="turno"
        style="
        border-left:8px solid ${obtenerColorEstado(turno.estado)}
        ">

            <h2>👤 ${turno.nombre}</h2>

            <p>📞 ${turno.telefono}</p>

            <p>💅 ${turno.servicio}</p>

            <p>💰 $${turno.precio.toLocaleString("es-AR")}</p>

            <h2>🕒 ${turno.hora}</h2>

        </div>

    `;

}

export {

    crearCabecera,

    crearTarjetaTurno

};