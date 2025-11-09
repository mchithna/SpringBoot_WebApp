// API Configuration for Spring Boot Backend
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api',
    ENDPOINTS: {
        // Authentication endpoints
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        
        // User endpoints
        USER_PROFILE: '/users/profile',
        UPDATE_PROFILE: '/users/update',
        CHANGE_PASSWORD: '/users/change-password',
        
        // Service Provider endpoints
        PROVIDER_REGISTER: '/providers/register',
        PROVIDER_PROFILE: '/providers/profile',
        PROVIDER_SERVICES: '/providers/services',
        PROVIDERS_PUBLIC: '/providers',
        PROVIDER_DASHBOARD_SERVICES: '/providers/services',
        PROVIDER_DASHBOARD_PROFILE: '/providers/dashboard/profile',
        PROVIDER_DASHBOARD_CATEGORIES: '/providers/dashboard/categories',
        
        // Admin endpoints
        ADMIN_LOGIN: '/admin/login',
        ADMIN_DASHBOARD: '/admin/dashboard',
        ADMIN_USERS: '/admin/users',
        ADMIN_PROVIDERS: '/admin/providers',
        ADMIN_STATS: '/admin/dashboard-stats',


        // Service endpoints
        SERVICES: '/services',
        SERVICE_CATEGORIES: '/services/categories',
        BOOK_SERVICE: '/bookings',
        MY_BOOKINGS: '/bookings',
        // Contact endpoint
        CONTACT: '/contact'
    }
};

// API Helper Functions
class APIService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    // Get auth token from localStorage
    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    // Set auth token
    setAuthToken(token) {
        localStorage.setItem('authToken', token);
    }

    // Remove auth token
    removeAuthToken() {
        localStorage.removeItem('authToken');
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getAuthToken();

        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Login API call
    async login(email, password, userType) {
        const endpoint = userType === 'admin' 
            ? API_CONFIG.ENDPOINTS.ADMIN_LOGIN 
            : API_CONFIG.ENDPOINTS.LOGIN;

        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify({ email, password, userType })
        });

        if (response.token) {
            this.setAuthToken(response.token);
            localStorage.setItem('userType', userType);
            localStorage.setItem('userInfo', JSON.stringify(response.user));
        }

        return response;
    }

    // Register API call
    async register(userData) {
        const endpoint = userData.userType === 'provider'
            ? API_CONFIG.ENDPOINTS.PROVIDER_REGISTER
            : API_CONFIG.ENDPOINTS.REGISTER;

        const { userType, ...payload } = userData;

        const response = await this.request(endpoint, {
            method: 'POST',
            // MODIFIED: Send the 'payload' instead of 'userData'
            body: JSON.stringify(payload)
        });

        if (response.token) {
            this.setAuthToken(response.token);
            localStorage.setItem('userType', userData.userType);
            localStorage.setItem('userInfo', JSON.stringify(response.user));
        }

        return response;
    }

    // Logout
    logout() {
        this.removeAuthToken();
        localStorage.removeItem('userType');
        localStorage.removeItem('userInfo');
    }
    async getUserProfile() {
        return await this.request(API_CONFIG.ENDPOINTS.USER_PROFILE, {
            method: 'GET'
        });
    }
    async getProviderProfile() {
        const endpoint = '/providers/dashboard/profile'; // This is the secure endpoint
        return await this.request(endpoint, {
            method: 'GET'
        });
    }
    // Update Provider Profile
    async updateProviderProfile(profileData) {
        return await this.request(API_CONFIG.ENDPOINTS.PROVIDER_DASHBOARD_PROFILE, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }
    // Get all service categories (public)
    async getServiceCategories() {
        return await this.request(API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES, {
            method: 'GET'
        });
    }

    //  Update provider's selected categories
    async updateProviderCategories(categoryIds) {
        return await this.request(API_CONFIG.ENDPOINTS.PROVIDER_DASHBOARD_CATEGORIES, {
            method: 'PUT',
            body: JSON.stringify(categoryIds)
        });
    }

    //methods for managing individual services -
    async getProviderServices() {
        // GET /api/providers/services
        return await this.request(API_CONFIG.ENDPOINTS.PROVIDER_DASHBOARD_SERVICES, {
            method: 'GET'
        });
    }

    async addProviderService(serviceData) {
        // POST /api/providers/services
        return await this.request(API_CONFIG.ENDPOINTS.PROVIDER_DASHBOARD_SERVICES, {
            method: 'POST',
            body: JSON.stringify(serviceData)
        });
    }

    async updateProviderService(serviceId, serviceData) {
        // PUT /api/providers/services/{serviceId}
        const endpoint = `${API_CONFIG.ENDPOINTS.PROVIDER_DASHBOARD_SERVICES}/${serviceId}`;
        return await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(serviceData)
        });
    }

    async deleteProviderService(serviceId) {
        // DELETE /api/providers/services/{serviceId}
        const endpoint = `${API_CONFIG.ENDPOINTS.PROVIDER_DASHBOARD_SERVICES}/${serviceId}`;
        return await this.request(endpoint, {
            method: 'DELETE'
        });
    }
    // Contact form submission
    async submitContact(contactData) {
        return await this.request(API_CONFIG.ENDPOINTS.CONTACT, {
            method: 'POST',
            body: JSON.stringify(contactData)
        });
    }
    async bookService(bookingData) {
        return await this.request(API_CONFIG.ENDPOINTS.BOOK_SERVICE, {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }
}

// Create global API service instance
const apiService = new APIService();
