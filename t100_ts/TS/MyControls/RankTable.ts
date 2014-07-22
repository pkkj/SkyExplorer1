
module AST {
    export interface RankTableOptions {
        width?: number;
        itemNameWidth?: number;
        itemColor?: string;
    }

    export class RankTable {
        private divRoot: HTMLElement = null;
        private itemColor = "gold";
        private width = 260;
        private itemNameWidth = 190;

        constructor(divRoot: HTMLElement, params?: RankTableOptions) {
            this.divRoot = divRoot;
            this.divRoot.className = "myRank";

            if (params) {
                this.width = params.width ? params.width : this.width;
                this.itemNameWidth = params.itemNameWidth ? params.itemNameWidth : this.itemNameWidth;
                this.itemColor = params.itemColor ? params.itemColor : this.itemColor;
            }

            // set up the list
            this.divRoot.style.width = this.width.toString() + "px";
            this.divRoot.appendChild(Utils.createElement("div", { "class": "myrankItemHBorder", "width": this.width.toString() + "px" }));
        }

        public addItem(textUp: string, textDown: string, flow: string, ratio: number) {
            var divItem: HTMLElement = Utils.createElement("div", { "class": "myRankItem" });
            var divLeft: HTMLElement = Utils.createElement("div", { "class": "myrankItemLeft", "width": this.itemNameWidth.toString() + "px" });

            var indicatorWidth: string = Math.ceil(this.itemNameWidth * ratio).toString() + "px";

            var divItemIndicator: HTMLElement = Utils.createElement("div", { "class": "myRankColorIndicator", "width": indicatorWidth });
            divItemIndicator.style.backgroundColor = this.itemColor;
            var divItemName: HTMLElement = Utils.createElement("div", { "class": "myRankItemName", "width": (this.itemNameWidth - 6).toString() + "px" });
            var itemAText: string = textUp;
            var divItemA: HTMLElement = Utils.createElement("div", { "class": "myRankItemNameInnerA", "text": itemAText });

            var itemBText: string = textDown;
            var divItemB: HTMLElement = Utils.createElement("div", { "class": "myRankItemNameInnerB", "text": itemBText });

            divItemName.appendChild(divItemA);
            divItemName.appendChild(divItemB);

            divLeft.appendChild(divItemIndicator);
            divLeft.appendChild(divItemName);
            var divSplit: HTMLElement = Utils.createElement("div", { "class": "myrankItemVBorder" });
            var divRight: HTMLElement = Utils.createElement("div", { "class": "myrankItemRight", "text": flow == null ? "" : flow });

            divItem.appendChild(divLeft);
            divItem.appendChild(divSplit);
            divItem.appendChild(divRight);
            divItem.appendChild(Utils.createElement("div", { "class": "clear" }));

            this.divRoot.appendChild(divItem);
            this.divRoot.appendChild(Utils.createElement("div", { "class": "myrankItemHBorder", "width": this.width.toString() + "px" }));

        }

        public showMessage(message: string) {
            this.divRoot.innerHTML = message;
        }

        public clear() {
            while (this.divRoot.firstChild) {
                this.divRoot.removeChild(this.divRoot.firstChild);
            }
            this.divRoot.appendChild(Utils.createElement("div", { "class": "myrankItemHBorder", "width": this.width.toString() + "px" }));
        }
    }
} 