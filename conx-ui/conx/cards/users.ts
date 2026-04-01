/// <reference path="../controls/slider.ts" />
/// <reference path="HACard.ts" />

namespace conx.cards {
    export class Users extends HACard {
        protected table: HTMLElement | null;
        protected tbody: HTMLElement | null;
        protected users: any[] = [];
        protected refreshTime: number = 60;

        protected create(): void {
            super.create();
            this.innerHTML =
                `
            <link rel="stylesheet" href="/local/conx.css?v=1">
            <div id="root" class="table-container">
                <table id="table" class="table">
                    <thead>
                        <tr>
                            <th class="th">Name</th>
                            <th class="th">active</th>
                            <th class="th">Admin</th>
                        </tr>
                    </thead>
                    <tbody id="tbody">
                    </tbody>
                </table>
            `;
            this.root = glo.findChild(this, "root");
            this.table = glo.findChild(this.root, "table");
            this.tbody = glo.findChild(this.table, "tbody");
            this.refreshTime = this.cfg?.refreshTime || 60;
            this.addEventListener("dblclick", this.onDblClick.bind(this));

            this.GetConnections("conns");
        }
        protected postCreate(): void {
            super.postCreate();
        }
        protected onDblClick(ev: MouseEvent): void {
            this.GetConnections("conns");
        }
        protected refreshUsers(): void {
            this.tbody.innerHTML = "";
            this.users.forEach((user: any) => {
                let tr = document.createElement("tr");
                let td = document.createElement("td");
                td.className = "td";
                td.innerText = user.name;
                tr.appendChild(td);

                td = document.createElement("td");
                td.className = "td";
                td.innerText = user.active ? "yes" : "no";
                tr.appendChild(td);

                td = document.createElement("td");
                td.className = "td";
                td.innerText = user.admin ? "yes" : "no";
                tr.appendChild(td);

                this.tbody.appendChild(tr);
            });
            glo.updateCSS(this.tbody, this.css);

            setTimeout(() => {
                this.GetConnections("conns");
            }, 1000 * this.refreshTime);

        }

        public static getStubConfig(hass: any, entities: string[], entitiesFallback: string[]): any {
            return {
                type: "custom:conx-users",
                refreshTime: 60,
                css: `{
    "table": { "width": "100%", "border-collapse":"collapse" }, 
    "th": { "border": "1px solid white", "padding": "8px", "textAlign": "center", "position": "sticky", "top": "0", "backgroundColor": "#1f1f1f" }, 
    "td": { "border": "1px solid white", "padding": "8px", "textAlign": "center" }, 
    "table-container": { "maxHeight": "300px", "overflowY": "auto" }
}`
            };
        }
        protected onConxMsg(cmd: string, unq: string, payload: any, success: boolean): void {
            // trace.log(cmd, unq, payload, success)
            switch (unq) {
                case "conns":
                    if (true === success)
                        this.users = payload;
                    else
                        this.users = [];
                    this.refreshUsers();
                    break;
            }
        }
    }

}

customElements.define('conx-users', conx.cards.Users);
conx.glo.wnd.customCards = conx.glo.wnd.customCards || [];
conx.glo.wnd.customCards.push({
    type: 'conx-users',
    name: 'conx-users',
    description: 'shows connected users',
});