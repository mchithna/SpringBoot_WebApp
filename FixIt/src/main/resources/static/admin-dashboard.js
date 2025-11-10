// FIXIT ADMIN DASHBOARD

let bookingChartInstance = null;
let currentProviderTab = 'all';
let currentUserPage = 0;
let currentBookingPage = 0; // NEW
let allAdminBookings = [];
let allCategoryStats = null;

// INITIALIZATION

document.addEventListener('DOMContentLoaded', () => {
    // Initialize language
    const savedLanguage = localStorage.getItem('language') || 'en';
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
        updateAdminLanguage(savedLanguage);
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }
    }

    // Display current date
    displayCurrentDate();

    // Initialize navigation
    initializeNavigation();

    // Initialize mobile menu
    initializeMobileMenu();

    // Initialize tabs
    initializeTabs();

    // Load dashboard stats
    loadDashboardStats();

    // Initialize the booking details modal
    initializeAdminDetailsModal();

    // Add logout functionality
    const logoutButton = document.getElementById('logoutButton');
    if(logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            apiService.logout();
            window.location.href = 'login2.html';
        });
    }

    // Add listeners for provider action buttons (using event delegation)
    const providerGrid = document.getElementById('providers-grid-container');
    if (providerGrid) {
        providerGrid.addEventListener('click', (e) => {
            const approveBtn = e.target.closest('.btn-admin-approve');
            const suspendBtn = e.target.closest('.btn-admin-suspend');

            if (approveBtn) {
                handleApproveProvider(e, approveBtn.dataset.providerId);
            } else if (suspendBtn) {
                handleSuspendProvider(e, suspendBtn.dataset.providerId);
            }
        });
    }

    // Load admin name
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.name) {
        const adminNameEl = document.querySelector('.user-menu .user-name');
        const adminAvatarEl = document.querySelector('.user-menu .user-avatar');

        if (adminNameEl) {
            adminNameEl.textContent = userInfo.name;
        }
        if (adminAvatarEl) {
            adminAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=2563eb&color=fff`;
        }
    }

    // Listeners for User Table
    const userTableBody = document.getElementById('users-table-body');
    if (userTableBody) {
        userTableBody.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-admin-delete');
            if (deleteBtn) {
                handleDeleteUser(e, deleteBtn.dataset.userId);
            }
        });
    }
    // Listeners for User Pagination
    const userPrevBtn = document.getElementById('users-prev-btn');
    const userNextBtn = document.getElementById('users-next-btn');

    if (userPrevBtn) {
        userPrevBtn.addEventListener('click', () => {
            if (currentUserPage > 0) {
                loadUsers(currentUserPage - 1);
            }
        });
    }

    if (userNextBtn) {
        userNextBtn.addEventListener('click', () => {
            // We'll let loadUsers handle the max page check
            loadUsers(currentUserPage + 1);
        });
    }

    // NEW: Listeners for Booking Pagination
    const bookingPrevBtn = document.getElementById('bookings-prev-btn');
    const bookingNextBtn = document.getElementById('bookings-next-btn');

    if (bookingPrevBtn) {
        bookingPrevBtn.addEventListener('click', () => {
            if (currentBookingPage > 0) {
                loadAdminBookings(currentBookingPage - 1);
            }
        });
    }
    if (bookingNextBtn) {
        bookingNextBtn.addEventListener('click', () => {
            loadAdminBookings(currentBookingPage + 1);
        });
    }
});

// LOAD DASHBOARD STATS
async function loadDashboardStats() {
    try {
        const stats = await apiService.request(API_CONFIG.ENDPOINTS.ADMIN_STATS, { method: 'GET' });

        // 1. Populate the 4 stat cards
        document.getElementById('stats-total-users').textContent = stats.totalUsers;
        document.getElementById('stats-active-providers').textContent = stats.totalProviders;
        document.getElementById('stats-total-bookings').textContent = stats.totalBookings;
        document.getElementById('stats-total-services').textContent = stats.totalServices;

        // Populate Sidebar Badges
        document.getElementById('nav-badge-users').textContent = stats.totalUsers;
        document.getElementById('nav-badge-providers').textContent = stats.totalProviders;
        document.getElementById('nav-badge-bookings').textContent = stats.totalBookings;

        allCategoryStats = {
            bookingStats: stats.bookingStats || [],
            serviceStats: stats.serviceStats || []
        };
        // 2. Populate the charts (logic moved from loadDashboardCharts)
        if (stats.bookingStats) {
            renderBookingChart(stats.bookingStats);
        }

        if (stats.serviceStats) {
            renderServiceOverview(stats.serviceStats);
        }
        if (document.getElementById('services-section').classList.contains('active')) {
            loadServiceCategories();
        }


    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Set to 'Error' if loading fails
        document.getElementById('stats-total-users').textContent = 'Error';
        document.getElementById('stats-active-providers').textContent = 'Error';
        document.getElementById('stats-total-bookings').textContent = 'Error';
        document.getElementById('stats-total-services').textContent = 'Error';
    }
}

// Renders the "Booking Trends" bar chart.

function renderBookingChart(data) {
    const ctx = document.getElementById('bookingChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (bookingChartInstance) {
        bookingChartInstance.destroy();
    }

    const labels = data.map(item => item.categoryName);
    const counts = data.map(item => item.count);

    // Get theme-aware colors
    const isDarkMode = document.body.classList.contains('dark-mode');
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const labelColor = isDarkMode ? '#f3f4f6' : '#1f2937';

    bookingChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Bookings',
                data: counts,
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1,
                borderRadius: 5,
                hoverBackgroundColor: 'rgba(37, 99, 235, 0.9)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hide the legend
                },
                tooltip: {
                    backgroundColor: '#1f2937',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 6,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: labelColor,
                        // Ensure only whole numbers are shown on the y-axis
                        precision: 0
                    }
                },
                x: {
                    grid: {
                        display: false // Hide x-axis grid lines
                    },
                    ticks: {
                        color: labelColor
                    }
                }
            }
        }
    });
}

//Renders the "Services Overview" list.

function renderServiceOverview(data) {
    const listContainer = document.getElementById('service-overview-list');
    if (!listContainer) return;

    // Clear dummy content
    listContainer.innerHTML = '';

    // Define colors to cycle through
    const colors = ['blue', 'green', 'orange', 'purple', 'red']; // Add more if needed

    if (data.length === 0) {
        listContainer.innerHTML = '<p>No services found in any categories.</p>';
        return;
    }

    data.forEach((item, index) => {
        const colorClass = colors[index % colors.length]; // Cycle through colors

        const itemHtml = `
            <div class="revenue-item">
                <div class="revenue-label">
                    <span class="revenue-dot ${colorClass}"></span>
                    <span>${item.categoryName}</span>
                </div>
                <strong>${item.count}</strong>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
}


/* ==========================================
   2. THEME TOGGLE
   ========================================== */
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');

        if (document.body.classList.contains('dark-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });
}

/* ==========================================
   3. LANGUAGE SWITCHER
   ========================================== */
const languageSelect = document.getElementById('languageSelect');
if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
        updateAdminLanguage(e.target.value);
    });
}

