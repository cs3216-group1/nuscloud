var passport = require('passport'),
    login = require('connect-ensure-login'),
    register = require('./register'),
    db = require('./db');

exports.viewFriends = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        res.render('viewFriends');
    }
]

exports.viewAddFriends = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        res.render('addFriends');
    }
]

/*
exports.viewAdd = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var notFriendsList = null;
        var friendReqsSentList = null;
        var friendReqsRcvdList = null;
        var friendsList = null;
        db.users.getNotFriends(req.user.userId, function(err, result){{
            if(err) { done(err); }
            notFriendsList = result;
            callRenderer();
        }
        db.users.getFriendRequestsReceived(req.user.userId, function(err, result){
            if(err) { done(err); }
            friendsReqsRcvdList = result;
            callRenderer();
        }
        db.users.getFriendRequestsSent(req.user.userId, function(err, result){
            if(err) { done(err); }
            friendReqsSentList = result;
            callRenderer();
        }
        db.users.getFriends(req.user.userId, function(err, result){
            if(err) { done(err); }
            friendsList = result;
            callRenderer();
        }
        var callRenderer = function(){
            if(notFriendsList && friendsList && 
                friendsReqsRcvdList && friendReqsSentList){
                res.render('friends', {
                    'friends': friendsList, 
                    'received': friendsReqsRcvdList,
                    'sent': friendsReqsSentList,
                    'rest': notFriendsList 
                });
            } else {
                return;
            }
        }
    }
]*/

exports.sendRequest = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var senderId = req.user.userId;
        var receiverId = req.body.userId;
        var sender, receiver;
        function done(err){
            if(err) { throw (err); }
            if(sender && receiver){
                res.status(200).send({status: 'ok'});
            }
        }
        db.users.addFriendRequestSent(senderId, receiverId, function(err, user){
            sender = user;
            done(err);
        });
        db.users.addFriendRequestReceived(receiverId, senderId, function(err, user){
            receiver = user;
            done(err);
        });
    }
]

exports.getSentRequests = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var userId = req.user.userId;
        db.users.getFriendRequestsSent(userId, function(err, userList){
            if(err) { throw err; }
            res.status(200).json({status: 'ok', users: userList});
        });
    }
]

exports.retractSentRequest = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var senderId = req.user.userId;
        var receiverId = req.body.userId;
        var sender, receiver;
        function done(err){
            if(err) { throw (err); }
            if(sender && receiver){
                res.status(200).send({status: 'ok'});
            }
        }
        db.users.removeFriendRequestSent(senderId, receiverId, function(err, user){
            sender = user;
            done(err);
        });
        db.users.removeFriendRequestReceived(receiverId, senderId, function(err, user){
            receiver = user;
            done(err);
        });
    }
]

exports.confirmRequest = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var receiverId = req.user.userId;
        var senderId = req.body.userId;
        console.log(receiverId);
        console.log(senderId);
        var sender, receiver;
        function done(err){
            if(err) { throw (err); }
            if(sender && receiver){
                res.status(200).send({status: 'ok'});
            }
        }
        db.users.removeFriendRequestSent(senderId, receiverId, function(err, user){
            if(err) { done(err); }
            db.users.addFriend(senderId, receiverId, function(err, user){
                sender = user;
                done(err);
            });
        });
        db.users.removeFriendRequestReceived(receiverId, senderId, function(err, user){
            if(err) { done(err); }
            db.users.addFriend(receiverId, senderId, function(err, user){
                receiver = user;
                done(err);
            });
        });
    }
]

exports.getReceivedRequests = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var userId = req.user.userId;
        db.users.getFriendRequestsReceived(userId, function(err, userList){
            if(err) { throw err; }
            res.status(200).json({status: 'ok', users: userList});
        });
    }
]

exports.deleteReceivedRequest = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var receiverId = req.user.userId;
        var senderId = req.body.userId;
        var sender, receiver;
        function done(err){
            if(err) { throw (err); }
            if(sender && receiver){
                res.status(200).send({status: 'ok'});
            }
        }
        db.users.removeFriendRequestSent(senderId, receiverId, function(err, user){
            sender = user;
            done(err);
        });
        db.users.removeFriendRequestReceived(receiverId, senderId, function(err, user){
            receiver = user;
            done(err);
        });
    }
]

exports.getFriends = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var userId = req.user.userId;
        db.users.getFriends(userId, function(err, userList){
            if(err) { throw err; }
            res.status(200).json({status: 'ok', users: userList});
        });
    }
]

exports.getNotFriends = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var userId = req.user.userId;
        db.users.getNotFriends(userId, function(err, userList){
            if(err) { throw err; }
            console.log(userList);
            res.status(200).json({status:'ok', users: userList});
        });
    }
]

exports.deleteFriend = [
    login.ensureLoggedIn(),
    register.isActivated,
    function(req, res){
        var deleterId = req.user.userId;
        var otherId = req.body.userId;
        var deleter, other;
        function done(err){
            if(err) { throw (err); }
            if(deleter && other){
                res.status(200).send({status: 'ok'});
            }
        }
        db.users.removeFriend(deleterId, otherId, function(err, user){
            deleter = user;
            done(err);
        });
        db.users.removeFriend(otherId, deleterId, function(err, user){
            other = user;
            done(err);
        });
    }
]

exports.apiGetFriends = function(req, res, next){
    passport.authenticate('bearer', { session: false },
        function(err, user, info){
            if(err) { return res.status(404).json({status: 'error'}); }
            if(!user) { return res.status(400).json({status: 'error'});}
            else if (info.scope.indexOf('friends-read') === -1){
                return res.status(401).json({status: 'unauthorized'});
            } else {
                db.users.getFriends(userId, function(err, userList){
                    if(err) { throw err; }
                    res.status(200).json({status: 'ok', friends: userList});
                });
            }
        }
    )(req, res, next);
}
