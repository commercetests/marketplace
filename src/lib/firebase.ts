// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKyohNqdsTrjIiaGO74p8q-Otdjxtu2pg",
  authDomain: "marketplace-b3067.firebaseapp.com",
  projectId: "marketplace-b3067",
  storageBucket: "marketplace-b3067.firebasestorage.app",
  messagingSenderId: "414949829221",
  appId: "1:414949829221:web:fbf80e02d1406ce8a4f48c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;