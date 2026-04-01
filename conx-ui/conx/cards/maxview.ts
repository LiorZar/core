/// <reference path="layout.ts" />

namespace conx.cards {


    export class MaxView extends Layout {
        protected createHTML(): void {
            super.createHTML();
            this.innerHTML = `<div id="root" style="display: inline-block; width: 100%; height: 100%;" />`;
            this.root = glo.findChild(this, "root");
            this.layout = this.root;
            this.cfg.fixParent = this.cfg?.fixParent ?? true;
            if (this.cfg.fixParent)
                this.fixParent();
        }
        protected fixParent() {
            const p = this?.parentElement;
            if (p && p.className) {
                p.className = "";
            }
            setTimeout(this.fixParent.bind(this), 100);
        }
    }

}

customElements.define('conx-max-view', conx.cards.MaxView);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-max-view',
    name: 'conx-max-view',
    description: 'max view',
});