/// <reference path="../T100/T100Common.ts"/>
module AST {
    export class T100OriginPanel {
        // Controls, the DOMElement in the page
        private _airportName: HTMLElement = null;
        private _airportCity: HTMLElement = null;
        private _originAirportTitleBar: HTMLElement = null;
        private _dataSrcSel: HTMLElement = null;
        private _yearSel: HTMLElement = null;
        private _destSel: HTMLElement = null;
        private _txtOriginAirport: HTMLInputElement = null;
        private _btnFindAirport: HTMLButtonElement = null;
        private _labelFlowDir: HTMLElement = null;

        private _flowDir: FlowDirection = FlowDirection.From;

        // DropDown control
        private yearDropDown: DropDown = null;
        private destDropDown: DropDown = null;

        // Public event
        public onDestChange = null;
        public onOriginChange = null;

        // Pointer to other objects
        public destPanelBuddy: T100AirportPanel = null;
        public originDialogBuddy: PinPanel = null;
        public destDialogBuddy: PinPanel = null;
        public airportContent: T100AirportContent = null;

        // Airline selector
        public airlineSelector: HTMLSelectElement = null;
        public airlineSelectorReady = false;
        public ffRouteFilterDiv: HTMLElement = null;
        public ffRouteFilter: HTMLInputElement = null;

        constructor() {
        }

        private setDataSrcAvailability() {
            this.yearDropDown.clearAllItem();
            for (var i = 0; i < T100.T100DataMeta.availablity.length; i++) {
                var year = T100.T100DataMeta.availablity[i];
                var item = this.yearDropDown.createItem(year);
                this.yearDropDown.insertItem(item, year);
            }
            this.yearDropDown.setSelectedIndex(0);
        }

        private initUI() {

            this.yearDropDown = new DropDown(this._yearSel, {
                "titleWidth": 72,
                "containerMaxHeight": 500
            });
            this.yearDropDown.onChangeHandler = () => {
                GlobalStatus.year = this.yearDropDown.selectedData;
                if (T100.T100DataMeta.has28ISFFData(parseInt(this.yearDropDown.selectedData)))
                    this.ffRouteFilterDiv.style.display = "block";
                else
                    this.ffRouteFilterDiv.style.display = "none";
                this.updateDestList(true /*panTo*/);
            };

            this.ffRouteFilter.onclick = () => {
                this.updateDestList(false /*panTo*/);
            };
            this.setDataSrcAvailability();

            this.destDropDown = new DropDown(this._destSel, {
                "titleWidth": 305,
                "containerMaxHeight": 500
            });

            this.destDropDown.onChangeHandler = () => {
                GlobalStatus.destAirport = this.destDropDown.selectedData;
                GlobalStatus.year = this.yearDropDown.selectedData;
                GlobalStatus.flowDir = this._flowDir;

                var currentDataView = this.destPanelBuddy;
                // Trigger the onDestChange
                if (currentDataView && currentDataView.onDestChange) {
                    currentDataView.onDestChange();
                }

                this.destDialogBuddy.show();
                if (this.onDestChange) {
                    this.onDestChange();
                }
            };
            this.destDropDown.enable = false;

            var btnFindAirport_onclick = () => {
                var iata = this._txtOriginAirport.value.toUpperCase();
                this.queryOriginAirport(iata, QueryAirportType.Iata, true /*panTo*/);
            };

            // Find airport button
            this._txtOriginAirport.onkeypress = (e) => {
                if (e.keyCode == 13) {
                    btnFindAirport_onclick();
                }
            };


            $("#dataSrcPanelFindAirportBtn").button().click((event) => {
                btnFindAirport_onclick();
                //event.preventDefault();
            });


            $("#dataSrcPanelFindAirport").autocomplete({
                source: function (request, response) {
                    $.ajax({
                        url: "../ASTData.asmx/MatchAirport",
                        data: "input=" + request.term,
                        type: "POST",

                        success: function (data) {

                            data = $.parseJSON(data.childNodes[0].textContent);
                            response($.map(data, function (item) {

		                    return {
                                    label: item[0] + ", " + item[1] + ", " + item[2],
                                    value: item[0]
                                }
		                }));
                        }
                    });
                },
                minLength: 2,
                open: () => {
                    $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
                },
                close: () => {
                    $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
                }
            });

            // init the airline selector
            this.initAirlineFilter();

            // localize the ui
            this.localizeUi();
        }

