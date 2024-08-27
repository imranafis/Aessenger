import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "aessenger-cloud.firebaseapp.com",
  projectId: "aessenger-cloud",
  storageBucket: "aessenger-cloud.appspot.com",
  messagingSenderId: "763255662348",
  appId: "1:763255662348:web:a451a8f8a74e8fefa74b29",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
