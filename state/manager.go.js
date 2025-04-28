export class StateManager {
    constructor(app) {
        this.app = app;
        this.state = {};
        this.subscriptions = new Map();
        this.reactiveProxies = new WeakMap();
    }

    setState(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        this.notify(key, value, oldValue);

        if (typeof value === 'object' && value !== null) {
            this.state[key] = this.reactive(value);
        }
    }

    reactive(obj) {
        if (this.reactiveProxies.has(obj)) return this.reactiveProxies.get(obj);

        const proxy = new Proxy(obj, {
            set: (target, prop, value) => {
                const oldValue = target[prop];
                target[prop] = value;
                this.notify(`${this.findKeyForObject(obj)}.${prop}`, value, oldValue);
                return true;
            }
        });

        this.reactiveProxies.set(obj, proxy);
        return proxy;
    }

    subscribe(key, callback) {
        if (!this.subscriptions.has(key)) {
            this.subscriptions.set(key, new Set());
        }
        this.subscriptions.get(key).add(callback);
        return () => this.subscriptions.get(key).delete(callback);
    }

    notify(key, newValue, oldValue) {
        if (this.subscriptions.has(key)) {
            this.subscriptions.get(key).forEach(cb => cb(newValue, oldValue));
        }
        if (this.subscriptions.has('*')) {
            this.subscriptions.get('*').forEach(cb => cb(key, newValue, oldValue));
        }
    }

    findKeyForObject(obj) {
        return Object.keys(this.state).find(key => this.state[key] === obj);
    }
}