/* ==========================================
   4. DISPLAY CURRENT DATE
   ========================================== */
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

/* ==========================================
   5. NAVIGATION
   ========================================== */
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add active class to clicked item
            item.classList.add('active');

            // Get target section
            const targetSectionId = item.getAttribute('data-section');

            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));

            // Show target section
            const targetElement = document.getElementById(`${targetSectionId}-section`);
            if (targetElement) {
                targetElement.classList.add('active');
            }

            if (targetSectionId === 'providers') {
                // Load the 'all' tab by default
                loadProvidersByStatus('all');
                // Ensure the 'all' tab is visually active
                document.querySelectorAll('#providers-section .tab').forEach(t => t.classList.remove('active'));
                document.querySelector('#providers-section .tab[data-tab="all"]').classList.add('active');
            } else if (targetSectionId === 'users') {
                // Load first page of users
                currentUserPage = 0;
                loadUsers(currentUserPage);
            } else if (targetSectionId === 'bookings') {
                // Load first page of bookings
                currentBookingPage = 0;
                loadAdminBookings(currentBookingPage);
            } else if (targetSectionId === 'services') {
                // Load service categories
                loadServiceCategories();
            }

            // Close mobile menu if open
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('active');
            }
        });
    });
}

/* ==========================================
   6. MOBILE MENU
   ========================================== */
function initializeMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

/* ==========================================
   7. TABS FUNCTIONALITY
   ========================================== */
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const parentContainer = this.closest('.content-section');
            const allTabs = parentContainer.querySelectorAll('.tab');

            // Remove active class from all tabs in this section
            allTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Get tab type
            const tabType = this.getAttribute('data-tab');

            // Filter content based on tab
            if (parentContainer.id === 'providers-section') {
                currentProviderTab = tabType; // Store current tab
                loadProvidersByStatus(tabType);
            } else if (parentContainer.id === 'users-section') {
            } else if (parentContainer.id === 'bookings-section') {
                // This logic is no longer needed as we removed the tabs
                // filterBookingTable(tabType, parentContainer); 
            }
        });
    });
}
// Placeholder filter functions for other tabs
function filterUserTable(type, container) {
    console.log(`Filtering user table by: ${type}`);
    // Add logic to filter the user table rows
}

