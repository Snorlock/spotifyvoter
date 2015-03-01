var React = require('react');
var simpleXhr = require('../utils/simpleXhr.js');

var UserInfo = React.createClass({
    getInitialState: function() {
        return {
        	'name': 'Lars'
        };
    },
    render: function() {
    	console.log("RENDER", this.state.name);
        return <div>
        			<h3>{this.state.name}</h3>
       				<img src={this.state.image} alt="Your image"/>	
        	   </div>
    },
    componentDidMount: function() {
    	this.fetchUserInfo();
    },
    fetchUserInfo: function() {
    	var user = window.location.pathname.substr(1);
    	var that = this;
    	simpleXhr.get('/user?user='+user, function(response) {
    		if(response === 'unauth') {
    			window.location.href = "http://localhost:9001/";
    		}
    		else {
    			var newState = {
	    			name: response.display_name,
	    			image: response.images[0].url
	    		}
	    		that.setState(newState);	
    		}
    		
    	});
    }
});

module.exports = UserInfo;