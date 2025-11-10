// FIXIT USER DASHBOARD - MAIN JAVASCRIPT

// global variable
let allBookings = [];
let userFavoriteServiceIds = new Set();

   // INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // Initialize language
    const savedLanguage = localStorage.getItem('language') || 'en';
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
        updateUserLanguage(savedLanguage);
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

    // MODIFIED: Corrected function call
    initializeBookingTabs();

    // Initialize favorites
    initializeLikeButtonListener();

    // Load the user's profile data
    loadUserProfile(); // This will now run

    // Load upcoming bookings for the dashboard homepage
    loadDashboardBookings();

    // Initialize the modal for viewing booking details
    initializeDetailsModal();

    // Initialize the modal for leaving a review
    initializeReviewModal();


    // event listeners for filter buttons
    const applyFiltersBtn = document.getElementById('filter-apply-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            // Read all filter values and reload services
            const categoryId = document.getElementById('filter-category-select').value;
            const location = document.getElementById('filter-search-location').value;
            const minPrice = document.getElementById('filter-price-min').value;
            const maxPrice = document.getElementById('filter-price-max').value;
            const minRating = document.querySelector('input[name="filter-rating"]:checked').value;

            loadServices(categoryId, location, minPrice, maxPrice, minRating);
        });
    }
    const clearFiltersBtn = document.getElementById('filter-clear-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            // Reset the form fields
            document.getElementById('filter-category-select').value = '';
            document.getElementById('filter-search-location').value = '';
            document.getElementById('filter-price-min').value = '';
            document.getElementById('filter-price-max').value = '';
            document.getElementById('filter-rating-any').checked = true;

            // Reload all services
            loadServices();
        });
    }
    initializeBookingFlow();

    // Add listener for My Bookings nav link
    const bookingsNavLink = document.querySelector('a[data-section="bookings"]');
    if (bookingsNavLink) {
        bookingsNavLink.addEventListener('click', () => {
            // Load 'all' bookings when the tab is first clicked
            loadMyBookings('all');
            // Also reset tabs to 'all'
            document.querySelectorAll('#bookings-section .tab').forEach(t => t.classList.remove('active'));
            document.querySelector('#bookings-section .tab[data-tab="all"]').classList.add('active');
        });
    }


    async function loadUserProfile() {
        try {
            // Use the apiService from api-config.js
            const user = await apiService.getUserProfile();

            // 1. Update Welcome Header
            const welcomeHeader = document.getElementById('welcome-header');
            if (welcomeHeader) {
                welcomeHeader.textContent = `Welcome Back, ${user.name}!`;
            }

            // 2. Update Top-Right Nav Bar
            const navUserName = document.getElementById('nav-user-name');
            if (navUserName) {
                navUserName.textContent = user.name;
            }
            const navUserAvatar = document.getElementById('nav-user-avatar');
            if (navUserAvatar) {
                navUserAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`;
            }

            // 3. Populate "My Profile" Form
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.value = user.name;
            }

            const profileEmail = document.getElementById('profile-email');
            if (profileEmail) {
                profileEmail.value = user.email;
            }

            const profilePhone = document.getElementById('profile-phone');
            if (profilePhone) {
                profilePhone.value = user.phone || ''; // Use phone from UserProfileDTO
            }

            const profileAddress = document.getElementById('profile-address');
            if (profileAddress) {
                profileAddress.value = user.address || ''; // Use address from User entity
            }

            // 4. Populate Profile Avatar
            const profileAvatarLarge = document.getElementById('profile-avatar-large');
            if (profileAvatarLarge) {
                profileAvatarLarge.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=150`;
            }

        } catch (error) {
            console.error('Failed to load user profile:', error);
            // If it fails (e.g., token expired), send user back to login
            alert('Your session has expired. Please log in again.');
            window.location.href = '/login2.html';
        }
    }
});

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
        updateUserLanguage(e.target.value);
    });
}

/* ==========================================
   4. NAVIGATION
   ========================================== */
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click',async (e) => {
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

            // Load data on tab click
            if (targetSection === 'search') {
                await loadUserFavoriteIds(); // Load favorites first
                loadServices(); // Load services
                loadFilterCategories();
            } else if (targetSection === 'bookings') {
                loadMyBookings('all'); // Load all bookings
                document.querySelectorAll('#bookings-section .tab').forEach(t => t.classList.remove('active'));
                document.querySelector('#bookings-section .tab[data-tab="all"]').classList.add('active');
            } else if (targetSection === 'favorites') {
                await loadUserFavoriteIds(); // Make sure favorites are loaded
                loadFavoritesTab(); // Load the favorites tab content
            }else if (targetSection === 'reviews') { // Load reviews
                loadMyReviews();
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
   6. TABS FUNCTIONALITY (MODIFIED)
   ========================================== */
function initializeBookingTabs() {
    const tabs = document.querySelectorAll('#bookings-section .tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const parentContainer = this.closest('.content-section');
            const allTabs = parentContainer.querySelectorAll('.tab');

            // Remove active class from all tabs in this section
            allTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Get tab type (all, PENDING, CONFIRMED, etc.)
            const tabType = this.getAttribute('data-tab');

            // MODIFIED: Fetch data instead of filtering static content
            loadMyBookings(tabType);
        });
    });
}

