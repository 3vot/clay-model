var test = require('tape');

var Module = require("../lib/module")

var Model = require("../lib")


test('Create Records', function (t) {
  t.plan(1);
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset = Asset.create({name: "test.pdf"});
  t.deepEqual(Asset.first(), asset);
})

test("can update records", function(t){
  t.plan(3);
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset = Asset.create({name: "test.pdf"});

  t.equal(Asset.first().name, "test.pdf");

  asset.name = "wem.pdf";
  asset.save();

  t.equal(Asset.first().name, "wem.pdf");

  t.notOk(asset.hasOwnProperty("name"));    
});

test("can refresh existing records", function(t){
  t.plan(3)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset = Asset.create({name: "test.pdf"});
  t.equal(Asset.first().name,"test.pdf");

  var changedAsset = asset.toJSON();
  changedAsset.name = "wem.pdf";
  Asset.refresh(changedAsset);

  t.equal(Asset.count(),1);
  t.equal(Asset.first().name,"wem.pdf");
});

test("can keep record clones in sync after refreshing the record", function(t){
  t.plan(5)
  
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset = Asset.create({name: "test.pdf"});
  t.equal(Object.getPrototypeOf(asset), Asset.irecords[asset.id] );

  var changedAsset = asset.toJSON();
  changedAsset.name = "wem.pdf";
  Asset.refresh(changedAsset);
  selectedAsset = Asset.select(function(rec){
    return rec.id === asset.id;
  })[0];

  t.equal(asset.name,"wem.pdf");
  t.equal(selectedAsset.name,"wem.pdf");
  t.deepEqual(Object.getPrototypeOf(asset),Asset.irecords[asset.id]);
  t.deepEqual(Object.getPrototypeOf(selectedAsset),Asset.irecords[asset.id]);
});

test("can destroy records", function(t){
  t.plan(2)
  
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset = Asset.create({name: "test.pdf"});
  t.deepEqual(Asset.first(), asset);

  asset.destroy();
  t.notOk(Asset.first());
});

test("can find records", function(t){
  t.plan(2)
  
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);


  var asset = Asset.create({name: "test.pdf"});
  t.ok(Asset.find(asset.id));

  asset.destroy();
  t.notOk(Asset.find(asset.id))
});

test("can use notFound fallback function if records are not found with find", function(t){
  t.plan(11)
  
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  if(!sessionStorage) var sessionStorage = {clear: function(){} }

  var asset = Asset.create({name: "test.pdf"});
  

  t.ok(Asset.find(asset.id));
  // defauly notFound simply returns null
  asset.destroy();
  t.notOk(Asset.find(asset.id));
  // a custom notFound fallback can be added to the find

  var customfallback = function(id){
    sessionStorage.fallbackRan = true
    sessionStorage.fallbackReceivedId = id
    return Asset.create({name: 'test2.pdf', id:id})
  };

  var foundAsset = Asset.find(asset.id, customfallback);
  t.ok(foundAsset)
  t.equal(foundAsset.id, asset.id);
  t.equal(sessionStorage.fallbackRan, true);
  t.equal(sessionStorage.fallbackReceivedId, asset.id);

  // notFound can be customized on the model
  asset.destroy(); //reset
  t.notOk(Asset.find(asset.id)) // test reset worked
  
  Asset.notFound = function(id){
    sessionStorage.fallback2Ran = true
    sessionStorage.fallback2ReceivedId = id
    return Asset.create({name: 'test3.pdf'})
  };
  
  var foundAsset2 = Asset.find(asset.id);
  t.ok(foundAsset2)
  t.equal(foundAsset2.name, 'test3.pdf');
  t.equal(sessionStorage.fallback2Ran, true);
  t.equal(sessionStorage.fallback2ReceivedId, asset.id);

  sessionStorage.clear()
});


test("can findAll records", function(t){
  t.plan(2)
  
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);


  var asset1 = Asset.create({name: "test1.pdf"}),
      asset2 = Asset.create({name: "test2.pdf"});
  t.equal(Asset.findAll([asset1.id, asset2.id]).length, 2);

  asset1.destroy();
  asset2.destroy();
  t.equal(Asset.findAll([asset1.id, asset2.id]).length, 0);
});



