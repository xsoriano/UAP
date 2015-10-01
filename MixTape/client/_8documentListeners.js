$.extend({
            getUrlVars : function() {
                var vars = [], hash;
                var hashes = window.location.href.slice(
                    window.location.href.indexOf('?') + 1).split('&');
                for ( var i = 0; i < hashes.length; i++) {
                    hash = hashes[i].split('=');
                    vars.push(hash[0]);
                    vars[hash[0]] = hash[1];
                }
                return vars;
            },
            getUrlVar : function(name) {
                return $.getUrlVars()[name];
            }
        });
        // get a username
        var username;
        $(document).ready(function() {
            if ($.getUrlVar('user')) {
                usernum = $.getUrlVar('user');
            }
});



// modal listeners and on document ready listeners/prep
$(document).ready(function() {
    if ($.getUrlVar('user')) {
        usernum = $.getUrlVar('user');
    }

    // register for modal form's enter event
    $('#recipient-name').keydown( function(event) {
        if(event.keyCode == 13){
            console.log('enter');
            event.preventDefault();
            document.getElementById('np-saveButton').focus();
            event.stopPropagation();
        }
    })

    // register for modal's enter event
    $('#newPlaylistWindow').keydown( function(event) {
        if(event.keyCode == 13){
            console.log('enter');
            event.preventDefault();
            savePlaylists();
        }
    })
    
    // register for modal form's enter event
    $('#edit-playlist-name').keydown( function(event) {
        if(event.keyCode == 13){
            console.log('enter');
            event.preventDefault();
            document.getElementById('ep-saveButton').focus();
            event.stopPropagation();
        }
    })

    // register for modal's enter event
    $('#editPlaylistWindow').keydown( function(event) {
        if(event.keyCode == 13){
            console.log('enter');
            event.preventDefault();
            saveEdit();
        }
    })

    $('#ep-url').keydown( function(event) {
        if(event.keyCode == 13){
            console.log('enter');
            event.preventDefault();
            insertURL(this);
            document.getElementById('ep-saveButton').focus();
            event.stopPropagation();

        }
    })

    $('#np-url').keydown( function(event) {
        if(event.keyCode == 13){
            console.log('enter');
            event.preventDefault();
            insertURL(this);
            document.getElementById('np-saveButton').focus();
            event.stopPropagation();
        }
    })

    $('#newPlaylistWindow').on('shown.bs.modal', function () {
        $('#recipient-name').focus();
        $('#recipient-name').select();
    })

    $('#editPlaylistWindow').on('shown.bs.modal', function () {
        $('#edit-playlist-name').focus();
        $('#edit-playlist-name').select();
    })

    $('#inputEndTime').keydown( function(event) {
        if(event.keyCode == 13){
            console.log('enter');
            event.preventDefault();
            document.getElementById('btnBookmark').click();
        }
    })
});