var http = require('http')
  , request = require('request')
  , fs = require('fs')
  , misc = require('../utils/misc');

/*
 * This file deals with displaying, approving  rejecting promotions.
 */

/*
 * Display Current & Past Promotions
 */
exports.history = function(req, res){
  console.log('Retrieving history for user: %s', req.params.userId);
  var userId = req.params.userId;
  var promotionId = misc.getProperty(req.query, 'lastPromotionId');
  var enablePromotion = false;
  var count = 0;
  if (promotionId !== ''){
    enablePromotion = true;
  }

  // Get list of promotions from database
  fs.readFile('test.json', function(err, data){
    if (err){
      console.log('Error: %s', err);
      throw err;
    }

    var db = JSON.parse(data);
    var promos = db.Promotions;
    console.log('%j', promos);

    // Sort promotions by their ApprovalStatus
    var pending = [], approved = [], rejected = [];
    for (i=0; i<promos.length; i++){
      // Only show promotion if user is in approval chain
      showPromo = false;
      promo = promos[i];
      a = -1;
      for (j=0; j<promo.Approvers.length; j++){
        if (promo.Approvers[j].UserId === userId){
          showPromo = true;
          a = j;
          //break;
        }
      }
      if (showPromo){
        // Only show some information in the list
        stub = {};
        stub.PromotionId = promo.PromotionId;
        stub.Title = promo.Title;
        stub.Description = promo.Description;
        stub.CreatorName = promo.CreatorName;
        stub.EffectiveDate = promo.EffectiveDate;
        stub.ExpireDate = promo.ExpireDate;
        switch(promo.ApprovalStatus){
          case 1:
            pending.push(stub);
            console.log('%j', stub);
            if (promo.Approvers[a].ApprovalStatus === 2){
              count +=1;
            }
            break;
          case 2:
            pending.push(stub);
            console.log('%j', stub);
            if (promo.Approvers[a].ApprovalStatus === 2){
              count +=1;
            }
            break;
          case 3:
            approved.push(stub);
            console.log('%j', stub);
            break;
          case 4:
            rejected.push(stub);
            console.log('%j', stub);
            break;
          default:
            break;
        }
      }
    }
    var out = { pending: pending, approved: approved, rejected: rejected};
    res.render('promotionlist', {title: 'History', data: out, userId: userId,
      promotionId: promotionId,enablePromotion: enablePromotion, 
      enableHistory: true, enableLogout: true, active: 2, count: count, 
      pending: pending, approved: approved, rejected: rejected}
    );
  });
  // Call webservice to get list of promotions
  //var options = {
  //  host: res.app.settings['serviceHost'],
  //  port: res.app.settings['servicePort'],
  //  path: '/api/Promotion/GetPromotionsByUser?userId=' + userId,
  //  method: 'GET'
  //};
  //http.request(options, function(resp){
  //  resp.setEncoding('utf8');
  //  var arr = '';
  //  resp.on('data', function (chunk){
  //    arr += chunk;
  //  });
  //  resp.on('end', function (){
  //    var data = JSON.parse(arr);
  //    // Sort returned data into three groups: Pending, Approved & Rejected
  //    var pending = [], approved = [], rejected = [];
  //    var count = 0;
  //    for (promo in data){
  //      for (param in data[promo]){
  //        data[promo][param] = data[promo][param].replace(/&amp;/g, '&');
  //      }
  //      if (data[promo]['ApprovalStatus'] === 'Approval In Progress'){
  //        pending.push(data[promo]);
  //        count++;
  //      }
  //      else if (data[promo]['ApprovalStatus'] === 'Approved'){
  //        approved.push(data[promo]);
  //      }
  //      else{
  //        rejected.push(data[promo]);
  //      }
  //    }
  //    console.log('Count: ' + count);
  //    res.render('promotionlist', {title: 'History', data: data, userId: userId,
  //      promotionId: promotionId,enablePromotion: enablePromotion, 
  //      enableHistory: true, enableLogout: true, active: 2, count: count, 
  //      pending: pending, approved: approved, rejected: rejected}
  //    );
  //  });
  //}).end();
};

/*
 * Display detailed promotion information
 */