test("can use notFound fallback function if records are not found with findAll", function(t){
  t.plan(14)
  
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  if(!sessionStorage) var sessionStorage = {clear: function(){} }

  var asset1 = Asset.create({name: "test1.pdf"}),
      asset2 = Asset.create({name: "test2.pdf"});
  
  t.equal(Asset.findAll([asset1.id, asset2.id]).length,2);
  // defauly notFound simply returns null
  asset1.destroy();
  t.equal(Asset.findAll([asset1.id]).length,0);
  t.equal(Asset.findAll([asset1.id, asset2.id]).length,1);
  // a custom notFound fallback can be added to the findAll
  var customfallback = function(id){
    sessionStorage.fallbackRan = true
    sessionStorage.fallbackReceivedId = id
    return Asset.create({name: 'test3.pdf', id:id})
  };
  var foundAssets = Asset.findAll([asset1.id, asset2.id], customfallback);
  t.equal(foundAssets.length,2);
  t.equal(foundAssets[0].id,asset1.id);
  t.equal(sessionStorage.fallbackRan, true);
  t.equal(sessionStorage.fallbackReceivedId,asset1.id);
  // notFound can be customized on the model
  asset1.destroy(); //reset
  t.equal(Asset.findAll([asset1.id]).length,0); // test reset worked
  t.equal(Asset.findAll([asset1.id, asset2.id]).length,1);
  Asset.notFound = function(id){
    sessionStorage.fallback2Ran = true
    sessionStorage.fallback2ReceivedId = id
    return Asset.create({name: 'test4.pdf'})
  };
  var foundAssets2 = Asset.findAll([asset1.id]);
  t.equal(foundAssets2.length,1);
  t.equal(foundAssets2[0].name,'test4.pdf');
  t.equal(sessionStorage.fallback2Ran, true);
  t.equal(sessionStorage.fallback2ReceivedId,asset1.id);
  t.equal(Asset.findAll([asset1.id, asset2.id]).length,2);

  sessionStorage.clear()
});



test("can check existence", function(t){
  t.plan(5)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset1 = Asset.create({id: 1, name: "test.pdf"});
  var asset2 = Asset.create({id: 2, name: "wem.pdf"});

  t.ok(asset1.exists())
  t.ok(Asset.exists(asset1.id))
  t.equal(Asset.find(asset1.id).name,"test.pdf");

  asset1.destroy();

  t.notOk(asset1.exists())
  t.notOk(Asset.exists(asset1.id))
});

test("can reload", function(t){
  t.plan(3)
      var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset = Asset.create({name: "test.pdf"}).dup(false);

  Asset.find(asset.id).updateAttributes({name: "foo.pdf"});

  t.equal(asset.name,"test.pdf");
  var original = asset.reload();
  t.equal(asset.name,"foo.pdf");

  // Reload should return a clone, more useful that way
  t.equal(Object.getPrototypeOf(Object.getPrototypeOf(original)),Asset.prototype)
});

test("can refresh", function(t){
  t.plan(1)
      var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset = Asset.create({name: 'foo.pdf'});
  var clone = asset.clone();
  clone.refresh({name: 'bar.pdf'});
  t.equal(asset.name,'bar.pdf');
});

test("can select records", function(t){
  t.plan(1)
      var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset1 = Asset.create({name: "test.pdf"});
  var asset2 = Asset.create({name: "foo.pdf"});

  var selected = Asset.select(function(rec){ return rec.name == "foo.pdf" });

  t.deepEqual(selected,[asset2]);
});

test("can return all records", function(t){
  t.plan(1)
      var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset1 = Asset.create({name: "test.pdf"});
  var asset2 = Asset.create({name: "foo.pdf"});

  t.deepEqual(Asset.all(),[asset1, asset2]);
});

