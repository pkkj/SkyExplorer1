using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using Npgsql;

namespace AST {
    public class Airport {
        public string Code = "";
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
        public Airport( string code, double x, double y, string state, string fullName, string city,
            string country, string icaoCode, string countryID, string iataCode, string note ) {
            this.Code = code;
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
    public class AirportData {
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

        public static string MatchAirport( string input, string locale ) {
            int limit = 10;
            NpgsqlConnection conn = null;
            List<string> lstAirport = new List<string>();
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();

                string sqlIata = "SELECT DISTINCT \"IATA\" FROM \"AirportAvailability\" WHERE \"IATA\" ILIKE " + Utils.SingleQuoteStr( input + "%" );
                NpgsqlCommand commandIata = new NpgsqlCommand( sqlIata, conn );
                NpgsqlDataReader drIata = commandIata.ExecuteReader();
                while ( drIata.Read() ) {
                    lstAirport.Add( drIata[ "IATA" ].ToString() );
                }

                if ( input.Length >= 3 ) {
                    string sqlCity = "SELECT DISTINCT \"IATA\" FROM \"AirportAvailability\" WHERE \"CITY\" ILIKE " + Utils.SingleQuoteStr( input + "%" );
                    NpgsqlCommand commandCity = new NpgsqlCommand( sqlCity, conn );
                    NpgsqlDataReader drCity = commandCity.ExecuteReader();
                    while ( drCity.Read() ) {
                        if ( !lstAirport.Contains( drCity[ "IATA" ].ToString() ) && lstAirport.Count < limit )
                            lstAirport.Add( drCity[ "IATA" ].ToString() );
                    }
                }

            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }
            List<string[]> lstRes = new List<string[]>();
            foreach ( string iata in lstAirport ) {
                Airport airport = AirportData.Query( iata, locale );
                if ( airport == null )
                    continue;
                lstRes.Add( new string[ 3 ] { airport.Iata, airport.City, airport.Country } );
            }
            string res = new JavaScriptSerializer().Serialize( lstRes );
            return res;
        }
    }

    public class AirportN {
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

        public AirportN() {
        }

        public AirportN( string code, string iata, string icao, string country, double x, double y, string location, string serveCity1, string serveCity2, string serveCity3,
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

        public Dictionary<string, object> CastToDict() {
            Dictionary<string, object> dict = new Dictionary<string, object>();
            dict[ "Icao" ] = this.Icao;
            dict[ "Iata" ] = this.Iata;
            dict[ "FullName" ] = this.FullName;
            dict[ "Country" ] = this.Country;
            dict[ "State" ] = "";// TODO 
            dict[ "City" ] = this.ServeCity[ 0 ];
            dict[ "CountryEn" ] = this.Country; // TODO 
            dict[ "FullNameEn" ] = this.FullName;  // TODO 
            dict[ "CityEn" ] = this.ServeCity[ 0 ];  // TODO 
            dict[ "Geometry" ] = this.Geometry.x.ToString() + ", " + this.Geometry.y.ToString();

            return dict;
        }

        public Dictionary<string, object> CastToJsonDict() {
            Dictionary<string, object> dict = new Dictionary<string, object>();
            dict[ "icao" ] = this.Icao;
            dict[ "iata" ] = this.Iata;
            dict[ "fullName" ] = this.FullName;
            dict[ "country" ] = this.Country;
            dict[ "city" ] = this.ServeCity[ 0 ];
            dict[ "state" ] = "";// TODO 
            dict[ "countryEn" ] = this.Country;// TODO 
            dict[ "fullNameEn" ] = this.FullName;// TODO 
            dict[ "cityEn" ] = this.ServeCity[ 0 ];// TODO 
            dict[ "geometry" ] = new Dictionary<string, double>{ 
                {"x", this.Geometry.x}, 
                {"y", this.Geometry.y}
            };

            return dict;
        }

    }

    public class AirportDataN {
        static public Dictionary<string, Dictionary<string, AirportN>> AirportDictionary;

        static public AirportN Query( string code, string locale = "ZHCN" ) {
            AirportN ret = null;
            if ( AirportDictionary.ContainsKey( locale ) && AirportDictionary[ locale ].ContainsKey( code ) )
                ret = AirportDictionary[ locale ][ code ];
            else if ( AirportDictionary[ "ENUS" ].ContainsKey( code ) ) {
                ret = AirportDictionary[ "ENUS" ][ code ];
            }
            if ( ret != null ) {
                //ret.CountryEn = AirportDictionary[ "ENUS" ][ code ].Country;
                //ret.CityEn = AirportDictionary[ "ENUS" ][ code ].City;
                //ret.FullNameEn = AirportDictionary[ "ENUS" ][ code ].FullName;
            }
            return ret;
        }

        /// <summary>
        /// Load the airport data from the database. Replace the old way which uses file as data storage.
        /// </summary>
        static void LoadAirportData() {
            AirportDictionary = new Dictionary<string, Dictionary<string, AirportN>>();
            foreach ( string locale in Localization.UiLocale.Keys ) {
                AirportDictionary[ locale ] = new Dictionary<string, AirportN>();
            }

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();
                string sql = @"SELECT * FROM ""CommonData_Airport"" ";
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    foreach ( string locale in Localization.UiLocale.Keys ) {
                        AirportN airport = new AirportN(
                            dr[ "CODE" ].ToString(),
                            dr[ "IATA" ].ToString(),
                            dr[ "ICAO" ].ToString(),
                            dr[ "COUNTRY" ].ToString(),
                            0, //Convert.ToDouble( dr[ "X" ] ),
                            0, //Convert.ToDouble( dr[ "Y" ] ),
                            dr[ "LOCATION" ].ToString(),
                            dr[ "SERVE_CITY1" ].ToString(),
                            dr[ "SERVE_CITY2" ].ToString(),
                            dr[ "SERVE_CITY3" ].ToString(),
                            dr[ "FULLNAME_" + locale ].ToString(),
                            dr[ "DISPLAY_NAME_" + locale ].ToString(),
                            dr[ "NOTE_" + locale ].ToString() );
                        AirportDictionary[ locale ][ airport.Code ] = airport;
                    }

                }
            } catch ( Exception e ) {
            }
            finally {
                conn.Close();
            }
        }

        static AirportDataN() {
            LoadAirportData();            
        }

        static public string QueryAirportJson( string code, string locale ) {
            AirportN airport = AirportDataN.Query( code, locale );
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

            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }
            List<string[]> lstRes = new List<string[]>();
            foreach ( string iata in lstAirport ) {
                AirportN airport = AirportDataN.Query( iata, locale );
                if ( airport == null )
                    continue;
                lstRes.Add( new string[ 3 ] { airport.Code, airport.ServeCity[0], airport.Country } );
            }
            string res = new JavaScriptSerializer().Serialize( lstRes );
            return res;
        }
    }
}