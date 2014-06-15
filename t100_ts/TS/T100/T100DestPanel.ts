module AST {

    export class T100DestPanel extends StandardDestPanel{
        constructor() {
            super();
        }

        public querySegment() {
            if (AST.GlobalStatus.year == null || AST.GlobalStatus.originAirport == null
                || AST.GlobalStatus.destAirport == null || AST.GlobalStatus.flowDir == null)
                return;

            T100.T100DataQuery.queryRoute(AST.GlobalStatus.year, AST.GlobalStatus.originAirport.iata,
                AST.GlobalStatus.destAirport.iata, (routeData, distInfo) => {
                    this.setRouteData(routeData, distInfo);
                });

            this.mapBuddy.selectDestAirportFeature(AST.GlobalStatus.destAirport.iata);
            this.detailReportFootNote.innerHTML = "";
            if (AST.GlobalStatus.destAirport.countryEn != T100.T100MetaData.currentCountry && AST.GlobalStatus.originAirport.countryEn != T100.T100MetaData.currentCountry) {
                this.detailReportFootNote.innerHTML = T100.T100Localization.strings.onlyUSRouteAvailable;
            }
        }

        static createT100DestPanel(): T100DestPanel {
            var destPanel = new T100DestPanel();
            destPanel.mainDiv = document.getElementById("t100DestBarInnerDiv");
            destPanel.routeDistText = document.getElementById("destBarDistance");
            destPanel._totalFlow = document.getElementById("t100DataPanelTotalFlow");

            destPanel._tabs = document.getElementById("t100DataPanelTabs");

            destPanel._tabSummary = document.getElementById("t100DataPanelTabSummary");
            destPanel._tabShare = document.getElementById("t100DataPanelTabsShare");
            destPanel._tabShareTitle = document.getElementById("t100DataPanelTabShareTitle");
            destPanel._divShareChart = document.getElementById("t100DataPanelPieChart");
            destPanel._tabShareFootNote = document.getElementById("t100DataPanelTabShareFootNote");


            destPanel._tabTimeSeries = document.getElementById("t100DataPanelTabTimeSeries");
            destPanel._tabTimeSeriesTitle = document.getElementById("t100DataPanelTabTimeSeriesTitle");
            destPanel._tabTimeSeriesFootNote = document.getElementById("t100DataPanelTabTimeSeriesFootNote");
            destPanel._divTimeSeriesChart = document.getElementById("t100DataPanelTabTimeSeriesChart");

            destPanel._btnDetailReport = document.getElementById("t100DataPanelDetailReportBtn");
            destPanel._btnShowPassenger = document.getElementById("t100DataPanelShowPassenger");
            destPanel._btnShowFreight = document.getElementById("t100DataPanelShowFreight");


            destPanel.initUI();
            return destPanel;
        }
        
    }
} 