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
        $("#preloader").fadeOut("slow"); // will fade out the white DIV that covers the website.
        
        $('.ui-content a').click(function(e){
            e.preventDefault();
            window.location.replace("page-config-"+$(this).attr('rel')+".html");
        })
        
        $(document).on('click', 'a.ui-icon-home', function(e){
            e.preventDefault();
            window.location.replace('index.html');
        })
    })
}(jQuery));