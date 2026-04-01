/// <reference path="HACard.ts" />

namespace conx.cards {
    export class Layout extends HACard {
        protected layout: any;
        protected _lovelace: any;
        protected _index: number;
        protected _cards: any[];
        protected _badges: any[];

        protected setConfig(config: any): void {
            super.setConfig(config);
            this._cards = config.cards.map((card: any) => {
                const type = glo.removeCustom(card.type);
                const element = document.createElement(type) as any;
                if (element.setConfig)
                    element.setConfig(card);
                if (this.hass)
                    element.hass = this.hass;
                return element;
            });
        }
        protected create(): void {
            super.create();
            if (!this._cards)
                return;

            this.updateState(false);

            this.createHTML();
            this.refreshCards();
        }
        protected createHTML(): void {

        }
        protected override updateState(check: boolean): boolean {
            super.updateState(check);
            if (!this._cards)
                return;
            const hass = this.hass;
            for (let c in this._cards) {
                const card = this._cards[c];
                if (!card)
                    continue;

                card.hass = hass;
            }
        }
        protected refreshCards(): void {
            if (!this._cards)
                return;

            if (!this.root)
                this.create();
            if (!this.layout)
                return;
            let card: any;
            for (let c in this._cards) {
                card = this._cards[c];
                if (!card)
                    continue;

                this.layout.appendChild(card);
            }
        }
        public get lovelace(): any { return this._lovelace; }
        public set lovelace(lovelace: any) {
            this._lovelace = lovelace;
            this.refreshCards();
        }

        public get index(): any { return this._index; }
        public set index(index: any) {
            this._index = index;
            this.refreshCards();
        }

        public get cards(): any { return this._cards; }
        public set cards(cards: any) {
            if (this._cards !== cards) {
                this._cards = cards;
                this.refreshCards();
            }
        }

        public get badges(): any { return this._badges; }
        public set badges(badges: any) {
            this._badges = badges;
        }
    }
}
