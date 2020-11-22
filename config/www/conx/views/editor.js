import { glo } from "../cons/glo.js"

class ConxEditorPanel extends HTMLElement {
    constructor(){
        super();
        glo.trace( "Xx")
    }
    set panel(config) {
        glo.trace("viewConfig", config, this.config);
        this.config = config;
        if (!this.main) {
            if (!this.cards)
                this.innerHTML = `<div style="width: 100%; height: 100%; background-color: lightblue;" />`;
            else
            {
                let str = `${this.cards.map((card) => `<div>${card}</div>`)}`;
                glo.trace( "sr", str)
                //this.innerHTML = str;
            }    
        }
    }
    create(){
        this.innerHTML = `<div style="width: 100%; height: 100%;background-color: lightblue;" />`;
    }
    set hass(hass) {
        this._hass = hass;
        glo.trace("hass", hass)
    }
    
    static get properties() {
        return {
            hass: { type: Object },
            narrow: { type: Boolean },
            route: { type: Object },
            panel: { type: Object },
        };
    }

}


customElements.define('conx-editor-panel', ConxEditorPanel);
