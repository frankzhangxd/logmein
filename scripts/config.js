var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);

(function ($) {
    $(document).ready(function() { 
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