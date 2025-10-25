// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwssNacawh-8ERMgW_CigUDkuCgletYS4",
    authDomain: "app-maestro-detail.firebaseapp.com",
    projectId: "app-maestro-detail",
    storageBucket: "app-maestro-detail.firebasestorage.app",
    messagingSenderId: "258167280689",
    appId: "1:258167280689:web:f9d1e398d3f16bfa157110",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
