
var SiteDayCountSchema = new Schema({
    acId: {type: Schema.ObjectId, ref: 'AccessControl'},
    time: {type: String, default: '', trim: true},
    count: {type: Number, default: 0}
});
mongoose.model('SiteDayCount', SiteDayCountSchema);