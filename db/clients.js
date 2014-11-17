var mongoose = require('mongoose');

var ClientSchema = new mongoose.Schema({
    name: String,
    namespace: String,
    clientId: String,
    clientSecret: String,
    domain: String,
    userId: String,
    ivleKey: String
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

exports.save = function(name, clientId, clientSecret, domain, namespace, userId, ivleKey, done){
    var client = new Client({
        name: name, 
        clientId: clientId,
        clientSecret: clientSecret,
        domain: domain,
        namespace: namespace,
        userId: userId,
        ivleKey: ivleKey
    });
    client.save(done);
}

exports.remove = function(clientId, done){
    Client.remove({clientId: clientId}).lean().exec(done);
}

exports.addIvleKey = function(clientId, ivleKey, done){
    Client.findOne({clientId: clientId}).exec(function(err, doc){
        if(err) { return done(err); }
        doc.ivleKey = ivleKey;
        doc.save(done);
    });
}

exports.getIvleKey = function(clientId, done){
    Client.findOne({clientId: clientId}).exec(function(err, doc){
        if(err) { return done(err); }
        if(!doc.ivleKey){ return done(false, true); }
        else { return done(false, false, doc.ivleKey); }
    });
}

exports.edit = function(clientId, name, namespace, domain, ivleKey, done){
    Client.findOne({clientId: clientId}).exec(function(err, doc){
        if(err) { return done(err); }
        doc.name = name;
        doc.namespace = namespace;
        doc.ivleKey = ivleKey;
        doc.domain = domain;
        doc.save(done);
    });
}
