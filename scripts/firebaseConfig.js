import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

export { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

export { 
    collection, 
    doc,
    setDoc,
    getDoc,
    getDocs, 
    Timestamp,
    serverTimestamp,
    updateDoc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Firebase configuration (REMINDER TO CHANGE THIS TO DEFAULT VALUES WHEN WE DEPLOY)
const firebaseConfig = {
    apiKey: "AIzaSyCteFAmh1TjbbQB0hsbBwcbqwK8mofMO4Y",
    authDomain: "b-coders-database.firebaseapp.com",
    projectId: "b-coders-database",
    storageBucket: "b-coders-database.appspot.com",
    messagingSenderId: "268773123996",
    appId: "1:268773123996:web:fec77ef63557a9c6b50a59",
    measurementId: "G-92LTT20BXB"
};

// Initialize Firebase once
const app = initializeApp(firebaseConfig);

// Export shared instances
export const auth = getAuth(app);
export const db = getFirestore(app);
