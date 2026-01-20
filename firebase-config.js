// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyBpG89fXOsMdByDUxEuTn8TiG9BQGCyz1o",
  authDomain: "europolyorders.firebaseapp.com",
  databaseURL: "https://europolyorders-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "europolyorders",
  storageBucket: "europolyorders.firebasestorage.app",
  messagingSenderId: "460493264565",
  appId: "1:460493264565:web:9ccc47eec74eea8a0250fc"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Make database available globally for admin panel
window.firebaseDB = database;

console.log('Firebase initialized successfully');
