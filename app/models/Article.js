
var ArticleSchema = new Schema({
    pubDate: {type: Date, default: Date.now },
    title: {type: String, default: '', trim: true},
    targetUrl: {type: String, default: '', trim: true},
    highlight: {type: Boolean, default: false}
});
mongoose.model('Article', ArticleSchema);