module AST {

    export class T100DestPanel extends StandardDestPanel{
        public $radioFlowType: string = null;
        public showInfoText: HTMLElement = null;
        public $btnShowPassenger: string = null;
        public $btnShowFreight: string = null;

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
        }

        public initUi() {
            super.initUi();

            $(this.$radioFlowType).buttonset();
            $(this.$radioFlowType + " :radio").click((e) => {
                if (this._btnShowPassenger.checked)
                    this.setShowFlowType(FlowType.Passenger);
                else
                    this.setShowFlowType(FlowType.Freight);
            });

            this.localizeUi();
        }

        public localizeUi() {
            super.localizeUi();
            this.showInfoText.innerHTML = Localization.strings.showInfoFor;
            $(this.$btnShowPassenger).button("option", "label", Localization.strings.passenger);
            $(this.$btnShowFreight).button("option", "label", Localization.strings.freight);
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

            destPanel.btnDetailReport = document.getElementById("t100DataPanelDetailReportBtn");
            destPanel._btnShowPassenger = document.getElementById("t100DataPanelShowPassenger");
            destPanel._btnShowFreight = document.getElementById("t100DataPanelShowFreight");

            destPanel.panelFootNote = document.getElementById("t100DataPanelDetailReportFootNote");
            destPanel.metricDataAnchor = document.getElementById("t100DataPanelTabsMetricDataAnchor");
            destPanel.tabMetricDataText = document.getElementById("t100DataPanelTabsMetricDataText");
            destPanel.liTabSummary = document.getElementById("liT100DataPanelTabSummary");
            destPanel.liTabShare = document.getElementById("liT100DataPanelTabShare");
            destPanel.liTabTimeSeries = document.getElementById("liT100DataPanelTabTimeSeries");
            destPanel.timeSeriesLegend = document.getElementById("t100DataPanelTabTimeSeriesLegend");
            destPanel.$tab = $("#t100DataPanelTabs");
            destPanel.$$timeSeriesChart = "#t100DataPanelTabTimeSeriesChart";
            destPanel.$$$liT100DataPanelTabSummary = "liT100DataPanelTabSummary";
            destPanel.$$$liTabShare = "liT100DataPanelTabShare";
            destPanel.$$$liTabTimeSeries = "liT100DataPanelTabTimeSeries";

            destPanel.$radioFlowType = "#t100DestBarRadioFlowType";
            destPanel.showInfoText = document.getElementById("t100DestBarShowInfoForText");
            destPanel.$btnShowPassenger = "#t100DataPanelShowPassenger";
            destPanel.$btnShowFreight = "#t100DataPanelShowFreight";

            destPanel.dataSourceMetaData = T100.T100MetaData.instance();
            destPanel.initUi();
            return destPanel;
        }
        
        static createT100FFDestPanel(): T100DestPanel {
            var destPanel = new T100DestPanel();
            destPanel.mainDiv = document.getElementById("t100FFDestBarInnerDiv");
            destPanel.routeDistText = document.getElementById("destBarDistance");
            destPanel._totalFlow = document.getElementById("t100FFDataPanelTotalFlow");

            destPanel._tabs = document.getElementById("t100FFDataPanelTabs");

            destPanel._tabSummary = document.getElementById("t100FFDataPanelTabSummary");
            destPanel._tabShare = document.getElementById("t100FFDataPanelTabsShare");
            destPanel._tabShareTitle = document.getElementById("t100FFDataPanelTabShareTitle");
            destPanel._divShareChart = document.getElementById("t100FFDataPanelPieChart");
            destPanel._tabShareFootNote = document.getElementById("t100FFDataPanelTabShareFootNote");

            destPanel._tabTimeSeries = document.getElementById("t100FFDataPanelTabTimeSeries");
            destPanel._tabTimeSeriesTitle = document.getElementById("t100FFDataPanelTabTimeSeriesTitle");
            destPanel._tabTimeSeriesFootNote = document.getElementById("t100FFDataPanelTabTimeSeriesFootNote");
            destPanel._divTimeSeriesChart = document.getElementById("t100FFDataPanelTabTimeSeriesChart");

            destPanel.btnDetailReport = document.getElementById("t100FFDataPanelDetailReportBtn");
            destPanel._btnShowPassenger = document.getElementById("t100FFDataPanelShowPassenger");
            destPanel._btnShowFreight = document.getElementById("t100FFDataPanelShowFreight");

            destPanel.panelFootNote = document.getElementById("t100FFDataPanelDetailReportFootNote");
            destPanel.metricDataAnchor = document.getElementById("t100FFDataPanelTabsMetricDataAnchor");
            destPanel.tabMetricDataText = document.getElementById("t100FFDataPanelTabsMetricDataText");
            destPanel.liTabSummary = document.getElementById("liT100FFDataPanelTabSummary");
            destPanel.liTabShare = document.getElementById("liT100FFDataPanelTabShare");
            destPanel.liTabTimeSeries = document.getElementById("liT100FFDataPanelTabTimeSeries");
            destPanel.timeSeriesLegend = document.getElementById("t100FFDataPanelTabTimeSeriesLegend");
            destPanel.$tab = $("#t100FFDataPanelTabs");
            destPanel.$$timeSeriesChart = "#t100FFDataPanelTabTimeSeriesChart";
            destPanel.$$$liT100DataPanelTabSummary = "liT100FFDataPanelTabSummary";
            destPanel.$$$liTabShare = "liT100FFDataPanelTabShare";
            destPanel.$$$liTabTimeSeries = "liT100FFDataPanelTabTimeSeries";

            destPanel.$radioFlowType = "#t100FFDestBarRadioFlowType";
            destPanel.showInfoText = document.getElementById("t100FFDestBarShowInfoForText");
            destPanel.$btnShowPassenger = "#t100FFDataPanelShowPassenger";
            destPanel.$btnShowFreight = "#t100FFDataPanelShowFreight";

            destPanel.dataSourceMetaData = T100.T100FFMetaData.instance();
            destPanel.initUi();
            return destPanel;
        }
    }
} 