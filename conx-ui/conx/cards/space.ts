/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class Space extends HACard {
        protected create(): void {
            super.create();
            this.cfg.style = this.cfg?.style || `display: block; width: 100%; height: 100%`;
            this.innerHTML = `<div id="root" style="${this._style}" />`;
            this.root = glo.findChild(this, "root");
        }
    }

}

customElements.define('conx-space', conx.cards.Space);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-space',
    name: 'conx-space',
    description: 'use for space',
});