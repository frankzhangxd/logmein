var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);

(function ($) {
    $.holdReady( true );
    DEMODB.transaction(function (tx) {
        tx.executeSql('SELECT * FROM employee WHERE listid=? LIMIT 1', [localStorage.listid], function (tx, results) {
            if(results.rows.length>0 && results.rows.item(0).personId!=''){
                localStorage.personId = results.rows.item(0).personId;
                $.holdReady( false );
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
                    $.holdReady( false );
                })
            }
        }, function (t, e) {console.log(e.message);});
    });
    $(document).on('click', 'a.ui-icon-home', function(e){
            e.preventDefault();
            window.location.replace('index-user.html');
        })
    $(document).ready(function() { 
        $("#status").fadeOut(); // will first fade out the loading animation
        $("#preloader").fadeOut("slow"); // will fade out the white DIV that covers the website.
        $('.ui-content a.ui-btn').click(function(e){
            e.preventDefault();
            localStorage.signStatus = $('#reason').val();
            window.location.replace("page-user-signout.html");
        })
    })
}(jQuery));