// REMOVED: filterBookingTable(type, container) - No longer needed

/* ==========================================
   9. NEW: PROVIDER MANAGEMENT
   ========================================== */

/**
 * Loads providers from the API based on the selected status tab.
 * @param {string} status - 'all', 'PENDING_APPROVAL', 'VERIFIED', 'SUSPENDED'
 */
async function loadProvidersByStatus(status) {
    const grid = document.getElementById('providers-grid-container');
    if (!grid) return;

    grid.innerHTML = '<p>Loading providers...</p>';
    currentProviderTab = status; // Update global state

    try {
        const providers = await apiService.adminGetProviders(status);
        grid.innerHTML = ''; // Clear loading message

        if (providers.length === 0) {
            grid.innerHTML = '<p>No providers found for this status.</p>';
            return;
        }

        providers.forEach(provider => {
            const cardHtml = createProviderCardHtml(provider);
            grid.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Re-apply translations
        updateAdminLanguage(localStorage.getItem('language') || 'en');

    } catch (error) {
        console.error(`Failed to load providers: ${error.message}`);
        grid.innerHTML = `<p>Error loading providers: ${error.message}</p>`;
    }
}

/**
 * Creates the HTML for a single provider card.
 * @param {object} provider - The AdminProviderViewDTO object
 * @returns {string} HTML string for the card
 */
function createProviderCardHtml(provider) {
    const { id, name, location, contactNo, email, status, categories } = provider;

    let statusBadge = '';
    let actionButtons = '';

    // Determine badge and buttons based on status
    switch (status) {
        case 'PENDING_APPROVAL':
            statusBadge = `
                <div class="provider-badge pending">
                    <i class="fas fa-clock"></i>
                </div>`;
            actionButtons = `
                <button class="btn-approve btn-sm btn-admin-approve" data-provider-id="${id}" data-i18n="approve">Approve</button>
                <button class="btn-reject btn-sm btn-admin-suspend" data-provider-id="${id}" data-i18n="reject">Reject</button>`;
            break;
        case 'VERIFIED':
            statusBadge = `
                <div class="provider-badge verified">
                    <i class="fas fa-check-circle"></i>
                </div>`;
            actionButtons = `
                <button class="btn-reject btn-sm btn-admin-suspend" data-provider-id="${id}" >Suspend</button>`;
            break;
        case 'SUSPENDED':
            statusBadge = `
                <div class="provider-badge suspended" style="background: var(--danger-color);">
                    <i class="fas fa-ban"></i>
                </div>`;
            actionButtons = `
                <button class="btn-approve btn-sm btn-admin-approve" data-provider-id="${id}" >Un-suspend</button>`;
            break;
    }

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=80`;

    return `
    <div class="provider-card">
        <div class="provider-header">
            <img src="${avatarUrl}" alt="${name}">
            ${statusBadge}
        </div>
        <h3>${name}</h3>
        <p class="provider-category">${categories || 'N/A'}</p>
        
        <!-- New Details Section -->
        <div class="provider-details">
             <div class="provider-detail-item">
                <i class="fas fa-envelope"></i>
                <span>${email}</span>
            </div>
            <div class="provider-detail-item">
                <i class="fas fa-phone"></i>
                <span>${contactNo || 'N/A'}</span>
            </div>
            <div class="provider-detail-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${location || 'N/A'}</span>
            </div>
        </div>

        <div class="provider-actions">
            ${actionButtons}
        </div>
    </div>`;
}

/**
 * Handles the click event for approving a provider.
 */
async function handleApproveProvider(event, providerId) {
    event.target.disabled = true;
    event.target.textContent = 'Approving...';

    try {
        const response = await apiService.adminApproveProvider(providerId);
        showToast(response.message, false);
        loadProvidersByStatus(currentProviderTab); // Refresh the current tab
    } catch (error) {
        showToast(`Error: ${error.message}`, true);
        event.target.disabled = false;
        event.target.textContent = 'Approve';
    }
}

/**
 * Handles the click event for suspending a provider.
 */
async function handleSuspendProvider(event, providerId) {
    event.target.disabled = true;
    event.target.textContent = 'Suspending...';

    try {
        const response = await apiService.adminSuspendProvider(providerId);
        showToast(response.message, false);
        loadProvidersByStatus(currentProviderTab); // Refresh the current tab
    } catch (error) {
        showToast(`Error: ${error.message}`, true);
        event.target.disabled = false;
        event.target.textContent = 'Suspend';
    }
}

// USER MANAGEMENT


//Loads a page of users from the API.

async function loadUsers(page = 0) {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Loading users...</td></tr>`;

    try {
        const pageData = await apiService.adminGetUsers(page, 5);
        tableBody.innerHTML = ''; // Clear loading message

        if (pageData.content.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No users found.</td></tr>`;
        } else {
            pageData.content.forEach(user => {
                const rowHtml = createUserRowHtml(user);
                tableBody.insertAdjacentHTML('beforeend', rowHtml);
            });
        }

        // Update global page number
        currentUserPage = pageData.number;
        // Update pagination controls
        updateUserPagination(pageData);

    } catch (error) {
        console.error(`Failed to load users: ${error.message}`);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Error loading users: ${error.message}</td></tr>`;
    }
}

// Creates the HTML for a single user row.

function createUserRowHtml(user) {
    const { id, name, email, contactNo, address, bookingCount } = user;
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`;

    const displayAddress = address ? address : 'not provided';

    return `
        <tr>
            <td>${id}</td>
            <td>
                <div class="customer-cell">
                    <img src="${avatarUrl}" alt="${name}">
                    <span>${name}</span>
                </div>
            </td>
            <td>${email}</td>
            <td>${contactNo || 'N/A'}</td>
            <td>${displayAddress}</td>
            <td>${bookingCount}</td>
            <td>
                <button class="btn-icon btn-admin-delete" title="Delete" data-user-id="${id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

// Updates the pagination controls based on the Page object from Spring

function updateUserPagination(pageData) {
    const pageInfo = document.getElementById('users-page-info');
    const prevBtn = document.getElementById('users-prev-btn');
    const nextBtn = document.getElementById('users-next-btn');

    if (!pageInfo || !prevBtn || !nextBtn) return;

    if (pageData.totalElements === 0) {
        pageInfo.textContent = 'No users found';
    } else {
        pageInfo.textContent = `Page ${pageData.number + 1} of ${pageData.totalPages}`;
    }

    prevBtn.disabled = pageData.first; // Disable on first page
    nextBtn.disabled = pageData.last;   // Disable on last page
}

// Handles the click event for deleting a user.

async function handleDeleteUser(event, userId) {
    const lang = localStorage.getItem('language') || 'en';
    const confirmMessage = lang === 'en'
        ? 'Are you sure you want to delete this user? This action cannot be undone.'
        : 'මෙම පරිශීලකයා මකා දැමීමට ඔබට විශ්වාසද? මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.';

    if (confirm(confirmMessage)) {
        const btn = event.target.closest('button');
        btn.disabled = true;

        try {
            const response = await apiService.adminDeleteUser(userId);
            showToast(response.message, false);
            loadUsers(currentUserPage); // Refresh the current page
        } catch (error) {
            showToast(`Error: ${error.message}`, true);
            btn.disabled = false;
        }
    }
}

/* ==========================================
   NEW: SERVICE CATEGORY MANAGEMENT
   ========================================== */


function loadServiceCategories() {
    const grid = document.getElementById('service-categories-grid');
    if (!grid) return;

    if (!allCategoryStats || !allCategoryStats.bookingStats) {
        grid.innerHTML = '<p data-i18n="loading-stats">Loading stats... Please wait.</p>';
        // If stats aren't loaded, try loading them again and re-call this function
        if (!allCategoryStats) {
            loadDashboardStats().then(loadServiceCategories);
        }
        updateAdminLanguage(localStorage.getItem('language') || 'en');
        return;
    }

    renderServiceCategories(allCategoryStats);
}


function renderServiceCategories(statsData) {
    const grid = document.getElementById('service-categories-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Create a map of service counts for easy lookup
    const serviceCountMap = new Map(statsData.serviceStats.map(s => [s.categoryName, s.count]));
    const bookingStats = statsData.bookingStats || [];

    if (bookingStats.length === 0) {
        grid.innerHTML = '<p data-i18n="no-categories-found">No service categories found.</p>';
        updateAdminLanguage(localStorage.getItem('language') || 'en');
        return;
    }

    // Loop through bookingStats (which represents all categories)
    bookingStats.forEach(category => {
        const categoryName = category.categoryName;
        const bookingCount = category.count;
        const serviceCount = serviceCountMap.get(categoryName) || 0; // Get corresponding service count

        const cardHtml = createCategoryCardHtml(categoryName, bookingCount, serviceCount);
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });

    // Apply translations to the new cards
    updateAdminLanguage(localStorage.getItem('language') || 'en');
}


function getCategoryIcon(categoryName) {
    const name = categoryName.toLowerCase();
    if (name.includes('electric')) return 'fa-bolt';
    if (name.includes('plumb')) return 'fa-wrench';
    if (name.includes('clean')) return 'fa-broom';
    if (name.includes('paint')) return 'fa-paint-roller';
    if (name.includes('carpen')) return 'fa-hammer';
    if (name.includes('garden')) return 'fa-leaf';
    if (name.includes('appliance')) return 'fa-blender-phone';
    if (name.includes('auto')) return 'fa-car';
    return 'fa-tools'; // Default
}

function createCategoryCardHtml(categoryName, bookingCount, serviceCount) {
    const iconClass = getCategoryIcon(categoryName);

    // Using 'service-card-admin' but adding 'category-card' for new styles
    return `
    <div class="service-card-admin category-card">
        <div class="service-icon-large blue">
            <i class="fas ${iconClass}"></i>
        </div>
        <h3>${categoryName}</h3>
        
        <div class="service-stats-admin">
            <div class="stat">
                <span data-i18n="bookings">Bookings</span>
                <strong>${bookingCount}</strong>
            </div>
            <div class="stat">
                <span data-i18n="services">Services</span>
                <strong>${serviceCount}</strong>
            </div>
        </div>
        <button class="btn-edit" data-i18n="manage">Manage</button>
    </div>
    `;
}

/* ==========================================
   NEW: BOOKING MANAGEMENT (ADMIN)
   ========================================== */

/**
 * Loads a page of all bookings from the API.
 */
async function loadAdminBookings(page = 0) {
    const tableBody = document.getElementById('bookings-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;" data-i18n="loading-bookings">Loading bookings...</td></tr>`;
    // Re-apply translation just for the loading text
    updateAdminLanguage(localStorage.getItem('language') || 'en');

    try {
        const pageData = await apiService.adminGetBookings(page, 10);

        allAdminBookings = pageData.content;

        tableBody.innerHTML = ''; // Clear loading message

        if (pageData.content.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;" data-i18n="no-bookings-found">No bookings found.</td></tr>`;
        } else {
            pageData.content.forEach(booking => {
                const rowHtml = createAdminBookingRowHtml(booking);
                tableBody.insertAdjacentHTML('beforeend', rowHtml);
            });
        }

        // Update global page number
        currentBookingPage = pageData.number;
        // Update pagination controls
        updateBookingPagination(pageData);
        // Re-apply translations for the whole page
        updateAdminLanguage(localStorage.getItem('language') || 'en');

    } catch (error) {
        console.error(`Failed to load bookings: ${error.message}`);
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">Error loading bookings: ${error.message}</td></tr>`;
    }
}

/**
 * Creates the HTML for a single admin booking row.
 * Uses AdminBookingDTO.
 */
function createAdminBookingRowHtml(booking) {
    // UPDATED: Destructure based on AdminBookingDTO
    const { id, customer, provider, serviceName, dateTime, servicePrice, status } = booking;

    // NOW WE CAN USE THE CUSTOMER NAME
    const customerName = customer?.name || 'N/A';
    const customerAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=3b82f6&color=fff`;

    const providerName = provider?.name || 'N/A';

    const formattedDate = formatDate(dateTime);
    const displayPrice = servicePrice || 'N/A'; // DTO already formats this
    const statusClass = status.toLowerCase();

    return `
        <tr>
            <td>#${id}</td>
            <td>
                <div class="customer-cell">
                    <img src="${customerAvatar}" alt="${customerName}">
                    <span>${customerName}</span>
                </div>
            </td>
            <td>${providerName}</td>
            <td>${serviceName || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>${displayPrice}</td>
            <td><span class="status-badge ${statusClass}" data-i18n="${statusClass}">${status}</span></td>
            <td>
                <button class="btn-icon btn-admin-view-details" title="View Details" data-booking-id="${id}" data-i18n-title="view-details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `;
}

/**
 * Updates the booking pagination controls.
 */
function updateBookingPagination(pageData) {
    const pageInfo = document.getElementById('bookings-page-info');
    const prevBtn = document.getElementById('bookings-prev-btn');
    const nextBtn = document.getElementById('bookings-next-btn');

    if (!pageInfo || !prevBtn || !nextBtn) return;

    if (pageData.totalElements === 0) {
        pageInfo.textContent = 'No bookings found';
        pageInfo.setAttribute('data-i18n', 'no-bookings-found');
    } else {
        // We need to store the base strings for translation
        pageInfo.textContent = `Page ${pageData.number + 1} of ${pageData.totalPages}`;
        pageInfo.setAttribute('data-i18n-base', 'page-x-of-y');
        pageInfo.setAttribute('data-i18n-var-x', pageData.number + 1);
        pageInfo.setAttribute('data-i18n-var-y', pageData.totalPages);
    }

    prevBtn.disabled = pageData.first;
    nextBtn.disabled = pageData.last;

    // Update translations
    updateAdminLanguage(localStorage.getItem('language') || 'en');
}

/**
 * Initializes the booking details modal (copied from user-dashboard.html)
 * UPDATED to use AdminBookingDTO
 */
function initializeAdminDetailsModal() {
    const modal = document.getElementById('booking-details-modal');
    const closeBtn = document.getElementById('details-modal-close-btn');
    if (!modal || !closeBtn) return;

    const closeModal = () => modal.classList.remove('active');

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Listen on main-content for clicks on the new button class
    document.querySelector('.main-content').addEventListener('click', (e) => {
        const detailsBtn = e.target.closest('.btn-admin-view-details');

        if (detailsBtn) {
            e.preventDefault();
            const bookingId = detailsBtn.dataset.bookingId;

            // Use the admin's booking array (now contains AdminBookingDTOs)
            const booking = allAdminBookings.find(b => b.id == bookingId);

            if (booking) {
                // Populate the modal
                // Note: The modal expects fields from BookingCardDTO.
                // We must adapt AdminBookingDTO to fit.

                // Fields from AdminBookingDTO:
                // { id, customer, provider, serviceName, servicePrice, dateTime, status, serviceDescription, remarks }

                document.getElementById('details-service-name').textContent = booking.serviceName || 'N/A';

                // UPDATED with new fields from AdminBookingDTO
                document.getElementById('details-service-description').textContent = booking.serviceDescription || 'No description provided.';
                document.getElementById('details-provider-name').textContent = booking.provider?.name || 'N/A';
                document.getElementById('details-provider-contact').textContent = booking.provider?.contactNo || 'N/A';

                document.getElementById('details-booking-id').textContent = `#${booking.id}`;

                const bookingDateTime = new Date(booking.dateTime);
                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
                document.getElementById('details-booking-date').textContent = bookingDateTime.toLocaleDateString('en-US', dateOptions);
                document.getElementById('details-booking-time').textContent = `at ${bookingDateTime.toLocaleTimeString('en-US', timeOptions)}`;

                document.getElementById('details-booking-price').textContent = booking.servicePrice || 'N/A';
                document.getElementById('details-booking-status').textContent = booking.status;

                // UPDATED with new fields from AdminBookingDTO
                document.getElementById('details-booking-remarks').textContent = booking.remarks || 'No remarks provided.';

                modal.classList.add('active');

                // Re-apply translations for modal content
                updateAdminLanguage(localStorage.getItem('language') || 'en');
            } else {
                console.error('Could not find booking data for id:', bookingId);
                alert('Error: Could not load booking details.');
            }
        }
    });
}


/* ==========================================
   11. BOOKING ACTIONS (Old placeholder)
   ========================================== */
// View booking details (now handled by initializeAdminDetailsModal)
document.querySelectorAll('.btn-icon[title="View Details"]').forEach(btn => {
    btn.addEventListener('click', function() {
        // This is now handled by the new modal initializer
    });
});

// Manage booking
document.querySelectorAll('.btn-icon[title="Manage"]').forEach(btn => {
    btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const bookingId = row.querySelector('td:first-child').textContent;

        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en'
            ? `Managing booking ${bookingId}...`
            : `වෙන්කරවා ගැනීම ${bookingId} කළමනාකරණය කරමින්...`;

        alert(message);
        // Here you would open management options
    });
});

/* ==========================================
   12. SERVICE MANAGEMENT
   ========================================== */
document.querySelectorAll('.service-card-admin .btn-edit').forEach(btn => {
    btn.addEventListener('click', function() {
        const serviceCard = this.closest('.service-card-admin');
        const serviceName = serviceCard.querySelector('h3').textContent;

        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en'
            ? `Managing ${serviceName}...`
            : `${serviceName} කළමනාකරණය කරමින්...`;

        alert(message);
        // Here you would open service management panel
    });
});

/* ==========================================
   13. REVIEW ACTIONS
   ========================================== */
// Approve review
document.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', function() {
        const reviewCard = this.closest('.review-card-admin');

        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en'
            ? 'Review approved successfully!'
            : 'සමාලෝචනය සාර්ථකව අනුමත කරන ලදී!';

        alert(message);
        reviewCard.remove();
        // Here you would make an API call to approve the review
    });
});

// Reject review
document.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', function() {
        const reviewCard = this.closest('.review-card-admin');

        const lang = localStorage.getItem('language') || 'en';
        const confirmMessage = lang === 'en'
            ? 'Are you sure you want to reject this review?'
            : 'ඔබට මෙම සමාලෝචනය ප්‍රතික්ෂේප කිරීමට අවශ්‍ය බව විශ්වාසද?';
        const message = lang === 'en'
            ? 'Review rejected.'
            : 'සමාලෝචනය ප්‍රතික්ෂේප කරන ලදී.';

        if (confirm(confirmMessage)) {
            alert(message);
            reviewCard.remove();
            // Here you would make an API call to reject the review
        }
    });
});

