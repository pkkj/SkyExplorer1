module AST {
    export class MapControl {
        private mapControl: OpenLayers.Map = null;
        private dataSrcPanel: OriginPanel = null;
        private baseLayerAirport = null;
        public layerRoute: OpenLayers.Layer.Vector = null;
        public layerDest = null;
        public layerDestInactive = null;
        public layerOrigin = null;

        // OpenLayers.Control object
        private destHightlightControl: OpenLayers.Control.SelectFeature = null;
        private destSelectControl: OpenLayers.Control.SelectFeature = null;

        constructor(mapControl, dataSrcPanel) {
            this.mapControl = mapControl;
            this.dataSrcPanel = dataSrcPanel;
        }

        public panTo(geom) {
            this.mapControl.panTo(new OpenLayers.LonLat(geom.x, geom.y).transform(MapUtils.projWGS84, MapUtils.projMercator));
        }

        public selectDestAirportFeature(code: string) {
            this.selectDestAirportFeatureInternal(this.layerDest, this.destSelectControl, code);
            this.selectDestAirportFeatureInternal(this.layerDestInactive, this.destSelectControl, code);
        }

        public selectDestAirportFeatureInternal(layer: any, selectControl: any, code: string): boolean {
            if (layer.selectedFeatures.length > 0) {
                if (layer.selectedFeatures[0].attributes.code == code)
                    return;
                else
                    selectControl.unselect(layer.selectedFeatures[0]);
            }
            var feature = layer.getFeaturesByAttribute("code", code)[0];
            if (feature) {
                feature.stop = true;
                selectControl.select(feature);
            }
        }

        private createAirportBaseLayer() {
            this.baseLayerAirport = T100BaseMap.createT100AirportBaseLayer(this.mapControl);
            this.mapControl.addLayers([this.baseLayerAirport]);
        }

        private createOriginLayer() {
            var myStyles = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    pointRadius: 7,
                    fillColor: "#66FF66",
                    strokeColor: "#330099",
                    strokeWidth: 2,
                    graphicZIndex: 1
                })
            });

            this.layerOrigin = new OpenLayers.Layer.Vector('T100Origin', {
                styleMap: myStyles,
                rendererOptions: { zIndexing: true }
            });
            this.mapControl.addLayers([this.layerOrigin]);
        }

        private createDestLayer() {
            var myStyles = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    pointRadius: 3.5,
                    fillColor: "#00CC33",
                    strokeColor: "#0099FF",
                    strokeWidth: 2,
                    graphicZIndex: 1
                }),
                "select": new OpenLayers.Style({
                    fillColor: "#00FFFF",
                    strokeColor: "#3399ff",
                    graphicZIndex: 2
                })
            });

            this.layerDest = new OpenLayers.Layer.Vector("T100Dest", {
                styleMap: myStyles,
                rendererOptions: { zIndexing: true }

            });

            var myStylesInactive = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    pointRadius: 3.5,
                    fillColor: "#b3b3b3",
                    strokeColor: "#9a9a9a",
                    strokeWidth: 2,
                    graphicZIndex: 1
                }),
                "select": new OpenLayers.Style({
                    fillColor: "#909090",
                    strokeColor: "#707070",
                    graphicZIndex: 2
                })
            });

            this.layerDestInactive = new OpenLayers.Layer.Vector("OtherDest", {
                styleMap: myStylesInactive,
                rendererOptions: { zIndexing: true }
            });

            this.mapControl.addLayers([this.layerDestInactive, this.layerDest]);

            this.destHightlightControl = new OpenLayers.Control.SelectFeature([this.layerDestInactive, this.layerDest], {
                hover: true,
                highlightOnly: true
            });

            this.destSelectControl = new OpenLayers.Control.SelectFeature([this.layerDestInactive, this.layerDest], {
                clickout: true,
                onSelect: (feature) =>{
                    if (feature != null) {
                        AST.GlobalStatus.destAirport = feature.airport;
                        if (feature.stop) {
                            feature.stop = null;
                            return;
                        }
                        this.dataSrcPanel.changeDestAirport();
                    }
                },
                onUnselect: function (feature) {
                }
            });


            this.mapControl.addControl(this.destHightlightControl);
            this.mapControl.addControl(this.destSelectControl);   
        }


        private createRouteLayer() {
            this.layerRoute = new OpenLayers.Layer.Vector('Route', {
                wrapDateLine: true,
            });
            this.mapControl.addLayers([this.layerRoute]);
        }

        public clearDestFeatures() {
            this.layerRoute.destroyFeatures();
            this.layerDest.destroyFeatures();
            this.layerDestInactive.destroyFeatures();
            this.layerOrigin.destroyFeatures();
            this.destHightlightControl.deactivate();
            this.destSelectControl.deactivate();
        }

        private onMapClick = (e)=> {
            var origin = e.xy;
            var pA = new OpenLayers.Pixel(origin.x - 4, origin.y - 4);
            var pB = new OpenLayers.Pixel(origin.x + 4, origin.y + 4);
            var gpA = this.mapControl.getLonLatFromPixel(pA).transform(MapUtils.projMercator, MapUtils.projWGS84);
            var gpB = this.mapControl.getLonLatFromPixel(pB).transform(MapUtils.projMercator, MapUtils.projWGS84);

            this.dataSrcPanel.queryOriginAirport(gpA.lon + "," + gpA.lat + "," + gpB.lon + "," + gpB.lat, AST.QueryAirportType.Geometry, GlobalStatus.dataSource, false/*panTo*/);
        }

        public activate() {
            this.mapControl.events.register("click", this.mapControl, this.onMapClick);
            this.createAirportBaseLayer();
            this.createRouteLayer();
            this.createDestLayer();
            this.createOriginLayer();
        }

        /// Active the OpenLayers.Control
        public activateOpenLayersControl() {
            this.destHightlightControl.activate();
            this.destSelectControl.activate();
        }

        public deactivate() {
            this.mapControl.events.unregister("click", this.mapControl, this.onMapClick);
            this.clearDestFeatures();
            this.mapControl.removeControl(this.destHightlightControl);
            this.mapControl.removeControl(this.destSelectControl);
            this.mapControl.removeLayer(this.layerRoute);
            this.mapControl.removeLayer(this.layerOrigin);
            this.mapControl.removeLayer(this.layerDest);
            this.mapControl.removeLayer(this.layerDestInactive);
            this.mapControl.removeLayer(this.baseLayerAirport);
        }
    }



    export class T100BaseMap {
        static createT100AirportBaseLayer(mapControl) {
            //var baseLayerAirport = new OpenLayers.Layer.WMS("airstat:T100AirportAll", "http://geog-cura-osgeo.asc.ohio-state.edu:8080/geoserver/gwc/service/wms",
            var baseLayerAirport = new OpenLayers.Layer.WMS("airstat:T100AirportAll", "http://localhost:8080/geoserver/gwc/service/wms",
                {
                    layers: 'airstat:T100AirportAll',
                    styles: '',
                    format: 'image/png',
                    tiled: true,
                    transparent: true,
                    tilesOrigin: mapControl.maxExtent.left + ',' + mapControl.maxExtent.bottom
                },
                {
                    tileSize: new OpenLayers.Size(256, 256),
                    buffer: 0,
                    transitionEffect: null,
                    displayOutsideMaxExtent: true,
                    isBaseLayer: false,
                    yx: { 'EPSG:900913': true }
                }
                );
            baseLayerAirport.mergeNewParams({
                format_options: 'antialias:full'
            });
            T100BaseMap.createT100AirportLegend();
            return baseLayerAirport;
        }

        static createT100AirportLegend() {
            document.getElementById("legendTitleAirportText").innerHTML = Localization.strings.airport;
            var canvas = <HTMLCanvasElement>document.getElementById('baseMapLegendCanvas');
            var ctx = <any>canvas.getContext('2d'); // TODO: remove ANY
            var gap = 23;
            var base = 28;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 280, 80);

            AST.Draw.drawText(ctx, 100, 10, "12px Arial", '#000000', Localization.strings.withFlowData);
            AST.Draw.drawText(ctx, 200, 10, "12px Arial", '#000000', Localization.strings.noFlowData);

            AST.Draw.drawText(ctx, 0, base + 5, "12px Arial", '#000000', Localization.strings.largeAirport);
            AST.Draw.drawText(ctx, 0, base + gap + 4, "12px Arial", '#000000', Localization.strings.mediumAirport);
            AST.Draw.drawText(ctx, 0, base + gap * 2 + 3, "12px Arial", '#000000', Localization.strings.smallAirport);

            AST.Draw.drawCircle(ctx, 110, base, 5, '#006699');
            AST.Draw.drawCircle(ctx, 110, base + gap, 3, '#006699');
            AST.Draw.drawCircle(ctx, 110, base + gap * 2, 2, '#006699');
            AST.Draw.drawCircle(ctx, 220, base, 5, '#848484');
            AST.Draw.drawCircle(ctx, 220, base + gap, 3, '#848484');
            AST.Draw.drawCircle(ctx, 220, base + gap * 2, 2, '#A0A0A0');


            AST.Draw.drawText(ctx, 117, base + 5, "bold 14px Arial", '#000000', "ORD");
            AST.Draw.drawText(ctx, 117, base + gap + 4, "bold 11px Arial", '#0033CC', "CMH");
            AST.Draw.drawText(ctx, 117, base + gap * 2 + 3, "bold 9px Arial", '#0066FF', "SCE");
            AST.Draw.drawText(ctx, 227, base + 5, "bold 14px Arial", '#848484', "KUL");
            AST.Draw.drawText(ctx, 227, base + gap + 4, "bold 11px Arial", '#A4A4A4', "CTU");
            AST.Draw.drawText(ctx, 227, base + gap * 2 + 3, "bold 9px Arial", '#B0B0B0', "ULN");
        }
    }
} 