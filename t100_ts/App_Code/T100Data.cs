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

    public class T100Route {
        public string Year;
        public string Airline;
        public string Dest;
        public int Freight;
        public int Pax;
        public List<int> MonthPax;
        public List<int> MonthFreight;

        public T100Route() {

        }
    }
    public static class T100Data {

        public static string MatchAirport( string input, string locale ) {
            int limit = 10;
            NpgsqlConnection conn = null;
            List<string> lstAirport = new List<string>();
            try {
                conn = new NpgsqlConnection( T100DB.connString );
                conn.Open();

                string sqlIata = "SELECT \"IATA\" FROM \"T100Airport\" WHERE \"IATA\" ILIKE " + Utils.SingleQuoteStr( input + "%" );
                NpgsqlCommand commandIata = new NpgsqlCommand( sqlIata, conn );
                NpgsqlDataReader drIata = commandIata.ExecuteReader();
                while ( drIata.Read() ) {
                    lstAirport.Add( drIata[ "IATA" ].ToString() );
                }

                if ( input.Length >= 3 ) {
                    string sqlCity = "SELECT \"IATA\" FROM \"T100Airport\" WHERE \"CITY\" ILIKE " + Utils.SingleQuoteStr( input + "%" );
                    NpgsqlCommand commandCity = new NpgsqlCommand( sqlCity, conn );
                    NpgsqlDataReader drCity = commandCity.ExecuteReader();
                    while ( drCity.Read() ) {
                        if ( !lstAirport.Contains( drCity[ "IATA" ].ToString() ) && lstAirport.Count < limit )
                            lstAirport.Add( drCity[ "IATA" ].ToString() );
                    }
                }

            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }
            List<string[]> lstRes = new List<string[]>();
            foreach ( string iata in lstAirport ) {
                Airport airport = AirportData.Query( iata, locale );
                if ( airport == null )
                    continue;
                lstRes.Add( new string[ 3 ] { airport.Iata, airport.City, airport.Country } );
            }
            string res = new JavaScriptSerializer().Serialize( lstRes );
            return res;
        }

        public static string QueryT100AirportInfo( string airportCode, string codeType, string locale ) {
            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( T100DB.connString );
                conn.Open();
                // Only support IATA code
                string sqlIata = "SELECT \"T100_AVAILABILITY\" FROM \"T100Airport\" WHERE \"IATA\" = " + Utils.SingleQuoteStr( airportCode );

                NpgsqlCommand commandIata = new NpgsqlCommand( sqlIata, conn );
                NpgsqlDataReader drIata = commandIata.ExecuteReader();

                Airport airport = AirportData.Query( airportCode, locale );
                if ( airport == null ) return "";

                while ( drIata.Read() ) {
                    Dictionary<string, object> res = new Dictionary<string, object>() {
                        {"iata", airport.Iata},
                        {"icao", airport.Icao},
                        {"country", airport.Country},
                        {"city", airport.City},
                        {"name", airport.FullName},
                        {"note", airport.Note},
                        {"countryEn", airport.CountryEn},
                        {"nameEn", airport.FullNameEn},
                        {"cityEn", airport.CityEn},
                        {"yearAvailability", drIata[ "T100_AVAILABILITY" ].ToString()}
                    };
                    return new JavaScriptSerializer().Serialize( res );
                }

            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }
            return "";
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
                conn = new NpgsqlConnection( T100DB.connString );
                conn.Open();

                string where = " WHERE " + T100DB.MakeWhere( year, "", origin, dest );
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


        public static string QueryAirportStat( string year, string airport, string locale ) {
            NpgsqlConnection conn = null;
            string res = "{}";
            try {
                conn = new NpgsqlConnection( T100DB.connString );
                conn.Open();

                string where = " WHERE " + T100DB.MakeWhere( year, "", airport, "" );

                string[] fields = new string[] { Utils.DoubleQuoteStr( "AIRLINE" ), Utils.DoubleQuoteStr( "DEST" ), Utils.DoubleQuoteStr( "PAX" ), Utils.DoubleQuoteStr( "FREIGHT" ) };

                string fieldStr = String.Join( ",", fields );
                string sql = "SELECT " + fieldStr + " FROM \"T100Summary\"" + where;
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );

                NpgsqlDataReader dr = command.ExecuteReader();
                List<T100Route> routes = new List<T100Route>();

                while ( dr.Read() ) {
                    T100Route route = new T100Route();
                    route.Airline = dr[ "AIRLINE" ].ToString();
                    route.Dest = dr[ "DEST" ].ToString();
                    route.Pax = Convert.ToInt32( dr[ "PAX" ] );
                    route.Freight = Convert.ToInt32( dr[ "FREIGHT" ] );
                    routes.Add( route );
                }

                string[] regions = new string[] { "All", "International", "United States" };
                res = "";
                foreach ( string region in regions ) {
                    if ( res != "" )
                        res += ",";
                    res += Utils.DoubleQuoteStr( region ) + ":" + CreateDestRank( routes, region, locale );
                }
                res = "{" + res + "}";
                return res;
            } catch ( NpgsqlException e ) {

            } finally {
                conn.Close();
            }
            return "";
        }



        public static string CreateDestRank( List<T100Route> routes, string region, string locale ) {
            Dictionary<string, int> dictPaxDest = new Dictionary<string, int>();
            Dictionary<string, int> dictFreightDest = new Dictionary<string, int>();
            Dictionary<string, int> dictPaxAirline = new Dictionary<string, int>();
            Dictionary<string, int> dictFreightAirline = new Dictionary<string, int>();

            foreach ( T100Route route in routes ) {
                Airport airport = AirportData.Query( route.Dest, locale );
                if ( region == "International" ) {
                    if ( airport.CountryEn == "United States" )
                        continue;
                } else if ( region == "United States" ) {
                    if ( airport.CountryEn != "United States" )
                        continue;
                }
                if ( route.Pax > 0 ) {
                    if ( !dictPaxDest.ContainsKey( route.Dest ) ) {
                        dictPaxDest[ route.Dest ] = 0;
                    }
                    dictPaxDest[ route.Dest ] += route.Pax;

                    if ( !dictPaxAirline.ContainsKey( route.Airline ) ) {
                        dictPaxAirline[ route.Airline ] = 0;
                    }
                    dictPaxAirline[ route.Airline ] += route.Pax;
                }
                if ( route.Freight > 0 ) {
                    if ( !dictFreightDest.ContainsKey( route.Dest ) ) {
                        dictFreightDest[ route.Dest ] = 0;
                    }
                    dictFreightDest[ route.Dest ] += route.Freight;

                    if ( !dictFreightAirline.ContainsKey( route.Airline ) ) {
                        dictFreightAirline[ route.Airline ] = 0;
                    }
                    dictFreightAirline[ route.Airline ] += route.Freight;

                }
            }

            List<KeyValuePair<string, int>> lstPaxDest = dictPaxDest.ToList();
            List<KeyValuePair<string, int>> lstFreightDest = dictFreightDest.ToList();
            List<KeyValuePair<string, int>> lstPaxAirline = dictPaxAirline.ToList();
            List<KeyValuePair<string, int>> lstFreightAirline = dictFreightAirline.ToList();

            lstPaxDest.Sort( T100DB.CmpRankItem );
            lstFreightDest.Sort( T100DB.CmpRankItem );
            lstPaxAirline.Sort( T100DB.CmpRankItem );
            lstFreightAirline.Sort( T100DB.CmpRankItem );

            string res = "";

            string paxDestRank = DestRankToJson( lstPaxDest, locale );
            res += "\"paxDestRank\":" + paxDestRank + ",";
            string freightDestRank = DestRankToJson( lstFreightDest, locale );
            res += "\"freightDestRank\":" + freightDestRank + ",";

            int totalPax = GetRankTotalFlow( lstPaxAirline );
            string paxAirlineRank = AirlineRankToJson( lstPaxAirline, totalPax, locale );
            res += "\"paxAirlineRank\":" + paxAirlineRank + ",";
            res += "\"totalPax\":" + Utils.DoubleQuoteStr( Utils.FormatLargeNumber( totalPax, locale ) ) + ",";

            int totalFreight = GetRankTotalFlow( lstFreightAirline );
            string freightAirlineRank = AirlineRankToJson( lstFreightAirline, totalFreight, locale );
            res += "\"freightAirlineRank\":" + freightAirlineRank + ",";
            res += "\"totalFreight\":" + Utils.DoubleQuoteStr( Utils.FormatLargeNumber( totalFreight, locale ) ) + "";

            res = "{" + res + "}";
            return res;
        }

        public static int GetRankTotalFlow( List<KeyValuePair<string, int>> rank ) {
            int totalFlow = 0;
            for ( int i = 0; i < rank.Count; i++ ) {
                totalFlow += rank[ i ].Value;
            }
            return totalFlow;
        }
        public static string DestRankToJson( List<KeyValuePair<string, int>> rank, string locale ) {
            JavaScriptSerializer jsoner = new JavaScriptSerializer();
            int maxAirport = 10;
            string res = "[";
            for ( int i = 0; i < maxAirport && i < rank.Count; i++ ) {
                Dictionary<string, string> item = new Dictionary<string, string>();
                item[ "iata" ] = rank[ i ].Key;
                item[ "flow" ] = rank[ i ].Value.ToString();
                Airport airport = AirportData.Query( rank[ i ].Key, locale );
                item[ "icao" ] = airport.Icao;
                item[ "city" ] = airport.City;
                item[ "country" ] = airport.Country;
                if ( i != 0 )
                    res += ", ";
                res += jsoner.Serialize( item );
            }
            res += "]";
            return res;
        }

        public static string AirlineRankToJson( List<KeyValuePair<string, int>> rank, int totalFlow, string locale ) {
            if ( totalFlow == 0 )
                return "[]";
            JavaScriptSerializer jsoner = new JavaScriptSerializer();
            int maxAirline = 5;
            int otherFlow = 0;
            string res = "[";

            for ( int i = 0; i < rank.Count; i++ ) {
                if ( i < maxAirline ) {
                    Dictionary<string, string> item = new Dictionary<string, string>();
                    Carrier airline = CarrierData.Query( rank[ i ].Key, locale );
                    item[ "airline" ] = airline.FullName + " (" + airline.Code + ")";
                    //item[ "flow" ] = Utils.FormatLargeNumber( rank[ i ].Value);
                    item[ "flow" ] = rank[ i ].Value.ToString();
                    item[ "per" ] = ( ( double ) rank[ i ].Value * 100.0 / totalFlow ).ToString( "N1" ) + "%";
                    if ( i != 0 )
                        res += ", ";
                    res += jsoner.Serialize( item );
                } else {
                    otherFlow += rank[ i ].Value;
                }
            }

            if ( otherFlow > 0 ) {
                Dictionary<string, string> item = new Dictionary<string, string>();
                item[ "airline" ] = Localization.QueryLocale( locale )._other;
                item[ "flow" ] = otherFlow.ToString();
                item[ "per" ] = ( ( double ) otherFlow * 100.0 / totalFlow ).ToString( "N1" ) + "%";
                res += ", " + jsoner.Serialize( item );
            }
            res += "]";
            return res;
        }

        public static string QueryAirportTimeSeries( string origin ) {
            NpgsqlConnection conn = null;
            try {

                conn = new NpgsqlConnection( T100DB.connString );
                conn.Open();

                string where = " WHERE \"ORIGIN\"=" + Utils.SingleQuoteStr( origin );
                string[] fields = new string[] { Utils.DoubleQuoteStr( "AIRLINE" ), Utils.DoubleQuoteStr( "FLOW_TYPE" ), Utils.DoubleQuoteStr( "TIME_SERIES" ) };
                string fieldStr = String.Join( ",", fields );
                string sql = "SELECT " + fieldStr + " FROM \"T100AirportTimeSeries\"" + where;
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();
                string jsonPax = "";
                string jsonFreight = "";
                while ( dr.Read() ) {
                    if ( dr[ "FLOW_TYPE" ].ToString() == "Pax" ) {
                        if ( jsonPax != "" )
                            jsonPax += ",";
                        jsonPax += Utils.DoubleQuoteStr( dr[ "AIRLINE" ].ToString() ) + ":" + dr[ "TIME_SERIES" ].ToString();
                    } else if ( dr[ "FLOW_TYPE" ].ToString() == "Freight" ) {
                        if ( jsonFreight != "" )
                            jsonFreight += ",";
                        jsonFreight += Utils.DoubleQuoteStr( dr[ "AIRLINE" ].ToString() ) + ":" + dr[ "TIME_SERIES" ].ToString();
                    }
                }

                jsonPax = "{" + jsonPax + "}";
                jsonFreight = "{" + jsonFreight + "}";
                string res = String.Format( "\"pax\": {0}, \"freight\": {1} ", jsonPax, jsonFreight );
                return "{" + res + "}";
            } catch ( NpgsqlException e ) {

            } finally {
                conn.Close();
            }
            return "";
        }


        public static string QueryRouteTimeSeries( string origin, string dest, string flowType, string locale ) {
            NpgsqlConnection conn = null;
            try {

                conn = new NpgsqlConnection( T100DB.connString );
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

        public static string QueryT100AirportByGeometry( double x1, double y1, double x2, double y2, string returnType, string locale ) {
            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( T100DB.connString );
                conn.Open();

                string sql = string.Format( "SELECT \"IATA\" FROM \"T100Airport\" WHERE \"GEOM\" && ST_MakeEnvelope({0}, {1}, {2}, {3}, 4326)", x1, y1, x2, y2 );
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

        public static string QueryAllAirlines(string locale) {
            string res = "";
            JavaScriptSerializer jsoner = new JavaScriptSerializer();
            Dictionary<string, Carrier> dict = CarrierData.GetAllCarrier( locale );
            foreach ( KeyValuePair<string, Carrier> item in dict ) {
                if ( res != "" )
                    res += ",";
                res += string.Format( "[{0}, {1}, {2}, {3}, {4}, {5}]",
                    Utils.DoubleQuoteStr( item.Value.Code ),
                    Utils.DoubleQuoteStr( item.Value.FullName ),
                    Utils.DoubleQuoteStr( item.Value.Country ),
                    Utils.DoubleQuoteStr( item.Value.Type ),
                    Utils.DoubleQuoteStr( item.Value.Note ),
                    Utils.DoubleQuoteStr( item.Value.Availablity ) );
            }
            return "[" + res + "]";
        }


        public static string QueryByAirlines( string year, string airline, string region, string locale, int limit = 100 ) {
            NpgsqlConnection conn = null;

            try {
                string res = "";
                conn = new NpgsqlConnection( T100DB.connString );
                conn.Open();
                JavaScriptSerializer jsoner = new JavaScriptSerializer();
                string where = T100DB.MakeWhere( year, airline, "", "" );
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
                    where += " AND ( \"AP1\".\"COUNTRY\" = \'" + Global.CURRENT_COUNTRY + "\'  AND \"AP2\".\"COUNTRY\" = \'" + Global.CURRENT_COUNTRY + "\' ) ";
                } else if ( region == "Intl" ) {
                    where += " AND ( \"AP1\".\"COUNTRY\" <> \'" + Global.CURRENT_COUNTRY + "\'  OR \"AP2\".\"COUNTRY\" <> \'" + Global.CURRENT_COUNTRY + "\' ) ";
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
                conn = new NpgsqlConnection( T100DB.connString );
                conn.Open();

                // Query T100 Data
                string where = " WHERE " + T100DB.MakeWhere( year, airline, origin, dest );
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

                    if ( airport1.CountryEn != Global.CURRENT_COUNTRY && airport2.CountryEn != Global.CURRENT_COUNTRY ) {
                        destInfo.PartialData = true;
                        destInfo.DataSource = "T100FF";
                    } else {
                        destInfo.DataSource = "T100";
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
                conn = new NpgsqlConnection( T100DB.connString );
                conn.Open();
                string where = T100DB.MakeWhere( year, "", origin, dest );
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