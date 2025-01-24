import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAEpUooL8WZHZ3Erplv_nkLbTULZDgB06A",
  authDomain: "earnpaper-d1669.firebaseapp.com",
  projectId: "earnpaper-d1669",
  storageBucket: "earnpaper-d1669.firebasestorage.app",
  messagingSenderId: "120194379125",
  appId: "1:120194379125:web:807094efe50feb1ab4f73c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);