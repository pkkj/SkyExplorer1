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

        export class T100DataMeta { // Change to MetaData later
            static availablity: string[] = ["2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000", "1999",
                "1998", "1997", "1996", "1995", "1994", "1993", "1992", "1991", "1990"];
            static airlineInfo: Array<Airline> = null;
            static airlineDict: Object;
            static currentCountry = "United States";

            // Available date
            static dataFrom = new YearMonth(1990, 1);
            static dataTo = new YearMonth(2013, 11);

            static data28ISFFFrom = new YearMonth(2003, 1);
            static data28ISFFTo = new YearMonth(2009, 12);

            static prepareData(callback: () => any) {
                T100DataQuery.queryAllAirlines(function (data: Array<Airline>) {
                    T100DataMeta.airlineInfo = data;
                    T100DataMeta.airlineDict = {};
                    for (var i = 0; i < T100DataMeta.airlineInfo.length; i++) {
                        T100DataMeta.airlineDict[T100DataMeta.airlineInfo[i].code] = T100DataMeta.airlineInfo[i];
                    }
                    T100DataMeta.airlineInfo.sort(function (a: Airline, b: Airline) {
                        return Localization.strings.compareStr(a.name, b.name);
                    });
                    callback();
                });
            }
            static has28ISFFData(year: number) {
                return year >= T100DataMeta.data28ISFFFrom.year && year <= T100DataMeta.data28ISFFTo.year;
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
        /// The destination with route and basic statistic
        

        export class T100RouteAirlineRecord {
            public airline: AirlineBase = null;
            public departure: number;
            public pax: number;
            public freight: number;
            public monthDeparture: Array<number>;
            public monthPax: Array<number>;
            public monthFreight: Array<number>;
        }
        
    }
}
