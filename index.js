/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    passport = require('passport'),
    site = require('./site'),
    oauth2 = require('./oauth2'),
    user = require('./user'),
    client = require('./client'),
    util = require('util'),
    implicit = require('./implicit'),
    register = require('./register'),
    api = require('./api'),
    cors = require('cors'),
    friends = require('./friends'),
    serveStatic = require('serve-static'),
    favicon = require('serve-favicon'),
    config = require('./config'),
    ivle = require('./ivle');

// Express configuration

var app = express();
app.set('view engine', 'ejs');
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({ 
    secret: config.session.secret, 
    resave: true,
    saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

app.use('/styles', serveStatic(__dirname + '/assets/styles'));
app.use('/img', serveStatic(__dirname + '/assets/img'));
app.use('/js', serveStatic(__dirname + '/assets/js'));
app.use('/sdk', serveStatic(__dirname + '/sdk'));

app.use(favicon(__dirname + '/assets/img/blueC.ico'));

// Passport configuration

require('./auth');

//CORS

var corsOptions = {
    origin: "*",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}

app.options("*", cors());

app.get('/', site.index);
app.get('/login', site.loginForm);
app.post('/login', site.login);
app.get('/logout', site.logout);
app.get('/account', site.account);
app.get('/account/dev', site.appdetails);
app.get('/account/apps', site.userappdetails);
app.get('/account/apps/:clientId', site.userappdata);

app.get('/friends', friends.viewFriends);
app.get('/friends/add', friends.viewAddFriends);
app.get('/friends/search', friends.getNotFriends);
app.get('/friends/pending', friends.getReceivedRequests);
app.get('/friends/list', friends.getFriends);
app.post('/friends/request', friends.sendRequest);
app.post('/friends/confirm', friends.confirmRequest);

app.get('/ivleform', ivle.ivleform);
app.get('/ivlelogin', ivle.ivlelogin);
app.get('/ivletoken', ivle.handleIvleResponse);

app.get('/api/ivle/*', cors(corsOptions), ivle.ivleGet);

app.get('/activate', register.activateUser);
app.get('/resend-activation-link', register.generateActivationId);

app.get('/registration', register.registerFormUser);
app.post('/registration', register.registerUser);

app.get('/client/registration', register.registerFormClient);
app.post('/client/registration', register.registerClient);

app.get('/authImplicit', implicit.autologin);
app.get('/loginImplicit', implicit.loginForm);
app.post('/loginImplicit', implicit.login);
app.get('/logoutImplicit', cors(corsOptions), implicit.logout);
app.get('/api/getloginstatus', cors(corsOptions), api.getLoginStatus);

app.get('/loginEncrypted', site.encryptedLogin);
app.post('/loginEncrypted', site.processEncryptedLogin);

app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token', oauth2.token);

app.get('/api/:userId/userinfo', cors(corsOptions), api.getUserInfo);
app.get('/api/:appId/appinfo', cors(corsOptions), api.getAppInfo);
//app.post('/api/:userId/info', cors(corsOptions), api.editUserInfo);

app.get('/api/:userId/friends', cors(corsOptions), friends.apiGetFriends);

app.get('/api/:userId/:appId/*', cors(corsOptions), api.getUserAppInfo);
app.post('/api/:userId/:appId/*', cors(corsOptions), api.editUserAppInfo);
app.delete('/api/:userId/:appId/*', cors(corsOptions), api.deleteUserAppInfo);

http.createServer(app).listen(3000);
