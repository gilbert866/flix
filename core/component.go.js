export class Component {
    constructor(name, definition, app) {
        this.name = name;
        this.app = app;
        this.state = definition.state || {};
        this.methods = definition.methods || {};
        this.template = definition.template;
        this.streamTemplate = definition.streamTemplate || definition.template;
        this.styles = definition.styles || '';
        this.lifecycle = definition.lifecycle || {};
        this.watchers = new Map();
        this.cleanups = [];

        Object.keys(this.methods).forEach(key => {
            this.methods[key] = this.methods[key].bind(this);
        });

        if (this.styles) this.addStyles();
    }

    addStyles() {
        const styleId = `flix-style-${this.name}`;
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = this.styles;
        document.head.appendChild(style);

        this.onUnmount(() => document.head.removeChild(style));
    }

    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };

        Object.keys(newState).forEach(key => {
            if (this.watchers.has(key)) {
                this.watchers.get(key).forEach(cb => cb(newState[key], oldState[key]));
            }
        });

        this.app.renderer.scheduleUpdate(this);
    }

    watch(expr, callback) {
        const keys = expr.split('.');
        const key = keys[0];

        if (!this.watchers.has(key)) {
            this.watchers.set(key, []);
        }

        this.watchers.get(key).push((newVal, oldVal) => {
            if (keys.length > 1) {
                const newDeepVal = keys.reduce((obj, k) => obj?.[k], this.state);
                const oldDeepVal = keys.reduce((obj, k) => obj?.[k], oldState);
                callback(newDeepVal, oldDeepVal);
            } else {
                callback(newVal, oldVal);
            }
        });

        return () => {
            const watchers = this.watchers.get(key);
            if (watchers) {
                this.watchers.set(key, watchers.filter(cb => cb !== callback));
            }
        };
    }

    evaluate(expr) {
        try {
            return new Function('$state', '$methods', `with($state) with($methods) { return ${expr} }`)
                .call(this, this.state, this.methods);
        } catch (e) {
            console.error(`Error evaluating "${expr}":`, e);
            return null;
        }
    }

    onUnmount(fn) {
        this.cleanups.push(fn);
    }

    unmount() {
        this.cleanups.forEach(fn => fn());
        this.cleanups = [];
        this.watchers.clear();
    }

    render(stream = false) {
        const template = stream ? this.streamTemplate : this.template;
        const data = { ...this.state, ...this.methods };

        if (typeof template === 'function') {
            return template(data);
        }

        return template.replace(/\{\{\s*(.*?)\s*\}\}/g, (_, expr) => {
            const val = this.evaluate(expr);
            return val != null ? val : '';
        });
    }
}
