module AST {
    export class Point {
        public x: number;
        public y: number;
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }

    export class Airport {
        public iata: string;
        public icao: string;
        public city: string;
        public country: string;
        public name: string;   
        public countryEn: string; // The English name of country     
        public nameEn: string; // The English name of airport name
        public cityEn: string; // The English name of city
        public geom: AST.Point = null;
        public geomO: OpenLayers.Geometry = null; // OpenLayers geom

        constructor(icao: string, iata: string, country: string, city: string, name: string, geom: AST.Point) {
            this.icao = icao;
            this.iata = iata;            
            this.city = city;
            this.country = country;
            this.name = name;
            this.geom = geom;
        }
    }

    export class AirlineBase {
        public code: string;
        public name: string;
        public getDisplayName(): string {
            return this.name + " (" + this.code + ")";
        }
        constructor(code: string, name: string) {
            this.code = code;
            this.name = name;
        }
    }

    export class Airline {
        public code: string;
        public name: string;
        public country: string;
        public type: AirlineType;
        public note: string;

        constructor(code: string, name: string, country: string, type: string, note: string) {
            this.code = code;
            this.name = name;
            this.country = country;
            if (type == "Passenger")
                this.type = AirlineType.Passenger;
            else
                this.type = AirlineType.CargoOnly;
            this.note = note;
        }
    }

    export class YearMonth {
        public year: number;
        public month: number;
        constructor(year: number, month: number) {
            this.year = year;
            this.month = month;
        }
    }

    export class DistInfo {
        public distKm: number;
        public distNm: number;
        public distMile: number;
        constructor(distKm: number, distNm: number, distMile: number) {
            this.distKm = distKm;
            this.distNm = distNm;
            this.distMile = distMile;
        }
    }

    /// The destination with route geometry and basic statistic
    export class DestInfo {
        public airport: Airport = null;
        public dataSource: string = "";
        public sumPax: number;
        public sumFreight: number;
        public routeGeomS: string; // Geometry in string
        public routeGeomO: Array<OpenLayers.Feature.Vector>; // Geometry in OpenLayers 
        public availableData: Array<DataSrcDestInfo>;

        constructor() {
            this.availableData = [];
        }
        public hasPaxFlow(): boolean {
            for (var i = 0; i < this.availableData.length; i++) {
                if (this.availableData[i].totalPax) {
                    return true;
                }
                return false;
            }
        }

        public isPartialData(): boolean {
            for (var i = 0; i < this.availableData.length; i++) {
                if (!this.availableData[i].partialData) {
                    return false;
                }
                return true;
            }
        }
    }

    export class DataSrcDestInfo {
        public dataSrcName: string;
        public totalPax: number;
        public totalFreight: number;
        public partialData: boolean;

        constructor(dataSrcName, totalPax, totalFreight, partialData) {
            this.dataSrcName = dataSrcName;
            this.totalPax = totalPax;
            this.totalFreight = totalFreight;
            this.partialData = partialData;
        }
    }

    export class RouteRecord {
        public airline: AirlineBase = null;
        public departure: number = null;
        public pax: number = null;
        public freight: number = null;
        public monthDeparture: Array<number> = null;
        public monthPax: Array<number> = null;
        public monthFreight: Array<number> = null;
    }

    export enum AirlineType {
        Passenger, CargoOnly
    }

    export enum FlowType {
        Passenger, Freight
    }
    export class DataSourceRegister {
        static nameMap = {};
        static dataSrcList: Array<DataSourceMetaData> = [];

        static registerDataSource(name: string, info: DataSourceMetaData) {
            DataSourceRegister.dataSrcList.push(info);
            DataSourceRegister.nameMap[name] = info;
        }

        
        static queryInfo(name: string): DataSourceMetaData {
            return DataSourceRegister.nameMap[name];
        }
    }

    export class DataSourceMetaData {
        public name: string;
        public shortInfo: string;
        public fullInfo: string;
        public aboutSrcPageUrl: string;
        public supportAirportReportPage: boolean;
        constructor() {
            this.supportAirportReportPage = false;
        }

        public getDestPanelFootNote(): string {
            return "";
        }

        public getShortInfoLocalizeName(): string {
            return "";
        }
        public getFullInfoLocalizeName(): string {
            return "";
        }

        public dateFrom() {
            return GlobalMetaData.dataFrom;
        }

        public dataTo() {
            return GlobalMetaData.dataTo;
        }
    }
}