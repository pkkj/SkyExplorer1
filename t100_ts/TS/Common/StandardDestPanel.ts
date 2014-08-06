module AST {
    export class StandardDestPanel extends DestPanel {

        public _tabs = null;
        public _tabSummary = null;

        // Share split
        public _tabShare = null;
        public _tabShareTitle = null;
        public _tabShareFootNote = null;
        public _shareChart = null;
        public _divShareChart = null;
        public _totalFlow = null;

        // Time series
        public _tabTimeSeries = null;
        public _tabTimeSeriesTitle = null;
        public _tabTimeSeriesFootNote = null;
        public _divTimeSeriesChart = null;

        public _btnShowFreight = null;
        public _btnShowPassenger = null;
        

        // Data
        private dataType = FlowType.Passenger;

        public destDialogBuddy = null;

        public liTabSummary = null;
        public liTabShare = null;
        public liTabTimeSeries = null;
        public timeSeriesLegend = null;
        public $tab = null;
        public $$timeSeriesChart = null;
        public $$$liT100DataPanelTabSummary: string = null;
        public $$$liTabShare: string = null;
        public $$$liTabTimeSeries: string = null;

        constructor() {
            super();
        }

        public onSizeChange = () => {
            var destBar = document.getElementById("t100DestBar");
            var destBarHeight = parseInt(destBar.style.height);
            this._tabSummary.summaryTable.style.maxHeight = (destBarHeight - 300) + "px";
        }

        public querySegment() { 
        }

        private createRouteInfo() {

            var activeTab = this.$tab.tabs("option", "active");
            this.getTotalData();
            this.createSummaryTable();

            // Redraw the share split when the tab-index is 1
            if (activeTab == 1) {
                this.createShareSplitChart();
            }

            // Redraw the time series when the tab-index is 2
            if (activeTab == 2) {
                this.createTimeSeriesChart();
            }
        }

        public setRouteData(data: Array<RouteRecord>, distInfo: DistInfo) {
            this.routeData = data;
            this.distInfo = distInfo;
            this.setRouteDistInfo();
            this.createRouteInfo();
        }

        private getTotalData() {
            if (this.routeData == null)
                return;

            var totalDeparture = 0, totalPax = 0, totalFreight = 0;

            for (var i = 0; i < this.routeData.length; i++) {
                totalDeparture += this.routeData[i].departure;
                totalPax += this.routeData[i].pax;
                totalFreight += this.routeData[i].freight;
            }

            this._totalFlow.innerHTML = Localization.strings.totalDepartures + totalDeparture;

            if (this.dataType == FlowType.Passenger) {
                this._totalFlow.innerHTML += "&nbsp; -  &nbsp;" + Localization.strings.totalPax + Utils.formatNumber(totalPax);
            }
            else {
                this._totalFlow.innerHTML += "&nbsp; - &nbsp;" + Localization.strings.totalFreight + Utils.formatNumber(totalFreight) + " tons.";
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
            trHeader.appendChild(AST.Utils.createElement("th", { "class": "header1", "width": "30px", "height": "0px" }));
            trHeader.appendChild(AST.Utils.createElement("th", { "class": "header1", "width": "65px", "height": "0px" }));
            trHeader.appendChild(AST.Utils.createElement("th", { "class": "header1", "width": "50px", "height": "0px" }));
            trHeader.appendChild(AST.Utils.createElement("th", { "class": "header1", "width": "65px", "height": "0px" }));
            trHeader.appendChild(AST.Utils.createElement("th", { "class": "header1", "width": "80px", "height": "0px" }));
            trHeader.style.height = "0px";
            tableBody.appendChild(trHeader);

            var compareItem = (a, b): number => {
                if (this.dataType == FlowType.Passenger) {
                    return parseInt(a.pax) < parseInt(b.pax) ? 1 : -1;
                } else {
                    return parseInt(a.freight) < parseInt(b.freight) ? 1 : -1;
                }
            }

            var numItem = 0;
            var data = this.routeData;
            data.sort(compareItem);
            for (var i = 0; i < data.length; i++) {
                if (this.dataType == FlowType.Passenger && data[i].pax == 0
                    || this.dataType == FlowType.Freight && data[i].freight == 0)
                    continue;

                var tr = AST.Utils.createElement("tr", { "class": i % 2 == 0 ? "alt" : "" });
                tr.appendChild(AST.Utils.createElement("td", { "class": "rowIndex", "text": (i + 1).toString(), "rowSpan": 2 }));
                tr.appendChild(AST.Utils.createElement("td", { "class": "rowName", "text": Airline.getDisplayName(data[i].airline), "colSpan": 4 }));

                tableBody.appendChild(tr);

                tr = AST.Utils.createElement("tr", { "class": i % 2 == 0 ? "alt" : "" });

                tr.appendChild(AST.Utils.createElement("td", { "class": "rowItemIndex", "text": Localization.strings.departureFreq }));
                tr.appendChild(AST.Utils.createElement("td", { "class": "rowItem", "text": data[i].departure.toString() }));
                var itemName = this.dataType == FlowType.Passenger ? Localization.strings.passengerFreq : Localization.strings.freightFreq;
                tr.appendChild(AST.Utils.createElement("td", { "class": "rowItemIndex", "text": itemName }));


                var flow = AST.Utils.formatNumber(this.dataType == FlowType.Passenger ? data[i].pax : data[i].freight);
                if (this.dataType == FlowType.Freight) {
                    flow += " " + Localization.strings.tons;
                }
                tr.appendChild(AST.Utils.createElement("td", { "class": "rowItem", "text": flow }));
                tableBody.appendChild(tr);
                numItem += 1;
            }
            if (numItem > 0) {
                if (this.dataType == FlowType.Passenger)
                    this._tabSummary.innerTitle.innerHTML = Localization.strings.airlineRankByPassenger;
                else
                    this._tabSummary.innerTitle.innerHTML = Localization.strings.airlineRankByFreight;
                this._tabSummary.footnote.innerHTML = "";
            }
            else {
                this._tabSummary.innerTitle.innerHTML = '<span style="font-size: 24pt; color: #D0D0D0">' + Localization.strings.noDataAvailable + '</span>';
                this._tabSummary.footnote.innerHTML = "";
            }
        }

        public setShowFlowType(flowType) {
            if (this.routeData == null)
                return;

            this.dataType = flowType;
            this.createRouteInfo();
        }

        // Trigger when the destination of T100OriginPanel change
        public onDestChange = () => {
            this.querySegment();
        }

        public createShareSplitChart() {
            if (this.routeData == null)
                return;
            var _data;
            if (this.dataType == FlowType.Passenger) {
                _data = [['Airline', 'Pax']];
            }
            else {
                _data = [['Airline', 'Freight']];
            }

            var totalFlow = 0;

            for (var i = 0; i < this.routeData.length; i++) {
                var airlineName = GlobalMetaData.airlineDict[this.routeData[i].airline].name;

                if (this.dataType == FlowType.Passenger) {
                    _data.push([airlineName, this.routeData[i].pax]);
                    totalFlow += this.routeData[i].pax;
                }
                else {
                    _data.push([airlineName, this.routeData[i].freight]);
                    totalFlow += this.routeData[i].freight;
                }
            }

            this._divShareChart.innerHTML = "";

            if (totalFlow == 0) {
                this._tabShareTitle.innerHTML = '<span style="font-size: 24pt; color: #D0D0D0">' + Localization.strings.noDataAvailable + '</span>';
                this._divTimeSeriesChart.innerHTML = '';
                return;
            }

            this._tabShareTitle.innerHTML = "";
            var data = google.visualization.arrayToDataTable(_data);

            var options = {
                chartArea: {
                    top: 15,
                    left: 0,
                    height: 140,
                    width: '100%'
                },
                height: 160,
                width: 340,
                fontSize: 12
            };

            var chart = new google.visualization.PieChart(this._divShareChart);
            chart.draw(data, options);
            if (this.dataType == FlowType.Passenger) {
                this._tabShareTitle.innerHTML = Localization.strings.marketShareByPassenger;
            }
            else {
                this._tabShareTitle.innerHTML = Localization.strings.marketShareByFreight;
            }
        }

        public createTimeSeriesChart() {
            if (this.routeData == null)
                return;
            //this._divTimeSeriesChart.innerHTML = "";
            var totalFlow = [];
            var i, j;
            for (i = 0; i < this.routeData.length; i++) {
                for (j = 0; j < 12; j++) {
                    var flow;
                    if (this.dataType == FlowType.Passenger) {
                        flow = this.routeData[i].monthPax[j];
                    }
                    else {
                        flow = this.routeData[i].monthFreight[j];
                    }
                    flow = parseInt(flow);
                    totalFlow[j] += flow;
                }
            }
            var _data = [];
            var tickIdx = [];
            for (i = 0; i < 12; i += 2) {
                tickIdx.push([i, Localization.strings.monthName[i]]);
            }
            for (i = 0; i < this.routeData.length; i++) {
                var yearFlow: number = 0;
                var airlineName = GlobalMetaData.airlineDict[this.routeData[i].airline].name;

                if (this.dataType == FlowType.Passenger) {
                    for (j = 0; j < 12; j++) {
                        yearFlow += this.routeData[i].monthPax[j];
                    }
                    if (yearFlow > 0) {
                        var dataItem = {};
                        dataItem['data'] = [];
                        dataItem['label'] = airlineName;
                        for (j = 0; j < 12; j++) {
                            if (this.dataSourceMetaData.endTime.year == AST.GlobalStatus.year && j + 1 > this.dataSourceMetaData.endTime.month && j + 1 > 2) {
                                break;
                            }
                            dataItem['data'].push([j, this.routeData[i].monthPax[j]]);
                        }
                        _data.push(dataItem);
                    }
                }
                else {
                    for (j = 0; j < 12; j++) {
                        yearFlow += this.routeData[i].monthFreight[j];
                    }
                    if (yearFlow > 0) {
                        var dataItem = {};
                        dataItem['data'] = [];
                        dataItem['label'] = airlineName;
                        for (j = 0; j < 12; j++) {
                            if (this.dataSourceMetaData.endTime.year == AST.GlobalStatus.year && j + 1 > this.dataSourceMetaData.endTime.month && j + 1 > 2) {
                                break;
                            }
                            dataItem['data'].push([j, this.routeData[i].monthFreight[j]]);
                        }
                        _data.push(dataItem);
                    }
                }

            }
            if (_data.length == 0) {
                this._tabTimeSeriesTitle.innerHTML = '<span style="font-size: 24pt; color: #D0D0D0">' + Localization.strings.noDataAvailable + '</span>';
                this._divTimeSeriesChart.innerHTML = "";
                this._tabTimeSeriesFootNote.innerHTML = "";
                this.timeSeriesLegend.innerHTML = "";
                return;
            }

            $.plot(this.$$timeSeriesChart, _data, {
                xaxis: {
                    ticks: tickIdx,
                    max: 11
                },
                legend: {
                    show: true,
                    noColumns: 2,
                    container: this.timeSeriesLegend
                }
            });

            if (this.dataType == FlowType.Passenger) {
                this._tabTimeSeriesTitle.innerHTML = Localization.strings.timeSerierByPassenger;
            }
            else {
                this._tabTimeSeriesTitle.innerHTML = Localization.strings.timeSerierByFreight;
            }
        }

        public initUi() {
            super.initUi();

            // Create the summary table tab
            //this._tabSummary.appendChild(AST.Utils.createElement("div", { "height": "4px" }));
            this._tabSummary.innerTitle = AST.Utils.createElement("div", {"class": "standardDestPanelTabTitle" });
            this._tabSummary.summaryTable = AST.Utils.createElement("table", { "class": "standardDestPanelSummaryTable" });
            this._tabSummary.summaryTable.style.display = "block";
            this._tabSummary.summaryTable.style.overflow = "auto";
            this._tabSummary.footnote = document.createElement("div");

            this._tabSummary.appendChild(this._tabSummary.innerTitle);
            this._tabSummary.appendChild(AST.Utils.createElement("div", { "height": "4px" }));
            this._tabSummary.appendChild(this._tabSummary.summaryTable);
            this._tabSummary.appendChild(AST.Utils.createElement("div", { "height": "2px" }));
            this._tabSummary.appendChild(this._tabSummary.footnote);

            // Create the Tab in the interface.

            this.$tab.tabs({
                activate: (event, ui) => {
                    if (ui.newTab[0].id == this.$$$liTabShare) {
                        this.createShareSplitChart();
                    }
                    if (ui.newTab[0].id == this.$$$liTabTimeSeries) {
                        this.createTimeSeriesChart();
                    }
                }
            });

        }


        public localizeUi() {
            super.localizeUi();
            this.liTabSummary.firstElementChild.innerHTML = Localization.strings.statistic; 
            this.liTabShare.firstElementChild.innerHTML = Localization.strings.shareSplit; 
            this.liTabTimeSeries.firstElementChild.innerHTML = Localization.strings.timeSeries;             
        }
 
    }
} 