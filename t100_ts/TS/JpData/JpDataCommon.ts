module AST {
    export module JpData {
        export class JpMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "JapanData";
                this.shortInfo = "Japan MLIT";
                this.fullInfo = "Japan MLIT Data";
                this.aboutSrcPageUrl = "DataSourceInfo/JpData.html";
                this.supportAirportReportPage = true;
                this.country = "Japan";
                this.startTime = new YearMonth(2007, 1);
                this.endTime = new YearMonth(2013, 12);
            }

            static currentCountry = "Japan";
            static hasMonthData = true;
            static dataFrom = new YearMonth(2007, 1);
            static dataTo = new YearMonth(2013, 12);

            private static _instance = null;
            static instance() {
                if (!JpMetaData._instance)
                    JpMetaData._instance = new JpMetaData();
                return JpMetaData._instance;
            }

            public getDestPanelFootNote(): string {
                return Localization.strings.allDataAreInBothDirection;
            }

            public dateFrom() {
                return JpMetaData.dataFrom;
            }

            public dataTo() {
                return JpMetaData.dataTo;
            }

            public getShortInfoLocalizeName(): string {
                return Localization.strings.jpDataShortInfo;
            }
            public getFullInfoLocalizeName(): string {
                return Localization.strings.jpDataFullInfo;
            }
            public getDomesticCountryDestName(): string {
                return Localization.strings.regionJapanDest;
            }
            public getAirportReportPageFootnote(airport: Airport): string {
                return Localization.strings.getJapanAirportReportPageFootNote(this.country != airport.countryEn);
            }

            public getRouteReportPageFootnote(originAirport: Airport, destAirport: Airport): string {
                return Localization.strings.allStatConsistInboundOutboundTraffic;
            }

            public getSupportDataOption(option: string): boolean {
                if (option == "passenger" || option == "seat")
                    return true;
                return false;
            }

            public getAirportCoverage(airport: Airport): AirportCoverage {
                if (airport.countryEn = this.country) {
                    return new AirportCoverage(true, false);
                }
                return new AirportCoverage(false, false);
            }
        }

        export class JpDataHTMLPageData {
            static loadHTMLData() {
                var deferred = $.Deferred();

                var deferred1 = $.Deferred();

                $.when(deferred1).then(function () {
                    deferred.resolve();
                });

                $("#jpDataDestBarInnerDiv").load("JpDataPart.html #JpDataDestBarContent", () => { deferred1.resolve(); });
                return deferred.promise();
            }

        }
    }
} 