test("can return a slice of records", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset0 = Asset.create({name: "test.pdf"});
  var asset1 = Asset.create({name: "foo1.pdf"});
  var asset2 = Asset.create({name: "foo2.pdf"});
  var asset3 = Asset.create({name: "foo3.pdf"});
  var asset4 = Asset.create({name: "foo4.pdf"});
  var asset5 = Asset.create({name: "womp.pdf"});
  var asset6 = Asset.create({name: "wamp.pdf"});
  t.deepEqual(Asset.slice(3),[asset3, asset4, asset5, asset6]);
  t.deepEqual(Asset.slice(4,6),[asset4, asset5]);
});

test("can find records by attribute", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset = Asset.create({name: "foo.pdf"});
  Asset.create({name: "test.pdf"});

  var findOne = Asset.findByAttribute("name", "foo.pdf");
  t.equal(findOne.name,asset.name);

  var findAll = Asset.findAllByAttribute("name", "foo.pdf");
  t.deepEqual(findAll,[asset]);
});

test("can find first/last record", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var first = Asset.create({name: "foo.pdf"});
  Asset.create({name: "test.pdf"});
  var last = Asset.create({name: "wem.pdf"});

  t.deepEqual(Asset.first(),first);
  t.deepEqual(Asset.last(),last);
});

test("can return first(x)/last(x) records", function(t){
      t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset0 = Asset.create({name: "test.pdf"});
  var asset1 = Asset.create({name: "foo1.pdf"});
  var asset2 = Asset.create({name: "foo2.pdf"});
  var asset3 = Asset.create({name: "foo3.pdf"});
  var asset4 = Asset.create({name: "foo4.pdf"});
  var asset5 = Asset.create({name: "womp.pdf"});
  var asset6 = Asset.create({name: "wamp.pdf"});

  t.deepEqual(Asset.last(3),[asset4, asset5, asset6]);
  t.deepEqual(Asset.first(2),[asset0, asset1]);
});

test("can destroy all records", function(t){
     t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  Asset.create({name: "foo.pdf"});
  Asset.create({name: "foo.pdf"});

  t.equal(Asset.count(),2);
  Asset.destroyAll();
  t.equal(Asset.count(),0);
});

test("can delete all records", function(t){
      t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  Asset.create({name: "foo.pdf"});
  Asset.create({name: "foo.pdf"});

  t.equal(Asset.count(),2);
  Asset.deleteAll();
  t.equal(Asset.count(),0);
});

test("can be serialized into JSON", function(t){
      t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var asset = new Asset({name: "Johnson me!"});

  t.equal(JSON.stringify(asset),'{"name":"Johnson me!"}');
});

test("can be deserialized from JSON", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);



  var asset = Asset.fromJSON('{"name":"Un-Johnson me!"}')
  t.equal(asset.name,"Un-Johnson me!");

  var assets = Asset.fromJSON('[{"name":"Un-Johnson me!"}]')
  t.equal(assets[0] && assets[0].name,"Un-Johnson me!");
});


test("can validate", function(t){
  t.plan(4)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  Asset.include({
    validate: function(){
      if ( !this.name )
        return "Name required";
    }
  });

  t.notOk(Asset.create({name: ""}))
  t.notOk(new Asset({name: ""}).isValid())

  t.ok(Asset.create({name: "Yo big dog"}))
  t.ok(new Asset({name: "Yo big dog"}).isValid())
});



test("can have validation disabled", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  Asset.include({
    validate: function(){
      if ( !this.name )
        return "Name required";
    }
  });

  var asset = new Asset;
  t.notOk(asset.save());
  t.ok(asset.save({validate: false}));
});

test("should have an attribute hash", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = new Asset({name: "wazzzup!"});
  t.deepEqual(asset.attributes(),{name: "wazzzup!"});
});

test("attributes() should not return undefined atts", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = new Asset();
  t.deepEqual(asset.attributes(),{});
});

test("can load() attributes", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = new Asset();
  var result = asset.load({name: "In da' house"});
  t.equal(result,asset);
  t.equal(asset.name,"In da' house");
});

test("can load() attributes respecting getters/setters", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  Asset.include({
    name: function(value){
      var ref = value.split(' ', 2);
      this.first_name = ref[0];
      this.last_name  = ref[1];
    }
  })

  var asset = new Asset();
  asset.load({name: "Alex MacCaw"});
  t.equal(asset.first_name,"Alex");
  t.equal(asset.last_name,"MacCaw");
});



