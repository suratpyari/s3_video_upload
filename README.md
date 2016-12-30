##Video Upload to S3

This plugin is for uploading videos to s3 storage, server databases and also to delete images from your server. You just need to put some lines of code and you are done.

To integrate this plugin in your project  you need to follow these steps  -

1. **Clone or download project**
2. **Paste into ckeditor plugins folder** - Extract your plugin from downloaded zip and put it into ckeditor plugins directory.
3. **Make json file (important)** - Make a file named data.json which would contain,

    >
  
        {
            "credentialsUrl" : Api for fetching credentials such as signature, policy and aws_key_id.
            "bucket_url" : Url of aws bucket.
            "key" : Directory in aws where your videos and snapshot will get stored.
            "videos_url" : Api for fecthing snapshots, video_urls and ids from your server.
            "video_upload_url" : Api where you want to upload your snapshot and video_url on server.
            "delete_video_url" : Api for deleting videos and snapshots from your server database
        }
     
 Before moving to next step there are some important points.         

   **Important Notes** - 

    1. **credentialsUrl** : should return json object,
        
        >
           {
              signature: "your signature",    #string
              policy: "your policy",          #string
              aws_key_id: "your aws_key_id",  #string
            }
    2. **bucket_url** : Example - "https://your_bucket_name.s3.amazonaws.com"
    3. **key** : Example - "uploads/videos/".
    4. **videos_url** : should return json object,
        
        >
            {
               id:"id of medium"                #string
               snapshot: "snapshot of medium"   #string
               video_url: "video_url"           #string
            }
    5. **video_upload_url** : will recieve prameters,
        
         >
            medium:{
              snapshot: "",
              video_url: ""
            }

    vi.**delete_video_url** : Example - "/delete_video/id_of_medium"               
            
            
  4.**Add some configuration**: Add the following code to ckeditor's configuration file,
        
      config.extraPlugins = 's3_video_upload'
      
 That's it you are done :)


