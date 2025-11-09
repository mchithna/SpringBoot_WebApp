/* ==========================================
   FIXIT LOGIN/REGISTER - SCRIPT
   ========================================== */

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language
    const savedLanguage = localStorage.getItem('language') || 'en';
    document.getElementById('languageSelect').value = savedLanguage;
    updateLanguage(savedLanguage);

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle i').classList.replace('fa-moon', 'fa-sun');
    }

    // Initialize validation for both forms
    setupInputValidation(document.getElementById('login-form'));
    setupInputValidation(document.getElementById('register-form'));

    document.querySelectorAll('input[name="register-user-type"]').forEach(radio => {
    });
});

// Language switcher
document.getElementById('languageSelect').addEventListener('change', (e) => {
    updateLanguage(e.target.value);
});

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', function() {
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

// --- API SUBMISSION LOGIC ---

// LOGIN FORM
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Stop default form submission

    let isValid = true;
    // Re-validate all fields on submit to be safe
    this.querySelectorAll('input[required]').forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    if (isValid) {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const userType = document.querySelector('input[name="login-user-type"]:checked').value;

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');

        try {
            const response = await apiService.login(email, password, userType);

            submitBtn.classList.remove('loading');
            const successMsg = currentLanguage === 'en'
                ? 'Login successful! Redirecting...'
                : 'ඇතුල් වීම සාර්ථකයි! හරවා යැවෙමින්...';
            showSuccessMessage(successMsg);

            setTimeout(() => {
                this.reset();
                // Redirect to the correct dashboard (paths from root)
                if (userType === 'admin') {
                    window.location.href = '/admin-dashboard.html';
                } else if (userType === 'provider') {
                    window.location.href = '/provider-dashboard.html';
                } else {
                    window.location.href = '/user-dashboard.html';
                }
            }, 2000);
        } catch (error) {
            submitBtn.classList.remove('loading');
            const errorMsg = currentLanguage === 'en'
                ? 'Login failed. Please check your credentials.'
                : 'ඇතුල් වීම අසාර්ථකයි. කරුණාකර ඔබේ තොරතුරු පරීක්ෂා කරන්න.';
            alert(errorMsg);
        }
    }
});

// REGISTER FORM
document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Stop default form submission

    let isValid = true;
    // MODIFIED: Validate all *visible* required inputs
    this.querySelectorAll('input[required], select[required]').forEach(input => {
        // Only validate visible inputs
        if (input.closest('.input-group')) {
            if (!validateInput(input)) {
                isValid = false;
            }
        }
    });

    if (isValid) {
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');

        const userType = document.querySelector('input[name="register-user-type"]:checked').value;
        const userData = {
            name: document.getElementById('register-name').value,
            email: document.getElementById('register-email').value,
            phone: document.getElementById('register-phone').value,
            password: document.getElementById('register-password').value,
            userType: userType
        };

        // --- MODIFICATION: Removed the block that added serviceCategoryId ---
        // if (userType === 'provider') {
        //     userData.serviceCategoryId = document.getElementById('register-category').value;
        // }
        // --- END MODIFICATION ---

        try {
            // API call to Spring Boot backend
            const response = await apiService.register(userData);

            submitBtn.classList.remove('loading');
            const successMsg = currentLanguage === 'en'
                ? 'Account created successfully! Welcome to FixIT!'
                : 'ගිණුම සාර්ථකව සාදන ලදී! FixIT වෙත සාදරයෙන් පිළිගනිමු!';
            showSuccessMessage(successMsg);

            setTimeout(() => {
                this.reset();
                // Switch back to login form
                registerForm.classList.remove('active');
                loginForm.classList.add('active');
            }, 2000);
        } catch (error) {
            submitBtn.classList.remove('loading');
            const errorMsg = currentLanguage === 'en'
                ? 'Registration failed. Email may already be in use.'
                : 'ලියාපදිංචිය අසාර්ථකයි. විද්‍යුත් තැපෑල දැනටමත් භාවිතයේ තිබිය හැක.';
            alert(errorMsg);
        }
    }
});


// --- UI and VALIDATION LOGIC ---

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');

// Toggle between Login and Register
showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
});

// Password Toggle Functionality
document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);

        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});

// Caps Lock Detection
document.querySelectorAll('input[type="password"]').forEach(input => {
    input.addEventListener('keyup', function(e) {
        const capsLockWarning = this.parentElement.parentElement.querySelector('.caps-lock-warning');
        if (capsLockWarning) {
            if (e.getModifierState('CapsLock')) {
                capsLockWarning.classList.add('show');
            } else {
                capsLockWarning.classList.remove('show');
            }
        }
    });
});

    // Validation Helpers

