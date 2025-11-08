//FIXIT HOME PAGE - MAIN JAVASCRIPT

   // GLOBAL VARIABLES & INITIALIZATION

let currentSlide = 0;
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const scrollTopBtn = document.getElementById('scrollTop');

//PAGE LOAD INITIALIZATION

document.addEventListener('DOMContentLoaded', () => {
    // Initialize language
    const savedLanguage = localStorage.getItem('language') || 'en';
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
        updateHomeLanguage(savedLanguage);
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
    
    // Load Google Maps
    loadGoogleMaps();
    
    // Initialize animations
    initializeObserver();
    
    // Start testimonials auto-slider
    setInterval(nextSlide, 5000);
});

// Page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

//THEME TOGGLE FUNCTIONALITY

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

//LANGUAGE SWITCHER

const languageSelect = document.getElementById('languageSelect');
if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
        updateHomeLanguage(e.target.value);
    });
}

//NAVIGATION FUNCTIONALITY

// Navbar scroll effect
window.addEventListener('scroll', () => {
    // Add scrolled class to navbar
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Show/hide scroll to top button
    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
    
    // Parallax effect for hero shapes
    parallaxHeroShapes();
});

// Mobile menu toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Active navigation link highlighting
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll to top button
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

//HERO SECTION ANIMATIONS


// Counter animation
const counters = document.querySelectorAll('.stat-number');
const speed = 200;

const animateCounters = () => {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => animateCounters(), 1);
        } else {
            counter.innerText = target;
        }
    });
};

// Parallax effect for hero shapes
function parallaxHeroShapes() {
    const scrolled = window.scrollY;
    const heroShapes = document.querySelectorAll('.hero-shape');
    
    heroShapes.forEach((shape, index) => {
        const speed = 0.1 + (index * 0.05);
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
}

// Search box focus effect
const searchInput = document.querySelector('.search-box input');
const searchBox = document.querySelector('.search-box');

if (searchInput && searchBox) {
    searchInput.addEventListener('focus', () => {
        searchBox.style.transform = 'scale(1.02)';
        searchBox.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.2)';
    });

    searchInput.addEventListener('blur', () => {
        searchBox.style.transform = 'scale(1)';
        searchBox.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.15)';
    });
}

//INTERSECTION OBSERVER FOR ANIMATIONS

function initializeObserver() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Trigger counter animation when hero stats section is visible
                if (entry.target.classList.contains('hero-stats')) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .step-card, .feature-item, .testimonial-card, .hero-stats');
    animatedElements.forEach(el => observer.observe(el));
}

//SERVICE CARDS HOVER EFFECT

const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

//TESTIMONIALS SLIDER

const testimonialCards = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.dot');

function nextSlide() {
    currentSlide = (currentSlide + 1) % dots.length;
    updateSlider();
}

function updateSlider() {
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Manual slider control
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        updateSlider();
    });
});

//GOOGLE MAPS INTEGRATION

function loadGoogleMaps() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyArvbxR4Hz7jNswrFYrp-kn7ZBx91424FQ&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

function initMap() {
    // Default location (Colombo, Sri Lanka - change to your actual location)
    const location = { lat: 6.9271, lng: 79.8612 };
    
    const map = new google.maps.Map(document.getElementById('google-map'), {
        zoom: 15,
        center: location,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });
    
    // Add marker
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: 'FixIT Office',
        animation: google.maps.Animation.DROP
    });
    
    // Info window with dynamic content based on language
    const getInfoWindowContent = () => {
        const lang = localStorage.getItem('language') || 'en';
        const title = 'FixIT';
        const subtitle = lang === 'en' 
            ? 'Your Trusted Home Service Partner' 
            : 'ඔබේ විශ්වාසදායක ගෘහ සේවා හවුල්කරු';
        const address = lang === 'en'
            ? '123 Service Street, Colombo'
            : '123 සේවා මාර්ගය, කොළඹ';
        
        return `
            <div style="padding: 10px;">
                <h3 style="margin: 0 0 10px 0; color: #2563eb;">${title}</h3>
                <p style="margin: 0; color: #6b7280;">${subtitle}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">
                    ${address}
                </p>
            </div>
        `;
    };
    
    const infoWindow = new google.maps.InfoWindow({
        content: getInfoWindowContent()
    });
    
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

//CONTACT FORM SUBMISSION

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(e.target);
        const contactData = {
            name: e.target.querySelector('input[type="text"]').value,
            email: e.target.querySelector('input[type="email"]').value,
            phone: e.target.querySelector('input[type="tel"]').value,
            message: e.target.querySelector('textarea').value
        };
        
        // Get button and original text
        const submitBtn = e.target.querySelector('.btn-submit');
        const originalText = submitBtn.querySelector('span').textContent;
        
        // Get current language
        const lang = localStorage.getItem('language') || 'en';
        const sendingText = lang === 'en' ? 'Sending...' : 'යවමින්...';
        
        // Show loading state
        submitBtn.querySelector('span').textContent = sendingText;
        submitBtn.disabled = true;
        
        try {
            // If apiService is defined (from api-config.js), use it
            if (typeof apiService !== 'undefined') {
                await apiService.submitContact(contactData);
            } else {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            
            // Success message
            const successMsg = lang === 'en'
                ? 'Thank you for your message! We will get back to you soon.'
                : 'ඔබේ පණිවිඩයට ස්තූතියි! අපි ඉක්මනින් ඔබට පිළිතුරු දෙන්නෙමු.';
            alert(successMsg);
            e.target.reset();
            
        } catch (error) {
            // Error message
            const errorMsg = lang === 'en'
                ? 'Failed to send message. Please try again.'
                : 'පණිවිඩය යැවීම අසාර්ථකයි. කරුණාකර නැවත උත්සාහ කරන්න.';
            alert(errorMsg);
            console.error('Contact form error:', error);
            
        } finally {
            // Reset button state
            submitBtn.querySelector('span').textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

//BOOKING BUTTONS FUNCTIONALITY

const bookButtons = document.querySelectorAll('.btn-service, .btn-search, .btn-cta');
bookButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Only trigger if not inside a form submission
        if (!e.target.closest('form')) {
            e.preventDefault();
            
            const lang = localStorage.getItem('language') || 'en';
            const message = lang === 'en'
                ? 'Redirecting to booking page...'
                : 'වෙන්කරවා ගැනීමේ පිටුවට හරවා යවමින්...';

            alert(message);
            window.location.href = 'login2.html';
        }
    });
});

// UTILITY FUNCTIONS

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ERROR HANDLING


// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // You can add error reporting here
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // You can add error reporting here
});

//CONSOLE WELCOME MESSAGE

console.log('%cFixIT - Home Service Platform', 'color: #2563eb; font-size: 24px; font-weight: bold;');
console.log('%cVersion 1.0.0', 'color: #6b7280; font-size: 12px;');
console.log('%c© 2025 FixIT. All rights reserved.', 'color: #6b7280; font-size: 12px;');
