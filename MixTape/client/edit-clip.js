var ec_waitForNewCLip = null;

$.validator.addMethod("noRepeatedEditingClipNames", function(value, element) {
	var editingClipKey = Session.get('EDITING_CLIP_KEY');
	var selectedPlaylist = Session.get('SELECTED_EC_PLAYLIST_KEY');
	var editingClip = clipsDB.findOne({_id : editingClipKey});
	if (editingClip.name == value){
		return true;
	}else{
		return !(clipsDB.find({name : value, playlist: selectedPlaylist, owner : Meteor.userId()}).count()>0);
	}
	
  
}, "Another clip with this name already exists in this playlist.");

Template.editClip.helpers({
	'clip': function(){
		var selectedPlaylist = Session.get('SELECTED_SHOW_PLAYLIST_KEY');
		return clipsDB.find({playlist: selectedPlaylist, owner:Meteor.userId()},{sort: {rank: 1}});
	},
	'activeClass': function(){
		return Session.equals("EDITING_CLIP_KEY", this._id) && 'active';
	},
	'disabledClass': function(){
		return !Session.get("EDITING_CLIP_KEY") && 'disabled';
	},
	'playlist': function(){
		return playlistsDB.find({owner:Meteor.userId()},{sort: {rank: 1}});
	},

	'isPlaylistSelected': function(){
		return Session.equals('SELECTED_EC_PLAYLIST_KEY', this._id) && 'selected';
	},

	'isShowPlaylistSelected': function(){
		return Session.equals('SELECTED_SHOW_PLAYLIST_KEY', this._id) && 'selected';
	},
	checkingClipSource: function () {
		return Session.get('EC_CHECKING_CLIP_SOURCE');
	},
});

Template.editClip.events({
	'mouseenter .ec-clip': function(event){
		$(event.target).find('.handle').css( "visibility", "visible");
	},

	'mouseleave .ec-clip': function(event){ 
		$(event.target).find('.handle').css( "visibility", "hidden");
	},

	'click .ec-clip': function(event){
		Session.set("EDITING_CLIP_KEY", this._id)
		$('#ec-name').val(this.name);
		var selectedPlaylist = Session.get('SELECTED_SHOW_PLAYLIST_KEY');
		Session.set('SELECTED_EC_PLAYLIST_KEY', selectedPlaylist);
		$('#ec-url').val(this.source);
		$('#ec-notes').val(this.notes);
	},

	'change #ec-playlist': function (event) {
		var currentTarget = event.currentTarget;
		var newValue = currentTarget.options[currentTarget.selectedIndex].value;
		Session.set('SELECTED_EC_PLAYLIST_KEY', newValue);
  	},

  	'change #show-playlist': function (event) {
		var currentTarget = event.currentTarget;
		var newValue = currentTarget.options[currentTarget.selectedIndex].value;
		Session.set('SELECTED_SHOW_PLAYLIST_KEY', newValue);
		Session.set("EDITING_CLIP_KEY", null);
		$('#edit-clip-form')[0].reset();
		Session.set('SELECTED_EC_PLAYLIST_KEY', null);
  	},

	'click #delete-clip-btn': function(event){
		deleteClip();
	},

	'click .ec-close': function(event){
		clearEditingClip();
	},

	'submit form': function(event){
		event.preventDefault();
    },

    'loadedmetadata #ec-audio': function(event){
		console.log('loadedmetadata');
		Session.set('EC_CHECKING_CLIP_SOURCE',false);
    },

    'error #ec-source': function(event){
		console.log('error');
		Session.set('EC_ERROR_CLIP_SOURCE',true);
    },
});

Template.editClip.onRendered(function() {
	this.$('#existingClips').sortable({
		stop: function(e, ui) {
  			reorderMenus(ui, clipsDB);
		},
		handle: '.handle' 
	});

	var validator = this.$('#edit-clip-form').validate({
        rules: {
        	 name: {
                noRepeatedEditingClipNames: true,
                required: true
            },
            playlist: {
            	required: true,
            },
            url: {
                required: true,
                url: true
            },
        },
        messages: {
        	name: {
                required: "You must enter a clip name."
            },
            playlist: {
                required: "You must select a playlist.",
            },
            url: {
                required: "You must enter a clip URL.",
                url: "Your must enter a valid URL."
            }
        },
        submitHandler: function(event){
        	var newName = $('#ec-name').val();
        	var newPlaylist = $('#ec-playlist').val();
        	var newURL = $('#ec-url').val();
        	var newNotes = $('#ec-notes').val();
        	updateEditingClip(newName,newPlaylist,newURL,newNotes,validator);
        	
        }
    });

	Session.set('EC_CHECKING_CLIP_SOURCE',false);
});



