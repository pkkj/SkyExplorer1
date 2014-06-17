module AST {
    export class MainPageAboutUi {
        private btnAboutT100: HTMLButtonElement = null;
        private btnAboutApp: HTMLButtonElement = null;
        constructor() {

            this.btnAboutApp = <HTMLButtonElement>document.getElementById("btnAboutApp");
            this.btnAboutApp.onclick = function () {
                DialogUtils.loadDetailReportDialog(Localization.strings.aboutSkyExplorer, Localization.strings.aboutAppUrl, { height: "420px", width: "370px" });
            };

            // Change ths subtitle
            document.getElementById("appTitle").innerHTML = Localization.strings.appTitle;
            document.getElementById("appSubTitle").innerHTML = Localization.strings.subtitle;
            document.getElementById("developedByText").innerHTML = Localization.strings.developedBy;
            document.getElementById("copyRightText").innerHTML = Localization.strings.copyRightText;
            document.getElementById("departmentOfGeographyOSU").innerHTML = Localization.strings.departmentOfGeographyOSU;
            document.getElementById("mapDataText").innerHTML = Localization.strings.mapDataEsri;
            Localization.strings.makeChangeLanguageDiv(document.getElementById("languageBar"));
        }
    }

}