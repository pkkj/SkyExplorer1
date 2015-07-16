using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using Npgsql;

namespace AST {
    /// <summary>
    /// The actor which handle the query of airport statistics.
    /// </summary>
    public class AirportStatActor {

        public const int MaxAirlineNumberInRank = 5;
        public const int MaxAirportNumberInRank = 10;

        /// <summary>
        /// Query the airport statistics: top destinations and airline share
        /// </summary>
        /// <param name="dataSrc">The data source for the query: T100, TwData, KrData, etc.</param>
        public static string QueryAirportStat( string dataSrc, string year, string airport, string locale ) {

            // Get the meta data of specific data source
            ADataSourceMetaData metaData = null;
            if ( !DataSourceRegister.Register.TryGetValue( dataSrc, out metaData ) ) {
                return "";
            }

            NpgsqlConnection conn = null;
            string res = "";
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();

                string[] fields = new string[] { Utils.DoubleQuoteStr( "AIRLINE" ), Utils.DoubleQuoteStr( "DEST" ), Utils.DoubleQuoteStr( "PAX" ), Utils.DoubleQuoteStr( "FREIGHT" ) };
                string fieldStr = String.Join( ",", fields );
                string sql = String.Format( @"SELECT {0} FROM ""{1}"" WHERE {2}", fieldStr, metaData.SummaryTableName, ASTDatabase.MakeWhere( year, "", airport, "" ) );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );

                NpgsqlDataReader dr = command.ExecuteReader();
                List<RouteStat> routes = new List<RouteStat>();

                while ( dr.Read() ) {
                    RouteStat route = new RouteStat();
                    route.Airline = dr[ "AIRLINE" ].ToString();
                    route.Dest = dr[ "DEST" ].ToString();
                    route.Pax = metaData.HasPaxData ? Convert.ToInt32( dr[ "PAX" ] ) : 0;
                    route.Freight = metaData.HasFreightData ? Convert.ToInt32( dr[ "FREIGHT" ] ) : 0;
                    routes.Add( route );
                }

                string[] regions = new string[] { "All", "International", "Domestic" };
                foreach ( string region in regions ) {
                    if ( res != "" )
                        res += ",";
                    res += Utils.DoubleQuoteStr( region ) + ":" + CreateRankByRegion( routes, region, metaData, locale );
                }
                return "{" + res + "}";
            }  finally {
                conn.Close();
            }
            return "";
        }


        private static void AddFlowToDict( Dictionary<string, int> dictDest, Dictionary<string, int> dictAirline, RouteStat route, Func<RouteStat, int> getFlow ) {
            if ( getFlow( route ) > 0 ) {
                if ( !dictDest.ContainsKey( route.Dest ) ) {
                    dictDest[ route.Dest ] = 0;
                }
                dictDest[ route.Dest ] += getFlow( route );

                if ( !dictAirline.ContainsKey( route.Airline ) ) {
                    dictAirline[ route.Airline ] = 0;
                }
                dictAirline[ route.Airline ] += getFlow( route );
            }
        }

        /// <summary>
        /// Create the dest rank for the given region.
        /// </summary>
        private static string CreateRankByRegion( List<RouteStat> routes, string region, ADataSourceMetaData meteData, string locale ) {
            Dictionary<string, int> dictPaxDest = new Dictionary<string, int>();
            Dictionary<string, int> dictFreightDest = new Dictionary<string, int>();
            Dictionary<string, int> dictPaxAirline = new Dictionary<string, int>();
            Dictionary<string, int> dictFreightAirline = new Dictionary<string, int>();

            foreach ( RouteStat route in routes ) {
                Airport airport = AirportData.Query( route.Dest, locale );
                if ( region == "International" && airport.Country != meteData.Country ||
                    region == "Domestic" && airport.Country == meteData.Country ||
                    region == "All" ) {
                    AddFlowToDict( dictPaxDest, dictPaxAirline, route, item => item.Pax );
                    AddFlowToDict( dictFreightDest, dictFreightAirline, route, item => item.Freight );
                }
            }

            List<KeyValuePair<string, int>> lstPaxDest = dictPaxDest.ToList();
            List<KeyValuePair<string, int>> lstFreightDest = dictFreightDest.ToList();
            List<KeyValuePair<string, int>> lstPaxAirline = dictPaxAirline.ToList();
            List<KeyValuePair<string, int>> lstFreightAirline = dictFreightAirline.ToList();

            lstPaxDest.Sort( ASTDatabase.CmpRankItem );
            lstFreightDest.Sort( ASTDatabase.CmpRankItem );
            lstPaxAirline.Sort( ASTDatabase.CmpRankItem );
            lstFreightAirline.Sort( ASTDatabase.CmpRankItem );

            // Create the destination rank for passenger and freight
            string paxDestRank = DestRankToJson( lstPaxDest, locale );
            string freightDestRank = DestRankToJson( lstFreightDest, locale );

            // Create the airline rank for passenger and freight
            int totalPax = lstPaxAirline.Sum( item => item.Value );
            string paxAirlineRank = meteData.HasAirlineInfo ? AirlineRankToJson( lstPaxAirline, totalPax, locale ) : "[]";
            int totalFreight = lstFreightAirline.Sum( item => item.Value );
            string freightAirlineRank = meteData.HasAirlineInfo ? AirlineRankToJson( lstFreightAirline, totalFreight, locale ) : "[]";

            return string.Format( @"{{""paxDestRank"" : {0}, ""freightDestRank"" : {1}, ""paxAirlineRank"" : {2}, ""freightAirlineRank"" : {3}, ""totalPax"" : {4}, ""totalFreight"" : {5} }}",
                paxDestRank, freightDestRank, paxAirlineRank, freightAirlineRank,
                Utils.DoubleQuoteStr( Utils.FormatLargeNumber( totalPax, locale ) ),
                Utils.DoubleQuoteStr( Utils.FormatLargeNumber( totalFreight, locale ) ) );

        }

        private static string DestRankToJson( List<KeyValuePair<string, int>> rank, string locale ) {
            JavaScriptSerializer jsoner = new JavaScriptSerializer();
            string res = "";
            for ( int i = 0; i < MaxAirportNumberInRank && i < rank.Count; i++ ) {
                Dictionary<string, string> item = new Dictionary<string, string>();
                Airport airport = AirportData.Query( rank[ i ].Key, locale );
                item[ "iata" ] = rank[ i ].Key;
                item[ "flow" ] = rank[ i ].Value.ToString();
                item[ "icao" ] = airport.Icao;
                item[ "city" ] = airport.ServeCity[0];
                item[ "country" ] = airport.Country;
                item[ "serveCityL" ] = City.LocalizeCountryAndSubdiv( locale, airport.ServeCity[ 0 ] );
                item[ "displayName" ] = airport.DisplayName;
                if ( i != 0 )
                    res += ", ";
                res += jsoner.Serialize( item );
            }
            return "[" + res + "]";
        }

        private static string AirlineRankToJson( List<KeyValuePair<string, int>> rank, int totalFlow, string locale ) {
            if ( totalFlow == 0 )
                return "[]";
            JavaScriptSerializer jsoner = new JavaScriptSerializer();
            int otherFlow = 0;
            string res = "";

            for ( int i = 0; i < rank.Count; i++ ) {
                if ( i < MaxAirlineNumberInRank ) {
                    Dictionary<string, string> item = new Dictionary<string, string>();
                    Airline airline = AirlineData.Query( rank[ i ].Key, locale );
                    item[ "airline" ] = airline.FullName + " (" + airline.Iata + ")";
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
            return "[" + res + "]";
        }
    }
}