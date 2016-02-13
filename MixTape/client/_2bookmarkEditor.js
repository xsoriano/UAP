
	var SEMAPHORE = 0; 	
	var bookmarkId;

$.validator.addMethod("time", function(value, element) {
	var timeReg = new RegExp('^[0-9]+:[0-5][0-9]$');
	console.log(element);
	return timeReg.test(value) || value=='';
  
}, "Must follow the format mm:ss");

$.validator.addMethod("endAfterStart", function(value, element) {
	if($('#new-bookmark-start').val() == '' || $('#new-bookmark-end').val() == ''){
      return true;
   	}else{
   		var startTimeVals = ($('#new-bookmark-start').val()).split(':');
   		var endTimeVals = ($('#new-bookmark-end').val()).split(':');
   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
   		return startTime < endTime;
   	}
  
}, "End time must be after start time.");

$.validator.addMethod("withinClipDurationTime", function(value, element) {
	if (Session.get('SELECTED_NB_CLIP_KEY')){
		var duration = clipsDB.findOne({_id:Session.get('SELECTED_NB_CLIP_KEY')}).duration;
		var vals = (value).split(':');
   		var time = parseInt(vals[0]) * 60 + parseInt(vals[1]);
   		return duration >= time && time>=0; 
	}
	return true;
  
}, "Must be within duration of the clip");

$.validator.addMethod("noRepeatedBookmarkNames", function(value, element) {
	var selectedClip = Session.get('SELECTED_NB_CLIP_KEY');
	return !(bookmarksDB.find({name : value, clip : selectedClip}).count()>0);
  
}, "A Bookmark with this name already exists.");



Template.newBookmark.helpers({
	'playlist': function(){
		return playlistsDB.find({owner:Meteor.userId()},{sort: {rank: 1}});
	},

	'isPlaylistSelected': function(){
		return Session.equals('SELECTED_NB_PLAYLIST_KEY', this._id) && 'selected';
	},
	'clip': function(){
		var currentPlaylist = Session.get('SELECTED_NB_PLAYLIST_KEY');
		return clipsDB.find({playlist:currentPlaylist},{sort: {rank: 1}});
	},
	'duration': function(){
		var durationSecs = this.duration;
		var mins = Math.floor(durationSecs/60);
		var secs = Math.floor(durationSecs)%60;
		var optZero = (secs < 10) ? '0' : '';
		var duration = mins + ':' + optZero + secs;
		return duration;		
	},
	'isClipSelected': function(){
		return Session.equals('SELECTED_NB_CLIP_KEY', this._id) && 'selected';

	},

	});

