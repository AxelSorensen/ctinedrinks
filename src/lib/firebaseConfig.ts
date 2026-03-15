import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABwAB6QuG12q3CAfihuiDc29y-IBUHZ_M",
  authDomain: "ctine-drinks.firebaseapp.com",
  projectId: "ctine-drinks",
  storageBucket: "ctine-drinks.firebasestorage.app",
  messagingSenderId: "151318308173",
  appId: "1:151318308173:web:9719dbaa398bd33d0a8304"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };