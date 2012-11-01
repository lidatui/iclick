var IpAddressSchema = new Schema({
    ip: {type: String, trim: true},
    country: {type: String, default: '', trim: true},
    province: {type: String, default: '', trim: true},
    city: {type: String, default: '', trim: true},
    isp: {type: String, default: '', trim: true},
    desc: {type: String, default: '', trim: true}
});
mongoose.model('IpAddress', IpAddressSchema);