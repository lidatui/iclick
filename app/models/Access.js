
var AccessSchema = new Schema({
    ip: {type: String, trim: true},
    ipInfo: {type: Schema.Types.Mixed},
    host: {type: String, default: '', trim: true},
    pageInfo: {type: Schema.Types.Mixed},
    os: {type: String, default: '', trim: true},
    browser: {type: String, default: '', trim: true},
    accessControl: {type: Schema.Types.Mixed}
});
mongoose.model('Access', AccessSchema);