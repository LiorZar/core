import { HTMLSvgElement } from "./svg.js"
import { SVGGroup, SVGText, SVGStyle, SVGRect } from "./svgutils.js"

class ConxButton extends HTMLSvgElement {
    constructor() {
        super()
        // this.id = "conx-button"
        this.isClicked = false
        this.addParams({
            background: "#919191",
            clickColor: "blue",
            title: "Button",
        });
        this.connectItems();
    }

    connectItems() {
        this.enablePointer()

        this.elButton = this.getChild(`btn`)
        this.elBg = this.getChild(`btn-bg`)
        this.elGFrame = this.getChild(`btn-g`)
        this.elTitle = this.getChild(`btn-title`)

        this.setParams(this.params)
    }

    setParams(params) {
        if (params.title) this.params.title = params.title
        if (params.background) this.params.background = params.background
        if (params.clickColor) this.params.clickColor = params.clickColor

        this.update();
    }

    getParams() {
        return this.params;
    }

    createSVG() {
        // Create SVGs
        let w = this.parentElement.clientWidth
        let h = this.parentElement.clientHeight

        let g_comp = SVGGroup({ id: `btn-g` })
        let r_bg = SVGRect({x: 0, y: 0, rx: 10, ry: 10, width: "100%", height: "100%", style: { stroke: "black", strokeWidth: "5px" }, id: `btn-bg`})
        let t_title = SVGText({x: "50%", y: "50%", style: { dominantBaseline: "middle", fill: "white", textAnchor: "middle", fontSize: `${Math.min(w / 10, h / 3)}px` }, id: `btn-title`})
        // Grouping
        g_comp.appendChild(r_bg)
        g_comp.appendChild(t_title)

        this.svg.append(g_comp)
        this.svg.id = `btn`
        this.svg.setAttribute("width", "100%")
        this.svg.setAttribute("height", "100%")

        return this.svg
    }

    update() {
        let style
        let w = this.parentElement.clientWidth
        let h = this.parentElement.clientHeight

        if (this.isClicked)
            style = { fill: `${this.params.clickColor}`, stroke: "black", strokeWidth: "5px" }
        else
            style = { fill: `${this.params.background}`, stroke: "black", strokeWidth: "5px" }
        this.elBg.setAttribute("style", SVGStyle(style))

        style = { dominantBaseline: "middle", fill: "white", textAnchor: "middle", fontSize: `${Math.min(w / 10, h / 3)}px` }
        this.elTitle.setAttribute("style", SVGStyle(style))
        this.elTitle.textContent = this.params.title
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