test("attributes() respects getters/setters", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  Asset.include({
    name: function(){
      return "Bob";
    }
  })

  var asset = new Asset();
  t.deepEqual(asset.attributes(),{name: "Bob"});
});

test("can generate ID", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = Asset.create({name: "who's in the house?"});
  t.ok(asset.id);
});

test("can generate UUID if enabled", function(t){
  t.plan(3)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  Asset.uuid = function(){ return 'fc0942b0-956f-11e2-9c95-9b0af2c6635d' };
  var asset = new Asset({name: "who's in the house?"});
  t.ok(asset.id);
  t.equal(asset.id,Asset.uuid());
  t.equal(asset.id,asset.cid);
  delete Asset.uuid
});

test("can be duplicated", function(t){
  t.plan(4)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = Asset.create({name: "who's your daddy?"});
  t.equal(Object.getPrototypeOf(asset.dup()),Asset.prototype);

  t.equal(asset.name,"who's your daddy?");
  asset.name = "I am your father";
  t.equal(asset.reload().name,"who's your daddy?");

  t.notEqual(asset,Asset.records[asset.id]);
});

test("can be cloned", function(t){
  t.plan(4)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = Asset.create({name: "what's cooler than cool?"}).dup(false);
  t.notEqual(Object.getPrototypeOf(asset.clone()),Asset.prototype);
  t.equal(Object.getPrototypeOf(Object.getPrototypeOf(asset.clone())),Asset.prototype);

  t.equal(asset.name,"what's cooler than cool?");
  asset.name = "ice cold";
  t.equal(asset.reload().name,"what's cooler than cool?");
});

test("clones are dynamic", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = Asset.create({name: "hotel california"});

  // reload reference
  var clone = Asset.find(asset.id);

  asset.name = "checkout anytime";
  asset.save();

  t.equal(clone.name,"checkout anytime");
});

test("create or save should return a clone", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = Asset.create({name: "what's cooler than cool?"});
  t.notEqual(Object.getPrototypeOf(asset),Asset.prototype);
  t.equal(Object.getPrototypeOf(Object.getPrototypeOf(asset)),Asset.prototype);
});

test("should be able to be subclassed", function(t){
  t.plan(3)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  Asset.extend({
    aProperty: true
  });

  var File = Asset.setup("File");

  t.ok(File.aProperty);
  t.equal(File.className,"File");

  t.deepEqual(File.attributes,Asset.attributes);
});

test("dup should take a newRecord argument, which controls if a new record is returned", function(t){
  t.plan(4)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = Asset.create({name: "hotel california"});
  t.notOk(asset.dup().id)
  t.ok(asset.dup().isNew());

  t.equal(asset.dup(false).id,asset.id);
  t.notOk(asset.dup(false).newRecord);
});

test("should be able to change ID", function(t){
  t.plan(3)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = Asset.create({name: "hotel california"});
  t.ok(asset.id);
  asset.changeID("foo");
  t.equal(asset.id,"foo");

  t.ok(Asset.exists("foo"));
});

test("eql should respect ID changes", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset1 = Asset.create({name: "hotel california", id: "bar"});
  var asset2 = asset1.dup(false);

  asset1.changeID("foo");
  t.ok(asset1.eql(asset2));
});

test("should not delete reference to cID when changing ID", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = Asset.create({name: "hotel california"});
  var cid = asset.cid;

  asset.changeID(1);
  t.ok(Asset.exists(cid));
});

test("new records should not be eql", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset1 = new Asset;
  var asset2 = new Asset;
  t.notOk(asset1.eql(asset2))
});

test("should generate unique cIDs", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  Asset.refresh({name: "Bob", id: 3});
  Asset.refresh({name: "Bob", id: 2});
  Asset.refresh({name: "Bob", id: 1});
  t.notOk(Asset.find(2).eql(Asset.find(1)))
});

test("should handle more than 10 cIDs correctly", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  for (i=0; i < 12; i++) {
    Asset.refresh({name: "Bob", id: i});
  }
  t.equal(Asset.idCounter,12);
});

