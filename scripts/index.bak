var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);
var projects;
(function ($){
    var status = 1;
    if (localStorage.getItem("signStatus") === null) {var status = localStorage.signStatus;}
    localStorage.clear(); 
    localStorage.signStatus = status; 
    
    console.log('Synchronize...');
    $.holdReady( true );
    synchronize();    
        
    function synchronize(){
        initDatabase();
        //projects
        $.getJSON(serviceURL + 'getData', {table:"projects"}, function(data) {
            console.log( "success" );
            projects = data.items;
            DEMODB.transaction(
            function (transaction) {
                transaction.executeSql("DELETE FROM projects WHERE 1", [] , function (t, r) {
                    $.each(projects, function(index, user) {
                        transaction.executeSql("INSERT INTO projects(project_id, name, shortname, cat, project_scope) VALUES (?, ?, ?, ?, ?)", [user.project_id, user.name, user.shortname, user.cat, user.project_scope], 
                        function(t, r){}, 
                        function (t, e) {console.log(e.message)});
       	            })
                    console.log('sync projects');
                    //employee
                    $.getJSON(serviceURL + 'getData', {table:"employee"}, function(data) {
                  		eps = data.items;
                        DEMODB.transaction(
                            function (transaction) {
                                transaction.executeSql("DELETE FROM employee WHERE 1", [] , function (t, r) {
                       	            $.each(eps, function(index, user) {
                                        transaction.executeSql("INSERT INTO employee(listid, isactive, firstname, lastname, jobtitle, mobile, personId) VALUES (?, ?, ?, ?, ?, ?, ?)", [user.listid, 1, user.firstname, user.lastname, user.jobtitle, user.mobile, user.personId], 
                                                        function(tx, res) {},
                                                        function (tx, error) {return true;}
                                                    );
                       	            })
                                    console.log('sync employees');
                                    //sub_employee
                                    $.getJSON(serviceURL + 'getData', {table:"sub_employee"}, function(data) {
                                  		sbes = data.items;
                                        DEMODB.transaction(
                                            function (transaction) {
                                                transaction.executeSql("DELETE FROM sub_employee WHERE status_sync=1", [] , function (t, r) {
                                       	            $.each(sbes, function(index, user) {
                                                        transaction.executeSql("INSERT INTO sub_employee(company, certificates, firstname, lastname, jobtitle, mobile, personId, status_sync) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [user.company, user.certificates, user.firstname, user.lastname, user.jobtitle, user.mobile, user.personId, '1'], 
                                                                        function(tx, res) {},
                                                                        function (tx, error) {return true;}
                                                                    );
                                       	            })
                                                    console.log('sync sub_employees');
                                                    $.holdReady( false );
                                                }, function (t, e) {console.log(e.message);}); 
                                       	    });
                                   	});
                                }, function (t, e) {console.log(e.message);}); 
                       	    });
                   	});
                    }, function (t, e) {console.log(e.message);}
                ); 
       	    });
       	})
    }
      
    function initDatabase() {
        try {
            createTables();
        } catch(e) {
            if (e == 2) {
                // Version number mismatch.
                console.log("Invalid database version.");
            } else {
                console.log("Unknown error "+e+".");
            }
            return;
        }
    }
        
    function createTables(){
        DEMODB.transaction(
            function (transaction) {
                //transaction.executeSql('DROP TABLE IF EXISTS config', [] , function (t, r) {console.log("Dropped");}, function (t, e) {console.log(e.message);});
                transaction.executeSql('CREATE TABLE IF NOT EXISTS config (uID TEXT NOT NULL, type INTEGER, meta TEXT);');
                //transaction.executeSql('DROP TABLE IF EXISTS config_notification', [] , function (t, r) {console.log("Dropped");}, function (t, e) {console.log(e.message);});
                transaction.executeSql('CREATE TABLE IF NOT EXISTS config_notification (project_id INTEGER NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, position INTEGER);');
                //transaction.executeSql('DROP TABLE IF EXISTS employee', [] , function (t, r) {console.log("Dropped");}, function (t, e) {alert(e.message);});
                transaction.executeSql('CREATE TABLE IF NOT EXISTS employee (listid TEXT NOT NULL PRIMARY KEY, firstname TEXT NOT NULL, lastname TEXT NOT NULL, jobtitle TEXT, mobile TEXT, personId TEXT, isactive INTEGER);');
                //transaction.executeSql('DROP TABLE IF EXISTS sub_employee', [] , function (t, r) {alert("Dropped");}, function (t, e) {alert(e.message);});
                transaction.executeSql('CREATE TABLE IF NOT EXISTS sub_employee (id INTEGER NOT NULL PRIMARY KEY, company TEXT NOT NULL, firstname TEXT NOT NULL, lastname TEXT NOT NULL, jobtitle TEXT, mobile TEXT, personId TEXT, certificates TEXT, status_sync INTEGER);');
                //activity: 0 sign-in; 1 sign-out
                //transaction.executeSql('DROP TABLE IF EXISTS visit_log', [] , function (t, r) {console.log("Dropped");}, function (t, e) {console.log(e.message);});
                transaction.executeSql('CREATE TABLE IF NOT EXISTS visit_log (id INTEGER NOT NULL PRIMARY KEY, listid TEXT, project INTEGER, firstname TEXT NOT NULL, lastname TEXT NOT NULL, company TEXT, jobtitle TEXT, mobile TEXT, activity INTEGER, img TEXT, personId TEXT, timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, signout INTEGER DEFAULT 0, signout_time TEXT, status_sync INTEGER);');
                
                transaction.executeSql('CREATE TABLE IF NOT EXISTS projects (project_id INTEGER NOT NULL PRIMARY KEY, name TEXT NOT NULL, shortname TEXT NOT NULL, cat INTEGER, project_scope INTEGER);');
                transaction.executeSql('CREATE TABLE IF NOT EXISTS project_subtrades (id INTEGER NOT NULL PRIMARY KEY, project_id INTEGER, vendor TEXT NOT NULL);');
            }
        );
    }
    
    $(document).ready(function() {
   	    $("#status").fadeOut(); // will first fade out the loading animation
        $("#preloader").delay(400).fadeOut("slow"); // will fade out the white DIV that covers the website.
        
        var sql_query_config = 'SELECT * FROM config WHERE 1 LIMIT 1';
        DEMODB.transaction(function (tx) {
            tx.executeSql(sql_query_config, [], function (tx, results) {
                if(results.rows.length>0){
                    //if configured
                    if(results.rows.item(0).type<1){
                        //if project device
                        localStorage.projectID = results.rows.item(0).uID;
                        if(localStorage.projectID==22){
                            $('ul li a#SUBTRADE').hide();
                        }
                        localStorage.device = 'PROJECT';
                        //Sync visit_log
                        $.getJSON(serviceURL + 'getVisitLog', {project: results.rows.item(0).uID}, function(data){
                      		logs = data.items;
                            DEMODB.transaction(
                                function (transaction) {
                                    transaction.executeSql("DELETE FROM visit_log WHERE status_sync=1", [] , function (t, r) {
                           	            $.each(logs, function(index, user) {
                                            transaction.executeSql("INSERT INTO visit_log(listid, project, firstname, lastname, company, jobtitle, mobile, activity, img, personId, timestamp, signout, signout_time, status_sync) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [user.listid, user.project, user.firstname, user.lastname, user.company, user.jobtitle, user.mobile, user.activity, user.img, user.personId, user.datetime, user.signout, user.signout_time, 1], function (t, r) {console.log('update visit logs');}, function (t, e) {console.log(e.message);});
                           	            })
                                    }, function (t, e) {console.log(e.message);
                                }); 
                       	    });
                       	});
                    }else{
                        //else user device
                        $meta = JSON.parse(results.rows.item(0).meta);
                        localStorage.device = 'USER';
                        localStorage.listid = results.rows.item(0).uID;
                        localStorage.company = 'DMS';
                        localStorage.fname = $meta.fname;
                        localStorage.lname = $meta.lname;
                        localStorage.title = $meta.title;
                        localStorage.mobile = $meta.mobile;
                        window.location.replace('index-user.html');
                    }
                }else{
                    window.location.replace("page-config.html");
                }
            }, function (t, e) {console.log(e.message);});
        });  
        
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
                    tx.executeSql("SELECT * FROM visit_log WHERE activity=0 AND signout=0 AND project=? AND cast((strftime('%s','now')-strftime('%s',timestamp)) AS real)/60/60<12", [localStorage.projectID], function (tx, results) {
                        
                        if(results.rows.length>0){
                            window.location.replace('page-camera.html');
                        }else{
                            window.plugins.toast.showLongCenter('You have not signed in yet, please remember to sign in whenever entering job site.');
                        }
                    }, function (t, e) {consile(e.message);});
                });
            }else{
                window.location.replace('page-camera.html');
            }
        })
    })
}(jQuery));