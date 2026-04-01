/// <reference path="HACard.ts" />

namespace conx.cards {
    export class NameEditor extends HTMLElement {
        public hass: any;
        private _config: any = {};
        private _root: ShadowRoot;

        constructor() {
            super();
            this._root = this.attachShadow({ mode: "open" });
        }

        setConfig(config: any) {
            this._config = { ...config };
            this._render();
        }

        connectedCallback() {
            this._render();
        }

        private _onInput = (ev: Event) => {
            const value = (ev.target as HTMLInputElement).value;
            const newConfig = { ...this._config, name: value };
            this._config = newConfig;
            fireEvent(this, "config-changed", { config: newConfig });
        };

        private _render() {
            this._root.innerHTML = `
      <style>
        .row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 0;
        }
        label { width: 60px; }
        input {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
        }
      </style>
      <div class="row">
        <label>Name</label>
        <input type="text" value="${this._config.name ?? ""}" placeholder="Enter name">
      </div>
    `;
            const input = this._root.querySelector("input");
            if (input) {
                input.removeEventListener("blur", this._onInput);
                input.addEventListener("blur", this._onInput);
            }
        }
    }
}

customElements.define("name-editor", conx.cards.NameEditor);

