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
// Mobile-safe storage wrapper with fallbacks for iOS Safari private mode
const SafeStorage = {
    // Check if storage is available
    isAvailable(type) {
        try {
            const storage = window[type];
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    },

    // In-memory fallback storage for when localStorage/sessionStorage fail
    memoryStorage: {
        local: {},
        session: {}
    },

    // Get item with fallback
    getItem(type, key) {
        try {
            if (this.isAvailable(type + 'Storage')) {
                return window[type + 'Storage'].getItem(key);
            }
        } catch (e) {
            console.warn(`${type}Storage.getItem failed:`, e);
        }
        // Fallback to in-memory storage
        return this.memoryStorage[type][key] || null;
    },

    // Set item with fallback
    setItem(type, key, value) {
        try {
            if (this.isAvailable(type + 'Storage')) {
                window[type + 'Storage'].setItem(key, value);
                return true;
            }
        } catch (e) {
            console.warn(`${type}Storage.setItem failed:`, e);
        }
        // Fallback to in-memory storage
        this.memoryStorage[type][key] = value;
        return false;
    },

    // Remove item with fallback
    removeItem(type, key) {
        try {
            if (this.isAvailable(type + 'Storage')) {
                window[type + 'Storage'].removeItem(key);
                return true;
            }
        } catch (e) {
            console.warn(`${type}Storage.removeItem failed:`, e);
        }
        // Fallback to in-memory storage
        delete this.memoryStorage[type][key];
        return false;
    }
};

// Blog Page JavaScript - Production Ready
let allPosts = [];
let hasLoadedOnce = false;

// Load posts when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeBlog();
});

async function initializeBlog() {
    console.log('[Blog] Initializing blog...');

    // Check if we're on HTTP (problematic on mobile)
    const isHTTP = window.location.protocol === 'http:';
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';

    if (isHTTP && !isLocalhost) {
        console.error('[Blog] Page loaded over HTTP. Firebase may not work on mobile.');
        const httpsUrl = window.location.href.replace('http://', 'https://');
        showError(`
            <p style="margin-bottom: 1rem;">This page requires HTTPS to load posts on mobile devices.</p>
            <a href="${httpsUrl}"
               style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; font-weight: bold;">
                Switch to HTTPS
            </a>
        `);
        return;
    }

    // Wait for Firebase to be ready
    if (!window.firebaseDB) {
        console.log('[Blog] Waiting for Firebase to initialize...');
        let attempts = 0;
        const maxAttempts = 20;

        while (!window.firebaseDB && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
            console.log(`[Blog] Waiting for Firebase... attempt ${attempts}/${maxAttempts}`);
        }

        if (!window.firebaseDB) {
            console.error('[Blog] Firebase failed to initialize after', maxAttempts, 'attempts');
            showError('Unable to connect to the server. Please check your connection and refresh the page.');
            return;
        }
    }

    console.log('[Blog] Firebase ready, loading posts...');
    loadPosts();
}

function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');

    if (!postsContainer || !window.firebaseDB) {
        showError('Unable to load posts. Please refresh the page.');
        return;
    }

    // Use .once() to fetch data ONCE - no persistent listener
    window.firebaseDB.ref('posts').once('value')
        .then(snapshot => {
            allPosts = [];

            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const post = childSnapshot.val();
                    post.id = childSnapshot.key;

                    // Only show published posts
                    if (post.published !== false) {
                        allPosts.push(post);
                    }
                });

                // Sort by timestamp (newest first)
                allPosts.sort((a, b) => {
                    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return timeB - timeA;
                });
            }

            displayPosts();

            // Views and likes are cosmetic only - admin controls actual values
            hasLoadedOnce = true;
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            showError('Error loading posts. Please refresh the page.');
        });
}

