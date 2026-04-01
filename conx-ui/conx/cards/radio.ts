/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
/// <reference path="../controls/codeEditor.ts" />

const POPUP_YAML: string = `
style: >-
  text-align: center; position: absolute; z-index: 1; left: 50%; width: 400px;
  padding: 0px 0px 20px 0px; border-radius: 10px; color: #333; background-color: #fff;
  transition: transform 0.5s, top 0.5s;
hstyle: >-
  font-size: 40px;
pstyle: >-
  font-size: 22px; direction: rtl;
openStyle:
  visibility: visible
  top: 50%
  transform: translate(-50%,-50%) scale(1)
closeStyle:
  visibility: hidden
  top: 0%
  transform: translate(-50%,-50%) scale(0.1)
bnStyle:
  backgroundImage: 'linear-gradient( 30deg, #000000 70%, #FFFFFF 100%)'
  color: white
  border-radius: 30px
  width: 100px
  height: 64px
title: הפעלת תרחיש
message: האם אתה בטוח ?  
flip: true
'yes': כן
'no': לא
`;

namespace conx.cards {
    export class RadioButtonGroup extends HACard {
        protected popup: HTMLElement | null;
        protected pcfg: any;
        protected group: string;
        protected gpath: string;
        protected count: number;
        protected cols: number = 5;
        protected rows: number = 1;
        protected buttons: any[];
        protected buttonMap: { [key: string]: number } = {};
        protected idx2iMap: { [key: number]: number } = {};
        protected activeI: number = -1;
        protected activeIdx: number = -1;
        protected yamlI: number = -1;
        protected activeName: string = "";
        protected buttonsData: any[];
        protected downTimeoutId: number = -1;
        protected longclickIndex: number = 0;
        protected editor: CodeEditor;
        protected onOutPopup: any;
        protected create(): void {
            super.create();
            if (undefined === this.cfg?.group) { this.ErrorView("You must supply a group name"); return; }
            if (undefined === this.cfg?.buttons) { this.ErrorView("You must supply array of buttons"); return; }
            if (undefined === this.cfg?.cols) { this.ErrorView("You must supply array of cols"); return; }

            const isClass: boolean = undefined !== this.cfg.class;
            const withStyle: boolean = undefined !== this.cfg.css && false === isClass;
            const cls = this.cfg.class || "radio";

            this.group = this.cfg?.group;
            this.gpath = `conx.radio/${this.group.toLowerCase()}`.replace("/", "_s_l");
            this.buttons = JSON.parse(JSON.stringify(this.cfg?.buttons));
            this.cols = this.cfg?.cols || this.cols;
            this.count = this.buttons.length;
            this.rows = Math.ceil(this.count / this.cols);

            let btCfg: any;
            for (let i: number = 0; i < this.count; ++i) {
                btCfg = this.buttons[i];
                if (undefined === btCfg?.idx)
                    btCfg.idx = i

                this.idx2iMap[btCfg.idx] = i;
            }

            const wdp: number = 100.0 / (this.cols || 1);
            let gcols: string = "";
            for (let i: number = 0; i < this.cols; ++i)
                gcols += " " + wdp + "%";

            let html: string = ``;
            for (let i: number = 0; i < this.count; ++i) {
                html +=
                    `<button id="bt${i}" class="${cls}" ${withStyle ? 'style="width:100%; height:50px; background-color:#ff0000;"' : ''}>
                        <label id="tx" class="text">x</label>
                    </button>`
            }
            let popupHtml: string = ``;
            if (this.cfg?.popup) {
                const popup = this.cfg?.popup;
                const lib = popup?.lib;
                if (lib) {
                    delete popup.lib;
                    const yaml = glo.lib?.[lib];
                    if (yaml)
                        glo.fixByYAML(popup, yaml);
                }
                if (Object.keys(popup).length === 0)
                    glo.fixByYAML(popup, POPUP_YAML);
                this.cfg.popup = popup;
                this.pcfg = popup;
                if (!popup?.bnStyle && this.css?.radio)
                    popup.bnStyle = this.css.radio;

                const buttonsHtml: string =
                    popup?.flip ?
                        `<button id="no">${popup.no}</button>
                         <button id="yes">${popup.yes}</button>`
                        :
                        `<button id="yes">${popup.yes}</button>
                         <button id="no">${popup.no}</button>`;

                popupHtml =
                    `<div id="popup" style="${popup.style}">
                        <h2 style="${popup.hstyle}">${popup.title}</h2>
                        <p style="${popup.pstyle}">${popup.message}</p>
                        ${buttonsHtml}
                    </div>`;

            }
            this.innerHTML =
                `<div id="root" style="${this._style}">
                    ${popupHtml}
                    <div id="grid" class="grid" style="display:grid; grid-gap:1px; grid-template-columns:${gcols};">${html}</div>
                    ${this.codeEditorInnerHTML}
                </div>`;
            this.root = glo.findChild(this, "root");
            this.popup = glo.findChild(this.root, "popup");
            this.editor = glo.findChild(this, "editor");
            this.onYAMLChange = this.onYAMLChange.bind(this);
            this.showPopup(false);

            let bt: any;
            for (let i: number = 0; i < this.count; ++i) {
                btCfg = this.buttons[i];
                bt = glo.findChild(this.root, `bt${i}`);
                conx.controls.Button.SetPrototype(bt, withStyle);
                btCfg["bt"] = bt;
                bt["tx"] = glo.findChild(bt, "tx");
                if (this.isAdmin)
                    bt.ondblclick = this.onDBLClick.bind(this, i);

                this.root[`bt${i}`] = bt;
            }
            if (this.popup) {
                this.pcfg.buttons = [];
                bt = glo.findChild(this.popup, "yes");
                glo.setStyle(bt, this.pcfg.bnStyle);
                bt.onclick = this.onPopupClick.bind(this, bt.id);
                this.pcfg.buttons.push(bt);
                bt = glo.findChild(this.popup, "no")
                glo.setStyle(bt, this.pcfg.bnStyle);
                bt.onclick = this.onPopupClick.bind(this, bt.id);
                this.pcfg.buttons.push(bt);

                this.onOutPopup = this.onPopupClick.bind(this, "out");
            }
            this.readGroupData("read");
        }
        public static getStubConfig(hass: any, entities: string[], entitiesFallback: string[]): any {
            return {
                type: "custom:conx-radio-group",
                group: "day",
                cols: 5,
                buttons: [{ idx: 0 }, { idx: 1 }, { idx: 2 }, { idx: 3 }, { idx: 4 }],
                css: `{
    "radio": { "backgroundImage": "linear-gradient( 30deg, #000000 70%, #FFFFFF 100%)", "border-radius":"30px" }, 
    "radio-down": { "backgroundImage": "linear-gradient( 0deg, #808080 0%, #000000 50%)" }, 
    "radio-sel": { "background-color":"orange", "backgroundImage": null }, 
    "text": { "color": "#FFFFFF" }
}`
            };
        }
        protected readGroup(): void {
            this.Get("radio-group", `radio/${this.group}/__value`);
        }
        protected readGroupData(cmd: string): void {
            this.Get("radio-group-data-" + cmd, `radio/${this.group}`);
        }
        protected setRadioGroupData(data: any): void {
            this.buttonsData = data?.buttons;
            this.buttonMap = {};

            let bt: any;
            for (let i = 0; i < this.buttonsData?.length; ++i) {
                bt = this.buttonsData[i];
                this.buttonMap[bt.name] = i;
            }
            this.setActiveButton(data?.__value);
        }
        protected clearEvents(bt: any): void {
            if (bt.downFn)
                bt.removeEventListener("pointerdown", bt.downFn);
            if (bt.upFn)
                bt.removeEventListener("pointerup", bt.upFn);
            if (bt.clickFn)
                bt.removeEventListener("click", bt.clickFn);

            bt.removeEventListener("pointerout", bt.outFn);
            bt.removeEventListener("pointercancel", bt.outFn);

            bt.clickFn = undefined;
        }
        protected onRadioGroupData(data: any): void {
            this.setRadioGroupData(data);

            let bt: any, btCfg: any, btData: any, idx: number;
            for (let i: number = 0; i < this.count; ++i) {
                btCfg = this.buttons[i];
                idx = btCfg.idx;
                bt = btCfg.bt;
                btData = this.buttonsData?.[idx] || {};
                bt.tx.textContent = btData?.name ?? "";
                this.clearEvents(bt);

                const longclicks = glo.searchAttributes("longclick", btData, true);
                bt.longclicks = longclicks;

                bt.downFn = this.onButton.bind(this, btData.name, "-down");
                bt.upFn = btData?.up || longclicks || this.isAdmin ? this.onButton.bind(this, btData.name, "-up") : null;
                bt.outFn = this.onButton.bind(this, btData.name, "-out");

                bt.addEventListener("pointerdown", bt.downFn);
                bt.addEventListener("pointerup", bt.upFn);
                if (btData?.click) {
                    const cmd = "html" !== btData?.click?.domain ? "-click" : "-html";
                    bt.clickFn = this.onButton.bind(this, btData.name, cmd);
                    bt.addEventListener("click", bt.clickFn);
                }
            }
        }
        protected postCreate(): void {
            super.postCreate();
        }

