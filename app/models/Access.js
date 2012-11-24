
var AccessSchema = new Schema({
    ip: {type: String, trim: true},
    ipInfo: {type: Schema.Types.Mixed},
    pageInfo: {type: Schema.Types.Mixed},
    agent: {type: Schema.Types.Mixed},
    accessControl: {type: Schema.Types.Mixed}
});
mongoose.model('Access', AccessSchema);