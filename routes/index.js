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
	path: '/PromotionWcfR/GetRequestsForApproval?userId=' + userId,
	method: 'GET'
  };
  http.request(options, function(resp){
    //console.log('STATUS: ' + resp.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(resp.headers));
    resp.setEncoding('utf8');
	var arr = '';
    resp.on('data', function (chunk){
      //console.log('BODY: ' + chunk);
	  arr += chunk;
    });
	resp.on('end', function (){
	  var data = JSON.parse(arr);
	  //console.log('FULL BODY: ' + JSON.stringify(data));
	  res.render('promotionlist', {title: 'History', data: data, enablePromotion: enablePromotion, userId: userId, promotionId: promotionId});
	});
  }).end();
}

exports.promotion = function(req, res){
  var userId = req.params.userId;
  var promotionId = req.params.promotionId;
  var options = {
	host: 'compdev2',
	port: 8087,
	path: '/PromotionWcfR/GetPromotionById?promotionId=' + promotionId,
	method: 'GET'
  };
  http.request(options, function(resp){
    //console.log('STATUS: ' + resp.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(resp.headers));
    resp.setEncoding('utf8');
	var arr = '';
    resp.on('data', function (chunk){
      //console.log('BODY: ' + chunk);
	  arr += chunk;
    });
	resp.on('end', function (){
	  var data = JSON.parse(arr);
	  var enableApprover = false;
	  if (data['ApprovalStatus'] == 1 || data['ApprovalStatus'] == 2)
	    enableApprover = true;
	  //console.log('FULL BODY: ' + JSON.stringify(data));
	  res.render('promotiondetail', {title: 'Detail', data: data, enableApprover: enableApprover, userId: userId, promotionId: promotionId});
	});
  }).end();
};

exports.decision = function(req, res){
  console.log(JSON.stringify(req.params) + JSON.stringify(req.body));
  var userId = req.params.userId;
  var promotionId = req.params.promotionId;
  var decision = req.body.decision;
  var reason = '';
  var path = '';
  if (req.body.hasOwnProperty('reason'))
    reason = req.body.reason;
  if (decision == 'Approve')
    path = '/PromotionWcfR/ApprovePromotion?id=' + promotionId;
  else if (decision == 'Reject')
    path = '/PromotionWcfR/RejectPromotion?id=' + promotionId + '&reason=' + encodeURIComponent(reason);
  var options = {
    host: 'compdev2',
    port: 8087,
    path: path,
    method: 'POST',
    header: {
      'content-type': 'application/json',
      'content-length': req.body.length
    }
  };
  http.request(options, function(resp){
    console.log('STATUS: ' + resp.statusCode);
    console.log('HEADERS: ' + JSON.stringify(resp.headers));
    resp.setEncoding('utf8');
	var body = '';
    resp.on('data', function (chunk){
      //console.log('BODY: ' + chunk);
	  body += chunk;
    });
	resp.on('end', function (){
	  //var data = JSON.parse(arr);
	  console.log('BODY: ' + JSON.stringify(body))
    });
  }).end();
};

exports.media = function(req, res){
  var options = {
    host: 'compdev2',
    port: 8087,
    path: '/PromotionWcfR/GetPromotionMediaById?fileId=' + req.params.fileId,
    method: 'GET'
  };
  //console.log(options['path']);
  http.request(options, function(resp){
    //console.log('STATUS: ' + resp.statusCode);
	//console.log('HEADERS: ' + JSON.stringify(resp.headers));
	if (resp.statusCode != 200)
		return;
	resp.setEncoding('utf8');
    var arr = '';
	resp.on('data', function (chunk){
	//console.log('BODY: ' + chunk);
      arr += chunk;
	});
    resp.on('end', function (){
	  //console.log(JSON.stringify(arr));
      var data = JSON.parse(arr);
	  var binFile;
      var len;
	  var fname;
      var minify = false;
      if (req.query.hasOwnProperty('minify'))
        minify = req.query.minify;
	  //console.log(data['UploadFileType'] + ' ' + data['FileName'] + ' ' + data['ImageThumbnailFileName'])
	  if (minify == true && data['UploadFileType'] == 1 && data['FileName'] != data['ImagePopupImageFileName']) {
		binFile = new Buffer(data['PopupContent']);
		len = data['PopupContent'].length;
		fname = data['ImagePopupImageFileName'];
	  }
	  else {
		binFile = new Buffer(data['docContent']);
        len = data['docContent'].length;
		fname = data['FileName'];
	  }
	  res.writeHead(200, {
		'Content-Type': data['MimeType'],
		'Content-Length': len,
		'Content-Disposition': 'Attachment;filename='+ fname
	  });
	  res.end(binFile);
	});
  }).end();
}