var utils = function(Uri, Crypto){
  var sortProperties = function(dict){
    var keys = [];
    var nd = {};
    for (var key in dict){
      if (dict.hasOwnProperty(key)){
        keys.push(key);
      }
    }
    keys = keys.sort();
    for (var k in keys){
      if (dict.hasOwnProperty(k)){
        nd.push(dict[k]);
      }
    }
    return nd;
  },

  deleteProperty = function(dict, el){
    delete dict[el];
    dict.length -= 1;
    return dict;
  },

  getProperty = function(dict, attr){
    return dict.hasOwnProperty(attr) ? dict[attr] : '';
  },

  completeUrl = function(url, hash){
    if (url === null || url === '' || hash === null || hash === ''){
      return '';
    }
    //return url.toString();
    uri = new Uri(url).deleteQueryParam('timeStamp', 'signature').addQueryParam('timeStamp', new Date.UTC().toString());
    uri.setQueries(sortProperties(uri.getQueries());
    return uri.addQueryParam('signature', Crypto.HmacSHA512(uri.toString(), hash).toString()).toString();
  },
  
  testMe = function(){
    return 'This works!';
  };
  
  return{
    completeUrl: completeUrl,
    deleteProperty: deleteProperty,
    getProperty: getProperty,
    sortProperties: sortProperties
  };
};
