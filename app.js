
/**
 * Module dependencies.
 */

var express = require('express')
  , promo = require('./routes/promo')
  , user = require('./routes/user')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , fs = require('fs');

var app = express();

var https_options = {
    key: fs.readFileSync('ssl/privatekey.pem')
  , cert: fs.readFileSync('ssl/certificate.pem')
};

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
  app.use(function(req, res, next){
    res.status(404);
    if (req.accepts('html')){
      res.render('error', {title: 'Error', data: 'Invalid Request!'});
    }
    else if (req.accepts('json')){
      res.send({error: 'Invalid Request!'});
    }
    else{
      res.type('txt').send('Invalid Request!');
    }
  });
});	

app.configure('development', function(){
  //app.use(express.errorHandler());
  app.use(express.static(path.join(__dirname, 'ipd')));
});

if (app.get('env') === 'development'){
  app.set('serviceHost', 'compdev2');
  app.set('servicePort', 8087);
}
else if (app.get('env') === 'quality assurance'){
  app.set('serviceHost', 'compqa2');
  app.set('servicePort', 8087);
}
else if (app.get('env') === 'production'){
  app.set('serviceHost', 'compprod2');
  app.set('servicePort', 8087);
}

app.set('serviceProtocol', 'http://');
app.set('serviceUrl', app.get('serviceProtocol') + app.get('serviceHost') + 
  ':' + app.get('servicePort'));

app.get('/login', user.login);
app.get('/:userId/login', user.loginPrompt);
app.post('/:userId/login', user.login);
app.all('/:userId/logout', user.logout);
app.get('/:userId/history', promo.history);
app.get('/:userId/promotion/:promotionId', promo.promotion);
app.post('/:userId/promotion/:promotionId/decision', promo.decision);
app.get('/:userId/valid', user.valid);
//app.get('/media/:fileId', promo.media);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
