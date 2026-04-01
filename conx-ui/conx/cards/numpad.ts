/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class Numpad extends HACard {
        protected names: string[] = [
            "$fix", "$rgb", "$sw", "C", "Clear",
            "7", "8", "9", "+", "Store",
            "4", "5", "6", "-", "Play",
            "1", "2", "3", "|", "Delete",
            ">", "0", ",", ";", "Reload"
        ];
        protected create(): void {
            super.create();
            let html: string = ``;
            if (this.cfg?.fix1) this.names[0] = this.cfg?.fix1;
            if (this.cfg?.fix2) this.names[1] = this.cfg?.fix2;
            if (this.cfg?.fix3) this.names[2] = this.cfg?.fix3;
            this.css = this.css || {}
            this.css.bn = this.css?.bn || { color: "#FFFFFF", backgroundColor: "#CCCCCC", backgroundImage: "linear-gradient( 0deg, #000000 70%, #FFFFFF 100%)" };
            this.css["bn-down"] = this.css?.["bn-down"] || { color: "#FFFFFF", backgroundColor: "#CCCCCC", backgroundImage: "linear-gradient( 0deg, #808080 0%, #000000 50%)" };

            html += `<label>selection:</label>`;
            html += `<input type="text" id="selection" style="grid-column: 2/6;">`;
            html += `<label>name:</label>`;
            html += `<input type="text" id="name">`;
            html += `<label>timeline:</label>`;
            html += `<input type="text" id="timeline">`;
            html += `<input type="number" id="tran" min="0">`;
            html += `<label>cycle:</label>`;
            html += `<input type="number" id="cycle"  min="0" step="0.5" value="4">`;
            html += `<label style="grid-column: 4;">offset:</label>`;
            html += `<input type="number" id="offset" min="0" max="1" step="0.1" value="0">`;
            for (let i: number = 0; i < 25; ++i)
                html += `<button id="bn${i}" class="bn" style="width:100%; height:64px;"></button>`
            this.innerHTML = `<link rel="stylesheet" href="/local/conx.css?v=1"><div id="root" style="display: grid; grid-gap: 1px; grid-template-columns: 20% 20% 20% 20% 20%;">${html}</div>`;
            this.root = glo.findChild(this, "root");

            let bt: any;
            this.root.sel = glo.findChild(this.root, "selection");
            this.root.sel.onchange = this.onChange.bind(this, "sel");
            this.root.name = glo.findChild(this.root, "name");
            this.root.name.onchange = this.onChange.bind(this, "name");
            this.root.timeline = glo.findChild(this.root, "timeline");
            this.root.timeline.onchange = this.onChange.bind(this, "timeline");
            this.root.tran = glo.findChild(this.root, "tran");
            this.root.tran.onchange = this.onChange.bind(this, "tran");
            this.root.cycle = glo.findChild(this.root, "cycle");
            this.root.cycle.onchange = this.onChange.bind(this, "cycle");
            this.root.offset = glo.findChild(this.root, "offset");
            this.root.offset.onchange = this.onChange.bind(this, "offset");
            for (let i: number = 0; i < 25; ++i) {
                bt = glo.findChild(this.root, `bn${i}`);
                conx.controls.Button.SetPrototype(bt);
                this.root[`bn${i}`] = bt;
                bt.onclick = this.onButton.bind(this, i, this.names[i]);
            }
            this.checkState("conx.selection", this.root.sel, "data", false);
            this.checkState("conx.name", this.root.name, undefined, false);
            this.checkState("conx.timeline", this.root.timeline, undefined, false);
            this.checkState("conx.transition", this.root.tran, undefined, false);
            this.refreshNames();
        }

        protected postCreate(): void {
            super.postCreate();
        }

        protected updateState(check: boolean): boolean {
            if (!this.root || !this.connected)
                return false;
            this.checkState("conx.selection", this.root.sel, "data");
            this.checkState("conx.name", this.root.name);
            this.checkState("conx.timeline", this.root.timeline);
            this.checkState("conx.transition", this.root.tran);

            return true;
        }

        protected checkState(entity: string, elm: any, data: any = undefined, checkTime: boolean = true) {
            if (checkTime && false === this.hasStateChanged(entity))
                return;
            if (!data)
                elm.value = this._hass.states[entity].state;
            else
                elm.value = this._hass.states[entity].attributes[data];
        }

        protected onChange(type: string): void {
            switch (type) {
                case "sel":
                    this._hass.callService("conx", "select", { id: this.root.sel.value });
                    break;

                case "name":
                    this._hass.callService("conx", "name", { name: this.root.name.value });
                    break;

                case "timeline":
                    this._hass.callService("conx", "timeline", { timeline: this.root.timeline.value });
                    this.refreshNames();
                    break;

                case "tran":
                    this._hass.callService("conx", "transition", { value: Number(this.root.tran.value) });
                    break;

                case "cycle":
                    this.conx("lightParams", "fde.lightParams", { cycle: Number(this.root.cycle.value) });
                    break;

                case "offset":
                    this.conx("lightParams", "fde.lightParams", { offset: Number(this.root.offset.value) });
                    break;
            }
        }
        protected refreshNames(): void {
            let s: string = "";
            if (this.root.timeline.value?.length > 0)
                s = "T";

            this.names[9] = "Store" + s;
            this.names[14] = "Play" + s;
            this.names[19] = "Delete" + s;

            this.refreshButtonNames();
        }
        protected refreshButtonNames(): void {
            let bt: any;
            for (let i: number = 0; i < 25; ++i) {
                bt = this.root[`bn${i}`];
                bt.textContent = this.names[i];
            }
        }
        protected onButton(i: number, name: string): void {
            let sel: string = this.root.sel.value;
            switch (name) {
                case 'Store':
                    if ("StoreT" === this.names[i])
                        this._hass.callService("conx", "TimelineStore", {});
                    else
                        this._hass.callService("conx", "cuestore", {});
                    break;

                case 'Play':
                    if ("PlayT" === this.names[i])
                        this._hass.callService("conx", "TimelineStart", { name: this.root.timeline.value });
                    else
                        this._hass.callService("conx", "cueplay", {});
                    break;

                case 'Delete':
                    if ("DeleteT" === this.names[i])
                        this._hass.callService("conx", "TimelineDelete", {});
                    else
                        this._hass.callService("conx", "cuedelete", {});
                    break;

                case 'Name':
                    this._hass.callService("conx", "name", { name: this.root.name.value });
                    break;

                case 'Reload':
                    this._hass.callService("conx", "reload", {});
                    break;

                case 'C':
                    this.root.sel.value = sel.substr(0, sel.length - 1);
                    this.onChange("sel");
                    break;

                case 'Clear':
                    this.root.sel.value = "";
                    this.onChange("sel");
                    this.root.name.value = "";
                    this.onChange("name");
                    this.root.timeline.value = "";
                    this.onChange("timeline");
                    this._hass.callService("conx", "clear", {});
                    break;

                default:
                    this.root.sel.value = sel + name;
                    this.onChange("sel");
            }

        }
    }

}

customElements.define('conx-numpad', conx.cards.Numpad);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-numpad',
    name: 'conx-numpad',
    description: 'Editors numpad',
});