        private localizeUi() {
            $("#dataSrcPanelFindAirportBtn").button("option", "label", Localization.strings.search);
            document.getElementById("t100OriginBarAirportLabel").innerHTML = Localization.strings.airport;
            document.getElementById("t100OriginBarYearLabel").innerHTML = Localization.strings.year;
            this._labelFlowDir.innerHTML = Localization.strings.destinations;

        }
        private clearOriginAirport() {
            GlobalStatus.originAirport = null;
            this.destDropDown.clearAllItem();
            this.destDropDown.enable = false;
            this.originDialogBuddy.setTitleText(Localization.strings.pleaseSelectInputOrigin);
            this.destDialogBuddy.hide();
            this._labelFlowDir.innerHTML = Localization.strings.destinations;
            this.setOriginAirport(null);
        }

        public queryOriginAirport(keyword, queryAirportType, panTo: boolean) {

            var currentDataQuery = T100.T100DataQuery;
            if (currentDataQuery && currentDataQuery.queryDestByOrigin) {
                var callback = (fromAirport: Airport, allAirports: Array<DestInfo>) => {

                    if (!fromAirport) {
                        this.clearOriginAirport();
                        return;
                    }
                    GlobalStatus.originAirport = fromAirport;

                    var airports: Array<DestInfo> = [];
                    var hasFFRoute = false, hasNoDataRoute = false;
                    for (var i = 0; i < allAirports.length; i++) {
                        // Handle the geomtry
                        allAirports[i].routeGeomO = AST.MapUtils.parseMultiLineString(allAirports[i].routeGeomS);
                        allAirports[i].airport.geomO = new OpenLayers.Geometry.Point(allAirports[i].airport.geom.x, allAirports[i].airport.geom.y).transform(AST.MapUtils.projWGS84, AST.MapUtils.projMercator);
                        if (allAirports[i].dataSource == "CAA") {
                            airports.push(allAirports[i]);
                            hasNoDataRoute = true
                        } else {
                            if (!this.ffRouteFilter.checked && GlobalStatus.originAirport.countryEn != T100.T100DataMeta.currentCountry) {
                                if (allAirports[i].airport.countryEn == T100.T100DataMeta.currentCountry)
                                    airports.push(allAirports[i]);
                            } else {
                                airports.push(allAirports[i]);
                            }
                            if (this.ffRouteFilter.checked && GlobalStatus.originAirport.countryEn != T100.T100DataMeta.currentCountry &&
                                allAirports[i].airport.countryEn != T100.T100DataMeta.currentCountry)
                                hasFFRoute = true;
                        }
                    }
                    this.airportContent.setRouteLegend({ hasFFRoute: hasFFRoute, hasNoDataRoute: hasNoDataRoute });

                    this.destDialogBuddy.hide();
                    if (panTo) {
                        this.destPanelBuddy.mapBuddy.panTo(fromAirport.geom);
                    }
                    this.destDropDown.clearAllItem();

                    this.destPanelBuddy.updateMap(airports);
                    if (this._flowDir == FlowDirection.From) {
                        this._labelFlowDir.innerHTML = Localization.strings.constructDestNum(airports.length);
                    }
                    else {
                        this._labelFlowDir.innerHTML = Localization.strings.constructOriginNum(airports.length);
                    }

                    this.setOriginAirport(fromAirport);

                    var airportWithData: Array<DestInfo> = [];
                    for (var i = 0; i < airports.length; i++) {
                        if (airports[i].dataSource == "T100") {
                            airportWithData.push(airports[i]);
                        }
                    }

                    if (airportWithData.length == 0) {
                        GlobalStatus.destAirport = null;
                        // TODO: add some hint here that there is not destination
                        this.destDropDown.setDefaulTitleText(Localization.strings.noAvailableDataInThisYear);
                        this.destDropDown.enable = false;
                        return;
                    }

                    this.destDropDown.enable = true;
                    this.createDestList(airportWithData);

                    // Try to navigate to the dest airport, if exist
                    this.changeDestAirport();
                    if (this.onOriginChange != null) {
                        this.onOriginChange();
                    }

                };
                this.destPanelBuddy.mapBuddy.clearDestFeatures();
                this.destDropDown.setDefaulTitleText(Localization.strings.pleaseSelectAirport);

                var airline = this.airlineSelector[this.airlineSelector.selectedIndex].airline.code;
                if (airline == null)
                    airline = "";
                currentDataQuery.queryDestByOrigin(GlobalStatus.year, keyword, airline, queryAirportType, callback);
            }
        }

