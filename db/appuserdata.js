var mongoose = require('mongoose');

var AppUserDataSchema = new mongoose.Schema({
    userId: String,
    clientId: String,
    data: mongoose.Schema.Types.Mixed
});

var AppUserData = mongoose.model('Data', AppUserDataSchema);

exports.getData = function(clientId, userId, path, done){
   AppUserData.findOne({userId: userId, clientId: clientId}).lean().exec(function(err, obj){
        if (err) { return done(err);}
        var pathArray = path.split('/');
        if(pathArray[pathArray.length - 1] == ""){
            pathArray = pathArray.slice(0,-1);
        }
        if(pathArray[0] == ""){
            pathArray = pathArray.slice(1);
        }
        if(!obj){
            return done(false, true);
        }
	if(!obj.data){
	    return done(false, true);
	}
        var currObj = obj.data;
        for(var key in pathArray){
            if(!currObj){
                return done(false, true);
            }
            if(currObj.hasOwnProperty(pathArray[key])){
                currObj = currObj[pathArray[key]];
            } else {
                //console.log(pathArray[key] + ' is not present');
                return done(false, true);
            }
        }
        return done(false, false, currObj);
    });
}

exports.deleteData = function(clientId, userId, path, done){ 
   AppUserData.findOne({userId: userId, clientId: clientId}).exec(function(err, doc){
        if (err) { return done(err);}
        if(!obj){
            return done(false, true);
        }
	if(!obj.data){
	    return done(false, true);
	}
        var pathArray = path.split('/');
        if(pathArray[pathArray.length - 1] == ""){
            pathArray = pathArray.slice(0,-1);
        }
        if(pathArray[0] == ""){
            pathArray = pathArray.slice(1);
        }
        var currObj = doc.data;
        for(var key = 0; key < pathArray.length - 1; key++){
            if(!currObj){
                return done(false, true);
            }
            if(currObj.hasOwnProperty(pathArray[key])){
                currObj = currObj[pathArray[key]];
            } else {
                return done(false, true);
            }
        }
        if(currObj.hasOwnProperty(pathArray[key])){
            delete currObj[pathArray[key]];
            doc.markModified('data');
            doc.save(function(err){
                if(err){return done(err);}
                return done(false, false, true);
            });
        } else {
            return done(false, true);
        }
    });
}

exports.putData = function(clientId, userId, path, data, done){
    AppUserData.findOne({userId: userId, clientId: clientId}).exec(function(err, doc){
        if (err) { return done(err);}
        if (!doc.data) { doc.data = {} }
        if(!obj){
            return done(false, true);
        }
	if(!obj.data){
	    return done(false, true);
	}
        var currData = doc.data;
        var pathArray = path.split('/');        
        if(pathArray[pathArray.length - 1] == ""){
            pathArray = pathArray.slice(0,-1);
        }
        if(pathArray[0] == ""){
            pathArray = pathArray.slice(1);
        }
        //console.log(pathArray);
        for(var key = 0; key < pathArray.length - 1; key++){
            //console.log('Start of Loop');
            //console.log(currData);
    
            if(!currData.hasOwnProperty(pathArray[key])){
                currData[pathArray[key]] = {};
            }
            if (typeof currData[pathArray[key]] != 'object'){
                currData[pathArray[key]] = {};
            }
            currData = currData[pathArray[key]];
            //console.log('End of loop');
            //console.log(currData);
        }
        //console.log('Before Set');
        //console.log(currData);
        currData[pathArray[key]] = data;
        //console.log('After Set');
        //console.log(currData);
        //console.log('Original Object');
        //console.log(doc.data);
        doc.markModified('data');
        doc.save(done);
        
    });
}

exports.create = function(clientId, userId, done){
    var appUserData = new AppUserData({
        clientId: clientId,
        userId: userId,
        data: {}
    });
    appUserData.save(done);
}

exports.exists = function(clientId, userId, done){
    AppUserData.findOne({userId: userId, clientId: clientId}).lean()
        .exec(function(err, obj){
            if (err) { return done(err) }
            else if (!obj) {return done(null, false); }
            return done(null, true);
        });
}        