/* ==========================================
   14. REPORT GENERATION
   ========================================== */
document.querySelectorAll('.report-card .btn-secondary').forEach(btn => {
    btn.addEventListener('click', function() {
        const reportCard = this.closest('.report-card');
        const reportName = reportCard.querySelector('h3').textContent;

        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en'
            ? `Generating ${reportName}...`
            : `${reportName} ජනනය කරමින්...`;

        alert(message);

        // Simulate report generation
        setTimeout(() => {
            const successMsg = lang === 'en'
                ? `${reportName} generated successfully!`
                : `${reportName} සාර්ථකව ජනනය කරන ලදී!`;
            alert(successMsg);
        }, 1500);

        // Here you would make an API call to generate the report
    });
});

/* ==========================================
   15. HEADER ACTION BUTTONS
   ========================================== */
// Add User/Provider/Service buttons
document.querySelectorAll('.header-actions .btn-primary').forEach(btn => {
    if (btn.textContent.includes('Add') || btn.textContent.includes('එක් කරන්න')) {
        btn.addEventListener('click', function() {
            const lang = localStorage.getItem('language') || 'en';
            const message = lang === 'en'
                ? 'Opening creation form...'
                : 'නිර්මාණ පෝරමය විවෘත කරමින්...';

            alert(message);
            // Here you would open a modal to add new item
        });
    }
});

