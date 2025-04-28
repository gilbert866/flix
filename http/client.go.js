export class HttpClient {
    constructor(app) {
        this.app = app;
        this.baseURL = app.config.api?.baseURL || '';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...app.config.api?.headers
        };
    }

    async get(url, options = {}) {
        return this.request('GET', url, null, options);
    }

    async post(url, data, options = {}) {
        return this.request('POST', url, data, options);
    }

    async request(method, url, data, options = {}) {
        const headers = { ...this.defaultHeaders, ...options.headers };
        const config = {
            method,
            headers,
            ...options
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

        try {
            const response = await fetch(fullUrl, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('HTTP request failed:', error);
            throw error;
        }
    }
}
