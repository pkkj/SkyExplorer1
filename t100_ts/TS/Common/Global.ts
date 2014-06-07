module AST {
    export class GlobalStatus{
        static dataSrc = null;
        static flowDir = null;
        static originIata: string = null;
        static originAirport: Airport = null;
        static destIata:string = null;
        static destAirport: Airport = null;
        static year = null;
    }

    export class Localization {
        static strings: UiStrings = null;
        static locale: string = "ENUS";

        static init() {
            var urlParams = Utils.decodeUrlPara();
            if (urlParams["locale"]) {
                if (urlParams["locale"] == "zhCN") {
                    Localization.strings = new AST.UiStrings_ZhCN();
                } else if (urlParams["locale"] == "jaJP") {
                    Localization.strings = new AST.UiStrings_JaJP();
                } 
                Localization.locale = urlParams["locale"].toUpperCase();
            }
            if (Localization.strings == null) {
                Localization.strings = new AST.UiStrings();
            }
        }


        static getLocale() {
            var urlParams = Utils.decodeUrlPara();
            return urlParams["locale"] ? urlParams["locale"] : "enUS";
        }
        
    }
}