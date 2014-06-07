using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace AST {
    public class Airport {
        public string Code = "";
        public string BtsCode = "";
        public Point Geometry = null;
        public string State = "";
        public string FullName = "";
        public string City = "";
        public string Country = "";
        public string CountryID = "";
        public string Icao = "";
        public string Iata = "";
        public string Note = "";
        public string CountryEn = "";
        public string FullNameEn = "";
        public string CityEn = "";

        public Airport() {
        }
        public Airport( string code, string btsCode, double x, double y, string state, string fullName, string city,
            string country, string icaoCode, string countryID, string iataCode, string note ) {
            this.Code = code;
            this.BtsCode = btsCode;
            this.Geometry = new Point( x, y );
            this.State = state;
            this.FullName = fullName;
            this.City = city;
            this.Country = country;
            this.CountryID = countryID;
            this.Icao = icaoCode;
            this.Iata = iataCode;
            this.Note = note;
        }

        public static string CompressAirportName( string name ) {
            string newName = name;
            newName = newName.Replace( "International", "Intl" );
            newName = newName.Replace( "Regional", "Rgnl" );
            return newName;
        }

        public Dictionary<string, object> CastToDict() {
            Dictionary<string, object> dict = new Dictionary<string, object>();
            dict[ "Icao" ] = this.Icao;
            dict[ "Iata" ] = this.Iata;
            dict[ "FullName" ] = this.FullName;
            dict[ "Country" ] = this.Country;
            dict[ "City" ] = this.City;
            dict[ "State" ] = this.State;
            dict[ "CountryEn" ] = this.CountryEn;
            dict[ "FullNameEn" ] = this.FullNameEn;
            dict[ "CityEn" ] = this.CityEn;
            dict[ "Geometry" ] = this.Geometry.x.ToString() + ", " + this.Geometry.y.ToString();

            return dict;
        }
    }
    public partial class AirportData {
        static public Dictionary<string, Dictionary<string, Airport>> AirportDictionary;
        static public Airport Query( string code, string locale = "ZHCN" ) {
            Airport ret = null;
            if (AirportDictionary.ContainsKey(locale) && AirportDictionary[ locale ].ContainsKey( code ) )
                ret =  AirportDictionary[ locale ][ code ];
            else if ( AirportDictionary[ "ENUS" ].ContainsKey( code ) ) {
                ret =  AirportDictionary[ "ENUS" ][ code ];
            }
            if ( ret != null ) {
                ret.CountryEn = AirportDictionary[ "ENUS" ][ code ].Country;
                ret.CityEn = AirportDictionary[ "ENUS" ][ code ].City;
                ret.FullNameEn = AirportDictionary[ "ENUS" ][ code ].FullName;
            }
            return ret;
        }

        static void LoadAirportData( string locale ) {
            string[] lines = System.IO.File.ReadAllLines( Global.DataDir + "airports-" + locale + ".txt" );
            AirportDictionary[ locale ] = new Dictionary<string, Airport>();
            // Display the file contents by using a foreach loop.

            foreach ( string line in lines ) {
                string[] items;
                items = line.Split( '\t' );

                //code   btsCode    X   Y   state   name        city    country     icao    countryId   iata                note
                //CODE0	 BTS_CODE1	X2	Y3	STATE4	FULL_NAME5	CITY6	COUNTRY7	ICAO8	COUNTRY_ID9	IATA10	Operation11	Note12
                if ( items[ 12 ] == "*" )
                    items[ 12 ] = "";
                AirportDictionary[ locale ][ items[ 0 ] ] = new Airport( items[ 0 ], items[ 1 ],
                    Convert.ToDouble( items[ 2 ] ), Convert.ToDouble( items[ 3 ] ), items[ 4 ], items[ 5 ], items[ 6 ], items[ 7 ], items[ 8 ], items[ 9 ], items[ 10 ], items[ 12 ] );

            }
        }

        static AirportData() {
            AirportDictionary = new Dictionary<string, Dictionary<string, Airport>>();
            LoadAirportData( "ENUS" );
            LoadAirportData( "ZHCN" );
        }
        static public string QueryAirportJson( string code, string locale ) {

            Airport airport = AirportData.Query( code, locale );
            if ( airport == null )
                return "";
            Dictionary<string, object> json = new Dictionary<string, object>() {
                {"icao", airport.Icao},
                {"iata", airport.Iata},
                {"country", airport.Country},
                {"city", airport.City},
                {"name", airport.FullName},
                {"geom", airport.Geometry},
                {"note", airport.Note}

            };
            string jsonStr = new JavaScriptSerializer().Serialize( json );
            return jsonStr;
        }
    }
}