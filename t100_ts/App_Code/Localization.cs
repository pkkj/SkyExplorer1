using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AST {
    public class ENUSLocale {
        public string _other;
        public ENUSLocale() {
            _other = "Other";
        }
    }

    public class ZHCNLocale : ENUSLocale {
        public ZHCNLocale() {
            _other = "其他";
        }
    }
    public class Localization {
        static Dictionary<string, ENUSLocale> UiLocale;
        static Localization() {
            UiLocale = new Dictionary<string, ENUSLocale>();
            UiLocale[ "ENUS" ] = new ENUSLocale();
            UiLocale[ "ZHCN" ] = new ZHCNLocale();
        }

        public static ENUSLocale QueryLocale(string locale) {
            
            if ( UiLocale.ContainsKey( locale ) )
                return UiLocale[ locale ];
            return UiLocale[ "ENUS" ];
        } 
    }
}