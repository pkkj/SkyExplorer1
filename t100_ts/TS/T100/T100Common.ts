module AST {
    export module T100 {

        export class T100MetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "T100Data";
                this.shortInfo = "US T100";
                this.fullInfo = "US BTS T100 Data";
                this.aboutSrcPageUrl = "DataSourceInfo/UsT100.html";
                this.supportAirportReportPage = true;
            }
            static currentCountry = "United States";
            static hasMonthData = true;
            static dataFrom = new YearMonth(1990, 1);
            static dataTo = new YearMonth(2014, 1);
            
            static availablity: string[] = ["2014","2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000", "1999",
                "1998", "1997", "1996", "1995", "1994", "1993", "1992", "1991", "1990"];
            private static _instance = null;
            static instance(): T100MetaData {
                if (!T100MetaData._instance)
                    T100MetaData._instance = new T100MetaData();
                return T100MetaData._instance;
            }

            public getShortInfoLocalizeName(): string {
                return Localization.strings.usT100ShortInfo;
            }
            public getFullInfoLocalizeName(): string {
                return Localization.strings.usT100FullInfo;
            }

            public dateFrom() {
                return T100MetaData.dataFrom;
            }

            public dataTo() {
                return T100MetaData.dataTo;
            }

        }

        export class T100FFMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "T100FF";
                this.shortInfo = "US T100(FF)";
                this.fullInfo = "US BTS T100(FF) Data";
                this.aboutSrcPageUrl = "DataSourceInfo/UsT100FF.html";
                this.supportAirportReportPage = true;
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

            public getDestPanelFootNote(): string {
                return T100.T100Localization.strings.onlyUSRouteAvailable;;
            }

            public getShortInfoLocalizeName(): string {
                return Localization.strings.usT100FFShortInfo;
            }
            public getFullInfoLocalizeName(): string {
                return Localization.strings.usT100FFFullInfo;
            }

            public dateFrom() {
                return T100FFMetaData.dataFrom;
            }

            public dataTo() {
                return T100FFMetaData.dataTo;
            }
        }

        export class T100HTMLPageData {
            static loadHTMLData() {
                var deferred = $.Deferred();

                var deferred1 = $.Deferred();
                var deferred2 = $.Deferred();
                var deferred3 = $.Deferred();

                $.when(deferred1, deferred2, deferred3).then(function () {
                    deferred.resolve();
                });

                $("#t100AirlinePanel").load("T100Part.html #t100AirlinePanelExtContent", () => { deferred1.resolve(); });
                $("#t100DestBarInnerDiv").load("T100Part.html #t100DestBarContent", () => { deferred2.resolve(); });
                $("#t100FFDestBarInnerDiv").load("T100Part.html #t100FFDestBarContent", () => { deferred3.resolve(); });
                return deferred.promise();
            }
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
