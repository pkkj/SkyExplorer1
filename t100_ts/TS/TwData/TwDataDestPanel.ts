module AST {
    export module TwData {
        export class TwDataDestPanel extends StandardDestPanel {
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

                TwData.TwDataQuery.queryRoute(AST.GlobalStatus.year, AST.GlobalStatus.originAirport.iata,
                    AST.GlobalStatus.destAirport.iata, (routeData, distInfo) => {
                        this.setRouteData(routeData, distInfo);
                    });

                this.mapBuddy.selectDestAirportFeature(AST.GlobalStatus.destAirport.iata);
                this.tabMetricDataText.onclick = () => {
                    DialogUtils.loadDetailReportDialog("About Taiwan CAA", "AboutT100.html");
                };
            }

            static createTwDataDestPanel(): TwDataDestPanel {
                var destPanel = new TwDataDestPanel();
                destPanel.mainDiv = document.getElementById("twDataDestBarInnerDiv");
                destPanel.routeDistText = document.getElementById("destBarDistance");
                destPanel._totalFlow = document.getElementById("twDataDestPanelTotalFlow");

                destPanel._tabs = document.getElementById("twDataDestPanelTabs");

                destPanel._tabSummary = document.getElementById("twDataDestPanelTabSummary");
                destPanel._tabShare = document.getElementById("twDataDestPanelTabsShare");
                destPanel._tabShareTitle = document.getElementById("twDataDestPanelTabShareTitle");
                destPanel._divShareChart = document.getElementById("twDataDestPanelPieChart");
                destPanel._tabShareFootNote = document.getElementById("twDataDestPanelTabShareFootNote");


                destPanel._tabTimeSeries = document.getElementById("twDataDestPanelTabTimeSeries");
                destPanel._tabTimeSeriesTitle = document.getElementById("twDataDestPanelTabTimeSeriesTitle");
                destPanel._tabTimeSeriesFootNote = document.getElementById("twDataDestPanelTabTimeSeriesFootNote");
                destPanel._divTimeSeriesChart = document.getElementById("twDataDestPanelTabTimeSeriesChart");

                destPanel._btnDetailReport = document.getElementById("twDataDestPanelDetailReportBtn");
                

                destPanel.panelFootNote = document.getElementById("twDataDestPanelDetailReportFootNote");
                destPanel.tabMetricDataText = document.getElementById("twDataDestPanelTabsMetricDataText");
                destPanel.metricDataAnchor = document.getElementById("twDataDestPanelTabsMetricDataAnchor");
                destPanel.liTabSummary = document.getElementById("liTwDataPanelTabSummary");
                destPanel.liTabShare = document.getElementById("liTwDataPanelTabsShare");
                destPanel.liTabTimeSeries = document.getElementById("liTwDataPanelTabTimeSeries");
                destPanel.timeSeriesLegend = document.getElementById("twDataDestPanelTabTimeSeriesLegend");
                destPanel.$tab = $("#twDataDestPanelTabs");
                destPanel.$$timeSeriesChart = "#twDataDestPanelTabTimeSeriesChart";
                destPanel.$$$liT100DataPanelTabSummary = "liTwDataPanelTabSummary";
                destPanel.$$$liTabShare = "liTwDataPanelTabsShare";
                destPanel.$$$liTabTimeSeries = "liTwDataPanelTabTimeSeries";

                destPanel.dataSourceMetaData = TwData.TwMetaData.instance();
                destPanel.initUi();
                return destPanel;
            }

        }
    }
}  