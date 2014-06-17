module AST {
    export module UkData {

        interface SummaryTab extends HTMLElement {
            innerTitle;
            summaryTable;
            footnote;
        }

        export class UkDestPanel extends DestPanel {
            private _tabSummary: SummaryTab = null;
            private _totalFlow: HTMLElement = null;
            private _tabs: HTMLElement = null;
            private _tabTimeSeries: HTMLElement = null;
            private _tabTimeSeriesTitle: HTMLElement = null;
            private _tabTimeSeriesFootNote: HTMLElement = null;
            private divTimeSeriesChart: HTMLElement = null;
            private panelFootNote: HTMLElement = null;

            constructor() {
                super();
            }

            public onDestChange() {
                this.querySegment();
            }

            public initUi() {
                super.initUi();

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
                            this.createTimeSeriesChart();
                        }
                    }

                });

                this.localizeUi();
            }

            public localizeUi() {
                super.localizeUi();
                this.panelFootNote.innerHTML = UkData.UkLocalization.strings.allDataAreInBothDirection;
                (<HTMLElement> document.getElementById("liUkDestTabSummary").firstElementChild).innerHTML = Localization.strings.statistic;
                (<HTMLElement> document.getElementById("liUkDestTabTimeSeries").firstElementChild).innerHTML = Localization.strings.timeSeries;
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
                this.setRouteDistInfo();
                this.createRouteInfo();
                this._totalFlow.innerHTML = UkData.UkLocalization.strings.totalPassengerInThisYear + Utils.formatNumber(this.routeData[0].pax);
            }

            private createRouteInfo() {
                var activeTab = $("#ukDestTabs").tabs("option", "active");
                this.createSummaryTable();

                if (activeTab == 1) {
                    this.createTimeSeriesChart();
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
                trHeader.appendChild(AST.Utils.createElement("th", { "class": "leftColumn", "width": "110px", "height": "0px", "text": UkData.UkLocalization.strings.monthInSummaryTable }));
                trHeader.appendChild(AST.Utils.createElement("th", { "width": "120px", "height": "0px", "text": Localization.strings.passengerFreq }));
                trHeader.style.height = "20px";
                tableBody.appendChild(trHeader);

                var data: RouteRecord = this.routeData[0];
                for (var i = 0; i < 12; i++) {
                    var tr = AST.Utils.createElement("tr", { "class": i % 2 == 0 ? "alt" : "" });
                    tr.appendChild(AST.Utils.createElement("td", { "class": "rowIndex", "text": Localization.strings.constructYearMonth(GlobalStatus.year, i) }));
                    tr.appendChild(AST.Utils.createElement("td", {
                        "class": "rowName",
                        "text": Utils.formatNumber(data.monthPax[i])
                    }));

                    tableBody.appendChild(tr);
                }
            }

            private createTimeSeriesChart() {
                var data = [];
                var routeData: RouteRecord = this.routeData[0];
                data.push(["Month", "Passenger"]);
                for (var i = 0; i < 12; i++) {
                    if (i % 2 == 0)
                        data.push([Localization.strings.monthName[i], routeData.monthPax[i]]);
                    else
                        data.push(["", routeData.monthPax[i]]);
                }

                var options = {
                    chartArea: {
                        top: 15,
                        left: 50,
                        height: 140,
                        width: '100%'
                    },
                    legend: { position: "none" },
                    height: 200,
                    width: 305,
                    fontSize: 11
                };

                var chart = new google.visualization.ColumnChart(this.divTimeSeriesChart);
                chart.draw(google.visualization.arrayToDataTable(data), options);
                this._tabTimeSeriesTitle.innerHTML = Localization.strings.timeSerierByPassenger;
            }

            static createUkDestPanel(): UkDestPanel {
                var destPanel = new AST.UkData.UkDestPanel();
                destPanel.mainDiv = document.getElementById("ukDestBarInnerDiv");
                destPanel.routeDistText = document.getElementById("destBarDistance");
                destPanel._totalFlow = document.getElementById("ukDestTotalFlow");

                destPanel._tabs = document.getElementById("ukDestTabs");

                destPanel._tabSummary = <SummaryTab>document.getElementById("ukDestTabSummary");

                destPanel._tabTimeSeries = document.getElementById("ukDestTabTimeSeries");
                destPanel._tabTimeSeriesTitle = document.getElementById("ukDestTabTimeSeriesTitle");
                destPanel._tabTimeSeriesFootNote = document.getElementById("ukDestTabTimeSeriesFootNote");
                destPanel.divTimeSeriesChart = document.getElementById("ukDestTabTimeSeriesChart");

                destPanel.panelFootNote = document.getElementById("ukDestFootNote");

                destPanel.dataSourceMetaData = UkData.UkMetaData.instance();
                destPanel.initUi();
                return destPanel;
            }
        }
    }
} 