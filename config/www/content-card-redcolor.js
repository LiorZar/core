import "./conx.js";
import { glo } from "./conx/glo.js"

class ContentCardExample extends HTMLElement {
    set hass(hass) {
        this._hass = hass;
        this.state = hass.states[this.entity];
        if (!this.main)
            return;

        this.updateState();
    }

    updateState() {
        //glo.trace(this.state);

        if (!this.state || !this.main)
            return;
        this.main.setParams({ value: this.state.attributes.brightness / 2.55 });
    }

    connectedCallback() {
        this.innerHTML = `<<ha-card><conx-slider id="main" params='{}' /></<ha-card>`;
        this.main = glo.getChild(this, "main");
        this.main.onChange = this.onChange.bind(this);
        glo.trace("connectedCallback", this.innerHTML, this.main);
        this.updateState();
    }
    onChange(id, val, pval) {
        //glo.trace("onChange", id, val, pval, this._hass.connection.sendMessagePromise);
        if (val > 0.5 && pval < 0.5)
            this._hass.connection.sendMessage({
                type: "conx/GET"
            });
        this._hass.callService("light", "turn_on", {
            entity_id: this.state.entity_id,
            brightness: Math.floor(val * 255)
        });
    }

    setConfig(config) {
        glo.trace("config", config);
        if (!config.entity) {
            throw new Error('You need to define an entity');
        }
        this.config = config;
        this.entity = config.entity;
    }

    getCardSize() {
        return 10;
    }

    static get properties() {
        return {
            config: Object,
            state: String
        }
    }

}

customElements.define('content-card-redcolor', ContentCardExample);
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'content-card-redcolor',
    name: 'Content card redcolor',
    description: 'Control Red',
});