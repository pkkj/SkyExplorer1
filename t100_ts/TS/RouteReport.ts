module AST {
    export class RouteReport {
        private originCode: string = null;
        private destCode: string = null;
        private originAirport: Airport = null;
        private destAirport: Airport = null;
        private initAirline = null;
        private initYear = null;

        private summaryYearSel: DropDown = null;
        private summaryAirlineSel: DropDown = null;

        // data related variables
        private curDataSrc: DataSourceMetaData = null;
        private routeAircraftStat = null;
        private aircraftData = null;

        private dataReady = false;
        private timeSeriesData = null;
        private seatTimeSeriesData = null;

        private timeSeriesAirlineSel: DropDown = null;
        private seatTimeSeriesAirlineSel: DropDown = null;

        private urlParams = null;
        private airlineMap = {};
        private seatDataAirlineMap = {};
        private paxSeatTimeSeries = {};

        private summaryDepartureShareTable: SimpleTable = null;
        private summaryPaxShareTable: SimpleTable = null;
        private summaryFreightShareTable: SimpleTable = null;

        private yearAvailableFrom: YearMonth = null;
        private yearAvailableTo: YearMonth = null;

        // HTML elements
        private linkReverseRoute: HTMLAnchorElement = null;
        private dataSrcFootNote: HTMLDivElement = null;

        constructor() {

        }
        private initAircraftUsage() {
            var i, item;
            this.summaryYearSel = new DropDown(document.getElementById("summaryYearSel"), {
                "titleWidth": 130,
                "containerMaxHeight": 500
            });

            var yearIdx = 0;
            for (i = 0; i < T100.T100MetaData.availablity.length; i++) {
                if (this.initYear == T100.T100MetaData.availablity[i])
                    yearIdx = i;
                item = this.summaryYearSel.createItem(T100.T100MetaData.availablity[i]);
                this.summaryYearSel.insertItem(item, T100.T100MetaData.availablity[i]);
            }
            this.summaryYearSel.setSelectedIndex(yearIdx);

            this.summaryYearSel.onChangeHandler = () => {
                if (!this.dataReady)
                    return;
                this.queryRouteAircraftStat();
            };

            this.summaryAirlineSel = new DropDown(document.getElementById("summaryAirlineSel"), {
                "titleWidth": 200,
                "containerMaxHeight": 500
            });

            this.summaryAirlineSel.onChangeHandler = () => {
                if (!this.dataReady)
                    return;
                if (this.routeAircraftStat) {
                    this.updateRouteAircraftStat();
                }
            };

            this.summaryDepartureShareTable = new SimpleTable(document.getElementById("airlineShareDeparture"), { "width": 390 });
            this.summaryPaxShareTable = new SimpleTable(document.getElementById("airlineSharePax"), { "width": 390 });
            this.summaryFreightShareTable = new SimpleTable(document.getElementById("airlineShareFreight"), { "width": 390 });

        }

        private initTimeSeries() {
            $("#timeSeriesTimeScale").buttonset();
            $("#timeSeriesTimeScale :radio").click((e) => {
                if (this.timeSeriesData != null)
                    this.updateTimeSeries($("#timeSeriesSlider").slider("values", 0), $("#timeSeriesSlider").slider("values", 1));
            });

            $("#timeScaleYear").button("option", "label", Localization.strings.timeScaleYear);
            $("#timeScaleQuarter").button("option", "label", Localization.strings.timeScaleQuarter);
            $("#timeScaleMonth").button("option", "label", Localization.strings.timeScaleMonth);
            this.timeSeriesAirlineSel = new DropDown(document.getElementById("timeSeriesAirlineSel"), {
                "titleWidth": 200,
                "containerMaxHeight": 500
            });

            $("#timeSeriesSlider").slider({
                range: true,
                min: this.yearAvailableFrom.year,
                max: this.yearAvailableTo.year,
                values: [this.yearAvailableFrom.year, this.yearAvailableTo.year],
                slide: (event, ui) => {
                    if (this.timeSeriesData == null)
                        return;
                    document.getElementById("timeSeriesSliderYearRange").innerHTML = ui.values[0] + " - " + ui.values[1];
                },
                change: (event, ui) => {
                    if (this.timeSeriesData == null)
                        return;
                    this.updateTimeSeries($("#timeSeriesSlider").slider("values", 0), $("#timeSeriesSlider").slider("values", 1));
                }

            });
            document.getElementById("timeSeriesSliderYearRange").innerHTML = $("#timeSeriesSlider").slider("values", 0) + " - " + $("#timeSeriesSlider").slider("values", 1);
        }

        private getYearAvailability() {
            this.yearAvailableFrom = this.curDataSrc.startTime;
            this.yearAvailableTo = this.curDataSrc.endTime;
        }

        private initSeatTimeSeries() {
            $("#seatTimeSeriesTimeScale").buttonset();
            $("#seatTimeSeriesTimeScale :radio").click((e) => {
                if (this.seatTimeSeriesData != null)
                    this.updateSeatTimeSeries($("#seatTimeSeriesSlider").slider("values", 0), $("#seatTimeSeriesSlider").slider("values", 1));
            });

            $("#seatTimeScaleYear").button("option", "label", Localization.strings.timeScaleYear);
            $("#seatTimeScaleQuarter").button("option", "label", Localization.strings.timeScaleQuarter);
            $("#seatTimeScaleMonth").button("option", "label", Localization.strings.timeScaleMonth);
            this.seatTimeSeriesAirlineSel = new DropDown(document.getElementById("seatTimeSeriesAirlineSel"), {
                "titleWidth": 200,
                "containerMaxHeight": 500
            });

            $("#seatTimeSeriesSlider").slider({
                range: true,
                min: this.yearAvailableFrom.year,
                max: this.yearAvailableTo.year,
                values: [this.yearAvailableFrom.year, this.yearAvailableTo.year],
                slide: (event, ui) => {
                    if (this.timeSeriesData == null)
                        return;
                    document.getElementById("seatTimeSeriesSliderYearRange").innerHTML = ui.values[0] + " - " + ui.values[1];
                },
                change: (event, ui) => {
                    if (this.seatTimeSeriesData == null)
                        return;
                    this.updateSeatTimeSeries($("#seatTimeSeriesSlider").slider("values", 0), $("#seatTimeSeriesSlider").slider("values", 1));
                }

            });
            document.getElementById("seatTimeSeriesSliderYearRange").innerHTML = $("#seatTimeSeriesSlider").slider("values", 0) + " - " + $("#seatTimeSeriesSlider").slider("values", 1);
        }

        // Initialize the data source info and query necessary data from web service.
        public initData() {
            var deferred = $.Deferred();
            this.urlParams = Utils.decodeUrlPara();
            this.originCode = this.urlParams["originCode"];
            this.destCode = this.urlParams["destCode"];
            this.initAirline = this.urlParams["airline"];
            this.initYear = this.urlParams["year"];

            DataSourceRegister.registerDataSource("T100Data", T100.T100MetaData.instance());
            DataSourceRegister.registerDataSource("T100FF", T100.T100FFMetaData.instance());
            DataSourceRegister.registerDataSource("UkData", UkData.UkMetaData.instance());
            DataSourceRegister.registerDataSource("TaiwanData", TwData.TwMetaData.instance());
            DataSourceRegister.registerDataSource("JapanData", JpData.JpMetaData.instance());
            DataSourceRegister.registerDataSource("KoreaData", KrData.KrMetaData.instance());

            this.queryAvailableDataSrc().done(() => {
                deferred.resolve();
            });
            return deferred.promise();
        }

        public initUi() {
            // Hook up with HTML element
            this.linkReverseRoute = <HTMLAnchorElement>document.getElementById("linkReverseRoute");
            this.dataSrcFootNote = <HTMLDivElement>document.getElementById("dataSrcFootNote");

            // Reverse route link
            this.linkReverseRoute.innerHTML = Localization.strings.constructViewReverseRouteData(this.destCode, this.originCode);
            this.linkReverseRoute.onclick = () => {
                var where = "originCode=" + this.destCode;
                where += "&destCode=" + this.originCode;
                if (this.initAirline)
                    where += "&airline=" + this.initAirline;
                if (this.initYear)
                    where += "&year=" + this.initYear;
                where += "&locale=" + AST.Localization.getLocale();
                window.location.href = "RouteReport.html?" + where;
            };

            // Set the data source
            this.dataSrcFootNote.innerText = this.curDataSrc.getRouteReportPageFootnote(this.originAirport, this.destAirport);

            $("#mainTab").tabs({
                activate: (event, ui) => {
                    if (ui.newTab[0].id == "liSummary") {
                        this.queryRouteAircraftStat();
                    }
                    if (ui.newTab[0].id == "liTimeSeries") {
                        if (this.timeSeriesData != null)
                            this.updateTimeSeries($("#timeSeriesSlider").slider("values", 0), $("#timeSeriesSlider").slider("values", 1));
                        else
                            this.queryTimeSeries();
                    }
                    if (ui.newTab[0].id == "liSeatTimeSeries") {
                        //seatTimeSeriesData
                        if (this.seatTimeSeriesData != null)
                            this.updateSeatTimeSeries($("#seatTimeSeriesSlider").slider("values", 0), $("#seatTimeSeriesSlider").slider("values", 1));
                        else
                            this.querySeatTimeSeries();
                    }
                }
            });

            // Disable the unsupported feature for current data source
            var disablePage: Array<number> = [];
            if (!this.curDataSrc.getSupportDataOption("aircraft")) {
                disablePage.push(2);
            }
            if (!this.curDataSrc.getSupportDataOption("seat")) {
                disablePage.push(1);
            }
            $("#mainTab").tabs({ disabled: disablePage });

            this.initAircraftUsage();
            this.localizeUi();
        }

        private localizeUi() {
            (<HTMLElement> document.getElementById("liSummary").firstElementChild).innerHTML = Localization.strings.aircraftUsage;
            (<HTMLElement> document.getElementById("liTimeSeries").firstElementChild).innerHTML = Localization.strings.timeSeriesOfFlow;
            (<HTMLElement> document.getElementById("liSeatTimeSeries").firstElementChild).innerHTML = Localization.strings.timeSeriesOfSeat;
            document.getElementById("airportTitleFromText").innerHTML = Localization.strings.routeReportPageAirportFrom;
            document.getElementById("airportTitleToText").innerHTML = Localization.strings.routeReportPageAirportTo;
            document.getElementById("tabSummaryYearText").innerHTML = Localization.strings.year;
            document.getElementById("tabSummaryAirlineText").innerHTML = Localization.strings.airline;

            document.getElementById("tabSummaryAircraftShareDeparture").innerHTML = Localization.strings.aircraftMarketShareByDeparture;
            document.getElementById("tabSummaryAircraftSharePassenger").innerHTML = Localization.strings.aircraftMarketShareByPassenger;
            document.getElementById("tabSummaryAircraftShareFreight").innerHTML = Localization.strings.aircraftMarketShareByFreight;

            document.getElementById("tabTimeSeriesShowChartByText").innerHTML = Localization.strings.showChartBy;
            document.getElementById("tabTimeSeriesAirlineByText").innerHTML = Localization.strings.airline;
            document.getElementById("tabTimeSeriesSliderYearRangeText").innerHTML = Localization.strings.yearRange;


            document.getElementById("tabSeatTimeSeriesShowChartByText").innerHTML = Localization.strings.showChartBy;
            document.getElementById("tabSeatTimeSeriesAirlineByText").innerHTML = Localization.strings.airline;
            document.getElementById("tabSeatTimeSeriesSliderYearRangeText").innerHTML = Localization.strings.yearRange;
            document.getElementById("loadTimeSeriesChartSubTitle").innerHTML = T100.T100Localization.strings.thisChartShowTheLoadFactor;
        }

        private makeAircraftRank(table, type, dataKey) {
            var airline = this.summaryAirlineSel.selectedData;
            var rank = this.routeAircraftStat[airline];
            table.clear();
            var totalItem = 6;
            var item;
            for (var i = 0; i < totalItem; i++) {
                if (i < rank[dataKey].length) {
                    var aircraft = rank[dataKey][i][0];
                    if (aircraft != "Other")
                        aircraft = this.aircraftData[rank[dataKey][i][0]].FullName;

                    var flow = Utils.formatNumber(rank[dataKey][i][1]);
                    item = ReportPageUtils.createRankSummaryItem(type, aircraft, flow, rank[dataKey][i][2]);
                }
                else {
                    item = ReportPageUtils.createRankSummaryItem("", "", "", "");
                }

                table.addItem(item);
            }
        }

        private makeAircraftShare(div, dataType, dataKey) {
            div.innerHTML = "";
            var airline = this.summaryAirlineSel.selectedData;
            var rank = this.routeAircraftStat[airline];
            if (rank[dataKey].length == 0) {
                div.innerHTML = '<span style="font-size: 24pt; color: #D0D0D0">&nbsp;&nbsp;&nbsp;' + Localization.strings.noDataAvailable + '</span>';
                return 0;
            }
            var _data;
            if (dataType == "Passenger") {
                _data = [['Aircraft', 'Pax']];
            }
            else {
                _data = [['Aircraft', 'Freight']];
            }

            var totalFlow = 0;
            for (var i = 0; i < rank[dataKey].length; i++) {
                var aircraft = rank[dataKey][i][0];
                if (aircraft != "Other")
                    aircraft = this.aircraftData[rank[dataKey][i][0]].ShortName;
                _data.push([aircraft, parseInt(rank[dataKey][i][1])]);
                totalFlow += parseInt(rank[dataKey][i][1]);
            }

            if (totalFlow == 0) {
                return totalFlow;
            }

            var data = google.visualization.arrayToDataTable(_data);

            var options = {
                chartArea: {
                    top: 25,
                    left: 15,
                    height: 190,
                    width: 340
                },
                height: 230,
                width: 360,
                fontSize: 12
            };

            var chart = new google.visualization.PieChart(div);
            chart.draw(data, options);
            return totalFlow;
        }

        private makeSummaryTotal(year, totalPax, totalFreight) {
            var div = document.getElementById("summaryTotal");
            div.innerHTML = Localization.strings.inXxxxYear + Localization.strings.yearFormalRepresentation(year) + ": ";
            div.innerHTML += "<b>" + Localization.strings.totalPassenger + "</b>" + Utils.formatNumber(totalPax);
            div.innerHTML += " ---- ";
            div.innerHTML += "<b>" + Localization.strings.totalFreight + "</b>" + Utils.formatNumber(totalFreight) + Localization.strings.tons;
        }

        private updateRouteAircraftStat() {
            this.makeAircraftRank(this.summaryDepartureShareTable, Localization.strings.departureFreq, "aircraftDeparture");
            this.makeAircraftRank(this.summaryPaxShareTable, Localization.strings.passengerFreq, "aircraftPax");
            this.makeAircraftRank(this.summaryFreightShareTable, Localization.strings.freightFreq, "aircraftFreight");
            var totalDeparture = this.makeAircraftShare(document.getElementById("airlineShareDepartureChart"), "Departure", "aircraftDeparture");
            var totalPax = this.makeAircraftShare(document.getElementById("airlineSharePaxChart"), "Passenger", "aircraftPax");
            var totalFreight = this.makeAircraftShare(document.getElementById("airlineShareFreightChart"), "Freight", "aircraftFreight");
            var div = document.getElementById("summaryTotalFootNote");

            var airlineName = this.summaryAirlineSel.selectedData;
            if (airlineName == "All")
                airlineName = Localization.strings.allAirlinesSummary;
            else
                airlineName = Localization.strings.xArlineSummary(airlineName);
            div.innerHTML = "<b>" + airlineName + "<b/> ";
            div.innerHTML += "<b>" + Localization.strings.departureFreq + "</b>: " + Utils.formatNumber(totalDeparture);
            div.innerHTML += " ---- ";
            div.innerHTML += "<b>" + Localization.strings.passengerFreq + "</b>: " + Utils.formatNumber(totalPax);
            div.innerHTML += " ---- ";
            div.innerHTML += "<b>" + Localization.strings.freightFreq + "</b>: " + Utils.formatNumber(totalFreight) + Localization.strings.tons;

        }
        private setTitle() {
            var city: City;
            document.getElementById("fromAirportCode").innerHTML = this.originAirport.iata + "/" + this.originAirport.icao;
            city = City.parseCity(this.originAirport.serveCityL);
            document.getElementById("fromAirportCity").innerHTML = Localization.strings.constructPlaceName(city.country, city.subdiv, city.city);
            document.getElementById("fromAirportName").innerHTML = this.originAirport.name;
            document.getElementById("toAirportCode").innerHTML = this.destAirport.iata + "/" + this.destAirport.icao;
            city = City.parseCity(this.destAirport.serveCityL);
            document.getElementById("toAirportCity").innerHTML = Localization.strings.constructPlaceName(city.country, city.subdiv, city.city);
            document.getElementById("toAirportName").innerHTML = this.destAirport.name;
        }

        private setAvailableAirline() {
            this.summaryAirlineSel.clearAllItem();
            var item = this.summaryAirlineSel.createItem(Localization.strings.all);
            this.summaryAirlineSel.insertItem(item, "All");
            for (var airlineCode in this.routeAircraftStat) {
                if (this.routeAircraftStat.hasOwnProperty(airlineCode) && airlineCode != "All") {
                    var item = this.summaryAirlineSel.createItem(this.routeAircraftStat[airlineCode].airlineName + " (" + this.routeAircraftStat[airlineCode].airline + ")");
                    this.summaryAirlineSel.insertItem(item, this.routeAircraftStat[airlineCode].airline);
                }
            }
        }

        private initSelect() {
            if (!this.initAirline) {
                this.summaryAirlineSel.setSelectedIndex(0);
            } else {
                if (!this.summaryAirlineSel.setSelectedItemByText(this.initAirline)) {
                    this.summaryAirlineSel.setSelectedIndex(0);
                    this.initAirline = null;
                }
            }
        }

        public queryRouteAircraftStat() {
            var callback = (data) => {
                this.routeAircraftStat = data["routes"];
                this.aircraftData = data["aircrafts"];
                this.dataReady = true;
                this.setAvailableAirline();
                this.makeSummaryTotal(this.summaryYearSel.selectedData, data["totalPax"], data["totalFreight"]);
                this.initSelect();

            }
            T100.T100DataQuery.queryRouteAircraftStat(this.summaryYearSel.selectedData, this.originCode, this.destCode, callback);
        }

        public queryAvailableDataSrc() {
            var deferred = $.Deferred();
            var callback = (originAirport: Airport, destAirport: Airport, dataSrc: Array<string>) => {
                this.originAirport = originAirport;
                this.destAirport = destAirport;
                this.setTitle();
                if (dataSrc.length == 0) {
                    // no data source available.
                } else {
                    this.setCurrentDataSource(dataSrc);
                    this.createMultipleDataSrcDiv(dataSrc);
                    this.getYearAvailability();
                    deferred.resolve();
                }
            };
            DataQuery.queryRouteAvailableDataSource(this.originCode, this.destCode, callback);
            return deferred.promise();
        }

        // Create the HTML DOM for multiple data sources.
        private createMultipleDataSrcDiv(dataSrc: Array<string>) {
            if (dataSrc.length > 1) {
                var availableDataSrcDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("availableDataSrc");
                availableDataSrcDiv.appendChild(Utils.createElement("span", { "text": Localization.strings.viewDataFromOtherSourcesForThisAirport }));

                var atBegin: boolean = true;
                for (var i = 0; i < dataSrc.length; i++) {
                    var dataSrcName = dataSrc[i];
                    if (dataSrcName == this.curDataSrc.name)
                        continue;
                    var info: DataSourceMetaData = DataSourceRegister.queryInfo(dataSrcName);
                    if (atBegin)
                        atBegin = false;
                    else
                        availableDataSrcDiv.appendChild(Utils.createElement("span", { "text": ", " }));

                    var anchor: HTMLAnchorElement = <HTMLAnchorElement>Utils.createElement("a", { "text": info.getShortInfoLocalizeName() });

                    var where: string = "originCode=" + this.urlParams["originCode"];
                    where += "&destCode=" + this.urlParams["destCode"];
                    where += this.urlParams["airline"] ? ("&airline=" + this.urlParams["airline"]) : "";
                    where += "&dataSrc=" + dataSrc[i];
                    where += this.urlParams["year"] ? ("&year=" + this.urlParams["year"]) : "";
                    where += "&locale=" + AST.Localization.getLocale();
                    anchor.href = "RouteReport.html?" + where;

                    availableDataSrcDiv.appendChild(anchor);
                }
            }
        }

        // Determine the current data source
        private setCurrentDataSource(dataSrc: Array<string>) {
            for (var i = 0; i < dataSrc.length; i++) {
                if (this.urlParams["dataSrc"] && dataSrc[i] == this.urlParams["dataSrc"]) {
                    this.curDataSrc = DataSourceRegister.queryInfo(this.urlParams["dataSrc"]);
                    return;
                }
                var tmpDataSrc = DataSourceRegister.queryInfo(dataSrc[i]);
                // If no data source is specified, we will determine according to the origin airport.
                if (tmpDataSrc.country == this.originAirport.country) {
                    this.curDataSrc = tmpDataSrc;
                }
                if (tmpDataSrc.country == this.destAirport.country && this.curDataSrc == null) {
                    this.curDataSrc = tmpDataSrc;
                }
            }
            if (this.curDataSrc == null) {
                this.curDataSrc = DataSourceRegister.queryInfo(dataSrc[0]); // assign the default data source
            }
        }

        private normalTimeSeriesDataGenerator = (timeSeriesData, timeScale, dataType, airlines, yearFrom, yearTo, divideNum) => {
            var data = [];
            for (var airlineIdx = 0; airlineIdx < airlines.length; airlineIdx++) {

                var inputIdx = (yearFrom - this.curDataSrc.startTime.year) * 12;
                var outputIdx = 0;
                var timeData = timeSeriesData[dataType][airlines[airlineIdx]];
                var localData = [];
                for (var year = yearFrom; year <= yearTo; year++) {
                    var monthStart = 1;
                    if (year == this.curDataSrc.startTime.year)
                        monthStart = this.curDataSrc.startTime.month;
                    var monthEnd = 12;
                    if (year == this.curDataSrc.endTime.year)
                        monthEnd = this.curDataSrc.endTime.month;

                    var yearAccumulate = 0;
                    var yearAccumulateMonth = 0;

                    var curQuarter = 1;
                    var quarterAccumulate = 0;
                    var quarterAccumulateMonth = 0;
                    for (var month = monthStart; month <= monthEnd; month++) {
                        if (timeScale == "Month") {
                            localData.push([outputIdx, timeData[inputIdx]]);
                            outputIdx++;

                        } else if (timeScale == "Year") {
                            yearAccumulate += timeData[inputIdx];
                            yearAccumulateMonth++;
                            if (yearAccumulateMonth == 12) {
                                localData.push([outputIdx, yearAccumulate / divideNum]);
                                outputIdx++;
                            }

                        } else {
                            quarterAccumulate += timeData[inputIdx];
                            quarterAccumulateMonth++;
                            if (month % 3 == 0) {
                                if (quarterAccumulateMonth == 3) {
                                    localData.push([outputIdx, quarterAccumulate / divideNum]);
                                    outputIdx++;
                                    curQuarter++;
                                }

                                quarterAccumulate = 0;
                                quarterAccumulateMonth = 0;
                            }
                        }

                        inputIdx++;
                    }
                }
                data.push({
                    "data": localData,
                    "label": airlines[airlineIdx]
                });
            }
            return data;
        }

        private loadTimeSeriesDataGenerator = (timeSeriesData, timeScale, dataType, airlines, yearFrom, yearTo) => {
            var data = [];
            for (var airlineIdx = 0; airlineIdx < airlines.length; airlineIdx++) {
                var inputIdx = (yearFrom - this.curDataSrc.startTime.year) * 12;
                var outputIdx = 0;
                var paxTimeData = timeSeriesData["pax"][airlines[airlineIdx]];
                var seatTimeData = timeSeriesData["seat"][airlines[airlineIdx]];
                var localData = [];
                for (var year = yearFrom; year <= yearTo; year++) {
                    var monthStart = 1;
                    if (year == this.curDataSrc.startTime.year)
                        monthStart = this.curDataSrc.startTime.month;
                    var monthEnd = 12;
                    if (year == this.curDataSrc.endTime.year)
                        monthEnd = this.curDataSrc.endTime.month;

                    var yearPaxAccumulate = 0;
                    var yearSeatAccumulate = 0;
                    var yearAccumulateMonth = 0;

                    var curQuarter = 1;
                    var quarterPaxAccumulate = 0;
                    var quarterSeatAccumulate = 0;
                    var quarterAccumulateMonth = 0;
                    var quarterAccumulate = 0;
                    for (var month = monthStart; month <= monthEnd; month++) {
                        if (timeScale == "Month") {
                            var load = seatTimeData[inputIdx] != 0 ? paxTimeData[inputIdx] / seatTimeData[inputIdx] : 0;
                            localData.push([outputIdx, load]);
                            outputIdx++;

                        } else if (timeScale == "Year") {
                            yearPaxAccumulate += paxTimeData[inputIdx];
                            yearSeatAccumulate += seatTimeData[inputIdx];
                            yearAccumulateMonth++;
                            if (yearAccumulateMonth == 12) {
                                var load = yearSeatAccumulate != 0 ? yearPaxAccumulate / yearSeatAccumulate : 0;
                                localData.push([outputIdx, load]);
                                outputIdx++;
                            }

                        } else {
                            quarterPaxAccumulate += paxTimeData[inputIdx];
                            quarterSeatAccumulate += seatTimeData[inputIdx];
                            quarterAccumulateMonth++;
                            if (month % 3 == 0) {
                                if (quarterAccumulateMonth == 3) {
                                    var load = quarterSeatAccumulate != 0 ? quarterPaxAccumulate / quarterSeatAccumulate : 0;
                                    localData.push([outputIdx, load]);
                                    outputIdx++;
                                    curQuarter++;
                                }

                                quarterAccumulate = 0;
                                quarterAccumulateMonth = 0;
                            }
                        }

                        inputIdx++;
                    }
                }
                data.push({
                    "data": localData,
                    "label": airlines[airlineIdx]
                });
            }
            return data;
        }

        private rankAirlineByFlow(timeSeriesData, dataType, yearFrom, yearTo) {
            var flowStat = [];
            for (var airline in timeSeriesData[dataType]) {
                var totalFlow = 0;
                var inputIdx = (yearFrom - this.curDataSrc.startTime.year) * 12;;
                for (var year = yearFrom; year <= yearTo; year++) {
                    for (var month = 0; month < 12; month++) {
                        if (inputIdx >= timeSeriesData[dataType][airline].length)
                            break;
                        totalFlow += timeSeriesData[dataType][airline][inputIdx];
                        inputIdx++;
                    }

                }
                flowStat.push([airline, totalFlow]);
            }
            flowStat.sort(function (a, b) {
                return b[1] - a[1];
            });
            return flowStat;
        }

        private createTimeSeriesChart(divId, timeSeriesData, timeScale, yearFrom, yearTo, dataType, airlineName, dataGenerator, divideNum: number, options?) {
            var year, month;
            var airlines = [];

            if (airlineName == "All") {
                var airlineRank = this.rankAirlineByFlow(timeSeriesData, dataType, yearFrom, yearTo);
                for (var i = 0; i < airlineRank.length && airlines.length < 8; i++) {
                    // only show top 8
                    if (airlineRank[i][0] != "ALL" && airlineRank[i][1] > 0)
                        airlines.push(airlineRank[i][0]);
                }
            } else {
                if (timeSeriesData[dataType][airlineName] != null)
                    airlines.push(airlineName);
            }

            if (airlines.length == 0) {
                document.getElementById(divId).innerHTML = '<span style="font-size: 40pt; color: #D0D0D0">' + Localization.strings.noDataAvailable + '</span>';
                return;
            }
            document.getElementById(divId).innerHTML = "";
            // Generate the ticks
            var inputIdx = 0;
            var outputIdx = 0;
            var tickIdx = [];

            var monthTickTemplate = Localization.strings.getMonthTickTemplate(yearTo - yearFrom);


            for (year = yearFrom; year <= yearTo; year++) {
                var monthStart = 1;
                if (year == this.curDataSrc.startTime.year)
                    monthStart = this.curDataSrc.startTime.month;
                var monthEnd = 12;
                if (year == this.curDataSrc.endTime.year)
                    monthEnd = this.curDataSrc.endTime.month;

                var yearAccumulate = 0;
                var yearAccumulateMonth = 0;

                var curQuarter = 1;
                var quarterAccumulate = 0;
                var quarterAccumulateMonth = 0;
                var label = "";
                for (month = monthStart; month <= monthEnd; month++) {
                    if (timeScale == "Month") {
                        if (monthTickTemplate[month] != null) {
                            label = monthTickTemplate[month];
                            if (month == 1) {
                                label += "<br/>" + year.toString();
                            }
                            tickIdx.push([outputIdx, label]);
                        }
                        outputIdx++;

                    } else if (timeScale == "Year") {
                        yearAccumulateMonth++;
                        if (yearAccumulateMonth == 12) {
                            tickIdx.push([outputIdx, year.toString()]);
                            outputIdx++;
                        }
                    } else {
                        quarterAccumulateMonth++;
                        if (month % 3 == 0) {
                            if (quarterAccumulateMonth == 3) {
                                if (curQuarter == 1 || curQuarter == 3) {
                                    label = "Q" + curQuarter.toString();
                                    if (curQuarter == 1) {
                                        label += "<br/>" + year.toString();
                                    }
                                    tickIdx.push([outputIdx, label]);
                                }
                                outputIdx++;
                                curQuarter++;
                            }
                            quarterAccumulateMonth = 0;

                        }
                    }

                    inputIdx++;
                }
            }
            // Generate the data

            var data = dataGenerator(timeSeriesData, timeScale, dataType, airlines, yearFrom, yearTo, divideNum);
            var mylegend = {
                show: true,
                noColumns: 9,
                container: document.getElementById(divId + "Legend")
            };
            $.plot("#" + divId, data, {
                xaxis: {
                    tickDecimals: 0,
                    ticks: tickIdx,
                    min: -1,
                    max: outputIdx + 1
                },
                yaxis: options != null ? options["yaxis"] : {},
                legend: mylegend
            });
        }

        private updateTimeSeries = (yearFrom, yearTo) => {
            var timeScale = ReportPageUtils.getTimeScale("timeScaleYear", "timeScaleQuarter", "timeScaleMonth");

            document.getElementById("paxTimeSeriesChartTitle").innerHTML =
            Localization.strings.timeSeriesTotalPassengerInT100ByTimeScale(FlowType.Passenger, timeScale) + Utils.createSpace(5);
            document.getElementById("freightTimeSeriesChartTitle").innerHTML =
            Localization.strings.timeSeriesTotalPassengerInT100ByTimeScale(FlowType.Freight, timeScale) + Utils.createSpace(5);
            document.getElementById("paxTimeSeriesChartSubTitle").innerHTML = Localization.strings.timeSeriesThisChartShowTimeScaleData(FlowType.Passenger, timeScale);
            document.getElementById("freightTimeSeriesChartSubTitle").innerHTML = Localization.strings.timeSeriesThisChartShowTimeScaleData(FlowType.Freight, timeScale);

            this.createTimeSeriesChart("paxTimeSeries", this.timeSeriesData, timeScale, yearFrom, yearTo, "pax", this.timeSeriesAirlineSel.selectedData, this.normalTimeSeriesDataGenerator, Localization.strings.largeDivideNum);
            this.createTimeSeriesChart("freightTimeSeries", this.timeSeriesData, timeScale, yearFrom, yearTo, "freight", this.timeSeriesAirlineSel.selectedData, this.normalTimeSeriesDataGenerator, Localization.strings.largeDivideNum);
        }

        private setupTimeSeriesAirlineList(airlineSel, airlineSelCallback, yearSlider, airlineMap, timeSeriesData, flowTypes) {
            var airlineDict = {};
            for (var i = 0; i < flowTypes.length; i++) {
                for (var key in timeSeriesData[flowTypes[i]])
                    airlineDict[key] = true;
            }

            var airlineList = [Localization.strings.allAirline, Localization.strings.totalAirline];
            for (var key in airlineDict) {
                if (key != "ALL")
                    airlineList.push(key);
            }
            // If only one airline available, just show it.
            if (airlineList.length == 3)
                airlineList = [airlineList[2]];

            airlineSel.onChangeHandler = () => {
                airlineSelCallback($(yearSlider).slider("values", 0), $(yearSlider).slider("values", 1));
            };
            airlineSel.clearAllItem();
            for (var i = 0; i < airlineList.length; i++) {
                var item = airlineSel.createItem(airlineList[i]);
                var airlineCode = airlineList[i];
                if (airlineList[i].indexOf("(") != -1)
                    airlineCode = airlineList[i].substr(airlineList[i].indexOf("(") + 1, airlineList[i].indexOf(")") - airlineList[i].indexOf("(") - 1);
                airlineMap[airlineCode] = airlineList[i];
                if (airlineList[i] == Localization.strings.totalAirline)
                    airlineSel.insertItem(item, "ALL");
                else if (airlineList[i] == Localization.strings.allAirline)
                    airlineSel.insertItem(item, "All");
                else
                    airlineSel.insertItem(item, airlineList[i]);

            }

            if (!this.initAirline) {
                airlineSel.setSelectedIndex(0);
            } else {
                airlineSel.setSelectedItemByText(airlineMap[this.initAirline]);
            }
        }

        public queryTimeSeries = () => {
            var callback = (data) => {
                this.initTimeSeries();
                this.timeSeriesData = data;
                this.setupTimeSeriesAirlineList(this.timeSeriesAirlineSel, this.updateTimeSeries, "#timeSeriesSlider", this.airlineMap, this.timeSeriesData, ["pax", "freight"]);
            }
            DataQuery.queryRouteTimeSeries(this.curDataSrc.name, this.originCode, this.destCode, "pax;freight", callback);
        }

        private calcPaxSeatTimeSeries() {
            var airline;
            var ava
            for (airline in this.seatTimeSeriesData["seat"]) {
                this.paxSeatTimeSeries[airline] = {};
                this.paxSeatTimeSeries[airline][Localization.strings.availableSeat] = this.seatTimeSeriesData["seat"][airline];
                this.paxSeatTimeSeries[airline][Localization.strings.allPassenger] = this.seatTimeSeriesData["pax"][airline];
            }
            this.paxSeatTimeSeries["All"] = {};
            for (airline in this.seatTimeSeriesData["seat"]) {
                this.paxSeatTimeSeries["All"][airline] = this.seatTimeSeriesData["seat"][airline];
            }
        }
        private querySeatTimeSeries() {
            var callback = (data) => {
                this.initSeatTimeSeries();
                this.seatTimeSeriesData = data;
                this.calcPaxSeatTimeSeries();
                this.setupTimeSeriesAirlineList(this.seatTimeSeriesAirlineSel, this.updateSeatTimeSeries, "#seatTimeSeriesSlider", this.seatDataAirlineMap, this.seatTimeSeriesData, ["seat"]);

            }
            DataQuery.queryRouteTimeSeries(this.curDataSrc.name, this.originCode, this.destCode, "seat", callback);
        }

        private updateSeatTimeSeries = (yearFrom, yearTo) => {
            var timeScale = ReportPageUtils.getTimeScale("seatTimeScaleYear", "seatTimeScaleQuarter", "seatTimeScaleMonth");
            document.getElementById("loadTimeSeriesChartTitle").innerHTML = T100.T100Localization.strings.aircraftPassengerLoadFactorInT100ByTimeScale(timeScale) + Utils.createSpace(5);;

            var options = {
                yaxis: {
                    max: 1.0,
                    ticks: [[0, "0%"], [.2, "20%"], [.4, "40%"], [.6, "60%"], [.8, "80%"], [1, "100%"]]
                }
            };
            this.createTimeSeriesChart("loadTimeSeries", this.seatTimeSeriesData, timeScale, yearFrom, yearTo, "seat", this.seatTimeSeriesAirlineSel.selectedData, this.loadTimeSeriesDataGenerator, 1, options);

            if (this.seatTimeSeriesAirlineSel.selectedData != "All")
                document.getElementById("seatTimeSeriesChartTitle").innerHTML = T100.T100Localization.strings.availableSeatsVsActualPaxByTimeScale(timeScale);
            else
                document.getElementById("seatTimeSeriesChartTitle").innerHTML = T100.T100Localization.strings.availableSeatsByTimeScale(timeScale);
            this.createTimeSeriesChart("seatTimeSeries", this.paxSeatTimeSeries, timeScale, yearFrom, yearTo, this.seatTimeSeriesAirlineSel.selectedData, "All", this.normalTimeSeriesDataGenerator, 1);

        }


    }
}

google.load("visualization", "1", { packages: ["corechart"] });
google.setOnLoadCallback(function () {
    $(function () {
        /*if (dialogAirport.originCode == null)
            dialogAirport.originCode = "LHR";
        if (dialogAirport.destCode == null)
            dialogAirport.destCode = "LAX";*/
        AST.Localization.init();
        AST.T100.T100Localization.init();
        var dialogAirport: AST.RouteReport;
        dialogAirport = new AST.RouteReport();
        dialogAirport.initData().done(() => {
            dialogAirport.initUi();
            dialogAirport.queryTimeSeries();
        });

    });
});