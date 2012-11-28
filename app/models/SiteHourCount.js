
var SiteHourCountSchema = new Schema({
    dataTime: {type: Date},
    site: {type: Schema.ObjectId, ref: 'Site'},
    count: {type: Number, default: 0}
});
mongoose.model('SiteHourCount', SiteHourCountSchema);