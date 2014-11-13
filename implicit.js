var passport = require('passport'),
    login = require('connect-ensure-login'),
    querystring = require('querystring'),
    db = require('./db');

exports.loginForm = function(req, res){
    if(req.isAuthenticated()){
        res.redirect('/account');
    } else {
        res.render('loginImplicit', {
            clientId: req.query.client_id,
            redirectUri: req.query.redirect_uri,
            scope: req.query.scope
        });
    }
}

exports.login = function(req, res, next){
    passport.authenticate('local', function(err, user, info){
        //console.log(user);
        if (err) { throw err;}
        var urlParams = querystring.stringify({
            client_id: req.body.client_id,
            redirect_uri: req.body.redirect_uri,
            scope: req.body.scope
        });
        if (!user){
            res.redirect('/loginImplicit?' + urlParams);
        } else {
            req.logIn(user, function(err) {
                if (err) { throw err;}
                return res.redirect('/dialog/authorize?response_type=token&' + urlParams);
            });
        }
    })(req, res, next);
}

exports.autologin = function(req, res, next){
    var urlParams = querystring.stringify({
        client_id: req.query.client_id,
        redirect_uri: req.query.redirect_uri,
        scope: req.query.scope
    });
    if(req.isAuthenticated()){ 
        res.redirect('/dialog/authorize?response_type=token&' + urlParams);
    } else {
        passport.authenticate('local', function(err, user, info){
            if (err) { throw err;}
            if (!user) {
                return res.redirect('/loginImplicit?' + urlParams);
            }
            req.logIn(user, function(err) {
                if (err) { throw err;}
                return res.redirect('/dialog/authorize?response_type=token&'
                     + urlParams);
            });
        })(req, res, next);
    }
}

exports.logout = function(req, res, next){
    passport.authenticate('bearer', {session: false},
        function(err, user, info){
            if (err) { return res.status(404).json({status: 'error'}); }
            if (!user) { return res.status(400).json({status: 'error'}); }
            else {
                db.accessTokens.remove(user.userId, info.clientId,
                    function(err, num){
                        if(err) { console.log(err); }
                        req.logout();
                        res.status(204).send();
                    }
                );
            }
        }
    )(req, res, next);
}
