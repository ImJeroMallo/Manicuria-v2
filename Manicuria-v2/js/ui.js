export function mostrarMensaje(texto, color) {

    const mensaje =
        document.getElementById("mensaje");

    if (!mensaje) return;

    mensaje.innerHTML = texto;

    mensaje.style.color = color;

}