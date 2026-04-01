/// <reference path="layout.ts" />

namespace conx.cards {


    export class Grid extends Layout {
        protected createHTML(): void {
            super.createHTML();
            const gstyle: string = this.cfg?.gstyle || "grid-template-columns: auto auto auto";
            this.cfg.style = this.cfg?.style || "display: inline-block; width: 100%; height: 100%";

            this.innerHTML = `
            <div id="root" style="${this._style}">
                <div id="grid" style="display: grid; ${gstyle};">                    
                </div>
            </div>
            `;
            this.root = glo.findChild(this, "root");
            this.layout = glo.findChild(this.root, "grid");
        }
    }
}

customElements.define('conx-grid', conx.cards.Grid);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-grid',
    name: 'conx-grid',
    description: 'grid',
});