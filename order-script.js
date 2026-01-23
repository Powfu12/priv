// Order Form JavaScript
let currentStep = 1;
const totalSteps = 5;

// Package prices
const packagePrices = {
    '1': { name: 'Starter Package', price: 79.86 },
    '2': { name: 'Premium Package', price: 149.86 },
    '3': { name: 'Ultimate Package', price: 299.86 }
};
// Delivery prices
const deliveryPrices = {
    'standard': 11.70,
    'express': 15.99
};

// Coupon codes
const couponCodes = {
    'primeuro30': { discount: 30, type: 'percentage' } // 30% discount
};

// Coupon state
let appliedCoupon = null;

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    updateOrderSummary();
    setupInputValidation();

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

    // Coupon application
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }

    // Allow Enter key to apply coupon
    const couponInput = document.getElementById('couponCode');
    if (couponInput) {
        couponInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyCoupon();
            }
        });
    }
});

function initializeForm() {
    // Set first step as active
    showStep(1);
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

    currentStep = step;

    // Scroll to top of the page smoothly
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
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
    let errorMessages = [];

    inputs.forEach(input => {
        // Reset border
        input.style.borderColor = '';

        // Check if empty
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ff4444';
            errorMessages.push(`${input.labels[0]?.textContent || 'Field'} is required`);
            return;
        }

        // Validate based on input type and name
        const validation = validateInput(input);
        if (!validation.valid) {
            isValid = false;
            input.style.borderColor = '#ff4444';
            errorMessages.push(validation.message);
        }
    });

    if (!isValid) {
        // Show first error message
        alert(errorMessages[0]);

        // Reset border colors after 2 seconds
        setTimeout(() => {
            inputs.forEach(input => {
                input.style.borderColor = '';
            });
        }, 2000);
    }

    return isValid;
}

function validateInput(input) {
    const value = input.value.trim();
    const name = input.name || input.id;

    // Email validation
    if (input.type === 'email' || name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { valid: false, message: 'Please enter a valid email address (e.g., user@example.com)' };
        }
    }

    // Phone validation - must be numbers only, 10-15 digits
    if (input.type === 'tel' || name === 'phone') {
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            return { valid: false, message: 'Phone number must be 10-15 digits (numbers only)' };
        }
    }

    // Full name validation - letters, spaces, hyphens only
    if (name === 'fullName') {
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        if (!nameRegex.test(value)) {
            return { valid: false, message: 'Name must contain only letters, spaces, and hyphens' };
        }
        if (value.length < 2) {
            return { valid: false, message: 'Name must be at least 2 characters long' };
        }
    }

    // City validation - letters, spaces, hyphens only
    if (name === 'city') {
        const cityRegex = /^[a-zA-Z\s\-']+$/;
        if (!cityRegex.test(value)) {
            return { valid: false, message: 'City must contain only letters' };
        }
    }

    // Postal code validation - alphanumeric with optional spaces/hyphens
    if (name === 'postalCode') {
        const postalRegex = /^[a-zA-Z0-9\s\-]{3,10}$/;
        if (!postalRegex.test(value)) {
            return { valid: false, message: 'Please enter a valid postal code (3-10 characters)' };
        }
    }

    // Country validation - letters, spaces only
    if (name === 'country') {
        const countryRegex = /^[a-zA-Z\s]+$/;
        if (!countryRegex.test(value)) {
            return { valid: false, message: 'Country must contain only letters' };
        }
    }

    // Street address validation - allow letters, numbers, spaces, common punctuation
    if (name === 'streetAddress') {
        if (value.length < 5) {
            return { valid: false, message: 'Street address must be at least 5 characters long' };
        }
    }

    // Telegram validation - must start with @ and contain only allowed characters
    if (name === 'telegram') {
        const telegramRegex = /^@[a-zA-Z0-9_]{5,32}$/;
        if (!telegramRegex.test(value)) {
            return { valid: false, message: 'Telegram username must start with @ and be 5-32 characters (letters, numbers, underscores only)' };
        }
    }

    return { valid: true };
}

