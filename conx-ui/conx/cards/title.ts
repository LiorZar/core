/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class Title extends HACard {
        protected create(): void {
            super.create();
            this.innerHTML = `<h1 id="root" width="100%" height="40px" style="font-size: 20px;"></h1>`;
            this.root = glo.findChild(this, "root");
            this.root.innerHTML = this.cfg.name || this.state.attributes.friendly_name;
        }
    }

}

customElements.define('conx-title', conx.cards.Title);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-title',
    name: 'conx-title',
    description: 'shows entity title',
});