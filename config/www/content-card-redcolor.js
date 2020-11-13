import "./conx.js";
import { HTMLSvgElement } from "./conx/svg.js"

class ContentCardRedColor extends HTMLSvgElement  {
    constructor() {
        super();
        
    }
	
	setConfig(config) {
		this._config = config;

		if (!config.entity) {
		  throw Error('No entity defined')
		}
		

		this._card_height = config.card_height ? config.card_height : '200px';

	  }

	set hass(hass) {
		if (!hass)
		  return
		  
		this._hass = hass;

		var entityState = this._hass.states[this._config.entity].state
		if (entityState != this.state) {
		  this.state = entityState; // This triggers _render since LitElement support two way binding
		}
	  }

	  static get properties() {
		return {
		  hass: Object,
		  config: Object,
		  state: String
		}
	  }

	  getCardSize() {
		return 5;
	  }

	connectedCallback() {
		this.innerHTML = `<conx-slider />`;
		console.log(this.innerHTML);
	  }
}

customElements.define('content-card-redcolor', ContentCardRedColor);
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'content-card-redcolor',
    name: 'Content card redcolor',
    description: 'Control Red',
});
