import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { db } from "./firebase.js";
export async function obtenerConfiguracion() {

    const referencia =
        doc(db, "configuracion", "agenda");

    const documento =
        await getDoc(referencia);

    return documento.data();

}

export async function guardarDiasTrabajo(diasTrabajo) {

    const referencia =
        doc(db, "configuracion", "agenda");

    await setDoc(
        referencia,
        {
            diasTrabajo
        },
        {
            merge: true
        }
    );

}