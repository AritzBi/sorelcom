var express = require('express');
var controllers = require('./controllers');
var hash = require('./controllers/pass').hash;
var user = require('./controllers/user');
var parliament = require('./controllers/query');

var http = require('http');
var path = require('path');
var passport = require('passport');

var app = express();


//app.use(express.bodyParser());
app.set('view engine', 'jade'); 

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));	
app.set('view engine', 'jade');

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: "moar secrets" }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', controllers.index);

app.post('/ajax/login', user.login);
app.post('/ajax/register', user.register);
app.post('/ajax/logout', user.logout);

app.get('/ajax/routeList', parliament.routeList);
app.post('/ajax/insertRoute', parliament.insertRoute);

//Dev
if ('development' == app.get('env')) {
  app.get('/users/:userID', function(req, res){
  	res.send("User id: " + req.params.userID);
  });
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

