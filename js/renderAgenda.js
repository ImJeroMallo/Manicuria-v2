import { formatearFecha, obtenerColorEstado } from "./utils.js";
import { HORARIOS } from "./config.js";
function crearCabecera(fecha) {

    return `

        <div class="titulo-dia">

            📅 ${formatearFecha(fecha)}

        </div>

    `;

}
function crearHorarioLibre(hora) {

    return `

        <div class="turno disponible">

            <h2>🕒 ${hora}</h2>

            <h3>⚪ Disponible</h3>

        </div>

    `;

}
function crearBotones(turno) {

    return `

        <div class="acciones">

            <button
                class="btn-confirmar"
                onclick="cambiarEstado('${turno.id}','Confirmado')">

                ✅ Confirmar

            </button>

            <button
                class="btn-realizado"
                onclick="cambiarEstado('${turno.id}','Realizado')">

                ✔ Realizado

            </button>

            <button
                class="btn-cancelar"
                onclick="cambiarEstado('${turno.id}','Cancelado')">

                ❌ Cancelar

            </button>

            <button
                class="btn-mover"
                onclick="moverHorario('${turno.id}')">

                🔄 Mover

            </button>

            <button
                class="btn-eliminar"
                onclick="eliminarTurno('${turno.id}')">

                🗑 Eliminar

            </button>

        </div>

    `;

}
function crearTarjetaTurno(turno) {

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

            <span
                class="estado"
                style="
                    background:${obtenerColorEstado(turno.estado)};
                ">

                ${turno.estado}

            </span>

            ${crearBotones(turno)}

        </div>

    `;

}
function crearAgendaDia(fecha, turnosDelDia) {

    let html = crearCabecera(fecha);

    HORARIOS.forEach((hora) => {

        const turno =
            turnosDelDia.find(
                t => t.hora === hora
            );

        if (turno) {

            html += crearTarjetaTurno(turno);

        } else {

            html += crearHorarioLibre(hora);

        }

    });

    return html;

}
function crearContenidoAgenda(fecha, turnos) {

    let html = `
        <h2>${formatearFecha(fecha)}</h2>
    `;

    HORARIOS.forEach(hora => {

        const turno = turnos.find(t => t.hora === hora);

        if (turno) {

            html += `
<div class="horario ocupado">

    <strong>${hora}</strong>

    <p>👤 ${turno.nombre}</p>

    <p>💅 ${turno.servicio}</p>

    <p>📱 ${turno.telefono}</p>

    <p>Estado: ${turno.estado}</p>

    <div class="acciones-turno">

        ${turno.estado === "Pendiente"
                    ? `
        <button class="btn-confirmar"
            onclick="confirmarPago('${turno.id}')">

            💵 Confirmar pago

        </button>
        `
                    : ""}

        <button class="btn-whatsapp"
            onclick="abrirWhatsApp('${turno.telefono}')">

            📞 WhatsApp

        </button>

        <button class="btn-editar"
            onclick="editarTurno('${turno.id}')">

            ✏ Editar

        </button>

        <button class="btn-cancelar"
            onclick="eliminarTurno('${turno.id}')">

            ❌ Cancelar

        </button>

    </div>

</div>
`;

        } else {

            html += `
<div class="horario libre">

    <strong>${hora}</strong>

    <p>🟢 Disponible</p>

</div>
`;

        }

    });

    return html;

}
export { crearCabecera, crearHorarioLibre, crearBotones, crearTarjetaTurno, crearAgendaDia, crearContenidoAgenda };