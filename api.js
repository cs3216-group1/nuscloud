var passport = require('passport'),
    db = require('./db');

exports.getUserInfo = function(req, res, next){
    passport.authenticate('bearer', {session: false},
        function(err, user, info){
            if(err) { return res.status(404).json({status: 'error'}); }
            if (!user) { return res.status(400).json({status: 'error'}); }
            if (req.params.userId === 'me'){
                if (info.scope.indexOf('info-read') === -1){
                    return res.status(401).json({status: 'unauthorized'});
                } else {
                    var toReturn = {
                        userId: user.userId,
                        username: user.username,
                        name: user.name,
                        email: user.email
                    };
                    return res.json({status: 'ok', info: toReturn});
                }
            } else {
                db.users.findAllByUserId(dataUserId, function(err, dbUser){
                    if(err) { return res.status(404).json({status: 'error'}); }
                    if(!dbUser) { return res.status(400).json({status: 'bad endpoint'}); }
                    if(dbUser.userId === user.userId){
                        if (info.scope.indexOf('info-read') === -1){
                            return res.status(401).json({status: 'unauthorized'});
                        } else {
                            var toReturn = {
                                userId: user.userId,
                                username: user.username,
                                name: user.name,
                                email: user.email
                            };
                            return res.json({status: 'ok', info: toReturn});
                        }
                    } else {
                        if(info.scope.indexOf('friends-read') === -1){
                            return res.status(401).json({status: 'unauthorized'});
                        } else if (dbUser.friendsList.indexOf(user.userId) !== -1){
                            db.permissions.find(dbUser.userId, info.clientId, 
                                function(err, perm){
                                    if(err) { 
                                        return res.status(404)
                                            .json({status: 'error'});
                                    }
                                    if(!perm) { 
                                        return res.status(401)
                                            .json({status: 'unauthorized'});
                                    } 
                                    if(perm.indexOf('info-read') === -1 ||
                                        perm.indexOf('friends-read') === -1){ 
                                        return res.status(401)
                                            .json({status: 'unauthorized'});
                                    } else {
                                        var toReturn = {
                                            userId: dbUser.userId,
                                            username: dbUser.username,
                                            name: dbUser.name,
                                            email: dbUser.email
                                        };
                                        return res.json({status: 'ok', 
                                            info: toReturn});
                                    }
                                }
                            );
                        } else {
                            return res.status(401).json({status: 'unauthorized'}); 
                        }
                    }
                });
            }
        }
    )(req, res, next);
}

exports.getAppInfo = function(req, res, next){
    passport.authenticate('bearer', {session: false},
        function(err, user, info){
            if(err) { return res.status(404).json({status: 'error'}); }
            if (!user) { return res.status(400).json({status: 'error'}); }
            if(req.params.appId === 'app'){
                db.clients.findByClientId(info.clientId, function(err, client){
                    if (err) { return res.status(404).json({status: 'error'}); }
                    if (!client) { return res.status(401).json({status: 'bad token'}); }
                    return res.json( {status: 'ok', info: {
                        name: client.name, namespace: client.namespace
                    }});
                });
            } else {
                db.clients.findByClientNamespace(req.params.appId, function(err, client){
                    if (err) { return res.status(404).json({status: 'error'}); }
                    if (!client) { return res.status(401).json({status: 'bad endpoint'}); }
                    return res.json({status: 'ok', info: {
                        name: client.name, namespace: client.namespace
                    }});
                });
            }
        }
    )(req, res, next);
}
/*
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
}*/

