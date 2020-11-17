import { HTMLSvgElement } from "./svg.js"
import { SVGRect, SVGGroup, SVGText, SVGStyle } from "./svgutils.js"

class ConxSlider extends HTMLSvgElement {
    constructor() {
        super()
        this.id = this.id || "conx-slider";
        this.movable = false;
        this.slideLength = -1;
        this._val = 0;
        this.addParams({
            align: 0, // 0 for horizontal, 1 for vertical
            width: "100%",
            height: "100%",
            isShowPercent: true,
            value: 30,
            frame: "black",
            background: "#919191",
            fill: "red",
            title: "L i g h t"
        });

        this.connectItems();
    }

    connectItems() {
        this.enablePointer()

        this.elSlider = this.getChild(`${this.id}-slider`)
        this.elFrame = this.getChild(`${this.id}-slider-frame`)
        this.elGFrame = this.getChild(`${this.id}-slider-g`)
        this.elBarTotal = this.getChild(`${this.id}-slider-bar-total`)
        this.elBarProgress = this.getChild(`${this.id}-slider-bar-progress`)
        this.elTitle = this.getChild(`${this.id}-slider-title`)

        this.setParams(this.params)
    }

    setParams(params) {
        if (params.align != undefined) this.params.align = params.align
        if (params.width != undefined) this.params.width = params.width
        if (params.height != undefined) this.params.height = params.height
        if (params.value != undefined) this.params.value = params.value
        if (params.isShowPercent != undefined) this.params.isShowPercent = params.isShowPercent
        if (params.title) this.params.title = params.title
        if (params.fill) this.params.fill = params.fill
        if (params.background) this.params.background = params.background
        if (params.frame) this.params.frame = params.frame

        this._val = this.params.value / 100
        this.slideLength = 390

        this.update();
    }

    getParams() {
        return this.params;
    }

    createSVG() {
        // Create SVGs
        let g_frame = SVGGroup({ id: `${this.id}-slider-g` })
        let r_frame = SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "none", stroke: "black", strokeWidth: "5px" }, id: `${this.id}-slider-frame` })
        let r_barTotal = SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "#919191" }, id: `${this.id}-slider-bar-total` })
        let r_barProgress = SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "red" }, id: `${this.id}-slider-bar-progress` })
        let t_title = SVGText({ x: "50%", y: "51.5%", style: { fill: "white", textAnchor: "middle", fontSize: "20px" }, id: `${this.id}-slider-title` })

        // Grouping
        g_frame.appendChild(r_barTotal)
        g_frame.appendChild(r_barProgress)
        g_frame.appendChild(t_title)
        g_frame.appendChild(r_frame)

        this.svg.id = `${this.id}-slider`
        this.svg.append(g_frame)
        return this.svg
    }

    update() {
        if (this.params.align == 0) {
            this.elSlider.setAttribute("width", this.params.width)
            this.elSlider.setAttribute("height", this.params.height)
            this.elTitle.setAttribute("style", SVGStyle({ fill: "white", textAnchor: "middle", fontSize: "20px" }))
            this.elBarProgress.setAttribute("style", SVGStyle({ fill: this.params.fill }))
        }
        else {
            this.elSlider.setAttribute("width", this.params.height)
            this.elSlider.setAttribute("height", this.params.width)
            this.elTitle.setAttribute("style", SVGStyle({ fill: "white", textAnchor: "middle", fontSize: "20px", transformOrigin: "50% 50%", transform: "rotate(-90deg)" }))
            this.elBarProgress.setAttribute("style", SVGStyle({ fill: this.params.fill, transform: "rotate(180deg) translate(-100%, -100%)" }))
        }

        this.elFrame.setAttribute("style", SVGStyle({ fill: "none", stroke: this.params.frame, strokeWidth: "5px" }))
        this.elBarTotal.setAttribute("style", SVGStyle({ fill: this.params.background }))

        let length,
            rect = this.elBarTotal.getBoundingClientRect()

        if (this.params.align == 0) {
            length = rect.width
        } else {
            length = rect.height
        }
        if (this._val > 1)
            this._val = 1
        else if (this._val < 0)
            this._val = 0

        let offset = this._val * 100
        let textPercent = Math.floor(this._val * 100)
        if (this.params.isShowPercent)
            this.elTitle.textContent = this.params.title + " " + textPercent + '%'
        else
            this.elTitle.textContent = this.params.title
        if (this.params.align == 0) {
            this.elBarProgress.setAttribute("width", "" + offset + "%")
            this.elBarProgress.setAttribute("height", "100%")
        }
        else {
            this.elBarProgress.setAttribute("height", "" + offset + "%")
            this.elBarProgress.setAttribute("width", "100%")
        }
    }

    onPointer(e, type) {
        //super.onPointer(e,type);
        switch (type) {
            case "down":
                this.movable = true
                break
            case "move":
                if (!this.movable) return;
                this._pval = this._val;
                let rect = this.elBarTotal.getBoundingClientRect()
                if (this.params.align == 0)
                    this._val = (this._touchX - rect.left) / rect.width
                else
                    this._val = (rect.bottom - this._touchY) / rect.height
                this.update()
                if (this.onChange)
                    this.onChange(this.id, this._val, this._pval);
                break
            case "up":
                this.movable = false
                break
            default:
                break
        }
    }
}

customElements.define("conx-slider", ConxSlider);
