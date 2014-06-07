module AST {
    export class MapUtils {
        static projWGS84 = new OpenLayers.Projection("EPSG:4326");
        static projMercator = new OpenLayers.Projection("EPSG:900913");

        static parseMultiLineString(s: string): Array<OpenLayers.Feature.Vector> {
            var geoStr = "";
            var segment: Array<OpenLayers.Feature.Vector> = [];

            for (var i = 1; i < s.length - 1; i++) {
                if (s.charAt(i) == '[') {
                    geoStr = "";
                } else if (s.charAt(i) == ']') {
                    var coordStr = geoStr.split(",");
                    var feature = [];
                    for (var j = 0; j < coordStr.length; j++) {
                        var oneCoord = coordStr[j].split(" ");
                        feature.push(new OpenLayers.Geometry.Point(parseFloat(oneCoord[0]), parseFloat(oneCoord[1])));
                    }
                    var lineString = new OpenLayers.Geometry.LineString(feature).transform(MapUtils.projWGS84, MapUtils.projMercator);
                    segment.push(new OpenLayers.Feature.Vector(lineString));
                } else {
                    geoStr = geoStr.concat(s.charAt(i));
                }

            }
            return segment;
        }

        static createBaseMap(mapControl: OpenLayers.Map) {
            var baseEsriLayer = new OpenLayers.Layer.XYZ("Basemap", "http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}", {
                sphericalMercator: true,
                isBaseLayer: true,
                numZoomLevels: 12,
                wrapDateLine: true
            });
            mapControl.addLayers([baseEsriLayer]);
        }

        static initMapScale(mapControl: OpenLayers.Map) {
            var bounds = new OpenLayers.Bounds(
                -82.892028 - 50, 39.998 - 30,
                -82.892028 + 50, 39.998 + 30
                ).transform(MapUtils.projWGS84, MapUtils.projMercator);
            mapControl.zoomToExtent(bounds);
        }
    }
}; 