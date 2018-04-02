"use strict";

const Component = require("../index.js");
const assert = require("chai").assert;
const sinon = require("sinon");

const dummyComponentManager = {
    registerType: function() {},
    getType: function() {},
    register: function() {},
    get: function() {},
    clear: function() {},
    config: function() {},
    init: function() {},
    shutdown: function() {},
    componentList: new Map(),
    typeList: new Map()
};

class Foo extends Component {}

describe("component", function() {
    it("has version", function() {
        var c = new Component(dummyComponentManager);
        assert.strictEqual(c.componentVersion, "1.1.0");
    });

    describe("init", function() {
        it("works", function() {

            var foo = new Foo(dummyComponentManager);
            assert.isFunction(foo.init);
            foo.init();
        });
    });

    describe("shutdown", function() {
        it("works", function() {
            var foo = new Foo(dummyComponentManager);
            assert.isFunction(foo.shutdown);
            foo.init();
            foo.shutdown();
        });
    });

    describe("features", function() {
        var foo;
        beforeEach(function() {
            foo = new Foo(dummyComponentManager);
        });

        it("starts empty", function() {
            var features = foo.features();
            assert.isArray(features);
            assert.strictEqual(features.length, 0);
        });

        describe("addFeature", function() {
            it("adds a feature", function() {
                var features;
                // make sure we're starting at zero
                features = foo.features();
                assert.strictEqual(features.length, 0);

                // add feature
                function testFn() {}
                foo.addFeature("test", testFn);

                // make sure feature was added
                features = foo.features();
                assert.strictEqual(features.length, 1);
                assert.strictEqual(features[0].name, "test");
                assert.strictEqual(features[0].fn, testFn);
            });

            it("throws if feature name is undefined", function() {
                function testFn() {}
                assert.throws(() => {
                    foo.addFeature(undefined, testFn);
                }, TypeError, "addFeature expected 'name' to be String, got undefined");
            });

            it("throws if feature name isn't a string", function() {
                function testFn() {}
                assert.throws(() => {
                    foo.addFeature([], testFn);
                }, TypeError, "addFeature expected 'name' to be String, got object");
            });

            it("throws if fn is undefined", function() {
                assert.throws(() => {
                    foo.addFeature("test");
                }, TypeError, "addFeature expected 'fn' to be Function, got undefined");
            });

            it("throws if fn isn't a Function", function() {
                assert.throws(() => {
                    foo.addFeature("test", "blah");
                }, TypeError, "addFeature expected 'fn' to be Function, got string");
            });

            it("throws on duplicate function", function() {
                // add feature
                function testFn() {}
                foo.addFeature("test", testFn);

                assert.throws(() => {
                    foo.addFeature("test", testFn);
                }, Error, "addFeature already has feature named: 'test'");
            });

            it("adds two features", function() {
                var features;
                // make sure we're starting at zero
                features = foo.features();
                assert.strictEqual(features.length, 0);

                // add feature
                function testFn() {}
                foo.addFeature("test", testFn);

                // make sure feature was added
                features = foo.features();
                assert.strictEqual(features.length, 1);
                assert.strictEqual(features[0].name, "test");
                assert.strictEqual(features[0].fn, testFn);

                // add feature
                function testFn2() {}
                foo.addFeature("test2", testFn2);

                // make sure feature was added
                features = foo.features();
                assert.strictEqual(features.length, 2);
                assert.strictEqual(features[0].name, "test");
                assert.strictEqual(features[0].fn, testFn);
                assert.strictEqual(features[1].name, "test2");
                assert.strictEqual(features[1].fn, testFn2);
            });
        });

        describe("config", function() {
            it("configures a feature", function() {
                // add feature
                var testFn = sinon.stub();
                foo.addFeature("test", testFn);

                // configure feature
                foo.config("test", 42);

                // make sure feature was configured
                assert.strictEqual(testFn.callCount, 1);
                assert.strictEqual(testFn.getCall(0).args.length, 1);
                assert.strictEqual(testFn.getCall(0).args[0], 42);
            });

            it("throws if feature doesn't exist", function() {
                assert.throws(() => {
                    foo.config("test", 42);
                }, Error, "'test' not found during config");
            });
        });

        describe("removeFeature", function() {
            it("removes a feature", function() {
                var features;
                // make sure we're starting at zero
                features = foo.features();
                assert.strictEqual(features.length, 0);

                // add feature
                function testFn() {}
                foo.addFeature("test", testFn);

                // make sure feature was added
                features = foo.features();
                assert.strictEqual(features.length, 1);
                assert.strictEqual(features[0].name, "test");
                assert.strictEqual(features[0].fn, testFn);

                // remove feature
                foo.removeFeature("test");

                // make sure feature was removed
                features = foo.features();
                assert.strictEqual(features.length, 0);
            });

            it("throws if name was undefined", function() {
                assert.throws(() => {
                    foo.removeFeature();
                }, TypeError, "removeFeature expected 'name' to be String, got undefined");
            });

            it("throws if name wasn't string", function() {
                assert.throws(() => {
                    foo.removeFeature({});
                }, TypeError, "removeFeature expected 'name' to be String, got object");
            });

            it("throws if feature didn't exist", function() {
                assert.throws(() => {
                    foo.removeFeature("blah");
                }, Error, "removeFeature didn't have feature named: 'blah'");
            });
        });

        describe("addSetterGetterFeature", function() {
            it("adds a setter / getter", function() {
                var features;
                // make sure we're starting at zero
                features = foo.features();
                assert.strictEqual(features.length, 0);

                // add feature
                foo.addSetterGetterFeature("test", "string");

                // make sure feature was added
                features = foo.features();
                assert.strictEqual(features.length, 1);
                assert.strictEqual(features[0].name, "test");
            });

            it("throws if feature name is undefined", function() {
                assert.throws(() => {
                    foo.addSetterGetterFeature(undefined, "string");
                }, TypeError, "addFeature expected 'name' to be String, got undefined");
            });

            it("throws if feature name isn't a string", function() {
                assert.throws(() => {
                    foo.addSetterGetterFeature([], "string");
                }, TypeError, "addFeature expected 'name' to be String, got object");
            });

            it("throws if requesting type null", function() {
                assert.throws(() => {
                    foo.addSetterGetterFeature("test", null);
                }, TypeError, "addSetterGetterFeature bad type: null");
            });

            it("throws if requesting type undefined", function() {
                assert.throws(() => {
                    foo.addSetterGetterFeature("test");
                }, TypeError, "addSetterGetterFeature bad type: undefined");
            });

            it("feature works with type string", function() {
                var features;
                // make sure we're starting at zero
                features = foo.features();
                assert.strictEqual(features.length, 0);

                // add feature
                foo.addSetterGetterFeature("test", "string");

                // make sure feature was added
                features = foo.features();
                assert.strictEqual(features.length, 1);
                assert.strictEqual(features[0].name, "test");

                assert.isUndefined(foo.test);
                foo.config("test", "test string");
                assert.strictEqual(foo.test, "test string");
            });

            it("feature works with type Array");
            it("feature works with type boolean");
            it("feature works with type Map");
            it("feature works with type Promise");
            it("feature throws on undefined");
            it("feature throws on wrong type");
        });

        describe("addEnableFeature", function() {
            it("adds an enabler");
            it("throws if name is undefined");
            it("throws if name isn't a string");
        });
    });

    describe("dependencies", function() {
        it("starts empty", function() {
            var foo = new Foo(dummyComponentManager);
            assert.isArray(foo.dependencyList);
            assert.strictEqual(foo.dependencyList.length, 0);
        });

        describe("addDependency", function() {
            it("adds a dependency");
            it("throws if name is undefined");
            it("throws if name isn't a string");
        });

        describe("removeDependency", function() {
            it("removes a dependency");
            it("throws if name is undefined");
            it("throws if name isn't a string");
        });

        describe("addDependencyType", function() {
            it("adds a new type");
            it("throws if name is undefined");
            it("throws if name isn't a string");
        });

        describe("removeDependencyType", function() {
            it("removes a type");
        });
    });
});
