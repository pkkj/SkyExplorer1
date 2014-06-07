module AST {
    export interface CollapseItemOptions {
        width?: number;
        height?: number;
    }

    export class CollapseItem {
        public divRoot: HTMLElement = null;
        public tableRef: CollapseTable = null;

        private divA: HTMLElement;
        private divB: HTMLElement;
        private ddTitle: HTMLElement;
        private ddTitleText: HTMLSpanElement;
        private width = 250;
        private height = 20;

        constructor(divRoot: HTMLElement, divA: HTMLElement, divB: HTMLElement, params: CollapseItemOptions) {
            this.divRoot = divRoot;
            this.divA = divA;
            this.divB = divB;
            this.width = 250;
            this.height = 20;

            if (params) {
                this.width = params.width ? params.width : this.width;
                this.height = params.height ? params.height : this.height;
            }

            divB.style.display = "none";

            this.ddTitle = document.createElement("div");
            this.ddTitle.className = "collapseTitle";
            this.ddTitle.style.width = this.width.toString() + "px";
            this.ddTitle.style.height = this.height.toString() + "px";

            var ddTitleDivider = document.createElement("span");
            ddTitleDivider.className = "collapseTitleDivider";

            var ddDividerArrow = document.createElement("span");
            ddDividerArrow.className = "collapseTitleDividerArrow";

            this.ddTitleText = document.createElement("span");
            this.ddTitleText.className = "collapseTitleText";
            this.ddTitleText.appendChild(divA);

            this.ddTitle.appendChild(ddTitleDivider);
            this.ddTitle.appendChild(ddDividerArrow);
            this.ddTitle.appendChild(this.ddTitleText);

            divRoot.appendChild(this.ddTitle);
            divRoot.appendChild(this.divB);
            divB.style.width = this.width.toString() + "px";

            this.ddTitle.onclick = () => {
                if (this.tableRef) {
                    this.tableRef.activeItem(this);
                }
            };
        }

        toggle() {
            if (this.divB.style.display == "none")
                this.divB.style.display = "block";
            else
                this.divB.style.display = "none";
        }

        collapse() {
            this.divB.style.display = "none";
        }

        show() {
            this.divB.style.display = "block";
        }
    }

    export interface CollapseTableOptions {
        width?: number;
    }

    export class CollapseTable {
        public divRoot: HTMLElement;
        private currentActiveItem: CollapseItem = null;
        private header: HTMLElement = null;
        private width = 250;

        constructor(divRoot: HTMLElement, params: CollapseTableOptions) {
            this.divRoot = divRoot;
            if (params) {
                this.width = params.width ? params.width : this.width;
            }
        }

        addHeader(header: HTMLElement) {
            this.header = header;
        }

        addItem(item: CollapseItem) {
            this.divRoot.appendChild(item.divRoot);
            this.divRoot.appendChild(this.createHDivider());
            item.tableRef = this;
        }

        activeItem(item: CollapseItem) {
            if (this.currentActiveItem) {
                this.currentActiveItem.collapse();
            }
            if (this.currentActiveItem == item) {
                this.currentActiveItem = null;
                return;
            }
            this.currentActiveItem = item;
            item.show();
        }

        clear() {
            while (this.divRoot.firstChild) {
                this.divRoot.removeChild(this.divRoot.firstChild);
            }
            if (this.header) {
                this.divRoot.appendChild(this.createHDivider());
                this.divRoot.appendChild(this.header);
                this.divRoot.appendChild(this.createHDivider());
            }
        }

        createHDivider() {
            return Utils.createElement("div", { "class": "collapseTableItemHBorder", "width": (this.width + 2).toString() + "px" });
        }
    }
} 