module AST {
    export module T100 {
        export class UiStrings_ZhCN extends UiStrings {
            constructor() {
                super();
            }
            public routeLimitToUs = "备注：起点和终点在美国以外的路线无数据";
            public routeNotLimitToUs = "备注：美国航空公司，所有路线数据有效";
            public onlyUSRouteAvailable = "备注：该海外路线仅有美国航空公司的数据";
            public onlyTheDataOfRoutesTowardUS = "备注：只有前往美国境内机场的路线的数据";
            public noOutBoundFlights = "该机场没有离港航班数据。但可能有其他入港航班。";
            public noAvailableDataForThisAirport = "该机场无T100数据。";

            private getTimeScaleText(timeScale: string) {
                if (timeScale == "Year")
                    return "年度";
                else if (timeScale == "Quarter")
                    return "季度";
                else
                    return "每月";
            }

            public timeSeriesTotalPassengerInT100ByTimeScale(dataType: FlowType, timeScale: string): string {
                if (dataType == FlowType.Passenger)
                    return this.getTimeScaleText(timeScale) + "T100数据旅客人次";
                else
                    return this.getTimeScaleText(timeScale) + "T100数据货物运量";
            }

            public timeSeriesThisChartShowTimeScaleData(dataType: FlowType, timeScale: string): string {
                if (dataType == FlowType.Passenger) {
                    if (timeScale != "Month")
                        return "该时间趋势图显示" + this.getTimeScaleText(timeScale) + "T100客运统计数据（单位：万人）";
                    else
                        return "该时间趋势图显示" + this.getTimeScaleText(timeScale) + "T100客运统计数据";
                }
                else
                    return "该时间趋势图显示" + this.getTimeScaleText(timeScale) + "T100货运统计数据（单位：吨）";
            }

            public timeSeriesFlowByTimeScale(timeScale: string): string {
                return this.getTimeScaleText(timeScale) + "统计数据";
            }

            public aircraftPassengerLoadFactorInT100ByTimeScale(timeScale: string): string {
                return this.getTimeScaleText(timeScale) + "T100飞机乘客上座率数据";
            }

            public availableSeatsVsActualPaxByTimeScale(timeScale: string): string {
                return this.getTimeScaleText(timeScale) + "座位供应量与实际发送旅客人数对比";
            }

            public availableSeatsByTimeScale(timeScale: string): string {
                return this.getTimeScaleText(timeScale) + "座位供应量";
            }

            public thisChartShowTheLoadFactor = "该趋势图显示了上座率。计算方法为[实际旅客数] / [供应座位数]. ";
        }
    }
}