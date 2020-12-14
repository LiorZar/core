"use strict";
var conx;
(function (conx) {
    class glo {
        static get wnd() {
            return window;
        }
        static get time() {
            return (new Date).getTime();
        }
        static getChild(node, id) {
            if (node.id == id)
                return node;
            let len = node.children.length, res;
            for (let i = 0; i < len; ++i) {
                res = this.getChild(node.children[i], id);
                if (null !== res)
                    return res;
            }
            return null;
        }
        static clamp(val, minVal, maxVal) {
            return Math.max(minVal, Math.min(maxVal, val));
        }
        static JSON(data) {
            if (!!data)
                return JSON.parse(data);
            return {};
        }
        static copy(dst, src, override) {
            for (let a in src) {
                if (override || undefined === dst[a]) {
                    if (typeof src[a] === "object") {
                        if (undefined === dst[a])
                            dst[a] = {};
                        this.copy(dst[a], src[a], override);
                    }
                    else
                        dst[a] = src[a];
                }
            }
        }
        static attributesToObject(_atts) {
            let atts = Array.prototype.slice.call(_atts);
            let res = {};
            for (let i in atts) {
                if ("locals" == atts[i].name || "params" == atts[i].name)
                    continue;
                res[atts[i].name] = atts[i].value;
            }
            return res;
        }
        static rgbToHex(r, g, b) {
            r = Math.floor(r * 255), g = Math.floor(g * 255), b = Math.floor(b * 255);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        static HSVtoRGB(h, s, v) {
            let r, g, b, i, f, p, q, t;
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0:
                    r = v, g = t, b = p;
                    break;
                case 1:
                    r = q, g = v, b = p;
                    break;
                case 2:
                    r = p, g = v, b = t;
                    break;
                case 3:
                    r = p, g = q, b = v;
                    break;
                case 4:
                    r = t, g = p, b = v;
                    break;
                case 5:
                    r = v, g = p, b = q;
                    break;
            }
            return [r, g, b];
        }
        static RGBtoHSV(r, g, b) {
            r = Math.floor(r * 255), g = Math.floor(g * 255), b = Math.floor(b * 255);
            let max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, h, s = (max === 0 ? 0 : d / max), v = max / 255;
            switch (max) {
                case min:
                    h = 0;
                    break;
                case r:
                    h = (g - b) + d * (g < b ? 6 : 0);
                    h /= 6 * d;
                    break;
                case g:
                    h = (b - r) + d * 2;
                    h /= 6 * d;
                    break;
                case b:
                    h = (r - g) + d * 4;
                    h /= 6 * d;
                    break;
            }
            return [h, s, v];
        }
        static HSVtoHEX(h, s, v) {
            let rgb = this.HSVtoRGB(h, s, v);
            return this.rgbToHex(rgb[0], rgb[1], rgb[2]);
        }
        static RGBAtoHEX(r, g, b, a) {
            let hsv = this.RGBtoHSV(r, g, b);
            hsv[2] = a;
            let rgb = this.HSVtoRGB(hsv[0], hsv[1], hsv[2]);
            return this.rgbToHex(rgb[0], rgb[1], rgb[2]);
        }
        static trace(...args) {
            console.log.apply(null, args);
        }
    }
    conx.glo = glo;
})(conx || (conx = {}));
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class utils {
        }
        utils.ns = "http://www.w3.org/2000/svg";
        utils.Style = (props) => {
            let combinedString = [];
            for (let k in props) {
                let v = props[k];
                k = k.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
                combinedString.push(`${k}:${v}`);
            }
            return combinedString.join(";");
        };
        utils.SVGGroup = (props) => {
            let g = document.createElementNS(utils.ns, "g");
            g.id = props.id;
            return g;
        };
        utils.SVGRect = (props) => {
            let rect = document.createElementNS(utils.ns, "rect");
            let x, y, rx, ry, width, height, style;
            x = (props.x) ? props.x : 0;
            y = (props.y) ? props.y : 0;
            rx = (props.rx) ? props.rx : 0;
            ry = (props.ry) ? props.ry : 0;
            width = (props.width) ? props.width : "100%";
            height = (props.height) ? props.height : "100%";
            style = (props.style) ? utils.Style(props.style) : "";
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("rx", rx);
            rect.setAttribute("ry", ry);
            rect.setAttribute("width", width);
            rect.setAttribute("height", height);
            rect.setAttribute("style", style);
            if (props.id)
                rect.id = props.id;
            return rect;
        };
        utils.SVGImage = (props) => {
            let img = document.createElementNS(utils.ns, "image");
            let x, y, width, height, style, visibility, preserveAspectRatio;
            x = (props.x) ? props.x : 0;
            y = (props.y) ? props.y : 0;
            width = (props.width) ? props.width : "100%";
            height = (props.height) ? props.height : "100%";
            style = (props.style) ? utils.Style(props.style) : "";
            visibility = (props.visibility) ? props.visibility : "hidden";
            preserveAspectRatio = (props.preserveAspectRatio) ? props.preserveAspectRatio : "none";
            img.setAttribute("x", x);
            img.setAttribute("y", y);
            img.setAttribute("width", width);
            img.setAttribute("height", height);
            img.setAttribute("style", style);
            img.setAttribute("visibility", visibility);
            img.setAttribute("preserveAspectRatio", preserveAspectRatio);
            img.setAttribute("href", "");
            if (props.id)
                img.id = props.id;
            return img;
        };
        utils.SVGText = (props) => {
            let text = document.createElementNS(utils.ns, "text");
            let x, y, style, width, height, content;
            x = (props.x) ? props.x : 0;
            y = (props.y) ? props.y : 0;
            width = (props.width) ? props.width : "100%";
            height = (props.height) ? props.height : "100%";
            style = (props.style) ? utils.Style(props.style) : "";
            content = (props.text) ? props.text : "";
            text.setAttribute("x", x);
            text.setAttribute("y", y);
            text.setAttribute("style", style);
            text.setAttribute("width", width);
            text.setAttribute("height", height);
            text.textContent = content;
            if (props.id)
                text.id = props.id;
            return text;
        };
        utils.SVGPath = (props) => {
            let path = document.createElementNS(utils.ns, "path");
            path.setAttribute("d", props.d);
            path.setAttribute("style", utils.Style(props.style));
            path.id = props.id;
            return path;
        };
        utils.SVGCircle = (props) => {
            let circle = document.createElementNS(utils.ns, "circle");
            circle.id = props.id;
            circle.setAttribute("cx", props.cx);
            circle.setAttribute("cy", props.cy);
            circle.setAttribute("r", props.r);
            circle.setAttribute("style", utils.Style(props.style));
            return circle;
        };
        utils.SVGArc = (props) => {
            const cos = Math.cos;
            const sin = Math.sin;
            const PI = Math.PI;
            const f_matrix_times = ((A, B) => [A[0][0] * B[0] + A[0][1] * B[1], A[1][0] * B[0] + A[1][1] * B[1]]);
            const f_rotate_matrix = ((x) => {
                const cosx = cos(x);
                const sinx = sin(x);
                return [[cosx, -sinx], [sinx, cosx]];
            });
            const f_vec_add = ((A, B) => [A[0] + B[0], A[1] + B[1]]);
            const f_svg_ellipse_arc = ((C, R, D, fai) => {
                D[1] = D[1] % (2 * PI);
                const rotMatrix = f_rotate_matrix(fai);
                const [sX, sY] = (f_vec_add(f_matrix_times(rotMatrix, [R[0] * cos(D[0]), R[1] * sin(D[0])]), [C[0], C[1]]));
                const [eX, eY] = (f_vec_add(f_matrix_times(rotMatrix, [R[0] * cos(D[0] + D[1]), R[1] * sin(D[0] + D[1])]), [C[0], C[1]]));
                const fA = ((D[1] > PI) ? 1 : 0);
                const fS = ((D[1] > 0) ? 1 : 0);
                return [" M ", sX, " ", sY, " A ", R[0], R[1], fai / PI * 180, fA, fS, eX, eY];
            });
            let params = f_svg_ellipse_arc([props.cx, props.cy], [props.rx, props.ry], [props.t1 * PI / 180, props.DELTA * PI / 180], props.FAI * PI / 180);
            return params;
        };
        // Calculate angle between two vector
        utils.GetAngle = (x1, y1, x2, y2) => {
            let distY = (y2 - y1);
            let distX = (x2 - x1);
            let dist = Math.sqrt((distY * distY) + (distX * distX));
            let val, aSine;
            if (distY <= 0) {
                val = distX / dist;
                aSine = Math.asin(val);
            }
            else {
                val = distX / dist;
                aSine = -1 * Math.PI - Math.asin(val);
            }
            return aSine;
        };
        controls.utils = utils;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
