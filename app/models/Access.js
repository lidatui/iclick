
var AccessSchema = new Schema({
    ip: {type: Schema.ObjectId, ref: 'IpAddress'},
    url: {type: String, trim: true},
    os: {type: String, default: '', trim: true},
    browser: {type: String, default: '', trim: true},
    sessionId: {type: String, default: '', trim: true}
});
mongoose.model('Access', AccessSchema);