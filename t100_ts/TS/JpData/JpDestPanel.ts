module AST {
    export module JpData {

        export class JpDestPanel extends SimpleDestPanel {
            constructor() {
                super();
            }

            public initUi() {
                super.initUi();
                this.localizeUi();
            }

            public localizeUi() {
                super.localizeUi();
            }

            public querySegment() {
                if (AST.GlobalStatus.year == null || AST.GlobalStatus.originAirport == null
                    || AST.GlobalStatus.destAirport == null)
                    return;
                JpData.JpDataQuery.queryRoute(AST.GlobalStatus.year, AST.GlobalStatus.originAirport.code,
                    AST.GlobalStatus.destAirport.code, (routeData, distInfo) => {
                        this.setRouteData(routeData, distInfo);
                    });
                this.mapBuddy.selectDestAirportFeature(AST.GlobalStatus.destAirport.code);
            }

            static createJpDestPanel(): JpDestPanel {
                var destPanel = new AST.JpData.JpDestPanel();
                destPanel.mainDiv = document.getElementById("JpDataDestBarContent");
                destPanel.routeDistText = document.getElementById("destBarDistance");
                destPanel._totalFlow = document.getElementById("jpDestTotalFlow");
                destPanel.btnDetailReport = document.getElementById("jpDataDestPanelDetailReportBtn");

                destPanel._tabs = document.getElementById("jpDestTabs");

                destPanel._tabSummary = <SummaryTab>document.getElementById("jpDestTabSummary");

                destPanel._tabTimeSeries = document.getElementById("jpDestTabTimeSeries");
                destPanel._tabTimeSeriesTitle = document.getElementById("jpDestTabTimeSeriesTitle");
                destPanel._tabTimeSeriesFootNote = document.getElementById("jpDestTabTimeSeriesFootNote");
                destPanel.divTimeSeriesChart = document.getElementById("jpDestTabTimeSeriesChart");

                destPanel.panelFootNote = document.getElementById("jpDestFootNote");
                destPanel.tabMetricDataText = document.getElementById("jpDestPanelTabsMetricDataText");
                destPanel.metricDataAnchor = document.getElementById("jpDestPanelTabsMetricDataAnchor");

                destPanel.$$liDestTabSummary = "liJpDestTabSummary";
                destPanel.$$liDestTabTimeSeries = "liJpDestTabTimeSeries";
                destPanel.$destTab = "#jpDestTabs";

                destPanel.dataSourceMetaData = JpData.JpMetaData.instance();
                destPanel.initUi();
                return destPanel;
            }
        }
    }
}  