function setupInputValidation() {
    // Phone input - allow only numbers and +
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove any non-digit characters except +
            this.value = this.value.replace(/[^\d+]/g, '');
            // Only allow + at the beginning
            if (this.value.indexOf('+') > 0) {
                this.value = this.value.replace(/\+/g, '');
            }
        });
    }

    // City input - allow only letters, spaces, hyphens
    const cityInput = document.getElementById('city');
    if (cityInput) {
        cityInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^a-zA-Z\s\-']/g, '');
        });
    }

    // Country input - allow only letters and spaces
    const countryInput = document.getElementById('country');
    if (countryInput) {
        countryInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
        });
    }

    // Full name input - allow only letters, spaces, hyphens, apostrophes
    const nameInput = document.getElementById('fullName');
    if (nameInput) {
        nameInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^a-zA-Z\s\-']/g, '');
        });
    }

    // Postal code - allow letters, numbers, spaces, hyphens
    const postalInput = document.getElementById('postalCode');
    if (postalInput) {
        postalInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^a-zA-Z0-9\s\-]/g, '').substring(0, 10);
        });
    }

    // Telegram - ensure @ prefix
    const telegramInput = document.getElementById('telegram');
    if (telegramInput) {
        telegramInput.addEventListener('input', function(e) {
            // Ensure it starts with @
            if (!this.value.startsWith('@')) {
                this.value = '@' + this.value.replace(/@/g, '');
            }
            // Allow only valid Telegram username characters after @
            this.value = this.value.replace(/[^@a-zA-Z0-9_]/g, '');
            // Limit length to 33 characters (@ + 32 characters)
            if (this.value.length > 33) {
                this.value = this.value.substring(0, 33);
            }
        });

        // Add @ when field is focused if empty
        telegramInput.addEventListener('focus', function(e) {
            if (!this.value) {
                this.value = '@';
            }
        });
    }
}

function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const couponMessage = document.getElementById('couponMessage');

    if (!couponInput || !couponMessage) return;

    const code = couponInput.value.trim().toLowerCase();

    // Reset message
    couponMessage.textContent = '';
    couponMessage.className = 'coupon-message';

    if (!code) {
        couponMessage.textContent = 'Please enter a coupon code';
        couponMessage.classList.add('error');
        return;
    }

    // Check if coupon exists
    if (couponCodes[code]) {
        appliedCoupon = {
            code: code,
            discount: couponCodes[code].discount,
            type: couponCodes[code].type
        };

        couponMessage.textContent = `Coupon applied! ${couponCodes[code].discount}% discount`;
        couponMessage.classList.add('success');

        // Disable input and button
        couponInput.disabled = true;
        document.getElementById('applyCouponBtn').disabled = true;
        document.getElementById('applyCouponBtn').textContent = 'Applied';

        // Update order summary
        updateOrderSummary();
    } else {
        couponMessage.textContent = 'Invalid coupon code';
        couponMessage.classList.add('error');
        appliedCoupon = null;
    }
}

function removeCoupon() {
    appliedCoupon = null;

    const couponInput = document.getElementById('couponCode');
    const couponMessage = document.getElementById('couponMessage');
    const applyCouponBtn = document.getElementById('applyCouponBtn');

    if (couponInput) {
        couponInput.value = '';
        couponInput.disabled = false;
    }

    if (couponMessage) {
        couponMessage.textContent = '';
        couponMessage.className = 'coupon-message';
    }

    if (applyCouponBtn) {
        applyCouponBtn.disabled = false;
        applyCouponBtn.textContent = 'Apply';
    }

    updateOrderSummary();
}

function updateOrderSummary() {
    // Get selected package
    const selectedPackage = document.querySelector('input[name="package"]:checked');
    const packageValue = selectedPackage ? selectedPackage.value : '10m';
    const packageInfo = packagePrices[packageValue];

    // Safety check - exit if packageInfo doesn't exist
    if (!packageInfo) {
        console.error('Invalid package selected:', packageValue);
        return;
    }

    // Get selected delivery method
    const selectedDelivery = document.querySelector('input[name="deliveryMethod"]:checked');
    const deliveryValue = selectedDelivery ? selectedDelivery.value : 'standard';
    const deliveryPrice = deliveryPrices[deliveryValue];

    // Safety check for delivery price
    if (deliveryPrice === undefined) {
        console.error('Invalid delivery method selected:', deliveryValue);
        return;
    }

    // Calculate discount
    let discountAmount = 0;
    if (appliedCoupon && appliedCoupon.type === 'percentage') {
        discountAmount = (packageInfo.price * appliedCoupon.discount) / 100;
    }

    const discountedPackagePrice = packageInfo.price - discountAmount;

    // Update summary
    const summaryPackage = document.getElementById('summaryPackage');
    const summaryAmount = document.getElementById('summaryAmount');
    const summaryDiscount = document.getElementById('summaryDiscount');
    const summaryDiscountRow = document.getElementById('summaryDiscountRow');
    const summaryDelivery = document.getElementById('summaryDelivery');
    const summaryTotal = document.getElementById('summaryTotal');

    if (summaryPackage) summaryPackage.textContent = packageInfo.name;
    if (summaryAmount) summaryAmount.textContent = `€${packageInfo.price.toFixed(2)}`;
    if (summaryDelivery) summaryDelivery.textContent = `€${deliveryPrice.toFixed(2)}`;

    // Show/hide discount row
    if (summaryDiscountRow) {
        if (discountAmount > 0) {
            summaryDiscountRow.style.display = 'flex';
            if (summaryDiscount) {
                summaryDiscount.textContent = `-€${discountAmount.toFixed(2)}`;
            }
        } else {
            summaryDiscountRow.style.display = 'none';
        }
    }

    if (summaryTotal) {
        const total = discountedPackagePrice + deliveryPrice;
        summaryTotal.textContent = `€${total.toFixed(2)}`;
    }
}

