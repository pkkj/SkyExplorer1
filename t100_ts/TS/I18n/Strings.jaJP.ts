module AST {
    export class UiStrings_JaJP extends UiStrings {
        constructor() {
            super();
        }

        public largeDivideNum = 1000;

        public appTitle = "スカイエクスプローラー";

        public subtitle = '航空交通データを調査するための強力な型WebGIS <a href="../../info/skyexplorer_t100.html" style="text-decoration:underline">(詳細について)</a>';


        public constructPlaceName(country: string, subdiv: string, city: string): string {
            if (subdiv == "*" || subdiv == "" || subdiv == city)
                return country + "，" + city;
            return country + ", " + subdiv + ", " + city;
        }
    }
} 