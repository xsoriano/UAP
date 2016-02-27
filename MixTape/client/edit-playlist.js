////////////////////////////////////////////////////////////////////////
/// editing playlist dialog functions
///////////////////////////////////////////////////////////////////////

$.validator.addMethod("noRepeatedEditingPlaylistNames", function(value, element) {
	var editingPlaylistKey = Session.get('EDITING_PLAYLIST');
	var editingPlaylist = playlistsDB.findOne({_id : editingPlaylistKey});
	if (editingPlaylist.name == value){
		return true;
	}else{
		return !(playlistsDB.find({name : value, owner : Meteor.userId()}).count()>0);
	}
	
  
}, "Another playlist with this name already exists.");

Template.editPlaylist.helpers({
	'playlist': function(){
		return playlistsDB.find({owner:Meteor.userId()},{sort: {rank: 1}});
	},
	'activeClass': function(){
		return Session.equals("EDITING_PLAYLIST", this._id) && 'active';
	},
	'disabledClass': function(){
		return !Session.get("EDITING_PLAYLIST") && 'disabled';
	},
});

Template.editPlaylist.events({
	'mouseenter .ep-playlist': function(event){
		$(event.target).find('.handle').css( "visibility", "visible");
	},

	'mouseleave .ep-playlist': function(event){ 
		$(event.target).find('.handle').css( "visibility", "hidden");
	},

	'click .ep-playlist': function(event){
		Session.set("EDITING_PLAYLIST", this._id)
		$('#ep-name').val(this.name);
		$('#ep-notes').val(this.notes);
	},

	'click #delete-playlist-btn': function(event){
		deletePlaylist();
	},

	'click .ep-close': function(event){
		clearEditingPlaylist();
	},

	'submit form': function(event){
		event.preventDefault();
    }
});

Template.editPlaylist.onRendered(function() {
	this.$('#existingPlaylists').sortable({
		stop: function(e, ui) {
  			reorderMenus(ui, playlistsDB);
		},
		handle: '.handle' 
	});

	this.$('#edit-playlist-form').validate({
        rules: {
        	 name: {
                noRepeatedEditingPlaylistNames: true,
                required: true
            },
        },
        messages: {
        	name: {
                required: "You must enter a playlist name."
            },
        },
        submitHandler: function(event){
        	var newName = $('#ep-name').val();
        	var newNotes = $('#ep-notes').val();
        	updateEditingPlaylist(newName,newNotes);
        	
        }
    });

});


MixTape.editPlaylist = function(){
	var activePlaylistKey = Session.get('ACTIVE_PLAYLIST_KEY');
	Session.set('EDITING_PLAYLIST',null)
	if(activePlaylistKey){
		Session.set('EDITING_PLAYLIST', activePlaylistKey);
		var activePlaylist = playlistsDB.findOne(activePlaylistKey);
		$('#ep-name').val(activePlaylist.name);
		$('#ep-notes').val(activePlaylist.notes);
	}
	$('#editPlaylistWindow').modal('show'); 
}

function updateEditingPlaylist(name, notes){
	var editingPlaylist = Session.get('EDITING_PLAYLIST')
	playlistsDB.update(editingPlaylist, {
        $set: {name: name, notes: notes}
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

		callback: clearEditingPlaylist(),
	
	});
}

function clearEditingPlaylist(){
	$('#ep-name').val('');
	$('#ep-notes').val('');
	Session.set('EDITING_PLAYLIST',null);
}

function deletePlaylist(){
	bootbox.confirm({
		title: "Playlist Deletion Confirmation",
		message: "Deleting this playlist, will also delete all its clips and bookmarks. This operation cannot be undone. Are you sure you want to delete this playlist?", 

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
				var toDeletePlaylistKey = Session.get('EDITING_PLAYLIST');
				var playlistClips = clipsDB.find({playlist:toDeletePlaylistKey}).fetch();
				for (var i = 0;  i < playlistClips.length; i++){
					console.log(playlistClips[i]);
					var toDeleteClipKey = playlistClips[i]._id;
					var playlistBookmarks = bookmarksDB.find({clip:toDeleteClipKey}).fetch();
					for (var j = 0;  j < playlistBookmarks.length; j++){
						var toDeleteBookmarkKey = playlistBookmarks[j]._id;
						bookmarksDB.remove(toDeleteBookmarkKey);
					}
					clipsDB.remove(toDeleteClipKey);
				}
				playlistsDB.remove(toDeletePlaylistKey);
				clearEditingPlaylist();
			}	
			$('#editPlaylistWindow').modal('show');
		},
	});
}



$(document).ready(function() {
	$(document).on('hidden.bs.modal', function (e) {
      	if($('.modal.in').length>0){
        	$('body').addClass('modal-open');
      	}
     
    });
});