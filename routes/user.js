var http = require('http')
  , crypto = require('crypto')
  , hmac = require('../utils/hmac')
  , misc = require('../utils/misc');
/*
 * GET users listing.
 */

exports.loginPrompt = function(req, res){
  var promotionId = '';
  if (req.query.hasOwnProperty('promotionId'))
    promotionId = req.query.promotionId;
  res.render('login', {title: 'Login', userId: req.params.userId, promotionId: misc.getProperty(req.query, 'promotionId'),
    enablePromotion: false, enableHistory: false, enableLogout: false, active: 0});
}

exports.login = function(req, res){
  console.log(JSON.stringify(req.body));
  var postData = '';
  if (req.body.hasOwnProperty('userId') && req.body.hasOwnProperty('password')){
	  postData = JSON.stringify({userId: req.body.userId, password: req.body.password});
	  console.log(postData);
    var options = {
	    host: 'compdev2',
	    port: 8087,
	    //path: '/PromotionWcfR/AuthenticateUser?userId=' + req.body.userId + '&password=' + req.body.password,
	    path: '/api/Utility/AuthenticateUser?userId=' + req.body.userId + '&password=' + req.body.password,
	    method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
	  };		
    var postReq = http.request(options, function(resp){
	    resp.setEncoding('utf8');
      var arr = '';
      resp.on('data', function (chunk){
        arr += chunk;
      });
	    resp.on('end', function (){
		    console.log(misc.replaceQuotes(arr));
	      var data = JSON.parse(arr);
	      console.log('data: ' + JSON.stringify(data));
        var returnCode = 200;
        if (data['Hash'] == 'ERROR')
          returnCode = 500;
	      res.writeHead(returnCode, {
		      'Content-Type': 'application/json',
        });
        res.end(JSON.stringify(data));
      });
    });
    postReq.write(postData);
    postReq.end();
  }
  else
    res.render('login', {title: 'Login', userId: misc.getProperty(req.body, 'userId'), promotionId: misc.getProperty(req.body, 'promotionId'),
      enablePromotion: false, enableHistory: false, enableLogout: false, active: 0});
}

exports.logout = function(req, res){
  res.render('logout', {title: 'Logout', data: data, userId: misc.getProperty(req.params, 'userId'), promotionId: '',
    enablePromotion: false, enableHistory: false, enableLogout: false, active: 3});
}

exports.validate = function(req, res, next){
	var d = '?', s = req.path;
	for (var qq in req.query){
		s = s + d + qq + '=' + req.query[qq];
		d = '&';
	}
  console.log('Beginning validation! ' + s);
  if (!req.query.hasOwnProperty('timeStamp') || !req.query.hasOwnProperty('signature') || !req.params.hasOwnProperty('userId')){
    res.render('login', {title: 'Login', userId: misc.getProperty(req.params, 'userId'), promotionId: misc.getProperty(req.params, 'promotionId'), 
      enablePromotion: false, enableHistory: false, enableLogout: false, active: 0}); 
  }
  else {
    var options = {
      host: 'compdev2',
      port: 8087,
      //path: '/PromotionWcfR/GetHash?userId=' + req.params.userId,
      path: '/api/Utility/GetHash?userId=' + req.params.userId,
      method: 'GET'
    };
    http.request(options, function(resp){
      resp.setEncoding('utf8');
      var hashKey = '';
      resp.on('data', function (chunk){
        hashKey += chunk;
      });
      resp.on('end', function (){
        var passPhrase = JSON.parse(hashKey);
        var returnedSignature = req.query['signature'];
        var queries = misc.sortProperties(misc.deleteProperty(req.query, 'signature')); // remove their signature from url & sort query parameters
        var url = req.path;
        var div = '?'
        for (q in queries){
          url = url + div + q + '=' + queries[q];
          div = '&';
        }
        console.log(url + ' ' + passPhrase);
        var computedSignature = hmac.hex_hmac_sha512(passPhrase, url);
        console.log(returnedSignature + ' ' + computedSignature);
        next();
	      //res.render('promotionlist', {title: 'History', data: data, enablePromotion: enablePromotion, userId: userId, promotionId: promotionId});
	    });
    }).end();
  }
}