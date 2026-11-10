import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
async function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        window.location.href =
            "admin.html";

    }
    catch (error) {

        alert(
            "Usuario o contraseña incorrectos"
        );
    }
}

window.login = login;