Meteor.publish('playlists', function() {
  return playlistsDB.find({owner: this.userId});
});

Meteor.publish('clips', function() {
  return clipsDB.find({owner: this.userId});
});

Meteor.publish('bookmarks', function() {
  return bookmarksDB.find({owner: this.userId});
});