/// <reference path="../glo.ts" />
/// <reference path="utils.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class Element extends HTMLElement {
            constructor() {
                super();
                this.connected = false;
                this.locals = {};
                this.params = { root: {} };
                this._onMousedown = this._onMousedown.bind(this);
                this._onMousemove = this._onMousemove.bind(this);
                this._onMouseup = this._onMouseup.bind(this);
                this._onPointerdown = this._onPointerdown.bind(this);
                this._onPointermove = this._onPointermove.bind(this);
                this._onPointerup = this._onPointerup.bind(this);
                this._onTouchend = this._onTouchend.bind(this);
                this._onTouchmove = this._onTouchmove.bind(this);
                this._onTouchstart = this._onTouchstart.bind(this);
                this.createChildren();
                this.connectItems();
            }
            onPointer(e, type) {
                conx.glo.trace("onPointer", e, type, this._touchX, this._touchY);
            }
            postConnected() {
                this.connected = true;
                this.clientRect = this.root.getBoundingClientRect();
                //glo.trace("postConnected", this.id, this.clientRect);
            }
            connectedCallback() {
                this.copyData(this.locals, conx.glo.JSON(this.getAttribute("locals")));
                this.copyData(this.params, conx.glo.JSON(this.getAttribute("params")));
                this.copyData(this.params.root, conx.glo.attributesToObject(this.attributes));
                this.update();
                this.appendChild(this.root);
                setTimeout(this.postConnected.bind(this), 0);
            }
            disconnectedCallback() {
                this.connected = false;
                this.removeChild(this.root);
            }
            copyData(dst, src, override = true) {
                conx.glo.copy(dst, src, override);
            }
            update(atts = undefined) {
                atts = atts || this.params;
                if (!atts)
                    return;
                let child, _this = this, childAtts;
                for (let childId in atts) {
                    child = _this[childId];
                    childAtts = atts[childId];
                    for (let att in childAtts) {
                        if ("style" !== att) {
                            if ("visibility" == att)
                                child.setAttribute(att, childAtts[att]);
                            else {
                                if (child.hasAttribute(att))
                                    child.setAttribute(att, childAtts[att]);
                                else if (undefined !== child[att])
                                    child[att] = childAtts[att];
                            }
                        }
                        else
                            child.setAttribute("style", controls.utils.Style(childAtts[att]));
                    }
                }
            }
            getChild(id) {
                return conx.glo.getChild(this.root, id);
            }
            connectItems() {
            }
            createChildren() {
            }
            enablePointer() {
                this.root.addEventListener("touchstart", this._onTouchstart);
                this.root.addEventListener("mousedown", this._onMousedown);
                if ("PointerEvent" in window)
                    this.root.addEventListener("pointerdown", this._onPointerdown);
            }
            _onPointerdown(e) {
                e.preventDefault();
                this._touchX = e.clientX;
                this._touchY = e.clientY;
                this.setPointerCapture(e.pointerId);
                this.addEventListener("pointermove", this._onPointermove);
                this.addEventListener("pointerup", this._onPointerup);
                this.addEventListener("pointercancel", this._onPointerup);
                this.onPointer(e, "down");
            }
            _onPointermove(e) {
                e.preventDefault();
                this._touchX = e.clientX;
                this._touchY = e.clientY;
                this.onPointer(e, "move");
            }
            _onPointerup(e) {
                e.preventDefault();
                this.releasePointerCapture(e.pointerId);
                this.removeEventListener("pointermove", this._onPointermove);
                this.removeEventListener("pointerup", this._onPointerup);
                this.removeEventListener("pointercancel", this._onPointerup);
                this.onPointer(e, "up");
            }
            _onMousedown(e) {
                this._touchX = e.clientX;
                this._touchY = e.clientY;
                document.addEventListener("mousemove", this._onMousemove);
                document.addEventListener("mouseup", this._onMouseup);
                this.onPointer(e, "down");
            }
            _onMousemove(e) {
                e.preventDefault();
                this._touchX = e.clientX;
                this._touchY = e.clientY;
                this.onPointer(e, "move");
            }
            _onMouseup(e) {
                e.preventDefault();
                document.removeEventListener("mousemove", this._onMousemove);
                document.removeEventListener("mouseup", this._onMouseup);
                this.onPointer(e, "up");
            }
            _onTouchstart(e) {
                e.preventDefault();
                this._touchX = e.changedTouches[0].clientX;
                this._touchY = e.changedTouches[0].clientY;
                this.addEventListener("touchmove", this._onTouchmove);
                this.addEventListener("touchend", this._onTouchend);
                this.addEventListener("touchcancel", this._onTouchend);
                this.onPointer(e, "down");
            }
            _onTouchmove(e) {
                e.preventDefault();
                this._touchX = e.targetTouches[0].clientX;
                this._touchY = e.targetTouches[0].clientY;
                this.onPointer(e, "move");
            }
            _onTouchend(e) {
                e.preventDefault();
                this.removeEventListener("touchmove", this._onTouchmove);
                this.removeEventListener("touchend", this._onTouchend);
                this.removeEventListener("touchcancel", this._onTouchend);
                this.onPointer(e, "up");
            }
        }
        controls.Element = Element;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
