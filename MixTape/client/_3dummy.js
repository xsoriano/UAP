musicfiles = ['Clocking-I', 'Clocking-II', 'Foundry-TXST', 'MackeySopSaxCto-1-Prelude', 'MackeySopSaxCto-2-Felt', 'MackeySopSaxCto-3-Metal', 'MackeySopSaxCto-4-Wood', 'MackeySopSaxCto-5-Finale','NightOnFire', 'ShelteringSky-TXST', 'UNCGHymn'];
fileEnding = '.mp3';
folder = 'http://mit.edu/xsoriano/www/music';
dialogMenu = null;


MixTape.createDummyItems = function (){
	// generate the playlists (Doing Playlist 1 & Playlist 2)
	var playlists = [];
	var playlist1 = new Playlist().init_name('Mackey');
	playlists.push(playlist1);

	// add clips to the playlists
	for(var p = 0; p < playlists.length; p++){
		// add 3 clips for now
		var playlist = playlists[p];
		for(var i = 0; i < musicfiles.length; i++){
			var clip = new Clip().init_name_playlist_src(musicfiles[i], playlist, folder+musicfiles[i]+fileEnding);
			playlist.addClip(clip);
			console.log(clip.name);
		}
	}
	return playlists;
}

MixTape.initalDummyExample = function (){
	// Lecture 1 - NameAfterASuperLongThingThatIneedForTesting, Lecture 2, Lecture 3
	var playlists = [];
	// Clip 1, Clip 2, Clip 3
	// Bookmark 1, Bookmark 2, Bookmark 3
}

MixTape.fillDummyDialog = function (){
	dialogMenu = document.getElementById('computer-container');
	// delete any old children
	while(dialogMenu.firstChild){
		dialogMenu.removeChild(dialogMenu.firstChild);
	}
	var ul = document.createElement('ul');
	ul.setAttribute('class', 'list-group');
	dialogMenu.appendChild(ul);
	for(var i = 0; i < musicfiles.length; i++){
		// add each of the files
		MixTape.addItemToDialog(dialogMenu, musicfiles[i], '', 'MixTape.selectMusic(this)');
	}
}

MixTape.fillDummyEditDialog = function (){
	dialogMenu = document.getElementById('ep-computer-container');
	// delete any old children
	while(dialogMenu.firstChild){
		dialogMenu.removeChild(dialogMenu.firstChild);
	}
	var ul = document.createElement('ul');
	ul.setAttribute('class', 'list-group');
	dialogMenu.appendChild(ul);
	for(var i = 0; i < musicfiles.length; i++){
		// add each of the files
		MixTape.addItemToDialog(dialogMenu, musicfiles[i], '', 'MixTape.selectEditMusic(this)');
	}
}