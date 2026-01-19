/* =========================== FIREBASE INIT =========================== */
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
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

/* =========================== GLOBAL =========================== */
let selectedRating = 0;
let selectedPackage = '';
let hasAccessKey = false;

/* =========================== INIT =========================== */
document.addEventListener('DOMContentLoaded', () => {
    setupStarRating();
    setupPackageSelection();
    setupForm();
    setupCharacterCounter();
    setupAccessKeyDetection();
    loadReviews();
    loadReviewStats();
});

/* =========================== ACCESS KEY (/k) =========================== */
function setupAccessKeyDetection() {
    const textarea = document.getElementById('reviewContent');
    const submitBtn = document.getElementById('submitReview');

    submitBtn.disabled = true;
    hasAccessKey = false;

    textarea.addEventListener('input', function () {
        const content = this.value.trim();

        if (content.startsWith('/k ') && content.length > 3) {
            hasAccessKey = true;
        } else {
            hasAccessKey = false;
        }
        checkFormValidity();
    });
}

/* =========================== FORM VALIDATION =========================== */
function checkFormValidity() {
    const name = document.getElementById('reviewerName').value.trim();
    const content = document.getElementById('reviewContent').value.trim();
    const btn = document.getElementById('submitReview');

    if (hasAccessKey && name && selectedRating > 0 && selectedPackage && content.length > 3) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

/* =========================== CHAR COUNTER =========================== */
function setupCharacterCounter() {
    const textarea = document.getElementById('reviewContent');
    const charCount = document.getElementById('charCount');
    textarea.addEventListener('input', function () {
        const count = this.value.length;
        charCount.textContent = count;
    });
}

/* =========================== STAR RATING =========================== */
function setupStarRating() {
    const stars = document.querySelectorAll('.star-input');
    const ratingText = document.getElementById('ratingText');

    const texts = {
        1: '⭐ Poor - Not satisfied',
        2: '⭐⭐ Fair',
        3: '⭐⭐⭐ Good',
        4: '⭐⭐⭐⭐ Very Good',
        5: '⭐⭐⭐⭐⭐ Excellent!'
    };

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStarDisplay();
            ratingText.textContent = texts[selectedRating];
            ratingText.style.color = '#10b981';
            checkFormValidity();
        });

        star.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectedRating = index + 1;
            updateStarDisplay();
            ratingText.textContent = texts[selectedRating];
            ratingText.style.color = '#10b981';
            checkFormValidity();
        }, {passive: false});
    });
}

function updateStarDisplay() {
    const stars = document.querySelectorAll('.star-input');
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.add('active');
            star.style.color = '#FFD700';
        } else {
            star.classList.remove('active');
            star.style.color = 'rgba(255,255,255,.15)';
        }
    });
}

/* =========================== PACKAGES =========================== */
function setupPackageSelection() {
    const options = document.querySelectorAll('.package-option');
    options.forEach(opt => {
        opt.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedPackage = opt.dataset.package;
            checkFormValidity();
        });
        opt.addEventListener('touchstart', () => {
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedPackage = opt.dataset.package;
            checkFormValidity();
        }, {passive: true});
    });
}

/* =========================== FORM SUBMIT =========================== */
function setupForm() {
    const form = document.getElementById('customerReviewForm');
    const nameInput = document.getElementById('reviewerName');

    nameInput.addEventListener('input', checkFormValidity);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitReview();
    });
}

async function submitReview() {
    const btn = document.getElementById('submitReview');
    const original = btn.innerHTML;

    if (!validateForm()) return;

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> <span>Submitting...</span>';

    try {
        let reviewContent = document.getElementById('reviewContent').value.trim();
        if (reviewContent.startsWith('/k ')) {
            reviewContent = reviewContent.substring(3).trim();
        }

        const reviewData = {
            name: document.getElementById('reviewerName').value.trim(),
            rating: selectedRating,
            package: selectedPackage,
            content: reviewContent,
            timestamp: Date.now(),
            date: new Date().toISOString(),
            verified: true,
            helpful: 0,
            approved: true
        };

        const newRef = database.ref('reviews').push();
        await newRef.set(reviewData);

        showNotification('Review submitted successfully!', 'success');
        resetForm();
        loadReviews();
        loadReviewStats();
    } catch (err) {
        console.error(err);
        showNotification('Error submitting review. Please try again.', 'error');
    } finally {
        btn.innerHTML = original;
        btn.disabled = true;
    }
}

function validateForm() {
    const name = document.getElementById('reviewerName').value.trim();
    const content = document.getElementById('reviewContent').value.trim();

    if (!hasAccessKey) {
        showNotification('Access denied.', 'error');
        return false;
    }
    if (!name || name.length < 2) {
        showNotification('Please enter a valid name.', 'error');
        return false;
    }
    if (selectedRating === 0) {
        showNotification('Please select a rating.', 'error');
        return false;
    }
    if (!selectedPackage) {
        showNotification('Please select the package you purchased.', 'error');
        return false;
    }
    let cleanContent = content.startsWith('/k ') ? content.substring(3).trim() : content;
    if (!cleanContent || cleanContent.length < 10) {
        showNotification('Please write at least 10 characters for your review.', 'error');
        return false;
    }
    return true;
}

function resetForm() {
    document.getElementById('customerReviewForm').reset();
    selectedRating = 0;
    selectedPackage = '';
    hasAccessKey = false;
    updateStarDisplay();
    document.querySelectorAll('.package-option').forEach(o => o.classList.remove('selected'));
    document.getElementById('ratingText').textContent = 'Tap stars to rate your experience';
    document.getElementById('ratingText').style.color = 'rgba(255, 255, 255, 0.5)';
    document.getElementById('charCount').textContent = '0';
}

