var moduleKeywords = ['included', 'extended'];


var Module = function(){

  function Module() {
    if (typeof this.init === "function") {
      this.init.apply(this, arguments);
    }
  }
}

Module.include = function(obj) {
  if (!obj) throw new Error('include(obj) requires obj');
  for (var key in obj) if ( moduleKeywords.indexOf(key)  < 0) this.prototype[key] = obj[key];
  if (obj.included) obj.included.apply(this);
  return this;
};

Module.extend = function(obj) {
  if (!obj) throw new Error('extend(obj) requires obj');
  for (key in obj) if (moduleKeywords.indexOf(key) < 0) this[key] = obj[key];
  if (obj.extended) obj.extended.apply(this);
  return this;
};

Module.proxy = function(func) {
  return (function(_this) {
    return function() {
      return func.apply(_this, arguments);
    };
  })(this);
};

Module.prototype.proxy = Module.proxy;
  
Module.create = Module.sub = function(instances, statics) {
  var Result;
  Result = (function(_super) {
    Module.clone(Result, _super);

    function Result() {
      return Result.__super__.constructor.apply(this, arguments);
    }
    return Result;

  })(this);

  if (instances) {
    Result.include(instances);
  }
  if (statics) {
    Result.extend(statics);
  }
  if (typeof Result.unbind === "function") {
    Result.unbind();
  }
  return Result;
};


Module.clone = function(child, parent) { 
  for (var key in parent) { 
    if ({}.hasOwnProperty.call(parent, key)){
      child[key] = parent[key]; 
    }
  } 

  function ctor() { 
    this.constructor = child; 
  } 
  ctor.prototype = parent.prototype; 
  child.prototype = new ctor(); 
  child.__super__ = parent.prototype; 
  return child; 
};

module.exports = Module;