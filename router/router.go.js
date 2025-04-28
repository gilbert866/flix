import { HistoryManager } from './history.go.js';

export class Router {
    constructor(app) {
        this.app = app;
        this.routes = [];
        this.current = null;
        this.history = new HistoryManager(this);
    }

    init() {
        window.addEventListener('popstate', this.handlePopState.bind(this));
        this.navigate(window.location.pathname, false);
    }

    addRoute(path, componentName, options = {}) {
        const component = this.app.components.get(componentName);
        if (!component) throw new Error(`Component ${componentName} not registered`);

        this.routes.push({
            path,
            component,
            exact: options.exact !== false,
            stream: options.stream || false,
            preload: options.preload || null,
            metadata: options.metadata || {}
        });
        return this;
    }

    navigate(path, pushState = true) {
        const route = this.findMatchingRoute(path);
        if (!route) return console.error(`No route for ${path}`);

        const params = this.extractParams(route.path, path);
        this.current = { ...route, params, fullPath: path };

        if (pushState) this.history.push(path, route.metadata);
        this.handleRouteChange(route, params);
    }

    handleRouteChange(route, params) {
        const render = (data = {}) => {
            this.app.renderer.renderComponent(
                route.component,
                { ...data, $params: params, $route: this.current },
                route.stream
            );
        };

        if (route.preload) {
            const loading = this.app.components.get('loading');
            if (loading) this.app.renderer.renderComponent(loading);

            Promise.resolve(route.preload(params))
                .then(render)
                .catch(err => {
                    console.error('Preload failed:', err);
                    const error = this.app.components.get('error');
                    error ? this.app.renderer.renderComponent(error, { error: err }) : render();
                });
        } else {
            render();
        }
    }

    findMatchingRoute(path) {
        return this.routes.find(route => {
            if (route.exact) return route.path === path;

            const routeSegments = route.path.split('/');
            const pathSegments = path.split('/');
            if (routeSegments.length !== pathSegments.length) return false;

            return routeSegments.every((seg, i) =>
                seg.startsWith(':') || seg === pathSegments[i]
            );
        });
    }

    extractParams(routePath, actualPath) {
        const params = {};
        routePath.split('/').forEach((part, i) => {
            if (part.startsWith(':')) {
                params[part.slice(1)] = actualPath.split('/')[i];
            }
        });
        return params;
    }

    handlePopState() {
        this.navigate(window.location.pathname, false);
    }
}
