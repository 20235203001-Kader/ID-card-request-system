// firebase.js - Updated
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDjHrQ9DP4GQUPcobz3uGhWunxH5F4POms",
  authDomain: "universityauth-dcec7.firebaseapp.com",
  projectId: "universityauth-dcec7",
  storageBucket: "universityauth-dcec7.firebasestorage.app",
  messagingSenderId: "1007715782705",
  appId: "1:1007715782705:web:89ae5207691af3f26c8510",
  measurementId: "G-8EMMJJDF7B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Provider with domain restriction
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  hd: "cse.bubt.edu.bd" // Only allow BUBT emails
});

export const signInWithGoogle = () => signInWithPopup(auth, provider);