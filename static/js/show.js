
var QLZQ = function(){};

QLZQ.head = document.getElementsByTagName('head')[0];
QLZQ.script = document.createElement("script");
QLZQ.script.setAttribute("src", 'http://127.0.0.1:3000/show?callback=QLZQ.callback&url='+location.href);

QLZQ.show = function(elementId){
    QLZQ.head.appendChild(QLZQ.script);
    QLZQ.elementId = elementId;
};

QLZQ.callback = function(data){
    document.getElementById(QLZQ.elementId).innerHTML = data;
    QLZQ.head.removeChild(QLZQ.script);
};