var mongourl = require('./db-config');

var mongoStore = require('connect-mongodb');
module.exports = new mongoStore({url: mongourl});