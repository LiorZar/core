import { HTMLSvgElement } from "./svg.js"

class ConxHorizontal extends HTMLSvgElement
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
            this.innerHTML = `<div style="display:flex; flex-direction: row;">
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

customElements.define("conx-horizontal", ConxHorizontal);
