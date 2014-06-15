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
    public class TwData {
        public static List<DestInfo> QueryDestByOrigin( string year, string origin, string dest, string airline, string locale ) {
            List<DestInfo> res = new List<DestInfo>();

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( T100DB.connString );
                conn.Open();

                // Query T100 Data
                string where = " WHERE " + T100DB.MakeWhere( year, airline, origin, dest );
                string groupby = " GROUP BY \"GEOM\", " + ( origin != "" ? "\"DEST\"" : "\"ORIGIN\"" );
                string fields = origin != "" ? "\"DEST\"" : "\"ORIGIN\"";
                fields += ", ST_AsText(\"GEOM\") AS \"GEOM\", SUM(\"PAX\") AS \"SUM_PAX\"   ";
                string sql = "SELECT " + fields + " FROM \"TwSummary\"" + where + groupby;
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );

                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    DestInfo destInfo = new DestInfo();
                    destInfo.Airport = dr[ origin != "" ? "DEST" : "ORIGIN" ].ToString();
                    destInfo.TotalPax = Convert.ToInt32( dr[ "SUM_PAX" ].ToString() );
                    destInfo.TotalFreight = null;

                    destInfo.RouteGeometry = Utils.ProcessWktGeometryString( dr[ "GEOM" ].ToString() );
                    destInfo.PartialData = false;
                    destInfo.DataSource = "TwData";
                    res.Add( destInfo );
                }
            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }

            return res;
        }
    }
}