using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;

namespace AST {
    public static class Utils {

        public static string SingleQuoteStr( string s ) {
            return "\'" + s + "\'";
        }

        public static string DoubleQuoteStr( string s ) {
            return "\"" + s + "\"";
        }

        public static string FormatLargeNumber( int num, string locale ) {
            if ( locale == "ZHCN" ) {
                if ( num >= 10000 ) {
                    double fNum = ( double ) num / 10000.0;
                    return fNum.ToString( "N1" ) + "万";
                } else {
                    return num.ToString();
                }
            } else {
                if ( num >= 1000 ) {
                    double fNum = ( double ) num / 1000.0;
                    return fNum.ToString( "N1" ) + " K";
                } else {
                    return num.ToString();
                }
            }
        }
        public static double DistEarth( double x1, double y1, double x2, double y2 ) {
            double R = 6371.004;

            double p10 = x1 * Math.PI / 180;
            double p11 = y1 * Math.PI / 180;
            double p20 = x2 * Math.PI / 180;
            double p21 = y2 * Math.PI / 180;
            if ( x1 == x2 && y1 == y2 )
                return 0.0;
            double dis = Math.Acos( Math.Sin( p11 ) * Math.Sin( p21 ) + Math.Cos( p11 ) * Math.Cos( p21 ) * Math.Cos( p20 - p10 ) ) * R;
            return dis;
        }

        public static string ProcessWktGeometryString( string geom ) {
            geom = geom.Replace( "MULTILINESTRING", "" );
            geom = geom.Replace( "(", "[" );
            geom = geom.Replace( ")", "]" );
            return geom;
        }

        public static void GetDistanceByUnits( Airport originAirport, Airport destAirport, out double distKm, out double distMile, out double distNm ) {
            distKm = Utils.DistEarth( originAirport.Geometry.x, originAirport.Geometry.y, destAirport.Geometry.x, destAirport.Geometry.y );
            distMile = Math.Round( distKm * 0.621371, 0 );
            distNm = Math.Round( distKm * 0.539957, 0 );
            distKm = Math.Round( distKm, 0 );
        }
    }

    public static class ASTDatabase {
        public static string connString = ConfigurationManager.ConnectionStrings[ "connstr" ].ConnectionString;

        public static string MakeWhere( string year, string airline, string origin, string dest ) {
            string where = "";
            if ( year != "" && airline != "" && origin != "" && dest != "" ) {
                where = "\"ITEMKEY\" = ";
                where += Utils.SingleQuoteStr( String.Join( ",", new string[] { year, airline, origin, dest } ) );
            } else if ( year != "" && origin != "" && dest != "" ) {
                where = "\"YEAR_ROUTE\" = ";
                where += Utils.SingleQuoteStr( String.Join( ",", new string[] { year, origin, dest } ) );
            } else if ( origin != "" && dest != "" ) {
                where = "\"ROUTE\" = ";
                where += Utils.SingleQuoteStr( String.Join( ",", new string[] { origin, dest } ) );
            } else {
                if ( year != "" ) {
                    where += " \"YEAR\"  = " + Utils.SingleQuoteStr( year );
                }

                if ( airline != "" ) {
                    if ( where != "" ) where += " AND ";
                    where += " \"AIRLINE\"  = " + Utils.SingleQuoteStr( airline );
                }

                if ( origin != "" ) {
                    if ( where != "" ) where += " AND ";
                    where += " \"ORIGIN\"  = " + Utils.SingleQuoteStr( origin );
                }

                if ( dest != "" ) {
                    if ( where != "" ) where += " AND ";
                    where += " \"DEST\"  = " + Utils.SingleQuoteStr( dest );
                }
            }
            return where;
        }

        public static int CmpRankItem( KeyValuePair<string, int> a, KeyValuePair<string, int> b ) {
            return b.Value.CompareTo( a.Value );
        }


    }

    public class Global {
        public static string CURRENT_COUNTRY = "United States";
        public static string DataDir = @"E:\a302\wwwroot\ServerData\";
    }
    public class Point {
        public double x;
        public double y;

        public Point( double x, double y ) {
            this.x = x;
            this.y = y;
        }
    }
}