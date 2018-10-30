var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);

(function ($) {
    $.holdReady( true );
    var sqlstr = 'SELECT * FROM projects WHERE 1 ORDER BY name';
    DEMODB.transaction(function (tx) {
        tx.executeSql(sqlstr, [], function (tx, results) {
            if(results.rows.length>0){
                var len = results.rows.length, i;
                for (i = 0; i < len; i++){
                    $('#list').append('<option value="'+ results.rows.item(i).project_id +'">'+ results.rows.item(i).name +'</option>');
                }
            }
            $.holdReady( false );
        }, function (t, e) {console.log(e.message);});
    });

    $(document).ready(function() { 
        $("#status").fadeOut(); // will first fade out the loading animation
        $("#preloader").delay(400).fadeOut("slow"); // will fade out the white DIV that covers the website.
        
        var sql_query_person = 'SELECT * FROM employee WHERE listid="'+localStorage.listid+'" LIMIT 1';
        DEMODB.transaction(function (tx) {
            tx.executeSql(sql_query_person, [], function (tx, results) {
                if(results.rows.length>0 && results.rows.item(0).personId!=''){
                    localStorage.personId = results.rows.item(0).personId;
                }else if(localStorage.getItem("faceID") !== null){
                    $.ajax({
                        url: "https://canadacentral.api.cognitive.microsoft.com/face/v1.0/identify",
                        beforeSend: function (xhrObj) {
                            xhrObj.setRequestHeader("Content-Type","application/json");
                            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "b62de5e5fb964732b97b43e85e0161ae");
                        },
                        type: "POST",
                        data: "{'personGroupId': 'dmscorp','faceIds': ['"+localStorage.faceID+"'],'maxNumOfCandidatesReturned': 1,'confidenceThreshold': 0.5}"
                    })
                    .done(function (data) {
                        if(data[0].candidates.length>0){
                            localStorage.personId = data[0].candidates[0].personId;
                        }
                    })
                }
            }, function (t, e) {console.log(e.message);});
        });
        $(document).on('click', 'a.ui-icon-home', function(e){
            e.preventDefault();
            window.location.replace('index-user.html');
        })
        $('.ui-footer a.ui-btn').click(function(e){
            e.preventDefault();
            if($('#list').val()!=''){
                localStorage.projectID = $('#list').val();
                $page = "page-employee-after-signin.html";
                if(localStorage.signStatus == 1){$page = "page-user-signout.html";}
                window.location.replace($page);
            }else{
                window.plugins.toast.showLongCenter('Please fill out your information.');
            }
        })
    })
}(jQuery));