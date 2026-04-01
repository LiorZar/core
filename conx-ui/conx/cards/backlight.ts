/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class BackLight extends HACard {
        protected bk: any;
        protected fg: any;
        protected main: any;
        protected cdata: any;
        protected create(): void {
            super.create();
            this.cdata = this.cfg?.cdata || `$org$/local/images/1.jpg`;
            const node = glo.fixOrigin(this.cfg?.node || `<img id="main" src="${this.cdata}" style="max-width:100%; max-height:100%;">`);
            this.cfg.width = this.cfg?.width || `100%`;
            this.cfg.height = this.cfg?.height || `100%`;
            this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">
                <div id="bk" style="display: inline-block; width: 100%; height: 100%; background:magenta;">
                    <div id="fg" style="display: inline-block; width: 100%; height: 100%; opacity:0.5;">
                        ${node}
                    </div>
                </div>
            </div>
            `;
            this.root = glo.findChild(this, "root");
            this.bk = glo.findChild(this.root, "bk");
            this.fg = glo.findChild(this.bk, "fg");
            this.main = glo.findChild(this.fg, "main");
        }

        protected updateState(check: boolean): boolean {
            if (false === super.updateState(check))
                return false;

            const rgba: number[] = this.stateToColor(this.state);
            const color = glo.RGBAtoHEX(rgba[0], rgba[1], rgba[2], rgba[3]);
            this.bk.style.background = color;
            this.fg.style.opacity = rgba[4];

            const cdata = this.state?.attributes?.cdata;
            if (cdata && cdata !== this.cdata) {
                this.cdata = cdata;
                glo.updateChild(this.main, cdata);
            }

            return true;
        }
    }
}

customElements.define('conx-backlight', conx.cards.BackLight);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-backlight',
    name: 'conx-backlight',
    description: 'shows entity backlight',
});