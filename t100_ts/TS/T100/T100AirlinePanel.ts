module AST {
    export class T100AirlinePanel {
        private divRoot: HTMLElement = null;
        private yearSel: HTMLSelectElement = null;
        private airlineSel: HTMLSelectElement = null;
        private countrySel: HTMLSelectElement = null;
        private typeSel: HTMLSelectElement = null;
        private innerTitle: HTMLElement = null;
        private airlineNote: HTMLElement = null;
        private airlineWikiLink: HTMLElement = null;
        private availabilityNote: HTMLElement = null;

        private routeTableWidth = 310;
        private routeTable = null;
        private routeData = null;
        private routeTableFrom = 0;
        private routeTableFooter: HTMLElement = null;
        private mapControl: OpenLayers.Map = null;

        // Map
        private baseLayerAirport = null;
        private layerRoute = null;
        private layerSelectedRoute = null;
        private routeHightlightControl = null;
        private routeSelectControl = null;
        private layerSelectedRouteAirports = null;
        private routeBaseWidth = 1.1;


        constructor() {
            this.divRoot = document.getElementById("t100AirlinePanel");
            this.yearSel = <HTMLSelectElement> document.getElementById("t100AirlineYearSel");
            this.airlineSel = <HTMLSelectElement> document.getElementById("t100AirlineAirlineSel");
            this.countrySel = <HTMLSelectElement> document.getElementById("t100AirlineCountrySel");
            this.typeSel = <HTMLSelectElement> document.getElementById("t100AirlineTypeSel");
            this.innerTitle = document.getElementById("t100AirlinePanelTitle");
            this.airlineNote = document.getElementById("t100AirlinePanelAirlineNote");
            this.airlineWikiLink = document.getElementById("t100AirlineRouteAirlineWikiLink");
            this.availabilityNote = document.getElementById("t100AirlineRouteAvailabilityNote");
            this.routeTableFooter = document.getElementById("t100AirlineRouteFooter");
        }

        public init(mapControl: OpenLayers.Map) {
            // Init the year selector
            var i;

            // Init the type filter selector
            var types = [Localization.strings._airlineTypeAll,
                Localization.strings._airlineTypePassenger,
                Localization.strings._airlineTypeCargo
            ];
            for (i = 0; i < types.length; i++) {
                var option = document.createElement("option");
                option.text = types[i];
                this.typeSel.add(option, null);
            }
            this.typeSel.onchange = () => {
                this.createAirlineSel();
            }

            this.initCountrySel();
            this.createAirlineSel();
            this.airlineSel.onchange = () => {
                this.onAirlineChange();
                this.queryAirlineRoute();
            }

            this.yearSel.onchange = () => {
                this.queryAirlineRoute();
            }

            $("#t100AirlineContentRegionFilter").buttonset();

            $("#t100AirlineContentRegionFilter :radio").click((e) => {
                var item = this.airlineSel[this.airlineSel.selectedIndex];
                if (item.airline)
                    this.queryAirlineRoute();
            });

            this.routeTable = new AST.CollapseTable(document.getElementById("t100AirlienRouteTable"), { "width": this.routeTableWidth });
            this.mapControl = mapControl;
            this.localizeUi();
        }

        public localizeUi() {
            document.getElementById("t100AirlinePanelCountryFilterText").innerHTML = Localization.strings.countryFilter;
            document.getElementById("t100AirlinePanelTypeFilterText").innerHTML = Localization.strings.typeFilter;
            document.getElementById("t100AirlineRouteNote").innerHTML = Localization.strings.onlyTop400Routes;
            document.getElementById("t100AirlinePanelAirlineText").innerHTML = Localization.strings.airline;
            document.getElementById("t100AirlinePanelYearText").innerHTML = Localization.strings.year;
            document.getElementById("t100AirlineContentRightTopPanelRegionalFilterText").innerHTML = Localization.strings.regionalFilter;
            $("#t100AirlineContentRegionFilterAll").button("option", "label", Localization.strings.regionalFilterAll);
            $("#t100AirlineContentRegionFilterUS").button("option", "label", Localization.strings.regionalFilterUS);
            $("#t100AirlineContentRegionFilterIntl").button("option", "label", Localization.strings.regionalFilterIntl);
        }

        private createAirlineSel() {
            var country: string = this.countrySel[this.countrySel.selectedIndex].text;
            var type: string = this.typeSel[this.typeSel.selectedIndex].text;
            this.airlineSel.options.length = 0;

            var optionTop = document.createElement("option");
            optionTop.text = Localization.strings.pleaseSelectAnAirline;
            this.airlineSel.add(optionTop, null);

            for (var i = 0; i < T100.T100MetaData.airlineInfo.length; i++) {
                if (type != Localization.strings._airlineTypeAll) {
                    var airlineType: AirlineType =
                        type == Localization.strings._airlineTypePassenger ? AirlineType.Passenger : AirlineType.CargoOnly;
                    if (T100.T100MetaData.airlineInfo[i].type != airlineType)
                        continue;
                }
                if (country != "All") {
                    if (T100.T100MetaData.airlineInfo[i].country != country)
                        continue;
                }
                var option: any = document.createElement("option");
                option.text = T100.T100MetaData.airlineInfo[i].name;
                option.airline = T100.T100MetaData.airlineInfo[i];
                this.airlineSel.add(option, null);
            }
        }
        private initCountrySel() {
            var i;
            var countryDict = {};
            for (i = 0; i < T100.T100MetaData.airlineInfo.length; i++) {
                countryDict[T100.T100MetaData.airlineInfo[i].country] = true;
            }
            var countryList = ["All"];
            for (var key in countryDict) {
                countryList.push(key);
            }
            countryList.sort(function (a, b) {
                if (a == "All") return -1;
                if (b == "All") return 1;
                return Localization.strings.compareStr(a, b);
            });
            for (i = 0; i < countryList.length; i++) {
                var option = document.createElement("option");
                option.text = countryList[i];
                this.countrySel.add(option, null);
            }
            this.countrySel.onchange = () => {
                this.createAirlineSel();
            }

        }

        private createRouteTableHeader() {
            var divA = AST.Utils.createElement("div", { "class": "t100AirlineRouteHeader", "width": (this.routeTableWidth - 10).toString() + "px" });

            divA.appendChild(AST.Utils.createElement("div", { "float": "left", "width": "35px", "text": "#" }));
            divA.appendChild(AST.Utils.createElement("div", { "float": "left", "width": "40px", "text": Localization.strings._airlineViewRouteTableFrom }));
            divA.appendChild(AST.Utils.createElement("div", { "float": "left", "width": "50px", "text": Localization.strings._airlineViewRouteTableTo }));
            var flowType = "";
            if (this.airlineSel[this.airlineSel.selectedIndex].airline.type == AirlineType.Passenger)
                flowType = Localization.strings.paxFreq;
            else
                flowType = Localization.strings.freightFreq;

            divA.appendChild(AST.Utils.createElement("div", { "float": "left", "width": "80px", "text": flowType }));
            divA.appendChild(AST.Utils.createElement("div", { "float": "left", "width": "70px", "text": Localization.strings.departureFreq }));
            divA.appendChild(AST.Utils.createElement("div", { "class": "clear" }));
            return divA;
        }

        private createRouteItem(index, route) {

            var divA = AST.Utils.createElement("div", { "class": "t100AirlineRouteItemA" });
            divA.onclick = () => {
                this.updateSelectedRoute(index - 1);
            };
            var indexLabel = AST.Utils.createElement("div", { "float": "left", "width": "35px" });
            indexLabel.innerHTML = "<b>" + index + "</b>";
            divA.appendChild(indexLabel);


            var originLabel = AST.Utils.createElement("div", { "float": "left", "width": "40px" });
            originLabel.innerHTML = route.origin;
            divA.appendChild(originLabel);

            var destsLabel = AST.Utils.createElement("div", { "float": "left", "width": "50px" });
            destsLabel.innerHTML = route.dest;
            divA.appendChild(destsLabel);

            var flowLabel = AST.Utils.createElement("div", { "float": "left", "width": "80px" });
            flowLabel.innerHTML = AST.Utils.formatNumber(route.flow);
            divA.appendChild(flowLabel);

            var departureLabel = AST.Utils.createElement("div", { "float": "left", "width": "70px" });
            departureLabel.innerHTML = route.departure;
            divA.appendChild(departureLabel);

            divA.appendChild(AST.Utils.createElement("div", { "class": "clear" }));

            var divB = AST.Utils.createElement("div", { "class": "t100AirlineRouteItemB" });

            var fromLabel = AST.Utils.createElement("div", { "class": "t100AirlineRouteItemBInner" });
            var fromCity = Localization.strings.constructPlaceName(route.originCountry, route.originCity);
            fromLabel.appendChild(AST.Utils.createElement("div", { "text": Localization.strings._airlineViewRouteTableFrom, "width": "40px", "float": "left" }));
            fromLabel.appendChild(AST.Utils.createElement("div", { "text": fromCity, "float": "left" }));
            fromLabel.appendChild(AST.Utils.createElement("div", { "class": "clear" }));
            divB.appendChild(fromLabel);

            var toLabel = AST.Utils.createElement("div", { "class": "t100AirlineRouteItemBInner" });
            var toCity = Localization.strings.constructPlaceName(route.destCountry, route.destCity);
            toLabel.appendChild(AST.Utils.createElement("div", { "text": Localization.strings._airlineViewRouteTableTo, "width": "40px", "float": "left" }));
            toLabel.appendChild(AST.Utils.createElement("div", { "text": toCity, "float": "left" }));
            toLabel.appendChild(AST.Utils.createElement("div", { "class": "clear" }));
            divB.appendChild(toLabel);

            var detailLink = AST.Utils.createElement("div", { "class": "t100AirlineRouteItemBInner" });
            var anchor = <HTMLAnchorElement>AST.Utils.createElement("a", { "text": Localization.strings.routeDetailReport });
            anchor.href = "#";
            anchor.onclick = () => {
                var airline = this.airlineSel[this.airlineSel.selectedIndex].airline.code;
                var year = this.yearSel[this.yearSel.selectedIndex].innerHTML;
                T100.T100Common.launchRouteStat(route.origin, route.dest, airline, year);
            };
            detailLink.appendChild(anchor);
            divB.appendChild(detailLink);

            var itemRoot = document.createElement("div");
            var item = new AST.CollapseItem(itemRoot, divA, divB, { "height": 22, "width": this.routeTableWidth });
            return item;

        }

        private setRouteTableData(itemFrom) {
            this.routeTable.clear();
            this.routeTableFrom = itemFrom;
            var itemPerPage = 15;
            for (var i = itemFrom; i < this.routeData.length && i < itemFrom + itemPerPage; i++) {
                this.routeTable.addItem(this.createRouteItem(i + 1, this.routeData[i]));
            }
            while (this.routeTableFooter.firstChild) {
                this.routeTableFooter.removeChild(this.routeTableFooter.firstChild);
            }
            if (itemFrom - itemPerPage >= 0) {
                this.routeTableFooter.appendChild(AST.Utils.createElement("span", { "text": "(" }));
                var previous20 = AST.Utils.createElement("a", { "text": Localization.strings.previous + " " + itemPerPage });
                previous20.onclick = () => {
                    this.setRouteTableData(itemFrom - itemPerPage);
                };
                this.routeTableFooter.appendChild(previous20);
                this.routeTableFooter.appendChild(AST.Utils.createElement("span", { "text": ")" }));
            }
            if (itemFrom + itemPerPage < this.routeData.length) {
                this.routeTableFooter.appendChild(AST.Utils.createElement("span", { "text": "(" }));
                var next20 = AST.Utils.createElement("a", { "text": Localization.strings.next + " " + itemPerPage });
                next20.onclick = () => {
                    this.setRouteTableData(itemFrom + itemPerPage);
                };
                this.routeTableFooter.appendChild(next20);
                this.routeTableFooter.appendChild(AST.Utils.createElement("span", { "text": ")" }));
            }
        }

        private onAirlineChange = () => {
            var item = this.airlineSel[this.airlineSel.selectedIndex];
            if (!item.airline)
                return false;

            this.innerTitle.innerHTML = item.airline.code + " - " + item.airline.name;
            this.airlineNote.innerHTML = item.airline.note;
            Localization.strings.constructAirlineWikiSpan(this.airlineWikiLink, item.airline.name);

            this.availabilityNote.innerHTML = "";

            var curYear = "";
            if (this.yearSel.selectedIndex != -1)
                curYear = this.yearSel[this.yearSel.selectedIndex].innerHTML;
            this.yearSel.options.length = 0;
            var availability = item.airline.availability.split(",");
            for (var i = 0; i < availability.length; i++) {
                if (parseInt(availability[i]) >= 90)
                    availability[i] = "19" + availability[i];
                else
                    availability[i] = "20" + availability[i];
            }
            availability.sort(function (a, b) {return parseInt(b) - parseInt(a) });
            for (var i = 0; i < availability.length; i++) {
                var option = document.createElement("option");
                option.text = availability[i];
                this.yearSel.add(option, null);
            }
            return true;
        }

        private getRegionFilter() {
            if ((<HTMLInputElement> document.getElementById("t100AirlineContentRegionFilterAll")).checked)
                return "All";
            else if ((<HTMLInputElement>document.getElementById("t100AirlineContentRegionFilterUS")).checked)
                return "US";
            else
                return "Intl";
        }
        private queryAirlineRoute() {
            var year = this.yearSel[this.yearSel.selectedIndex].innerHTML;
            var item = this.airlineSel[this.airlineSel.selectedIndex];

            if (!item.airline)
                return;
            T100.T100DataQuery.queryAirlineRoute(year, item.airline.code, this.getRegionFilter(),
                (data) => {
                    for (var i = 0; i < data.length; i++) {
                        data[i].geom = AST.MapUtils.parseMultiLineString(data[i]["geom"]);
                    }
                    this.routeData = data;
                    this.routeTable.addHeader(this.createRouteTableHeader());
                    this.setRouteTableData(0);
                    this.updateMap();

                    // Set the availability note
                    if (item.airline.country == T100.T100MetaData.currentCountry && T100.T100FFMetaData.has28ISFFData(parseInt(year))) {
                        this.availabilityNote.innerHTML = T100.T100Localization.strings.routeNotLimitToUs;
                    } else {
                        this.availabilityNote.innerHTML = T100.T100Localization.strings.routeLimitToUs;
                    }

                });
            this.layerSelectedRoute.destroyFeatures();
            this.layerSelectedRouteAirports.destroyFeatures();
        }

        public reset() {
            this.airlineSel.selectedIndex = 0;
            this.yearSel.options.length = 0;
            this.innerTitle.innerHTML = "";
            this.airlineNote.innerHTML = "";
            this.routeTable.clear();
            while (this.routeTableFooter.firstChild) {
                this.routeTableFooter.removeChild(this.routeTableFooter.firstChild);
            }
        }

        private createRouteLayer() {
            var myStyles = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    strokeOpacity: .5,
                    strokeColor: "${strokeColor}",
                    strokeWidth: "${strokeWidth}",
                    graphicZIndex: 1
                }),
                "select": new OpenLayers.Style({
                    strokeColor: "#00FFFF",
                    strokeWidth: "${strokeWidth}",
                    graphicZIndex: 2
                })
            });

            this.layerRoute = new OpenLayers.Layer.Vector('Route', {
                styleMap: myStyles,
                rendererOptions: { zIndexing: true }
            });
            this.mapControl.addLayers([this.layerRoute]);

            this.layerSelectedRoute = new OpenLayers.Layer.Vector('RouteSelected', {
                styleMap: myStyles,
                rendererOptions: { zIndexing: true }
            });
            this.mapControl.addLayers([this.layerSelectedRoute]);

            var myStyles = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    pointRadius: 6,
                    fillColor: "#00CC33",
                    strokeColor: "#0099FF",
                    strokeWidth: 3,
                    graphicZIndex: 1
                })
            });

            this.layerSelectedRouteAirports = new OpenLayers.Layer.Vector("SelectedRouteAirports", {
                styleMap: myStyles,
                rendererOptions: { zIndexing: true }
            });
            this.mapControl.addLayers([this.layerSelectedRouteAirports]);
        }

        public activateMap() {
            //this.mapControl.events.register("click", this.mapControl, this.onMapClick);
            this.baseLayerAirport = T100BaseMap.createT100AirportBaseLayer(this.mapControl);
            this.mapControl.addLayers([this.baseLayerAirport]);
            this.createRouteLayer();
        }
        public deactivateMap() {
            //this.mapControl.events.unregister("click", this.mapControl, this.onMapClick);
            this.mapControl.removeLayer(this.baseLayerAirport);
            this.mapControl.removeLayer(this.layerRoute);
            this.mapControl.removeLayer(this.layerSelectedRoute);
            this.mapControl.removeLayer(this.layerSelectedRouteAirports);
        }

        private calculateBaseFlow(): number[] {
            var baseFreightFlow = 0;
            var basePaxFlow = 0;
            var basePaxUnit = 2000;
            var baseFreightUnit = 10000;
            if (this.yearSel[this.yearSel.selectedIndex].innerHTML == T100.T100MetaData.dataTo.year.toString()) {
                baseFreightFlow = T100.T100MetaData.dataTo.month * basePaxUnit;
                basePaxFlow = T100.T100MetaData.dataTo.month * baseFreightUnit;
            } else {
                baseFreightFlow = 12 * basePaxUnit;
                basePaxFlow = 12 * baseFreightUnit;
            }
            return [basePaxFlow, baseFreightFlow];
        }

        private updateSelectedRoute(index: number) {
            this.layerSelectedRoute.destroyFeatures();
            this.layerSelectedRouteAirports.destroyFeatures();
            var baseFlow = this.calculateBaseFlow();
            var flowType: AirlineType = this.airlineSel[this.airlineSel.selectedIndex].airline.type;
            var geom = [];
            for (var j = 0; j < this.routeData[index].geom.length; j++) {
                geom.push(this.routeData[index].geom[j].clone());
                geom[j].style = {};
                //geom[j].style.strokeOpacity = .5;
                geom[j].style.strokeColor = "#00FFFF";
                if (flowType == AirlineType.Passenger) {
                    geom[j].style.strokeWidth = this.routeData[index].flow / baseFlow[0] + this.routeBaseWidth;
                }
                else {
                    geom[j].style.strokeWidth = this.routeData[index].flow / baseFlow[1] + this.routeBaseWidth;
                }
            }
            this.layerSelectedRoute.addFeatures(geom);
            var feature1 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(this.routeData[index].originGeom.x, this.routeData[index].originGeom.y).transform(MapUtils.projWGS84, MapUtils.projMercator));
            var feature2 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(this.routeData[index].destGeom.x, this.routeData[index].destGeom.y).transform(MapUtils.projWGS84, MapUtils.projMercator));
            this.layerSelectedRouteAirports.addFeatures(feature1);
            this.layerSelectedRouteAirports.addFeatures(feature2);

            var minX = Math.min(this.routeData[index].originGeom.x, this.routeData[index].destGeom.x), maxX = Math.max(this.routeData[index].originGeom.x, this.routeData[index].destGeom.x);
            var minY = Math.min(this.routeData[index].originGeom.y, this.routeData[index].destGeom.y), maxY = Math.max(this.routeData[index].originGeom.y, this.routeData[index].destGeom.y);
            var bounds = new OpenLayers.Bounds(
                minX - 15, minY - 15,
                maxX + 15, maxY + 15
                ).transform(MapUtils.projWGS84, MapUtils.projMercator);
            this.mapControl.zoomToExtent(bounds);
        }

        private updateMap() {
            // draw the routes
            this.layerRoute.destroyFeatures();
            var baseFlow = this.calculateBaseFlow();
            var flowType: AirlineType = this.airlineSel[this.airlineSel.selectedIndex].airline.type;
            for (var i = 0; i < this.routeData.length; i++) {
                /*for (var j = 0; j < this.routeData[i].geom.length; j++) {
                    if (flowType == "Passenger") {
                        this.routeData[i].geom[j].attributes.strokeColor = "#0066FF";
                        this.routeData[i].geom[j].attributes.strokeWidth = this.routeData[i].flow / basePaxFlow + 0.7;
                    }
                    else {
                        this.routeData[i].geom[j].attributes.strokeColor = "#6600FF";
                        this.routeData[i].geom[j].attributes.strokeWidth = this.routeData[i].flow / baseFreightFlow + 0.7;
                    }
                }*/

                for (var j = 0; j < this.routeData[i].geom.length; j++) {
                    this.routeData[i].geom[j].style = {};
                    this.routeData[i].geom[j].style.strokeOpacity = .5;
                    if (flowType == AirlineType.Passenger) {
                        this.routeData[i].geom[j].style.strokeColor = "#0066FF";
                        this.routeData[i].geom[j].style.strokeWidth = this.routeData[i].flow / baseFlow[0] + this.routeBaseWidth;
                    }
                    else {
                        this.routeData[i].geom[j].style.strokeColor = "#6600FF";
                        this.routeData[i].geom[j].style.strokeWidth = this.routeData[i].flow / baseFlow[1] + this.routeBaseWidth;
                    }
                }

                this.layerRoute.addFeatures(this.routeData[i].geom);
            }
            //this.routeHightlightControl.activate();
            //this.routeSelectControl.activate();

            this.makeLegend();
        }

        private makeLegend() {

            var flowType: AirlineType = this.airlineSel[this.airlineSel.selectedIndex].airline.type;
            var color = flowType == AirlineType.Passenger ? 'rgba(0,102,255,.6)' : 'rgba(102,0,255,.6)';
            var legendDiv = document.getElementById("contentLegend");
            while (legendDiv.firstChild)
                legendDiv.removeChild(legendDiv.firstChild);


            var divTitle = AST.Utils.createElement("div", { "class": "legendTitle", "text": Localization.strings.route });
            var canvas = document.createElement('canvas');
            canvas.id = "contentLegendCanvas";
            canvas.height = 60;
            canvas.width = 280;
            legendDiv.appendChild(divTitle);
            legendDiv.appendChild(canvas);
            canvas = <HTMLCanvasElement> document.getElementById("contentLegendCanvas");
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 280, 60);

            var baseFlowStandard = this.calculateBaseFlow();
            var baseFlow = "Passenger" ? baseFlowStandard[0] : baseFlowStandard[1];
            AST.Draw.drawSegment(ctx, 0, 10, 35, 10, 3.1, color);
            AST.Draw.drawText(ctx, 45, 13, "12px Arial", '#000000', Localization.strings.constructAirlineViewFlowLegend(baseFlow * 2, flowType));

            AST.Draw.drawSegment(ctx, 0, 30, 35, 30, 2.1, color);
            AST.Draw.drawText(ctx, 45, 33, "12px Arial", '#000000', Localization.strings.constructAirlineViewFlowLegend(baseFlow * 1, flowType));

            AST.Draw.drawSegment(ctx, 0, 50, 35, 50, 1.1, color);
            AST.Draw.drawText(ctx, 45, 53, "12px Arial", '#000000', Localization.strings.constructAirlineViewFlowLegendOrLess(baseFlow * .1, flowType));
        }
    }

}