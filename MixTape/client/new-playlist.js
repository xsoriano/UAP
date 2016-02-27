var np_waitForNewCLip = null;
preClipsDB = new Mongo.Collection(null);

$.validator.addMethod("noRepeatedPreClipNames", function(value, element) {
	return !(preClipsDB.find({name : value}).count()>0);
  
}, "A clip with this name already exists.");

$.validator.addMethod("noRepeatedPlaylistNames", function(value, element) {
	return !(playlistsDB.find({name : value, owner : Meteor.userId()}).count()>0);
  
}, "A playlist with this name already exists.");


Template.addClipPanel.onRendered(function(){
    var validator = $('#add-clip-panel').validate({
        rules: {
            name: {
                required: true,
                noRepeatedPreClipNames: true
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
            url: {
                required: "You must enter a clip URL.",
                url: "Your must enter a valid URL."
            }
        },
        submitHandler: function(event){
        	addToPreClips(validator);
        	
        }
    });
});



Template.addClipPanel.events({
	'submit form': function(event){
		event.preventDefault();
    }
});

Template.newPlaylist.onRendered(function() {
	this.$('#addedPreClips').sortable({
		stop: function(e, ui) {
  			reorderMenus(ui, preClipsDB)
		},
		handle: '.handle' 
	});

	this.$('#add-playlist-form').validate({
        rules: {
            name: {
                required: true,
                noRepeatedPlaylistNames: true
            },
        },
        messages: {
            name: {
                required: "You must enter an playlist name."
            },
        },
        submitHandler: function(event){
        	console.log('submitted the playlist');
        	createNewPlaylist($('#recipient-playlist-name').val(),$('#np-playlist-notes').val());
        	$('#np-top-btn-close').trigger('click');     	
        }
    });

    Session.set('np_wait_for_new_clip',false);
	Session.set('np_adding_new_clip',false);

});

Template.newPlaylist.events({
	'click #show-add': function (e) {
		e.preventDefault();
		$(e.currentTarget).blur();
		$(e.currentTarget).toggleClass('active');
		if ($(e.currentTarget).hasClass('active')){
			Session.set('np_adding_new_clip',true);
			Session.set('np_error_new_clip',false);
		}else{
			Session.set('np_adding_new_clip',false);
		}
	},

	'mouseenter .preClip-item': function(event){
		$('#' + this._id + ' .remove').css( "visibility", "visible");
	},

	'mouseleave .preClip-item': function(event){ 
		$('#' + this._id + ' .remove').css( "visibility", "hidden");
	},

	'click .remove': function(event){
		preClipsDB.remove(this._id);
	},
	'submit form': function(event){
		event.preventDefault();
    },
    'loadedmetadata #np-new-clip-audio': function(event){
		console.log('loadedmetadata');
		Session.set('np_wait_for_new_clip',false);
    },
    'error #np-new-clip-source': function(event){
		console.log('error');
		Session.set('np_error_new_clip',true);
    }
});


Template.newPlaylist.helpers({
	waitForNewCLip: function () {
		return Session.get('np_wait_for_new_clip');
	},

	addingNewClip: function () {
		return Session.get('np_adding_new_clip');
	},

	'preClip': function(){
		return preClipsDB.find({owner:Meteor.userId()},{sort: {rank: 1}});
	},
});


function addToPreClips(validator){	
	var clipName = $('#np-clip-name').val();
	var clipURL = $('#np-clip-url').val();
	var clipNotes = $('#np-clip-notes').val();
	Session.set('np_wait_for_new_clip',true);
	Session.set('np_error_new_clip',false);
	$('#np-new-clip-source').attr('src', clipURL);
	var new_clip_audio = document.getElementById('np-new-clip-audio');
	new_clip_audio.load();
	if (np_waitForNewCLip) clearInterval(np_waitForNewCLip);
	np_waitForNewCLip = setInterval(function () {
		if (!Session.get('np_wait_for_new_clip')){
			clearInterval(np_waitForNewCLip);
			var duration = new_clip_audio.duration;
			createPreClip(clipName, clipURL, clipNotes, duration);
			$('#add-clip-panel')[0].reset();
		}
		else if(Session.get('np_error_new_clip')){
			clearInterval(np_waitForNewCLip);
			Session.set('np_wait_for_new_clip',false);
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

function createNewPlaylist(playlistName,playlistNotes){
	var playlistRank = (playlistsDB.find({owner: Meteor.userId()}).count()>0) ? playlistsDB.findOne({}, {sort: {rank: -1}}).rank + 0.05 : 0;
	playlistsDB.insert({
		owner : Meteor.userId(),
		name : playlistName,
		rank : playlistRank,
		notes: playlistNotes,
	});
	var playlistId = playlistsDB.findOne({}, {sort: {rank: -1}})._id;
	while(preClipsDB.find().count()>0){
		var preClip = preClipsDB.findOne({owner:Meteor.userId()}, {sort: {rank: 1}});
		clipsDB.insert({
			owner : Meteor.userId(),
			playlist: playlistId,
			name : preClip.name,
			source : preClip.url,
			rank : preClip.rank,
			notes: preClip.notes,
			duration: preClip.duration
		});
		preClipsDB.remove(preClip._id);
	}
}

MixTape.newPlaylist = function() {
	$('#newPlaylistWindow').modal('show'); 
	Session.set('np_error_new_clip',false);
}

MixTape.clearPlaylistModal = function(){
	preClipsDB.remove({});
	$('#show-add').removeClass('active');
	$('#add-playlist-form')[0].reset();
	$('#np-playlist-notes').val('');
	Session.set('np_adding_new_clip', false);
	Session.set('np_error_new_clip',false);
}

