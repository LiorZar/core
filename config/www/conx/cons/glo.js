export class glo {
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
    static trace(...args) {
        console.log.apply(null, args);
    }

    static grad(cmd) {
        switch (cmd) {
            case "hhue": return `
                <linearGradient id="hue" >
                    <stop offset="0.000" style="stop-color:rgb(255,0,0);" />
                    <stop offset="0.166" style="stop-color:rgb(255,255,0);" />
                    <stop offset="0.333" style="stop-color:rgb(0,255,0);" />
                    <stop offset="0.500" style="stop-color:rgb(0,255,255);" />
                    <stop offset="0.667" style="stop-color:rgb(0,0,255);" />
                    <stop offset="1.000" style="stop-color:rgb(255,0,255);" />
                </linearGradient>
                `;

            case "vhue": return `
                <linearGradient id="hue" gradientTransform="rotate(90)">
                    <stop offset="0.0" style="stop-color:rgb(255,0,255);" />
                    <stop offset="0.2" style="stop-color:rgb(0,0,255);" />
                    <stop offset="0.4" style="stop-color:rgb(0,255,255);" />
                    <stop offset="0.6" style="stop-color:rgb(0,255,0);" />
                    <stop offset="0.8" style="stop-color:rgb(255,255,0);" />
                    <stop offset="1.0" style="stop-color:rgb(255,0,0);" />
                </linearGradient>
                `;
        }
        return null;
    }

}