/* =========================== LOAD REVIEWS =========================== */
async function loadReviews() {
    const loading = document.getElementById('reviewsLoading');
    const list = document.getElementById('reviewsList');

    if (loading) loading.style.display = 'block';

    try {
        const ref = database.ref('reviews').orderByChild('timestamp');
        const snap = await ref.once('value');

        const reviews = [];
        snap.forEach(child => {
            const r = child.val();
            r.id = child.key;
            if (r.approved !== false) {
                reviews.unshift(r);
            }
        });

        displayReviews(reviews);
    } catch (err) {
        console.error(err);
        if (list) {
            list.innerHTML = '<div class="loading-state"><p style="color: #ef4444;">Error loading reviews</p></div>';
        }
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function displayReviews(reviews) {
    const list = document.getElementById('reviewsList');
    const loading = document.getElementById('reviewsLoading');

    if (!reviews || reviews.length === 0) {
        list.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-comments" style="font-size: 3rem; color: rgba(255, 255, 255, 0.2); margin-bottom: 1rem;"></i>
            <h3 style="color: #ffffff; margin-bottom: 0.5rem;">No reviews yet</h3>
            <p>Be the first to share your experience!</p>
        </div>`;
        return;
    }

    const html = reviews.map(r => createReviewCard(r)).join('');
    list.innerHTML = html + (loading ? loading.outerHTML : '');
}

function createReviewCard(review) {
    const date = new Date(review.timestamp).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const stars = Array.from({length: 5}, (_, i) =>
        `<i class="fas fa-star star" style="color:${i < review.rating ? '#FFD700' : 'rgba(255,255,255,0.1)'}"></i>`
    ).join('');

    const packageNames = {
        starter: '10M Package',
        premium: '20M Package',
        ultimate: '50M Package'
    };

    return `
    <div class="review-card">
        <div class="review-header">
            <div class="reviewer-info">
                <div class="reviewer-name">${escapeHtml(review.name)}</div>
                <div class="reviewer-package">${packageNames[review.package] || review.package}</div>
            </div>
            <div class="review-meta">
                <div class="review-rating">
                    ${stars}
                    <span style="margin-left: 6px; color: rgba(255,255,255,0.5); font-size: 0.875rem;">${review.rating}/5</span>
                </div>
                <div class="review-date">${date}</div>
            </div>
        </div>
        <div class="review-content">
            ${escapeHtml(review.content)}
        </div>
        <div class="review-footer">
            ${review.verified ? `
            <div class="verified-badge">
                <i class="fas fa-check-circle"></i>
                Verified Purchase
            </div>` : ''}
            <div class="helpful-section">
                <button class="helpful-btn" onclick="markHelpful('${review.id}')">
                    <i class="fas fa-thumbs-up"></i> Helpful (${review.helpful || 0})
                </button>
            </div>
        </div>
    </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function markHelpful(id) {
    try {
        const ref = database.ref('reviews/' + id + '/helpful');
        const snap = await ref.once('value');
        const current = snap.val() || 0;
        await ref.set(current + 1);
        loadReviews();
        showNotification('Thank you for your feedback!', 'success');
    } catch (err) {
        console.error(err);
        showNotification('Error updating helpful count.', 'error');
    }
}

/* =========================== STATS =========================== */
async function loadReviewStats() {
    try {
        const ref = database.ref('reviews');
        const snap = await ref.once('value');
        const arr = [];
        snap.forEach(c => {
            const v = c.val();
            if (v.approved !== false) arr.push(v);
        });
        updateReviewStats(arr);
    } catch (err) {
        console.error(err);
    }
}

function updateReviewStats(reviews) {
    if (!reviews || reviews.length === 0) return;

    const total = reviews.length;
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    const avg = (sum / total).toFixed(1);

    document.getElementById('totalCustomers').textContent = Math.max(total, (total * 3.36).toFixed(0));
    document.getElementById('averageScore').textContent = avg;
    document.getElementById('overallRating').textContent = avg;
    document.getElementById('reviewCount').textContent = total;

    const counts = {1:0,2:0,3:0,4:0,5:0};
    reviews.forEach(r => {
        counts[r.rating] = (counts[r.rating] || 0) + 1;
    });

    // Update bars - order is 5,4,3,2,1 in HTML
    const order = [5,4,3,2,1];
    order.forEach((star, idx) => {
        const c = counts[star] || 0;
        const pct = total > 0 ? (c / total) * 100 : 0;
        const barId = `bar${star}`;
        const countId = `count${star}`;

        const barEl = document.getElementById(barId);
        const countEl = document.getElementById(countId);

        if (barEl) barEl.style.width = pct + '%';
        if (countEl) countEl.textContent = c;
    });

    updateOverallStars(avg);
}

function updateOverallStars(rating) {
    const stars = document.querySelectorAll('#overallStars .star');
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    stars.forEach((s, i) => {
        if (i < full) {
            s.style.color = '#FFD700';
            s.style.opacity = '1';
        } else if (i === full && half) {
            s.style.color = '#FFD700';
            s.style.opacity = '.6';
        } else {
            s.style.color = 'rgba(255,255,255,0.2)';
            s.style.opacity = '1';
        }
    });
}

/* =========================== NOTIFICATION =========================== */
function showNotification(msg, type='success') {
    const box = document.getElementById('notification');
    const content = document.getElementById('notificationContent');
    if (!box) return;
    content.textContent = msg;
    box.className = 'notification ' + type;
    box.classList.add('show');
    setTimeout(() => box.classList.remove('show'), 4500);
}
