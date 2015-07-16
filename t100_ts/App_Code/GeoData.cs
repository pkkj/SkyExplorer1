using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using Npgsql;

namespace AST {
    public class Country {
        public string Code;
        public string Name;

        public Country( string code, string name ) {
            this.Code = code;
            this.Name = name;
        }
    }

    public class CountryData {
        public static Dictionary<string, Dictionary<string, Country>> CountryDict;

        static CountryData() {
            LoadCountryData();
        }
        private static void LoadCountryData() {
            CountryDict = new Dictionary<string, Dictionary<string, Country>>();
            foreach ( string locale in Localization.UiLocale.Keys ) {
                CountryDict[ locale ] = new Dictionary<string, Country>();
            }

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();
                string sql = @"SELECT * FROM ""CommonData_Country"" ";
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    foreach ( string locale in Localization.UiLocale.Keys ) {
                        Country country = new Country(
                            dr[ "CODE" ].ToString(),
                            dr[ "NAME_" + locale ].ToString() );
                        CountryDict[ locale ][ country.Code ] = country;
                    }
                }
            } finally {
                conn.Close();
            }
        }

        public static string QueryAllCountry( string locale ) {
            if ( CountryDict.ContainsKey( locale ) )
                return new JavaScriptSerializer().Serialize( CountryDict[ locale ] );
            return new JavaScriptSerializer().Serialize( CountryDict[ "ENUS" ] );
        }

        public static Country QueryCountry( string locale, string key ) {
            if ( !CountryDict.ContainsKey( locale ) ) {
                locale = "ENUS";
            }
            if ( !CountryDict[ locale ].ContainsKey( key ) ) {
                return null;
            }
            return CountryDict[ locale ][ key ];
        }
    }


    public class Subdivision {
        public string Key;
        public string Country;
        public string Code;
        public string Name;
        public Subdivision( string key, string country, string code, string name ) {
            this.Key = key;
            this.Country = country;
            this.Code = code;
            this.Name = name;
        }
    }

    public class SubdivisionData {
        public static Dictionary<string, Dictionary<string, Subdivision>> SubdivDict;

        static SubdivisionData() {
            LoadSubdivisionData();
        }
        private static void LoadSubdivisionData() {
            SubdivDict = new Dictionary<string, Dictionary<string, Subdivision>>();
            foreach ( string locale in Localization.UiLocale.Keys ) {
                SubdivDict[ locale ] = new Dictionary<string, Subdivision>();
            }

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();
                string sql = @"SELECT * FROM ""CommonData_Subdivision"" ";
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    foreach ( string locale in Localization.UiLocale.Keys ) {
                        Subdivision subdiv = new Subdivision(
                            dr[ "KEY" ].ToString(),
                            dr[ "COUNTRY" ].ToString(),
                            dr[ "SUBDIVISION" ].ToString(),
                            dr[ "NAME_" + locale ].ToString() );
                        SubdivDict[ locale ][ subdiv.Key ] = subdiv;
                    }
                }
            } finally {
                conn.Close();
            }
        }

        public static Subdivision QuerySubdiv( string locale, string key ) {
            if ( !SubdivDict.ContainsKey( locale ) ) {
                locale = "ENUS";
            }
            if ( !SubdivDict[ locale ].ContainsKey( key ) ) {
                return null;
            }
            return SubdivDict[ locale ][ key ];
        }

        public static string QueryAllSubdiv( string locale, string filterCountry ) {
            if ( !SubdivDict.ContainsKey( locale ) ) {
                locale = "ENUS";
            }

            HashSet<string> filterCountrySet = new HashSet<string>();
            if ( filterCountry != "" ) {
                string[] s = filterCountry.Split( ';' );
                for ( int i = 0; i < s.Length; i++ ) {
                    filterCountrySet.Add( s[ i ] );
                }
            }
            Dictionary<string, string> resDict = new Dictionary<string, string>();
            foreach ( Subdivision subdiv in SubdivDict[ locale ].Values ) {
                if ( filterCountrySet.Contains( subdiv.Country ) )
                    continue;
                resDict[ subdiv.Key ] = subdiv.Name;
            }
            return new JavaScriptSerializer().Serialize( resDict );
        }


    }

    public class City {
        public string Key;
        public string Name;

        public City( string key, string name ) {
            this.Key = key;
            this.Name = name;
        }

        public static string LocalizeLocation( string locale, string location ) {
            City city = CityData.QueryCity( locale, location );
            if ( city == null )
                return location;
            if(city.Name == "*")
                city = CityData.QueryCity( "ENUS", location );
            string[] s = location.Split( ';' );
            return string.Join( ";", new string[] { s[ 0 ], s[ 1 ], city.Name } );
        }

        public static string LocalizeCountryAndSubdiv( string locale, string location ) {            
            string[] s = location.Split( ';' );
            string country = s[ 0 ], subdivision = s[ 1 ];
            if ( subdivision != "*" && !( locale == "ENUS" && country == "US")) {
                subdivision = SubdivisionData.QuerySubdiv( locale, country + ";" + subdivision ).Name;
            }
            country = CountryData.QueryCountry( locale, country ).Name;
            
            return string.Join( ";", new string[] { country, subdivision, s[ 2 ] } );
        }
    }

    public class CityData {
        public static Dictionary<string, Dictionary<string, City>> CityDict;

        static CityData() {
            LoadCityData();
        }
        private static void LoadCityData() {
            CityDict = new Dictionary<string, Dictionary<string, City>>();
            foreach ( string locale in Localization.UiLocale.Keys ) {
                CityDict[ locale ] = new Dictionary<string, City>();
            }

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();
                string sql = @"SELECT * FROM ""CommonData_City"" ";
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    foreach ( string locale in Localization.UiLocale.Keys ) {
                        City country = new City(
                            dr[ "KEY" ].ToString(),
                            dr[ "NAME_" + locale ].ToString() );
                        CityDict[ locale ][ country.Key ] = country;
                    }
                }
            } finally {
                conn.Close();
            }
        }

        public static City QueryCity( string locale, string key ) {
            if ( !CityDict.ContainsKey( locale ) )
                locale = "ENUS";
            if ( !CityDict[ locale ].ContainsKey( key ) )
                return null;
            return CityDict[ locale ][ key ];
        }
    }
}