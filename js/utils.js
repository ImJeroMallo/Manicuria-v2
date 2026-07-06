export function formatearFecha(fecha) {

    const partes = fecha.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

export function obtenerColorEstado(estado) {

    switch (estado) {

        case "Pendiente":
            return "#ffc107";

        case "Confirmado":
            return "#28a745";

        case "Realizado":
            return "#007bff";

        case "Cancelado":
            return "#dc3545";

        default:
            return "#6c757d";

    }

}
export function abrirMercadoPago() {

    window.open(
        "https://mpago.la/2Z9SQzG",
        "_blank"
    );

}
export function limpiarFormulario() {

    document.getElementById("nombre").value = "";

    document.getElementById("telefono").value = "";

    document.getElementById("servicio").selectedIndex = 0;

    document.getElementById("fecha").value = "";

    document.getElementById("hora").innerHTML = `
        <option value="">
            Seleccione un horario
        </option>
    `;

}