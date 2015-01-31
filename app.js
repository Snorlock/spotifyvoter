var express = require('express');
var path = require('path');
var consolidate = require('consolidate');
var routes = require('./routes');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var app=express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', consolidate.handlebars);

app.use(express.static('build'));
app.use(bodyParser.json());
app.use(cookieParser());


app.use(routes)

app.listen(process.env.PORT || 9001);