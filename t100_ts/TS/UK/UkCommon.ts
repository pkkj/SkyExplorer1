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
    }
} 