module AST {
    export module ThAotData {
        export class ThAotMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "ThAot";
                this.shortInfo = "Thailand AOT";
                this.fullInfo = "Airports of Thailand Public Co.,Ltd.";
                this.aboutSrcPageUrl = ""; // TODO
                this.supportAirportReportPage = true;
                this.country = "TH";
                this.startTime = new YearMonth(2012, 1);
                this.endTime = new YearMonth(2014, 12);
                this.timeUnit = TimeUnit.Month;
                this.statTarget = StatTarget.Airport;
            }

            static currentCountry = "TH";
            static hasMonthData = true;
            static dataFrom = new YearMonth(2012, 1);
            static dataTo = new YearMonth(2014, 3);

            private static _instance = null;
            static instance() {
                if (!ThAotMetaData._instance)
                    ThAotMetaData._instance = new ThAotMetaData();
                return ThAotMetaData._instance;
            }

            public dateFrom() {
                return ThAotMetaData.dataFrom;
            }

            public dataTo() {
                return ThAotMetaData.dataTo;
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