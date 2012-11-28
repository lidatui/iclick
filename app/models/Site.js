
var SiteSchema = new Schema({
    siteName: {type : String, default : '', trim : true},
    host: {type : String, default : '', trim : true},
    companyName: {type : String, default : '', trim : true},
    contact: {type : String, default : '', trim : true},
    tel: {type : String, default : '', trim : true},
    email: {type : String, default : '', trim : true},
    template: {type: Schema.ObjectId, ref: 'Template'}
});
mongoose.model('Site', SiteSchema);