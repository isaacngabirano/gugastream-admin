import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZUk7gmoF9nHuzh0u-62tugpXIGIYAsGE",
  authDomain: "guga-stream.firebaseapp.com",
  projectId: "guga-stream",
  storageBucket: "guga-stream.firebasestorage.app",
  messagingSenderId: "962717477748",
  appId: "1:962717477748:web:4adc6d542ed19b889eda21",
  measurementId: "G-2FX0ZC3K9B"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
