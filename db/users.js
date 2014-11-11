var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

var ActivationSchema = new mongoose.Schema({
    id: String,
    createdAt: { type: Date, expires: 86400, default: Date.now }
});

var ForgotSchema = new mongoose.Schema({
    isUtilized: Boolean,
    id: String,
    createdAt: { type: Date, expires: 86400, default: Date.now }
});

var UserSchema = new mongoose.Schema({
    userId: String,
    name: String,
    email: String,
    username: String,
    info: mongoose.Schema.Types.Mixed,
    activated: Boolean,
    activationLinks: [ActivationSchema],
    forgot: [ForgotSchema]
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', UserSchema);

exports.findByUserId = function(id, done){
    User.findOne({userId: id}).lean().exec(done);
}

exports.findByUsername = function(username, done){
    User.findOne({username: username}).lean().exec(done);
}

exports.findByEmail = function(email, done){
    User.findOne({email: email}).lean().exec(done);
}

exports.save = function(username, password, name, email, userId, activationId, done){
    User.register(
        new User({
            username: username,
            name: name,
            email: email,
            userId: userId,
            activated: false,
            activationLinks: [ {id: activationId} ],
            forgot: []
        }),
        password,
        done
    );
}

exports.updateInfoById = function(id, newInfo, done){
    User.findOne({userId: id}, function(err, doc){
        if(err) { done(err); }
        console.log(newInfo);
        doc.info = newInfo;
        doc.markModified('info');
        doc.save(done);
    });
}

exports.createActivationLink = function(userId, activationId, done){
    User.findOne({userId: userId}, function(err, doc){
        if(err) { done(err); }
        doc.activationLinks.push({id: activationId});
        doc.save(done);
    });
}

exports.createForgotLink = function(userId, forgotId, done){
    User.findOne({userId: userId}, function(err, doc){
        if(err) { done(err); }
        doc.forgot.push({id: forgotId, isUtilized: false});
        doc.save(done);
    });
}

exports.activateUser = function(activationId, done){
    User.findOne({'activationLinks.id': activationId},
        function(err, doc){
            if(err) { done(err); }
            doc.activated = true;
            doc.save(done);
        }
    );
}

exports.findUserByForgotString = function(forgotId, done){
    User.findOne({'forgot.id': forgotId, 'forgot.isUtilized': false},
        function(err, doc){
            if(err) { done(err); }
            doc.forgot.isUtilized = true;
            doc.save(done);
        }
    );
}

exports.resetPassword = function(password, userId, done){
    User.findOne({userId: userId}, function(err, doc){
        if(err) { done(err); }
        doc.setPassword(password, function(err){
            if(err) { done(err); }
        });
        doc.save(done);
    });
}

exports.authenticate = User.authenticate();

exports.serializeUser = User.serializeUser();

exports.deserializeUser = User.deserializeUser();
