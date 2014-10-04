var AjaxUtils, Model,
  __slice = [].slice;

Model = require("../lib/")
var window=null;

AjaxUtils = (function() {
  function AjaxUtils() {}

  AjaxUtils.getURL = function(object) {
    return (typeof object.url === "function" ? object.url() : void 0) || object.url;
  };

  AjaxUtils.getScope = function(object) {
    return (typeof object.scope === "function" ? object.scope() : void 0) || object.scope;
  };

  AjaxUtils.generateURL = function() {
    var args, collection, object, path, scope;
    object = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (window && typeof window.Visualforce !== "undefined") {
      if (object.className) {
        collection = object.className;
        scope = AjaxUtils.getScope(object);
      } else {
        collection = typeof object.constructor.url === 'string' ? object.constructor.url : object.constructor.className;
        scope = AjaxUtils.getScope(object) || AjaxUtils.getScope(object.constructor);
      }
    } else if (object.className) {
      collection = object.className.toLowerCase() + 's';
      scope = AjaxUtils.getScope(object);
    } else {
      if (typeof object.constructor.url === 'string') {
        collection = object.constructor.url;
      } else {
        collection = object.constructor.className.toLowerCase() + 's';
      }
      scope = AjaxUtils.getScope(object) || AjaxUtils.getScope(object.constructor);
    }
    args.unshift(collection);
    args.unshift(scope);
    path = args.join('/');
    path = path.replace(/(\/\/)/g, "/");
    path = path.replace(/^\/|\/$/g, "");
    if (path.indexOf("../") !== 0) {
      return Model.host + "/" + path;
    } else {
      return path;
    }
  };

  AjaxUtils.getCollectionURL = function(object) {
    if (object) {
      if (typeof object.url === "function") {
        return AjaxUtils.generateURL(object);
      } else {
        return object.url;
      }
    }
  };

  return AjaxUtils;

})();

module.exports = AjaxUtils;


