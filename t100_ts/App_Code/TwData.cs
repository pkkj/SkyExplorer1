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

    public class TwDataMetaData : ADataSourceMetaData {
        public override string Name {
            get { return "TaiwanData"; }
        }
        public override string Country {
            get { return "TW"; }
        }
        public override bool HasDomesticData {
            get { return true; }
        }
        public override bool HasInternationalData {
            get { return true; }
        }
        public override bool HasAirlineInfo {
            get { return true; }
        }
        public override bool HasPaxData {
            get { return true; }
        }
        public override bool HasSeatData {
            get { return true; }
        }
        public override bool HasFlightData {
            get { return true; }
        }
        public override bool HasDoubleFlowData {
            get { return true; }
        }
        public virtual StatTarget StatTarget {
            get { return StatTarget.Airport | StatTarget.Route; }
        }
    }

    public class TwData {
        public static ADataSourceMetaData MetaData = new TwDataMetaData();
        public static List<DestInfo> QueryDestByOrigin( string year, string origin, string dest, string airline, string locale ) {
            List<DestInfo> res = new List<DestInfo>();

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();

                // Query Taiwan Data
                string where = ASTDatabase.MakeWhere( year, airline, origin, dest );
                string groupby = " \"GEOM\", " + ( origin != "" ? "\"DEST\"" : "\"ORIGIN\"" );
                string fields = origin != "" ? "\"DEST\"" : "\"ORIGIN\"";
                fields += ", ST_AsText(\"GEOM\") AS \"GEOM\", SUM(\"PAX\") AS \"SUM_PAX\"   ";

                string sql = string.Format( @"SELECT {0} FROM ""{1}"" WHERE {2} GROUP BY {3}", fields, MetaData.SummaryTableName, where, groupby );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );

                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    DestInfo destInfo = new DestInfo();
                    destInfo.Airport = dr[ origin != "" ? "DEST" : "ORIGIN" ].ToString();
                    destInfo.TotalPax = Convert.ToInt32( dr[ "SUM_PAX" ].ToString() );
                    destInfo.TotalFreight = null;

                    destInfo.RouteGeometry = Utils.ProcessWktGeometryString( dr[ "GEOM" ].ToString() );
                    destInfo.PartialData = false;
                    destInfo.DataSource = "TaiwanData";
                    res.Add( destInfo );
                }
            } finally {
                conn.Close();
            }

            return res;
        }

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
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();

                string where = ASTDatabase.MakeWhere( year, "", origin, dest );
                string[] fields = new string[] { Utils.DoubleQuoteStr("AIRLINE"),  Utils.DoubleQuoteStr("DEPARTURE"), 
                Utils.DoubleQuoteStr("PAX"), 
                Utils.DoubleQuoteStr("MONTH_DEPARTURE"),  Utils.DoubleQuoteStr("MONTH_PAX")};

                string fieldStr = String.Join( ",", fields );
                string sql = string.Format( @"SELECT {0} FROM ""{1}"" WHERE {2}", fieldStr, MetaData.SummaryTableName, where );
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
                    Airline carrier = AirlineData.Query( item[ "AIRLINE" ], locale );
                    item.Add( "AIRLINE_NAME", carrier.FullName );
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
    }
}