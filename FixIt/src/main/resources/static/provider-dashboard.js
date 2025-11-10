
//   FIXIT PROVIDER DASHBOARD - MAIN JAVASCRIPT

let allCategories = [];
let currentProviderCategories = [];
let currentProviderServices = [];
/* ==========================================
   1. INITIALIZATION
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize language
    const savedLanguage = localStorage.getItem('language') || 'en';
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
        updateProviderLanguage(savedLanguage);
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
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize tabs
    initializeTabs();

    // Load the provider's profile data
    loadProviderProfile();

    // Initialize the user menu dropdown
    initializeUserMenu();

    // Initialize new modal functionality
    initializeCategoryModal();

    // Initialize the new service modal
    initializeServiceModal();

    // listener for My Bookings nav link
    const bookingsNavLink = document.querySelector('a[data-section="bookings"]');
    if (bookingsNavLink) {
        bookingsNavLink.addEventListener('click', () => {
            // Load 'all' bookings when the tab is first clicked
            loadProviderBookings('all');
            // Also reset tabs to 'all'
            document.querySelectorAll('#bookings-section .tab').forEach(t => t.classList.remove('active'));
            document.querySelector('#bookings-section .tab[data-tab="all"]').classList.add('active');
        });
    }
});

async function loadProviderProfile() {
    try {
        // Use the apiService from api-config.js
        const provider = await apiService.getProviderProfile();

        // 1. Update Welcome Header
        const welcomeHeader = document.getElementById('welcome-header');
        if (welcomeHeader) {
            welcomeHeader.textContent = `Welcome Back, ${provider.name}!`;
        }

        // 2. Update Top-Right Nav Bar
        const navProviderName = document.getElementById('nav-provider-name');
        if (navProviderName) {
            navProviderName.textContent = provider.name;
        }
        const navProviderAvatar = document.getElementById('nav-provider-avatar');
        if (navProviderAvatar) {
            navProviderAvatar.src = provider.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=2563eb&color=fff`;
        }

        // 3. Populate "My Profile" Form
        document.getElementById('profile-name').value = provider.name || '';
        document.getElementById('profile-email').value = provider.userEmail || '';
        document.getElementById('profile-phone').value = provider.contactNo || '';
        document.getElementById('profile-location').value = provider.location || '';
        document.getElementById('profile-bio').value = provider.bio || '';
        document.getElementById('profile-skills').value = provider.skills || '';

        // 4. Populate Profile Avatar
        const profileAvatarLarge = document.getElementById('profile-avatar-large');
        if (profileAvatarLarge) {
            profileAvatarLarge.src = provider.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=2563eb&color=fff&size=150`;
        }
        currentProviderCategories = provider.serviceCategories || [];
        await loadProviderServices();


    } catch (error) {
        console.error('Failed to load provider profile:', error);
        alert('Your session has expired. Please log in again.');
        window.location.href = 'login2.html';
    }
}

// Function to load and render provider's services
async function loadProviderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    servicesGrid.innerHTML = '<div class="loading-placeholder">Loading your services...</div>';

    try {
        currentProviderServices = await apiService.getProviderServices();

        if (currentProviderServices.length === 0) {
            servicesGrid.innerHTML = '<div class="loading-placeholder">You have not added any services yet. Click "Add New Service" to get started.</div>';
            return;
        }

        servicesGrid.innerHTML = ''; // Clear loading
        currentProviderServices.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card-dashboard';
            const iconClass = (service.category && service.category.icon) ? service.category.icon : 'fas fa-wrench';
            const categoryName = (service.category && service.category.name) ? service.category.name : 'Uncategorized';

            card.innerHTML = `
                <div class="service-card-header">
                    <div class="service-icon-small">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="service-actions">
                        <button class="btn-icon btn-edit-service" data-service-id="${service.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete-service" data-service-id="${service.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h3>${service.name}</h3>
                <p>${service.description || 'No description provided.'}</p>
                <div class="service-stats">
                    <span><i class="fas fa-tag"></i> ${categoryName}</span>
                </div>
                <div class="service-pricing">
                    <span data-i18n="starting-from">Starting from</span>
                    <strong>Rs.${parseFloat(service.price).toFixed(2)}</strong>
                </div>
            `;
            servicesGrid.appendChild(card);
        });

        // Add event listeners to the new buttons
        attachServiceButtonListeners();

    } catch (error) {
        console.error("Failed to load provider services:", error);
        servicesGrid.innerHTML = '<div class="loading-placeholder">Error loading services. Please refresh.</div>';
    }
}

function attachServiceButtonListeners() {
    // Edit buttons
    document.querySelectorAll('.btn-edit-service').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const serviceId = e.currentTarget.getAttribute('data-service-id');
            openServiceModal(Number(serviceId)); // Open modal for editing
        });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete-service').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const serviceId = e.currentTarget.getAttribute('data-service-id');
            if (confirm('Are you sure you want to delete this service?')) {
                try {
                    await apiService.deleteProviderService(serviceId);
                    alert('Service deleted successfully.');
                    loadProviderServices(); // Refresh the list
                } catch (error) {
                    console.error('Failed to delete service:', error);
                    alert('Failed to delete service. Please try again.');
                }
            }
        });
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
        updateProviderLanguage(e.target.value);
    });
}

/* ==========================================
   4. NAVIGATION
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
            const targetSection = item.getAttribute('data-section');
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Show target section
            const targetElement = document.getElementById(`${targetSection}-section`);
            if (targetElement) {
                targetElement.classList.add('active');
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
   5. MOBILE MENU
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
   6. TABS FUNCTIONALITY
   ========================================== */
