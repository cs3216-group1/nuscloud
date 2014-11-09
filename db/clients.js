var mongoose = require('mongoose');

var ClientSchema = new mongoose.Schema({
    name: String,
    namespace: String,
    clientId: String,
    clientSecret: String,
    domain: String,
    userId: String
});

var Client = mongoose.model('Client', ClientSchema);


exports.findByClientId = function(clientId, done){
    Client.findOne({clientId: clientId}).lean().exec(done);
}

exports.findByClientNamespace = function(namespace, done){
    Client.findOne({namespace: namespace},done);
}

exports.findByUserId = function(userId, done){
    Client.find({userId: userId}).lean().exec(done);
}

exports.save = function(name, clientId, clientSecret, domain, namespace, userId, done){
    var client = new Client({
        name: name, 
        clientId: clientId,
        clientSecret: clientSecret,
        domain: domain,
        namespace: namespace,
        userId: userId
    });
    client.save(done);
}

