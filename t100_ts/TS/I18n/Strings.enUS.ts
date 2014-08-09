module AST {
    export class UiStrings {
        constructor() {
        }

        public largeDivideNum = 1000;

        public appTitle = "Sky Explorer";
        public departmentOfGeographyOSU = "Department of Geography, The Ohio State University";
        public developedBy = "Developed by ";
        public mapDataEsri = "Map data: ";
        public copyRightText = "Copyright 2014, ";
        public aboutAppUrl = "AboutApp.html";

        public search = "Search";
        public ok = "OK";
        public pleaseSelectInputOrigin = "Please select or input an origin";
        public airport = "Airport";
        public close = "Close";
        public loading = "Loading";
        public searchingAirportAndLoadingInfo = "Searching airport and loading info...";
        public searchingAirlineAndLoadingInfo = "Searching and loading airline info...";
        public applicationLoadingData = "Application: loading data...";

        public year = "Year";
        public destinations = "Destinations ";
        public subtitle = 'A powerful WebGIS for investigating air traffic data. <a href="../../info/skyexplorer_t100.html" style="text-decoration:underline">(More info)</a>';
        public moreInfo = "(More info)";
        public aboutT100 = "About T100";
        public aboutSkyExplorer = "About Sky Explorer";
        public about = "About";
        public airportDetailReport = "Airport Detail Report";
        public airportView = "Airport View";
        public airlineView = "Airline View";
        public viewDataBy = "View data by: ";
        public from = "From";
        public to = "To";
        public noAvailableDataInThisYear = "No available data in this year";
        public pleaseSelectAirport = "Please select an airport";
        public withFlowData = "With Flow Data";
        public noFlowData = "No Flow Data";
        public largeAirport = "Large airport";
        public mediumAirport = "Medium airport";
        public smallAirport = "Small airport";
        public passengerRouteMayHaveFreight = "Passenger route, might have freight flow";
        public freightOnlyRoute = "Freight-only route";
        public passengerRouteWithoutFlowData = "Passenger routes without flow data";
        public routeOnlyWithUsData = "Routes only with data of US Carriers";

        public route = "Route";
        public flow = "Flow";
        public directDistance = "Direct distance: ";
        public totalDepartures = "Total departures: ";
        public totalPax = "Total pax: ";
        public totalPassenger = "Total passenger: ";
        public totalFreight = "Total freight: ";


        public showInfoFor = "Show info for:";
        public passenger = "Passenger";
        public freight = "Freight";
        public statistic = "Statistic";
        public shareSplit = "Share Split";
        public timeSeries = "Time Series";
        public routeDetailReport = "Route Detail Report";
        public airlineRankByPassenger = "Passenger Rank by Airlines";
        public airlineRankByFreight = "Freight Rank by Airlines";
        public marketShareByPassenger = "Airline Market Share by Passenger";
        public marketShareByFreight = "Airline Market Share by Freight";
        public timeSerierByPassenger = "Time Series by Passenger";
        public timeSerierByFreight = "Time Series by Freight";
        public noDataAvailable = "No data available";
        public metricData = "Metric data: ";
        public departureFreq = "Departure";
        public paxFreq = "Pax";
        public passengerFreq = "Passenger";
        public freightFreq = "Freight";
        public tons = "tons";
        public viewDataFromOtherSourcesForThisRoute = "View data from other sources in this route: ";

        public selectDataSource = "Select data source";
        public filterRouteByAirline = "Filter the routes by airline";
        public all = "All";

        public t100Airline = "T-100 Airline";
        public pleaseSelectAnAirline = "Please selected an airline";
        public onlyTop400Routes = "Only the top 400 routes in flow will be shown.";
        public countryFilter = "Country filter";
        public typeFilter = "Type filter";
        public airline = "Airline";
        public _airlineViewRouteTableFrom = "From";
        public _airlineViewRouteTableTo = "To";
        public _airlineTypeAll = "All";
        public _airlineTypePassenger = "Passenger";
        public _airlineTypeCargo = "Cargo";
        public next = "Next";
        public previous = "Prevous";
        public regionalFilter = "Regional filter";
        public regionalFilterAll = "All";
        public regionalFilterUS = "US Domestic";
        public regionalFilterIntl = "International";

        public monthName: Array<string> = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Airport Report Page
        public airportStatistic = "Airport Statistic";
        public basicStatistic = "Basic statistic";
        public region = "Region";
        public regionAll = "All destinations";
        public regionInternational = "International destinations";
        public regionDomestic = "Domestic destinations";
        public inXxxxYear = "In ";
        public percentage = "Percentage";
        public top10PassengerDestinations = "Top 10 destinations (passenger)";
        public top10FreightDestinations = "Top 10 destinations (freight in tons)";
        public carrierShareByPassenger = "Carrier share by departing passenger";
        public carrierShareByFreight = "Carrier share by departing freight";
        public showChartBy = "Show chart by ";
        public yearRange = "Year range:";
        public timeScaleYear = "Year";
        public timeScaleQuarter = "Quarter";
        public timeScaleMonth = "Month";
        public noAvailableDataForThisAirport = "No data available for this airport.";

        public timeSeriesThisChartShowTimeScaleData(dataType: FlowType, timeScale: string): string {
            if (dataType == FlowType.Passenger) {
                if (timeScale != "Month")
                    return "Unit: thousand people.";
            }
            else {
                if (timeScale != "Month")
                    return "Unit: thousand tons.";
                return "Unit: tons.";
            }
            return "";
        }

        public timeSeriesTotalPassengerInT100ByTimeScale(dataType: FlowType, timeScale: string): string {
            if (dataType == FlowType.Passenger)
                return "Total Passenger by " + timeScale;
            else
                return "Total Freight by " + timeScale;
        }

        // Route report page
        public routeStatistic = "Route Statistic";
        public aircraftUsage = "Aircraft Usage";
        public timeSeriesOfFlow = "Time series of flow";
        public timeSeriesOfSeat = "Time series of seat";
        public routeReportPageAirportFrom = "From: ";
        public routeReportPageAirportTo = "To: ";
        public allAirlinesSummary = "All airlines summary: ";
        public allDeparture = "All departures";
        public allPassenger = "All passengers";
        public allFreight = "All freight";
        public allAirline = "All airlines";
        public totalAirline = "Total summary";
        public aircraftMarketShareByDeparture = "Aircraft Market Share by Departure";
        public aircraftMarketShareByPassenger = "Aircraft Market Share by Departing Passenger";
        public aircraftMarketShareByFreight = "Aircraft Market Share by Departing Freight";
        public viewDataFromOtherSourcesForThisAirport = "View data from other sources for this airport: ";
        public allStatConsistInboundOutboundTraffic = "All statistics consist of inbound and outbound traffic.";

        // Simpale destination panel
        public passengerFlowMonthlyStat = "Passenger Flow Monthly Statistic";
        public allDataAreInBothDirection = "Note: All data are in both directions (arrival/departure).";
        public totalPassengerInThisYear = "Total passenger in this year: ";
        public monthInSummaryTable = "Month";

        public xArlineSummary(airline: string) {
            return airline + " summary : ";
        }

        public constructPlaceName(country: string, city: string): string {
            return city + ", " + country;
        }
        public constructDestNum(num: number): string {
            return "Destination ( Total number: " + num.toString() + " )";
        }

        public constructOriginNum(num: number): string {
            return "Origin ( Total number: " + num.toString() + " )";
        }

        public compareStr(a: string, b: string) {
            return a < b ? -1 : 1;
        }

        public constructAirlineWikiSpan(airlineWikiLink: HTMLElement, airlineName: string) {
            airlineWikiLink.innerHTML = "";
            var wikiLink = <HTMLAnchorElement>AST.Utils.createElement("a", { "text": "page" });
            wikiLink.href = "#";
            wikiLink.onclick = () => {
                window.open("http://en.wikipedia.org/wiki/" + airlineName, '_blank');
            };
            airlineWikiLink.appendChild(AST.Utils.createElement("span", { "text": "Visit airline's " }));
            airlineWikiLink.appendChild(wikiLink);
            airlineWikiLink.appendChild(AST.Utils.createElement("span", { "text": " in Wikipedia to learn more." }));
        }

        public constructAirlineViewFlowLegend(flow: number, airlineType: AirlineType) {
            var postFix = airlineType == AirlineType.Passenger
                ? " passengers in this year." : " tons freight in this year.";
            return "" + flow + postFix;
        }

        public constructAirlineViewFlowLegendOrLess(flow: number, airlineType: AirlineType) {
            var postFix = airlineType == AirlineType.Passenger
                ? " or less passengers in this year." : " or less tons freight in this year.";
            return "" + flow + postFix;
        }

        public yearFormalRepresentation(year: string) {
            return year;
        }

        public formatBigNumber(n: number): string {
            if (n >= 1000) {
                var nk = (n / 1000).toFixed(1);
                return nk.toString() + " K";
            } else {
                return n.toString();
            }
        }

        public getMonthTickTemplate(yearGap): Object {
            var monthTickTemplate: any = { 1: "Jan", 3: "Mar", 5: "May", 7: "Jul", 9: "Sep", 11: "Nov" };
            if (yearGap >= 16) {
                monthTickTemplate = { 1: "Jan", 7: "Jul" };
            } else if (yearGap >= 10) {
                monthTickTemplate = { 1: "Jan", 5: "May", 9: "Sep" };
            } else if (yearGap >= 5) {
                monthTickTemplate = { 1: "Jan", 4: "Apr", 7: "Jul", 10: "Oct" };
            }
            return monthTickTemplate;
        }

        public constructViewReverseRouteData(originIata: string, destIata: string) {
            return "See the data of reversed route (" + originIata + " to " + destIata + ")";
        }

        public makeChangeLanguageDiv(div: HTMLElement) {
            div.innerHTML = "Language: English, <a href='main.html?locale=zhCN'>Chinese</a>";
        }

        public constructYearMonth(year: string, month: number) {
            return this.monthName[month] + " " + year;
        }

        // UK Data Source
        public ukDestPanelFootNote = this.allDataAreInBothDirection + "</br>Some routes might have immediate stop, which is not shown in the map.";
        public ukDataShortInfo = "UK CAA";
        public ukDataFullInfo = "UK CAA Data";
        public onlyTheDataOfRoutesTowardUK = "Note: only the data of routes toward United Kingdom is available. ";
        public regionUkDest = "United Kingdom destinations";
        public getUkAirportReportPageFootNote(onlyUkDest: boolean): string {
            var res: string = "";
            if (onlyUkDest) res += this.onlyTheDataOfRoutesTowardUK;
            res += "All statistics consist of inbound and outbound traffic.";
            return res;
        }

        // US T100 Data Source
        public usT100ShortInfo = "US T100";
        public usT100FullInfo = "US BTS T100 Data";
        public regionAllCarrierUsDest = "All Carrier - US Destinations";
        public regionUsCarrierAllDest = "US Carrier - Non-US Destinations";
        public onlyTheDataOfRoutesTowardUS = "Note: only the data of routes toward United States is available. ";

        // US T100FF Data Source
        public usT100FFShortInfo = "US T100(FF)";
        public usT100FFFullInfo = "US BTS T100(FF) Data";

        // Japan Data Source
        public jpDataShortInfo = "Japan MLIT"
        public jpDataFullInfo = "Japan MLIT Data"
        public onlyTheDataOfRoutesTowardJapan = "Note: only the data of routes toward Japan is available. ";
        public regionJapanDest = "Japan destinations";
        public getJapanAirportReportPageFootNote(onlyJapanDest: boolean): string {
            var res: string = "";
            res += this.onlyTheDataOfRoutesTowardJapan;
            res += "All statistics consist of inbound and outbound traffic.";
            return res;
        }

        // Taiwan Data Source
        public twDataShortInfo = "Taiwan CAA";
        public twDataFullInfo = "Taiwan CAA Data";
        public onlyTheDataOfRoutesTowardTaiwan = "Note: only the data of routes toward Taiwan is available. ";
        public getTaiwanAirportReportPageFootNote(onlyTaiwanDest: boolean): string {
            var res: string = "";
            if (onlyTaiwanDest) res += this.onlyTheDataOfRoutesTowardTaiwan;
            res += "Domestic statistics consist of inbound and outbound traffic. International statistics only consist of outbound traffic.";
            return res;
        }
        public regionTaiwanDomesticDest = "Taiwan destinations";
        public regionTaiwanIntlDest = "International/cross-strait destinations";

        // Korea Data Source
        public krDataShortInfo = "S. Korea KAC";
        public krDataFullInfo = "Korea Airport Corporation Data";
        public onlyTheDataOfRoutesTowardKorea = "Note: only the data of routes toward South Korea is available";
        public onlyTheDataOfDomesticRoutesKorea = "Note: only the data of routes toward South Korean destinations is available";
        public regionKoreaDest = "South Korea destinations (except ICN)";

        // Wikipedia Data
        public wikiDataShortInfo = "Wikipedia";
        public wikiDataFullInfo = "Wikipedia Airport Info";
        public wikiAirlinesOperatingThisRoute = "Airlines operating this route:";
    }
}