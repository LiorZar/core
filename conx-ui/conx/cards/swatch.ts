/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class Swatch extends HACard {
        protected transition: number = 2;
        protected opacity: number[] = [];
        protected create(): void {
            super.create();
            this.cfg.style = this.cfg?.style || `display: inline-block`;
            let html: string = ``;
            let clr: string;
            this.transition = this.cfg?.transition ?? 2;
            const len = this.cfg.colors.length;
            this.cfg.buttons = this.cfg?.buttons || this.cfg.colors.slice(0);
            this.cfg.rgb = { colors: [], buttons: [] };
            this.cfg.rgb.colors.length = len;
            this.cfg.rgb.buttons.length = len;
            this.opacity.length = len;
            for (let i: number = 0; i < len; ++i) {
                this.cfg.rgb.colors[i] = glo.HEXtoRGBv(this.cfg.colors[i]);
                this.cfg.rgb.buttons[i] = glo.HEXtoRGBv(this.cfg.buttons[i]);
                if (i < this.cfg?.opacity?.length)
                    this.opacity[i] = this.cfg?.opacity[i];
                else
                    this.opacity[i] = this.cfg.rgb.buttons[i][3];
                clr = glo.RGBtoHEXv(this.cfg.rgb.buttons[i]);
                html += `<button id="clr${i}" class="bn" style="width:50px; height:50px; background-color:${clr};"></button>`
            }
            this.innerHTML = `<link rel="stylesheet" href="/local/conx.css?v=1"><div id="root" style="${this._style}">${html}</div>`;
            this.root = glo.findChild(this, "root");

            let bt: any;
            for (let i: number = 0; i < this.cfg.colors.length; ++i) {
                bt = glo.findChild(this.root, `clr${i}`);
                bt.onclick = this.onColor.bind(this, i);
            }
        }

        public static getStubConfig(hass: any, entities: string[], entitiesFallback: string[]): any {
            return {
                type: "custom:conx-swatch",
                transition: 2,
                colors: ["#FF0000", "#FFFF00BF", "#00FF0080", "#00FFFF40", "#0000FF", "#FF00FF80"],
                css: `{"bn": { "border-radius":"50%" }}`
            };
        }

        protected postCreate(): void {
            super.postCreate();
        }

        protected onColor(i: number): void {
            const opc = this.opacity?.[i] || 1;
            const rgb: number[] = this.cfg.rgb.colors[i];
            this.ConxLight("", {
                entity_id: this.entities,
                intensity: rgb[3],
                red: rgb[0],
                green: rgb[1],
                blue: rgb[2],
                opacity: opc,
                transition: this.transition
            });
        }
    }

}

customElements.define('conx-swatch', conx.cards.Swatch);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-swatch',
    name: 'conx-swatch',
    description: 'shows color swatches',
});