import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDN3SeKY7PYkRDT5J5rujTHXMzJiCdDWI",
  authDomain: "trustlink5.firebaseapp.com",
  projectId: "trustlink5",
  storageBucket: "trustlink5.firebasestorage.app",
  messagingSenderId: "683139441301",
  appId: "1:683139441301:web:7df1d58d739f8857e7b19c",
};

// Prevent Firebase from initializing more than once
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// Export Firebase Authentication
export const auth = getAuth(app);

export default app;