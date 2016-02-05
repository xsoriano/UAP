var waitForNewCLip = null;
preClipsDB = new Mongo.Collection(null);

$.validator.addMethod("noRepeatedPreClipNames", function(value, element) {
	return !(preClipsDB.find({name : value}).count()>0);
  
}, "A clip with this name already exists.");

$.validator.addMethod("noRepeatedPlaylistNames", function(value, element) {
	return !(playlistsDB.find({name : value, owner : Meteor.userId()}).count()>0);
  
}, "A playlist with this name already exists.");

// everything that is dealing with or updating the new playlist dialog is going in here...


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
        	addURLClipToAddedClips(validator);
        	
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
        	createNewPlaylist($('#recipient-playlist-name').val(),$('#playlist-notes').val());
        	$('#np-top-btn-close').trigger('click');     	
        }
    });

});

Template.newPlaylist.events({
	'click #show-add': function (e) {
		e.preventDefault();
		$(e.currentTarget).blur();
		$(e.currentTarget).toggleClass('active');
		if ($(e.currentTarget).hasClass('active')){
			Session.set('adding_new_clip',true);
			Session.set('error_new_clip',false);
		}else{
			Session.set('adding_new_clip',false);
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
    }
});


Template.newPlaylist.helpers({
	waitForNewCLip: function () {
		return Session.get('wait_for_new_clip');
	},

	addingNewClip: function () {
		return Session.get('adding_new_clip');
	},

	'preClip': function(){
		return preClipsDB.find({owner:Meteor.userId()},{sort: {rank: 1}});
	},
});


$(document).ready(function() {
	Session.set('wait_for_new_clip',false);
	Session.set('adding_new_clip',false);
	var new_clip_audio = document.getElementById('new-clip-audio');
	var new_clip_source = document.getElementById('new-clip-source');

	
	new_clip_audio.addEventListener('loadedmetadata', function() {
		console.log('loadedmetadata');
		Session.set('wait_for_new_clip',false);
	});

	new_clip_source.addEventListener('error', function() {
		console.log('error');
		Session.set('error_new_clip',true);
	});
});

function addURLClipToAddedClips(validator){	
	var clipName = $('#clip-name').val();
	var clipURL = $('#clip-url').val();
	var clipNotes = $('#clip-notes').val();
	Session.set('wait_for_new_clip',true);
	Session.set('error_new_clip',false);
	$('#new-clip-source').attr('src', clipURL);
	var new_clip_audio = document.getElementById('new-clip-audio');
	new_clip_audio.load();
	if (waitForNewCLip) clearInterval(waitForNewCLip);
	waitForNewCLip = setInterval(function () {
		if (!Session.get('wait_for_new_clip')){
			clearInterval(waitForNewCLip);
			var duration = new_clip_audio.duration;
			createPreClip(clipName, clipURL, clipNotes, duration);
			$('#add-clip-panel')[0].reset();
		}
		else if(Session.get('error_new_clip')){
			clearInterval(waitForNewCLip);
			Session.set('wait_for_new_clip',false);
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
	Session.set('error_new_clip',false);
	// MixTape.fillDummyDialog();
}


// add to the menu a new item
// Needs to be modified!!
MixTape.addItemToDialog = function(computer, item, matching, func){
	var itemContainer = document.createElement('li');
	var itemText = document.createElement('span');

	itemText.innerHTML = item;
	itemContainer.setAttribute('class', "list-group-item btn btn-default");
	itemContainer.setAttribute('onClick', func);
	itemContainer.setAttribute('id', item.split(' ').join('_') + matching);
	itemContainer.appendChild(itemText);

	computer.appendChild(itemContainer);
}

// toggle it active and also add to the other side of the menu
MixTape.selectMusic= function(button){
	$(button).toggleClass('active');  
	button.setAttribute('onClick', 'MixTape.removeMatching(this)');

	var otherMenu = document.getElementById('np-added-container');
	MixTape.addItemToDialog(otherMenu, button.firstChild.innerHTML, '-matching', 'MixTape.removeMusic(this)');
}

MixTape.removeMatching= function(button){
	document.getElementById(button.id + '-matching').remove();
	$(button).toggleClass('active');
	document.getElementById(button.id).setAttribute('onClick', 'MixTape.selectMusic(this)');
}

MixTape.removeMusic= function(button){
	button.remove();
	// find partner and toggle the active and give back the function
	var otherid = button.id.split('-');
	otherid.pop();
	otherid = otherid.join('-');
	var otheritem = document.getElementById(otherid);
	otheritem.setAttribute('onClick', 'MixTape.selectMusic(this)');
	$('#' + otherid).toggleClass('active');
}

//This is the previous way
MixTape.savePlaylists = function(){
console.log('Debugging the save playlist');
	if ($('#newPlaylistWindow').hasClass('in')){
		// this means the the dialog was actually open and to carry out the save action
		$('#newPlaylistWindow').modal('hide'); // close the dialog box
		var clipsToAdd = document.getElementById('np-added-container').getElementsByClassName('btn'); // id has the clip name?
		var playlistName = document.getElementById('recipient-name').value;

		if (playlistName == ''){
			playlistName = 'Playlist ' + (playlists.length + 1).toString();
		}
		// check to see if that playlist name already exists
		if (MixTape.isPlaylistUsed(playlistName)){
			playlistName = playlistName + '-1';
		}
		document.getElementById('recipient-name').value = '';
		var playlist = new Playlist().init_new(playlistName);
		for (var i = 0; i < clipsToAdd.length; i++){
			// do the check for url
			var clip;
			if($('#' + clipsToAdd[i].id).hasClass('url')){
				var name = Math.random().toString(36).substr(2,5);
				clip = new Clip().init_url_playlist('url-' + name, clipsToAdd[i].textContent, playlist);
			}
			else{
				var name = clipsToAdd[i].textContent;
				//clip = new Clip().init_new(name, playlist, 'https://learning-modules.mit.edu/service/materials/groups/103456/files/446a5b18-80fd-4c9d-98c8-16f2c3e90977/link?errorRedirect=%2Fmaterials%2Findex.html')
				clip = new Clip().init_new(name, playlist, 'http://mit.edu/xsoriano/www/music/' + name + '.mp3');
			}
			// clip.addSrc();
			//playlist.addClip(clip);
		}
		// add a new playlist for now
		// checking should be implemented
		playlists.push(playlist);
		MixTape.setCurrentPlaylist(playlists.length - 1);
		console.log(clipsToAdd.length);
		if (clipsToAdd.length > 0){
			MixTape.setCurrentClip(0);
		}
		MixTape.updateMenus();
		MixTape.makeActive(document.getElementById(playlists[playlists.length - 1].id()));
		if (clipsToAdd.length > 0){
			MixTape.makeActive(document.getElementById(playlists[playlists.length - 1].clips[0].id()));
		}
	}
}

MixTape.savePlaylist = function(){
	if ($('#newPlaylistWindow').hasClass('in')){
		// this means the the dialog was actually open and to carry out the save action
		$('#newPlaylistWindow').modal('hide'); // close the dialog box
		var playlistName = document.getElementById('recipient-name').value;

		if (playlistName == ''){
			playlistName = 'Playlist ' + (playlists.length + 1).toString();
		}
		// check to see if that playlist name already exists
		if (MixTape.isPlaylistUsed(playlistName)){
			playlistName = playlistName + '-1';
		}
		document.getElementById('recipient-name').value = '';
		var playlist = new Playlist().init_new(playlistName);
		for (var i = 0; i < addedClips.length; i++){
			// do the check for url
			addedClips[i].add(playlist);
		}
		// add a new playlist for now
		// checking should be implemented
		playlists.push(playlist);
		MixTape.setCurrentPlaylist(playlists.length - 1);
		if (addedClips.length > 0){
			MixTape.setCurrentClip(0);
		}
		MixTape.updateMenus();
		MixTape.makeActive(document.getElementById(playlists[playlists.length - 1].id()));
		if (addedClips.length > 0){
			MixTape.makeActive(document.getElementById(playlists[playlists.length - 1].clips()[0].id()));
		}
		addedClips.splice(0,addedClips.length)
	}
}

MixTape.insertURL= function(url){
	var otherMenu = document.getElementById('np-added-container');
	addDummyURL(otherMenu, url.value);
	var otherMenu = document.getElementById('ep-added-container');
	addDummyURL(otherMenu, url.value);
	url.value = '';
}
MixTape.addDummyURL= function(menu, url){
	var itemContainer = document.createElement('li');
	var itemText = document.createElement('span');

	itemText.innerHTML = url;
	itemContainer.setAttribute('class', "list-group-item btn btn-default url");
	itemContainer.setAttribute('onClick', 'removeMusic(this)');
	var name = Math.random().toString(36).substr(2,5);
	itemContainer.setAttribute('id', 'dummy-url-' + name);
	itemContainer.appendChild(itemText);

	menu.appendChild(itemContainer);
}


// on closing without saving
MixTape.clearPlaylistModal = function(){
	preClipsDB.remove({});
	$('#show-add').removeClass('active');
	$('#add-playlist-form')[0].reset();
	$('#playlist-notes').val('');
	Session.set('adding_new_clip', false);
}