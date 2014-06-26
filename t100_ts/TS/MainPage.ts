
module AST {

    export class App {

        // Global variable: control
        static mapControl: OpenLayers.Map = null;
        static t100AirportContent: AirportContent = null;
        static t100AirlineContent: T100AirlineContent = null;
        static activeContent: CommonDataContent = null;
        public dataSrcControl: DataSrcControl = null;
        public mainPageAboutUi: MainPageAboutUi = null;

        constructor() {
            // Initialize the localization object
            Localization.init();
        }

        public adjustSize = () => {
            var defaultMargin: number = 5;
            var titleBarHeight: number = 60;
            var leftBarWidth: number = 340;
            document.getElementById("subContainer").style.height = ($(window).height() - defaultMargin * 3 - titleBarHeight).toString() + 'px';
            document.getElementById("mapContainer").style.width = ($(window).width() - defaultMargin * 3 - leftBarWidth - 8).toString() + 'px';

            if (App.mapControl) {
                setTimeout(() => App.mapControl.updateSize(), 200);
            }
        }

        private initUi() {
            this.mainPageAboutUi = new MainPageAboutUi();
        }

        private prepareData() {
            GlobalMetaData.prepareAirlineData(this.postDataPreparation);
        }

        private postDataPreparation = () => {

            T100.T100Localization.init();

            // Must register MetaData after init the localization object
            DataSourceRegister.registerDataSource("T100", T100.T100MetaData.instance());
            DataSourceRegister.registerDataSource("T100FF", T100.T100FFMetaData.instance());
            DataSourceRegister.registerDataSource("UkData", UkData.UkMetaData.instance());
            DataSourceRegister.registerDataSource("TwData", TwData.TwMetaData.instance());
            DataSourceRegister.registerDataSource("JpData", JpData.JpMetaData.instance());
            DataSourceRegister.registerDataSource("KrData", KrData.KrMetaData.instance());

            KrData.KrDataHTMLPageData.loadHTMLData().done(() => {
                TwData.TwDataHTMLPageData.loadHTMLData().done(() => {
                    T100.T100HTMLPageData.loadHTMLData().done(() => {
                        UkData.UkHTMLPageData.loadHTMLData().done(() => {
                            JpData.JpDataHTMLPageData.loadHTMLData().done(() => {
                                this.dataSrcControl = new AST.DataSrcControl();
                                this.dataSrcControl.showT100DataContent();
                                this.adjustSize();

                                // set up other UI
                                this.initUi();
                            });
                        });
                    });
                });
            });
        }

        public main() {
            // Create the data source panel
            Utils.addEvent(window, "resize", this.adjustSize);
            this.adjustSize();

            /// Map
            App.mapControl = new OpenLayers.Map('openLayerMap', {
                allOverlays: true,
                displayProjection: new OpenLayers.Projection("EPSG:900913")
            });

            MapUtils.createBaseMap(App.mapControl);
            MapUtils.initMapScale(App.mapControl);

            this.prepareData();
        }

    }
}

google.load("visualization", "1", { packages: ["corechart"] });

google.setOnLoadCallback(function () {
    $(function () {
        var app = new AST.App();
        app.main();
    });
});