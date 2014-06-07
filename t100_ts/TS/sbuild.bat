tsc --out main.js CommonDataContent.ts MainPage.ts MainPageUi.ts DataSrcControl.ts ^
.\Common\Data.ts .\Common\Draw.ts .\Common\Global.ts .\Common\MapUtils.ts .\Common\Utils.ts ^
.\MyControls\CollapseTable.ts .\MyControls\DropDown.ts .\MyControls\PinPanel.ts .\MyControls\RankTable.ts ^
.\MyControls\SimpleTable.ts .\T100\T100AirlineContent.ts .\T100\T100AirlinePanel.ts ^
.\T100\T100AirportContent.ts .\T100\T100Common.ts .\T100\T100AirportPanel.ts ^
.\T100\T100DataQuery.ts .\T100\T100MapControl.ts .\T100\T100OriginPanel.ts ^
.\Ref\google.d.ts .\Ref\openlayers.d.ts ^
..\Scripts\typings\flot\jquery.flot.d.ts ^
..\Scripts\typings\jquery\jquery.d.ts  ^
..\Scripts\typings\jquery.ui.layout\jquery.ui.layout.d.ts ^
..\Scripts\typings\jqueryui\jqueryui.d.ts

tsc --out AirportReport.All.js ^
.\Common\Utils.ts .\Common\Data.ts .\Common\ReportPageUtils.ts .\Common\Global.ts ^
.\T100\T100DataQuery.ts .\T100\T100Common.ts ^
.\MyControls\DropDown.ts .\MyControls\RankTable.ts .\MyControls\SimpleTable.ts ^
..\Scripts\typings\jquery\jquery.d.ts ^
..\Scripts\typings\jquery.ui.layout\jquery.ui.layout.d.ts ^
..\Scripts\typings\flot\jquery.flot.d.ts ^
.\Ref\google.d.ts .\Ref\openlayers.d.ts ^
AirportReport.ts


tsc --out RouteReport.All.js ^
.\Common\Utils.ts .\Common\Data.ts .\Common\ReportPageUtils.ts .\Common\Global.ts ^
.\T100\T100DataQuery.ts .\T100\T100Common.ts ^
.\MyControls\DropDown.ts .\MyControls\RankTable.ts .\MyControls\SimpleTable.ts ^
..\Scripts\typings\jquery\jquery.d.ts ^
..\Scripts\typings\jquery.ui.layout\jquery.ui.layout.d.ts ^
..\Scripts\typings\flot\jquery.flot.d.ts ^
.\Ref\google.d.ts .\Ref\openlayers.d.ts ^
RouteReport.ts

tsc --out Main.Strings.zhCN.js .\I18n\Strings.zhCN.ts
tsc --out Main.Strings.enUS.js .\I18n\Strings.enUS.ts
tsc --out Main.Strings.jaJP.js .\I18n\Strings.jaJP.ts

tsc --out T100.Strings.zhCN.js .\T100\I18n\Strings.zhCN.ts
tsc --out T100.Strings.enUS.js .\T100\I18n\Strings.enUS.ts