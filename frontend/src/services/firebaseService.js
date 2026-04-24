import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCvuTG5lX3PgeulShuF4XziqAMBHz-Ihfk",
  authDomain: "eventmareketplace.firebaseapp.com",
  projectId: "eventmareketplace",
  storageBucket: "eventmareketplace.firebasestorage.app",
  messagingSenderId: "730293441226",
  appId: "1:730293441226:web:1e981d63cb1b6218479a33"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };