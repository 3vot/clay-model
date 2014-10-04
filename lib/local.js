if(!localStorage) var localStorage = {};

var Local = function(){
  function Local(){}
}

Local.extended= function() {
  this.change(this.saveLocal);
  return this.fetch(this.loadLocal);
}

Local.saveLocal =function() {
  var result;
  result = JSON.stringify(this);
  return localStorage[this.className] = result;
}

Local.loadLocal = function(options) {
  var result;
  if (options == null) {
    options = {};
  }
  if (!options.hasOwnProperty('clear')) {
    options.clear = true;
  }
  result = localStorage[this.className];
  return this.refresh(result || [], options);
}

module.exports = Local;
Local.localStorage = localStorage;

