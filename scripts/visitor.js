var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);

(function ($) {
    $.holdReady( true );
    var sql_query_employees = 'SELECT * FROM employee WHERE isactive=1 ORDER BY firstname';
    DEMODB.transaction(function (tx) {
            tx.executeSql(sql_query_employees, [], function (tx, results) {
                if(results.rows.length>0){
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++){
                        $('#jobtitle').append('<option data-title="'+ results.rows.item(i).jobtitle +'" data-mobile="'+ results.rows.item(i).mobile +'" data-fname="'+ results.rows.item(i).firstname +'" data-lname="' + results.rows.item(i).lastname  +'">'+ results.rows.item(i).firstname +' ' + results.rows.item(i).lastname  +'</option>');
                    }
                }
                $.holdReady( false );
            }, function (t, e) {console.log(e.message);});
    });
    
    $(document).ready(function() { 
            /*
          $(document).bind('deviceready', function(){
            onDeviceReady();
          })*/
        $("#status").fadeOut(); // will first fade out the loading animation
        $("#preloader").fadeOut("slow"); // will fade out the white DIV that covers the website.
        
        
        if(localStorage.personId!=''){
            var sqlstr = 'SELECT * FROM visit_log WHERE personId="'+localStorage.personId+'" ORDER BY id DESC LIMIT 1';
                DEMODB.transaction(function (tx) {
                tx.executeSql(sqlstr, [], function (tx, results) {
                    if(results.rows.length>0){
                        $('#fname').val(results.rows.item(0).firstname);
                        $('#lname').val(results.rows.item(0).lastname);
                        $('#mobile').val(results.rows.item(0).mobile);
                        $('#company').val(results.rows.item(0).company);    
                    }
                }, function (t, e) {console.log(e.message);});
            });
        }
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
                localStorage.listid = '-1';
                window.location.replace("page-visitor-after-signin.html");
            }else{
                window.plugins.toast.showLongCenter('Please fill out your information.')
            }
        })
    })
}(jQuery));