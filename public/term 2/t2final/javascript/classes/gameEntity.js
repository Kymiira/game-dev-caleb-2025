// main gameEntity, all other extend classes inherit these
export class gameEntity {
    constructor(elementId) {
        this.el = document.getElementById(elementId);
        if (!this.el) {
            throw new Error(`Element not found: ${elementId}`);
        }
    }
    set left(value) { this.el.style.left = value + "px"; }
    set top(value) { this.el.style.top = value + "px"; }
    get width() {return parseInt(this.el.style.width) }
    get height() {return parseInt(this.el.style.height) }
    get right() {return this.left + this.el.offsetWidth; }
    get bottom() {return this.top + this.el.offsetHeight; }

    setPosition(x, y) {
        this.el.style.left = x + "px";
        this.el.style.top = y + "px";
    }

    intersects(other) {
        return !(
            this.right < other.left ||
            this.left > other.right ||
            this.bottom < other.top ||
            this.top > other.bottom
        );
    }
}