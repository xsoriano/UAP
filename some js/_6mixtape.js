
var playlistMenu; // these are the menu containers
var clipMenu;
var bookmarkMenu;

var currentPlaylist = 0; // these are the current item/object
var currentClip;
var currentBookmark;

var currentPlaylistIndex;
var currentBookmarkIndex;
var currentClipIndex;
var playlists = []; // this will hold all the created playlists

var dragging_thumb = false;

var playing_clip = false;
var interval_function;
var clip_time_length_ms;
var clip_time_played_ms; //Time of the currently selected clip, in milliseconds.

var is_bookmark_selected = false;
var selected_bookmark_identifier = null;
var selectedPlaylist = null;
var bookmark_time_start;
var bookmark_time_end;
var is_deselecting = false;

//var isLoadingMetadata = false;

$(document).ready(function() {
	playlistMenu = document.getElementById('playlists');
	clipMenu = document.getElementById('clips');
	bookmarkMenu = document.getElementById('bookmarks');
	updateMenus();

	// get any params
	if ($.getUrlVar('')) {
	}
});


function setCurrentBookmark(bookmarkIndex){
	if (bookmarkIndex >=  0){
		console.log("Setting current bookmark Have");
		currentBookmark = currentClip.bookmarks[bookmarkIndex];
		console.log(currentBookmark.name);
		if(currentClip.playlist == selectedPlaylist){
			if(currentClip.src == currentSrc){
				 if(selected_bookmark_identifier == null || selected_bookmark_identifier != currentBookmark.name){
					selected_bookmark_identifier = currentClip.name + "-" + currentBookmark.name;
					console.log(selected_bookmark_identifier);
					is_bookmark_selected = true;
					selectedPlaylist = currentClip.playlist;
					adjustBookmarkMarkers();
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
		if(currentClip.playlist == selectedPlaylist){
			if(currentClip.src == currentSrc){
				console.log('Changing bookmark stuff. False');
				if(currentBookmark == null && selected_bookmark_identifier != null && !is_deselecting){
					var isNewClip = true;
					for(var i = 0; i < currentClip.bookmarks.length; i++){
						currentBookmark = currentClip.bookmarks[i];
						if(selected_bookmark_identifier == currentBookmark.name){
							$('#' + currentBookmark.id).addClass('active');
							$('#' + currentBookmark.id).click(deselect);
							isNewClip = false;
							break;
						}
					}
					//Must be a new clip, and no bookmark is selected
					if(isNewClip){
						selected_bookmark_identifier = null;
						is_bookmark_selected = false;
						is_deselecting = false;
						adjustBookmarkMarkers();
					}
				} else {
					selected_bookmark_identifier = null;
					is_bookmark_selected = false;
					is_deselecting = false;
					adjustBookmarkMarkers();
				}
				
			}
		}
	}
	currentBookmarkIndex = bookmarkIndex;
	return currentBookmark;
}

function setCurrentClip(clipIndex){
	console.log('In setcurrentclip');
	currentClipIndex = clipIndex;
	var prevClip = currentClip;
	if (clipIndex >= 0){
		currentClip = currentPlaylist.clips[clipIndex];
		console.log('Have set currentClip to something');
		// also set the source to the correct file
		if (currentClip.bookmarks.length > 0){
			setCurrentBookmark(-1);
		}
		else{
			setCurrentBookmark(-1);
		}
	}
	else{
		console.log('Have set currentClip to null');
		setCurrentBookmark(-1);
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
function setCurrentPlaylist(playlistIndex){
	if (playlistIndex >= 0){
		currentPlaylist = playlists[playlistIndex];
		if (currentPlaylist.clips.length > 0){
			setCurrentClip(0);
		}else{
			setCurrentClip(-1);
		}	
	}
	else{
		setCurrentClip(-1);
		currentPlaylist = null;
	}
	currentPlaylistIndex = playlistIndex;
	return currentPlaylist;
}

function isPlaylistUsed(nameString){
	var isPlaylist = false;
	for(var i = 0; i < playlists.length; i++){
		if(playlists[i].name == nameString){
			isPlaylist = true;
		}
	}
	return isPlaylist;
}

//In theory this could be generalized for the previous one
function isNametUsed(itemBackend, nameString){
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

function isCssIdValid (id) {
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


function setCurrentItemToNull(item){
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

var checkMetadata;

// add to the menu a new item
// Needs to be modified!!
function addItemToMenu(menu, item){
	var menuul = menu.children[0].children[1];
	var itemContainer = document.createElement('li');
	var itemText = document.createElement('div');
	var itemSubmenu = document.createElement('ul');
	var itemPlay = document.createElement('a');
	var itemEdit = document.createElement('a');
	var itemRemove = document.createElement('a');	
	var itemEditIcon = document.createElement('span');
	var itemPlayIcon = document.createElement('span');
	var itemRemoveIcon = document.createElement('span');
	
	if(item.name.split('-')[0] == 'url'){
		itemText.innerHTML = item.url;
	}
	else{
		itemText.innerHTML = item.name;
	}
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
		var removalType = getBackEndItem(selection[0]).type;
		var removalName = getBackEndItem(selection[0]).name;
		
		var confirmationMessage;
		console.log(selection[0]);

		bootbox.confirm("Are you sure you want to remove " +  removalType + " " + removalName + "?", function(result) {
  			if (result){
  				removeItemFromMenu(removalMenu,selection,removalIndex);
  			}
		});

		console.log('In remove');

	});

	$(itemPlay).click(function(e) {
		// var name = ($(this).text()).trim();
		console.log('In play');
		var playClip = $(this).parent().parent();
		deactivate(playClip[0]);
		makeActive(playClip[0]);
		updateMenus();	
		// console.log(playClip);
		setCurrentClipPlayer();
		if (waitForMetadata){
			checkMetadata = setInterval(function () {playWhenMetadataLoaded(e)}, 250);
		}else{
			togglePlay(e);
		}
		
	});

	itemRemove.appendChild(itemRemoveIcon);

	itemEdit.appendChild(itemEditIcon);
	addBookmarkEditorFunctionality($(itemEdit))

	itemPlay.appendChild(itemPlayIcon);

	itemSubmenu.appendChild(itemEdit);
	itemSubmenu.appendChild(itemPlay);
	itemSubmenu.appendChild(itemRemove);

	itemContainer.appendChild(itemText);
	itemContainer.appendChild(itemSubmenu);

	var tag = menu.id + '-' + item.nospace;
	if(item.url){
		tag = item.id;
	}
	else{
		item.id = tag;
	}
	itemContainer.setAttribute('id', tag);
	
	var clicks = 0, timeOut = 200;
	$(itemContainer).bind('click', function(e) {
		clicks++;
		deactivate(this);
		makeActive(this);
		setTimeout(function() {
	      if (clicks == 1){
	      	updateMenus();
	      }      
	    }, timeOut);
		console.log('clicked on item');
		console.log(this);
	});

	$(itemContainer).bind('dblclick', function(e) {
		//isLoadingMetadata = true;
		//console.log("isLoadingMetadata set to true!");
		setCurrentClipPlayer();
		updateMenus();
		document.getElementById('inputStartTime').value = '';
        document.getElementById('inputEndTime').value = '';
		clicks = 0;
		console.log('doubleclick on item');
	});


	
	menuul.appendChild(itemContainer);

	// change it to active if the active current clip or playlist
	if (item == currentPlaylist){
		$('#' + itemContainer.id).addClass('active');
	}
	if (item == currentClip){
		$('#' + itemContainer.id).addClass('active');
	}
	if (item == currentBookmark){
		$('#' + itemContainer.id).addClass('active');
		$('#' + itemContainer.id).click(deselect);
	}
}

function deselect(bookmark){
	$('#' + bookmark.id).removeClass('active');
	is_deselecting = true;
	setCurrentBookmark(-1);
	updateMenus();
}

function playWhenMetadataLoaded(e){
	if (!waitForMetadata){
		clearInterval(checkMetadata);
		togglePlay(e);
	}
		
}

// Always call updateMenus afterwards, to have control of when the front end is going to change
// update the currentIndex
function makeActive(item){
	if (item != null){
		// add the active class
		$('#' + item.id).addClass('active');
		// figure out the active class to update
		if(item.classList.contains('playlist')){
			// the things on the playlist menu
			for(var i = 0; i < playlists.length; i++){
				if (item.id == playlists[i].id){
					setCurrentPlaylist(i);
				}
			}
		}
		else if(item.classList.contains('clip')){
			// the things on the clip menu
			for(var i = 0; i < playlists[currentPlaylistIndex].clips.length; i++){
				if (item.id == playlists[currentPlaylistIndex].clips[i].id){
					// set the matching index
					setCurrentClip(i);
				}
			}
		}
		else if(item.classList.contains('bookmark')){
			// the things on the bookmark menu
			for(var i = 0; i < playlists[currentPlaylistIndex].clips[currentClipIndex].bookmarks.length; i++){
				if (item.id == playlists[currentPlaylistIndex].clips[currentClipIndex].bookmarks[i].id){
					// set the matching index
					setCurrentBookmark(i);
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

function deactivate(item){
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

function removeItemFromMenu(removalMenu, item, removalIndex){	
	var newSelection = null;
	
	//Removing the backend component
	var removalBackEnd = getBackEndItem(item[0]);
	if(removalBackEnd.type == 'bookmark'){
		deselect(removalBackEnd);
	}
	var isCurrentlyPlayedClip = (removalBackEnd.src == currentSrc);
	var isContainerPlatlist = false;
	if (removalBackEnd.type == 'playlist'){
		console.log(removalBackEnd.clips.indexOf(currentClip));
		if (removalBackEnd.clips.indexOf(currentClip)>=0){
			isContainerPlatlist = true;
		}
	}
	console.log(isContainerPlatlist);
	console.log(isCurrentlyPlayedClip);
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
		setCurrentItemToNull(item[0]);
	}
	//Setting new selection
	deactivate(newSelection);
	makeActive(newSelection);
	updateMenus();
	

	//If the removed clip is playing, the src should be reset. Also need to check if it is contained 
	// a removed playlist.
	if (isContainerPlatlist || isCurrentlyPlayedClip){
		setCurrentClipPlayer();
		document.getElementById('bookmark_marker_start').style.visibility = 'hidden';
		document.getElementById('bookmark_marker_end').style.visibility = 'hidden';
		document.getElementById('bookmark_time_end').style.visibility = 'hidden';
		document.getElementById('bookmark_time_start').style.visibility = 'hidden';	
	}
	

}


function updateMenus(){
	$('.list-group-item').remove();
	console.log('update menus');

	// iterate through all the playlists and add the clips
	for(var p = 0; p < playlists.length; p++){
		addItemToMenu(playlistMenu, playlists[p]);
	}
	if (currentPlaylist != null){
		if (currentPlaylist.clips != null){
		// add all the active clips
		for(var c = 0; c < currentPlaylist.clips.length; c++){
			addItemToMenu(clipMenu, currentPlaylist.clips[c]);
		}
		if (currentClip != null){
			if (currentClip.bookmarks != null){
			//add all the active bookmarks
			for(var b = 0; b < currentClip.bookmarks.length; b++){
				addItemToMenu(bookmarkMenu, currentClip.bookmarks[b]);
			}
		}
		}

	}
	
	}
	
	// make things sortable
	$('.list-group').sortable();
	$('.list-group').disableSelection();
	$('.list-group').on('sortupdate', reorderBackend);

}

function reorderBackend(event, ui){
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