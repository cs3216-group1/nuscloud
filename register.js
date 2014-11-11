var db = require('./db'),
    utils = require('./utils'),
    login = require('connect-ensure-login'),
    config = require('./config'),
    mandrill = require('mandrill-api');

exports.registerFormUser = function(req, res){
    res.render('userRegistration');
}

exports.registerUser = function(req, res){
    
    //TODO Validate username and password

    var username = req.body.username;
    var password = req.body.password;
    var name = req.body.name;
    var email = req.body.email;
    var userId = utils.uid(12);
    var activationId = utils.uid(20);
    
    db.users.findByUsername(username, function(err, user){
        if(user){
            res.send("Username is already taken", 422);       
        } else {
            db.users.findByEmail(email, function(err, user){
                if(user && user.activated){
                    res.send("This email already has an account", 422);
                } else {
                    if(username.length < 6){
                        return res.send("Username must be at least 6 characters", 422);
                    }
                    if(password.length < 8){
                        return res.send("Password must be at least 8 characters", 422);
                    }
                    if(!validateNusEmail(email)){
                        return res.send("Please enter a valid NUS Email address", 422);
                    }
                    sendActivationEmail(name, activationId, email);
                    db.users.save(username, password, name, email, userId, activationId, 
                        function(err, user){
                            console.log("Step One");
                            if (err) { throw err; }
                                req.logIn(user, function(err) {
                                    console.log("Step Two");
                                    if (err) { throw err; }
                                    return res.redirect('/account');
                                });
                        }
                    );
                }
            });
        }
    });
}

exports.activateUser = function(req, res){
    var activationId = req.query.id;
    db.users.activateUser(activationId, function(err, user){
        if (err) { throw err; }
        if(!user) { return res.send("That is not a valid activation link - Sorry", 422); }
        console.log(user);
        res.redirect('/login');
    });    
}

exports.generateActivationId = [
    login.ensureLoggedIn(),
    function(req, res){
        var activationId = utils.uid(20);
        db.users.createActivationLink(req.user.userId, activationId, function(err, user){
            if(err) { throw err; }
            sendActivationEmail(req.user.name, activationId, req.user.email);
            console.log('/activate?id=' + activationId);
            res.render('loggedInMessage', {
                title: 'Activation Link Sent',
                msg: 'A link to activate your account has been sent to your'
                        + ' registered email ' + req.user.email
                        + '. Please note that it will expire  in 24 hours.'
                });
        });
    }
]

//Only use after ensuring login
exports.isActivated = function(req, res, next){
    if(req.user.activated){
        next();
    } else {
        res.render('loggedInMessage', {
            title: 'NUSCloud Account Not Activated',
            msg: 'Please activate your account to use NUSCloud.'
                    + 'Click <a href="/resend-activation-link">here</a>'
                    + ' to resend an activation link to your email.'
            });    
    }
}

exports.registerFormClient = [
    login.ensureLoggedIn(),
    exports.isActivated,
    function(req, res){
        res.render('clientRegistration');
    }
]

var validateNusEmail = function(email){
    var host_loc = email.indexOf("@");
    if(host_loc === -1){
        return false;
    } else {
        return (email.slice(host_loc).indexOf("nus.edu") !== -1);
        //Not Perfect, but sufficient given use of confirm email
    }
}

var sendActivationEmail = function(name, activationId, email){
    var link = config.app.host + '/activate?id=' + activationId;
    mandrill_client = new mandrill.Mandrill(config.mandrill.apikey);
    var message = {
        'html': '<p>Dear ' + name + ',<br>thanks for signing up to NUSCloud! ' +
                    'Click <a href="' + link + '">' + link + '</a> or ' +
                    'paste it into your browser bar to activate your account',
        'subject': 'NUSCloud Account Activation',
        'from_email': 'no-reply@nuscloud.com',
        'from_name': 'NUSCloud',
        'to': [{'email': email, 'name': name, 'type': 'to'}]
    }
    mandrill_client.messages.send({"message": message}, function(res){
        console.log(res);
    }, function(err){
        console.log(err);
    });
}

exports.registerClient = [
    login.ensureLoggedIn(),
    exports.isActivated,
    function(req, res) {
        //TODO Validate name
        var name = req.body.name;
        var namespace = req.body.namespace;
        var domain = req.body.domain;
        var clientId = utils.uid(12);
        var clientSecret = utils.uid(20);
        db.clients.findByClientNamespace(namespace, function(err, client){
            if(client){
                res.send("App namespace is already taken", 422);
            } else {
                db.clients.save(name, clientId, clientSecret, domain, namespace, req.user.userId, 
                    function(err, client){
                        return res.redirect('/account/dev');
                    }
                );
            }
        });
    }
]
