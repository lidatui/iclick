
var QLZQ = function(){};

QLZQ.head = document.getElementsByTagName('head')[0];
QLZQ.script = document.createElement("script");
QLZQ.script.setAttribute("src", 'http://10.29.236.95:3000/show?callback=QLZQ.callback&url='+location.href);

QLZQ.show = function(elementId){
    QLZQ.head.appendChild(QLZQ.script);
    QLZQ.elementId = elementId;
};

QLZQ.callback = function(data){
    document.getElementById(QLZQ.elementId).innerHTML = data.result;
    QLZQ.head.removeChild(QLZQ.script);
};