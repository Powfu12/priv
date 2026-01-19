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

// Initialize Firebase with error handling
try {
    console.log('[Firebase] Checking if Firebase is available...');

    if (typeof firebase === 'undefined') {
        console.error('[Firebase] Firebase SDK not loaded!');
        throw new Error('Firebase SDK not loaded');
    }

    console.log('[Firebase] Firebase SDK detected, initializing...');
    firebase.initializeApp(firebaseConfig);
    window.firebaseDB = firebase.database();
    console.log('[Firebase] Firebase initialized successfully');
    console.log('[Firebase] Database instance created:', !!window.firebaseDB);
} catch (error) {
    console.error('[Firebase] Initialization error:', error);
    console.error('[Firebase] Error details:', error.message, error.stack);

    // Show error on page
    setTimeout(() => {
        const container = document.getElementById('postsContainer');
        if (container) {
            container.innerHTML = `
                <div class="loading-posts">
                    <p style="color: #e74c3c;">Firebase initialization failed. Please refresh the page.</p>
                    <p style="color: #999; font-size: 0.8rem;">Error: ${error.message}</p>
                </div>
            `;
        }
    }, 1000);
}
