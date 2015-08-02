module AST {
    export class OriginPanel {
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

        // Dest
        private destAirportName: HTMLElement = null;
        private destAirportCity: HTMLElement = null;
        private destBarAvailableDataSrc: HTMLElement = null;
        private curDataSrc = "";

        private _flowDir: FlowDirection = FlowDirection.From;

        // DropDown control
        private yearDropDown: DropDown = null;
        private destDropDown: DropDown = null;

        // Public event
        public onOriginChange = null;

        // Pointer to other objects

        public originDialogBuddy: PinPanel = null;
        public destDialogBuddy: PinPanel = null;
        public airportContent: AirportContent = null;


        // Airline selector
        public airlineSelector: HTMLSelectElement = null;
        public airlineSelectorReady = false;
        public ffRouteFilterDiv: HTMLElement = null;
        public ffRouteFilter: HTMLInputElement = null;

        // MapControl
        public mapControl: MapControl = null;

        // DestBars
        private dictDestPanel = {};

        constructor(airportContent: AirportContent) {
            this.airportContent = airportContent;
        }

        private setDataSrcAvailability() {
            this.yearDropDown.clearAllItem();
            for (var i = 0; i < GlobalMetaData.availablity.length; i++) {
                var year = GlobalMetaData.availablity[i];
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
                this.airportContent.updateDataSrcEnable(GlobalStatus.year);
                this.updateDestList(true /*panTo*/);
            };

            this.setDataSrcAvailability();

            this.destDropDown = new DropDown(this._destSel, {
                "titleWidth": 245,
                "containerMaxHeight": 500
            });

            this.destDropDown.onChangeHandler = () => {
                GlobalStatus.destAirport = this.destDropDown.selectedData.airport;
                GlobalStatus.year = this.yearDropDown.selectedData;
                GlobalStatus.flowDir = this._flowDir;

                // Trigger the onDestChange
                this.onDestChange(this.destDropDown.selectedData);

                this.destDialogBuddy.show();

            };
            this.destDropDown.enable = false;

            var btnFindAirport_onclick = () => {
                var code = this._txtOriginAirport.value.toUpperCase();
                this.queryOriginAirport(code, QueryAirportType.Code, GlobalStatus.dataSource, true /*panTo*/);
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
                        data: "input=" + request.term + "&locale=" + Localization.locale,
                        type: "POST",

                        success: function (data) {

                            data = $.parseJSON(data.childNodes[0].textContent);
                            response($.map(data, function (item) {
                                var city = City.parseCity(item[1]);
                                return {
                                    label: item[0] + ", " + Localization.strings.constructPlaceName(city.country, city.subdiv, city.city),
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
            (<HTMLInputElement> document.getElementById("dataSrcPanelFindAirport")).placeholder = Localization.strings.searchAirport;
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

        private onDestChange(dest: DestInfo) {
            var availableData = {};
            for (var i = 0; i < dest.availableData.length; i++) {
                availableData[dest.availableData[i].dataSrcName] = true;
            }

            if (availableData["T100Data"]) {
                this.switchDestBar("T100Data");
            } else if (availableData["T100FF"]) {
                this.switchDestBar("T100FF");
            } else if (availableData["TaiwanData"]) {
                this.switchDestBar("TaiwanData");
            } else if (availableData["UkData"]) {
                this.switchDestBar("UkData");
            } else if (availableData["JapanData"]) {
                this.switchDestBar("JapanData");
            } else if (availableData["KoreaData"]) {
                this.switchDestBar("KoreaData");
            } else if (availableData["ConnectionData"]) {
                this.switchDestBar("ConnectionData");
            }
        }

        private createOtherSrcDiv() {
            var otherDataSrc = [];
            var dest = this.destDropDown.selectedData;
            for (var i = 0; i < dest.availableData.length; i++) {
                if (dest.availableData[i].dataSrcName == this.curDataSrc)
                    continue;
                otherDataSrc.push(dest.availableData[i].dataSrcName);
            }

            Utils.removeChildren(this.destBarAvailableDataSrc);
            if (otherDataSrc.length > 0) {
                this.destBarAvailableDataSrc.appendChild(Utils.createElement("span", { "text": Localization.strings.viewDataFromOtherSourcesForThisRoute }));
                for (var i = 0; i < otherDataSrc.length; i++) {
                    var dataSrcName = otherDataSrc[i];
                    if (i > 0)
                        this.destBarAvailableDataSrc.appendChild(Utils.createElement("span", { "text": ", " }));
                    var info: DataSourceMetaData = DataSourceRegister.queryInfo(dataSrcName);
                    var anchor: HTMLAnchorElement = <HTMLAnchorElement>Utils.createElement("a", { "text": info.getShortInfoLocalizeName() });
                    anchor.href = "#";
                    anchor.onclick = () => {
                        this.switchDestBar(dataSrcName);
                    };
                    this.destBarAvailableDataSrc.appendChild(anchor);
                }
            }
        }

        private switchDestBar(dataSrc: string) {
            this.curDataSrc = dataSrc;
            for (var key in this.dictDestPanel) {
                this.dictDestPanel[key].hide();
            }
            var flowDir;
            if (AST.GlobalStatus.flowDir == AST.FlowDirection.To)
                flowDir = AST.FlowDirection.From;
            else
                flowDir = AST.FlowDirection.To;

            this.dictDestPanel[dataSrc].show();
            this.dictDestPanel[dataSrc].onDestChange();
            var info: DataSourceMetaData = DataSourceRegister.queryInfo(dataSrc);
            this.setDestAirportInfo(AST.GlobalStatus.destAirport, flowDir, info.getFullInfoLocalizeName());
            this.createOtherSrcDiv();

        }

        public registerDestBar(dataSrc: string, destPanel) {
            this.dictDestPanel[dataSrc] = destPanel;
        }

        public queryOriginAirport(keyword, queryAirportType, dataSrc: string, panTo: boolean) {

            var callback = (fromAirport: Airport, destinations: Array<DestInfo>) => {

                if (!fromAirport) {
                    this.clearOriginAirport();
                    return;
                }
                GlobalStatus.originAirport = fromAirport;

                var hasPartialDataRoute: boolean = false;
                var hasNoDataRoute: boolean = false;
                var supportAirportReportPage: boolean = false;
                for (var i = 0; i < destinations.length; i++) {
                    // Handle the geomtry
                    destinations[i].routeGeomO = AST.MapUtils.parseMultiLineString(destinations[i].routeGeomS);
                    destinations[i].airport.geomO = new OpenLayers.Geometry.Point(destinations[i].airport.geom.x, destinations[i].airport.geom.y).transform(AST.MapUtils.projWGS84, AST.MapUtils.projMercator);
                    var isPartialDataDest: boolean = true;
                    for (var j = 0; j < destinations[i].availableData.length; j++) {
                        isPartialDataDest = isPartialDataDest && destinations[i].availableData[j].partialData;
                        hasNoDataRoute = hasNoDataRoute || destinations[i].availableData[j].noData;
                        supportAirportReportPage = supportAirportReportPage || DataSourceRegister.queryInfo(destinations[i].availableData[j].dataSrcName).supportAirportReportPage;
                    }
                    hasPartialDataRoute = hasPartialDataRoute || isPartialDataDest;
                }

                this.airportContent.setRouteLegend({ hasPartialDataRoute: hasPartialDataRoute, hasNoDataRoute: hasNoDataRoute });
                this.destDialogBuddy.hide();
                if (panTo) {
                    this.mapControl.panTo(fromAirport.geom);
                }
                this.destDropDown.clearAllItem();

                this.updateMap(destinations);
                if (this._flowDir == FlowDirection.From) {
                    //this._labelFlowDir.innerHTML = Localization.strings.constructDestNum(destinations.length);
                }
                else {
                    //this._labelFlowDir.innerHTML = Localization.strings.constructOriginNum(destinations.length);
                }

                this.setOriginAirport(fromAirport);
                this.createOriginTitleBar(AST.GlobalStatus.originAirport, supportAirportReportPage);
                if (destinations.length == 0) {
                    GlobalStatus.destAirport = null;
                    // TODO: add some hint here that there is not destination
                    this.destDropDown.setDefaulTitleText(Localization.strings.noAvailableDataInThisYear);
                    this.destDropDown.enable = false;
                    return;
                }

                this.destDropDown.enable = true;
                this.createDestList(destinations);

                // Try to navigate to the dest airport, if exist
                this.changeDestAirport();
                if (this.onOriginChange != null) {
                    this.onOriginChange();
                }

            };
            this.mapControl.clearDestFeatures();
            this.destDropDown.setDefaulTitleText(Localization.strings.pleaseSelectAirport);

            var airline = this.airlineSelector[this.airlineSelector.selectedIndex].airline.code;
            if (airline == null)
                airline = "";
            DataQuery.queryDestByOrigin(GlobalStatus.year, keyword, airline, queryAirportType, dataSrc, callback);

        }

        private createOriginTitleBar(airport: Airport, showReportPage: boolean = false) {
            var titleText = document.createElement("span");
            if (this._flowDir == FlowDirection.From) {
                titleText.innerHTML = "<b>" + Localization.strings.from + " : </b> " + airport.iata + " / " + airport.icao;
            }
            else {
                titleText.innerHTML = "<b>" + Localization.strings.to + " : </b> " + airport.iata + " / " + airport.icao;
            }
            titleText.innerHTML += " &nbsp;&nbsp;&nbsp;&nbsp;"

            var titleBar = document.createElement("div");
            titleBar.appendChild(titleText);

            if (showReportPage) {
                var detailReportButton: HTMLAnchorElement = <HTMLAnchorElement> Utils.createElement("a", { "text": "(" + Localization.strings.airportDetailReport + ")", "id": "t100AirportDetailReportBtn" });
                detailReportButton.href = "#";
                detailReportButton.onclick = () => {
                    if (!GlobalStatus.originAirport)
                        return;
                    // TODO: Get the real available data src data.
                    DialogUtils.launchAirportStat(GlobalStatus.originAirport, GlobalStatus.year, "");
                };
                titleBar.appendChild(detailReportButton);
            }
            //titleBar.innerHTML = '<div id="t100AirportOriginAirportTitleBar" style="display: block;">  <img style="border: 1px solid rgb(128, 128, 128); border-image: none; float: left;" src="../Images/Icon/depart.gif"></img>         <div style="width: 275px; margin-left: 8px; float: left;" >            <div id="t100OriginPanelAirportName">From: Salt Lake City Intl Airport</div>            <div id= "t100OriginPanelCityName" style="color:white"> SLC / KSLC - Salt Lake City, UT, United States</div>            </div>            <div class="clear" > </div>            </div>';
            this.originDialogBuddy.setTitleBar(titleBar);
        }

        private setOriginAirport(airport: Airport) {
            if (airport) {
                this._originAirportTitleBar.style.display = "block";
                this.airportContent.resize();

                this.createOriginTitleBar(airport);

                this._airportName.innerHTML = Utils.compressAirportName(airport.name);
                var country = GlobalMetaData.countryDict[airport.serveCity.country];
                var subdiv = Subdiv.localizeSubdiv(airport.serveCity);
                this._airportCity.innerHTML = Localization.strings.constructPlaceName(country, subdiv, airport.serveCity.city);

                if (Localization.locale != "ENUS") {
                    this._airportName.title = airport.nameEn;
                    var cityEn = City.parseCity(airport.cityEn);
                    this._airportCity.title = Localization.default_strings.constructPlaceName(cityEn.country, cityEn.subdiv, cityEn.city);
                }
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
                    if (this.destDropDown.dataItems[i].airport.code == GlobalStatus.destAirport.code) {
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

        public updateDestList(panTo: boolean) {
            if (GlobalStatus.originAirport) {
                this.queryOriginAirport(GlobalStatus.originAirport.code, AST.QueryAirportType.Code, GlobalStatus.dataSource, panTo);
            }
        }

        private createDestList(destinations: Array<DestInfo>) {
            var compareAirport = function (a: DestInfo, b: DestInfo) {
                var countryA = GlobalMetaData.countryDict[a.airport.country];
                var countryB = GlobalMetaData.countryDict[b.airport.country];
                var originaAirportCountry = GlobalMetaData.countryDict[AST.GlobalStatus.originAirport.country];
                if (countryA != countryB) {
                    if (countryA == originaAirportCountry)
                        return -1;
                    if (countryB == originaAirportCountry)
                        return 1;
                    return Localization.strings.compareStr(countryA, countryB);
                }
                return Localization.strings.compareStr(a.airport.displayName, b.airport.displayName);
            };

            destinations.sort(compareAirport);

            var preCountry = "";
            for (var i = 0; i < destinations.length; i++) {
                //if (destinations[i].isNoData())
                //    continue;
                if (destinations[i].airport.country != preCountry) {
                    preCountry = destinations[i].airport.country;
                    var item = document.createElement("div");
                    item.innerHTML = GlobalMetaData.queryCountryName(preCountry);
                    item.className = "ddCountry";
                    this.destDropDown.insertItem(item, null, {
                        "selectable": false
                    });
                }
                this.destDropDown.insertItem(this.createAirportItem(destinations[i]), destinations[i]);
            }
            this.destDropDown.setDefaulTitleText(Localization.strings.pleaseSelectAirport);
        }

        private createAirportItem(dest: DestInfo) {
            var item = AST.Utils.createElement("div", {
                "class": "ddCommonItem"
            });
            if (dest.isNoData()) {
                item.style.color = "#808080";
            }
            else if (!dest.hasPaxFlow()) {
                item.style.color = "#6600FF";
            }
            var ddAirportCode = AST.Utils.createElement("span", {
                "class": "ddAirportCode",
                "text": dest.airport.code
            });
            var ddAirportCity = AST.Utils.createElement("span", {
                "class": "ddAirportCity",
                "text": dest.airport.displayName
            });

            item.appendChild(ddAirportCode);
            item.appendChild(ddAirportCity);
            return item;
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
            document.getElementById("airportViewDataSrcFilterText").innerHTML = Localization.strings.selectDataSource;
            document.getElementById("airportViewFilterTheRouteText").innerHTML = Localization.strings.filterRouteByAirline;
        }

        private createAirlineSelector() {
            this.airlineSelector.options.length = 0;

            var optionAll: any = document.createElement("option");
            optionAll.text = Localization.strings.all;
            optionAll.airline = { code: "" };
            this.airlineSelector.add(optionAll, null);

            for (var i = 0; i < GlobalMetaData.airlineInfo.length; i++) {
                var option: any = document.createElement("option");
                option.text = GlobalMetaData.airlineInfo[i].name;
                option.airline = GlobalMetaData.airlineInfo[i];
                this.airlineSelector.add(option, null);
            }
        }

        private updateOriginPosition(numDest) {
            var geom = AST.GlobalStatus.originAirport.geom;
            var originPt = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(geom.x, geom.y).transform(MapUtils.projWGS84, MapUtils.projMercator));
            this.mapControl.layerOrigin.addFeatures(originPt);
        }

        public updateMap(destinations: Array<DestInfo>) {
            if (!AST.GlobalStatus.originAirport)
                return;
            this.mapControl.clearDestFeatures();
            this.updateOriginPosition(destinations.length);

            // draw the routes        
            for (var i = 0; i < destinations.length; i++) {
                for (var j = 0; j < destinations[i].routeGeomO.length; j++) {
                    destinations[i].routeGeomO[j].style = {};
                    if (destinations[i].isPartialData())
                        destinations[i].routeGeomO[j].style.strokeDashstyle = "dash";
                    if (destinations[i].isNoData()) {
                        destinations[i].routeGeomO[j].style.strokeColor = "#b3b3b3";
                    }
                    else {
                        if (destinations[i].hasPaxFlow()) {
                            destinations[i].routeGeomO[j].style.strokeColor = "#0066FF";
                        } else {
                            destinations[i].routeGeomO[j].style.strokeColor = "#6600FF";
                        }
                    }
                    destinations[i].routeGeomO[j].style.strokeOpacity = .6;
                }
                this.mapControl.layerRoute.addFeatures(destinations[i].routeGeomO);
            }

            // draw the destination        
            for (var i = 0; i < destinations.length; i++) {
                var feature: any = new OpenLayers.Feature.Vector(destinations[i].airport.geomO);
                feature.airport = destinations[i].airport;
                feature.attributes.code = destinations[i].airport.code;
                if (destinations[i].isNoData())
                    this.mapControl.layerDestInactive.addFeatures(feature);
                else
                    this.mapControl.layerDest.addFeatures(feature);
            }

            this.mapControl.activateOpenLayersControl();
        }

        private setDestAirportInfo(airport: Airport, direction, dataSrc: string) {
            if (airport == null)
                return;
            var innerHTML = "";
            if (direction == AST.FlowDirection.To)
                innerHTML = "<b>" + Localization.strings.to + " : </b>";
            else
                innerHTML = "<b>" + Localization.strings.from + " : </b>";
            innerHTML += airport.iata + " / " + airport.icao;
            innerHTML += Utils.createSpace(6);
            var titleBar = document.createElement("div");
            titleBar.appendChild(Utils.createElement("span", { "text": innerHTML }));
            //titleBar.appendChild(Utils.createElement("span", { "text": "(" + dataSrc + ")", "class": "destBarTitleDataSrc" }));

            this.destDialogBuddy.setTitleBar(titleBar);
            var country = GlobalMetaData.countryDict[airport.serveCity.country];
            var subdiv = Subdiv.localizeSubdiv(airport.serveCity);
            this.destAirportCity.innerHTML = Localization.strings.constructPlaceName(country, subdiv, airport.serveCity.city);
            this.destAirportName.innerHTML = AST.Utils.compressAirportName(airport.name);
            if (Localization.locale != "ENUS") {
                this.destAirportName.title = airport.nameEn;
                var cityEn = City.parseCity(airport.cityEn);
                this.destAirportCity.title = Localization.default_strings.constructPlaceName(cityEn.country, cityEn.subdiv, cityEn.city);
            }
        }


        // Create the panel and setting the DOM elements
        static createT100OriginPanel(airportContent: AirportContent): OriginPanel {
            var originPanel = new OriginPanel(airportContent);
            // Assign the div elements
            originPanel._airportName = document.getElementById("t100OriginPanelAirportName");
            originPanel._airportCity = document.getElementById("t100OriginPanelCityName");
            originPanel.destAirportCity = document.getElementById("destBarCityName");
            originPanel.destAirportName = document.getElementById("destBarAirportName");
            originPanel.destBarAvailableDataSrc = document.getElementById("destBarAvailableDataSrc");

            originPanel._originAirportTitleBar = document.getElementById("t100AirportOriginAirportTitleBar");
            originPanel._labelFlowDir = document.getElementById("dataSrcPanelFlowDir");
            originPanel._yearSel = document.getElementById("dataSrcPanelYearSel");
            originPanel._destSel = document.getElementById("dataSrcPanelDestSel");
            originPanel._txtOriginAirport = <HTMLInputElement> document.getElementById("dataSrcPanelFindAirport");
            originPanel._btnFindAirport = <HTMLButtonElement> document.getElementById("dataSrcPanelFindAirportBtn");
            originPanel.airlineSelector = <HTMLSelectElement>document.getElementById("airportViewAirlineSelector");
            originPanel.ffRouteFilterDiv = document.getElementById("t100AirportContentFFRouteDiv");

            originPanel.initUI();
            return originPanel;
        }
    }

}