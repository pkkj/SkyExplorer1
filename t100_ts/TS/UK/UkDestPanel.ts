module AST {
    export module UkData {

        interface SummaryTab extends HTMLElement {
            innerTitle;
            summaryTable;
            footnote;
        }

        export class UkDestPanel{
            private _tabSummary: SummaryTab = null;
            private _totalFlow: HTMLElement = null;
            private _tabs: HTMLElement = null;
            private _tabTimeSeries: HTMLElement = null;
            private _tabTimeSeriesTitle: HTMLElement = null;
            private _tabTimeSeriesFootNote: HTMLElement = null;
            private _divTimeSeriesChart: HTMLElement = null;

            private routeData: Array<RouteRecord> = null;
            private distInfo: DistInfo = null;

            constructor() {
                
            }

            public onDestChange() {
                this.querySegment();
            }

            public initUI() {
                this._tabSummary.appendChild(AST.Utils.createElement("div", { "height": "4px" }));
                this._tabSummary.innerTitle = AST.Utils.createElement("div", {
                    "id": "ukDestSummaryTitle", "class": "t100DataPanelTabTitle", "text": UkData.UkLocalization.strings.passengerFlowMonthlyStat
                });
                this._tabSummary.summaryTable = AST.Utils.createElement("table", { "id": "ukDestSummaryTable" });
                this._tabSummary.summaryTable.style.display = "block";
                this._tabSummary.summaryTable.style.overflow = "auto";
                this._tabSummary.footnote = document.createElement("div");

                this._tabSummary.appendChild(this._tabSummary.innerTitle);
                this._tabSummary.appendChild(AST.Utils.createElement("div", { "height": "4px" }));
                this._tabSummary.appendChild(this._tabSummary.summaryTable);
                this._tabSummary.appendChild(AST.Utils.createElement("div", { "height": "2px" }));
                this._tabSummary.appendChild(this._tabSummary.footnote);

                $("#ukDestTabs").tabs({
                    activate: (event, ui) => {
                        if (ui.newTab[0].id == "liUkDestTabTimeSeries") {
                            
                        }
                    }

                });
            }

            private querySegment() {
                if (AST.GlobalStatus.year == null || AST.GlobalStatus.originAirport == null
                    || AST.GlobalStatus.destAirport == null)
                    return;
                UkData.UkDataQuery.queryRoute(AST.GlobalStatus.year, AST.GlobalStatus.originAirport.iata,
                    AST.GlobalStatus.destAirport.iata, (routeData, distInfo) => {
                        this.setRouteData(routeData, distInfo);
                    });
                
            }

            private setRouteData(data: Array<RouteRecord>, distInfo: DistInfo) {
                this.routeData = data;
                this.distInfo = distInfo;
                this.createRouteInfo();
                this._totalFlow.innerHTML = "Total passenger flow in this year: " + Utils.formatNumber(this.routeData[0].pax);
            }

            private createRouteInfo() {
                var activeTab = $("#ukDestTabs").tabs("option", "active");
                this.createSummaryTable();

                if (activeTab == 1) {
                    
                }

            }

            private createSummaryTable() {
                if (this.routeData == null) {
                    return;
                }

                while (this._tabSummary.summaryTable.firstChild) {
                    this._tabSummary.summaryTable.removeChild(this._tabSummary.summaryTable.firstChild);
                }

                var tableBody = document.createElement("tbody");
                this._tabSummary.summaryTable.appendChild(tableBody);

                var trHeader = document.createElement("tr");
                trHeader.appendChild(AST.Utils.createElement("th", { "class": "header1", "width": "110px", "height": "0px", "text": "Month" }));
                trHeader.appendChild(AST.Utils.createElement("th", { "class": "header1", "width": "170px", "height": "0px", "text" : "Passenger (in both direction)" }));
                trHeader.style.height = "20px";
                tableBody.appendChild(trHeader);

                var data: RouteRecord = this.routeData[0];
                for (var i = 0; i < 12; i++) {
                    var tr = AST.Utils.createElement("tr", { "class": i % 2 == 0 ? "alt" : "" });
                    tr.appendChild(AST.Utils.createElement("td", { "class": "rowIndex", "text": (i + 1).toString() }));
                    tr.appendChild(AST.Utils.createElement("td", {
                        "class": "rowName",
                        "text": Utils.formatNumber(data.monthPax[i])
                    }));

                    tableBody.appendChild(tr);
                }
            }

            static createUkDestPanel(): UkDestPanel {
                var destPanel = new AST.UkData.UkDestPanel();
                destPanel._totalFlow = document.getElementById("ukDestTotalFlow");

                destPanel._tabs = document.getElementById("ukDestTabs");

                destPanel._tabSummary = <SummaryTab>document.getElementById("ukDestTabSummary");
               
                destPanel._tabTimeSeries = document.getElementById("ukDestTabTimeSeries");
                destPanel._tabTimeSeriesTitle = document.getElementById("ukDestTabTimeSeriesTitle");
                destPanel._tabTimeSeriesFootNote = document.getElementById("ukDestTabTimeSeriesFootNote");
                destPanel._divTimeSeriesChart = document.getElementById("ukDestTabTimeSeriesChart");

                destPanel.initUI();
                return destPanel;
            }
        }
    }
} 