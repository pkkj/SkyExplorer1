module AST {
    export module UkData {
        export class UkLocalization {
            static strings: UiStrings = null;
            static init() {
                var urlParams = Utils.decodeUrlPara();
                if (urlParams["locale"]) {
                    if (urlParams["locale"] == "zhCN") {
                        UkLocalization.strings = new UkData.UiStrings_ZhCN();
                    }
                }
                if (UkLocalization.strings == null) {
                    UkLocalization.strings = new UkData.UiStrings();
                }

            }
        }

        export class UkHTMLPageData {
            static loadHTMLData() {
                var deferred = $.Deferred();

                var deferred1 = $.Deferred();

                $.when(deferred1).then(function () {
                    deferred.resolve();
                });

                $("#ukDestBarInnerDiv").load("UkPart.html #ukDestBarInnerDivContent", () => { deferred1.resolve(); });
                return deferred.promise();
            }
        }

        export class UkMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "UkData";
                this.shortInfo = "UK CAA";
                this.fullInfo = "UK CAA Data";
                this.aboutSrcPageUrl = "DataSourceInfo/UkCaa.html";
            }

            static currentCountry = "United Kingdom";
            static hasMonthData = true;
            static dataFrom = new YearMonth(2010, 1);
            static dataTo = new YearMonth(2013, 12);

            private static _instance = null;
            static instance() {
                if (!UkMetaData._instance)
                    UkMetaData._instance = new UkMetaData();
                return UkMetaData._instance;
            }

            public getDestPanelFootNote(): string {
                return Localization.strings.ukDestPanelFootNote;
            }

            public dateFrom() {
                return UkMetaData.dataFrom;
            }

            public dataTo() {
                return UkMetaData.dataTo;
            }
        }
    }
} 