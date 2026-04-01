
namespace conx.cards {
    export function fireEvent(node: HTMLElement, type: string, detail: any) {
        node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
    }

    export class HACardEditor extends HTMLElement {
        public hass?: any;
        public lovelace?: any;
        public setConfig(_config: any): void {
        };
    }
    customElements.define('conx-card-editor', conx.cards.HACardEditor);

    export class HACard extends HTMLElement {
        static statesIdx: number = -1;
        static statelessCards: { [guid: string]: HACard } = {};
        static statelessStates: { [id: string]: any } = {};

        protected gid: string = glo.GID;
        protected guid: string = glo.Guid();
        protected phass: any = {};
        protected _hass: any;
        protected cfg: any = {};
        protected config: any;
        protected css: any;
        protected html: any;
        protected pidx: number[] = [];
        protected nidx: number[] = [];
        protected ptates: any[] = [];
        protected states: any[] = [];
        protected entities: string[] = [];
        protected root: any;
        protected connected: boolean = false;
        protected timestamp: number = 0;
        protected timeCheckDelta: number = 500;
        protected dimmerColor: number[] = [1, 1, 0];
        protected throttles: any = {}

        protected create(): void {
            if (this.cfg.dimmerColor)
                this.dimmerColor = this.cfg.dimmerColor.split(",");
            if (this.dimmerColor.length < 3)
                this.dimmerColor = [1, 1, 0];
        }
        public static getConfigElement(): any {
            return document.createElement('conx-card-editor');
        }
        protected copyCfg(): void {
            if (!this.config)
                return;
            this.cfg = JSON.parse(JSON.stringify(this.config));
            const lib = this.cfg?.lib;
            const params = this.cfg?.params;
            if (!lib)
                return;
            delete this.cfg.lib;
            if (params) delete this.cfg.params;
            let yaml = glo.lib?.[lib];
            if (!yaml)
                return;
            if (params)
                yaml = glo.fixParams(yaml, params);

            glo.fixByYAML(this.cfg, yaml);
        }
        protected postCreate(): void {
            if (undefined !== this.css)
                glo.updateCSS(this.root, this.css);
            if (undefined !== this.html)
                glo.update(this.root, this.html);
        }
        protected updateState(check: boolean): boolean {
            if (!this.root || !this.connected || this.entities.length <= 0 || !this.state)
                return false;
            if (check && false === this.checkStateChanged(0))
                return false;
            if (check && this.guid === this.state?.attributes.lc)
                return false;
            //if (check && (glo.time - this.timestamp) < this.timeCheckDelta)                return false;

            return true;
        }
        protected get _style(): string {
            let s = "";
            if (this.cfg?.style)
                s += ` ${this.cfg?.style};`;
            if (this.cfg?.width)
                s += ` width: ${this.cfg?.width};`;
            if (this.cfg?.height)
                s += ` height: ${this.cfg?.height};`;
            return s;
        }
        public get isAdmin(): boolean { return (true === this?.hass?.user?.is_admin); }
        public get hass(): any { return this._hass; }
        public set hass(hass: any) {
            this.phass = this._hass;
            this._hass = hass;
            for (let i: number = 0; i < this.entities.length; ++i) {
                this.pidx[i] = this.nidx[i];
                this.ptates[i] = this.states[i];
                this.states[i] = HACard.statelessStates[this.entities[i]] || hass.states[this.entities[i]];
                this.nidx[i] = this.states[i]?.u;
            }
            if (undefined === this.root) {
                this.create();
                this.postCreate();
                this.registerStateless();
            }

            this.updateState(true);
            this.checkStateless();
        }
        protected checkStateless(): void {
            if (this.phass?.states?.["conx.states_idx"] === this._hass?.states?.["conx.states_idx"])
                return;

            let state: any = this._hass.states["conx.states_idx"];
            if (!state)
                return;

            let idx: number = Number(state.state);
            //console.log("idx", idx, HACard.statesIdx);
            if (idx <= 3)
                HACard.statesIdx = idx - 1;
            if (idx <= HACard.statesIdx)
                return;

            HACard.statesIdx = idx;
            HACard.requestStates(this._hass);
        }

        protected registerStateless(): void {
            for (let i: number = 0; i < this.entities.length; ++i) {
                if (this.states[i] && this.states[i]?.attributes?.sl)
                    HACard.registedCard(this);
            }
        }
        static registedCard(card: HACard): void {
            this.statelessCards[card.guid] = card;
        }
        static unregistedCard(card: HACard) {
            delete this.statelessCards[card.guid];
        }
        static onStatesMsg(hass: any, cmd: string, unq: string, payload: any, success: boolean): void {
            if (unq !== "states" || false === success)
                return;
            for (let id in payload) {
                HACard.statelessStates[id] = payload[id];
            }
            for (let guid in this.statelessCards) {
                this.statelessCards[guid].hass = this.statelessCards[guid]._hass;
            }
        }
        static requestStates(hass: any): void {
            hass.connection.sendMessagePromise({
                type: 'conx.cmd',
                cmd: 'db.getStates',
                unq: 'states',
                data: {}
            }).then(
                (respond: any) => {
                    this.onStatesMsg(hass, respond.cmd, respond.unq, respond.payload, undefined === respond.error)
                },
                (respond: any) => {
                    this.onStatesMsg(hass, respond.cmd, respond.unq, respond.payload, false)
                }
            );
        }

        protected get codeEditorInnerHTML(): string {
            if (true === this.isAdmin)
                return `<conx-code-editor id="editor"></conx-code-editor>`;
            return ``;
        }
        protected connectedCallback(): void {
            this.connected = true;
            this.updateState(false);
        }

