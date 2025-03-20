import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBoOzESC_e4lo5V6sFfHaSgsyPbLYQ0RG8",
    authDomain: "snatchichat.firebaseapp.com",
    projectId: "snatchichat",
    storageBucket: "snatchichat.firebasestorage.app",
    messagingSenderId: "935467341582",
    appId: "1:935467341582:web:009813ce373ec5e552295f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Firestore
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
export const storage = getStorage(app); // Storage


