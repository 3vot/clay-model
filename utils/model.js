var createObject = Object.create || function(o) {
  var Func;
  Func = function() {};
  Func.prototype = o;
  return new Func();
};

var isArray = function(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
};


var makeArray = function(args) {
  return Array.prototype.slice.call(args, 0);
};

var isBlank = function(value) {
    var key;
    if (!value) {
      return true;
    }
    for (key in value) {
      return false;
    }
    return true;
  };

module.exports = {
	createObject: createObject,
	isArray: isArray,
	makeArray: makeArray,
	isBlank: isBlank
}