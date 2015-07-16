using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using Npgsql;

namespace AST {

    public class Airport {
        public string Code;
        public string Iata;
        public string Icao;
        public string Country;
        public Point Geometry;
        public string Location;
        public List<string> ServeCity;
        public string FullName;
        public string DisplayName;
        public string Note;

        public Airport() {
        }

        public Airport( string code, string iata, string icao, string country, double x, double y, string location, string serveCity1, string serveCity2, string serveCity3,
            string fullname, string displayName, string note ) {
            this.Code = code;
            this.Iata = iata;
            this.Icao = icao;
            this.Country = country;
            this.Geometry = new Point( x, y );
            this.Location = location;
            this.ServeCity = new List<string>() { serveCity1 };
            if ( serveCity2 != "" )
                this.ServeCity.Add( serveCity2 );
            if ( serveCity3 != "" )
                this.ServeCity.Add( serveCity3 );
            this.FullName = fullname;
            this.DisplayName = displayName;
            this.Note = note;
        }

        public static string CompressAirportName( string name ) {
            string newName = name;
            newName = newName.Replace( "International", "Intl" );
            newName = newName.Replace( "Regional", "Rgnl" );
            return newName;
        }

        public Dictionary<string, object> CastToDict(string locale) {
            Dictionary<string, object> dict = new Dictionary<string, object>();
            dict[ "Icao" ] = this.Icao;
            dict[ "Iata" ] = this.Iata;
            dict[ "FullName" ] = this.FullName;
            dict[ "DisplayName" ] = this.DisplayName;
            dict[ "City" ] = this.ServeCity[ 0 ];
            dict[ "Geometry" ] = this.Geometry.x.ToString() + ", " + this.Geometry.y.ToString();
            dict[ "X" ] = this.Geometry.x;
            dict[ "Y" ] = this.Geometry.y;

            if ( locale != "ENUS" ) {
                Airport airportEn = AirportData.Query( this.Code, "ENUS" );
                dict[ "FullNameEn" ] = airportEn.FullName;
                dict[ "ServeCity1En" ] = City.LocalizeCountryAndSubdiv( "ENUS", airportEn.ServeCity[ 0 ] );
            }
            return dict;
        }

        public Dictionary<string, object> CastToJsonDict( string locale ) {
            Dictionary<string, object> dict = new Dictionary<string, object>();
            dict[ "icao" ] = this.Icao;
            dict[ "iata" ] = this.Iata;
            dict[ "fullName" ] = this.FullName;
            dict[ "country" ] = this.Country;
            dict[ "serveCityL" ] = City.LocalizeCountryAndSubdiv( locale, this.ServeCity[ 0 ] );
            dict[ "geometry" ] = new Dictionary<string, double>{ 
                {"x", this.Geometry.x}, 
                {"y", this.Geometry.y}
            };

            if ( locale != "ENUS" ) {
                Airport airportEn = AirportData.Query( this.Code, "ENUS" );
                dict[ "fullNameEn" ] = airportEn.FullName;
                dict[ "serveCity1En" ] = City.LocalizeCountryAndSubdiv( "ENUS", airportEn.ServeCity[ 0 ] );
            }

            return dict;
        }

    }

    public class AirportData {
        static public Dictionary<string, Dictionary<string, Airport>> AirportDictionary;

        static public Airport Query( string code, string locale = "ZHCN" ) {
            Airport ret = null;
            if ( AirportDictionary.ContainsKey( locale ) && AirportDictionary[ locale ].ContainsKey( code ) )
                ret = AirportDictionary[ locale ][ code ];
            else if ( AirportDictionary[ "ENUS" ].ContainsKey( code ) ) {
                ret = AirportDictionary[ "ENUS" ][ code ];
            }            
            return ret;
        }

