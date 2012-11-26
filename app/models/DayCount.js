
var DayCountSchema = new Schema({
    acId: {type: Schema.ObjectId, ref: 'AccessControl'},
    day: {type: String, default: '', trim: true},
    count: {type: Number, default: 0}
});
mongoose.model('DayCount', DayCountSchema);