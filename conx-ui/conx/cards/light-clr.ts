/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class Light_CLR extends HACard {
        protected lastHSV: boolean = undefined;
        protected create(): void {
            super.create();
            let local = window.location.origin;
            this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">
                <conx-slider id="intensity" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="saturation" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="hue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"bg":{"style":{"fill":"none"}}, "image":{"href":"${local}/local/images/gradH.png", "visibility":"visible"}}'></conx-slider>
                <conx-slider id="red" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="green" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="blue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#0000FF"}}}'></conx-slider>
            </div>
            `;
            this.root = glo.findChild(this, "root");
            this.root.ondblclick = this.onDBLClick.bind(this);
            this.root.intensity = glo.findChild(this, "intensity");
            this.root.intensity.onChange = this.onChange.bind(this);
            if (false !== this.cfg.showTitle)
                this.root.intensity.locals.title = this.cfg.name || (this.state && this.state.attributes.friendly_name);
            else
                this.root.intensity.locals.title = "";

            this.root = glo.findChild(this, "root");
            this.root.hue = glo.findChild(this, "hue");
            this.root.hue.onChange = this.onChange.bind(this);
            this.root.hue.locals.title = "";

            this.root.saturation = glo.findChild(this, "saturation");
            this.root.saturation.onChange = this.onChange.bind(this);
            this.root.saturation.locals.title = "";

            this.root.red = glo.findChild(this, "red");
            this.root.red.onChange = this.onChange.bind(this);
            this.root.red.locals.title = "";

            this.root.green = glo.findChild(this, "green");
            this.root.green.onChange = this.onChange.bind(this);
            this.root.green.locals.title = "";

            this.root.blue = glo.findChild(this, "blue");
            this.root.blue.onChange = this.onChange.bind(this);
            this.root.blue.locals.title = "";
        }

        protected refreshColors(hsv: boolean): void {
            this.lastHSV = hsv;
            if (hsv) {
                let rgb = glo.HSVtoRGB(this.root.hue._val, this.root.saturation._val, this.root.intensity._val);

                this.root.saturation.params.bg.style.fill = this.root.saturation.bg.style.fill = glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1);
                this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = glo.RGBtoHEX(rgb[0], rgb[1], rgb[2]);

                this.refreshRGB(rgb);
            }
            else {
                let hsv = glo.RGBtoHSV(this.root.red._val, this.root.green._val, this.root.blue._val);

                this.root.red.params.bg.style.fill = this.root.red.bg.style.fill = glo.RGBAtoHEX(1, 0, 0, this.root.red._val);
                this.root.green.params.bg.style.fill = this.root.green.bg.style.fill = glo.RGBAtoHEX(0, 1, 0, this.root.green._val);
                this.root.blue.params.bg.style.fill = this.root.blue.bg.style.fill = glo.RGBAtoHEX(0, 0, 1, this.root.blue._val);

                this.refreshHSV(hsv);
            }
        }

        protected refreshRGB(rgb: number[]): void {
            this.root.red._val = rgb[0];
            this.root.green._val = rgb[1];
            this.root.blue._val = rgb[2];

            this.root.red.params.bg.style.fill = this.root.red.bg.style.fill = glo.RGBAtoHEX(1, 0, 0, this.root.red._val);
            this.root.green.params.bg.style.fill = this.root.green.bg.style.fill = glo.RGBAtoHEX(0, 1, 0, this.root.green._val);
            this.root.blue.params.bg.style.fill = this.root.blue.bg.style.fill = glo.RGBAtoHEX(0, 0, 1, this.root.blue._val);

            this.root.red.updateByValue();
            this.root.green.updateByValue();
            this.root.blue.updateByValue();
        }

        protected refreshHSV(hsv: number[]): void {
            this.root.intensity._val = hsv[2];
            this.root.hue._val = hsv[0];
            this.root.saturation._val = hsv[1];

            this.root.saturation.params.bg.style.fill = this.root.saturation.bg.style.fill = glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1);
            this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = glo.RGBtoHEX(this.root.red._val, this.root.green._val, this.root.blue._val);

            this.root.intensity.updateByValue();
            this.root.hue.updateByValue();
            this.root.saturation.updateByValue();
        }

        protected updateState(check: boolean): boolean {
            if (false === super.updateState(check))
                return false;

            let rgba: number[] = this.stateToColor(this.state);
            let hsv = glo.RGBtoHSV(rgba[0], rgba[1], rgba[2]);
            hsv[2] = rgba[3];
            let rgb = glo.HSVtoRGB(hsv[0], hsv[1], hsv[2]);

            this.refreshRGB(rgb);
            this.refreshHSV(hsv);

            return true;
        }

        protected onChange(id: string, value: number, pvalue: number): void {
            let data: any = { entity_id: this.entities };
            data[id] = value;
            this.ConxLight(id, data);
            this.refreshColors("intensity" === id || "hue" === id || "saturation" === id);
        }

        protected onDBLClick(): void {
            const hex = (glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1) + glo.HSVtoHEX(0, 0, this.root.intensity._val).substring(1, 3)).toUpperCase();
            console.log(hex);
            glo.clipboard.copy(hex);
        }
    }

}

customElements.define('conx-light-clr', conx.cards.Light_CLR);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-light-clr',
    name: 'conx-light-clr',
    description: 'Control a single light with hsv and rgb.',
});