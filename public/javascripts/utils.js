/**
 * jQuery.query - Query String Modification and Creation for jQuery
 * Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date: 2008/05/28
 *
 * @author Blair Mitchelmore
 * @version 2.0.0
 *
 **/
var MyUtils = function(input){
	var t = 'test';
	
	var parseThis(i){
		t = i;
	},
	
	parseThis(input),
	
	sortProperties = function(obj){
	  var keys = [];
	  var nd = {};
	  for (var key in obj){
	    if (obj.hasOwnProperty(key)){
	      keys.push(key);
	    }
	  }
	  keys = keys.sort();
	  for (var k in keys){
	    if (obj.hasOwnProperty(k)){
	      nd[k] = obj[k]);
      }
    }
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
	  return url.toString();
	  //uri = new Uri(url).deleteQueryParam('timeStamp', 'signature').addQueryParam('timeStamp', new Date.UTC().toString());
	  //uri.setQueries(sortProperties(uri.getQueries());
	  //return uri.addQueryParam('signature', CryptoJS.HmacSHA512(uri.toString(), hash).toString()).toString();
	},
	
	toString = function(){
		return 'This works!';
	},
	
	clone = function(){
		return new MyUtils('test');
	}
	
	return{
		/*completeUrl: completeUrl,
		deleteProperty: deleteProperty,
		getProperty: getProperty,
		sortProperties: sortProperties,*/
		toString: toString,
		clone: clone
	};
};