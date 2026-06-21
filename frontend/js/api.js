const API_BASE_URL = '/api';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: { ...headers, ...(options.headers || {}) },
            cache: 'no-store'
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'API Error' }));
            throw new Error(error.message || 'Something went wrong');
        }

        return response.json();
    },

    register(fullName, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password })
        });
    },

    login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    googleLogin(email) {
        return this.request('/auth/google-login', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }
};

