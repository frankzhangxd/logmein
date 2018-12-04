var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);
(function ($) {
    $(document).ready(function() {
        $('h1 span').text(localStorage.fname);
        if (localStorage.getItem("certificates") === null) {
            localStorage.certificates = JSON.stringify({});;
        }else{
            var data = JSON.parse(localStorage['certificates']);
            var keys = Object.keys(data);
            var len = keys.length;
            for (var i = 0; i < len; i++) {
                $('ul li a[rel*="'+keys[i]+'"]').removeClass('ui-icon-carat-r').addClass('ui-icon-check');
            }
        }
        
        $(document).on('click', 'ul.ui-listview li a', function(e){
            e.preventDefault();
            if(!$(this).hasClass('ui-icon-check')){
                localStorage['upload_certificate'] = $(this).attr('rel');  
                window.location.replace("page-upload-certificate.html");  
            }else{
                var data = JSON.parse(localStorage['certificates']);
                delete data[$(this).attr('rel')];
                localStorage['certificates'] = JSON.stringify(data);
                $(this).toggleClass('ui-icon-carat-r ui-icon-check');
            }
            
        })
        
        $(document).on('click', 'a.btn-next', function(e){
            e.preventDefault();
            $.ajax({
                url: "https://canadacentral.api.cognitive.microsoft.com/face/v1.0/persongroups/dmscorp/persons",
                beforeSend: function (xhrObj) {
                    xhrObj.setRequestHeader("Content-Type","application/json");
                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "b62de5e5fb964732b97b43e85e0161ae");
                },
                type: "POST",
                data: "{'name': '"+localStorage.fname+' '+localStorage.lname+"', 'userData': '"+localStorage.company+"'}"
            })
            .done(function (data){
                localStorage.personId = data.personId;
                console.log(data);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                        console.log("Failed in Person - Create, Details:  Status:: " + jqXHR.status + "  ResponseText:: " + jqXHR.statusText + "");
            })
            .then( function( data, textStatus, response ) {
                DEMODB.transaction(function (transaction) {
                    transaction.executeSql("INSERT INTO sub_employee(company, firstname, lastname, jobtitle, mobile, personId, certificates) VALUES (?, ?, ?, ?, ?, ?, ?)", [localStorage.company, localStorage.fname, localStorage.lname, localStorage.title, localStorage.mobile, localStorage.personId, localStorage.certificates], function (t, r) {
                        var newID = r.insertId;
                        $.post(serviceURL + 'subEmployeeSync', {'company':localStorage.company, 'fname':localStorage.fname, 'lname':localStorage.lname, 'title':localStorage.title, 'mobile':localStorage.mobile, 'personId':localStorage.personId, 'certificates':localStorage.certificates}, function(data) {
                            console.log('SubEmployee synced');
                        }).done(function (data) {
                            DEMODB.transaction(function (tx){
                                tx.executeSql("UPDATE sub_employee SET status_sync=1 WHERE id =?", [newID], function (tx, results) {console.log('updated'); window.location.replace("page-employee-after-signin.html");}, function (t, e) {console.log(e.message);}); 
                            });
                        })    
                    }, function (t, e) {console.log(e.message);}); 
                });
            });
        })
        
        $(document).on('click', 'a.ui-icon-home', function(e){
            e.preventDefault();
            window.location.replace('index.html');
        })
    })
}(jQuery));