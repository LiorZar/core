/// <reference path="svg.ts" />
namespace conx.controls {
    export class Slider extends Svg {
        public onChange: (id: string, value: number, pvalue: number) => void;
        protected movable: boolean;
        protected slideLength: number;
        protected _val: number;
        protected _pval: number;

        protected image: any;
        protected frame: any;
        protected group: any;
        protected bg: any;
        protected thumb: any;
        protected progress: any;
        protected text: any;

        constructor() {
            super();
            this.movable = false;
            this.slideLength = -1;
            this._val = 0;

            this.copyData(this.locals, {
                align: 0,
                percent: true,
                thumb: 0,
                title: "Slider"
            });

            this.copyData(this.params, {
                bg: {
                    style: {
                        fill: "#919191",
                    }
                },
                frame: {
                    style: {
                        fill: "none",
                        stroke: "black",
                        strokeWidth: "5px"
                    }
                },
                progress: {
                    style: {
                        fill: "red"
                    },
                    width: "100%",
                    height: "100%",
                    visibility: "visible"
                },
                thumb: {
                    visibility: "visible"
                },
                text: {
                    style: {
                        dominantBaseline: "middle",
                        fill: "white",
                        textAnchor: "middle",
                        fontSize: "20px",
                        textShadow: "1px 1px #000000"
                    },
                    textContent: ""
                }
            });
        }

        protected connectItems(): void {
            this.enablePointer();

            this.image = this.findChild(`image`);
            this.group = this.findChild(`group`);
            this.frame = this.findChild(`frame`);
            this.bg = this.findChild(`bg`);
            this.progress = this.findChild(`progress`)
            this.thumb = this.findChild(`thumb`)
            this.text = this.findChild(`text`);
        }

        protected createChildren(): void {
            super.createChildren();
            let i_image = utils.SVGImage({ id: `image` });
            let g_group = utils.SVGGroup({ id: `group` });
            let r_frame = utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "none", stroke: "black", strokeWidth: "5px" }, id: `frame` });
            let r_barTotal = utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "#919191" }, id: `bg` });
            let r_barProgress = utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "red" }, id: `progress` });
            let r_thumb = utils.SVGRect({ x: "0", y: "0", width: "3px", height: "100%", style: { fill: "#FFBF00", stroke: "black", strokeWidth: "1px" }, id: `thumb` });
            let t_title = utils.SVGText({ x: "50%", y: "50%", style: { fill: "white", textAnchor: "middle", fontSize: "20px", textShadow: "1px 1px #000000" }, id: `text` });

            // Grouping
            g_group.appendChild(r_barTotal);
            g_group.appendChild(r_barProgress);
            g_group.appendChild(r_thumb);
            g_group.appendChild(t_title);
            g_group.appendChild(r_frame);

            this.svg.append(i_image);
            this.svg.append(g_group);
        }

        protected postConnected(): void {
            super.postConnected();

            this.updateByAlign(false);
            this.updateByValue(false);

            if (this.clientRect.width && this.clientRect.height) {
                let s: number = Math.min(this.clientRect.width, this.clientRect.height) / 1.6;
                this.params.text.style.fontSize = `${s}px`;
            }
            glo.update(this);
        }

        protected updateByAlign(upd: boolean): void {
            if (false === this.isVertical) {
                this.params.text.style.transform = "";
                this.params.text.style.transformOrigin = "";
            }
            else {
                this.params.text.style.transform = "rotate(-90deg)";
                this.params.text.style.transformOrigin = "50% 50%";
            }
            if (0 === this.locals.thumb) {
                this.params.progress.visibility = "visible";
                this.params.thumb.visibility = "hidden";
            }
            else {
                this.params.progress.visibility = "hidden";
                this.params.thumb.visibility = "visible";
            }
            if (upd)
                glo.update(this, { svg: this.params.svg });
        }

        public updateByValue(upd: boolean = true): void {
            if (undefined === this.clientRect)
                return;
            this._val = glo.clamp(this._val, 0, 1);
            let value: number = Math.round(this._val * 100);
            let talue: number = value * (1.0 - this.locals.thumb * 0.01);

            let text: string = this.locals.title;
            if (this.locals.percent)
                text += ` ${value}%`;
            this.params.text.textContent = text;

            if (false === this.isVertical) {
                this.params.progress.width = `${value}%`;
                this.params.progress.height = "100%";

                this.params.thumb.width = `${this.locals.thumb}%`;
                this.params.thumb.height = "100%";
                this.params.thumb.x = `${talue}%`;
            }
            else {
                this.params.progress.width = "100%";
                this.params.progress.height = `${value}%`;
                this.params.progress.y = `${100 - value}%`;

                this.params.thumb.width = "100%";
                this.params.thumb.height = `${this.locals.thumb}%`;
                this.params.thumb.y = `${100 - talue - this.locals.thumb}%`;
            }

            if (upd)
                glo.update(this, { progress: this.params.progress, thumb: this.params.thumb, text: this.params.text });
        }

        protected onPointer(e: any, type: string): void {
            //super.onPointer(e,type);
            //trace.log("x", this, this.id, type, this.movable, this._val, this._pval);
            switch (type) {
                case "down":
                    this.movable = true;
                    break;

                case "move":
                    if (!this.movable)
                        return;
                    this._pval = this._val;
                    let rect = this.bg.getBoundingClientRect();
                    if (false === glo.isMobile) {
                        if (false === this.isVertical)
                            this._val = (this._touchX - rect.left) / rect.width;
                        else
                            this._val = (rect.bottom - this._touchY) / rect.height;
                    }
                    else {
                        if (false === this.isVertical)
                            this._val = glo.zclamp(this._val + this.dtIX / rect.width);
                        else
                            this._val = glo.zclamp(this._val + this.dtIX / rect.height);
                    }
                    this.updateByValue();
                    if (this.onChange)
                        this.onChange(this.id, this._val, this._pval);
                    break;

                case "up":
                    this.movable = false;
                    break;
            }
        }
    }
}
customElements.define("conx-slider", conx.controls.Slider);
