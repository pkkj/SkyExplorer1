var match, pl = /\+/g, // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g, decode = function (s) {
        return decodeURIComponent(s.replace(pl, " "));
    }, query = window.location.search.substring(1);
var urlParams: { [key: string]: string; } = {};
while (match = search.exec(query))
    urlParams[decode(match[1])] = decode(match[2]);


var pageName = window.location.href;
if (pageName.lastIndexOf("?") != -1)
    pageName = window.location.href.substring(0, window.location.href.lastIndexOf("?"));
pageName = pageName.substring(0, pageName.lastIndexOf("."));
var locale = "enus";
var support = { "ZHCN": true, "ENUS": true };
if (urlParams["locale"] && support[urlParams["locale"].toUpperCase()] == true) {
    locale = urlParams["locale"];
}

window.location.href = pageName + "-" + locale + ".html";