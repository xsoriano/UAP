
playlistMenu = null; // these are the menu containers
clipMenu = null;
bookmarkMenu = null;

currentPlaylist = null; // these are the current item/object
currentClip = null;
currentBookmark = null;

currentPlaylistIndex = null;
currentBookmarkIndex = null;
currentClipIndex = null;
playlists = []; // this will hold all the created playlists

dragging_thumb = false;

playing_clip = false;
interval_function = null;
clip_time_length_ms = null;
clip_time_played_ms = null; //Time of the currently selected clip, in milliseconds.

is_bookmark_selected = false;
selected_bookmark_identifier = null;
selectedPlaylist = null;
bookmark_time_start = null;
bookmark_time_end = null;
is_deselecting = false;

//var isLoadingMetadata = false;

$(document).ready(function() {
	playlistMenu = document.getElementById('playlists');
	clipMenu = document.getElementById('clips');
	bookmarkMenu = document.getElementById('bookmarks');
	MixTape.updateMenus();

	// get any params
	if ($.getUrlVar('')) {
	}
});


MixTape.setCurrentBookmark = function(bookmarkIndex){
	console.log(bookmarkIndex);
	if (bookmarkIndex >=  0){
		console.log("Setting current bookmark Have");
		currentBookmark = currentClip.bookmarks()[bookmarkIndex];
		console.log(currentClip.playlist());
		console.log(selectedPlaylist);
		if(currentClip.playlist() == selectedPlaylist){
			if(currentClip.source() == currentSrc){
				 if(selected_bookmark_identifier == null || selected_bookmark_identifier != currentBookmark.name()){
					selected_bookmark_identifier = currentClip.name() + "-" + currentBookmark.name();
					console.log(selected_bookmark_identifier);
					is_bookmark_selected = true;
					selectedPlaylist = currentClip.playlist();
					MixTape.adjustBookmarkMarkers();
				}
			}
		}
	}
	else{
		currentBookmark = null;
		//Gabrielj. Changing the source of an audio element takes some time, need this be blocked until that is finished.
		console.log("Setting current bookmark Null");
		/*
		while(isLoadingMetadata){
			console.log("Waiting on metadata");
		}
		*/
		if(currentClip.playlist() == selectedPlaylist){
			if(currentClip.source() == currentSrc){
				console.log('Changing bookmark stuff. False');
				if(currentBookmark == null && selected_bookmark_identifier != null && !is_deselecting){
					var isNewClip = true;
					for(var i = 0; i < currentClip.bookmarks().length; i++){
						currentBookmark = currentClip.bookmarks()[i];
						if(selected_bookmark_identifier == currentBookmark.name()){
							$('#' + currentBookmark.id()).addClass('active');
							$('#' + currentBookmark.id()).click(MixTape.deselect);
							isNewClip = false;
							break;
						}
					}
					//Must be a new clip, and no bookmark is selected
					if(isNewClip){
						selected_bookmark_identifier = null;
						is_bookmark_selected = false;
						is_deselecting = false;
						MixTape.adjustBookmarkMarkers();
					}
				} else {
					selected_bookmark_identifier = null;
					is_bookmark_selected = false;
					is_deselecting = false;
					MixTape.adjustBookmarkMarkers();
				}
				
			}
		}
	}
	currentBookmarkIndex = bookmarkIndex;
	return currentBookmark;
}

MixTape.setCurrentClip  = function(clipIndex){
	console.log('In setcurrentclip');

	currentClipIndex = clipIndex;
	var prevClip = currentClip;
	if (clipIndex >= 0){
		currentClip = currentPlaylist.clips()[clipIndex];
		console.log('Have set currentClip to something');
		console.log(currentClip);
		// also set the source to the correct file
		if (currentClip.bookmarks().length > 0){
			MixTape.setCurrentBookmark(-1);
		}
		else{
			MixTape.setCurrentBookmark(-1);
		}
	}
	else{
		console.log('Have set currentClip to null');
		MixTape.setCurrentBookmark(-1);
		currentClip = null;
	}
	
	if (prevClip != currentClip){
		
		//GABRIELJ COMMENT: This isn't necessary, because when a new clip is selected and the 'src' value is updated
		//a 'loaedmetadata' event fires, and the event listener added in player.js is triggered.
		// setCurrentClipPlayer();
	}
	
	return currentClip;
}

