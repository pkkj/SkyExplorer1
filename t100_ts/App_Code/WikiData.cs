using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Npgsql;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Data.SqlClient;
using System.Data;

namespace AST {
    public class WikiData {
        public static List<DestInfo> QueryDestByOrigin( string year, string origin, string dest, string airline, string locale ) {
            List<DestInfo> res = new List<DestInfo>();
            QueryDestByOriginInternal( year, origin, dest, airline, locale, "WikiConnection", res );
            QueryDestByOriginInternal( year, origin, dest, airline, locale, "NWikiConnection", res );
            return res;
        }

        private static void QueryDestByOriginInternal( string year, string origin, string dest, string airline, string locale, string tableName, List<DestInfo> destList ) {
            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();

                string where = " WHERE " + ASTDatabase.MakeWhere( year, airline, origin, dest );
                string groupby = " GROUP BY \"GEOM\", " + ( origin != "" ? "\"DEST\"" : "\"ORIGIN\"" );
                string fields = origin != "" ? "\"DEST\"" : "\"ORIGIN\"";
                fields += ", ST_AsText(\"GEOM\") AS \"GEOM\"  ";
                string sql = "SELECT " + fields + " FROM \"" + tableName + "\"" + where + groupby;
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );

                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    DestInfo destInfo = new DestInfo();
                    destInfo.Airport = dr[ origin != "" ? "DEST" : "ORIGIN" ].ToString();
                    destInfo.TotalPax = null;
                    destInfo.TotalFreight = null;

                    destInfo.RouteGeometry = Utils.ProcessWktGeometryString( dr[ "GEOM" ].ToString() );
                    destInfo.PartialData = false;
                    destInfo.NoData = true;
                    destInfo.DataSource = "WikiData";
                    destList.Add( destInfo );
                }
            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }
        }

        private static void QueryByRouteInternal( string tableName, string year, string origin, string dest, ref string jsonResult ) {
            NpgsqlConnection conn = null;

            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();

                string where = " WHERE " + ASTDatabase.MakeWhere( year, "", origin, dest );
                string[] fields = new string[] { Utils.DoubleQuoteStr( "AIRLINE" ) };

                string fieldStr = String.Join( ",", fields );
                string sql = "SELECT " + fieldStr + " FROM \"" + tableName + "\"" + where;
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );

                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    if ( jsonResult != "" )
                        jsonResult += ",";
                    Dictionary<string, string> item = new Dictionary<string, string>();
                    IDataRecord record = ( IDataRecord ) dr;
                    for ( int i = 0; i < record.FieldCount; i++ ) {
                        item.Add( record.GetName( i ), record[ i ].ToString() );
                    }
                    string json = new JavaScriptSerializer().Serialize( item );
                    jsonResult += json;
                }

            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }

        }

        public static string QueryByRoute( string year, string origin, string dest, string locale ) {
            Airport originAirport = AirportData.Query( origin );
            Airport destAirport = AirportData.Query( dest );
            if ( originAirport == null || destAirport == null )
                return "";

            double distKm, distMile, distNm;
            Utils.GetDistanceByUnits( originAirport, destAirport, out distKm, out distMile, out distNm );

            string res = "";
            QueryByRouteInternal( "NWikiConnection", year, origin, dest, ref res );
            QueryByRouteInternal( "WikiConnection", year, origin, dest, ref res );

            res = "\"routes\":[" + res + "],";
            res += "\"distKm\":" + distKm.ToString() + ",";
            res += "\"distMile\":" + distMile.ToString() + ",";
            res += "\"distNm\":" + distNm.ToString();
            res = "{" + res + "}";
            return res;
        }
    }
}