/// <reference path="elm.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class Svg extends controls.Element {
            constructor() {
                super();
            }
            createChildren() {
                super.createChildren();
                this.svg = document.createElementNS(controls.utils.ns, "svg");
                this.svg.setAttribute("width", "100%");
                this.svg.setAttribute("height", "100%");
                this.root = this.svg;
            }
        }
        controls.Svg = Svg;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
/// <reference path="svg.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class Slider extends controls.Svg {
            constructor() {
                super();
                this.movable = false;
                this.slideLength = -1;
                this._val = 0;
                this.copyData(this.locals, {
                    align: 0,
                    percent: true,
                    thumb: 0,
                    title: "Slider"
                });
                this.copyData(this.params, {
                    bg: {
                        style: {
                            fill: "#919191",
                        }
                    },
                    frame: {
                        style: {
                            fill: "none",
                            stroke: "black",
                            strokeWidth: "5px"
                        }
                    },
                    progress: {
                        style: {
                            fill: "red"
                        },
                        width: "100%",
                        height: "100%",
                        visibility: "visible"
                    },
                    thumb: {
                        visibility: "visible"
                    },
                    text: {
                        style: {
                            dominantBaseline: "middle",
                            fill: "white",
                            textAnchor: "middle",
                            fontSize: "20px",
                            textShadow: "1px 1px #000000"
                        },
                        textContent: ""
                    }
                });
            }
            connectItems() {
                this.enablePointer();
                this.image = this.getChild(`image`);
                this.group = this.getChild(`group`);
                this.frame = this.getChild(`frame`);
                this.bg = this.getChild(`bg`);
                this.progress = this.getChild(`progress`);
                this.thumb = this.getChild(`thumb`);
                this.text = this.getChild(`text`);
            }
            createChildren() {
                super.createChildren();
                let i_image = controls.utils.SVGImage({ id: `image` });
                let g_group = controls.utils.SVGGroup({ id: `group` });
                let r_frame = controls.utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "none", stroke: "black", strokeWidth: "5px" }, id: `frame` });
                let r_barTotal = controls.utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "#919191" }, id: `bg` });
                let r_barProgress = controls.utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "red" }, id: `progress` });
                let r_thumb = controls.utils.SVGRect({ x: "0", y: "0", width: "1px", height: "100%", style: { fill: "black" }, id: `thumb` });
                let t_title = controls.utils.SVGText({ x: "50%", y: "50%", style: { fill: "white", textAnchor: "middle", fontSize: "20px", textShadow: "1px 1px #000000" }, id: `text` });
                // Grouping
                g_group.appendChild(r_barTotal);
                g_group.appendChild(r_barProgress);
                g_group.appendChild(r_thumb);
                g_group.appendChild(t_title);
                g_group.appendChild(r_frame);
                this.svg.append(i_image);
                this.svg.append(g_group);
            }
            postConnected() {
                super.postConnected();
                this.updateByAlign(false);
                this.updateByValue(false);
                let s = Math.min(this.clientRect.width, this.clientRect.height) / 2.5;
                this.params.text.style.fontSize = `${s}px`;
                this.update();
            }
            updateByAlign(upd) {
                if (0 == this.locals.align) {
                    this.params.text.style.transform = "";
                    this.params.text.style.transformOrigin = "";
                }
                else {
                    this.params.text.style.transform = "rotate(-90deg)";
                    this.params.text.style.transformOrigin = "50% 50%";
                }
                if (0 == this.locals.thumb) {
                    this.params.progress.visibility = "visible";
                    this.params.thumb.visibility = "hidden";
                }
                else {
                    this.params.progress.visibility = "hidden";
                    this.params.thumb.visibility = "visible";
                }
                if (upd)
                    this.update({ svg: this.params.svg });
            }
            updateByValue(upd = true) {
                let length;
                if (undefined === this.clientRect)
                    return;
                if (0 == this.locals.align)
                    length = this.clientRect.width;
                else
                    length = this.clientRect.height;
                this._val = conx.glo.clamp(this._val, 0, 1);
                let value = Math.round(this._val * 100);
                let talue = value * (1.0 - this.locals.thumb * 0.01);
                let text = this.locals.title;
                if (this.locals.percent)
                    text += ` ${value}%`;
                this.params.text.textContent = text;
                if (0 == this.locals.align) {
                    this.params.progress.width = `${value}%`;
                    this.params.progress.height = "100%";
                    this.params.thumb.width = `${this.locals.thumb}%`;
                    this.params.thumb.height = "100%";
                    this.params.thumb.x = `${talue}%`;
                }
                else {
                    this.params.progress.width = "100%";
                    this.params.progress.height = `${value}%`;
                    this.params.progress.y = `${100 - value}%`;
                    this.params.thumb.width = "100%";
                    this.params.thumb.height = `${this.locals.thumb}%`;
                    this.params.thumb.y = `${100 - talue - this.locals.thumb}%`;
                }
                if (upd)
                    this.update({ progress: this.params.progress, thumb: this.params.thumb, text: this.params.text });
            }
            onPointer(e, type) {
                //super.onPointer(e,type);
                switch (type) {
                    case "down":
                        this.movable = true;
                        break;
                    case "move":
                        if (!this.movable)
                            return;
                        this._pval = this._val;
                        let rect = this.bg.getBoundingClientRect();
                        if (this.locals.align == 0)
                            this._val = (this._touchX - rect.left) / rect.width;
                        else
                            this._val = (rect.bottom - this._touchY) / rect.height;
                        this.updateByValue();
                        if (this.onChange)
                            this.onChange(this.id, this._val, this._pval);
                        break;
                    case "up":
                        this.movable = false;
                        break;
                }
            }
        }
        controls.Slider = Slider;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
