var config = {}

config.mongo = {};
config.session = {};

config.mongo.host = 'localhost/';
config.mongo.db = 'db';
config.mongo.username = 'username';
config.mongo.password = 'password';

config.session.secret = 'top-secret-classified';

module.exports = config;
