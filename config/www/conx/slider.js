import { HTMLSvgElement } from "./svg.js"
import { SVGRect, SVGGroup, SVGText, SVGStyle } from "./svgutils.js"

class ConxSlider extends HTMLSvgElement
{
    constructor() 
    {
        super()
        this.id     = "slider-bar-"+Date.now()
        this.movable= false
        this.slideLength = -1
        this._val = 0;
        this.config = {
            align: 0, // 0 for horizontal, 1 for vertical
            width: "100%",
            height: "100%",
            isShowPercent: true,
            value: 30,
            frame: "black",
            background: "#919191",
            fill: "red",
            title: "L i g h t"
        }
    }

    connectedCallback() 
    {
        let ind = this.getAttribute("ind")
        let align = this.getAttribute("align")
        let width = this.getAttribute("width")
        let height = this.getAttribute("height")

        if(ind) this.id = "slider-bar-"+ind
        if(align) this.config.align = align
        if(width) this.config.width = width
        if(height) this.config.height = height

        super.connectedCallback()
        this.enablePointer()

        this.elSlider     = document.getElementById(`${this.id}-slider`)
        this.elFrame      = document.getElementById(`${this.id}-slider-frame`)
        this.elGFrame     = document.getElementById(`${this.id}-slider-g`)
        this.elBarTotal   = document.getElementById(`${this.id}-slider-bar-total`)
        this.elBarProgress= document.getElementById(`${this.id}-slider-bar-progress`)
        this.elTitle      = document.getElementById(`${this.id}-slider-title`)

        this.setConfig(this.config)
    }

    setConfig(config)
    {
        if(config.align != undefined) this.config.align = config.align
        if(config.width != undefined) this.config.width = config.width
        if(config.height != undefined) this.config.height = config.height
        if(config.value != undefined) this.config.value = config.value
        if(config.isShowPercent != undefined) this.config.isShowPercent = config.isShowPercent
        if(config.title) this.config.title = config.title
        if(config.fill) this.config.fill = config.fill
        if(config.background) this.config.background = config.background
        if(config.frame) this.config.frame = config.frame

        this._val = this.config.value / 100
        this.slideLength  = 390        

        this.update();
    }

    getConfig()
    {
        return this.config;
    }

    renderSVG()
    {
        // Create SVGs
        let g_frame       = SVGGroup({id: `${this.id}-slider-g`})
        let r_frame       = SVGRect({x:"0",y:"0",width:"100%",height:"100%",style:{fill:"none", stroke:"black", strokeWidth:"5px"}, id: `${this.id}-slider-frame`})
        let r_barTotal    = SVGRect({x:"0",y:"0",width:"100%",height:"100%",style:{fill:"#919191"}, id:`${this.id}-slider-bar-total`})
        let r_barProgress = SVGRect({x:"0",y:"0",width:"100%",height:"100%",style:{fill:"red"}, id:`${this.id}-slider-bar-progress`})
        let t_title       = SVGText({x:"50%",y:"51.5%",style:{fill:"white",textAnchor:"middle",fontSize:"20px"}, id: `${this.id}-slider-title`})

        // Grouping
        g_frame.appendChild(r_barTotal)
        g_frame.appendChild(r_barProgress)
        g_frame.appendChild(t_title)
        g_frame.appendChild(r_frame)

        this.svg.id = `${this.id}-slider`

        if(this.config.align == 0)
        {
            this.svg.setAttribute("width", this.config.width)
            this.svg.setAttribute("height", this.config.height)
            t_title.setAttribute("style", SVGStyle({fill:"white",textAnchor:"middle",fontSize:"20px"}))
            r_barProgress.setAttribute("style", SVGStyle({fill:"red", transform: ""}))
            this.svg.append(g_frame)    
        }
        else
        {
            this.svg.setAttribute("width", this.config.width)
            this.svg.setAttribute("height", this.config.height)
            t_title.setAttribute("style", SVGStyle({fill:"white",textAnchor:"middle",fontSize:"20px", transformOrigin:"50% 50%", transform:"rotate(-90deg)"}))
            r_barProgress.setAttribute("style", SVGStyle({fill:"red", transform: "rotate(180deg) translate(-100%, -100%)"}))
            this.svg.append(g_frame)
        }
    
        return this.svg
    }

    update()
    {
        if(this.config.align == 0)
        {
            this.elSlider.setAttribute("width", this.config.width)
            this.elSlider.setAttribute("height", this.config.height)
            this.elTitle.setAttribute("style", SVGStyle({fill:"white",textAnchor:"middle",fontSize:"20px"}))
            this.elBarProgress.setAttribute("style", SVGStyle({fill:this.config.fill}))
        }
        else
        {
            this.elSlider.setAttribute("width", this.config.height)
            this.elSlider.setAttribute("height", this.config.width)
            this.elTitle.setAttribute("style", SVGStyle({fill:"white",textAnchor:"middle",fontSize:"20px", transformOrigin:"50% 50%", transform:"rotate(-90deg)"}))
            this.elBarProgress.setAttribute("style", SVGStyle({fill:this.config.fill, transform:"rotate(180deg) translate(-100%, -100%)"}))
        }

        this.elFrame.setAttribute("style", SVGStyle({fill:"none", stroke:this.config.frame, strokeWidth:"5px"}))
        this.elBarTotal.setAttribute("style", SVGStyle({fill:this.config.background}))

        let length, 
            rect = this.elBarTotal.getBoundingClientRect()
            
        if(this.config.align == 0){
            length = rect.width
        }else{
            length = rect.height
        }
        if(this._val > 1)
            this._val = 1
        else if(this._val < 0)
            this._val = 0
        
        let offset = this._val * 100
        let textPercent = Math.floor(this._val*100)
        if(this.config.isShowPercent)
            this.elTitle.textContent = this.config.title + " " + textPercent+'%'
        else
            this.elTitle.textContent = this.config.title
        if(this.config.align == 0)
        {
            this.elBarProgress.setAttribute("width", ""+offset+"%")
            this.elBarProgress.setAttribute("height", "100%")
        }
        else 
        {
            this.elBarProgress.setAttribute("height", ""+offset+"%")
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
                if(!this.movable) return;
                let rect      = this.elBarTotal.getBoundingClientRect()
                if(this.config.align == 0)
                    this._val = (this._touchX - rect.left)/rect.width
                else
                    this._val = (rect.bottom - this._touchY)/rect.height
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

customElements.define("conx-slider", ConxSlider);
