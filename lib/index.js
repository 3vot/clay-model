var Events = require("./events");

var Module = require("./module");

var ModelUtils = require("../utils/model")

var Model = (function() {
  Module.clone(Model,Module);

  Model.extend(Events);

  Model.records = [];

  Model.irecords = {};

  Model.attributes = [];

  Model.configure = function() {
    var attributes, name;
    name = arguments[0], attributes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    this.className = name;
    this.deleteAll();
    if (attributes.length) {
      this.attributes = attributes;
    }
    this.attributes && (this.attributes = makeArray(this.attributes));
    this.attributes || (this.attributes = []);
    this.unbind();
    return this;
  };

  Model.toString = function() {
    return "" + this.className + "(" + (this.attributes.join(", ")) + ")";
  };

  Model.find = function(id, notFound) {
    if (notFound == null) {
      notFound = this.notFound;
    }
    var _ref = this.irecords[id]
    return (this.irecords[id] != null ? _ref.clone() : void 0) || (typeof notFound === "function" ? notFound(id) : void 0);
  };

  Model.findAll = function(ids, notFound) {
    var id, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = ids.length; _i < _len; _i++) {
      id = ids[_i];
      if (this.find(id, notFound)) {
        _results.push(this.find(id));
      }
    }
    return _results;
  };

  Model.notFound = function(id) {
    return null;
  };

  Model.exists = function(id) {
    return Boolean(this.irecords[id]);
  };

  Model.addRecord = function(record, options) {
    var _base, _base1, _name, _name1;
    if (options == null) {
      options = {};
    }
    if (record.id && this.irecords[record.id]) {
      this.irecords[record.id].remove(options);
      if (!options.clear) {
        record = this.irecords[record.id].load(record);
      }
    }
    record.id || (record.id = record.cid);
    if ((_base = this.irecords)[_name = record.id] == null) {
      _base[_name] = record;
    }
    if ((_base1 = this.irecords)[_name1 = record.cid] == null) {
      _base1[_name1] = record;
    }
    return this.records.push(record);
  };

  Model.refresh = function(values, options) {
    var record, records, result, _i, _len;
    if (options == null) {
      options = {};
    }
    if (options.clear) {
      this.deleteAll();
    }
    records = this.fromJSON(values);
    if (!isArray(records)) {
      records = [records];
    }
    for (_i = 0, _len = records.length; _i < _len; _i++) {
      record = records[_i];
      if(record.Id) record.id = record.Id;
      this.addRecord(record, options);
    }
    this.sort();
    result = this.cloneArray(records);
    this.trigger('refresh', result, options);
    return result;
  };

  Model.select = function(callback) {
    var record, _i, _len, _ref, _results;
    _ref = this.records;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      record = _ref[_i];
      if (callback(record)) {
        _results.push(record.clone());
      }
    }
    return _results;
  };

  Model.findByAttribute = function(name, value) {
    var record, _i, _len, _ref;
    _ref = this.records;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      record = _ref[_i];
      if (record[name] === value) {
        return record.clone();
      }
    }
    return null;
  };

  Model.findAllByAttribute = function(name, value) {
    return this.select(function(item) {
      return item[name] === value;
    });
  };

  Model.each = function(callback) {
    var record, _i, _len, _ref, _results;
    _ref = this.records;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      record = _ref[_i];
      _results.push(callback(record.clone()));
    }
    return _results;
  };

  Model.all = function() {
    return this.cloneArray(this.records);
  };

  Model.slice = function(begin, end) {
    if (begin == null) {
      begin = 0;
    }
    return this.cloneArray(this.records.slice(begin, end));
  };

  Model.first = function(end) {
    var _ref;
    if (end == null) {
      end = 1;
    }
    if (end > 1) {
      return this.cloneArray(this.records.slice(0, end));
    } else {
      return (_ref = this.records[0]) != null ? _ref.clone() : void 0;
    }
  };

  Model.last = function(begin) {
    var _ref;
    if (typeof begin === 'number') {
      return this.cloneArray(this.records.slice(-begin));
    } else {
      return (_ref = this.records[this.records.length - 1]) != null ? _ref.clone() : void 0;
    }
  };

  Model.count = function() {
    return this.records.length;
  };

  Model.deleteAll = function() {
    this.records = [];
    return this.irecords = {};
  };

  Model.destroyAll = function(options) {
    var record, _i, _len, _ref, _results;
    _ref = this.records;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      record = _ref[_i];
      _results.push(record.destroy(options));
    }
    return _results;
  };

  Model.update = function(id, atts, options) {
    return this.find(id).updateAttributes(atts, options);
  };

  Model.create = function(atts, options) {
    var record;
    record = new this(atts);
    return record.save(options);
  };

  Model.destroy = function(id, options) {
    return this.find(id).destroy(options);
  };

  Model.change = function(callbackOrParams) {
    if (typeof callbackOrParams === 'function') {
      return this.bind('change', callbackOrParams);
    } else {
      return this.trigger.apply(this, ['change'].concat(__slice.call(arguments)));
    }
  };

  Model.fetch = function(callbackOrParams) {
    if (typeof callbackOrParams === 'function') {
      return this.bind('fetch', callbackOrParams);
    } else {
      return this.trigger.apply(this, ['fetch'].concat(__slice.call(arguments)));
    }
  };

  Model.toJSON = function() {
    return this.records;
  };

  Model.fromJSON = function(objects) {
    var value, _i, _len, _results;
    if (!objects) {
      return;
    }
    if (typeof objects === 'string') {
      objects = JSON.parse(objects);
    }
    if (isArray(objects)) {
      _results = [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        value = objects[_i];
        if (value instanceof this) {
          _results.push(value);
        } else {
          _results.push(new this(value));
        }
      }
      return _results;
    } else {
      if (objects instanceof this) {
        return objects;
      }
      return new this(objects);
    }
  };

  Model.fromForm = function() {
    var _ref;
    return (_ref = new this).fromForm.apply(_ref, arguments);
  };

  Model.sort = function() {
    if (this.comparator) {
      this.records.sort(this.comparator);
    }
    return this;
  };

  Model.cloneArray = function(array) {
    var value, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      value = array[_i];
      _results.push(value.clone());
    }
    return _results;
  };

  Model.idCounter = 0;

  Model.uid = function(prefix) {
    var uid;
    if (prefix == null) {
      prefix = '';
    }
    uid = prefix + this.idCounter++;
    if (this.exists(uid)) {
      uid = this.uid(prefix);
    }
    return uid;
  };

  function Model(atts) {
    Model.__super__.constructor.apply(this, arguments);
    if ((this.constructor.uuid != null) && typeof this.constructor.uuid === 'function') {
      this.cid = this.constructor.uuid();
      if (!this.id) {
        this.id = this.cid;
      }
    } else {
      this.cid = (atts != null ? atts.cid : void 0) || this.constructor.uid('c-');
    }
    if (atts) {
      this.load(atts);
    }
  }

  Model.prototype.isNew = function() {
    return !this.exists();
  };

  Model.prototype.isValid = function() {
    return !this.validate();
  };

  Model.prototype.validate = function() {};

  Model.prototype.load = function(atts) {
    var key, value;
    if (atts.id) {
      this.id = atts.id;
    }
    for (key in atts) {
      value = atts[key];
      if (typeof this[key] === 'function') {
        if (typeof value === 'function') {
          continue;
        }
        this[key](value);
      } else {
        this[key] = value;
      }
    }
    return this;
  };

  Model.prototype.attributes = function() {
    var key, result, _i, _len, _ref;
    result = {};
    _ref = this.constructor.attributes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      if (key in this) {
        if (typeof this[key] === 'function') {
          result[key] = this[key]();
        } else if(this[key] != null){
          result[key] = this[key];
        }
      }
    }
    if (this.id) {
      result.id = this.id;
    }
    return result;
  };

  Model.prototype.eql = function(rec) {
    return rec && rec.constructor === this.constructor && ((rec.cid === this.cid) || (rec.id && rec.id === this.id));
  };



  Model.prototype.stripCloneAttrs = function() {
    var key, value;
    if (this.hasOwnProperty('cid')) {
      return;
    }
    for (key in this) {
      if (!__hasProp.call(this, key)) continue;
      value = this[key];
      if ([].indexOf.call(this.constructor.attributes, key) >= 0) {
        delete this[key];
      }
    }
    return this;
  };

  Model.prototype.updateAttribute = function(name, value, options) {
    var atts;
    atts = {};
    atts[name] = value;
    return this.updateAttributes(atts, options);
  };

  Model.prototype.updateAttributes = function(atts, options) {
    this.load(atts);
    return this.save(options);
  };

  Model.prototype.changeID = function(id) {
    var records;
    if (id === this.id) {
      return;
    }
    records = this.constructor.irecords;
    records[id] = records[this.id];
    if (this.cid !== this.id) {
      delete records[this.id];
    }
    this.id = id;
    return this.save({ignoreAjax: true});
  };

  Model.prototype.remove = function(options) {
    var i, record, records, _i, _len;
    if (options == null) {
      options = {};
    }
    records = this.constructor.records.slice(0);
    for (i = _i = 0, _len = records.length; _i < _len; i = ++_i) {
      record = records[i];
      if (!(this.eql(record))) {
        continue;
      }
      records.splice(i, 1);
      break;
    }
    this.constructor.records = records;
    if (options.clear) {
      delete this.constructor.irecords[this.id];
      return delete this.constructor.irecords[this.cid];
    }
  };



  Model.prototype.dup = function(newRecord) {
    var atts;
    if (newRecord == null) {
      newRecord = true;
    }
    atts = this.attributes();
    if (newRecord) {
      delete atts.id;
    } else {
      atts.cid = this.cid;
    }
    return new this.constructor(atts);
  };

  Model.prototype.clone = function() {
    return createObject(this);
  };

  Model.prototype.reload = function() {
    var original;
    if (this.isNew()) {
      return this;
    }
    original = this.constructor.find(this.id);
    this.load(original.attributes());
    return original;
  };



  Model.prototype.toJSON = function() {
    return this.attributes();
  };

  Model.prototype.toString = function() {
    return "<" + this.constructor.className + " (" + (JSON.stringify(this)) + ")>";
  };

  Model.prototype.fromForm = function(form) {
    var checkbox, key, name, result, _i, _j, _k, _len, _len1, _len2, _name, _ref, _ref1, _ref2;
    result = {};
    _ref = $(form).find('[type=checkbox]:not([value])');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      checkbox = _ref[_i];
      result[checkbox.name] = $(checkbox).prop('checked');
    }
    _ref1 = $(form).find('[type=checkbox][name$="[]"]');
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      checkbox = _ref1[_j];
      name = checkbox.name.replace(/\[\]$/, '');
      result[name] || (result[name] = []);
      if ($(checkbox).prop('checked')) {
        result[name].push(checkbox.value);
      }
    }
    _ref2 = $(form).serializeArray();
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      key = _ref2[_k];
      result[_name = key.name] || (result[_name] = key.value);
    }
    return this.load(result);
  };

  Model.prototype.exists = function() {
    return this.constructor.exists(this.id);
  };

  Model.prototype.refresh = function(data) {
    var root;
    root = this.constructor.irecords[this.id];
    root.load(data);
    this.trigger('refresh');
    return this;
  };

  Model.prototype.save = function(options) {
    var error, record;
    if (options == null) {
      options = {};
    }
    if (options.validate !== false) {
      error = this.validate();
      if (error) {
        this.trigger('error', error);
        return false;
      }
    }
    this.trigger('beforeSave', options);
    record = this.isNew() ? this.create(options) : this.update(options);
    this.stripCloneAttrs();
    this.trigger('save', options);
    return record;
  };

  Model.query = function(params,options){
    var _this = this;
    if(this.ajax) return this.ajax.call(this, 'query', params, options )
      .then(function(responseData){ 
        _this.refresh(responseData); 
        return responseData; 
      });
    throw "Ajax Module not defined"
  }

  Model.read = function(id, options){
    var _this = this;
    if(this.ajax) return this.ajax.call(this, 'read', id, options )
      .then(function(data){ 
        var instance = _this.exists(id);
        if(instance){ instance.refresh(data); return instance; } 
        return _this.create(data, { ignoreAjax: true }); 
      });
    throw "Ajax Module not defined"
  }

  Model.api = function(){
    var _this = this;
    if(this.ajax && this.ajax.api) return this.ajax.api.apply(this, arguments )
    throw "Ajax Module or api method not defined"
  }

  Model.prototype.create = function(options) {
    if(!options) options = {};
    var clone, record;
    var _this = this;
    this.trigger('beforeCreate', options);
    this.id || (this.id = this.cid);
    record = this.dup(false);
    var parentModel = this.constructor;
    parentModel.addRecord(record);
    parentModel.sort();
    clone = record.clone();
    clone.trigger('create', options);
    clone.trigger('change', 'create', options);


    if(parentModel.ajax && !options.ignoreAjax) return parentModel.ajax.call(clone, 'create', this.constructor, options )
      .then(function(data){ 
        if (!(ModelUtils.isBlank(data) || _this.destroyed)) {
          if (data.id && _this.id !== data.id) {
            _this.changeID(data.id);
          }
          _this.refresh(data);

          return _this;
        }
      })
      .fail(function(err){
        _this.destroy({ignoreAjax: true});
        throw err;
      })


    return clone;
  };


 Model.prototype.update = function(options) {
    if(!options) options = {};
    var _this = this;
    var clone, records;
    this.trigger('beforeUpdate', options);
    records = this.constructor.irecords;
    var parentModel = this.constructor;
    
    if(!parentModel.previousAttributes) parentModel.previousAttributes = {}
    var previousRecord = records[this.id]
    parentModel.previousAttributes[this.id] = JSON.stringify(previousRecord.attributes());
    previousRecord.load(this.attributes());
    this.constructor.sort();
    clone = records[this.id].clone();
    clone.trigger('update', options);
    clone.trigger('change', 'update', options);
    if(parentModel.ajax  && !options.ignoreAjax) return parentModel.ajax.call(clone, 'update', this.constructor, options )
      .then( function(data){ delete parentModel.previousAttributes[clone.id]; return clone; })
      .then(function(data){ if(data){_this.refresh(data)}; return clone; })
      .fail(function(err){  delete parentModel.previousAttributes[clone.id]; throw err; });

    return clone;
  };

  Model.prototype.destroy = function(options) {
    if (options == null) options = {};
    if (options.clear == null) options.clear = true;
    var _this = this;
    var parentModel = this.constructor;
    this.trigger('beforeDestroy', options);
    this.remove(options);
    this.destroyed = true;
    this.trigger('destroy', options);
    this.trigger('change', 'destroy', options);
    if (this.listeningTo) {
      this.stopListening();
    }
    this.unbind();
    if(parentModel.ajax  && !options.ignoreAjax) return parentModel.ajax.call(this, 'destroy', this.constructor, options )
      .then(function(){ return _this; });
    return this;
  };

  Model.prototype.bind = function(events, callback) {
    var binder, singleEvent, _fn, _i, _len, _ref;
    this.constructor.bind(events, binder = (function(_this) {
      return function(record) {
        if (record && _this.eql(record)) {
          return callback.apply(_this, arguments);
        }
      };
    })(this));
    _ref = events.split(' ');
    _fn = (function(_this) {
      return function(singleEvent) {
        var unbinder;
        return _this.constructor.bind("unbind", unbinder = function(record, event, cb) {
          if (record && _this.eql(record)) {
            if (event && event !== singleEvent) {
              return;
            }
            if (cb && cb !== callback) {
              return;
            }
            _this.constructor.unbind(singleEvent, binder);
            return _this.constructor.unbind("unbind", unbinder);
          }
        });
      };
    })(this);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      singleEvent = _ref[_i];
      _fn(singleEvent);
    }
    return this;
  };

  Model.prototype.one = function(events, callback) {
    var handler;
    return this.bind(events, handler = (function(_this) {
      return function() {
        _this.unbind(events, handler);
        return callback.apply(_this, arguments);
      };
    })(this));
  };

  Model.prototype.trigger = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    args.splice(1, 0, this);
    return (_ref = this.constructor).trigger.apply(_ref, args);
  };

  Model.prototype.listenTo = function() {
    return Events.listenTo.apply(this, arguments);
  };

  Model.prototype.listenToOnce = function() {
    return Events.listenToOnce.apply(this, arguments);
  };

  Model.prototype.stopListening = function() {
    return Events.stopListening.apply(this, arguments);
  };

  Model.prototype.unbind = function(events, callback) {
    var event, _i, _len, _ref, _results;
    if (arguments.length === 0) {
      return this.trigger('unbind');
    } else if (events) {
      _ref = events.split(' ');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        _results.push(this.trigger('unbind', event, callback));
      }
      return _results;
    }
  };

  return Model;

})();

Model.setup = function(name, attributes) {
  var Instance;
  if (attributes == null) {
    attributes = [];
  }
  Instance = (function(_super) {
    
    Module.clone(Instance, _super);

    function Instance() {
      return Instance.__super__.constructor.apply(this, arguments);
    }

    return Instance;

  })(this);
  
  Instance.configure.apply(Instance, [name].concat(__slice.call(attributes)));
  return Instance;
};

Model.options = {};

var createObject = ModelUtils.createObject;
var isArray = ModelUtils.isArray;
var makeArray = ModelUtils.makeArray;

module.exports = Model

Model.prototype.on = Model.prototype.bind;
Model.prototype.off = Model.prototype.unbind;
Model.prototype.emit = Model.prototype.trigger;

__hasProp = {}.hasOwnProperty,
__slice = [].slice;