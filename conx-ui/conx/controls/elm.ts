/// <reference path="../glo.ts" />
/// <reference path="utils.ts" />

namespace conx.controls {
    export class Element extends HTMLElement {
        protected root: any;
        protected locals: any;
        protected params: any;
        protected clientRect: DOMRect;
        protected connected: boolean = false;
        protected _minMove: number = 10 * glo.DPI;
        protected _moved: boolean = false;
        protected _pouchX: number;
        protected _pouchY: number;
        protected _touchX: number;
        protected _touchY: number;

        constructor() {
            super();
            this.locals = {};
            this.params = { root: {} };

            this._onMousedown = this._onMousedown.bind(this);
            this._onMousemove = this._onMousemove.bind(this);
            this._onMouseup = this._onMouseup.bind(this);
            this._onPointerdown = this._onPointerdown.bind(this);
            this._onPointermove = this._onPointermove.bind(this);
            this._onPointerup = this._onPointerup.bind(this);
            this._onTouchend = this._onTouchend.bind(this);
            this._onTouchmove = this._onTouchmove.bind(this);
            this._onTouchstart = this._onTouchstart.bind(this);

            this.createChildren();
            this.connectItems();
        }

        protected onPointer(e: any, type: string): void {
            trace.log("onPointer", e, type, this._touchX, this._touchY);
        }

        protected postConnected(): void {
            this.connected = true;
            this.clientRect = this.root.getBoundingClientRect();
            //trace.log("postConnected", this.id, this.clientRect);
        }

        public updateParams(params: any): void {
            this.copyData(this.params, params);
        }
        protected connectedCallback(): void {
            this.copyData(this.locals, glo.JSON(this.getAttribute("locals")));
            this.copyData(this.params, glo.JSON(this.getAttribute("params")));
            this.copyData(this.params.root, glo.attributesToObject(this.attributes));
            glo.update(this);
            this.appendChild(this.root);
            setTimeout(this.postConnected.bind(this), 0);
        }

        protected disconnectedCallback(): void {
            this.connected = false;
            if (undefined !== this.root)
                this.removeChild(this.root);
        }

        public copyData(dst: any, src: any, override: boolean = true): void {
            glo.copy(dst, src, override);
        }

        protected findChild(id: string) {
            return glo.findChild(this.root, id);
        }

        protected connectItems(): void {
        }

        protected createChildren(): void {
        }

        protected enablePointer(): void {
            this.root.addEventListener("touchstart", this._onTouchstart);
            this.root.addEventListener("mousedown", this._onMousedown);
            //if ("PointerEvent" in window)
            //    this.root.addEventListener("pointerdown", this._onPointerdown);
        }
        protected get isVertical(): boolean {
            return 1 === this?.locals?.align;
        }
        protected checkMove(x: number, y: number, vertical: boolean): boolean {
            if (false === vertical)
                return Math.abs(this._pouchX - x) > this._minMove;
            return Math.abs(this._pouchY - y) > this._minMove;
        }
        protected Move(e: any, type: string, x: number, y: number): void {
            if (this._moved) {
                e.preventDefault();
                this._pouchX = this._touchX;
                this._pouchY = this._touchY;
                this._touchX = x;
                this._touchY = y;
                this.onPointer(e, "move");
                return;
            }
            if (this.checkMove(x, y, !this.isVertical)) {
                this._cancelMove(e, type);
                return;
            }

            if (this.checkMove(x, y, this.isVertical))
                this._moved = true;


            this._touchX = x;
            this._touchY = y;
        }
        protected _cancelMove(e: any, type: string): void {
            switch (type) {
                case "pointer": this._cancelPointer(e); break;
                case "mouse": this._cancelMouse(); break;
                case "touch": this._cancelTouch(); break;
            }
        }
        protected get dtX(): number {
            return this._touchX - this._pouchX;
        }
        protected get dtY(): number {
            return this._touchY - this._pouchY;
        }
        protected get dtIX(): number {
            return this.dtX * glo.MPI;
        }
        protected get dtIY(): number {
            return this.dtY * glo.MPI;
        }
        protected _onPointerdown(e: any): void {
            e.preventDefault();
            this._moved = false;
            this._pouchX = e.clientX;
            this._pouchY = e.clientY;
            this._touchX = e.clientX;
            this._touchY = e.clientY;

            this.setPointerCapture(e.pointerId);
            this.addEventListener("pointermove", this._onPointermove);
            this.addEventListener("pointerup", this._onPointerup);
            this.addEventListener("pointercancel", this._onPointerup);
            this.onPointer(e, "down");
        }

        protected _onPointermove(e: any): void {
            //e.preventDefault();
            this.Move(e, "pointer", e.clientX, e.clientY);
        }

        protected _onPointerup(e: any): void {
            e.preventDefault();
            this._cancelPointer(e);
            this.onPointer(e, "up");
        }

        protected _cancelPointer(e: any): void {
            this._moved = false;
            this.releasePointerCapture(e.pointerId);
            this.removeEventListener("pointermove", this._onPointermove);
            this.removeEventListener("pointerup", this._onPointerup);
            this.removeEventListener("pointercancel", this._onPointerup);
        }

        protected _onMousedown(e: any): void {
            e.preventDefault();
            this._moved = false;
            this._pouchX = e.clientX;
            this._pouchY = e.clientY;
            this._touchX = e.clientX;
            this._touchY = e.clientY;
            document.addEventListener("mousemove", this._onMousemove);
            document.addEventListener("mouseup", this._onMouseup);

            this.onPointer(e, "down");
        }

        protected _onMousemove(e: any): void {
            //e.preventDefault();
            this.Move(e, "mouse", e.clientX, e.clientY);
        }

        protected _onMouseup(e: any): void {
            e.preventDefault();
            this._cancelMouse();
            this.onPointer(e, "up");
        }

        protected _cancelMouse(): void {
            this._moved = false;
            document.removeEventListener("mousemove", this._onMousemove);
            document.removeEventListener("mouseup", this._onMouseup);
        }

        protected _onTouchstart(e: any): void {
            //e.preventDefault();
            this._moved = false;
            this._pouchX = e.changedTouches[0].clientX;
            this._pouchY = e.changedTouches[0].clientY;
            this._touchX = e.changedTouches[0].clientX;
            this._touchY = e.changedTouches[0].clientY;
            this.addEventListener("touchmove", this._onTouchmove);
            this.addEventListener("touchend", this._onTouchend);
            this.addEventListener("touchcancel", this._onTouchend);
            this.onPointer(e, "down");
        }

        protected _onTouchmove(e: any): void {
            //e.preventDefault();
            this.Move(e, "touch", e.targetTouches[0].clientX, e.targetTouches[0].clientY);
        }

        protected _onTouchend(e: any): void {
            //e.preventDefault();
            this._cancelTouch();
            this.onPointer(e, "up");
        }

        protected _cancelTouch(): void {
            this._moved = false;
            this.removeEventListener("touchmove", this._onTouchmove);
            this.removeEventListener("touchend", this._onTouchend);
            this.removeEventListener("touchcancel", this._onTouchend);
        }
    }
}