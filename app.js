
/**
 * Module dependencies.
 */

var express = require('express')
  , promo = require('./routes/promo')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//app.get('/', user.login);
app.get('/:userId/login', user.loginPrompt);
app.post('/:userId/login', user.login);
app.all('/:userId/logout', user.logout);
app.get('/:userId/history', promo.history);
app.get('/:userId/promotion/:promotionId', promo.promotion);
app.post('/:userId/promotion/:promotionId/decision', promo.decision);
app.get('/media/:fileId', promo.media);
/*app.get('*', function(req,res){
  res.send('This page or resource does not exist!', 404);
});*/

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