function displayPosts() {
    const postsContainer = document.getElementById('postsContainer');
    const emptyState = document.getElementById('emptyState');

    if (!postsContainer) return;

    if (allPosts.length === 0) {
        postsContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    postsContainer.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';

    const postsHTML = allPosts.map(post => {
        const title = post.title || '';
        const content = post.content || '';
        const views = post.views || 0;
        const likes = post.likes || 0;
        const timestamp = post.timestamp ? formatPostDate(post.timestamp) : 'Just now';

        const hasLiked = hasUserLikedPost(post.id);
        const likedClass = hasLiked ? 'liked' : '';
        const imageHtml = post.imageUrl ? `<img src="${post.imageUrl}" alt="" class="post-image">` : '';

        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-avatar">
                        <svg fill="currentColor" viewBox="0 0 16 16">
                            <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2zm3.5 1a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 2.5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 2.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5z"/>
                        </svg>
                    </div>
                    <div class="post-meta">
                        <div class="post-author">PRIMEURO</div>
                        <div class="post-date">${timestamp}</div>
                    </div>
                </div>
                ${title ? `<h2 class="post-title">${escapeHtml(title)}</h2>` : ''}
                <div class="post-content">${escapeHtml(content)}</div>
                ${imageHtml}
                <div class="post-footer">
                    <div class="post-stat">
                        <svg fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                        </svg>
                        <span>${formatNumber(views)}</span>
                    </div>
                    <div class="post-stat ${likedClass}" onclick="toggleLike('${post.id}')">
                        <svg fill="currentColor" viewBox="0 0 16 16">
                            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                        </svg>
                        <span id="like-count-${post.id}">${formatNumber(likes)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    postsContainer.innerHTML = postsHTML;
}

// Views are cosmetic only - display what admin sets, no tracking

// Like toggle - COSMETIC ONLY (visual feedback, no Firebase sync)
function toggleLike(postId) {
    const hasLiked = hasUserLikedPost(postId);
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    const currentLikes = post.likes || 0;
    const newLikes = hasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    // Update local display only - NOT synced to Firebase
    post.likes = newLikes;
    const likeCountEl = document.getElementById(`like-count-${postId}`);
    if (likeCountEl) {
        likeCountEl.textContent = formatNumber(newLikes);
    }

    // Update localStorage for visual persistence only
    if (hasLiked) {
        removeUserLike(postId);
    } else {
        addUserLike(postId);
    }

    // Update heart icon
    const statEl = document.querySelector(`[onclick="toggleLike('${postId}')"]`);
    if (statEl) {
        if (hasLiked) {
            statEl.classList.remove('liked');
        } else {
            statEl.classList.add('liked');
        }
    }
}

// Mobile-safe local storage helpers for likes
function hasUserLikedPost(postId) {
    try {
        const data = SafeStorage.getItem('local', 'likedPosts');
        const likes = data ? JSON.parse(data) : [];
        return likes.includes(postId);
    } catch (e) {
        console.warn('Error reading liked posts:', e);
        return false; // Safe fallback
    }
}

function addUserLike(postId) {
    try {
        const data = SafeStorage.getItem('local', 'likedPosts');
        const likes = data ? JSON.parse(data) : [];
        if (!likes.includes(postId)) {
            likes.push(postId);
            SafeStorage.setItem('local', 'likedPosts', JSON.stringify(likes));
        }
    } catch (e) {
        console.warn('Error adding like:', e);
        // Fail silently - like functionality is not critical
    }
}

function removeUserLike(postId) {
    try {
        const data = SafeStorage.getItem('local', 'likedPosts');
        const likes = data ? JSON.parse(data) : [];
        const filtered = likes.filter(id => id !== postId);
        SafeStorage.setItem('local', 'likedPosts', JSON.stringify(filtered));
    } catch (e) {
        console.warn('Error removing like:', e);
        // Fail silently - like functionality is not critical
    }
}

// Views are cosmetic only - no tracking needed

// Utility functions
function formatPostDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showError(message) {
    const postsContainer = document.getElementById('postsContainer');
    if (postsContainer) {
        postsContainer.innerHTML = `
            <div class="loading-posts">
                <p style="color: #e74c3c;">${message}</p>
            </div>
        `;
    }
}