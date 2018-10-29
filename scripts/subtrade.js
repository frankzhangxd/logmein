var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);

// PhoneGap is loaded and it is now safe to make calls PhoneGap methods
/*
function onDeviceReady() {
    navigator.network.isReachable("google.com", reachableCallback, {});
}
*/
(function ($) {
    //project_subtrades
    $.holdReady( true );
    $.getJSON(serviceURL + 'getSubtrades', {project_id: localStorage.projectID}, function(data) {
        subtrades = data.items;
        DEMODB.transaction(
        function (transaction) {
            transaction.executeSql("DELETE FROM project_subtrades WHERE 1", [] , function (t, r) {
                $.each(subtrades, function(index, user) {
                    transaction.executeSql("INSERT INTO project_subtrades(project_id, vendor) VALUES (?, ?)", [user.project_id, user.vendor]);
   	            })
                $.holdReady( false );
            }, function (t, e) {console.log(e.message);}); 
   	    });
   	});
    
    $(document).ready(function() { 
        $("#status").fadeOut(); // will first fade out the loading animation
        $("#preloader").delay(400).fadeOut("slow"); // will fade out the white DIV that covers the website.
        var sqlstr = 'SELECT * FROM project_subtrades WHERE 1 ORDER BY vendor';
        DEMODB.transaction(function (tx) {
            tx.executeSql(sqlstr, [], function (tx, results) {
                if(results.rows.length>0){
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++){
                        $('#company').append('<option value="'+ results.rows.item(i).vendor +'">'+ results.rows.item(i).vendor +'</option>');
                    }
                }
            }, function (t, e) {console.log(e.message);});
        });
        
        if(localStorage.getItem("faceID") !== null){
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
            .then(function(data){
                if(localStorage.personId!=''){
                    var sql_query_person = 'SELECT * FROM sub_employee WHERE personId="'+localStorage.personId+'" ORDER BY id DESC LIMIT 1';
                        DEMODB.transaction(function (tx) {
                        tx.executeSql(sql_query_person, [], function (tx, results) {
                            if(results.rows.length>0){
                                $('#fname').val(results.rows.item(0).firstname);
                                $('#lname').val(results.rows.item(0).lastname);
                                $('#mobile').val(results.rows.item(0).mobile);
                                $('#jobtitle').val(results.rows.item(0).jobtitle);
                                $('#company').val(results.rows.item(0).company);   
                            }
                        }, function (t, e) {console.log(e.message);});
                    });
                }
            })
        }
        
        $(document).on('change', '#company', function(){
            var sqlstr = "SELECT * FROM sub_employee WHERE company LIKE '"+$(this).val()+"' ORDER BY firstname";
            $('#list').empty().append('<option value="">EMPLOYEE</option>');
            DEMODB.transaction(function (tx) {
                tx.executeSql(sqlstr, [], function (tx, results) {
                    if(results.rows.length>0){
                        
                        var len = results.rows.length, i;
                        for (i = 0; i < len; i++){
                            $('#list').append('<option value="'+ results.rows.item(i).listid +'" data-title="'+ results.rows.item(i).jobtitle +'" data-mobile="'+ results.rows.item(i).mobile +'" data-fname="'+ results.rows.item(i).firstname +'" data-lname="' + results.rows.item(i).lastname  +'">'+ results.rows.item(i).firstname +' ' + results.rows.item(i).lastname  +'</option>');
                        }
                    }

                    $('#list').append('<option value="NEW">NEW EMPLOYEE ...</option>');
                }, function (t, e) {console.log(e.message);});
            });
        });
        
        $(document).on('change', '#list', function(){
            if($(this).val()!='NEW'){
                $('#fname').val($(this).find('option:selected').data('fname'));
                $('#lname').val($(this).find('option:selected').data('lname'));
                $('#mobile').val($(this).find('option:selected').data('mobile'));
                $('#jobtitle').val($(this).find('option:selected').data('title'));
                $('div.alert').html('');
            }else{
                $('div.alert').html('<h4>Please fill out the follwing information.</h4>');
            }
        });
        $(document).on('click', 'a.ui-icon-home', function(e){
            e.preventDefault();
            window.location.replace('index.html');
        })
        $('.ui-content a.ui-btn').click(function(e){
            e.preventDefault();
            if($('#fname').val()!='' && $('#lname').val()!='' && $('#mobile').val()!='' && $('#company').val()!=''){
                localStorage.fname = $('#fname').val();
                localStorage.lname = $('#lname').val();
                localStorage.title = $('#jobtitle').val();
                localStorage.mobile = $('#mobile').val();
                localStorage.company = $('#company').val();
                if($('#list').val()=='NEW'){
                    window.location.replace("page-new-subtrade-worker.html");
                }else{
                    window.location.replace("page-employee-after-signin.html");
                }
            }else{
                window.plugins.toast.showLongCenter('Please fill out your information.')
            }
        })
    })
}(jQuery));