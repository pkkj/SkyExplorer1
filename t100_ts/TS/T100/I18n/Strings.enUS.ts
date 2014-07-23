module AST {
    export module T100 {
        export class UiStrings {
            constructor() {
            }
            public routeLimitToUs = "Note: routes with both origin and destination outside US are not available.";
            public routeNotLimitToUs = "Note: US carrier, all the routes are available.";
            public onlyUSRouteAvailable = "Note: only data of US carriers is available for this foreign route.";
            public noOutBoundFlights = "There is no outbound flights data available for this airport. But it might have inbound traffic.";
            
            public timeSeriesFlowByTimeScale(timeScale: string): string {
                return "Flow by " + timeScale;
            }

            public aircraftPassengerLoadFactorInT100ByTimeScale(timeScale: string): string {
                return "Aircraft Passenger Load Factor in T100 by " + timeScale;
            }
            public availableSeatsVsActualPaxByTimeScale(timeScale: string): string {
                return "Available Seats vs. Actual Passengers by " + timeScale;
            }

            public availableSeatsByTimeScale(timeScale: string): string {
                return "Available Seats by " + timeScale;
            }

            public thisChartShowTheLoadFactor = "This chart show the load factor calculated by [Pax] / [Available Seat]. ";
        }
    }
}