// REMOVED: filterBookings(type) function is no longer needed

/* ==========================================
   7. QUICK ACTIONS
   ========================================== */
const actionButtons = document.querySelectorAll('.action-btn');
actionButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const actionText = this.querySelector('span').textContent;
        const lang = localStorage.getItem('language') || 'en';

        // Navigate to appropriate section based on action
        if (actionText.includes('Find') || actionText.includes('සොයන්න')) {
            document.querySelector('[data-section="search"]').click();
        } else if (actionText.includes('Book') || actionText.includes('වෙන්කරවා')) {
            document.querySelector('[data-section="search"]').click();
        } else if (actionText.includes('History') || actionText.includes('ඉතිහාසය')) {
            document.querySelector('[data-section="bookings"]').click();
        } else if (actionText.includes('Payment') || actionText.includes('ගෙවීම්')) {
            document.querySelector('[data-section="payments"]').click();
        }
    });
});


/* ==========================================
   10. FAVORITES FUNCTIONALITY
   ========================================== */

// Fetches the user's favorite service IDs and stores them.

async function loadUserFavoriteIds() {
    try {
        userFavoriteServiceIds = await apiService.getFavoriteServiceIds();
    } catch (error) {
        console.error('Failed to load favorite service IDs:', error);
        // Don't block, but favorites may not appear correct
    }
}

//Adds a single event listener to the main content area

function initializeLikeButtonListener() {
    const mainContent = document.querySelector('.main-content');

    mainContent.addEventListener('click', async (e) => {
        // Find the closest like button to the click target
        const likeButton = e.target.closest('.btn-favorite');
        if (!likeButton) return; // Click wasn't on a like button

        e.preventDefault(); // Stop any other actions
        e.stopPropagation(); // Stop bubbling up

        const serviceId = likeButton.dataset.serviceId;
        if (!serviceId) return;

        const isLiked = likeButton.classList.contains('active');

        // Optimistic UI update
        likeButton.classList.toggle('active', !isLiked);
        const icon = likeButton.querySelector('i');
        icon.className = !isLiked ? 'fas fa-heart' : 'far fa-heart'; // Solid vs Regular
        likeButton.disabled = true;

        try {
            if (isLiked) {
                // It was liked, so REMOVE it
                await apiService.removeFavorite(serviceId);
                userFavoriteServiceIds.delete(Number(serviceId));
                showToast('Removed from favorites');

                // If on favorites tab, remove the card from the view
                const favoritesGrid = e.target.closest('#favorites-grid-container');
                if (favoritesGrid) {
                    const card = e.target.closest('.provider-card-large');
                    card.remove();
                    // Check if grid is now empty
                    if (favoritesGrid.children.length === 0) {
                        favoritesGrid.innerHTML = '<p>You have no favorite services.</p>';
                    }
                }
            } else {
                // It was not liked, so ADD it
                await apiService.addFavorite(serviceId);
                userFavoriteServiceIds.add(Number(serviceId));
                showToast('Added to favorites!');
            }
        } catch (error) {
            console.error('Failed to update favorite:', error);
            showToast(`Error: ${error.message}`, true);
            // Roll back the UI change on error
            likeButton.classList.toggle('active', isLiked); // Set back to original state
            icon.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
        } finally {
            likeButton.disabled = false;
        }
    });
}


/* ==========================================
   11. PROVIDER BOOKING
   ========================================== */

// View provider profile
document.body.addEventListener('click', function(e) {
    const profileBtn = e.target.closest('.btn-secondary[data-i18n="view-profile"]');
    if (profileBtn) {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en'
            ? 'Loading provider profile...'
            : 'සපයන්නාගේ පැතිකඩ පූරණය කරමින්...';

        alert(message);
        // Here you would navigate to provider profile page
    }
});

/* ==========================================
   12. REVIEWS MANAGEMENT
   ========================================== */
// Edit review
document.querySelectorAll('.review-actions .btn-secondary').forEach(btn => {
    if (btn.textContent.includes('Edit') || btn.textContent.includes('සංස්කරණය')) {
        btn.addEventListener('click', function() {
            const reviewCard = this.closest('.review-card-user');

            const lang = localStorage.getItem('language') || 'en';
            const message = lang === 'en'
                ? 'Opening review editor...'
                : 'සමාලෝචන සංස්කාරකය විවෘත කරමින්...';

            alert(message);
            // Here you would open review edit modal
        });
    }
});

// Delete review
document.querySelectorAll('.review-actions .btn-secondary').forEach(btn => {
    if (btn.textContent.includes('Delete') || btn.textContent.includes('මකන්න')) {
        btn.addEventListener('click', function() {
            const reviewCard = this.closest('.review-card-user');

            const lang = localStorage.getItem('language') || 'en';
            const confirmMessage = lang === 'en'
                ? 'Are you sure you want to delete this review?'
                : 'ඔබට මෙම සමාලෝචනය මකා දැමීමට අවශ්‍ය බව විශ්වාසද?';
            const successMessage = lang === 'en'
                ? 'Review deleted successfully!'
                : 'සමාලෝචනය සාර්ථකව මකා දමන ලදී!';

            if (confirm(confirmMessage)) {
                alert(successMessage);
                reviewCard.remove();
                // Here you would delete review via API
            }
        });
    }
});

