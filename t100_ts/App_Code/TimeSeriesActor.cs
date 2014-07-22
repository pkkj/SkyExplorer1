﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Npgsql;

namespace AST {
    public class TimeSeriesActor {

        /// <summary>
        /// 
        /// </summary>
        /// <param name="origin"></param>
        /// <returns></returns>
        public static string QueryAirportTimeSeries( string dataSrc, string origin ) {
            // Get the meta data of specific data source
            ADataSourceMetaData metaData = null;
            if ( !DataSourceRegister.Register.TryGetValue( dataSrc, out metaData ) ) {
                return "";
            }

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
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
                        jsonPax += string.Format("{0}:{1}", Utils.DoubleQuoteStr( dr[ "AIRLINE" ].ToString() ), dr[ "TIME_SERIES" ].ToString());
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

        public static string QueryRouteTimeSeries( string origin, string dest, string flowType, string locale ) {
            NpgsqlConnection conn = null;
            try {

                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();
                string where = " WHERE \"ORIGIN\"=" + Utils.SingleQuoteStr( origin ) + " AND \"DEST\"=" + Utils.SingleQuoteStr( dest );
                if ( flowType == "pax;freight" )
                    where += " AND ( \"FLOW_TYPE\" = \'Pax\' OR \"FLOW_TYPE\" = \'Freight\') ";
                else if ( flowType == "seat" )
                    where += " AND ( \"FLOW_TYPE\" = \'Pax\' OR \"FLOW_TYPE\" = \'Seat\')  ";

                string[] fields = new string[] { Utils.DoubleQuoteStr( "AIRLINE" ), Utils.DoubleQuoteStr( "FLOW_TYPE" ), Utils.DoubleQuoteStr( "TIME_SERIES" ) };
                string fieldStr = String.Join( ",", fields );
                string sql = "SELECT " + fieldStr + " FROM \"T100RouteTimeSeries\"" + where + " ORDER BY \"SUMFLOW\" DESC";
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                Dictionary<string, string> jsonRes = new Dictionary<string, string>() { { "Pax", "" }, { "Freight", "" }, { "Seat", "" } };
                while ( dr.Read() ) {
                    Carrier carrier = CarrierData.Query( dr[ "AIRLINE" ].ToString(), locale );
                    string airlineName = dr[ "AIRLINE" ].ToString();
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