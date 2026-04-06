import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const createNewuser = createUserWithEmailAndPassword;
export const loginUser = signInWithEmailAndPassword;
export const logOutUser = signOut;