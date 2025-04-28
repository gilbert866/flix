import { HybridRenderer } from '../render/hybrid.go.js';
import { Router } from '../router/router.go.js';
import { StateManager } from '../state/manager.go.js';
import { HttpClient } from '../http/client.go.js';

export class FlixApp {
    constructor(config = {}) {
        this.components = new Map();
        this.directives = new Map();
        this.plugins = [];
        this.config = {
            mode: 'hybrid',
            ssr: false,
            ...config
        };

        // Core systems
        this.renderer = new HybridRenderer(this);
        this.router = new Router(this);
        this.state = new StateManager(this);
        this.http = new HttpClient(this);

        // Built-in directives
        this.registerDirective('flix-model', this.modelDirective);
        this.registerDirective('flix-show', this.showDirective);
        this.registerDirective('flix-for', this.forDirective);
        this.registerDirective('flix-on', this.onDirective);
    }

    component(name, definition) {
        const comp = new Component(name, definition, this);
        this.components.set(name, comp);
        return this;
    }

    registerDirective(name, handler) {
        this.directives.set(name, handler);
        return this;
    }

    use(plugin) {
        this.plugins.push(plugin);
        if (typeof plugin.install === 'function') {
            plugin.install(this);
        }
        return this;
    }

    mount(selector) {
        const el = document.querySelector(selector);
        if (!el) throw new Error(`Element ${selector} not found`);

        this.root = el;
        this.router.init();
        this.renderer.mount(this.root);
        return this;
    }

    // Directive implementations
    modelDirective(el, binding, component) {
        const [prop, modifier] = binding.split('|');
        el.value = component.state[prop];

        const handler = (e) => {
            let value = e.target.value;
            if (modifier === 'number') value = Number(value);
            if (modifier === 'trim') value = value.trim();
            component.setState({ [prop]: value });
        };

        el.addEventListener('input', handler);
        component.onUnmount(() => el.removeEventListener('input', handler));
    }

    showDirective(el, binding, component) {
        const update = () => {
            el.style.display = component.evaluate(binding) ? '' : 'none';
        };
        update();
        component.watch(binding, update);
    }

    forDirective(el, binding, component) {
        const [item, collection] = binding.split(' in ');
        const template = el.innerHTML;
        el.innerHTML = '';

        const render = () => {
            const items = component.evaluate(collection) || [];
            el.innerHTML = items.map((it, idx) => {
                let html = template
                    .replace(/\{\{\s*\$index\s*\}\}/g, idx)
                    .replace(new RegExp(`\\{\\{\\s*${item}\\s*\\}\\}`, 'g'), it);

                const temp = document.createElement('div');
                temp.innerHTML = html;
                this.renderer.processDirectives(temp, component);
                return temp.innerHTML;
            }).join('');
        };

        component.watch(collection, render);
        render();
    }

    onDirective(el, binding, component) {
        const [event, method] = binding.split(':');
        const handler = (e) => {
            if (component.methods[method]) {
                component.methods[method](e);
            }
        };
        el.addEventListener(event, handler);
        component.onUnmount(() => el.removeEventListener(event, handler));
    }
}
