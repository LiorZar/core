/// <reference path="../controls/button.ts" />
/// <reference path="softkeysbase.ts" />
/// <reference path="../controls/codeEditor.ts" />

namespace conx.cards {
    export class SoftkeysTimelines extends SoftkeysBase {
        protected timeline: string = "";

        protected editor: CodeEditor;

        protected create(): void {
            super.create();
            this.cols = this.cfg?.cols || this.cols;
            this.rows = this.cfg?.rows || this.rows;
            this.viewCount = this.cfg?.count || this.rows * this.cols;
            let gcols: string = "";
            for (let i: number = 0; i < this.cols; ++i)
                gcols += " " + 100.0 / this.cols + "%";

            let htmlT: string = ``;
            htmlT += `<label id="crams" class="title" style="height:16px; grid-column: 1/7;">sk</label>`;
            htmlT +=
                `<div id="nav" style="display:grid; grid-gap:0px; grid-template-columns:auto auto auto; width:100%; height:32px;">
                    <button id="left" class="cmd" style="width:100%; height:32px; grid-column:1;"><ha-icon icon="${this.getIcon("left")}"></ha-icon></button>
                    <button id="up" class="cmd" style="width:100%; height:32px; grid-column:2;"><ha-icon icon="${this.getIcon("up")}"></ha-icon></button>
                    <button id="right" class="cmd" style="width:100%; height:32px; grid-column:3;"><ha-icon icon="${this.getIcon("right")}"></ha-icon></button>
                </div>`;
            htmlT += `<button id="play" class="cmd" style="width:100%; height:32px; grid-column: 2;"><ha-icon icon="${this.getIcon("timelinestart")}"></ha-icon></button>`;
            htmlT += `<button id="stop" class="cmd" style="width:100%; height:32px; grid-column: 3;"><ha-icon icon="${this.getIcon("timelinestop")}"></ha-icon></button>`;
            if (true === this.isAdmin)
                htmlT += `<button id="edit" class="cmd" style="width:100%; height:32px; grid-column: 4;"><ha-icon icon="${this.getIcon("edit")}"></ha-icon></button>`;
            htmlT += `<button id="rename" class="cmd" style="width:100%; height:32px; grid-column: 5;"><ha-icon icon="${this.getIcon("rename")}"></ha-icon></button>`;
            htmlT += `<button id="delete" class="cmd" style="width:100%; height:32px; grid-column: 6;"><ha-icon icon="${this.getIcon("delete")}"></ha-icon></button>`;

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
                    <div id="trid" style="display:grid; grid-gap:1px; grid-template-columns: 17% 17% 16% 16% 17% 17%;">${htmlT}</div>
                    <div id="grid" style="display:grid; grid-gap:1px; grid-template-columns:${gcols};">${htmlB}</div>
                    ${this.codeEditorInnerHTML}
                </div>`;

            this.root = glo.findChild(this, "root");
            this.editor = glo.findChild(this, "editor");
            this.onYAMLChange = this.onYAMLChange.bind(this);
            const btNames = ["up", "left", "right", "play", "stop", "edit", "rename", "delete"];
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
            this.readData("");
            this.readStates();
        }

        public static getStubConfig(hass: any, entities: string[], entitiesFallback: string[]): any {
            return {
                type: "custom:conx-timelines",
                cols: 5,
                rows: 3,
                css: `{
    "bn": { "backgroundImage": "linear-gradient( 30deg, #000000 70%, #FFFFFF 100%)" }, 
    "bn-down": { "backgroundImage": "linear-gradient( 30deg, #808080 0%, #000000 50%)" }, 
    "bn-sel": { "backgroundImage": "linear-gradient( 30deg, #FF30FF 0%, #000000 50%)" }, 
    "cmd": { "background-color": "orange" },
    "cmd-down": { "background-color": "#802020" },
    "cmd-sel": { "background-color": "#FF2020" },
    "text": { "color": "#FFFFFF" }, 
    "num": { "color": "#303000" }
}`
            };
        }
        protected readData(state: string): void {
            const path: string = glo.up(state);
            if (0 === path.indexOf("timelinesStates"))
                this.readStates();
            else
                this.Get("timelines-read", "timelines");
            this.refreshCommands();
        }

        protected readStates(): void {
            this.Get("timelines-read-states", "timelinesStates");
        }

        protected refreshCommands(): void {
            this.root["crams"].textContent = "timelines" + (this.timeline.length > 0 ? "\\" + this.timeline : "");

            this.cmdRoot["play"].style.display = this.timeline.length > 0 ? "none" : "block";
            this.cmdRoot["stop"].style.display = this.timeline.length > 0 ? "none" : "block";
            this.cmdRoot["up"].style.display = this.timeline.length > 0 ? "block" : "none";
            this.cmdRoot["left"].style.display = this.startIndex > 0 ? "block" : "none";
            this.cmdRoot["right"].style.display = this.startIndex < this.MAX_TOTAL_SKS - this.viewCount ? "block" : "none";
        }

        protected postCreate(): void {
            super.postCreate();
        }

        protected checkPath(state: string): boolean {
            const path: string = glo.up(state);
            return 0 === path.indexOf("timelines");
        }

        protected onButton(i: number): void {
            i += this.startIndex;
            let sk: any = this.skbuttons?.[i];
            if (undefined === sk) {
                if ("edit" === this.activeState)
                    this.editor.showYAML({ name: "new timeline", events: [] }, { name: "newTimeline" }, this.onYAMLChange);
                this.setActiveState("");
                return;
            }

            switch (this.activeState) {
                case "delete":
                    if (this.timeline.length <= 0)
                        this.CallService("conx", "timelinedelete", { timeline: sk.name, name: [] })
                    else
                        this.CallService("conx", "timelinedelete", { timeline: this.timeline, name: sk.name })

                    break;

                case "play":
                    if (this.timeline.length <= 0)
                        this.CallService("conx", "timelinestart", { name: sk.name });
                    break;

                case "stop":
                    if (this.timeline.length <= 0)
                        this.CallService("conx", "timelinestop", { name: sk.name });
                    break;

                case "edit":
                    if (true === this.isAdmin) {
                        if (this.timeline.length <= 0)
                            this.editor.showYAML(this.skdata[sk.name], { cmd: "edit", name: sk.name }, this.onYAMLChange);
                        else
                            this.editor.showYAML(this.skdata[this.timeline][sk.i], { cmd: "edit", name: sk.i }, this.onYAMLChange);
                    }
                    break;

                case "rename":
                    if (this.timeline.length <= 0)
                        this.editor.showYAML({ name: sk.name }, { cmd: "rename", name: sk.name }, this.onYAMLChange);

                    break;

                default:
                    if (this.timeline.length <= 0) {
                        this.timeline = sk.name;
                        this.refreshButtons();
                        this.refreshCommands();
                    }
                    else if (true === this.isAdmin)
                        this.editor.showYAML(this.skdata[this.timeline][sk.i], { cmd: "edit", name: sk.i }, this.onYAMLChange);
                    break;
            }
            this.setActiveState("");
        }

        protected onCommand(name: string): void {
            trace.log("cmd", name);

            let bt: any;
            switch (name) {
                case "play":
                case "stop":
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
                    this.timeline = "";
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
            if ("rename" === cmd?.cmd) {

                this.Rename("rename-timeline", `timelines/${cmd.name}`, data.name);
                return;
            }

            cmd = cmd.name;
            if ("newTimeline" === cmd) {
                if (!data?.name || "new timeline" === data.name || !data?.events)
                    return;

                this.CallService("conx", "timelinecreate", { name: data?.name });
                data = data?.events;
            }
            if (this.timeline.length <= 0) {
                const src = this.skdata[cmd];
                for (let l = data?.length; l < src?.length; ++l)
                    this.Del("delete-timeline-cue", `timelines/${cmd}/${l}`);

                for (let l in data)
                    this.Set("write-timeline-cue", `timelines/${cmd}/${l}`, data[l]);
            }
            else
                this.Set("write-timeline-cue", `timelines/${this.timeline}/${cmd}`, data);
        }

        protected onConxMsg(cmd: string, unq: string, payload: any, success: boolean): void {
            trace.log(cmd, unq, payload, success)
            switch (unq) {
                case "timelines-read":
                    if (false === success)
                        this.skdata = {}
                    else
                        this.skdata = payload
                    this.refreshButtons();
                    break;

                case "timelines-read-states":
                    if (false === success)
                        this.tsStates = {}
                    else
                        this.tsStates = payload
                    this.refreshButtons();
                    break;
            }
        }

        protected refreshData(): void {
            this.skbuttons = [];
            if (this.timeline.length > 0)
                this.refreshTimeline(this.skdata[this.timeline], this.tsStates[this.timeline]);
            else
                this.refreshTimelines(this.skdata, this.tsStates);
        }
        protected refreshTimelines(data: any, states: any): void {
            let idx: number = 0, sk: any, state: any, obj: any;
            for (let s in data) {
                sk = data[s];
                state = states[s];
                obj = { title: s, name: s, data: sk, i: Number(s), state: "reg" };
                if (state?.active) {
                    obj.state = "sel";
                    if (state?.loop > 0)
                        obj.title = s + " (" + state.loopIdx + "/" + state.loop + ")";

                }

                this.skbuttons[idx] = obj;
                ++idx;
            }
        }
        protected refreshTimeline(data: any, state: any): void {
            let idx: number = 0, sk: any, obj: any;
            for (let s in data) {
                sk = data[s];
                obj = { title: sk?.name, name: sk?.name, data: sk, i: Number(s), state: "reg" };
                if (state?.active && idx === state?.index)
                    obj.state = "sel";

                this.skbuttons[idx] = obj;
                ++idx;
            }

            obj = { title: "", name: "", data: { type: "inf" }, i: idx, state: "reg" };
            if (state?.active) {
                if (state?.loop > 0) {
                    obj.title = "(" + state.loopIdx + "/" + state.loop + ")";
                    obj.data.type = "seq";
                }
            }
            this.skbuttons[idx] = obj;
            ++idx;
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
                    bt.state = "reg";
                }
                else {
                    bt.ic.icon = this.getIcon(sk?.data?.type, sk?.data?.data);
                    bt.tx.textContent = sk?.title;
                    bt.state = sk.state;
                }
            }
        }
    }

}

customElements.define('conx-timelines', conx.cards.SoftkeysTimelines);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-timelines',
    name: 'conx-timelines',
    description: 'Timelines',
});