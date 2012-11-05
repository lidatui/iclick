
var UserSchema = new Schema({
    loginName: {type: String, trim: true},
    loginPwd: {type: String, trim: true},
    locked: {type: Boolean, default: false},
    role: {
        article: { type: Boolean, default: false},
        accessControl: { type: Boolean, default: false},
        template: { type: Boolean, default: false},
        statistics: { type: Boolean, default: false},
        user: { type: Boolean, default: false}
    }
});
mongoose.model('User', UserSchema);