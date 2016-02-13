var nc_waitForNewCLip = null;

$.validator.addMethod("noRepeatedClipNames", function(value, element) {
	var selectedPlaylist = Session.get('SELECTED_NC_PLAYLIST_KEY');
	return !(clipsDB.find({name : value, playlist: selectedPlaylist, owner : Meteor.userId()}).count()>0);
  
}, "A clip with this name already exists.");


Template.newClip.onRendered(function(){
    var validator = $('#nc-add-clip-form').validate({
        rules: {
            name: {
                required: true,
                noRepeatedClipNames: true,
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
                required: "You must enter a clip name.",
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
        	createNewClip($('#nc-name').val(), $('#nc-playlist').val(), $('#nc-url').val(), $('#nc-notes').val(), validator);
        	
        }
    });
});

Template.newClip.helpers({
	'playlist': function(){
		return playlistsDB.find({owner:Meteor.userId()},{sort: {rank: 1}});
	},

	'isPlaylistSelected': function(){
		return Session.equals('SELECTED_NC_PLAYLIST_KEY', this._id) && 'selected';
	},

	waitForNewCLip: function () {
		return Session.get('nc_wait_for_new_clip');
	},
});


Template.newClip.events({
	'change #nc-playlist': function (event) {
		var currentTarget = event.currentTarget;
		var newValue = currentTarget.options[currentTarget.selectedIndex].value;
		Session.set('SELECTED_NC_PLAYLIST_KEY', newValue);
  	},
  	'submit form': function(event){
		event.preventDefault();
    },
    'click .nc-close': function(event){
		clearNewClipModal();
	},
 });

MixTape.newClip = function() {
	$('#newClipWindow').modal('show'); 
	Session.set('nc_error_new_clip',false);
	var activePlaylist = Session.get('ACTIVE_PLAYLIST_KEY');
	if(activePlaylist){
		Session.set('SELECTED_NC_PLAYLIST_KEY', activePlaylist);
	}
}

function clearNewClipModal(){
	$('#nc-add-clip-form')[0].reset();
	Session.set('nc_error_new_clip',false);
	Session.set('SELECTED_NC_PLAYLIST_KEY', null);
}

function createNewClip(clipName, clipPlaylist, clipURL, clipNotes, validator){	
	Session.set('nc_wait_for_new_clip',true);
	Session.set('nc_error_new_clip',false);
	$('#nc-source').attr('src', clipURL);
	var nc_audio = document.getElementById('nc-audio');
	nc_audio.load();
	if (nc_waitForNewCLip) clearInterval(nc_waitForNewCLip);
	nc_waitForNewCLip = setInterval(function () {
		if (!Session.get('nc_wait_for_new_clip')){
			clearInterval(nc_waitForNewCLip);
			var clipDuration = nc_audio.duration;
			var clipRank = (clipsDB.find().count()>0) ? (clipsDB.findOne({playlist: clipPlaylist}, {sort: {rank: -1}}).rank + 0.05) : 0;
			clipsDB.insert({
				owner : Meteor.userId(),
				name : clipName,
				playlist: clipPlaylist,
				source : clipURL,
				rank : clipRank,
				notes: clipNotes,
				duration: clipDuration
			});
			clearNewClipModal();
		}
		else if(Session.get('nc_error_new_clip')){
			clearInterval(nc_waitForNewCLip);
			Session.set('nc_wait_for_new_clip',false);
			validator.showErrors({
            	url: "Unable play the audio in the provided URL."   
        	});
		}
	}, 250);
}

function createPreClip(clipName, clipURL, clipNotes, clipDuration){
	//you just need a higher rank, not necessarily integral.
	var clipRank = (preClipsDB.find().count()>0) ? (preClipsDB.findOne({}, {sort: {rank: -1}}).rank + 0.05) : 0;
	preClipsDB.insert({
		owner : Meteor.userId(),
		name : clipName,
		url : clipURL,
		rank : clipRank,
		notes: clipNotes,
		duration: clipDuration
	});
}

$(document).ready(function() {
	Session.set('nc_wait_for_new_clip',false);
	var new_clip_audio = document.getElementById('nc-audio');
	var new_clip_source = document.getElementById('nc-source');

	
	new_clip_audio.addEventListener('loadedmetadata', function() {
		console.log('loadedmetadata');
		Session.set('nc_wait_for_new_clip',false);
	});

	new_clip_source.addEventListener('error', function() {
		console.log('error');
		Session.set('nc_error_new_clip',true);
	});
});