import { db } from "./firebase.js";

import {
    deleteDoc,
    doc,
    updateDoc,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy
}
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
async function eliminarTurno(id) {

    if (!confirm("¿Eliminar turno?")) {
        return;
    }

    await deleteDoc(
        doc(db, "turnos", id)
    );

}
async function cambiarEstado(id, nuevoEstado) {

    await updateDoc(
        doc(db, "turnos", id),
        {
            estado: nuevoEstado
        }
    );

}
async function guardarTurno(turno) {

    const consulta = query(
        collection(db, "turnos"),
        where("fecha", "==", turno.fecha),
        where("hora", "==", turno.hora)
    );

    const resultado = await getDocs(consulta);

    if (!resultado.empty) {

        throw new Error("Ese horario ya está reservado");

    }

    await addDoc(
        collection(db, "turnos"),
        turno
    );

}
async function obtenerTurnos() {

    const consulta = query(

        collection(db, "turnos"),

        orderBy("fecha"),

        orderBy("hora")

    );

    return await getDocs(consulta);

}
async function moverTurno(id, nuevaHora) {

    await updateDoc(
        doc(db, "turnos", id),
        {
            hora: nuevaHora
        }
    );

}
export { eliminarTurno, cambiarEstado, guardarTurno, obtenerTurnos, moverTurno };