test("should keep model references in sync", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  ref1 = Asset.create({name: "Bob"});
  ref2 = Asset.all()[0]
  ref1.updateAttribute("name", "Jack");
  ref2.updateAttribute("name", "Smith");
  t.equal(ref2.name,ref1.name);
});

test("should return records in the same order they were created", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  ref1 = Asset.create({name: "Bob", id: "1"});
  ref2 = Asset.create({name: "Jan", id: "some long string id"});
  ref3 = Asset.create({name: "Pat", id: "33"});
  ref4 = Asset.create({name: "Joe", id: 444});
  t.equal(Asset.last().id,ref4.id);
  t.equal(Asset.first().id,ref1.id);
});

test("should preserve relative order of records when instances created or destroyed", function(t){
  t.plan(7)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  ref1 = Asset.create({name: "Bob", id: "1"});
  ref2 = Asset.create({name: "Jan", id: "some long string id"});
  t.equal(Asset.last().id,ref2.id);
  ref3 = Asset.create({name: "Pat", id: "33"});
  ref4 = Asset.create({name: "Joe", id: 444});
  t.equal(Asset.last().id,ref4.id);
  t.equal(Asset.first().id,ref1.id);
  ref4.destroy();
  t.equal(Asset.last().id,ref3.id);
  t.equal(Asset.first().id,ref1.id);
  ref1.destroy();
  t.equal(Asset.last().id,ref3.id);
  t.equal(Asset.first().id,ref2.id);
});

test("should return records in the in the order defined by the @comparator", function(t) {
  t.plan(5)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  Asset.comparator = function(a,b) { return a.id - b.id };
  ref1 = Asset.create({name: "Bob", id: 3});
  ref2 = Asset.create({name: "Jan", id: 1});
  ref3 = Asset.create({name: "Pat", id: 8});
  ref4 = Asset.create({name: "Joe", id: 4});
  
  t.equal(Asset.last().id,ref3.id);
  t.equal(Asset.first().id,ref2.id);
  // after adding or removing items comparator should still work
  ref5 = Asset.create({name: "Bob", id: 6});
  t.equal(Asset.last().id,ref3.id);
  ref6 = Asset.create({name: "Jan", id: 11});
  t.equal(Asset.last().id,ref6.id);
  ref2.destroy()
  t.equal(Asset.first().id,ref1.id);
});


test("can interate over records", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  function test(){
    t.equal(1,1);
  }

  var asset1 = Asset.create({name: "test.pdf"});
  var asset2 = Asset.create({name: "foo.pdf"});

  Asset.each(test);

});

test("can fire create events", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  function spy(){
    t.equal(1,1);
  }

  Asset.bind("create", spy);
  var asset = Asset.create({name: "cartoon world.png"});
  //expect(spy).toHaveBeenCalledWith(asset, {});
});


  test("can fire save events", function(t){
    t.plan(2)
    var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

    function spy(){
      t.equal(1,1);
    }
    Asset.bind("save", spy);
    var asset = Asset.create({name: "cartoon world.png"});
    
    asset.save();
    
  });

test("can fire update events", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  function spy(){
    t.equal(1,1);
  }
  
  Asset.bind("update", spy);

  var asset = Asset.create({name: "cartoon world.png"});
   // expect(spy).not.toHaveBeenCalledWith(asset);

  asset.save();
    //expect(spy).toHaveBeenCalledWith(asset, {});
});

  test("can fire destroy events", function(t){
    t.plan(1)
    var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

    function spy(){
      t.equal(1,1);
    }
    Asset.bind("destroy", spy);
    var asset = Asset.create({name: "cartoon world.png"});
    asset.destroy();
    //expect(spy).toHaveBeenCalledWith(asset, {clear: true});
});

  test("can fire destroy events when destroy all record with options", function(t){
    t.plan(1)
    var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

    function spy(){
      t.equal(1,1);
    }

    Asset.bind("destroy", spy);
    var asset = Asset.create({name: "screaming goats.png"});
    Asset.destroyAll({ajax: false});
    //expect(spy).toHaveBeenCalledWith(asset, {ajax: false, clear: true});
});



