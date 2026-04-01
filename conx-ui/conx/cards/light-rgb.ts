/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class Light_RGB extends HACard {
        protected create(): void {
            super.create();
            this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">
                <conx-slider id="intensity" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#000000"}}}'></conx-slider>
                <conx-slider id="red" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="green" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="blue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#0000FF"}}}'></conx-slider>
            </div>
            `;
            this.root = glo.findChild(this, "root");
            this.root.intensity = glo.findChild(this, "intensity");
            this.root.intensity.onChange = this.onChange.bind(this);
            if (false !== this.cfg.showTitle)
                this.root.intensity.locals.title = this.cfg.name || (this.state && this.state.attributes.friendly_name);
            else
                this.root.intensity.locals.title = "";

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

        protected refreshColors(): void {
            this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = glo.RGBAtoHEX(this.root.red._val, this.root.green._val, this.root.blue._val, this.root.intensity._val);
            this.root.red.params.bg.style.fill = this.root.red.bg.style.fill = glo.RGBAtoHEX(1, 0, 0, this.root.red._val);
            this.root.green.params.bg.style.fill = this.root.green.bg.style.fill = glo.RGBAtoHEX(0, 1, 0, this.root.green._val);
            this.root.blue.params.bg.style.fill = this.root.blue.bg.style.fill = glo.RGBAtoHEX(0, 0, 1, this.root.blue._val);
        }
        protected updateState(check: boolean): boolean {
            if (false === super.updateState(check))
                return false;
            this.root.intensity._val = this.state.attributes.brightness / 255.0;
            this.root.red._val = this.state.attributes.rgb_color[0] / 255.0;
            this.root.green._val = this.state.attributes.rgb_color[1] / 255.0;
            this.root.blue._val = this.state.attributes.rgb_color[2] / 255.0;
            this.refreshColors();
            this.root.intensity.updateByValue();
            this.root.red.updateByValue();
            this.root.green.updateByValue();
            this.root.blue.updateByValue();

            return true;
        }

        protected onChange(id: string, value: number, pvalue: number): void {
            let data: any = { entity_id: this.entities };
            data[id] = value;
            this.ConxLight(id, data);
            this.refreshColors();
        }
    }

}

customElements.define('conx-light-rgb', conx.cards.Light_RGB);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-light-rgb',
    name: 'conx-light-rgb',
    description: 'Control a single light with brightness and rgb.',
});