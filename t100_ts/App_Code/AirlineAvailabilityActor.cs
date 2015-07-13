using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using Npgsql;

namespace AST {

    public class AirlineAvailabilityActor {

        /// <summary>
        /// Query the year availability of the given airline in given data source
        /// </summary>
        /// <returns>A sample return is: 90,91,92,93,94,95,96,97,98,99,00,01,02,03,04,05,06,07,08,09,10,11,12,13,14</returns>
        public static string QueryAirlineYearAvailability( string airline, string dataSrc, string locale = "ENUS" ) {
            NpgsqlConnection conn = null;
            List<string> years = new List<string>();
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();
                string sql = string.Format( @"SELECT ""YEAR"" FROM ""AirlineAvailability"" WHERE ""CODE""='{0}' AND ""DATA_SOURCE""='{1}'", airline, dataSrc );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    years.Add( dr[ "YEAR" ].ToString() );
                }
            } finally {
                conn.Close();
            }
            years.Sort();
            for ( int i = 0; i < years.Count; i++ ) {
                years[ i ] = years[ i ].Substring( 2 );
            }
            return string.Join( ",", years.ToArray() );
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
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();
                string where = "";
                if ( strListDataSrc != "" ) {
                    List<string> lstDataSrc = new List<string>( strListDataSrc.Split( ',' ) );
                    foreach ( string dataSrc in lstDataSrc ) {
                        if ( where != "" )
                            where += " OR ";
                        where += string.Format( @" ""DATA_SOURCE""= '{0}'", dataSrc );
                    }
                    where = " ( " + where + " ) ";
                }
                if ( year != "" ) {
                    if ( where != "" )
                        where += " AND ";
                    where = string.Format( @" ""YEAR"" = '{0}' ", year );
                }
                if ( where != "" )
                    where = " WHERE " + where;
                string sql = string.Format( @"SELECT DISTINCT ""CODE"" FROM ""AirlineAvailability"" {0} ", where );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                Dictionary<string, Airline> airlines = new Dictionary<string, Airline>();

                while ( dr.Read() ) {
                    string airline = dr[ "CODE" ].ToString();
                    if ( airline == Airline.All_AIRLINE )
                        continue;
                    Airline item = AirlineData.Query( airline, locale );
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

            } finally {
                conn.Close();
            }
            return "[" + res + "]";
        }

    }
}