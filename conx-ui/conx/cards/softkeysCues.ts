/// <reference path="../controls/button.ts" />
/// <reference path="softkeysbase.ts" />
/// <reference path="../controls/codeEditor.ts" />

namespace conx.cards {
    export class SoftkeysCues extends SoftkeysBase {
        protected path: string;
        protected pathRoot: string;

        protected editor: CodeEditor;

        protected create(): void {
            super.create();
            this.pathRoot = this.cfg?.path || "";
            this.path = "";

            this.cols = this.cfg?.cols || this.cols;
            this.rows = this.cfg?.rows || this.rows;
            this.viewCount = this.cfg?.count || this.rows * this.cols;
            let gcols: string = "";
            for (let i: number = 0; i < this.cols; ++i)
                gcols += " " + 100.0 / this.cols + "%";

            let htmlT: string = ``;
            htmlT += `<label id="crams" class="title" style="height:16px; grid-column: 1/6;">sk</label>`;
            htmlT +=
                `<div id="nav" style="display:grid; grid-gap:0px; grid-template-columns:auto auto auto; width:100%; height:32px;">
                    <button id="left" class="cmd" style="width:100%; height:32px; grid-column:1;"><ha-icon icon="${this.getIcon("left")}"></ha-icon></button>
                    <button id="up" class="cmd" style="width:100%; height:32px; grid-column:2;"><ha-icon icon="${this.getIcon("up")}"></ha-icon></button>
                    <button id="right" class="cmd" style="width:100%; height:32px; grid-column:3;"><ha-icon icon="${this.getIcon("right")}"></ha-icon></button>
                </div>`;
            htmlT += `<button id="play" class="cmd" style="width:100%; height:32px; grid-column: 2;"><ha-icon icon="${this.getIcon("cueplay")}"></ha-icon></button>`;
            if (true === this.isAdmin)
                htmlT += `<button id="edit" class="cmd" style="width:100%; height:32px; grid-column: 3;"><ha-icon icon="${this.getIcon("edit")}"></ha-icon></button>`;
            htmlT += `<button id="rename" class="cmd" style="width:100%; height:32px; grid-column: 4;"><ha-icon icon="${this.getIcon("rename")}"></ha-icon></button>`;
            htmlT += `<button id="delete" class="cmd" style="width:100%; height:32px; grid-column: 5;"><ha-icon icon="${this.getIcon("delete")}"></ha-icon></button>`;

            let htmlB: string = ``;
            for (let i: number = 0; i < this.viewCount; ++i)
                htmlB += `
                    <button id="bn${i}" class="bn" style="position:relative; width:100%; height:64px;">                        
                        <ha-icon id="ic" icon=""></ha-icon>
                        <label id="tx" class="text"></label>
                        <label id="nm" class="num" style="position:absolute; top:0px; left:0px; font-size:12px; color:#404040">99</label>
                    </button>
                    `;

            this.innerHTML =
                `<div id="root" style="${this._style}">
                    <div id="trid" style="display:grid; grid-gap:1px; grid-template-columns: 20% 20% 20% 20% 20%;">${htmlT}</div>
                    <div id="grid" style="display:grid; grid-gap:1px; grid-template-columns:${gcols};">${htmlB}</div>
                    ${this.codeEditorInnerHTML}
                </div>`;

            this.root = glo.findChild(this, "root");
            this.editor = glo.findChild(this, "editor");
            this.onYAMLChange = this.onYAMLChange.bind(this);
            const btNames = ["up", "left", "right", "play", "edit", "rename", "delete"];
            let bt: any, i: number;
            this.root['crams'] = glo.findChild(this.root, 'crams');
            for (i = 0; i < btNames.length; ++i) {
                const name = btNames[i];

                bt = glo.findChild(this.root, name);
                if (bt) {
                    conx.controls.Button.SetPrototype(bt);
                    this.cmdRoot[name] = bt;
                    bt.onclick = this.onCommand.bind(this, name);
                }
            }

            for (let i: number = 0; i < this.viewCount; ++i) {
                bt = glo.findChild(this.root, `bn${i}`);
                conx.controls.Button.SetPrototype(bt);
                bt["ic"] = glo.findChild(bt, "ic");
                bt["tx"] = glo.findChild(bt, "tx");
                bt["nm"] = glo.findChild(bt, "nm");
                this.root[`bn${i}`] = bt;
                bt.onclick = this.onButton.bind(this, i);
            }
            this.readData(null);
        }

