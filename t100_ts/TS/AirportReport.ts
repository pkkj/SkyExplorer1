module AST {


    export class AirportReport {
        private airportCode = "";
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
        private curDataSrc: string;
        private dataSrcInfo: DataSourceMetaData;

        /** The available data sources for Basic Statistics tab */
        private basicStatDataDrc: Array<string> = null;
        /** The available data sources for Time Series tab */
        private timeSeriesDataSrc: DataSourceMetaData = null;
        private timeSeriesDataSrcName: string = "";

        private initSummary() {
            var i, item;
            this.summaryYearSel = new DropDown(document.getElementById("summaryYearSel"), {
                "titleWidth": 100,
                "containerMaxHeight": 500
            });
            this.summaryRegionSel = new DropDown(document.getElementById("summaryRegionSel"), {
                "titleWidth": 300,
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
                this.queryAirportStat(this.airportCode);
            };

            this.paxRank = new RankTable(document.getElementById("paxRank"), { "itemColor": "rgb(144,239,43)" });
            this.freightRank = new RankTable(document.getElementById("freightRank"));

            this.summaryPaxShareTable = new SimpleTable(document.getElementById("airlineSharePax"), { "width": 270 });
            this.summaryFreightShareTable = new SimpleTable(document.getElementById("airlineShareFreight"), { "width": 270 });

        }


        private initTimeSeries() {
            if (this.timeSeriesDataSrc == null)
                return;
            $("#timeSeriesTimeScale").buttonset();

            $("#timeSeriesTimeScale :radio").click((e) => {
                if (this.timeSeriesData != null)
                    this.updateTimeSeries($("#timeSeriesSlider").slider("values", 0), $("#timeSeriesSlider").slider("values", 1));
            });

            $("#timeSeriesSlider").slider({
                range: true,
                min: this.timeSeriesDataSrc.startTime.year,
                max: this.timeSeriesDataSrc.endTime.year,
                values: [this.timeSeriesDataSrc.startTime.year, this.timeSeriesDataSrc.endTime.year],
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

            $("#timeScaleYear").button("option", "label", Localization.strings.timeScaleYear);
            $("#timeScaleQuarter").button("option", "label", Localization.strings.timeScaleQuarter);
            $("#timeScaleMonth").button("option", "label", Localization.strings.timeScaleMonth);
            if (this.timeSeriesDataSrc.timeUnit == TimeUnit.Year) {
                // Disable the "Month" and "Quarter" button if the time unit is year.
                $("#timeScaleQuarter").button("option", "disabled", true);
                $("#timeScaleMonth").button("option", "disabled", true);
            }
        }

        private initData() {
            DataSourceRegister.registerDataSource("T100Data", T100.T100MetaData.instance());
            DataSourceRegister.registerDataSource("T100FF", T100.T100FFMetaData.instance());
            DataSourceRegister.registerDataSource("UkData", UkData.UkMetaData.instance());
            DataSourceRegister.registerDataSource("TaiwanData", TwData.TwMetaData.instance());
            DataSourceRegister.registerDataSource("JapanData", JpData.JpMetaData.instance());
            DataSourceRegister.registerDataSource("KoreaData", KrData.KrMetaData.instance());
            DataSourceRegister.registerDataSource("CN_CAAC", CnCaacData.CnCaacMetaData.instance());
        }

        private init() {

            this.urlParams = Utils.decodeUrlPara();
            this.airportCode = this.urlParams["code"];
            this.initYear = this.urlParams["year"];
            this.curDataSrc = this.urlParams["dataSrc"];

            this.initData();

            var onQueryAirportYearAvailability = (airport: any) => {
                if (airport == null) {
                    document.getElementById("mainTab").innerHTML = '<span style="font-size: 40pt; color: #D0D0D0">' + Localization.strings.noAvailableDataForThisAirport + '</span>';
                    return;
                }
                this.airport = airport;
                this.yearAvailability = airport.yearAvailability.split(";");
                if (airport.yearAvailability == "") {
                    airport.note = T100.T100Localization.strings.noOutBoundFlights;
                    this.yearAvailability = [];
                }
                if (airport.note != "" && airport.note != "*") {
                    document.getElementById("airportNote").innerHTML = airport.note;
                }
                document.getElementById("aiportName").innerHTML = airport.name;

                var city = City.parseCity(airport.serveCityL);
                document.getElementById("airportCity").innerHTML = Localization.strings.constructPlaceName(city.country, city.subdiv, city.city);
                document.getElementById("airportCode").innerHTML = airport.iata + " / " + airport.icao;
                this.initUi();
            };

            DataQuery.queryAirportAvailableDataSource(this.airportCode).done((availableDataSrc) => {
                this.basicStatDataDrc = availableDataSrc["BasicStat"];
                this.timeSeriesDataSrcName = availableDataSrc["TimeSeries"];
                if (this.timeSeriesDataSrcName != "")
                    this.timeSeriesDataSrc = DataSourceRegister.queryInfo(this.timeSeriesDataSrcName);
                this.handleDataSource(this.basicStatDataDrc);
                DataQuery.queryAirportYearAvailability(this.airportCode, this.curDataSrc).done(onQueryAirportYearAvailability);
            });

        }

        private handleDataSource(availableDataSrc: Array<string>) {
            if (availableDataSrc.length == 0) {
                document.getElementById("mainTab").innerHTML = '<span style="font-size: 40pt; color: #D0D0D0">' + Localization.strings.noAvailableDataForThisAirport + '</span>';
                return;
            }
            if (this.curDataSrc == "") {
                this.curDataSrc = availableDataSrc[0];
            }
            this.dataSrcInfo = DataSourceRegister.queryInfo(this.curDataSrc);

            var availableDataSrcDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("availableDataSrc");
            availableDataSrcDiv.appendChild(Utils.createElement("span", { "text": Localization.strings.viewDataFromOtherSourcesForThisAirport }));
            if (availableDataSrc.length > 1) {
                var atBegin: boolean = true;
                for (var i = 0; i < availableDataSrc.length; i++) {
                    var dataSrcName = availableDataSrc[i];
                    if (dataSrcName == this.curDataSrc)
                        continue;
                    var info: DataSourceMetaData = DataSourceRegister.queryInfo(dataSrcName);
                    if (atBegin)
                        atBegin = false;
                    else
                        availableDataSrcDiv.appendChild(Utils.createElement("span", { "text": ", " }));

                    var anchor: HTMLAnchorElement = <HTMLAnchorElement>Utils.createElement("a", { "text": info.getShortInfoLocalizeName(), class: "dataSrcLink" });

                    var where: string = "code=" + this.urlParams["code"];
                    where += "&iata=" + this.urlParams["iata"];
                    where += "&icao=" + this.urlParams["icao"];
                    where += "&name=" + this.urlParams["name"];
                    where += "&city=" + this.urlParams["city"];
                    where += "&country=" + this.urlParams["country"];
                    /*if (year)
                        where += "&year=" + year;*/
                    where += "&dataSrc=" + availableDataSrc[i];
                    where += "&locale=" + AST.Localization.getLocale();
                    anchor.href = "AirportReport.html?" + where;

                    availableDataSrcDiv.appendChild(anchor);
                }
            }            
        }

        private initUi() {
            // Localize
            var coverage: AirportCoverage = this.dataSrcInfo.getAirportCoverage(this.airport);
            var showTimeSeries: boolean = this.timeSeriesDataSrcName != "";

            $("#mainTab").tabs({
                activate: (event, ui) => {
                    if (ui.newTab[0].id == "liSummary") {
                    }
                    if (ui.newTab[0].id == "liTimeSeries") {
                        if (this.timeSeriesData != null)
                            this.updateTimeSeries($("#timeSeriesSlider").slider("values", 0), $("#timeSeriesSlider").slider("values", 1));
                        else
                            this.queryTimeSeries(this.airportCode);
                    }
                }
            });

            this.initSummary();
            if (showTimeSeries) {
                this.initTimeSeries();
            } else {
                $("#mainTab").tabs({ disabled: [1] });
            }
            // Data ready
            this.dataReady = true;
            this.queryAirportStat(this.airportCode);

            this.localizeUi();
        }

        private localizeUi() {
            document.getElementById("dataSrcFootNote").innerHTML = this.dataSrcInfo.getAirportReportPageFootnote(this.airport);
            document.getElementById("metricDataText").innerText = Localization.strings.metricData + this.dataSrcInfo.getFullInfoLocalizeName();
            if (this.timeSeriesDataSrc) {
                document.getElementById("timeSeriesDataSrcFootNote").innerHTML = this.timeSeriesDataSrc.getAirportReportPageFootnote(this.airport);
                document.getElementById("timeSeriesMetricDataText").innerText = Localization.strings.metricData + this.timeSeriesDataSrc.getFullInfoLocalizeName();
            }

            (<HTMLElement> document.getElementById("liSummary").firstElementChild).innerHTML = Localization.strings.basicStatistic;
            (<HTMLElement> document.getElementById("liTimeSeries").firstElementChild).innerHTML = Localization.strings.timeSeries;
            document.getElementById("tabSummaryYearText").innerHTML = Localization.strings.year;
            document.getElementById("tabSummaryRegionText").innerHTML = Localization.strings.region;
            document.getElementById("tabSummaryTop10DestPassengerText").innerHTML = Localization.strings.top10PassengerDestinations;
            document.getElementById("tabSummaryTop10DestFreightText").innerHTML = Localization.strings.top10FreightDestinations;
            document.getElementById("tabTimeSeriesShowChartByText").innerHTML = Localization.strings.showChartBy;
            document.getElementById("timeSeriesSliderYearRangeText").innerHTML = Localization.strings.yearRange;
        }

        private makeStatDestRank(table: RankTable, rank) {
            var totalItem = 10;
            table.clear();
            if (rank.length == 0) {
                table.showMessage('<span style="font-size: 20pt; color: #D0D0D0">' + Localization.strings.noDataAvailable + '</span>');
                return;
            }
            var biggestFlow = parseFloat(rank[0].flow);
            for (var i = 0; i < totalItem; i++) {
                if (i < rank.length) {
                    var fFlow = parseFloat(rank[i].flow);
                    var ratio = fFlow / biggestFlow;
                    var flow = Localization.strings.formatBigNumber(rank[i].flow);
                    var textA: string = rank[i] == null ? "" : rank[i].iata + " / " + rank[i].icao;

                    var textB: string = rank[i] == null ? "" : rank[i].displayName;
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

        private makeAirlineShare(div: HTMLElement, rank, type) {
            div.innerHTML = "";
            if (rank.length == 0) {
                div.parentElement.style.visibility = "hidden";
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
                subDataIdx = "Domestic";
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
                this.dataSrcInfo.setAirportReportPageRegion(this.airport.country, year, this.airportStat, regionItems, regionDisplayText);

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
            DataQuery.queryAirportStat(this.curDataSrc, year, airport, callback);
        }

        private createTimeSeriesChart(divId, timeScale, yearFrom, yearTo, timeData, divideNum: number) {
            if (!timeData) {
                // Show something about no data available
                document.getElementById(divId).innerHTML = '<span style="font-size: 40pt; color: #D0D0D0">' + Localization.strings.noDataAvailable + '</span>';
                return;
            }

            var statData = null;
            if (this.timeSeriesDataSrc.timeUnit == TimeUnit.Year) {
                statData = this.prepareAnnualTimeSeries(divId, timeScale, yearFrom, yearTo, timeData, divideNum);
            } else {
                statData = this.prepareMonthTimeSeries(divId, timeScale, yearFrom, yearTo, timeData, divideNum);
            }

            var dataItem = {};
            dataItem["label"] = T100.T100Localization.strings.timeSeriesFlowByTimeScale(timeScale);
            dataItem['data'] = statData.data;
            var _data = [];
            _data.push(dataItem);
            $.plot("#" + divId, _data, {
                xaxis: {
                    tickDecimals: 0,
                    ticks: statData.tickIdx,
                    min: -1,
                    max: statData.outputIdx + 1
                }
            });
        }
        private prepareAnnualTimeSeries(divId, timeScale, yearFrom, yearTo, timeData, divideNum: number) {
            var data = [];
            var year;
            var outputIdx = 0;
            var inputIdx = (yearFrom - this.timeSeriesDataSrc.startTime.year)
            var tickIdx = [];
            for (year = yearFrom; year <= yearTo; year++) {
                data.push([outputIdx, timeData[inputIdx] / divideNum]);
                tickIdx.push([outputIdx, year.toString()]);
                outputIdx++;
                inputIdx++;
            }
            return {
                data: data,
                tickIdx: tickIdx,
                outputIdx: outputIdx
            };            
        }

        private prepareMonthTimeSeries(divId, timeScale, yearFrom, yearTo, timeData, divideNum: number) {
            var year, month;            

            var inputIdx = (yearFrom - this.timeSeriesDataSrc.startTime.year) * 12;;
            var outputIdx = 0;
            var tickIdx = [];

            var monthTickTemplate = Localization.strings.getMonthTickTemplate(yearTo - yearFrom);
            var data = [];
            for (year = yearFrom; year <= yearTo; year++) {
                var monthStart = 1;
                if (year == this.timeSeriesDataSrc.startTime.year)
                    monthStart = this.timeSeriesDataSrc.startTime.month;
                var monthEnd = 12;
                if (year == this.timeSeriesDataSrc.endTime.year)
                    monthEnd = this.timeSeriesDataSrc.endTime.month;

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

            return {
                data: data,
                tickIdx: tickIdx,
                outputIdx: outputIdx
            }; 
        }

        private updateTimeSeries(yearFrom, yearTo) {
            var timeScale = ReportPageUtils.getTimeScale("timeScaleYear", "timeScaleQuarter", "timeScaleMonth");
            document.getElementById("paxTimeSeriesChartTitle").innerHTML =
            Localization.strings.timeSeriesTotalPassengerInT100ByTimeScale(FlowType.Passenger, timeScale) + Utils.createSpace(5);
            document.getElementById("freightTimeSeriesChartTitle").innerHTML =
            Localization.strings.timeSeriesTotalPassengerInT100ByTimeScale(FlowType.Freight, timeScale) + Utils.createSpace(5);
            document.getElementById("paxTimeSeriesChartSubTitle").innerHTML = Localization.strings.timeSeriesThisChartShowTimeScaleData(FlowType.Passenger, timeScale);
            document.getElementById("freightTimeSeriesChartSubTitle").innerHTML = Localization.strings.timeSeriesThisChartShowTimeScaleData(FlowType.Freight, timeScale);

            this.createTimeSeriesChart("paxTimeSeries", timeScale, yearFrom, yearTo, this.timeSeriesData["pax"]["ALL"], Localization.strings.largeDivideNum);
            this.createTimeSeriesChart("freightTimeSeries", timeScale, yearFrom, yearTo, this.timeSeriesData["freight"]["ALL"], 1);
        }

        private queryTimeSeries(airport) {
            var callback = (data) => {
                this.timeSeriesData = data;
                this.updateTimeSeries($("#timeSeriesSlider").slider("values", 0), $("#timeSeriesSlider").slider("values", 1));
            }
            DataQuery.queryAirportTimeSeries(this.curDataSrc, airport, callback);
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
    });
});