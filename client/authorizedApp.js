var React = require('react');
var UserInfo = require('./components/userInfoComponent.jsx');

var User = React.createClass({
  render: function() {
    return <div>
    			<h1>You are logged in foreverzz</h1>
    			<UserInfo/>
    	   </div>
  }
});

React.render(<User />, 
	document.getElementById('mainContent'));
