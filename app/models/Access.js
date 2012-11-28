
var AccessSchema = new Schema({
    ip: {type: String, trim: true},
    ipInfo: {type: Schema.Types.Mixed},
    pageInfo: {type: Schema.Types.Mixed},
    agent: {type: Schema.Types.Mixed},
    site: {type: Schema.Types.Mixed},
    timestamp: {type: String, trim: true}
});
mongoose.model('Access', AccessSchema);