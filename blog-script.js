// Blog Page JavaScript - Production Ready
let allPosts = [];
let hasLoadedOnce = false;

// Load posts when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeBlog();
});

async function initializeBlog() {
    // Wait for Firebase to be ready
    if (!window.firebaseDB) {
        let attempts = 0;
        const maxAttempts = 20;

        while (!window.firebaseDB && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        if (!window.firebaseDB) {
            showError('Firebase failed to initialize. Please refresh the page.');
            return;
        }
    }

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

            // Increment views ONCE, AFTER display, with debouncing
            if (!hasLoadedOnce) {
                hasLoadedOnce = true;
                // Wait 2 seconds after page load to increment views
                // This ensures the user actually viewed the page
                setTimeout(() => {
                    incrementViewsOnce();
                }, 2000);
            }
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

// Increment views ONCE for all posts in a single batch operation
function incrementViewsOnce() {
    if (!window.firebaseDB) return;

    const viewedPosts = getViewedPosts();
    const updates = {};

    allPosts.forEach(post => {
        if (!viewedPosts.includes(post.id)) {
            const currentViews = post.views || 0;
            updates[`posts/${post.id}/views`] = currentViews + 1;
            addViewedPost(post.id);
        }
    });

    // Single batch update - more efficient and no listener triggers
    if (Object.keys(updates).length > 0) {
        window.firebaseDB.ref().update(updates).catch(err => {
            console.error('Error updating views:', err);
        });
    }
}

// Like toggle - separate operation, doesn't trigger main load
function toggleLike(postId) {
    if (!window.firebaseDB) return;

    const hasLiked = hasUserLikedPost(postId);
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    const currentLikes = post.likes || 0;
    const newLikes = hasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    // Update local state immediately for instant UI feedback
    post.likes = newLikes;
    const likeCountEl = document.getElementById(`like-count-${postId}`);
    if (likeCountEl) {
        likeCountEl.textContent = formatNumber(newLikes);
    }

    // Update Firebase in background
    window.firebaseDB.ref(`posts/${postId}/likes`).set(newLikes).catch(err => {
        console.error('Error updating likes:', err);
        // Revert on error
        post.likes = currentLikes;
        if (likeCountEl) {
            likeCountEl.textContent = formatNumber(currentLikes);
        }
    });

    // Update local storage
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

// Local storage helpers for likes
function hasUserLikedPost(postId) {
    const likes = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    return likes.includes(postId);
}

function addUserLike(postId) {
    const likes = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (!likes.includes(postId)) {
        likes.push(postId);
        localStorage.setItem('likedPosts', JSON.stringify(likes));
    }
}

function removeUserLike(postId) {
    const likes = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const filtered = likes.filter(id => id !== postId);
    localStorage.setItem('likedPosts', JSON.stringify(filtered));
}

// Session storage helpers for views
function getViewedPosts() {
    return JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
}

function addViewedPost(postId) {
    const viewed = getViewedPosts();
    if (!viewed.includes(postId)) {
        viewed.push(postId);
        sessionStorage.setItem('viewedPosts', JSON.stringify(viewed));
    }
}

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
