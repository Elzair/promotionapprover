exports.getProperty = function(obj, p){
	if (obj == null || p == null)
	  return null;
  return obj.hasOwnProperty(p) ? obj[p] : '';
}

exports.sortProperties = function(obj){
	if (obj == null)
	  return obj;
  var keys = [], nd = new Object();
  for (var key in obj)
    if (obj.hasOwnProperty(key))
      keys.push(key);
  keys = keys.sort();
  for (var k in keys)
    if (obj.hasOwnProperty(keys[k]))
      nd[keys[k]] = obj[keys[k]];
  console.log('Sorted: ' + JSON.stringify(nd));
  return nd;
}

exports.deleteProperty = function(obj, p){
	if (obj == null)
	  return obj;
  if (obj.hasOwnProperty(p))
    delete obj[p];
  //obj.length -= 1;
  console.log('Deleted: ' + JSON.stringify(obj));
  return obj;
}

exports.replaceQuotes = function(str){
	if (str == null || str == '')
	  return str;
  var newparams = [];
  var params = str.split(',');
  for (var param in params){
    var kv = params[param].split(':');
    kv[0] = kv[0].split('"').join('');
    newparams.push(kv.join(':'));
  }
  return newparams.join(',');
}