exports.getUserAppInfo = function(req, res, next){
    passport.authenticate('bearer', {session: false}, function(err, user, info){
        if (err) { return res.status(404).json({status: 'error'}); }
        if (!user) { return res.status(401).json({status: 'bad token'}); }
        db.clients.findByClientId(info.clientId, function(err, client){
            if (err) { return res.status(404).json({status: 'error'}); }
            if (!client) { return res.status(401).json({status: 'bad token'}); }
            var dataAppNamespace = req.params.appId;
            var dataUserId = req.params.userId;
            var permsRequired = [];
            var dataUser, dataApp;
            var returnOutput = function(){
                if(dataUser && dataApp){
                    var path = req.params[0];
                    var userId = dataUser.userId;
                    var clientId = dataApp.clientId;
                    db.appUserData.getData(clientId, userId, path,
                        function(err, absent, data){
                            if (err) {
                                console.log('Error');
                                return res.status(404).json({status: 'error'}); 
                            }
                            if (absent) {
                                console.log('Absent');
                                return res.status(200).json({status: 'absent'});
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
            }
            var checkPermissions = function(){
                if(dataUser && dataApp){
                    var allPerms = permsRequired.map(function(perm){
                            return (info.scope.indexOf(perm) !== -1);
                        }).reduce(function(prev, curr){
                            return prev && curr;
                        }, true);
                    if (!allPerms){
                        return res.status(401).json({status: 'unauthorized'});
                    } else {
                        returnOutput();
                    }
                }
            };
            if (dataUserId === 'me'){
                dataUser = user;
                checkPermissions();
            } else {
                db.users.findAllByUserId(dataUserId, function(err, dbUser){
                    if(err) { return res.status(404).json({status: 'error'}); }
                    if(!dbUser) { return res.status(400).json({status: 'bad endpoint'}); }
                    if (dbUser.userId === user.userId){
                        dataUser = user;
                    } else if (dbUser.friendsList.indexOf(user.userId) !== -1){
                        dataUser = dbUser;
                        permsRequired.push('friends-read');
                    } else {
                        return res.status(401).json({status: 'unauthorized'});
                    }
                    checkPermissions();
                });
            }
            if(dataAppNamespace === 'app'){
                dataApp = client;
                permsRequired.push(client.namespace + '-read');
                checkPermissions();
            } else {
                db.clients.findByClientNamespace(dataAppNamespace, function(err, dbApp){ 
                    if(err) { return res.status(404).json({status: 'error'}); }
                    if(!dbApp) { return res.status(400).json({status: 'bad endpoint'}); }
                    else {
                        dataApp = dbApp;
                        permsRequired.push(dbApp.namespace + '-read');
                    }
                    checkPermissions();
                });
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
            var dataAppNamespace = req.params.appId;
            var dataUserId = req.params.userId;
            var permsRequired = [];
            var dataUser, dataApp;
            var returnOutput = function(){
                if(dataUser && dataApp){
                    var path = req.params[0];
                    var userId = dataUser.userId;
                    var clientId = dataApp.clientId;
                    var data = JSON.parse(req.body.data);
                    db.appUserData.putData(clientId, userId, path, data, 
                        function(err){
                            if(err){
                                return res.status(404).json({status: 'error'});
                            } else {
                                return res.status(200).json({status: 'ok'});
                            }
                        }
                    ); 
                }
            }
            var checkPermissions = function(){
                if(dataUser && dataApp){
                    var allPerms = permsRequired.map(function(perm){
                            return (info.scope.indexOf(perm) !== -1);
                        }).reduce(function(prev, curr){
                            return prev && curr;
                        }, true);
                    if (!allPerms){
                        return res.status(401).json({status: 'unauthorized'});
                    } else {
                        returnOutput();
                    }
                }
            }
            if (dataUserId === 'me'){
                dataUser = user;
                checkPermissions();
            } else {
                db.users.findAllByUserId(dataUserId, function(err, dbUser){
                    if(err) { return res.status(404).json({status: 'error'}); }
                    if(!dbUser) { return res.status(400).json({status: 'bad endpoint'}); }
                    if (dbUser.userId === user.userId){
                        dataUser = user;
                        checkPermissions();
                    } else {
                        return res.status(401).json({status: 'unauthorized'});
                    }
                });
            }
            if(dataAppNamespace === 'app'){
                dataApp = client;
                permsRequired.push(client.namespace + '-write');
                checkPermissions();
            } else {
                db.clients.findByClientNamespace(dataAppNamespace, function(err, dbApp){ 
                    if(err) { return res.status(404).json({status: 'error'}); }
                    if(!dbApp) { return res.status(400).json({status: 'bad endpoint'}); }
                    else if (dbApp.clientId == client.clientId){
                        dataApp = client;
                        permsRequired.push(client.namespace + '-write');
                        checkPermissions();
                    } else {
                        //dataApp = dbApp;
                        //permsRequired.push(dbApp.namespace + '-read');
                        res.status(401).json({status: 'unauthorized'}); //Not supported currently
                    }
                });
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
            var dataAppNamespace = req.params.appId;
            var dataUserId = req.params.userId;
            var permsRequired = [];
            var dataUser, dataApp;
            var returnOutput = function(){
                if(dataUser && dataApp){
                    var path = req.params[0];
                    var userId = dataUser.userId;
                    var clientId = dataApp.clientId;
                    db.appUserData.deleteData(clientId, userId, path,
                        function(err, absent, success){
                            if (err) { 
                                return res.status(404).json({status: 'error'}); 
                            } else if (absent) { 
                                return res.status(200).json({status: 'absent'}); 
                            } else if (success) {
                                return res.status(200).json({status: 'ok'});
                            } else {
                                return res.status(404).json({status: 'huh'});
                            }
                        }
                    );
                }
            }
            var checkPermissions = function(){
                if(dataUser && dataApp){
                    var allPerms = permsRequired.map(function(perm){
                            return (info.scope.indexOf(perm) !== -1);
                        }).reduce(function(prev, curr){
                            return prev && curr;
                        }, true);
                    if (!allPerms){
                        return res.status(401).json({status: 'unauthorized'});
                    } else {
                        returnOutput();
                    }
                }
            }
            if (dataUserId === 'me'){
                dataUser = user;
                checkPermissions();
            } else {
                db.users.findAllByUserId(dataUserId, function(err, dbUser){
                    if(err) { return res.status(404).json({status: 'error'}); }
                    if(!dbUser) { return res.status(400).json({status: 'bad endpoint'}); }
                    if (dbUser.userId === user.userId){
                        dataUser = user;
                        checkPermissions();
                    } else {
                        return res.status(401).json({status: 'unauthorized'});
                    }
                });
            }
            if(dataAppNamespace === 'app'){
                dataApp = client;
                permsRequired.push(client.namespace + '-write');
            } else {
                db.clients.findByClientNamespace(dataAppNamespace, function(err, dbApp){ 
                    if(err) { return res.status(404).json({status: 'error'}); }
                    if(!dbApp) { return res.status(400).json({status: 'bad endpoint'}); }
                    else if (dbApp.clientId == client.clientId){
                        dataApp = client;
                        permsRequired.push(client.namespace + '-write');
                        checkPermissions();
                    } else {
                        //dataApp = dbApp;
                        //permsRequired.push(dbApp.namespace + '-read');
                        res.status(401).json({status: 'unauthorized'}); //Not supported currently
                    }
                });
            }
        });
    })(req, res, next);
}

exports.getLoginStatus = function(req, res, next){
    passport.authenticate('bearer', {session: false}, function(err, user, scope){
        if (err) { return res.status(404).json({status: 'error'}); }
        if (!user) { return res.status(200).json({status: 'unknown'}); }
        db.clients.findByClientId(info.clientId, function(err, client){
            if (err) { return res.status(404).json({status: 'error'}); }
            if (!client) { return res.status(200).json({status:'unauthorized'}); }
            if (info.scope.indexOf(client.namespace + '-write') === -1){
                return res.status(200).json({status: 'unauthorized'});
            } else {
                return res.status(200).json({status: 'connected'});
            }
        });
    })(req, res, next);
}
