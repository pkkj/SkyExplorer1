module AST {
    export class DestPanel {

        public mainDiv: HTMLElement = null;
        public routeDistText: HTMLElement = null;
        public metricDataAnchor: HTMLElement = null;
        public tabMetricDataText: HTMLElement = null;

        public routeData: Array<RouteRecord> = null;
        public distInfo: DistInfo = null;
        public dataSourceMetaData: DataSourceMetaData = null;
        public panelFootNote: HTMLElement = null;
        public btnDetailReport = null;

        // Map buddy
        public mapBuddy: MapControl = null;

        constructor() {
        }

        public hide() {
            this.mainDiv.style.display = "none";
        }

        public show() {
            this.mainDiv.style.display = "block";

            if (this.metricDataAnchor != null) {
                this.metricDataAnchor.onclick = () => {
                    var src = this.dataSourceMetaData.aboutSrcPageUrl + "?locale=" + Localization.getLocale();
                    DialogUtils.loadDetailReportDialog("About Data Source", src);

                };
                this.metricDataAnchor.innerHTML = this.dataSourceMetaData.getFullInfoLocalizeName();
            }
            this.panelFootNote.innerHTML = this.dataSourceMetaData.getDestPanelFootNote();
            
        }

        public setRouteDistInfo() {
            this.routeDistText.innerHTML = Localization.strings.directDistance + this.distInfo.distKm +
            " km &#8901; " + this.distInfo.distMile + " miles &#8901; " + this.distInfo.distNm + " nm";
        }

        public initUi() {
            // Attach the "show detail route report" handler to button.
            if (this.btnDetailReport) {
                this.btnDetailReport.onclick = () => {
                    if (!AST.GlobalStatus.originAirport || !AST.GlobalStatus.destAirport)
                        return;
                    DialogUtils.launchRouteStat(AST.GlobalStatus.originAirport.code, AST.GlobalStatus.destAirport.code, null /*airline*/, AST.GlobalStatus.year);
                };
            }
        }

        public localizeUi() {
            this.tabMetricDataText.innerHTML = Localization.strings.metricData;
            if (this.btnDetailReport != null) {
                this.btnDetailReport.innerHTML = Localization.strings.routeDetailReport;
            }
        }
        
    }
} 