// this might change for usability, like take a playlistname instead?
MixTape.setCurrentPlaylist = function(playlistIndex){
	if (playlistIndex >= 0){
		currentPlaylist = playlists[playlistIndex];
		console.log(currentPlaylist);
		if (currentPlaylist.clips().length > 0){
			MixTape.setCurrentClip(0);
		}else{
			MixTape.setCurrentClip(-1);
		}	
	}
	else{
		MixTape.setCurrentClip(-1);
		MixTape.currentPlaylist = null;
	}
	currentPlaylistIndex = playlistIndex;
	return currentPlaylist;
}

MixTape.isPlaylistUsed = function(nameString){
	var isPlaylist = false;
	for(var i = 0; i < playlists.length; i++){
		if(playlists[i].name == nameString){
			isPlaylist = true;
		}
	}
	return isPlaylist;
}

//In theory this could be generalized for the previous one
MixTape.isNametUsed = function(itemBackend, nameString){
	var isName = false;
	if(itemBackend.type == 'playlist'){
			// the things on the playlist menu
			for(var i = 0; i < playlists.length; i++){
				if (nameString == playlists[i].name){
					isName = true
				}
			}
		}
		else if(itemBackend.type == 'clip'){
			// the things on the clip menu
			for(var i = 0; i < playlists[currentPlaylistIndex].clips.length; i++){
				if (nameString == playlists[currentPlaylistIndex].clips[i].name){
					// set the matching index
					isName = true
				}
			}
		}
		else if(itemBackend.type == 'bookmark'){
			// the things on the bookmark menu
			for(var i = 0; i < playlists[currentPlaylistIndex].clips[currentClipIndex].bookmarks.length; i++){
				if (nameString == playlists[currentPlaylistIndex].clips[currentClipIndex].bookmarks[i].name){
					// set the matching index
					isName = true
				}
			}
		}
		else{
			console.log('warning');
		}
	return isName;
}

MixTape.isCssIdValid = function(id) {
    re = /^[A-Za-z]+[\w\-\:\.]*$/
    return re.test(id)
}

	// good places to look
	// http://www.jque.re/plugins/version3/bootstrap.switch/
	// http://www.bootstraptoggle.com/
	// http://www.bootply.com/92189 (Manage/Listen)
	// http://www.jonathanbriehl.com/2014/01/17/vertical-menu-for-bootstrap-3/ (Vertical Menu)
	// http://earmbrust.github.io/bootstrap-window/ (windows for menu/editing?)
	// http://startbootstrap.com/template-overviews/simple-sidebar/ (hidden menus)
	// http://www.prepbootstrap.com/bootstrap-template/collapsepanels (collapsible?)


MixTape.setCurrentItemToNull = function(item){
	if (item != null){
		// add the active class
		if(item.classList.contains('playlist')){
			setCurrentPlaylist(-1);
		}
		else if(item.classList.contains('clip')){
			setCurrentClip(-1);

		}
		else if(item.classList.contains('bookmark')){
			setCurrentBookmark(-1);
		}
		else{
			console.log('warning');
		}
	}
}

checkMetadata = null;

