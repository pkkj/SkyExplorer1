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

    public class JpDataMetaData : ADataSourceMetaData {
        public override string Name {
            get { return "JpData"; }
        }
        public override string SummaryTableName {
            get { return "JpDataSummary"; }
        }
        public override string AirportTimeSeriesTableName {
            get { return "JpDataAirportTimeSeries"; }
        }
        public override string RouteTimeSeriesTableName {
            get { return "JpDataRouteTimeSeries"; }
        }
        public override string Country {
            get { return "Japan"; }
        }
        public override bool HasDomesticData {
            get { return true; }
        }

        public override bool HasPaxData {
            get { return true; }
        }
        public override bool HasFreightData {
            get { return true; }
        }
        public override bool HasSeatData {
            get { return true; }
        }
        public override bool HasFlightData {
            get { return true; }
        }
    }

    public static class JpData {
        public static string QueryByRoute( string year, string origin, string dest, string locale ) {
            NpgsqlConnection conn = null;
            string res = "";
            Airport originAirport = AirportData.Query( origin );
            Airport destAirport = AirportData.Query( dest );
            if ( originAirport == null || destAirport == null )
                return "";
            double distKm = Utils.DistEarth( originAirport.Geometry.x, originAirport.Geometry.y, destAirport.Geometry.x, destAirport.Geometry.y );
            double distMile = Math.Round( distKm * 0.621371, 0 );
            double distNm = Math.Round( distKm * 0.539957, 0 );
            distKm = Math.Round( distKm, 0 );
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();

                string where = " WHERE " + ASTDatabase.MakeWhere( year, "", origin, dest );
                string[] fields = new string[] { Utils.DoubleQuoteStr( "PAX" ), Utils.DoubleQuoteStr( "MONTH_PAX" ) };

                string fieldStr = String.Join( ",", fields );
                string sql = "SELECT " + fieldStr + " FROM \"JpDataSummary\"" + where;
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );

                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    if ( res != "" )
                        res += ",";
                    Dictionary<string, string> item = new Dictionary<string, string>();
                    IDataRecord record = ( IDataRecord ) dr;
                    for ( int i = 0; i < record.FieldCount; i++ ) {
                        item.Add( record.GetName( i ), record[ i ].ToString() );
                    }
                    string json = new JavaScriptSerializer().Serialize( item );
                    res += json;
                }

            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }

            res = "\"routes\":[" + res + "],";
            res += "\"distKm\":" + distKm.ToString() + ",";
            res += "\"distMile\":" + distMile.ToString() + ",";
            res += "\"distNm\":" + distNm.ToString();
            res = "{" + res + "}";
            return res;
        }


        public static List<DestInfo> QueryDestByOrigin( string year, string origin, string dest, string airline, string locale ) {
            List<DestInfo> res = new List<DestInfo>();

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();

                string where = " WHERE " + ASTDatabase.MakeWhere( year, airline, origin, dest );
                string groupby = " GROUP BY \"GEOM\", " + ( origin != "" ? "\"DEST\"" : "\"ORIGIN\"" );
                string fields = origin != "" ? "\"DEST\"" : "\"ORIGIN\"";
                fields += ", \"PAX\"";
                fields += ", ST_AsText(\"GEOM\") AS \"GEOM\"";

                string sql = "SELECT " + fields + " FROM \"JpDataSummary\"" + where;
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );

                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    DestInfo destInfo = new DestInfo();
                    destInfo.Airport = dr[ origin != "" ? "DEST" : "ORIGIN" ].ToString();
                    destInfo.TotalPax = Convert.ToInt32( dr[ "PAX" ].ToString() );
                    destInfo.TotalFreight = null;
                    destInfo.DataSource = "JpData";
                    destInfo.RouteGeometry = Utils.ProcessWktGeometryString( dr[ "GEOM" ].ToString() );
                    destInfo.PartialData = false;
                    // Now we don't support freight data
                    if ( destInfo.TotalPax > 0 ) {
                        res.Add( destInfo );
                    }
                }
            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }

            return res;
        }
    }
}