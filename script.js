// ==================== //
// PRIMEURO - Main JavaScript
// ==================== //

// ==================== //
// LOADING SCREEN
// ==================== //

// Track when page started loading
const pageLoadStart = Date.now();

// Minimum time to show loading screen (in milliseconds)
const MIN_LOADING_TIME = 2000; // 2 seconds

window.addEventListener('load', () => {
    const loadingScreen = document.querySelector('.loading-screen');

    // Calculate how long the page took to load
    const loadTime = Date.now() - pageLoadStart;

    // Calculate remaining time to show loading screen
    const remainingTime = Math.max(MIN_LOADING_TIME - loadTime, 0);

    console.log('Page loaded in', loadTime, 'ms');
    console.log('Showing loading screen for additional', remainingTime, 'ms');

    // Wait for remaining time, then fade out
    setTimeout(() => {
        console.log('Starting fade out');
        document.body.classList.add('loaded');
        document.body.style.overflow = ''; // Re-enable scrolling

        // Remove loading screen from DOM after transition completes
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.remove();
                console.log('Loading screen removed');
            }
        }, 1000);
    }, remainingTime);
});

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initNavbar();
    initFAQ();
    initMobileMenu();
    initScrollAnimations();
});

// ==================== //
// NAVBAR FUNCTIONALITY
// ==================== //
function initNavbar() {
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });
}

// ==================== //
// MOBILE MENU
// ==================== //
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }
}

// ==================== //
// FAQ ACCORDION
// ==================== //
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Close other open items
            const wasActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            if (wasActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
}

// ==================== //
// SCROLL ANIMATIONS
// ==================== //
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.service-card, .faq-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ==================== //
// UTILITY FUNCTIONS
// ==================== //

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add floating scroll-to-top button (optional enhancement)
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;

    // You can add a scroll-to-top button here if needed
    // Example: show button when scrolled > 500px
});

// ==================== //
// PERFORMANCE OPTIMIZATION
// ==================== //

// Debounce function for scroll events
function debounce(func, wait = 10, immediate = true) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Optimize scroll event listeners
const optimizedScroll = debounce(() => {
    // Any additional scroll-based functionality can go here
});

window.addEventListener('scroll', optimizedScroll);

// ==================== //
// PRELOADER (Optional)
// ==================== //
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Add any additional load animations here
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '1';
    }
});

// ==================== //
// EASTER EGGS & ENHANCEMENTS
// ==================== //

// Console message
console.log('%c Welcome to PRIMEURO ', 'background: #0066ff; color: #fff; padding: 10px 20px; font-size: 20px; font-weight: bold;');
console.log('%c Your Premier In-Game Service Provider ', 'background: #000; color: #ffd700; padding: 5px 20px; font-size: 14px;');

// Konami code easter egg (optional fun addition)
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    // Fun easter egg - make all stars gold temporarily
    const stars = document.querySelectorAll('.logo-stars, .logo-stars-large');
    stars.forEach(star => {
        star.style.animation = 'none';
        star.style.transform = 'scale(1.5) rotate(360deg)';
        star.style.transition = 'all 1s ease';

        setTimeout(() => {
            star.style.animation = '';
            star.style.transform = '';
        }, 2000);
    });

    console.log('%c 🎮 PRIMEURO POWER ACTIVATED! 🎮 ', 'background: #ffd700; color: #000; padding: 10px; font-size: 16px; font-weight: bold;');
}

// ==================== //
// FORM VALIDATION (if you add a contact form later)
// ==================== //
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ==================== //
// LOCAL STORAGE (for user preferences)
// ==================== //
function saveUserPreference(key, value) {
    try {
        localStorage.setItem(`primeuro_${key}`, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

function getUserPreference(key) {
    try {
        const value = localStorage.getItem(`primeuro_${key}`);
        return value ? JSON.parse(value) : null;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
}

// ==================== //
// ANALYTICS TRACKING (placeholder)
// ==================== //
function trackEvent(category, action, label) {
    // Placeholder for analytics tracking
    // Replace with your analytics service (Google Analytics, Mixpanel, etc.)
    console.log(`Event tracked: ${category} - ${action} - ${label}`);
}

// Track button clicks
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const buttonText = button.textContent.trim();
        trackEvent('Button', 'Click', buttonText);
    });
});

// ==================== //
// ACCESSIBILITY ENHANCEMENTS
// ==================== //

// Skip to main content
const skipLink = document.createElement('a');
skipLink.href = '#home';
skipLink.className = 'skip-to-main';
skipLink.textContent = 'Skip to main content';
skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primary-blue);
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
`;
skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
});
skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

// Keyboard navigation focus indicators
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});