// add to the menu a new item
// Needs to be modified!!
MixTape.addItemToMenu = function(menu, item){
	var menuul = menu.children[0].children[1];
	var itemContainer = document.createElement('li');
	var itemText = document.createElement('div');
	var itemSubmenu = document.createElement('ul');
	var itemPlay = document.createElement('a');
	var itemEdit = document.createElement('a');
	var itemRemove = document.createElement('a');
	var itemPlayIconBefore = document.createElement('span');	
	var itemEditIcon = document.createElement('span');
	var itemPlayIcon = document.createElement('span');
	var itemRemoveIcon = document.createElement('span');
	

	if(item.name().split('-')[0] == 'url'){
		itemText.innerHTML = item.url;
	}
	else{
		itemText.innerHTML = item.name();
	}
	itemPlayIconBefore.setAttribute('class', "glyphicon glyphicon-play music-item-play-icon");
	itemContainer.setAttribute('class', "list-group-item" + " " + item.type);
	itemSubmenu.setAttribute('class', "list-group-submenu");

	// itemEdit.setAttribute('data-backdrop','false');
	// itemEdit.setAttribute('data-toggle','modal');
	itemEdit.setAttribute('class', "list-group-submenu-item edit primary btn btn-default");
	itemPlay.setAttribute('class', "list-group-submenu-item play info btn btn-default");
	itemRemove.setAttribute('class', "list-group-submenu-item trash danger btn btn-default");
	itemEditIcon.setAttribute('class', "glyphicon glyphicon-pencil");
	itemPlayIcon.setAttribute('class', "glyphicon glyphicon-play");
	itemRemoveIcon.setAttribute('class', "glyphicon glyphicon-trash");
	

	$(itemRemove).click(function(e) {
		e.stopPropagation();	
		var selection = $(e.currentTarget.offsetParent.offsetParent);
		var removalMenu = menuul;
		var removalIndex = selection.index();
		var removalType = MixTape.getBackEndItem(selection[0]).type;
		var removalName = MixTape.getBackEndItem(selection[0]).name;
		
		var confirmationMessage;
		console.log(selection[0]);

		bootbox.confirm("Are you sure you want to remove " +  removalType + " " + removalName + "?", function(result) {
  			if (result){
  				MixTape.removeItemFromMenu(removalMenu,selection,removalIndex);
  			}
		});

		console.log('In remove');

	});

	$(itemPlayIconBefore).click(function(e) {
		// var name = ($(this).text()).trim();
		console.log('In play');
		var playClip = $(this).parent().parent();
		console.log(playClip);
		MixTape.deactivate(playClip[0]);
		MixTape.makeActive(playClip[0]);
		MixTape.updateMenus();	
		// console.log(playClip);
		MixTape.setCurrentClipPlayer();
		if (waitForMetadata){
			checkMetadata = setInterval(function () {MixTape.playWhenMetadataLoaded(e)}, 250);
		}else{
			MixTape.togglePlay(e);
		}
		
	});

	itemRemove.appendChild(itemRemoveIcon);

	itemEdit.appendChild(itemEditIcon);
	MixTape.addBookmarkEditorFunctionality($(itemEdit))

	itemPlay.appendChild(itemPlayIcon);

	itemSubmenu.appendChild(itemEdit);
	itemSubmenu.appendChild(itemPlay);
	itemSubmenu.appendChild(itemRemove);

 	itemText.insertBefore(itemPlayIconBefore,itemText.childNodes[0]);
	itemContainer.appendChild(itemText);



	$(itemContainer).hover(function(e){
		$(itemText).children( "span" ).css( "visibility", "visible");
	}, function(e) {
    $(itemText).children( "span" ).css( "visibility", "hidden");
  });

	itemContainer.appendChild(itemSubmenu);

	var tag = menu.id + '-' + item.id();
		// console.log(item);
		// console.log(item.id());
		if(item.dbId){
			tag = item.id();
		}
		else{
			item.setId(tag);
		}
		
		// console.log(item.id());
		// console.log(tag);

	itemContainer.setAttribute('id', tag);
	
	var clicks = 0, timeOut = 200;
	$(itemContainer).bind('click', function(e) {
		clicks++;
		MixTape.deactivate(this);
		MixTape.makeActive(this);
		setTimeout(function() {
	      if (clicks == 1){
	      	MixTape.updateMenus();
	      }      
	    }, timeOut);
		console.log('clicked on item');
		console.log(this);
	});

	$(itemContainer).bind('dblclick', function(e) {
		//isLoadingMetadata = true;
		//console.log("isLoadingMetadata set to true!");
		console.log('Before Setting the current Clip')
		MixTape.setCurrentClipPlayer();
		MixTape.updateMenus();
		document.getElementById('inputStartTime').value = '';
        document.getElementById('inputEndTime').value = '';
		clicks = 0;
		console.log('doubleclick on item');
	});


	
	menuul.appendChild(itemContainer);

	var currentItem;
	if (item.type == 'playlist') currentItem = currentPlaylist;
	else if (item.type == 'clip') currentItem = currentClip;
	else if (item.type == 'bookmark') currentItem = currentBookmark;
	
	if (currentItem){
		if (item.dbId == currentItem.dbId){
			$('#' + itemContainer.id).addClass('active');
			if (item.type = 'bookmark') $('#' + itemContainer.id).click(MixTape.deselect);
		}
	}

	// // change it to active if the active current clip or playlist
	// if (item == currentPlaylist){
	// 	$('#' + itemContainer.id).addClass('active');
	// }
	// else if (item == currentClip){
	// 	console.log('Getting to set active.........!');
	// 	$('#' + itemContainer.id).addClass('active');
	// }
	// else if (item == currentBookmark){
	// 	$('#' + itemContainer.id).addClass('active');
	// 	$('#' + itemContainer.id).click(MixTape.deselect);
	// }
}