Template.newBookmark.events({
	'change #new-bookmark-playlist': function (event) {
		var currentTarget = event.currentTarget;
		var newValue = currentTarget.options[currentTarget.selectedIndex].value;
		Session.set('SELECTED_NB_PLAYLIST_KEY', newValue);
		Session.set('SELECTED_NB_CLIP_KEY', null);
  	},
  	'change #new-bookmark-clip': function (event) {
		var currentTarget = event.currentTarget;
		var newValue = currentTarget.options[currentTarget.selectedIndex].value;
		Session.set('SELECTED_NB_CLIP_KEY', newValue);
  	},
  	'change #new-bookmark-start': function (event) {
		var currentTarget = event.currentTarget;
		var startTimeInput = $(currentTarget).val();
		var timeReg = new RegExp('^[0-9]+:[0-5][0-9]$');
		if (timeReg.test(startTimeInput)){
			// Session.set('START_TIME_ENTERED', true);
			var endTimeInput = $('#new-bookmark-end').val();
			var duration = parseInt($('#new-bookmark-duration').val());
			var numberReg = new RegExp('^[0-9]+$');
			if (timeReg.test(endTimeInput)){
				var startTimeVals = startTimeInput.split(':');
		   		var endTimeVals = endTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		$('#new-bookmark-duration').val(endTime-startTime);
			}else if(numberReg.test(duration)){
				var startTimeVals = startTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endPos = startTime + duration;
		   		var endMins = Math.floor(endPos / 60);
		   		var endSecs = Math.floor(endPos % 60);
		   		var optZero = (0<=endSecs && endSecs<10) ? '0' : '';
		   		$('#new-bookmark-end').val(endMins + ':' + optZero + endSecs);
			}
		}
  	},
  	'change #new-bookmark-end': function (event) {
  		var currentTarget = event.currentTarget;
		var endTimeInput = $(currentTarget).val();
		var timeReg = new RegExp('^[0-9]+:[0-5][0-9]$');
		if (timeReg.test(endTimeInput)){
			// Session.set('START_TIME_ENTERED', true);
			var startTimeInput = $('#new-bookmark-start').val();
			var duration = parseInt($('#new-bookmark-duration').val());
			var numberReg = new RegExp('^[0-9]+$');
			if (timeReg.test(startTimeInput)){
				var startTimeVals = startTimeInput.split(':');
		   		var endTimeVals = endTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		$('#new-bookmark-duration').val(endTime-startTime);
			}else if(numberReg.test(duration)){
				var endTimeVals = endTimeInput.split(':');
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		var startPos = endTime - duration;
		   		var startMins = Math.floor(startPos / 60);
		   		var startSecs = Math.floor(startPos % 60);
		   		var optZero = (0<=startSecs && startSecs<10) ? '0' : '';
		   		$('#new-bookmark-start').val(startMins + ':' + optZero + startSecs);
		   	}
		}
  	},
  	'change #new-bookmark-duration': function (event) {
		var currentTarget = event.currentTarget;
		var durationInput = $(currentTarget).val();
		var timeReg = new RegExp('^[0-9]+:[0-5][0-9]$');
		var numberReg = new RegExp('^[0-9]+$');
		if (numberReg.test(durationInput)){
			// Session.set('START_TIME_ENTERED', true);
			var startTimeInput = $('#new-bookmark-start').val();
			var endTimeInput = $('#new-bookmark-end').val();
			var duration = parseInt(durationInput);
			
			if (timeReg.test(startTimeInput)){
				var startTimeVals = startTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endPos = startTime + duration;
		   		var endMins = Math.floor(endPos / 60);
		   		var endSecs = Math.floor(endPos % 60);
		   		var optZero = (0<=endSecs && endSecs<10) ? '0' : '';
		   		$('#new-bookmark-end').val(endMins + ':' + optZero + endSecs);
			}else if(timeReg.test(endTimeInput)){
				var endTimeVals = endTimeInput.split(':');
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		console.log(endTime);
		   		var startPos = endTime - duration;
		   		var startMins = Math.floor(startPos / 60);
		   		var startSecs = Math.floor(startPos % 60);
		   		var optZero = (0<=startSecs && startSecs<10) ? '0' : '';
		   		$('#new-bookmark-start').val(startMins + ':' + optZero + startSecs);
		   	}
		}
  	},
  	'submit form': function(event){
		event.preventDefault();
    }
});

Template.newBookmark.onRendered(function(){
    var validator = $('#add-bookmark-form').validate({
        rules: {
            name: {
                required: true,
                noRepeatedBookmarkNames: true,
            },
            playlist: {
            	required: true,
            },
            clip: {
            	required: true,
            },
            start: {
                required:true,
                time: true,
                withinClipDurationTime: true,
            },
            end: {
            	time: true,
            	endAfterStart: true,
            	withinClipDurationTime: true,
            }
        },
        messages: {
            name: {
                required: "You must enter a bookmark name.",
            },
            playlist: {
                required: "You must select a playlist.",
            },
            clip: {
                required: "You must select a clip.",
            },
            start: {
                required: "Enter a start time for the bookmark.",
            }
        },
        submitHandler: function(event){
        	createNewBookmark($('#new-bookmark-name').val(), $('#new-bookmark-clip').val(),
        						 $('#new-bookmark-start').val(), $('#new-bookmark-end').val(), $('#new-bookmark-notes').val());
        	$('#nb-top-btn-close').trigger('click');   
        }
    });
});

