import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAIX3aQq3VEBq269Jdrk77CefNttqAR51s",
  authDomain: "mozambique-newhope.firebaseapp.com",
  projectId: "mozambique-newhope",
  storageBucket: "mozambique-newhope.firebasestorage.app",
  messagingSenderId: "133563964959",
  appId: "1:133563964959:web:d3f183b721d540140f7f2a",
  databaseURL: "https://mozambique-newhope-default-rtdb.firebaseio.com",
  measurementId: "G-FY6CNVX6ZK",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export { ref, set, get, push, update, onValue, off, remove, child } from 'firebase/database';
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
export { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
