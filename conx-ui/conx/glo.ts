/// <reference path="../lib/js-yaml.min.js" />

namespace conx {
    export class glo {
        //static isMobile: boolean = true;
        static isMobile: boolean = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        static DPI: number = window.devicePixelRatio;
        static MPI: number = 100.0 / (76.0 * window.devicePixelRatio / 2.54);
        static get wnd(): any {
            return window;
        }
        static get lib(): any {
            return this.wnd.conxlib;
        }
        static async wait(ms: number) {
            return new Promise(resolve => {
                setTimeout(resolve, ms);
            });
        }
        static delay(ms: number, _this: any, fn: any, ...args: [any?, ...any[]]): number {
            return setTimeout(() => {
                fn.apply(_this, args);
            }, ms);
        }
        static get yaml(): any {
            return this.wnd.jsyaml;
        }
        static get time(): number {
            return (new Date).getTime();
        }

        static isNull(v: any, d: any): any {
            return undefined !== v && null !== v ? v : d;
        }

        static isNaN(v: any, d: any): any {
            return isNaN(v) ? d : v;
        }
        static set(root: any, ids: string[], val: any, key: string, types: string[]) {
            let i: number;
            for (i = 0; i < ids.length - 1; ++i) {
                if (!root[ids[i]])
                    root[ids[i]] = {};
                root = root[ids[i]];
                if (key && i < types.length) {
                    root[key] = types[i];
                }
            }
            i = ids.length - 1;
            root[ids[i]] = val;
            if (key && i < types.length) {
                val[key] = types[i];
            }
        }
        static get(root: any, path: string, spliter: string): any {
            let ids: string[] = path.split(spliter);
            for (let i: number = 0; root && i < ids.length; ++i)
                if (ids[i] && ids[i].length > 0)
                    root = root?.[ids[i]];

            return root;
        }
        static up(val: string, delimeter: string = "/"): string {
            return val.substr(0, val.lastIndexOf(delimeter));
        }
        static top(val: string, delimeter: string = "/"): string {
            return val.substr(val.lastIndexOf(delimeter) + 1);
        }
        static isVisible(value: any, isAdmin: boolean): boolean {
            return undefined === value || true === value || ("admin" === value && isAdmin);
        }
        static getChild(_this: any, id: string): any {
            let node: any = _this, ids: string[] = id.split("."), i: number, len: number = ids.length;
            for (i = 0; undefined !== node && i < len; ++i) {
                node = node[ids[i]]
            }
            if (undefined !== node)
                return node;

            node = _this;
            let j: number, clen: number, res: any;
            for (i = 0; undefined !== node && i < len; ++i) {
                res = undefined;
                clen = node.children.length;
                for (j = 0; j < clen; ++j) {
                    if (node.children[j].id === ids[i]) {
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

        static findChild(node: any, id: string): any {
            if (node.id === id)
                return node;

            let len = node.children.length, res;
            for (let i = 0; i < len; ++i) {
                res = this.findChild(node.children[i], id);
                if (null !== res)
                    return res;
            }
            return null;
        }

        static removeChildren(node: any): void {
            while (node.firstChild) {
                node.removeChild(node.lastChild);
            }
        }

        static findCSS(node: any, css: string, res: any[] = undefined): any[] {
            if (undefined === res)
                res = [];
            if (node.className === css) {
                res.push(node);
                return res;
            }

            let len = node.children.length;
            for (let i = 0; i < len; ++i)
                this.findCSS(node.children[i], css, res);

            return res;
        }
        public static setStyle(child: any, style: any): void {
            for (let att in style) {
                let _att = att.replace(/-[a-z]/g, match => `${match.substr(1).toUpperCase()}`);
                child.style[_att] = style[att];
            }
        }

        public static setAtts(child: any, childAtts: any): void {
            let value;
            for (let att in childAtts) {
                value = this.fixOrigin(childAtts[att]);
                if ("style" !== att) {
                    if ("visibility" === att)
                        child.setAttribute(att, value);
                    else {
                        if (child.hasAttribute(att))
                            child.setAttribute(att, value);
                        else if (undefined !== child[att])
                            child[att] = value;
                    }
                }
                else
                    this.setStyle(child, value);
            }
        }
        public static navigate(path: string): void {
            window.history.pushState("", null, path);
            window.dispatchEvent(new Event("location-changed"));
        }
        public static fixOrigin(str: string): string {
            if (typeof str !== "string")
                return str;
            const org = window.location.origin;
            return str.split("$org$").join(org);
        }
        public static fixParams(str: string, params: string[]): string {
            if (typeof str !== "string")
                return str;

            const len = params.length;
            for (let i = 0; i < len; ++i)
                str = str.split(`$${i + 1}`).join(params[i]);

            return str;
        }
        public static fix(org: any, data: any): void {
            for (let a in data) {
                if (!org?.[a])
                    org[a] = data[a];
            }
        }
        public static fixByYAML(org: any, yaml: string): void {
            const data = this.yaml.load(yaml);
            if (!data)
                return;
            this.fix(org, data);
        }
        public static fixByJSON(org: any, json: string): void {
            const data = JSON.parse(json);
            if (!data)
                return;
            this.fix(org, data);
        }
        public static updateCSS(_this: any, csss: any = undefined): void {
            if (!csss)
                return;

            let cssArr: string[], nodes: any, node: any, style: any, type: string, i: number, len: number;
            for (let cssId in csss) {
                cssArr = cssId.split("-");
                nodes = this.findCSS(_this, cssArr[0]);
                style = csss[cssId];
                type = cssArr.length <= 1 ? "reg" : cssArr[1];
                len = nodes.length;
                for (i = 0; i < len; ++i)
                    this.updateNodeStyle(nodes[i], style, type);
            }
            for (let cssId in csss) {
                cssArr = cssId.split("-");
                if ("#" !== cssArr[0][0])
                    continue;
                cssArr[0] = cssArr[0].substring(1);
                node = this.findChild(_this, cssArr[0]);
                if (!node)
                    continue;
                style = csss[cssId];
                type = cssArr.length <= 1 ? "reg" : cssArr[1];
                this.updateNodeStyle(node, style, type);
            }
        }
        public static updateNodeStyle(node: any, style: any, type: string): void {
            if ("reg" === type)
                this.setStyle(node, style);
            if (undefined !== node?.css)
                node.css[type] = style;
        }

        public static update(_this: any, atts: any = undefined): void {
            atts = atts || _this?.params;
            if (!atts)
                return;

            let child: any, childAtts: any;
            for (let childId in atts) {
                child = this.getChild(_this, childId);
                if (undefined === child)
                    continue;
                this.updateChild(child, atts[childId]);
            }
            childAtts = atts["root"];
            if (undefined !== childAtts) {
                this.setAtts(_this, childAtts);
            }
        }

        public static updateChild(child: any, atts: any): void {
            if (undefined !== child?.updateParams)
                child.updateParams(atts);
            else
                this.setAtts(child, atts);
        }

        static clamp(val: number, minVal: number, maxVal: number): number {
            return Math.max(minVal, Math.min(maxVal, val));
        }
        static zclamp(val: number): number {
            return this.clamp(val, 0, 1);
        }

        static JSON(data: string): any {
            if (!!data)
                return JSON.parse(data);
            return {};
        }

        static copy(dst: any, src: any, override: boolean): void {
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

        static attributesToObject(_atts: NamedNodeMap): any {
            let atts = Array.prototype.slice.call(_atts);
            let res: any = {};
            for (let i in atts) {
                if ("locals" === atts[i].name || "params" === atts[i].name)
                    continue;
                res[atts[i].name] = atts[i].value;
            }

            return res;
        }
        static searchAttributes(part: string, _obj: any, toNum: boolean): any[] | undefined {
            const res: any[] = [];
            for (let a in _obj) {
                if (0 === a.indexOf(part)) {
                    if (!toNum)
                        res.push(a);
                    else
                        res.push(parseInt(a.split(part)[1]));
                }
            }
            if (res.length <= 0)
                return undefined;
            if (toNum)
                return res.sort((a, b) => a - b);
            return res;
        }
        static RGBtoHEX(r: number, g: number, b: number): string {
            r = Math.floor(r * 255), g = Math.floor(g * 255), b = Math.floor(b * 255);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        static RGBtoHEXv(rgb: number[]): string {
            return this.RGBtoHEX(rgb[0], rgb[1], rgb[2])
        }
        static HSVtoRGB(h: number, s: number, v: number): number[] {
            let r: number, g: number, b: number, i: number, f: number, p: number, q: number, t: number;
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }
            return [r, g, b];
        }

        static RGBtoHSV(r: number, g: number, b: number): number[] {
            r = Math.floor(r * 255), g = Math.floor(g * 255), b = Math.floor(b * 255);
            let max: number = Math.max(r, g, b), min: number = Math.min(r, g, b),
                d = max - min,
                h,
                s = (max === 0 ? 0 : d / max),
                v = max / 255;

            switch (max) {
                case min: h = 0; break;
                case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
                case g: h = (b - r) + d * 2; h /= 6 * d; break;
                case b: h = (r - g) + d * 4; h /= 6 * d; break;
            }

            return [h, s, v];
        }
        static HEXtoRGB(hex: string): number[] {
            const A = hex.length < 9 ? 255 : parseInt('0x' + hex[7] + hex[8], 16);
            return [parseInt('0x' + hex[1] + hex[2], 16), parseInt('0x' + hex[3] + hex[4], 16), parseInt('0x' + hex[5] + hex[6], 16), A];
        }
        static HEXtoRGBv(hex: string): number[] {
            let rgb = this.HEXtoRGB(hex);
            rgb[0] = this.clamp(rgb[0] / 255.0, 0, 1);
            rgb[1] = this.clamp(rgb[1] / 255.0, 0, 1);
            rgb[2] = this.clamp(rgb[2] / 255.0, 0, 1);
            rgb[3] = this.clamp(rgb[3] / 255.0, 0, 1);
            return rgb;
        }
        static HSVtoHEX(h: number, s: number, v: number): string {
            let rgb = this.HSVtoRGB(h, s, v);
            return this.RGBtoHEX(rgb[0], rgb[1], rgb[2]);
        }

        static RGBAtoHEX(r: number, g: number, b: number, a: number): string {
            let hsv = this.RGBtoHSV(r, g, b);
            hsv[2] = a;
            let rgb = this.HSVtoRGB(hsv[0], hsv[1], hsv[2]);
            return this.RGBtoHEX(rgb[0], rgb[1], rgb[2]);
        }
        static RGBAHStoCode(rgb: number[]): string {
            let str = "", len = rgb.length, f;
            for (let i = 0; i < len; ++i) {
                f = rgb[i];
                if (f >= 1)
                    str += "FL,";
                else if (f <= 0)
                    str += "zr,";
                else {
                    f = Math.floor(f * 100);
                    str += f.toString() + ",";
                }
            }

            return str.substring(0, str.length - 1);
        }
        static toNums(seq: string): number[] {
            let parts = seq.split("|"), inc: number = 1, sign: number = 1;
            if (parts.length > 1)
                inc = parseFloat(parts[1]);

            let nums = parts[0].split(">");
            if (nums.length < 2)
                return [parseFloat(nums[0])];

            let a = parseFloat(nums[0]),
                b = parseFloat(nums[1]);
            if (a > b) {
                inc = -inc;
                sign = -1;
            }

            let res: number[] = [];
            for (; a * sign <= b * sign; a += inc)
                res.push(a);

            return res;
        }

        static removeItems(res: number[], items: number[]): void {
            let i: number, len: number = items.length, index: number;
            for (i = 0; i < len; ++i) {
                index = res.indexOf(items[i]);
                if (-1 !== index)
                    res.splice(index, 1);
            }
        }

        static ParseSelection(data: string): string[] {
            if (!data) return [];
            let names: string[] = [];
            let entities = data.split(",");
            let i: number, len: number = entities.length;
            for (i = 0; i < len; ++i) {
                let entity = entities[i];
                let parts = entity.split(";");
                if (parts.length < 2) {
                    names.push(parts[0].trim());
                    continue;
                }
                if (parts.length > 2)
                    continue;

                let res: number[] = [];
                let name = parts[0].trim();
                let seqs = parts[1].split(/([+]|[-])/);
                let tlen = seqs.length, j;
                for (j = 0; j < tlen; j += 2) {
                    let s = this.toNums(seqs[j]);
                    if (0 === j || "+" === seqs[j - 1])
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

        private static gid: number = 1;
        static get GID(): string { return "g" + ++this.gid; }
        static Guid(): string {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        static readonly TAG_SUFFIX = "card";
        static readonly CUSTOM_TYPE_PREFIX = "custom:";
        static removeCustom(str: string): string {
            if (this.CUSTOM_TYPE_PREFIX !== str.substring(0, this.CUSTOM_TYPE_PREFIX.length))
                return `hui-${str}-${this.TAG_SUFFIX}`;
            return str.slice(this.CUSTOM_TYPE_PREFIX.length);
        }

        public static clipboard = (function (window, document, navigator) {
            let textArea: any, copy: any;

            function isOS() {
                return navigator.userAgent.match(/ipad|iphone/i);
            }

            function createTextArea(text: any) {
                textArea = document.createElement('textArea');
                textArea.value = text;
                document.body.appendChild(textArea);
            }

            function selectText() {
                var range,
                    selection;

                if (isOS()) {
                    range = document.createRange();
                    range.selectNodeContents(textArea);
                    selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    textArea.setSelectionRange(0, 999999);
                } else {
                    textArea.select();
                }
            }

            function copyToClipboard() {
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            copy = function (text: any) {
                createTextArea(text);
                selectText();
                copyToClipboard();
            };

            return {
                copy: copy
            };
        })(window, document, navigator);
    }


    interface ITrace {
        log(...args: [any?, ...any[]]): void;
        warn(...args: [any?, ...any[]]): void;
        clear(): void;
    }
    class Trace {
        constructor() {
            const con = console as any, that = this as any;
            for (const m in con) {
                if (typeof con[m] === 'function')
                    that[m] = con[m].bind(window.console);
            }
            window.console = this as any;
        }
    }
    export const trace: ITrace = new Trace() as any;

    function loadScriptOnce(src: string): Promise<void> {
        const key: string = `__load_${src}`;
        if (glo.wnd[key]) return glo.wnd[key];

        glo.wnd[key] = new Promise<void>((resolve, reject) => {
            // already loaded?
            const already = [...document.scripts].some(s => s.src.includes(src));
            if (already) return resolve();

            const s = document.createElement("script");
            s.src = src;
            s.async = false; // preserve order as much as possible
            s.onload = () => resolve();
            s.onerror = (e) => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(s);
        });

        return glo.wnd[key];
    }
    loadScriptOnce("/local/conxlib.js");
}
