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

// Use IIFE to avoid polluting global scope and prevent duplicate declarations
(function() {
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY_HERE",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID",
        databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
    };

    // Initialize Firebase (only if not already initialized)
    let db;
    try {
        // Check if Firebase is already initialized
        let app;
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialized successfully');
        } else {
            app = firebase.app(); // Use existing app
            console.log('Using existing Firebase instance');
        }

        db = firebase.database();
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }

    // Export database reference to window
    window.firebaseDB = db;
})();