exports.promotion = function(req, res){
  console.log('Retrieving info on promotion %s', req.params.promotionId);
  var userId = req.params.userId;
  var promotionId = req.params.promotionId;
  var count = 0;
  // Retrieve values from database
  fs.readFile('test.json', function(err, data){
    if (err){
      console.log('Error: %s', err);
      throw err;
    }

    var db = JSON.parse(data);
    var promos = db.Promotions;

    // Retrieve the indicated promotion and the number of 
    // promotions the user has not approved or rejected
    var p = -1;
    for (i=0; i<promos.length; i++){
      if (promos[i].ApprovalStatus === 1 || promos[i].ApprovalStatus === 2){
        for (j=0; j<promos[i].Approvers.length; j++){
          if (promos[i].Approvers[j].UserId === userId && 
              promos[i].Approvers[j].ApprovalStatus === 2){
            count += 1;
          }
        }
      }
      if (promos[i].PromotionId === promotionId){
        p = i;
      }
    }
    // Return an error if the promotion is not found
    if (p === -1){
      res.status(404).render('error', {title: 'Promotion Error', 
        data: 'Cannot find this promotion!'}
      );
      return;
    }
    var promo = promos[p];

    var canView = false, enableApprover = false;
    // Only show promotion if the user is an admin or they are in
    // the approval chain
    for (i=0; i<promo.Approvers.length; i++){
      approver = promo.Approvers[i];
      if (approver.UserId === userId || approver.role === 'ADMIN'){
        canView = true;
        // Enable Approve/Rejecting if the promotion has not already been
        // approved and the user is next in the approval chain
        if (promo.ApprovalStatus !== 3 && approver.ApprovalStatus === 2){
          enableApprover = true;
        }
      }
    }

    // Make Approval Status easier to understand
    switch(promo.ApprovalStatus){
      case 1:
        promo.ApprovalStatus = 'Approval Started';
        break;
      case 2:
        promo.ApprovalStatus = 'Approval in Progress';
        break;
      case 3:
        promo.ApprovalStatus = 'Approved';
        break;
      case 4:
        promo.ApprovalStatus = 'Rejected';
        break;
      default:
        break;
    }

    // Render view
    if (canView){
      res.render('promotiondetail', {title: 'Detail', data: promo, userId: userId,
        promotionId: promotionId, enablePromotion: true, enableHistory: true, 
        enableLogout: true, enableApprover: enableApprover, active: 1,
        count: count});
    }
    else{
      res.status(500).render('error', {title: 'Promotion Error',
        data: 'You do not have permission to view this promotion!'}
      ).end();
      return;
    }
  });
  // Call webservice to retrieve detailed promotion information
  //var options = {
  //  host: res.app.settings['serviceHost'],
  //  port: res.app.settings['servicePort'],
  //  path: '/api/Promotion/GetPromotionById?promotionId=' + promotionId +
  //        '&userId=' + userId,
  //  method: 'GET'
  //};
  //http.request(options, function(resp){
  //  resp.setEncoding('utf8');
  //  var arr = '';
  //  resp.on('data', function (chunk){
  //    arr += chunk;
  //  });
  //  resp.on('end', function (){
  //    // Handle case when webservice returns no data
  //    if (resp.statusCode != 200){
  //      res.status(404).render('error', {title: 'Promotion Error', 
  //        data: 'Cannot find this promotion!'}
  //      );
  //    }
  //    else{
  //      // Enable approving & rejecting promotion if user is authorized
  //      var data = JSON.parse(arr);
  //      var enableApprover = false, canView = false;
  //      for (approver in data['Approvers']){
  //        if (data['Approvers'][approver]['UserId'] == userId){
  //          canView = true;
  //        }
  //        if (data['ApprovalStatus'] != 3 && data['Approvers'][approver]['UserId'] == userId && 
  //           (data['Approvers'][approver]['ApprovalStatus'] == 1 || 
  //            data['Approvers'][approver]['Role'].toUpperCase() == 'ADMIN')) {
  //          enableApprover = true;
  //        }
  //      }
  //      var count = data['PendingCount'] ? data['PendingCount'] : 0;
  //      console.log('Count: ' + count);
  //      if (canView == true){
  //        res.render('promotiondetail', {title: 'Detail', data: data, userId: userId, 
  //          promotionId: promotionId, enablePromotion: true, enableHistory: true, 
  //          enableLogout: true, enableApprover: enableApprover, active: 1,
  //          count: count});
  //      }
  //      else{
  //        res.status(500).render('error', {title: 'Promotion  Error',
  //          data: 'You do not have authorization to view this promotion!'}
  //      );
  //    }
  //  });
  //}).end();
};

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
  if (count > 0) {
    count--;
  }
  // Retrieve promotion from database
  fs.readFile('test.json', function(err, data){
    if (err){
      console.log('Error: %s', data);
      throw err;
    }
    
    var db = JSON.parse(data);
    var promos = db.Promotions;

    // Get the position of the correct promotion
    var p = -1;
    for (i=0; i<promos.length; i++){
      if (promos[i].PromotionId === promotionId){
        p = i;
      }
    }
    // Return an error if the promotion is not found
    if (p === -1){
      res.status(404).render('error', {title: 'Promotion Error', 
        data: 'Cannot find this promotion!'}
      );
      return;
    }
    var promo = promos[p];

    // Get the position of user in the promotion's approval chain
    // and determine if user can approve/reject the promotion
    var a = -1;
    var canApprove = false;
    for (i=0; i<promo.Approvers.length; i++){
      if (promo.Approvers[i].UserId === userId){
        a = i;
        if (promo.ApprovalStatus !== 3 && 
            promo.Approvers[i].ApprovalStatus === 2){
          canApprove = true;
        }
      }
    }

    // Approve/Reject promotion if user has the authorization
    if (!canApprove){
      res.status(500).render('error', {title: 'Promotion Error',
        data: 'User does not have authorization to approve or reject this promotion!'}
      );
      return;
    }
    if (canApprove && decision === 'Approve'){
      db.Promotions[p].Approvers[a].ApprovalStatus = 3;
      // Set promotion to approved if user is last in approval chain
      if (a+1 === promo.Approvers.length){
        db.Promotions[p].ApprovalStatus = 3;
      }
      else{
        db.Promotions[p].ApprovalStatus = 2;
        // Give approve/reject ability to next person in line
        db.Promotions[p].Approvers[a+1].ApprovalStatus = 2;
      }
    }
    // Reject promotion
    else if (canApprove && decision === 'Reject'){
      db.Promotions[p].Approvers[a].ApprovalStatus = 4;
      db.Promotions[p].ApprovalStatus = 4;
      if (j+1 === promo.Approvers.length){
        db.Promotions[p].Approvers[a+1].ApprovalStatus = 2;
      }
    }

    // Store result in database
    var out = JSON.stringify(db, undefined, 2);
    fs.writeFile('test.json', out, function(err){
      if (err){
        console.log('Error: %s', err);
        res.status(403).render('error', {title: 'Promotion Error',
          data: 'Error: Could not approve/reject promotion!'}
        );
        throw err;
      }

      res.render('decision', {title: decision + ' Promotion', data: '', 
        userId: userId, promotionId: promotionId, enablePromotion: true, 
        enableHistory: true, enableLogout: true, active: 1, count: count, 
        decision: decision}
      );
    });
  });
  //var url = '';
  //var postData = '';
  //// Determine if the user is approving or rejecting a promotion
  //if (decision == 'Approve') {	
  //  path = res.app.settings['serviceUrl'] + '/api/Promotion/ApprovePromotion';
  //  postData = 'promotionId=' + promotionId + '&userId=' + userId;
  //}
  //else if (decision == 'Reject') {
  //  path = res.app.settings['serviceUrl'] + '/api/Promotion/RejectPromotion';
  //  postData = 'promotionId=' + promotionId + '&userId=' + userId + 
  //    '&reasonText=' + encodeUriComponent(reason);
  //}
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
  //var options = {
  //  host: res.app.settings['serviceHost'],
  //  port: res.app.settings['servicePort'],
  //  path: path,
  //  method: 'POST',
  //  header: {
  //    'Content-Type': 'application/x-www-form-urlencoded',
  //    'Content-Length': postData.length
  //  }
  //};
  //var postReq = http.request(options, function(resp){
  //  resp.setEncoding('utf8');
  //        var arr = '';
  //  resp.on('data', function(chunk){
  //          arr += chunk;
  //  });
  //  resp.on('end', function(){
  //    if (resp.statusCode != 200){
  //      res.render('error', {title: 'Approve/Reject Error',
  //        data: 'Could not approve/reject promotion!'}
  //      );
  //    }
  //    else{
  //      res.render('decision', {title: decision + ' Promotion', data: '', 
  //        userId: userId, promotionId: promotionId, enablePromotion: true, 
  //        enableHistory: true, enableLogout: true, active: 1, count: count, 
  //        decision: decision}
  //      );
  //    }
  //  });
  //  // Handle errors
  //  resp.on('error', function(e){
  //    res.render('error', {title: 'Approve/Reject Error', data: JSON.stringify(e)});
  //  });
  //});
  //postReq.write(postData); // POST data to server
  //postReq.end(); // end http.request
};

