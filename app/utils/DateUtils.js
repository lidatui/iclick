module.exports = {
    now : function(){
        var offset = 8;
        var localDate = new Date();
        var localTime = localDate.getTime();
        var localOffset= localDate.getTimezoneOffset()*60000;
        var utc = localTime + localOffset;
        //return new Date(utc + (3600000*offset));
        return new Date();
    }
}