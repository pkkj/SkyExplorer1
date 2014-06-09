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

    [Serializable]
    public class DestInfo {
        [ScriptIgnore]
        public string Airport = null;
        [ScriptIgnore]
        public string RouteGeometry = "";
        public int? TotalPax = null;
        public int? TotalFreight = null;
        public string DataSource = "";
        public bool PartialData = false;
    }

    public class DestItem {
        public Dictionary<string, object> Airport;
        public string RouteGeometry;
        public List<DestInfo> AvailableData;
        public DestItem() {
            AvailableData = new List<DestInfo>();
        }
    }
    public static class DataQuery {
        public static string QueryByOrigin( string year, string origin, string dest, string airline, string queryType, string locale ) {
            // Verify the parameter
            string keyword = origin != "" ? origin : dest;
            if ( queryType == "iata" ) {
                if ( AirportData.Query( keyword ) == null ) {
                    return "";
                }
            } else {
                string[] lstCoordinate = keyword.Split( ',' );
                if ( lstCoordinate.Length == 4 ) {
                    double x1 = Convert.ToDouble( lstCoordinate[ 0 ] );
                    double y1 = Convert.ToDouble( lstCoordinate[ 1 ] );
                    double x2 = Convert.ToDouble( lstCoordinate[ 2 ] );
                    double y2 = Convert.ToDouble( lstCoordinate[ 3 ] );
                    keyword = QueryAvailableAirportByGeometry( x1, y1, x2, y2, "iata", locale );
                    if ( keyword == "" )
                        return "";
                } else {
                    return "";
                }
            }
            if ( origin != "" ) 
                origin = keyword; 
            else 
                dest = keyword;
            List<DestInfo> destInfo = new List<DestInfo>();
            // Query USA T100 Data
            destInfo.AddRange( T100Data.QueryDestByOrigin( year, origin, dest, airline, locale ) );
            // Query UK CAA Data
            destInfo.AddRange( UkData.QueryDestByOrigin( year, origin, dest, airline, locale ) );

            Dictionary<string, DestItem> destDict = new Dictionary<string, DestItem>();
            foreach ( DestInfo d in destInfo ) {
                if ( !destDict.ContainsKey( d.Airport ) ) {
                    DestItem destItem = new DestItem();
                    destItem.Airport = AirportData.Query( d.Airport, locale ).CastToDict();
                    destItem.RouteGeometry = d.RouteGeometry;
                    destDict[ d.Airport ] = destItem;
                }
                destDict[ d.Airport ].AvailableData.Add( d );
            }

            Dictionary<string, Object> resDict = new Dictionary<string, object>();
            resDict[ "routes" ] = destDict.Values.ToList();
            resDict[ "fromAirport" ] = AirportData.Query( keyword, locale );

            return new JavaScriptSerializer().Serialize( resDict );
        }

        // TODO: Create the "Available Airport" table
        public static string QueryAvailableAirportByGeometry( double x1, double y1, double x2, double y2, string returnType, string locale ) {
            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( T100DB.connString );
                conn.Open();

                string sql = string.Format( "SELECT \"IATA\" FROM \"AllAvailableAirport\" WHERE \"GEOM\" && ST_MakeEnvelope({0}, {1}, {2}, {3}, 4326)", x1, y1, x2, y2 );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    string iata = dr[ "IATA" ].ToString();
                    Airport airport = AirportData.Query( iata, locale );
                    if ( airport == null ) {
                        return "";
                    }
                    if ( returnType == "iata" )
                        return airport.Iata;
                    else
                        return new JavaScriptSerializer().Serialize( airport );
                }

            } catch ( NpgsqlException e ) {

            } finally {
                conn.Close();
            }
            return "";
        }
    }
}