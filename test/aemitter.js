var Emitter = require('..'),
    should = require('should');

/**
 * Top tests pulled from github.com/component/emitter
 */

function Custom() {
  Emitter.call(this);
}

Custom.prototype.__proto__ = Emitter.prototype;

describe('Custom', function(){
  describe('with Emitter.call(this)', function(){
    it('should work', function(done){
      var emitter = new Custom;
      emitter.on('foo', done);
      emitter.emit('foo', null);
    });
  });
});

describe('Emitter', function(){
  describe('.on(event, fn)', function(){
    it('should add listeners', function(){
      var emitter = new Emitter;
      var calls = [];

      emitter.on('foo', function(val){
        calls.push('one', val);
      });

      emitter.on('foo', function(val){
        calls.push('two', val);
      });

      emitter.emit('foo', 1);
      emitter.emit('bar', 1);
      emitter.emit('foo', 2);

      calls.should.eql([ 'one', 1, 'two', 1, 'one', 2, 'two', 2 ]);
    });
  });

  describe('.once(event, fn)', function(){
    it('should add a single-shot listener', function(){
      var emitter = new Emitter;
      var calls = [];

      emitter.once('foo', function(val){
        calls.push('one', val);
      });

      emitter.emit('foo', 1);
      emitter.emit('foo', 2);
      emitter.emit('foo', 3);
      emitter.emit('bar', 1);

      calls.should.eql([ 'one', 1 ]);
    });
  });

  describe('.off(event, fn)', function(){
    it('should remove a listener', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }
      function two() { calls.push('two'); }

      emitter.on('foo', one);
      emitter.on('foo', two);
      emitter.off('foo', two);

      emitter.emit('foo');

      calls.should.eql([ 'one' ]);
    });

    it('should work with .once()', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }

      emitter.once('foo', one);
      emitter.off('foo', one);

      emitter.emit('foo');

      calls.should.eql([]);
    });

    it('should work when called from an event', function(){
      var emitter = new Emitter,
          called;

      function b () {
        called = true;
      }
      emitter.on('tobi', function () {
        emitter.off('tobi', b);
      });
      emitter.on('tobi', b);
      emitter.emit('tobi');
      called.should.be.true;
      called = false;
      emitter.emit('tobi');
      called.should.be.false;
    });
  });

  describe('.off(event)', function(){
    it('should remove all listeners for an event', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }
      function two() { calls.push('two'); }

      emitter.on('foo', one);
      emitter.on('foo', two);
      emitter.off('foo');

      emitter.emit('foo');
      emitter.emit('foo');

      calls.should.eql([]);
    });
  });

  describe('.emit(event)', function(){
    it('should set the context of the callback', function(){
      var emitter = new Emitter;
      var context;

      function one() { context = this; }

      emitter.on('foo', one);

      emitter.emit('foo');

      context.should.eql(emitter);
    });
  });

  describe('.listeners(event)', function(){
    describe('when handlers are present', function(){
      it('should return an array of callbacks', function(){
        var emitter = new Emitter;
        function foo(){}
        emitter.on('foo', foo);
        emitter.listeners('foo').should.eql([foo]);
      });
    });

    describe('when no handlers are present', function(){
      it('should return an empty array', function(){
        var emitter = new Emitter;
        emitter.listeners('foo').should.eql([]);
      });
    });
  });

  describe('.hasListeners(event)', function(){
    describe('when handlers are present', function(){
      it('should return true', function(){
        var emitter = new Emitter;
        emitter.on('foo', function(){});
        emitter.hasListeners('foo').should.be.true;
      });
    });

    describe('when no handlers are present', function(){
      it('should return false', function(){
        var emitter = new Emitter;
        emitter.hasListeners('foo').should.be.false;
      });
    });
  });
});

describe('Emitter(obj)', function(){
  it('should mixin', function(done){
    var proto = {};
    Emitter(proto);
    proto.on('something', done);
    proto.emit('something', null);
  });
});


/**
 * Async methods
 */

describe('aemitter', function () {
  var proto;

  beforeEach(function() {
    proto = Emitter({});
  });

  it('should wait when callback fn present', function (done) {
    var waited = false;

    proto.on('foo', function(next) {
      setTimeout(function() {
        waited = true;
        next();
      }, 20);
    });

    proto.emit('foo', function() {
      waited.should.be.true;
      done();
    });
  });

  it('should wait till all callbacks finished', function(done) {
    var pending = 2;

    proto.on('foo', function(next) {
      setTimeout(function() {
        --pending;
        next();
      }, 20);
    });

    proto.on('foo', function(next) {
      setTimeout(function() {
        --pending;
        next();
      }, 40);
    });

    proto.emit('foo', function() {
      pending.should.eql(0);
      done();
    });
  });

  it('next(err) should work', function(done) {
    proto.on('foo', function(next) {
      next(new Error("some err"));
    });

    proto.emit('foo', function(err) {
      err.message.should.eql('some err');
      done();
    });
  });
});
