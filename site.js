var passport = require('passport'),
    login = require('connect-ensure-login'),
    db = require('./db');

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
    function(req, res){
        res.render('account', { user: req.user });
    }
]

exports.appdetails = [
    login.ensureLoggedIn(),
    function(req, res){
        db.clients.findByUserId(req.user.userId, function(err, apps){
            res.render('appdetails', { apps: apps });
        });       
    }
]

exports.userappdetails = [
    login.ensureLoggedIn(),
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
    function(req, res){
        var userId = req.user.userId;
        var clientId = req.params.clientId;
        db.appUserData.getData(clientId, userId, '/', function(err, bool, obj){
            console.log(obj);
            res.json(obj);
        });
    }
]
