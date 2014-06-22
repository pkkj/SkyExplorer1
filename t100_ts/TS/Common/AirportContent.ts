/*
    Define the airport view.
*/

module AST {
    export class AirportContent extends CommonDataContent {
        private originPanel: OriginPanel = null;
        private mapControl: MapControl = null;

        // UK CAA Data Dest Panel
        private ukDestPanel: UkData.UkDestPanel = null;
        private t100DestPanel: T100DestPanel = null;
        private t100FFDestPanel: T100DestPanel = null;
        private twDestPanel: TwData.TwDataDestPanel = null;
        private jpDestPanel: JpData.JpDestPanel = null;

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
            this.originPanel = OriginPanel.createT100OriginPanel();

            var dialogT100DestBar = new PinPanel(document.getElementById("t100DestBar"), "");
            this.t100DestPanel = T100DestPanel.createT100DestPanel("T100");
            this.t100DestPanel.destDialogBuddy = dialogT100DestBar;
            this.t100FFDestPanel = T100DestPanel.createT100DestPanel("T100FF");
            this.t100FFDestPanel.destDialogBuddy = dialogT100DestBar;
            dialogT100DestBar.hide();

            this.ukDestPanel = UkData.UkDestPanel.createUkDestPanel();
            this.twDestPanel = TwData.TwDataDestPanel.createTwDataDestPanel();
            this.jpDestPanel = JpData.JpDestPanel.createJpDestPanel();

            // Register the data source information
            this.originPanel.registerDestBar("T100", this.t100DestPanel);
            this.originPanel.registerDestBar("T100FF", this.t100FFDestPanel);
            this.originPanel.registerDestBar("UkData", this.ukDestPanel);
            this.originPanel.registerDestBar("TwData", this.twDestPanel);
            this.originPanel.registerDestBar("JpData", this.jpDestPanel);

            this.originPanel.originDialogBuddy = dialogT100Origin;
            this.originPanel.destDialogBuddy = dialogT100DestBar;
            this.originPanel.airportContent = this;

            this.mapControl = new AST.MapControl(map, this.originPanel);
            this.t100DestPanel.mapBuddy = this.mapControl;
            this.twDestPanel.mapBuddy = this.mapControl;
            this.t100FFDestPanel.mapBuddy = this.mapControl;
            this.ukDestPanel.mapBuddy = this.mapControl;
            this.jpDestPanel.mapBuddy = this.mapControl;

            this.originPanel.mapControl = this.mapControl;

            // Set up the data source panel
            this.setDataSourcePanel();
            $("#airportViewDataSrcControlerPanel").accordion({
                collapsible: true
            });
        }

        public reset() {
            this.originPanel.reset();
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
            this.originPanel.updateDestList(false /*panTo*/);
        }

        private createDataSrcCheckBox(dataSrc: DataSourceMetaData) {
            var td = document.createElement("td");
            var checkBox: HTMLInputElement = <HTMLInputElement>AST.Utils.createElement("input", { "type": "checkbox" });
            checkBox.checked = true;
            td.appendChild(checkBox);
            var anchor = <HTMLAnchorElement> AST.Utils.createElement("a", { "text": dataSrc.shortInfo });
            anchor.href = "#";
            anchor.onclick = () => {
                var src = dataSrc.aboutSrcPageUrl + "?locale=" + Localization.getLocale();
                DialogUtils.loadDetailReportDialog("About Data Source", src);
            }
            td.appendChild(anchor);
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