/* ==========================================
   13. PAYMENT METHODS
   ========================================== */
// Add payment method
const addPaymentBtn = document.querySelector('.page-header .btn-primary');
if (addPaymentBtn && (addPaymentBtn.textContent.includes('Add Payment') || addPaymentBtn.textContent.includes('ගෙවීම් ක්‍රමයක්'))) {
    addPaymentBtn.addEventListener('click', () => {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en'
            ? 'Opening payment method form...'
            : 'ගෙවීම් ක්‍රම පෝරමය විවෘත කරමින්...';

        alert(message);
        // Here you would open add payment modal
    });
}

// Edit payment method
document.querySelectorAll('.payment-card .btn-icon').forEach(btn => {
    if (btn.title === 'Edit') {
        btn.addEventListener('click', function() {
            const lang = localStorage.getItem('language') || 'en';
            const message = lang === 'en'
                ? 'Opening payment method editor...'
                : 'ගෙවීම් ක්‍රම සංස්කාරකය විවෘත කරමින්...';

            alert(message);
            // Here you would open edit payment modal
        });
    }
});

// Delete payment method
document.querySelectorAll('.payment-card .btn-icon').forEach(btn => {
    if (btn.title === 'Delete') {
        btn.addEventListener('click', function() {
            const paymentCard = this.closest('.payment-card');
            const cardNumber = paymentCard.querySelector('.card-number').textContent;

            const lang = localStorage.getItem('language') || 'en';
            const confirmMessage = lang === 'en'
                ? `Delete payment method ${cardNumber}?`
                : `ගෙවීම් ක්‍රමය ${cardNumber} මකන්නද?`;
            const successMessage = lang === 'en'
                ? 'Payment method deleted!'
                : 'ගෙවීම් ක්‍රමය මකා දමන ලදී!';

            if (confirm(confirmMessage)) {
                alert(successMessage);
                paymentCard.remove();
                // Here you would delete payment method via API
            }
        });
    }
});

/* ==========================================
   14. PROFILE MANAGEMENT
   ========================================== */
// Change photo
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

                    // Update avatar in top nav
                    const topAvatar = document.querySelector('.user-avatar');
                    if (topAvatar) {
                        topAvatar.src = e.target.result;
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

// Save profile changes
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            alert(successText);
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
   15. SETTINGS MANAGEMENT
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
        // Here you would save the setting preference via API
    });
});

// Change password
document.querySelectorAll('.settings-group .btn-secondary').forEach(btn => {
    if (btn.textContent.includes('Password') || btn.textContent.includes('මුරපදය')) {
        btn.addEventListener('click', () => {
            const lang = localStorage.getItem('language') || 'en';
            const message = lang === 'en'
                ? 'Opening password change form...'
                : 'මුරපදය වෙනස් කිරීමේ පෝරමය විවෘත කරමින්...';

            alert(message);
            // Here you would open password change modal
        });
    }
});

// Delete account
document.querySelectorAll('.settings-group .btn-danger').forEach(btn => {
    btn.addEventListener('click', () => {
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
                // Here you would make an API call to delete account
                // Then redirect to home page
                // window.location.href = 'index.html';
            }
        }
    });
});

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
        // Here you would open notifications dropdown
    });
}

/* ==========================================
   17. PROMO CARD
   ========================================== */
const promoBtn = document.querySelector('.btn-promo');
if (promoBtn) {
    promoBtn.addEventListener('click', () => {
        const lang = localStorage.getItem('language') || 'en';
        const message = lang === 'en'
            ? 'Promo code applied: SAVE20'
            : 'ප්‍රවර්ධන කේතය යොදන ලදී: SAVE20';

        alert(message);
        // Here you would apply promo code
    });
}

/* ==========================================
   18. VIEW ALL LINKS
   ========================================== */
document.querySelectorAll('.view-all').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('href').substring(1);
        const navItem = document.querySelector(`[data-section="${targetSection}"]`);
        if (navItem) {
            navItem.click();
        }
    });
});

/* ==========================================
   19. USER MENU
   ========================================== */
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
                e.preventDefault(); // Stop the link from navigating away

                // Find the main nav link for 'profile' or 'settings' and click it
                const navLink = document.querySelector(`.nav-item[data-section="${section}"]`);
                if (navLink) {
                    navLink.click();
                }
                userDropdown.classList.remove('active'); // Hide dropdown after click
            }
        });
    });
}

/* ==========================================
   20. UTILITY FUNCTIONS
   ========================================== */

// Format currency
function formatCurrency(amount) {
    // Note: This formats as USD. You might want to change 'USD' to 'LKR' or remove it.
    // For "Rs. 85.00", we can do a custom format.
    if (typeof amount === 'number') {
        return `Rs. ${amount.toFixed(2)}`;
    }
    return amount;
}

