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
    }
}