// Filter buttons
document.querySelectorAll('.header-actions .btn-secondary').forEach(btn => {
    if (btn.textContent.includes('Filter') || btn.textContent.includes('පෙරහන')) {
        btn.addEventListener('click', function() {
            const lang = localStorage.getItem('language') || 'en';
            const message = lang === 'en'
                ? 'Opening filter options...'
                : 'පෙරහන් විකල්ප විවෘත කරමින්...';

            alert(message);
            // Here you would open filter panel
        });
    }
});

// Export buttons
document.querySelectorAll('.header-actions .btn-secondary').forEach(btn => {
    if (btn.textContent.includes('Export') || btn.textContent.includes('නිර්යාත')) {
        btn.addEventListener('click', function() {
            const lang = localStorage.getItem('language') || 'en';
            const message = lang === 'en'
                ? 'Exporting data...'
                : 'දත්ත නිර්යාත කරමින්...';

            alert(message);
            // Here you would export the data
        });
    }
});

/* ==========================================
   16. DOWNLOAD REPORT
   ========================================== */
document.querySelectorAll('.btn-primary').forEach(btn => {
    if (btn.textContent.includes('Download') || btn.textContent.includes('බාගන්න')) {
        btn.addEventListener('click', function() {
            const lang = localStorage.getItem('language') || 'en';
            const message = lang === 'en'
                ? 'Preparing report for download...'
                : 'බාගැනීම සඳහා වාර්තාව සකසමින්...';

            alert(message);
            // Here you would generate and download report
        });
    }
});

