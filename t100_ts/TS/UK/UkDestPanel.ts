module AST {
    export module UkData {

        export class UkDestPanel extends SimpleDestPanel {
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
                UkData.UkDataQuery.queryRoute(AST.GlobalStatus.year, AST.GlobalStatus.originAirport.iata,
                    AST.GlobalStatus.destAirport.iata, (routeData, distInfo) => {
                        this.setRouteData(routeData, distInfo);
                    });
                this.mapBuddy.selectDestAirportFeature(AST.GlobalStatus.destAirport.iata);
            }

            static createUkDestPanel(): UkDestPanel {
                var destPanel = new AST.UkData.UkDestPanel();
                destPanel.mainDiv = document.getElementById("ukDestBarInnerDiv");
                destPanel.routeDistText = document.getElementById("destBarDistance");
                destPanel._totalFlow = document.getElementById("ukDestTotalFlow");

                destPanel._tabs = document.getElementById("ukDestTabs");

                destPanel._tabSummary = <SummaryTab>document.getElementById("ukDestTabSummary");

                destPanel._tabTimeSeries = document.getElementById("ukDestTabTimeSeries");
                destPanel._tabTimeSeriesTitle = document.getElementById("ukDestTabTimeSeriesTitle");
                destPanel._tabTimeSeriesFootNote = document.getElementById("ukDestTabTimeSeriesFootNote");
                destPanel.divTimeSeriesChart = document.getElementById("ukDestTabTimeSeriesChart");

                destPanel.panelFootNote = document.getElementById("ukDestFootNote");

                destPanel.$$liDestTabSummary = "liUkDestTabSummary";
                destPanel.$$liDestTabTimeSeries = "liUkDestTabTimeSeries";
                destPanel.$destTab = "#ukDestTabs";

                destPanel.dataSourceMetaData = UkData.UkMetaData.instance();
                destPanel.initUi();
                return destPanel;
            }
        }
    }
} 