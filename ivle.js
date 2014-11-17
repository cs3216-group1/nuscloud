var passport = require('passport'),
    config = require('./config'),
    db = require('./db'),
    login = require('connect-ensure-login'),
    register = require('./register'),
    request = require('request'),
    url = require('url');

exports.ivleform = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var userId = req.user.userId;
        var clientId = req.query.clientId;
        var redirectUri = req.query.redirectUri;
        db.permissions.find(userId, clientId, function(err, perm){
            if(err) { return res.redirect(redirectUri +'?status=error'); }
            if(!perm || perm.permissions.indexOf('ivle-read') === -1){
                return res.redirect(redirectUri +'?status=unauthorized');
            } else {
                db.appUserData.getIvleToken(clientId, userId, 
                    function(err, absent, token){
                        if(err) { return res.redirect(redirectUri + '?status=error'); }
                        if(token) { return res.redirect(redirectUri + '?status=done');}
                        if(absent) {
                            db.clients.getIvleKey(clientId, 
                                function(err, noKey, apiKey){ 
                                    if(err) { return res.redirect(redirectUri + '?status=error');}
                                    if(noKey) { return res.redirect(redirectUri + '?status=noapikey');}
                                    else {
                                        return res.render('ivleform', {
                                            clientId: req.query.clientId,
                                            redirectUri: encodeURIComponent(req.query.redirectUri),
                                            apiKey: apiKey
                                        });
                                    }
                                }
                            );
                        }
                    }
                );
            }
        });
    }
]

exports.ivlelogin = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var userId = req.user.userId;
        var clientId = req.query.clientId;
        var apiKey = req.query.apiKey;
        var redirectUri = req.query.redirectUri; 
        return ivleloginHelper(res, config.app.host + 
            '/ivletoken?app_id=' + clientId + 
                '&nc_redirect=' + encodeURIComponent(redirectUri), apiKey); 
    }
]

exports.handleIvleResponse = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var token = req.query.token;
        var clientId = req.query.app_id;
        var redirectUri = req.query.nc_redirect;
        var userId = req.user.userId;
        db.appUserData.putIvleToken(clientId, userId, token, function(err, obj){
            if(redirectUri){
                if(err) { return res.redirect(redirectUri + '?status=error'); }
                else { return res.redirect(redirectUri + '?status=ok'); }
            } else {
                db.clients.findByClientId(clientId, function(err, obj){
                    redirectUri = obj.domain;    
                    if(err) { return res.redirect(redirectUri + '?status=error'); }
                    else { return res.redirect(redirectUri + '?status=ok'); }
                });
            }
        }); 
    }
]

exports.ivleGet = function(req, res, next){
    passport.authenticate('bearer', {session: false}, function(err, user, info){
        if(err) { return res.status(404).json({status: 'error'}); }
        if(!user) { return res.status(400).json({status: 'error'}); }
        if (info.scope.indexOf('ivle-read') === -1){
            return res.status(401).json({status: 'unauthorized'});
        } else {
            db.appUserData.getIvleToken(info.clientId, user.userId, function(err, absent, token){
                if(err) { return res.status(404).json({status: 'error'}); }
                if(absent) { return res.status(401).json({status: 'no token'}); }
                if(token){
                    db.clients.getIvleKey(info.clientId, function(err, absent, key){
                        if(err) { return res.status(404).json({status: 'error'}); }
                        if(absent) { return res.status(401).json({status: 'no apikey'}); }
                        if(key){
                            var ivleQuery = req.params[0];
                            ivleQuery = 'https://ivle.nus.edu.sg/api/Lapi.svc/' + ivleQuery;
                            if(ivleQuery.charAt(ivleQuery.length-1) === '/'){
                                ivleQuery = ivleQuery.slice(0, ivleQuery.length - 1);
                            }
                            var queryObj = url.parse(ivleQuery, true);
                            queryObj.query.APIKey = key;
                            if(ivleQuery.indexOf('Validate')!==-1 
                                || ivleQuery.indexOf('UserName_Get')!==-1
                                || ivleQuery.indexOf('UserID_Get')!==-1
                                || ivleQuery.indexOf('UserEmail_Get')!==-1){
                                queryObj.query.Token = token; 
                            } else {
                                queryObj.query.AuthToken = token;
                            }
                            for(var key in req.query){
                                queryObj.query[key] = req.query[key];
                            }
                            var query = url.format(queryObj);
                            request(query, function(err, response, body){
                                if(err) { return res.status(404).json({status: 'error'}); }
                                var ivleResponse = null;
                                try {
                                    ivleResponse = JSON.parse(response.body);
                                } catch (e){
                                    return res.status(404).json({status: 'bad request'});
                                }
                                return res.json({
                                    status: 'ok', 
                                    ivleResponse: ivleResponse
                                });
                            });
                        }
                    });
                }
            });
        }
    })(req, res, next);      
}

var ivleloginHelper = function(res, callback_url, ivle_lapi_key){
    var ivle_login_url = 'https://ivle.nus.edu.sg/api/login/?';
    var ivle_api_arg = 'apikey=';
    var ivle_callback_url_arg = 'url=';
    var url = ivle_login_url + ivle_api_arg + ivle_lapi_key + 
        '&' + ivle_callback_url_arg + callback_url;
    res.redirect(url);
}
