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

// Global variables
let allOrders = [];
let currentFilter = 'all';

// Load orders on page load
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
});

// Load orders from Firebase
function loadOrders() {
    const ordersRef = database.ref('orders');

    ordersRef.on('value', (snapshot) => {
        allOrders = [];
        const data = snapshot.val();

        if (data) {
            Object.keys(data).forEach(key => {
                const order = data[key];
                order.id = key;
                // Set default status if not exists
                if (!order.status) {
                    order.status = 'pending';
                }
                allOrders.push(order);
            });

            // Sort by timestamp (newest first)
            allOrders.sort((a, b) => {
                const timeA = a.timestampUnix || 0;
                const timeB = b.timestampUnix || 0;
                return timeB - timeA;
            });
        }

        updateAnalytics();
        displayOrders(currentFilter);
    });
}

// Update analytics
function updateAnalytics() {
    // Count orders by status
    const statusCounts = {
        pending: 0,
        completed: 0,
        canceled: 0
    };

    allOrders.forEach(order => {
        const status = order.status || 'pending';
        statusCounts[status]++;
    });

    // Update analytics cards
    document.getElementById('totalOrders').textContent = allOrders.length;
    document.getElementById('pendingOrders').textContent = statusCounts.pending;
    document.getElementById('completedOrders').textContent = statusCounts.completed;
    document.getElementById('canceledOrders').textContent = statusCounts.canceled;

    // Calculate top package
    const packageCounts = {};
    allOrders.forEach(order => {
        const pkg = order.packageName || order.package || 'Unknown';
        packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
    });

    let topPackage = 'No orders yet';
    let maxPackageCount = 0;
    Object.keys(packageCounts).forEach(pkg => {
        if (packageCounts[pkg] > maxPackageCount) {
            maxPackageCount = packageCounts[pkg];
            topPackage = `${pkg} (${packageCounts[pkg]} orders)`;
        }
    });

    document.getElementById('topPackage').innerHTML = `<div class="stats-package">${topPackage}</div>`;

    // Calculate top country
    const countryCounts = {};
    allOrders.forEach(order => {
        let country = 'Unknown';
        if (order.ipInfo && order.ipInfo.country) {
            country = order.ipInfo.country;
        } else if (order.country) {
            country = order.country;
        }
        countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    let topCountry = 'No orders yet';
    let maxCountryCount = 0;
    Object.keys(countryCounts).forEach(country => {
        if (countryCounts[country] > maxCountryCount) {
            maxCountryCount = countryCounts[country];
            topCountry = `${country} (${countryCounts[country]} orders)`;
        }
    });

    document.getElementById('topCountry').innerHTML = `<div class="stats-country">${topCountry}</div>`;

    // Calculate total revenue
    let totalRevenue = 0;
    allOrders.forEach(order => {
        const amount = parseFloat(order.totalAmount) || 0;
        totalRevenue += amount;
    });

    document.getElementById('totalRevenue').innerHTML = `<div class="stats-revenue">€${totalRevenue.toFixed(2)}</div>`;
}

// Display orders
function displayOrders(filter) {
    currentFilter = filter;

    // Filter orders
    let filteredOrders = allOrders;
    if (filter !== 'all') {
        filteredOrders = allOrders.filter(order => {
            const status = order.status || 'pending';
            return status === filter;
        });
    }

    // Update filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event?.target?.classList.add('active');

    // Update orders count
    document.getElementById('ordersCount').textContent = `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''}`;

    // Display orders
    const ordersList = document.getElementById('ordersList');

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 11L12 14L15 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p>No orders found</p>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = filteredOrders.map(order => createOrderCard(order)).join('');
}

// Create order card HTML
function createOrderCard(order) {
    const status = order.status || 'pending';
    const orderCode = order.orderCode || 'N/A';
    const fullName = order.fullName || 'N/A';
    const email = order.email || 'N/A';
    const packageName = order.packageName || order.package || 'N/A';
    const totalAmount = order.totalAmount || '0.00';
    const country = order.ipInfo?.country || order.country || 'Unknown';
    const date = order.date || 'N/A';
    const time = order.time || 'N/A';

    return `
        <div class="order-card" onclick="openOrderModal('${order.id}')">
            <div class="order-card-header">
                <div class="order-code">${orderCode}</div>
                <div class="order-status ${status}">${status}</div>
            </div>
            <div class="order-card-info">
                <div class="order-info-item">
                    <div class="order-info-label">Customer</div>
                    <div class="order-info-value">${fullName}</div>
                </div>
                <div class="order-info-item">
                    <div class="order-info-label">Package</div>
                    <div class="order-info-value">${packageName}</div>
                </div>
                <div class="order-info-item">
                    <div class="order-info-label">Total</div>
                    <div class="order-info-value">€${totalAmount}</div>
                </div>
                <div class="order-info-item">
                    <div class="order-info-label">Country</div>
                    <div class="order-info-value">${country}</div>
                </div>
            </div>
            <div class="order-card-footer">
                <div class="order-time">${date} at ${time}</div>
                <div class="order-actions" onclick="event.stopPropagation()">
                    <button class="btn-status pending" onclick="changeOrderStatus('${order.id}', 'pending')">Pending</button>
                    <button class="btn-status completed" onclick="changeOrderStatus('${order.id}', 'completed')">Complete</button>
                    <button class="btn-status canceled" onclick="changeOrderStatus('${order.id}', 'canceled')">Cancel</button>
                </div>
            </div>
        </div>
    `;
}

// Open order modal
function openOrderModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const status = order.status || 'pending';

    const modalBody = document.getElementById('orderModalBody');
    modalBody.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">Order Information</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Order Code</div>
                    <div class="detail-value">${order.orderCode || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value"><span class="order-status ${status}">${status}</span></div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">${order.date || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Time</div>
                    <div class="detail-value">${order.time || 'N/A'}</div>
                </div>
            </div>
            <div class="detail-status-actions">
                <button class="btn-change-status pending" onclick="changeOrderStatus('${order.id}', 'pending')">Set Pending</button>
                <button class="btn-change-status completed" onclick="changeOrderStatus('${order.id}', 'completed')">Set Completed</button>
                <button class="btn-change-status canceled" onclick="changeOrderStatus('${order.id}', 'canceled')">Set Canceled</button>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Customer Information</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Full Name</div>
                    <div class="detail-value">${order.fullName || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${order.email || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${order.phone || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Telegram</div>
                    <div class="detail-value">${order.telegram || 'N/A'}</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Order Details</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Package</div>
                    <div class="detail-value">${order.packageName || order.package || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Package Price</div>
                    <div class="detail-value">€${order.packagePrice || '0.00'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Delivery Method</div>
                    <div class="detail-value">${order.deliveryMethod || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Delivery Price</div>
                    <div class="detail-value">€${order.deliveryPrice || '0.00'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Delivery Type</div>
                    <div class="detail-value">${order.deliveryType || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Payment Method</div>
                    <div class="detail-value">${order.paymentMethod || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Total Amount</div>
                    <div class="detail-value" style="color: var(--primary-blue); font-size: 1.25rem;">€${order.totalAmount || '0.00'}</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Shipping Address</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Street Address</div>
                    <div class="detail-value">${order.streetAddress || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">City</div>
                    <div class="detail-value">${order.city || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Postal Code</div>
                    <div class="detail-value">${order.postalCode || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Country</div>
                    <div class="detail-value">${order.country || 'N/A'}</div>
                </div>
            </div>
        </div>

        ${order.ipInfo ? `
        <div class="detail-section">
            <div class="detail-section-title">IP & Location Information</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">IP Address</div>
                    <div class="detail-value">${order.ipInfo.ip || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">City</div>
                    <div class="detail-value">${order.ipInfo.city || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Region</div>
                    <div class="detail-value">${order.ipInfo.region || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Country</div>
                    <div class="detail-value">${order.ipInfo.country || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Timezone</div>
                    <div class="detail-value">${order.ipInfo.timezone || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">ISP</div>
                    <div class="detail-value">${order.ipInfo.isp || 'N/A'}</div>
                </div>
                ${order.ipInfo.latitude && order.ipInfo.longitude ? `
                <div class="detail-item">
                    <div class="detail-label">Coordinates</div>
                    <div class="detail-value">${order.ipInfo.latitude}, ${order.ipInfo.longitude}</div>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}

        ${order.browserInfo ? `
        <div class="detail-section">
            <div class="detail-section-title">Browser & Device Information</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Platform</div>
                    <div class="detail-value">${order.browserInfo.platform || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Language</div>
                    <div class="detail-value">${order.browserInfo.language || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Screen Resolution</div>
                    <div class="detail-value">${order.browserInfo.screenWidth}x${order.browserInfo.screenHeight}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Viewport Size</div>
                    <div class="detail-value">${order.browserInfo.viewportWidth}x${order.browserInfo.viewportHeight}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Timezone</div>
                    <div class="detail-value">${order.browserInfo.timezone || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">User Agent</div>
                    <div class="detail-value" style="word-break: break-all; font-size: 0.75rem;">${order.browserInfo.userAgent || 'N/A'}</div>
                </div>
            </div>
        </div>
        ` : ''}

        ${order.pageInfo ? `
        <div class="detail-section">
            <div class="detail-section-title">Page Information</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">URL</div>
                    <div class="detail-value" style="word-break: break-all; font-size: 0.75rem;">${order.pageInfo.url || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Referrer</div>
                    <div class="detail-value">${order.pageInfo.referrer || 'N/A'}</div>
                </div>
            </div>
        </div>
        ` : ''}
    `;

    document.getElementById('orderModal').classList.add('active');
}

// Close order modal
function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

// Change order status
function changeOrderStatus(orderId, newStatus) {
    const orderRef = database.ref(`orders/${orderId}/status`);
    orderRef.set(newStatus)
        .then(() => {
            console.log(`Order ${orderId} status changed to ${newStatus}`);
            // Close modal if open
            closeOrderModal();
        })
        .catch((error) => {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        });
}

// Filter orders
function filterOrders(filter) {
    displayOrders(filter);
}

// Refresh data
function refreshData() {
    loadOrders();

    // Show refresh feedback
    const btn = document.querySelector('.btn-refresh');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="animation: spin 1s linear infinite;"><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Refreshing...';

    setTimeout(() => {
        btn.innerHTML = originalHTML;
    }, 1000);
}

// Make functions globally accessible
window.filterOrders = filterOrders;
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.changeOrderStatus = changeOrderStatus;
window.refreshData = refreshData;
