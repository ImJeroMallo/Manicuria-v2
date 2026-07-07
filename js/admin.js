import { abrirModal, cerrarModal } from "./modal.js";
import { crearCabecera } from "./agenda.js";
import { formatearFecha, obtenerColorEstado } from "./utils.js";
import { eliminarTurno, cambiarEstado, obtenerTurnos, moverTurno } from "./turnos.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
const horariosDisponibles = [

    "07:30hs",
    "09:30hs",
    "13:30hs",
    "15:30hs",
    "17:30hs"

];
onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.href =
                "login.html";
            return;
        }

        mostrarHoy();
        document
            .getElementById("btnBuscar")
            .addEventListener(
                "click",
                buscarAgenda
            );
        document
            .getElementById("btnHoy")
            .addEventListener(
                "click",
                mostrarHoy
            );
        document
            .getElementById("btnCancelarModal")
            .addEventListener(
                "click",
                cerrarModal
            );

    }
);

async function cargarTurnos() {

    const lista =
        document.getElementById(
            "listaTurnos"
        );

    lista.innerHTML = "";

    let consulta;

    try {

        consulta = await obtenerTurnos();

    }
    catch (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    let fechaAnterior = "";

    consulta.forEach((documento) => {

        const turno = documento.data();
        if (turno.fecha !== fechaAnterior) {

            fechaAnterior = turno.fecha;

            lista.innerHTML += `
        <div class="dia">
            📅 ${formatearFecha(turno.fecha)}
        </div>
        `;

        }

        lista.innerHTML += `

    <div class="turno"
    style="border-left:8px solid ${obtenerColorEstado(turno.estado)}">

        <h2 style="margin:0">
            👤 ${turno.nombre}
        </h2>

        <p>📞 ${turno.telefono}</p>

        <p>💅 <strong>Servicio:</strong> ${turno.servicio}</p>


        <p>💰 <strong>Precio:</strong> $${turno.precio.toLocaleString("es-AR")}</p>

        <h2 style="color:#444">
            🕒 ${turno.hora}
        </h2>

        <div style="margin:15px 0;">

            <span
            style="
                background:${obtenerColorEstado(turno.estado)};
                color:white;
                padding:8px 18px;
                border-radius:20px;
                font-weight:bold;
            ">

                ${turno.estado}

            </span>

        </div>

        <button
        style="background:#28a745"
        onclick="cambiarEstado('${documento.id}','Confirmado')">

            ✅ Confirmar

        </button>

        <button
        style="background:#007bff"
        onclick="cambiarEstado('${documento.id}','Realizado')">

            ✔️ Realizado

        </button>

        <button
        style="background:#dc3545"
        onclick="cambiarEstado('${documento.id}','Cancelado')">

            ❌ Cancelar

        </button>

        <button
        style="background:#444"
        onclick="eliminarTurno('${documento.id}')">

            🗑 Eliminar

        </button>
        <button
class="btn-mover"
onclick="moverHorario('${turno.id}')">

🔄 Mover

</button>

    </div>
    `;

    });
}

window.eliminarTurno = async (id) => {

    await eliminarTurno(id);

    buscarAgenda();

};

window.cambiarEstado = async (id, estado) => {

    await cambiarEstado(id, estado);

    buscarAgenda();

};
async function buscarAgenda() {

    const fecha =
        document.getElementById("buscarFecha").value;

    if (!fecha) return;

    const lista =
        document.getElementById("listaTurnos");

    lista.innerHTML = "";

    const consulta =
        await obtenerTurnos();

    const turnosDelDia = [];

    consulta.forEach((documento) => {

        const turno = documento.data();

        if (turno.fecha === fecha) {

            turnosDelDia.push({

                id: documento.id,

                ...turno

            });

        }

    });

    lista.innerHTML += crearCabecera(fecha);

    horariosDisponibles.forEach((hora) => {

        const turno =
            turnosDelDia.find(t => t.hora === hora);

        if (turno) {

            lista.innerHTML += crearTarjetaTurno(
                turno,
                documento.id
            );
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
                    class="btn-eliminar"
                    onclick="eliminarTurno('${turno.id}')">

                    🗑 Eliminar

                </button>

                <button
                    class="btn-mover"
                    data-id="${turno.id}">

                    🔄 Mover

                </button>

            </div>

        </div >

                `;

        }
        else {

            lista.innerHTML += `

                < div class="turno" >

                    <h2>🕒 ${hora}</h2>

                    <h3>⚪ Disponible</h3>

                </div >

                `;

        }

    });

}
function mostrarHoy() {

    const hoy = new Date();

    const año = hoy.getFullYear();

    const mes = String(
        hoy.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoy.getDate()
    ).padStart(2, "0");

    document.getElementById("buscarFecha").value =
        `${ año } -${ mes } -${ dia } `;

    buscarAgenda();

}
window.moverHorario = moverHorario;

async function moverHorario(turno) {

    abrirModal("mover", turno);

}