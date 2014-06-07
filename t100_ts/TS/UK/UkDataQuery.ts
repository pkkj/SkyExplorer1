module AST {
    export module UkData {
        export class UkDataQuery {
            static queryRoute(year: string, origin: string, dest: string, callback: (data: Array<RouteRecord>, distInfo: DistInfo) => any) {
                var onSuccessCallback = function (jsonText: string) {
                    var data = [];
                    if (jsonText == "") {
                        return;
                    }
                    var jsonObj: Object = $.parseJSON(jsonText);
                    for (var i = 0; i < jsonObj["routes"].length; i++) {
                        var route = new RouteRecord();
                        route.pax = parseInt(jsonObj["routes"][i]["TOTAL_PAX"]);
                        route.monthPax = <Array<number>>$.parseJSON(jsonObj["routes"][i]["MONTH_PAX"]);
                        data.push(route);
                    }
                    var distInfo = new DistInfo(jsonObj["distKm"], jsonObj["distNm"], jsonObj["distMile"]);

                    if (callback != null)
                        callback(data, distInfo);

                };
                var params = { "year": year, "origin": origin, "dest": dest, "locale": Localization.locale };
                DataQuery.ajaxQuery(params, "UkDataQueryByRoute", onSuccessCallback);
            }
        }
    }
}