customElements.define("conx-slider", conx.controls.Slider);
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class HACard extends HTMLElement {
            constructor() {
                super(...arguments);
                this.connected = false;
                this.updateTS = 0;
            }
            create() {
            }
            updateState() {
            }
            set hass(hass) {
                this._hass = hass;
                this.state = hass.states[this.entity];
                if (undefined === this.root)
                    this.create();
                this.updateState();
            }
            connectedCallback() {
                this.connected = true;
                this.updateState();
            }
            disconnectedCallback() {
                this.connected = false;
            }
            setConfig(config) {
                if (undefined === config.entity) {
                    throw new Error('You need to define an entity');
                }
                this.config = config;
                this.entity = config.entity;
            }
            static get properties() {
                return {
                    config: Object,
                    state: String
                };
            }
        }
        cards.HACard = HACard;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Dimmer extends cards.HACard {
            create() {
                super.create();
                this.innerHTML = `<conx-slider id="main" width="100%" height="40px" locals='{"align":0}'/>`;
                this.root = conx.glo.getChild(this, "main");
                this.root.onChange = this.onChange.bind(this);
                this.root.locals.title = this.state.attributes.friendly_name;
            }
            updateState() {
                super.updateState();
                if (!this.root || !this.connected)
                    return;
                this.root._val = this.state.attributes.brightness / 255.0;
                this.root.updateByValue();
            }
            onChange(id, value, pvalue) {
                this._hass.callService("light", "turn_on", { entity_id: this.entity, brightness: Math.floor(value * 255) });
            }
        }
        cards.Dimmer = Dimmer;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-dimmer', conx.cards.Dimmer);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-dimmer',
    name: 'conx-dimmer',
    description: 'Control a single light with dimmer. support conx.fade',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Light_RGB extends cards.HACard {
            create() {
                super.create();
                this.innerHTML = `
                <conx-slider id="white" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#000000"}}}'></conx-slider>
                <conx-slider id="red" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="green" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="blue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#0000FF"}}}'></conx-slider>
            `;
                this.root = {};
                this.root.white = conx.glo.getChild(this, "white");
                this.root.white.onChange = this.onChange.bind(this);
                this.root.white.locals.title = this.config.name || this.state.attributes.friendly_name;
                this.root.red = conx.glo.getChild(this, "red");
                this.root.red.onChange = this.onChange.bind(this);
                this.root.red.locals.title = "";
                this.root.green = conx.glo.getChild(this, "green");
                this.root.green.onChange = this.onChange.bind(this);
                this.root.green.locals.title = "";
                this.root.blue = conx.glo.getChild(this, "blue");
                this.root.blue.onChange = this.onChange.bind(this);
                this.root.blue.locals.title = "";
            }
            refreshColors() {
                this.root.white.params.bg.style.fill = this.root.white.bg.style.fill = conx.glo.RGBAtoHEX(this.root.red._val, this.root.green._val, this.root.blue._val, this.root.white._val);
                this.root.red.params.bg.style.fill = this.root.red.bg.style.fill = conx.glo.RGBAtoHEX(1, 0, 0, this.root.red._val);
                this.root.green.params.bg.style.fill = this.root.green.bg.style.fill = conx.glo.RGBAtoHEX(0, 1, 0, this.root.green._val);
                this.root.blue.params.bg.style.fill = this.root.blue.bg.style.fill = conx.glo.RGBAtoHEX(0, 0, 1, this.root.blue._val);
            }
            updateState() {
                super.updateState();
                if (!this.root || !this.connected || conx.glo.time - this.updateTS < 1000)
                    return;
                this.root.white._val = this.state.attributes.brightness / 255.0;
                this.root.red._val = this.state.attributes.rgb_color[0] / 255.0;
                this.root.green._val = this.state.attributes.rgb_color[1] / 255.0;
                this.root.blue._val = this.state.attributes.rgb_color[2] / 255.0;
                this.refreshColors();
                this.root.white.updateByValue();
                this.root.red.updateByValue();
                this.root.green.updateByValue();
                this.root.blue.updateByValue();
            }
            onChange(id, value, pvalue) {
                this.updateTS = conx.glo.time;
                this._hass.callService("light", "turn_on", {
                    entity_id: this.entity,
                    brightness: Math.floor(this.root.white._val * 255),
                    rgb_color: [
                        Math.floor(this.root.red._val * 255),
                        Math.floor(this.root.green._val * 255),
                        Math.floor(this.root.blue._val * 255)
                    ]
                });
                this.refreshColors();
            }
        }
        cards.Light_RGB = Light_RGB;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-light-rgb', conx.cards.Light_RGB);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-light-rgb',
    name: 'conx-light-rgb',
    description: 'Control a single light with brightness and rgb. support conx.fade',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Light_HSV extends cards.HACard {
            create() {
                super.create();
                let local = window.location.origin;
                this.innerHTML = `
            <div>
                <conx-slider id="val" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="sat" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="hue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"bg":{"style":{"fill":"none"}}, "image":{"href":"${local}/local/images/gradH.png", "visibility":"visible"}}'></conx-slider>
            </div>
            `;
                this.root = {};
                this.root.hue = conx.glo.getChild(this, "hue");
                this.root.hue.onChange = this.onChange.bind(this);
                this.root.hue.locals.title = "";
                this.root.sat = conx.glo.getChild(this, "sat");
                this.root.sat.onChange = this.onChange.bind(this);
                this.root.sat.locals.title = "";
                this.root.val = conx.glo.getChild(this, "val");
                this.root.val.onChange = this.onChange.bind(this);
                this.root.val.locals.title = this.config.name || this.state.attributes.friendly_name;
            }
            refreshColors() {
                this.root.sat.params.bg.style.fill = this.root.sat.bg.style.fill = conx.glo.HSVtoHEX(this.root.hue._val * 5 / 6, this.root.sat._val, 1);
                this.root.val.params.bg.style.fill = this.root.val.bg.style.fill = conx.glo.HSVtoHEX(this.root.hue._val * 5 / 6, this.root.sat._val, this.root.val._val);
            }
            updateState() {
                super.updateState();
                if (!this.root || !this.connected || conx.glo.time - this.updateTS < 1000)
                    return;
                this.root.val._val = this.state.attributes.brightness / 255.0;
                this.root.hue._val = this.state.attributes.hs_color[0] / 360.0;
                this.root.sat._val = this.state.attributes.hs_color[1] / 100.0;
                ;
                this.refreshColors();
                this.root.val.updateByValue();
                this.root.hue.updateByValue();
                this.root.sat.updateByValue();
            }
            onChange(id, value, pvalue) {
                this.updateTS = conx.glo.time;
                this._hass.callService("light", "turn_on", {
                    entity_id: this.entity,
                    brightness: Math.floor(this.root.val._val * 255),
                    hs_color: [
                        Math.floor(this.root.hue._val * 360),
                        Math.floor(this.root.sat._val * 100)
                    ]
                });
                this.refreshColors();
            }
        }
        cards.Light_HSV = Light_HSV;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-light-hsv', conx.cards.Light_HSV);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-light-hsv',
    name: 'conx-light-hsv',
    description: 'Control a single light with hsv. support conx.fade',
});
/// <reference path="conx/cards/dimmer.ts" />
/// <reference path="conx/cards/light-rgb.ts" />
/// <reference path="conx/cards/light-hsv.ts" />
/// <reference path="svg.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class Button extends controls.Svg {
            constructor() {
                super();
                this.copyData(this.locals, {
                    normal: "#919191",
                    clicked: "blue"
                });
                this.copyData(this.params, {
                    bg: {
                        style: {
                            fill: "#919191",
                            stroke: "black",
                            strokeWidth: "5px"
                        }
                    },
                    text: {
                        style: {
                            dominantBaseline: "middle",
                            fill: "white",
                            textAnchor: "middle",
                            fontSize: `20px`
                        },
                        textContent: "Button"
                    }
                });
            }
            connectItems() {
                this.enablePointer();
                this.bg = this.getChild(`bg`);
                this.frame = this.getChild(`frame`);
                this.text = this.getChild(`text`);
            }
            createChildren() {
                super.createChildren();
                let g_comp = controls.utils.SVGGroup({ id: `frame` });
                let r_bg = controls.utils.SVGRect({ x: 0, y: 0, rx: 0, ry: 0, width: "100%", height: "100%", style: { stroke: "black", strokeWidth: "5px" }, id: `bg` });
                let t_title = controls.utils.SVGText({ x: "50%", y: "50%", style: { dominantBaseline: "middle", fill: "white", textAnchor: "middle", fontSize: `20px` }, id: `text` });
                g_comp.appendChild(r_bg);
                g_comp.appendChild(t_title);
                this.svg.append(g_comp);
            }
            postConnected() {
                super.postConnected();
                this.updateByValue(false, false);
                let s = Math.min(this.clientRect.width, this.clientRect.height) / 2.5;
                this.params.text.style.fontSize = `${s}px`;
                this.update();
            }
            updateByValue(clicked, upd) {
                if (clicked)
                    this.params.bg.style.fill = this.locals.clicked;
                else
                    this.params.bg.style.fill = this.locals.normal;
                if (upd)
                    this.update({ bg: this.params.bg });
            }
            onPointer(e, type) {
                //super.onPointer(e,type);
                switch (type) {
                    case "down":
                        this.updateByValue(true, true);
                        break;
                    case "up":
                        this.updateByValue(false, true);
                        break;
                }
            }
        }
        controls.Button = Button;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
