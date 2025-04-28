export class Perf {
    static start(name) {
        if (process.env.NODE_ENV !== 'production') {
            performance.mark(`${name}-start`);
        }
    }

    static end(name) {
        if (process.env.NODE_ENV !== 'production') {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);
            const measures = performance.getEntriesByName(name);
            console.log(`${name} took ${measures[0].duration.toFixed(2)}ms`);
        }
    }

    static async measure(name, fn) {
        this.start(name);
        const result = await fn();
        this.end(name);
        return result;
    }
}
