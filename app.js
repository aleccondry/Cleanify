const http = require('http');
const port = 3000;
var fs = require('fs');
const Spotify = require('spotify-web-api-node');

var spotify = new Spotify({
  clientId: '366e8b5ceafa4a548f5be611eaffe8ab',
  clientSecret: process.env.ClientSecret,
  redirectUri: 'http://localhost:8080'
});

var scopes = ['user-read-private', 'user-read-email'],
  redirectUri,
  clientId,
  state = Math.random().toString(36).substring(2, 15);


//create authorization url
var authorizeURL = spotify.createAuthorizeURL(scopes, state);

fs.writeFileSync("package.json", 'var package = {"authorizeURL":"'+authorizeURL+'"}', 'utf-8');

console.log(fs.readFileSync("package.json").toString());
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
});
