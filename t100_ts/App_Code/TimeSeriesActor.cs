using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Npgsql;

namespace AST {
    public class TimeSeriesActor {

        public const string AnyAirline = "ANY";

        /// <summary>
        /// Query which data source could provide the airport time series statistics for the given airport
        /// </summary>
        /// <param name="airport"></param>
        /// <returns>The data source. Currently we only allow one data source to provide airport time series data</returns>
        public static string QueryAirportTimeSeriesAvailability(string airport) {
            foreach(KeyValuePair<string, ADataSourceMetaData> item in DataSourceRegister.Register){
                if ( (item.Value.StatTarget & StatTarget.Airport) == 0 )
                    continue;
                if ( item.Value.isAirportTimeSeriesCovered( airport ) )
                    return item.Key;
            }
            return "";
        }

        /// <summary>
        /// Query the time series of an airport
        /// </summary>
        /// <returns></returns>
        public static string QueryAirportTimeSeries( string dataSrc, string origin ) {
            // Change the behavior. There is no freedom for the client to specify which data source to use for airport time series data.
            dataSrc = QueryAirportTimeSeriesAvailability( origin );
            if ( dataSrc == null )
                return "";

            ADataSourceMetaData metaData = null;
            if ( !DataSourceRegister.Register.TryGetValue( dataSrc, out metaData ) ) {
                return "";
            }

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();

                string[] fields = new string[] { Utils.DoubleQuoteStr( "AIRLINE" ), Utils.DoubleQuoteStr( "FLOW_TYPE" ), Utils.DoubleQuoteStr( "TIME_SERIES" ) };
                string fieldStr = String.Join( ",", fields );
                string sql = string.Format( @"SELECT {0} FROM ""{1}"" WHERE ""ORIGIN""= {2}", fieldStr, metaData.AirportTimeSeriesTableName, Utils.SingleQuoteStr( origin ) );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                string jsonPax = "";
                string jsonFreight = "";
                while ( dr.Read() ) {
                    if ( dr[ "FLOW_TYPE" ].ToString() == "Pax" ) {
                        if ( jsonPax != "" )
                            jsonPax += ",";
                        jsonPax += string.Format( "{0}:{1}", Utils.DoubleQuoteStr( dr[ "AIRLINE" ].ToString() ), dr[ "TIME_SERIES" ].ToString() );
                    } else if ( dr[ "FLOW_TYPE" ].ToString() == "Freight" ) {
                        if ( jsonFreight != "" )
                            jsonFreight += ",";
                        jsonFreight += string.Format( "{0}:{1}", Utils.DoubleQuoteStr( dr[ "AIRLINE" ].ToString() ), dr[ "TIME_SERIES" ].ToString() );
                    }
                }

                return String.Format( @"{{""pax"": {{ {0} }}, ""freight"": {{ {1} }} }}", jsonPax, jsonFreight );
            } catch ( NpgsqlException e ) {

            } finally {
                conn.Close();
            }
            return "";
        }

        /// <summary>
        /// Query the time series of a route
        /// </summary>
        /// <param name="flowType">The query type: "pax;freight": query the flow and "seat": query the seat and load factor</param>
        /// <returns></returns>
        public static string QueryRouteTimeSeries( string dataSrc, string origin, string dest, string flowType, string locale ) {
            // Get the meta data of specific data source
            ADataSourceMetaData metaData = null;
            if ( !DataSourceRegister.Register.TryGetValue( dataSrc, out metaData ) ) {
                return "";
            }

            NpgsqlConnection conn = null;
            try {

                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();
                string condition = "";
                if ( flowType == "pax;freight" )
                    condition = @" AND ( ""FLOW_TYPE"" = 'Pax' OR ""FLOW_TYPE"" = 'Freight') ";
                else if ( flowType == "seat" )
                    condition = @" AND ( ""FLOW_TYPE"" = 'Pax' OR ""FLOW_TYPE"" = 'Seat') ";

                string[] fields = new string[] { Utils.DoubleQuoteStr( "AIRLINE" ), Utils.DoubleQuoteStr( "FLOW_TYPE" ), Utils.DoubleQuoteStr( "TIME_SERIES" ) };
                string fieldStr = String.Join( ",", fields );
                string sql = string.Format( @"SELECT {0} FROM ""{1}"" WHERE ""ORIGIN""= {2} AND ""DEST""= {3} {4} ORDER BY ""SUMFLOW"" DESC",
                    fieldStr, metaData.RouteTimeSeriesTableName, Utils.SingleQuoteStr( origin ), Utils.SingleQuoteStr( dest ), condition );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                Dictionary<string, string> jsonRes = new Dictionary<string, string>() { { "Pax", "" }, { "Freight", "" }, { "Seat", "" } };
                while ( dr.Read() ) {
                    Airline carrier = AirlineData.Query( dr[ "AIRLINE" ].ToString(), locale );
                    string airlineName = dr[ "AIRLINE" ].ToString();
                    if ( airlineName == AnyAirline )
                        airlineName = Localization.QueryLocale( locale )._anyAirline;
                    if ( carrier != null )
                        airlineName = carrier.FullName + " (" + dr[ "AIRLINE" ].ToString() + ")";
                    string dbFlowType = dr[ "FLOW_TYPE" ].ToString();
                    if ( jsonRes[ dbFlowType ] != "" )
                        jsonRes[ dbFlowType ] += ",";
                    jsonRes[ dbFlowType ] += Utils.DoubleQuoteStr( airlineName ) + ":" + dr[ "TIME_SERIES" ].ToString();
                }

                if ( flowType == "pax;freight" ) {
                    string res = String.Format( "\"pax\": {{ {0} }}, \"freight\":{{ {1} }}", jsonRes[ "Pax" ], jsonRes[ "Freight" ] );
                    return "{" + res + "}";
                } else if ( flowType == "seat" ) {
                    string res = String.Format( "\"pax\": {{ {0} }}, \"seat\":{{ {1} }}", jsonRes[ "Pax" ], jsonRes[ "Seat" ] );
                    return "{" + res + "}";
                }
            } catch ( NpgsqlException e ) {

            } finally {
                conn.Close();
            }
            return "";
        }

    }
}