function initializeTabs() {
    const tabsContainer = document.querySelector('#bookings-section .tabs');
    if (!tabsContainer) return; // Guard clause

    tabsContainer.addEventListener('click', (e) => {
        // Check if the clicked element is a tab
        if (e.target.classList.contains('tab')) {

            const tab = e.target;
            // Remove active class from all tabs in this container
            tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            // Call the API function
            const tabType = tab.getAttribute('data-tab');
            loadProviderBookings(tabType);
        }
    });
}

/* ==========================================
   7. BOOKING ACTIONS
   ========================================== */
// Accept booking
document.querySelectorAll('.btn-icon[title="Accept"]').forEach(btn => {
    btn.addEventListener('click', function() {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en' 
            ? 'Booking accepted successfully!' 
            : 'වෙන්කරවා ගැනීම සාර්ථකව පිළිගන්නා ලදී!';
        
        if (confirm(lang === 'en' ? 'Accept this booking?' : 'මෙම වෙන්කරවා ගැනීම පිළිගන්නවාද?')) {
            alert(message);
            // Here you would make an API call to accept the booking
        }
    });
});

// Reject booking
document.querySelectorAll('.btn-icon[title="Reject"]').forEach(btn => {
    btn.addEventListener('click', function() {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en' 
            ? 'Booking rejected.' 
            : 'වෙන්කරවා ගැනීම ප්‍රතික්ෂේප කරන ලදී.';
        
        if (confirm(lang === 'en' ? 'Reject this booking?' : 'මෙම වෙන්කරවා ගැනීම ප්‍රතික්ෂේප කරන්නද?')) {
            alert(message);
            // Here you would make an API call to reject the booking
        }
    });
});

// View booking details
document.querySelectorAll('.btn-icon[title="Details"]').forEach(btn => {
    btn.addEventListener('click', function() {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en' 
            ? 'Opening booking details...' 
            : 'වෙන්කරවා ගැනීමේ විස්තර විවෘත කරමින්...';
        
        alert(message);
        // Here you would open a modal with booking details
    });
});

// Complete booking
document.querySelectorAll('.btn-icon[title="Complete"]').forEach(btn => {
    btn.addEventListener('click', function() {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en' 
            ? 'Booking marked as completed!' 
            : 'වෙන්කරවා ගැනීම සම්පූර්ණ කළ ලෙස සලකුණු කරන ලදී!';
        
        if (confirm(lang === 'en' ? 'Mark this booking as completed?' : 'මෙම වෙන්කරවා ගැනීම සම්පූර්ණ කළ ලෙස සලකුණු කරන්නද?')) {
            alert(message);
            // Here you would make an API call to complete the booking
        }
    });
});

