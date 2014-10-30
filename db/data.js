var mongoose = require('mongoose');

var DataSchema = new mongoose.Schema({
    userId: String,
    clientId: String,
    data: mongoose.Schema.Types.Mixed
});

var Data = mongoose.model('Data',UserSchema);

exports.getData = function(clientId, userId, path, done){
    Data.findOne({userId: userId, clientId: clientId}).lean().exec(function(err, obj){
        if (err) { return done(err);}
        var pathArray = path.split('/');
        var currObj = obj.data;
        for(var key in pathArray){
            if(currObj.hasOwnProperty(pathArray[key])){
                currObj = currObj[pathArray[key]];
            } else {
                return done(false, true);
            }
        }
        return done(false, false, currObj);
    });
}

exports.putData = function(clientId, userId, path, data, done){
    Data.findOne({userId: userId, clientId: clientId}).exec(function(err, doc){
        if (err) { return done(err);}
        var currData = doc.data;
        var pathArray = path.split('/');
        for(var key in pathArray){
            if(!currData.hasOwnProperty(pathArray[key])){
                currData[pathArray[key]] = {};
                currData = data[pathArray[key]];
            }
        }
        currData = data;
        doc.markModified('data');
        doc.save(done);
    }
}
