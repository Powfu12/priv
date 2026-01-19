// Admin Panel JavaScript
let allOrders = [];
let filteredOrders = [];
let currentFilter = 'all';

// Load orders when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
});

function loadOrders() {
    const ordersContainer = document.getElementById('ordersContainer');

    if (!ordersContainer) {
        console.error('Orders container element not found');
        return;
    }

    ordersContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading orders...</p>
        </div>
    `;

    // Check if Firebase is initialized
    if (!window.firebaseDB) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                </svg>
                <p>Firebase is not configured. Please check your firebase-config.js file.</p>
            </div>
        `;
        return;
    }

    try {
        // Load orders from Firebase
        const ordersRef = window.firebaseDB.ref('orders');

        ordersRef.once('value')
            .then((snapshot) => {
                allOrders = [];

                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const order = childSnapshot.val();
                        order.id = childSnapshot.key;
                        allOrders.push(order);

                        // Debug: Log order structure
                        console.log('Loaded order:', order);
                    });

                    // Sort by timestamp (newest first)
                    allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                }

                filteredOrders = [...allOrders];
                displayOrders();
                updateStats();
            })
            .catch((error) => {
                console.error('Error loading orders:', error);
                ordersContainer.innerHTML = `
                    <div class="empty-state">
                        <svg fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                        </svg>
                        <p>Error loading orders. Check console for details.</p>
                    </div>
                `;
            });
    } catch (error) {
        console.error('Error accessing Firebase:', error);
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                </svg>
                <p>Error accessing Firebase. Check your configuration.</p>
            </div>
        `;
    }
}

function displayOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    const ordersCount = document.getElementById('ordersCount');

    if (!ordersContainer) {
        console.error('Orders container element not found');
        return;
    }

    if (ordersCount) {
        ordersCount.textContent = `${filteredOrders.length} ${filteredOrders.length === 1 ? 'order' : 'orders'}`;
    }

    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/>
                </svg>
                <p>No orders found.</p>
            </div>
        `;
        return;
    }

    const cardsHTML = filteredOrders.map(order => {
        const statusClass = order.status || 'pending';
        const packageName = order.package?.name || 'N/A';
        const customerName = order.personalInfo?.fullName || 'N/A';
        const customerEmail = order.personalInfo?.email || 'N/A';
        const total = order.payment?.total ? `€${order.payment.total.toFixed(2)}` : '€0.00';
        const timestamp = order.timestamp ? formatDate(order.timestamp) : 'N/A';
        const timeAgo = order.timestamp ? getTimeAgo(order.timestamp) : 'N/A';

        return `
            <div class="order-card" onclick="viewOrder('${order.id}')">
                <div class="order-card-header">
                    <div class="order-code">${order.orderCode || 'N/A'}</div>
                    <div class="order-status ${statusClass}">${statusClass}</div>
                </div>
                <div class="order-card-info">
                    <div class="order-info-item">
                        <div class="order-info-label">Customer</div>
                        <div class="order-info-value">${customerName}</div>
                    </div>
                    <div class="order-info-item">
                        <div class="order-info-label">Email</div>
                        <div class="order-info-value">${customerEmail}</div>
                    </div>
                    <div class="order-info-item">
                        <div class="order-info-label">Package</div>
                        <div class="order-info-value">${packageName}</div>
                    </div>
                    <div class="order-info-item">
                        <div class="order-info-label">Total</div>
                        <div class="order-info-value">${total}</div>
                    </div>
                </div>
                <div class="order-card-footer">
                    <div class="order-time">${timeAgo}</div>
                    <div class="order-actions">
                        <button class="btn-status ${statusClass}" onclick="event.stopPropagation(); changeStatus('${order.id}', '${statusClass}')">
                            ${statusClass === 'pending' ? 'Mark Complete' : statusClass === 'completed' ? 'Completed ✓' : 'Canceled'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    ordersContainer.innerHTML = cardsHTML;
}

function updateStats() {
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.payment?.total || 0), 0);

    // Safely update stats with null checks
    const totalOrdersEl = document.getElementById('totalOrders');
    const pendingOrdersEl = document.getElementById('pendingOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');

    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
    if (totalRevenueEl) totalRevenueEl.textContent = `€${totalRevenue.toFixed(2)}`;
}

function filterByStatus(status) {
    currentFilter = status;

    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-status') === status) {
            tab.classList.add('active');
        }
    });

    // Filter orders
    if (status === 'all') {
        filteredOrders = [...allOrders];
    } else {
        filteredOrders = allOrders.filter(order => order.status === status);
    }

    displayOrders();
}

function changeStatus(orderId, currentStatus) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    let newStatus;
    if (currentStatus === 'pending') {
        newStatus = 'completed';
    } else if (currentStatus === 'completed') {
        newStatus = 'pending';
    } else {
        return; // Can't change canceled orders
    }

    updateOrderStatus(orderId, newStatus);
}

function viewOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    // Helper function to safely get nested values
    const getValue = (obj, path, defaultValue = 'N/A') => {
        const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
        return value !== undefined && value !== null && value !== '' ? value : defaultValue;
    };

    const modalBody = document.getElementById('modalBody');
    if (!modalBody) {
        console.error('Modal body element not found');
        return;
    }

    const statusClass = order.status || 'pending';

    modalBody.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">Order Information</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Order Code</div>
                    <div class="detail-value">${getValue(order, 'orderCode')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date & Time</div>
                    <div class="detail-value">${order.timestamp ? formatDateTime(order.timestamp) : 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">
                        <span class="order-status ${statusClass}">${statusClass}</span>
                    </div>
                </div>
            </div>
            <div class="detail-status-actions">
                <button class="btn-change-status pending" onclick="updateOrderStatus('${order.id}', 'pending')">Mark as Pending</button>
                <button class="btn-change-status completed" onclick="updateOrderStatus('${order.id}', 'completed')">Mark as Completed</button>
                <button class="btn-change-status canceled" onclick="updateOrderStatus('${order.id}', 'canceled')">Mark as Canceled</button>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Customer Information</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Full Name</div>
                    <div class="detail-value">${getValue(order, 'personalInfo.fullName')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${getValue(order, 'personalInfo.email')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${getValue(order, 'personalInfo.phone')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Telegram</div>
                    <div class="detail-value">${getValue(order, 'personalInfo.telegram')}</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Package Details</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Package</div>
                    <div class="detail-value">${getValue(order, 'package.name')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Price</div>
                    <div class="detail-value">€${order?.package?.price ? order.package.price.toFixed(2) : '0.00'}</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Shipping Information</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Delivery Method</div>
                    <div class="detail-value">${getValue(order, 'shipping.method', 'standard')} (€${order?.shipping?.methodPrice ? order.shipping.methodPrice.toFixed(2) : '0.00'})</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Delivery Type</div>
                    <div class="detail-value">${getValue(order, 'shipping.type')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Address</div>
                    <div class="detail-value">
                        ${getValue(order, 'shipping.address.street')}<br>
                        ${getValue(order, 'shipping.address.city')}, ${getValue(order, 'shipping.address.postalCode')}<br>
                        ${getValue(order, 'shipping.address.country')}
                    </div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Payment</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Payment Method</div>
                    <div class="detail-value">${getValue(order, 'payment.method')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Total Amount</div>
                    <div class="detail-value" style="font-size: 1.25rem; color: var(--primary-blue);">€${order?.payment?.total ? order.payment.total.toFixed(2) : '0.00'}</div>
                </div>
            </div>
        </div>
    `;

    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function updateOrderStatus(orderId, newStatus) {
    if (!window.firebaseDB) {
        alert('Firebase is not configured');
        return;
    }

    const orderRef = window.firebaseDB.ref(`orders/${orderId}`);
    orderRef.update({ status: newStatus })
        .then(() => {
            // Update local copy
            const order = allOrders.find(o => o.id === orderId);
            if (order) {
                order.status = newStatus;
            }

            alert('Order status updated successfully');
            loadOrders();
            closeModal();
        })
        .catch((error) => {
            console.error('Error updating order:', error);
            alert('Error updating order status');
        });
}

function closeModal(event) {
    const modal = document.getElementById('orderModal');
    if (!event || event.target.id === 'orderModal' || event.target.classList.contains('modal-close')) {
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return Math.floor(seconds) + " seconds ago";
}

// Make functions globally accessible
window.loadOrders = loadOrders;
window.filterByStatus = filterByStatus;
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.closeModal = closeModal;