/* ==========================================
   8. QUICK ACTIONS
   ========================================== */
const actionButtons = document.querySelectorAll('.action-btn');
actionButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const actionText = this.querySelector('span').textContent;
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en' 
            ? `Opening ${actionText}...` 
            : `${actionText} විවෘත කරමින්...`;
        
        alert(message);
        // Here you would navigate to the appropriate section or open a modal
    });
});

/* ==========================================
   9. PROFILE FORM SUBMISSION
   ========================================== */
const profileForm = document.querySelector('.profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const lang = localStorage.getItem('language') || 'en';
        const savingText = lang === 'en' ? 'Saving...' : 'සුරකිමින්...';
        const successText = lang === 'en' 
            ? 'Profile updated successfully!' 
            : 'පැතිකඩ සාර්ථකව යාවත්කාලීන කරන ලදී!';
        
        const submitBtn = profileForm.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = savingText;
        submitBtn.disabled = true;

        try {
            const profileData = {
                name: document.getElementById('profile-name').value,
                contactNo: document.getElementById('profile-phone').value,
                location: document.getElementById('profile-location').value,
                bio: document.getElementById('profile-bio').value,
                skills: document.getElementById('profile-skills').value,
            };
            // Use the API service
            const updatedProvider = await apiService.updateProviderProfile(profileData);

            alert(successText);
            document.getElementById('nav-provider-name').textContent = updatedProvider.name;

        } catch (error) {
            const errorText = lang === 'en' 
                ? 'Failed to update profile. Please try again.' 
                : 'පැතිකඩ යාවත්කාලීන කිරීම අසාර්ථකයි. කරුණාකර නැවත උත්සාහ කරන්න.';
            alert(errorText);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

/* ==========================================
   10. CHANGE PHOTO
   ========================================== */
const changePhotoBtn = document.querySelector('.btn-change-photo');
if (changePhotoBtn) {
    changePhotoBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const avatar = document.querySelector('.profile-avatar-large');
                    if (avatar) {
                        avatar.src = e.target.result;
                    }
                    
                    const lang = localStorage.getItem('language') || 'en';
                    const message = lang === 'en' 
                        ? 'Photo updated! Don\'t forget to save changes.' 
                        : 'ඡායාරූපය යාවත්කාලීන කරන ලදී! වෙනස්කම් සුරැකීමට අමතක නොකරන්න.';
                    alert(message);
                };
                reader.readAsDataURL(file);
            }
        });
        
        input.click();
    });
}

/* ==========================================
   11. SERVICE EDIT BUTTONS
   ========================================== */
const editServiceButtons = document.querySelectorAll('.service-card-dashboard .btn-edit');
editServiceButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const serviceCard = this.closest('.service-card-dashboard');
        const serviceName = serviceCard.querySelector('h3').textContent;
        
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en' 
            ? `Opening editor for ${serviceName}...` 
            : `${serviceName} සඳහා සංස්කාරකය විවෘත කරමින්...`;
        
        alert(message);
        // Here you would open a modal to edit the service
    });
});

/* ==========================================
   12. ADD NEW SERVICE
   ========================================== */
const addServiceBtn = document.querySelector('.page-header .btn-primary');
if (addServiceBtn && addServiceBtn.textContent.includes('Add')) {
    addServiceBtn.addEventListener('click', () => {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en' 
            ? 'Opening service creation form...' 
            : 'සේවා නිර්මාණ පෝරමය විවෘත කරමින්...';
        
        alert(message);
        // Here you would open a modal to add a new service
    });
}

/* ==========================================
   13. REQUEST PAYOUT
   ========================================== */
const requestPayoutBtn = document.querySelector('.btn-request');
if (requestPayoutBtn) {
    requestPayoutBtn.addEventListener('click', () => {
        const lang = localStorage.getItem('language') || 'en';
        const confirmMessage = lang === 'en' 
            ? 'Request withdrawal of $850.00?' 
            : '$850.00 මුදල් ගැනීම ඉල්ලන්නද?';
        const successMessage = lang === 'en' 
            ? 'Withdrawal request submitted successfully!' 
            : 'මුදල් ගැනීමේ ඉල්ලීම සාර්ථකව ඉදිරිපත් කරන ලදී!';
        
        if (confirm(confirmMessage)) {
            alert(successMessage);
            // Here you would make an API call to request payout
        }
    });
}

