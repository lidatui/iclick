
var UserSchema = new Schema({
    name: {type: String, trim: true},
    loginName: {type: String, trim: true},
    loginPwd: {type: String, trim: true},
    lock: {type: Boolean, default: false}
});
mongoose.model('User', UserSchema);