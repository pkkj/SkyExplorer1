module AST {
    export module CnMiaData {
        export class CnMiaMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "CnMiaData";
                this.shortInfo = "Macau MIA";
                this.fullInfo = "Macau International Airport Data";
                this.aboutSrcPageUrl = ""; // TODO
                this.supportAirportReportPage = true;
                this.country = "CN";
                this.startTime = new YearMonth(1996, 1);
                this.endTime = new YearMonth(2015, 3);
                this.timeUnit = TimeUnit.Month;
                this.statTarget = StatTarget.Airport;
            }

            static currentCountry = "CN";
            static hasMonthData = true;
            static dataFrom = new YearMonth(1996, 1);
            static dataTo = new YearMonth(2015, 3);

            private static _instance = null;
            static instance() {
                if (!CnMiaMetaData._instance)
                    CnMiaMetaData._instance = new CnMiaMetaData();
                return CnMiaMetaData._instance;
            }

            public dateFrom() {
                return CnMiaMetaData.dataFrom;
            }

            public dataTo() {
                return CnMiaMetaData.dataTo;
            }

            public getShortInfoLocalizeName(): string {
                return Localization.strings.cnMiaShortInfo;
            }
            public getFullInfoLocalizeName(): string {
                return Localization.strings.cnMiaDataFullInfo;
            }

            public getDestPanelFootNote(): string {
                return "";
            }

            public getAirportReportPageFootnote(airport: Airport): string {
                return Localization.strings.getCnMiaAirportReportPageFootNote();
            }
        }
    }
} 