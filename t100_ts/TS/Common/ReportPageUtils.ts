module AST {
    export class ReportPageUtils{
        static createRankSummaryItem(rankType, airline, flow, percentage) {
            var item = Utils.createElement("div", { "class": "" });
            item.style.height = "37px";
            var divAirline = Utils.createElement("div", { "class": "shareRankItem", "text": "<b>" + airline + "</b>" });
            var divData = document.createElement("div");

            item.appendChild(divAirline);
            item.appendChild(divData);

            divData.appendChild(Utils.createElement("span", { "text": rankType, "class": "shareRankItemIndex" }));
            divData.appendChild(Utils.createElement("span", { "text": flow, "class": "shareRankItem", "width": "80px" }));
            divData.appendChild(Utils.createElement("span", { "text": airline != "" ? Localization.strings.percentage : "", "class": "shareRankItemIndex" }));
            divData.appendChild(Utils.createElement("span", { "text": percentage, "class": "shareRankItem" }));
            return item;
        }

        static getTimeScale(yearDiv, quarterDiv, monthDiv) {
            var timeScale = "";
            if ((<HTMLInputElement>document.getElementById(yearDiv)).checked)
                timeScale = "Year";
            else if ((<HTMLInputElement>document.getElementById(quarterDiv)).checked)
                timeScale = "Quarter";
            else
                timeScale = "Month";
            return timeScale
        }
    }
}