        private setOriginAirport(airport: Airport) {
            if (airport) {
                this._originAirportTitleBar.style.display = "block";
                this.airportContent.resize();
                var titleText = document.createElement("span");
                if (this._flowDir == FlowDirection.From) {
                    titleText.innerHTML = "<b>" +Localization.strings.from + " : </b> " + airport.iata + " / " + airport.icao;
                }
                else {
                    titleText.innerHTML = "<b>" + Localization.strings.to + " : </b> " + airport.iata + " / " + airport.icao;
                }
                titleText.innerHTML += " &nbsp;&nbsp;&nbsp;&nbsp;"
                var detailReportButton: HTMLAnchorElement = <HTMLAnchorElement> Utils.createElement("a", { "text": "(" + Localization.strings.airportDetailReport + ")", "id": "t100AirportDetailReportBtn" });
                detailReportButton.href = "#";
                detailReportButton.onclick = () => {
                    if (!GlobalStatus.originAirport)
                        return;
                    T100.T100Common.launchAirportStat(GlobalStatus.originAirport, GlobalStatus.year);
                };
                var titleBar = document.createElement("div");
                titleBar.appendChild(titleText);
                titleBar.appendChild(detailReportButton);
                this.originDialogBuddy.setTitleBar(titleBar);

                this._airportName.innerHTML = Utils.compressAirportName(airport.name);
                this._airportName.title = airport.nameEn;
                this._airportCity.innerHTML = Localization.strings.constructPlaceName(airport.country, airport.city);
                this._airportCity.title = airport.cityEn + ", " +  airport.countryEn;

            }
            else {
                this._originAirportTitleBar.style.display = "none";
                this._airportName.innerHTML = "";
                this._airportCity.innerHTML = "";
            }
        }

        public changeDestAirport() {
            if (GlobalStatus.destAirport != null) {
                var destIndex = -1;
                for (var i = 0; i < this.destDropDown.dataItems.length && destIndex == -1; i++) {
                    if (!this.destDropDown.dataItems[i])
                        continue;
                    if (this.destDropDown.dataItems[i].iata == GlobalStatus.destAirport.iata) {
                        destIndex = i;
                    }
                }
                if (destIndex == -1)
                    GlobalStatus.destAirport = null;
                else {
                    this.destDialogBuddy.show();
                    this.destDropDown.setSelectedIndex(destIndex);
                }
            }
        }

        private updateDestList(panTo: boolean) {
            if (GlobalStatus.originAirport)
                this.queryOriginAirport(GlobalStatus.originAirport.iata, AST.QueryAirportType.Iata, panTo);
        }

