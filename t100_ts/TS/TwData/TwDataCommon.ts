module AST {
    export module TwData {
        export class TwMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "TwData";
                this.shortInfo = "Taiwan CAA";
                this.fullInfo = "Taiwan CAA Data";
                this.aboutSrcPageUrl = "DataSourceInfo/TwData.html";
                this.supportAirportReportPage = true;
                this.country = "Taiwan";
                this.startTime = new YearMonth(2010, 1);
                this.endTime = new YearMonth(2014, 5);
            }

            static currentCountry = "Taiwan";
            static hasMonthData = true;
            static dataFrom = new YearMonth(2010, 1);
            static dataTo = new YearMonth(2014, 4);

            private static _instance = null;
            static instance() {
                if (!TwMetaData._instance)
                    TwMetaData._instance = new TwMetaData();
                return TwMetaData._instance;
            }

            public dateFrom() {
                return TwMetaData.dataFrom;
            }

            public dataTo() {
                return TwMetaData.dataTo;
            }

            public getShortInfoLocalizeName(): string {
                return Localization.strings.twDataShortInfo;
            }
            public getFullInfoLocalizeName(): string {
                return Localization.strings.twDataFullInfo;
            }

            public getDestPanelFootNote(): string {
                if (!this.isSingleDirDataAvailable(GlobalStatus.originAirport, GlobalStatus.destAirport)) {
                    return Localization.strings.allDataAreInBothDirection;
                }
                return "";
            }

            private isSingleDirDataAvailable(origin: Airport, dest:Airport): boolean {
                if (origin.country == TwMetaData.currentCountry && dest.country == TwMetaData.currentCountry)
                    return false;
                return true;
            }

            public setAirportReportPageRegion(airportCountry: string, year: string, airportStat, regionItems: Array<string>, regionDisplayText: Array<string>) {
                var hasDomesticFlow: boolean = airportStat["Domestic"].totalPax != "0" || airportStat["Domestic"].totalFreight != "0";
                var hasIntlFlow: boolean = airportStat["International"].totalPax != "0" || airportStat["International"].totalFreight != "0";
                var localCountry: boolean = this.country == airportCountry;

                if (hasDomesticFlow) {
                    regionDisplayText.push(Localization.strings.regionTaiwanDomesticDest);
                    regionItems.push("Domestic");
                }

                if (hasIntlFlow) {
                    regionDisplayText.push(Localization.strings.regionTaiwanIntlDest);
                    regionItems.push("International");
                }
            }

            public getAirportReportPageFootnote(airport: Airport): string {
                return Localization.strings.getTaiwanAirportReportPageFootNote(this.country != airport.countryEn);
            }

            public getRouteReportPageFootnote(originAirport: Airport, destAirport: Airport): string {
                return Localization.strings.allStatConsistInboundOutboundTraffic;
            }
            public getSupportDataOption(option: string): boolean {
                if (option == "passenger" || option == "seat")
                    return true;
                return false;
            }
        }

        export class TwDataHTMLPageData {
            static loadHTMLData() {
                var deferred = $.Deferred();

                var deferred1 = $.Deferred();

                $.when(deferred1).then(function () {
                    deferred.resolve();
                });

                $("#twDataDestBarInnerDiv").load("TwDataPart.html #TwDataDestBarContent", () => { deferred1.resolve(); });
                return deferred.promise();
            }

        }
    }
}