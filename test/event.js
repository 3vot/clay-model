var test = require('tape');

var Events = require("../lib/events")

var Module = require("../lib/module")


var EventTest;
var ListenTest;
var spy;

  EventTest = Module.create();
  EventTest.extend(Events);

  var calls =0;
  var spy = function(){
    calls++;
  }


test("can bind/trigger events", function(t){
  t.plan(1)
  EventTest.bind("daddyo", spy);
  EventTest.trigger("daddyo");
  t.equal(calls,1)
  
});


test("should trigger correct events", function(t){
  t.plan(1)
  EventTest.bind("daddyo", spy);
  EventTest.trigger("motherio");
  t.equal(calls,1)
  
});

test("can bind/trigger multiple events", function(t){
  t.plan(1);
  EventTest.bind("house car windows", spy);
  EventTest.trigger("car");
  t.equal(calls,2)
  
});


test("can pass data to triggered events", function(t){
  t.plan(2);

  EventTest.bind("yoyo", spy);
  EventTest.trigger("yoyo", 5, 10);

  function spy(a,b){
  t.equal(a,5)
  t.equal(b,10)
  }

});

test("can unbind events", function(t){
  t.plan(1);

  EventTest.bind("daddyo", spy);
  EventTest.unbind("daddyo");
  EventTest.trigger("daddyo");

  t.equal(calls,2)

});


test("can unbind all events if no arguments given", function(t) {
  t.plan(2);

  EventTest.bind("yoyo daddyo", spy);
  EventTest.unbind();
  EventTest.trigger("yoyo");
  t.equal(calls,2)


  EventTest.trigger("daddyo");
  t.equal(calls,2)
});


test("can unbind one event", function(t){
      t.plan(2);

  EventTest.bind("house car windows", spy);
  EventTest.unbind("car windows");
  EventTest.trigger("car");
  EventTest.trigger("windows");
  t.equal(calls,2)


  EventTest.trigger("house");
  t.equal(calls,3)

});
  


test("can bind to an event only once", function(t){
  t.plan(2);


  EventTest.one("indahouse", spy);
  EventTest.trigger("indahouse");
  t.equal(calls,4)
  
  EventTest.trigger("indahouse");
  
  t.equal(calls,4)

});
 

test("should allow a callback to unbind itself", function(t){
  t.plan(2);

  function local(){
  calls++;
  EventTest.unbind("once", local);
  }

  EventTest.bind("once", spy);
  EventTest.bind("once", local);
  EventTest.bind("once", spy);
  EventTest.trigger("once");

  t.equal(calls,7)


  EventTest.trigger("once");
  t.equal(calls,9)
});



test("can cancel propogation", function(t){
  t.plan(1);

  EventTest.bind("motherio", function(){ return false; });
  EventTest.bind("motherio", spy);
  EventTest.trigger("motherio");
  t.equal(calls,9)
});

test("should clear events on inherited objects", function(t){
  t.plan(1);
  EventTest.bind("yoyo", spy);
  var Sub = EventTest.sub();
  Sub.trigger("yoyo");
  t.equal(calls,9)    
});


  test("should not unbind all events if given and undefined object", function(t) {
    t.plan(1);
    EventTest.bind("daddyo", spy);
    EventTest.unbind(undefined);
    EventTest.trigger("daddyo");
    t.equal(calls,10)
  });






  

  