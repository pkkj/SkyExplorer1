module AST {
    export interface DropDownOptions {
        titleWidth?: number;
        titleHeight?: number;
        containerMaxHeight?: number;
    }

    export class DropDown {
        // DOM elements
        private divRoot: HTMLElement = null;
        private ddTitle: HTMLElement = null;
        private ddTitleText: HTMLElement = null;
        private ddItemContainer: HTMLElement = null;

        private titleWidth = 100;
        private titleHeight = 20;
        private containerMaxHeight = 300;
        private previousScrollPosition = 0;
        
        private onChangedEvent = $.Event("selectionChanged");
        private titleClicked: boolean = false;

        // Selected DOM elements and data
        public dataItems: any[] = [];
        public selectedDomElement: HTMLElement = null;
        public selectedData = null;

        // Public events and other objects
        public onChangeHandler: () => void = null;
        public enable: boolean = true;

        constructor(divRoot: HTMLElement, params?: DropDownOptions) {
            this.divRoot = divRoot;
            if (params) {
                this.titleWidth = params.titleWidth ? params.titleWidth : this.titleWidth;
                this.titleHeight = params.titleHeight ? params.titleHeight : this.titleHeight;
                this.containerMaxHeight = params.containerMaxHeight ? params.containerMaxHeight : this.containerMaxHeight;
            }
            this.init();
        }

        insertItem(item: HTMLElement, data, params?: Object) {
            var selectable = true;

            if (params) {
                selectable = params["selectable"] !== undefined ? params["selectable"] : selectable;
            }

            var ddItem = <DropDownDivItem>document.createElement("div");
            ddItem.className = "ddItem";
            ddItem.appendChild(item);

            if (selectable) {
                ddItem.addEventListener("click", (e: Event) => {
                    this.setSelectedItem(<DropDownDivItem>e.currentTarget);
                    $(this.divRoot).trigger(this.onChangedEvent);
                }, false);
            }
            ddItem.style.width = this.titleWidth.toString() + "px";
            ddItem.itemData = data;

            this.ddItemContainer.appendChild(ddItem);
            this.dataItems.push(data);
        }

        private setSelectedItem(item: DropDownDivItem) {
            if (this.selectedDomElement) {
                (<HTMLElement>(this.selectedDomElement.firstChild)).className = "ddCommonItem";
            }
            this.selectedDomElement = item;
            this.selectedData = item.itemData;
            this.ddTitleText.innerHTML = item.innerHTML;
            (<HTMLElement>(this.selectedDomElement.firstChild)).className = "ddSelectedCommonItem";
            this.previousScrollPosition = this.ddItemContainer.scrollTop;
        }

        setSelectedIndex(idx: number) {
            var items = this.ddItemContainer.childNodes;
            if (idx < 0 || idx > items.length)
                return;

            this.setSelectedItem(<DropDownDivItem>items[idx]);
            this.onChangeInternal();
        }

        setSelectedItemByText(text: string): boolean {
            for (var i = 0; i < this.dataItems.length; i++) {
                if (!this.dataItems[i])
                    continue;
                if (this.dataItems[i] == text) {
                    this.setSelectedIndex(i);
                    return true;
                }
            }
            return false;
        }

        clearAllItem() {
            while (this.ddItemContainer.firstChild) {
                this.ddItemContainer.removeChild(this.ddItemContainer.firstChild);
            }
            this.setDefaulTitleText("");
            this.previousScrollPosition = 0;
            this.dataItems = [];
            this.selectedData = null;
        }

        showDropDown() {
            if (!this.enable)
                return;
            if (this.ddItemContainer.style.display == "block") {
                this.hideDropDown();
                return;
            }
            var offsetTop = this.ddTitle.offsetTop + this.ddTitle.offsetHeight;
            var offsetLeft = this.ddTitle.offsetLeft;

            this.ddItemContainer.style.top = offsetTop.toString() + "px";
            this.ddItemContainer.style.left = offsetLeft.toString() + "px";

            this.ddItemContainer.style.display = "block";
            if (this.selectedDomElement == null)
                this.ddItemContainer.scrollTop = 0;
            else
                this.ddItemContainer.scrollTop = this.selectedDomElement.offsetTop;
        }

        hideDropDown() {
            this.ddItemContainer.style.display = "none";
        }

        setDefaulTitleText(text: string) {
            while (this.ddTitleText.firstChild) {
                this.ddTitleText.removeChild(this.ddTitleText.firstChild);
            }
            var ddDefaulTitletText = document.createElement("div");
            ddDefaulTitletText.className = "ddDefaultTitleText";
            ddDefaulTitletText.innerHTML = text;
            this.ddTitleText.appendChild(ddDefaulTitletText);

            // No selected data available
            this.selectedDomElement = null;
            this.selectedData = null;
        }

        createItem(text: string): HTMLElement {
            var item = Utils.createElement("div", { "class": "ddCommonItem" });
            var span = Utils.createElement("span", {
                "class": "ddCommonItemSpan",
                "text": text
            });
            item.appendChild(span);
            return item;
        }

        private init() {
            // Create the title bar
            this.divRoot.style.height = this.titleHeight.toString() + "px";
            this.ddTitle = document.createElement("div");
            this.ddTitle.className = "ddTitle";
            this.ddTitle.style.width = this.titleWidth.toString() + "px";
            this.ddTitle.style.height = this.titleHeight.toString() + "px";

            var ddTitleDivider = document.createElement("span");
            ddTitleDivider.className = "ddTitleDivider";

            var ddDividerArrow = document.createElement("span");
            ddDividerArrow.className = "ddDividerArrow";

            this.ddTitleText = document.createElement("span");
            this.ddTitleText.className = "ddTitleText";

            this.ddTitle.appendChild(ddTitleDivider);
            this.ddTitle.appendChild(ddDividerArrow);
            this.ddTitle.appendChild(this.ddTitleText);
            this.ddTitle.onclick = (e) => {
                this.titleClicked = true;
                this.showDropDown();
            };

            // Create the items container
            this.ddItemContainer = document.createElement("div");
            this.ddItemContainer.style.display = "none";
            this.ddItemContainer.className = "ddItemContainer";
            this.ddItemContainer.style.width = this.titleWidth.toString() + "px";
            this.ddItemContainer.style.maxHeight = this.containerMaxHeight.toString() + "px";

            Utils.addEvent(document.body, 'click', () => {
                if (this.titleClicked)
                    this.titleClicked = false;
                else
                    this.hideDropDown();
            });

            this.divRoot.appendChild(this.ddTitle);
            this.divRoot.appendChild(this.ddItemContainer);

            $(this.divRoot).bind("selectionChanged", () => {
                this.onChangeInternal();
            });
        }

        private onChangeInternal() {
            this.hideDropDown();

            if (this.onChangeHandler) {
                this.onChangeHandler();
            }
        }

    }

    interface DropDownDivItem extends HTMLDivElement {
        itemData: any;
    }
} 