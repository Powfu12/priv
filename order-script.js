// Order Form JavaScript - Enhanced with Validation
let currentStep = 1;
const totalSteps = 5;

// Package prices
const packagePrices = {
    '10m': { name: '10M Package', price: 79.86 },
    '20m': { name: '20M Package', price: 149.86 },
    '50m': { name: '50M Package', price: 299.86 }
};

// Delivery prices
const deliveryPrices = {
    'standard': 11.70,
    'express': 15.99
};

// Validation patterns
const validationPatterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\d\s\+\-\(\)]+$/,
    telegram: /^@[a-zA-Z0-9_]{5,32}$/,
    name: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
    address: /^[a-zA-Z0-9À-ÿ\s,.'#-]{3,100}$/,
    city: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
    postalCode: /^[a-zA-Z0-9\s-]{3,10}$/,
    country: /^[a-zA-ZÀ-ÿ\s]{2,50}$/
};

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    updateOrderSummary();
    setupRealTimeValidation();

    // Package selection
    document.querySelectorAll('.package-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.package-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            updateOrderSummary();
        });
    });

    // Delivery method selection
    document.querySelectorAll('input[name="deliveryMethod"]').forEach(input => {
        input.addEventListener('change', function() {
            document.querySelectorAll('input[name="deliveryMethod"]').forEach(radio => {
                radio.closest('.radio-option').classList.remove('selected');
            });
            this.closest('.radio-option').classList.add('selected');
            updateOrderSummary();
        });
    });

    // Delivery type selection
    document.querySelectorAll('input[name="deliveryType"]').forEach(input => {
        input.addEventListener('change', function() {
            document.querySelectorAll('input[name="deliveryType"]').forEach(radio => {
                radio.closest('.radio-option').classList.remove('selected');
            });
            this.closest('.radio-option').classList.add('selected');
        });
    });

    // Payment method selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
});

function initializeForm() {
    showStep(1);
}

function setupRealTimeValidation() {
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateField(this, validationPatterns.email, 'Please enter a valid email address (e.g., name@example.com)');
        });
        emailInput.addEventListener('input', function() {
            clearFieldError(this);
        });
    }

    // Phone validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            // Only allow numbers, spaces, +, -, (, )
            this.value = this.value.replace(/[^\d\s\+\-\(\)]/g, '');
            clearFieldError(this);
        });
        phoneInput.addEventListener('blur', function() {
            if (this.value.trim() && !validationPatterns.phone.test(this.value)) {
                showFieldError(this, 'Please enter a valid phone number with only numbers');
            }
        });
    }

    // Telegram validation
    const telegramInput = document.getElementById('telegram');
    if (telegramInput) {
        telegramInput.addEventListener('input', function() {
            // Auto-add @ if user starts typing without it
            if (this.value && !this.value.startsWith('@')) {
                this.value = '@' + this.value;
            }
            clearFieldError(this);
        });
        telegramInput.addEventListener('blur', function() {
            validateField(this, validationPatterns.telegram, 'Telegram username must start with @ and be 5-32 characters (e.g., @username)');
        });
    }

    // Name validation
    const nameInput = document.getElementById('fullName');
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            // Only allow letters, spaces, hyphens, apostrophes
            this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '');
            clearFieldError(this);
        });
        nameInput.addEventListener('blur', function() {
            validateField(this, validationPatterns.name, 'Please enter a valid full name (2-50 characters, letters only)');
        });
    }

    // Address validation
    const addressInput = document.getElementById('streetAddress');
    if (addressInput) {
        addressInput.addEventListener('blur', function() {
            validateField(this, validationPatterns.address, 'Please enter a valid street address');
        });
        addressInput.addEventListener('input', function() {
            clearFieldError(this);
        });
    }

    // City validation
    const cityInput = document.getElementById('city');
    if (cityInput) {
        cityInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '');
            clearFieldError(this);
        });
        cityInput.addEventListener('blur', function() {
            validateField(this, validationPatterns.city, 'Please enter a valid city name');
        });
    }

    // Postal code validation
    const postalInput = document.getElementById('postalCode');
    if (postalInput) {
        postalInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-Z0-9\s-]/g, '').toUpperCase();
            clearFieldError(this);
        });
        postalInput.addEventListener('blur', function() {
            validateField(this, validationPatterns.postalCode, 'Please enter a valid postal code');
        });
    }

    // Country validation
    const countryInput = document.getElementById('country');
    if (countryInput) {
        countryInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
            clearFieldError(this);
        });
        countryInput.addEventListener('blur', function() {
            validateField(this, validationPatterns.country, 'Please enter a valid country name');
        });
    }
}

