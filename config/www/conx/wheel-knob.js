import { HTMLSvgElement } from "./svg.js"
import { GetAngle, SVGPath, SVGCircle, SVGGroup, SVGText, SVGStyle, SVGArc } from "./svgutils.js"

class ConxWheelKnob extends HTMLSvgElement {
    constructor() {
        super()
        // this.id = "conx-wheel-knob"
        this.movable = false
        this.slideLength = -1
        this._val = 0;
        this.addParams({
            isShowPercent: true,
            value: 30,
            frame: "#919191",
            background: "#919191",
            fill: "red",
            title: "Light",
            pheight: 40
        });
        this.connectItems();
    }

    connectItems() {
        this.enablePointer()

        this.elSlider = this.getChild(`${this.id}-slider`)
        this.elFrame = this.getChild(`${this.id}-slider-frame`)
        this.elGFrame = this.getChild(`${this.id}-slider-g`)
        this.elTotal = this.getChild(`${this.id}-slider-bar-total`)
        this.elTotal1 = this.getChild(`${this.id}-slider-bar-total1`)
        this.elProgress = this.getChild(`${this.id}-slider-bar-progress`)
        this.elTitle = this.getChild(`${this.id}-slider-title`)
        this.setParams(this.params)
    }

    setParams(params) {
        if (params.value != undefined) this.params.value = params.value
        if (params.isShowPercent != undefined) this.params.isShowPercent = params.isShowPercent
        if (params.title) this.params.title = params.title
        if (params.fill) this.params.fill = params.fill
        if (params.background) this.params.background = params.background
        if (params.frame) this.params.frame = params.frame
        if (params.pheight) this.params.pheight = params.pheight

        this._val = this.params.value / 100
        this.slideLength = 300
        this.update();
    }

    getParams() {
        return this.params;
    }

    createSVG() {
        let w = this.parentElement.clientWidth
        let h = this.parentElement.clientHeight
        let cx = w / 2, cy = h / 2
        // t1 → start angle, in radian.
        // delta → angle to sweep, in radian. positive.
        // fai → rotation on the whole, in radian.
        let delta = 300, t1 = 120, fai = 0
        // Create SVGs
        let g_frame = SVGGroup({ id: `${this.id}-slider-g` })
        let r_frame = SVGCircle({
            cx: cx, cy: cy, r: w / 2 - 1,
            style: { stroke: "black", strokeWidth: "2px" },
            id: `${this.id}-slider-frame`
        })
        let arc_params = SVGArc({
            cx: cx, cy: cy,
            rx: (w - 50) / 2 - 2,
            ry: (w - 50) / 2 - 2,
            t1: t1, DELTA: delta, FAI: fai
        })
        let r_barTotal = SVGPath({
            d: arc_params.join(" "),
            style: { fill: "none" },
            id: `${this.id}-slider-bar-total`
        })

        let arc_params3 = SVGArc({
            cx: cx, cy: cy,
            rx: (w - 50) / 2 - 3,
            ry: (w - 50) / 2 - 3,
            t1: t1 - 0.75, DELTA: delta + 1.5, FAI: fai
        })
        let r_barTotal2 = SVGPath({
            d: arc_params3.join(" "),
            style: { fill: "none", stroke: "black" },
            id: `${this.id}-slider-bar-total1`
        })

        let arc_params2 = SVGArc({
            cx: cx, cy: cy,
            rx: (w - 50) / 2 - 2,
            ry: (w - 50) / 2 - 2,
            t1: t1, DELTA: delta, FAI: fai
        })
        let r_barProgress = SVGPath({
            d: arc_params2.join(" "),
            style: { fill: "none" },
            id: `${this.id}-slider-bar-progress`
        })

        let t_title = SVGText({
            x: "50%", y: "51.5%",
            style: { fill: "white", textAnchor: "middle", fontSize: `${w / 10}px` },
            id: `${this.id}-slider-title`
        })
        // Grouping
        g_frame.appendChild(r_frame)
        g_frame.appendChild(r_barTotal2)
        g_frame.appendChild(r_barTotal)
        g_frame.appendChild(r_barProgress)
        g_frame.appendChild(t_title)

        this.svg.append(g_frame)
        this.svg.id = `${this.id}-slider`
        this.svg.setAttribute("width", "100%")
        this.svg.setAttribute("height", "100%")

        return this.svg
    }

    update() {
        let w = this.parentElement.clientWidth
        let h = this.parentElement.clientHeight
        let cx = w / 2, cy = h / 2
        let delta = 300, t1 = 120, fai = 0
        let style

        if (this._val > 1)
            this._val = 1
        else if (this._val < 0)
            this._val = 0

        let offset = (1 - this._val) * 300
        let textPercent = Math.floor(this._val * 100)
        if (this.params.isShowPercent)
            this.elTitle.textContent = this.params.title + " " + textPercent + '%'
        else
            this.elTitle.textContent = this.params.title

        let arc_params = SVGArc({
            cx: cx, cy: cy,
            rx: (w - this.params.pheight) / 2 - 2,
            ry: (w - this.params.pheight) / 2 - 2,
            t1: t1, DELTA: delta, FAI: fai
        })
        this.elTotal.setAttribute("d", arc_params.join(" "))

        let arc_params3 = SVGArc({
            cx: cx, cy: cy,
            rx: (w - this.params.pheight) / 2 - 3,
            ry: (w - this.params.pheight) / 2 - 3,
            t1: t1 - 0.75, DELTA: delta + 1.5, FAI: fai
        })
        this.elTotal1.setAttribute("d", arc_params3.join(" "))

        style = SVGStyle({ fill: `${this.params.background}`, stroke: "black", strokeWidth: "2px" })
        this.elFrame.setAttribute("style", style)
        style = SVGStyle({ fill: "none", stroke: `${this.params.frame}`, strokeWidth: "" + this.params.pheight + "px" })
        this.elTotal.setAttribute("style", style)
        style = SVGStyle({ fill: "none", stroke: "black", strokeWidth: "" + (this.params.pheight + 2) + "px" })
        this.elTotal1.setAttribute("style", style)

        let arc_params2 = SVGArc({
            cx: cx, cy: cy,
            rx: (w - this.params.pheight) / 2 - 2,
            ry: (w - this.params.pheight) / 2 - 2,
            t1: t1, DELTA: delta - offset, FAI: fai
        })
        this.elProgress.setAttribute("d", arc_params2.join(" "))
        style = SVGStyle({ fill: "none", stroke: `${this.params.fill}`, strokeWidth: "" + this.params.pheight + "px" })
        this.elProgress.setAttribute("style", style)
    }

    onPointer(e, type) {
        //super.onPointer(e,type);
        switch (type) {
            case "down":
                this.movable = true
                break
            case "move":
                if (!this.movable) return;
                let w = this.parentElement.clientWidth
                let h = this.parentElement.clientHeight
                let cx = w / 2, cy = h / 2
                let angle = GetAngle(cx, cy, this._touchX, this._touchY);
                angle = (angle * 180 / Math.PI + 270) % 360
                angle = (360 - angle + 60) % 360
                if (angle > 330 && angle < 360) angle = 0
                if (angle > 300 && angle <= 330) angle = 300
                this._val = (300 - angle) / 300
                this.update()
                break
            case "up":
                this.movable = false
                break
            default:
                break
        }
    }
}

customElements.define("conx-wheel-knob", ConxWheelKnob)