        private createDestList(destinations: Array<DestInfo>) {
            var curDataView = this.destPanelBuddy;
            if (!curDataView || !curDataView.createAirportItem)
                return;
            var compareAirport = function (a: DestInfo, b: DestInfo) {
                if (a.airport.country != b.airport.country) {
                    if (a.airport.country == AST.GlobalStatus.originAirport.country)
                        return -1;
                    if (b.airport.country == AST.GlobalStatus.originAirport.country)
                        return 1;
                    return Localization.strings.compareStr( a.airport.country , b.airport.country);
                }
                return Localization.strings.compareStr(a.airport.city, b.airport.city);
            };

            destinations.sort(compareAirport);

            var preCountry = "";
            for (var i = 0; i < destinations.length; i++) {
                if (destinations[i].airport.country != preCountry) {
                    preCountry = destinations[i].airport.country;
                    var item = document.createElement("div");
                    item.innerHTML = preCountry;
                    item.className = "ddCountry";
                    this.destDropDown.insertItem(item, null, {
                        "selectable": false
                    });
                }
                this.destDropDown.insertItem(curDataView.createAirportItem(destinations[i]), destinations[i].airport);
            }
            this.destDropDown.setDefaulTitleText(Localization.strings.pleaseSelectAirport);
        }

        public reset() {
            this.clearOriginAirport();
            this.airlineSelector.selectedIndex = 0;
        }

        private initAirlineFilter() {
            this.airlineSelectorReady = false;
            this.airlineSelector.onchange = () => {
                if (this.airlineSelectorReady) {
                    this.updateDestList(false /*panTo*/);
                }
            };

            this.createAirlineSelector();
            this.airlineSelectorReady = true;

            // Localization
            document.getElementById("t100AirlineFilterRouteFilterText").innerHTML = Localization.strings.routeFilter;
            document.getElementById("t100AirlineFilterFilterTheRouteText").innerHTML = Localization.strings.filterRouteByAirline;
            document.getElementById("t100AirlineFilterShowForeignRouteText").innerHTML = Localization.strings.showForeignRouteForUsCarriers;
            document.getElementById("t100AirlineFilterRouteDashLineText").innerHTML = Localization.strings.thisRoutesWillBeShownAsDashLines;

        }

        private createAirlineSelector() {
            this.airlineSelector.options.length = 0;

            var optionAll: any = document.createElement("option");
            optionAll.text = Localization.strings.all;
            optionAll.airline = { code: "" };
            this.airlineSelector.add(optionAll, null);

            for (var i = 0; i < T100.T100DataMeta.airlineInfo.length; i++) {
                var option: any = document.createElement("option");
                option.text = T100.T100DataMeta.airlineInfo[i].name;
                option.airline = T100.T100DataMeta.airlineInfo[i];
                this.airlineSelector.add(option, null);
            }
        }

        // Create the panel and setting the DOM elements
        static createT100OriginPanel(): T100OriginPanel {
            var dataSrcPanel = new T100OriginPanel();
            // Assign the div elements
            dataSrcPanel._airportName = document.getElementById("t100OriginPanelAirportName");
            dataSrcPanel._airportCity = document.getElementById("t100OriginPanelCityName");
            dataSrcPanel._originAirportTitleBar = document.getElementById("t100AirportOriginAirportTitleBar");
            dataSrcPanel._labelFlowDir = document.getElementById("dataSrcPanelFlowDir");
            dataSrcPanel._yearSel = document.getElementById("dataSrcPanelYearSel");
            dataSrcPanel._destSel = document.getElementById("dataSrcPanelDestSel");
            dataSrcPanel._txtOriginAirport = <HTMLInputElement> document.getElementById("dataSrcPanelFindAirport");
            dataSrcPanel._btnFindAirport = <HTMLButtonElement> document.getElementById("dataSrcPanelFindAirportBtn");
            dataSrcPanel.airlineSelector = <HTMLSelectElement>document.getElementById("t100AirportContentAirlineSelector");
            dataSrcPanel.ffRouteFilterDiv = document.getElementById("t100AirportContentFFRouteDiv");
            dataSrcPanel.ffRouteFilter = <HTMLInputElement> document.getElementById("t100AirportFFRouteFilter");

            dataSrcPanel.initUI();
            return dataSrcPanel;
        }
    }

}