customElements.define("conx-button", conx.controls.Button);
/// <reference path="svg.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class Toggle extends controls.Svg {
            constructor() {
                super();
                this.copyData(this.locals, {
                    on: false,
                    onBG: "blue",
                    offBG: "gray"
                });
                this.copyData(this.params, {
                    bg: {
                        style: {
                            fill: "#919191",
                            stroke: "black",
                            strokeWidth: "5px"
                        }
                    },
                    thumb: {
                        style: {
                            fill: "red",
                            stroke: "black",
                            strokeWidth: "1px",
                            strokeOpacity: 0.5
                        }
                    },
                    text: {
                        style: {
                            dominantBaseline: "middle",
                            fill: "white",
                            textAnchor: "middle",
                            fontSize: `20px`
                        },
                        textContent: "Switch"
                    }
                });
            }
            connectItems() {
                this.enablePointer();
                this.bg = this.getChild(`bg`);
                this.thumb = this.getChild(`thumb`);
                this.text = this.getChild(`text`);
            }
            createChildren() {
                super.createChildren();
                let g_comp = controls.utils.SVGGroup({ id: `group` });
                let r_bg = controls.utils.SVGRect({ x: 0, y: 0, rx: 0, ry: 0, width: "100%", height: "100%", style: { fill: "gray", strokeWidth: "5px", stroke: "black" }, id: `bg` });
                let r_thumb = controls.utils.SVGRect({ x: 5, y: 5, rx: 5, ry: 5, width: "35%", height: "100%", style: { fill: "red" }, id: `thumb` });
                let r_text = controls.utils.SVGText({ x: "50%", y: "50%", style: { dominantBaseline: "middle", fill: "white", textAnchor: "middle", fontSize: `20px` }, id: `text` });
                // Grouping
                g_comp.appendChild(r_bg);
                g_comp.appendChild(r_thumb);
                g_comp.appendChild(r_text);
                this.svg.append(g_comp);
                this.svg.id = `toggle`;
            }
            postConnected() {
                super.postConnected();
                this.updateByValue(false);
                this.params.thumb.height = `${this.clientRect.height - 10}px`;
                let s = Math.min(this.clientRect.width, this.clientRect.height) / 2.5;
                this.params.text.style.fontSize = `${s}px`;
                this.update();
            }
            updateByValue(upd) {
                let x = 5;
                if (this.locals.on) {
                    x = this.clientRect.width - this.thumb.getBoundingClientRect().width - 5;
                    this.params.bg.style.fill = this.locals.onBG;
                }
                else
                    this.params.bg.style.fill = this.locals.offBG;
                this.params.thumb.x = `${x}px`;
                this.update({ bg: this.params.bg, thumb: this.params.thumb });
            }
            onPointer(e, type) {
                //super.onPointer(e,type);
                switch (type) {
                    case "up":
                        this.locals.on = !this.locals.on;
                        this.updateByValue(true);
                        break;
                }
            }
        }
        controls.Toggle = Toggle;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
