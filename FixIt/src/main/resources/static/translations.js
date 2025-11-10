// Language translations
const translations = {
    en: {
        'tagline': 'Your Trusted Home Service Partner',
        'login-title': 'Welcome Back',
        'login-subtitle': 'Login to book your home services',
        'register-title': 'Create Account',
        'register-subtitle': 'Join FixIT to book trusted professionals',
        'customer': 'Customer',
        'service-provider': 'Service Provider',
        'admin': 'Admin',
        'email-label': 'Email Address',
        'email-placeholder': 'Enter your email',
        'password-label': 'Password',
        'password-placeholder': 'Enter your password',
        'create-password-placeholder': 'Create a strong password',
        'name-label': 'Full Name',
        'name-placeholder': 'Enter your full name',
        'phone-label': 'Phone Number',
        'phone-placeholder': 'Enter your phone number',
        'confirm-password-label': 'Confirm Password',
        'confirm-password-placeholder': 'Re-enter your password',
        'remember-me': 'Remember me',
        'forgot-password': 'Forgot Password?',
        'login-button': 'Login',
        'create-account-button': 'Create Account',
        'or': 'OR',
        'continue-google': 'Continue with Google',
        'continue-facebook': 'Continue with Facebook',
        'signup-google': 'Sign up with Google',
        'signup-facebook': 'Sign up with Facebook',
        'no-account': "Don't have an account?",
        'have-account': 'Already have an account?',
        'register-now': 'Register now',
        'login-here': 'Login here',
        'caps-lock-warning': '⚠️ Caps Lock is ON',
        'password-strength': 'Password strength',
        'req-length': 'At least 8 characters',
        'req-uppercase': 'One uppercase letter',
        'req-lowercase': 'One lowercase letter',
        'req-number': 'One number',
        'req-special': 'One special character',
        'terms-agree': 'I agree to the Terms & Conditions',
        'success': 'Success!'
    },
    si: {
        'tagline': 'ඔබේ විශ්වාසදායක ගෘහ සේවා හවුල්කරු',
        'login-title': 'ආයුබෝවන්',
        'login-subtitle': 'ඔබේ ගෘහ සේවා වෙන්කරවා ගැනීමට ලොග් වන්න',
        'register-title': 'ගිණුමක් සාදන්න',
        'register-subtitle': 'විශ්වාසදායක වෘත්තිකයන් වෙන්කරවා ගැනීමට FixIT සමඟ එක්වන්න',
        'customer': 'පාරිභෝගික',
        'service-provider': 'සේවා සපයන්නා',
        'admin': 'පරිපාලක',
        'email-label': 'විද්‍යුත් තැපැල් ලිපිනය',
        'email-placeholder': 'ඔබේ විද්‍යුත් තැපෑල ඇතුළත් කරන්න',
        'password-label': 'මුරපදය',
        'password-placeholder': 'ඔබේ මුරපදය ඇතුළත් කරන්න',
        'create-password-placeholder': 'ශක්තිමත් මුරපදයක් සාදන්න',
        'name-label': 'සම්පූර්ණ නම',
        'name-placeholder': 'ඔබේ සම්පූර්ණ නම ඇතුළත් කරන්න',
        'phone-label': 'දුරකථන අංකය',
        'phone-placeholder': 'ඔබේ දුරකථන අංකය ඇතුළත් කරන්න',
        'confirm-password-label': 'මුරපදය තහවුරු කරන්න',
        'confirm-password-placeholder': 'ඔබේ මුරපදය නැවත ඇතුළත් කරන්න',
        'remember-me': 'මාව මතක තබා ගන්න',
        'forgot-password': 'මුරපදය අමතකද?',
        'login-button': 'ඇතුල් වන්න',
        'create-account-button': 'ගිණුම සාදන්න',
        'or': 'හෝ',
        'continue-google': 'Google සමඟ දිගටම',
        'continue-facebook': 'Facebook සමඟ දිගටම',
        'signup-google': 'Google සමඟ ලියාපදිංචි වන්න',
        'signup-facebook': 'Facebook සමඟ ලියාපදිංචි වන්න',
        'no-account': 'ගිණුමක් නැද්ද?',
        'have-account': 'දැනටමත් ගිණුමක් තිබේද?',
        'register-now': 'දැන් ලියාපදිංචි වන්න',
        'login-here': 'මෙතැනින් ඇතුල් වන්න',
        'caps-lock-warning': '⚠️ Caps Lock ක්‍රියාත්මකයි',
        'password-strength': 'මුරපදයේ ශක්තිය',
        'req-length': 'අවම වශයෙන් අක්ෂර 8ක්',
        'req-uppercase': 'එක් ලොකු අකුරක්',
        'req-lowercase': 'එක් කුඩා අකුරක්',
        'req-number': 'එක් අංකයක්',
        'req-special': 'එක් විශේෂ අක්ෂරයක්',
        'terms-agree': 'මම නියම සහ කොන්දේසි වලට එකඟ වෙමි',
        'success': 'සාර්ථකයි!'
    }
};

// Get current language from localStorage or default to English
let currentLanguage = localStorage.getItem('language') || 'en';

// Function to update text content based on language
function updateLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // Handle HTML content (like links in terms)
            if (key === 'terms-agree') {
                element.innerHTML = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
}
