require('es6ify/node_modules/traceur/bin/traceur-runtime');
var React = require('react');
var SpotifyLogin = require('./components/spotifyLoginCompontent.jsx');

var Frontpage = React.createClass({
  render: function() {
    return <div><div>Create a democrazy out of your spotify playlists here</div>
    			<SpotifyLogin/>
    		</div>;
  }
});



React.render(<Frontpage />, 
	document.getElementById('mainContent'));
