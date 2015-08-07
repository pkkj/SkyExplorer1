module AST {
    export module CnCaacData {
        export class CnCaacMetaData extends AST.DataSourceMetaData {
            constructor() {
                super();

                this.name = "CnCaacData";
                this.shortInfo = "China ";
                this.fullInfo = "China CAAC Data";
                this.aboutSrcPageUrl = "DataSourceInfo/CnCaac.html"; // TODO
                this.supportAirportReportPage = true;
                this.country = "CN";
                this.startTime = new YearMonth(2001, 1);
                this.endTime = new YearMonth(2014, 12);
                this.timeUnit = TimeUnit.Year;
                this.statTarget = StatTarget.Airport;
            }

            static currentCountry = "CN";
            static hasMonthData = true;
            static dataFrom = new YearMonth(2001, 1);
            static dataTo = new YearMonth(2014, 12);

            private static _instance = null;
            static instance() {
                if (!CnCaacMetaData._instance)
                    CnCaacMetaData._instance = new CnCaacMetaData();
                return CnCaacMetaData._instance;
            }

            public dateFrom() {
                return CnCaacMetaData.dataFrom;
            }

            public dataTo() {
                return CnCaacMetaData.dataTo;
            }

            public getShortInfoLocalizeName(): string {
                return Localization.strings.cnCaacShortInfo;
            }
            public getFullInfoLocalizeName(): string {
                return Localization.strings.cnCaacDataFullInfo;
            }

            public getDestPanelFootNote(): string {
                return "";
            }
            
            public getAirportReportPageFootnote(airport: Airport): string {
                return Localization.strings.getCnCaacAirportReportPageFootNote();
            }
        }
    }
} 