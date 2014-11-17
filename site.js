var passport = require('passport'),
    login = require('connect-ensure-login'),
    db = require('./db'),
    register = require('./register'),
    crypto = require('crypto'),
    config = require('./config'),
    querystring = require('querystring');

exports.index = function(req, res){
    res.render('homepage');
}

exports.loginForm = function(req, res){
    if(req.isAuthenticated()){
        res.redirect('/account');
    } else {
        res.render('login');
    }
}

exports.login = passport.authenticate('local', {
    successReturnToOrRedirect: '/account',
    failureRedirect: '/login'
});

exports.logout = function(req, res){
    if(!req.user){
        return;
    }
    db.accessTokens.removeByUserId(req.user.userId, function(err, num){
        if(err) { console.log(err); }
        req.logout();
        res.redirect('/');
    });
}

exports.encryptedLogin = function(req, res){
    if(!req.query.sso){
        return res.render('loginEncrypted', {nonce: req.query.nonce});
    }
    var payload = req.query.sso;
    var sig = req.query.sig;
    var key = config.sso.key;
    var algorithm = 'sha256';
    var hash, hmac;
    hmac = crypto.createHmac(algorithm, key);
    hmac.setEncoding('hex');
    hmac.write(payload);
    hmac.end();
    hash = hmac.read();
    if(hash!==sig){
        res.end();
    } else {
        var toSend = {};
        var input = new Buffer(payload, 'base64').toString('ascii');
        var nonce = querystring.parse(input).nonce;
        if(req.isAuthenticated()){
            toSend.nonce = nonce;
            toSend.username = req.user.username;
            toSend.external_id = req.user.userId;
            toSend.name = req.user.name;
            toSend.email = req.user.email;
            var raw_output = querystring.stringify(toSend);
            var base64_output = new Buffer(raw_output, 'ascii').toString('base64');
            var output = encodeURIComponent(base64_output);
           
            hmac = crypto.createHmac(algorithm, key);
            hmac.setEncoding('hex');
            hmac.write(base64_output);
            hmac.end();
            hash = hmac.read(); 
            res.redirect('http://bellcurvehelp.me/session/sso_login?sso=' + output + '&sig=' + hash);
        } else {
            res.render('loginEncrypted', {nonce: nonce});
        }
    }
}

exports.processEncryptedLogin = function(req, res, next){
    passport.authenticate('local', function(err, user, info){
        if(err) { throw err; }
        if (!user){
            console.log(info);
            var args = querystring.stringify({nonce: req.body.nonce});
            res.redirect('/loginEncrypted?' + args);
        } else {
            req.logIn(user, function(err){
                if(err) { throw err; }
                var key = config.sso.key;
                var algorithm = 'sha256';
                var hash, hmac;
                var key = config.sso.key;
                var toSend = {};
                toSend.nonce = req.body.nonce;
                toSend.username = user.username;
                toSend.external_id = req.user.userId;
                toSend.name = req.user.name;
                toSend.email = req.user.email;
                var raw_output = querystring.stringify(toSend);
                var base64_output = new Buffer(raw_output, 'ascii').toString('base64');
                var output = encodeURIComponent(base64_output);
           
                hmac = crypto.createHmac(algorithm, key);
                hmac.setEncoding('hex');
                hmac.write(base64_output);
                hmac.end();
                hash = hmac.read(); 
                res.redirect('http://bellcurvehelp.me/session/sso_login?sso=' + output + '&sig=' + hash);
            });
        }
    })(req, res, next);
}

exports.account = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        res.render('account', { user: req.user });
    }
]

exports.appdetails = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        db.clients.findByUserId(req.user.userId, function(err, apps){
            res.render('appdetails', { apps: apps });
        });       
    }
]

exports.userappdetails = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        db.permissions.findByUserId(req.user.userId, function(err, perms){
            var render = function(){
                if (done === perms.length){
                    res.render('userappdetails', { perms: perms });
                }
            }
            var done = 0;
            perms.map(function(perm, index, array){
                db.clients.findByClientId(perm.clientId, function(err, client){
                    if(err){console.log(err);}
                    array[index].clientname = client.name;
                    array[index].namespace = client.namespace;
                    array[index].domain = client.domain;
                    done++;
                    render();
                })
            });
            render(); //For the zero case
            //TODO Clean up with Promises
        });
    }
]

exports.userappdata = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var userId = req.user.userId;
        var clientId = req.params.clientId;
        db.appUserData.getData(clientId, userId, '/', function(err, bool, obj){
            console.log(obj);
            res.json(obj);
        });
    }
]

exports.deleteAppAdmin = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var userId = req.user.userId;
        var clientId = req.params.clientId;
        var appRemoved = false;
        var dataRemoved = false;
        var permsRemoved = false;
        var render = function(){
            if(appRemoved && dataRemoved && permsRemoved){
                res.json({status: 'ok'});
            }
        }
        db.findByClientId(clientId, function(err, obj){
            if(obj.userId === userId){
                db.clients.remove(clientId, function(err, obj){
                    if(err) { throw err; }
                    appRemoved = true;
                    render();
                });
                db.permissions.removeByClientId(clientId, function(err, obj){
                    if(err) { throw err; }
                    permsRemoved = true;
                    render();
                });
                db.appUserData.removeByClientId(clientId, function(err, obj){
                    if(err) { throw err; }
                    dataRemoved = true;
                    render();
                });   
            } else {
                res.status(401).json({status: 'unauthorized'});
            }
        });
    }
]

exports.deleteAppUser = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var userId = req.user.userId;
        var clientId = req.params.clientId;
        var dataRemoved = false;
        var permsRemoved = false;
        var render = function(){
            if(dataRemoved && permsRemoved){
               res.json({status: 'ok'});
            }
        }
        db.appUserData.remove(userId, clientId, function(err){
            if(err) { res.status(404).json({status: 'error'}); }
            dataRemoved = true;
            render();
        });
        db.permissions.remove(clientId, userId, function(err){
            if(err) { res.status(404).json({status: 'error'}); }
            permsRemoved = true;
            render();
        });
    }
]

exports.editApp = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var userId = req.user.userId;
        var clientId = req.params.clientId;
        var namespace = validator.escape(req.body.namespace);
        var clientName = validator.escape(req.body.name);
        var ivleKey = null;
        if(req.body.ivleKey){
            var apiKey = validator.escape(req.body.ivleKey);
        }
        var domain = validator.escape(req.body.domain);
        db.findByClientId(clientId, function(err, obj){
            if(obj.userId === userId){
                if(name.length < 5){
                    return res.send("App name must be at least 5 alphanumeric chars", 422);
                }
                if(namespace.length < 5 || !validator.isAlphanumeric(namespace)){
                    return res.send("App namespace must be at least 5 alphanumeric chars", 422);
                }
                if(!validator.isURL(domain)){
                    return res.send("Please enter a valid URL as the domain (include the http://)", 422);
                }
                db.clients.edit(clientId, name, namespace, domain, ivleKey, 
                    function(err){
                        if(err) { return res.status(404).json({status: 'error'});}
                        else { return res.json({status: 'ok'}); }
                    }
                );
            } else {
                return res.status(401).json({status: 'unauthorized'});
            }
        });
    }
]
