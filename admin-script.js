// Admin Panel JavaScript - Mobile-First Design
let allOrders = [];
let filteredOrders = [];
let currentFilter = 'all';
let currentTab = 'orders';
let allPosts = [];
let currentPostId = null;
let selectedImageFile = null;
let currentImageUrl = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    initializeEventListeners();
});

function initializeEventListeners() {
    // Close modal when clicking outside
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-toggle');

        if (sidebar && sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
}

// Toggle mobile sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Switch between tabs
function switchTab(tabName) {
    currentTab = tabName;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const activeTab = document.getElementById(tabName + 'Tab');
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Close mobile sidebar after selection
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && window.innerWidth < 768) {
        sidebar.classList.remove('active');
    }

    // Load analytics if switching to analytics tab
    if (tabName === 'analytics') {
        generateAnalytics();
    }

    // Load posts if switching to posts tab
    if (tabName === 'posts') {
        loadPosts();
    }
}

// Load orders from Firebase
function loadOrders() {
    const tableBody = document.getElementById('ordersTableBody');

    if (!tableBody) {
        console.error('Orders table body not found');
        return;
    }

    // Show loading state
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="loading-cell">
                <div class="spinner"></div>
                <p>Loading orders...</p>
            </td>
        </tr>
    `;

    // Check if Firebase is initialized
    if (!window.firebaseDB) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">
                    <p style="color: var(--danger);">Firebase is not configured</p>
                </td>
            </tr>
        `;
        return;
    }

    try {
        const ordersRef = window.firebaseDB.ref('orders');

        ordersRef.on('value', (snapshot) => {
            allOrders = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const order = childSnapshot.val();
                    order.id = childSnapshot.key;
                    allOrders.push(order);
                });

                // Sort by timestamp (newest first)
                allOrders.sort((a, b) => {
                    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return timeB - timeA;
                });
            }

            // Apply current filter
            filterOrders(currentFilter);
            updateStats();
        }, (error) => {
            console.error('Error loading orders:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-cell">
                        <p style="color: var(--danger);">Error loading orders</p>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error accessing Firebase:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">
                    <p style="color: var(--danger);">Error accessing Firebase</p>
                </td>
            </tr>
        `;
    }
}

// Filter orders by status
function filterOrders(status) {
    currentFilter = status;

    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === status) {
            btn.classList.add('active');
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

// Display orders in both table and mobile cards
function displayOrders() {
    displayDesktopTable();
    displayMobileCards();
}

// Display orders in desktop table
function displayDesktopTable() {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">
                    <p>No orders found</p>
                </td>
            </tr>
        `;
        return;
    }

    const rows = filteredOrders.map(order => {
        const orderCode = order.orderCode || 'N/A';
        const customerName = order.personalInfo?.fullName || 'N/A';
        const packageName = order.package?.name || 'N/A';
        const total = order.payment?.total ? `€${order.payment.total.toFixed(2)}` : '€0.00';
        const status = order.status || 'pending';
        const date = order.timestamp ? formatDate(order.timestamp) : 'N/A';

        return `
            <tr>
                <td><strong>${orderCode}</strong></td>
                <td>${customerName}</td>
                <td>${packageName}</td>
                <td><strong>${total}</strong></td>
                <td><span class="status-badge ${status}">${status}</span></td>
                <td>${date}</td>
                <td>
                    <button class="action-btn primary" onclick="viewOrder('${order.id}')">View</button>
                    ${order.personalInfo?.telegram ? `<a href="https://t.me/${order.personalInfo.telegram.replace('@', '')}" target="_blank" rel="noopener" class="action-btn" style="background: #2AABEE; color: white; border-color: #2AABEE; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;"><svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/></svg>TG</a>` : ''}
                    <button class="action-btn danger" onclick="confirmDeleteOrder('${order.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;
}

// Display orders as mobile cards
function displayMobileCards() {
    // Remove existing mobile cards
    const existingContainer = document.querySelector('.mobile-orders');
    if (existingContainer) {
        existingContainer.remove();
    }

    const tableContainer = document.querySelector('.table-container');
    if (!tableContainer) return;

    // Create mobile cards container
    const mobileContainer = document.createElement('div');
    mobileContainer.className = 'mobile-orders';

    if (filteredOrders.length === 0) {
        mobileContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
                <p>No orders found</p>
            </div>
        `;
    } else {
        const cards = filteredOrders.map(order => {
            const orderCode = order.orderCode || 'N/A';
            const customerName = order.personalInfo?.fullName || 'N/A';
            const packageName = order.package?.name || 'N/A';
            const total = order.payment?.total ? `€${order.payment.total.toFixed(2)}` : '€0.00';
            const status = order.status || 'pending';
            const date = order.timestamp ? formatDate(order.timestamp) : 'N/A';

            return `
                <div class="order-card-mobile">
                    <div class="order-card-header-mobile">
                        <div class="order-code-mobile">${orderCode}</div>
                        <span class="status-badge ${status}">${status}</span>
                    </div>
                    <div class="order-info-mobile">
                        <div class="info-item-mobile">
                            <div class="info-label-mobile">Customer</div>
                            <div class="info-value-mobile">${customerName}</div>
                        </div>
                        <div class="info-item-mobile">
                            <div class="info-label-mobile">Package</div>
                            <div class="info-value-mobile">${packageName}</div>
                        </div>
                        <div class="info-item-mobile">
                            <div class="info-label-mobile">Amount</div>
                            <div class="info-value-mobile"><strong>${total}</strong></div>
                        </div>
                        <div class="info-item-mobile">
                            <div class="info-label-mobile">Date</div>
                            <div class="info-value-mobile">${date}</div>
                        </div>
                    </div>
                    <div class="order-actions-mobile">
                        <button class="action-btn primary" onclick="viewOrder('${order.id}')">View Details</button>
                        ${order.personalInfo?.telegram ? `<a href="https://t.me/${order.personalInfo.telegram.replace('@', '')}" target="_blank" rel="noopener" class="action-btn" style="background: #2AABEE; color: white; border-color: #2AABEE; text-decoration: none; display: inline-flex; align-items: center; gap: 0.375rem;"><svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/></svg>Telegram</a>` : ''}
                        <button class="action-btn danger" onclick="confirmDeleteOrder('${order.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        mobileContainer.innerHTML = cards;
    }

    tableContainer.appendChild(mobileContainer);
}

// Update statistics
function updateStats() {
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
    const completedOrders = allOrders.filter(o => o.status === 'completed').length;
    const totalRevenue = allOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (parseFloat(o.payment?.total) || 0), 0);

    const totalEl = document.getElementById('totalOrders');
    const pendingEl = document.getElementById('pendingOrders');
    const completedEl = document.getElementById('completedOrders');
    const revenueEl = document.getElementById('totalRevenue');
    const badgeEl = document.getElementById('ordersBadge');

    if (totalEl) totalEl.textContent = totalOrders;
    if (pendingEl) pendingEl.textContent = pendingOrders;
    if (completedEl) completedEl.textContent = completedOrders;
    if (revenueEl) revenueEl.textContent = `€${totalRevenue.toFixed(2)}`;
    if (badgeEl) badgeEl.textContent = pendingOrders;
}

// View order details in modal
function viewOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const modalBody = document.getElementById('modalBody');
    if (!modalBody) return;

    const status = order.status || 'pending';
    const getValue = (obj, path, defaultValue = 'N/A') => {
        const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
        return value !== undefined && value !== null && value !== '' ? value : defaultValue;
    };

    modalBody.innerHTML = `
        <div style="display: grid; gap: 1.5rem;">
            <!-- Order Information -->
            <div style="background: var(--bg-main); padding: 1.25rem; border-radius: 0.5rem;">
                <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">Order Information</h3>
                <div style="display: grid; gap: 0.75rem;">
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Order Code</div>
                        <div style="font-weight: 500;">${getValue(order, 'orderCode')}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Date & Time</div>
                        <div style="font-weight: 500;">${order.timestamp ? formatDateTime(order.timestamp) : 'N/A'}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Status</div>
                        <span class="status-badge ${status}">${status}</span>
                        ${order.cancelReason ? `<div style="margin-top: 0.375rem; font-size: 0.8125rem; color: var(--danger); font-weight: 500;">Reason: ${order.cancelReason}</div>` : ''}
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;" id="orderStatusActions">
                    <button class="action-btn" onclick="updateOrderStatus('${order.id}', 'pending')" style="background: rgba(245, 158, 11, 0.1); color: var(--warning); border-color: var(--warning);">Mark Pending</button>
                    <button class="action-btn" onclick="updateOrderStatus('${order.id}', 'completed')" style="background: rgba(16, 185, 129, 0.1); color: var(--success); border-color: var(--success);">Mark Completed</button>
                    <button class="action-btn" onclick="promptCancelReason('${order.id}')" style="background: rgba(239, 68, 68, 0.1); color: var(--danger); border-color: var(--danger);">Mark Canceled</button>
                </div>
                <div id="cancelReasonPanel" style="display: none; margin-top: 1rem; padding: 1rem; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 0.5rem;">
                    <div style="font-size: 0.875rem; font-weight: 600; color: var(--danger); margin-bottom: 0.75rem;">Select cancellation reason:</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <button class="action-btn danger" onclick="cancelOrderWithReason('${order.id}', 'Didn\'t Respond')">Didn't Respond</button>
                        <button class="action-btn danger" onclick="cancelOrderWithReason('${order.id}', 'No Valid TG')">No Valid TG</button>
                        <button class="action-btn danger" onclick="cancelOrderWithReason('${order.id}', 'Didn\'t Pay')">Didn't Pay</button>
                        <button class="action-btn danger" onclick="cancelOrderWithReason('${order.id}', 'Retard')">Retard</button>
                    </div>
                    <button class="action-btn" onclick="document.getElementById('cancelReasonPanel').style.display='none';document.getElementById('orderStatusActions').style.display='flex';" style="margin-top: 0.5rem; width: 100%; justify-content: center;">← Back</button>
                </div>
            </div>

            <!-- Customer Information -->
            <div style="background: var(--bg-main); padding: 1.25rem; border-radius: 0.5rem;">
                <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">Customer Information</h3>
                <div style="display: grid; gap: 0.75rem;">
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Full Name</div>
                        <div style="font-weight: 500;">${getValue(order, 'personalInfo.fullName')}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Email</div>
                        <div style="font-weight: 500;">${getValue(order, 'personalInfo.email')}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Phone</div>
                        <div style="font-weight: 500;">${getValue(order, 'personalInfo.phone')}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Telegram</div>
                        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                            <div style="font-weight: 500;">${getValue(order, 'personalInfo.telegram')}</div>
                            ${order.personalInfo?.telegram ? `<a href="https://t.me/${order.personalInfo.telegram.replace('@', '')}" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.875rem; background: #2AABEE; color: white; border-radius: 0.375rem; font-size: 0.8125rem; font-weight: 600; text-decoration: none; white-space: nowrap; line-height: 1;"><svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/></svg>Message on Telegram</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Package Details -->
            <div style="background: var(--bg-main); padding: 1.25rem; border-radius: 0.5rem;">
                <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">Package Details</h3>
                <div style="display: grid; gap: 0.75rem;">
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Package</div>
                        <div style="font-weight: 500;">${getValue(order, 'package.name')}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Price</div>
                        <div style="font-weight: 500;">€${order.package?.price ? order.package.price.toFixed(2) : '0.00'}</div>
                    </div>
                </div>
            </div>

            <!-- Shipping Information -->
            <div style="background: var(--bg-main); padding: 1.25rem; border-radius: 0.5rem;">
                <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">Shipping Information</h3>
                <div style="display: grid; gap: 0.75rem;">
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Delivery Method</div>
                        <div style="font-weight: 500;">${getValue(order, 'shipping.method', 'standard')} (+€${order.shipping?.methodPrice ? order.shipping.methodPrice.toFixed(2) : '0.00'})</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Delivery Type</div>
                        <div style="font-weight: 500;">${getValue(order, 'shipping.type')}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Address</div>
                        <div style="font-weight: 500;">
                            ${getValue(order, 'shipping.address.street')}<br>
                            ${getValue(order, 'shipping.address.city')}, ${getValue(order, 'shipping.address.postalCode')}<br>
                            ${getValue(order, 'shipping.address.country')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Payment Information -->
            <div style="background: var(--bg-main); padding: 1.25rem; border-radius: 0.5rem;">
                <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">Payment Information</h3>
                <div style="display: grid; gap: 0.75rem;">
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Payment Method</div>
                        <div style="font-weight: 500;">${getValue(order, 'payment.method')}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Total Amount</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">€${order.payment?.total ? order.payment.total.toFixed(2) : '0.00'}</div>
                    </div>
                </div>
            </div>

            <!-- Delete Order -->
            <div style="padding-top: 1rem; border-top: 1px solid var(--border);">
                <button class="action-btn danger" onclick="confirmDeleteOrder('${order.id}')" style="width: 100%; justify-content: center; background: var(--danger); color: white;">
                    Delete This Order
                </button>
            </div>
        </div>
    `;

    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    if (!window.firebaseDB) {
        alert('Firebase is not configured');
        return;
    }

    const orderRef = window.firebaseDB.ref(`orders/${orderId}`);
    const update = { status: newStatus };
    if (newStatus !== 'canceled') {
        update.cancelReason = null;
    }
    orderRef.update(update)
        .then(() => {
            closeModal();
        })
        .catch((error) => {
            console.error('Error updating order:', error);
            alert('Error updating order status');
        });
}

// Show cancel reason picker inside the order modal
function promptCancelReason(orderId) {
    const actionsDiv = document.getElementById('orderStatusActions');
    const panel = document.getElementById('cancelReasonPanel');
    if (actionsDiv) actionsDiv.style.display = 'none';
    if (panel) panel.style.display = 'block';
}

// Cancel order and save the reason to Firebase
function cancelOrderWithReason(orderId, reason) {
    if (!window.firebaseDB) {
        alert('Firebase is not configured');
        return;
    }
    const orderRef = window.firebaseDB.ref(`orders/${orderId}`);
    orderRef.update({ status: 'canceled', cancelReason: reason })
        .then(() => {
            closeModal();
        })
        .catch((error) => {
            console.error('Error canceling order:', error);
            alert('Error updating order status');
        });
}

// Confirm delete order
function confirmDeleteOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const orderCode = order.orderCode || 'this order';
    const confirmed = confirm(`Are you sure you want to delete ${orderCode}? This action cannot be undone.`);

    if (confirmed) {
        deleteOrder(orderId);
    }
}

// Delete order
function deleteOrder(orderId) {
    if (!window.firebaseDB) {
        alert('Firebase is not configured');
        return;
    }

    const orderRef = window.firebaseDB.ref(`orders/${orderId}`);
    orderRef.remove()
        .then(() => {
            alert('Order deleted successfully');
            closeModal();
        })
        .catch((error) => {
            console.error('Error deleting order:', error);
            alert('Error deleting order');
        });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Generate analytics
function generateAnalytics() {
    generateKeyMetrics();
    generateStatusBreakdownChart();
    generateCountryChart();
    generateCompletedByCountryChart();
    generateCanceledByCountryChart();
    generatePackageChart();
    generateCancelReasonsChart();
    generatePaymentChart();
    generateRevenueByCountryChart();
    generateRevenueChart();
}

// Generate country distribution chart
function generateCountryChart() {
    const container = document.getElementById('countryChart');
    if (!container) return;

    // Count orders by country
    const countryData = {};
    allOrders.forEach(order => {
        const country = order.shipping?.address?.country || 'Unknown';
        countryData[country] = (countryData[country] || 0) + 1;
    });

    // Sort by count
    const sortedCountries = Object.entries(countryData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 countries

    if (sortedCountries.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No data available</p>';
        return;
    }

    const maxCount = sortedCountries[0][1];

    const html = `
        <div style="display: grid; gap: 0.75rem;">
            ${sortedCountries.map(([country, count]) => {
                const percentage = (count / maxCount) * 100;
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem;">
                            <span style="font-weight: 500;">${country}</span>
                            <span style="color: var(--text-secondary);">${count} orders</span>
                        </div>
                        <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${percentage}%; background: var(--primary); transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
}

// Generate package distribution chart
function generatePackageChart() {
    const container = document.getElementById('packageChart');
    if (!container) return;

    // Count orders by package
    const packageData = {};
    allOrders.forEach(order => {
        const packageName = order.package?.name || 'Unknown';
        packageData[packageName] = (packageData[packageName] || 0) + 1;
    });

    const sortedPackages = Object.entries(packageData)
        .sort((a, b) => b[1] - a[1]);

    if (sortedPackages.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No data available</p>';
        return;
    }

    const total = sortedPackages.reduce((sum, [, count]) => sum + count, 0);
    const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--danger)', '#8b5cf6'];

    const html = `
        <div style="display: grid; gap: 0.75rem;">
            ${sortedPackages.map(([packageName, count], index) => {
                const percentage = ((count / total) * 100).toFixed(1);
                const color = colors[index % colors.length];
                return `
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; flex-shrink: 0;"></div>
                        <div style="flex: 1;">
                            <div style="font-size: 0.875rem; font-weight: 500;">${packageName}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary);">${count} orders (${percentage}%)</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
}

// Generate payment methods chart
function generatePaymentChart() {
    const container = document.getElementById('paymentChart');
    if (!container) return;

    // Count orders by payment method
    const paymentData = {};
    allOrders.forEach(order => {
        const method = order.payment?.method || 'Unknown';
        paymentData[method] = (paymentData[method] || 0) + 1;
    });

    const sortedMethods = Object.entries(paymentData)
        .sort((a, b) => b[1] - a[1]);

    if (sortedMethods.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No data available</p>';
        return;
    }

    const total = sortedMethods.reduce((sum, [, count]) => sum + count, 0);
    const colors = ['var(--success)', 'var(--primary)', 'var(--warning)', '#8b5cf6'];

    const html = `
        <div style="display: grid; gap: 0.75rem;">
            ${sortedMethods.map(([method, count], index) => {
                const percentage = ((count / total) * 100).toFixed(1);
                const color = colors[index % colors.length];
                return `
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; flex-shrink: 0;"></div>
                        <div style="flex: 1;">
                            <div style="font-size: 0.875rem; font-weight: 500;">${method}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary);">${count} orders (${percentage}%)</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
}

// Generate revenue trends chart
function generateRevenueChart() {
    const container = document.getElementById('revenueChart');
    if (!container) return;

    // Group completed orders by date
    const revenueByDate = {};
    allOrders.filter(o => o.status === 'completed').forEach(order => {
        if (order.timestamp && order.payment?.total) {
            const date = formatDate(order.timestamp);
            revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(order.payment.total);
        }
    });

    // Sort by date (last 30 days)
    const sortedDates = Object.entries(revenueByDate)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .slice(-30);

    if (sortedDates.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No data available</p>';
        return;
    }

    const maxRevenue = Math.max(...sortedDates.map(([, revenue]) => revenue));
    const totalRevenue = sortedDates.reduce((sum, [, revenue]) => sum + revenue, 0);
    const avgRevenue = totalRevenue / sortedDates.length;

    const html = `
        <div style="margin-bottom: 1.5rem; display: flex; gap: 2rem; flex-wrap: wrap;">
            <div>
                <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Total Revenue</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">€${totalRevenue.toFixed(2)}</div>
            </div>
            <div>
                <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Average Per Day</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">€${avgRevenue.toFixed(2)}</div>
            </div>
        </div>
        <div style="display: grid; gap: 0.5rem; max-height: 300px; overflow-y: auto;">
            ${sortedDates.reverse().slice(0, 15).map(([date, revenue]) => {
                const percentage = (revenue / maxRevenue) * 100;
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem;">
                            <span style="font-weight: 500;">${date}</span>
                            <span style="color: var(--primary); font-weight: 600;">€${revenue.toFixed(2)}</span>
                        </div>
                        <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${percentage}%; background: linear-gradient(90deg, var(--primary), var(--success)); transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
}

// Generate cancellation reasons chart
function generateCancelReasonsChart() {
    const container = document.getElementById('cancelReasonsChart');
    if (!container) return;

    const canceledOrders = allOrders.filter(o => o.status === 'canceled' && o.cancelReason);

    if (canceledOrders.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No cancellations with a recorded reason yet</p>';
        return;
    }

    const reasonData = {};
    canceledOrders.forEach(order => {
        const reason = order.cancelReason || 'Unknown';
        reasonData[reason] = (reasonData[reason] || 0) + 1;
    });

    const sortedReasons = Object.entries(reasonData).sort((a, b) => b[1] - a[1]);
    const total = sortedReasons.reduce((sum, [, count]) => sum + count, 0);
    const colors = ['var(--danger)', 'var(--warning)', '#8b5cf6', 'var(--primary)'];

    const html = `
        <div style="margin-bottom: 1rem; font-size: 0.8125rem; color: var(--text-secondary);">
            ${total} canceled order${total !== 1 ? 's' : ''} with reason recorded
        </div>
        <div style="display: grid; gap: 0.75rem;">
            ${sortedReasons.map(([reason, count], index) => {
                const percentage = ((count / total) * 100).toFixed(1);
                const color = colors[index % colors.length];
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem;">
                            <span style="font-weight: 500;">${reason}</span>
                            <span style="color: var(--text-secondary);">${count} (${percentage}%)</span>
                        </div>
                        <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${percentage}%; background: ${color}; transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
}

// Generate key business metrics strip
function generateKeyMetrics() {
    const container = document.getElementById('keyMetrics');
    if (!container) return;

    const total = allOrders.length;
    const completed = allOrders.filter(o => o.status === 'completed').length;
    const canceled = allOrders.filter(o => o.status === 'canceled').length;
    const pending = allOrders.filter(o => o.status === 'pending').length;
    const totalRevenue = allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (parseFloat(o.payment?.total) || 0), 0);

    const conversionRate = (completed + canceled) > 0
        ? ((completed / (completed + canceled)) * 100).toFixed(1)
        : '0.0';
    const cancellationRate = total > 0
        ? ((canceled / total) * 100).toFixed(1)
        : '0.0';
    const avgOrderValue = completed > 0
        ? (totalRevenue / completed).toFixed(2)
        : '0.00';

    const countryCompleted = {};
    allOrders.filter(o => o.status === 'completed').forEach(o => {
        const c = o.shipping?.address?.country || 'Unknown';
        countryCompleted[c] = (countryCompleted[c] || 0) + 1;
    });
    const bestCountry = Object.entries(countryCompleted).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const metrics = [
        { label: 'Conversion Rate', value: `${conversionRate}%`, color: 'var(--success)', desc: 'completed vs closed' },
        { label: 'Avg Order Value', value: `€${avgOrderValue}`, color: 'var(--primary)', desc: 'per completed order' },
        { label: 'Cancellation Rate', value: `${cancellationRate}%`, color: 'var(--danger)', desc: 'of all orders' },
        { label: 'Best Market', value: bestCountry, color: '#8b5cf6', desc: 'most completions' },
        { label: 'Pending', value: pending, color: 'var(--warning)', desc: 'awaiting action' },
    ];

    container.innerHTML = metrics.map(m => `
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem;">
            <div style="font-size: 0.6875rem; color: var(--text-secondary); margin-bottom: 0.375rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">${m.label}</div>
            <div style="font-size: 1.375rem; font-weight: 700; color: ${m.color}; line-height: 1.2; word-break: break-word;">${m.value}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">${m.desc}</div>
        </div>
    `).join('');
}

// Generate order status breakdown chart
function generateStatusBreakdownChart() {
    const container = document.getElementById('statusBreakdownChart');
    if (!container) return;

    const total = allOrders.length;
    if (total === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No data available</p>';
        return;
    }

    const statuses = [
        { label: 'Completed', count: allOrders.filter(o => o.status === 'completed').length, color: 'var(--success)' },
        { label: 'Pending',   count: allOrders.filter(o => o.status === 'pending').length,   color: 'var(--warning)' },
        { label: 'Canceled',  count: allOrders.filter(o => o.status === 'canceled').length,  color: 'var(--danger)' },
    ];

    container.innerHTML = `
        <div style="display: grid; gap: 0.75rem; margin-bottom: 1.25rem;">
            ${statuses.map(s => {
                const pct = ((s.count / total) * 100).toFixed(1);
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem;">
                            <span style="font-weight: 500;">${s.label}</span>
                            <span style="color: var(--text-secondary);">${s.count} (${pct}%)</span>
                        </div>
                        <div style="height: 10px; background: var(--border); border-radius: 5px; overflow: hidden;">
                            <div style="height: 100%; width: ${pct}%; background: ${s.color}; transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
            ${statuses.map(s => `
                <div style="text-align: center;">
                    <div style="font-size: 1.75rem; font-weight: 700; color: ${s.color};">${s.count}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${s.label}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Generate completed orders by country chart
function generateCompletedByCountryChart() {
    const container = document.getElementById('completedByCountryChart');
    if (!container) return;

    const countryData = {};
    allOrders.filter(o => o.status === 'completed').forEach(order => {
        const country = order.shipping?.address?.country || 'Unknown';
        countryData[country] = (countryData[country] || 0) + 1;
    });

    const sorted = Object.entries(countryData).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (sorted.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No completed orders yet</p>';
        return;
    }

    const max = sorted[0][1];
    container.innerHTML = `
        <div style="display: grid; gap: 0.75rem;">
            ${sorted.map(([country, count]) => {
                const pct = (count / max) * 100;
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem;">
                            <span style="font-weight: 500;">${country}</span>
                            <span style="color: var(--text-secondary);">${count} orders</span>
                        </div>
                        <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${pct}%; background: var(--success); transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Generate canceled orders by country chart
function generateCanceledByCountryChart() {
    const container = document.getElementById('canceledByCountryChart');
    if (!container) return;

    const countryData = {};
    allOrders.filter(o => o.status === 'canceled').forEach(order => {
        const country = order.shipping?.address?.country || 'Unknown';
        countryData[country] = (countryData[country] || 0) + 1;
    });

    const sorted = Object.entries(countryData).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (sorted.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No canceled orders yet</p>';
        return;
    }

    const max = sorted[0][1];
    container.innerHTML = `
        <div style="display: grid; gap: 0.75rem;">
            ${sorted.map(([country, count]) => {
                const pct = (count / max) * 100;
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem;">
                            <span style="font-weight: 500;">${country}</span>
                            <span style="color: var(--text-secondary);">${count} orders</span>
                        </div>
                        <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${pct}%; background: var(--danger); transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Generate revenue by country chart
function generateRevenueByCountryChart() {
    const container = document.getElementById('revenueByCountryChart');
    if (!container) return;

    const countryRevenue = {};
    allOrders.filter(o => o.status === 'completed').forEach(order => {
        const country = order.shipping?.address?.country || 'Unknown';
        countryRevenue[country] = (countryRevenue[country] || 0) + (parseFloat(order.payment?.total) || 0);
    });

    const sorted = Object.entries(countryRevenue).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (sorted.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No revenue data yet</p>';
        return;
    }

    const max = sorted[0][1];
    container.innerHTML = `
        <div style="display: grid; gap: 0.75rem;">
            ${sorted.map(([country, revenue]) => {
                const pct = (revenue / max) * 100;
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem;">
                            <span style="font-weight: 500;">${country}</span>
                            <span style="color: var(--primary); font-weight: 600;">€${revenue.toFixed(2)}</span>
                        </div>
                        <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, var(--primary), #8b5cf6); transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Date formatting functions
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

// ==================== POSTS MANAGEMENT ====================

// Load posts
function loadPosts() {
    const tableBody = document.getElementById('postsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="loading-cell">
                <div class="spinner"></div>
                <p>Loading posts...</p>
            </td>
        </tr>
    `;

    if (!window.firebaseDB) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">
                    <p style="color: var(--danger);">Firebase is not configured</p>
                </td>
            </tr>
        `;
        return;
    }

    try {
        const postsRef = window.firebaseDB.ref('posts');

        postsRef.on('value', (snapshot) => {
            allPosts = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const post = childSnapshot.val();
                    post.id = childSnapshot.key;
                    allPosts.push(post);
                });

                // Sort by timestamp (newest first)
                allPosts.sort((a, b) => {
                    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return timeB - timeA;
                });
            }

            displayPosts();
            updatePostsStats();
        }, (error) => {
            console.error('Error loading posts:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="loading-cell">
                        <p style="color: var(--danger);">Error loading posts</p>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error accessing Firebase:', error);
    }
}

// Display posts
function displayPosts() {
    const tableBody = document.getElementById('postsTableBody');
    if (!tableBody) return;

    if (allPosts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">
                    <p>No posts yet. Create your first post!</p>
                </td>
            </tr>
        `;
        return;
    }

    const rows = allPosts.map(post => {
        const title = post.title || '(No title)';
        const views = post.views || 0;
        const likes = post.likes || 0;
        const date = post.timestamp ? formatDate(post.timestamp) : 'N/A';
        const published = post.published !== false;
        const statusBadge = published
            ? '<span class="status-badge completed">Published</span>'
            : '<span class="status-badge pending">Draft</span>';

        return `
            <tr>
                <td><strong>${escapeHtml(title)}</strong></td>
                <td>${views}</td>
                <td>${likes}</td>
                <td>${date}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="action-btn primary" onclick="editPost('${post.id}')">Edit</button>
                    <button class="action-btn danger" onclick="confirmDeletePost('${post.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;
}

// Update posts stats
function updatePostsStats() {
    const badgeEl = document.getElementById('postsBadge');
    if (badgeEl) {
        const publishedCount = allPosts.filter(p => p.published !== false).length;
        badgeEl.textContent = publishedCount;
    }
}

// Open create post modal
function openCreatePostModal() {
    currentPostId = null;
    selectedImageFile = null;
    currentImageUrl = null;
    const modal = document.getElementById('postModal');
    const modalTitle = document.getElementById('postModalTitle');
    const form = document.getElementById('postForm');

    if (modalTitle) modalTitle.textContent = 'Create New Post';
    if (form) form.reset();

    document.getElementById('postViews').value = '0';
    document.getElementById('postLikes').value = '0';
    document.getElementById('postPublished').checked = true;

    // Reset image preview
    removeImage();

    if (modal) modal.classList.add('active');
}

// Edit post
function editPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    currentPostId = postId;
    selectedImageFile = null;
    currentImageUrl = post.imageUrl || null;
    const modal = document.getElementById('postModal');
    const modalTitle = document.getElementById('postModalTitle');

    if (modalTitle) modalTitle.textContent = 'Edit Post';

    document.getElementById('postTitle').value = post.title || '';
    document.getElementById('postContent').value = post.content || '';
    document.getElementById('postViews').value = post.views || 0;
    document.getElementById('postLikes').value = post.likes || 0;
    document.getElementById('postPublished').checked = post.published !== false;

    // Show existing image if present
    const preview = document.getElementById('imagePreview');
    const container = document.getElementById('imagePreviewContainer');
    const fileInput = document.getElementById('postImage');

    if (fileInput) fileInput.value = '';

    if (post.imageUrl && preview && container) {
        preview.src = post.imageUrl;
        container.style.display = 'block';
    } else if (container) {
        container.style.display = 'none';
    }

    if (modal) modal.classList.add('active');
}

// Close post modal
function closePostModal() {
    const modal = document.getElementById('postModal');
    if (modal) modal.classList.remove('active');
    currentPostId = null;
}

// Save post
document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePost();
        });
    }
});

async function savePost() {
    if (!window.firebaseDB) {
        alert('Firebase is not configured');
        return;
    }

    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const views = parseInt(document.getElementById('postViews').value) || 0;
    const likes = parseInt(document.getElementById('postLikes').value) || 0;
    const published = document.getElementById('postPublished').checked;

    if (!content) {
        alert('Content is required');
        return;
    }

    const submitButton = document.querySelector('#postForm button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';

    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';
        }

        let imageUrl = currentImageUrl;

        // Handle image upload
        if (selectedImageFile) {
            // Upload new image
            imageUrl = await uploadImage(selectedImageFile);

            // Delete old image if editing and had an old image
            if (currentPostId && currentImageUrl && currentImageUrl !== imageUrl) {
                await deleteImageFromStorage(currentImageUrl);
            }
        }

        const postData = {
            title: title,
            content: content,
            views: views,
            likes: likes,
            published: published,
            timestamp: currentPostId ?
                (allPosts.find(p => p.id === currentPostId)?.timestamp || Date.now()) :
                Date.now()
        };

        // Add imageUrl only if it exists
        if (imageUrl) {
            postData.imageUrl = imageUrl;
        }

        if (currentPostId) {
            // Update existing post
            const postRef = window.firebaseDB.ref(`posts/${currentPostId}`);
            await postRef.update(postData);
            alert('Post updated successfully');
        } else {
            // Create new post
            const postsRef = window.firebaseDB.ref('posts');
            await postsRef.push(postData);
            alert('Post created successfully');
        }

        closePostModal();
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Error saving post: ' + error.message);
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }
}

// Confirm delete post
function confirmDeletePost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    const title = post.title || 'this post';
    const confirmed = confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`);

    if (confirmed) {
        deletePost(postId);
    }
}

// Delete post
async function deletePost(postId) {
    if (!window.firebaseDB) {
        alert('Firebase is not configured');
        return;
    }

    try {
        const post = allPosts.find(p => p.id === postId);

        // Delete image from storage if it exists
        if (post && post.imageUrl) {
            await deleteImageFromStorage(post.imageUrl);
        }

        // Delete post from database
        const postRef = window.firebaseDB.ref(`posts/${postId}`);
        await postRef.remove();
        alert('Post deleted successfully');
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post');
    }
}

// Escape HTML helper
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Handle image selection
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB for database storage');
        return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    selectedImageFile = file;

    // Show preview and convert to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        const container = document.getElementById('imagePreviewContainer');
        if (preview && container) {
            preview.src = e.target.result;
            container.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

// Remove image
function removeImage() {
    selectedImageFile = null;
    currentImageUrl = null;
    const preview = document.getElementById('imagePreview');
    const container = document.getElementById('imagePreviewContainer');
    const fileInput = document.getElementById('postImage');

    if (preview) preview.src = '';
    if (container) container.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

// Convert image to base64 (store directly in database)
async function uploadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result); // Returns base64 string
        };
        reader.onerror = function(error) {
            console.error('Error reading image:', error);
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

// Delete image from storage (no-op for base64, image is deleted with post)
async function deleteImageFromStorage(imageUrl) {
    // No action needed - base64 images are stored in database
    // They will be deleted automatically when the post is deleted
    return Promise.resolve();
}

// Make functions globally accessible
window.toggleSidebar = toggleSidebar;
window.switchTab = switchTab;
window.loadOrders = loadOrders;
window.filterOrders = filterOrders;
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.promptCancelReason = promptCancelReason;
window.cancelOrderWithReason = cancelOrderWithReason;
window.confirmDeleteOrder = confirmDeleteOrder;
window.deleteOrder = deleteOrder;
window.closeModal = closeModal;
window.loadPosts = loadPosts;
window.openCreatePostModal = openCreatePostModal;
window.editPost = editPost;
window.closePostModal = closePostModal;
window.confirmDeletePost = confirmDeletePost;
window.deletePost = deletePost;
window.handleImageSelect = handleImageSelect;
window.removeImage = removeImage;