/* ==========================================
   17. NOTIFICATIONS
   ========================================== */
const notificationsBtn = document.getElementById('notificationsBtn');
if (notificationsBtn) {
    notificationsBtn.addEventListener('click', () => {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en'
            ? 'Opening notifications panel...'
            : 'දැනුම්දීම් පැනලය විවෘත කරමින්...';

        alert(message);
        // Here you would open notifications dropdown
    });
}

/* ==========================================
   18. SETTINGS MANAGEMENT
   ========================================== */
// Toggle switches
const toggleSwitches = document.querySelectorAll('.toggle-switch input');
toggleSwitches.forEach(toggle => {
    toggle.addEventListener('change', function() {
        const settingItem = this.closest('.setting-item');
        const settingName = settingItem.querySelector('h4').textContent;
        const isEnabled = this.checked;

        const lang = localStorage.getItem('language') || 'en';
        const status = isEnabled
            ? (lang === 'en' ? 'enabled' : 'සක්‍රීය කර ඇත')
            : (lang === 'en' ? 'disabled' : 'අක්‍රීය කර ඇත');

        console.log(`${settingName} ${status}`);
        // Here you would save the setting preference
    });
});

// Save settings button
const saveSettingsBtn = document.querySelector('.settings-container .btn-primary');
if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async function() {
        const lang = localStorage.getItem('language') || 'en';
        const savingText = lang === 'en' ? 'Saving...' : 'සුරකිමින්...';
        const successText = lang === 'en'
            ? 'Settings saved successfully!'
            : 'සැකසුම් සාර්ථකව සුරැකී ඇත!';

        const originalText = this.textContent;
        this.textContent = savingText;
        this.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            alert(successText);
        } catch (error) {
            const errorText = lang === 'en'
                ? 'Failed to save settings. Please try again.'
                : 'සැකසුම් සුරැකීම අසාර්ථකයි. කරුණාකර නැවත උත්සාහ කරන්න.';
            alert(errorText);
        } finally {
            this.textContent = originalText;
            this.disabled = false;
        }
    });
}

