import { VDomPatcher } from './vdom.go.js';
import { DOMPatcher } from './dom.go.js';

export class HybridRenderer {
    constructor(app) {
        this.app = app;
        this.pendingUpdates = new Set();
        this.rafHandle = null;
        this.root = null;
        this.domPatcher = app.config.mode === 'vdom'
            ? new VDomPatcher(app)
            : new DOMPatcher(app);
    }

    mount(root) {
        this.root = root;
        const initialComponent = this.app.router.currentComponent;
        if (initialComponent) {
            this.renderComponent(initialComponent);
        }
    }

    scheduleUpdate(component) {
        this.pendingUpdates.add(component);
        if (!this.rafHandle) {
            this.rafHandle = requestAnimationFrame(() => {
                this.processUpdates();
                this.rafHandle = null;
            });
        }
    }

    processUpdates() {
        const updates = Array.from(this.pendingUpdates);
        this.pendingUpdates.clear();

        if (this.app.config.mode === 'hybrid') {
            const streamUpdates = updates.filter(c => c.canStream);
            const vdomUpdates = updates.filter(c => !c.canStream);

            if (streamUpdates.length) this.batchStreamUpdates(streamUpdates);
            if (vdomUpdates.length) this.batchVDomUpdates(vdomUpdates);
        } else {
            this.batchVDomUpdates(updates);
        }
    }

    batchStreamUpdates(components) {
        components.forEach(comp => {
            const html = comp.render(true);
            const el = document.querySelector(`[data-flix-component="${comp.name}"]`);
            if (el) el.innerHTML = html;
        });
    }

    batchVDomUpdates(components) {
        const patches = components.map(comp => ({
            comp,
            newVdom: comp.render()
        }));
        this.domPatcher.patch(patches);
    }

    renderComponent(component, data = {}, stream = false) {
        if (stream || (this.app.config.mode !== 'vdom' && component.canStream)) {
            this.root.innerHTML = component.render(true);
        } else {
            this.domPatcher.patch([{
                comp: component,
                newVdom: component.render()
            }]);
        }

        this.processDirectives(this.root, component);

        if (component.lifecycle.mounted) {
            component.lifecycle.mounted.call(component);
        }
    }

    processDirectives(root, component) {
        this.app.directives.forEach((handler, name) => {
            root.querySelectorAll(`[${name}]`).forEach(el => {
                handler(el, el.getAttribute(name), component);
                el.removeAttribute(name);
            });
        });
    }
}
