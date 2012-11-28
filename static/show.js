
var _iclick = _iclick || [];
(function () {
    var h = (_iclick['slice']) ? _iclick.slice(0) : [];
    _iclick = {track_referrer:true, show:function (elementId,i,r) {
        _iclick.elementId = elementId;
        this.setCookie('_iclick_cookie', 1, 1);
        var a = this.url();
        if (a) {
            if(i){
                a += "&i="+i;
            }
            if(r){
                a += "&r="+r;
            }

            var t   = document.createElement('script');
            t.type  = 'text/javascript';
            t.async = true;
            t.src = a;
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(t, s);



            var b = 60 * 60, d = b * 24, f = d * 31, c = d * 365, i = c * 10;
            if (!this.getCookie('_iclick_unique_hour')) {
                this.setCookie('_iclick_unique_hour', 1, b)
            }
            if (!this.getCookie('_iclick_unique_day')) {
                this.setCookie('_iclick_unique_day', 1, d)
            }
            if (!this.getCookie('_iclick_unique_month')) {
                this.setCookie('_iclick_unique_month', 1, f)
            }
            if (!this.getCookie('_iclick_unique_year')) {
                this.setCookie('_iclick_unique_year', 1, c)
            }
            if (!this.getCookie('_iclick_unique')) {
                this.setCookie('_iclick_unique', 1, i)
            }
        }
    }, push:function (a) {
        var b = a.shift();
        if (b == 'show') {
            _iclick.show(_iclick.elementId)
        }
    }, url:function () {
        var a, b, d = this.$('iclick-renderer');
        if (d) {
            b = d.getAttribute('data-site-id');
            a = d.src.replace('/show.js', '/show');
            a += "?h[siteId]=" + b;
            a += "&h[resource]=" + this.resource();
            a += "&h[referrer]=" + this.referrer();
            a += "&h[title]=" + this.title();
            a += "&h[userAgent]=" + this.agent();
            a += "&h[unique]=" + this.unique();
            a += "&h[uniqueHour]=" + this.uniqueHour();
            a += "&h[uniqueDay]=" + this.uniqueDay();
            a += "&h[uniqueMonth]=" + this.uniqueMonth();
            a += "&h[uniqueYear]=" + this.uniqueYear();
            a += "&h[screenX]=" + this.screenWidth();
            a += "&h[screenY]=" + this.screenHeight();
            a += "&h[browserX]=" + this.browserWidth();
            a += "&h[browserY]=" + this.browserHeight();
            a += "&timestamp=" + this.timestamp();
            a += "&callback=_iclick.callback";
        }
        return a
    }, domain:function () {
        return window.location.hostname
    }, referrer:function () {
        var a = '';
        if (!this.track_referrer) {
            return a
        }
        this.track_referrer = false;
        try {
            a = top.document.referrer
        } catch (e1) {
            try {
                a = parent.document.referrer
            } catch (e2) {
                a = ''
            }
        }
        if (a == '') {
            a = document.referrer
        }
        return this.escape(a)
    }, agent:function () {
        return this.escape(navigator.userAgent)
    }, escape:function (a) {
        return(typeof(encodeURIComponent) == 'function') ? encodeURIComponent(a) : escape(a)
    }, resource:function () {
        return this.escape(document.location.href)
    }, timestamp:function () {
        return new Date().getTime()
    }, title:function () {
        return(document.title && document.title != "") ? this.escape(document.title) : ''
    }, uniqueHour:function () {
        if (!this.getCookie('_iclick_cookie')) {
            return 0
        }
        return this.getCookie('_iclick_unique_hour') ? 0 : 1
    }, uniqueDay:function () {
        if (!this.getCookie('_iclick_cookie')) {
            return 0
        }
        return this.getCookie('_iclick_unique_day') ? 0 : 1
    }, uniqueMonth:function () {
        if (!this.getCookie('_iclick_cookie')) {
            return 0
        }
        return this.getCookie('_iclick_unique_month') ? 0 : 1
    }, uniqueYear:function () {
        if (!this.getCookie('_iclick_cookie')) {
            return 0
        }
        return this.getCookie('_iclick_unique_year') ? 0 : 1
    }, unique:function () {
        if (!this.getCookie('_iclick_cookie')) {
            return 0
        }
        return this.getCookie('_iclick_unique') ? 0 : 1
    }, screenWidth:function () {
        try {
            return screen.width
        } catch (e) {
            return 0
        }
    }, screenHeight:function () {
        try {
            return screen.height
        } catch (e) {
            return 0
        }
    }, browserDimensions:function () {
        var a = 0, b = 0;
        try {
            if (typeof(window.innerWidth) == 'number') {
                a = window.innerWidth;
                b = window.innerHeight
            } else if (document.documentElement && document.documentElement.clientWidth) {
                a = document.documentElement.clientWidth;
                b = document.documentElement.clientHeight
            } else if (document.body && document.body.clientWidth) {
                a = document.body.clientWidth;
                b = document.body.clientHeight
            }
        } catch (e) {
        }
        return{width:a, height:b}
    }, browserWidth:function () {
        return this.browserDimensions().width
    }, browserHeight:function () {
        return this.browserDimensions().height
    }, $:function (a) {
        if (document.getElementById) {
            return document.getElementById(a);
        }
        return null
    }, setCookie:function (a, b, d) {
        var f, c;
        b = escape(b);
        if (d) {
            f = new Date();
            f.setTime(f.getTime() + (d * 1000));
            c = '; expires=' + f.toGMTString()
        } else {
            c = ''
        }
        document.cookie = a + "=" + b + c + "; path=/"
    }, getCookie:function (a) {
        var b = a + "=", d = document.cookie.split(';');
        for (var f = 0; f < d.length; f++) {
            var c = d[f];
            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length)
            }
            if (c.indexOf(b) == 0) {
                return unescape(c.substring(b.length, c.length))
            }
        }
        return null
    }, callback:function(data){
        document.getElementById(_iclick.elementId).innerHTML = data.result;
    }};
//    _iclick.track();
//    for (var g = 0, j = h.length; g < j; g++) {
//        _iclick.push(h[g])
//    }
})();