import { initializeApp } from 'firebase/app';
import { getAuth, signOut, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  setDoc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCLLCWp-n_cjrHuKpvHL58K3RFma4mX-G8",
    authDomain: "quality-sin.firebaseapp.com",
    projectId: "quality-sin",
    storageBucket: "quality-sin.appspot.com",
    messagingSenderId: "113632789447",
    appId: "1:113632789447:web:60df9d82fdb9b5b900cfe2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
const auth = getAuth(app);

// Get Firestore instance
const db = getFirestore(app);

export { 
  auth, 
  db,
  signOut, 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  setDoc,
  getDoc,
  onSnapshot
};