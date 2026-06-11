// imports for firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// --------------PROJECT SETTINGS AND API--------------------------------------

const firebaseConfig = {
    apiKey: "AIzaSyBIjPSgOkxHQE7H-Zo5XF97VP9JZBBAW08",
    authDomain: "roykernsweb.firebaseapp.com",
    projectId: "roykernsweb",
    storageBucket: "roykernsweb.firebasestorage.app",
    messagingSenderId: "1010891523328",
    appId: "1:1010891523328:web:fdb64e5b32159d85505fe5"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;