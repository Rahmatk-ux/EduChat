// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZlnJQs6X7qHmN3i8vza3YePQjFX8yTkY",
  authDomain: "educhat-dde5a.firebaseapp.com",
  projectId: "educhat-dde5a",
  storageBucket: "educhat-dde5a.appspot.com",
  messagingSenderId: "1084507907945",
  appId: "1:1084507907945:web:790296c74d2c9b4876bff8",
  measurementId: "G-33DWD773XJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
