module AST {
    export module TwData {
        export class TwMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "TwData";
                this.shortInfo = "Taiwan CAA";
                this.fullInfo = "Taiwan CAA Data";
                this.aboutSrcPageUrl = "DataSourceInfo/TwData.html";
            }

            static currentCountry = "Taiwan";
            static hasMonthData = true;
            static dataFrom = new YearMonth(2013, 1);
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