MixTape.deselect = function(bookmark){
	$('#' + bookmark.id).removeClass('active');
	is_deselecting = true;
	MixTape.setCurrentBookmark(-1);
	MixTape.updateMenus();
}

MixTape.playWhenMetadataLoaded= function(e){
	if (!waitForMetadata){
		clearInterval(checkMetadata);
		MixTape.togglePlay(e);
	}
		
}

// Always call updateMenus afterwards, to have control of when the front end is going to change
// update the currentIndex
MixTape.makeActive = function(item){
	if (item != null){
		// add the active class
		$('#' + item.id).addClass('active');
		// figure out the active class to update
		if(item.classList.contains('playlist')){
			// the things on the playlist menu
			for(var i = 0; i < playlists.length; i++){
				if (item.id == playlists[i].id){
					MixTape.setCurrentPlaylist(i);
				}
			}
		}
		else if(item.classList.contains('clip')){
			// the things on the clip menu
			for(var i = 0; i < playlists[currentPlaylistIndex].clips().length; i++){
				if (item.id == playlists[currentPlaylistIndex].clips()[i].id()){
					// set the matching index
					MixTape.setCurrentClip(i);
				}
			}
		}
		else if(item.classList.contains('bookmark')){
			// the things on the bookmark menu
			for(var i = 0; i < playlists[currentPlaylistIndex].clips()[currentClipIndex].bookmarks().length; i++){
				if (item.id == playlists[currentPlaylistIndex].clips()[currentClipIndex].bookmarks()[i].id()){
					// set the matching index
					MixTape.setCurrentBookmark(i);
				}
			}
		}
		else{
			console.log('warning');
		}
	}
	// Change by Xavier. Call updateMenus afterwards, to have control of when the front end is going to change
	// update the currentIndex
}

MixTape.deactivate = function(item){
	if(item != null){
		// figure out which items need to be deactivated
		var type;
		if(item.classList.contains('playlist')){
			type = 'playlist';
		}
		else if(item.classList.contains('clip')){
			type = 'clip';
		}
		else if(item.classList.contains('bookmark')){
			type = 'bookmark';
		}
		else{
			console.log('warning');
		}
		// get the items of that class and make them all not active
		$('.' + type).removeClass('active');
	}
}

MixTape.removeItemFromMenu = function(removalMenu, item, removalIndex){	
	var newSelection = null;
	
	//Removing the backend component
	var removalBackEnd = MixTape.getBackEndItem(item[0]);
	if(removalBackEnd.type == 'bookmark'){
		MixTape.deselect(removalBackEnd);
	}
	var isCurrentlyPlayedClip = (removalBackEnd.src == currentSrc);
	var isContainerPlatlist = false;
	if (removalBackEnd.type == 'playlist'){
		if (removalBackEnd.clips.indexOf(currentClip)>=0){
			isContainerPlatlist = true;
		}
	}

	removalBackEnd.remove();
	
	if(item[0].classList.contains('playlist')){		
		index = playlists.indexOf(removalBackEnd);
		if (index > -1) {
    		playlists.splice(index, 1);
		}
	}
	
	//Getting the item that will be selected after deletion.
	if($(removalMenu).children()[removalIndex + 1] != null){	
		newSelection = $(removalMenu).children()[removalIndex + 1];
	}else if (($(removalMenu).children()[removalIndex - 1] != null)){
		newSelection = $(removalMenu).children()[removalIndex - 1];
	}else{
		MixTape.setCurrentItemToNull(item[0]);
	}
	//Setting new selection
	MixTape.deactivate(newSelection);
	MixTape.makeActive(newSelection);
	MixTape.updateMenus();
	

	//If the removed clip is playing, the src should be reset. Also need to check if it is contained 
	// a removed playlist.
	if (isContainerPlatlist || isCurrentlyPlayedClip){
		MixTape.setCurrentClipPlayer();
		document.getElementById('bookmark_marker_start').style.visibility = 'hidden';
		document.getElementById('bookmark_marker_end').style.visibility = 'hidden';
		document.getElementById('bookmark_time_end').style.visibility = 'hidden';
		document.getElementById('bookmark_time_start').style.visibility = 'hidden';	
	}
	

}


