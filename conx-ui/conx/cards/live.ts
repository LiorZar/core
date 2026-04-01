/// <reference path="../controls/button.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class Live extends HACard {
        protected sel: string;
        protected skdata: any = {}
        protected skbuttons: any[] = []
        protected cols: number = 5;
        protected buttonCount: number = 25;

        protected create(): void {
            super.create();
            this.cols = this.cfg?.cols || this.cols;
            this.buttonCount = this.cfg?.count || this.buttonCount;
            let gcols: string = "";
            for (let i: number = 0; i < this.cols; ++i)
                gcols += " auto";

            this.cfg.style = this.cfg?.style || `display: grid; grid-gap: 1px; grid-template-columns:${gcols}`;
            const FS = this.cfg?.rgb ? "9px" : "10px";
            let html: string = ``;
            for (let i: number = 0; i < this.buttonCount; ++i)
                html +=
                    `<button id="ic${i}" class="bn" style="background-color: #000000; width:100%; height:40px;">
                    <label class="text" id="tx" style="height:20px; color: #FFFFFF">x</label>
                    <label class="clr"  id="cx" style="font-size:${FS}; font-weight: bold; font-family: monospace; color: #FFFFFF">FL,ZR,FL,ZR</label>
                </button>`
            this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">${html}</div>
            `;
            this.root = glo.findChild(this, "root");

            let ic: any;
            for (let i: number = 0; i < this.buttonCount; ++i) {
                ic = glo.findChild(this.root, `ic${i}`);
                ic["tx"] = glo.findChild(ic, "tx");
                ic["cx"] = glo.findChild(ic, "cx");
                this.root[`ic${i}`] = ic;
            }

            this.loadSelection();
            HACard.registedCard(this);
        }

        public static getStubConfig(hass: any, entities: string[], entitiesFallback: string[]): any {
            return {
                type: "custom:conx-live",
                cols: 5,
                count: 25,
                dimmerColor: "1,1,0",
                rgb: false
            };
        }

        protected loadSelection(): void {
            this.sel = this._hass.states["conx.selection"].attributes?.data;
            this.conx("parse", "db.GetEntitiesNames", { selection: this.sel });

        }
        protected updateState(check: boolean): boolean {
            if (!this.root || !this.connected)
                return false;

            if (check && this.hasStateChanged("conx.selection")) {
                this.loadSelection();
                return;
            }
            let id: string, i: number, len: number = this.entities.length;
            for (i = 0; i < len && i < this.buttonCount; ++i) {
                if (false === this.checkStateChanged(i))
                    continue;

                this.refreshButton(i);
            }
            return true;
        }

        protected refreshSelection(): void {
            let ic: any, i: number, len: number = this.entities.length;
            this.pidx.length = len;
            this.nidx.length = len;
            this.ptates.length = len;
            this.states.length = len;
            for (i = 0; i < len; ++i) {
                this.pidx[i] = -1;
                this.nidx[i] = 0;
                this.ptates[i] = this.phass.states[this.entities[i]];
                this.states[i] = this._hass.states[this.entities[i]];
            }
            for (i = 0; i < len && i < this.buttonCount; ++i) {
                ic = this.root[`ic${i}`];
                if (!ic)
                    continue;

                //ic.style.visibility = "visible";
                ic.style.display = "initial";
                this.refreshButton(i, true);
            }
            for (; i < this.buttonCount; ++i) {
                ic = this.root[`ic${i}`];
                if (!ic)
                    continue;

                //ic.style.visibility = "hidden";
                ic.style.display = "none";
            }
        }

        protected refreshButton(i: number, name: boolean = false): void {
            let ic: any = this.root[`ic${i}`];
            let id: string = this.entities[i];
            if (!ic || !id)
                return;

            let state: any = this._hass.states[id]
            let rgba: number[] = this.stateToColor(state);
            if (!rgba)
                return;

            if (name)
                ic.tx.textContent = state?.attributes?.friendly_name;
            ic.tx.style.color = rgba[3] > 0.5 ? "#000000" : "#FFFFFF";
            ic.cx.style.color = ic.tx.style.color;
            ic.cx.textContent = this.paramsText(rgba);
            ic.style.backgroundColor = glo.RGBAtoHEX(rgba[0], rgba[1], rgba[2], rgba[3]);
        }
        protected paramsText(rgba: number[]): string {
            let vals: number[];
            if (this.cfg?.rgb)
                vals = [rgba[0], rgba[1], rgba[2], rgba[3]];
            else
                vals = [rgba[5], rgba[6], rgba[3]];

            return glo.RGBAHStoCode(vals);
        }
        protected onConxMsg(cmd: string, unq: string, payload: any, success: boolean): void {
            // trace.log(cmd, unq, payload, success)
            switch (unq) {
                case "parse":
                    if (false === success)
                        this.entities = []
                    else
                        this.entities = payload
                    this.refreshSelection();
                    break;
            }
        }
    }

}

customElements.define('conx-live', conx.cards.Live);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-live',
    name: 'conx-live',
    description: 'Live',
});