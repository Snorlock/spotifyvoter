var React = require('react');

var User = React.createClass({
  render: function() {
    return <div>You are logged in foreverzz</div>
  }
});

React.render(<User />, 
	document.getElementById('mainContent'));