/* ==========================================
   14. DOWNLOAD REPORT
   ========================================== */
const downloadReportBtn = document.querySelectorAll('.btn-primary');
downloadReportBtn.forEach(btn => {
    if (btn.textContent.includes('Download') || btn.textContent.includes('බාගන්න')) {
        btn.addEventListener('click', () => {
            const lang = localStorage.getItem('language') || 'en';
            const message = lang === 'en' 
                ? 'Preparing report for download...' 
                : 'බාගැනීම සඳහා වාර්තාව සකසමින්...';
            
            alert(message);
            // Here you would generate and download a report
        });
    }
});

/* ==========================================
   15. EXPORT BOOKINGS
   ========================================== */
const exportBtn = document.querySelector('.header-actions .btn-primary');
if (exportBtn && (exportBtn.textContent.includes('Export') || exportBtn.textContent.includes('නිර්යාත'))) {
    exportBtn.addEventListener('click', () => {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en' 
            ? 'Exporting bookings data...' 
            : 'වෙන්කරවා ගැනීම් දත්ත නිර්යාත කරමින්...';
        
        alert(message);
        // Here you would export the bookings data
    });
}

/* ==========================================
   16. NOTIFICATIONS
   ========================================== */
const notificationsBtn = document.getElementById('notificationsBtn');
if (notificationsBtn) {
    notificationsBtn.addEventListener('click', () => {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en' 
            ? 'Opening notifications panel...' 
            : 'දැනුම්දීම් පැනලය විවෘත කරමින්...';
        
        alert(message);
        // Here you would open a notifications dropdown or panel
    });
}

/* ==========================================
   17. SETTINGS TOGGLES
   ========================================== */
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

/* ==========================================
   18. CHANGE PASSWORD
   ========================================== */
const changePasswordBtn = document.querySelector('.settings-group .btn-secondary');
if (changePasswordBtn && (changePasswordBtn.textContent.includes('Password') || changePasswordBtn.textContent.includes('මුරපදය'))) {
    changePasswordBtn.addEventListener('click', () => {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en' 
            ? 'Opening password change form...' 
            : 'මුරපදය වෙනස් කිරීමේ පෝරමය විවෘත කරමින්...';
        
        alert(message);
        // Here you would open a modal to change password
    });
}

/* ==========================================
   19. DELETE ACCOUNT
   ========================================== */
const deleteAccountBtn = document.querySelector('.settings-group .btn-danger');
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
        const lang = localStorage.getItem('language') || 'en';
        const confirmMessage = lang === 'en' 
            ? 'Are you sure you want to delete your account? This action cannot be undone.' 
            : 'ඔබට ඔබේ ගිණුම මකා දැමීමට අවශ්‍ය බව විශ්වාසද? මෙම ක්‍රියාව අවලංගු කළ නොහැක.';
        
        if (confirm(confirmMessage)) {
            const doubleConfirm = lang === 'en' 
                ? 'Type DELETE to confirm account deletion' 
                : 'ගිණුම මකා දැමීම තහවුරු කිරීමට DELETE ටයිප් කරන්න';
            
            const userInput = prompt(doubleConfirm);
            if (userInput === 'DELETE') {
                alert(lang === 'en' ? 'Account deleted.' : 'ගිණුම මකා දමන ලදී.');
                // Here you would make an API call to delete the account
                // Then redirect to home page
                // window.location.href = 'index.html';
            }
        }
    });
}

/* ==========================================
   20. USER MENU DROPDOWN
   ========================================== */
function initializeUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (userMenuBtn && userDropdown) {
        // Show/hide dropdown on click
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop the click from propagating to the window
            userDropdown.classList.toggle('active');
        });

        // Close dropdown if clicking anywhere else on the page
        window.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && userDropdown.classList.contains('active')) {
                userDropdown.classList.remove('active');
            }
        });

        // Make dropdown links (Profile, Settings) navigate correctly
        userDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.getAttribute('data-section');
                if (section) {
                    e.preventDefault();

                    const navLink = document.querySelector(`.nav-item[data-section="${section}"]`);
                    if (navLink) {
                        navLink.click();
                    }
                    userDropdown.classList.remove('active');
                }
            });
        });
    }
}


