
module AST {
    export interface SimpleTableOptions {
        width?: number;
    }

    export class SimpleTable {
        private divRoot: HTMLElement;
        private width = 260;
        private itemCnt = 0;

        constructor(divRoot: HTMLElement, params: SimpleTableOptions) {
            this.divRoot = divRoot;
            this.divRoot.className = "simpleTable";

            if (params) {
                this.width = params.width ? params.width : this.width;
            }

            // set up the list
            this.divRoot.style.width = this.width.toString() + "px";
            this.divRoot.appendChild(Utils.createElement("div", { "class": "simpleTableHBorder", "width": (this.width + 2).toString() + "px" }));
        }

        public addItem(item: HTMLElement) {
            item.style.width = this.width.toString() + "px";
            item.className = "simpleTableItem";
            if (this.itemCnt % 2 == 0) {
                item.className += " alt";
            }
            this.divRoot.appendChild(item);
            this.divRoot.appendChild(Utils.createElement("div", { "class": "simpleTableHBorder", "width": (this.width + 2).toString() + "px" }));
            this.itemCnt += 1;
        }

        public clear() {
            while (this.divRoot.firstChild) {
                this.divRoot.removeChild(this.divRoot.firstChild);
            }
            this.itemCnt = 0;
            this.divRoot.appendChild(Utils.createElement("div", { "class": "simpleTableHBorder", "width": (this.width + 2).toString() + "px" }));
        }
    }
}  