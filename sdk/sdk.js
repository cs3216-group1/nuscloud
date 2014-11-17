var NUSCloud = function(host, redirect_url, app_id, permissions){
    
    var token;
    var existing_cookie = get_cookie("SDK_" + app_id);
    
    if(existing_cookie && existing_cookie != " "){ 
        token = JSON.parse(existing_cookie).token;
        //console.log(token);
    }

    this.login = function(callback){
        var url = host + "/authImplicit?client_id=" + app_id + 
                    "&redirect_uri=" + redirect_url + "&scope=" +
                    encodeURIComponent(permissions);
        var login_window = window.open(url, "Oauth-Login", "width=800, height=400");

        var pollTimer = window.setInterval(function(){
            try{
                var url = login_window.document.URL;
                if(url.indexOf(redirect_url)!==-1){
                    //Redirect has happened
                    window.clearInterval(pollTimer);
                    
                    var hash_location = url.indexOf('#');
                    var hash_args = url.slice(hash_location + 1);
                
                    //Can be generalized further
                    var token_start = hash_args.indexOf('=') + 1;
                    var token_end = hash_args.indexOf('&');
                    var new_token = hash_args.slice(token_start, token_end);
                    //console.log(url);
                    set_cookie("SDK_" + app_id, JSON.stringify({token: new_token}),
                         7, window.location.origin); 
                    token = new_token;
                    if(permissions.indexOf("ivle-read") !== -1){
                        login_window.location = host + "/ivleform?clientId=" + 
                            app_id + '&redirectUri=' + encodeURIComponent(redirect_url);
                        var pollTimerIvle = window.setInterval(function(){
                            try{
                                var url = login_window.document.URL
                                if(url.indexOf(redirect_url)!==-1||url.indexOf(window.location.host)!==-1){
                                    //Redirect has happened
                                    window.clearInterval(pollTimerIvle);
                                    login_window.close();
                                    if(callback) { return callback();}
                                }
                            } catch(e) {
                                //
                            }
                        }, 500);
                        
                    } else {
                        login_window.close();
                        if(callback) {return callback();}    
                    }
                }
            } catch(e) {
                //Cross Origin Errors will be thrown
                //until approval
                //console.log(e);
            }              
        }, 500);
    }

    this.logout = function(callback){
        if(token){
            return ajax.get(host + "/logoutImplicit", function(res){
                if(callback) {return callback(res);}
            });
        } else if (callback) {
            return callback({status: "no token"});
        }
    }

    this.getLoginStatus = function(callback){
        if(token){
            return ajax.get(host + "/api/getloginstatus", function(res){
                if(callback) {return callback(res);}
            });
        } else if (callback) {
            return callback(JSON.stringify({status: "unknown"}));
        }
    }

    this.get = function(api_path, callback){
        if(api_path.charAt(0) !== "/"){
            api_path = "/" + api_path;
        }
        if((api_path.charAt(api_path.length - 1) !== "/") && (api_path.indexOf('?') === -1)){
            api_path = api_path + "/";
        }
        if(token){
            return ajax.get(host + "/api" + api_path, function(res){
                //console.log(res);
                if(callback) {return callback(res);}
            });
        } else if (callback) {
            return callback({status: "no token"});
        }
    }
    
    this.delete = function(api_path, callback){
        if(api_path.charAt(0) != "/"){
            api_path = "/" + api_path;
        }
        if(api_path.charAt(api_path.length - 1) != "/"){
            api_path = api_path + "/";
        }
        if(token){
            return ajax.delete(host + "/api" + api_path, {}, function(res){
                //console.log(res);
                if(callback) {return callback(res);}
            });
        } else if (callback) {
            return callback({status: "no token"});
        }
    }

    this.post = function(api_path, inputData, callback){
        if(api_path.charAt(0) != "/"){
            api_path = "/" + api_path;
        }
        if(api_path.charAt(api_path.length - 1) != "/"){
            api_path = api_path + "/";
        }
        var data;
        if (!inputData.hasOwnProperty("data")){
            data = {data: inputData};
        } else {
            data = inputData;
        }
        if(token){
            return ajax.post(host + "/api" + api_path, data, function(res){
                //console.log(res);
                if(callback) {return callback(res);}
            });
        } else {
            return callback({status: "no token"});
        }
    }

    this.has_token = function(callback){
        return callback((token != null));
    }


    function set_cookie(cookie_name, cookie_value, lifespan, domain){
        var toAdd = cookie_name + "=" + 
            encodeURIComponent(cookie_value);
        //console.log(toAdd);
        document.cookie = toAdd;
        //console.log('cookie');
        //console.log(document.cookie);
    }

    function get_cookie(cookie_name){
        var name = cookie_name + "=";
        var cookie_array = document.cookie.split(";");
        for(var i=0; i<cookie_array.length; i++){
            var cookie = cookie_array[i];
            while (cookie.charAt(0)==" "){
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) != -1){
                return decodeURIComponent(cookie.substring(name.length, cookie.length));
            }
        }
        return "";
    }

    var ajax = {};
   
    ajax.x = function() {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();  
        }
        var versions = [
            "MSXML2.XmlHttp.5.0",   
            "MSXML2.XmlHttp.4.0",  
            "MSXML2.XmlHttp.3.0",   
            "MSXML2.XmlHttp.2.0",  
            "Microsoft.XmlHttp"
        ];

        var xhr;
        for(var i = 0; i < versions.length; i++) {  
            try {  
                xhr = new ActiveXObject(versions[i]);  
                break;  
            } catch (e) {
            }  
        }
        return xhr;
    };

    ajax.send = function(url, callback, method, data, sync) {
        var x = ajax.x();
        x.open(method, url, sync);
        x.onreadystatechange = function() {
            if (x.readyState == 4) {
                callback(x.responseText)
            }
        };
        if (method == 'POST') {
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        x.setRequestHeader('Authorization','Bearer ' + token);
        x.send(data)
    };

    ajax.get = function(url, callback, sync) {
        ajax.send(url, callback, 'GET', null, sync)
    };

    ajax.delete = function(url, data, callback, sync) {
        //Assume no data
        ajax.send(url, callback, 'DELETE', null, sync);
    }

    ajax.post = function(url, data, callback, sync) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(data[key])));
            //console.log(JSON.stringify(data[key]));
        }
        ajax.send(url, callback, 'POST', query.join('&'), sync)
    };

}

