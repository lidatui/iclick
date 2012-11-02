var IpInfoSchema = new Schema({
    start: {type: String, trim: true},
    end: {type: String, trim: true},
    startNum: {type: Number},
    endNum: {type: Number},
    country: {type: String, default: '', trim: true},
    province: {type: String, default: '', trim: true},
    city: {type: String, default: '', trim: true},
    district: {type: String, default: '', trim: true},
    isp: {type: String, default: '', trim: true},
    desc: {type: String, default: '', trim: true}
});
mongoose.model('IpInfo', IpInfoSchema);