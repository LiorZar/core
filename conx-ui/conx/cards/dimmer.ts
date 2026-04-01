/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
/// <reference path="nameEditor.ts" />

namespace conx.cards {
    export class Dimmer extends HACard {
        protected icon: string = "mdi:lightbulb";
        protected rgba: number[];
        protected downTime: number = 0;
        protected create(): void {
            super.create();

            this.icon = this.cfg?.icon || this.icon;

            this.css = this.css || {}
            this.css.class = this.css?.class || "conx-dimmer-bn";
            this.cfg.style = this.cfg?.style || `display: grid; grid-gap: 1px; grid-template-columns:40px auto`;

            this.innerHTML = `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" style="${this._style}">
                <button id="toggle" class="${this.css.class}"><ha-icon id="ic" icon="${this.icon}" style="color: #FF0000;"></ha-icon></button>
                <conx-slider id="intensity" width="100%" height="32px" locals='{"align":0, "thumb":3}'/>
            </div>
            `

            this.root = glo.findChild(this, "root");
            this.root.intensity = glo.findChild(this, "intensity");
            this.root.intensity.onChange = this.onChange.bind(this);
            this.root.intensity.locals.title = this.cfg.name || (this.state && this.state.attributes.friendly_name);
            if (this.cfg?.params) {
                if (undefined !== this.cfg?.params && typeof (this.cfg?.params) === "string")
                    this.cfg.params = JSON.parse(glo.fixOrigin(this.cfg.params));
                this.root.intensity.copyData(this.root.intensity.params, this.cfg.params);
            }

            const bt = glo.findChild(this.root, 'toggle');
            this.root.toggle = bt;
            conx.controls.Button.SetPrototype(bt, false);

            bt.clickFn = this.onCommand.bind(this, "toggle");
            bt.downFn = this.onCommand.bind(this, "down");
            bt.upFn = this.onCommand.bind(this, "up");
            bt.outFn = this.onCommand.bind(this, "out");

            bt.addEventListener("pointerdown", bt.downFn);
            bt.addEventListener("pointerup", bt.upFn);
            bt.addEventListener("click", bt.clickFn);
            bt.addEventListener("pointerout", bt.outFn);

            this.root.ic = glo.findChild(this.root.toggle, 'ic');
            this.readSlider();
        }
        protected postCreate(): void {
            super.postCreate();
        }
        static async getConfigElement() {
            return document.createElement("name-editor");
        }
        public static getStubConfig(hass: any, entities: string[], entitiesFallback: string[]): any {
            return {
                type: "custom:conx-dimmer",
                dimmerColor: "1,0.75,0",
                params: `{
                    "bg": {"rx":"10", "ry":"10", "style": {"fill": "#919191"}},                    
                    "frame": {"rx":"10", "ry":"10", "style": {"fill":"none",  "stroke": "black", "strokeWidth": "5px"}},
                    "progress": {"style": {"fill": "red"}},
                    "thumb": {"rx":"10", "ry":"10"},
                    "text": {"style": {"fontSize": "20px"}}
                }`
            };
        }
        protected refreshColors(): boolean {
            if (!this.rgba)
                return false;

            if (this.state?.attributes?.nonDim)
                this.root.ic.icon = "mdi:electric-switch";
            this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = this.root.ic.style.color = glo.RGBAtoHEX(this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3]);

            return true;
        }
        protected updateState(check: boolean): boolean {
            if (false === super.updateState(check))
                return false;

            this.rgba = this.stateToColor(this.state);
            if (!this.refreshColors())
                return false;
            this.root.intensity._val = this.rgba[3];
            this.root.intensity.updateByValue();

            return true;
        }
        protected onChange(id: string, value: number, pvalue: number): void {
            this.ConxLight("main", { entity_id: this.entities, intensity: value });
            if (!this.rgba)
                return;

            this.rgba[3] = value;
            this.colorToState(this.rgba);
            this.rgba = this.stateToColor(this.state);

            this.refreshColors();
        }
        protected onCommand(name: string): void {
            trace.log("cmd", name);

            let bt: any;
            switch (name) {
                case "toggle":
                    if (glo.time - this.downTime <= 500) {
                        this.rgba[3] = this.root.intensity._val > 0 ? 0.0 : 1.0;
                        this.colorToState(this.rgba);
                        this.rgba = this.stateToColor(this.state);
                        this.refreshColors();
                        this.root.intensity._val = this.rgba[3];
                        this.root.intensity.updateByValue();
                        this.ConxLight("", { entity_id: this.entities, intensity: this.rgba[3] });
                        this.stampClear();
                    }
                    this.downTime = 0;
                    break;

                case "down":
                    this.downTime = glo.time;
                    break;

                case "out":
                    // this.downTime = 0;
                    break;

                case "up":
                    if (this.downTime > 0 && glo.time - this.downTime > 500) {
                        if (glo.time - this.downTime > 1500) {
                            const event: any = new Event('hass-more-info', { bubbles: true, composed: true });
                            event.detail = { entityId: this.entities[0] };
                            this.dispatchEvent(event);
                            // this.downTime = 0;
                        } else {
                            const dialog = document.createElement('ha-dialog') as HTMLDialogElement;
                            dialog.innerHTML = `
                            <h2>Choose a name</h2>
                            <ha-textfield label="entity" value="${this.sliderId}"  style="width:100%;" readonly></ha-textfield>
                            <ha-textfield id="name" label="Name" value="${this.currName}" style="width:100%;"></ha-textfield>  
                            <ha-button id="ok">OK</ha-button>
                        `;
                            document.body.appendChild(dialog);
                            dialog.open = true;

                            dialog.querySelector('#ok')!.addEventListener('click', () => {
                                const name = (dialog.querySelector('#name') as any);
                                this.setSliderName(name.value); // already in your code
                                dialog.close();
                            });
                        }
                    }
                    break;
            }
        }
        protected onConxMsg(cmd: string, unq: string, payload: any, success: boolean): void {
            switch (unq) {
                case "read-slider":
                    if (!payload)
                        this.setSliderName(this.sliderId);
                    else
                        this.setSliderName(payload, false);
                    console.log("slider", payload, success);
                    break;
            }
        }
        public get currName(): string {
            const name = this.root.intensity.locals.title || this.sliderId;
            return name;
        }
        public get sliderId(): string {
            if (this.entities.length <= 0)
                return "";
            return this.entities.map((e: string) => e.replace(/^light\./, "")).join("_");
        }
        protected readSlider(): void {
            if (this.entities.length <= 0)
                return;
            this.Get("read-slider", `slider/${this.sliderId}`);
        }
        protected setSliderName(name: string, update: boolean = true): void {
            if (update)
                this.Set("write-slider-name", `slider/${this.sliderId}`, name, true, true);
            this.root.intensity.locals.title = name;
            this.root.intensity.updateByValue();
        }
    }
}

customElements.define('conx-dimmer', conx.cards.Dimmer);

conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-dimmer',
    name: 'conx-dimmer',
    description: 'Control a single light with dimmer.',
});