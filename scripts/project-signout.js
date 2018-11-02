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
        $('.ui-footer a.ui-btn').click(function(e){
            e.preventDefault();
            localStorage.signStatus = $('#reason').val();
            window.location.replace("page-user-signout.html");
        })
        
        var src = "documents://log.wav";
        var mediaRec = new Media(
            src, 
            function() {console.log("recordAudio():Audio Success");}, 
            function(err) {alert("recordAudio():Audio Error: "+ err.code);}
        );
        $(document).on('click', 'a.btn-start', function(e){
            e.preventDefault();
            $('a.btn-stop').toggleClass('ui-state-disabled');
            mediaRec.startRecord();
        })
        $(document).on('click', 'a.btn-stop', function(e){
            e.preventDefault();
            $('a.btn-play').toggleClass('ui-state-disabled');
            mediaRec.stopRecord();
            window.resolveLocalFileSystemURL(cordova.file.documentsDirectory + src, 
                function(fileEntry){
                    fileEntry.file(function(file) {
                		var reader = new FileReader();
                        reader.onloadend = function() {
                            // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
                            var blob = new Blob([new Uint8Array(this.result)], { type: "audio/wav" });
                            var oReq = new XMLHttpRequest();
                            oReq.open("POST", "https://www.dmscorp.ca/pm/services/uploadAudio", true);
                            oReq.onload = function (oEvent) {};
                            // Pass the blob in to XHR's send method
                            oReq.send(blob);
                        };
                        // Read the file as an ArrayBuffer
                        reader.readAsArrayBuffer(file);
                	});
                } , 
                function (err) { alert('error getting file! ' + err); }
            );
        })
        $(document).on('click', 'a.btn-play', function(e){
            e.preventDefault();
            mediaRec.play();
        })
    })
    
}(jQuery));