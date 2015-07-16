using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AST {
    public class ENUSLocale {
        public string _other;
        public string _anyAirline;
        public ENUSLocale() {
            _other = "Other";
            _anyAirline = "All airlines";
        }
    }

    public class ZHCNLocale : ENUSLocale {
        public ZHCNLocale() {
            _other = "其他";
            _anyAirline = "所有航空公司";
        }
    }
    public class JAJPLocale : ENUSLocale {
        public JAJPLocale() {

        }
    }
    public class Localization {
        public static Dictionary<string, ENUSLocale> UiLocale;
        static Localization() {
            UiLocale = new Dictionary<string, ENUSLocale>();
            UiLocale[ "ENUS" ] = new ENUSLocale();
            UiLocale[ "ZHCN" ] = new ZHCNLocale();
            UiLocale[ "JAJP" ] = new JAJPLocale();
        }

        public static ENUSLocale QueryLocale( string locale ) {

            if ( UiLocale.ContainsKey( locale ) )
                return UiLocale[ locale ];
            return UiLocale[ "ENUS" ];
        }
    }
}