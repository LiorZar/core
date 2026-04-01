namespace conx.controls {
    export class utils {
        public static readonly ns = "http://www.w3.org/2000/svg"

        public static readonly Style = (props: any) => {
            let combinedString: string[] = [];
            for (let k in props) {
                let v = props[k]
                k = k.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
                combinedString.push(`${k}:${v}`)
            }
            return combinedString.join(";")
        }

        public static readonly SVGGroup = (props: any) => {
            let g = document.createElementNS(utils.ns, "g");
            g.id = props.id;
            return g
        }

        public static readonly SVGRect = (props: any) => {
            let rect = document.createElementNS(utils.ns, "rect")
            let x, y, rx, ry, width, height, style

            x = (props.x) ? props.x : 0;
            y = (props.y) ? props.y : 0;
            rx = (props.rx) ? props.rx : 0;
            ry = (props.ry) ? props.ry : 0;
            width = (props.width) ? props.width : "100%";
            height = (props.height) ? props.height : "100%";
            style = (props.style) ? utils.Style(props.style) : ""

            rect.setAttribute("x", x)
            rect.setAttribute("y", y)
            rect.setAttribute("rx", rx)
            rect.setAttribute("ry", ry)
            rect.setAttribute("width", width)
            rect.setAttribute("height", height)
            rect.setAttribute("style", style)

            if (props.id) rect.id = props.id

            return rect;
        }

        public static readonly SVGImage = (props: any) => {
            let img = document.createElementNS(utils.ns, "image")
            let x, y, width, height, style, visibility, preserveAspectRatio;

            x = (props.x) ? props.x : 0
            y = (props.y) ? props.y : 0
            width = (props.width) ? props.width : "100%";
            height = (props.height) ? props.height : "100%";
            style = (props.style) ? utils.Style(props.style) : ""
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


            if (props.id) img.id = props.id

            return img;
        }

        public static readonly SVGText = (props: any) => {
            let text = document.createElementNS(utils.ns, "text")
            let x, y, style, width, height, content

            x = (props.x) ? props.x : 0
            y = (props.y) ? props.y : 0
            width = (props.width) ? props.width : "100%"
            height = (props.height) ? props.height : "100%"
            style = (props.style) ? utils.Style(props.style) : ""
            content = (props.text) ? props.text : ""

            text.setAttribute("x", x)
            text.setAttribute("y", y)
            text.setAttribute("style", style)
            text.setAttribute("width", width)
            text.setAttribute("height", height)
            text.textContent = content;

            if (props.id) text.id = props.id

            return text;
        }

        public static readonly SVGPath = (props: any) => {
            let path = document.createElementNS(utils.ns, "path")

            path.setAttribute("d", props.d)
            path.setAttribute("style", utils.Style(props.style))
            path.id = props.id

            return path
        }

        public static readonly SVGCircle = (props: any) => {
            let circle = document.createElementNS(utils.ns, "circle")
            circle.id = props.id
            circle.setAttribute("cx", props.cx)
            circle.setAttribute("cy", props.cy)
            circle.setAttribute("r", props.r)
            circle.setAttribute("style", utils.Style(props.style))

            return circle
        }

        public static readonly SVGArc = (props: any) => {
            const cos = Math.cos;
            const sin = Math.sin;
            const PI = Math.PI;
            const f_matrix_times = ((A: number[][], B: number[]) => [A[0][0] * B[0] + A[0][1] * B[1], A[1][0] * B[0] + A[1][1] * B[1]]);
            const f_rotate_matrix = ((x: number) => {
                const cosx = cos(x);
                const sinx = sin(x);
                return [[cosx, -sinx], [sinx, cosx]];
            });
            const f_vec_add = ((A: number[], B: number[]) => [A[0] + B[0], A[1] + B[1]]);
            const f_svg_ellipse_arc = ((C: number[], R: number[], D: number[], fai: number) => {
                D[1] = D[1] % (2 * PI);
                const rotMatrix = f_rotate_matrix(fai);
                const [sX, sY] = (f_vec_add(f_matrix_times(rotMatrix, [R[0] * cos(D[0]), R[1] * sin(D[0])]), [C[0], C[1]]));
                const [eX, eY] = (f_vec_add(f_matrix_times(rotMatrix, [R[0] * cos(D[0] + D[1]), R[1] * sin(D[0] + D[1])]), [C[0], C[1]]));
                const fA = ((D[1] > PI) ? 1 : 0);
                const fS = ((D[1] > 0) ? 1 : 0);
                return [" M ", sX, " ", sY, " A ", R[0], R[1], fai / PI * 180, fA, fS, eX, eY];
            });

            let params = f_svg_ellipse_arc([props.cx, props.cy], [props.rx, props.ry], [props.t1 * PI / 180, props.DELTA * PI / 180], props.FAI * PI / 180)

            return params
        }
        // Calculate angle between two vector
        public static readonly GetAngle = (x1: number, y1: number, x2: number, y2: number) => {
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
        }
    }
}