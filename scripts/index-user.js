var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);

(function ($) {
    $(document).ready(function() { 
        
        $("#status").fadeOut(); // will first fade out the loading animation
        $("#preloader").delay(400).fadeOut("slow"); // will fade out the white DIV that covers the website.

        $.ajax({
            url: "https://canadacentral.api.cognitive.microsoft.com/face/v1.0/persongroups/dmscorp/train",
            beforeSend: function (xhrObj) {
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "b62de5e5fb964732b97b43e85e0161ae");
            },
            type: "POST",
        })
        .done(function (data) {})
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log("Failed in PersonGroup - Train, Details:  Status:: " + jqXHR.status + "  ResponseText:: " + jqXHR.statusText + "");
        });
        $('ul li a').click(function(){
            localStorage.company = $(this).attr('id');
            if($(this).attr('id')=='SIGNOUT'){
                DEMODB.transaction(function (tx) {
                    tx.executeSql("SELECT * FROM visit_log WHERE signout=0 AND listid=? AND cast((strftime('%s','now')-strftime('%s',timestamp)) AS real)/60/60<13 ORDER BY id DESC LIMIT 1", [localStorage.listid], function (tx, results) {
                        if(results.rows.length>0){
                            localStorage.projectID = results.rows.item(0).project;
                            window.location.replace('page-camera.html');
                        }else{
                            window.plugins.toast.showLongCenter('You have not signed in yet, please remember to sign in whenever entering job site.');
                            //alert('You have not signed in yet, please remember to sign in whenever entering job site.');
                        }
                    }, function (t, e) {consile(e.message);});
                });
            }else{
                window.location.replace('page-camera.html');
            } 
        })
    })
}(jQuery));