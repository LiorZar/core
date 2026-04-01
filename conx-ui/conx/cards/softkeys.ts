/// <reference path="../controls/button.ts" />
/// <reference path="softkeysbase.ts" />

namespace conx.cards {
    export class Softkeys extends SoftkeysBase {
        protected path: string;
        protected pathRoot: string;

        protected editor: CodeEditor;

        protected create(): void {
            super.create();

            this.pathRoot = this.cfg?.path || "sk";
            if ("sk" !== this.pathRoot.substr(0, 2))
                this.pathRoot = "sk/" + this.pathRoot;
            this.path = "";
            this.cols = this.cfg?.cols ?? this.cols;
            this.rows = this.cfg?.rows ?? this.rows;
            this.viewCount = this.cfg?.count ?? this.rows * this.cols;
            let gcols: string = "";
            for (let i: number = 0; i < this.cols; ++i)
                gcols += " " + 100.0 / this.cols + "%";

            const title: string = glo.isVisible(this.cfg?.showTitle, this.isAdmin) ? "grid" : "none";

            let htmlT: string = ``;
            htmlT += `<label id="crams" class="title" style="display:${title}; height:16px; grid-column: 1/6;">sk</label>`;
            htmlT +=
                `<div id="nav" style="display:${title}; grid-gap:0px; grid-template-columns:auto auto auto; width:100%; height:32px;">
                        <button id="left" class="cmd" style="width:100%; height:32px; grid-column:1;"><ha-icon icon="${this.getIcon("left")}"></ha-icon></button>
                        <button id="up" class="cmd" style="width:100%; height:32px; grid-column:2;"><ha-icon icon="${this.getIcon("up")}"></ha-icon></button>
                        <button id="right" class="cmd" style="width:100%; height:32px; grid-column:3;"><ha-icon icon="${this.getIcon("right")}"></ha-icon></button>
                </div>`;
            htmlT += `<button id="delete" class="cmd" style="display:${title}; width:100%; height:32px; grid-column: 2;"><ha-icon icon="${this.getIcon("delete")}"></ha-icon></button>`;
            htmlT += `<button id="folder" class="cmd" style="display:${title}; width:100%; height:32px; grid-column: 3;"><ha-icon icon="${this.getIcon("folder")}"></ha-icon></button>`;
            htmlT += `<button id="group" class="cmd" style="display:${title}; width:100%; height:32px; grid-column: 4};"><ha-icon icon="${this.getIcon("group")}"></ha-icon></button>`;
            if (!this.isAdmin)
                htmlT += `<button id="script" class="cmd" style="display:${title}; width:100%; height:32px; grid-column: 5;"><ha-icon icon="${this.getIcon("script")}"></ha-icon></button>`;
            else
                htmlT +=
                    `<div id="editdiv" style="display:${title}; grid-gap:0px; grid-template-columns:40% 60%; width:100%; height:32px;">
                            <button id="edit" class="cmd" style="width:100%; height:32px; grid-column:1;"><ha-icon icon="${this.getIcon("edit")}"></ha-icon></button>
                            <button id="script" class="cmd" style="width:100%; height:32px; grid-column:2;"><ha-icon icon="${this.getIcon("script")}"></ha-icon></button>
                    </div>`;

            let htmlB: string = ``;
            for (let i: number = 0; i < this.viewCount; ++i)
                htmlB +=
                    `<button id="bn${i}" class="bn" style="position:relative; width:100%; height:64px;">                        
                        <ha-icon id="ic" icon=""></ha-icon>
                        <label id="tx" class="text"></label>
                        <label id="nm" class="num" style="position:absolute; top:0px; left:0px; font-size:12px; color:#404040">99</label>
                    </button>`;
            this.innerHTML =
                `<div id="root" style="${this._style}">
                    <div id="trid" style="display:grid; grid-gap:1px; grid-template-columns: 20% 20% 20% 20% 20%;">${htmlT}</div>
                    <div id="grid" style="display:grid; grid-gap:1px; grid-template-columns:${gcols};">${htmlB}</div>
                    ${this.codeEditorInnerHTML}
                </div>`;

            this.root = glo.findChild(this, "root");
            this.editor = glo.findChild(this, "editor");
            this.onYAMLChange = this.onYAMLChange.bind(this);

            const btNames = ["up", "left", "right", "folder", "delete", "group", "edit", "script"];
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
                type: "custom:conx-softkeys",
                path: "sk",
                cols: 5,
                rows: 3,
                showTitle: true,
                css: `{
    "bn": { "backgroundImage": "linear-gradient( 30deg, blue 70%, #FFFFFF 100%)" }, 
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
            this.Get("sk-read", this.getPath());
            this.root["crams"].textContent = this.getPath();

            this.cmdRoot["up"].style.display = this.path.length > 0 ? "block" : "none";
            this.cmdRoot["left"].style.display = this.startIndex > 0 ? "block" : "none";
            this.cmdRoot["right"].style.display = this.startIndex < this.MAX_TOTAL_SKS - this.viewCount ? "block" : "none";
        }

        protected postCreate(): void {
            super.postCreate();
        }

        protected checkPath(state: string): boolean {
            let path: string = glo.up(state);
            if (this.getPath() !== path && this.getPath() !== glo.up(path))
                return false;
            return true;
        }

        protected getPath(): string {
            if (this.path.length <= 0)
                return this.pathRoot;
            return this.pathRoot + "/" + this.path;
        }

        protected onButton(i: number): void {
            i += this.startIndex;
            let sk: any = this.skbuttons?.[i];
            if (undefined === sk) {
                if ("edit" === this.activeState) {
                    this.editor.showYAML({
                        name: "new softkey",
                        info: {
                            type: "script",
                            idx: i,
                            data: {
                                domain: "<domain>",
                                service: "<service>",
                                data: { soft: true }
                            }
                        }
                    },
                        {
                            i: i,
                            name: "new"
                        },
                        this.onYAMLChange);
                }
                else
                    this.conx("sk-save", "db.SaveSK", { path: this.getPath(), type: this.activeState, idx: i });
                this.setActiveState("");
                return;
            }

            switch (this.activeState) {
                case "delete":
                    this.conx("sk-save", "db.SaveSK", { path: this.getPath() + "/" + sk.name, type: this.activeState, idx: i });
                    break;

                case "edit":
                    if (true === this.isAdmin)
                        this.editor.showYAML({ name: sk.name, info: this.skdata[sk.name] }, { i: i, name: sk.name }, this.onYAMLChange);
                    break;

                default:
                    if ("folder" !== sk.data.type)
                        this.conx("sk-play", "db.PlaySK", { path: this.getPath() + "/" + sk.name, idx: i });
                    else {
                        this.path += ((this.path.length > 0) ? "/" : "") + sk.name + "/data";
                        this.readData(null);
                    }
                    break;
            }
            this.setActiveState("");
        }
        protected onCommand(name: string): void {
            trace.log("cmd", name);
            let bt: any;
            switch (name) {
                case "delete":
                case "group":
                case "script":
                case "folder":
                case "edit":
                    bt = this.cmdRoot[name];
                    if (undefined !== bt) {
                        if ("reg" === bt.state)
                            this.setActiveState(name);
                        else
                            this.setActiveState("");
                    }
                    break;

                case "up":
                    this.path = this.path.substr(0, this.path.lastIndexOf("/"));
                    this.path = this.path.substr(0, this.path.lastIndexOf("/"));
                    this.readData(null);
                    break;

                case "left":
                    this.startIndex -= this.viewCount;
                    if (this.startIndex < 0)
                        this.startIndex = 0;
                    this.refreshButtons();
                    this.readData(null);
                    break;

                case "right":
                    this.startIndex += this.viewCount;
                    this.refreshButtons();
                    this.readData(null);
                    break;
            }
        }
        protected onYAMLChange(cmd: any, data: any): void {
            const nameChange: boolean = cmd.name !== data.name;
            const name = data.name;
            data = data.info;
            data.idx = data.idx ?? cmd.i;
            const idxChange: boolean = data.idx !== cmd.i;
            if (typeof data.data === "object")
                data.data.soft = true;

            this.Set("write-sk", this.getPath() + `/${name}`, data);
            if (nameChange)
                this.Del("write-sk", this.getPath() + `/${cmd.name}`);
        }

        protected onConxMsg(cmd: string, unq: string, payload: any, success: boolean): void {
            // trace.log(cmd, unq, payload, success)
            switch (unq) {
                case "sk-read":
                    if (false === success)
                        this.skdata = {}
                    else
                        this.skdata = payload
                    this.refreshButtons();
                    break;
            }
        }

        protected refreshData(): void {
            this.skbuttons = [];
            let idx: number, sk: any;
            for (let s in this.skdata) {
                sk = this.skdata[s];
                idx = sk?.idx;
                this.skbuttons[idx] = { name: s, data: sk };
            }
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
                    bt.ic.icon = this.getIcon(sk?.data?.type, sk?.data?.data);
                    bt.tx.textContent = sk?.name;
                }
            }
        }
    }

}

customElements.define('conx-softkeys', conx.cards.Softkeys);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-softkeys',
    name: 'conx-softkeys',
    description: 'Softkeys',
});