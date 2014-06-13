module AST {
    export class T100AirlineContent extends CommonDataContent {        
        private t100AirlinePanel: AST.T100AirlinePanel = null;
        private rightTopPanel = null;
        private regionFilterPanel = null;

        constructor() {
            super();
            this.divRoot = document.getElementById("t100AirlineContent");
        }

        public init(mapControl: OpenLayers.Map) {
            var dialogT100Airline = new PinPanel(document.getElementById("t100AirlinePanel"), Localization.strings.t100Airline);

            this.t100AirlinePanel = new AST.T100AirlinePanel();
            this.t100AirlinePanel.init(mapControl);
            this.rightTopPanel = document.getElementById("t100AirlineContentRightTopPanel");
            this.regionFilterPanel = document.getElementById("t100AirlineContentRightTopPanel");
        }

        public reset() {
            this.rightTopPanel.style.display = "none";
            this.regionFilterPanel.style.display = "none";
            this.t100AirlinePanel.deactivateMap();
            this.t100AirlinePanel.reset();
        }
        public activateMap() {
            this.rightTopPanel.style.display = "block";
            this.regionFilterPanel.style.display = "block";
            this.t100AirlinePanel.activateMap();
        }
    }
} 