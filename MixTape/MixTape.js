playlistsDB = new Mongo.Collection('playlists');
clipsDB = new Mongo.Collection('clips');
bookmarksDB = new Mongo.Collection('bookmarks');


if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {

  Meteor.startup(function() {

    return Meteor.methods({

      removeAllPlaylists: function() {

        return playlistsDB.remove({});

      },

      removeAllClips: function() {

        return clipsDB.remove({});

      },

      removeAllBookmarks: function() {

        return bookmarksDB.remove({});

      },

      removeAllMusic: function() {

        removeAllPlaylists();
        removeAllClips();
        removeAllBookmarks();

      }

    });

  });

}