        public static getStubConfig(hass: any, entities: string[], entitiesFallback: string[]): any {
            return {
                type: "custom:conx-cues",
                cols: 5,
                rows: 3,
                css: `{
    "bn": { "backgroundImage": "linear-gradient( 30deg, #850000 70%, #FFFFFF 100%)" }, 
    "bn-down": { "backgroundImage": "linear-gradient( 30deg, #808080 0%, #000000 50%)" },  
    "cmd": { "background-color": "orange" },
    "cmd-down": { "background-color": "#802020" },
    "cmd-sel": { "background-color": "#FF2020" },
    "text": { "color": "#FFFFFF" }, 
    "num": { "color": "#303000" }
}`
            };
        }
        protected readData(state: string): void {
            this.Get("cues-read", "cues");
            this.refreshCommands();
        }

        protected refreshCommands(): void {
            const path = this.getPath();
            this.root["crams"].textContent = path;
            const data = glo.get(this.skdata, path, "-");
            const type: string = data === this.skdata || !data?.__type ? "folder" : data.__type;


            this.cmdRoot["play"].style.display = type === "folder" ? "block" : "none";
            this.cmdRoot["rename"].style.display = type === "folder" ? "block" : "none";
            this.cmdRoot["edit"].style.display = type === "folder" || type === "cue" ? "block" : "none";
            this.cmdRoot["up"].style.display = path.length > 0 ? "block" : "none";
            this.cmdRoot["left"].style.display = this.startIndex > 0 ? "block" : "none";
            this.cmdRoot["right"].style.display = this.startIndex < this.MAX_TOTAL_SKS - this.viewCount ? "block" : "none";
        }

        protected postCreate(): void {
            super.postCreate();
        }

        protected checkPath(state: string): boolean {
            let path: string = glo.up(state);
            return 0 === path.indexOf("cues");
        }

        protected getPath(): string {
            if (this.path.length <= 0)
                return this.pathRoot;
            if (this.pathRoot.length <= 0)
                return this.path;
            return this.pathRoot + "-" + this.path;
        }

        protected onButton(i: number): void {
            i += this.startIndex;
            let sk: any = this.skbuttons?.[i];
            if (undefined === sk) {
                // todo
                this.setActiveState("");
                return;
            }

            switch (this.activeState) {
                case "delete":
                    switch (sk.type) {
                        case "cue":
                            this.CallService("conx", "cuedelete", { name: sk.path, entity_id: [] });
                            break;

                        case "light":
                            this.CallService("conx", "cuedelete", { name: glo.up(sk.path, "-"), entity_id: sk.name });
                            break;

                    }
                    break;

                case "play":
                    if ("cue" === sk.type)
                        this.CallService("conx", "cueplay", { name: sk.path });
                    break;

                case "edit":
                    if (true === this.isAdmin) {
                        if ("cue" === sk.type)
                            this.editor.showYAML(sk.data, { cmd: "edit", sk: sk }, this.onYAMLChange);
                        else if ("light" === sk.type)
                            this.editor.showYAML(sk.data, { cmd: "edit", sk: sk }, this.onYAMLChange);
                    }
                    break;

                case "rename":
                    if ("cue" === sk.type)
                        this.editor.showYAML({ name: sk.path }, { cmd: "rename", sk: sk }, this.onYAMLChange);

                    break;

                default:
                    if ("folder" === sk.type || "cue" === sk.type) {

                        this.path += this.path.length > 0 ? "-" + sk.name : sk.name;
                        this.startIndex = 0;
                        this.refreshButtons();
                        this.refreshCommands();
                    }
                    else if (true === this.isAdmin)
                        this.editor.showYAML(sk.data, { cmd: "edit", sk: sk }, this.onYAMLChange);
                    break;
            }
            this.setActiveState("");
        }

