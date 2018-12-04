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
                alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
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
        .always(function( data, textStatus, response ){
            DEMODB.transaction(function (transaction){
                if(localStorage.signStatus<1){
                    //If sign in, then signout all previous sign in first
                    transaction.executeSql("UPDATE visit_log SET signout=1 WHERE signout=0 AND firstname=? AND lastname=? AND company=? AND listid=?", [localStorage.fname, localStorage.lname, localStorage.company, localStorage.listid]
                    , function(t, r){
                        //then sign in
                        transaction.executeSql("INSERT INTO visit_log(listid, project, firstname, lastname, company, jobtitle, mobile, activity, img, personId, signout) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [localStorage.listid, localStorage.projectID, localStorage.fname, localStorage.lname, localStorage.company, localStorage.title, localStorage.mobile, localStorage.signStatus, localStorage.image, localStorage.personId, 0], function (t, r) {
                            var newID = r.insertId;
                            if(localStorage.getItem("listid") === null){
                                localStorage.listid = '';
                            }
                            $.post(serviceURL + 'visitLogSync', {'listid': localStorage.listid, 'project':localStorage.projectID, 'fname':localStorage.fname, 'lname':localStorage.lname, 'company':localStorage.company, 'title':localStorage.title, 'mobile':localStorage.mobile, 'activity':localStorage.signStatus, 'img':localStorage.image, 'datetime': $.now(), 'personId':localStorage.personId, 'geo': localStorage.GEO, 'device': localStorage.device}, function(data) {
                                console.log('log synced');
                                DEMODB.transaction(function (tx){
                                    tx.executeSql("UPDATE visit_log SET status_sync=1 WHERE id =?", [newID], function (tx, results) {console.log('updated');}, function (t, e) {console.log(e.message);}); 
                                });
                            }).always(function (data) {
                                localStorage.clear(); 
                                localStorage.signStatus = 0;
                                window.location.replace('index.html');
                            })    
                        }, function (t, e) {console.log(e.message);});    
                    }, function (t, e) {console.log(e.message);});
                }
            });
        });        
    }
    
    var sqlstr = 'SELECT * FROM employee WHERE isactive=1 ORDER BY firstname';
    DEMODB.transaction(function (tx) {
        tx.executeSql(sqlstr, [], function (tx, results) {
            if(results.rows.length>0){
                var len = results.rows.length, i;
                for (i = 0; i < len; i++){
                    $('#list').append('<option value="'+ results.rows.item(i).listid +'" data-personid="'+ results.rows.item(i).personId +'" data-title="'+ results.rows.item(i).jobtitle +'" data-mobile="'+ results.rows.item(i).mobile +'" data-fname="'+ results.rows.item(i).firstname +'" data-lname="' + results.rows.item(i).lastname  +'">'+ results.rows.item(i).firstname +' ' + results.rows.item(i).lastname  +'</option>');
                }
            }
            $('#list').append('<option value="NEW">NEW EMPLOYEE ...</option>');
            if(localStorage.projectID==22){
                $('a.btn-next').text('Submit');
            }
            $("#status").fadeOut(); // will first fade out the loading animation
            $("#preloader").fadeOut("slow"); // will fade out the white DIV that covers the website.
            
        }, function (t, e) {console.log(e.message);});
    });

    $(document).ready(function() { 
        $('input[type=text]').attr('readonly', 'readonly');
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
            .then(function(data){
                if(localStorage.signStatus == 1){
                    window.location.replace('page-signout.html');
                }
                if(localStorage.personId!=''){
                    var sql_query_person = 'SELECT * FROM employee WHERE personId="'+localStorage.personId+'" LIMIT 1';
                    DEMODB.transaction(function (tx) {
                        tx.executeSql(sql_query_person, [], function (tx, results) {
                            if(results.rows.length>0){
                                $('#fname').val(results.rows.item(0).firstname);
                                $('#lname').val(results.rows.item(0).lastname);
                                $('#mobile').val(results.rows.item(0).mobile);
                                $('#jobtitle').val(results.rows.item(0).jobtitle);
                                $('#company').val(localStorage.company);   
                                $('#list').val(results.rows.item(0).listid) 
                            }
                        }, function (t, e) {console.log(e.message);});
                    });
                }
            })
        }
        
        $(document).on('change', '#list', function(){
            if($(this).val()!='NEW'){
                $('#fname').val($(this).find('option:selected').data('fname'));
                $('#lname').val($(this).find('option:selected').data('lname'));
                $('#mobile').val($(this).find('option:selected').data('mobile'));
                $('#jobtitle').val($(this).find('option:selected').data('title'));
                localStorage.personId = $(this).find('option:selected').data('personid');
                $('div.alert').html('');
            }else{
                $('#fname,#lname,#mobile,#jobtitle').val('').removeAttr('readonly');
                $('div.alert').html('<h4>Welcome to DMS, please fill out the follwing information.</h4>');
            }
        });
        $(document).on('click', 'a.ui-icon-home', function(e){
            e.preventDefault();
            window.location.replace('index.html');
        })
        $('.ui-footer a.ui-btn').click(function(e){
            e.preventDefault();
            if($('#fname').val()!='' && $('#company').val()!=''){
                localStorage.fname = $('#fname').val();
                localStorage.lname = $('#lname').val();
                localStorage.title = $('#jobtitle').val();
                localStorage.mobile = $('#mobile').val();
                localStorage.company = $('#company').val();
                localStorage.listid = $('#list').val();
                if(localStorage.projectID!=22){
                    window.location.replace("page-employee-after-signin.html");
                }else{
                    $(this).text('Submitting ...').addClass('ui-state-disabled');
                    if(localStorage.getItem("personId") === null || localStorage.personId==''){
                        //PersonGroup Person - Create
                        $.ajax({
                            url: "https://canadacentral.api.cognitive.microsoft.com/face/v1.0/persongroups/dmscorp/persons",
                                beforeSend: function (xhrObj) {
                                    xhrObj.setRequestHeader("Content-Type","application/json");
                                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "b62de5e5fb964732b97b43e85e0161ae");
                                },
                                type: "POST",
                                data: "{'name': '"+localStorage.fname+' '+localStorage.lname+"', 'userData': '"+localStorage.listid+"'}"
                            })
                            .done(function (data){
                                localStorage.personId = data.personId;
                                signLog();
                            })
                            .fail(function (jqXHR, textStatus, errorThrown) {
                                console.log("Failed in Person - Create, Details:  Status:: " + jqXHR.status + "  ResponseText:: " + jqXHR.statusText + "");
                            })
                    }else{
                        signLog();
                    }
                }
            }else{
                window.plugins.toast.showLongCenter('Please fill out your information.')
            }
        })
    })
}(jQuery));