// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmBe02lPs3M0Ptf0K40dpkEunlGPG7NK0",
  authDomain: "task-tracker-474912.firebaseapp.com",
  projectId: "task-tracker-474912",
  storageBucket: "task-tracker-474912.firebasestorage.app",
  messagingSenderId: "139815271579",
  appId: "1:139815271579:web:97f33fa60645d9b6255a3e",
  measurementId: "G-97T9G3EBZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;