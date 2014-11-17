var passport = require('passport'),
    login = require('connect-ensure-login'),
    db = require('./db'),
    register = require('./register');

exports.index = function(req, res){
    res.render('homepage');
}

exports.loginForm = function(req, res){
    res.render('login');
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