function validateField(input, pattern, errorMessage) {
    const value = input.value.trim();

    if (!value) {
        showFieldError(input, 'This field is required');
        return false;
    }

    if (!pattern.test(value)) {
        showFieldError(input, errorMessage);
        return false;
    }

    showFieldSuccess(input);
    return true;
}

function showFieldError(input, message) {
    clearFieldError(input);

    input.style.borderColor = '#ff4444';
    input.style.boxShadow = '0 0 0 3px rgba(255, 68, 68, 0.1)';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ff4444';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.5rem';
    errorDiv.style.display = 'flex';
    errorDiv.style.alignItems = 'center';
    errorDiv.style.gap = '0.5rem';

    const icon = document.createElement('span');
    icon.textContent = '⚠️';
    errorDiv.insertBefore(icon, errorDiv.firstChild);

    input.parentElement.appendChild(errorDiv);
}

function showFieldSuccess(input) {
    clearFieldError(input);
    input.style.borderColor = '#10b981';
    input.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';

    setTimeout(() => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
    }, 1000);
}

function clearFieldError(input) {
    input.style.borderColor = '';
    input.style.boxShadow = '';

    const existingError = input.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(formStep => {
        formStep.classList.remove('active');
    });

    // Show current step
    const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentFormStep) {
        currentFormStep.classList.add('active');
    }

    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((progressStep, index) => {
        const stepNumber = index + 1;
        if (stepNumber < step) {
            progressStep.classList.add('completed');
            progressStep.classList.remove('active');
        } else if (stepNumber === step) {
            progressStep.classList.add('active');
            progressStep.classList.remove('completed');
        } else {
            progressStep.classList.remove('active', 'completed');
        }
    });

    // Update progress lines
    document.querySelectorAll('.progress-line').forEach((line, index) => {
        if (index < step - 1) {
            line.classList.add('completed');
        } else {
            line.classList.remove('completed');
        }
    });

    currentStep = step;

    // Scroll smoothly to the top of the form section
    const orderSection = document.querySelector('.order-section');
    if (orderSection) {
        const yOffset = -100;
        const y = orderSection.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });
    }
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function validateCurrentStep() {
    const currentFormStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (!currentFormStep) return true;

    const inputs = currentFormStep.querySelectorAll('input[required], select[required]');
    let isValid = true;
    let firstInvalidInput = null;
    let errors = [];

    inputs.forEach(input => {
        clearFieldError(input);

        const value = input.value.trim();
        const fieldName = input.getAttribute('name') || input.id;
        let fieldValid = true;
        let errorMessage = '';

        // Check if empty
        if (!value) {
            fieldValid = false;
            errorMessage = 'This field is required';
        } else {
            // Validate based on field type
            switch(fieldName) {
                case 'email':
                    if (!validationPatterns.email.test(value)) {
                        fieldValid = false;
                        errorMessage = 'Please enter a valid email (e.g., name@example.com)';
                    }
                    break;
                case 'phone':
                    if (!validationPatterns.phone.test(value) || value.replace(/\D/g, '').length < 6) {
                        fieldValid = false;
                        errorMessage = 'Please enter a valid phone number (minimum 6 digits)';
                    }
                    break;
                case 'telegram':
                    if (!validationPatterns.telegram.test(value)) {
                        fieldValid = false;
                        errorMessage = 'Telegram must start with @ and be 5-32 characters (e.g., @username)';
                    }
                    break;
                case 'fullName':
                    if (!validationPatterns.name.test(value)) {
                        fieldValid = false;
                        errorMessage = 'Please enter a valid name (2-50 characters, letters only)';
                    }
                    break;
                case 'streetAddress':
                    if (!validationPatterns.address.test(value)) {
                        fieldValid = false;
                        errorMessage = 'Please enter a valid address';
                    }
                    break;
                case 'city':
                    if (!validationPatterns.city.test(value)) {
                        fieldValid = false;
                        errorMessage = 'Please enter a valid city name';
                    }
                    break;
                case 'postalCode':
                    if (!validationPatterns.postalCode.test(value)) {
                        fieldValid = false;
                        errorMessage = 'Please enter a valid postal code';
                    }
                    break;
                case 'country':
                    if (!validationPatterns.country.test(value)) {
                        fieldValid = false;
                        errorMessage = 'Please enter a valid country name';
                    }
                    break;
            }
        }

        if (!fieldValid) {
            isValid = false;
            showFieldError(input, errorMessage);
            errors.push(errorMessage);

            if (!firstInvalidInput) {
                firstInvalidInput = input;
            }
        }
    });

    if (!isValid) {
        // Focus on first invalid input and scroll to it
        if (firstInvalidInput) {
            firstInvalidInput.focus();
            firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return isValid;
}

function updateOrderSummary() {
    // Get selected package
    const selectedPackage = document.querySelector('input[name="package"]:checked');
    const packageValue = selectedPackage ? selectedPackage.value : '10m';
    const packageInfo = packagePrices[packageValue];

    if (!packageInfo) {
        console.error('Invalid package selected:', packageValue);
        return;
    }

    // Get selected delivery method
    const selectedDelivery = document.querySelector('input[name="deliveryMethod"]:checked');
    const deliveryValue = selectedDelivery ? selectedDelivery.value : 'standard';
    const deliveryPrice = deliveryPrices[deliveryValue];

    if (deliveryPrice === undefined) {
        console.error('Invalid delivery method selected:', deliveryValue);
        return;
    }

    // Update summary
    const summaryPackage = document.getElementById('summaryPackage');
    const summaryAmount = document.getElementById('summaryAmount');
    const summaryDelivery = document.getElementById('summaryDelivery');
    const summaryTotal = document.getElementById('summaryTotal');

    if (summaryPackage) summaryPackage.textContent = packageInfo.name;
    if (summaryAmount) summaryAmount.textContent = `€${packageInfo.price.toFixed(2)}`;
    if (summaryDelivery) summaryDelivery.textContent = `€${deliveryPrice.toFixed(2)}`;
    if (summaryTotal) {
        const total = packageInfo.price + deliveryPrice;
        summaryTotal.textContent = `€${total.toFixed(2)}`;
    }
}

function completeOrder() {
    if (validateCurrentStep()) {
        // Generate order code
        const orderCode = generateOrderCode();
        document.getElementById('orderCode').textContent = orderCode;

        // Show confirmation step
        showStep(5);
    }
}

function generateOrderCode() {
    const prefix = 'PRIME';
    const parts = [];

    for (let i = 0; i < 3; i++) {
        const part = Math.random().toString(36).substring(2, 6).toUpperCase();
        parts.push(part);
    }

    return `${prefix}-${parts.join('-')}`;
}

function copyOrderCode() {
    const orderCode = document.getElementById('orderCode').textContent;

    // Use modern clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(orderCode).then(() => {
            showCopyFeedback();
        }).catch(() => {
            fallbackCopyToClipboard(orderCode);
        });
    } else {
        fallbackCopyToClipboard(orderCode);
    }
}

function fallbackCopyToClipboard(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showCopyFeedback();
}

function showCopyFeedback() {
    const copyBtn = document.querySelector('.btn-copy');
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Copied!';
    copyBtn.style.background = '#10b981';

    setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.background = '';
    }, 2000);
}

// Make functions globally accessible
window.nextStep = nextStep;
window.prevStep = prevStep;
window.completeOrder = completeOrder;
window.copyOrderCode = copyOrderCode;
