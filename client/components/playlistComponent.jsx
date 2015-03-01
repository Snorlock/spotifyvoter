var React = require('react');
var simpleXhr = require('../utils/simpleXhr.js');

var PlaylistItem = React.createClass({
    render: function() {
        return <li>
                 <p>{this.props.name} - {this.props.collaborative}</p>
               </li>
    }
})

var Playlist = React.createClass({
    getInitialState: function() {
        return {
        };
    },
    render: function() {
        if(this.state.playlists) {            
            return <ul>
                  {this.state.playlists.items.map(function(playlist) {
                       return <PlaylistItem collaborative={"collaborative: "+playlist.collaborative} name = {playlist.name}/>;
                    })}
               </ul>    
        }
        else {
            return <p>No playlists</p>
        }
        
    },
    componentDidMount: function() {
    	this.fetchPlaylists();
    },
    fetchPlaylists: function() {
    	var user = window.location.pathname.substr(1);
    	var that = this;
        console.log("FETCHING");
    	simpleXhr.get('/playlists/user/'+user, function(response) {
    		if(response === 'unauth') {
                console.log("NO SUCCEESSS");
    			window.location.href = "http://localhost:9001/";
    		}
    		else {
                console.log("SUCCEESSS");
    			var newState = {
	    			playlists: response
	    		}
	    		that.setState(newState);	
    		}
    		
    	});
    }
});

module.exports = Playlist;