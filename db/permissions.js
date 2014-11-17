var mongoose = require('mongoose');

var PermissionSchema = new mongoose.Schema({
    userId: String,
    clientId: String,
    permissions: [String]
});

var Permission = mongoose.model('Permission', PermissionSchema);

exports.find = function(userId, clientId, done){
    Permission.findOne({userId: userId, clientId: clientId}).lean().exec(done);
}

exports.findByUserId = function(userId, done){
    Permission.find({userId: userId}).lean().exec(done);
}

exports.save = function(userId, clientId, done){
    var permission = new Permission({
        userId: userId,
        clientId: clientId,
        permissions: []
    });
    permission.save(done);
}

exports.addArray = function(userId, clientId, permArray, done){
    Permission.findOne({userId: userId, clientId: clientId}, function(err, doc){
        permArray.forEach(function(permission){
            doc.permissions.addToSet(permission);
        });        
        doc.save(done);
    });
}

exports.remove = function(userId, clientId, done){
    Permission.remove({userId: userId, clientId: clientId}, done);
}

exports.removeByClientId = function(clientId, done){
    Permission.remove({clientId: clientId}, done);
}
