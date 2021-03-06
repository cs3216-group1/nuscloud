/**
 * Module dependencies.
 */
var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    login = require('connect-ensure-login'),
    register = require('./register'),
    db = require('./db'),
    utils = require('./utils'),
    url = require('url');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient(function(client, done) {
  return done(null, client.clientId);
});

server.deserializeClient(function(id, done) {
  db.clients.findByClientId(id, function(err, client) {
    if (err) { return done(err); }
    return done(null, client);
  });
});

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes.  The callback takes the `client` requesting
// authorization, the `redirectURI` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
  var code = utils.uid(16);
  db.authorizationCodes.save(code, client.clientId, redirectURI, user.userId, function(err) {
    if (err) { return done(err); }
    done(null, code);
  });
}));

// Grant implicit authorization.  The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a token, which is bound to these
// values.

server.grant(oauth2orize.grant.token(function(client, user, ares, done) {
    var token = utils.uid(256);
    var scopeArray = JSON.parse(ares.scope);
    if(!(scopeArray instanceof Array)){
        scopeArray = [];
    }
    if(scopeArray.indexOf(client.namespace + "-read")===-1){
        scopeArray.push(client.namespace + "-read");
    }
    if(scopeArray.indexOf(client.namespace + "-write")===-1){
        scopeArray.push(client.namespace + "-write");
    }
    db.accessTokens.save(token, user.userId, client.clientId, scopeArray, function(err) {
        if (err) { return done(err); }
        done(null, token);
    });
    db.appUserData.exists(client.clientId, user.userId, function(err, exists){
        if (err) { return done(err); }
        if(!exists){
            db.appUserData.create(client.clientId, user.userId, function(err, doc){
                if (err) { return done(err); }
            });
        }
    });
}));


// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectURI` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  db.authorizationCodes.find(code, function(err, authCode) {
    if (err) { return done(err); }
    if (client.clientId !== authCode.clientID) { return done(null, false); }
    if (redirectURI !== authCode.redirectURI) { return done(null, false); }
    
    var token = utils.uid(256)
    db.accessTokens.save(token, authCode.userID, [], function(err) {
        if (err) { return done(err); }
        done(null, token);
    });
  });
}));

// Exchange user id and password for access tokens.  The callback accepts the
// `client`, which is exchanging the user's name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.

server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {

    //Validate the client
    db.clients.findByClientId(client.clientId, function(err, localClient) {
        if (err) { return done(err); }
        if(localClient === null) {
            return done(null, false);
        }
        if(localClient.clientSecret !== client.clientSecret) {
            return done(null, false);
        }
        //Validate the user
        db.users.findByUsername(username, function(err, user) {
            if (err) { return done(err); }
            if(user === null) {
                return done(null, false);
            }
            if(password !== user.password) {
                return done(null, false);
            }
            //Everything validated, return the token
            var token = utils.uid(256);
            db.accessTokens.save(token, user.userId, client.clientId, [], function(err) {
                if (err) { return done(err); }
                done(null, token);
            });
        });
    });
}));

// Exchange the client id and password/secret for an access token.  The callback accepts the
// `client`, which is exchanging the client's id and password/secret from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the client who authorized the code.

server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {

    //Validate the client
    db.clients.findByClientId(client.clientId, function(err, localClient) {
        if (err) { return done(err); }
        if(localClient === null) {
            return done(null, false);
        }
        if(localClient.clientSecret !== client.clientSecret) {
            return done(null, false);
        }
        var token = utils.uid(256);
        //Pass in a null for user id since there is no user with this grant type
        db.accessTokens.save(token, null, client.clientId, [], function(err) {
            if (err) { return done(err); }
            done(null, token);
        });
    });
}));

// user authorization endpoint
//
// `authorization` middleware accepts a `validate` callback which is
// responsible for validating the client making the authorization request.  In
// doing so, is recommended that the `redirectURI` be checked against a
// registered value, although security requirements may vary accross
// implementations.  Once validated, the `done` callback must be invoked with
// a `client` instance, as well as the `redirectURI` to which the user will be
// redirected after an authorization decision is obtained.
//
// This middleware simply initializes a new authorization transaction.  It is
// the application's responsibility to authenticate the user and render a dialog
// to obtain their approval (displaying details about the client requesting
// authorization).  We accomplish that here by routing through `ensureLoggedIn()`
// first, and rendering the `dialog` view. 

