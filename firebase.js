//credentiales firebase/ Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmgGYuFnK7tPu-UoAkv4hG-SCN7RAyy-g",
  authDomain: "lifesync-3cb2f.firebaseapp.com",
  projectId: "lifesync-3cb2f",
  storageBucket: "lifesync-3cb2f.firebasestorage.app",
  messagingSenderId: "922990801055",
  appId: "1:922990801055:web:a78240af9ed2764ccb72aa",
  measurementId: "G-266MRY0GQT",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);

const getCurrentUser = () => auth.currentUser;

export { auth, db, storage, database, getCurrentUser };