/* ==========================================
   19. PAGINATION (Old placeholder)
   ========================================== */
document.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (!this.disabled && !this.classList.contains('active')) {
            // Remove active class from all pagination buttons
            const paginationBtns = this.closest('.pagination').querySelectorAll('.pagination-btn');
            paginationBtns.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button (if it's a number)
            if (!this.querySelector('i')) {
                this.classList.add('active');
            }

            console.log('Loading page:', this.textContent.trim() || 'next/prev');
            // This is now handled by specific pagination listeners
        }
    });
});

/* ==========================================
   20. CHART FILTERS
   ========================================== */
document.querySelectorAll('.chart-filter').forEach(select => {
    select.addEventListener('change', function() {
        const selectedPeriod = this.value;
        console.log('Filtering chart by:', selectedPeriod);
        // Here you would update the chart with new data
    });
});

/* ==========================================
   21. USER MENU
   ========================================== */
const userMenu = document.querySelector('.user-menu');
if (userMenu) {
    userMenu.addEventListener('click', () => {
        // Toggle user menu dropdown
        console.log('User menu clicked');
        // Here you would implement dropdown functionality
    });
}

/* ==========================================
   22. VIEW ALL LINKS
   ========================================== */
document.querySelectorAll('.view-all').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en'
            ? 'Loading all items...'
            : 'සියලුම අයිතම පූරණය කරමින්...';

        alert(message);
        // Here you would navigate to full list view
    });
});

