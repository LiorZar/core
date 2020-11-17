import "./conx.js";
import { glo } from "./conx/glo.js"

class ContentCardExample extends HTMLElement {
    set hass(hass) {
        this._hass = hass;
        this.state = hass.states[this.entity];

        if (!this.main) {
            this.innerHTML = `<div style="width: 100px; height: 500px"><conx-slider id="main" params='{"align":1}' /></div>`;
            this.main = glo.getChild(this, "main");
            this.main.onChange = this.onChange.bind(this);
            glo.trace("connectedCallback", this.innerHTML, this.main);
        }
        
        this.updateState();
    }

    updateState() {
        //glo.trace(this.state);

        if (!this.connected || !this.state || !this.main)
            return;
        this.main.setParams({ value: this.state.attributes.brightness / 2.55 });
    }

    connectedCallback() {
        this.connected = true;
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
        if (!config.entity) {
            throw new Error('You need to define an entity');
        }
        glo.trace("config", config);
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


/*
class ContentCardExample extends HTMLElement {
    constructor() {
      super();  
    }
   
    
    
    set hass(hass) {
  
      if (!this.content) {
        this._timestamp = 0;
        let card = document.createElement('ha-card');
        this.content = document.createElement('div');
        
        this.content.style.height = '100%';
        this.content.style.width = '100%';
  
        card.appendChild(this.content);
        this.appendChild(card);
      }
  
      var date = new Date();
      var timestamp = date.getTime();
      
      if(timestamp - this._timestamp > this._refresh){
        this._timestamp = timestamp;
      
      this.content.innerHTML = `
          <iframe src="https://cumta.morhaviv.com/systems/app/chrome/showRecent.php?id=${parseInt(timestamp / 1000)}" width="100%" height="1000px"></iframe>
      `;
      }
      
      
      // this.content.style.textContent = `
      
      // `;
     
      
      
    }
    
   
    setConfig(config) {
      this._refresh = 5000
      if(config.refresh){
        this._refresh = config.refresh * 1000
      }
      
    }
    getCardSize() {
      return 2;
    }
  }
*/
customElements.define('content-card-redcolor', ContentCardExample);
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'content-card-redcolor',
    name: 'Content card redcolor',
    description: 'Control Red',
});