///*
// * Retrieve media file linked to a promotion
// */
//exports.media = function(req, res){
//  // Call remote webservice to retrieve Base-64 encoded string containing the file 
//  var options = {
//    host: res.app.settings['serviceHost'],
//    port: res.app.settings['servicePort'],
//    path: '/api/Promotion/GetMediaByFileId?fileId=' + req.params.fileId,
//    //path: '/PromotionWcfR/GetPromotionMediaById?fileId=' + req.params.fileId,
//    method: 'GET'
//  };
//  http.request(options, function(resp){
//    if (resp.statusCode != 200){
//      return;
//    }
//    resp.setEncoding('utf8');
//    var arr = '';
//    resp.on('data', function (chunk){
//      arr += chunk;
//    });
//    resp.on('end', function (){
//      var data = JSON.parse(arr);
//	    var binFile; // Use a Buffer object to handle binary data
//      var len;
//	    var fname;
//      var minify = misc.getProperty(req.query, 'minify');
//      // If the file is an image to be displayed in-browser, 
//      // display the pop-up image instead of the full image
//      if (minify == true && data['FileType'] == 1 && 
//          data['FileName'] != data['ImagePopupImageFileName']) {
//              binFile = new Buffer(data['PopupContent'], 'base64');
//              len = binFile.length;
//              fname = data['ImagePopupImageFileName'];
//      }
//      else {
//        binFile = new Buffer(data['docContent'], 'base64');
//        len = binFile.length;
//	fname = data['FileName'];
//      }
//      // Return file 
//      res.writeHead(200, {
//              'Content-Type': data['MimeType'],
//              'Content-Length': len,
//              'Content-Disposition': 'Attachment;filename='+ fname
//      });
//      res.end(binFile);
//    });
//  }).end();
//};