function completeOrder() {
    if (validateCurrentStep()) {
        // Generate order code
        const orderCode = generateOrderCode();
        document.getElementById('orderCode').textContent = orderCode;

        // Collect order data
        const orderData = collectOrderData(orderCode);

        // Check if order data was collected successfully
        if (!orderData) {
            console.error('Failed to collect order data');
            return;
        }

        // Save to Firebase
        saveOrderToFirebase(orderData);

        // Show confirmation step
        showStep(5);
    }
}

function collectOrderData(orderCode) {
    // Debug: Log all package inputs
    const allPackageInputs = document.querySelectorAll('input[name="package"]');
    console.log('All package inputs:', allPackageInputs);
    console.log('Package prices available:', packagePrices);

    // Get selected package
    const selectedPackageInput = document.querySelector('input[name="package"]:checked');
    console.log('Selected package input:', selectedPackageInput);

    if (!selectedPackageInput) {
        console.error('No package selected');
        alert('Please select a package');
        return null;
    }

    const selectedPackage = selectedPackageInput.value;
    console.log('Selected package value:', selectedPackage);

    const packageInfo = packagePrices[selectedPackage];
    console.log('Package info:', packageInfo);

    if (!packageInfo) {
        console.error('Invalid package selected:', selectedPackage);
        console.error('Available packages:', Object.keys(packagePrices));
        alert('Invalid package selected. Please refresh the page and try again.');
        return null;
    }

    // Get personal info
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const telegram = document.getElementById('telegram').value;

    // Get shipping details
    const deliveryMethodInput = document.querySelector('input[name="deliveryMethod"]:checked');
    const deliveryTypeInput = document.querySelector('input[name="deliveryType"]:checked');

    if (!deliveryMethodInput || !deliveryTypeInput) {
        console.error('Delivery options not selected');
        alert('Please select delivery method and type');
        return null;
    }

    const deliveryMethod = deliveryMethodInput.value;
    const deliveryType = deliveryTypeInput.value;
    const streetAddress = document.getElementById('streetAddress').value;
    const city = document.getElementById('city').value;
    const postalCode = document.getElementById('postalCode').value;
    const country = document.getElementById('country').value;

    // Get payment method
    const paymentMethodInput = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethodInput) {
        console.error('No payment method selected');
        alert('Please select a payment method');
        return null;
    }
    const paymentMethod = paymentMethodInput.value;

    // Calculate total with discount
    const deliveryPrice = deliveryPrices[deliveryMethod];
    let discountAmount = 0;
    let discountPercentage = 0;
    let couponCode = null;

    if (appliedCoupon && appliedCoupon.type === 'percentage') {
        discountAmount = (packageInfo.price * appliedCoupon.discount) / 100;
        discountPercentage = appliedCoupon.discount;
        couponCode = appliedCoupon.code;
    }

    const discountedPackagePrice = packageInfo.price - discountAmount;
    const total = discountedPackagePrice + deliveryPrice;

    // Create order object
    const orderData = {
        orderCode: orderCode,
        timestamp: new Date().toISOString(),
        status: 'pending',
        personalInfo: {
            fullName: fullName,
            email: email,
            phone: phone,
            telegram: telegram
        },
        package: {
            name: packageInfo.name,
            price: packageInfo.price,
            discountedPrice: discountedPackagePrice
        },
        shipping: {
            method: deliveryMethod,
            methodPrice: deliveryPrice,
            type: deliveryType,
            address: {
                street: streetAddress,
                city: city,
                postalCode: postalCode,
                country: country
            }
        },
        payment: {
            method: paymentMethod,
            total: total
        }
    };

    // Add coupon info if applied
    if (couponCode) {
        orderData.coupon = {
            code: couponCode,
            discountPercentage: discountPercentage,
            discountAmount: discountAmount
        };
    }

    return orderData;
}

function saveOrderToFirebase(orderData) {
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.database) {
        console.error('Firebase is not initialized');
        alert('Error: Unable to save order. Please try again or contact support.');
        return;
    }

    const database = firebase.database();
    const ordersRef = database.ref('orders');

    // Generate unique order ID
    const newOrderRef = ordersRef.push();

    // Save order to Firebase
    newOrderRef.set(orderData)
        .then(() => {
            console.log('Order saved successfully to Firebase');
        })
        .catch((error) => {
            console.error('Error saving order to Firebase:', error);
            alert('Error saving order. Please take a screenshot of your order code and contact support.');
        });
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

    // Create temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = orderCode;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // Show feedback
    const copyBtn = document.querySelector('.btn-copy');
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Copied!';
    copyBtn.style.background = '#00cc66';

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
window.applyCoupon = applyCoupon;
window.removeCoupon = removeCoupon;