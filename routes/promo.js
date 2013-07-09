var http = require('http')
  , request = require('request')
  , misc = require('../utils/misc');

/*
 * This file deals with displaying, approving  rejecting promotions.
 */

/*
 * Display Current & Past Promotions
 */
exports.history = function(req, res){
  console.log('Retrieving history for user: ' + req.params.userId);
  var userId = req.params.userId;
  var promotionId = misc.getProperty(req.query, 'lastPromotionId');
  var enablePromotion = false;
  if (promotionId != ''){
    enablePromotion = true;
  }
  // Call webservice to get list of promotions
  var options = {
    host: res.app.settings['serviceHost'],
    port: res.app.settings['servicePort'],
    path: '/api/Promotion/GetPromotionsByUser?userId=' + userId,
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
      // Sort returned data into three groups: Pending, Approved & Rejected
      var pending = [], approved = [], rejected = [];
      var count = 0;
      for (promo in data){
        for (param in data[promo]){
          data[promo][param] = data[promo][param].replace(/&amp;/g, '&');
        }
        if (data[promo]['ApprovalStatus'] === 'Approval In Progress'){
          pending.push(data[promo]);
          count++;
        }
        else if (data[promo]['ApprovalStatus'] === 'Approved'){
          approved.push(data[promo]);
        }
        else{
          rejected.push(data[promo]);
	}
      }
      console.log('Count: ' + count);
      res.render('promotionlist', {title: 'History', data: data, userId: userId,
        promotionId: promotionId,enablePromotion: enablePromotion, 
	enableHistory: true, enableLogout: true, active: 2, count: count, 
        pending: pending, approved: approved, rejected: rejected}
      );
    });
  }).end();
}

/*
 * Display detailed promotion information
 */
