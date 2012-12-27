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

	completeUrl = function(url, key){
	  if (url == null || url == '' || key == null || key == '')
	    return '';
	  uri = new Uri(url).deleteQueryParam('timeStamp', 'hash').addQueryParam('timeStamp', new Date().getTime().toString());
	  uri.setQuery(sortProperties(uri.getQueryParams()));
    var hash = hex_hmac_sha512(key, uri.toString());
    $('.error').html(hash);
    return uri.addQueryParam('hash', hash).toString();
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