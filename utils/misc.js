exports.contains = function(arr, obj){
  for (i in arr){
    if (arr.hasOwnProperty(i) && arr[i] === obj){
      return true;
    }
  }
  return false;
};

exports.getProperty = function(obj, p){
  if (obj === null || p === null){
    return null;
  }
  return obj.hasOwnProperty(p) ? obj[p] : '';
};

exports.getAllProperties = function(obj){
  if (obj === null){
    return null;
  }
  var no = {};
  for (prop in obj){
    if (obj.hasOwnProperty(prop)){
      no[prop] = obj[prop];
    }
  }
  return no;
};

exports.sortProperties = function(obj){
  if (obj === null){
    return obj;
  }
  var keys = [], nd = {};
  for (var key in obj){
    if (obj.hasOwnProperty(key)){
      keys.push(key);
    }
  }
  keys = keys.sort();
  for (var k in keys)
    if (obj.hasOwnProperty(keys[k]))
      nd[keys[k]] = obj[keys[k]];
  return nd;
};

exports.deleteProperty = function(obj, p){
  if (obj == null){
    return obj;
  }
  if (obj.hasOwnProperty(p)){
    delete obj[p];
  }
  return obj;
};

exports.replaceQuotes = function(str){
  if (str == null || str == ''){
    return str;
  }
  var newparams = [];
  var params = str.split(',');
  for (var param in params){
    var kv = params[param].split(':');
    kv[0] = kv[0].split('"').join('');
    newparams.push(kv.join(':'));
  }
  return newparams.join(',');
};
