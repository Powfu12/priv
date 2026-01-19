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

// Check if page is loaded over HTTP (Firebase requires HTTPS on mobile)
function checkSecureConnection() {
    const isHTTP = window.location.protocol === 'http:';
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';

    if (isHTTP && !isLocalhost) {
        console.error('[Firebase] Page loaded over HTTP. Firebase requires HTTPS on mobile browsers.');
        return false;
    }
    return true;
}

// Initialize Firebase with comprehensive error handling
try {
    console.log('[Firebase] Protocol:', window.location.protocol);
    console.log('[Firebase] Hostname:', window.location.hostname);

    // Check for secure connection
    if (!checkSecureConnection()) {
        throw new Error('Insecure connection (HTTP). Firebase requires HTTPS on mobile devices. Please access the site via HTTPS.');
    }

    console.log('[Firebase] Checking if Firebase SDK is available...');

    if (typeof firebase === 'undefined') {
        console.error('[Firebase] Firebase SDK not loaded!');
        throw new Error('Firebase SDK not loaded. Check your internet connection.');
    }

    console.log('[Firebase] Firebase SDK detected, initializing...');

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    window.firebaseDB = firebase.database();

    console.log('[Firebase] Firebase initialized successfully');
    console.log('[Firebase] Database instance created:', !!window.firebaseDB);

    // Test database connection
    window.firebaseDB.ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val() === true) {
            console.log('[Firebase] Database connected successfully');
        } else {
            console.warn('[Firebase] Database not connected');
        }
    });

} catch (error) {
    console.error('[Firebase] Initialization error:', error);
    console.error('[Firebase] Error details:', error.message);

    // Show user-friendly error on page
    setTimeout(() => {
        const container = document.getElementById('postsContainer');
        if (container) {
            const isHTTP = window.location.protocol === 'http:';
            const httpsUrl = window.location.href.replace('http://', 'https://');

            let errorHTML = `
                <div class="loading-posts" style="text-align: center; padding: 2rem;">
                    <p style="color: #e74c3c; font-weight: bold; margin-bottom: 1rem;">Unable to load posts</p>
            `;

            if (isHTTP && window.location.hostname !== 'localhost') {
                errorHTML += `
                    <p style="color: #fff; margin-bottom: 1.5rem;">
                        This page is loaded over HTTP, but Firebase requires HTTPS on mobile devices.
                    </p>
                    <a href="${httpsUrl}"
                       style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px;
                              border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Switch to HTTPS
                    </a>
                `;
            } else {
                errorHTML += `
                    <p style="color: #999; font-size: 0.9rem; margin-bottom: 1rem;">
                        Error: ${error.message}
                    </p>
                    <button onclick="window.location.reload()"
                            style="background: #0066ff; color: white; padding: 12px 24px;
                                   border-radius: 8px; border: none; font-weight: bold; cursor: pointer;">
                        Refresh Page
                    </button>
                `;
            }

            errorHTML += `</div>`;
            container.innerHTML = errorHTML;
        }
    }, 1000);
}