/* ==========================================
   21. FILTER FUNCTIONALITY
   ========================================== */
const filterBtn = document.querySelector('.header-actions .btn-secondary');
if (filterBtn && (filterBtn.textContent.includes('Filter') || filterBtn.textContent.includes('පෙරහන'))) {
    filterBtn.addEventListener('click', () => {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en' 
            ? 'Opening filter options...' 
            : 'පෙරහන් විකල්ප විවෘත කරමින්...';
        
        alert(message);
        // Here you would open a filter dropdown or modal
    });
}

/* ==========================================
   22. CONSOLE WELCOME MESSAGE
   ========================================== */
console.log('%cFixIT Provider Dashboard', 'color: #2563eb; font-size: 24px; font-weight: bold;');
console.log('%cVersion 1.0.0', 'color: #6b7280; font-size: 12px;');
console.log('%c© 2025 FixIT. All rights reserved.', 'color: #6b7280; font-size: 12px;');

/* ==========================================
   23. ERROR HANDLING
   ========================================== */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// MANAGE CATEGORIES MODAL

function initializeCategoryModal() {
    const modal = document.getElementById('manage-categories-modal');
    const openBtn = document.getElementById('manageCategoriesBtn');
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const form = document.getElementById('categories-form');
    const listContainer = document.getElementById('categories-list-container');

    if (!modal || !openBtn || !closeBtn || !cancelBtn || !form) {
        return;
    }

    // Open modal
    openBtn.addEventListener('click', async () => {
        modal.classList.add('active');
        listContainer.innerHTML = '<div class="loading-placeholder">Loading categories...</div>';

        try {
            // Fetch all categories if not already fetched
            if (allCategories.length === 0) {
                allCategories = await apiService.getServiceCategories();
            }

            // Populate the checkbox list
            populateCategoryChecklist(listContainer);

        } catch (error) {
            console.error("Failed to load categories:", error);
            listContainer.innerHTML = '<div class="loading-placeholder">Error loading categories.</div>';
        }
    });

    // Close modal
    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('modal-save-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const selectedIds = [];
        form.querySelectorAll('input[type="checkbox"]:checked').forEach(input => {
            selectedIds.push(Number(input.value));
        });

        try {
            await apiService.updateProviderCategories(selectedIds);

            // Update the local state
            currentProviderCategories = allCategories.filter(cat => selectedIds.includes(cat.id));

            alert('Service categories updated successfully!');
            modal.classList.remove('active');
        } catch (error) {
            console.error("Failed to save categories:", error);
            alert('Failed to save categories. Please try again.');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
    });
}

function populateCategoryChecklist(container) {
    container.innerHTML = ''; // Clear loading/previous content

    if (allCategories.length === 0) {
        container.innerHTML = '<div class="loading-placeholder">No categories found.</div>';
        return;
    }

    // Get a set of current category IDs for easy lookup
    const currentCategoryIds = new Set(currentProviderCategories.map(cat => cat.id));

    allCategories.forEach(category => {
        const isChecked = currentCategoryIds.has(category.id);

        const item = document.createElement('div');
        item.className = 'category-checkbox';

        item.innerHTML = `
            <input type="checkbox" id="cat-${category.id}" value="${category.id}" ${isChecked ? 'checked' : ''}>
            <label for="cat-${category.id}">${category.name}</label>
        `;
        container.appendChild(item);
    });
}

// ADD/EDIT SERVICE MODAL

