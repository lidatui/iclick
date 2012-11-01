
var TemplateSchema = new Schema({
    name: {type: String, default: '', trim: true},
    path: {type: String, default: '', trim: true}
});
mongoose.model('Template', TemplateSchema);