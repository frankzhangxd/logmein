var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);
(function ($) {
    $(document).ready(function() { 
        document.addEventListener('deviceready', function () {
              console.log('device ready')
              console.log(typeof navigator.camera)  // returns undefined
              console.log(typeof CameraPreview)  // returns 'function'
              CameraPreview.startCamera({ x: 0, y: 0, width: screen.width, height: screen.height, toBack: true, previewDrag: false, tapPhoto: false, disableExifHeaderStripping: true, storeToFile: true }) // camera is displayed. remember to set the background to transparent for the html and body tags
             // some more code
        }, false)
        var sec = 5;
        var timer = setInterval(function() { 
        $('#secs').text(sec--);
            if (sec == 0) { 
                  CameraPreview.takePicture({width:600, height:800, quality: 85}, function(myBase64){
                    var contentType = "image/jpeg";
                    // The path where the file will be saved
                    var folderpath = cordova.file.externalDataDirectory;
                    // The name of your file
                    var filename = $.now()+".jpeg";
                    savebase64AsImageFile(folderpath,filename,myBase64,contentType);
                  });
                  
                  //test();
                  clearInterval(timer);
            } 
        }, 1000);
        /**
         * Convert a base64 string in a Blob according to the data and contentType.
         * 
         * @param b64Data {String} Pure base64 string without contentType
         * @param contentType {String} the content type of the file i.e (image/jpeg - image/png - text/plain)
         * @param sliceSize {Int} SliceSize to process the byteCharacters
         * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
         * @return Blob
         */
        function b64toBlob(b64Data, contentType, sliceSize) {
                contentType = contentType || '';
                sliceSize = sliceSize || 512;
        
                var byteCharacters = atob(b64Data);
                var byteArrays = [];
        
                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);
        
                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
        
                    var byteArray = new Uint8Array(byteNumbers);
        
                    byteArrays.push(byteArray);
                }
        
              var blob = new Blob(byteArrays, {type: contentType});
              return blob;
        }
        
        /**
         * Create a Image file according to its database64 content only.
         * 
         * @param folderpath {String} The folder where the file will be created
         * @param filename {String} The name of the file that will be created
         * @param content {Base64 String} Important : The content can't contain the following string (data:image/png[or any other format];base64,). Only the base64 string is expected.
         */
        function savebase64AsImageFile(folderpath,filename,content,contentType){
            // Convert the base64 string in a Blob
            var DataBlob = b64toBlob(content,contentType);
            $page = "page-new-subtrade-worker.html";
            var fd = new FormData();
            fd.append("file", DataBlob);
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://www.dmscorp.ca/pm/services/upload', true);
            xhr.onload = function (oEvent) {
                if (this.status == 200) {
                    var resp = JSON.parse(this.response);
                    var data = JSON.parse(localStorage['certificates']);
                    var name = localStorage['upload_certificate'];
                    var val = resp.url;
                    data[name] = val;
                    localStorage['certificates'] = JSON.stringify(data);
                    CameraPreview.stopCamera();
                    window.location.replace($page);
                };
            }
            xhr.send(fd);
        }
        
        function test(){
            // Convert the base64 string in a Blob
            $page = "page-new-subtrade-worker.html";
            var fd = new FormData();
            var xhr = new XMLHttpRequest();
            var image = "https://dmscorp.ca/pm/images/4rlogo.jpg";
            xhr.open('POST', 'https://www.dmscorp.ca/pm/services/upload', true);
            xhr.onload = function (oEvent) {
                if (this.status == 200) {
                    //var resp = JSON.parse(this.response);
                    var data = JSON.parse(localStorage['certificates']);
                    var name = localStorage['upload_certificate'];
                    var val = image;
                    data[name] = val;
                    localStorage['certificates'] = JSON.stringify(data);
                    //CameraPreview.stopCamera();
                    window.location.replace($page);
                };
            }
            xhr.send(fd);
        }
        
        $(document).on('click', 'a.ui-icon-home', function(e){
            e.preventDefault();
            window.location.replace('index.html');
        })
    })
}(jQuery));