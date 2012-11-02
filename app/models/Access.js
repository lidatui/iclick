
var AccessSchema = new Schema({
    ip: {type: String, trim: true},
    ipInfo: {type: Schema.ObjectId, ref: 'IpInfo'},
    url: {type: String, trim: true},
    os: {type: String, default: '', trim: true},
    browser: {type: String, default: '', trim: true},
    sessionId: {type: String, default: '', trim: true}
});
mongoose.model('Access', AccessSchema);