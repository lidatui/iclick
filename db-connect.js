
var mongourl = require('./db-config');

exports = mongoose = require('mongoose')
//mongoose.set('debug', true)
mongoose.connect(mongourl)
exports = Schema = mongoose.Schema