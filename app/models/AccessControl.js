
var AccessControlSchema = new Schema({
    expr: {type: String, default: '', trim: true},
    name: {type: String, default: '', trim: true},
    desc: {type: String, default: '', trim: true},
    template: {type: Schema.ObjectId, ref: 'Template'}
});
mongoose.model('AccessControl', AccessControlSchema);