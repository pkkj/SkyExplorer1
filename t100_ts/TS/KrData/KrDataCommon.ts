 module AST {
    export module KrData {
        export class KrMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "KoreaData";
                this.shortInfo = "Korea KAC";
                this.fullInfo = "Korea Airport Corporation Data";
                this.aboutSrcPageUrl = "DataSourceInfo/KrData.html";
                this.supportAirportReportPage = true;
                this.country = "KR";
                this.startTime = new YearMonth(2010, 1);
                this.endTime = new YearMonth(2015, 6);
                this.timeUnit = TimeUnit.Month;
                this.statTarget = StatTarget.Route;
            }

            static currentCountry = "KR";
            static hasMonthData = true;
            static dataFrom = new YearMonth(2010, 1);
            static dataTo = new YearMonth(2015, 6);

            private static _instance = null;
            static instance() {
                if (!KrMetaData._instance)
                    KrMetaData._instance = new KrMetaData();
                return KrMetaData._instance;
            }

            public getDestPanelFootNote(): string {
                return "";
            }

            public dateFrom() {
                return KrMetaData.dataFrom;
            }

            public dataTo() {
                return KrMetaData.dataTo;
            }

            public getShortInfoLocalizeName(): string {
                return Localization.strings.krDataShortInfo;
            }
            public getFullInfoLocalizeName(): string {
                return Localization.strings.krDataFullInfo;
            }
            public getDomesticCountryDestName(): string {
                return Localization.strings.regionKoreaDest;
            }

            public getSupportDataOption(option: string): boolean {
                if (option == "passenger" || option == "freight")
                    return true;
                return false;
            }

            public getAirportReportPageFootnote(airport: Airport): string {
                if (airport.iata == "ICN") {
                    return Localization.strings.onlyTheDataOfDomesticRoutesKorea;
                }
                var localCountry: boolean = this.country == airport.country;
                if (!localCountry) {
                    return Localization.strings.onlyTheDataOfRoutesTowardKorea;
                }
                return "";
            }
            public getAirportCoverage(airport: Airport): AirportCoverage {
                if (airport.country == this.country && airport.iata != "ICN") {
                    return new AirportCoverage(true, true);
                }
                return new AirportCoverage(false, false);
            }
        }

        export class KrDataHTMLPageData {
            static loadHTMLData() {
                var deferred = $.Deferred();

                var deferred1 = $.Deferred();

                $.when(deferred1).then(function () {
                    deferred.resolve();
                });

                $("#krDataDestBarInnerDiv").load("KrDataPart.html #KrDataDestBarContent", () => { deferred1.resolve(); });
                return deferred.promise();
            }

        }
    }
} 