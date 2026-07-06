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

export {
    crearCabecera
};