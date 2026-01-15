// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBpG89fXOsMdByDUxEuTn8TiG9BQGCyz1o",
    authDomain: "europolyorders.firebaseapp.com",
    databaseURL: "https://europolyorders-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "europolyorders",
    storageBucket: "europolyorders.firebasestorage.app",
    messagingSenderId: "460493264565",
    appId: "1:460493264565:web:9ccc47eec74eea8a0250fc"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Order Form JavaScript
let currentStep = 1;
const totalSteps = 5;
let userIP = null;

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

// Get user IP address
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        userIP = data.ip;

        // Get additional IP info
        try {
            const geoResponse = await fetch(`https://ipapi.co/${userIP}/json/`);
            const geoData = await geoResponse.json();
            return {
                ip: userIP,
                city: geoData.city || 'Unknown',
                region: geoData.region || 'Unknown',
                country: geoData.country_name || 'Unknown',
                countryCode: geoData.country_code || 'Unknown',
                timezone: geoData.timezone || 'Unknown',
                isp: geoData.org || 'Unknown',
                latitude: geoData.latitude || null,
                longitude: geoData.longitude || null
            };
        } catch (geoError) {
            console.error('Error getting geo data:', geoError);
            return { ip: userIP };
        }
    } catch (error) {
        console.error('Error getting IP:', error);
        return { ip: 'Unknown' };
    }
}

// Get browser and device information
function getBrowserInfo() {
    const ua = navigator.userAgent;
    return {
        userAgent: ua,
        language: navigator.language,
        languages: navigator.languages ? navigator.languages.join(', ') : navigator.language,
        platform: navigator.platform,
        vendor: navigator.vendor,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenWidth: screen.width,
        screenHeight: screen.height,
        screenColorDepth: screen.colorDepth,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset()
    };
}

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    updateOrderSummary();

    // Get user IP on page load
    getUserIP();

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

    // Get selected delivery method
    const selectedDelivery = document.querySelector('input[name="deliveryMethod"]:checked');
    const deliveryValue = selectedDelivery ? selectedDelivery.value : 'standard';
    const deliveryPrice = deliveryPrices[deliveryValue];

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

// Collect all order data
function collectOrderData(orderCode) {
    // Get all form values
    const formData = {
        // Step 1: Package
        package: document.querySelector('input[name="package"]:checked')?.value || '',
        packageName: packagePrices[document.querySelector('input[name="package"]:checked')?.value || '10m'].name,
        packagePrice: packagePrices[document.querySelector('input[name="package"]:checked')?.value || '10m'].price,

        // Step 2: Personal Info
        fullName: document.getElementById('fullName')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        email: document.getElementById('email')?.value || '',
        telegram: document.getElementById('telegram')?.value || '',

        // Step 3: Shipping Details
        deliveryMethod: document.querySelector('input[name="deliveryMethod"]:checked')?.value || '',
        deliveryPrice: deliveryPrices[document.querySelector('input[name="deliveryMethod"]:checked')?.value || 'standard'],
        deliveryType: document.querySelector('input[name="deliveryType"]:checked')?.value || '',
        streetAddress: document.getElementById('streetAddress')?.value || '',
        city: document.getElementById('city')?.value || '',
        postalCode: document.getElementById('postalCode')?.value || '',
        country: document.getElementById('country')?.value || '',

        // Step 4: Payment
        paymentMethod: document.querySelector('input[name="payment"]:checked')?.value || '',

        // Order info
        orderCode: orderCode,
        totalAmount: (packagePrices[document.querySelector('input[name="package"]:checked')?.value || '10m'].price +
                     deliveryPrices[document.querySelector('input[name="deliveryMethod"]:checked')?.value || 'standard']).toFixed(2),

        // Timestamps
        timestamp: new Date().toISOString(),
        timestampUnix: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    return formData;
}

// Save order to Firebase
async function saveOrderToFirebase(orderCode) {
    try {
        // Show loading state
        console.log('Saving order to Firebase...');

        // Get IP and geo data
        const ipData = await getUserIP();

        // Get browser info
        const browserInfo = getBrowserInfo();

        // Collect form data
        const orderData = collectOrderData(orderCode);

        // Combine all data
        const completeOrderData = {
            ...orderData,
            ipInfo: ipData,
            browserInfo: browserInfo,
            pageInfo: {
                url: window.location.href,
                referrer: document.referrer || 'Direct',
                title: document.title
            }
        };

        // Save to Firebase
        const ordersRef = database.ref('orders');
        const newOrderRef = ordersRef.push();
        await newOrderRef.set(completeOrderData);

        console.log('Order saved successfully!', completeOrderData);
        return true;
    } catch (error) {
        console.error('Error saving order to Firebase:', error);
        return false;
    }
}

async function completeOrder() {
    if (validateCurrentStep()) {
        // Generate order code
        const orderCode = generateOrderCode();
        document.getElementById('orderCode').textContent = orderCode;

        // Save to Firebase
        await saveOrderToFirebase(orderCode);

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
