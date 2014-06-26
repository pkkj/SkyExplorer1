module AST {
    export module KrData {
        export class KrDestPanel extends StandardDestPanel {
            constructor() {
                super();
            }

            public initUi() {
                super.initUi();
                this.localizeUi();
            }
            public querySegment() {
                if (AST.GlobalStatus.year == null || AST.GlobalStatus.originAirport == null
                    || AST.GlobalStatus.destAirport == null || AST.GlobalStatus.flowDir == null)
                    return;

                KrData.KrDataQuery.queryRoute(AST.GlobalStatus.year, AST.GlobalStatus.originAirport.iata,
                    AST.GlobalStatus.destAirport.iata, (routeData, distInfo) => {
                        this.setRouteData(routeData, distInfo);
                    });

                this.mapBuddy.selectDestAirportFeature(AST.GlobalStatus.destAirport.iata);
                this.tabMetricDataText.onclick = () => {
                    DialogUtils.loadDetailReportDialog("About Taiwan CAA", "AboutT100.html");
                };
            }

            static createKrDestPanel(): KrDestPanel {
                var destPanel = new KrDestPanel();
                destPanel.mainDiv = document.getElementById("krDataDestBarInnerDiv");
                destPanel.routeDistText = document.getElementById("destBarDistance");
                destPanel._totalFlow = document.getElementById("krDataDestPanelTotalFlow");

                destPanel._tabs = document.getElementById("krDataDestPanelTabs");

                destPanel._tabSummary = document.getElementById("krDataDestPanelTabSummary");
                destPanel._tabShare = document.getElementById("krDataDestPanelTabsShare");
                destPanel._tabShareTitle = document.getElementById("krDataDestPanelTabShareTitle");
                destPanel._divShareChart = document.getElementById("krDataDestPanelPieChart");
                destPanel._tabShareFootNote = document.getElementById("krDataDestPanelTabShareFootNote");


                destPanel._tabTimeSeries = document.getElementById("krDataDestPanelTabTimeSeries");
                destPanel._tabTimeSeriesTitle = document.getElementById("krDataDestPanelTabTimeSeriesTitle");
                destPanel._tabTimeSeriesFootNote = document.getElementById("krDataDestPanelTabTimeSeriesFootNote");
                destPanel._divTimeSeriesChart = document.getElementById("krDataDestPanelTabTimeSeriesChart");

                destPanel._btnDetailReport = document.getElementById("krDataDestPanelDetailReportBtn");


                destPanel.panelFootNote = document.getElementById("krDataDestPanelDetailReportFootNote");
                destPanel.tabMetricDataText = document.getElementById("krDataDestPanelTabsMetricDataText");
                destPanel.metricDataAnchor = document.getElementById("krDataDestPanelTabsMetricDataAnchor");
                destPanel.liTabSummary = document.getElementById("liKrDataPanelTabSummary");
                destPanel.liTabShare = document.getElementById("liKrDataPanelTabsShare");
                destPanel.liTabTimeSeries = document.getElementById("liKrDataPanelTabTimeSeries");
                destPanel.timeSeriesLegend = document.getElementById("krDataDestPanelTabTimeSeriesLegend");
                destPanel.$tab = $("#krDataDestPanelTabs");
                destPanel.$$timeSeriesChart = "#krDataDestPanelTabTimeSeriesChart";
                destPanel.$$$liT100DataPanelTabSummary = "liKrDataPanelTabSummary";
                destPanel.$$$liTabShare = "liKrDataPanelTabsShare";
                destPanel.$$$liTabTimeSeries = "liKrDataPanelTabTimeSeries";

                destPanel.dataSourceMetaData = KrData.KrMetaData.instance();
                destPanel.initUi();
                return destPanel;
            }

        }
    }
}   