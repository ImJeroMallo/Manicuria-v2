export function mostrarToast(mensaje, tipo = "exito") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("mostrar");
    }, 50);
    setTimeout(() => {
        toast.classList.remove("mostrar");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}