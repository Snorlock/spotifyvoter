var routes = require('./routes');
var router = require('express').Router();
var querystring = require('querystring');

var client_id = '1fbf71b72e5740368fb9fb5fd9d660d4'; // Your client id
var client_secret = '3300c68cd181446eb71c47c1f03523d5'; // Your client secret
var redirect_uri = 'http://localhost:9001/spotify-callback'; // Your redirect uri

var stateKey = 'spotify_auth_state';

router.get('/', function(req,res){
    res.format({
    	'text/html': function(){
    		routes.index(req,res);
    	}
    })
});

router.get('/login', function(req,res){
	var state = generateRandomString(16);
	res.cookie(stateKey, state);

	// your application requests authorization
	var scope = 'user-read-private user-read-email';
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
	}));
});

router.get('/:id((\\w+))', function(req, res) {
	routes.loadUserPage(req, res);
})

router.get('/spotify-callback', function(req,res){
	routes.handleSpotify(req,res);
});


var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

module.exports = router;