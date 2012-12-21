var http = require('http');
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.history = function(req, res){
  var userId = req.params.userId;
  var promotionId = null;
  var enablePromotion = false;
  if (req.query.hasOwnProperty('lastPromotionId'))
  {
    promotionId = req.query.lastPromotionId;
    enablePromotion = true;
  }
  var options = {
	host: 'compdev2',
	port: 8087,
	path: '/api/Promotion/GetPromotionsByUser?userId=' + userId,
	//path: '/PromotionWcfR/GetPromotions?userId=' + userId,
	method: 'GET'
  };
  http.request(options, function(resp){
    resp.setEncoding('utf8');
	var arr = '';
    resp.on('data', function (chunk){
	  arr += chunk;
    });
	resp.on('end', function (){
		console.log(arr);
	  var data = JSON.parse(arr);
	  var pending = [], approved = [], rejected = [];
	  for (promo in data){
	    for (param in data[promo]){
	      data[promo][param] = data[promo][param].replace(/&amp;/g, '&');
	    }
      if (data[promo]['ApprovalStatus'] == 'Approval In Progress')
        pending.push(data[promo]);
      else if (data[promo]['ApprovalStatus'] == 'Approved')
        approved.push(data[promo]);
      else
        rejected.push(data[promo]);
	  }
	  res.render('promotionlist', {title: 'History', data: data, userId: userId, promotionId: promotionId,
        enablePromotion: enablePromotion, enableHistory: true, enableLogout: true, active: 2, pending: pending, approved: approved, rejected: rejected});
	});
  }).end();
}

exports.promotion = function(req, res){
  var userId = req.params.userId;
  var promotionId = req.params.promotionId;
  var options = {
	host: 'compdev2',
	port: 8087,
	path: '/api/Promotion/GetPromotionById?promotionId=' + promotionId,
    //path: '/PromotionWcfR/GetPromotionById?promotionId=' + promotionId,
	method: 'GET'
  };
  http.request(options, function(resp){
    resp.setEncoding('utf8');
	var arr = '';
    resp.on('data', function (chunk){
	  arr += chunk;
    });
	resp.on('end', function (){
	  var data = JSON.parse(arr);
	  //console.log(JSON.stringify(data));
	  var enableApprover = false;
	  if (data['ApprovalStatus'] == 1 || data['ApprovalStatus'] == 2)
	    enableApprover = true;
	  res.render('promotiondetail', {title: 'Detail', data: data, userId: userId, promotionId: promotionId,
	    enablePromotion: true, enableHistory: true, enableLogout: true, enableApprover: enableApprover, active: 1});
	});
  }).end();
};

exports.decision = function(req, res){
  console.log(JSON.stringify(req.params) + JSON.stringify(req.body));
  var userId = req.params.userId;
  var promotionId = req.params.promotionId;
  var decision = req.body.decision;
  var creatorEmail = req.body.creatorEmail;
  var reason = '';
  var path = '';
  var postData = '';
  if (req.body.hasOwnProperty('reason'))
    reason = req.body.reason;
  if (decision == 'Approve') {
    path = '/api/Promotion/ApprovePromotion?promotionId=' + promotionId;
    //path = '/PromotionWcfR/ApprovePromotion?id=' + promotionId;
    postData = JSON.stringify({id: promotionId});
  }
  else if (decision == 'Reject') {
    path = '/api/Promotion/RejectPromotion?promotionId=' + promotionId + '&reason=' + encodeURIComponent(reason);
    //path = '/PromotionWcfR/RejectPromotion?id=' + promotionId + '&reason=' + encodeURIComponent(reason);
    postData = JSON.stringify({id: promotionId, reason: reason});
  }
  var options = {
	  host: 'compdev2',
	  port: 8087,
    path: path,
    method: 'POST',
    header: {
      'content-type': 'application/json',
      'content-length': postData.length
    }
  };
  var postReq = http.request(options, function(resp){
    console.log('STATUS: ' + resp.statusCode);
    console.log('HEADERS: ' + JSON.stringify(resp.headers));
    resp.setEncoding('utf8');
	  var arr = '';
    resp.on('data', function (chunk){
	    arr += chunk;
    });
	  resp.on('end', function (){
	    var data = JSON.parse(arr);
	    console.log('BODY: ' + JSON.stringify(data));
	    //res.redirect('/' + userId + '/history');
      res.render('decision', {title: decision + ' Promotion', data: data, userId: userId, promotionId: promotionId, 
        enablePromotion: true, enableHistory: true, enableLogout: true, active: 0, decision: decision, creatorEmail: creatorEmail});
    });
  });
  postReq.write(postData);
  postReq.end();
};

exports.media = function(req, res){
  var options = {
	host: 'compdev2',
	port: 8087,
    path: '/api/Promotion/GetMediaFile?fileId=' + req.params.fileId,
    //path: '/PromotionWcfR/GetPromotionMediaById?fileId=' + req.params.fileId,
    method: 'GET'
  };
  var fname = req.query.fileName;
  var mimetype = req.query.mimeType;
  console.log(fname + ' ' + mimetype);
  http.request(options, function(resp){
	  if (resp.statusCode != 200){
		  console.log('File not found!');
		  return;
		}
	  resp.setEncoding('hex');
    var arr = '';
	  resp.on('data', function (chunk){
      arr += chunk;
      console.log(JSON.stringify(chunk));
	  });
    resp.on('end', function (){
      console.log(JSON.stringify(arr));
      var len = arr.length;
      var minify = false;
      //if (req.query.hasOwnProperty('minify'))
      //  minify = req.query.minify;
	    console.log('I got here!');
	    res.writeHead(200, {
		    'Content-Type': mimetype,
		    'Content-Length': len,
		    'Content-Disposition': 'Attachment;filename='+ fname
	    });
	    res.end(arr);
	  });
  }).end();
}