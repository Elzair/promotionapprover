/*! MyUtils */
function sortProperties(obj){
  var keys = [], nd = {};
  for (var key in obj)
    if (obj.hasOwnProperty(key))
      keys.push(key);
  keys = keys.sort();
  for (var k in keys)
    if (obj.hasOwnProperty(keys[k]))
      nd[keys[k]] = obj[keys[k]];
  return nd;
}

function getProperty(obj, p){
  return obj.hasOwnProperty(p) ? obj[p] : '';
}

function completeUrl(url, key){
  if (url == null || url == '' || key == null || key == '')
    return '';
  uri = new Uri(url).setProtocol('').setHost('').setPort('')
    .deleteQueryParam('timeStamp', 'hash').addQueryParam('timeStamp', 
      new Date().getTime().toString());
  uri.setQuery(sortProperties(uri.getQueryParams()));
  hash = new Hashes.SHA256().hex_hmac(uri.toString(), key);
  uri = uri.addQueryParam('hash', hash);
  return uri.toString();
}
