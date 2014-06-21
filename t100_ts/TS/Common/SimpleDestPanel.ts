module AST {

     export interface SummaryTab extends HTMLElement {
        innerTitle;
        summaryTable;
        footnote;
    }

    export class SimpleDestPanel extends DestPanel {
        public _tabSummary: SummaryTab = null;
        public _totalFlow: HTMLElement = null;
        public _tabs: HTMLElement = null;
        public _tabTimeSeries: HTMLElement = null;
        public _tabTimeSeriesTitle: HTMLElement = null;
        public _tabTimeSeriesFootNote: HTMLElement = null;
        public divTimeSeriesChart: HTMLElement = null;
        public panelFootNote: HTMLElement = null;

        public $$liDestTabSummary: string = "";
        public $$liDestTabTimeSeries: string = "";
        public $destTab: string = "";

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
                "class": "t100DataPanelTabTitle", "text": Localization.strings.passengerFlowMonthlyStat
            });
            this._tabSummary.summaryTable = AST.Utils.createElement("table", { "class": "simpleDestPanelSummaryTable" });
            this._tabSummary.summaryTable.style.display = "block";
            this._tabSummary.summaryTable.style.overflow = "auto";
            this._tabSummary.footnote = document.createElement("div");

            this._tabSummary.appendChild(this._tabSummary.innerTitle);
            this._tabSummary.appendChild(AST.Utils.createElement("div", { "height": "4px" }));
            this._tabSummary.appendChild(this._tabSummary.summaryTable);
            this._tabSummary.appendChild(AST.Utils.createElement("div", { "height": "2px" }));
            this._tabSummary.appendChild(this._tabSummary.footnote);

            $(this.$destTab).tabs({
                activate: (event, ui) => {
                    if (ui.newTab[0].id == this.$$liDestTabTimeSeries) {
                        this.createTimeSeriesChart();
                    }
                }

            });
        }

        public localizeUi() {
            super.localizeUi();
            this.panelFootNote.innerHTML = Localization.strings.allDataAreInBothDirection;
            (<HTMLElement> document.getElementById(this.$$liDestTabSummary).firstElementChild).innerHTML = Localization.strings.statistic;
            (<HTMLElement> document.getElementById(this.$$liDestTabTimeSeries).firstElementChild).innerHTML = Localization.strings.timeSeries;
        }

        public querySegment() {
        }

        public setRouteData(data: Array<RouteRecord>, distInfo: DistInfo) {
            this.routeData = data;
            this.distInfo = distInfo;
            this.setRouteDistInfo();
            this.createRouteInfo();
            this._totalFlow.innerHTML = Localization.strings.totalPassengerInThisYear + Utils.formatNumber(this.routeData[0].pax);
        }

        private createRouteInfo() {
            var activeTab = $(this.$destTab).tabs("option", "active");
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
            trHeader.appendChild(AST.Utils.createElement("th", { "class": "leftColumn", "width": "110px", "height": "0px", "text": Localization.strings.monthInSummaryTable }));
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
        
    }
} 