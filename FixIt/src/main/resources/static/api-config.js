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
        PROVIDER_DASHBOARD_BOOKINGS: '/providers/dashboard/bookings',

        // Admin endpoints
        ADMIN_LOGIN: '/admin/login',
        ADMIN_DASHBOARD: '/admin/dashboard',
        ADMIN_USERS: '/admin/users',
        ADMIN_DELETE_USER: (id) => `/admin/users/${id}`,
        ADMIN_PROVIDERS: '/admin/providers',
        ADMIN_PROVIDER_APPROVE: (id) => `/admin/providers/${id}/approve`,
        ADMIN_PROVIDER_SUSPEND: (id) => `/admin/providers/${id}/suspend`,
        ADMIN_STATS: '/admin/dashboard-stats',
        ADMIN_BOOKINGS: '/admin/bookings',

        // Favorite service endpoints
        FAVORITES: `/favorites`,
        FAVORITE_IDS: `/favorites/ids`,
        ADD_FAVORITE: (serviceId) => `/favorites/${serviceId}`,
        REMOVE_FAVORITE: (serviceId) => `/favorites/${serviceId}`,

        // Service endpoints
        SERVICES: '/services',
        SERVICE_CATEGORIES: '/services/categories',
        BOOK_SERVICE: '/bookings',
        MY_BOOKINGS: '/bookings',
        // Contact endpoint
        CONTACT: '/contact',

        // Review endpoints (NEW)
        SUBMIT_REVIEW: '/reviews',
        MY_REVIEWS: '/reviews',
        DELETE_REVIEW: (id) => `/reviews/${id}`
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

            // First, check if the response is OK.
            if (response.ok) {
                // Handle no-content responses (like 204)
                if (response.status === 204) {
                    return null;
                }
                // If OK and has content, parse as JSON.
                return await response.json();
            }

            // If response is NOT OK, get the error message as text.
            const errorText = await response.text();

            // Try to parse the text as JSON to get a structured error message.
            try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || errorData.error || 'API request failed');
            } catch (jsonError) {
                // If it wasn't JSON, throw the raw text (which might be "An error occurred...")
                // We'll clean it up slightly to avoid HTML tags.
                const cleanError = errorText.replace(/<[^>]*>?/gm, ' ').trim(); // Remove HTML tags
                throw new Error(cleanError || 'API request failed with non-JSON response');
            }
            // --- END OF FIX ---

        } catch (error) {
            console.error('API Error:', error.message); // Log the cleaner error
            throw error; // Re-throw the error to be caught by the calling function
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

    async adminGetProviders(status) {
        let endpoint = API_CONFIG.ENDPOINTS.ADMIN_PROVIDERS;
        if (status && status !== 'all') {
            endpoint += `?status=${status}`;
        }
        return await this.request(endpoint, { method: 'GET' });
    }

    async adminApproveProvider(providerId) {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN_PROVIDER_APPROVE(providerId);
        return await this.request(endpoint, { method: 'POST' });
    }

    async adminSuspendProvider(providerId) {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN_PROVIDER_SUSPEND(providerId);
        return await this.request(endpoint, { method: 'POST' });
    }

    //  FAVORITE METHODS

    //Gets a Set of the current user's favorite service IDs.
    async getFavoriteServiceIds() {
        const ids = await this.request(API_CONFIG.ENDPOINTS.FAVORITE_IDS, { method: 'GET' });
        return new Set(ids);
    }

    //Gets the full ServiceCardDTO objects
    async getFavoriteServices() {
        return this.request(API_CONFIG.ENDPOINTS.FAVORITES, { method: 'GET' });
    }

    // Adds a service to the user's favorites.
    async addFavorite(serviceId) {
        return this.request(API_CONFIG.ENDPOINTS.ADD_FAVORITE(serviceId), { method: 'POST' });
    }

    // Removes a service from the user's favorites.
    async removeFavorite(serviceId) {
        return this.request(API_CONFIG.ENDPOINTS.REMOVE_FAVORITE(serviceId), { method: 'DELETE' });
    }

    // ADMIN USER METHODS

    async adminGetUsers(page = 0, size = 5) {
        const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN_USERS}?page=${page}&size=${size}`;
        return await this.request(endpoint, { method: 'GET' });
    }

    async adminDeleteUser(userId) {
        const endpoint = API_CONFIG.ENDPOINTS.ADMIN_DELETE_USER(userId);
        return await this.request(endpoint, { method: 'DELETE' });
    }
    async adminGetBookings(page = 0, size = 10) {
        const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN_BOOKINGS}?page=${page}&size=${size}`;
        return await this.request(endpoint, { method: 'GET' });
    }
}

// Create global API service instance
const apiService = new APIService();
