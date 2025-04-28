export class HistoryManager {
    constructor(router) {
        this.router = router;
    }

    push(path, state = {}) {
        window.history.pushState(state, '', path);
    }

    replace(path, state = {}) {
        window.history.replaceState(state, '', path);
    }

    back() {
        window.history.back();
    }

    forward() {
        window.history.forward();
    }

    go(delta) {
        window.history.go(delta);
    }
}
