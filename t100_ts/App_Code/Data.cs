using System;
using System.Collections.Generic;
using System.Web;

/// <summary>
/// Summary description for Data
/// </summary>
namespace AST {

    public enum StatTarget {
        Airport = 1,
        Route = 2
    }

    /// <summary>
    /// The interface that describe the property of data source
    /// </summary>
    public abstract class ADataSourceMetaData {
        public abstract string Name { get; }
        public string SummaryTableName {
            get { return Name + "Summary"; }
        }
        public string AirportTimeSeriesTableName {
            get { return Name + "AirportTimeSeries"; }
        }
        public string RouteTimeSeriesTableName {
            get { return Name + "RouteTimeSeries"; }
        }
        public abstract string Country { get; }
        public virtual bool HasDomesticData {
            get { return false; }
        }
        public virtual bool HasInternationalData {
            get { return false; }
        }
        public virtual bool HasAirlineInfo {
            get { return false; }
        }
        public virtual bool HasPaxData {
            get { return false; }
        }
        public virtual bool HasFreightData {
            get { return false; }
        }
        public virtual bool HasSeatData {
            get { return false; }
        }
        public virtual bool HasFlightData {
            get { return false; }
        }
        public virtual bool HasDoubleFlowData {
            get { return false; }
        }
        public virtual StatTarget StatTarget {
            get { return StatTarget.Airport | StatTarget.Route; }
        }
        public virtual bool isAirportTimeSeriesCovered( string code ) {
            Airport airport = AirportData.Query( code );
            if ( airport == null )
                return false;
            return airport.Country == Country;
        }
    }

    /// <summary>
    /// The register of different data sources. Each available data source should register an instance here.
    /// </summary>
    public class DataSourceRegister {
        public static Dictionary<string, ADataSourceMetaData> Register;
        private static Dictionary<string, string> CountryToDataSrc;
        static DataSourceRegister() {
            Register = new Dictionary<string, ADataSourceMetaData>();
            CountryToDataSrc = new Dictionary<string, string>();
            RegisterDataSource( "T100Data", new T100MetaData() );
            RegisterDataSource( "KoreaData", new KrDataMetaData() );
            RegisterDataSource( "JapanData", new JpDataMetaData() );
            RegisterDataSource( "UkData", new UkDataMetaData() );
            RegisterDataSource( "TaiwanData", new TwDataMetaData() );
            RegisterDataSource( "CN_CAAC", new CnCaacData() );
            RegisterDataSource( "CN_MIA", new CnMiaData() );
            RegisterDataSource( "TH_AOT", new ThAotData() );
            RegisterDataSource( "AU_BITRE", new AuBitreData() );  
            
        }

        private static void RegisterDataSource( string name, ADataSourceMetaData dataSrc ) {
            Register[ name ] = dataSrc;
            CountryToDataSrc[ dataSrc.Country ] = name;
        }

        public static string QueryCountryByDataSrc( string country ) {
            string dataSrc = "";
            if ( CountryToDataSrc.TryGetValue( country, out dataSrc ) ) {
                return dataSrc;
            }
            return "";
        }

        public static ADataSourceMetaData GetDataSrc( string dataSrc ) {
            if ( Register.ContainsKey( dataSrc ) )
                return Register[ dataSrc ];
            return null;
        }
    }

    /// <summary>
    /// The statistics for a standard single route
    /// </summary>
    public class RouteStat {
        public string Year;
        public string Airline;
        public string Dest;
        public int Freight;
        public int Pax;
        public List<int> MonthPax;
        public List<int> MonthFreight;

        public RouteStat() {

        }
    }
}