
//http://api.map.baidu.com/geocoder?address=济南&output=json
//var location = 'http://maps.google.com/maps/geo?q=济南';
//{
//    "status":"OK",
//    "result":{
//        "location":{
//            "lng":117.024967,
//                "lat":36.682785
//        },
//        "precise":0,
//        "confidence":12,
//        "level":"\u57ce\u5e02"
//    }
//}
var GisInfoSchema = new Schema({
    name: {type: String, trim: true},
    lng: {type: Number},
    lat: {type: Number},
    level: {type: String, trim: true}
});
mongoose.model('GisInfo', GisInfoSchema);