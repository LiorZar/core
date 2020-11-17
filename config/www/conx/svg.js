import { glo } from "./glo.js"

export class HTMLSvgElement extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super()
        this.id = this.getAttribute("id") || "SVG_Please_fill_name"
        this.params = {}
        this.loadParams();

        this.ns = "http://www.w3.org/2000/svg"

        this.svg = document.createElementNS(this.ns, "svg")

        this._onMousedown = this._onMousedown.bind(this)
        this._onMousemove = this._onMousemove.bind(this)
        this._onMouseup = this._onMouseup.bind(this)
        this._onPointerdown = this._onPointerdown.bind(this)
        this._onPointermove = this._onPointermove.bind(this)
        this._onPointerup = this._onPointerup.bind(this)
        this._onTouchend = this._onTouchend.bind(this)
        this._onTouchmove = this._onTouchmove.bind(this)
        this._onTouchstart = this._onTouchstart.bind(this)

        this.conncted = false;

        let div = document.createElement("div")
        div.appendChild(this.createSVG())
        this.innerHTML = div.innerHTML;
    }
    onPointer(e, type) {
        glo.trace("onPointer", e, type, this._touchX, this._touchY);
    }

    connectedCallback() {
        this.conncted = true;
    }
    disconnectedCallback() {
        this.conncted = false;
    }
    addParams(params) {
        for (let a in params) {
            if (!this.params[a])
                this.params[a] = params[a];
        }
    }
    loadParams() {
        let params = this.getAttribute("params");
        if (!!params)
            this.addParams(JSON.parse(params));
    }

    getChild(id) {
        return glo.getChild(this, id);
    }
    createSVG() {
        return this.svg;
    }

    update() {

    }

    enablePointer() {
        this.firstChild.addEventListener("touchstart", this._onTouchstart);
        this.firstChild.addEventListener("mousedown", this._onMousedown);
        if ("PointerEvent" in window)
            this.firstChild.addEventListener("pointerdown", this._onPointerdown);
    }

    _onPointerdown(e) {
        e.preventDefault();
        this._touchX = e.clientX;
        this._touchY = e.clientY;

        this.setPointerCapture(e.pointerId);
        this.addEventListener("pointermove", this._onPointermove);
        this.addEventListener("pointerup", this._onPointerup);
        this.addEventListener("pointercancel", this._onPointerup);
        this.onPointer(e, "down");
    }

    _onPointermove(e) {
        e.preventDefault();
        this._touchX = e.clientX;
        this._touchY = e.clientY;
        this.onPointer(e, "move");
    }

    _onPointerup(e) {
        e.preventDefault();
        this.releasePointerCapture(e.pointerId);
        this.removeEventListener("pointermove", this._onPointermove);
        this.removeEventListener("pointerup", this._onPointerup);
        this.removeEventListener("pointercancel", this._onPointerup);
        this.onPointer(e, "up");
    }

    _onMousedown(e) {
        this._touchX = e.clientX;
        this._touchY = e.clientY;
        document.addEventListener("mousemove", this._onMousemove);
        document.addEventListener("mouseup", this._onMouseup);

        this.onPointer(e, "down");
    }

    _onMousemove(e) {
        e.preventDefault();
        this._touchX = e.clientX;
        this._touchY = e.clientY;

        this.onPointer(e, "move");
    }

    _onMouseup(e) {
        e.preventDefault();
        document.removeEventListener("mousemove", this._onMousemove);
        document.removeEventListener("mouseup", this._onMouseup);

        this.onPointer(e, "up");
    }

    _onTouchstart(e) {
        e.preventDefault();
        this._touchX = e.changedTouches[0].clientX;
        this._touchY = e.changedTouches[0].clientY;
        this.addEventListener("touchmove", this._onTouchmove,);
        this.addEventListener("touchend", this._onTouchend,);
        this.addEventListener("touchcancel", this._onTouchend,);
        this.onPointer(e, "down");
    }

    _onTouchmove(e) {
        e.preventDefault();
        this._touchX = e.targetTouches[0].clientX;
        this._touchY = e.targetTouches[0].clientY;

        this.onPointer(e, "move");
    }

    _onTouchend(e) {
        e.preventDefault();
        this.removeEventListener("touchmove", this._onTouchmove);
        this.removeEventListener("touchend", this._onTouchend);
        this.removeEventListener("touchcancel", this._onTouchend);

        this.onPointer(e, "up");
    }
}