MixTape.openNewBookmarkWindow = function() {
	$('#newBookmarkWindow').modal('show');
	var activePlaylist = Session.get('ACTIVE_PLAYLIST_KEY');
	if(activePlaylist){
		Session.set('SELECTED_NB_PLAYLIST_KEY', activePlaylist);
		var activeClip = Session.get('ACTIVE_CLIP_KEY');
		if(activeClip){
			if (clipsDB.findOne({_id : activeClip}).playlist == activePlaylist){
				Session.set('SELECTED_NB_CLIP_KEY', activeClip);
			}	
		}
	}

}

MixTape.clearNewBookmarModal = function(){
	$('#add-bookmark-form')[0].reset();
	Session.set('SELECTED_NB_CLIP_KEY', null);
	Session.set('SELECTED_NB_PLAYLIST_KEY', null);
}

function createNewBookmark(bookmarkName, parentClip, startTimeInput, endTimeInput, bookmarkNotes){
	var bookmarkRank = (bookmarksDB.find({owner: Meteor.userId(), clip: parentClip}).count()>0) ? bookmarksDB.findOne({clip: parentClip}, {sort: {rank: -1}}).rank + 0.05 : 0;
	var startTimeVals = (startTimeInput).split(':');
	var endTimeVals = (endTimeInput).split(':');
	var startTimeSecs = (parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]))*1000;
	var endTimeSecs = (parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]))*1000;
	bookmarksDB.insert({
		owner : Meteor.userId(),
		name : bookmarkName,
		clip: parentClip,
		rank : bookmarkRank,
		startTime: startTimeSecs,
		endTime: endTimeSecs,
		notes: bookmarkNotes,
	});
}

MixTape.addBookmarkEditorFunctionality = function(bookmark){
		
		bookmark.click(function(e) {
		    
		    e.stopPropagation();
		    var caller = $(e.currentTarget.offsetParent.offsetParent);
		    var itemBackEnd = MixTape.getBackEndItem(caller[0]);
		    
		    // console.log(bookmarkId);
		    // console.log(itemBackEnd);
		    // console.log(bookmarkId);
		    if (!(itemBackEnd.isBeingEdited) && SEMAPHORE==0){
	    		MixTape.popBookmarkEditor(caller, itemBackEnd);
	    		SEMAPHORE = 1;
	    		MixTape.deactivate(caller[0]);
				MixTape.makeActive(caller[0]);
				MixTape.updateMenus();
				bookmarkId = itemBackEnd.id;
				// console.log(bookmarkId);
				itemBackEnd.changeIsBeingEdited();	    		
				// caller[0].setAttribute("data-clicked","true");
		    	
		    }else {
		    	if (bookmarkId==itemBackEnd.id){
		    		$('#noteContainer').remove(); 
		    		itemBackEnd.changeIsBeingEdited();
		    		// caller[0].removeAttribute("data-clicked");
		    		SEMAPHORE = 0;
		    	}
		    	
		    }
		    
		    var windowSize = $( "#note" ).height();
	        var headerSize = $( "#bookmarkNameContainer").height();
	        MixTape.resizeInside();

			$( "#note" )
	        	.resizable({
	      			maxWidth: 250,
	      			maxHeight: 500,
	      			minHeight: 315,
	      			minWidth: 200
	    		})
	        	.draggable();

	        $( "#note" ).resize(function(e){	        	
	        	MixTape.resizeInside();
	        });
	        $( "#text" ).focus(function(e){	        	
	        	MixTape.resizeInside();
	        });
	        	
	

	        //When the bookmark name is double clicked, it becomes at text field that has the name of the bookmark selected
		    $('#bookmarkName').dblclick(function() {
			    $('#bookmarkName').css('display', 'none');
			    $('#bookmarkName_entry')
			        .val($('#bookmarkName').text())
			        .css('display', '')
			        .select()
			        .focus();
			    MixTape.resizeInside();
			});

		    //When the bookmark input field looses focus, it changes the name of the bookmark (if the name is not empty)
			$('#bookmarkName_entry').blur(function() {
			    $('#bookmarkName_entry').css('display', 'none');
		        if (checkEmpty("bookmarkName_entry")){
			    	$('#bookmarkName').text($('#bookmarkName_entry').val());
			    }
			        $('#bookmarkName').css('display', '');
			});

			//When enter is pressed on the bookmark name input, it changes the name of the bookmark (if the name is not empty)
			$("#bookmarkName_entry").keypress(function(event) {
		    //13 is the key code for the enter key.
		    if (event.which == 13) {
		        event.preventDefault();
		        $('#bookmarkName_entry').css('display', 'none');
		        if (checkEmpty("bookmarkName_entry")){
			    	$('#bookmarkName').text($('#bookmarkName_entry').val());
			    }
			        $('#bookmarkName').css('display', '');
			    $( "#btnDone" ).focus();
			    MixTape.resizeInside();
		                                                                      
		    }
		    });

			$( "#btnDone" ).focus();
		    //When the done button is clicked, the name in the caller button is changed and the editor widget is closed
		    $( "#btnDone" ).click(function(){
				if (MixTape.checkEmpty("bookmarkName_entry")){
					caller[0].firstChild.innerHTML = ($('#bookmarkName_entry').val());
					nameString = $('#bookmarkName_entry').val()
					if (isNametUsed(itemBackEnd, nameString)){
						itemBackEnd.updateName(nameString + "-1");
					}else{
						itemBackEnd.updateName(nameString);
					}
					
				}
				itemBackEnd.addText($("#text").val());
				$('#noteContainer').remove();
				itemBackEnd.changeIsBeingEdited();
				bookmarkId = itemBackEnd.id;
				SEMAPHORE = 0;
				MixTape.updateMenus();
				if (itemBackEnd.src == currentSrc){
			    	$("#edWindow_heading").html("<a>Editing Window: "+ itemBackEnd.name + "</a>");
		    	}
				//caller.prop('disabled', false);
		    });

		    //The editor widget is closed without changing anything in the bookmark.
		    $( "#btnCancel" ).click(function(){
				$('#noteContainer').remove();
				itemBackEnd.changeIsBeingEdited();
				SEMAPHORE = 0;
				//caller.prop('disabled', false);

		    });

	    //caller.prop('disabled', true);	    

	});
	}

 	

