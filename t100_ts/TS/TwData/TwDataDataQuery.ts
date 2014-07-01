module AST {
    export module TwData {
        export class TwDataQuery {
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
                        route.monthFreight = [];

                        data.push(route);
                    }
                    var distInfo = new DistInfo(jsonObj["distKm"], jsonObj["distNm"], jsonObj["distMile"]);

                    if (callback != null)
                        callback(data, distInfo);

                };
                var params = { "year": year, "origin": origin, "dest": dest, "locale": Localization.locale };
                DataQuery.ajaxQuery(params, "TwDataQueryByRoute", onSuccessCallback);
            }
        }
    }
} 