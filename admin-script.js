// Admin Panel JavaScript
let allOrders = [];
let filteredOrders = [];

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

    ordersContainer.innerHTML = '<div class="loading">Loading orders...</div>';

    // Check if Firebase is initialized
    if (!window.firebaseDB) {
        ordersContainer.innerHTML = '<div class="no-orders">Firebase is not configured. Please check your firebase-config.js file.</div>';
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
                ordersContainer.innerHTML = '<div class="no-orders">Error loading orders. Check console for details.</div>';
            });
    } catch (error) {
        console.error('Error accessing Firebase:', error);
        ordersContainer.innerHTML = '<div class="no-orders">Error accessing Firebase. Check your configuration.</div>';
    }
}

function displayOrders() {
    const ordersContainer = document.getElementById('ordersContainer');

    if (!ordersContainer) {
        console.error('Orders container element not found');
        return;
    }

    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = '<div class="no-orders">No orders found.</div>';
        return;
    }

    const tableHTML = `
        <table class="orders-table">
            <thead>
                <tr>
                    <th>Order Code</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Package</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredOrders.map(order => `
                    <tr>
                        <td><strong>${order.orderCode || 'N/A'}</strong></td>
                        <td>${order.timestamp ? formatDate(order.timestamp) : 'N/A'}</td>
                        <td>
                            ${order.personalInfo?.fullName || 'N/A'}<br>
                            <small style="opacity: 0.7">${order.personalInfo?.email || 'N/A'}</small>
                        </td>
                        <td>${order.package?.name || 'N/A'}</td>
                        <td><strong>€${order.payment?.total ? order.payment.total.toFixed(2) : '0.00'}</strong></td>
                        <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
                        <td>
                            <button class="action-btn" onclick="viewOrder('${order.id}')">View Details</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    ordersContainer.innerHTML = tableHTML;
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

function filterOrders() {
    const statusFilterEl = document.getElementById('statusFilter');
    const searchInputEl = document.getElementById('searchInput');

    if (!statusFilterEl || !searchInputEl) {
        console.error('Filter elements not found');
        return;
    }

    const statusFilter = statusFilterEl.value;
    const searchInput = searchInputEl.value.toLowerCase();

    filteredOrders = allOrders.filter(order => {
        // Status filter
        const statusMatch = statusFilter === 'all' || order.status === statusFilter;

        // Search filter
        const searchMatch = !searchInput ||
            (order.orderCode && order.orderCode.toLowerCase().includes(searchInput)) ||
            (order.personalInfo?.fullName && order.personalInfo.fullName.toLowerCase().includes(searchInput)) ||
            (order.personalInfo?.email && order.personalInfo.email.toLowerCase().includes(searchInput)) ||
            (order.personalInfo?.telegram && order.personalInfo.telegram.toLowerCase().includes(searchInput));

        return statusMatch && searchMatch;
    });

    displayOrders();
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

    modalBody.innerHTML = `
        <div class="detail-group">
            <div class="detail-label">Order Code</div>
            <div class="detail-value">${getValue(order, 'orderCode')}</div>
        </div>

        <div class="detail-group">
            <div class="detail-label">Date & Time</div>
            <div class="detail-value">${order.timestamp ? formatDateTime(order.timestamp) : 'N/A'}</div>
        </div>

        <div class="detail-group">
            <div class="detail-label">Status</div>
            <div class="detail-value">
                <span class="status-badge status-${order.status}">${order.status}</span>
                <select onchange="updateOrderStatus('${order.id}', this.value)" style="margin-left: 10px; padding: 5px; border-radius: 5px;">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,215,0,0.3);">
            <h3 style="color: #FFD700; margin-bottom: 15px;">Customer Information</h3>
            <div class="detail-group">
                <div class="detail-label">Full Name</div>
                <div class="detail-value">${getValue(order, 'personalInfo.fullName')}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Email</div>
                <div class="detail-value">${getValue(order, 'personalInfo.email')}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Phone</div>
                <div class="detail-value">${getValue(order, 'personalInfo.phone')}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Telegram</div>
                <div class="detail-value">${getValue(order, 'personalInfo.telegram')}</div>
            </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,215,0,0.3);">
            <h3 style="color: #FFD700; margin-bottom: 15px;">Package Details</h3>
            <div class="detail-group">
                <div class="detail-label">Package</div>
                <div class="detail-value">${getValue(order, 'package.name')}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Price</div>
                <div class="detail-value">€${order?.package?.price ? order.package.price.toFixed(2) : '0.00'}</div>
            </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,215,0,0.3);">
            <h3 style="color: #FFD700; margin-bottom: 15px;">Shipping Information</h3>
            <div class="detail-group">
                <div class="detail-label">Delivery Method</div>
                <div class="detail-value">${getValue(order, 'shipping.method', 'standard')} (€${order?.shipping?.methodPrice ? order.shipping.methodPrice.toFixed(2) : '0.00'})</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Delivery Type</div>
                <div class="detail-value">${getValue(order, 'shipping.type')}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Address</div>
                <div class="detail-value">
                    ${getValue(order, 'shipping.address.street')}<br>
                    ${getValue(order, 'shipping.address.city')}, ${getValue(order, 'shipping.address.postalCode')}<br>
                    ${getValue(order, 'shipping.address.country')}
                </div>
            </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,215,0,0.3);">
            <h3 style="color: #FFD700; margin-bottom: 15px;">Payment</h3>
            <div class="detail-group">
                <div class="detail-label">Payment Method</div>
                <div class="detail-value">${getValue(order, 'payment.method')}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Total Amount</div>
                <div class="detail-value" style="font-size: 24px; color: #FFD700;">€${order?.payment?.total ? order.payment.total.toFixed(2) : '0.00'}</div>
            </div>
        </div>
    `;

    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'block';
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
    if (!event || event.target.id === 'orderModal') {
        const modal = document.getElementById('orderModal');
        if (modal) {
            modal.style.display = 'none';
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

// Make functions globally accessible
window.loadOrders = loadOrders;
window.filterOrders = filterOrders;
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.closeModal = closeModal;