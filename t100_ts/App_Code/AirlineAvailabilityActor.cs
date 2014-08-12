using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using Npgsql;

namespace AST {

    public class AirlineAvailabilityActor {

        public static string QueryAirlineYearAvailability( string airportCode, string codeType, string dataSrc, string locale ) {
            return "";
        }

        /// <summary>
        /// Query the available airlines of given data sources and given year
        /// </summary>
        /// <param name="strListDataSrc">The required data sources. Empty string means all the data sources. Multiple data sources are splitted by ","</param>
        /// <param name="year">The required year. Empty year means all the years</param>
        /// <returns></returns>
        public static string QueryAvailableAirlineByDataSource( string strListDataSrc, string year, string locale ) {
            NpgsqlConnection conn = null;
            string res = "";
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();
                string where = "";
                if ( strListDataSrc != "" ) {
                    List<string> lstDataSrc = new List<string>( strListDataSrc.Split( ',' ) );
                    foreach ( string dataSrc in lstDataSrc ) {
                        if ( where != "" )
                            where += " OR ";
                        where += string.Format( @" ""DATA_SOURCE""= {0}", Utils.SingleQuoteStr( dataSrc ) );
                    }
                    where = " ( " + where + " ) ";
                }
                if ( year != "" ) {
                    if ( where != "" )
                        where += " AND ";
                    where = string.Format( @" ""YEAR"" = {0} ", Utils.SingleQuoteStr( year ) );
                }
                if ( where != "" )
                    where = " WHERE " + where;
                string sql = string.Format( @"SELECT DISTINCT ""CODE"" FROM ""AirlineAvailability"" {0} ", where ); // Only support IATA code
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                Dictionary<string, Carrier> airlines = new Dictionary<string, Carrier>();
                
                while ( dr.Read() ) {
                    string airline = dr[ "CODE" ].ToString();
                    if ( airline == "ANY" )
                        continue;
                    Carrier item = CarrierData.Query( airline, locale );
                    if ( res != "" )
                        res += ",";
                    res += string.Format( "[{0}, {1}, {2}, {3}, {4}, {5}]",
                        Utils.DoubleQuoteStr( item.Code ),
                        Utils.DoubleQuoteStr( item.Iata ),
                        Utils.DoubleQuoteStr( item.FullName ),
                        Utils.DoubleQuoteStr( item.Country ),
                        Utils.DoubleQuoteStr( item.Type ),
                        Utils.DoubleQuoteStr( item.Note ) );
                }

            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }
            return "[" + res + "]";
        }

    }
}