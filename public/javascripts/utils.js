/*! MyUtils */
function sortProperties(obj){
	var keys = [], nd = new Object();
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
	uri = new Uri(url).deleteQueryParam('timeStamp', 'hash').addQueryParam('timeStamp', new Date().getTime().toString());
	uri.setQuery(sortProperties(uri.getQueryParams()));
  //var hash = hex_hmac_sha512(key, uri.toString());
  var hash = new Hashes.SHA512().hex_hmac(uri.toString(), key);
  $('.error').html(hash);
  return uri.addQueryParam('hash', hash).toString();
}