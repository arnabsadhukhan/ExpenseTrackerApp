// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCCuLknM6fabVIwRto0HZug8KdiFLtHq1g",
    authDomain: "expensetracker-7b79a.firebaseapp.com",
    projectId: "expensetracker-7b79a",
    storageBucket: "expensetracker-7b79a.appspot.com",
    messagingSenderId: "262215014041",
    appId: "1:262215014041:web:ab8d202d6d171bf8260a08",
    measurementId: "G-RL4BQB20PH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const createNewuser = createUserWithEmailAndPassword;
export const loginUser = signInWithEmailAndPassword;
export const logOutUser = signOut;