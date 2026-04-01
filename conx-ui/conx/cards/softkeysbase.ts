/// <reference path="../controls/button.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class SoftkeysBase extends HACard {
        protected activeState: string = "";
        protected skdata: any = {}
        protected tsStates: any = {}
        protected skbuttons: any[] = []
        protected cmdRoot: any = {}
        protected cols: number = 5;
        protected rows: number = 5;
        protected startIndex: number = 0;
        protected viewCount: number = 25;
        protected MAX_TOTAL_SKS: number = 512;


        protected readData(state: string): void {
        }

        protected checkPath(state: string): boolean {
            return false;
        }

        protected updateState(check: boolean): boolean {
            if (!this.root || !this.connected)
                return false;

            if (false === this.hasStateChanged("conx.db_change"))
                return false;

            let state: any = this._hass.states["conx.db_change"];
            if (!state)
                return false;

            if (false === this.checkPath(state.state))
                return false;

            this.readData(state.state);

            return true;
        }

        protected getIcon(type: string, data: any = undefined): string {
            switch (type) {
                case "rename": return "mdi:rename-box";
                case "alias": return "mdi:camera-switch-outline";
                case "add": return "mdi:tooltip-plus-outline";
                case "up": return "mdi:arrow-up-bold";
                case "inf": return "mdi:infinity";
                case "seq": return "mdi:view-sequential-outline";
                case "left": return "mdi:arrow-left-bold";
                case "right": return "mdi:arrow-right-bold";
                case "folder": return "mdi:folder";
                case "delete": return "mdi:delete";
                case "group": return "mdi:lightbulb-group";
                case "light": return "mdi:lightning-bolt";
                case "cueplay": return "mdi:play-box";
                case "timelinestart": return "mdi:play-circle-outline";
                case "timelinestop": return "mdi:stop-circle-outline";
                case "timelinego": return "mdi:skip-next-circle-outline";
                case "edit": return "mdi:pencil";
                case "script":
                    if (!data || !data?.domain || !data?.service)
                        return "mdi:script-outline";
                    let scr: string = data.domain + "." + data.service;
                    switch (scr) {
                        case "conx.light": return "mdi:lightning-bolt";
                        case "conx.cueplay": return "mdi:play-box";
                        case "conx.cuestore": return "mdi:content-save-outline";
                        case "conx.timelinestart": return "mdi:play-circle-outline";
                        case "conx.timelinestop": return "mdi:stop-circle-outline";
                        case "conx.timelinego": return "mdi:skip-next-circle-outline";
                        default: return "mdi:map-marker-question";
                    }
            }
            return "";
        }

        protected setActiveState(v: string): void {
            this.activeState = v;
            for (let s in this.cmdRoot)
                this.cmdRoot[s].state = "reg";;

            if (this.cmdRoot[v])
                this.cmdRoot[v].state = "sel";
        }
    }

}