        protected updateState(check: boolean): boolean {
            if (!this.root || !this.connected)
                return false;

            if (check) {
                if (false === this.hasStateChanged(this.gpath))
                    return false;

                const state = this._hass.states[this.gpath];
                if (!state)
                    return false;
                const value = glo.up(state.state);
                if ("group" === value)
                    this.readGroupData("read");
                else
                    this.setActiveButton(value);
                return true;
            }
            this.readGroup();

            return true;
        }
        protected clearLongPress(): boolean {
            if (this.downTimeoutId <= 0)
                return false;
            //console.log("clear", this.downTimeoutId);
            clearTimeout(this.downTimeoutId);
            this.downTimeoutId = -1;
            return true;
        }
        protected onButton(name: string, cmd: string): void {
            // console.log("iii", name, cmd, this.longclickIndex, this.gid, glo.time);
            const idx = this.buttonMap[name];
            const I = this.idx2iMap[idx];
            const bt = this.buttons?.[I]?.bt;
            const btData = this.buttonsData?.[idx] || {};
            const lc = this.longclickIndex > 0;
            if (!bt)
                return;
            switch (cmd) {
                case "":
                    this.setActiveButton(name);
                    break;

                case "-down":
                    this.showPopup(false);
                    bt.addEventListener("pointerout", bt.outFn);
                    this.longclickIndex = 0;
                    if (this.downTimeoutId <= 0) {
                        if (bt?.longclicks)
                            this.downTimeoutId = glo.delay(bt?.longclicks[0] * 1000, this, this.onButton, name, "-longclick");
                        else if (this.isAdmin && !btData?.down && !btData?.up)
                            this.downTimeoutId = glo.delay(3000, this, this.onDBLClick, I);
                    }
                    break;

                case "-longclick":
                    this.clearLongPress();
                    cmd += bt?.longclicks[this.longclickIndex];
                    if (++this.longclickIndex < bt?.longclicks.length) {
                        const dt = bt?.longclicks[this.longclickIndex] - bt?.longclicks[this.longclickIndex - 1];
                        this.downTimeoutId = glo.delay(dt * 1000, this, this.onButton, name, "-longclick");
                    }
                    else if (this.isAdmin && !btData?.down && !btData?.up)
                        this.downTimeoutId = glo.delay(3000, this, this.onDBLClick, I);
                    break;

                case "-up":
                case "-out":
                    bt.removeEventListener("pointerout", bt.outFn);
                    this.clearLongPress();
                    break;

                case "-click":
                    this.showPopup(false);
                    if (this.longclickIndex > 0)
                        return;
                    if (this.pcfg?.openStyle && btData?.confirm) {
                        this.pcfg.command = {
                            cmd: cmd,
                            name: name,
                            btData: btData
                        };
                        this.showPopup(true);
                        return;
                    }
                    break;

                case "-html":
                    if (this.longclickIndex > 0)
                        return;
                    this.onHtmlClick(name);
                    return;
            }
            //console.log("o", name, cmd, this.longclickIndex, this.gid);
            if (btData?.[cmd.substring(1)]) {
                this.CallService("conx", "radio_set", { name: this.group, value: name + cmd });
                this.readGroup();
            }
        }
        protected onHtmlClick(name: string): void {
            const btData = this.buttonsData?.[this.buttonMap?.[name]];
            if (!btData || !btData?.click)
                return;
            const data = btData.click;
            switch (data?.service) {
                case "navigate":
                    glo.navigate(data.data);
                    break;
            }
        }
        protected onDBLClick(i: number): void {
            // console.log("onDBLClick", i, glo.time);
            this.clearLongPress();
            this.yamlI = this.buttons[i].idx;
            this.readGroupData("yaml");
        }
        protected onPopupClick(name: string): void {
            console.log("onPopupClick", name);
            this.showPopup(false);
            const command = this.pcfg?.command;
            this.pcfg.command = null;
            if ("yes" !== name || !command)
                return;

            if (command.btData?.[command.cmd.substring(1)])
                this.CallService("conx", "radio_set", { name: this.group, value: command.name + command.cmd });
        }
        protected showPopup(show: boolean): void {
            if (!this.popup)
                return;

            if (show) {
                glo.delay(100, this, () => { window.addEventListener("click", this.onOutPopup); });
                glo.setStyle(this.popup, this.pcfg.openStyle);
            }
            else {
                window.removeEventListener("click", this.onOutPopup);
                glo.setStyle(this.popup, this.pcfg.closeStyle);
            }
        }
        protected onConxMsg(cmd: string, unq: string, payload: any, success: boolean): void {
            switch (unq) {
                case "write-radio-group":
                    if (success)
                        this.readGroup();
                    break;

                case "radio-group":
                    this.setActiveButton(payload);
                    break;

                case "radio-group-data-yaml":
                    this.onRadioGroupDataYAML(payload);
                    break;

                case "radio-group-data-read":
                    this.onRadioGroupData(payload);
                    break;
            }
        }
        protected onRadioGroupDataYAML(data: any): void {
            if (!this.isAdmin)
                return;

            this.onRadioGroupData(data);
            const btData = this.buttonsData?.[this.yamlI] || { name: "new_button_name", click: { domain: "conx", service: "light", data: { intensity: 0.5 } } };
            this.editor.showYAML(btData, this.yamlI, this.onYAMLChange);
            this.yamlI = -1;
        }
        protected onYAMLChange(cmd: any, data: any): void {
            if (undefined === this.buttonsData?.[this.yamlI])
                this.Set("write-radio-group-cmd", `radio/${this.group}`, { buttons: [] }, true, false);

            this.Set("write-radio-group-cmd", `radio/${this.group}/buttons/${cmd}`, data, true);
        }
        protected setActiveButton(name: string): void {
            this.activeIdx = this.buttonMap[name];
            this.activeI = this.idx2iMap[this.activeIdx];
            this.activeName = name;
            for (let i: number = 0; i < this.count; ++i) {
                this.buttons[i].bt.state = "reg";
                this.buttons[i].bt.classList.remove("selected");
            }

            let bt = this.root["bt" + this.activeI];
            if (undefined !== bt) {
                bt.state = "sel";
                bt.classList.add("selected");
            }
        }

        protected ErrorView(msg: string): void {
            this.innerHTML = `<div id="root" style="width:100%; height:50px; background-color:#ff0000;">${msg}</div>`;
            this.root = glo.findChild(this, "root");
        }
    }

}

customElements.define('conx-radio-group', conx.cards.RadioButtonGroup);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-radio-group',
    name: 'conx-radio-group',
    description: 'A radio button group',
});