// Format date
function formatDate(dateString) {
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

// Toast Notification
function showToast(message, isError = false) {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('i');

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
   21. ERROR HANDLING
   ========================================== */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

/* ==========================================
   22. CONSOLE WELCOME MESSAGE
   ========================================== */
console.log('%cFixIT User Dashboard', 'color: #2563eb; font-size: 24px; font-weight: bold;');
console.log('%cVersion 1.0.0', 'color: #6b7280; font-size: 12px;');
console.log('%c© 2025 FixIT. All rights reserved.', 'color: #6b7280; font-size: 12px;');

/* ==========================================
   23. DATA FETCHING (Services, Bookings)
   ========================================== */

/**
 * Fetches service categories and populates the filter dropdown.
 */
async function loadFilterCategories() {
    const categorySelect = document.getElementById('filter-category-select');
    if (!categorySelect) return;

    // Prevent re-loading if already populated
    if (categorySelect.options.length > 1) {
        return;
    }

    try {
        const categories = await apiService.getServiceCategories();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load filter categories:', error);
    }
}
/**
 * Fetches services and renders them in the list.
 */
async function loadServices(categoryId = null, location = null, minPrice = null, maxPrice = null, minRating = null) {
    const container = document.getElementById('providers-list-container');
    const resultsHeader = document.getElementById('results-count-header');
    if (!container || !resultsHeader) return;

    container.innerHTML = '<p>Loading services...</p>';
    resultsHeader.innerHTML = `... <span data-i18n="services-found">services found</span>`;

    try {
        // Build the query URL
        let query = `${API_CONFIG.ENDPOINTS.SERVICES}?page=0&size=10`;

        if (categoryId) {
            query += `&categoryId=${categoryId}`;
        }
        if (location && location.trim() !== '') {
            query += `&location=${encodeURIComponent(location.trim())}`;
        }
        if (minPrice && minPrice.trim() !== '') {
            query += `&minPrice=${minPrice}`;
        }
        if (maxPrice && maxPrice.trim() !== '') {
            query += `&maxPrice=${maxPrice}`;
        }
        if (minRating && minRating > 0) { // Don't send "0"
            query += `&minRating=${minRating}`;
        }

        // Fetch data from the /api/services endpoint
        const response = await apiService.request(query, { method: 'GET' });
        const services = response.content;

        container.innerHTML = '';

        if (services.length === 0) {
            resultsHeader.innerHTML = '0 <span data-i18n="services-found">services found</span>';
            container.innerHTML = '<p>No services found matching your criteria.</p>';
            return;
        }

        // Update results count
        resultsHeader.innerHTML = `${response.totalElements} <span data-i18n="services-found">services found</span>`;

        // Render each service card
        services.forEach(service => {
            const cardHtml = createServiceCardHtml(service);
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Re-initialize favorite buttons for the new cards
        // initializeFavorites(); // This is now handled by event delegation

    } catch (error) {
        console.error('Failed to load services:', error);
        container.innerHTML = '<p>Error loading services. Please try again.</p>';
    }
}

/**
 * Creates the HTML for a single service card.
 * @param {object} service - The Service object from the API
 * @returns {string} - The HTML string for the card
 */
function createServiceCardHtml(service) {
    const providerPhoto = service.providerPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.providerName)}&background=2563eb&color=fff&size=100`;
    const specialty = service.categoryName || 'Specialist';
    const reviewCount = service.providerReviewCount;
    const servicePrice = parseFloat(service.price).toFixed(2);

    const isLiked = userFavoriteServiceIds.has(service.id);
    const likedClass = isLiked ? 'active' : '';
    const iconClass = isLiked ? 'fas' : 'far'; // Solid vs. Regular heart

    return `
    <div class="provider-card-large">
        <img src="${providerPhoto}" alt="${service.providerName}" class="provider-image">
        <div class="provider-info">
            <div class="provider-header-info">
                <h3>${service.name}</h3>
                <!-- MODIFIED: Switched to btn-favorite and added service ID -->
                <button class="btn-favorite ${likedClass}" data-service-id="${service.id}">
                    <i class="${iconClass} fa-heart"></i>
                </button>
            </div>
            <p class="provider-specialty">by <strong>${service.providerName}</strong> in <strong>${specialty}</strong></p>
            
            <div class="provider-rating-large">
                <i class="fas fa-star"></i>
                <span>${(service.providerRatingAvg || 0).toFixed(1)}</span>
                <span class="reviews-count">(${reviewCount} reviews)</span>
            </div>
            
            <p class="provider-description">${service.description || 'No description available.'}</p>
            
            <div class="provider-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${service.providerLocation || 'Not specified'}</span>
                <span><i class="fas fa-dollar-sign"></i> From <strong>Rs.${servicePrice}</strong></span>
            </div>
        </div>
        <div class="provider-actions-large">
            <!--  Add data attributes to the Book Now button -->
            <button class="btn-primary" data-i18n="book-now" 
                data-service-id="${service.id}"
                data-provider-id="${service.providerId}"
                data-service-name="${service.name}"
                data-provider-name="${service.providerName}"
                data-service-price="Rs.${servicePrice}">
                Book Now
            </button>
            <button class="btn-secondary" data-i18n="view-profile" data-provider-id="${service.providerId}">View Profile</button>
        </div>
    </div>
    `;
}


// Loads and displays the user's favorite services in the "Favorites" tab.

async function loadFavoritesTab() {
    const container = document.getElementById('favorites-grid-container');
    if (!container) return;

    container.innerHTML = '<p>Loading your favorite services...</p>';

    try {
        // Fetch the full service card data for favorites
        const favoriteServices = await apiService.getFavoriteServices();
        container.innerHTML = ''; // Clear loading

        if (favoriteServices.length === 0) {
            container.innerHTML = '<p>You haven\'t added any services to your favorites yet.</p>';
            return;
        }

        // We also need to make sure our global Set is up-to-date
        // This is a good time to sync it.
        userFavoriteServiceIds.clear();
        favoriteServices.forEach(service => {
            userFavoriteServiceIds.add(service.id);
        });

        // Render each card
        favoriteServices.forEach(service => {
            const cardHtml = createServiceCardHtml(service);
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Re-apply translations
        updateUserLanguage(localStorage.getItem('language') || 'en');

    } catch (error) {
        console.error('Failed to load favorites:', error);
        container.innerHTML = `<p>Error loading favorites: ${error.message}</p>`;
    }
}
// Fetches and renders upcoming bookings for the dashboard homepage.

async function loadDashboardBookings() {
    const container = document.querySelector('#dashboard-section .bookings-list');
    if (!container) return;

    container.innerHTML = '<p>Loading upcoming bookings...</p>';

    try {
        // Fetch confirmed bookings
        const bookings = await apiService.request(`${API_CONFIG.ENDPOINTS.MY_BOOKINGS}?status=CONFIRMED`, { method: 'GET' });

        if (bookings.length === 0) {
            container.innerHTML = '<p>No upcoming bookings found.</p>';
            return;
        }

        container.innerHTML = ''; // Clear loading
        // Show only the first 2-3
        bookings.slice(0, 3).forEach(booking => {
            const cardHtml = createDashboardBookingCardHtml(booking);
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

    } catch (error) {
        console.error('Failed to load dashboard bookings:', error);
        container.innerHTML = '<p>Could not load bookings.</p>';
    }
}

//Creates the HTML for a *small* dashboard booking card.

function createDashboardBookingCardHtml(booking) {
    const provider = booking.provider;
    const providerPhoto = provider.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=10b981&color=fff`;
    const status = booking.status.toLowerCase();

    const bookingDateTime = new Date(booking.dateTime);
    const dateOptions = { month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedDate = bookingDateTime.toLocaleDateString('en-US', dateOptions);
    const formattedTime = bookingDateTime.toLocaleTimeString('en-US', timeOptions);

    const serviceName = booking.remarks || "Service Booking";
    const serviceIcon = "fas fa-wrench"; // Generic icon
    const iconColor = "blue"; // Generic color

    return `
    <div class="booking-card">
        <div class="booking-header">
            <div class="service-icon-small ${iconColor}">
                <i class="${serviceIcon}"></i>
            </div>
            <span class="booking-status ${status}" data-i18n="${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
        <h4>${serviceName}</h4>
        <div class="booking-provider">
            <img src="${providerPhoto}" alt="${provider.name}">
            <div>
                <strong>${provider.name}</strong>
                <div class="provider-rating">
                    <i class="fas fa-star"></i>
                    <span>${(provider.ratingAvg || 0).toFixed(1)}</span>
                </div>
            </div>
        </div>
        <div class="booking-details">
            <div class="booking-detail">
                <i class="fas fa-calendar"></i>
                <span>${formattedDate}</span>
            </div>
            <div class="booking-detail">
                <i class="fas fa-clock"></i>
                <span>${formattedTime}</span>
            </div>
            <div class="booking-detail">
                <i class="fas fa-dollar-sign"></i>
                <!-- Price is not on the booking entity. This is a limitation. -->
                <span>N/A</span>
            </div>
        </div>
        <button class="btn-primary btn-block" data-i18n="view-details">View Details</button>
    </div>
    `;
}


//Fetches bookings from the API based on status and renders them.

async function loadMyBookings(status = 'all') {
    const container = document.getElementById('bookings-grid-container');
    if (!container) return;

    container.innerHTML = '<p>Loading bookings...</p>';

    try {
        let endpoint = API_CONFIG.ENDPOINTS.MY_BOOKINGS;
        if (status && status !== 'all') {
            endpoint += `?status=${status}`;
        }

        allBookings = await apiService.request(endpoint, { method: 'GET' });

        container.innerHTML = ''; // Clear loading message

        if (allBookings.length === 0) {
            container.innerHTML = '<p>No bookings found in this category.</p>';
            return;
        }

        // Use the global variable to render cards
        allBookings.forEach(booking => {
            const cardHtml = createBookingCardHtml(booking);
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Re-apply translations to new content
        updateUserLanguage(localStorage.getItem('language') || 'en');

    } catch (error) {
        console.error('Failed to load bookings:', error);
        container.innerHTML = '<p>An error occurred while loading your bookings. Please try again.</p>';
    }
}

/**
 * Creates the HTML for a single booking card (My Bookings page).
 * @param {object} booking - The booking data from the API.
 * @returns {string} - The HTML string for the card.
 */
function createBookingCardHtml(booking) {
    const status = booking.status.toUpperCase(); // PENDING, CONFIRMED, COMPLETED, CANCELLED
    const statusClass = status.toLowerCase(); // pending, confirmed, completed, cancelled
    const provider = booking.provider;
    const providerPhoto = provider.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=10b981&color=fff`;

    // Format date and time
    const bookingDateTime = new Date(booking.dateTime);
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedDate = bookingDateTime.toLocaleDateString('en-US', dateOptions);
    const formattedTime = bookingDateTime.toLocaleTimeString('en-US', timeOptions);

    const serviceName = booking.serviceName || booking.remarks || "Service Booking";
    const serviceIcon = booking.serviceCategoryIcon || "fas fa-wrench"; // Use new icon, or fallback
    const iconColor = "blue";

    // Build action buttons based on status
    let actionButtons = '';
    if (status === 'PENDING') {
        actionButtons = `
            <button class="btn-secondary btn-view-details" data-booking-id="${booking.id}" data-i18n="view-details">View Details</button>
            <button class="btn-danger" data-i18n="cancel-booking" onclick="cancelBooking(${booking.id})">Cancel Booking</button>
        `;
    } else if (status === 'CONFIRMED') {
        actionButtons = `
            <button class="btn-secondary btn-view-details" data-booking-id="${booking.id}" data-i18n="view-details">View Details</button>
            <button class="btn-danger" data-i18n="cancel-booking" onclick="cancelBooking(${booking.id})">Cancel Booking</button>
        `;
    } else if (status === 'COMPLETED') {
    actionButtons = `
            <button class="btn-secondary btn-view-details" data-booking-id="${booking.id}" data-i18n="view-details">View Details</button>
            <button class="btn-primary btn-leave-review" data-i18n="leave-review"
                data-booking-id="${booking.id}"
                data-provider-id="${booking.provider.id}"
                data-provider-name="${booking.provider.name}"
                data-service-name="${serviceName}">
                Leave a Review
            </button>
            <button class="btn-secondary" data-i18n="book-again">Book Again</button>
        `;
    } else if (status === 'CANCELLED') {
        actionButtons = `
            <button class="btn-secondary btn-view-details" data-booking-id="${booking.id}" data-i18n="view-details">View Details</button>
            <button class="btn-secondary" data-i18n="book-again">Book Again</button>
        `;
    }


    return `
    <div class="booking-card-full ${statusClass}">
        <div class="booking-card-header">
            <div class="booking-info-header">
                <div class="service-icon-medium ${iconColor}">
                    <i class="${serviceIcon}"></i>
                </div>
                <div>
                    <h3>${serviceName}</h3>
                    <p class="booking-id">Booking #${booking.id}</p>
                </div>
            </div>
            <span class="booking-status-large ${statusClass}" data-i18n="${statusClass}">${status}</span>
        </div>

        <div class="booking-card-body">
            <div class="booking-provider-info">
                <img src="${providerPhoto}" alt="${provider.name}">
                <div>
                    <strong>${provider.name}</strong>
                    <p style="color: var(--text-light); font-size: 14px; margin-top: 4px;">
                        <i class="fas fa-phone-alt" style="margin-right: 5px;"></i>${provider.contactNo || ''}
                    </p>
                    <div class="provider-rating" style="margin-top: 4px;">
                        <i class="fas fa-star"></i>
                        <span>${(provider.ratingAvg || 0).toFixed(1)}</span>
                    </div>
                </div>
            </div>

            <div class="booking-info-grid">
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <div>
                        <span class="info-label" data-i18n="date">Date</span>
                        <strong>${formattedDate}</strong>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <div>
                        <span class="info-label" data-i18n="time">Time</span>
                        <strong>${formattedTime}</strong>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-dollar-sign"></i>
                    <div>
                        <span class="info-label" data-i18n="amount">Amount</span>
                        <strong>${booking.servicePrice ? `Rs.${booking.servicePrice.toFixed(2)}` : 'N/A'}</strong>
                    </div>
                </div>
            </div>
        </div>

        <div class="booking-card-footer">
            ${actionButtons}
        </div>
    </div>
    `;
}

// Handle booking cancellation
async function cancelBooking(bookingId) {
    const lang = localStorage.getItem('language') || 'en';
    const confirmMessage = lang === 'en'
        ? `Are you sure you want to cancel booking #${bookingId}?`
        : `ඔබට වෙන්කරවා ගැනීම #${bookingId} අවලංගු කිරීමට අවශ්‍ය බව විශ්වාසද?`;

    if (confirm(confirmMessage)) {
        try {
            // Use the correct endpoint /api/bookings/{id} with DELETE
            await apiService.request(`${API_CONFIG.ENDPOINTS.MY_BOOKINGS}/${bookingId}`, { method: 'DELETE' });

            const successMessage = lang === 'en'
                ? 'Booking cancelled successfully!'
                : 'වෙන්කරවා ගැනීම සාර්ථකව අවලංගු කරන ලදී!';
            showToast(successMessage);

            // Reload the current tab's bookings
            const currentTab = document.querySelector('#bookings-section .tab.active').getAttribute('data-tab');
            loadMyBookings(currentTab);

        } catch (error) {
            console.error('Failed to cancel booking:', error);
            const errorMessage = lang === 'en'
                ? `Error: ${error.message}`
                : `දෝෂය: ${error.message}`;
            showToast(errorMessage, true); // Show error toast
        }
    }
}


// Booking Modal Flow

function initializeBookingFlow() {
    const modal = document.getElementById('booking-modal');
    const closeBtn = document.getElementById('booking-modal-close-btn');
    const cancelBtn = document.getElementById('booking-modal-cancel-btn');
    const form = document.getElementById('booking-form');
    const contentArea = document.querySelector('.main-content');

    if (!modal || !closeBtn || !cancelBtn || !form || !contentArea) {
        console.error('Booking modal elements not found.');
        return;
    }

    // Using event delegation on the container
    contentArea.addEventListener('click', (e) => {
        // Find the "Book Now" button
        const bookBtn = e.target.closest('[data-i18n="book-now"]');

        if (bookBtn) {
            e.preventDefault();

            // Read data from button attributes
            const serviceName = bookBtn.dataset.serviceName;
            const providerName = bookBtn.dataset.providerName;
            const servicePrice = bookBtn.dataset.servicePrice;
            const providerId = bookBtn.dataset.providerId;
            const serviceId = bookBtn.dataset.serviceId;

            // Populate the modal
            document.getElementById('booking-modal-service-name').textContent = serviceName;
            document.getElementById('booking-modal-provider-name').textContent = providerName;
            document.getElementById('booking-modal-service-price').textContent = servicePrice;
            document.getElementById('booking-provider-id').value = providerId;
            modal.dataset.serviceId = serviceId; // Store serviceId on the modal itself


            // Set min value for date/time picker to now
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
            const nowISO = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
            document.getElementById('booking-datetime').min = nowISO;


            // Show the modal
            modal.classList.add('active');
        }
    });

    // Close modal listeners
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

    // Handle booking confirmation
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const confirmBtn = document.getElementById('booking-modal-confirm-btn');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Requesting...';

        const providerId = document.getElementById('booking-provider-id').value;
        const serviceId = document.getElementById('booking-modal').dataset.serviceId;

        const dateTimeInput = document.getElementById('booking-datetime');
        const remarks = document.getElementById('booking-remarks').value;

        // Check if date is in the future
        const selectedDate = new Date(dateTimeInput.value);
        if (selectedDate < new Date()) {
            showToast('Please select a date and time in the future.', true);
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
            return;
        }

        const bookingData = {
            providerId: Number(providerId),
            serviceId: Number(serviceId),
            dateTime: selectedDate.toISOString(),
            remarks: remarks
        };

        try {
            await apiService.bookService(bookingData);

            //Show confirmation
            modal.classList.remove('active');
            form.reset();
            showToast('Booking Requested! You can see its status in "My Bookings".');

        } catch (error) {
            console.error('Booking failed:', error);
            showToast(`Booking failed: ${error.message}`, true);
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
        }
    });
}

// BOOKING DETAILS MODAL
function initializeDetailsModal() {
    const modal = document.getElementById('booking-details-modal');
    const closeBtn = document.getElementById('details-modal-close-btn');
    if (!modal || !closeBtn) return;

    // Function to close the modal
    const closeModal = () => modal.classList.remove('active');

    // Close listeners
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        // Close if clicking on the overlay itself
        if (e.target === modal) {
            closeModal();
        }
    });

    // Event delegation for the "View Details" buttons
    document.body.addEventListener('click', (e) => {
        const detailsBtn = e.target.closest('.btn-view-details');

        if (detailsBtn) {
            e.preventDefault();
            const bookingId = detailsBtn.dataset.bookingId;

            // Find the booking data from our global array
            const booking = allBookings.find(b => b.id == bookingId);

            if (booking) {
                // Populate the modal
                document.getElementById('details-service-name').textContent = booking.serviceName || 'N/A';
                document.getElementById('details-service-description').textContent = booking.serviceDescription || 'No description provided.';
                document.getElementById('details-provider-name').textContent = booking.provider?.name || 'N/A';
                document.getElementById('details-provider-contact').textContent = booking.provider?.contactNo || 'N/A';

                document.getElementById('details-booking-id').textContent = `#${booking.id}`;

                // Format date and time again for details
                const bookingDateTime = new Date(booking.dateTime);
                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
                document.getElementById('details-booking-date').textContent = bookingDateTime.toLocaleDateString('en-US', dateOptions);
                document.getElementById('details-booking-time').textContent = `at ${bookingDateTime.toLocaleTimeString('en-US', timeOptions)}`;

                document.getElementById('details-booking-price').textContent = booking.servicePrice ? `Rs.${parseFloat(booking.servicePrice).toFixed(2)}` : 'N/A';
                document.getElementById('details-booking-status').textContent = booking.status;
                document.getElementById('details-booking-remarks').textContent = booking.remarks || 'No remarks provided.';

                // Show the modal
                modal.classList.add('active');
            } else {
                console.error('Could not find booking data for id:', bookingId);
                alert('Error: Could not load booking details.');
            }
        }
    });
}

/* ==========================================
   24. REVIEW MODAL
   ========================================== */

/**
 * Initializes all logic for the "Leave a Review" modal.
 */
function initializeReviewModal() {
    const modal = document.getElementById('review-modal');
    const closeBtn = document.getElementById('review-modal-close-btn');
    const cancelBtn = document.getElementById('review-modal-cancel-btn');
    const form = document.getElementById('review-form');
    const starRatingContainer = document.getElementById('review-star-rating');
    const ratingValueInput = document.getElementById('review-rating-value');
    const stars = starRatingContainer.querySelectorAll('i');

    if (!modal || !form || !starRatingContainer) return;

    // --- Open Modal Listener (using event delegation) ---
    document.body.addEventListener('click', (e) => {
        const reviewBtn = e.target.closest('.btn-leave-review');
        if (reviewBtn) {
            e.preventDefault();

            // Get data from the button
            const providerId = reviewBtn.dataset.providerId;
            const bookingId = reviewBtn.dataset.bookingId;
            const providerName = reviewBtn.dataset.providerName;
            const serviceName = reviewBtn.dataset.serviceName;

            // Populate the modal
            document.getElementById('review-provider-id').value = providerId;
            document.getElementById('review-booking-id').value = bookingId;
            document.getElementById('review-provider-name').textContent = providerName;
            document.getElementById('review-service-name').textContent = serviceName;

            // Reset form
            form.reset();
            setStarRating(0); // Reset stars

            // Show the modal
            modal.classList.add('active');
        }
    });

    // --- Close Modal Listeners ---
    const closeModal = () => modal.classList.remove('active');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // --- Star Rating Logic ---
    const setStarRating = (rating) => {
        ratingValueInput.value = rating;
        stars.forEach(star => {
            if (star.dataset.value <= rating) {
                star.classList.replace('far', 'fas'); // Solid star
            } else {
                star.classList.replace('fas', 'far'); // Empty star
            }
        });
    };

    starRatingContainer.addEventListener('click', (e) => {
        if (e.target.dataset.value) {
            const rating = e.target.dataset.value;
            setStarRating(rating);
        }
    });

    starRatingContainer.addEventListener('mouseover', (e) => {
        if (e.target.dataset.value) {
            const rating = e.target.dataset.value;
            stars.forEach(star => {
                if (star.dataset.value <= rating) {
                    star.classList.replace('far', 'fas');
                } else {
                    star.classList.replace('fas', 'far');
                }
            });
        }
    });

    starRatingContainer.addEventListener('mouseout', () => {
        // On mouse out, reset to the selected rating
        setStarRating(ratingValueInput.value);
    });

    // --- Form Submission Logic ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('review-modal-submit-btn');
        const rating = Number(ratingValueInput.value);
        const comment = document.getElementById('review-comment').value;
        const providerId = Number(document.getElementById('review-provider-id').value);

        if (rating === 0) {
            showToast('Please select a rating (1-5 stars).', true);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const reviewData = {
            providerId: providerId,
            rating: rating,
            comment: comment
        };

        try {
            // Use the new API endpoint
            await apiService.request(API_CONFIG.ENDPOINTS.SUBMIT_REVIEW, {
                method: 'POST',
                body: JSON.stringify(reviewData)
            });

            showToast('Review submitted successfully!');
            closeModal();
            form.reset();
            setStarRating(0);

            // Refresh the "My Reviews" tab if it's active
            if (document.getElementById('reviews-section').classList.contains('active')) {
                loadMyReviews();
            }

            // Refresh the bookings tab to hide the "Leave a Review" button (or disable it)
            // For simplicity, we just reload the bookings
            const currentTab = document.querySelector('#bookings-section .tab.active').getAttribute('data-tab');
            loadMyBookings(currentTab);

        } catch (error) {
            console.error('Failed to submit review:', error);
            showToast(`Error: ${error.message}`, true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Review';
        }
    });
}

/**
 * Fetches and renders the user's reviews in the "My Reviews" tab.
 */
async function loadMyReviews() {
    const container = document.getElementById('reviews-list-container');
    if (!container) return;

    container.innerHTML = '<p>Loading your reviews...</p>';

    try {
        const reviews = await apiService.request(API_CONFIG.ENDPOINTS.MY_REVIEWS, {
            method: 'GET'
        });

        container.innerHTML = ''; // Clear loading

        if (reviews.length === 0) {
            container.innerHTML = '<p>You have not written any reviews yet.</p>';
            return;
        }

        reviews.forEach(review => {
            const cardHtml = createReviewCardHtml(review);
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Re-apply translations
        updateUserLanguage(localStorage.getItem('language') || 'en');

    } catch (error) {
        console.error('Failed to load reviews:', error);
        container.innerHTML = '<p>Error loading your reviews. Please try again.</p>';
    }
}

// Creates the HTML for a single review card.

function createReviewCardHtml(review) {
    const reviewDate = new Date(review.createdAt);
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = reviewDate.toLocaleDateString('en-US', dateOptions);

    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= review.rating) {
            stars += '<i class="fas fa-star"></i>'; // Solid star
        } else {
            stars += '<i class="far fa-star"></i>'; // Empty star
        }
    }

    return `
    <div class="review-card-user">
        <div class="review-header-user">
            <div class="review-service-info">
                <img src="${review.providerPhoto}" alt="${review.providerName}">
                <div>
                    <h4>${review.providerName}</h4>
                    <p>${formattedDate}</p>
                </div>
            </div>
            <div class="review-rating-user">
                ${stars}
            </div>
        </div>
        <p class="review-text">${review.comment}</p>
        <div class="review-actions">
            <!-- Edit/Delete buttons can be enabled in a future update -->
            <!-- <button class="btn-secondary btn-sm" data-i18n="edit">Edit</button> -->
            <!-- <button class="btn-secondary btn-sm" data-i18n="delete">Delete</button> -->
            <span class="status-badge ${review.status.toLowerCase()}">${review.status}</span>
        </div>
    </div>
    `;
}