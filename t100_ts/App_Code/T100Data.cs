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

    public class T100MetaData : ADataSourceMetaData {
        public override string Name {
            get { return "T100Data"; }
        }
        public override string SummaryTableName {
            get { return "T100Summary"; }
        }
        public override string AirportTimeSeriesTableName {
            get { return "T100AirportTimeSeries"; }
        }
        public override string RouteTimeSeriesTableName {
            get { return "T100RouteTimeSeries"; }
        }
        public override string Country {
            get { return "United States"; }
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
        public override bool HasFreightData {
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

    }

    public static class T100Data {      


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
                string[] fields = new string[] { Utils.DoubleQuoteStr("AIRLINE"),  Utils.DoubleQuoteStr("DEPARTURE"), 
                Utils.DoubleQuoteStr("PAX"),  Utils.DoubleQuoteStr("FREIGHT"), 
                Utils.DoubleQuoteStr("MONTH_DEPARTURE"),  Utils.DoubleQuoteStr("MONTH_PAX"),  Utils.DoubleQuoteStr("MONTH_FREIGHT") };

                string fieldStr = String.Join( ",", fields );
                string sql = "SELECT " + fieldStr + " FROM \"T100Summary\"" + where;
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
                    Carrier carrier = CarrierData.Query( item[ "AIRLINE" ], locale );
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


        public static string QueryByAirlines( string year, string airline, string region, string locale, int limit = 100 ) {
            NpgsqlConnection conn = null;
            string currentCountry = DataSourceRegister.GetDataSrc( "T100Data" ).Country;
            try {
                string res = "";
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();
                JavaScriptSerializer jsoner = new JavaScriptSerializer();
                string where = ASTDatabase.MakeWhere( year, airline, "", "" );
                Carrier carrier = CarrierData.Query( airline, locale );
                if ( carrier == null )
                    return "";
                string flowField = carrier.Type == "Passenger" ? "PAX" : "FREIGHT";

                string[] fields = new string[] { Utils.DoubleQuoteStr( "ORIGIN" ), Utils.DoubleQuoteStr( "DEST" ),
                    Utils.DoubleQuoteStr( flowField ), Utils.DoubleQuoteStr( "DEPARTURE" ) , "ST_AsText(\"T100Summary\".\"GEOM\") AS \"GEOM\"",
                    "\"AP1\".\"COUNTRY\" as \"ORIGIN_COUNTRY\"", "\"AP2\".\"COUNTRY\" as \"DEST_COUNTRY\""
                };
                string fieldStr = String.Join( ",", fields );
                string sqlFrom = " \"T100Summary\" , \"T100Airport\" AS \"AP1\", \"T100Airport\" AS \"AP2\" ";
                if ( region == "US" ) {
                    where += " AND ( \"AP1\".\"COUNTRY\" = \'" + currentCountry + "\'  AND \"AP2\".\"COUNTRY\" = \'" + currentCountry + "\' ) ";
                } else if ( region == "Intl" ) {
                    where += " AND ( \"AP1\".\"COUNTRY\" <> \'" + currentCountry + "\'  OR \"AP2\".\"COUNTRY\" <> \'" + currentCountry + "\' ) ";
                }
                where += "  AND \"AP1\".\"IATA\" = \"T100Summary\".\"ORIGIN\" AND \"AP2\".\"IATA\" = \"T100Summary\".\"DEST\" ";
                string sql = "SELECT " + fieldStr + " FROM " + sqlFrom + " WHERE " + where + " ORDER BY " + Utils.DoubleQuoteStr( flowField ) + " DESC LIMIT " + limit.ToString();

                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    Dictionary<string, object> route = new Dictionary<string, object>();
                    Airport oAirport = AirportData.Query( dr[ "ORIGIN" ].ToString(), locale );
                    Airport dAirport = AirportData.Query( dr[ "DEST" ].ToString(), locale );
                    int flow = Convert.ToInt32( dr[ flowField ] );
                    if ( flow == 0 ) continue;

                    route[ "origin" ] = dr[ "ORIGIN" ].ToString();
                    route[ "originCity" ] = oAirport.City;
                    route[ "originCountry" ] = oAirport.Country;
                    route[ "originGeom" ] = oAirport.Geometry;
                    route[ "dest" ] = dr[ "DEST" ].ToString();
                    route[ "destCity" ] = dAirport.City;
                    route[ "destCountry" ] = dAirport.Country;
                    route[ "destGeom" ] = dAirport.Geometry;
                    route[ "flow" ] = Convert.ToInt32( dr[ flowField ] );
                    route[ "departure" ] = dr[ "DEPARTURE" ].ToString();

                    string geom = dr[ "GEOM" ].ToString();
                    geom = geom.Replace( "MULTILINESTRING", "" );
                    geom = geom.Replace( "(", "[" );
                    geom = geom.Replace( ")", "]" );
                    route[ "geom" ] = geom;

                    if ( res != "" )
                        res += ",";
                    res += jsoner.Serialize( route );

                }
                return "[" + res + "]";
            } catch ( NpgsqlException e ) {

            } finally {
                conn.Close();
            }

            return "";
        }

        public static List<DestInfo> QueryDestByOrigin( string year, string origin, string dest, string airline, string dataSource, string locale ) {
            HashSet<string> validSrc = new HashSet<string>( dataSource.Split( ',' ) );
            List<DestInfo> res = new List<DestInfo>();

            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();

                // Query T100 Data
                string where = " WHERE " + ASTDatabase.MakeWhere( year, airline, origin, dest );
                string groupby = " GROUP BY \"GEOM\", " + ( origin != "" ? "\"DEST\"" : "\"ORIGIN\"" );
                string fields = origin != "" ? "\"DEST\"" : "\"ORIGIN\"";
                fields += ", ST_AsText(\"GEOM\") AS \"GEOM\", SUM(\"PAX\") AS \"SUM_PAX\", SUM(\"FREIGHT\") AS \"SUM_FREIGHT\"    ";
                string sql = "SELECT " + fields + " FROM \"T100Summary\"" + where + groupby;
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );

                NpgsqlDataReader dr = command.ExecuteReader();
                while ( dr.Read() ) {
                    DestInfo destInfo = new DestInfo();
                    destInfo.Airport = dr[ origin != "" ? "DEST" : "ORIGIN" ].ToString();
                    destInfo.TotalPax = Convert.ToInt32( dr[ "SUM_PAX" ].ToString() );
                    destInfo.TotalFreight = Convert.ToInt32( dr[ "SUM_FREIGHT" ].ToString() );
                    
                    // Determine the dataSource of airport
                    Airport airport1 = AirportData.Query( destInfo.Airport );
                    Airport airport2 = AirportData.Query( origin != "" ? origin : dest);
                    destInfo.RouteGeometry = Utils.ProcessWktGeometryString( dr[ "GEOM" ].ToString() );

                    if ( airport1.CountryEn != DataSourceRegister.GetDataSrc("T100Data").Country &&
                        airport2.CountryEn != DataSourceRegister.GetDataSrc( "T100Data" ).Country ) {
                        destInfo.PartialData = true;
                        destInfo.DataSource = "T100FF";
                    } else {
                        destInfo.DataSource = "T100Data";
                    }

                    if ( validSrc.Contains( destInfo.DataSource ) || dataSource == "" ) {
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

    class T100AircraftStat {
        static private int maxAircraft = 5;
        public static int CmpRankItem( object[] a, object[] b ) {
            int c1 = Convert.ToInt32( a[ 1 ] );
            int c2 = Convert.ToInt32( b[ 1 ] );
            return c2.CompareTo( c1 );
        }
        static private List<object[]> ProcessAirlineItem( Dictionary<string, int> summary, Dictionary<string, int> airlineItem ) {
            List<object[]> localStat = new List<object[]>();

            foreach ( KeyValuePair<string, int> item in airlineItem ) {
                if ( item.Value == 0 )
                    continue;

                if ( !summary.ContainsKey( item.Key ) ) {
                    summary[ item.Key ] = 0;
                }

                summary[ item.Key ] += item.Value;
                localStat.Add( new object[] { item.Key, item.Value, 0 } );
            }
            return FinalizeLocalStat( localStat );
        }

        static private List<object[]> FinalizeLocalStat( List<object[]> localStat ) {
            List<object[]> resStat = new List<object[]>();
            localStat.Sort( CmpRankItem );
            int extraCount = 0;
            int totalFlow = 0;
            for ( int i = 0; i < localStat.Count && i < maxAircraft; i++ ) {
                totalFlow += Convert.ToInt32( localStat[ i ][ 1 ] );
                resStat.Add( localStat[ i ] );
            }
            for ( int i = maxAircraft; i < localStat.Count; i++ ) {
                totalFlow += Convert.ToInt32( localStat[ i ][ 1 ] );
                extraCount += Convert.ToInt32( localStat[ i ][ 1 ] );
            }
            if ( extraCount > 0 )
                resStat.Add( new object[] { "Other", extraCount, "" } );
            for ( int i = 0; i < resStat.Count; i++ ) {
                int flow = Convert.ToInt32( resStat[ i ][ 1 ] );
                resStat[ i ][ 2 ] = ( ( double ) flow * 100.0 / totalFlow ).ToString( "N1" ) + "%";
            }
            return resStat;
        }
        static private List<object[]> ProcessSummaryDict( Dictionary<string, int> summary ) {
            List<object[]> localStat = new List<object[]>();
            List<object[]> resStat = new List<object[]>();
            foreach ( KeyValuePair<string, int> item in summary ) {
                localStat.Add( new object[] { item.Key, item.Value, 0 } );
            }
            return FinalizeLocalStat( localStat );

        }

        static public string QueryRouteAircraftStat( string year, string origin, string dest, string locale ) {
            NpgsqlConnection conn = null;
            JavaScriptSerializer jsoner = new JavaScriptSerializer();
            try {
                int totalPax = 0;
                int totalFreight = 0;
                conn = new NpgsqlConnection( ASTDatabase.connString );
                conn.Open();
                string where = ASTDatabase.MakeWhere( year, "", origin, dest );
                string[] fields = new string[] { Utils.DoubleQuoteStr( "AIRLINE" ), Utils.DoubleQuoteStr( "AIRCRAFT_PAX" ), Utils.DoubleQuoteStr( "AIRCRAFT_FREIGHT" ), 
                    Utils.DoubleQuoteStr( "AIRCRAFT_DEPARTURE" ), Utils.DoubleQuoteStr( "PAX" ), Utils.DoubleQuoteStr( "FREIGHT" ), Utils.DoubleQuoteStr( "DEPARTURE" )};
                string fieldStr = String.Join( ",", fields );
                string sql = "SELECT " + fieldStr + " FROM \"T100Summary\" WHERE " + where;
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                Dictionary<string, int> paxSummary = new Dictionary<string, int>();
                Dictionary<string, int> freightSummary = new Dictionary<string, int>();
                Dictionary<string, int> departureSummary = new Dictionary<string, int>();
                Dictionary<string, object> dictRouteRes = new Dictionary<string, object>();
                Dictionary<string, Aircraft> aircraftDict = new Dictionary<string, Aircraft>();
                while ( dr.Read() ) {
                    Dictionary<string, object> route = new Dictionary<string, object>();
                    route[ "airline" ] = dr[ "AIRLINE" ].ToString();
                    Carrier carrier = CarrierData.Query( dr[ "AIRLINE" ].ToString(), locale );
                    route[ "airlineName" ] = carrier.FullName;
                    route[ "aircraftPax" ] = ProcessAirlineItem( paxSummary, jsoner.Deserialize<Dictionary<string, int>>( dr[ "AIRCRAFT_PAX" ].ToString() ) );
                    route[ "aircraftFreight" ] = ProcessAirlineItem( freightSummary, jsoner.Deserialize<Dictionary<string, int>>( dr[ "AIRCRAFT_FREIGHT" ].ToString() ) );
                    route[ "aircraftDeparture" ] = ProcessAirlineItem( departureSummary, jsoner.Deserialize<Dictionary<string, int>>( dr[ "AIRCRAFT_DEPARTURE" ].ToString() ) );

                    totalPax += Convert.ToInt32( dr[ "PAX" ] );
                    totalFreight += Convert.ToInt32( dr[ "FREIGHT" ] );
                    Dictionary<string, int> localAircraft = jsoner.Deserialize<Dictionary<string, int>>( dr[ "AIRCRAFT_DEPARTURE" ].ToString() );
                    foreach ( KeyValuePair<string, int> item in localAircraft ) {
                        string aircraft = item.Key;
                        if ( aircraft != "Other" )
                            aircraftDict[ aircraft ] = AircraftData.Query( aircraft, locale );
                    }
                    dictRouteRes[ dr[ "AIRLINE" ].ToString() ] = route;
                }

                Dictionary<string, object> total = new Dictionary<string, object>();
                total[ "airline" ] = "All";
                total[ "airlineName" ] = "";
                total[ "aircraftPax" ] = ProcessSummaryDict( paxSummary );
                total[ "aircraftFreight" ] = ProcessSummaryDict( freightSummary );
                total[ "aircraftDeparture" ] = ProcessSummaryDict( departureSummary );

                dictRouteRes[ "All" ] = total;

                Airport originAirport = AirportData.Query( origin, locale );
                Airport destAirport = AirportData.Query( dest, locale );
                Dictionary<string, object> dictRes = new Dictionary<string, object>(){
                    {"routes", dictRouteRes},
                    {"aircrafts", aircraftDict},
                    {"origin", originAirport},
                    {"dest", destAirport},
                    {"totalPax", totalPax},
                    {"totalFreight", totalFreight}
                };
                return jsoner.Serialize( dictRes );

            } catch ( NpgsqlException e ) {

            } finally {
                conn.Close();
            }
            return "";
        }

        
    }

}