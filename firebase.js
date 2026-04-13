import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
    initializeAuth, 
    getReactNativePersistence, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    getAuth
} from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence based on platform
export const auth = Platform.OS === 'web' 
    ? getAuth(app) 
    : initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });

export const db = getFirestore(app);
export const createNewuser = createUserWithEmailAndPassword;
export const loginUser = signInWithEmailAndPassword;
export const logOutUser = signOut;