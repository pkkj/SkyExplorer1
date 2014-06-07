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
            return this.name + "(" + this.code + ")";
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
        public availability: string;

        constructor(code: string, name: string, country: string, type: string, note: string, availability: string) {
            this.code = code;
            this.name = name;
            this.country = country;
            if (type == "Passenger")
                this.type = AirlineType.Passenger;
            else
                this.type = AirlineType.CargoOnly;
            this.note = note;
            this.availability = availability;
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

    export class DestInfo {
        public airport: Airport = null;
        public dataSource: string = "";
        public sumPax: number;
        public sumFreight: number;
        public routeGeomS: string; // Geometry in string
        public routeGeomO: Array<OpenLayers.Feature.Vector>; // Geometry in OpenLayers 
    }

    export enum AirlineType {
        Passenger, CargoOnly
    }
}