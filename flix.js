import { FlixApp } from './core/app.go.js';
import { HttpClient } from './http/client.go.js';
import { SSR } from './http/server.go.js';
import { Plugin } from './core/plugin.go.js';

// Core exports
export function createApp(config) {
    return new FlixApp(config);
}

// Plugin system
export class Plugin {
    constructor(installFn) {
        this.install = installFn;
    }
}

// HTTP utilities
export const http = {
    client: HttpClient,
    server: SSR
};

// Built-in components
export * as components from './components/index.go.js';

// Utilities
export * as utils from './utils/index.go.js';

// Default export
export default {
    createApp,
    Plugin,
    http
};
