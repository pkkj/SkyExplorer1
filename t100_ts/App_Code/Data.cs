using System;
using System.Collections.Generic;
using System.Web;

/// <summary>
/// Summary description for Data
/// </summary>
namespace AST {

    /// <summary>
    /// The interface that describe the property of data source
    /// </summary>
    public abstract class ADataSourceMetaData {
        public abstract string Name { get; }
        public abstract string SummaryTableName { get; }
        public abstract string TimeSeriesTableName { get; }
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

    }

    /// <summary>
    /// The register of different data sources. Each available data source should register an instance here.
    /// </summary>
    public class DataSourceRegister {
        public static Dictionary<string, ADataSourceMetaData> Register;
        static DataSourceRegister() {
            Register = new Dictionary<string, ADataSourceMetaData>();
            Register[ "T100Data" ] = new T100MetaData();
            Register[ "KrData" ] = new KrDataMetaData();
            Register[ "JpData" ] = new JpDataMetaData();
            Register[ "UkData" ] = new UkDataMetaData();
            Register[ "TwData" ] = new TwDataMetaData();
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