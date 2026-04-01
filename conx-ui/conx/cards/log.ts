/// <reference path="../controls/button.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class Log extends HACard {
        protected autoScroll: boolean = true;

        protected create(): void {
            super.create();
            this.cfg.style = this.cfg?.style || `display: grid; grid-gap: 1px; grid-template-columns: 20% 20% 20% 20% 20%;`;

            let html: string = ``;
            html += `<button id="autoScroll" class="cmd" style="width:100%; height:32px;"><ha-icon icon="mdi:arrow-vertical-lock"></ha-icon></button>`;
            html += `<button id="clear" class="cmd" style="width:100%; height:32px; grid-column:5/6"><ha-icon icon="mdi:delete-empty-outline"></ha-icon></button>`;
            html += `<div id="log" class="log" style="width:100%; height:310px; overflow: scroll; grid-column:1/6"></div>`;
            this.innerHTML = `<link rel="stylesheet" href="/local/conx.css?v=1"><div id="root" style="${this._style}">${html}</div>`;
            this.root = glo.findChild(this, "root");

            let bt: any;
            bt = glo.findChild(this.root, 'autoScroll');
            conx.controls.Button.SetPrototype(bt);
            this.root['autoScroll'] = bt;
            bt.onclick = this.onCommand.bind(this, 'autoScroll');

            bt = glo.findChild(this.root, 'clear');
            conx.controls.Button.SetPrototype(bt);
            this.root['clear'] = bt;
            bt.onclick = this.onCommand.bind(this, 'clear');

            this.root['log'] = glo.findChild(this.root, 'log');
        }

        protected updateState(check: boolean): boolean {
            if (!this.root || !this.connected)
                return false;


            if (false === this.hasStateChanged("conx.log"))
                return false;

            let state: any = this._hass.states["conx.log"];
            if (!state)
                return false;

            this.root.log.innerHTML += state.state + "<br>";
            if (this.root.autoScroll.state === "reg")
                this.root.log.scrollTop = this.root.log.scrollHeight;

            return true;
        }

        protected onCommand(name: string): void {
            trace.log("cmd", name);
            let bt: any;
            switch (name) {
                case "autoScroll":
                    if (this.root.autoScroll.state === "reg")
                        this.root.autoScroll.state = "sel";
                    else
                        this.root.autoScroll.state = "reg";

                    break;

                case "clear":
                    this.root.log.innerHTML = "";
                    break;
            }
        }
    }

}

customElements.define('conx-log', conx.cards.Log);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-log',
    name: 'conx-log',
    description: 'Logs messages',
});