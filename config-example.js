var config = {}

config.mongo = {};
config.session = {};
config.app = {};
config.mandrill = {};
config.sso = {};

config.mongo.host = 'localhost/';
config.mongo.db = 'db';
config.mongo.username = 'username';
config.mongo.password = 'password';

config.session.secret = 'top-secret-classified';

config.app.host = 'http://localhost:3000';

config.mandrill.apikey = 'mandrill-api-key';

config.sso.key = 'sso-key';

module.exports = config;
