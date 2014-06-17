/*
    Define the airport view.
*/

module AST {
    export class T100AirportContent extends CommonDataContent {
        private t100OriginPanel: T100OriginPanel = null;
        private t100MapControl: T100MapControl = null;

        // UK CAA Data Dest Panel
        private ukDestPanel: UkData.UkDestPanel = null;
        private t100DestPanel: T100DestPanel = null;
        private t100FFDestPanel: T100DestPanel = null;
        private twDestPanel: TwData.TwDataDestPanel = null;

        //private t100AirlineSelector = null;
        private legendDiv: HTMLElement = null;
        private rightTopDiv: HTMLElement = null;
        private dataSrcControlerDiv: HTMLElement = null;
        private dataSrcFilter: HTMLTableElement = null;
        private dataSrcCheckBoxRegister: { [dataSrc: string]: HTMLInputElement};

        constructor() {
            super();
            this.legendDiv = document.getElementById('contentLegend');
            this.rightTopDiv = document.getElementById("airportViewDataSrcControlerPanel");
            this.dataSrcControlerDiv = document.getElementById("airportViewDataSrcControlerDiv");
            this.dataSrcFilter = <HTMLTableElement>document.getElementById("airportViewDataSrcFilterTable");

            this.dataSrcCheckBoxRegister = {};

        }

        public init(map: OpenLayers.Map) {
            this.divRoot = document.getElementById("t100AirportContent");

            var dialogT100Origin = new PinPanel(document.getElementById("t100OriginBar"), Localization.strings.pleaseSelectInputOrigin);
            this.t100OriginPanel = T100OriginPanel.createT100OriginPanel();

            var dialogT100DestBar = new PinPanel(document.getElementById("t100DestBar"), "");
            this.t100DestPanel = T100DestPanel.createT100DestPanel("T100");
            this.t100DestPanel.destDialogBuddy = dialogT100DestBar;
            this.t100FFDestPanel = T100DestPanel.createT100DestPanel("T100FF");
            this.t100FFDestPanel.destDialogBuddy = dialogT100DestBar;
            dialogT100DestBar.hide();

            this.ukDestPanel = UkData.UkDestPanel.createUkDestPanel();
            this.twDestPanel = TwData.TwDataDestPanel.createTwDataDestPanel();

            // Register the data source information
            this.t100OriginPanel.registerDestBar("T100", this.t100DestPanel);
            this.t100OriginPanel.registerDestBar("T100FF", this.t100FFDestPanel);
            this.t100OriginPanel.registerDestBar("UkData", this.ukDestPanel);
            this.t100OriginPanel.registerDestBar("TwData", this.twDestPanel);

            this.t100OriginPanel.originDialogBuddy = dialogT100Origin;
            this.t100OriginPanel.destDialogBuddy = dialogT100DestBar;
            this.t100OriginPanel.airportContent = this;

            this.t100MapControl = new AST.T100MapControl(map, this.t100OriginPanel);
            this.t100DestPanel.mapBuddy = this.t100MapControl;
            this.twDestPanel.mapBuddy = this.t100MapControl;
            this.t100FFDestPanel.mapBuddy = this.t100MapControl;

            this.t100OriginPanel.mapControl = this.t100MapControl;

            // Set up the data source panel
            this.setDataSourcePanel();
            $("#airportViewDataSrcControlerPanel").accordion({
                collapsible: true
            });
        }

        public reset() {
            this.t100OriginPanel.reset();
            this.t100DestPanel.mapBuddy.deactivate();
            this.dataSrcControlerDiv.style.display = "none";
            this.rightTopDiv.style.display = "none";
        }

        public activateMap() {
            this.t100DestPanel.mapBuddy.activate();
            this.setRouteLegend({});
            this.dataSrcControlerDiv.style.display = "block";
            this.rightTopDiv.style.display = "block";
        }

        public resize = () => {
            var barMargin = 5;
            var subContainerHeight = document.getElementById("subContainer").offsetHeight;
            var t100OriginBarHeight = document.getElementById("t100OriginBar").offsetHeight;

            var t100DataViewDiv = document.getElementById("t100AirportContent");
            if (t100DataViewDiv.style.display == "block") {
                t100DataViewDiv.style.height = (subContainerHeight - barMargin * 2).toString() + 'px';

                var t100DestBar = document.getElementById("t100DestBar");
                t100DestBar.style.height = (subContainerHeight - t100OriginBarHeight - barMargin * 2).toString() + 'px';
                this.t100DestPanel.onSizeChange();
            }
        }

