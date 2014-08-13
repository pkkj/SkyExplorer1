using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Globalization;
using System.Resources;

namespace AST {
    [WebService( Namespace = "http://t100geovis/", Name = "AST" )]
    [WebServiceBinding( ConformsTo = WsiProfiles.BasicProfile1_1 )]
    [System.Web.Script.Services.ScriptService]


    public class ASTData : System.Web.Services.WebService {

        public ASTData() {

        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string MatchAirport( string input, string locale ) {
            return T100Data.MatchAirport( input, locale );
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryAirportInfo( string airportCode, string codeType, string locale ) {
            return AirportData.QueryAirportJson( airportCode, locale );
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryAirportYearAvailability( string airportCode, string codeType, string dataSrc, string locale ) {
            string res = AirportAvailabilityActor.QueryAirportYearAvailability( airportCode, codeType, dataSrc, locale );
            return res;
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string T100QueryByRoute( string year, string origin, string dest, string locale ) {
            return T100Data.QueryByRoute( year, origin, dest, locale );
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryAirportTimeSeries( string dataSrc, string origin, string locale ) {
            string res = TimeSeriesActor.QueryAirportTimeSeries( dataSrc, origin );
            return res;
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryRouteTimeSeries( string dataSrc, string origin, string dest, string flowType, string locale ) {
            string res = TimeSeriesActor.QueryRouteTimeSeries( dataSrc, origin, dest, flowType, locale );
            return res;
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryByAirlines( string year, string airline, string region, string locale, int limit = 100 ) {
            string res = T100Data.QueryByAirlines( year, airline, region, locale, limit );
            return res;
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryRouteAircraftStat( string year, string origin, string dest, string locale ) {
            string res = T100AircraftStat.QueryRouteAircraftStat( year, origin, dest, locale );
            return res;
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string UkDataQueryByRoute( string year, string origin, string dest, string locale ) {
            string res = UkData.QueryByRoute( year, origin, dest, locale );
            return res;
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string TwDataQueryByRoute( string year, string origin, string dest, string locale ) {
            string res = TwData.QueryByRoute( year, origin, dest, locale );
            return res;
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string JpDataQueryByRoute( string year, string origin, string dest, string locale ) {
            string res = JpData.QueryByRoute( year, origin, dest, locale );
            return res;
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string KrDataQueryByRoute( string year, string origin, string dest, string locale ) {
            string res = KrData.QueryByRoute( year, origin, dest, locale );
            return res;
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string WikiDataQueryByRoute( string year, string origin, string dest, string locale ) {
            string res = WikiData.QueryByRoute( year, origin, dest, locale );
            return res;
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryByOrigin( string year, string origin, string dest, string airline, string queryType, string dataSource, string locale ) {
            return DataQuery.QueryByOrigin( year, origin, dest, airline, queryType, dataSource, locale );
        }


        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryAirportAvailableDataSource( string airportCode, string locale ) {
            return AirportAvailabilityActor.QueryAirportAvailableDataSource( airportCode, locale );
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryAirportStat( string dataSrc, string year, string airport, string locale ) {
            return AirportStatActor.QueryAirportStat( dataSrc, year, airport, locale );
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryRouteAvailableDataSource( string origin, string dest, string locale ) {
            return RouteAvialabilityActor.QueryRouteAvailableDataSource( origin, dest, locale );
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryAvailableAirlineByDataSource( string dataSrc, string year, string locale ) {
            return AirlineAvailabilityActor.QueryAvailableAirlineByDataSource( dataSrc, year, locale );
        }

        [WebMethod]
        [ScriptMethod( ResponseFormat = ResponseFormat.Json )]
        public string QueryAirlineYearAvailability( string airline, string dataSrc ) {
            return AirlineAvailabilityActor.QueryAirlineYearAvailability( airline, dataSrc );
        }
    }
}