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
            if ( validSrc.Contains( "TwData" ) || dataSource == "" ) {
                destInfo.AddRange( TwData.QueryDestByOrigin( year, origin, dest, airline, locale ) );
            }
            // Query Japan MLIT Data
            if ( validSrc.Contains( "JpData" ) || dataSource == "" ) {
                destInfo.AddRange( JpData.QueryDestByOrigin( year, origin, dest, airline, locale ) );
            }
            // Query Korea Airport Corpartion Data
            if ( validSrc.Contains( "KrData" ) || dataSource == "" ) {
                destInfo.AddRange( KrData.QueryDestByOrigin( year, origin, dest, airline, locale ) );
            }
            // Query Wiki connection data
            if ( validSrc.Contains( "WikiData" ) || dataSource == "" ) {
                for ( int i = 0; i < destInfo.Count; i++ )
                    destSet.Add( destInfo[ i ].Airport );
                // Only show the destinations that don't exist in other data sources
                List<DestInfo> wikiResult = WikiData.QueryDestByOrigin( year, origin, dest, airline, locale );
                foreach ( DestInfo _dest in wikiResult ) {
                    if ( !destSet.Contains( _dest.Airport ) )
                        destInfo.Add( _dest );
                }
            }
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

        // TODO: Query the AirportAvailability table
        public static string QueryAvailableAirportByGeometry( double x1, double y1, double x2, double y2, string returnType, string locale ) {
            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();

                string sql = string.Format( "SELECT DISTINCT \"IATA\" FROM \"AirportAvailability\" WHERE \"GEOM\" && ST_MakeEnvelope({0}, {1}, {2}, {3}, 4326)", x1, y1, x2, y2 );
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


        public static string QueryAirlineByDataSource( string dataSrc, string locale ) {
            string res = "";
            JavaScriptSerializer jsoner = new JavaScriptSerializer();
            Dictionary<string, Carrier> dict = CarrierData.GetAvailableAirlineByDataSrc( dataSrc, locale );
            foreach ( KeyValuePair<string, Carrier> item in dict ) {
                if ( res != "" )
                    res += ",";
                res += string.Format( "[{0}, {1}, {2}, {3}, {4}, {5}]",
                    Utils.DoubleQuoteStr( item.Value.Code ),
                    Utils.DoubleQuoteStr( item.Value.Iata ),
                    Utils.DoubleQuoteStr( item.Value.FullName ),
                    Utils.DoubleQuoteStr( item.Value.Country ),
                    Utils.DoubleQuoteStr( item.Value.Type ),
                    Utils.DoubleQuoteStr( item.Value.Note ) );
            }
            return "[" + res + "]";
        }
    }
}