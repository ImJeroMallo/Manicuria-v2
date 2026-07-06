import { db, auth }
    from "./firebase.js";
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