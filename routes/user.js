
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.login = function(req, res){
  var userId = ''
  if (req.params.hasOwnProperty('userId'))
    userId = req.params.userId;
  res.render('login', {title: 'Login', userId: userId});
}