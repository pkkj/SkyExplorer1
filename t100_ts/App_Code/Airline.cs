using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Npgsql;

namespace AST {
    public class Airline {
        public string Code;
        public string Iata;
        public string FullName;
        public string Country;
        public string Type;
        public string Note;
        public Airline() {
        }
        public Airline( string code, string iata, string fullName, string country, string type, string note ) {
            this.Code = code;
            this.Iata = iata;
            this.FullName = fullName;
            this.Country = country;
            this.Type = type;
            this.Note = note;
        }
        public static string All_AIRLINE = "ALL";
    }

    public partial class AirlineData {
        static public Dictionary<string, Dictionary<string, Airline>> AirlineDict;

        static public Airline Query( string code, string locale = "ZHCN" ) {
            Airline ret = null;
            if ( AirlineDict.ContainsKey( locale ) && AirlineDict[ locale ].ContainsKey( code ) )
                ret = AirlineDict[ locale ][ code ];
            else if ( AirlineDict[ "ENUS" ].ContainsKey( code ) ) {
                ret = AirlineDict[ "ENUS" ][ code ];
            }
            //if ( ret != null ) {
            //    ret.CountryEn = CarrierDict[ "ENUS" ][ code ].Country;
            // }
            return ret;
        }

        static AirlineData() {
            LoadAirlineData();
        }

        /// <summary>
        /// Load the airport data from the database. Replace the old way which uses file as data storage.
        /// </summary>
        static void LoadAirlineData() {

            AirlineDict = new Dictionary<string, Dictionary<string, Airline>>();
            foreach ( string locale in Localization.UiLocale.Keys ) {
                AirlineDict[ locale ] = new Dictionary<string, Airline>();
            }


            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();
                string sql = string.Format( @"SELECT * FROM ""CommonData_Airline"" " );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    foreach ( string locale in Localization.UiLocale.Keys ) {
                        AirlineDict[ locale ][ dr[ "CODE" ].ToString() ] = new Airline(
                        dr[ "CODE" ].ToString(),
                        dr[ "IATA" ].ToString(),
                        dr[ "NAME_" + locale ].ToString(),
                        dr[ "COUNTRY" ].ToString(),
                        dr[ "TYPE" ].ToString(),
                        dr[ "NOTE_" + locale ].ToString() );
                    }

                }

                foreach ( string locale in Localization.UiLocale.Keys ) {
                    if ( locale == "ENUS" ) continue;
                    foreach ( string key in AirlineDict[locale].Keys ) {
                        if ( AirlineDict[ locale ][ key ].FullName == "*" )
                            AirlineDict[ locale ][ key ].FullName = AirlineDict[ "ENUS" ][ key ].FullName;
                        if ( AirlineDict[ locale ][ key ].Note == "*" )
                            AirlineDict[ locale ][ key ].Note = AirlineDict[ "ENUS" ][ key ].Note;
                    }
                }
            } finally {
                conn.Close();
            }
        }
    }


    public class Aircraft {
        public string BtsCode;
        public string FullName;
        public string ShortName;
        public Aircraft( string btscode, string fullName, string shortName ) {
            this.BtsCode = btscode;
            this.FullName = fullName;
            this.ShortName = shortName;
        }
    }

    public partial class AircraftData {
        static public Dictionary<string, Dictionary<string, Aircraft>> AircraftDict;
        static public Aircraft Query( string code, string locale = "ZHCN" ) {
            Aircraft ret = null;
            if ( AircraftDict.ContainsKey( locale ) && AircraftDict[ locale ].ContainsKey( code ) )
                ret = AircraftDict[ locale ][ code ];
            else if ( AircraftDict[ "ENUS" ].ContainsKey( code ) ) {
                ret = AircraftDict[ "ENUS" ][ code ];
            }
            return ret;
        }
        static AircraftData() {
            LoadAircraftData();
        }

        /// <summary>
        /// Load the airport data from the database. Replace the old way which uses file as data storage.
        /// </summary>
        static void LoadAircraftData() {

            AircraftDict = new Dictionary<string, Dictionary<string, Aircraft>>();
            foreach ( string locale in Localization.UiLocale.Keys ) {
                AircraftDict[ locale ] = new Dictionary<string, Aircraft>();
            }

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();
                string sql = string.Format( @"SELECT * FROM ""CommonData_Aircraft"" " );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    foreach ( string locale in Localization.UiLocale.Keys ) {
                        string code = dr[ "BTS_CODE" ].ToString();
                        string fullName = dr[ "FULLNAME_" + locale ].ToString();
                        string shortName = dr[ "SHORTNAME_" + locale ].ToString();
                        AircraftDict[ locale ][ code ] = new Aircraft( code, fullName, shortName );
                    }
                }
            } finally {
                conn.Close();
            }
        }
    }
}