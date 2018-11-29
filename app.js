const http = require('http');
var fs = require('fs');
const express = require('express');
const ejs = require('ejs');
var app = express();

const Spotify = require('spotify-web-api-node');

var spotify = new Spotify({
  clientId: '366e8b5ceafa4a548f5be611eaffe8ab',
  clientSecret: process.env.ClientSecret,
  redirectUri: 'http://localhost:8080'
});

var scopes = ['user-read-private', 'user-read-email'],
  redirectUri,
  clientId,
  storedState = Math.random().toString(36).substring(2, 15);


//create authorization url
var authorizeURL = spotify.createAuthorizeURL(scopes, storedState);

fs.writeFileSync("package.json", 'var package = {"authorizeURL":"'+authorizeURL+'"}', 'utf-8');

console.log(fs.readFileSync("package.json").toString());
console.log(authorizeURL);

app.get('/callback', function(req, res){
  var code = req.query.code || null;
  var storedState = req.state;
  var state = req.query.state || null;

  if (state !== storedState || state === null) {
    res.redirect('/#' + querystring.stringify({error: 'state_mismatch'}));
  } else {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      JSON: true
    };
    }
  }
})

var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');

});
