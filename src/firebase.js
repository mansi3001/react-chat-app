import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA9k262S6q8vT6z7JOrUNfjkXBIyxjA5Tk",
    authDomain: "chata-app-3ec37.firebaseapp.com",
    projectId: "chata-app-3ec37",
    storageBucket: "chata-app-3ec37.firebasestorage.app",
    messagingSenderId: "490019782111",
    appId: "1:490019782111:web:d201cdbfb26650e62d186a",
    measurementId: "G-3E6CFMKTV9"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);