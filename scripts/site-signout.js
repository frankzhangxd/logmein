var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);

(function ($) {
    function signLog() {
         var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
         };
         navigator.geolocation.getCurrentPosition(
            function(position){
                $meta = {Latitude: position.coords.latitude, Longitude: position.coords.longitude, Accuracy: position.coords.accuracy, Heading: position.coords.heading, Speed: position.coords.speed, Timestamp: position.timestamp};
                localStorage.GEO = JSON.stringify($meta);
            },
            function(error){
                console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
            },
            options
         );
        //PersonGroup Person - Add Face
        $.ajax({
            url: "https://canadacentral.api.cognitive.microsoft.com/face/v1.0/persongroups/dmscorp/persons/"+localStorage.personId+"/persistedFaces",
            beforeSend: function (xhrObj) {
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "b62de5e5fb964732b97b43e85e0161ae");
            },
            type: "POST",
            data: "{'url': '"+localStorage.image+"'}"
        })
        .done(function (data) {})
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log("Failed in Face Add, Details:  Status:: " + jqXHR.status + "  ResponseText:: " + jqXHR.statusText + "");
        })
        .then(function( data, textStatus, response ){
            DEMODB.transaction(function (transaction){
            //IF signout
                transaction.executeSql("SELECT * FROM visit_log WHERE signout=0 AND project=? AND firstname=? AND lastname=? AND company=? AND listid=?", [localStorage.projectID, localStorage.fname, localStorage.lname, localStorage.company, localStorage.listid] , function (t, results) {
                    if(results.rows.length>0){
                            $sql_update = "UPDATE visit_log SET signout = 1, signout_time=? WHERE id = (SELECT MAX(id) FROM visit_log WHERE signout=0 AND project=? AND firstname=? AND lastname=? AND company=? AND listid=?)";
               	                transaction.executeSql($sql_update, [$.now(), localStorage.projectID, localStorage.fname, localStorage.lname, localStorage.company, localStorage.listid], function(t, r){
               	                    $.post(serviceURL + 'visitLogSync', {'listid': localStorage.listid, 'project':localStorage.projectID, 'fname':localStorage.fname, 'lname':localStorage.lname, 'company':localStorage.company, 'title':localStorage.title, 'mobile':localStorage.mobile, 'activity':localStorage.signStatus, 'img':localStorage.image, 'datetime': $.now(), 'personId':localStorage.personId, 'geo': localStorage.GEO, 'device': localStorage.device}, function(data) {
                                        DEMODB.transaction(function (tx){
                                            tx.executeSql("UPDATE visit_log SET status_sync=1 WHERE id =?", [newID], function (tx, results) {console.log('updated');}, function (t, e) {console.log(e.message);}); 
                                        });
                                    }).done(function (data) {
                                        localStorage.clear(); 
                                        localStorage.signStatus = 1;
                                        window.location.replace("index.html");}
                                    )
               	                }, function (t, e) {console.log(e.message);});
       	            }
                }, function (t, e) {console.log(e.message);});
            });
        });        
    }
    $.holdReady( true );
    $('#form').hide();
    if(localStorage.signStatus==1){
        $('h1').text('Signed Out!');
        if(localStorage.listid=='-1'){
            $('h4').text('Thank you for visiting DMS.');  
        }
        
        var sql_query_person1 = "SELECT * FROM visit_log WHERE activity=0 AND signout=0 AND project='"+localStorage.projectID+"' AND cast((strftime('%s',datetime('now','localtime'))-strftime('%s',timestamp)) AS real)/60/60<15 GROUP BY firstname";
        DEMODB.transaction(function (tx) {
            tx.executeSql(sql_query_person1, [], function (tx, results) {
                if(results.rows.length>0){
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++){
                        $('#list').append('<option value="'+ results.rows.item(i).personId +'" data-fname="'+ results.rows.item(i).firstname +'" data-lname="' + results.rows.item(i).lastname  +'">'+ results.rows.item(i).firstname +' ' + results.rows.item(i).lastname  +'</option>');
                    }
                }
                $.holdReady( false );
            }, function (t, e) {console.log(e.message); $.holdReady( false );});
        });
    }
    $(document).ready(function(){
        $('#form').hide();
        $("#status").fadeOut(); // will first fade out the loading animation
        $("#preloader").delay(400).fadeOut("slow"); // will fade out the white DIV that covers the website.
        if(localStorage.getItem("faceID") !== null){
            $.ajax({
                url: "https://canadacentral.api.cognitive.microsoft.com/face/v1.0/identify",
                beforeSend: function (xhrObj) {
                    xhrObj.setRequestHeader("Content-Type","application/json");
                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "b62de5e5fb964732b97b43e85e0161ae");
                },
                type: "POST",
                data: "{'personGroupId': 'dmscorp','faceIds': ['"+localStorage.faceID+"'],'maxNumOfCandidatesReturned': 1,'confidenceThreshold': 0.6}"
            })
            .done(function (data) {
                if(data[0].candidates.length>0){
                    localStorage.personId = data[0].candidates[0].personId;
                }
            })
            .complete(function(data){
                if(localStorage.personId==''){
                    //not recognize
                    $('h4').text('It Seems we do not recognize you!'); 
                    $('#form').show();
                }else{
                    var sql_query_person2 = "SELECT * FROM visit_log WHERE personId='"+localStorage.personId+"' AND activity=0 AND signout=0 AND project='"+localStorage.projectID+"' AND cast((strftime('%s',datetime('now','localtime'))-strftime('%s',timestamp)) AS real)/60/60<15 ORDER BY id DESC LIMIT 1";
                    DEMODB.transaction(function (tx) {
                        tx.executeSql(sql_query_person2, [], function (tx, results) {
                            if(results.rows.length>0){
                                localStorage.fname = results.rows.item(0).firstname
                                localStorage.lname = results.rows.item(0).lastname;
                                localStorage.mobile = results.rows.item(0).mobile;
                                localStorage.title = results.rows.item(0).jobtitle;
                                localStorage.company = results.rows.item(0).company; 
                                localStorage.listid = results.rows.item(0).listid; 
                                setTimeout(function() {
                                    signLog();    
                                }, 2000);
                            }else{
                                var sql_query_person3 = "SELECT * FROM employee WHERE personId='"+localStorage.personId+"' LIMIT 1";
                                DEMODB.transaction(function (tx) {
                                    tx.executeSql(sql_query_person3, [], function (tx, results) {
                                        if(results.rows.length>0){
                                            localStorage.fname = results.rows.item(0).firstname
                                            localStorage.lname = results.rows.item(0).lastname;
                                            function onConfirm(buttonIndex) {
                                                if(buttonIndex==1){
                                                    alert('Have you signed in? We can not find you.');
                                                    window.location.replace("index.html");
                                                }else{
                                                    $('#form').show();
                                                }
                                            }
                                            navigator.notification.confirm(
                                                'Are you ' + localStorage.fname + ' ' + localStorage.lname + '?', // message
                                                 onConfirm,            // callback to invoke with index of button pressed
                                                'Confirmation',           // title
                                                ['Yes','No']     // buttonLabels
                                            );
                                        }else{
                                            alert('Have you signed in? We can not find you.');
                                            window.location.replace("index.html");
                                        }
                                    }, function (t, e) {console.log(e.message);});
                                });
                            }
                        }
                        , function (t, e) {console.log(e.message);});
                    });
                }
            })
        }
        
        $('.ui-content .btn-submit').click(function(e){
            if($('#list').val()!=''){
                localStorage.fname = $(this).find('option:selected').data('fname');
                localStorage.lname = $(this).find('option:selected').data('lname');
                localStorage.personId = $(this).val();
                var sql_query_person2 = "SELECT * FROM visit_log WHERE personId='"+localStorage.personId+"' AND activity=0 AND signout=0 AND project='"+localStorage.projectID+"' AND cast((strftime('%s',datetime('now','localtime'))-strftime('%s',timestamp)) AS real)/60/60<15 ORDER BY id DESC LIMIT 1";
                DEMODB.transaction(function (tx) {
                    tx.executeSql(sql_query_person2, [], function (tx, results) {
                        if(results.rows.length>0){
                            localStorage.fname = results.rows.item(0).firstname
                            localStorage.lname = results.rows.item(0).lastname;
                            localStorage.mobile = results.rows.item(0).mobile;
                            localStorage.title = results.rows.item(0).jobtitle;
                            localStorage.company = results.rows.item(0).company; 
                            localStorage.listid = results.rows.item(0).listid; 
                            setTimeout(function() {
                                signLog();    
                            }, 2000);
                        }else{
                            alert('Have you signed in? We can not find you.');
                            window.location.replace("index.html");
                        }
                    }
                    , function (t, e) {console.log(sql_query_person+e.message);});
                });
            }else{
                $('h4').text('Please fill out the follwing information.');
            }
        })
    })
}(jQuery));