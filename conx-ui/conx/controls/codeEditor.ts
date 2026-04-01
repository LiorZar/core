/// <reference path="../glo.ts" /> 

async function loadCodeMirror(callback: () => void) {
    const wnd = conx.glo.wnd;
    if (!wnd?.codeMirrorState) {
        wnd.codeMirrorState = "loading";
        let script = document.createElement('script');
        script.src = window.location.origin + "/local/codemirror.min.js";
        script.async = false;
        document.body.append(script);
        for (let i: number = 0; i < 10; ++i) {
            if (wnd.__codemirror_css) {
                wnd.codeMirrorState = "loaded";
                callback();
                break;
            }
            await conx.glo.wait(500);
        }
        if (wnd.codeMirrorState !== "loaded")
            console.log("Failed to Load Code Mirror");
    }
}

namespace conx {
    export class CodeEditor extends HTMLElement {
        protected active: boolean = false;
        protected modal: HTMLElement;
        protected holder: ShadowRoot;
        protected code: string;
        protected codemirror: any;
        protected save: any;
        protected cancel: any;

        private callerCmd: any;
        private callerCallback: (cmd: any, data: any) => void;

        constructor() {
            super();

            this.innerHTML =
                `<link rel="stylesheet" href="/local/conx.css?v=1">
                <div id="modal" style="display:none; position:fixed; inset:0; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); z-index:2147483647;">
                    <div class="yaml-editor" style="width:min(900px,90vw); max-height:85vh; background:#000; color:#fff; border-radius:12px; box-shadow:0 10px 32px rgba(0,0,0,0.5); overflow:hidden; display:flex; flex-direction:column;">
                        <div id="holder" style="flex:1; overflow:auto; padding:12px 16px; background:#111; min-height:200px;"></div>
                        <div class="actions" style="display:flex; gap:8px; justify-content:flex-end; padding:12px 16px; border-top:1px solid rgba(255,255,255,0.08);">
                            <button class="conx-button-silver" id="save">Save</button>
                            <button class="conx-button-silver" id="cancel">Cancel</button>
                        </div>
                    </div>
                </div>`;

            const holder: HTMLElement = glo.findChild(this, "holder");
            this.holder = holder.attachShadow({ mode: "open" });
            this.onCodeMirrorLoaded = this.onCodeMirrorLoaded.bind(this);
            //this.initCodeMirror(shadowRoot);

            this.modal = glo.findChild(this, "modal");
            this.save = glo.findChild(this, "save");
            this.cancel = glo.findChild(this, "cancel");
            this.onclick = this._onClick;
        }
        protected connectedCallback(): void {
            this.active = this.codemirror !== undefined;
        }

        protected disconnectedCallback(): void {
            this.active = false;
        }

        public showYAML(data: any, cmd: any, callback: (cmd: any, data: any) => void): void {
            this.callerCmd = cmd;
            this.callerCallback = callback;
            this.showCode(glo.yaml.dump(data));
        }

        public showCode(code: string): void {
            this.code = code;
            this.checkCodeMirror();
            if (false === this.active)
                return;

            this.codemirror.setValue(code);
            this.show = true;
        }

        public get show(): boolean {
            return this.modal.style.display === "flex";
        }

        public set show(v: boolean) {
            if (false === this.active)
                return;

            if (false === v) {
                this.modal.style.display = "none";
                return;
            }

            this.modal.style.display = "flex";
            this.codemirror.refresh();
            this.codemirror.focus();
        }

        protected _onClick = (event: any) => {
            if (event.target === this.cancel) {
                this.show = false;
                this.clean();
                return;
            }
            if (event.target !== this.modal && event.target !== this.save)
                return;

            this.show = false;
            const val = this.codemirror.getValue();
            const code = glo.yaml.load(val);
            if (undefined !== this.callerCmd && this.callerCallback && code)
                this.callerCallback(this.callerCmd, code);
            this.clean();
        }

        protected clean(): void {
            this.callerCmd = undefined;
            this.callerCallback = undefined;
            this.codemirror.setValue("");
        }

        protected checkCodeMirror(): boolean {
            if (this.active)
                return true;

            if (!glo.wnd.__codemirror_css) {
                if (glo.wnd.codeMirrorState)
                    return false;

                loadCodeMirror(this.onCodeMirrorLoaded);
                if (!glo.wnd.__codemirror_css)
                    return false;
            }
            this.initCodeMirror();
            this.active = this.codemirror !== undefined;

            return this.active;
        }

        protected onCodeMirrorLoaded(): void {
            if (!glo.wnd.__codemirror_css)
                return;

            this.initCodeMirror();
            this.active = this.codemirror !== undefined;
            if (false === this.active)
                return;

            this.codemirror.setValue(this.code);
            this.show = true;
        }

        protected initCodeMirror(): void {
            this.holder!.innerHTML = `
            <style>${glo.wnd.__codemirror_css}</style>`;

            this.codemirror = glo.wnd.CodeMirror(this.holder, {
                value: "",
                lineNumbers: true,
                lineWrapping: true,
                matchBrackets: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                tabSize: 2,
                mode: "yaml",
                autofocus: true,
                viewportMargin: Infinity,
                extraKeys: {
                    Tab: "indentMore",
                    "Shift-Tab": "indentLess",
                    "Ctrl-Q": (cm: any) => cm.foldCode(cm.getCursor()),
                    "Ctrl-Y": (cm: any) => glo.wnd.CodeMirror.commands.foldAll(cm),
                    "Ctrl-I": (cm: any) => glo.wnd.CodeMirror.commands.unfoldAll(cm),
                },
            });
        }
    }
}

customElements.define('conx-code-editor', conx.CodeEditor);
