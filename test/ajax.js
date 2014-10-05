var test = require('tape');

var Module = require("../lib/module")

var Model = require("../lib")

test('Create Records', function (t) {
  t.plan(3);
  var Asset = Model.new("Asset", ["name", "visible", "contact_methods"]);
  Asset.ajax = Ajax;

  Ajax.post = function(model, options){
    //t.equal(this.name , "test.pdf");  
    var that = this;
    return {
      then: function(callback){
        return callback(that);
      }
    }
  }

  Ajax.put = function(model, options){
    //t.equal(this.name , "test.pdf");  
    var that = this;
    return {
      then: function(callback){
        that.wasHere= true;
        return callback(that);
      }
    }
  }

  Ajax.del = function(model, options){
    //t.equal(this.name , "test.pdf");  
    var that = this;
    return {
      then: function(callback){
        that.wasHere= false;
        return callback(that);
      }
    }
  }

  var asset;
  Asset.create({name: "test.pdf"})
  .then( function( value ){ asset = value; t.equal( asset.name, "test.pdf" ) } )

  asset.visible = true;
  asset.save()
  .then( function( asset ){ asset = asset; t.equal( asset.wasHere, true ) } )  

  asset.destroy()
  .then( function( asset ){ asset = asset; t.equal( asset.wasHere, false ) } )  

})


test('Query Records', function (t) {
  t.plan(1);
  var Asset = Model.new("Asset", ["name", "visible", "contact_methods"]);
  Asset.ajax = Ajax;

  Ajax.query = function(params, options){
    var that = this;
    return {
      then: function(callback){
        var response = [
          {name: "name1"},
          {name: "name2"}
        ]
        return callback(JSON.stringify(response));
      }
    }
  }

  Asset.query("select * from asset")
  .then( function( assets ){ Asset.refresh( assets ); t.equal( Asset.count(),2 ) } )  
})

test('Read Records', function (t) {
  t.plan(1);
  var Asset = Model.new("Asset", ["name", "visible", "contact_methods"]);
  Asset.ajax = Ajax;

  Ajax.get = function(params, options){
    var that = this;
    return {
      then: function(callback){
        return callback( {name: "name3", id: params} );
      }
    }
  }

  Asset.read(333)
  .then( function( asset ){ t.equal( asset.id, 333 ) }) 
})

function Ajax(eventName, model, options){
  if(eventName == "create") return Ajax.post.call(this, model,options )
  else if(eventName == "update") return Ajax.put.call(this, model,options )
  else if(eventName == "destroy") return Ajax.del.call(this, model,options )
  
  //Sho
  var params = model;
  if(eventName == "query") return Ajax.query.call(this, params, options);  
  else if(eventName == "read") return Ajax.get.call(this, params, options);
  else return Ajax.custom.call(this, model, options);
}



