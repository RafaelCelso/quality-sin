import { initializeApp } from 'firebase/app';
import { getAuth, signOut, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp, deleteDoc, onSnapshot, limit, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Get Storage instance
const storage = getStorage(app);

export {
  auth,
  db,
  storage,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc,
  signOut,
  onSnapshot,
  limit,
  orderBy,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  getDoc,
  setDoc
};
