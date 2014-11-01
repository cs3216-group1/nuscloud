var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect('mongodb://' + config.mongo.host + config.mongo.db,
    {user: config.mongo.username, pass: config.mongo.password});

exports.users = require('./users');
exports.clients = require('./clients');
exports.accessTokens = require('./accesstokens');
exports.authorizationCodes = require('./authorizationcodes');
exports.permissions = require('./permissions');
exports.appUserData = require('./appuserdata');
