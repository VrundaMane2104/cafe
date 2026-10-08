// Data structures
let menuItems = [];
let orders = [];
let orderHistory = [];
let orderIdCounter = 1;

// Initialize with some default menu items
function initializeDefaultMenu() {
    const defaultItems = [
        { id: 1, name: 'Espresso', price: 3.50, category: 'Coffee' },
        { id: 2, name: 'Cappuccino', price: 4.50, category: 'Coffee' },
        { id: 3, name: 'Latte', price: 4.75, category: 'Coffee' },
        { id: 4, name: 'Green Tea', price: 3.00, category: 'Tea' },
        { id: 5, name: 'Croissant', price: 3.25, category: 'Pastries' },
        { id: 6, name: 'Blueberry Muffin', price: 3.75, category: 'Pastries' },
        { id: 7, name: 'Club Sandwich', price: 7.50, category: 'Sandwiches' },
        { id: 8, name: 'Orange Juice', price: 3.50, category: 'Beverages' }
    ];
    
    menuItems = defaultItems;
    renderMenu();
    updateOrderItemSelect();
}

// Add new menu item
function addMenuItem() {
    const name = document.getElementById('itemName').value.trim();
    const price = parseFloat(document.getElementById('itemPrice').value);
    const category = document.getElementById('itemCategory').value;

    if (!name || isNaN(price) || price <= 0) {
        alert('Please enter valid item name and price');
        return;
    }

    const newItem = {
        id: menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1,
        name,
        price,
        category
    };

    menuItems.push(newItem);
    
    // Clear inputs
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    
    renderMenu();
    updateOrderItemSelect();
    saveToLocalStorage();
}

// Remove menu item
function removeMenuItem(id) {
    if (confirm('Are you sure you want to remove this item?')) {
        menuItems = menuItems.filter(item => item.id !== id);
        renderMenu();
        updateOrderItemSelect();
        saveToLocalStorage();
    }
}

// Render menu items
function renderMenu() {
    const menuGrid = document.getElementById('menuGrid');
    
    if (menuItems.length === 0) {
        menuGrid.innerHTML = '<div class="empty-state">No menu items yet. Add your first item!</div>';
        return;
    }

    menuGrid.innerHTML = menuItems.map(item => `
        <div class="menu-item">
            <span class="menu-item-category">${item.category}</span>
            <h3>${item.name}</h3>
            <div class="menu-item-price">$${item.price.toFixed(2)}</div>
            <button onclick="removeMenuItem(${item.id})" class="btn btn-danger">Remove</button>
        </div>
    `).join('');
}

// Update order item select dropdown
function updateOrderItemSelect() {
    const select = document.getElementById('orderItem');
    select.innerHTML = '<option value="">Select item</option>' + 
        menuItems.map(item => 
            `<option value="${item.id}">${item.name} - $${item.price.toFixed(2)}</option>`
        ).join('');
}

// Create new order
function createOrder() {
    const itemId = parseInt(document.getElementById('orderItem').value);
    const quantity = parseInt(document.getElementById('orderQuantity').value);
    const customerName = document.getElementById('customerName').value.trim();

    if (!itemId || isNaN(quantity) || quantity <= 0) {
        alert('Please select an item and enter valid quantity');
        return;
    }

    if (!customerName) {
        alert('Please enter customer name');
        return;
    }

    const menuItem = menuItems.find(item => item.id === itemId);
    if (!menuItem) return;

    const order = {
        id: orderIdCounter++,
        customer: customerName,
        items: [{
            name: menuItem.name,
            price: menuItem.price,
            quantity: quantity
        }],
        total: menuItem.price * quantity,
        status: 'pending',
        timestamp: new Date().toISOString()
    };

    orders.push(order);
    
    // Clear inputs
    document.getElementById('orderItem').value = '';
    document.getElementById('orderQuantity').value = '1';
    document.getElementById('customerName').value = '';
    
    renderOrders();
    updateStats();
    saveToLocalStorage();
}

// Complete order
function completeOrder(id) {
    const order = orders.find(o => o.id === id);
    if (order) {
        order.status = 'completed';
        order.completedTime = new Date().toISOString();
        orderHistory.unshift(order);
        orders = orders.filter(o => o.id !== id);
        
        renderOrders();
        renderHistory();
        updateStats();
        saveToLocalStorage();
    }
}

// Cancel order
function cancelOrder(id) {
    if (confirm('Are you sure you want to cancel this order?')) {
        orders = orders.filter(o => o.id !== id);
        renderOrders();
        updateStats();
        saveToLocalStorage();
    }
}

// Render current orders
function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="empty-state">No pending orders</div>';
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-customer">${order.customer}</span>
                <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">Total: $${order.total.toFixed(2)}</div>
            <div class="order-time">${formatTime(order.timestamp)}</div>
            <div class="order-actions">
                <button onclick="completeOrder(${order.id})" class="btn btn-complete">Complete</button>
                <button onclick="cancelOrder(${order.id})" class="btn btn-danger">Cancel</button>
            </div>
        </div>
    `).join('');
}

// Render order history
function renderHistory() {
    const historyList = document.getElementById('historyList');
    
    if (orderHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No completed orders yet</div>';
        return;
    }

    const recentHistory = orderHistory.slice(0, 10);
    
    historyList.innerHTML = recentHistory.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-customer">${order.customer}</span>
                <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">Total: $${order.total.toFixed(2)}</div>
            <div class="order-time">Completed: ${formatTime(order.completedTime)}</div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const totalOrders = orders.length + orderHistory.length;
    const totalRevenue = orderHistory.reduce((sum, order) => sum + order.total, 0);
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Local storage functions
function saveToLocalStorage() {
    localStorage.setItem('cafeMenuItems', JSON.stringify(menuItems));
    localStorage.setItem('cafeOrders', JSON.stringify(orders));
    localStorage.setItem('cafeOrderHistory', JSON.stringify(orderHistory));
    localStorage.setItem('cafeOrderIdCounter', orderIdCounter.toString());
}

function loadFromLocalStorage() {
    const savedMenu = localStorage.getItem('cafeMenuItems');
    const savedOrders = localStorage.getItem('cafeOrders');
    const savedHistory = localStorage.getItem('cafeOrderHistory');
    const savedCounter = localStorage.getItem('cafeOrderIdCounter');

    if (savedMenu) {
        menuItems = JSON.parse(savedMenu);
    } else {
        initializeDefaultMenu();
        return;
    }

    if (savedOrders) orders = JSON.parse(savedOrders);
    if (savedHistory) orderHistory = JSON.parse(savedHistory);
    if (savedCounter) orderIdCounter = parseInt(savedCounter);

    renderMenu();
    renderOrders();
    renderHistory();
    updateOrderItemSelect();
    updateStats();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
});
