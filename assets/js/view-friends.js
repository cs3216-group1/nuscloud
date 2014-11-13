$(document).ready(function(){

    var setHandlers = function(){
        $('.accept-btn').click(function(){
            var userId = $(this).attr('userId');
            jQuery.post('/friends/confirm', {userId: userId}, function(res){
                $('#request-div ul').empty();
                populateRequests();
                $('#friends-div ul').empty();
                populateFriends();
            });
        });
    }

    var populateRequests = function(){
        jQuery.get('/friends/pending', function(res){
            if(res.users.length > 0){
                $('#request-div').removeClass('hide');
                var data = res.users;
                for(var i=0; i<data.length; i++){
                    $('#request-div ul').append(
                        '<li><h3>' + data[i].name + 
                        '<button class="nuscloud-btn btn-half-right' +
                        ' accept-btn" userId="' + data[i].userId + '">' +
                        'Accept</button></h3></li>'
                    );
                }
            } else {
                $('#request-div').addClass('hide');
            }
            setHandlers();
        });
    }

    var populateFriends = function(){
        jQuery.get('/friends/list', function(res){
            if(res.users.length > 0){
                $('#friends-div').removeClass('hide');
                $('#zero-friends-div').addClass('hide');
                var data = res.users;
                for(var i=0; i<data.length; i++){
                    $('#friends-div ul').append(
                        '<li><h3>' + data[i].name + '</li></h3>' 
                    );
                } 
            } else {
                $('#zero-friends-div').removeClass('hide');
                $('friends-div').addClass('hide');
            }
        });
    }

    populateRequests();
    populateFriends();

});