// Email Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Phone Validation
function validatePhone(phone) {
    const re = /^[0-9]{10}$/; // 10 digits
    return re.test(phone);
}

// Password Validation
const passwordChecks = {
    length: (p) => p.length >= 8,
    uppercase: (p) => /[A-Z]/.test(p),
    lowercase: (p) => /[a-z]/.test(p),
    number: (p) => /[0-9]/.test(p),
    special: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p)
};

// Password Strength Checker
const registerPassword = document.getElementById('register-password');
const strengthBar = document.querySelector('.strength-fill');
const strengthText = document.querySelector('.strength-text');
const requirements = {
    length: document.getElementById('req-length'),
    uppercase: document.getElementById('req-uppercase'),
    lowercase: document.getElementById('req-lowercase'),
    number: document.getElementById('req-number'),
    special: document.getElementById('req-special')
};

registerPassword?.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;

    // Update requirement indicators
    Object.keys(passwordChecks).forEach(key => {
        if (passwordChecks[key](password)) {
            requirements[key].classList.add('met');
            strength++;
        } else {
            requirements[key].classList.remove('met');
        }
    });

    // Update strength bar
    const percentage = (strength / 5) * 100;
    strengthBar.style.width = percentage + '%';

    if (strength <= 2) {
        strengthBar.style.background = 'var(--danger-color)';
    } else if (strength <= 4) {
        strengthBar.style.background = 'var(--warning-color)';
    } else {
        strengthBar.style.background = 'var(--success-color)';
    }
});

// Real-time Input Validation
function setupInputValidation(form) {
    const inputs = form.querySelectorAll('input[required]');

    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });

        input.addEventListener('input', function() {
            // Re-validate on input only if it was already invalid
            if (this.classList.contains('invalid')) {
                validateInput(this);
            }
            // Special case for confirm password
            if (this.id === 'register-confirm-password') {
                validateInput(this);
            }
        });
    });
}

// validation function
function validateInput(input) {
    const inputGroup = input.closest('.input-group');
    if (!inputGroup) return true; // Safety check if input is not in a group

    const errorMessage = inputGroup.querySelector('.error-message');
    let isValid = true;
    let message = '';

    // Check if empty
    if (input.value.trim() === '') {
        isValid = false;
        message = 'This field is required';
    }
    // Email validation
    else if (input.type === 'email' && !validateEmail(input.value)) {
        isValid = false;
        message = 'Please enter a valid email address';
    }
    // Phone validation
    else if (input.type === 'tel' && !validatePhone(input.value)) {
        isValid = false;
        message = 'Please enter a valid 10-digit phone number (e.g., 0771234567)';
    }
    // Name validation
    else if (input.type === 'text' && input.id === 'register-name') {
        if (input.value.length < 3) {
            isValid = false;
            message = 'Name must be at least 3 characters';
        }
    }
    // Checkbox validation
    else if (input.type === 'checkbox' && input.id === 'terms') {
        if (!input.checked) {
            isValid = false;
            message = 'You must agree to the terms and conditions';
        }
    }
    // --- FIXED PASSWORD VALIDATION ---
    else if (input.id === 'register-password') {
        const password = input.value;
        if (!passwordChecks.length(password)) {
            isValid = false;
            message = 'Password must be at least 8 characters';
        } else if (!passwordChecks.uppercase(password)) {
            isValid = false;
            message = 'Password must contain one uppercase letter';
        } else if (!passwordChecks.lowercase(password)) {
            isValid = false;
            message = 'Password must contain one lowercase letter';
        } else if (!passwordChecks.number(password)) {
            isValid = false;
            message = 'Password must contain one number';
        } else if (!passwordChecks.special(password)) {
            isValid = false;
            message = 'Password must contain one special character';
        }
    }
    // Confirm password validation
    else if (input.id === 'register-confirm-password') {
        const password = document.getElementById('register-password').value;
        if (input.value !== password) {
            isValid = false;
            message = 'Passwords do not match';
        }
    }

    // Update UI
    if (isValid) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.classList.remove('show');
        }
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
        }
    }

    return isValid;
}

// Show Success Message
function showSuccessMessage(message) {
    successText.textContent = message;
    successMessage.classList.add('show');

    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

// Social Login Handlers
document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', function() {
        const provider = this.classList.contains('btn-google') ? 'Google' : 'Facebook';
        showSuccessMessage(`Connecting to ${provider}...`);
        // Implement OAuth logic here
    });
});

// Forgot Password Handler
document.querySelector('.forgot-password')?.addEventListener('click', function(e) {
    e.preventDefault();
    const email = prompt('Enter your email address to reset password:');
    if (email && validateEmail(email)) {
        showSuccessMessage('Password reset link sent to your email!');
    } else if (email) {
        alert('Please enter a valid email address');
    }
});

