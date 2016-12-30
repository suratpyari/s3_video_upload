var xhr;
var xhr1;
CKEDITOR.dialog.add( 'S3 Video Upload', function ( editor ){
  var lang = editor.lang;

  return {
    id: 'info',
    title: 'S3 Video Upload',
    minWidth: 400,
    minHeight: 200,
    contents: [
      {
        id: 'tab1',
        elements:[
          {
            type: 'radio',
            id: 'upload_options',
            items: [ [ 'Upload File From Your Desktop', 'BU' ],
              [ 'Upload Saved Files', 'SF' ]],
            style: 'color: black; font-weight: bold;font-size: 16px;',
            'default': 'BU',
            onClick: function() {
              if(this.getValue() == "BU"){
                $('#upload_div').css({'display':'block'})
                $('#demo01').css({'display':'none'})
              }
              if(this.getValue() == "SF"){
                $('#upload_div').css({'display':'none'});
                $('#demo01').css({'display':'block'});
              }
            }
          },
          {
            type:"html",
            id:"list",
            html:'<div id="file_upload">'
                +'<br/>'
                +'<div id="upload_div">'
                +'<input id="file_to_upload" type="file" accept="video/*"/>'
                +'<input id="btn" type="Submit" style="padding:6px;background-color:black;border:1px solid black;color:white;border-radius:2px;cursor:pointer;" value="Upload"/>'
                +'</div>'
                +'<a id="demo01" href="#animatedModal" style="display:none;padding:6px;background-color:black;border:1px solid black;color:white;border-radius:2px;width:70px;cursor:pointer">Open Modal</a>'
                +'<div id="image">'
                +'<div style="padding:20px;">'
                +'<img src="" id="my_image" style="display:none;" class="play"/>'
                +'</div>'
                +'<br/>'
                +'<input id="remove_image" style="display:none;padding:6px;background-color:black;border:1px solid black;color:white;border-radius:2px;cursor:pointer;" type="submit" value="Remove"/>'
                +'<input id="delete_image" style="display:none;padding:6px;background-color:black;border:1px solid black;color:white;border-radius:2px;cursor:pointer;" type="submit" value="delete"/>'
                +'</div>'
                +'<div id="animatedModal" class="ani_model">'
                +'<input type="Submit" style="padding:6px;background-color:black;border:1px solid black;color:white;border-radius:2px;cursor:pointer;" id="c_modal" value="Close" class="close-animatedModal"></input>'
                +'<div id="list_images" class="modal-content">'
                +'</div>'
                +'</div>'
                +'</div>'

          }
        ]
      }
    ],
    onShow: function(){

      var selected_radio = $('input[name=upload_options_radio]:checked').val()

      // show content according to selected radio button
      if(selected_radio == "BU"){
        $('#upload_div').css({'display':'block'});
        $('#demo01').css({'display':'none'});
      }
      if(selected_radio == "SF"){
        $('#upload_div').css({'display':'none'});
        $('#demo01').css({'display':'block'});
      }

      // fetch images in modal if exists
      fetch_images()
      //initiaize modal
      $("#demo01").animatedModal();

      // when buttons get clicked
      get("btn").addEventListener('click',check_file,false);
      get("delete_image").addEventListener('click',delete_image,false);
    },
    // on Ok button take image from dialog and push into editor
    onOk: function(){
      var image_snapshot = get('my_image')
      var element = editor.document.createElement(image_snapshot)
      editor.insertElement(element)

      get("file_to_upload").value = ""
      $('#remove_image').css({'display':'none'});
      $('#delete_image').css({'display':'none'});
    },

    onCancel: function(){
      if(xhr != undefined){
        xhr.abort();
      }
      if(xhr1 != undefined){
        xhr.abort();
      }
      $("#my_image").css({'display':'none'});
      $("#my_loader").css({'display':'none'});
      get("file_to_upload").value = ""
      $('#remove_image').css({'display':'none'});
      $('#delete_image').css({'display':'none'});
      return;
    },
    onHide:function(){
      if(xhr != undefined){
        xhr.abort();
      }
      if(xhr1 != undefined){
        xhr.abort();
      }
    }
  };
})



// fetch signature.policy and key and save them in globbal variable
$(function(){
  // // get images from database to before opening modal
  // fetch_images()
  var url;

  $.getJSON(CKEDITOR.basePath + 'data.json')
  .done(function(d){
    url = d.credentialsUrl;
    window.global_videos_url = d.videos_url;
    window.global_key = d.key;
    window.global_bucket_url = d.bucket_url;
    window.global_upload_url = d.video_upload_url;
    window.global_delete_url = d.delete_video_url;

    //ajax for fetching signature and policy
    $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json',
      success: function(response){
        window.aws_policy = response.policy
        window.aws_signature = response.signature
        window.key_id = response.aws_key_id
      }
    })
  })
  .fail(function(){
    alert("Please check whether you have uploaded data.json in ckeditor foler or not")
  })

})

