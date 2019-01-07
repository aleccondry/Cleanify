// INSTANTIATE WRAPPER
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');

var client_id = '366e8b5ceafa4a548f5be611eaffe8ab'; // Your client id
var client_secret = fs.readFileSync("env.txt").toString().trim();

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: 'http://cleanify.mooo.com/callback'
});

// RETRIEVE AN ACCESS TOKEN.
spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);

    // GET DAT DATA BOII
    // Get Elvis' albums
    spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
      function(data) {
	console.log('Artist albums', data.body);
      },
      function(err) {
	console.error(err);
      }
    );
  },
  function(err) {
    console.log('The client ID is ' + spotifyApi.getClientId());
    console.log('The client secret is ' + spotifyApi.getClientSecret());
    console.log('Something went wrong when retrieving an access token', err);
  }
);
