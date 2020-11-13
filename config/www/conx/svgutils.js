export const g_ns = "http://www.w3.org/2000/svg"

export const SVGStyle = (props) => {
    let styleString = Object.entries(props).map(([k, v]) => {
            k = k.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
            return (`${k}:${v}`)
        }
    )
    return styleString.join(";")
}

export const SVGGroup = (props) => {
    let g = document.createElementNS(g_ns, "g")
    g.id = props.id
    return g
}

export const SVGRect = (props) => {
    let rect = document.createElementNS(g_ns, "rect")
    let x, y, rx, ry, width, height, style

    x      = (props.x)? props.x : 0
    y      = (props.y)? props.y : 0
    rx     = (props.rx)? props.rx : 0
    ry     = (props.ry)? props.ry : 0
    width  = props.width
    height = props.height
    style  = (props.style)? SVGStyle(props.style) : ""

    rect.setAttribute("x", x)
    rect.setAttribute("y", y)
    rect.setAttribute("rx", rx)
    rect.setAttribute("ry", ry)
    rect.setAttribute("width", width)
    rect.setAttribute("height", height)
    rect.setAttribute("style", style)

    if(props.id) rect.id = props.id

    return rect;
}

export const SVGText = (props) => {
    let text = document.createElementNS(g_ns, "text")
    let x, y, style, width, height, content

    x      = (props.x)? props.x : 0
    y      = (props.y)? props.y : 0
    width  = (props.width)? props.width : "100%"
    height = (props.height)? props.height : "100%"
    style  = (props.style)? SVGStyle(props.style) : ""
    content= (props.text)? props.text : ""

    text.setAttribute("x", x)
    text.setAttribute("y", y)
    text.setAttribute("style", style)
    text.setAttribute("width", width)
    text.setAttribute("height", height)
    text.textContent = content;

    if(props.id) text.id = props.id

    return text;
}

export const SVGPath = (props) => {
    let path = document.createElementNS(g_ns, "path")

    path.setAttribute("d", props.d)
    path.setAttribute("style", SVGStyle(props.style))
    path.id = props.id

    return path
}

export const SVGCircle = (props) => {
    let circle = document.createElementNS(g_ns, "circle")
    circle.id = props.id
    circle.setAttribute("cx", props.cx)
    circle.setAttribute("cy", props.cy)
    circle.setAttribute("r", props.r)
    circle.setAttribute("style", SVGStyle(props.style))

    return circle
}

export const SVGArc = (props) => {
    const cos = Math.cos;
    const sin = Math.sin;
    const PI = Math.PI;
    const f_matrix_times = (([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y]);
    const f_rotate_matrix = ((x) => {
        const cosx = cos(x);
        const sinx = sin(x);
        return [[cosx, -sinx], [sinx, cosx]];
    });
    const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);
    const f_svg_ellipse_arc = (([cx, cy], [rx, ry], [t1, delta], fai) => {
        /*
        cx,cy → center of ellipse.
        rx,ry → major minor radius.
        t1 → start angle, in radian.
        delta → angle to sweep, in radian. positive.
        fai → rotation on the whole, in radian.
        */
        delta = delta % (2 * PI);
        const rotMatrix = f_rotate_matrix(fai);
        const [sX, sY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1), ry * sin(t1)]), [cx, cy]));
        const [eX, eY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1 + delta), ry * sin(t1 + delta)]), [cx, cy]));
        const fA = ((delta > PI) ? 1 : 0);
        const fS = ((delta > 0) ? 1 : 0);
        return [" M ", sX, " ", sY, " A ", rx, ry, fai / PI * 180, fA, fS, eX, eY];
    });
    
    let params = f_svg_ellipse_arc([props.cx,props.cy],[props.rx,props.ry], [props.t1*PI/180, props.DELTA*PI/180], props.FAI*PI/180)

    return params
}
// Calculate angle between two vector
export const GetAngle = (x1, y1, x2, y2) => {
    let distY = (y2-y1);
    let distX = (x2-x1);
    let dist  = Math.sqrt((distY*distY)+(distX*distX));
    let val, aSine;

    if(distY <= 0)
    {
        val = distX/dist;
        aSine = Math.asin(val);
    }
    else{
        val = distX/dist;
        aSine = -1*Math.PI-Math.asin(val);
    }
    return aSine;
}
