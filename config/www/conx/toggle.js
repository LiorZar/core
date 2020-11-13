import { HTMLSvgElement } from "./svg.js"
import { SVGGroup, SVGText, SVGStyle, SVGRect } from "./svgutils.js"

class ConxToggle extends HTMLSvgElement
{
    constructor()
    {
        super()
        this.id     = "btn-"+Date.now()
        this.isOn = false
        this.config = {
            backgroundOn: "#4BC065",
            backgroundOff: "#c4c4c4",
            frameOn: "white",
            frameOff: "#E5E5E5",
            isOn: true
        }
    }

    connectedCallback() 
    {

        super.connectedCallback()
        this.enablePointer()

        this.elButton   = document.getElementById(`${this.id}-toggle`)
        this.elBg       = document.getElementById(`${this.id}-toggle-bg`)
        this.elFrame    = document.getElementById(`${this.id}-toggle-frame`)
        this.elGFrame   = document.getElementById(`${this.id}-toggle-g`)
        this.elText     = document.getElementById(`${this.id}-toggle-text`)
        this.elStyle    = document.getElementById(`${this.id}-toggle-style`)

        this.setConfig(this.config)
    }

    setConfig(config)
    {
        if(config.backgroundOn) this.config.backgroundOn = config.backgroundOn
        if(config.backgroundOff) this.config.backgroundOff = config.backgroundOff
        if(config.frameOn) this.config.frameOn = config.frameOn
        if(config.frameOff) this.config.frameOff = config.frameOff
        if(config.isOn) this.config.isOn = config.isOn

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

        let g_comp = SVGGroup({id: `${this.id}-toggle-g`})
        let r_bg = SVGRect({
            x:3, y:0, rx:`${h/2}`, ry: `${h/2}`,
            width: w-6, height: h,
            style:{fill:`${this.config.backgroundOff}`, strokeWidth:"5px", stroke:"black"}, 
            id: `${this.id}-toggle-bg`
        })

        let r_frame = SVGRect({
            x:8, y:5, rx: (h-10)/2, ry: (h-10)/2,
            width: h-10, height: h-10,
            style:{fill:`${this.config.frameOff}`, strokeWidth:"5px", stroke:"black"}, 
            id: `${this.id}-toggle-frame`
        })
        let r_text  = SVGText({
            x: h/2+3, y: h/2,
            style:{dominantBaseline:"middle", fill:"black",textAnchor:"middle",fontSize:`${Math.min(w/10, h/3)}px`}, 
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
     
        if(this.config.isOn)
        {
            r_text.setAttribute("class", `${this.id}-move-on-text`)
            r_frame.setAttribute("class", `${this.id}-move-on-frame`)
            r_bg.setAttribute("class", `${this.id}-color-on-background`)
            r_text.textContent = "ON"    
        }
        else
        {
            r_text.setAttribute("class", `${this.id}-move-off-text`)
            r_frame.setAttribute("class", `${this.id}-move-off-frame`)
            r_bg.setAttribute("class", `${this.id}-color-off-background`)
            r_text.textContent = "OFF"
        }
        return this.svg
    }

    update()
    {
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
                from { transform: translate(0, 0); fill: ${this.config.frameOff}}
                to   { transform: translate(${w-h-6}px, 0); fill: ${this.config.frameOn}}
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
                to   { transform: translate(${w-h-6}px, 0);}
            }
            .${this.id}-color-on-background {
                animation-name: ${this.id}-color-change-on-background;
                animation-duration: 1s;
                animation-iteration-count: 1;
                animation-fill-mode: forwards;
            }
            @keyframes ${this.id}-color-change-on-background {
                from { fill: ${this.config.backgroundOff} }
                to   { fill: ${this.config.backgroundOn} }
            }
            .${this.id}-move-off-frame {
                animation-name: ${this.id}-move-off-anim-frame;
                animation-duration: 1s;
                animation-iteration-count: 1;
                animation-fill-mode: forwards;
                transform-origin: 50% 50%;
            }
            @keyframes ${this.id}-move-off-anim-frame {
                from { transform: translate(${w-h-6}px, 0); fill: ${this.config.frameOn}}
                to   { transform: translate(0, 0); fill: ${this.config.frameOff}}
            }
            .${this.id}-move-off-text {
                animation-name: ${this.id}-move-off-anim-text;
                animation-duration: 1s;
                animation-iteration-count: 1;
                animation-fill-mode: forwards;
                transform-origin: 50% 50%;
            }
            @keyframes ${this.id}-move-off-anim-text {
                from { transform: translate(${w-h-6}px, 0);}
                to   { transform: translate(0, 0);}
            }
            .${this.id}-color-off-background {
                animation-name: ${this.id}-color-change-off-background;
                animation-duration: 1s;
                animation-iteration-count: 1;
                animation-fill-mode: forwards;
            }
            @keyframes ${this.id}-color-change-off-background {
                from { fill: ${this.config.backgroundOn} }
                to   { fill: ${this.config.backgroundOff} }
            }
        `
        if(this.config.isOn)
        {
            this.elText.setAttribute("class", `${this.id}-move-on-text`)
            this.elFrame.setAttribute("class", `${this.id}-move-on-frame`)
            this.elBg.setAttribute("class", `${this.id}-color-on-background`)
            this.elText.textContent = "ON"    
        }
        else
        {
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
                this.config.isOn = !this.config.isOn
                this.update()
                break
            default:
                break
        }
    }
}

customElements.define("conx-toggle", ConxToggle)