/**
  * Returns true if the value of element_string is not empty.
  * @param {Node} element_string an input html element that contains the text we want to check
  * Code taken from http://stackoverflow.com/questions/3502354/how-to-check-if-a-textbox-is-empty-using-javascript and modified afterwards.*
  */
MixTape.checkEmpty = function(element_string) { 
	var myString = document.getElementById(element_string).value; 
    if(!myString.match(/\S/)) {
        return false;
    } else {
        return true;
    }
}

MixTape.getBackEndItem = function(item){
	if(item.classList.contains('playlist')){
		// the things on the playlist menu
		for(var i = 0; i < playlists.length; i++){
			if (item.id == playlists[i].id){
				console.log("Playlist found");
				return playlists[i]
			}
		}
	}
	else if(item.classList.contains('clip')){
		// the things on the clip menu
		for(var i = 0; i < playlists[currentPlaylistIndex].clips.length; i++){
			if (item.id == playlists[currentPlaylistIndex].clips[i].id){
				console.log("Clip found");
				return playlists[currentPlaylistIndex].clips[i]
				
			}
		}
	}
	else if(item.classList.contains('bookmark')){
		// the things on the bookmark menu
		for(var i = 0; i < playlists[currentPlaylistIndex].clips[currentClipIndex].bookmarks.length; i++){
			if (item.id == playlists[currentPlaylistIndex].clips[currentClipIndex].bookmarks[i].id){
				console.log("Bookmark found");
				return playlists[currentPlaylistIndex].clips[currentClipIndex].bookmarks[i]
				
			}
		}
	}
	else{
		console.log('warning');
	}
	
}

