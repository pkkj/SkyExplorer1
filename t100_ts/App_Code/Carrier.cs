using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Npgsql;

namespace AST {
    public class Carrier {
        public string Code;
        public string Iata;
        public string FullName;
        public string Country;
        public string Type;
        public string Note;
        public Carrier() {
        }
        public Carrier( string code, string iata, string fullName, string country, string type, string note ) {
            this.Code = code;
            this.Iata = iata;
            this.FullName = fullName;
            this.Country = country;
            this.Type = type;
            this.Note = note;
        }
    }

    public partial class CarrierData {
        static public Dictionary<string, Dictionary<string, Carrier>> CarrierDict;

        static public Carrier Query( string code, string locale = "ZHCN" ) {
            Carrier ret = null;
            if ( CarrierDict.ContainsKey( locale ) && CarrierDict[ locale ].ContainsKey( code ) )
                ret = CarrierDict[ locale ][ code ];
            else if ( CarrierDict[ "ENUS" ].ContainsKey( code ) ) {
                ret = CarrierDict[ "ENUS" ][ code ];
            }
            //if ( ret != null ) {
            //    ret.CountryEn = CarrierDict[ "ENUS" ][ code ].Country;
            // }
            return ret;
        }

        static CarrierData() {
            CarrierDict = new Dictionary<string, Dictionary<string, Carrier>>();
            LoadCarrierData( "ENUS" );
            LoadCarrierData( "ZHCN" );
        }

        static void LoadCarrierDataOld( string locale ) {
            string[] lines = System.IO.File.ReadAllLines( Global.DataDir + "airlines-" + locale + ".txt" );
            CarrierDict[ locale ] = new Dictionary<string, Carrier>();

            foreach ( string line in lines ) {
                string[] items;
                items = line.Split( '\t' );
                Carrier airline = new Carrier( items[ 0 ], items[ 1 ], items[ 2 ], items[ 3 ], items[ 4 ], items[ 6 ] );
                CarrierDict[ locale ][ airline.Code ] = airline;
            }
        }

        /// <summary>
        /// Load the airport data from the database. Replace the old way which uses file as data storage.
        /// </summary>
        static void LoadCarrierData( string locale ) {
            NpgsqlConnection conn = null;
            CarrierDict[ locale ] = new Dictionary<string, Carrier>();
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();
                string sql = string.Format( @"SELECT * FROM ""AirlineInfo_{0}"" ", locale );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    CarrierDict[ locale ][ dr[ "CODE" ].ToString() ] = new Carrier(
                        dr[ "CODE" ].ToString(),
                        dr[ "IATA" ].ToString(),
                        dr[ "NAME" ].ToString(),
                        dr[ "COUNTRY" ].ToString(),
                        dr[ "TYPE" ].ToString(),
                        dr[ "NOTE" ].ToString()
                    );
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
            AircraftDict = new Dictionary<string, Dictionary<string, Aircraft>>();
            LoadAircraftData( "ENUS" );
            LoadAircraftData( "ZHCN" );
        }

        static void LoadAircraftDataOld( string locale ) {
            string[] lines = System.IO.File.ReadAllLines( Global.DataDir + "Aircraft-" + locale + ".txt" );
            AircraftDict[ locale ] = new Dictionary<string, Aircraft>();
            // Display the file contents by using a foreach loop.

            foreach ( string line in lines ) {
                string[] items;
                items = line.Split( '\t' );
                Aircraft aircraft = new Aircraft( items[ 0 ], items[ 2 ], items[ 3 ] );
                if ( items[ 4 ] == items[ 0 ] && items[ 2 ] == "" )
                    continue;

                AircraftDict[ locale ][ aircraft.BtsCode ] = aircraft;

            }
        }

        /// <summary>
        /// Load the airport data from the database. Replace the old way which uses file as data storage.
        /// </summary>
        static void LoadAircraftData( string locale ) {
            NpgsqlConnection conn = null;
            AircraftDict[ locale ] = new Dictionary<string, Aircraft>();
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();
                string sql = string.Format( @"SELECT * FROM ""AircraftInfo_{0}"" ", locale );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    string code = dr[ "BTSCODE" ].ToString();
                    string shortName = dr[ "SHORT_NAME" ].ToString();
                    string fullName = dr[ "FULL_NAME" ].ToString();
                    string redirect = dr[ "REDIRECT" ].ToString();

                    if ( code == redirect && fullName == "" ) continue;

                    AircraftDict[ locale ][ code ] = new Aircraft( code, fullName, shortName );
                }
            } finally {
                conn.Close();
            }
        }
    }
}