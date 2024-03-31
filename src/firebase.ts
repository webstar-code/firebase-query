import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1RhjbrEY_PKBnFIfhgwTtZ_3OsK-NG6Q",
  authDomain: "flex-dev-test.firebaseapp.com",
  projectId: "flex-dev-test",
  storageBucket: "flex-dev-test.appspot.com",
  messagingSenderId: "900196718186",
  appId: "1:900196718186:web:5dee1d38576c5c0a8e1c13",
  measurementId: "G-9JS00CTWRQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const dbCollections = {
  transactions: "transactions"
}