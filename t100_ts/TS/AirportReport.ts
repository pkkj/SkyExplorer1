module AST {
    export class AirportReport {
        private airportIata = "";
        private airport = null;
        private summaryYearSel: DropDown = null;
        private summaryRegionSel: DropDown = null;
        private summaryAirlineSel: DropDown = null;
        private summaryPaxShareChart = null;
        private summaryFreightShareChart = null;
        private summaryPaxShareTable: SimpleTable = null;
        private summaryFreightShareTable: SimpleTable = null;

        // data related variables
        private paxRank = null;
        private freightRank = null;
        private airportStat = null;
        private dataReady = false;
        private timeSeriesData = null;
        private initYear = null;
        private yearAvailability = null;
        private timeSeriesAirlineSel = null;
        private urlParams = null;


        private initSummary() {
            var i, item;
            this.summaryYearSel = new DropDown(document.getElementById("summaryYearSel"), {
                "titleWidth": 100,
                "containerMaxHeight": 500
            });
            this.summaryRegionSel = new DropDown(document.getElementById("summaryRegionSel"), {
                "titleWidth": 200,
                "containerMaxHeight": 500
            });
            var yearIdx = 0;
            for (i = 0; i < this.yearAvailability.length; i++) {
                if (this.initYear == this.yearAvailability[i])
                    yearIdx = i;
                item = this.summaryYearSel.createItem(this.yearAvailability[i]);
                this.summaryYearSel.insertItem(item, this.yearAvailability[i]);
            }
            if (this.yearAvailability.length > 0)
                this.summaryYearSel.setSelectedIndex(yearIdx);

            this.summaryYearSel.onChangeHandler = () => {
                if (!this.dataReady)
                    return;
                this.queryAirportStat(this.airportIata);
            };

            this.paxRank = new RankTable(document.getElementById("paxRank"), { "itemColor": "rgb(144,239,43)" });
            this.freightRank = new RankTable(document.getElementById("freightRank"));

            this.summaryPaxShareTable = new SimpleTable(document.getElementById("airlineSharePax"), { "width": 270 });
            this.summaryFreightShareTable = new SimpleTable(document.getElementById("airlineShareFreight"), { "width": 270 });

        }


        private initTimeSeries() {
            $("#timeSeriesTimeScale").buttonset();

            $("#timeSeriesTimeScale :radio").click((e) => {
                if (this.timeSeriesData != null)
                    this.updateTimeSeries($("#timeSeriesSlider").slider("values", 0), $("#timeSeriesSlider").slider("values", 1));
            });

            $("#timeSeriesSlider").slider({
                range: true,
                min: T100.T100MetaData.dataFrom.year,
                max: T100.T100MetaData.dataTo.year,
                values: [T100.T100MetaData.dataFrom.year, T100.T100MetaData.dataTo.year],
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

        private init() {
            this.urlParams = Utils.decodeUrlPara();
            this.airportIata = this.urlParams["iata"];
            this.initYear = this.urlParams["year"];

            DataQuery.QueryAirportYearAvailability(this.airportIata, "T100Data", (airport) => {
                if (airport == null) {
                    document.getElementById("mainTab").innerHTML = '<span style="font-size: 40pt; color: #D0D0D0">' + T100.T100Localization.strings.noAvailableDataForThisAirport + '</span>';
                    return;
                }
                this.airport = airport;
                this.yearAvailability = airport.yearAvailability.split(",");
                if (airport.yearAvailability == "") {
                    airport.note = T100.T100Localization.strings.noOutBoundFlights;
                    this.yearAvailability = [];
                }
                document.getElementById("airportNote").innerHTML = airport.note;
                document.getElementById("aiportName").innerHTML = airport.name;
                document.getElementById("airportCity").innerHTML = Localization.strings.constructPlaceName(airport.country, airport.city);
                document.getElementById("airportCode").innerHTML = airport.iata + " / " + airport.icao;
                this.initUi();
            })
        }

        private initUi() {
            $("#mainTab").tabs({
                activate: (event, ui) => {
                    if (ui.newTab[0].id == "liSummary") {
                    }
                    if (ui.newTab[0].id == "liTimeSeries") {
                        if (this.timeSeriesData != null)
                            this.updateTimeSeries($("#timeSeriesSlider").slider("values", 0), $("#timeSeriesSlider").slider("values", 1));
                        else
                            this.queryTimeSeries(this.airportIata);
                    }
                }
            });

            this.initSummary();
            this.initTimeSeries();
            // Data ready
            this.dataReady = true;
            this.queryAirportStat(this.airportIata);

            this.localizeUi();
        }

        private localizeUi() {
            (<HTMLElement> document.getElementById("liSummary").firstElementChild).innerHTML = Localization.strings.basicStatistic;
            (<HTMLElement> document.getElementById("liTimeSeries").firstElementChild).innerHTML = Localization.strings.timeSeries;
            document.getElementById("tabSummaryYearText").innerHTML = Localization.strings.year;
            document.getElementById("tabSummaryRegionText").innerHTML = Localization.strings.region;
            document.getElementById("tabSummaryTop10DestPassengerText").innerHTML = Localization.strings.top10PassengerDestinations;
            document.getElementById("tabSummaryTop10DestFreightText").innerHTML = Localization.strings.top10FreightDestinations;
            document.getElementById("tabTimeSeriesShowChartByText").innerHTML = Localization.strings.showChartBy;
            document.getElementById("timeSeriesSliderYearRangeText").innerHTML = Localization.strings.yearRange;

            $("#timeScaleYear").button("option", "label", Localization.strings.timeScaleYear);
            $("#timeScaleQuarter").button("option", "label", Localization.strings.timeScaleQuarter);
            $("#timeScaleMonth").button("option", "label", Localization.strings.timeScaleMonth);
            
        }

        private makeStatDestRank(table: RankTable, rank) {
            var totalItem = 10;
            table.clear();
            if (rank.length == 0) {
                return;
            }
            var biggestFlow = parseFloat(rank[0].flow);
            for (var i = 0; i < totalItem; i++) {
                if (i < rank.length) {
                    var fFlow = parseFloat(rank[i].flow);
                    var ratio = fFlow / biggestFlow;
                    var flow = Localization.strings.formatBigNumber(rank[i].flow);
                    var textA: string = rank[i] == null ? "" : rank[i].iata + " / " + rank[i].icao;
                    var textB: string = rank[i] == null ? "" : Localization.strings.constructPlaceName(rank[i].country, rank[i].city);
                    table.addItem(textA, textB, flow, ratio);
                }
                else {
                    table.addItem("", "", null, 0);
                }
            }
        }

        private makeStatAirlineRank(table, rank, type) {
            table.clear();
            var totalItem = 6;
            var item;
            for (var i = 0; i < totalItem; i++) {
                if (i < rank.length) {
                    var flow = Localization.strings.formatBigNumber(rank[i].flow);
                    item = ReportPageUtils.createRankSummaryItem(type, rank[i].airline, flow, rank[i].per);
                }
                else {
                    item = ReportPageUtils.createRankSummaryItem("", "", "", "");
                }

                table.addItem(item);
            }
        }

        private makeAirlineShare(div, rank, type) {
            div.innerHTML = "";
            if (rank.length == 0) {
                return;
            }
            var _data;
            if (type == "Passenger") {
                _data = [['Airline', 'Pax']];
            }
            else {
                _data = [['Airline', 'Freight']];
            }

            var totalFlow = 0;
            for (var i = 0; i < rank.length; i++) {
                var airlineName = rank[i].airline;
                if (airlineName.lastIndexOf("(") != -1) {
                    airlineName = airlineName.substring(0, airlineName.lastIndexOf("(") - 1);
                }
                _data.push([airlineName, parseInt(rank[i].flow)]);
                totalFlow += parseInt(rank[i].flow);
            }

            if (totalFlow == 0) {
                return;
            }

            var data = google.visualization.arrayToDataTable(_data);

            var options = {
                chartArea: {
                    top: 35,
                    left: 15,
                    height: 180,
                    width: 340
                },
                height: 230,
                width: 360,
                fontSize: 12,
                title: type == "Passenger" ? Localization.strings.carrierShareByPassenger : Localization.strings.carrierShareByFreight,
                titleTextStyle: {
                    fontSize: 14,
                    bold: false
                }
            };

            var chart = new google.visualization.PieChart(div);
            chart.draw(data, options);
        }

        private makeSummaryTotal(year: string, data) {
            var div = document.getElementById("summaryTotal");
            var paxTotal = data["All"]["totalPax"];
            var freightTotal = data["All"]["totalFreight"];
            div.innerHTML = Localization.strings.inXxxxYear + Localization.strings.yearFormalRepresentation(year) + ": ";
            div.innerHTML += "<b>" + Localization.strings.totalPassenger + "</b>" + paxTotal;
            div.innerHTML += " ---- ";
            div.innerHTML += "<b>" + Localization.strings.totalFreight + "</b>" + freightTotal + Localization.strings.tons;
        }

        private updateAirportStat() {
            var subDataIdx = this.summaryRegionSel.selectedData;
            if (subDataIdx == "All Carrier - US Destinations")
                subDataIdx = "United States";
            else if (subDataIdx == "US Carrier - Non-US Destinations")
                subDataIdx = "International";
            var subData = this.airportStat[subDataIdx];
            this.makeSummaryTotal(this.summaryYearSel.selectedData, this.airportStat);
            this.makeStatDestRank(this.paxRank, subData["paxDestRank"]);
            this.makeStatDestRank(this.freightRank, subData["freightDestRank"]);
            this.makeStatAirlineRank(this.summaryPaxShareTable, subData["paxAirlineRank"], Localization.strings.passengerFreq);
            this.makeStatAirlineRank(this.summaryFreightShareTable, subData["freightAirlineRank"], Localization.strings.freightFreq);
            this.makeAirlineShare(document.getElementById("airlineSharePaxChart"), subData["paxAirlineRank"], "Passenger");
            this.makeAirlineShare(document.getElementById("airlineShareFreightChart"), subData["freightAirlineRank"], "Freight");

            document.getElementById("airlineSharePaxChart").style.height = (document.getElementById("airlineSharePax").offsetHeight - 2).toString() + "px";
            document.getElementById("airlineShareFreightChart").style.height = (document.getElementById("airlineShareFreight").offsetHeight - 2).toString() + "px";

        }

        private queryAirportStat(airport) {
            var year = this.summaryYearSel.selectedData;
            var callback = (data) => {
                this.airportStat = data;

                // Init the regional selector

                this.summaryRegionSel.clearAllItem();

                var regionItems = [], regionDisplayText = [];
                if (T100.T100MetaData.currentCountry == this.airport.countryEn) {
                    regionDisplayText = [Localization.strings.regionAll, Localization.strings.regionUnitedStates, Localization.strings.regionInternational];
                    regionItems = ["All", "United States", "International"];
                } else {
                if (T100.T100FFMetaData.has28ISFFData(parseInt(year))) {
                        if (this.airportStat["United States"].totalPax != "0" || this.airportStat["United States"].totalFreight != "0") {
                            regionDisplayText.push(Localization.strings.regionAllCarrierUsDest);
                            regionItems.push("All Carrier - US Destinations");
                        }
                        if (this.airportStat["International"].totalPax != "0" || this.airportStat["International"].totalFreight != "0") {
                            regionDisplayText.push(Localization.strings.regionUsCarrierAllDest);
                            regionItems.push("US Carrier - Non-US Destinations");
                        }
                    } else {
                        regionDisplayText.push(Localization.strings.regionAllCarrierUsDest);
                        regionItems = ["All Carrier - US Destinations"];
                    }
                    document.getElementById("timeSeriesNote").innerHTML = T100.T100Localization.strings.onlyTheDataOfRoutesTowardUS;
                }
                for (var i = 0; i < regionItems.length; i++) {
                    var item = this.summaryRegionSel.createItem(regionDisplayText[i]);
                    this.summaryRegionSel.insertItem(item, regionItems[i]);
                }

                this.summaryRegionSel.onChangeHandler = () => {
                    if (this.airportStat) {
                        this.updateAirportStat();
                    }
                };
                this.summaryRegionSel.setSelectedIndex(0);
                //this.updateAirportStat();
            }
            T100.T100DataQuery.queryAirportStat(year, airport, callback);
        }

        private createTimeSeriesChart(divId, timeScale, yearFrom, yearTo, timeData, divideNum: number) {
            var year;
            var month;

            if (!timeData) {
                // Show something about no data available
                document.getElementById(divId).innerHTML = '<span style="font-size: 40pt; color: #D0D0D0">' + Localization.strings.noDataAvailable + '</span>';
                return;
            }

            var inputIdx = (yearFrom - T100.T100MetaData.dataFrom.year) * 12;;
            var outputIdx = 0;
            var tickIdx = [];

            var monthTickTemplate = Localization.strings.getMonthTickTemplate(yearTo - yearFrom);
            var data = [];
            for (year = yearFrom; year <= yearTo; year++) {
                var monthStart = 1;
                if (year == T100.T100MetaData.dataFrom.year)
                    monthStart = T100.T100MetaData.dataFrom.month;
                var monthEnd = 12;
                if (year == T100.T100MetaData.dataTo.year)
                    monthEnd = T100.T100MetaData.dataTo.month;

                var yearAccumulate = 0;
                var yearAccumulateMonth = 0;

                var curQuarter = 1;
                var quarterAccumulate = 0;
                var quarterAccumulateMonth = 0;
                var label = "";
                for (month = monthStart; month <= monthEnd; month++) {

                    if (timeScale == "Month") {
                        data.push([outputIdx, timeData[inputIdx]]);
                        if (monthTickTemplate[month] != null) {
                            label = monthTickTemplate[month];
                            if (month == 1) {
                                label += "<br/>" + year.toString();
                            }
                            tickIdx.push([outputIdx, label]);
                        }
                        outputIdx++;

                    } else if (timeScale == "Year") {
                        yearAccumulate += timeData[inputIdx];
                        yearAccumulateMonth++;
                        if (yearAccumulateMonth == 12) {
                            data.push([outputIdx, yearAccumulate / divideNum]);
                            tickIdx.push([outputIdx, year.toString()]);
                            outputIdx++;
                        }

                    } else {
                        quarterAccumulate += timeData[inputIdx];
                        quarterAccumulateMonth++;
                        if (month % 3 == 0) {
                            if (quarterAccumulateMonth == 3) {
                                data.push([outputIdx, quarterAccumulate / divideNum]);
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

                            quarterAccumulate = 0;
                            quarterAccumulateMonth = 0;
                        }
                    }

                    inputIdx++;
                }
            }

            var dataItem = {};
            dataItem["label"] = T100.T100Localization.strings.timeSeriesFlowByTimeScale(timeScale);
            dataItem['data'] = data;
            var _data = [];
            _data.push(dataItem);
            $.plot("#" + divId, _data, {
                xaxis: {
                    tickDecimals: 0,
                    ticks: tickIdx,
                    min: -1,
                    max: outputIdx + 1
                }
            });
        }

        private updateTimeSeries(yearFrom, yearTo) {
            var timeScale = ReportPageUtils.getTimeScale("timeScaleYear", "timeScaleQuarter", "timeScaleMonth");
            document.getElementById("paxTimeSeriesChartTitle").innerHTML =
            T100.T100Localization.strings.timeSeriesTotalPassengerInT100ByTimeScale(FlowType.Passenger, timeScale) + Utils.createSpace(5);
            document.getElementById("freightTimeSeriesChartTitle").innerHTML =
            T100.T100Localization.strings.timeSeriesTotalPassengerInT100ByTimeScale(FlowType.Freight, timeScale) + Utils.createSpace(5);
            document.getElementById("paxTimeSeriesChartSubTitle").innerHTML = T100.T100Localization.strings.timeSeriesThisChartShowTimeScaleData(FlowType.Passenger, timeScale);
            document.getElementById("freightTimeSeriesChartSubTitle").innerHTML = T100.T100Localization.strings.timeSeriesThisChartShowTimeScaleData(FlowType.Freight, timeScale);

            this.createTimeSeriesChart("paxTimeSeries", timeScale, yearFrom, yearTo, this.timeSeriesData["pax"]["Total"], Localization.strings.largeDivideNum);
            this.createTimeSeriesChart("freightTimeSeries", timeScale, yearFrom, yearTo, this.timeSeriesData["freight"]["Total"], 1);
        }

        private queryTimeSeries(airport) {
            var callback = (data) => {
                this.timeSeriesData = data;
                this.updateTimeSeries($("#timeSeriesSlider").slider("values", 0), $("#timeSeriesSlider").slider("values", 1));
            }
            T100.T100DataQuery.queryAirportTimeSeries(airport, callback);
        }
    }
}

google.load("visualization", "1", { packages: ["corechart"] });
google.setOnLoadCallback(function () {
    $(function () {
        AST.Localization.init();
        AST.T100.T100Localization.init();
        var dialogAirport;
        dialogAirport = new AST.AirportReport();
        dialogAirport.init();
        /*if (dialogAirport.airportIata == null)
            dialogAirport.airportIata = "SEA";*/

    });
});