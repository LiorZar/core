import { HTMLSvgElement } from "./svg.js"

class ConxVertical extends HTMLSvgElement
{
    constructor() 
    {
        super()
        this.id     = "conv-vertical-"+Date.now()
    }

    connectedCallback() 
    {
        // super.connectedCallback()
        setTimeout( () => {
            this.innerHTML = `<div style="display:flex; flex-direction: column">
                    ${this.innerHTML}
                </div>
            ` 
        })
    }

    setConfig()
    {
    }

    getConfig()
    {
    }

    renderSVG()
    {
    }

    update()
    {
    }

    onPointer(e, type) {
    }
}

customElements.define("conx-vertical", ConxVertical);
