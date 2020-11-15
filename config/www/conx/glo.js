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

}