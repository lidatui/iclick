
var ArticleSchema = new Schema({
    pubDate: {type: Date, default: Date.now },
    title: {type: String, default: '', trim: true},
    url: {type: String, default: '', trim: true},
    highlight: {type: Boolean, default: false},
    qa: {type: Boolean, default: false}
});
mongoose.model('Article', ArticleSchema);