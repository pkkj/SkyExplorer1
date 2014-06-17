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