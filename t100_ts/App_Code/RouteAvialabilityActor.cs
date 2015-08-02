using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using Npgsql;

namespace AST {

    /// <summary>
    /// Provide the availability information on each route. 
    /// </summary>
    public class RouteAvialabilityActor {

        /// <summary>
        /// Given the origin and destination, query the available data source
        /// </summary>
        /// <returns>The available data sources, origin info and dest info.</returns>
        static public string QueryRouteAvailableDataSource( string origin, string dest, string locale ) {
            Airport originAirport = AirportData.Query( origin, locale );
            Airport destAirport = AirportData.Query( dest, locale ); 
            if ( originAirport == null || destAirport == null ) return "";

            List<string> lstResult = new List<string>();
            foreach ( KeyValuePair<string, ADataSourceMetaData> pair in DataSourceRegister.Register ) {
                if ( RouteAvialabilityActor.QueryRouteAvailableInTable( origin, dest, pair.Value.SummaryTableName ) ) {
                    lstResult.Add( pair.Key );
                }
            }

            Dictionary<string, object> res = new Dictionary<string, object>() { 
                {"origin", originAirport.CastToJsonDict(locale)},
                {"dest", destAirport.CastToJsonDict(locale)},
                {"dataSrc", lstResult}
            };
            return new JavaScriptSerializer().Serialize(res);
        }

        static private bool QueryRouteAvailableInTable( string origin, string dest, string tableName ) {
            NpgsqlConnection conn = null;
            try {
                conn = new NpgsqlConnection( ASTDatabase.connStr2 );
                conn.Open();
                string sql = string.Format( @"SELECT ""YEAR"" FROM ""{0}"" WHERE ""ROUTE"" = '{1};{2}'", tableName, origin, dest );
                NpgsqlCommand command = new NpgsqlCommand( sql, conn );
                NpgsqlDataReader dr = command.ExecuteReader();

                while ( dr.Read() )
                    return true;

            } catch ( NpgsqlException e ) {
            } finally {
                conn.Close();
            }
            return false;
        }
    }
}