customElements.define("conx-toggle", conx.controls.Toggle);
/// <reference path="svg.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class WheelKnob extends controls.Svg {
            constructor() {
                super();
                this.movable = false;
                this.slideLength = -1;
                this._val = 0;
                this.copyData(this.params, {
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
                this.enablePointer();
                this.elSlider = this.getChild(`slider`);
                this.elFrame = this.getChild(`slider-frame`);
                this.elGFrame = this.getChild(`slider-g`);
                this.elTotal = this.getChild(`slider-bar-total`);
                this.elTotal1 = this.getChild(`slider-bar-total1`);
                this.elProgress = this.getChild(`slider-bar-progress`);
                this.elTitle = this.getChild(`slider-title`);
                this.setParams(this.params);
            }
            setParams(params) {
                if (params.value != undefined)
                    this.params.value = params.value;
                if (params.isShowPercent != undefined)
                    this.params.isShowPercent = params.isShowPercent;
                if (params.title)
                    this.params.title = params.title;
                if (params.fill)
                    this.params.fill = params.fill;
                if (params.background)
                    this.params.background = params.background;
                if (params.frame)
                    this.params.frame = params.frame;
                if (params.pheight)
                    this.params.pheight = params.pheight;
                this._val = this.params.value / 100;
                this.slideLength = 300;
                this.update();
            }
            getParams() {
                return this.params;
            }
            createChildren() {
                let w = this.parentElement.clientWidth;
                let h = this.parentElement.clientHeight;
                let cx = w / 2, cy = h / 2;
                // t1 → start angle, in radian.
                // delta → angle to sweep, in radian. positive.
                // fai → rotation on the whole, in radian.
                let delta = 300, t1 = 120, fai = 0;
                // Create SVGs
                let g_frame = controls.utils.SVGGroup({ id: `slider-g` });
                let r_frame = controls.utils.SVGCircle({
                    cx: cx, cy: cy, r: w / 2 - 1,
                    style: { stroke: "black", strokeWidth: "2px" },
                    id: `slider-frame`
                });
                let arc_params = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - 50) / 2 - 2,
                    ry: (w - 50) / 2 - 2,
                    t1: t1, DELTA: delta, FAI: fai
                });
                let r_barTotal = controls.utils.SVGPath({
                    d: arc_params.join(" "),
                    style: { fill: "none" },
                    id: `slider-bar-total`
                });
                let arc_params3 = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - 50) / 2 - 3,
                    ry: (w - 50) / 2 - 3,
                    t1: t1 - 0.75, DELTA: delta + 1.5, FAI: fai
                });
                let r_barTotal2 = controls.utils.SVGPath({
                    d: arc_params3.join(" "),
                    style: { fill: "none", stroke: "black" },
                    id: `slider-bar-total1`
                });
                let arc_params2 = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - 50) / 2 - 2,
                    ry: (w - 50) / 2 - 2,
                    t1: t1, DELTA: delta, FAI: fai
                });
                let r_barProgress = controls.utils.SVGPath({
                    d: arc_params2.join(" "),
                    style: { fill: "none" },
                    id: `slider-bar-progress`
                });
                let t_title = controls.utils.SVGText({
                    x: "50%", y: "51.5%",
                    style: { fill: "white", textAnchor: "middle", fontSize: `${w / 10}px` },
                    id: `slider-title`
                });
                // Grouping
                g_frame.appendChild(r_frame);
                g_frame.appendChild(r_barTotal2);
                g_frame.appendChild(r_barTotal);
                g_frame.appendChild(r_barProgress);
                g_frame.appendChild(t_title);
                this.svg.append(g_frame);
                this.svg.id = `slider`;
                this.svg.setAttribute("width", "100%");
                this.svg.setAttribute("height", "100%");
                return this.svg;
            }
            update() {
                let w = this.parentElement.clientWidth;
                let h = this.parentElement.clientHeight;
                let cx = w / 2, cy = h / 2;
                let delta = 300, t1 = 120, fai = 0;
                let style;
                if (this._val > 1)
                    this._val = 1;
                else if (this._val < 0)
                    this._val = 0;
                let offset = (1 - this._val) * 300;
                let textPercent = Math.floor(this._val * 100);
                if (this.params.isShowPercent)
                    this.elTitle.textContent = this.params.title + " " + textPercent + '%';
                else
                    this.elTitle.textContent = this.params.title;
                let arc_params = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - this.params.pheight) / 2 - 2,
                    ry: (w - this.params.pheight) / 2 - 2,
                    t1: t1, DELTA: delta, FAI: fai
                });
                this.elTotal.setAttribute("d", arc_params.join(" "));
                let arc_params3 = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - this.params.pheight) / 2 - 3,
                    ry: (w - this.params.pheight) / 2 - 3,
                    t1: t1 - 0.75, DELTA: delta + 1.5, FAI: fai
                });
                this.elTotal1.setAttribute("d", arc_params3.join(" "));
                style = controls.utils.Style({ fill: `${this.params.background}`, stroke: "black", strokeWidth: "2px" });
                this.elFrame.setAttribute("style", style);
                style = controls.utils.Style({ fill: "none", stroke: `${this.params.frame}`, strokeWidth: "" + this.params.pheight + "px" });
                this.elTotal.setAttribute("style", style);
                style = controls.utils.Style({ fill: "none", stroke: "black", strokeWidth: "" + (this.params.pheight + 2) + "px" });
                this.elTotal1.setAttribute("style", style);
                let arc_params2 = controls.utils.SVGArc({
                    cx: cx, cy: cy,
                    rx: (w - this.params.pheight) / 2 - 2,
                    ry: (w - this.params.pheight) / 2 - 2,
                    t1: t1, DELTA: delta - offset, FAI: fai
                });
                this.elProgress.setAttribute("d", arc_params2.join(" "));
                style = controls.utils.Style({ fill: "none", stroke: `${this.params.fill}`, strokeWidth: "" + this.params.pheight + "px" });
                this.elProgress.setAttribute("style", style);
            }
            onPointer(e, type) {
                //super.onPointer(e,type);
                switch (type) {
                    case "down":
                        this.movable = true;
                        break;
                    case "move":
                        if (!this.movable)
                            return;
                        let w = this.parentElement.clientWidth;
                        let h = this.parentElement.clientHeight;
                        let cx = w / 2, cy = h / 2;
                        let angle = controls.utils.GetAngle(cx, cy, this._touchX, this._touchY);
                        angle = (angle * 180 / Math.PI + 270) % 360;
                        angle = (360 - angle + 60) % 360;
                        if (angle > 330 && angle < 360)
                            angle = 0;
                        if (angle > 300 && angle <= 330)
                            angle = 300;
                        this._val = (300 - angle) / 300;
                        this.update();
                        break;
                    case "up":
                        this.movable = false;
                        break;
                    default:
                        break;
                }
            }
        }
        controls.WheelKnob = WheelKnob;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
customElements.define("conx-wheel-knob", conx.controls.WheelKnob);
//# sourceMappingURL=conx.js.map