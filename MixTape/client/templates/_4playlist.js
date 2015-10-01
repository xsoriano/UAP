// everything that is dealing with or updating the new playlist dialog is going in here...

  // This code only runs on the client
  console.log("hello client!");
  Template.topBanner.events({
  	'click #topBanner-newPlaylistBtn': function(){
       newPlaylist();
       //  $('#newPlaylistWindow').modal('show'); // call rachel's playlist dialog
      	// fillDummyDialog();
    }
  });


  Template.topBanner.helpers({

    
  });




newPlaylist = function () {
	$('#newPlaylistWindow').modal('show'); // call rachel's playlist dialog
	fillDummyDialog();
}
// add to the menu a new item
// Needs to be modified!!
addItemToDialog = function (computer, item, matching, func){
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
selectMusic = function(button){
	$(button).toggleClass('active');  
	button.setAttribute('onClick', 'removeMatching(this)');

	var otherMenu = document.getElementById('np-added-container');
	addItemToDialog(otherMenu, button.firstChild.innerHTML, '-matching', 'removeMusic(this)');
}

removeMatching = function(button){
	document.getElementById(button.id + '-matching').remove();
	$(button).toggleClass('active');
	document.getElementById(button.id).setAttribute('onClick', 'selectMusic(this)');
}

removeMusic = function(button){
	button.remove();
	// find partner and toggle the active and give back the function
	var otherid = button.id.split('-');
	otherid.pop();
	otherid = otherid.join('-');
	var otheritem = document.getElementById(otherid);
	otheritem.setAttribute('onClick', 'selectMusic(this)');
	$('#' + otherid).toggleClass('active');
}

savePlaylists = function(){
// <<<<<<< HEAD
// =======
if ($('#newPlaylistWindow').hasClass('in')){
		// this means the the dialog was actually open and to carry out the save action
		$('#newPlaylistWindow').modal('hide'); // close the dialog box
		var clipsToAdd = document.getElementById('np-added-container').getElementsByClassName('btn'); // id has the clip name?
		var playlistName = document.getElementById('recipient-name').value;
// >>>>>>> 475ac56e30c701aa0a67f0c46185b13d5a0f7478
if (playlistName == ''){
	playlistName = 'Playlist ' + (playlists.length + 1).toString();
}
		// check to see if that playlist name already exists
		if (isPlaylistUsed(playlistName)){
			playlistName = playlistName + '-1';
		}
		document.getElementById('recipient-name').value = '';
		var playlist = new Playlist().init_name(playlistName);
		for (var i = 0; i < clipsToAdd.length; i++){
			// do the check for url
			var clip;
			if($('#' + clipsToAdd[i].id).hasClass('url')){
				var name = Math.random().toString(36).substr(2,5);
				clip = new Clip().init_url_playlist('url-' + name, clipsToAdd[i].textContent, playlist);
			}
			else{
				clip = new Clip().init_name_playlist(clipsToAdd[i].textContent, playlist);
			}
			clip.addSrc('music/' + clip.name + '.mp3');
			playlist.addClip(clip);
		}
		// add a new playlist for now
		// checking should be implemented
		playlists.push(playlist);
		setCurrentPlaylist(playlists.length - 1);
		if (clipsToAdd.length > 0){
			setCurrentClip(0);
		}
		updateMenus();
		makeActive(document.getElementById(playlists[playlists.length - 1].id));
		if (clipsToAdd.length > 0){
			makeActive(document.getElementById(playlists[playlists.length - 1].clips[0].id));
		}
	}
}

insertURL = function(url){
	var otherMenu = document.getElementById('np-added-container');
	addDummyURL(otherMenu, url.value);
	var otherMenu = document.getElementById('ep-added-container');
	addDummyURL(otherMenu, url.value);
	url.value = '';
}

addDummyURL = function(menu, url){
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
clearPlaylistModal = function(){
	$('#np-added-container .list-group-item').remove();
	$('#newPlaylistWindow').find('form')[0].reset();
}