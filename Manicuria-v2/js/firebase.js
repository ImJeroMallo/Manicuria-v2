import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getFirestore }
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { getAuth }
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {

    apiKey: "AIzaSyDUqcnJP8kKAF4VhYreeLb6Y6RdGoATKIo",

    authDomain: "mi-proyecto-5b38e.firebaseapp.com",

    projectId: "mi-proyecto-5b38e",

    storageBucket: "mi-proyecto-5b38e.firebasestorage.app",

    messagingSenderId: "296646037058",

    appId: "1:296646037058:web:bd9c831a8e3a9ab069a7db",

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

export { app, db, auth };