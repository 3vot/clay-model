
var test = require('tape');

var Module = require("../lib/module")

var Model = require("../lib")

var Local = require("../lib/local")

test("should persist attributes", function(t){
	t.plan(2);

	var User = Model.setup("User", ["name"]);
  User.extend(Local);
  User.create({name: "Bob"});
  User.fetch();

  t.ok(User.first());
  t.equal(User.first().name,"Bob");
});


 test("should work with cIDs", function(t){
 	t.plan(1);
	var User = Model.setup("User", ["name"]);

  User.refresh([
    {name: "Bob", id: "c-1"},
    {name: "Bob", id: "c-3"},
    {name: "Bob", id: "c-2"}
  ]);
  t.equal(User.idCounter,3);
});


test("should work with a blank refresh", function(t){
	t.plan(1);
	var User = Model.setup("User", ["name"]);
  
	User.refresh([]);
	t.equal(User.idCounter,0);
});

test("should store User JSON data in localStorage", function(t){
	t.plan(2);
	var User = Model.setup("User", ["name"]);
  User.extend(Local);

  if(!localStorage) var localStorage = Local.localStorage;

  var data = [
    {name: "Bob", id: "c-1"}
  ];
  User.refresh(data);
  
  delete localStorage['User'];
  t.equal(localStorage['User'],undefined);
  User.saveLocal();
  t.deepEqual(localStorage['User'], JSON.stringify(data));
});



test("should read User JSON data from localStorage and refresh User", function(t){
	t.plan(2);
	var User = Model.setup("User", ["name"]);
  User.extend(Local);

  if(!localStorage) var localStorage = Local.localStorage;

  var data = [
    {name: "Bob", id: "c-1"}
  ];
  localStorage['User'] = JSON.stringify(data);


  t.equal(User.count(),0);
  User.loadLocal();
  t.equal(User.count(),1);
});

test("should not delete existing records when set clear option to false", function(t){
  t.plan(2);
	var User = Model.setup("User", ["name"]);
  User.extend(Local);

  if(!localStorage) var localStorage = Local.localStorage;

  var data = [
    {name: "Bob", id: "c-1"}
  ];
  localStorage['User'] = JSON.stringify(data);


  User.refresh([
    {name: "Bob", id: "c-0"}
  ]);

  t.equal(User.count(),1);
  User.loadLocal({clear: false});
  t.equal(User.count(),2);
});
