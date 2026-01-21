// ===================================
// ZanteLocals - Contact Page JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const formError = document.getElementById('form-error');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Show loading state
            const submitBtn = contactForm.querySelector('.form-submit');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="60" stroke-dashoffset="30"/>
                </svg>
                <span>Sending...</span>
            `;

            // Hide previous messages
            formSuccess.classList.remove('show');
            formError.classList.remove('show');

            try {
                // Simulate API call (replace with actual backend endpoint)
                await simulateFormSubmission(formData);

                // Show success message
                formSuccess.classList.add('show');

                // Reset form
                contactForm.reset();

                // Hide success message after 5 seconds
                setTimeout(() => {
                    formSuccess.classList.remove('show');
                }, 5000);

                // Track success (analytics)
                console.log('Form submitted successfully:', formData);

            } catch (error) {
                // Show error message
                formError.classList.add('show');
                console.error('Form submission error:', error);

                // Hide error message after 5 seconds
                setTimeout(() => {
                    formError.classList.remove('show');
                }, 5000);
            } finally {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Simulate form submission (replace with actual API call)
    function simulateFormSubmission(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve({ success: true, message: 'Form submitted successfully' });
                } else {
                    reject(new Error('Submission failed'));
                }
            }, 1500);
        });
    }

    // Real form submission example (uncomment and modify for your backend)
    /*
    async function submitForm(data) {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Form submission failed');
        }

        return response.json();
    }
    */

    // Form validation styling
    const formInputs = contactForm?.querySelectorAll('.form-input');
    formInputs?.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() === '' && input.hasAttribute('required')) {
                input.style.borderColor = '#FF6B6B';
            } else {
                input.style.borderColor = '';
            }
        });

        input.addEventListener('input', () => {
            if (input.style.borderColor === 'rgb(255, 107, 107)') {
                input.style.borderColor = '';
            }
        });
    });

    // Character counter for textarea
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        const counterDiv = document.createElement('div');
        counterDiv.className = 'character-counter';
        counterDiv.style.cssText = `
            text-align: right;
            font-size: 0.875rem;
            color: var(--medium-gray);
            margin-top: 0.25rem;
        `;
        messageTextarea.parentElement.appendChild(counterDiv);

        const maxLength = 500;

        messageTextarea.addEventListener('input', () => {
            const currentLength = messageTextarea.value.length;
            counterDiv.textContent = `${currentLength} / ${maxLength} characters`;

            if (currentLength > maxLength) {
                counterDiv.style.color = '#FF6B6B';
                messageTextarea.value = messageTextarea.value.slice(0, maxLength);
            } else if (currentLength > maxLength * 0.9) {
                counterDiv.style.color = '#FFB84D';
            } else {
                counterDiv.style.color = 'var(--medium-gray)';
            }
        });

        // Initial update
        messageTextarea.dispatchEvent(new Event('input'));
    }

    // Smooth scroll to form from CTA buttons
    const ctaButtons = document.querySelectorAll('a[href="#contact-form"]');
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            contactForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Focus first input
            setTimeout(() => {
                document.getElementById('name')?.focus();
            }, 500);
        });
    });

    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const email = emailInput.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (email && !emailRegex.test(email)) {
                emailInput.style.borderColor = '#FF6B6B';

                // Show error hint
                let errorHint = emailInput.parentElement.querySelector('.error-hint');
                if (!errorHint) {
                    errorHint = document.createElement('div');
                    errorHint.className = 'error-hint';
                    errorHint.style.cssText = `
                        color: #FF6B6B;
                        font-size: 0.875rem;
                        margin-top: 0.25rem;
                    `;
                    errorHint.textContent = 'Please enter a valid email address';
                    emailInput.parentElement.appendChild(errorHint);
                }
            } else {
                emailInput.style.borderColor = '';
                const errorHint = emailInput.parentElement.querySelector('.error-hint');
                if (errorHint) {
                    errorHint.remove();
                }
            }
        });
    }

    // Add animation to info cards on scroll
    const infoCards = document.querySelectorAll('.contact-info-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });

    infoCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Copy email to clipboard
    const emailElements = document.querySelectorAll('.info-text');
    emailElements.forEach(element => {
        if (element.textContent.includes('@')) {
            element.style.cursor = 'pointer';
            element.title = 'Click to copy email';

            element.addEventListener('click', () => {
                const email = element.textContent.trim();
                navigator.clipboard.writeText(email).then(() => {
                    // Show tooltip
                    const tooltip = document.createElement('div');
                    tooltip.textContent = 'Copied!';
                    tooltip.style.cssText = `
                        position: absolute;
                        background-color: var(--primary-green);
                        color: white;
                        padding: 0.5rem 1rem;
                        border-radius: var(--radius-md);
                        font-size: 0.875rem;
                        font-weight: 600;
                        z-index: 1000;
                        animation: fadeIn 0.3s ease;
                    `;

                    element.style.position = 'relative';
                    element.appendChild(tooltip);

                    setTimeout(() => {
                        tooltip.remove();
                    }, 2000);
                });
            });
        }
    });

    console.log('✅ Contact page initialized');
});

// Add spin animation for loading spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
