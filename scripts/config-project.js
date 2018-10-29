var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);

(function ($) {
    //Projects
    $.getJSON(serviceURL + 'getData', {table:"projects"}, function(data) {
      		eps = data.items;
            DEMODB.transaction(
                function (transaction) {
                    transaction.executeSql("DELETE FROM projects WHERE 1", [] , function (t, r) {
           	            $.each(eps, function(index, user) {
                            transaction.executeSql("INSERT INTO projects(project_id, name, shortname, cat, project_scope) VALUES (?, ?, ?, ?, ?)", [user.project_id, user.name, user.shortname, user.cat, user.project_scope], 
                                function(tx, res) {
                                    $('#project').append('<option value="'+ user.project_id +'" >'+ user.name + '</option>');
                                },
                                function (tx, error) {return true;}
                            );
           	            })
                        $("#status").fadeOut(); // will first fade out the loading animation
	                    $("#preloader").delay(400).fadeOut("slow"); // will fade out the white DIV that covers the website.
                    }, function (t, e) {console.log(e.message);}); 
           	    });
   	});
    
    $(document).ready(function() { 
        $(document).on('change', '#project', function(){
            $('ul li p, ul li h2').text('');
            if($(this).val()!=''){
                $.getJSON(serviceURL + 'getNotifyConfigs', {project: $(this).val()}, function(data){
                    var i=1;
                    $.each(data.items, function(index, user) {
                        $('#n'+i).text(user.name);
                        $('#j'+i).text(user.jobtitle);
                        $('#p'+i).text(user.mobile);
                        $('#e'+i).text(user.email);
                        i++;
                    })
                })
            }
        })
        
        $(document).on('click', 'a.ui-icon-home', function(e){
            e.preventDefault();
            window.location.replace('index.html');
        })
        
        $('.ui-content a.ui-btn').click(function(){
            if($('#project').val()!=''){
                DEMODB.transaction(
                    function (transaction) {
                        transaction.executeSql('DELETE FROM config WHERE 1', [] , function (t, r) {
                            transaction.executeSql("INSERT INTO config (uID, type) VALUES (?, ?)", [$('#project').val(), 0] , function (t, r) {
                                $.ajax({  
                                    type: "POST",  
                                    url: serviceURL + 'NotifyConfigSync',  
                                    data: $('form').serializeArray(),  
                                    success: function(value) {  
                                        window.location.replace("index.html");
                                    }
                                });
                            }, function (t, e) {alert(e.message);});    
                        }, function (t, e) {console.log(e.message);});
                    }
                );
            }else{
                alert('Please select project.');
            }
        })
        
        $('td input[type=text]').click(function(){
            if($(this).val()==$(this).attr('placeholder')){
                $(this).val('');
            }
        })
    })
}(jQuery));