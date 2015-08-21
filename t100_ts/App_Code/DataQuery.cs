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
        public bool NoData = false;
        public bool Seasonal = false;
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
        public static string QueryByOrigin( string year, string origin, string dest, string airline, string queryType, string dataSource, string locale ) {
            // Verify the parameter
            string keyword = origin != "" ? origin : dest;
            if ( queryType == "code" ) {
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
                    keyword = QueryAvailableAirportByGeometry( x1, y1, x2, y2, "code", locale );
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
            HashSet<string> validSrc = new HashSet<string>( dataSource.Split( ',' ) );
            HashSet<string> destSet = new HashSet<string>();
            // Query USA T100 Data
            if ( validSrc.Contains( "T100" ) || validSrc.Contains( "T100FF" ) || dataSource == "" ) {
                destInfo.AddRange( T100Data.QueryDestByOrigin( year, origin, dest, airline, dataSource, locale ) );
            }
            // Query UK CAA Data
            if ( validSrc.Contains( "UkData" ) || dataSource == "" ) {
                destInfo.AddRange( UkData.QueryDestByOrigin( year, origin, dest, airline, locale ) );
            }
            // Query Taiwan CAA Data
            if ( validSrc.Contains( "TaiwanData" ) || dataSource == "" ) {
                destInfo.AddRange( TwData.QueryDestByOrigin( year, origin, dest, airline, locale ) );
            }
            // Query Japan MLIT Data
            if ( validSrc.Contains( "JapanData" ) || dataSource == "" ) {
                destInfo.AddRange( JpData.QueryDestByOrigin( year, origin, dest, airline, locale ) );
            }
            // Query Korea Airport Corpartion Data
            if ( validSrc.Contains( "KoreaData" ) || dataSource == "" ) {
                destInfo.AddRange( KrData.QueryDestByOrigin( year, origin, dest, airline, locale ) );
            }
            // Query Wiki connection data
            if ( validSrc.Contains( "ConnectionData" ) || dataSource == "" ) {
                destInfo.AddRange( WikiData.QueryDestByOrigin( year, origin, dest, airline, locale ) );                
            }
            Dictionary<string, DestItem> destDict = new Dictionary<string, DestItem>();
            foreach ( DestInfo d in destInfo ) {
                if ( !destDict.ContainsKey( d.Airport ) ) {
                    DestItem destItem = new DestItem();
                    destItem.Airport = AirportData.Query( d.Airport, locale ).CastToDict( locale );
                    destItem.RouteGeometry = d.RouteGeometry;
                    destDict[ d.Airport ] = destItem;
                }
                destDict[ d.Airport ].AvailableData.Add( d );
            }
            List<string> timeSeriesDataSrc = new List<string>();
            if ( DataSourceRegister.GetDataSrc( "CN_CAAC" ).isAirportTimeSeriesCovered( origin ) ) {
                timeSeriesDataSrc.Add( "CN_CAAC" );
            }
            if ( DataSourceRegister.GetDataSrc( "CN_MIA" ).isAirportTimeSeriesCovered( origin ) ) {
                timeSeriesDataSrc.Add( "CN_MIA" );
            }
            if ( DataSourceRegister.GetDataSrc( "TH_AOT" ).isAirportTimeSeriesCovered( origin ) ) {
                timeSeriesDataSrc.Add( "TH_AOT" );
            }
            if ( DataSourceRegister.GetDataSrc( "AU_BITRE" ).isAirportTimeSeriesCovered( origin ) ) {
                timeSeriesDataSrc.Add( "AU_BITRE" );
            }
            Dictionary<string, Object> resDict = new Dictionary<string, object>();
            resDict[ "timeSeriesDataSrc" ] = timeSeriesDataSrc;
            resDict[ "routes" ] = destDict.Values.ToList();
            resDict[ "fromAirport" ] = AirportData.Query( keyword, locale ).CastToDict( locale );

            return new JavaScriptSerializer().Serialize( resDict );
        }

        // TODO: Query the AirportAvailability table
        public static string QueryAvailableAirportByGeometry( double x1, double y1, double x2, double y2, string returnType, string locale ) {
            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();

                string sql = string.Format( "SELECT DISTINCT \"CODE\" FROM \"AirportAvailability\" WHERE \"GEOM\" && ST_MakeEnvelope({0}, {1}, {2}, {3}, 4326)", x1, y1, x2, y2 );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    string code = dr[ "CODE" ].ToString();
                    Airport airport = AirportData.Query( code, locale );
                    if ( airport == null ) {
                        return "";
                    }
                    if ( returnType == "code" )
                        return airport.Code;
                    else
                        return new JavaScriptSerializer().Serialize( airport );
                }

            } finally {
                conn.Close();
            }
            return "";
        }
    }
}