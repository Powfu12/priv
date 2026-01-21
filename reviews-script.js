// Reviews Script
// Uses the global window.firebaseBlogsDB initialized in firebase-config.js
// DO NOT declare firebaseConfig here - it's already initialized!

let allReviews = [];

// Load reviews when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadReviews();
    setupReviewForm();
});

function loadReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');

    if (!reviewsContainer) {
        console.error('Reviews container element not found');
        return;
    }

    // Check if Firebase blogs database is initialized
    if (!window.firebaseBlogsDB) {
        reviewsContainer.innerHTML = '<div class="no-reviews">Reviews database is not configured.</div>';
        console.error('Firebase blogs database not initialized. Make sure firebase-config.js is loaded.');
        return;
    }

    try {
        // Load approved reviews from Firebase blogs database
        const reviewsRef = window.firebaseBlogsDB.ref('reviews');

        reviewsRef.orderByChild('approved').equalTo(true).once('value')
            .then((snapshot) => {
                allReviews = [];

                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const review = childSnapshot.val();
                        review.id = childSnapshot.key;
                        allReviews.push(review);
                    });

                    // Sort by timestamp (newest first)
                    allReviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                }

                displayReviews();
                updateStats();
            })
            .catch((error) => {
                console.error('Error loading reviews:', error);
                reviewsContainer.innerHTML = '<div class="no-reviews">Error loading reviews. Please try again later.</div>';
            });
    } catch (error) {
        console.error('Error accessing Firebase:', error);
        reviewsContainer.innerHTML = '<div class="no-reviews">Error accessing reviews database.</div>';
    }
}

function displayReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');

    if (!reviewsContainer) {
        console.error('Reviews container element not found');
        return;
    }

    if (allReviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to leave a review!</div>';
        return;
    }

    // Create reviews list
    let html = '<div class="reviews-list">';

    allReviews.forEach(review => {
        const date = new Date(review.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const stars = '⭐'.repeat(review.rating);

        html += `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-author">${escapeHtml(review.customerName)}</div>
                    <div class="review-rating">${stars}</div>
                </div>
                <div class="review-date">${date}</div>
                <div class="review-comment">${escapeHtml(review.comment)}</div>
                ${review.orderCode ? `<div class="review-order-code">Order: ${escapeHtml(review.orderCode)}</div>` : ''}
            </div>
        `;
    });

    html += '</div>';
    reviewsContainer.innerHTML = html;
}

function updateStats() {
    const totalReviewsEl = document.getElementById('totalReviews');
    const averageRatingEl = document.getElementById('averageRating');

    if (!totalReviewsEl || !averageRatingEl) return;

    const totalReviews = allReviews.length;
    totalReviewsEl.textContent = totalReviews;

    if (totalReviews > 0) {
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / totalReviews).toFixed(1);
        averageRatingEl.textContent = averageRating;
    } else {
        averageRatingEl.textContent = '0.0';
    }
}

function setupReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;

    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitReview();
    });
}

function submitReview() {
    const submitMessageEl = document.getElementById('submitMessage');

    // Check if Firebase blogs database is initialized
    if (!window.firebaseBlogsDB) {
        submitMessageEl.innerHTML = '<div class="error-message">Database not configured. Please try again later.</div>';
        return;
    }

    // Get form values
    const customerName = document.getElementById('reviewName').value.trim();
    const orderCode = document.getElementById('reviewOrderCode').value.trim();
    const rating = parseInt(document.getElementById('reviewRating').value);
    const comment = document.getElementById('reviewComment').value.trim();

    // Validate
    if (!customerName || !rating || !comment) {
        alert('Please fill in all required fields');
        return;
    }

    if (comment.length < 10) {
        alert('Review must be at least 10 characters long');
        return;
    }

    // Create review object
    const reviewData = {
        customerName: customerName,
        orderCode: orderCode || null,
        rating: rating,
        comment: comment,
        timestamp: new Date().toISOString(),
        approved: false // Reviews need admin approval
    };

    // Save to Firebase
    const reviewsRef = window.firebaseBlogsDB.ref('reviews');
    const newReviewRef = reviewsRef.push();

    newReviewRef.set(reviewData)
        .then(() => {
            // Show success message
            submitMessageEl.innerHTML = '<div class="success-message">Thank you for your review! It will be published after admin approval.</div>';

            // Reset form
            document.getElementById('reviewForm').reset();

            // Scroll to success message
            submitMessageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Clear success message after 5 seconds
            setTimeout(() => {
                submitMessageEl.innerHTML = '';
            }, 5000);
        })
        .catch((error) => {
            console.error('Error submitting review:', error);
            alert('Error submitting review. Please try again.');
        });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