function get(ele){
  return document.getElementById(ele)
}
// when upload btn is clicked---------------
function check_file(){
  // get file
  var file = get('file_to_upload').files[0]

  //check if file is empty
  if(file == undefined){
    alert('Please choose file to upload')
    return;
  }

  // if file exists then check the type of file
  var type_of_file = file.type.substring(0,5)

  // check type of file is other than video
  if(type_of_file != "video"){
    alert("Please choose appropriate file to upload, you can upload only videos")
    return;
  }
  else{

    // add loader to dialog
    var para = "It will take few minutes...";
    var d = document.createElement('div')
    d.style.cssText = "color:red;"
    d.id = "my_loader";
    d.append(para)
    get('image').appendChild(d)
    // if file is video
    var file = get('file_to_upload').files[0]
    var key = global_key + $.now()+ '/'+file.name
    var data = new FormData();
    data.append('key', key)
    data.append('Content-Type',file.type);
    data.append('AWSAccessKeyId', key_id);
    data.append('acl',"public-read");
    data.append('policy',aws_policy);
    data.append('signature',aws_signature);
    data.append('file', file);
    // send type_of_file,data,key to aws
    // type_of_file because when uploaded to s3 if file is video then
    // we need to call convert_into_image
    // but not in the other case
    // data to send on s3
    // key for location where file is placed in s3
    // last one is empty string because when we will upload snapshot
    // we have to call same function with different parameters
    upload_to_aws(data, key, type_of_file, "")
  }
}


// file upload to aws
function upload_to_aws(data, key, file_type, video_url){

  var data = data;
  var url = global_bucket_url;
  var file_url = url +"/"+ key;
  xhr = $.ajax({
    url : url,
    type: "POST",
    data: data,
    contentType: false,
    processData: false,
    success: function(){
      if(file_type == "video"){
        convert_to_image(file_url)
      }
      else
      {
        var m_data = {
          medium:{
            snapshot: file_url,
            video_url: video_url
          }
        }

        // ajax for medium create
      xhr1 =  $.ajax({
          url : global_upload_url,
          type: "POST",
          data: m_data,
          success: function(response){
            // console.log(response)
            // show image in dialog
            get("my_loader").remove()
            var i = get('my_image')
            i.style.display = "block";
            i.setAttribute("data-video_id",response.id)
            i.setAttribute("data-video_url",response.video_url)
            i.src = file_url
            // show delete button
            $('#delete_image').css({'display':'block'});
          },
          error: function(){
            // reset form
            alert("Sorry, Not able to upload your file")
            get("file_to_upload").value = ""
            get("my_loader").remove()
          }
        })
      }
    },
    error: function(){
      // reset form
      alert("Sorry, Not able to upload your file")
      get("file_to_upload").value = ""
      get("my_loader").remove()
    }
  })
}


// if file is video we need to convert into image
function convert_to_image(video_url){

  var v = document.createElement("video")
  v.currentTime=2;
  v.setAttribute("crossorigin", "anonymous")
  var s = document.createElement("source")
  s.src = video_url
  v.appendChild(s)
  var canvas = document.createElement("canvas")
  var data = new FormData();

  // when video is loaded
  v.addEventListener("loadeddata", function(){
    if(v.readyState > 2){
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(v,0,0,canvas.width ,canvas.height, 0, 0, canvas.width, canvas.height)
      var dataURI = canvas.toDataURL();

      // convert canvas into blob so that we can send to aws
      var blob = dataURItoBlob(dataURI)

      if(blob){

        // first we need to find the key
        var d = video_url.split("/")
        var l = d.pop()
        d.splice(0,3)
        var prefix = d.join("/")

        // filename
        var arr = l.split(".")
        var file_name = arr[0] + ".png"

        var key = prefix +'/'+ file_name
        var file_type = blob.type.substring(0,5)
        var data = new FormData();
        data.append('key', key)
        data.append('Content-Type',blob.type);
        data.append('AWSAccessKeyId', key_id);
        data.append('acl',"public-read");
        data.append('policy',aws_policy);
        data.append('signature',aws_signature);
        data.append('file', blob);
        if(data){
          upload_to_aws(data, key, file_type, video_url)
        }
      }
    }
  })
}

// convert dataURItoBlob
function dataURItoBlob(dataURI)
{
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++)
  {
    ia[i] = byteString.charCodeAt(i);
  }
  var bb = new Blob([ab], { "type": mimeString });
  return bb;
}

// when delete button is clicked-------------

function delete_image(){
  var d = get('my_image').getAttribute('data-video_id')
  $.ajax({
    url: global_delete_url + '/'+ d,
    type: "DELETE",
    success: function(response){
      // reset file
      get("file_to_upload").value = ""
      // hide delete button--------
      $('#delete_image').css({'display':'none'});

      // reset image
      var img = get('my_image')
      img.src = ""
      img.classList.add("hidden")
      alert(response.message)
    },
    error: function(){
      alert("Sorry, Not able to delete")
    }
  })
}

//open modal-----------------------------------------------------------

function fetch_images(){

  $(".ani_model").css({'padding':"20px","background-color":"white!important"})
  $.ajax({
    url : global_videos_url + '.json',
    type: "GET",
    success: function(response){
      // fetch all images so first empty modal
      $("#list_images").empty();

      $.map(response, function(response){
        var im = document.createElement("img")
        im.id = response.id;
        im.style.cssText = "float:left!important;display:inline;height: 140px;width:140px;cursor:pointer;margin:10px;"
        im.src = response.snapshot
        get("list_images").style.cssText = "padding: 20px;"
        get("list_images").appendChild(im)
        $(".ani_model").css({'padding':"20px","background-color":"white!important"})
        $("#"+response.id).on('click', function(){
          var i = get('my_image')
          i.style.display = "block";
          i.setAttribute("data-video_id",this.id)
          i.src = this.src
          // hide open modal button-----------
          get('c_modal').click()
          // add remove button

          //show btn remove image
          get('remove_image').style.display = "block";

          // when remove image button is clicked
          $("#remove_image").on('click', function(){
            this.style.display = "none";
            get("my_image").src = ""
            $("#my_image").css({'display':'none'});
          })
        })
      })
    }
  })
}