        private dataSrcSelectionChanged() {
            var availableDataSrc = "";
            for (var key in this.dataSrcCheckBoxRegister) {
                if (this.dataSrcCheckBoxRegister[key].checked) {
                    if (availableDataSrc != "")
                        availableDataSrc += ",";
                    availableDataSrc += key;
                }
            }
            GlobalStatus.dataSource = availableDataSrc;
            this.t100OriginPanel.updateDestList(false /*panTo*/);
        }

        private createDataSrcCheckBox(dataSrc: DataSourceMetaData) {
            var td = document.createElement("td");
            var checkBox: HTMLInputElement = <HTMLInputElement>AST.Utils.createElement("input", { "type": "checkbox" });
            checkBox.checked = true;
            td.appendChild(checkBox);
            td.appendChild(AST.Utils.createElement("span", { "text": dataSrc.shortInfo }));
            this.dataSrcCheckBoxRegister[dataSrc.name] = checkBox;
            checkBox.onchange = () => {
                this.dataSrcSelectionChanged();
            }
            return td;
        }

        private setDataSourcePanel() {
            for (var i = 0; i < DataSourceRegister.dataSrcList.length; i += 2) {
                var tr = document.createElement("tr");
                tr.appendChild(this.createDataSrcCheckBox(DataSourceRegister.dataSrcList[i]));
                if (i + 1 < DataSourceRegister.dataSrcList.length) {
                    tr.appendChild(this.createDataSrcCheckBox(DataSourceRegister.dataSrcList[i + 1]));
                }
                this.dataSrcFilter.appendChild(tr);
            }
        }

        public setRouteLegend(options) {
            this.legendDiv.innerHTML = "";
            var divTitle = AST.Utils.createElement("div", { "class": "legendTitle", "text": Localization.strings.flow });
            var canvas = document.createElement('canvas');
            canvas.id = "contentLegendCanvas";
            canvas.height = 60;
            canvas.width = 280;
            this.legendDiv.appendChild(divTitle);
            this.legendDiv.appendChild(canvas);
            canvas = <HTMLCanvasElement> document.getElementById("contentLegendCanvas");
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 280, 60);

            AST.Draw.drawSegment(ctx, 0, 10, 47, 10, 2, 'rgba(0,102,255,.6)');
            AST.Draw.drawText(ctx, 65, 13, "12px Arial", '#000000', Localization.strings.passengerRouteMayHaveFreight);

            AST.Draw.drawSegment(ctx, 0, 30, 47, 30, 2, 'rgba(102,0,255,.6)');
            AST.Draw.drawText(ctx, 65, 33, "12px Arial", '#000000', Localization.strings.freightOnlyRoute);
            var hOffset = 50;
            if (options) {
                if (options.hasPartialDataRoute) {
                    AST.Draw.drawSegment(ctx, 0, hOffset, 8, hOffset, 2, 'rgba(0,102,255,.6)');
                    AST.Draw.drawSegment(ctx, 13, hOffset, 21, hOffset, 2, 'rgba(0,102,255,.6)');
                    AST.Draw.drawSegment(ctx, 26, hOffset, 34, hOffset, 2, 'rgba(102,0,255,.6)');
                    AST.Draw.drawSegment(ctx, 39, hOffset, 47, hOffset, 2, 'rgba(102,0,255,.6)');
                    AST.Draw.drawText(ctx, 65, hOffset + 3, "12px Arial", '#000000', Localization.strings.routeOnlyWithUsData);
                    hOffset += 20;
                }
                if (options.hasNoDataRoute) {
                    AST.Draw.drawSegment(ctx, 0, hOffset, 47, hOffset, 2, 'rgba(160,160,160,.6)');
                    AST.Draw.drawText(ctx, 65, hOffset + 3, "12px Arial", '#000000', Localization.strings.passengerRouteWithoutFlowData);
                    hOffset += 20;
                }
            }
        }
    }
}