/* ==========================================
   23. UTILITY FUNCTIONS
   ========================================== */

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    if (!dateString || dateString === 'N/A') return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Show loading state
function showLoading(element) {
    element.disabled = true;
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
}

// Hide loading state
function hideLoading(element, originalText) {
    element.disabled = false;
    element.innerHTML = originalText;
}
function showToast(message, isError = false) {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('i');

    if (!toast || !toastMessage || !toastIcon) {
        // Fallback if toast HTML is missing
        alert(message);
        return;
    }

    toastMessage.textContent = message;
    if (isError) {
        toast.style.backgroundColor = 'var(--danger-color)';
        toastIcon.className = 'fas fa-exclamation-circle';
    } else {
        toast.style.backgroundColor = 'var(--secondary-color)';
        toastIcon.className = 'fas fa-check-circle';
    }

    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
/* ==========================================
   24. ERROR HANDLING
   ========================================== */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

/* ==========================================
   25. CONSOLE WELCOME MESSAGE
   ========================================== */
console.log('%cFixIT Admin Dashboard', 'color: #2563eb; font-size: 24px; font-weight: bold;');
console.log('%cVersion 1.0.0', 'color: #6b7280; font-size: 12px;');
console.log('%c© 2025 FixIT. All rights reserved.', 'color: #6b7280; font-size: 12px;');