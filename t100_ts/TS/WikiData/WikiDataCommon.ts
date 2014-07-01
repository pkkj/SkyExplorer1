module AST {
    export module WikiData {
        export class WikiMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "WikiData";
                this.shortInfo = "Wikipedia Data";
                this.fullInfo = "Wikipedia Airport Info";
                this.aboutSrcPageUrl = "DataSourceInfo/WikiData.html";
            }

            static currentCountry = "*";
            static hasMonthData = true;
            static dataFrom = new YearMonth(2013, 1);
            static dataTo = new YearMonth(2014, 6);

            private static _instance = null;
            static instance() {
                if (!WikiMetaData._instance)
                    WikiMetaData._instance = new WikiMetaData();
                return WikiMetaData._instance;
            }

            public dateFrom() {
                return WikiMetaData.dataFrom;
            }

            public dataTo() {
                return WikiMetaData.dataTo;
            }

            public getShortInfoLocalizeName(): string {
                return Localization.strings.wikiDataShortInfo;
            }
            public getFullInfoLocalizeName(): string {
                return Localization.strings.wikiDataFullInfo;
            }
        }

        
    }
} 