test("can fire refresh events", function(t){
  t.plan(4)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  function spy(values, options){
    t.deepEqual(values, [])
    t.deepEqual(options,{refresh: true, clear: true});
    Asset.unbind("refresh",spy);
  }

  var tmpRecords;

  Asset.bind("refresh", spy);

  var values = JSON.stringify([]);
  Asset.refresh(values, {refresh: true, clear: true});
  //expect(spy).toHaveBeenCalledWith([], {refresh: true, clear: true});

  var asset = Asset.create({name: "test.pdf"});
  var values = asset.toJSON();

  Asset.bind("refresh", spy1)
  function spy1(values, options){
    //t.deepEqual(values, tmpRecords)
    t.deepEqual(options,{clear: true});
        Asset.unbind("refresh",spy1);
  }
  Asset.refresh(values, {clear: true});

  var asset1 = Asset.create({id: 1, name: "test.pdf"});
  var asset2 = Asset.create({id: 2, name: "wem.pdf"});
  var values = JSON.stringify([asset1, asset2]);

  Asset.bind("refresh", spy2)
  function spy2(values, options){
    t.deepEqual(options,{ clear: true});
  }
  Asset.refresh(values, {clear: true});
});


test("can fire events on record", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);
  var asset = Asset.create({name: "cartoon world.png"});
  function spy(value){
    t.deepEqual(value, asset)
  }
    
  asset.bind("save", spy);
  asset.save();

});

test("can fire change events on record", function(t){
  t.plan(8)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  function onCreate(value, type, options){
   // t.deepEqual(value, asset);
   t.equal(type, "create")
   t.deepEqual(options, {});

    Asset.unbind("change", onCreate);
  }

  function onUpdate(value, type, options){
    t.deepEqual(value, asset)
    t.equal(type, "update")
    t.deepEqual(options, {});
    Asset.unbind("change", onUpdate);
  }

  function onDelete(value, type, options){
    t.deepEqual(value, asset)
   t.deepEqual(options, {clear: true});
   t.equal(type, "destroy")
    Asset.unbind("change", onDelete);
  }

    Asset.bind("change", onCreate);

    var asset = Asset.create({name: "cartoon world.png"});
    //expect(spy).toHaveBeenCalledWith(asset, "create", {});

    Asset.bind("change", onUpdate);
    asset.save();
    //expect(spy).toHaveBeenCalledWith(asset, "update", {});

    Asset.bind("change", onDelete);
    asset.destroy();
    //expect(spy).toHaveBeenCalledWith(asset, "destroy", {clear: true});
  });


test("can fire error events", function(t){
  t.plan(3)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  function spy(value, error){
    t.deepEqual(value,asset)
    t.equal(error, "Name required");
  }

  Asset.bind("error", spy);

  Asset.include({
    validate: function(){
      if ( !this.name )
      return "Name required";
    }
  });

  var asset = new Asset({name: ""});
  t.notOk(asset.save())
  
});



test("should be able to bind once", function(t){
  t.plan(3)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
    calls++;
    t.deepEqual(value,asset)
    t.deepEqual(options, {})
  }

  Asset.one("save", spy);

  var asset = new Asset({name: "cartoon world.png"});
  asset.save();

  asset.save();

  setTimeout(function(){
    t.equal(calls, 1)  
  },100)
  
});

  test("should be able to bind once on instance", function(t){
  t.plan(3)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
    calls++;
    t.deepEqual(value,asset)
    t.deepEqual(options, {})
  }

    var asset = Asset.create({name: "cartoon world.png"});

    asset.one("save", spy);
    asset.save();

    asset.save();

  setTimeout(function(){
    t.equal(calls, 1)  
  },100)

});

test("it should pass clones with events", function(t){
  t.plan(4)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  Asset.bind("create", function(asset){
    t.notDeepEqual(Object.getPrototypeOf(asset),Asset.prototype);
    t.deepEqual(Object.getPrototypeOf(Object.getPrototypeOf(asset)), Asset.prototype);
  });

  Asset.bind("update", function(asset){
    t.notDeepEqual(Object.getPrototypeOf(asset), Asset.prototype);
    t.deepEqual(Object.getPrototypeOf(Object.getPrototypeOf(asset)), Asset.prototype);
  });

  var asset = Asset.create({name: "cartoon world.png"});
  asset.updateAttributes({name: "lonely heart.png"});
});

