var request = require('request');
var async = require('async');
var Firebase = require('firebase');

var redirect_uri = 'http://localhost:9001/spotify-callback';
var client_id = '1fbf71b72e5740368fb9fb5fd9d660d4'
var client_secret = '3300c68cd181446eb71c47c1f03523d5' 
var firebaseRef = new Firebase('https://spotifyvoterauth.firebaseio.com/');
var authRef = firebaseRef.child('auth');


var stateKey = 'spotify_auth_state';

exports.index = function (req, res) {
    res.render('index');
};

exports.loadUserPage = function (req, res) {
    res.render('userIndex');
};

exports.getUserPlaylists = function(req, res) {
	var user = req.params.id;
	async.waterfall([
		function(callback) {
			authRef.child(user).once('value', function(dataSnapshot) {
				if(dataSnapshot.val().cookie != req.cookies.spotify_auth_state) {
					console.log("EEEEERRORRRRORORO COOOOKIES");
					res.json("unauth");
					return;
				}
				callback(null, dataSnapshot.val())
			})
		},
		function(tokens, callback) {
			console.log("REQUSTING INFO");
			requestUserPlaylists(tokens.access_token, user, function(error, response, body) {
				console.log("REQUESTED INFO ", body);
				if(body.error) {
					callback(body.error, tokens);
				}
				else {
					callback(null, body);
				}
			});
		}], function(err, result) {
			if(err) {
				console.log("ERROR in get user info ", err);
				var refresh_token = tryRefreshToken(result.refresh_token, req, res);
				return;
			};
			res.json(result);
		});

}


exports.getUserInfo = function(req, res) {
	var user = req.params.id;
	console.log("STAAAAATTE KEEEEY: "+req.cookies.spotify_auth_state);

	async.waterfall([
		function(callback) {
			authRef.child(user).once('value', function(dataSnapshot) {
				if(dataSnapshot.val().cookie != req.cookies.spotify_auth_state) {
					console.log("EEEEERRORRRRORORO COOOOKIES");
					res.json("unauth");
					return;
				}
				callback(null, dataSnapshot.val())
			})
		},
		function(tokens, callback) {
			console.log("REQUSTING INFO");
			requestUserInfoSpotify(tokens.access_token, function(error, response, body) {
				console.log("REQUESTED INFO ", body);
				if(body.error) {
					callback(body.error, tokens);
				}
				else {
					callback(null, body);
				}
			});
		}], function(err, result) {
			if(err) {
				console.log("ERROR in get user info ", err);
				var refresh_token = tryRefreshToken(result.refresh_token, req, res);
				return;
			};
			res.json(result);
		});
}

function tryRefreshToken(refresh_token, req, res) {
	console.log("TRYING OUT REFRESH "+refresh_token);
	async.waterfall([
		function(callback) {
			var authOptions = {
				url: 'https://accounts.spotify.com/api/token',
				form: {
					grant_type: 'refresh_token',
					refresh_token: refresh_token
				},
				headers: {
					'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
				},
				json: true
			}
			request.post(authOptions, function(error, response, body) {
				console.log(error);
				console.log(body);
				if (!error && response.statusCode === 200) {				
				    callback(null, body);
				}
			});	
		}, function(body, callback) {
			var access_token = body.access_token;
			var refresh_token = body.refresh_token;
			requestUserInfoSpotify(access_token, function(error, response, body) {
				authRef.child(body.id).update({'access_token':access_token, 'cookie':req.cookies.spotify_auth_state}, function (error){
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
	});

}

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
			requestUserInfoSpotify(atoken, function(error, response, body) {
				authRef.child(body.id).set({'access_token':atoken, 'refresh_token': rtoken, 'cookie':req.cookies.spotify_auth_state}, function (error){
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

function requestUserPlaylists(access_token, id, callback) {
	var options = {
		url: 'https://api.spotify.com/v1/users/'+id+'/playlists',
		headers: { 'Authorization': 'Bearer ' + access_token },
		json: true
	};	

	request.get(options, function(error, response, body) {
		callback(error, response, body);
	});

}

function requestUserInfoSpotify(access_token, callback) {
	var options = {
		url: 'https://api.spotify.com/v1/me',
		headers: { 'Authorization': 'Bearer ' + access_token },
		json: true
	};	

	request.get(options, function(error, response, body) {
		callback(error, response, body);
	});

}