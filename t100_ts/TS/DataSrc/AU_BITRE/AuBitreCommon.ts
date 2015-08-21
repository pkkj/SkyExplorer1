module AST {
    export module AuBitreData {
        export class AuBitreMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "AuBitre";
                this.shortInfo = "Australian BITRE";
                this.fullInfo = "Australian Bureau of Infrastructure, Transport and Regional Economics";
                this.aboutSrcPageUrl = ""; // TODO
                this.supportAirportReportPage = true;
                this.country = "AU";
                this.startTime = new YearMonth(1985, 1);
                this.endTime = new YearMonth(2015, 5);
                this.timeUnit = TimeUnit.Month;
                this.statTarget = StatTarget.Airport;
            }

            static currentCountry = "AU";
            static hasMonthData = true;
            static dataFrom = new YearMonth(1985, 1);
            static dataTo = new YearMonth(2015, 5);

            private static _instance = null;
            static instance() {
                if (!AuBitreMetaData._instance)
                    AuBitreMetaData._instance = new AuBitreMetaData();
                return AuBitreMetaData._instance;
            }

            public dateFrom() {
                return AuBitreMetaData.dataFrom;
            }

            public dataTo() {
                return AuBitreMetaData.dataTo;
            }

            public getShortInfoLocalizeName(): string {
                return Localization.strings.auBitreShortInfo;
            }
            public getFullInfoLocalizeName(): string {
                return Localization.strings.auBitreDataFullInfo;
            }

            public getDestPanelFootNote(): string {
                return "";
            }

            public getAirportReportPageFootnote(airport: Airport): string {
                return Localization.strings.getAuBitreAirportReportPageFootNote();
            }
        }
    }
}  