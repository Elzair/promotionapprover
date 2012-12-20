exports.getProperty = function(dict, attr){
  return dict.hasOwnProperty(attr) ? dict[attr] : '';
}

exports.sortDictionary = function(dict){
  var keys = [];
  var nd = {};
  for (var key in dict)
    if (dict.hasOwnProperty(key))
      keys.push(key);
  keys = keys.sort();
  for (var k in keys)
    if (dict.hasOwnProperty(k))
      nd.push(dict[k]);
  return nd;
}

exports.deleteElement = function(dict, el){
  delete dict[el];
  dict.length -= 1;
  return dict;
}

exports.replaceQuotes = function(str){
  var newparams = [];
  var params = str.split(',');
  for (var param in params){
    var kv = params[param].split(':');
    kv[0] = kv[0].split('"').join('');
    newparams.push(kv.join(':'));
  }
  return newparams.join(',');
}