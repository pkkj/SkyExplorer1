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

    public class CnCaacData : ADataSourceMetaData {
        public override string Name {
            get { return "CN_CAAC"; }
        }
        public override string Country {
            get { return "CN"; }
        }
        public override bool HasDomesticData {
            get { return false; }
        }
        public override bool HasInternationalData {
            get { return false; }
        }
        public override bool HasAirlineInfo {
            get { return false; }
        }
        public override bool HasPaxData {
            get { return true; }
        }
        public override bool HasFreightData {
            get { return true; }
        }
        public override bool HasSeatData {
            get { return false; }
        }
        public override bool HasFlightData {
            get { return false; }
        }
        public override bool HasDoubleFlowData {
            get { return false; }
        }
        public override StatTarget StatTarget {
            get { return StatTarget.Airport; }
        }

        public override bool isAirportTimeSeriesCovered( string code ) {
            if ( code == "HKG" || code == "MFM" )
                return false;
            return base.isAirportTimeSeriesCovered( code );
        }
    }

    public class CnMiaData : ADataSourceMetaData {
        public override string Name {
            get { return "CN_MIA"; }
        }
        public override string Country {
            get { return "CN"; }
        }
        public override bool HasDomesticData {
            get { return false; }
        }
        public override bool HasInternationalData {
            get { return false; }
        }
        public override bool HasAirlineInfo {
            get { return false; }
        }
        public override bool HasPaxData {
            get { return true; }
        }
        public override bool HasFreightData {
            get { return true; }
        }
        public override bool HasSeatData {
            get { return false; }
        }
        public override bool HasFlightData {
            get { return false; }
        }
        public override bool HasDoubleFlowData {
            get { return false; }
        }
        public override StatTarget StatTarget {
            get { return StatTarget.Airport; }
        }

        public override bool isAirportTimeSeriesCovered( string code ) {
            return code == "MFM";
        }
    }


    public class ThAotData : ADataSourceMetaData {
        public static HashSet<string> AvaialbleAirports = new HashSet<string>(new string[]{"BKK", "DMK"});
        public override string Name {
            get { return "TH_AOT"; }
        }
        public override string Country {
            get { return "TH"; }
        }
        public override bool HasDomesticData {
            get { return false; }
        }
        public override bool HasInternationalData {
            get { return false; }
        }
        public override bool HasAirlineInfo {
            get { return false; }
        }
        public override bool HasPaxData {
            get { return true; }
        }
        public override bool HasFreightData {
            get { return true; }
        }
        public override bool HasSeatData {
            get { return false; }
        }
        public override bool HasFlightData {
            get { return true; }
        }
        public override bool HasDoubleFlowData {
            get { return false; }
        }
        public override StatTarget StatTarget {
            get { return StatTarget.Airport; }
        }

        public override bool isAirportTimeSeriesCovered( string code ) {
            return AvaialbleAirports.Contains( code );
        }
    }

    public class AuBitreData : ADataSourceMetaData {
        public static HashSet<string> AvaialbleAirports = new HashSet<string>( new string[] { "ADL", "ASP", "BNE", "CNS", "CBR", "DRW",  "OOL", "HBA", "KTA", "LST", "MKY", "MEL", "PER", "ROK", "MCY", "SYD", "TSV", "NTL" } );
        public override string Name {
            get { return "AU_BITRE"; }
        }
        public override string Country {
            get { return "AU"; }
        }
        public override bool HasDomesticData {
            get { return false; }
        }
        public override bool HasInternationalData {
            get { return false; }
        }
        public override bool HasAirlineInfo {
            get { return false; }
        }
        public override bool HasPaxData {
            get { return true; }
        }
        public override bool HasFreightData {
            get { return false; }
        }
        public override bool HasSeatData {
            get { return false; }
        }
        public override bool HasFlightData {
            get { return true; }
        }
        public override bool HasDoubleFlowData {
            get { return false; }
        }
        public override StatTarget StatTarget {
            get { return StatTarget.Airport; }
        }

        public override bool isAirportTimeSeriesCovered( string code ) {
            return AvaialbleAirports.Contains( code );
        }
    }
}