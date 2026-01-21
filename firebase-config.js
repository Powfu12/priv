// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCpfXipZVHKv1xomJkKn6BNa3tk3O65Wqs",
    authDomain: "europolys.firebaseapp.com",
    databaseURL: "https://europolys-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "europolys",
    storageBucket: "europolys.firebasestorage.app",
    messagingSenderId: "342054630441",
    appId: "1:342054630441:web:00db398888eb60a45b5838",
    measurementId: "G-S3PDG0GRNG"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    window.firebaseDB = firebase.database();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}