        /// <summary>
        /// Load the airport data from the database. Replace the old way which uses file as data storage.
        /// </summary>
        static void LoadAirportData() {
            AirportDictionary = new Dictionary<string, Dictionary<string, Airport>>();
            foreach ( string locale in Localization.UiLocale.Keys ) {
                AirportDictionary[ locale ] = new Dictionary<string, Airport>();
            }

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();
                string sql = @"SELECT *, ST_X(""GEOM"") AS X, ST_Y(""GEOM"") AS Y FROM ""CommonData_Airport"" ";
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    foreach ( string locale in Localization.UiLocale.Keys ) {
                        Airport airport = new Airport(
                            dr[ "CODE" ].ToString(),
                            dr[ "IATA" ].ToString(),
                            dr[ "ICAO" ].ToString(),
                            dr[ "COUNTRY" ].ToString(),
                            Convert.ToDouble( dr[ "X" ] ),
                            Convert.ToDouble( dr[ "Y" ] ),
                            dr[ "LOCATION" ].ToString(),
                            dr[ "SERVE_CITY1" ].ToString(),
                            dr[ "SERVE_CITY2" ].ToString(),
                            dr[ "SERVE_CITY3" ].ToString(),
                            dr[ "FULLNAME_" + locale ].ToString(),
                            dr[ "DISPLAY_NAME_" + locale ].ToString(),
                            dr[ "NOTE_" + locale ].ToString() );
                        // TODO: localize all the fields related to city
                        airport.ServeCity[ 0 ] = City.LocalizeLocation( locale, airport.ServeCity[ 0 ] );
                        AirportDictionary[ locale ][ airport.Code ] = airport;
                    }

                }
            } finally {
                conn.Close();
            }

            foreach ( string locale in Localization.UiLocale.Keys ) {
                if ( locale == "ENUS" ) continue;
                foreach ( string key in AirportDictionary[ locale ].Keys ) {
                    if ( AirportDictionary[ locale ][ key ].FullName == "*" )
                        AirportDictionary[ locale ][ key ].FullName = AirportDictionary[ "ENUS" ][ key ].FullName;
                    if ( AirportDictionary[ locale ][ key ].DisplayName == "*" )
                        AirportDictionary[ locale ][ key ].DisplayName = AirportDictionary[ "ENUS" ][ key ].DisplayName;
                    if ( AirportDictionary[ locale ][ key ].Note == "*" )
                        AirportDictionary[ locale ][ key ].Note = AirportDictionary[ "ENUS" ][ key ].Note;
                    if ( AirportDictionary[ locale ][ key ].DisplayName == "*" )
                        AirportDictionary[ locale ][ key ].DisplayName = AirportDictionary[ "ENUS" ][ key ].DisplayName;
                }
            }
        }

        static AirportData() {
            LoadAirportData();
        }

        static public string QueryAirportJson( string code, string locale ) {
            Airport airport = AirportData.Query( code, locale );
            if ( airport == null )
                return "";
            Dictionary<string, object> json = new Dictionary<string, object>() {
                {"code", airport.Code},
                {"icao", airport.Icao},
                {"iata", airport.Iata},
                {"country", airport.Country},
                {"city", airport.ServeCity},
                {"name", airport.FullName},
                {"geom", airport.Geometry},
                {"note", airport.Note}
            };
            string jsonStr = new JavaScriptSerializer().Serialize( json );
            return jsonStr;
        }

        public static string MatchAirport( string input, string locale ) {
            int limit = 10;
            NpgsqlConnection conn = null;
            List<string> lstAirport = new List<string>();
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();

                string sqlIata = @"SELECT DISTINCT ""CODE"" FROM ""AirportAvailability"" WHERE ""IATA"" ILIKE " + Utils.SingleQuoteStr( input + "%" );
                NpgsqlCommand commandIata = new NpgsqlCommand( sqlIata, conn );
                NpgsqlDataReader drIata = commandIata.ExecuteReader();
                while ( drIata.Read() ) {
                    lstAirport.Add( drIata[ "CODE" ].ToString() );
                }

                if ( input.Length >= 3 ) {
                    string sqlCity = @"SELECT DISTINCT ""CODE"" FROM ""AirportAvailability"" WHERE ""CITY"" ILIKE " + Utils.SingleQuoteStr( input + "%" );
                    NpgsqlCommand commandCity = new NpgsqlCommand( sqlCity, conn );
                    NpgsqlDataReader drCity = commandCity.ExecuteReader();
                    while ( drCity.Read() ) {
                        if ( !lstAirport.Contains( drCity[ "CODE" ].ToString() ) && lstAirport.Count < limit )
                            lstAirport.Add( drCity[ "CODE" ].ToString() );
                    }
                }

            } finally {
                conn.Close();
            }
            List<string[]> lstRes = new List<string[]>();
            foreach ( string iata in lstAirport ) {
                Airport airport = AirportData.Query( iata, locale );
                if ( airport == null )
                    continue;
                lstRes.Add( new string[ 2 ] { airport.Code, City.LocalizeCountryAndSubdiv( locale, airport.ServeCity[ 0 ] ) } );
            }
            string res = new JavaScriptSerializer().Serialize( lstRes );
            return res;
        }
    }
}