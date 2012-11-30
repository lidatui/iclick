
var GisDayCountSchema = new Schema({
    dataTime: {type: Date},
    site: {type: Schema.ObjectId, ref: 'Site'},
    country: {type: String, default: '', trim: true},
    province: {type: String, default: '', trim: true},
    city: {type: String, default: '', trim: true},
    count: {type: Number, default: 0}
});
mongoose.model('GisDayCount', GisDayCountSchema);