MixTape.resizeInside = function(){
	windowSize = $( "#note" ).height();
	headerSize = $( "#bookmarkNameContainer").height();
	$( "#noteBody" ).height(windowSize-headerSize);
	$( "#text" ).height($( "#noteBody" ).height()-$( "#confirmationContainer" ).height()-16);
}

/**
  * Creates a bookmark note widget. For now it adds it to the end of the html. Ideally we can use the information of the position of the caller
  * to make it appear right next to it.
  * @param {$(Node)} caller is a jquery element that contains the button (or the container of the button) that calls the widget. 
  *					Its text must be the name of the bookmark. 
  */
MixTape.popBookmarkEditor = function(caller, itemBackEnd) {     	
	var bookmarkName = itemBackEnd.name;
	var rect = caller.offset();

	var bookmarkTop = rect.top - 10;
	var bookmarkLeft = rect.left + caller.outerWidth() + caller.children('.list-group-submenu').outerWidth();

	// console.log(caller.children('.list-group-submenu').outerWidth());

	var bookmarkEditorContainer = document.createElement("div");
	var bookmarkEditor = document.createElement("div");
	var bookmarkNameContainerParent = document.createElement("ul");
	var bookmarkNameContainer = document.createElement("li");
	var bookmarkNameLabel = document.createElement("a");
	var bookmarkNameEditor = document.createElement("input");
	var noteContainer = document.createElement("div");
	var note = document.createElement("textarea");
	var confirmationContainer = document.createElement("div");
	var cancelButton = document.createElement("button");
	var doneButton = document.createElement("button");  	

	bookmarkEditorContainer.setAttribute("id","noteContainer");
	bookmarkEditorContainer.style.position = "absolute";
	$(bookmarkEditorContainer).offset({ top: bookmarkTop, left: bookmarkLeft});
	// console.log(bookmarkLeft);
	// console.log(bookmarkEditorContainer.style.left);
	
	bookmarkEditor.setAttribute("id","note");
	$(bookmarkEditor).addClass("effect1");

	bookmarkNameContainerParent.setAttribute("id","headerColorContainer")
	bookmarkNameContainerParent.setAttribute("class","nav nav-pills nav-stacked")
	
	bookmarkNameContainer.setAttribute("id","bookmarkNameContainer")
	bookmarkNameContainer.setAttribute("class","active indigo")
	
	bookmarkNameLabel.setAttribute("id","bookmarkName");
	bookmarkNameLabel.innerHTML =  bookmarkName;

	bookmarkNameEditor.setAttribute("id","bookmarkName_entry");
	bookmarkNameEditor.style.display = "none";

	noteContainer.setAttribute("id","noteBody");
	noteContainer.setAttribute("class","center");

	var windowSize = $(bookmarkEditor).height();
	var headerSize = $(bookmarkNameContainer).height();
	$(noteContainer).height(windowSize-headerSize);

	
	note.setAttribute("id","text");
	note.setAttribute('onClick', 'this.select()');
	$(note).val(itemBackEnd.text);

	cancelButton.innerHTML = "Cancel";
	cancelButton.setAttribute("id","btnCancel");
	cancelButton.setAttribute("class","btn");


	doneButton.innerHTML = "Done";
	doneButton.setAttribute("id","btnDone");
	doneButton.setAttribute("class","btn");

	confirmationContainer.setAttribute("id","confirmationContainer");
	confirmationContainer.setAttribute("class","center");
	confirmationContainer.appendChild(cancelButton);
	confirmationContainer.appendChild(doneButton);

	noteContainer.appendChild(note);
	noteContainer.appendChild(confirmationContainer);
	bookmarkNameContainer.appendChild(bookmarkNameLabel);
	bookmarkNameContainer.appendChild(bookmarkNameEditor);
	bookmarkNameContainerParent.appendChild(bookmarkNameContainer);
	
	bookmarkEditor.appendChild(bookmarkNameContainerParent);
	bookmarkEditor.appendChild(noteContainer);
	bookmarkEditorContainer.appendChild(bookmarkEditor)
	document.body.appendChild(bookmarkEditorContainer);
}

	