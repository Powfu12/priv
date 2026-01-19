// Blog Page JavaScript
let allPosts = [];

// Load posts when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
});

function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    const emptyState = document.getElementById('emptyState');

    if (!postsContainer) {
        console.error('Posts container not found');
        return;
    }

    // Check if Firebase is initialized
    if (!window.firebaseDB) {
        postsContainer.innerHTML = `
            <div class="loading-posts">
                <p style="color: #e74c3c;">Firebase is not configured</p>
            </div>
        `;
        return;
    }

    try {
        const postsRef = window.firebaseDB.ref('posts');

        postsRef.on('value', (snapshot) => {
            allPosts = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
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
        }, (error) => {
            console.error('Error loading posts:', error);
            postsContainer.innerHTML = `
                <div class="loading-posts">
                    <p style="color: #e74c3c;">Error loading posts</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error accessing Firebase:', error);
        postsContainer.innerHTML = `
            <div class="loading-posts">
                <p style="color: #e74c3c;">Error accessing Firebase</p>
            </div>
        `;
    }
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

        // Check if user has liked this post
        const hasLiked = hasUserLikedPost(post.id);
        const likedClass = hasLiked ? 'liked' : '';

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
                        <span>${formatNumber(likes)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    postsContainer.innerHTML = postsHTML;

    // Increment views for all posts (only once per session)
    allPosts.forEach(post => {
        incrementViewIfNeeded(post.id);
    });
}

function toggleLike(postId) {
    if (!window.firebaseDB) return;

    const hasLiked = hasUserLikedPost(postId);
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    const postRef = window.firebaseDB.ref(`posts/${postId}`);
    const currentLikes = post.likes || 0;

    if (hasLiked) {
        // Unlike
        postRef.update({ likes: Math.max(0, currentLikes - 1) });
        removeUserLike(postId);
    } else {
        // Like
        postRef.update({ likes: currentLikes + 1 });
        addUserLike(postId);
    }
}

function incrementViewIfNeeded(postId) {
    if (!window.firebaseDB) return;

    // Check if already viewed in this session
    const viewedPosts = getViewedPosts();
    if (viewedPosts.includes(postId)) return;

    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    const postRef = window.firebaseDB.ref(`posts/${postId}`);
    const currentViews = post.views || 0;

    postRef.update({ views: currentViews + 1 });
    addViewedPost(postId);
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