function initializeServiceModal() {
    const modal = document.getElementById('service-edit-modal');
    const openBtn = document.getElementById('addNewServiceBtn');
    const closeBtn = document.getElementById('service-modal-close-btn');
    const cancelBtn = document.getElementById('service-modal-cancel-btn');
    const deleteBtn = document.getElementById('service-delete-btn');
    const form = document.getElementById('service-edit-form');
    const title = document.getElementById('service-modal-title');
    const serviceIdInput = document.getElementById('service-id-input');
    const nameInput = document.getElementById('service-name-input');
    const categorySelect = document.getElementById('service-category-select');
    const priceInput = document.getElementById('service-price-input');
    const descriptionInput = document.getElementById('service-description-input');
    const saveBtn = document.getElementById('service-modal-save-btn');

    if (!modal || !openBtn || !closeBtn || !cancelBtn || !form) return;

    // Open modal for ADDING a new service
    openBtn.addEventListener('click', () => {
        openServiceModal(null); // null ID means new service
    });

    // Close modal
    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });

    // Handle form submission (Add or Edit)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const serviceData = {
            name: nameInput.value,
            serviceCategoryId: Number(categorySelect.value),
            price: parseFloat(priceInput.value),
            description: descriptionInput.value
        };

        const serviceId = serviceIdInput.value ? Number(serviceIdInput.value) : null;

        try {
            if (serviceId) {
                // This is an UPDATE
                await apiService.updateProviderService(serviceId, serviceData);
                alert('Service updated successfully!');
            } else {
                // This is a CREATE
                await apiService.addProviderService(serviceData);
                alert('Service added successfully!');
            }
            modal.classList.remove('active');
            loadProviderServices(); // Refresh the list
        } catch (error) {
            console.error('Failed to save service:', error);
            alert(`Error: ${error.message}`);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Service';
        }
    });

    // Handle Delete
    deleteBtn.addEventListener('click', async () => {
        const serviceId = Number(serviceIdInput.value);
        if (!serviceId) return;

        if (confirm('Are you sure you want to delete this service?')) {
            try {
                await apiService.deleteProviderService(serviceId);
                alert('Service deleted successfully.');
                modal.classList.remove('active');
                loadProviderServices(); // Refresh the list
            } catch (error) {
                console.error('Failed to delete service:', error);
                alert('Failed to delete service. Please try again.');
            }
        }
    });
}

// Helper function to open and populate the service modal ---
async function openServiceModal(serviceId) {
    const modal = document.getElementById('service-edit-modal');
    const title = document.getElementById('service-modal-title');
    const serviceIdInput = document.getElementById('service-id-input');
    const nameInput = document.getElementById('service-name-input');
    const categorySelect = document.getElementById('service-category-select');
    const priceInput = document.getElementById('service-price-input');
    const descriptionInput = document.getElementById('service-description-input');
    const deleteBtn = document.getElementById('service-delete-btn');
    const form = document.getElementById('service-edit-form');


    // Reset form
    form.reset();
    serviceIdInput.value = '';

    // Populate category dropdown (using the provider's *selected* categories)
    categorySelect.innerHTML = '<option value="">Select a category...</option>';
    if (currentProviderCategories.length === 0) {
        await loadProviderProfile(); // Ensure we have categories
    }

    currentProviderCategories.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });

    if (serviceId) {
        // --- EDIT MODE ---
        title.textContent = 'Edit Service';
        deleteBtn.style.display = 'block';

        // Find the service from our local state
        const service = currentProviderServices.find(s => s.id === serviceId);
        if (service) {
            serviceIdInput.value = service.id;
            nameInput.value = service.name;
            priceInput.value = service.price;
            descriptionInput.value = service.description || '';
            if (service.category) {
                categorySelect.value = service.category.id;
            }
        } else {
            alert('Error: Could not find service details.');
            return;
        }
    } else {
        //  ADD MODE
        title.textContent = 'Add New Service';
        deleteBtn.style.display = 'none';
        // Form is already reset
    }

    modal.classList.add('active');
}

//  NEW FUNCTIONS FOR PROVIDER BOOKINGS

//Fetches bookings for the provider from the API based on status.

