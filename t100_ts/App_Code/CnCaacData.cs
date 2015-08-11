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
        public virtual StatTarget StatTarget {
            get { return StatTarget.Airport; }
        }

        public override bool isAirportTimeSeriesCovered( string code ) {
            if ( code == "HKG" || code == "MFM" )
                return false;
            return base.isAirportTimeSeriesCovered( code );
        }
    }
}