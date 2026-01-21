// Blog Script
// Uses the global window.firebaseBlogsDB initialized in firebase-config.js
// DO NOT declare firebaseConfig here - it's already initialized!

let allBlogPosts = [];

// Load blog posts when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadBlogPosts();
});

function loadBlogPosts() {
    const blogContainer = document.getElementById('blogContainer');

    if (!blogContainer) {
        console.error('Blog container element not found');
        return;
    }

    // Check if Firebase blogs database is initialized
    if (!window.firebaseBlogsDB) {
        blogContainer.innerHTML = '<div class="no-posts">Blog database is not configured.</div>';
        console.error('Firebase blogs database not initialized. Make sure firebase-config.js is loaded.');
        return;
    }

    try {
        // Load blog posts from Firebase blogs database
        const blogsRef = window.firebaseBlogsDB.ref('blogs');

        blogsRef.orderByChild('published').equalTo(true).once('value')
            .then((snapshot) => {
                allBlogPosts = [];

                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const post = childSnapshot.val();
                        post.id = childSnapshot.key;
                        allBlogPosts.push(post);
                    });

                    // Sort by timestamp (newest first)
                    allBlogPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                }

                displayBlogPosts();
            })
            .catch((error) => {
                console.error('Error loading blog posts:', error);
                blogContainer.innerHTML = '<div class="no-posts">Error loading blog posts. Please try again later.</div>';
            });
    } catch (error) {
        console.error('Error accessing Firebase:', error);
        blogContainer.innerHTML = '<div class="no-posts">Error accessing blog database.</div>';
    }
}

function displayBlogPosts() {
    const blogContainer = document.getElementById('blogContainer');

    if (!blogContainer) {
        console.error('Blog container element not found');
        return;
    }

    if (allBlogPosts.length === 0) {
        blogContainer.innerHTML = '<div class="no-posts">No blog posts available yet. Check back soon!</div>';
        return;
    }

    // Create blog grid
    let html = '<div class="blog-grid">';

    allBlogPosts.forEach(post => {
        const date = new Date(post.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Create excerpt (first 150 characters)
        const excerpt = post.content.length > 150
            ? post.content.substring(0, 150) + '...'
            : post.content;

        html += `
            <div class="blog-card" onclick="viewBlogPost('${post.id}')">
                <div class="blog-card-content">
                    <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
                    <p class="blog-card-excerpt">${escapeHtml(excerpt)}</p>
                    <div class="blog-card-meta">
                        <span class="blog-card-author">By ${escapeHtml(post.author || 'PRIMEURO Team')}</span>
                        <span class="blog-card-date">${date}</span>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    blogContainer.innerHTML = html;
}

function viewBlogPost(postId) {
    // For now, just log the post ID
    // You can create a blog-post.html page to show full post details
    console.log('Viewing blog post:', postId);
    alert('Full blog post view coming soon! Post ID: ' + postId);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally accessible
window.viewBlogPost = viewBlogPost;
