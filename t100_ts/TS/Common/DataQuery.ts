module AST {
    export class DataQuery {
        static ajaxQuery(params: Object, func: string, callback): XMLHttpRequest {
            /// Function that handles the returned AJAX request
            var onRequestStatusChange = function () {
                if (httpRequest.readyState == 4) {
                    var succussRequest = false;

                    // IE9 hack. readyState will remain 4 even the request is aborted
                    // Check whether the request is canceled. If canceled, just return.
                    try {
                        switch (httpRequest.status) {
                            case 200:
                                succussRequest = true;
                                break;
                            default:
                                break;
                        }
                    }
                    catch (err) {
                        err;
                    }

                    if (succussRequest) {
                        var xDoc = httpRequest.responseXML;

                        try {
                            var jsonMsg = "";
                            for (var i = 0; i < xDoc.getElementsByTagName('string')[0].childNodes.length; i++) {
                                jsonMsg += xDoc.getElementsByTagName('string')[0].childNodes[i].nodeValue;
                            }
                            if (callback)
                                callback(jsonMsg);

                        } catch (e) {
                            e;
                        }
                    }
                    httpRequest = null;
                }
            };

            var httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = onRequestStatusChange;
            //httpRequest.timeout = 25000;
            var url = "../ASTData.asmx/" + func;
            httpRequest.open("POST", url, true);
            httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            var requestData = "";
            for (var key in params) {
                if (requestData != "")
                    requestData += "&";
                requestData += key + "=" + params[key];
            }
            httpRequest.send(requestData);
            return httpRequest;
        }
        
        static queryDestByOrigin(year: string, origin: string, airline: string, queryType: string, dataSrc: string, callback: (fromAirport: Airport, destinations: Array<DestInfo>) => any) {
            var onSuccessCallback = function (jsonMsg) {
                setTimeout(function () { DialogUtils.closeBlockingDialog(); }, 150);

                var destinations: Array<DestInfo> = [];
                if (jsonMsg == "") {
                    callback(null, []);
                    return;
                }
                jsonMsg = $.parseJSON(jsonMsg);
                var fromAirport: Airport = new Airport(jsonMsg["fromAirport"]["Icao"], jsonMsg["fromAirport"]["Iata"],
                    jsonMsg["fromAirport"]["Country"], jsonMsg["fromAirport"]["City"], jsonMsg["fromAirport"]["FullName"],
                    jsonMsg["fromAirport"]["Geometry"]);
                fromAirport.countryEn = jsonMsg["fromAirport"]["CountryEn"];
                fromAirport.cityEn = jsonMsg["fromAirport"]["CityEn"];
                fromAirport.nameEn = jsonMsg["fromAirport"]["FullNameEn"];

                var lstDestJson = jsonMsg["routes"];
                for (var i = 0; i < lstDestJson.length; i++) {
                    var dest = new DestInfo();
                    var airportJson = lstDestJson[i]["Airport"];
                    var destPoint = new AST.Point(
                        parseFloat(airportJson["Geometry"].split(",")[0]),
                        parseFloat(airportJson["Geometry"].split(",")[1])
                        );
                    dest.airport = new Airport(
                        airportJson["Icao"],
                        airportJson["Iata"],
                        airportJson["Country"],
                        airportJson["City"],
                        airportJson["FullName"],
                        destPoint
                        );
                    dest.airport.countryEn = airportJson["CountryEn"];
                    dest.airport.cityEn = airportJson["CityEn"];
                    dest.airport.nameEn = airportJson["FullNameEn"];
                    dest.routeGeomS = lstDestJson[i]["RouteGeometry"];

                    for (var j = 0; j < lstDestJson[i]["AvailableData"].length; j++) {
                        var dataItem = new DataSrcDestInfo(
                            lstDestJson[i]["AvailableData"][j]["DataSource"],
                            parseInt(lstDestJson[i]["AvailableData"][j]["TotalPax"]),
                            parseInt(lstDestJson[i]["AvailableData"][j]["TotalFreight"]),
                            lstDestJson[i]["AvailableData"][j]["PartialData"],
                            lstDestJson[i]["AvailableData"][j]["NoData"]
                            );
                        dest.availableData.push(dataItem);
                    }
                    destinations.push(dest);
                }
                if (callback != null)
                    callback(fromAirport, destinations);

            };
            var params = { "year": year, "origin": origin, "dest": "", "airline": airline, "queryType": queryType, "dataSource": dataSrc, "locale": Localization.locale };
            var http = AST.DataQuery.ajaxQuery(params, "QueryByOrigin", onSuccessCallback);
            setTimeout(function () {
                if (http.readyState != 4 || http.status != 200)
                    DialogUtils.loadBlockingDialog(Localization.strings.searchingAirportAndLoadingInfo);
            }, 150);

        }

        static queryAvailableAirlineByDataSrc(dataSrc: string, callback: (data: any) => any) {
            var onSuccessCallback = function (jsonMsg) {
                setTimeout(function () { DialogUtils.closeBlockingDialog(); }, 500);
                var data: Array<Airline> = [];
                if (jsonMsg == "") {
                    return;
                }
                jsonMsg = $.parseJSON(jsonMsg);
                for (var i = 0; i < jsonMsg.length; i++) {
                    var item: Airline = new Airline(jsonMsg[i][0],
                        jsonMsg[i][1], jsonMsg[i][2], jsonMsg[i][3],
                        jsonMsg[i][4], jsonMsg[i][5]);
                    data.push(item);
                }
                if (callback != null)
                    callback(data);
            };
            var params = { "dataSrc" : dataSrc, "locale": Localization.locale };
            DataQuery.ajaxQuery(params, "QueryAvailableAirlines", onSuccessCallback);
            DialogUtils.loadBlockingDialog(Localization.strings.applicationLoadingData);
        }

        static queryAirportYearAvailability(airport: string, dataSrc: string) {
            var deferred = $.Deferred();
            var onSuccessCallback = function (jsonMsg) {
                jsonMsg == "" ? deferred.resolve(null) : deferred.resolve($.parseJSON(jsonMsg));
            };
            var params = {
                "airportCode": airport, "codeType": "", "dataSrc": dataSrc, "locale": Localization.locale
            };
            DataQuery.ajaxQuery(params, "QueryAirportYearAvailability", onSuccessCallback);
            return deferred.promise();
        }

        static queryAirportAvailableDataSource(airportCode: string) {
            var deferred = $.Deferred();
            var onSuccessCallback = function (jsonMsg) {
                jsonMsg == "" ? deferred.resolve(null) : deferred.resolve($.parseJSON(jsonMsg));
            };
            var params = {
                "airportCode": airportCode, "locale": Localization.locale
            };
            DataQuery.ajaxQuery(params, "QueryAirportAvailableDataSource", onSuccessCallback);
            return deferred.promise();
        }

        static QueryAirlineYearAvailability(dataSrc: string, airline: string, callback: (jsonMsg: any) => any) {
            var onSuccessCallback = function (jsonMsg) {
                if (jsonMsg == "") 
                    callback(null);
                else
                    callback(jsonMsg);
            };
            var params = {
                "dataSrc": dataSrc, "airline": airline, "locale": Localization.locale
            };
            DataQuery.ajaxQuery(params, "QueryAirlineYearAvailability", onSuccessCallback);
        }

        static queryAirportStat(dataSrc, year, airport, callback: (data: any) => any) {
            var onSuccessCallback = function (jsonMsg) {
                var data = [];
                if (jsonMsg == "") {
                    return;
                }
                jsonMsg = $.parseJSON(jsonMsg);
                if (callback != null)
                    callback(jsonMsg);

            };
            var params = { "dataSrc": dataSrc, "year": year, "airport": airport, "locale": Localization.locale };
            AST.DataQuery.ajaxQuery(params, "QueryAirportStat", onSuccessCallback);
        }

        static queryAirportTimeSeries(dataSrc: string, airport: string, callback: (jsonMsg: any) => any) {
            var onSuccessCallback = function (jsonMsg) {
                if (jsonMsg == "") {
                    return;
                }
                jsonMsg = $.parseJSON(jsonMsg);
                if (callback != null)
                    callback(jsonMsg);

            };
            var params = { "dataSrc": dataSrc, "origin": airport, "locale": Localization.locale };
            DataQuery.ajaxQuery(params, "QueryAirportTimeSeries", onSuccessCallback);
        }
    }
}