        protected onCommand(name: string): void {
            trace.log("cmd", name);

            let bt: any;
            switch (name) {
                case "play":
                case "edit":
                case "rename":
                case "delete":
                    bt = this.cmdRoot[name];
                    if (undefined !== bt) {
                        if ("reg" === bt.state)
                            this.setActiveState(name);
                        else
                            this.setActiveState("");
                    }
                    break;

                case "up":
                    this.path = glo.up(this.path, "-");
                    this.refreshButtons();
                    this.refreshCommands();
                    break;

                case "left":
                    this.startIndex -= this.viewCount;
                    if (this.startIndex < 0)
                        this.startIndex = 0;
                    this.refreshButtons();
                    this.refreshCommands();
                    break;

                case "right":
                    this.startIndex += this.viewCount;
                    this.refreshButtons();
                    this.refreshCommands();
                    break;
            }
        }

        protected onYAMLChange(cmd: any, data: any): void {
            console.log(cmd, data);
            const sk = cmd.sk;
            if ("rename" === cmd?.cmd) {
                this.Rename("rename-cue", `cues/${sk.path}`, data.name);
                return;
            }

            if ("cue" === sk.type) {
                const src = sk.data;
                for (let l in src) {
                    if (!data[l])
                        this.Del("delete-cue-light", `cues/${sk.path}/${l}`);
                }

                for (let l in data)
                    this.Set("write-cue-light", `cues/${sk.path}/${l}`, data[l]);
            }
            else if ("light" === sk.type)
                this.Set("write-cue-light", `cues/${glo.up(sk.path, "-")}/${sk.name}`, data);

        }

        protected onConxMsg(cmd: string, unq: string, payload: any, success: boolean): void {
            // trace.log(cmd, unq, payload, success)
            switch (unq) {
                case "cues-read":
                    if (false === success)
                        this.skdata = {}
                    else {
                        this.processData(payload);
                    }
                    this.refreshButtons();
                    break;
            }
        }
        protected processData(payload: any): void {
            this.skdata = {};
            let ids: string[], types: string[] = [], cue: any, len: number;
            for (let c in payload) {
                cue = payload[c];
                ids = c.split("-");
                len = ids.length;
                types.length = len;
                types.fill("folder");
                types[len - 1] = "cue";
                glo.set(this.skdata, ids, cue, "__type", types);
            }
        }
        protected refreshData(): void {
            this.skbuttons = [];
            const path = this.getPath();
            const delimeter = path.length > 0 ? "-" : "";
            const data = glo.get(this.skdata, path, "-");
            let idx: number = 0, sk: any;
            for (let s in data) {
                if ("__type" === s)
                    continue;
                sk = data[s];
                this.skbuttons[idx] = { name: s, data: sk, type: sk?.__type ? sk.__type : "light", parent: data, path: path + delimeter + s };
                ++idx;
            }
        }
        protected type2icon(type: string): string {
            switch (type) {
                case "cue": return "";
                case "folder": return "folder";
                case "light": return "light";
            }
            return "";
        }
        protected refreshButtons(): void {
            this.refreshData();
            let bt: any, sk: any, bi: number;
            for (let vi: number = 0; vi < this.viewCount; ++vi) {
                bi = this.startIndex + vi;
                bt = this.root[`bn${vi}`];
                if (!bt)
                    continue;
                if (bi >= this.MAX_TOTAL_SKS) {
                    bt.style.display = "none";
                    continue;
                }
                else
                    bt.style.display = "block";
                sk = this.skbuttons[bi];
                bt.nm.textContent = "" + (1 + bi);
                if (undefined === sk) {
                    bt.ic.icon = "";
                    bt.tx.textContent = "";
                }
                else {
                    bt.ic.icon = this.getIcon(this.type2icon(sk?.type));
                    bt.tx.textContent = sk?.name;
                }
            }
        }
    }

}

customElements.define('conx-cues', conx.cards.SoftkeysCues);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-cues',
    name: 'conx-cues',
    description: 'Cues',
});