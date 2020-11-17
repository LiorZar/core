import { HTMLSvgElement } from "./svg.js"
import { SVGGroup, SVGText, SVGStyle, SVGRect } from "./svgutils.js"

class ConxToggle extends HTMLSvgElement {
    constructor() {
        super()
        // this.id = "conx-toggle"
        this.isOn = false
        this.addParams({
            backgroundOn: "#4BC065",
            backgroundOff: "#c4c4c4",
            frameOn: "white",
            frameOff: "#E5E5E5",
            isOn: true
        });
        this.connectItems();
    }

    connectItems() {
        this.enablePointer()

        this.elButton = this.getChild(`${this.id}-toggle`)
        this.elBg = this.getChild(`${this.id}-toggle-bg`)
        this.elFrame = this.getChild(`${this.id}-toggle-frame`)
        this.elGFrame = this.getChild(`${this.id}-toggle-g`)
        this.elText = this.getChild(`${this.id}-toggle-text`)
        this.elStyle = this.getChild(`${this.id}-toggle-style`)

        this.setParams(this.params)
    }

    setParams(params) {
        if (params.backgroundOn) this.params.backgroundOn = params.backgroundOn
        if (params.backgroundOff) this.params.backgroundOff = params.backgroundOff
        if (params.frameOn) this.params.frameOn = params.frameOn
        if (params.frameOff) this.params.frameOff = params.frameOff
        if (params.isOn) this.params.isOn = params.isOn

        this.update();
    }

    getParams() {
        return this.params;
    }

    createSVG() {
        // Create SVGs
        let w = this.parentElement.clientWidth
        let h = this.parentElement.clientHeight

        let g_comp = SVGGroup({ id: `${this.id}-toggle-g` })
        let r_bg = SVGRect({
            x: 3, y: 0, rx: `${h / 2}`, ry: `${h / 2}`,
            width: w - 6, height: h,
            style: { strokeWidth: "5px", stroke: "black" },
            id: `${this.id}-toggle-bg`
        })

        let r_frame = SVGRect({
            x: 8, y: 5, rx: (h - 10) / 2, ry: (h - 10) / 2,
            width: h - 10, height: h - 10,
            style: { strokeWidth: "5px", stroke: "black" },
            id: `${this.id}-toggle-frame`
        })
        let r_text = SVGText({
            x: h / 2 + 3, y: h / 2,
            style: { dominantBaseline: "middle", fill: "black", textAnchor: "middle", fontSize: `${Math.min(w / 10, h / 3)}px` },
            id: `${this.id}-toggle-text`
        })

        // Grouping
        g_comp.appendChild(r_bg)
        g_comp.appendChild(r_frame)
        g_comp.appendChild(r_text)
        this.svg.append(g_comp)
        this.svg.id = `${this.id}-toggle`
        this.svg.setAttribute("width", "100%")
        this.svg.setAttribute("height", "100%")

        let style = document.createElement('style');
        style.id = `${this.id}-toggle-style`
        style.setAttribute("type", "text/css");
        this.svg.appendChild(style);

        return this.svg
    }

    update() {
        let w = this.parentElement.clientWidth
        let h = this.parentElement.clientHeight
        this.elStyle.innerHTML = `
            .${this.id}-move-on-frame {
                animation-name: ${this.id}-move-on-anim-frame;
                animation-duration: 1s;
                animation-iteration-count: 1;
                animation-fill-mode: forwards;
                transform-origin: 50% 50%;
            }
            @keyframes ${this.id}-move-on-anim-frame {
                from { transform: translate(0, 0); fill: ${this.params.frameOff}}
                to   { transform: translate(${w - h - 6}px, 0); fill: ${this.params.frameOn}}
            }
            .${this.id}-move-on-text {
                animation-name: ${this.id}-move-on-anim-text;
                animation-duration: 1s;
                animation-iteration-count: 1;
                animation-fill-mode: forwards;
                transform-origin: 50% 50%;
            }
            @keyframes ${this.id}-move-on-anim-text {
                from { transform: translate(0, 0);}
                to   { transform: translate(${w - h - 6}px, 0);}
            }
            .${this.id}-color-on-background {
                animation-name: ${this.id}-color-change-on-background;
                animation-duration: 1s;
                animation-iteration-count: 1;
                animation-fill-mode: forwards;
            }
            @keyframes ${this.id}-color-change-on-background {
                from { fill: ${this.params.backgroundOff} }
                to   { fill: ${this.params.backgroundOn} }
            }
            .${this.id}-move-off-frame {
                animation-name: ${this.id}-move-off-anim-frame;
                animation-duration: 1s;
                animation-iteration-count: 1;
                animation-fill-mode: forwards;
                transform-origin: 50% 50%;
            }
            @keyframes ${this.id}-move-off-anim-frame {
                from { transform: translate(${w - h - 6}px, 0); fill: ${this.params.frameOn}}
                to   { transform: translate(0, 0); fill: ${this.params.frameOff}}
            }
            .${this.id}-move-off-text {
                animation-name: ${this.id}-move-off-anim-text;
                animation-duration: 1s;
                animation-iteration-count: 1;
                animation-fill-mode: forwards;
                transform-origin: 50% 50%;
            }
            @keyframes ${this.id}-move-off-anim-text {
                from { transform: translate(${w - h - 6}px, 0);}
                to   { transform: translate(0, 0);}
            }
            .${this.id}-color-off-background {
                animation-name: ${this.id}-color-change-off-background;
                animation-duration: 1s;
                animation-iteration-count: 1;
                animation-fill-mode: forwards;
            }
            @keyframes ${this.id}-color-change-off-background {
                from { fill: ${this.params.backgroundOn} }
                to   { fill: ${this.params.backgroundOff} }
            }
        `
        if (this.params.isOn) {
            this.elText.setAttribute("class", `${this.id}-move-on-text`)
            this.elFrame.setAttribute("class", `${this.id}-move-on-frame`)
            this.elBg.setAttribute("class", `${this.id}-color-on-background`)
            this.elText.textContent = "ON"
        }
        else {
            this.elText.setAttribute("class", `${this.id}-move-off-text`)
            this.elFrame.setAttribute("class", `${this.id}-move-off-frame`)
            this.elBg.setAttribute("class", `${this.id}-color-off-background`)
            this.elText.textContent = "OFF"
        }
    }

    onPointer(e, type) {
        //super.onPointer(e,type);
        switch (type) {
            case "down":
                // this.update()
                break
            case "move":
                break
            case "up":
                this.params.isOn = !this.params.isOn
                this.update()
                break
            default:
                break
        }
    }
}

customElements.define("conx-toggle", ConxToggle)
