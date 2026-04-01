/// <reference path="svg.ts" />

namespace conx.controls {
    export class Toggle extends Svg {
        protected bg: any;
        protected text: any;
        protected thumb: any;

        constructor() {
            super();
            this.copyData(this.locals, {
                on: false,
                onBG: "blue",
                offBG: "gray"
            });

            this.copyData(this.params, {
                bg: {
                    style: {
                        fill: "#919191",
                        stroke: "black",
                        strokeWidth: "5px"
                    }
                },
                thumb: {
                    style: {
                        fill: "red",
                        stroke: "black",
                        strokeWidth: "1px",
                        strokeOpacity: 0.5
                    }
                },
                text: {
                    style: {
                        dominantBaseline: "middle",
                        fill: "white",
                        textAnchor: "middle",
                        fontSize: `20px`
                    },
                    textContent: "Switch"
                }
            });
        }

        protected connectItems(): void {
            this.enablePointer();

            this.bg = this.findChild(`bg`);
            this.thumb = this.findChild(`thumb`);
            this.text = this.findChild(`text`);
        }

        protected createChildren(): void {
            super.createChildren();

            let g_comp = utils.SVGGroup({ id: `group` });
            let r_bg = utils.SVGRect({ x: 0, y: 0, rx: 0, ry: 0, width: "100%", height: "100%", style: { fill: "gray", strokeWidth: "5px", stroke: "black" }, id: `bg` });
            let r_thumb = utils.SVGRect({ x: 5, y: 5, rx: 5, ry: 5, width: "35%", height: "100%", style: { fill: "red" }, id: `thumb` });
            let r_text = utils.SVGText({ x: "50%", y: "50%", style: { dominantBaseline: "middle", fill: "white", textAnchor: "middle", fontSize: `20px` }, id: `text` });

            // Grouping
            g_comp.appendChild(r_bg);
            g_comp.appendChild(r_thumb);
            g_comp.appendChild(r_text);
            this.svg.append(g_comp);
            this.svg.id = `toggle`;
        }

        protected postConnected(): void {
            super.postConnected();
            this.updateByValue(false);

            this.params.thumb.height = `${this.clientRect.height - 10}px`;

            let s: number = Math.min(this.clientRect.width, this.clientRect.height) / 2.5;
            this.params.text.style.fontSize = `${s}px`;
            glo.update(this);
        }

        protected updateByValue(upd: boolean): void {
            let x: number = 5;
            if (this.locals.on) {
                x = this.clientRect.width - this.thumb.getBoundingClientRect().width - 5;
                this.params.bg.style.fill = this.locals.onBG;
            }
            else
                this.params.bg.style.fill = this.locals.offBG;

            this.params.thumb.x = `${x}px`;

            glo.update(this, { bg: this.params.bg, thumb: this.params.thumb });
        }

        onPointer(e: any, type: string) {
            //super.onPointer(e,type);
            switch (type) {
                case "up":
                    this.locals.on = !this.locals.on;
                    this.updateByValue(true);
                    break;
            }
        }
    }
}
customElements.define("conx-toggle", conx.controls.Toggle)
