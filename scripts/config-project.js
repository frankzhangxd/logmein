var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);

(function ($) {
    //Projects
    $.getJSON(serviceURL + 'getData', {table:"projects"}, function(data) {
        eps = data.items;
        DEMODB.transaction(
            function (transaction) {
                transaction.executeSql("DELETE FROM projects WHERE 1", [] , function (t, r) {
                    console.log('Update Projects');
                    $.each(eps, function(index, user) {
                        transaction.executeSql("REPLACE INTO projects(project_id, name, shortname, cat, project_scope) VALUES (?, ?, ?, ?, ?)", [user.project_id, user.name, user.shortname, user.cat, user.project_scope], 
                            function(tx, res) {},
                            function (tx, error) {return true;}
                        );
                    })
                 }, function (t, e) {console.log(e.message);});  
   	        }
        );
   	}).always(function() {
        DEMODB.transaction(function (tx) {
            tx.executeSql('SELECT * FROM projects WHERE 1 ORDER BY name', [], function (tx, results) {
                if(results.rows.length>0){
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++){
                        $('#project').append('<option value="'+ results.rows.item(i).project_id +'" >'+ results.rows.item(i).name + '</option>');
                    }
                }
            }, function (t, e) {console.log(e.message);});
        });
        $("#status").fadeOut(); // will first fade out the loading animation
        $("#preloader").delay(400).fadeOut("slow"); // will fade out the white DIV that covers the website.
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
        
        $('.ui-footer a.ui-btn').click(function(){
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