exports.promotion = function(req, res){
  console.log('Retrieving info on promotion ' + req.params.promotionId);
  var userId = req.params.userId;
  var promotionId = req.params.promotionId;
  // Call webservice to retrieve detailed promotion information
  var options = {
    host: res.app.settings['serviceHost'],
    port: res.app.settings['servicePort'],
    path: '/api/Promotion/GetPromotionById?promotionId=' + promotionId +
	  '&userId=' + userId,
    method: 'GET'
  };
  http.request(options, function(resp){
    resp.setEncoding('utf8');
    var arr = '';
    resp.on('data', function (chunk){
      arr += chunk;
    });
    resp.on('end', function (){
      // Handle case when webservice returns no data
      if (resp.statusCode != 200){
        res.status(404).render('error', {title: 'Promotion Error', 
          data: 'Cannot find this promotion!'}
        );
      }
      else{
        // Enable approving & rejecting promotion if user is authorized
        var data = JSON.parse(arr);
	var enableApprover = false, canView = false;
        for (approver in data['Approvers']){
          if (data['Approvers'][approver]['UserId'] == userId)
            canView = true;
          if (data['ApprovalStatus'] != 3 && data['Approvers'][approver]['UserId'] == userId && 
             (data['Approvers'][approver]['ApprovalStatus'] == 1 || 
              data['Approvers'][approver]['Role'].toUpperCase() == 'ADMIN'))
            enableApprover = true;
        }
        var count = data['PendingCount'] ? data['PendingCount'] : 0;
        console.log('Count: ' + count);
        if (canView == true){
	  res.render('promotiondetail', {title: 'Detail', data: data, userId: userId, 
	    promotionId: promotionId, enablePromotion: true, enableHistory: true, 
	    enableLogout: true, enableApprover: enableApprover, active: 1,
            count: count});
        }
        else{
          res.status(500).render('error', {title: 'Promotion  Error',
            data: 'You do not have authorization to view this promotion!'}
        );
      }
    });
  }).end();
}

/*
 * Handles approving & rejecting promotions
 */
exports.decision = function(req, res){
  console.log('Approving / Rejecting a Promotion!');
  var userId = req.params.userId;
  var promotionId = req.params.promotionId;
  var decision = misc.getProperty(req.body, 'decision');
  var reason = misc.getProperty(req.body, 'reason');
  var count = misc.getProperty(req.query, 'count');
  if (count > 0) count--;
  var url = '';
  var postData = '';
  // Determine if the user is approving or rejecting a promotion
  if (decision == 'Approve') {	
    path = res.app.settings['serviceUrl'] + '/api/Promotion/ApprovePromotion';
    postData = 'promotionId=' + promotionId + '&userId=' + userId;
  }
  else if (decision == 'Reject') {
    path = res.app.settings['serviceUrl'] + '/api/Promotion/RejectPromotion';
    postData = 'promotionId=' + promotionId + '&userId=' + userId + 
      '&reasonText=' + encodeUriComponent(reason);
  }
  // Post data to remote webservice to approve or reject the promotion
  //request(
  //  {url: url, body: postData, method: 'POST', headers: {
  //    'Content-Type': 'application/x-www-form-urlencoded', 
  //    'Content-Length': postData.length, 'Accept': '*/*'}
  //  },
  //  function(e, r, user){
  //    res.render('decision', {title: decision + ' Promotion', data: '', 
  //      userId: userId, promotionId: promotionId, enablePromotion: true, 
  //      enableHistory: true, enableLogout: true, active: 1, count: count, 
  //      decision: decision});
  //  }
  //);
  var options = {
    host: res.app.settings['serviceHost'],
    port: res.app.settings['servicePort'],
    path: path,
    method: 'POST',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };
  var postReq = http.request(options, function(resp){
    resp.setEncoding('utf8');
	  var arr = '';
    resp.on('data', function(chunk){
	    arr += chunk;
    });
    resp.on('end', function(){
      if (resp.statusCode != 200){
        res.render('error', {title: 'Approve/Reject Error',
          data: 'Could not approve/reject promotion!'}
        );
      }
      else{
        res.render('decision', {title: decision + ' Promotion', data: '', 
          userId: userId, promotionId: promotionId, enablePromotion: true, 
          enableHistory: true, enableLogout: true, active: 1, count: count, 
          decision: decision}
        );
      }
    });
    // Handle errors
    resp.on('error', function(e){
      res.render('error', {title: 'Approve/Reject Error', data: JSON.stringify(e)});
    });
  });
  postReq.write(postData); // POST data to server
  postReq.end(); // end http.request
}

/*
 * Retrieve media file linked to a promotion
 */
exports.media = function(req, res){
  // Call remote webservice to retrieve Base-64 encoded string containing the file 
  var options = {
    host: res.app.settings['serviceHost'],
    port: res.app.settings['servicePort'],
    path: '/api/Promotion/GetMediaByFileId?fileId=' + req.params.fileId,
    //path: '/PromotionWcfR/GetPromotionMediaById?fileId=' + req.params.fileId,
    method: 'GET'
  };
  http.request(options, function(resp){
    if (resp.statusCode != 200){
      return;
    }
    resp.setEncoding('utf8');
    var arr = '';
    resp.on('data', function (chunk){
      arr += chunk;
    });
    resp.on('end', function (){
      var data = JSON.parse(arr);
	    var binFile; // Use a Buffer object to handle binary data
      var len;
	    var fname;
      var minify = misc.getProperty(req.query, 'minify');
      // If the file is an image to be displayed in-browser, 
      // display the pop-up image instead of the full image
      if (minify == true && data['FileType'] == 1 && 
          data['FileName'] != data['ImagePopupImageFileName']) {
              binFile = new Buffer(data['PopupContent'], 'base64');
              len = binFile.length;
              fname = data['ImagePopupImageFileName'];
      }
      else {
        binFile = new Buffer(data['docContent'], 'base64');
        len = binFile.length;
	fname = data['FileName'];
      }
      // Return file 
      res.writeHead(200, {
              'Content-Type': data['MimeType'],
              'Content-Length': len,
              'Content-Disposition': 'Attachment;filename='+ fname
      });
      res.end(binFile);
    });
  }).end();
}
