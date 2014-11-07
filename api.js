var passport = require('passport'),
    db = require('./db');

exports.getUserInfo = function(req, res, next){
    passport.authenticate('bearer', {session: false},
        function(err, user, info){
            if(err) { return res.status(404).json({status: 'error'}); }
            if (!user) { return res.status(400).json({status: 'error'}); }
            else if (info.scope.indexOf('info-read') === -1){
                return res.status(401).json({status: 'unauthorized'});
            } else {
                return res.json({status: 'ok', info: user.info});
            }
        }
    )(req, res, next);
}


exports.editUserInfo = function(req, res, next){
    passport.authenticate('bearer', {session: false},
        function(err, user, info){
            if(err) { return res.status(404).json({status: 'error'}); }
            if (!user) { return res.status(400).json({status: 'error'}); }
            else if (info.scope.indexOf('info-write') === -1){
                return res.status(401).json({status: 'unauthorized'});
            } else {
                var data = JSON.parse(req.body);
                db.users.updateInfoById(user.userId, data, function(err, user){
                    if(!user) {
                        res.status(400).json({status: 'error'});
                    } else {
                        res.status(200).json({status: 'ok', info: user.info});
                    }
                });
            }
        }
    )(req, res, next);
}

exports.getUserAppInfo = function(req, res, next){
    passport.authenticate('bearer', {session: false}, function(err, user, info){
        if (err) { return res.status(404).json({status: 'error'}); }
        if (!user) { return res.status(401).json({status: 'bad token'}); }
        db.clients.findByClientId(info.clientId, function(err, client){
            if (err) { return res.status(404).json({status: 'error'}); }
            if (!client) { return res.status(401).json({status: 'bad token'}); }
            if (info.scope.indexOf(client.name + '-read') === -1){
                return res.status(401).json({status: 'unauthorized'});
            } else {
                var path = req.params[0];
                var userId = user.userId;
                var clientId = client.clientId;
                db.appUserData.getData(clientId, userId, path,
                    function(err, absent, data){
                        if (err) {
                            console.log('Error');
                            return res.status(404).json({status: 'error'}); 
                        }
                        if (absent) {
                            console.log('Absent');
                            return res.status(204).json({
                                status: 'ok', 
                                data: {} 
                            });
                        } else {
                            console.log('Found');
                            return res.status(200).json({
                                status: 'ok', 
                                data: data 
                            });
                        }
                    }
                );
            }
        });
    })(req, res, next);
}

exports.editUserAppInfo = function(req, res, next){
    passport.authenticate('bearer',  {session: false}, function(err, user, info){
        if (err) { return res.status(404).json({status: 'error'}); }
        if (!user) { return res.status(401).json({status: 'bad token'}); } 
        db.clients.findByClientId(info.clientId, function(err, client){
            if (err) { return res.status(404).json({status: 'error'}); }
            if (!client) { return res.status(401).json({status: 'bad token'}); }
            if (info.scope.indexOf(client.name + '-write') === -1){
                return res.status(401).json({status: 'unauthorized'});
            } else {
                var path = req.params[0];
                var userId = user.userId;
                var clientId = client.clientId;
                var data = JSON.parse(req.body.data);
                db.appUserData.putData(clientId, userId, path, data, 
                    function(err, absent, success){
                        if (err) { 
                            return res.status(404).json({status: 'error'}); 
                        } else if (absent) { 
                            return res.status(204).json({status: 'absent'}); 
                        } else if (success) {
                            return res.status(200).json({status: 'ok'});
                        } else {
                            return res.status(204).json({status: 'huh'});
                        }
                    }
                );
            }
        });
    })(req, res, next);
}

exports.deleteUserAppInfo = function(req, res, next){
    passport.authenticate('bearer', {session: false}, function(err, user, scope){
        if (err) { return res.status(404).json({status: 'error'}); }
        if (!user) { return res.status(401).json({status: 'bad token'}); }
        db.clients.findByClientId(info.clientId, function(err, client){
            if (err) { return res.status(404).json({status: 'error'}); }
            if (!client) { return res.status(401).json({status: 'bad token'}); }
            if (info.scope.indexOf(client.name + '-write') === -1){
                return res.status(401).json({status: 'unauthorized'});
            } else {
                var path = req.params[0];
                var userId = user.userId;
                var clientId = client.clientId;
                db.appUserData.deleteData(clientId, userId, path,
                    function(err){
                        if(err){
                            return res.status(404).json({status: 'error'});
                        } else {
                            return res.status(200).json({status: 'ok'});
                        }
                    }
                );
            }
        });
    })(req, res, next);
}