        protected disconnectedCallback(): void {
            this.connected = false;
        }

        protected onNewConfig(config: any): void {

        }

        protected setConfig(config: any): void {
            if (this.config)
                this.onNewConfig(config);
            this.config = config;
            this.copyCfg();
            if (undefined !== this.cfg?.css) {
                if (typeof (this.cfg?.css) === "string")
                    this.css = JSON.parse(glo.fixOrigin(this.cfg.css));
                else
                    this.css = this.cfg.css;
            }
            if (undefined !== this.cfg?.html && typeof (this.cfg?.html) === "string")
                this.html = JSON.parse(this.cfg.html);
            this.entities = glo.ParseSelection(config.entity);
            this.pidx.length = this.entities.length;
            this.nidx.length = this.entities.length;
            this.ptates.length = this.entities.length;
            this.states.length = this.entities.length;
            if (undefined !== this.root)
                this.postCreate();
        }

        protected get state(): any {
            if (this.states.length > 0)
                return this.states[0];
            return undefined;
        }

        protected stateToColor(state: any): number[] {
            if (!state)
                return null;

            const O: number = glo.clamp(glo.isNaN(state.attributes?.opacity, 1.0), 0.0, 1.0);
            let A: number = glo.isNaN(state.attributes?.brightness / 255.0, 1.0), R: number = this.dimmerColor[0], G: number = this.dimmerColor[1], B: number = this.dimmerColor[2], H = 0, S = 0;
            if (!!state.attributes?.rgb_color) {
                R = glo.isNaN(state.attributes?.rgb_color?.[0] / 255.0, 1.0);
                G = glo.isNaN(state.attributes?.rgb_color?.[1] / 255.0, 1.0);
                B = glo.isNaN(state.attributes?.rgb_color?.[2] / 255.0, 1.0);
            }
            if (!!state.attributes?.hs_color) {
                H = glo.isNaN(state.attributes?.hs_color?.[0] / 360.0, 1.0);
                S = glo.isNaN(state.attributes?.hs_color?.[1] / 100.0, 1.0);
            }

            if ("on" !== state?.state) {
                A = glo.isNaN(state.attributes?.brightness / 255.0, 0.0);
                R = 0;
                G = 0;
                B = 0;
            }
            return [R, G, B, A, O, H, S];
        }

        protected colorToState(rgba: number[]): void {
            const state = this.state;
            if (!state)
                return;

            state.attributes.brightness = rgba[3] * 255.0;
            if (!!state.attributes?.rgb_color) {
                state.attributes.rgb_color[0] = rgba[0] * 255.0;
                state.attributes.rgb_color[1] = rgba[1] * 255.0;
                state.attributes.rgb_color[2] = rgba[2] * 255.0;
            }
            state.state = (rgba[3] <= 0) ? "off" : "on";
        }

        protected checkStateChanged(idx: number): boolean {
            if (this.ptates?.[idx] !== this.states?.[idx])
                return true;
            if (!this.states?.[idx]?.attributes?.sl)
                return false;
            return this.nidx?.[idx] > this.pidx?.[idx];
        }

        protected hasStateChanged(entity: string): boolean {
            return this.phass?.states?.[entity] !== this._hass?.states?.[entity];
        }

        protected stampChange(): void {
            this.timestamp = glo.time;
        }

        protected stampClear(): void {
            this.timestamp = -this.timeCheckDelta;
        }

        protected CallService(domain: string, service: string, data: any): void {
            this._hass.callService(domain, service, data);
            this.stampChange();
        }

        protected ConxLight(cmd: string, data: any): void {
            data.lc = this.guid;
            if (!cmd) {
                this.CallService("conx", "light", data);
                return;
            }
            let t = this.throttles[cmd];
            if (!t?.wait) {
                this.Throttle(cmd);
                this.CallService("conx", "light", data);
            }
            else
                t.data = data;
        }

        protected Throttle(cmd: string): void {
            let t = this.throttles[cmd];
            if (!t)
                t = this.throttles[cmd] = { throttle: 125 };
            t.wait = true;
            t.data = null;
            t.timeoutId = setTimeout(() => {
                if (t.data) {
                    this.CallService("conx", "light", t.data);
                    t.data = null;
                    this.Throttle(cmd);
                }
                else
                    t.wait = false;
            }, t.throttle);
        }

        protected GetConnections(unq: string): void {
            this.conx(unq, "db.GetConnections", {});
        }

        protected Get(unq: string, path: string, create: boolean = false): void {
            this.conx(unq, "db.Get", { path: path, create: create });
        }

        protected Set(unq: string, path: string, value: any, create: boolean = false, override: boolean = true): void {
            this.conx(unq, "db.Set", { path: path, value: value, create: create, override: override });
            this.stampChange();
        }

        protected Rename(unq: string, path: string, name: any): void {
            this.conx(unq, "db.Rename", { path: path, name: name });
            this.stampChange();
        }

        protected Del(unq: string, path: string): void {
            this.conx(unq, "db.Del", { path: path });
            this.stampChange();
        }

        protected conx(unq: string, cmd: string, data: any): void {
            this._hass.connection.sendMessagePromise({
                type: 'conx.cmd',
                cmd: cmd,
                unq: unq,
                data: data
            }).then(
                (respond: any) => {
                    this.onConxMsg(respond.cmd, respond.unq, respond.payload, undefined === respond.error)
                },
                (respond: any) => {
                    this.onConxMsg(respond.cmd, respond.unq, respond.payload, false)
                }
            );
        }

        protected onConxMsg(cmd: string, unq: string, payload: any, success: boolean): void {
        }

        static get properties() {
            return {
                config: Object,
                state: String
            }
        }

    }


}

