"use strict";
var conx;
(function (conx) {
    class glo {
        static trace(...args) {
            console.log.apply(null, args);
        }
        static get wnd() {
            return window;
        }
        static get time() {
            return (new Date).getTime();
        }
        static isNull(v, d) {
            return undefined !== v && null !== v ? v : d;
        }
        static isNaN(v, d) {
            return isNaN(v) ? d : v;
        }
        static up(val, delimeter = "/") {
            return val.substr(0, val.lastIndexOf(delimeter));
        }
        static getChild(_this, id) {
            let node = _this, ids = id.split("."), i, len = ids.length;
            for (i = 0; undefined !== node && i < len; ++i) {
                node = node[ids[i]];
            }
            if (undefined !== node)
                return node;
            node = _this;
            let j, clen, res;
            for (i = 0; undefined !== node && i < len; ++i) {
                res = undefined;
                clen = node.children.length;
                for (j = 0; j < clen; ++j) {
                    if (node.children[j].id == ids[i]) {
                        res = node.children[j];
                        break;
                    }
                }
                if (undefined === res)
                    return undefined;
                node = res;
            }
            return node;
        }
        static findChild(node, id) {
            if (node.id == id)
                return node;
            let len = node.children.length, res;
            for (let i = 0; i < len; ++i) {
                res = this.findChild(node.children[i], id);
                if (null !== res)
                    return res;
            }
            return null;
        }
        static removeChildren(node) {
            while (node.firstChild) {
                node.removeChild(node.lastChild);
            }
        }
        static findCSS(node, css, res = undefined) {
            if (undefined === res)
                res = [];
            if (node.className == css) {
                res.push(node);
                return res;
            }
            let len = node.children.length;
            for (let i = 0; i < len; ++i)
                this.findCSS(node.children[i], css, res);
            return res;
        }
        static setStyle(child, style) {
            for (let att in style) {
                let _att = att.replace(/-[a-z]/g, match => `${match.substr(1).toUpperCase()}`);
                child.style[_att] = style[att];
            }
        }
        static setAtts(child, childAtts) {
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
                    this.setStyle(child, childAtts[att]);
            }
        }
        static updateCSS(_this, csss = undefined) {
            var _a, _b;
            if (!csss)
                return;
            let cssArr, nodes, style, i, len;
            for (let cssId in csss) {
                cssArr = cssId.split("-");
                nodes = this.findCSS(_this, cssArr[0]);
                style = csss[cssId];
                len = nodes.length;
                if (cssArr.length <= 1) {
                    for (i = 0; i < len; ++i) {
                        this.setStyle(nodes[i], style);
                        if (undefined !== ((_a = nodes[i]) === null || _a === void 0 ? void 0 : _a.css))
                            nodes[i]["css"]["reg"] = style;
                    }
                }
                else {
                    for (i = 0; i < len; ++i) {
                        if (undefined !== ((_b = nodes[i]) === null || _b === void 0 ? void 0 : _b.css))
                            nodes[i]["css"][cssArr[1]] = style;
                    }
                }
            }
        }
        static update(_this, atts = undefined) {
            atts = atts || (_this === null || _this === void 0 ? void 0 : _this.params);
            if (!atts)
                return;
            let child, childAtts;
            for (let childId in atts) {
                child = this.getChild(_this, childId);
                if (undefined === child)
                    continue;
                childAtts = atts[childId];
                if (undefined !== (child === null || child === void 0 ? void 0 : child.updateParams)) {
                    child.updateParams(childAtts);
                    continue;
                }
                this.setAtts(child, childAtts);
            }
            childAtts = atts["root"];
            if (undefined !== childAtts) {
                this.setAtts(_this, childAtts);
            }
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
        static HEXtoRGB(hex) {
            return [parseInt('0x' + hex[1] + hex[2], 16), parseInt('0x' + hex[3] + hex[4], 16), parseInt('0x' + hex[5] + hex[6], 16)];
        }
        static HEXtoRGBv(hex) {
            let rgb = this.HEXtoRGB(hex);
            rgb[0] = this.clamp(rgb[0] / 255.0, 0, 1);
            rgb[1] = this.clamp(rgb[1] / 255.0, 0, 1);
            rgb[2] = this.clamp(rgb[2] / 255.0, 0, 1);
            return rgb;
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
        static toNums(seq) {
            let parts = seq.split("|"), inc = 1, sign = 1;
            if (parts.length > 1)
                inc = parseFloat(parts[1]);
            let nums = parts[0].split(">");
            if (nums.length < 2)
                return [parseFloat(nums[0])];
            let a = parseFloat(nums[0]), b = parseFloat(nums[1]);
            if (a > b) {
                inc = -inc;
                sign = -1;
            }
            let res = [];
            for (; a * sign <= b * sign; a += inc)
                res.push(a);
            return res;
        }
        static removeItems(res, items) {
            let i, len = items.length, index;
            for (i = 0; i < len; ++i) {
                index = res.indexOf(items[i]);
                if (-1 !== index)
                    res.splice(index, 1);
            }
        }
        static ParseSelection(data) {
            if (!data)
                return [];
            let names = [];
            let entities = data.split(",");
            let i, len = entities.length;
            for (i = 0; i < len; ++i) {
                let entity = entities[i];
                let parts = entity.split(";");
                if (parts.length < 2) {
                    names.push(parts[0].trim());
                    continue;
                }
                if (parts.length > 2)
                    continue;
                let res = [];
                let name = parts[0].trim();
                let seqs = parts[1].split(/([+]|[-])/);
                let tlen = seqs.length, j;
                for (j = 0; j < tlen; j += 2) {
                    let s = this.toNums(seqs[j]);
                    if (0 == j || "+" == seqs[j - 1])
                        res = res.concat(s);
                    else
                        this.removeItems(res, s);
                }
                tlen = res.length;
                for (j = 0; j < tlen; ++j)
                    names.push(name + res[j]);
            }
            return names;
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
            updateParams(params) {
                this.copyData(this.params, params);
            }
            connectedCallback() {
                this.copyData(this.locals, conx.glo.JSON(this.getAttribute("locals")));
                this.copyData(this.params, conx.glo.JSON(this.getAttribute("params")));
                this.copyData(this.params.root, conx.glo.attributesToObject(this.attributes));
                conx.glo.update(this);
                this.appendChild(this.root);
                setTimeout(this.postConnected.bind(this), 0);
            }
            disconnectedCallback() {
                this.connected = false;
                if (undefined !== this.root)
                    this.removeChild(this.root);
            }
            copyData(dst, src, override = true) {
                conx.glo.copy(dst, src, override);
            }
            findChild(id) {
                return conx.glo.findChild(this.root, id);
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
                this.image = this.findChild(`image`);
                this.group = this.findChild(`group`);
                this.frame = this.findChild(`frame`);
                this.bg = this.findChild(`bg`);
                this.progress = this.findChild(`progress`);
                this.thumb = this.findChild(`thumb`);
                this.text = this.findChild(`text`);
            }
            createChildren() {
                super.createChildren();
                let i_image = controls.utils.SVGImage({ id: `image` });
                let g_group = controls.utils.SVGGroup({ id: `group` });
                let r_frame = controls.utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "none", stroke: "black", strokeWidth: "5px" }, id: `frame` });
                let r_barTotal = controls.utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "#919191" }, id: `bg` });
                let r_barProgress = controls.utils.SVGRect({ x: "0", y: "0", width: "100%", height: "100%", style: { fill: "red" }, id: `progress` });
                let r_thumb = controls.utils.SVGRect({ x: "0", y: "0", width: "3px", height: "100%", style: { fill: "#FFBF00", stroke: "black", strokeWidth: "1px" }, id: `thumb` });
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
                let s = Math.min(this.clientRect.width, this.clientRect.height) / 1.6;
                this.params.text.style.fontSize = `${s}px`;
                conx.glo.update(this);
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
                    conx.glo.update(this, { svg: this.params.svg });
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
                    conx.glo.update(this, { progress: this.params.progress, thumb: this.params.thumb, text: this.params.text });
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
                this.phass = {};
                this.ptates = [];
                this.states = [];
                this.entities = [];
                this.connected = false;
            }
            create() {
            }
            postCreate() {
                if (undefined !== this.css)
                    conx.glo.updateCSS(this.root, this.css);
                if (undefined !== this.html)
                    conx.glo.update(this.root, this.html);
            }
            updateState(check) {
                if (!this.root || !this.connected || this.entities.length > 1 || this.entities.length <= 0 || !this.state)
                    return false;
                if (check && false == this.checkStateChanged(0))
                    return false;
                return true;
            }
            get hass() { return this._hass; }
            set hass(hass) {
                this.phass = this._hass;
                this._hass = hass;
                for (let i = 0; i < this.entities.length; ++i) {
                    this.ptates[i] = this.states[i];
                    this.states[i] = hass.states[this.entities[i]];
                }
                if (undefined === this.root) {
                    this.create();
                    this.postCreate();
                }
                this.updateState(true);
            }
            connectedCallback() {
                this.connected = true;
                this.updateState(false);
            }
            disconnectedCallback() {
                this.connected = false;
            }
            setConfig(config) {
                var _a, _b, _c, _d;
                this.config = config;
                if (undefined !== ((_a = this.config) === null || _a === void 0 ? void 0 : _a.css) && typeof ((_b = this.config) === null || _b === void 0 ? void 0 : _b.css) === "string")
                    this.css = JSON.parse(this.config.css);
                if (undefined !== ((_c = this.config) === null || _c === void 0 ? void 0 : _c.html) && typeof ((_d = this.config) === null || _d === void 0 ? void 0 : _d.html) === "string")
                    this.html = JSON.parse(this.config.html);
                this.entities = conx.glo.ParseSelection(config.entity);
                this.ptates.length = this.entities.length;
                this.states.length = this.entities.length;
                if (undefined !== this.root)
                    this.postCreate();
            }
            get state() {
                if (this.states.length > 0)
                    return this.states[0];
                return undefined;
            }
            stateToColor(state) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                if (!state)
                    return null;
                let A = conx.glo.isNaN(((_a = state.attributes) === null || _a === void 0 ? void 0 : _a.brightness) / 255.0, 1.0), R = 1, G = 1, B = 0;
                if (!!((_b = state.attributes) === null || _b === void 0 ? void 0 : _b.rgb_color)) {
                    R = conx.glo.isNaN(((_d = (_c = state.attributes) === null || _c === void 0 ? void 0 : _c.rgb_color) === null || _d === void 0 ? void 0 : _d[0]) / 255.0, 1.0);
                    G = conx.glo.isNaN(((_f = (_e = state.attributes) === null || _e === void 0 ? void 0 : _e.rgb_color) === null || _f === void 0 ? void 0 : _f[1]) / 255.0, 1.0);
                    B = conx.glo.isNaN(((_h = (_g = state.attributes) === null || _g === void 0 ? void 0 : _g.rgb_color) === null || _h === void 0 ? void 0 : _h[2]) / 255.0, 1.0);
                }
                if ("on" !== (state === null || state === void 0 ? void 0 : state.state)) {
                    A = conx.glo.isNaN(((_j = state.attributes) === null || _j === void 0 ? void 0 : _j.brightness) / 255.0, 0.0);
                    R = 0;
                    G = 0;
                    B = 0;
                }
                return [R, G, B, A];
            }
            checkStateChanged(idx) {
                var _a, _b;
                return ((_a = this.ptates) === null || _a === void 0 ? void 0 : _a[idx]) !== ((_b = this.states) === null || _b === void 0 ? void 0 : _b[idx]);
            }
            hasStateChanged(entity) {
                var _a, _b, _c, _d;
                return ((_b = (_a = this.phass) === null || _a === void 0 ? void 0 : _a.states) === null || _b === void 0 ? void 0 : _b[entity]) !== ((_d = (_c = this._hass) === null || _c === void 0 ? void 0 : _c.states) === null || _d === void 0 ? void 0 : _d[entity]);
            }
            ConxLight(data) {
                this._hass.callService("conx", "light", data);
            }
            Get(unq, path, create = false) {
                this.conx(unq, "db.Get", { path: path, create: create });
            }
            Set(unq, path, value) {
                this.conx(unq, "db.Set", { path: path, value: value });
            }
            conx(unq, cmd, data) {
                this._hass.connection.sendMessagePromise({
                    type: 'conx.cmd',
                    cmd: cmd,
                    unq: unq,
                    data: data
                }).then((respond) => {
                    this.onConxMsg(respond.cmd, respond.unq, respond.payload, undefined === respond.error);
                }, (respond) => {
                    this.onConxMsg(respond.cmd, respond.unq, respond.payload, false);
                });
            }
            onConxMsg(cmd, unq, payload, success) {
                conx.glo.trace(cmd, unq, payload, success);
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
        class Title extends cards.HACard {
            create() {
                super.create();
                this.innerHTML = `<h1 id="root" width="100%" height="40px" style="font-size: 20px;"></h1>`;
                this.root = conx.glo.findChild(this, "root");
                this.root.innerHTML = this.config.name || this.state.attributes.friendly_name;
            }
        }
        cards.Title = Title;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-title', conx.cards.Title);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-title',
    name: 'conx-title',
    description: 'shows entity title',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Dimmer extends cards.HACard {
            create() {
                var _a, _b, _c;
                super.create();
                let icon = ((_a = this.config) === null || _a === void 0 ? void 0 : _a.icon) || "mdi:lightbulb";
                this.css = this.css || {};
                this.css.bn = ((_b = this.css) === null || _b === void 0 ? void 0 : _b.bn) || { color: "#FFFFFF", backgroundColor: "#CCCCCC", backgroundImage: "linear-gradient( 0deg, #808080 10%, #000000 100%)" };
                this.css["bn-down"] = ((_c = this.css) === null || _c === void 0 ? void 0 : _c["bn-down"]) || { color: "#FFFFFF", backgroundColor: "#CCCCCC", backgroundImage: "linear-gradient( 0deg, #000000 0%, #808080 90%)" };
                this.innerHTML = `
            <div id="root" style="display: grid; grid-gap: 1px; grid-template-columns:40px auto;">
                <button is="conx-button" id="toggle" class="bn" style="width:40px; height:32px;"><ha-icon id="ic" icon="${icon}" style="color: #FF0000;"></ha-icon></button>
                <conx-slider id="intensity" width="100%" height="32px" locals='{"align":0, "thumb":3}'/>
            </div>
            `;
                this.root = conx.glo.findChild(this, "root");
                this.root.intensity = conx.glo.findChild(this, "intensity");
                this.root.intensity.onChange = this.onChange.bind(this);
                this.root.intensity.locals.title = this.config.name || (this.state && this.state.attributes.friendly_name);
                this.root.toggle = conx.glo.findChild(this.root, 'toggle');
                this.root.toggle.onclick = this.onCommand.bind(this, 'toggle');
                this.root.ic = conx.glo.findChild(this.root.toggle, 'ic');
            }
            refreshColors() {
                if (!this.rgba)
                    return false;
                this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = this.root.ic.style.color = conx.glo.RGBAtoHEX(this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3]);
                return true;
            }
            updateState(check) {
                if (false === super.updateState(check))
                    return false;
                this.rgba = this.stateToColor(this.state);
                if (!this.refreshColors())
                    return false;
                this.root.intensity._val = this.rgba[3];
                this.root.intensity.updateByValue();
                return true;
            }
            onChange(id, value, pvalue) {
                this.ConxLight({ entity_id: this.entities, intensity: value });
                if (!this.rgba)
                    return;
                this.rgba[3] = value;
                this.refreshColors();
            }
            onCommand(name) {
                conx.glo.trace("cmd", name);
                let bt;
                switch (name) {
                    case "toggle":
                        this.ConxLight({ entity_id: this.entities, intensity: this.root.intensity._val > 0 ? 0.0 : 1.0 });
                        break;
                }
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
    description: 'Control a single light with dimmer.',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Swatch extends cards.HACard {
            constructor() {
                super(...arguments);
                this.transition = 2;
            }
            create() {
                var _a;
                super.create();
                let html = ``;
                let clr;
                this.transition = ((_a = this.config) === null || _a === void 0 ? void 0 : _a.transition) || 2;
                for (let i = 0; i < this.config.colors.length; ++i) {
                    clr = this.config.colors[i];
                    html += `<button id="clr${i}" class="swatch" style="width:50px; height:50px; background-color:${clr};"></button>`;
                }
                this.innerHTML = `<div id="root">${html}</div>`;
                this.root = conx.glo.findChild(this, "root");
                let bt;
                for (let i = 0; i < this.config.colors.length; ++i) {
                    bt = conx.glo.findChild(this.root, `clr${i}`);
                    bt.onclick = this.onColor.bind(this, i);
                }
            }
            postCreate() {
                super.postCreate();
            }
            onColor(i) {
                let rgb = conx.glo.HEXtoRGBv(this.config.colors[i]);
                this.ConxLight({
                    entity_id: this.entities,
                    red: rgb[0],
                    green: rgb[1],
                    blue: rgb[2],
                    transition: this.transition
                });
            }
        }
        cards.Swatch = Swatch;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-swatch', conx.cards.Swatch);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-swatch',
    name: 'conx-swatch',
    description: 'shows color swatches',
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
            <div id="root">
                <conx-slider id="intensity" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#000000"}}}'></conx-slider>
                <conx-slider id="red" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="green" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="blue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#0000FF"}}}'></conx-slider>
            </div>
            `;
                this.root = conx.glo.findChild(this, "root");
                this.root.intensity = conx.glo.findChild(this, "intensity");
                this.root.intensity.onChange = this.onChange.bind(this);
                if (false !== this.config.showTitle)
                    this.root.intensity.locals.title = this.config.name || (this.state && this.state.attributes.friendly_name);
                else
                    this.root.intensity.locals.title = "";
                this.root.red = conx.glo.findChild(this, "red");
                this.root.red.onChange = this.onChange.bind(this);
                this.root.red.locals.title = "";
                this.root.green = conx.glo.findChild(this, "green");
                this.root.green.onChange = this.onChange.bind(this);
                this.root.green.locals.title = "";
                this.root.blue = conx.glo.findChild(this, "blue");
                this.root.blue.onChange = this.onChange.bind(this);
                this.root.blue.locals.title = "";
            }
            refreshColors() {
                this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = conx.glo.RGBAtoHEX(this.root.red._val, this.root.green._val, this.root.blue._val, this.root.intensity._val);
                this.root.red.params.bg.style.fill = this.root.red.bg.style.fill = conx.glo.RGBAtoHEX(1, 0, 0, this.root.red._val);
                this.root.green.params.bg.style.fill = this.root.green.bg.style.fill = conx.glo.RGBAtoHEX(0, 1, 0, this.root.green._val);
                this.root.blue.params.bg.style.fill = this.root.blue.bg.style.fill = conx.glo.RGBAtoHEX(0, 0, 1, this.root.blue._val);
            }
            updateState(check) {
                if (false === super.updateState(check))
                    return false;
                this.root.intensity._val = this.state.attributes.brightness / 255.0;
                this.root.red._val = this.state.attributes.rgb_color[0] / 255.0;
                this.root.green._val = this.state.attributes.rgb_color[1] / 255.0;
                this.root.blue._val = this.state.attributes.rgb_color[2] / 255.0;
                this.refreshColors();
                this.root.intensity.updateByValue();
                this.root.red.updateByValue();
                this.root.green.updateByValue();
                this.root.blue.updateByValue();
                return true;
            }
            onChange(id, value, pvalue) {
                let data = { entity_id: this.entities };
                data[id] = value;
                this.ConxLight(data);
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
    description: 'Control a single light with brightness and rgb.',
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
            <div id="root">
                <conx-slider id="intensity" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="saturation" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="hue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"bg":{"style":{"fill":"none"}}, "image":{"href":"${local}/local/images/gradH.png", "visibility":"visible"}}'></conx-slider>
            </div>
            `;
                this.root = conx.glo.findChild(this, "root");
                this.root.hue = conx.glo.findChild(this, "hue");
                this.root.hue.onChange = this.onChange.bind(this);
                this.root.hue.locals.title = "";
                this.root.saturation = conx.glo.findChild(this, "saturation");
                this.root.saturation.onChange = this.onChange.bind(this);
                this.root.saturation.locals.title = "";
                this.root.intensity = conx.glo.findChild(this, "intensity");
                this.root.intensity.onChange = this.onChange.bind(this);
                if (false !== this.config.showTitle)
                    this.root.intensity.locals.title = this.config.name || (this.state && this.state.attributes.friendly_name);
                else
                    this.root.intensity.locals.title = "";
            }
            refreshColors() {
                this.root.saturation.params.bg.style.fill = this.root.saturation.bg.style.fill = conx.glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1);
                this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = conx.glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, this.root.intensity._val);
            }
            updateState(check) {
                if (false === super.updateState(check))
                    return false;
                this.root.intensity._val = this.state.attributes.brightness / 255.0;
                this.root.hue._val = this.state.attributes.hs_color[0] / 360.0;
                this.root.saturation._val = this.state.attributes.hs_color[1] / 100.0;
                ;
                this.refreshColors();
                this.root.intensity.updateByValue();
                this.root.hue.updateByValue();
                this.root.saturation.updateByValue();
                return true;
            }
            onChange(id, value, pvalue) {
                let data = { entity_id: this.entities };
                data[id] = value;
                this.ConxLight(data);
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
    description: 'Control a single light with hsv.',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Light_CLR extends cards.HACard {
            create() {
                super.create();
                let local = window.location.origin;
                this.innerHTML = `
            <div id="root">
                <conx-slider id="intensity" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="saturation" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="hue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"bg":{"style":{"fill":"none"}}, "image":{"href":"${local}/local/images/gradH.png", "visibility":"visible"}}'></conx-slider>
                <conx-slider id="red" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#FF0000"}}}'></conx-slider>
                <conx-slider id="green" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#00FF00"}}}'></conx-slider>
                <conx-slider id="blue" width="100%" height="40px" locals='{"align":0, "thumb":1}' params='{"progress":{"style":{"fill":"#0000FF"}}}'></conx-slider>
            </div>
            `;
                this.root = conx.glo.findChild(this, "root");
                this.root.intensity = conx.glo.findChild(this, "intensity");
                this.root.intensity.onChange = this.onChange.bind(this);
                if (false !== this.config.showTitle)
                    this.root.intensity.locals.title = this.config.name || (this.state && this.state.attributes.friendly_name);
                else
                    this.root.intensity.locals.title = "";
                this.root = conx.glo.findChild(this, "root");
                this.root.hue = conx.glo.findChild(this, "hue");
                this.root.hue.onChange = this.onChange.bind(this);
                this.root.hue.locals.title = "";
                this.root.saturation = conx.glo.findChild(this, "saturation");
                this.root.saturation.onChange = this.onChange.bind(this);
                this.root.saturation.locals.title = "";
                this.root.red = conx.glo.findChild(this, "red");
                this.root.red.onChange = this.onChange.bind(this);
                this.root.red.locals.title = "";
                this.root.green = conx.glo.findChild(this, "green");
                this.root.green.onChange = this.onChange.bind(this);
                this.root.green.locals.title = "";
                this.root.blue = conx.glo.findChild(this, "blue");
                this.root.blue.onChange = this.onChange.bind(this);
                this.root.blue.locals.title = "";
            }
            refreshColors(hsv) {
                if (hsv) {
                    let rgb = conx.glo.HSVtoRGB(this.root.hue._val, this.root.saturation._val, this.root.intensity._val);
                    this.root.saturation.params.bg.style.fill = this.root.saturation.bg.style.fill = conx.glo.HSVtoHEX(this.root.hue._val, this.root.saturation._val, 1);
                    this.root.intensity.params.bg.style.fill = this.root.intensity.bg.style.fill = conx.glo.rgbToHex(rgb[0], rgb[1], rgb[2]);
                    this.root.red._val = rgb[0];
                    this.root.green._val = rgb[1];
                    this.root.blue._val = rgb[2];
                    this.root.red.params.bg.style.fill = this.root.red.bg.style.fill = conx.glo.RGBAtoHEX(1, 0, 0, this.root.red._val);
                    this.root.green.params.bg.style.fill = this.root.green.bg.style.fill = conx.glo.RGBAtoHEX(0, 1, 0, this.root.green._val);
                    this.root.blue.params.bg.style.fill = this.root.blue.bg.style.fill = conx.glo.RGBAtoHEX(0, 0, 1, this.root.blue._val);
                    this.root.red.updateByValue();
                    this.root.green.updateByValue();
                    this.root.blue.updateByValue();
                }
                else {
                    let hsv = conx.glo.RGBtoHSV(this.root.red._val, this.root.green._val, this.root.blue._val);
                    this.root.intensity._val = hsv[2];
                    this.root.hue._val = hsv[0];
                    this.root.saturation._val = hsv[1];
                    this.root.red.params.bg.style.fill = this.root.red.bg.style.fill = conx.glo.RGBAtoHEX(1, 0, 0, this.root.red._val);
                    this.root.green.params.bg.style.fill = this.root.green.bg.style.fill = conx.glo.RGBAtoHEX(0, 1, 0, this.root.green._val);
                    this.root.blue.params.bg.style.fill = this.root.blue.bg.style.fill = conx.glo.RGBAtoHEX(0, 0, 1, this.root.blue._val);
                    this.root.intensity.updateByValue();
                    this.root.hue.updateByValue();
                    this.root.saturation.updateByValue();
                }
            }
            updateState(check) {
                if (false === super.updateState(check))
                    return false;
                this.root.intensity._val = this.state.attributes.brightness / 255.0;
                this.root.hue._val = this.state.attributes.hs_color[0] / 360.0;
                this.root.saturation._val = this.state.attributes.hs_color[1] / 100.0;
                this.root.red._val = this.state.attributes.rgb_color[0] / 255.0;
                this.root.green._val = this.state.attributes.rgb_color[1] / 255.0;
                this.root.blue._val = this.state.attributes.rgb_color[2] / 255.0;
                this.refreshColors(true);
                this.root.intensity.updateByValue();
                this.root.hue.updateByValue();
                this.root.saturation.updateByValue();
                this.root.red.updateByValue();
                this.root.green.updateByValue();
                this.root.blue.updateByValue();
                return true;
            }
            onChange(id, value, pvalue) {
                let data = { entity_id: this.entities };
                data[id] = value;
                this.ConxLight(data);
                this.refreshColors("intensity" == id || "hue" == id || "saturation" == id);
            }
        }
        cards.Light_CLR = Light_CLR;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-light-clr', conx.cards.Light_CLR);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-light-clr',
    name: 'conx-light-clr',
    description: 'Control a single light with hsv and rgb.',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Numpad extends cards.HACard {
            constructor() {
                super(...arguments);
                this.names = [
                    "$fix", "$rgb", "$sw", "C", "CE",
                    "7", "8", "9", "+", "Store",
                    "4", "5", "6", "-", "Play",
                    "1", "2", "3", "|", "Delete",
                    ">", "0", ",", ";", "Reload"
                ];
            }
            create() {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                super.create();
                let html = ``;
                if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.fix1)
                    this.names[0] = (_b = this.config) === null || _b === void 0 ? void 0 : _b.fix1;
                if ((_c = this.config) === null || _c === void 0 ? void 0 : _c.fix2)
                    this.names[1] = (_d = this.config) === null || _d === void 0 ? void 0 : _d.fix2;
                if ((_e = this.config) === null || _e === void 0 ? void 0 : _e.fix3)
                    this.names[2] = (_f = this.config) === null || _f === void 0 ? void 0 : _f.fix3;
                this.css = this.css || {};
                this.css.bn = ((_g = this.css) === null || _g === void 0 ? void 0 : _g.bn) || { color: "#FFFFFF", backgroundColor: "#CCCCCC", backgroundImage: "linear-gradient( 0deg, #000000 70%, #FFFFFF 100%)" };
                this.css["bn-down"] = ((_h = this.css) === null || _h === void 0 ? void 0 : _h["bn-down"]) || { color: "#FFFFFF", backgroundColor: "#CCCCCC", backgroundImage: "linear-gradient( 0deg, #808080 0%, #000000 50%)" };
                html += `<label>selection:</label>`;
                html += `<input type="text" id="selection" style="grid-column: 2/6;">`;
                html += `<label>name:</label>`;
                html += `<input type="text" id="name" style="grid-column: 2/5;">`;
                html += `<input type="number" id="tran" min="0">`;
                html += `<label>cycle:</label>`;
                html += `<input type="number" id="cycle"  min="0" step="0.5" value="4">`;
                html += `<label style="grid-column: 4;">offset:</label>`;
                html += `<input type="number" id="offset" min="0" max="1" step="0.1" value="0">`;
                for (let i = 0; i < 25; ++i)
                    html += `<button id="bn${i}" is="conx-button" class="bn" style="width:100%; height:64px;"></button>`;
                this.innerHTML = `<div id="root" style="display: grid; grid-gap: 1px; grid-template-columns: 20% 20% 20% 20% 20%;">${html}</div>`;
                this.root = conx.glo.findChild(this, "root");
                let bt;
                this.root.sel = conx.glo.findChild(this.root, "selection");
                this.root.sel.onchange = this.onChange.bind(this, "sel");
                this.root.name = conx.glo.findChild(this.root, "name");
                this.root.name.onchange = this.onChange.bind(this, "name");
                this.root.tran = conx.glo.findChild(this.root, "tran");
                this.root.tran.onchange = this.onChange.bind(this, "tran");
                this.root.cycle = conx.glo.findChild(this.root, "cycle");
                this.root.cycle.onchange = this.onChange.bind(this, "cycle");
                this.root.offset = conx.glo.findChild(this.root, "offset");
                this.root.offset.onchange = this.onChange.bind(this, "offset");
                for (let i = 0; i < 25; ++i) {
                    bt = conx.glo.findChild(this.root, `bn${i}`);
                    this.root[`bn${i}`] = bt;
                    bt.textContent = this.names[i];
                    bt.onclick = this.onButton.bind(this, i, this.names[i]);
                }
                this.checkState("conx.selection", this.root.sel, false);
                this.checkState("conx.name", this.root.name, false);
                this.checkState("conx.transition", this.root.tran, false);
            }
            postCreate() {
                super.postCreate();
            }
            updateState(check) {
                if (!this.root || !this.connected)
                    return false;
                this.checkState("conx.selection", this.root.sel);
                this.checkState("conx.name", this.root.name);
                this.checkState("conx.transition", this.root.tran);
                return true;
            }
            checkState(entity, elm, checkTime = true) {
                if (checkTime && false == this.hasStateChanged(entity))
                    return;
                elm.value = this._hass.states[entity].state;
            }
            onChange(type) {
                switch (type) {
                    case "sel":
                        this._hass.callService("conx", "select", { id: this.root.sel.value });
                        break;
                    case "name":
                        this._hass.callService("conx", "name", { name: this.root.name.value });
                        break;
                    case "tran":
                        this._hass.callService("conx", "transition", { value: Number(this.root.tran.value) });
                        break;
                    case "cycle":
                        this.conx("lightParams", "fde.lightParams", { cycle: Number(this.root.cycle.value) });
                        break;
                    case "offset":
                        this.conx("lightParams", "fde.lightParams", { offset: Number(this.root.offset.value) });
                        break;
                }
            }
            onButton(i, name) {
                let sel = this.root.sel.value;
                switch (name) {
                    case 'Store':
                        this._hass.callService("conx", "cuestore", {});
                        break;
                    case 'Play':
                        this._hass.callService("conx", "cueplay", {});
                        break;
                    case 'Delete':
                        this._hass.callService("conx", "cuedelete", {});
                        break;
                    case 'Name':
                        this._hass.callService("conx", "name", { name: this.root.name.value });
                        break;
                    case 'Reload':
                        this._hass.callService("conx", "reload", {});
                        break;
                    case 'C':
                        this.root.sel.value = sel.substr(0, sel.length - 1);
                        this.onChange("sel");
                        break;
                    case 'CE':
                        this.root.sel.value = "";
                        this.onChange("sel");
                        break;
                    default:
                        this.root.sel.value = sel + name;
                        this.onChange("sel");
                }
            }
        }
        cards.Numpad = Numpad;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-numpad', conx.cards.Numpad);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-numpad',
    name: 'conx-numpad',
    description: 'Editors numpad',
});
/// <reference path="../glo.ts" />
/// <reference path="utils.ts" />
var conx;
(function (conx) {
    var controls;
    (function (controls) {
        class Button extends HTMLButtonElement {
            constructor() {
                super();
                this.css = {};
                this._state = "reg";
                this.addEventListener("mousedown", this.onMousedown);
            }
            get state() { return this._state; }
            set state(v) {
                this._state = v;
                this._setStyle(false);
            }
            _setStyle(down) {
                var _a, _b;
                let style = this.css[this.state] || ((_a = this.css) === null || _a === void 0 ? void 0 : _a.reg);
                if (down)
                    style = ((_b = this.css) === null || _b === void 0 ? void 0 : _b.down) || style;
                if (style)
                    conx.glo.setStyle(this, style);
            }
            onMousedown(e) {
                this.addEventListener("mouseup", this.onMouseup);
                this.addEventListener("mouseover", this.onMouseover);
                this.addEventListener("mouseout", this.onMouseout);
                this._setStyle(true);
            }
            onMouseover(e) {
                this._setStyle(true);
            }
            onMouseout(e) {
                this._setStyle(false);
            }
            onMouseup(e) {
                this.removeEventListener("mouseup", this.onMouseup);
                this.removeEventListener("mouseover", this.onMouseover);
                this.removeEventListener("mouseout", this.onMouseup);
                this._setStyle(false);
            }
        }
        controls.Button = Button;
    })(controls = conx.controls || (conx.controls = {}));
})(conx || (conx = {}));
customElements.define("conx-button", conx.controls.Button, { extends: 'button' });
/// <reference path="../controls/button.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Softkeys extends cards.HACard {
            constructor() {
                super(...arguments);
                this.activeState = "";
                this.skdata = {};
                this.skbuttons = [];
                this.cols = 5;
                this.buttonCount = 25;
            }
            create() {
                var _a, _b, _c;
                super.create();
                this.pathRoot = ((_a = this.config) === null || _a === void 0 ? void 0 : _a.path) || "sk";
                if ("sk" !== this.pathRoot.substr(0, 2))
                    this.pathRoot = "sk/" + this.pathRoot;
                this.path = "";
                this.cols = ((_b = this.config) === null || _b === void 0 ? void 0 : _b.cols) || this.cols;
                let cols = this.cols;
                this.buttonCount = ((_c = this.config) === null || _c === void 0 ? void 0 : _c.count) || this.buttonCount;
                let gcols = "";
                for (let i = 0; i < cols; ++i)
                    gcols += " auto";
                let html = ``;
                html += `<label id="crams" class="title" style="height:16px; grid-column: 1/${cols + 1};">sk</label>`;
                html += `<button is="conx-button" id="up" class="cmd" style="width:100%; height:32px;"><ha-icon icon="${this.getIcon("up")}"></ha-icon></button>`;
                html += `<button is="conx-button" id="delete" class="cmd" style="width:100%; height:32px; grid-column: ${cols - 3};"><ha-icon icon="${this.getIcon("delete")}"></ha-icon></button>`;
                html += `<button is="conx-button" id="folder" class="cmd" style="width:100%; height:32px; grid-column: ${cols - 2};"><ha-icon icon="${this.getIcon("folder")}"></ha-icon></button>`;
                html += `<button is="conx-button" id="group" class="cmd" style="width:100%; height:32px; grid-column: ${cols - 1};"><ha-icon icon="${this.getIcon("group")}"></ha-icon></button>`;
                html += `<button is="conx-button" id="script" class="cmd" style="width:100%; height:32px; grid-column: ${cols};"><ha-icon icon="${this.getIcon("script")}"></ha-icon></button>`;
                for (let i = 0; i < this.buttonCount; ++i)
                    html += `<button is="conx-button" id="bn${i}" class="bn" style="width:100%; height:64px;"><ha-icon id="ic" icon=""></ha-icon><label id="tx"></label></button>`;
                this.innerHTML = `<div id="root" style="display: grid; grid-gap: 1px; grid-template-columns:${gcols};">${html}</div>`;
                this.root = conx.glo.findChild(this, "root");
                let bt;
                this.root['crams'] = conx.glo.findChild(this.root, 'crams');
                bt = conx.glo.findChild(this.root, 'up');
                this.root['up'] = bt;
                bt.onclick = this.onCommand.bind(this, 'up');
                bt = conx.glo.findChild(this.root, 'folder');
                this.root['folder'] = bt;
                bt.onclick = this.onCommand.bind(this, 'folder');
                bt = conx.glo.findChild(this.root, 'delete');
                this.root['delete'] = bt;
                bt.onclick = this.onCommand.bind(this, 'delete');
                bt = conx.glo.findChild(this.root, 'group');
                this.root['group'] = bt;
                bt.onclick = this.onCommand.bind(this, 'group');
                bt = conx.glo.findChild(this.root, 'script');
                this.root['script'] = bt;
                bt.onclick = this.onCommand.bind(this, 'script');
                for (let i = 0; i < this.buttonCount; ++i) {
                    bt = conx.glo.findChild(this.root, `bn${i}`);
                    bt["ic"] = conx.glo.findChild(bt, "ic");
                    bt["tx"] = conx.glo.findChild(bt, "tx");
                    this.root[`bn${i}`] = bt;
                    bt.onclick = this.onButton.bind(this, i);
                }
                this.readPath();
            }
            readPath() {
                this.Get("sk-read", this.getPath());
                this.root["crams"].textContent = this.getPath();
            }
            postCreate() {
                super.postCreate();
            }
            updateState(check) {
                if (!this.root || !this.connected)
                    return false;
                if (false == this.hasStateChanged("conx.db_change"))
                    return false;
                let state = this._hass.states["conx.db_change"];
                if (!state)
                    return false;
                let path = conx.glo.up(state.state);
                if (this.getPath() != path && this.getPath() != conx.glo.up(path))
                    return false;
                this.readPath();
                return true;
            }
            getIcon(type, data = undefined) {
                switch (type) {
                    case "up": return "mdi:arrow-up-bold";
                    case "folder": return "mdi:folder";
                    case "delete": return "mdi:delete";
                    case "group": return "mdi:lightbulb-group";
                    case "script":
                        if (!data || !(data === null || data === void 0 ? void 0 : data.domain) || !(data === null || data === void 0 ? void 0 : data.service))
                            return "mdi:script-outline";
                        let scr = data.domain + "." + data.service;
                        switch (scr) {
                            case "conx.light": return "mdi:lightning-bolt";
                            case "conx.cueplay": return "mdi:play-box";
                            case "conx.timelinestart": return "mdi:play-circle-outline";
                            case "conx.timelinestop": return "mdi:stop-circle-outline";
                            case "conx.timelinego": return "mdi:skip-next-circle-outline";
                            default: return "mdi:map-marker-question";
                        }
                }
                return "";
            }
            getPath() {
                if (this.path.length <= 0)
                    return this.pathRoot;
                return this.pathRoot + "/" + this.path;
            }
            onButton(i) {
                var _a;
                let sk = (_a = this.skbuttons) === null || _a === void 0 ? void 0 : _a[i];
                if (undefined === sk) {
                    this.conx("sk-save", "db.SaveSK", { path: this.getPath(), type: this.activeState, idx: i });
                    this.setActiveState("");
                    return;
                }
                switch (this.activeState) {
                    case "delete":
                        this.conx("sk-save", "db.SaveSK", { path: this.getPath() + "/" + sk.name, type: this.activeState, idx: i });
                        break;
                    default:
                        if ("folder" !== sk.data.type)
                            this.conx("sk-play", "db.PlaySK", { path: this.getPath() + "/" + sk.name, idx: i });
                        else {
                            this.path += ((this.path.length > 0) ? "/" : "") + sk.name + "/data";
                            this.readPath();
                        }
                        break;
                }
                this.setActiveState("");
            }
            onCommand(name) {
                conx.glo.trace("cmd", name);
                let bt;
                switch (name) {
                    case "delete":
                    case "group":
                    case "script":
                    case "folder":
                        let bt = this.root[name];
                        if (undefined !== bt) {
                            if ("reg" == bt.state)
                                this.setActiveState(name);
                            else
                                this.setActiveState("");
                        }
                        break;
                    case "up":
                        this.path = this.path.substr(0, this.path.lastIndexOf("/"));
                        this.path = this.path.substr(0, this.path.lastIndexOf("/"));
                        this.readPath();
                        break;
                }
            }
            setActiveState(v) {
                this.activeState = v;
                this.root.folder.state = "reg";
                this.root.delete.state = "reg";
                this.root.group.state = "reg";
                this.root.script.state = "reg";
                let bt = this.root[v];
                if (undefined !== bt)
                    bt.state = "sel";
            }
            onConxMsg(cmd, unq, payload, success) {
                conx.glo.trace(cmd, unq, payload, success);
                switch (unq) {
                    case "sk-read":
                        if (false === success)
                            this.skdata = {};
                        else
                            this.skdata = payload;
                        this.refreshButtons();
                }
            }
            refreshData() {
                this.skbuttons = [];
                this.skbuttons.length = this.buttonCount;
                let idx, sk;
                for (let s in this.skdata) {
                    sk = this.skdata[s];
                    idx = sk === null || sk === void 0 ? void 0 : sk.idx;
                    if (idx < this.buttonCount)
                        this.skbuttons[idx] = { name: s, data: sk };
                }
            }
            refreshButtons() {
                var _a, _b;
                this.refreshData();
                let bt, sk;
                for (let i = 0; i < this.buttonCount; ++i) {
                    bt = this.root[`bn${i}`];
                    if (!bt)
                        continue;
                    sk = this.skbuttons[i];
                    if (undefined === sk) {
                        bt.ic.icon = "";
                        bt.tx.textContent = "";
                    }
                    else {
                        bt.ic.icon = this.getIcon((_a = sk === null || sk === void 0 ? void 0 : sk.data) === null || _a === void 0 ? void 0 : _a.type, (_b = sk === null || sk === void 0 ? void 0 : sk.data) === null || _b === void 0 ? void 0 : _b.data);
                        bt.tx.textContent = sk === null || sk === void 0 ? void 0 : sk.name;
                    }
                }
            }
        }
        cards.Softkeys = Softkeys;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-softkeys', conx.cards.Softkeys);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-softkeys',
    name: 'conx-softkeys',
    description: 'Softkeys',
});
/// <reference path="../controls/button.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Live extends cards.HACard {
            constructor() {
                super(...arguments);
                this.selection = [];
                this.skdata = {};
                this.skbuttons = [];
                this.cols = 5;
                this.buttonCount = 25;
            }
            create() {
                var _a, _b;
                super.create();
                this.cols = ((_a = this.config) === null || _a === void 0 ? void 0 : _a.cols) || this.cols;
                this.buttonCount = ((_b = this.config) === null || _b === void 0 ? void 0 : _b.count) || this.buttonCount;
                let gcols = "";
                for (let i = 0; i < this.cols; ++i)
                    gcols += " auto";
                let html = ``;
                for (let i = 0; i < this.buttonCount; ++i)
                    html += `<button id="ic${i}" class="bn" style="background-color: #000000; width:100%; height:64px;"><label class"txt" id="tx" style="color: #FFFFFF">x</label></button>`;
                this.innerHTML = `<div id="root" style="display: grid; grid-gap: 1px; grid-template-columns:${gcols};">${html}</div>`;
                this.root = conx.glo.findChild(this, "root");
                let ic;
                for (let i = 0; i < this.buttonCount; ++i) {
                    ic = conx.glo.findChild(this.root, `ic${i}`);
                    ic["tx"] = conx.glo.findChild(ic, "tx");
                    this.root[`ic${i}`] = ic;
                }
                this.loadSelection();
            }
            loadSelection() {
                this.sel = this._hass.states["conx.selection"].state;
                this.conx("parse", "db.GetEntitiesNames", { selection: this.sel });
            }
            updateState(check) {
                if (!this.root || !this.connected)
                    return false;
                if (this.hasStateChanged("conx.selection")) {
                    this.loadSelection();
                    return;
                }
                let id, i, len = this.selection.length;
                for (i = 0; i < len && i < this.buttonCount; ++i) {
                    id = this.selection[i];
                    if (false == this.hasStateChanged(id))
                        continue;
                    this.refreshButton(i);
                }
                return true;
            }
            refreshSelection() {
                let ic, i, len = this.selection.length;
                for (i = 0; i < len && i < this.buttonCount; ++i) {
                    ic = this.root[`ic${i}`];
                    if (!ic)
                        continue;
                    //ic.style.visibility = "visible";
                    ic.style.display = "initial";
                    this.refreshButton(i, true);
                }
                for (; i < this.buttonCount; ++i) {
                    ic = this.root[`ic${i}`];
                    if (!ic)
                        continue;
                    //ic.style.visibility = "hidden";
                    ic.style.display = "none";
                }
            }
            refreshButton(i, name = false) {
                var _a;
                let ic = this.root[`ic${i}`];
                let id = this.selection[i];
                if (!ic || !id)
                    return;
                let state = this._hass.states[id];
                let rgba = this.stateToColor(state);
                if (!rgba)
                    return;
                if (name)
                    ic.tx.textContent = (_a = state === null || state === void 0 ? void 0 : state.attributes) === null || _a === void 0 ? void 0 : _a.friendly_name;
                ic.tx.style.color = rgba[3] > 0.5 ? "#000000" : "#FFFFFF";
                ic.style.backgroundColor = conx.glo.RGBAtoHEX(rgba[0], rgba[1], rgba[2], rgba[3]);
            }
            onConxMsg(cmd, unq, payload, success) {
                conx.glo.trace(cmd, unq, payload, success);
                switch (unq) {
                    case "parse":
                        if (false === success)
                            this.selection = [];
                        else
                            this.selection = payload;
                        this.refreshSelection();
                        break;
                }
            }
        }
        cards.Live = Live;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-live', conx.cards.Live);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-live',
    name: 'conx-live',
    description: 'Live',
});
/// <reference path="../controls/button.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards) {
        class Log extends cards.HACard {
            constructor() {
                super(...arguments);
                this.autoScroll = true;
            }
            create() {
                super.create();
                let html = ``;
                html += `<button is="conx-button" id="autoScroll" class="cmd" style="width:100%; height:32px;"><ha-icon icon="mdi:arrow-vertical-lock"></ha-icon></button>`;
                html += `<button is="conx-button" id="clear" class="cmd" style="width:100%; height:32px; grid-column:5/6"><ha-icon icon="mdi:delete-empty-outline"></ha-icon></button>`;
                html += `<div id="log" class="log" style="width:100%; height:310px; overflow: scroll; grid-column:1/6"></div>`;
                this.innerHTML = `<div id="root" style="display: grid; grid-gap: 1px; grid-template-columns: 20% 20% 20% 20% 20%;">${html}</div>`;
                this.root = conx.glo.findChild(this, "root");
                let bt;
                bt = conx.glo.findChild(this.root, 'autoScroll');
                this.root['autoScroll'] = bt;
                bt.onclick = this.onCommand.bind(this, 'autoScroll');
                bt = conx.glo.findChild(this.root, 'clear');
                this.root['clear'] = bt;
                bt.onclick = this.onCommand.bind(this, 'clear');
                this.root['log'] = conx.glo.findChild(this.root, 'log');
            }
            updateState(check) {
                if (!this.root || !this.connected)
                    return false;
                if (false == this.hasStateChanged("conx.log"))
                    return false;
                let state = this._hass.states["conx.log"];
                if (!state)
                    return false;
                this.root.log.innerHTML += state.state + "<br>";
                if (this.root.autoScroll.state == "reg")
                    this.root.log.scrollTop = this.root.log.scrollHeight;
                return true;
            }
            onCommand(name) {
                conx.glo.trace("cmd", name);
                let bt;
                switch (name) {
                    case "autoScroll":
                        if (this.root.autoScroll.state == "reg")
                            this.root.autoScroll.state = "sel";
                        else
                            this.root.autoScroll.state = "reg";
                        break;
                    case "clear":
                        this.root.log.innerHTML = "";
                        break;
                }
            }
        }
        cards.Log = Log;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-log', conx.cards.Log);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-log',
    name: 'conx-log',
    description: 'Logs messages',
});
/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />
var conx;
(function (conx) {
    var cards;
    (function (cards_1) {
        class View extends cards_1.HACard {
            create() {
                var _a, _b, _c, _d, _e, _f;
                if (!this._cards)
                    return;
                super.create();
                let gap = ((_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.layout) === null || _b === void 0 ? void 0 : _b.gap) || "2px";
                let cols = ((_d = (_c = this.config) === null || _c === void 0 ? void 0 : _c.layout) === null || _d === void 0 ? void 0 : _d.cols) || "auto auto";
                let divs = (((_f = (_e = this.config) === null || _e === void 0 ? void 0 : _e.layout) === null || _f === void 0 ? void 0 : _f.items) || "").split(",");
                let html = ``, d;
                for (let c in this._cards) {
                    d = divs === null || divs === void 0 ? void 0 : divs[c];
                    d = d ? `style="grid-column: ${d};"` : "";
                    html += `<div id="c${c}" ${d}> </div>`;
                }
                this.innerHTML = `<div id="root" style="display: grid; grid-gap: ${gap}; grid-template-columns: ${cols};">${html}</div>`;
                this.root = conx.glo.findChild(this, "root");
                this.root.divs = [];
                for (let c in this._cards)
                    this.root.divs.push(conx.glo.findChild(this, `c${c}`));
            }
            refreshCards() {
                var _a;
                if (!this._cards)
                    return;
                if (!this.root) {
                    this.create();
                }
                let div, card, editMode = !!((_a = this._lovelace) === null || _a === void 0 ? void 0 : _a.editMode);
                for (let c in this._cards) {
                    div = this.root.divs[c];
                    card = this._cards[c];
                    if (!div || !card)
                        continue;
                    conx.glo.removeChildren(div);
                    if (div.lastChild === card)
                        continue;
                    if (false == editMode)
                        div.appendChild(card);
                    else {
                        const wrapper = document.createElement("hui-card-options");
                        wrapper.hass = this.hass;
                        wrapper.lovelace = this.lovelace;
                        wrapper.path = [this.index, c];
                        card.editMode = true;
                        wrapper.appendChild(card);
                        div.appendChild(wrapper);
                    }
                }
            }
            get lovelace() { return this._lovelace; }
            set lovelace(lovelace) {
                this._lovelace = lovelace;
                this.refreshCards();
            }
            get index() { return this._index; }
            set index(index) {
                this._index = index;
                this.refreshCards();
            }
            get cards() { return this._cards; }
            set cards(cards) {
                if (this._cards !== cards) {
                    this._cards = cards;
                    this.refreshCards();
                }
            }
            get badges() { return this._badges; }
            set badges(badges) {
                this._badges = badges;
            }
        }
        cards_1.View = View;
    })(cards = conx.cards || (conx.cards = {}));
})(conx || (conx = {}));
customElements.define('conx-view', conx.cards.View);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-view',
    name: 'conx-view',
    description: 'grid view',
});
/// <reference path="conx/cards/title.ts" />
/// <reference path="conx/cards/dimmer.ts" />
/// <reference path="conx/cards/swatch.ts" />
/// <reference path="conx/cards/light-rgb.ts" />
/// <reference path="conx/cards/light-hsv.ts" />
/// <reference path="conx/cards/light-clr.ts" />
/// <reference path="conx/cards/numpad.ts" />
/// <reference path="conx/cards/softkeys.ts" />
/// <reference path="conx/cards/live.ts" />
/// <reference path="conx/cards/log.ts" />
/// <reference path="conx/cards/view.ts" />
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
                this.bg = this.findChild(`bg`);
                this.thumb = this.findChild(`thumb`);
                this.text = this.findChild(`text`);
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
                conx.glo.update(this);
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
                conx.glo.update(this, { bg: this.params.bg, thumb: this.params.thumb });
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
                this.elSlider = this.findChild(`slider`);
                this.elFrame = this.findChild(`slider-frame`);
                this.elGFrame = this.findChild(`slider-g`);
                this.elTotal = this.findChild(`slider-bar-total`);
                this.elTotal1 = this.findChild(`slider-bar-total1`);
                this.elProgress = this.findChild(`slider-bar-progress`);
                this.elTitle = this.findChild(`slider-title`);
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