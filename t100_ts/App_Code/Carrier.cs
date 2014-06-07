﻿using System;
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
        public string Availablity;
        public Carrier ( ) {
        }
        public Carrier ( string code, string fullName, string country, string type, string note, string availablity ) {
            this.Code = code;
            this.FullName = fullName;
            this.Country = country;
            this.Type = type;
            this.Note = note;
            this.Availablity = availablity;
        }
    }

    public partial class CarrierData {
        static public Dictionary<string, Dictionary<string, Carrier>> CarrierDict;

        static public Carrier Query( string code, string locale = "ZHCN" ) {
            Carrier ret = null;
            if ( CarrierDict.ContainsKey(locale) &&  CarrierDict[ locale ].ContainsKey( code ) )
                ret = CarrierDict[ locale ][ code ];
            else if ( CarrierDict[ "ENUS" ].ContainsKey( code ) ) {
                ret = CarrierDict[ "ENUS" ][ code ];
            }
            //if ( ret != null ) {
            //    ret.CountryEn = CarrierDict[ "ENUS" ][ code ].Country;
            // }
            return ret;
        }
        static public Dictionary<string, Carrier> GetAllCarrier( string locale = "ZHCN" ) {
            if ( CarrierDict.ContainsKey( locale ) )
                return CarrierDict[ locale ];
            return CarrierDict[ "ENUS" ];
        }

        static CarrierData() {
            CarrierDict = new Dictionary<string, Dictionary<string, Carrier>>();
            CreateENUSDict();
            CreateZHCNDict();
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
                Aircraft aircraft = new Aircraft(items[ 0 ],items[ 2 ], items[ 3 ] );
                if ( items[ 4 ] == items[ 0 ] && items[ 2 ] == "" )
                    continue;

                AircraftDict[ locale ][ aircraft.BtsCode ] = aircraft;

            }
        }
    }
}