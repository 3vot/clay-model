var test = require('tape');
var Module = require("../lib/module")
var Model = require("../lib")
var Q = require("kew")

function Ajax(eventName, model, options){
  if(eventName == "create") return Ajax.post.call(this, model,options )
  else if(eventName == "update") return Ajax.put.call(this, model,options )
  else if(eventName == "destroy") return Ajax.del.call(this, model,options )
  
  //Sho
  var params = model;
  if(eventName == "query") return Ajax.query.call(this, params, options);  
  else if(eventName == "read") return Ajax.get.call(this, params, options);

}




test('Create Records', function (t) {
  t.plan(1);
  var Asset = Model.new("Asset", ["name", "visible", "contact_methods"]);
  Asset.ajax = Ajax;

  Ajax.post = function(model, options){
    //t.equal(this.name , "test.pdf");  
    var that = this;
    var defer = Q.defer();

    setTimeout(function(){

     defer.resolve(that);
    },100);

    return defer.promise;
  }

  Asset.create({name: "test.pdf"})
  .then( function( value ){ t.equal( value.name, "test.pdf" ) } )

})



test('update Records', function (t) {
  t.plan(1);
  var Asset = Model.new("Asset", ["name", "visible", "contact_methods"]);
  Asset.ajax = Ajax;

  Ajax.put = function(model, options){
    var that = this;
    var defer = Q.defer();

    setTimeout(function(){
     defer.resolve();
    },100);

    return defer.promise;
    
  }

  var asset = Asset.create({name: "test.pdf"}, { ignoreAjax: true });
  
  asset.visible = true;
  asset.save()
  .then( function( value ){ t.equal( value.visible, true ) } )  
})

test('delete Records', function (t) {
  t.plan(1);
  var Asset = Model.new("Asset", ["name", "visible", "contact_methods"]);
  Asset.ajax = Ajax;

  Ajax.del = function(model, options){
    var that = this;
    var defer = Q.defer();

    setTimeout(function(){
     defer.resolve();
    },100);

    return defer.promise;
    
  }

  var asset = Asset.create({name: "test.pdf"}, { ignoreAjax: true });
  
  asset.destroy()
  .then( function(  ){ t.equal( Asset.count(), 0 ) } )  ;
})




test('Query Records', function (t) {
  t.plan(1);
  var Asset = Model.new("Asset", ["name", "visible", "contact_methods"]);
  Asset.ajax = Ajax;

  Ajax.query = function(model, options){
    var that = this;
    var defer = Q.defer();

    setTimeout(function(){
     defer.resolve([{name: "name1", id: 1},{name: "name2", id: 2}]);
    },100);

    return defer.promise;
    
  }

  Asset.query("select * from asset")
  .then( function( assets ){ t.equal( Asset.count(),2 ) } )  
})


test('Read Records', function (t) {
  t.plan(1);
  var Asset = Model.new("Asset", ["name", "visible", "contact_methods"]);
  Asset.ajax = Ajax;

  Ajax.get = function(id, options){
    var that = this;
    var defer = Q.defer();

    setTimeout(function(){
     defer.resolve({name: "name1", id: id});
    },100);

    return defer.promise;
    
  }

  Asset.read(333)
  .then( function( asset ){ t.equal( asset.id, 333 ) }) 
})


test('Api', function (t) {
  t.plan(1);
  var Asset = Model.new("Asset", ["name", "visible", "contact_methods"]);
  Asset.ajax = Ajax;

  Ajax.api = function(){
    var args = arguments;
    var defer = Q.defer();

    setTimeout(function(){
     defer.resolve(args);
    },100);

    return defer.promise;
    
  }

  Asset.api("name", 3)
  .then( function( result ){ console.log(result);  t.equal( result.length, 2 ) }) 
})



