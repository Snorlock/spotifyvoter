var request = require('request');
var async = require('async');
var Firebase = require('firebase');

var redirect_uri = 'http://localhost:9001/spotify-callback';
var client_id = '1fbf71b72e5740368fb9fb5fd9d660d4'
var client_secret = '3300c68cd181446eb71c47c1f03523d5' 
var firebaseRef = new Firebase('https://spotifyvoterauth.firebaseio.com/');

exports.index = function (req, res) {
    res.render('index');
};

exports.loadUserPage = function (req, res) {
    res.render('userIndex');
};

exports.handleSpotify = function (req, res) {
	var code = req.query.code;
	var state = req.query.state;	

	async.waterfall([
		function(callback) {
			var authOptions = {
				url: 'https://accounts.spotify.com/api/token',
				form: {
					code: code,
					redirect_uri: redirect_uri,
					grant_type: 'authorization_code'
				},
				headers: {
					'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
				},
				json: true
			}
			request.post(authOptions, function(error, response, body) {
				if (!error && response.statusCode === 200) {				
					var access_token = body.access_token
				    var refresh_token = body.refresh_token;
				    callback(null, access_token, refresh_token);
				}
			});	
		},
		function(atoken, rtoken, callback) {
			var options = {
			  url: 'https://api.spotify.com/v1/me',
			  headers: { 'Authorization': 'Bearer ' + atoken },
			  json: true
			};

			request.get(options, function(error, response, body) {
				firebaseRef.child(body.id).set({'access_token':atoken, 'refresh_token': rtoken}, function (error){
					if(error) {
						console.log("ERROOORRR", error);
					}
					else {
						console.log("FIREBASE SUCCESSS");
					}
				});
				callback(null, body)
			});
		}
	], function(err, result) {
		res.redirect('/'+result.id);
	})
};