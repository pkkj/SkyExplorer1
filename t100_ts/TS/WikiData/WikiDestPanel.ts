module AST {
    export module WikiData {

        export class WikiDestPanel extends DestPanel {
            public airlineTable: HTMLTableElement = null;
            public panelTitle: HTMLElement = null;
            constructor() {
                super();
            }

            public initUi() {
                super.initUi();
                this.localizeUi();
            }

            public localizeUi() {
                super.localizeUi();
            }

            public querySegment() {
                if (AST.GlobalStatus.year == null || AST.GlobalStatus.originAirport == null
                    || AST.GlobalStatus.destAirport == null)
                    return;
                WikiData.WikiDataQuery.queryRoute(AST.GlobalStatus.year, AST.GlobalStatus.originAirport.iata,
                    AST.GlobalStatus.destAirport.iata, (routeData, distInfo) => {
                        this.setRouteData(routeData, distInfo);
                    });
                this.mapBuddy.selectDestAirportFeature(AST.GlobalStatus.destAirport.iata);
            }

            public onDestChange() {
                this.querySegment();
            }

            private setRouteData(data: Array<RouteRecord>, distInfo: DistInfo) {
                this.routeData = data;
                this.distInfo = distInfo;
                this.setRouteDistInfo();
                this.createRouteInfo();
            }

            private createRouteInfo() {

                this.createSummaryTable();

            }

            private createSummaryTable() {
                if (this.routeData == null) {
                    return;
                }

                Utils.removeChildren(this.airlineTable);

                var tableBody = document.createElement("tbody");
                this.airlineTable.appendChild(tableBody);

                var trHeader = document.createElement("tr");
                trHeader.appendChild(AST.Utils.createElement("th", { "class": "header1", "width": "270px", "height": "0px" }));
                
                trHeader.style.height = "0px";
                tableBody.appendChild(trHeader);

                
                var compareAirline= function (a: RouteRecord, b: RouteRecord) {
                    var airline1 = Airline.getDisplayName(a.airline);
                    var airline2 = Airline.getDisplayName(b.airline);
                    return Localization.strings.compareStr(airline1, airline2);
                };

                var data = this.routeData;
                data.sort(compareAirline);

                var numItem = 0;
                for (var i = 0; i < data.length; i++) {
                    var tr = AST.Utils.createElement("tr", { "class": i % 2 == 0 ? "alt" : "" });
                    tr.appendChild(AST.Utils.createElement("td", { "text": Airline.getDisplayName(data[i].airline)}));

                    tableBody.appendChild(tr);

                    numItem += 1;
                }
                if (numItem > 0) {
                    this.panelTitle.innerHTML = Localization.strings.wikiAirlinesOperatingThisRoute;
                }
                else {
                    this.panelTitle.innerHTML = '<span style="font-size: 24pt; color: #D0D0D0">' + Localization.strings.noDataAvailable + '</span>';
                }
            }

            static createWikiDestPanel(): WikiDestPanel {
                var destPanel = new AST.WikiData.WikiDestPanel();
                destPanel.mainDiv = document.getElementById("wikiDataDestBarInnerDiv");
                destPanel.panelTitle = document.getElementById("wikiDestBarTitle");
                destPanel.routeDistText = document.getElementById("destBarDistance");
                destPanel.airlineTable = <HTMLTableElement> document.getElementById("wikiDestBarAirlineTable");

                destPanel.panelFootNote = document.getElementById("wikiDestPanelFootNote");
                destPanel.tabMetricDataText = document.getElementById("wikiDestPanelTabsMetricDataText");
                destPanel.metricDataAnchor = document.getElementById("wikiDestPanelTabsMetricDataAnchor");

                destPanel.dataSourceMetaData = WikiData.WikiMetaData.instance();
                destPanel.initUi();
                return destPanel;
            }
        }
    }
}  