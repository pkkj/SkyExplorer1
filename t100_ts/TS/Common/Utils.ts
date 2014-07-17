module AST {
    export enum FlowDirection {
        From, To
    }

    export class QueryAirportType  {
        static Iata = "iata";
        static Geometry = "geometry";
    }

    export interface CreateElementOptions {
        id?: string;
        class?: string;
        text?: string;
        width?: string;
        height?: string;
        colspan?: number;
        rowspan?: number;
        lineHeight?: string;
        float?: string;
    }

    export class Utils {
        // Event helper functions
        static addEvent(element: any, evnt: any, funct: any) {
            if (element.attachEvent)
                element.attachEvent('on' + evnt, funct);
            else
                element.addEventListener(evnt, funct, false);
        }

        // Formatting helper functions
        static createElement(element: string, params: CreateElementOptions): HTMLElement {
            var dom = document.createElement(element);
            if (params != null) {
                dom.style.width = params["width"] ? params["width"] : dom.style.width;
                dom.style.height = params["height"] ? params["height"] : dom.style.height;

                if (params["colSpan"]) {
                    (<HTMLTableCellElement>dom).colSpan = params["colSpan"];
                }
                if (params["rowSpan"]) {
                    (<HTMLTableCellElement>dom).rowSpan = params["rowSpan"];
                }

                dom.style.lineHeight = params["lineHeight"] ? params["lineHeight"] : dom.style.lineHeight;
                dom.style.cssFloat = params["float"] ? params["float"] : dom.style.cssFloat;

                dom.className = params["class"] ? params["class"] : "";
                if (element != "table" && element != "tr" && element != "iframe") {
                    dom.innerHTML = params["text"] ? params["text"] : "";
                }

                if (params["id"]) {
                    dom.setAttribute("id", params["id"]);
                }
                if (params["type"]) {
                    dom.setAttribute("type", params["type"]);
                }
            }
            return dom;
        }

        static formatNumber(n: number): string {
            var s: string = "";
            var j = 0;
            var num = n.toString();
            for (var i = num.length - 1; i >= 0; i--) {
                s = num.charAt(i) + s;
                if ((j + 1) % 3 == 0 && i != 0)
                    s = "," + s;
                j++;
            }
            return s;
        }

        static createSpace(n: number): string {
            var s: string = "";
            for (var i = 0; i < n; i++) {
                s += "&nbsp";
            }
            return s;
        }
        static decodeUrlPara(): Object {
            var match, pl = /\+/g, // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g, decode = function (s) {
                    return decodeURIComponent(s.replace(pl, " "));
                }, query = window.location.search.substring(1);
            var urlParams = {};
            while (match = search.exec(query))
                urlParams[decode(match[1])] = decode(match[2]);
            return urlParams;
        }

        static getFirstChild(element: HTMLElement): HTMLElement {
            if (element.firstElementChild)
                return <HTMLElement>element.firstElementChild;
            return <HTMLElement>element.childNodes[0];
        }

        static compressAirportName(name: string): string {
            var newName = name.replace("International", "Intl");
            return newName;
        }

        static removeChildren(element: HTMLElement) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    }

    export class DialogUtils {

        static loadBlockingDialog(text: string) {
            if (document.getElementById("blockingDialog")) {
                $("#blockingDialog").dialog("destroy");
                var oldDialog = document.getElementById("blockingDialog");
                while (oldDialog.firstChild) {
                    var tmpDiv = oldDialog.firstChild;
                    oldDialog.removeChild(oldDialog.firstChild);
                    tmpDiv = null;
                }
                document.body.removeChild(oldDialog);
                oldDialog = null;
            }
            var divRoot: HTMLElement = AST.Utils.createElement("div", { "id": "blockingDialog" });
            window.document.body.appendChild(divRoot);

            var dialogText: HTMLElement = AST.Utils.createElement("div", { "text": text });
            dialogText.style.width = "100%";
            dialogText.style.textAlign = "center";
            divRoot.appendChild(dialogText);

            $("#blockingDialog").dialog({
                dialogClass: "no-close",
                closeOnEscape: false,
                modal: true,
                resizable: false,
                height: 70,
                width: 220,
                title: Localization.strings.loading
            });

        }

        static closeBlockingDialog() {
            if (document.getElementById("blockingDialog")) {
                $("#blockingDialog").dialog("close");
            }
        }

        static loadDetailReportDialog(title: string, src: string, options?) {
            var height = "690px", width = "1230px";
            if (options) {
                if (options.height)
                    height = options.height;
                if (options.width)
                    width = options.width;
            }
            if (document.getElementById("dialogAirportReport")) {
                $("#dialogAirportReport").dialog("destroy");
                var oldDialog = document.getElementById("dialogAirportReport");
                while (oldDialog.firstChild)
                    oldDialog.removeChild(oldDialog.firstChild);
                document.body.removeChild(oldDialog);
                oldDialog = null;
            }
            var divRoot: HTMLElement = Utils.createElement("div", { "id": "dialogAirportReport" });
            window.document.body.appendChild(divRoot);
            $("#dialogAirportReport").dialog({
                modal: true,
                resizable: false,
                height: parseInt(height) + 80,
                width: parseInt(width) + 20,
                title: title
            });
            var iframe: HTMLIFrameElement = <HTMLIFrameElement>Utils.createElement("iframe", { "class": "dialogIframe", "height": height, "width": width });
            iframe.src = src;
            divRoot.appendChild(iframe);
            var divBottom: HTMLElement = Utils.createElement("div", { "width": width });
            divBottom.style.marginLeft = "auto";
            divBottom.style.marginRight = "auto";
            divBottom.style.position = "relative";
            var closeButton: HTMLElement = Utils.createElement("button", { "text": AST.Localization.strings.close });
            closeButton.setAttribute("type", "button");
            closeButton.style.position = "absolute";
            closeButton.style.right = "0px";
            closeButton.style.width = "100px";
            closeButton.style.height = "25px";
            closeButton.onclick = function () {
                $("#dialogAirportReport").dialog("close");
            };

            divBottom.appendChild(closeButton);
            divRoot.appendChild(divBottom);
        }

        static launchAirportStat(originAirport: Airport, year: string, availableDataSrc: string) {
            if (!originAirport)
                return;
            var where: string = "iata=" + originAirport.iata;
            where += "&icao=" + originAirport.icao;
            where += "&name=" + originAirport.name;
            where += "&city=" + originAirport.city;
            where += "&country=" + originAirport.country;
            if (year)
                where += "&year=" + year;
            where += "&dataSrc=" + availableDataSrc;
            where += "&locale=" + AST.Localization.getLocale();
            var src = "AirportReport.html?" + where;
            DialogUtils.loadDetailReportDialog(Localization.strings.airportStatistic, src);
        }

        static launchRouteStat(originIata: string, destIata: string, airline: string, year: string) {
            var where: string = "originIata=" + originIata;
            where += "&destIata=" + destIata;
            if (airline)
                where += "&airline=" + airline;
            if (year)
                where += "&year=" + year;
            where += "&locale=" + AST.Localization.getLocale();
            var src = "RouteReport.html?" + where;
            DialogUtils.loadDetailReportDialog(Localization.strings.routeStatistic, src);
        }
    }

    

}