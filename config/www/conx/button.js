import { HTMLSvgElement } from "./svg.js"
import { SVGGroup, SVGText, SVGStyle, SVGRect } from "./svgutils.js"

class ConxButton extends HTMLSvgElement
{
    constructor()
    {
        super()
        this.id     = "btn-"+Date.now()
        this.isClicked= false
        this.config = {
            background: "#919191",
            clickColor: "blue",
            title: "Button",
        }
    }

    connectedCallback() 
    {

        super.connectedCallback()
        this.enablePointer()

        this.elButton   = document.getElementById(`${this.id}-btn`)
        this.elBg    = document.getElementById(`${this.id}-btn-bg`)
        this.elGFrame   = document.getElementById(`${this.id}-btn-g`)
        this.elTitle    = document.getElementById(`${this.id}-btn-title`)

        this.setConfig(this.config)
    }

    setConfig(config)
    {
        if(config.title) this.config.title = config.title
        if(config.background) this.config.background = config.background
        if(config.clickColor) this.config.clickColor = config.clickColor

        this.update();
    }

    getConfig()
    {
        return this.config;
    }

    renderSVG()
    {
        // Create SVGs
        let w = this.parentElement.clientWidth
        let h = this.parentElement.clientHeight

        let g_comp = SVGGroup({id: `${this.id}-btn-g`})
        let r_bg = SVGRect({
            x:0, y:0, rx:10, ry: 10,
            width: "100%", height: "100%",
            style:{fill:`${this.config.background}`, stroke:"black", strokeWidth:"5px"}, 
            id: `${this.id}-btn-bg`
        })
        let t_title = SVGText({
            x:"50%",y:"50%", 
            style:{dominantBaseline:"middle", fill:"white",textAnchor:"middle",fontSize:`${Math.min(w/10, h/3)}px`}, 
            id: `${this.id}-btn-title`
        })
        t_title.textContent = this.config.title
        // Grouping
        g_comp.appendChild(r_bg)
        g_comp.appendChild(t_title)

        this.svg.append(g_comp)
        this.svg.id = `${this.id}-btn`
        this.svg.setAttribute("width", "100%")
        this.svg.setAttribute("height", "100%")

        return this.svg
    }

    update()
    {
        let style
        let w = this.parentElement.clientWidth
        let h = this.parentElement.clientHeight

        if(this.isClicked)
            style = {fill:`${this.config.clickColor}`, stroke:"black", strokeWidth:"5px"}
        else
            style = {fill:`${this.config.background}`, stroke:"black", strokeWidth:"5px"}
        this.elBg.setAttribute("style", SVGStyle(style))

        style = {dominantBaseline:"middle", fill:"white",textAnchor:"middle",fontSize:`${Math.min(w/10, h/3)}px`}
        this.elTitle.setAttribute("style", SVGStyle(style))
        this.elTitle.textContent = this.config.title
    }

    onPointer(e, type) {
        //super.onPointer(e,type);
        switch (type) {
            case "down":
                this.isClicked = true
                this.update()
                break
            case "move":
                break
            case "up":
                this.isClicked = false
                this.update()
                break
            default:
                break
        }
    }
}

customElements.define("conx-button", ConxButton)
