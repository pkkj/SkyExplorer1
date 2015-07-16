module AST {
    export module T100 {
        export class T100DataQuery {            

            static queryRoute(year: string, origin: string, dest: string, callback: (data: Array<RouteRecord>, distInfo: DistInfo) => any) {
                var onSuccessCallback = function (jsonText: string) {
                    var data = [];
                    if (jsonText == "") {
                        return;
                    }
                    var jsonObj: Object = $.parseJSON(jsonText);
                    for (var i = 0; i < jsonObj["routes"].length; i++) {
                        var route = new RouteRecord();
                        route.airline = jsonObj["routes"][i]["AIRLINE"];
                        route.departure = parseInt(jsonObj["routes"][i]["DEPARTURE"]);
                        route.pax = parseInt(jsonObj["routes"][i]["PAX"]);
                        route.freight = parseInt(jsonObj["routes"][i]["FREIGHT"]);
                        route.monthDeparture = <Array<number>>$.parseJSON(jsonObj["routes"][i]["MONTH_DEPARTURE"]);
                        route.monthPax = <Array<number>>$.parseJSON(jsonObj["routes"][i]["MONTH_PAX"]);
                        route.monthFreight = <Array<number>>$.parseJSON(jsonObj["routes"][i]["MONTH_FREIGHT"]);

                        data.push(route);
                    }
                    var distInfo = new DistInfo(jsonObj["distKm"], jsonObj["distNm"], jsonObj["distMile"]);

                    if (callback != null)
                        callback(data, distInfo);

                };
                var params = { "year": year, "origin": origin, "dest": dest, "locale": Localization.locale };
                DataQuery.ajaxQuery(params, "T100QueryByRoute", onSuccessCallback);
            }

            static queryAirlineRoute(year, airline, region, callback: (data: any) => any) {
                var onSuccessCallback = function (jsonMsg) {
                    setTimeout(function () { DialogUtils.closeBlockingDialog(); }, 150);
                    if (jsonMsg == "") {
                        return;
                    }
                    var data = <Array<any>>$.parseJSON(jsonMsg);
                    if (callback != null)
                        callback(data);
                };
                var params = { "year": year, "airline": airline, "region": region, "limit": 400, "locale": Localization.locale };
                var http = AST.DataQuery.ajaxQuery(params, "QueryByAirlines", onSuccessCallback);
                setTimeout(function () {
                    if (http.readyState != 4 || http.status != 200)
                        DialogUtils.loadBlockingDialog(Localization.strings.searchingAirlineAndLoadingInfo);
                }, 150);
            }

            static queryRouteAircraftStat(year, origin, dest, callback: (data: any) => any) {
                var onSuccessCallback = function (jsonMsg) {
                    if (jsonMsg == "")
                        return;

                    var data = $.parseJSON(jsonMsg);
                    if (callback != null)
                        callback(data);
                };
                var params = { "year": year, "origin": origin, "dest": dest, "locale": Localization.locale };
                DataQuery.ajaxQuery(params, "QueryRouteAircraftStat", onSuccessCallback);
            }

        }
    }
}