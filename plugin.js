CKEDITOR.plugins.add( 's3_video_upload', {
    init: function( editor ) {
      // Plugin logic goes here...
      // added animated modal
      CKEDITOR.scriptLoader.load(CKEDITOR.basePath+ 'plugins/s3_video_upload/dialogs/animatedModal.js')
      CKEDITOR.dialog.add( 'S3 Video Upload', this.path + 'dialogs/s3_video_upload.js' );
      editor.addCommand( 'S3 Video Upload' , new CKEDITOR.dialogCommand( 'S3 Video Upload' ) );
      editor.ui.addButton('Upload',
        {
          label : "S3 Video Upload",
          command : 'S3 Video Upload',
          icon : this.path + 'icons/icon.png'
        });
      }
});