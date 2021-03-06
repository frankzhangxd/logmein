var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        BackgroundGeolocation.configure({
            locationProvider: BackgroundGeolocation.RAW_PROVIDER,
            desiredAccuracy: BackgroundGeolocation.MEDIUM_ACCURACY,
            stationaryRadius: 100,
            distanceFilter: 1000,
            debug: true,
            url: serviceURL + 'geotrack',
            stopOnTerminate: false,
            saveBatteryOnBackground: true, 
            postTemplate: {
              lat: '@latitude',
              lng: '@longitude',
              listid: localStorage.listid // you can also add your own properties
            }
        });
        
        BackgroundGeolocation.on('location', function(location) {
            // handle your locations here
            // to perform long running operation on iOS
            // you need to create background task
            BackgroundGeolocation.startTask(function(taskKey) {
              jQuery.post(serviceURL + 'geotrack', {'listid': localStorage.listid, 'lat':location.latitude, 'lng':location.longitude}, function(data) {})
              BackgroundGeolocation.endTask(taskKey);
            });
        });

        BackgroundGeolocation.on('error', function(error) {
            console.log('[ERROR] BackgroundGeolocation error:', error.code, error.message);
        });

        BackgroundGeolocation.on('start', function() {
            console.log('[INFO] BackgroundGeolocation service has been started');
        });

        BackgroundGeolocation.on('stop', function() {
            alert('[INFO] BackgroundGeolocation service has been stopped');
        });

        BackgroundGeolocation.on('authorization', function(status) {
            console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
            if (status !== BackgroundGeolocation.AUTHORIZED) {
              // we need to set delay or otherwise alert may not be shown
              setTimeout(function() {
                var showSettings = confirm('App requires location tracking permission. Would you like to open app settings?');
                if (showSetting) {
                  return BackgroundGeolocation.showAppSettings();
                }
              }, 1000);
            }
        });
        BackgroundGeolocation.start();
    }
};
(function ($) {
    $(document).ready(function() { 
        app.initialize();
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
                    tx.executeSql("SELECT * FROM visit_log WHERE signout=0 AND listid=? AND cast((strftime('%s',datetime('now','localtime'))-strftime('%s',timestamp)) AS real)/60/60<15 ORDER BY id DESC LIMIT 1", [localStorage.listid], function (tx, results) {
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