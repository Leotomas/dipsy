'use strict';

var chai = require('chai');
var expect = chai.expect;

describe('Dipsy Spec', function(){
    const Dipsy = require("../src/dipsy.js");
    let dipsy = new Dipsy();


    class Foo {
        constructor() {
            this.age = 2;
        }

        getAge() {
            return this.age;
        }
    }

    class Test {
        constructor(Foo) {
            this.age = Foo.getAge();
            if (!Foo) {
               throw "No Foo";
            }
        }

        hello() {
            this.greetings = 2;
            return true;
        }
    }


    var FooOld = function(){
        this.age = 2;
    };

    FooOld.prototype = {
        getAge : function() {
            return this.age;
        }
    };

    var TestOld = function(Foo) {
        this.age = Foo.getAge();
    };

    TestOld.prototype = {
        hello  : function(){
           this.greetings = 2;
            return true;
        }
    };






    it('should register dipsy and its direct dep', function(){
        dipsy.register('Foo', Foo);
        dipsy.register('Test', Test, ['Foo']);
        dipsy.register('Test2', Test, ['Foo']);

    });


    it('should get and instantiate the dep-demanding class', function() {
        let newDipsy = dipsy.get('Test');
        expect(newDipsy.hello()).to.be.ok;
        expect(newDipsy.age).to.equal(2);
    });

    it('should register dipsy and its direct old way', function(){
        dipsy.register('FooOld', FooOld);
        dipsy.register('TestOld', TestOld, ['FooOld']);
    });

    it('should get and instantiate the dep-demanding class', function() {
        let newDipsy = dipsy.get('TestOld');
        expect(newDipsy.hello()).to.be.ok;
        expect(newDipsy.age).to.equal(2);
    });


    it('should register any external module', function(){
        dipsy.register("events", require("events"));
        dipsy.register("moment", require("moment"), [], false);
    });


    it('should retrieve the external modules', function(){
        let eventManager = dipsy.get("events");
        let Moment = dipsy.get("moment");
        expect(Moment).to.be.ok;
        expect(eventManager.on).to.be.ok;
    });

    it('should work with singletons', function(){
        let Singleton = function(Foo) {
            if (!Foo) {
                throw "Foo dans le singleton not set";

            }
            this.age = Foo.getAge();
        };

        Singleton.prototype = {
            greet : function(){
                //greet

            }

        };

        var instance;
        var instantiator = {
            getInstance : function(Foo) {
                if (!instance) {
                    instance = new Singleton(Foo);

                }
                return instance;
            }

        };

        dipsy.register('Singleton', instantiator, ["Foo"]);
        let singleton = dipsy.get("Singleton");
        expect(singleton.age).to.equal(2);
    });
});
