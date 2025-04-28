export class DOM {
    static createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    static delegate(event, selector, handler, root = document) {
        const listener = (e) => {
            let target = e.target;
            while (target && target !== root) {
                if (target.matches(selector)) {
                    handler.call(target, e);
                    break;
                }
                target = target.parentNode;
            }
        };
        root.addEventListener(event, listener);
        return () => root.removeEventListener(event, listener);
    }

    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}
