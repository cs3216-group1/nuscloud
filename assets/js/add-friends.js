$(document).ready(function () {

    var setHandlers = function(){
        $('.request-btn').click(function(){
            var userId = $(this).attr('userId');
            jQuery.post('/friends/request', {userId: userId}, function(res){
                alert("Request Sent");
                $("#notfriends").empty();
                populateList();
            });
        });
    }

    var populateList = function(){
        jQuery.get('/friends/search', function(res){
            var data = res.users;
            for(var i=0; i<data.length; i++){
                $('#notfriends').append(
                    '<li><h3><span class="name">' + data[i].name +
                    '</span><button class="nuscloud-btn btn-half-right' +
                    ' request-btn" userId="' + data[i].userId + '">' +
                    'Add</button></h3><b>Username: </b>' +
                    '<span class="username">' + data[i].username + '</span><br>' +
                    '<b>Email: </b><span class="email">' + data[i].email + 
                    '</span></li>'
                );
            }
            setHandlers();
        });
    }

    populateList();

    (function ($) {

        $('#add-filter').keyup(function () {

            var rex = new RegExp($(this).val(), 'i');
            $('.searchable li').hide();
            $('.searchable li').filter(function () {
                return (rex.test($(this).find(".name").text()))
                    || (rex.test($(this).find(".username").text()))
                    || (rex.test($(this).find(".email").text()));
            }).show();

        })

    }(jQuery));

});
