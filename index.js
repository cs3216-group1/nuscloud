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
    serveStatic = require('serve-static');
// Express configuration

var app = express();
app.set('view engine', 'ejs');
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

app.use('/styles', serveStatic(__dirname + '/assets/styles'));
app.use('/img', serveStatic(__dirname + '/assets/img'));
app.use('/sdk', serveStatic(__dirname + '/sdk'));

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
app.get('/logout', cors(corsOptions), site.logout);
app.get('/account', site.account);
app.get('/account/dev', site.appdetails);
app.get('/account/apps', site.userappdetails);

app.get('/registration', register.registerFormUser);
app.post('/registration', register.registerUser);
app.get('/client/registration', register.registerFormClient);
app.post('/client/registration', register.registerClient);

app.get('/authImplicit', implicit.autologin);
app.get('/loginImplicit', implicit.loginForm);
app.post('/loginImplicit', implicit.login);

app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token', oauth2.token);

app.get('/api/me/info', cors(corsOptions), api.getUserInfo);
app.post('/api/me/info', cors(corsOptions), api.editUserInfo);

app.get('/api/me/app/*', cors(corsOptions), api.getUserAppInfo);
app.post('/api/me/app/*', cors(corsOptions), api.editUserAppInfo);

app.get('/api/me/appinfo', cors(corsOptions), client.info);

app.get('/api/me/friends', cors(corsOptions), friends.dummyData);

http.createServer(app).listen(3000);
