using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using Npgsql;

namespace AST {

    public class AirportAvailabilityActor {
        // TODO: Pay attention to T100FF data
        public static string QueryAirportYearAvailability( string airportCode, string codeType, string dataSrc, string locale ) {
            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();
                // Only support IATA code
                string sqlIata = "SELECT \"AVAILABILITY\" FROM \"AirportAvailability\" WHERE \"IATA\" = " + Utils.SingleQuoteStr( airportCode )
                    + " AND \"DATA_SOURCE\" = \'" + dataSrc + "\'";

                NpgsqlCommand command = new NpgsqlCommand( sqlIata, conn );
                NpgsqlDataReader dr = command.ExecuteReader();

                Airport airport = AirportData.Query( airportCode, locale );
                if ( airport == null ) return "";

                while ( dr.Read() ) {
                    Dictionary<string, object> res = new Dictionary<string, object>() {
                        {"iata", airport.Iata},
                        {"icao", airport.Icao},
                        {"country", airport.Country},
                        {"city", airport.City},
                        {"name", airport.FullName},
                        {"note", airport.Note},
                        {"countryEn", airport.CountryEn},
                        {"nameEn", airport.FullNameEn},
                        {"cityEn", airport.CityEn},
                        {"yearAvailability", dr[ "AVAILABILITY" ].ToString()}
                    };
                    return new JavaScriptSerializer().Serialize( res );
                }

            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }
            return "";
        }

        /// <summary>
        /// Query the available data sources of an aiport, regardless year.
        /// </summary>
        public static string QueryAirportAvailableDataSource( string airportCode, string locale ) {
            Airport airport = AirportData.Query( airportCode, locale );
            if ( airport == null ) return "";

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();

                string sql = string.Format( @"SELECT ""DATA_SOURCE"" FROM ""AirportAvailability"" WHERE ""IATA"" = {0}", Utils.SingleQuoteStr( airportCode ) ); // Only support IATA code
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();

                List<string> lstResult = new List<string>();
                // Determine the primate data source of the given airport
                string primaryDataSrc = DataSourceRegister.QueryCountryByDataSrc( airport.CountryEn );
                if ( primaryDataSrc != "" ) {
                    lstResult.Add( primaryDataSrc );
                }
                while ( dr.Read() ) {
                    string dataSrc = dr[ "DATA_SOURCE" ].ToString();
                    if ( dataSrc != primaryDataSrc ) {
                        lstResult.Add( dataSrc );
                    }
                }
                return new JavaScriptSerializer().Serialize( lstResult );
            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }
            return "";
        }

    }
}