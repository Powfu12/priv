// Order Form JavaScript
let currentStep = 1;
const totalSteps = 5;

// Package prices
const packagePrices = {
    '10m': { name: '10M Package', price: 24.99 },
    '20m': { name: '20M Package', price: 44.99 },
    '50m': { name: '50M Package', price: 99.99 }
};

// Delivery prices
const deliveryPrices = {
    'standard': 11.70,
    'express': 15.99
};

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    updateOrderSummary();

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

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ff4444';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 2000);
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields');
    }

    return isValid;
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

    // Calculate total
    const deliveryPrice = deliveryPrices[deliveryMethod];
    const total = packageInfo.price + deliveryPrice;

    // Create order object
    return {
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
            price: packageInfo.price
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
