var db = require('./db'),
    utils = require('./utils'),
    login = require('connect-ensure-login'),
    config = require('./config'),
    mandrill = require('mandrill-api'),
    validator = require('validator');

exports.registerFormUser = function(req, res){
    res.render('userRegistration');
}

exports.registerUser = function(req, res){
    
    //TODO Validate username and password

    var username = validator.escape(req.body.username);
    var password = validator.escape(req.body.password);
    var name = validator.escape(req.body.name);
    var email = validator.escape(req.body.email);
    var userId = utils.uid(12);
    var activationId = utils.uid(20);
    
    db.users.findByUsername(username, function(err, user){
        if(user){
            res.render('userRegistration',
                {msg: 'Sorry! That username is already taken'}
            );       
        } else {
            db.users.findByEmail(email, function(err, user){
                if(user && user.activated){
                    res.render('userRegistration',
                        {msg:'This email already has an account'}
                    );
                } else {
                    if(username.length < 6 || !validator.isAlphanumeric(username)){
                        return res.render('userRegistration',
                            {msg: 'Username must be at least 6 characters and alphanumeric'}
                        );
                    }
                    if(password.length < 8){
                        return res.render('userRegistration',
                            {msg: 'Password must be at least 8 characters'}
                        );
                    }
                    if(!validateNusEmail(email) || !validator.isEmail(email)){
                        return res.render('userRegistration',
                            {msg: 'Please enter a valid NUS Email address'}
                        );
                    }
                    sendActivationEmail(name, activationId, email);
                    db.users.save(username, password, name, email, userId, activationId, 
                        function(err, user){
                            if (err) { throw err; }
                                req.logIn(user, function(err) {
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
        var name = validator.escape(req.body.name);
        var namespace = validator.escape(req.body.namespace);
        var domain = validator.escape(req.body.domain);
        var clientId = utils.uid(12);
        var clientSecret = utils.uid(20);
        db.clients.findByClientNamespace(namespace, function(err, client){
            if(client){
                return res.send("App namespace is already taken", 422);
            } else {
                if(name.length < 5){
                    return res.send("App name must be at least 5 alphanumeric chars", 422);
                }
                if(namespace.length < 5 || !validator.isAlphanumeric(namespace)){
                    return res.send("App namespace must be at least 5 alphanumeric chars", 422);
                }
                if(!validator.isURL(domain)){
                    return res.send("Please enter a valid URL as the domain (include the http://)", 422);
                }
                db.clients.save(name, clientId, clientSecret, domain, namespace, req.user.userId, 
                    function(err, client){
                        return res.redirect('/account/dev');
                    }
                );
            }
        });
    }
]
