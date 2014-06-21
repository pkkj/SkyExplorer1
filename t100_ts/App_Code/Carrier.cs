using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AST {
    public class Carrier {
        public string Code;
        public string FullName;
        public string Country;
        public string Type;
        public string Note;
        public Carrier() {
        }
        public Carrier( string code, string fullName, string country, string type, string note ) {
            this.Code = code;
            this.FullName = fullName;
            this.Country = country;
            this.Type = type;
            this.Note = note;
        }
    }

    public partial class CarrierData {
        static public Dictionary<string, Dictionary<string, Carrier>> CarrierDict;
        static public Dictionary<string, string> AirlineInDb;
        static public Dictionary<string, HashSet<string>> SetAirlineInDb;
        static public Dictionary<string, Dictionary<string, string>> AirlineAvailability;

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

        static public HashSet<string> GetAvailableAirlineInDb_HashSet( string dataSrc ) {
            List<string> lstDataSrc;
            if ( dataSrc == "" ) {
                lstDataSrc = AirlineInDb.Keys.ToList();
            } else {
                lstDataSrc = new List<string>( dataSrc.Split( ',' ) );
            }

            HashSet<string> availableAirport = new HashSet<string>();
            foreach ( string src in lstDataSrc ) {
                if ( SetAirlineInDb.ContainsKey( src ) ) {
                    availableAirport.UnionWith( SetAirlineInDb[ src ] );
                }
            }
            return availableAirport;
        }

        static public Dictionary<string, Carrier> GetAvailableAirlineInDb( string dataSrc, string locale = "ENUS" ) {
            HashSet<string> availableAirport = GetAvailableAirlineInDb_HashSet( dataSrc );
            Dictionary<string, Carrier> airlines = new Dictionary<string, Carrier>();
            foreach ( string airline in availableAirport ) {
                airlines.Add( airline, CarrierDict[ locale ][ airline ] );
            }
            return airlines;
        }

        static public Dictionary<string, Carrier> GetAllCarrier( string locale = "ZHCN" ) {
            if ( CarrierDict.ContainsKey( locale ) )
                return GetAvailableAirlineInDb( "", locale );
            return GetAvailableAirlineInDb( "", "ENUS" );
        }

        static CarrierData() {
            CarrierDict = new Dictionary<string, Dictionary<string, Carrier>>();
            LoadCarrierData( "ENUS" );
            LoadCarrierData( "ZHCN" );

            AirlineInDb = new Dictionary<string, string>();
            SetAirlineInDb = new Dictionary<string, HashSet<string>>();
            LoadAirlineInDb( "TwData" );
            LoadAirlineInDb( "T100" );

            AirlineAvailability = new Dictionary<string, Dictionary<string, string>>();
            LoadYearAvailability( "TwData" );
            LoadYearAvailability( "T100" );
        }

        static void LoadCarrierData( string locale ) {
            string[] lines = System.IO.File.ReadAllLines( Global.DataDir + "airlines-" + locale + ".txt" );
            CarrierDict[ locale ] = new Dictionary<string, Carrier>();
            // Display the file contents by using a foreach loop.

            foreach ( string line in lines ) {
                string[] items;
                items = line.Split( '\t' );
                Carrier airline = new Carrier( items[ 0 ], items[ 1 ], items[ 2 ], items[ 3 ], items[ 5 ] );

                CarrierDict[ locale ][ airline.Code ] = airline;

            }
        }

        static void LoadYearAvailability( string dataSrc ) {
            AirlineAvailability[ dataSrc ] = new Dictionary<string, string>();
            string[] lines = System.IO.File.ReadAllLines( Global.DataDir + @"AirlineAvailability\" + dataSrc + ".txt" );
            foreach ( string line in lines ) {
                string[] items = line.Split( ',' );
                string year = items[ 0 ];
                int _year = Convert.ToInt32( year ) % 1000;
                year = _year.ToString();
                for ( int i = 1; i < items.Length; i++ ) {
                    if ( !AirlineAvailability[ dataSrc ].ContainsKey( items[ i ] ) )
                        AirlineAvailability[ dataSrc ][ items[ i ] ] = "";
                    if ( AirlineAvailability[ dataSrc ][ items[ i ] ] != "" )
                        AirlineAvailability[ dataSrc ][ items[ i ] ] += ",";
                    AirlineAvailability[ dataSrc ][ items[ i ] ] += year;
                }
            }
        }

        static void LoadAirlineInDb( string dataSrc ) {
            string[] lines = System.IO.File.ReadAllLines( Global.DataDir + @"AirlineInDb\" + dataSrc + ".txt" );
            SetAirlineInDb[ dataSrc ] = new HashSet<string>();
            string airlines = "";
            foreach ( string line in lines ) {
                if ( airlines != "" )
                    airlines += ",";
                airlines += line.Trim();
                SetAirlineInDb[ dataSrc ].Add( line.Trim() );
            }
            AirlineInDb[ dataSrc ] = airlines;
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

        static void LoadAircraftData( string locale ) {
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
    }
}