MixTape.editClip = function(){
	var activePlaylistKey = Session.get('ACTIVE_PLAYLIST_KEY');
	var activeClipKey = Session.get('ACTIVE_CLIP_KEY');
	Session.set('EDITING_CLIP_KEY',null)
	if(activePlaylistKey){
		Session.set('SELECTED_SHOW_PLAYLIST_KEY', activePlaylistKey)
		if(activeClipKey){
			Session.set('EDITING_CLIP_KEY', activeClipKey);
			var activeClip = clipsDB.findOne(activeClipKey);
			$('#ec-name').val(activeClip.name);
			Session.set('SELECTED_EC_PLAYLIST_KEY', activePlaylistKey);
			$('#ec-url').val(activeClip.source);
			$('#ec-notes').val(activeClip.notes);
		}
	}
	$('#editClipWindow').modal('show'); 
}

function updateEditingClip(name, playlist, url, notes, validator){
	Session.set('EC_CHECKING_CLIP_SOURCE',true);
	Session.set('EC_ERROR_CLIP_SOURCE',false);
	$('#ec-source').attr('src', url);
	var ec_audio = document.getElementById('ec-audio');
	ec_audio.load();
	if (ec_waitForNewCLip) clearInterval(ec_waitForNewCLip);
	ec_waitForNewCLip = setInterval(function () {
		if (!Session.get('EC_CHECKING_CLIP_SOURCE')){
			clearInterval(ec_waitForNewCLip);
			var duration = ec_audio.duration;
			var editingClip = Session.get('EDITING_CLIP_KEY')
			clipsDB.update(editingClip, {
		        $set: {name: name, playlist: playlist, source: url, duration:duration, notes: notes}
		      });
			bootbox.alert({
				title: "Confirmation",
				
				message: "Your changes were saved", 

				buttons: {
			        ok: {
			            label: 'Ok',
			            className: 'btn-default'
			        }
		    	},

				callback: function(){
					$('#edit-clip-form')[0].reset();
					Session.set('EC_CHECKING_CLIP_SOURCE', false);
					Session.set('EC_ERROR_CLIP_SOURCE',false);
					Session.set('EDITING_CLIP_KEY',null);
				},
			
			});
		}
		else if(Session.get('EC_ERROR_CLIP_SOURCE')){
			clearInterval(ec_waitForNewCLip);
			Session.set('EC_CHECKING_CLIP_SOURCE',false);
			validator.showErrors({
            	url: "Unable play the audio in the provided URL."   
        	});
		}
	}, 250);
	
}

function clearEditingClip(){
	$('#edit-clip-form')[0].reset();
	Session.set('EC_CHECKING_CLIP_SOURCE', false);
	Session.set('EC_ERROR_CLIP_SOURCE',false);
	Session.set('SELECTED_EC_PLAYLIST_KEY', null);
	Session.set('SELECTED_SHOW_PLAYLIST_KEY', null);
	Session.set('EDITING_CLIP_KEY',null);
}

function deleteClip(){
	bootbox.confirm({
		title: "Clip Deletion Confirmation",
		message: "Deleting this clip, will also delete all its bookmarks. This operation cannot be undone. Are you sure you want to delete this clip?", 

		buttons: {
	        'cancel': {
	            label: 'Cancel',
	            className: 'btn-default'
	        },
	        'confirm': {
	            label: 'Delete',
	            className: 'btn-danger'
	        }
    	},

		callback: function(result) {
			if (result){
				var toDeleteClipKey = Session.get('EDITING_CLIP_KEY');
				var clipBookmarks = bookmarksDB.find({clip:toDeleteClipKey}).fetch();
				for (var i = 0;  i < clipBookmarks.length; i++){
					var toDeleteBookmarkKey = clipBookmarks[i]._id;
					bookmarksDB.remove(toDeleteBookmarkKey);
				}
				clipsDB.remove(toDeleteClipKey);
				$('#edit-clip-form')[0].reset();
				if(Session.equals('CURRENT_CLIP_KEY', toDeleteClipKey)){
					Session.set('CURRENT_CLIP_KEY', null);
				}
				Session.set('EDITING_CLIP_KEY',null);

			}	
		},
	});

}