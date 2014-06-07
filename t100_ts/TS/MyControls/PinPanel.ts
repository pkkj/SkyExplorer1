module AST {

    export class PinPanel {
        private divRoot: HTMLElement;
        private titleBarTextDiv: HTMLElement;
        
        constructor(divRoot: HTMLElement, title: string) {
            this.divRoot = divRoot;
            this.divRoot.className = "shadow pinPanelBorder";

            var divContent = <HTMLElement>Utils.getFirstChild(this.divRoot);
            divContent.className = "pinPanelContent";

            var titleBar = AST.Utils.createElement("div", { "class": "pinPanelTitleBar" });
            this.titleBarTextDiv = Utils.createElement("div", { "class": "pinPanelTitleBarText", "text": title });
            titleBar.appendChild(this.titleBarTextDiv);
            this.divRoot.insertBefore(titleBar, divContent);
        }

        setTitleBar(element: HTMLElement) {
            while (this.titleBarTextDiv.firstChild) {
                this.titleBarTextDiv.removeChild(this.titleBarTextDiv.firstChild);
            }
            this.titleBarTextDiv.appendChild(element);
        }

        setTitleText(title: string) {
            this.titleBarTextDiv.innerHTML = title;
        }

        hide() {
            this.divRoot.style.display = "none";
        }

        show() {
            this.divRoot.style.display = "block";
        }
    }
} 