async function loadProviderBookings(status = 'all') {
    const tableBody = document.getElementById('bookings-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Loading bookings...</td></tr>`;

    try {
        let endpoint = API_CONFIG.ENDPOINTS.PROVIDER_DASHBOARD_BOOKINGS;
        if (status && status !== 'all') {
            endpoint += `?status=${status}`;
        }

        const bookings = await apiService.request(endpoint, { method: 'GET' });
        renderProviderBookings(bookings);

    } catch (error) {
        console.error('Failed to load provider bookings:', error);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Error loading bookings. Please try again.</td></tr>`;
    }
}

//Renders the fetched bookings into the table.

function renderProviderBookings(bookings) {
    const tableBody = document.getElementById('bookings-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Clear loading message

    if (bookings.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No bookings found in this category.</td></tr>`;
        return;
    }

    bookings.forEach(booking => {
        const rowHtml = createProviderBookingRowHtml(booking);
        tableBody.insertAdjacentHTML('beforeend', rowHtml);
    });

    // Re-apply translations to new content
    updateProviderLanguage(localStorage.getItem('language') || 'en');
}

// Creates the HTML string for a single table row.

function createProviderBookingRowHtml(booking) {
    const status = booking.status.toUpperCase();
    const statusClass = status.toLowerCase();
    const formattedDateTime = formatDateTime(booking.dateTime);
    const servicePrice = booking.servicePrice ? `Rs.${booking.servicePrice.toFixed(2)}` : 'N/A';

    let actionButtons = '';
    if (status === 'PENDING') {
        actionButtons = `
            <button class="btn-icon" title="Accept" onclick="acceptBooking(${booking.id})">
                <i class="fas fa-check"></i>
            </button>
            <button class="btn-icon" title="Reject">
                <i class="fas fa-times"></i>
            </button>
        `;
    } else if (status === 'CONFIRMED') {
        actionButtons = `
            <button class="btn-icon" title="Complete" onclick="completeBooking(${booking.id})">
                <i class="fas fa-check-double"></i>
            </button>
        `;
    }

    // Add a "View Details" button for all
    actionButtons += `
        <button class="btn-icon" title="Details">
            <i class="fas fa-eye"></i>
        </button>
    `;

    return `
        <tr>
            <td>#BK${booking.id}</td>
            <td>
                <div class="customer-cell">
                    <img src="${booking.user.photo}" alt="${booking.user.name}">
                    <span>${booking.user.name}</span>
                </div>
            </td>
            <td>${booking.serviceName}</td>
            <td>${formattedDateTime.date} </td>
            <td>${formattedDateTime.time} </td>
            <td>${servicePrice}</td>
            <td><span class="status-badge ${statusClass}" data-i18n="${statusClass}">${status}</span></td>
            <td>${actionButtons}</td>
        </tr>
    `;
}

// Handles accepting a booking.

async function acceptBooking(bookingId) {
    const lang = localStorage.getItem('language') || 'en';
    const confirmMessage = lang === 'en' ? 'Accept this booking?' : 'මෙම වෙන්කරවා ගැනීම පිළිගන්නවාද?';

    if (confirm(confirmMessage)) {
        try {
            await apiService.request(`${API_CONFIG.ENDPOINTS.PROVIDER_DASHBOARD_BOOKINGS}/${bookingId}/accept`, {
                method: 'POST'
            });
            // Reload the current tab's bookings
            const currentTab = document.querySelector('#bookings-section .tab.active').getAttribute('data-tab');
            loadProviderBookings(currentTab);
        } catch (error) {
            console.error('Failed to accept booking:', error);
            alert(`Error: ${error.message}`);
        }
    }
}

// Handles completing a booking.

async function completeBooking(bookingId) {
    const lang = localStorage.getItem('language') || 'en';
    const confirmMessage = lang === 'en' ? 'Mark this booking as completed?' : 'මෙම වෙන්කරවා ගැනීම සම්පූර්ණ කළ ලෙස සලකුණු කරන්නද?';

    if (confirm(confirmMessage)) {
        try {
            await apiService.request(`${API_CONFIG.ENDPOINTS.PROVIDER_DASHBOARD_BOOKINGS}/${bookingId}/complete`, {
                method: 'POST'
            });
            // Reload the current tab's bookings
            const currentTab = document.querySelector('#bookings-section .tab.active').getAttribute('data-tab');
            loadProviderBookings(currentTab);
        } catch (error) {
            console.error('Failed to complete booking:', error);
            alert(`Error: ${error.message}`);
        }
    }
}

// Helper function to format ISO date strings.

function formatDateTime(isoString) {
    const date = new Date(isoString);
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

    return {
        date: date.toLocaleDateString('en-US', dateOptions),
        time: date.toLocaleTimeString('en-US', timeOptions)
    };
}