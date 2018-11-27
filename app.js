const http = require('http');
const port = 3000;

const Spotify = require('spotify-web-api-node');

var spotify = new Spotify({
  clientId: '366e8b5ceafa4a548f5be611eaffe8ab',
  clientSecret: process.env.ClientSecret,
  redirectUri: 'https://example.com/callback'
});

var scopes = ['user-read-private', 'user-read-email'],
  redirectUri,
  clientId,
  state = Math.random().toString(36).substring(2, 15);


//create authorization url
var authorizeURL = spotify.createAuthorizeURL(scopes, state);
console.log(authorizeURL);

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
<<<<<<< HEAD

=======
>>>>>>> slight css cleanup and a gitignore
});
