module AST {
    export module T100 {
        export class T100Common {
            static launchAirportStat(originAirport: Airport, year) {
                if (!originAirport)
                    return;
                var where: string = "iata=" + originAirport.iata;
                where += "&icao=" + originAirport.icao;
                where += "&name=" + originAirport.name;
                where += "&city=" + originAirport.city;
                where += "&country=" + originAirport.country;
                if (year)
                    where += "&year=" + year;
                where += "&locale=" + AST.Localization.getLocale();
                var src = "AirportReport.html?" + where;
                DialogUtils.loadDetailReportDialog(Localization.strings.airportStatistic, src);
            }

            static launchRouteStat(originIata, destIata, airline, year) {
                var where: string = "originIata=" + originIata;
                where += "&destIata=" + destIata;
                if (airline)
                    where += "&airline=" + airline;
                if (year)
                    where += "&year=" + year;
                where += "&locale=" + AST.Localization.getLocale();
                var src = "RouteReport.html?" + where;
                DialogUtils.loadDetailReportDialog(Localization.strings.routeStatistic, src);
            }

        }

        export class T100MetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "T100";
                this.shortInfo = "US T100";
                this.fullInfo = "US BTS T100 Data";
            }
            static currentCountry = "United States";
            static hasMonthData = true;
            static dataFrom = new YearMonth(1990, 1);
            static dataTo = new YearMonth(2013, 11);
            static availablity: string[] = ["2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000", "1999",
                "1998", "1997", "1996", "1995", "1994", "1993", "1992", "1991", "1990"];

            private static _instance = null;
            static instance(): T100MetaData {
                if (!T100MetaData._instance)
                    T100MetaData._instance = new T100MetaData();
                return T100MetaData._instance;
            }

            static airlineInfo: Array<Airline> = null;
            static airlineDict: Object;
            static prepareAirlineData(callback: () => any) {
                T100DataQuery.queryAllAirlines(function (data: Array<Airline>) {
                    T100MetaData.airlineInfo = data;
                    T100MetaData.airlineDict = {};
                    for (var i = 0; i < T100MetaData.airlineInfo.length; i++) {
                        T100MetaData.airlineDict[T100MetaData.airlineInfo[i].code] = T100MetaData.airlineInfo[i];
                    }
                    T100MetaData.airlineInfo.sort(function (a: Airline, b: Airline) {
                        return Localization.strings.compareStr(a.name, b.name);
                    });
                    callback();
                });
            }

        }

        export class T100FFMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "T100FF";
                this.shortInfo = "US T100(FF)";
                this.fullInfo = "US BTS T100(FF) Data";
            }

            static currentCountry = "United States";
            static hasMonthData = true;
            static dataFrom = new YearMonth(2003, 1);
            static dataTo = new YearMonth(2009, 12);

            private static _instance = null;
            static instance(): T100FFMetaData {
                if (!T100FFMetaData._instance)
                    T100FFMetaData._instance = new T100FFMetaData();
                return T100FFMetaData._instance;
            }
            static has28ISFFData(year: number):boolean {
                return year >= T100FFMetaData.dataFrom.year && year <= T100FFMetaData.dataTo.year;
            }
        }

        export class T100HTMLPageData {
            static loadHTMLData() {
                var deferred = $.Deferred();

                var deferred1 = $.Deferred();
                var deferred2 = $.Deferred();

                $.when(deferred1, deferred2).then(function () {
                    deferred.resolve();
                });

                $("#t100DestBarInnerDiv").load("T100Part.html #t100DestBarContent", () => { deferred1.resolve(); });
                $("#t100AirlinePanel").load("T100Part.html #t100AirlinePanelExtContent", () => { deferred2.resolve(); });
                return deferred.promise();
            }
        }

        export enum T100DataType {
            Passenger, Freight
        }

        export class T100Localization {
            static strings: UiStrings = null;
            static init() {
                var urlParams = Utils.decodeUrlPara();
                if (urlParams["locale"]) {
                    if (urlParams["locale"] == "zhCN") {
                        T100Localization.strings = new T100.UiStrings_ZhCN();
                    }
                }
                if (T100Localization.strings == null) {
                    T100Localization.strings = new T100.UiStrings();
                }

            }
        }
        
    }
}
