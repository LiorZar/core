/// <reference path="elm.ts" />

namespace conx.controls {
    export class Svg extends Element {
        protected svg: SVGSVGElement;

        constructor() {
            super()
        }

        protected createChildren(): void {
            super.createChildren();
            this.svg = document.createElementNS(utils.ns, "svg");
            this.svg.setAttribute("width", "100%");
            this.svg.setAttribute("height", "100%");

            this.root = this.svg;
        }
    }
}