// Admin Panel JavaScript - Mobile-First Design
let allOrders = [];
let filteredOrders = [];
let currentFilter = 'all';
let currentTab = 'orders';
let allPosts = [];
let currentPostId = null;

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
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.payment?.total || 0), 0);

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
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                    <button class="action-btn" onclick="updateOrderStatus('${order.id}', 'pending')" style="background: rgba(245, 158, 11, 0.1); color: var(--warning); border-color: var(--warning);">Mark Pending</button>
                    <button class="action-btn" onclick="updateOrderStatus('${order.id}', 'completed')" style="background: rgba(16, 185, 129, 0.1); color: var(--success); border-color: var(--success);">Mark Completed</button>
                    <button class="action-btn" onclick="updateOrderStatus('${order.id}', 'canceled')" style="background: rgba(239, 68, 68, 0.1); color: var(--danger); border-color: var(--danger);">Mark Canceled</button>
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
                        <div style="font-weight: 500;">${getValue(order, 'personalInfo.telegram')}</div>
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
    orderRef.update({ status: newStatus })
        .then(() => {
            alert(`Order status updated to ${newStatus}`);
            closeModal();
        })
        .catch((error) => {
            console.error('Error updating order:', error);
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
    generateCountryChart();
    generatePackageChart();
    generatePaymentChart();
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

    // Group orders by date
    const revenueByDate = {};
    allOrders.forEach(order => {
        if (order.timestamp && order.payment?.total) {
            const date = formatDate(order.timestamp);
            revenueByDate[date] = (revenueByDate[date] || 0) + order.payment.total;
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
    const modal = document.getElementById('postModal');
    const modalTitle = document.getElementById('postModalTitle');
    const form = document.getElementById('postForm');

    if (modalTitle) modalTitle.textContent = 'Create New Post';
    if (form) form.reset();

    document.getElementById('postViews').value = '0';
    document.getElementById('postLikes').value = '0';
    document.getElementById('postPublished').checked = true;

    if (modal) modal.classList.add('active');
}

// Edit post
function editPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    currentPostId = postId;
    const modal = document.getElementById('postModal');
    const modalTitle = document.getElementById('postModalTitle');

    if (modalTitle) modalTitle.textContent = 'Edit Post';

    document.getElementById('postTitle').value = post.title || '';
    document.getElementById('postContent').value = post.content || '';
    document.getElementById('postViews').value = post.views || 0;
    document.getElementById('postLikes').value = post.likes || 0;
    document.getElementById('postPublished').checked = post.published !== false;

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

function savePost() {
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

    if (currentPostId) {
        // Update existing post
        const postRef = window.firebaseDB.ref(`posts/${currentPostId}`);
        postRef.update(postData)
            .then(() => {
                alert('Post updated successfully');
                closePostModal();
            })
            .catch((error) => {
                console.error('Error updating post:', error);
                alert('Error updating post');
            });
    } else {
        // Create new post
        const postsRef = window.firebaseDB.ref('posts');
        postsRef.push(postData)
            .then(() => {
                alert('Post created successfully');
                closePostModal();
            })
            .catch((error) => {
                console.error('Error creating post:', error);
                alert('Error creating post');
            });
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
function deletePost(postId) {
    if (!window.firebaseDB) {
        alert('Firebase is not configured');
        return;
    }

    const postRef = window.firebaseDB.ref(`posts/${postId}`);
    postRef.remove()
        .then(() => {
            alert('Post deleted successfully');
        })
        .catch((error) => {
            console.error('Error deleting post:', error);
            alert('Error deleting post');
        });
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

// Make functions globally accessible
window.toggleSidebar = toggleSidebar;
window.switchTab = switchTab;
window.loadOrders = loadOrders;
window.filterOrders = filterOrders;
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.confirmDeleteOrder = confirmDeleteOrder;
window.deleteOrder = deleteOrder;
window.closeModal = closeModal;
window.loadPosts = loadPosts;
window.openCreatePostModal = openCreatePostModal;
window.editPost = editPost;
window.closePostModal = closePostModal;
window.confirmDeletePost = confirmDeletePost;
window.deletePost = deletePost;
