 module AST {
    export module KrData {
        export class KrMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "KrData";
                this.shortInfo = "Korea KAC";
                this.fullInfo = "Korea Airport Corporation Data";
                this.aboutSrcPageUrl = "DataSourceInfo/KrData.html";
            }

            static currentCountry = "South Korea";
            static hasMonthData = true;
            static dataFrom = new YearMonth(2013, 1);
            static dataTo = new YearMonth(2014, 5);

            private static _instance = null;
            static instance() {
                if (!KrMetaData._instance)
                    KrMetaData._instance = new KrMetaData();
                return KrMetaData._instance;
            }

            public getDestPanelFootNote(): string {
                return Localization.strings.allDataAreInBothDirection;
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