module AST {
    export class UiStrings_JaJP extends UiStrings {
        constructor() {
            super();
        }

        public largeDivideNum = 1000;

        public appTitle = "スカイエクスプローラー";

        public subtitle = '航空交通データを調査するための強力な型WebGIS <a href="../../info/skyexplorer_t100.html" style="text-decoration:underline">(詳細について)</a>';


        public search = "検索";


        public airport = "空港";

        public destinations = "目的地 ";
        public airportDetailReport = "空港詳細レポート";

        public from = "出発";
        public to = "到着";

        public route = "Route";
        public directDistance = "区間距離： ";

        public showInfoFor = "Show info for:";
        public passenger = "旅客便";
        public freight = "貨物便";
        public noDataAvailable = "データなし";
        public passengerFreq = "旅客";
        public freightFreq = "貨物";
        public tons = "トン";

        // Wikipedia Data
        public wikiAirlinesOperatingThisRoute = "運航会社";

        public constructDestNum(num: number): string {
            return "目的地（総数: " + num.toString() + "）";
        }

        public constructPlaceName(country: string, subdiv: string, city: string): string {
            if (subdiv == "*" || subdiv == "" || subdiv == city)
                return country + "，" + city;
            return country + "" + subdiv + "" + city;
        }
    }
} 