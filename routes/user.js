var http = require('http')
  , Hashes = require('jshashes')
  , misc = require('../utils/misc');
/*
 * This file mostly deals with user authentication.
 */

/*
 * Show login prompt
 */
exports.loginPrompt = function(req, res){
	console.log('Showing Login prompt!');
  res.render('login', {title: 'Login', data: '', userId: req.params.userId, 
    promotionId: misc.getProperty(req.query, 'promotionId'),
    enablePromotion: false, enableHistory: false, enableLogout: false, 
    active: 0, count: 0});
}

/*
 * Store user's credentials on a remote server & return 
 * their hashed password to use as an authentication token
 */
exports.login = function(req, res){
  console.log('Logging in with info: ' + JSON.stringify(req.body));
  var postData = '';
  if (req.body.hasOwnProperty('userId') && req.body.hasOwnProperty('password')){
	  postData = JSON.stringify({userId: req.body.userId, password: req.body.password});
	  console.log(postData + res.app.settings['serviceHost']);
	  // Call AuthenticateUser webservice
    var options = {
	    host: res.app.settings['serviceHost'],
	    port: res.app.settings['servicePort'],
	    path: '/api/Utility/AuthenticateUser?userId=' + req.body.userId + 
	      '&password=' + req.body.password,
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
	      var data = JSON.parse(arr);
	      // Handle error
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
    res.render('login', {title: 'Login', data: '', userId: misc.getProperty(req.body, 'userId'), 
      promotionId: misc.getProperty(req.body, 'promotionId'),
      enablePromotion: false, enableHistory: false, enableLogout: false, 
      active: 0, count: 0});
}

/*
 * Log user out of system (basically delete their authentication token)
 */
exports.logout = function(req, res){
	console.log('Now logging out!');
  res.render('logout', {title: 'Logout', data: '', userId: misc.getProperty(req.params, 'userId'), 
    promotionId: '', enablePromotion: false, enableHistory: false, enableLogout: true, 
    active: 3, count: 0});
}

/*
 * Ensure user is authorized to access the system by comparing their HMAC-SHA-256 
 * hash of the requested URL to the one generated from their password hash 
 * to the one generated 
 */
exports.validate = function(req, res, next){
  console.log('Beginning validation of this url: ' + req.originalUrl);
  // First make sure query has necessary parameters.
  if (!req.query.hasOwnProperty('timeStamp') || !req.query.hasOwnProperty('hash') || 
      !req.params.hasOwnProperty('userId')){
    console.log('Getting login info!');
    res.status(500).render('login', {title: 'Login', data: '', 
      userId: misc.getProperty(req.params, 'userId'), 
      promotionId: misc.getProperty(req.params, 'promotionId'), 
      enablePromotion: false, enableHistory: false, enableLogout: false, 
      active: 0, count: 0}); 
  }
  // Next, ensure timeStamp is recent to minimize risk of replay attacks
  else if (Math.abs(new Date().getTime() - req.query.timeStamp) >= 5000){
	  console.log('Invalid Time Stamp!');
	  res.status(500).render('login', {title: 'Login', data: '', 
      userId: misc.getProperty(req.params, 'userId'), 
      promotionId: misc.getProperty(req.params, 'promotionId'), 
      enablePromotion: false, enableHistory: false, enableLogout: false, 
      active: 0, count: 0});
  }
  // Then, compare returned hash against one generated from the shared secret
  else{
    var options = {
	    host: res.app.settings['serviceHost'],
	    port: res.app.settings['servicePort'],
      path: '/api/Utility/GetSharedSecret?userId=' + req.params.userId,
      method: 'GET'
    };
    http.request(options, function(resp){
      resp.setEncoding('utf8');
      var arr = '';
      resp.on('data', function(chunk){
        arr += chunk;
      });
      resp.on('end', function(){
        var returnedHash = req.query['hash'];
        // Remove their hash from url & sort query parameters
        var queries = misc.sortProperties(misc.deleteProperty(req.query, 'hash')); 
        var url = req.path;
        var div = '?'
        for (q in queries){
          url = url + div + q + '=' + queries[q];
          div = '&';
        }
        console.log(url + ' ' + arr);
        var computedHash = new Hashes.SHA256().hex_hmac(url, JSON.parse(arr));
        console.log(returnedHash + ' ' + computedHash);
        if (returnedHash == computedHash)
          next();
        else{
          console.log('Incorrect info! Retrieving new login information!');
            res.status(500).render('login', {title: 'Login', data: '', 
              userId: misc.getProperty(req.params, 'userId'), 
              promotionId: misc.getProperty(req.params, 'promotionId'), 
			        enablePromotion: false, enableHistory: false, 
			        enableLogout: false, active: 0, count: 0});
        }
	    });
	    resp.on('error', function(){
		    res.status(500).render('error', {title: 'Error', 
		      data: 'Invalid login credentials!'});
	    });
    }).end();
  }
}

/*
 * Test path to check if a user can access the system
 */
exports.valid = function(req, res){
	console.log('User is authenticated.');
	var data = JSON.stringify({Status: 'Success'});
	res.status(200).end();
}