MixTape.updateMenus = function(){
	$('.list-group-item').remove();

	// iterate through all the playlists and add the clips
	for(var p = 0; p < playlists.length; p++){
		MixTape.addItemToMenu(playlistMenu, playlists[p]);
	}
	if (currentPlaylist != null){
		if (currentPlaylist.clips() != null){
		// add all the active clips
		for(var c = 0; c < currentPlaylist.clips().length; c++){
			MixTape.addItemToMenu(clipMenu, currentPlaylist.clips()[c]);
		}
		if (currentClip != null){
			if (currentClip.bookmarks() != null){
			//add all the active bookmarks
			console.log(currentClip.bookmarks());
			for(var b = 0; b < currentClip.bookmarks().length; b++){
				MixTape.addItemToMenu(bookmarkMenu, currentClip.bookmarks()[b]);
			}
		}
		}

	}
	
	}
	
	// make things sortable
	$('.list-group').sortable();
	$('.list-group').disableSelection();
	$('.list-group').on('sortupdate', MixTape.reorderBackend);

}

MixTape.reorderBackend = function(event, ui){
	// figure out which clip has changed position
	var item = ui.item[0];
	var holder;
	// figure out which part of the backend needs to be updated
	if(item.classList.contains('playlist')){
		// the things on the playlist menu
		for(var i = 0; i < playlists.length; i++){
			if (item.id == playlists[i].id){
				// temporarily remove from the old backend list
				holder = playlists.splice(i,1);
				break;
			}
		}
		// insert into the backend where it is now
		var currentOrder = document.getElementById('playlists').getElementsByClassName('playlist');
		for(var i = 0; i < currentOrder.length; i++){
			if(item.id == currentOrder[i].id){
				playlists.splice(i, 0, holder[0]);
				break;
			}
		}

	}
	else if(item.classList.contains('clip')){
		// the things on the clip menu
		for(var i = 0; i < playlists[currentPlaylistIndex].clips.length; i++){
			if (item.id == playlists[currentPlaylistIndex].clips[i].id){
				// temporarily remove from the old backend list
				holder = playlists[currentPlaylistIndex].clips.splice(i,1);
				break;
			}
		}
		// insert into the backend where it is now
		var currentOrder = document.getElementById('clips').getElementsByClassName('clip');
		for(var i = 0; i < currentOrder.length; i++){
			if(item.id == currentOrder[i].id){
				playlists[currentPlaylistIndex].clips.splice(i, 0, holder[0]);
				break;
			}
		}
	}
	else if(item.classList.contains('bookmark')){
		// the things on the bookmark menu
		for(var i = 0; i < playlists[currentPlaylistIndex].clips[currentClipIndex].bookmarks.length; i++){
			if (item.id == playlists[currentPlaylistIndex].clips[currentClipIndex].bookmarks[i].id){
				// temporarily remove from the old backend list
				holder = playlists[currentPlaylistIndex].clips[currentClipIndex].bookmarks.splice(i,1);
				break;
			}
		}
		// insert into the backend where it is now
		var currentOrder = document.getElementById('bookmarks').getElementsByClassName('bookmark');
		for(var i = 0; i < currentOrder.length; i++){
			if(item.id == currentOrder[i].id){
				playlists[currentPlaylistIndex].clips[currentClipIndex].bookmarks.splice(i, 0, holder[0])
				break;
			}
		}
	}
	else{
		console.log('warning');
	}
}