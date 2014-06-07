module AST {

    export class T100AirportPanel {
        private _cityName: HTMLElement = null;
        private _airportName = null;
        private _routeDist = null;
        private _tabs = null;

        private _tabSummary = null;

        // Share split
        private _tabShare = null;
        private _tabShareTitle = null;
        private _tabShareFootNote = null;
        private _shareChart = null;
        private _divShareChart = null;
        private _totalFlow = null;

        // Time series
        private _tabTimeSeries = null;
        private _tabTimeSeriesTitle = null;
        private _tabTimeSeriesFootNote = null;
        private _divTimeSeriesChart = null;


        private _btnShowFreight = null;
        private _btnShowPassenger = null;
        private _btnDetailReport = null;
        private detailReportFootNote = null;

        // Data
        private dataType = T100.T100DataType.Passenger;
        private routeData: Array<RouteRecord> = null;
        private distInfo: DistInfo = null;

        // Map buddy
        public mapBuddy: T100MapControl = null;
        public destDialogBuddy = null;

        constructor() {
            this.detailReportFootNote = document.getElementById("t100DataPanelDetailReportFootNote");
        }

        public onSizeChange = () => {
            var t100DestBar = document.getElementById("t100DestBar");
            var destBarHeight = parseInt(t100DestBar.style.height);
            this._tabSummary.summaryTable.style.maxHeight = (destBarHeight - 300) + "px";
        }

        private querySegment() {
            if (AST.GlobalStatus.year == null || AST.GlobalStatus.originAirport == null
                || AST.GlobalStatus.destAirport == null || AST.GlobalStatus.flowDir == null)
                return;

            var flowDir;
            if (AST.GlobalStatus.flowDir == AST.FlowDirection.To)
                flowDir = AST.FlowDirection.From;
            else
                flowDir = AST.FlowDirection.To;

            this.setAirportInfo(AST.GlobalStatus.destAirport, flowDir);

            T100.T100DataQuery.queryRoute(AST.GlobalStatus.year, AST.GlobalStatus.originAirport.iata,
                AST.GlobalStatus.destAirport.iata, (routeData, distInfo) => {
                    this.setRouteData(routeData, distInfo);
                });

            this.mapBuddy.selectDestAirportFeature(AST.GlobalStatus.destAirport.iata);
        }

        private setAirportInfo(airport: Airport, direction) {
            if (airport == null)
                return;
            var innerHTML = "";
            if (direction == AST.FlowDirection.To)
                innerHTML = "<b>" + Localization.strings.to + " : </b>";
            else
                innerHTML = "<b>" + Localization.strings.from + " : </b>";
            innerHTML += airport.iata + " / " + airport.icao;
            this.destDialogBuddy.setTitleText(innerHTML);
            this._cityName.innerHTML = Localization.strings.constructPlaceName(airport.country, airport.city);
            this._cityName.title = airport.cityEn + ", " + airport.countryEn;
            this._airportName.innerHTML = AST.Utils.compressAirportName(airport.name);
            this._airportName.title = airport.nameEn;
            this.detailReportFootNote.innerHTML = "";
            if (airport.countryEn != T100.T100DataMeta.currentCountry && AST.GlobalStatus.originAirport.countryEn != T100.T100DataMeta.currentCountry) {
                this.detailReportFootNote.innerHTML = T100.T100Localization.strings.onlyUSRouteAvailable;
            }
        }

        private createRouteInfo() {
            this._routeDist.innerHTML = Localization.strings.directDistance + this.distInfo.distKm +
            " km &#8901; " + this.distInfo.distMile + " miles &#8901; " + this.distInfo.distNm + " nm";
            var activeTab = $("#t100DataPanelTabs").tabs("option", "active");
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

        private setRouteData(data: Array<RouteRecord>, distInfo: DistInfo) {
            this.routeData = data;
            this.distInfo = distInfo;
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

            if (this.dataType == T100.T100DataType.Passenger) {
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
                if (this.dataType == T100.T100DataType.Passenger) {
                    return parseInt(a.pax) < parseInt(b.pax) ? 1 : -1;
                } else {
                    return parseInt(a.freight) < parseInt(b.freight) ? 1 : -1;
                }
            }

            var numItem = 0;
            var data = this.routeData;
            data.sort(compareItem);
            for (var i = 0; i < data.length; i++) {
                if (this.dataType == T100.T100DataType.Passenger && data[i].pax == 0
                    || this.dataType == T100.T100DataType.Freight && data[i].freight == 0)
                    continue;

                var tr = AST.Utils.createElement("tr", { "class": i % 2 == 0 ? "alt" : "" });
                tr.appendChild(AST.Utils.createElement("td", { "class": "rowIndex", "text": (i + 1).toString(), "rowSpan": 2 }));
                tr.appendChild(AST.Utils.createElement("td", { "class": "rowName", "text": data[i].airline.getDisplayName(), "colSpan": 4 }));

                tableBody.appendChild(tr);

                tr = AST.Utils.createElement("tr", { "class": i % 2 == 0 ? "alt" : "" });

                tr.appendChild(AST.Utils.createElement("td", { "class": "rowItemIndex", "text": Localization.strings.departureFreq }));
                tr.appendChild(AST.Utils.createElement("td", { "class": "rowItem", "text": data[i].departure.toString() }));
                var itemName = this.dataType == T100.T100DataType.Passenger ? Localization.strings.passengerFreq : Localization.strings.freightFreq;
                tr.appendChild(AST.Utils.createElement("td", { "class": "rowItemIndex", "text": itemName }));


                var flow = AST.Utils.formatNumber(this.dataType == T100.T100DataType.Passenger ? data[i].pax : data[i].freight);
                if (this.dataType == T100.T100DataType.Freight) {
                    flow += " " + Localization.strings.tons;
                }
                tr.appendChild(AST.Utils.createElement("td", { "class": "rowItem", "text": flow }));
                tableBody.appendChild(tr);
                numItem += 1;
            }
            if (numItem > 0) {
                if (this.dataType == T100.T100DataType.Passenger)
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

        private setShowFlowType(flowType) {
            if (this.routeData == null)
                return;

            this.dataType = flowType;
            this.createRouteInfo();
        }

        // Trigger when the destination of T100OriginPanel change
        public onDestChange = () => {
            this.querySegment();
        }

        private createShareSplitChart() {
            if (this.routeData == null)
                return;
            var _data;
            if (this.dataType == T100.T100DataType.Passenger) {
                _data = [['Airline', 'Pax']];
            }
            else {
                _data = [['Airline', 'Freight']];
            }

            var totalFlow = 0;

            for (var i = 0; i < this.routeData.length; i++) {
                var airlineName = this.routeData[i].airline.name;

                if (this.dataType == T100.T100DataType.Passenger) {
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
            if (this.dataType == T100.T100DataType.Passenger) {
                this._tabShareTitle.innerHTML = Localization.strings.marketShareByPassenger;
            }
            else {
                this._tabShareTitle.innerHTML = Localization.strings.marketShareByFreight;
            }
        }

        private createTimeSeriesChart() {
            if (this.routeData == null)
                return;
            //this._divTimeSeriesChart.innerHTML = "";
            var totalFlow = [];
            var i, j;
            for (i = 0; i < this.routeData.length; i++) {
                for (j = 0; j < 12; j++) {
                    var flow;
                    if (this.dataType == T100.T100DataType.Passenger) {
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
                var airlineName = this.routeData[i].airline.name;

                if (this.dataType == T100.T100DataType.Passenger) {
                    for (j = 0; j < 12; j++) {
                        yearFlow += this.routeData[i].monthPax[j];
                    }
                    if (yearFlow > 0) {
                        var dataItem = {};
                        dataItem['data'] = [];
                        dataItem['label'] = airlineName;
                        for (j = 0; j < 12; j++) {
                            if (T100.T100DataMeta.dataTo.year == AST.GlobalStatus.year && j + 1 > T100.T100DataMeta.dataTo.month && j + 1 > 2) {
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
                            if (T100.T100DataMeta.dataTo.year == AST.GlobalStatus.year && j + 1 > T100.T100DataMeta.dataTo.month && j + 1 > 2) {
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
                document.getElementById("t100DataPanelTabTimeSeriesLegend").innerHTML = "";
                return;
            }
            $.plot("#t100DataPanelTabTimeSeriesChart", _data, {
                xaxis: {
                    ticks: tickIdx,
                    max: 11
                },
                legend: {
                    show: true,
                    noColumns: 2,
                    container: document.getElementById("t100DataPanelTabTimeSeriesLegend")
                }
            });

            if (this.dataType == T100.T100DataType.Passenger) {
                this._tabTimeSeriesTitle.innerHTML = Localization.strings.timeSerierByPassenger;
            }
            else {
                this._tabTimeSeriesTitle.innerHTML = Localization.strings.timeSerierByFreight;
            }
        }

        public initUI() {
            // Create the summary table tab
            this._tabSummary.appendChild(AST.Utils.createElement("div", { "height": "4px" }));
            this._tabSummary.innerTitle = AST.Utils.createElement("div", { "id": "t100DataPanelSummaryTitle", "class": "t100DataPanelTabTitle" });
            this._tabSummary.summaryTable = AST.Utils.createElement("table", { "id": "t100DataPanelSummaryTable" });
            this._tabSummary.summaryTable.style.display = "block";
            this._tabSummary.summaryTable.style.overflow = "auto";
            this._tabSummary.footnote = document.createElement("div");

            this._tabSummary.appendChild(this._tabSummary.innerTitle);
            this._tabSummary.appendChild(AST.Utils.createElement("div", { "height": "4px" }));
            this._tabSummary.appendChild(this._tabSummary.summaryTable);
            this._tabSummary.appendChild(AST.Utils.createElement("div", { "height": "2px" }));
            this._tabSummary.appendChild(this._tabSummary.footnote);

            //this._btnShowPassenger.onclick = this.setShowPassenger;
            //this._btnShowFreight.onclick = this.setShowFreight;
            $("#radioFlowType").buttonset();
            $("#radioFlowType :radio").click((e) => {
                if (this._btnShowPassenger.checked)
                    this.setShowFlowType(T100.T100DataType.Passenger);
                else
                    this.setShowFlowType(T100.T100DataType.Freight);
            });

            // Share split tab
            //this._shareChart = new google.visualization.PieChart(this._divShareChart);

            // Create the Tab in the interface.

            $("#t100DataPanelTabs").tabs({
                activate: (event, ui) => {
                    if (ui.newTab[0].id == "liT100DataPanelTabsShare") {
                        this.createShareSplitChart();
                    }
                    if (ui.newTab[0].id == "liT100DataPanelTabTimeSeries") {
                        this.createTimeSeriesChart();
                    }
                }

            });

            this._btnDetailReport.onclick = () => {
                if (!AST.GlobalStatus.originAirport || !AST.GlobalStatus.destAirport)
                    return;
                T100.T100Common.launchRouteStat(AST.GlobalStatus.originAirport.iata, AST.GlobalStatus.destAirport.iata, null /*airline*/, AST.GlobalStatus.year);
            };
            this.localizeUi();
        }

        localizeUi() {
            document.getElementById("t100DestBarShowInfoForText").innerHTML = Localization.strings.showInfoFor;
            document.getElementById("t100DataPanelTabsMatricDataText").innerHTML = Localization.strings.metricData;
            $("#t100DataPanelShowPassenger").button("option", "label", Localization.strings.passenger);
            $("#t100DataPanelShowFreight").button("option", "label", Localization.strings.freight);
            this._btnDetailReport.innerHTML = Localization.strings.routeDetailReport;

            (<HTMLElement> document.getElementById("liT100DataPanelTabSummary").firstElementChild).innerHTML = Localization.strings.statistic;
            (<HTMLElement> document.getElementById("liT100DataPanelTabsShare").firstElementChild).innerHTML = Localization.strings.shareSplit;
            (<HTMLElement> document.getElementById("liT100DataPanelTabTimeSeries").firstElementChild).innerHTML = Localization.strings.timeSeries;
        }

        createAirportItem(dest: DestInfo) {
            var item = AST.Utils.createElement("div", {
                "class": "ddCommonItem"
            });
            if (dest.sumPax == 0) {
                item.style.color = "#6600FF";
            }
            var ddAirportCode = AST.Utils.createElement("span", {
                "class": "ddAirportCode",
                "text": dest.airport.iata + "/" + dest.airport.icao
            });
            var ddAirportCity = AST.Utils.createElement("span", {
                "class": "ddAirportCity",
                "text": dest.airport.city
            });

            item.appendChild(ddAirportCode);
            item.appendChild(ddAirportCity);
            return item;
        }

        private updateOriginPosition(numDest) {
            var geom = AST.GlobalStatus.originAirport.geom;
            var originPt = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(geom.x, geom.y).transform(MapUtils.projWGS84, MapUtils.projMercator));
            this.mapBuddy.layerOrigin.addFeatures(originPt);
        }

        public updateMap(airports: Array<DestInfo>) {
            if (!AST.GlobalStatus.originAirport)
                return;
            this.mapBuddy.clearDestFeatures();
            this.updateOriginPosition(airports.length);

            // draw the routes        
            for (var i = 0; i < airports.length; i++) {
                for (var j = 0; j < airports[i].routeGeomO.length; j++) {
                    airports[i].routeGeomO[j].style = {};

                    if (airports[i].dataSource == "CAA") {
                        airports[i].routeGeomO[j].style.strokeColor = "#A0A0A0";
                        airports[i].routeGeomO[j].style.strokeOpacity = .3;
                    }
                    else if (airports[i].dataSource == "T100") {
                        if (airports[i].airport.countryEn != T100.T100DataMeta.currentCountry && AST.GlobalStatus.originAirport.countryEn != T100.T100DataMeta.currentCountry)
                            airports[i].routeGeomO[j].style.strokeDashstyle = "dash";
                        if (airports[i].sumPax != 0) {
                            airports[i].routeGeomO[j].style.strokeColor = "#0066FF";
                        } else {
                            airports[i].routeGeomO[j].style.strokeColor = "#6600FF";
                        }
                        airports[i].routeGeomO[j].style.strokeOpacity = .6;
                    }
                }
                this.mapBuddy.layerRoute.addFeatures(airports[i].routeGeomO);
            }

            // draw the destination        
            for (var i = 0; i < airports.length; i++) {
                var feature: any = new OpenLayers.Feature.Vector(airports[i].airport.geomO);
                feature.airport = {
                    "iata": airports[i].airport.iata,
                    "icao": airports[i].airport.icao,
                    "city": airports[i].airport.city,
                    "country": airports[i].airport.country,
                    "name": airports[i].airport.name,
                    "airportGeom": airports[i].airport.geomO
                };
                feature.attributes.iata = airports[i].airport.iata;
                //if (airports[i].dataSource == "CAA") {
                //    this.mapBuddy.layerDestInactive.addFeatures(feature);
                //} else {
                    this.mapBuddy.layerDest.addFeatures(feature);
                //}
            }

            this.mapBuddy.activateOpenLayersControl();
        }

        static createT100AirportPanel(): T100AirportPanel {
            var t100DestPanel = new AST.T100AirportPanel();
            t100DestPanel._cityName = document.getElementById("destBarCityName");
            t100DestPanel._airportName = document.getElementById("destBarAirportName");
            t100DestPanel._routeDist = document.getElementById("destBarDistance");
            t100DestPanel._totalFlow = document.getElementById("t100DataPanelTotalFlow");

            t100DestPanel._tabs = document.getElementById("t100DataPanelTabs");

            t100DestPanel._tabSummary = document.getElementById("t100DataPanelTabSummary");
            t100DestPanel._tabShare = document.getElementById("t100DataPanelTabsShare");
            t100DestPanel._tabShareTitle = document.getElementById("t100DataPanelTabShareTitle");
            t100DestPanel._divShareChart = document.getElementById("t100DataPanelPieChart");
            t100DestPanel._tabShareFootNote = document.getElementById("t100DataPanelTabShareFootNote");


            t100DestPanel._tabTimeSeries = document.getElementById("t100DataPanelTabTimeSeries");
            t100DestPanel._tabTimeSeriesTitle = document.getElementById("t100DataPanelTabTimeSeriesTitle");
            t100DestPanel._tabTimeSeriesFootNote = document.getElementById("t100DataPanelTabTimeSeriesFootNote");
            t100DestPanel._divTimeSeriesChart = document.getElementById("t100DataPanelTabTimeSeriesChart");

            t100DestPanel._btnDetailReport = document.getElementById("t100DataPanelDetailReportBtn");
            t100DestPanel._btnShowPassenger = document.getElementById("t100DataPanelShowPassenger");
            t100DestPanel._btnShowFreight = document.getElementById("t100DataPanelShowFreight");


            t100DestPanel.initUI();
            return t100DestPanel;
        }
    }
} 