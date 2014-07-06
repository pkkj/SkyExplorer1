module AST {
    export module JpData {
        export class JpMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "JpData";
                this.shortInfo = "Japan MLIT";
                this.fullInfo = "Japan MLIT Data";
                this.aboutSrcPageUrl = "DataSourceInfo/JpData.html";
            }

            static currentCountry = "Japan";
            static hasMonthData = true;
            static dataFrom = new YearMonth(2011, 1);
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