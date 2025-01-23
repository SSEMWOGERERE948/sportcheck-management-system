  import { initializeApp, getApps } from 'firebase/app';
  import { getAuth } from 'firebase/auth';
  import { getFirestore } from 'firebase/firestore';

  const firebaseConfig = {
    apiKey: "AIzaSyDYx7dy1r8b9EkO5beGJhyCKpLtiHyPmtY",
    authDomain: "sportcheck-70301.firebaseapp.com",
    projectId: "sportcheck-70301",
    storageBucket: "sportcheck-70301.firebasestorage.app",
    messagingSenderId: "302594621968",
    appId: "1:302594621968:web:f6abe25cfd60417a728095",
    measurementId: "G-EKN7V0VMZM"
  };
  
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const auth = getAuth(app);
  const db = getFirestore(app);

  export { app, auth, db };