test("should be able to unbind all instance events", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
    calls++;
  }

  var asset = Asset.create({name: "cartoon world.png"});
  asset.bind("save", spy);
  asset.unbind();
  asset.save();
  t.equal(calls,0);
});


test("should be able to unbind individual instance events", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
    calls++;
  }

  var asset = Asset.create({name: "cartoon world.png"});
  asset.bind("save", spy);
  asset.bind("customEvent", spy);
  asset.unbind('save');
  asset.save();
  t.equal(calls,0)

  asset.trigger('customEvent');
  t.equal(calls,1) 

});


test("should be able to unbind individual callbacks to individual instance events", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
    calls++;
  }

  function spy2(value, options){
    calls++;
  }

  var asset = Asset.create({name: "cartoon world.png"});
  asset.bind("customEvent", spy);
  asset.bind("customEvent", spy2);
  asset.trigger("customEvent");
  t.equal(calls,2)

  asset.unbind("customEvent", spy2);
  asset.trigger('customEvent');
  t.equal(calls,3)
});


test("should be able to unbind a single event that uses a callback another event is bind to.", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
    calls++;
  }


  var asset = Asset.create({name: "cartoon world.png"});
  asset.bind("customEvent1 customEvent2", spy);
  asset.trigger("customEvent1");
  asset.trigger("customEvent2");
  t.equal(calls,2)

  asset.unbind("customEvent1");
  asset.trigger("customEvent1");
  asset.trigger("customEvent2");
  t.equal(calls,3)

});


test("should be able to bind and unbind multiple events with a single call.", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
   calls++;
  }

  var asset = Asset.create({name: "cartoon world.png"});
  asset.bind("customEvent1 customEvent2", spy)
  asset.trigger("customEvent1");
  asset.trigger("customEvent2");
  t.equal(calls,2)


  asset.unbind("customEvent1 customEvent2")
  asset.trigger("customEvent1");
  asset.trigger("customEvent2");
  t.equal(calls,2)

});


test("should be able to unbind all events if no arguments given", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
    calls++;
  }

  var asset = Asset.create({name: "cartoon world.png"});
  asset.bind("customEvent1 customEvent2", spy)
  asset.trigger("customEvent1");
  asset.trigger("customEvent2");
  t.equal(calls,2)

  asset.unbind();
  asset.trigger("customEvent1");
  asset.trigger("customEvent2");
  t.equal(calls,2)
});

test("should not be able to unbind all events if given and undefined object", function(t){
  t.plan(2)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
    calls++;
  }

  var asset = Asset.create({name: "cartoon world.png"});
  asset.bind("customEvent1 customEvent2", spy)
  asset.trigger("customEvent1");
  asset.trigger("customEvent2");
  t.equal(calls,2)

  asset.unbind(undefined);
  asset.trigger("customEvent1");
  asset.trigger("customEvent2");
  t.equal(calls,4)
});


test("should not unbind class-level callbacks", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
    calls++;
  }

  Asset.bind('customEvent1', spy);
  var asset = Asset.create({name: "cartoon world.png"});
  asset.bind('customEvent2', function() {});
  asset.trigger('unbind');
  Asset.trigger('customEvent1');
  t.equal(calls,1)
});


test("should unbind events on instance destroy", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
    calls++;
  }

  var asset = Asset.create({name: "cartoon world.png"});
  asset.bind("save", spy);
  asset.destroy();
  asset.trigger("save", asset);
  t.equal(calls,0)
});

test("callbacks should still work on ID changes", function(t){
  t.plan(1)
  var Asset = Model.setup("Asset", ["name", "visible", "contact_methods"]);

  var calls = 0;
  function spy(value, options){
    calls++;
  }

  var asset = Asset.create({name: "hotel california", id: "bar"});
  asset.bind("test", spy);
  asset.changeID("foo");
  asset = Asset.find("foo");
  asset.trigger("test", asset);
  t.equal(calls,1)
});



