var test = require('tape');


var Module = require("../lib/module")

var User;

User = Module.create();

test('Subclass Module', function (t) {
    t.plan(2);

		User.extend({classProperty: true});

		t.equal( User.classProperty, true);

		var Other = User.create();
		t.equal( Other.classProperty, true);
})

test('Extend a Module', function (t) {
    t.plan(1);

		User.extend({classProperty: true});

		t.equal( User.classProperty, true);

})


test('Include a Module', function (t) {
    t.plan(1);
    User.include({instanceProperty: true});
		var Bob = new User();
    t.equal(Bob.instanceProperty,true);
})


test("Callbacks on Extedend and Include", function(t){
    t.plan(2);

    var module = {
      included: function(){ t.equal(true,true) },
      extended: function(){ t.equal(true,true) }
    };

    User.include(module);

    User.extend(module);

})

test("Proxy functions", function(t){
	    t.plan(2);

 var func = function(){
      return this;
    };

    t.equal( User.proxy(func)() , User )

    var user = new User();
		t.equal( user.proxy(func)() , user )
    
})

  
