using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using Npgsql;

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

        public Dictionary<string, object> CastToJsonDict() {
            Dictionary<string, object> dict = new Dictionary<string, object>();
            dict[ "icao" ] = this.Icao;
            dict[ "iata" ] = this.Iata;
            dict[ "fullName" ] = this.FullName;
            dict[ "country" ] = this.Country;
            dict[ "city" ] = this.City;
            dict[ "state" ] = this.State;
            dict[ "countryEn" ] = this.CountryEn;
            dict[ "fullNameEn" ] = this.FullNameEn;
            dict[ "cityEn" ] = this.CityEn;
            dict[ "geometry" ] = new Dictionary<string, double>{ 
                {"x", this.Geometry.x}, 
                {"y", this.Geometry.y}
            };

            return dict;
        }
    }
    public partial class AirportData {
        static public Dictionary<string, Dictionary<string, Airport>> AirportDictionary;
        static public Airport Query( string code, string locale = "ZHCN" ) {
            Airport ret = null;
            if ( AirportDictionary.ContainsKey( locale ) && AirportDictionary[ locale ].ContainsKey( code ) )
                ret = AirportDictionary[ locale ][ code ];
            else if ( AirportDictionary[ "ENUS" ].ContainsKey( code ) ) {
                ret = AirportDictionary[ "ENUS" ][ code ];
            }
            if ( ret != null ) {
                ret.CountryEn = AirportDictionary[ "ENUS" ][ code ].Country;
                ret.CityEn = AirportDictionary[ "ENUS" ][ code ].City;
                ret.FullNameEn = AirportDictionary[ "ENUS" ][ code ].FullName;
            }
            return ret;
        }

        /// <summary>
        /// Load the airport data from the database. Replace the old way which uses file as data storage.
        /// </summary>
        static void LoadAirportData( string locale ) {
            NpgsqlConnection conn = null;
            AirportDictionary[ locale ] = new Dictionary<string, Airport>();
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();
                string sql = string.Format( @"SELECT * FROM ""AirportInfo_{0}"" ", locale );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    AirportDictionary[ locale ][ dr[ "CODE" ].ToString() ] = new Airport(
                        dr[ "CODE" ].ToString(),
                        dr[ "BTS_CODE" ].ToString(),
                        Convert.ToDouble( dr[ "X" ] ),
                        Convert.ToDouble( dr[ "Y" ] ),
                        dr[ "STATE" ].ToString(),
                        dr[ "NAME" ].ToString(),
                        dr[ "CITY" ].ToString(),
                        dr[ "COUNTRY" ].ToString(),
                        dr[ "ICAO" ].ToString(),
                        dr[ "COUNTRY_ID" ].ToString(),
                        dr[ "IATA" ].ToString(),
                        dr[ "NOTE" ].ToString()
                        );
                }
            } finally {
                conn.Close();
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