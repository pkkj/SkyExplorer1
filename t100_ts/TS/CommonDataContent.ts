module AST {
    // The base class of different data content
    export class CommonDataContent{
        public divRoot: HTMLElement = null;
        public resize: () => any = null; 
        constructor() {
        }

        public show() {
            this.divRoot.style.display = "block";
        }

        public hide() {
            this.divRoot.style.display = "none";
        }
        public reset() {
        }
        public activateMap() {
        }
        
    }
} 