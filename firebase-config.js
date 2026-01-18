// Firebase Configuration
// ======================
// IMPORTANT: Replace these placeholder values with your actual Firebase project credentials
// To get your credentials:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project (or create a new one)
// 3. Go to Project Settings (gear icon) > General
// 4. Scroll down to "Your apps" section
// 5. Click on the web app icon (</>) or add a new web app
// 6. Copy the configuration object

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};

// Initialize Firebase
let db;
try {
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Export database reference
window.firebaseDB = db;
