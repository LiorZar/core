/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class Light_HSV extends HACard {
        protected create(): void {
            super.create();
            let local = window.location.origin;
            this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">
                <conx-slider id="intensity" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="saturation" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="hue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"bg":{"style":{"fill":"none"}}, "image":{"href":"${local}/local/images/gradH.png", "visibility":"visible"}}'></conx-slider>
            </div>
            `;
            this.root = glo.findChild(this, "root");
            this.root.ondblclick = this.onDBLClick.bind(this);
            this.root.hue = glo.findChild(this, "hue");
            this.root.hue.onChange = this.onChange.bind(this);
            this.root.hue.locals.title = "";

            this.root.saturation = glo.findChild(this, "saturation");
            this.root.saturation.onChange = this.onChange.bind(this);
            this.root.saturation.locals.title = "";

            this.root.intensity = glo.findChild(this, "intensity");
            this.root.intensity.onChange = this.onChange.bind(this);
            if (false !== this.cfg.showTitle)
                this.root.intensity.locals.title = this.cfg.name || (this.state && this.state.attributes.friendly_name);
            else
                this.root.intensity.locals.title = "";
        }

        protected refreshColors(): void {
            this.root.saturation.params.bg.style.fill = this.root.saturation.bg.style.fill = glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1);
            this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, this.root.intensity._val);
        }
        protected updateState(check: boolean): boolean {
            if (false === super.updateState(check))
                return false;
            this.root.intensity._val = this.state.attributes.brightness / 255.0;
            this.root.hue._val = this.state.attributes.hs_color[0] / 360.0;
            this.root.saturation._val = this.state.attributes.hs_color[1] / 100.0;;
            this.refreshColors();
            this.root.intensity.updateByValue();
            this.root.hue.updateByValue();
            this.root.saturation.updateByValue();

            return true;
        }

        protected onChange(id: string, value: number, pvalue: number): void {
            let data: any = { entity_id: this.entities };
            data[id] = value;
            this.ConxLight(id, data);
            this.refreshColors();
        }

        protected onDBLClick(): void {
            const hex = (glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1) + glo.HSVtoHEX(0, 0, this.root.intensity._val).substring(1, 3)).toUpperCase();
            console.log(hex);
            glo.clipboard.copy(hex);
        }
    }

}

customElements.define('conx-light-hsv', conx.cards.Light_HSV);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-light-hsv',
    name: 'conx-light-hsv',
    description: 'Control a single light with hsv.',
});