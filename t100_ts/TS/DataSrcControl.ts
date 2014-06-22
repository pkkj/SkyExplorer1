module AST {
    export class DataSrcControl {
        private btnT100Airport :HTMLButtonElement = null;
        private btnT100Airline: HTMLButtonElement = null;
        constructor() {
            this.btnT100Airport = <HTMLButtonElement>document.getElementById("dataSrcT100Airport");
            this.btnT100Airline = <HTMLButtonElement>document.getElementById("dataSrcT100Airline");

            this.btnT100Airport.onclick = () => {
                this.prepareSwitchContent(App.t100AirportContent);
            };

            this.btnT100Airline.onclick = () => {
                this.prepareSwitchContent(App.t100AirlineContent);
            };

            App.t100AirportContent = new AirportContent();
            App.t100AirportContent.init(App.mapControl);

            App.t100AirlineContent = new T100AirlineContent();
            App.t100AirlineContent.init(App.mapControl);

            Utils.addEvent(window, "resize", App.t100AirportContent.resize);

            // Init the text
            document.getElementById("dataSrcT100AirportText").innerHTML = Localization.strings.airportView;
            document.getElementById("dataSrcT100AirlineText").innerHTML = Localization.strings.airlineView;
            document.getElementById("dataSrcAboutApp").innerHTML = Localization.strings.about;
            document.getElementById("labelViewDataBy").innerHTML = Localization.strings.viewDataBy;
        }

        private prepareSwitchContent(newContent: CommonDataContent) {
            if (App.activeContent) {
                if (App.activeContent == newContent)
                    return;
                App.activeContent.reset();
                App.activeContent.hide();                
            }

            var legendDiv = document.getElementById('contentLegend');
            while (legendDiv.firstChild)
                legendDiv.removeChild(legendDiv.firstChild);

            App.activeContent = newContent;
            App.activeContent.activateMap();
            App.activeContent.show();
            
        }

        public showT100DataContent() {
            this.prepareSwitchContent(App.t100AirportContent);
        }
    }
}