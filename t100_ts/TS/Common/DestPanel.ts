module AST {
    export class DestPanel {

        public mainDiv: HTMLElement = null;
        public routeDistText: HTMLElement = null;

        public routeData: Array<RouteRecord> = null;
        public distInfo: DistInfo = null;
        
        public hide() {
            this.mainDiv.style.display = "none";
        }

        public show() {
            this.mainDiv.style.display = "block";
        }

        public setRouteDistInfo() {
            this.routeDistText.innerHTML = Localization.strings.directDistance + this.distInfo.distKm +
            " km &#8901; " + this.distInfo.distMile + " miles &#8901; " + this.distInfo.distNm + " nm";
        }
    }
} 