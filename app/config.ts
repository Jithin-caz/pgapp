// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2_kM6fyTGnYxPbyblzdAm4KxM9nhBhd8",
  authDomain: "pgapp-b4478.firebaseapp.com",
  projectId: "pgapp-b4478",
  storageBucket: "pgapp-b4478.firebasestorage.app",
  messagingSenderId: "163229079830",
  appId: "1:163229079830:web:309433f2b36358149d5837",
  measurementId: "G-KLDC47VKGT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);