exports.authorization = [
  login.ensureLoggedIn(),
  register.isActivated,
  server.authorization(function(clientID, redirectURI, done) {
    db.clients.findByClientId(clientID, function(err, client) {
      if (err) { return done(err); }
      if (!client) { return done("No such app"); }
      if (url.parse(redirectURI).host === url.parse(client.domain).host){
        return done(null, client, redirectURI);
      } else {
        return done("Wrong domain");
      }
    });
  }),
  function(req, res, next){
    var scope = req.oauth2.req.scope;
    var userId = req.user.userId;
    var clientId = req.oauth2.client.clientId;
    db.permissions.find(userId, clientId, function(err, perm){
        console.log(perm);
        if (!perm){
            db.permissions.save(userId, clientId, function(err, perm){
                if(err) { throw err;}
                var scopeInfo = req.oauth2.req.scope.map(generateDescription);
                return res.render('dialog', {
                    transactionID: req.oauth2.transactionID, 
                    user: req.user, 
                    client: req.oauth2.client,
                    scope: req.oauth2.req.scope,
                    scopeInfo: scopeInfo
                });
            });
        } else if (perm.permissions.length < scope.length){
            var scopeInfo = req.oauth2.req.scope.map(generateDescription);
            res.render('dialog', { 
                transactionID: req.oauth2.transactionID, 
                user: req.user, 
                client: req.oauth2.client,
                scope: req.oauth2.req.scope,
                scopeInfo: scopeInfo
            });
        } else {
            var allGranted = scope.every(function(requested){
                return perm.permissions.filter(function(present){
                    return requested == present;
                }).length >= 1;
            });
            if(allGranted){
                //If no cancel field - allow assumed to be true
                console.log('all done');
                req.body.transaction_id = req.oauth2.transactionID;
                req.body.allow = 'Allow';
                req.body.scope = JSON.stringify(req.oauth2.req.scope);
                next();                
            } else { 
                var scopeInfo = req.oauth2.req.scope.map(generateDescription);
                return res.render('dialog', {
                    transactionID: req.oauth2.transactionID, 
                    user: req.user, 
                    client: req.oauth2.client,
                    scope: req.oauth2.req.scope,
                    scopeInfo: scopeInfo
                });
            }
        }    
    });
  },
  server.decision(function(req, done){
      return done(null, {scope: req.body.scope});
  })    
]

function generateDescription(permission){
    if (permission === 'ivle-read'){
        return "This will allow the app to read your IVLE data";
    } else if (permission === 'info-read'){ 
        return "This will allow the app to read your basic information";
    } else if (permission === 'friends-read'){
        return "This will allow the app to read your friendlist";
    } else if (permission === 'ivle-write'){
        return "This will allow the app to write to your IVLE data";
    } else if (permission.indexOf('read')!==-1){
        var hyphen = permission.indexOf('-read');
        var namespace = permission.slice(0, hyphen);
        db.clients.findByClientNamespace(namespace, function(err, obj){
            if(err) { return "";}
            return "This will allow the app to read your " + obj.name + " data";
        });
    } else if (permission.indexOf('write')!==-1){
        var hyphen = permission.indexOf('-write');
        var namespace = permission.slice(0, hyphen);
        db.clients.findByClientNamespace(namespace, function(err, obj){
            if(err) { return "";}
            return "This will allow the app to write to your " + obj.name + " data";
        });
    } else {
        return "";
    }
}

// user decision endpoint
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application.  Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

exports.decision = [
  login.ensureLoggedIn(),
  register.isActivated,
  server.decision(function(req, done){
    var userId = req.user.userId;
    var clientId = req.oauth2.client.clientId;
    var scope = req.body.scope;
    if (!req.body.cancel){
        db.permissions.addArray(userId, clientId, JSON.parse(scope), function(err, doc){
            if (err) { done(err); }
                return done(null, { scope: req.body.scope, allow: true});
        });
    } else {
        return done(null, { allow: false }); //Will be handled by the library
    }
  })
]


// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler()
]
