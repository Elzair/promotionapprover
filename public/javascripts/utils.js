/*! MyUtils */
var MyUtils = function() {
	var
	sortProperties = function(obj){
	  var keys = [], nd = new Object();
	  for (var key in obj)
	    if (obj.hasOwnProperty(key))
	      keys.push(key);
	  keys = keys.sort();
	  for (var k in keys)
	    if (obj.hasOwnProperty(keys[k]))
	      nd[keys[k]] = obj[keys[k]];
	  return nd;
	},

	deleteProperty = function(obj, p){
	  delete obj[p];
	  obj.length -= 1;
	  return obj;
	},

	getProperty = function(obj, p){
	  return obj.hasOwnProperty(p) ? obj[p] : '';
	},

	completeUrl = function(url, hash){
	  if (url == null || url == '' || hash == null || hash == '')
	    return '';
	  uri = new Uri(url).deleteQueryParam('timeStamp', 'signature').addQueryParam('timeStamp', new Date().getTime().toString());
	  uri.setQuery(sortProperties(uri.getQueryParams()));
    return uri.addQueryParam('signature', hex_hmac_sha512(hash, uri.toString())).toString();
	},
	
	toString = function(){
		return 'This works!';
	}
	
	return{
		completeUrl: completeUrl,
		deleteProperty: deleteProperty,
		getProperty: getProperty,
		sortProperties: sortProperties,
		toString: toString
	};
};