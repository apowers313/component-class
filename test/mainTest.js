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
    it("throws if not constructed with ComponentManager", function() {
        assert.throws(() => {
            new Component();
        }, TypeError, "Component constructor: expected 'cm' parameter to be instance of ComponentManager");
    });

    it("has version", function() {
        var c = new Component(dummyComponentManager);
        assert.strictEqual(c.componentVersion, "2.0.0");
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
                assert.strictEqual(features.length, 2);
                assert.strictEqual(features[0].name, "set-test");
                assert.strictEqual(features[1].name, "get-test");
            });

            it("throws if feature name is undefined", function() {
                assert.throws(() => {
                    foo.addSetterGetterFeature(undefined, "string");
                }, TypeError, "addSetterGetterFeature expected 'name' to be String, got undefined");
            });

            it("throws if feature name isn't a string", function() {
                assert.throws(() => {
                    foo.addSetterGetterFeature([], "string");
                }, TypeError, "addSetterGetterFeature expected 'name' to be String, got object");
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

            it("throws if requesting type \"null\"", function() {
                assert.throws(() => {
                    foo.addSetterGetterFeature("test", "null");
                }, TypeError, "addSetterGetterFeature doesn't make sense with type null");
            });

            it("throws if requesting type \"undefined\"", function() {
                assert.throws(() => {
                    foo.addSetterGetterFeature("test", "undefined");
                }, TypeError, "addSetterGetterFeature doesn't make sense with type undefined");
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
                assert.strictEqual(features.length, 2);
                assert.strictEqual(features[0].name, "set-test");
                assert.strictEqual(features[1].name, "get-test");

                assert.isUndefined(foo.test);
                foo.config("set-test", "test string");
                assert.strictEqual(foo.test, "test string");
                assert.strictEqual(foo.config("get-test"), "test string");
                foo.config("set-test", "");
                assert.strictEqual(foo.test, "");
                assert.strictEqual(foo.config("get-test"), "");
                assert.throws(() => {
                    foo.config("set-test", 42);
                }, TypeError, "feature 'test' expected type string, got: number");
                assert.throws(() => {
                    foo.config("set-test", new ArrayBuffer());
                }, TypeError, "feature 'test' expected type string, got: object");
            });

            it("feature works with type boolean", function() {
                var features;
                // make sure we're starting at zero
                features = foo.features();
                assert.strictEqual(features.length, 0);

                // add feature
                foo.addSetterGetterFeature("test", "boolean");

                // make sure feature was added
                features = foo.features();
                assert.strictEqual(features.length, 2);
                assert.strictEqual(features[0].name, "set-test");
                assert.strictEqual(features[1].name, "get-test");

                assert.isUndefined(foo.test);
                foo.config("set-test", true);
                assert.strictEqual(foo.test, true);
                assert.strictEqual(foo.config("get-test"), true);
                foo.config("set-test", false);
                assert.strictEqual(foo.test, false);
                assert.strictEqual(foo.config("get-test"), false);
                assert.throws(() => {
                    foo.config("set-test", "test string");
                }, TypeError, "feature 'test' expected type boolean, got: string");
                assert.throws(() => {
                    foo.config("set-test", null);
                }, TypeError, "feature 'test' expected type boolean, got: object");
                assert.throws(() => {
                    foo.config("set-test", undefined);
                }, TypeError, "feature 'test' expected type boolean, got: undefined");
                assert.throws(() => {
                    foo.config("set-test", 0);
                }, TypeError, "feature 'test' expected type boolean, got: number");
            });

            it("feature works with type Array", function() {
                var features;
                // make sure we're starting at zero
                features = foo.features();
                assert.strictEqual(features.length, 0);

                // add feature
                foo.addSetterGetterFeature("test", Array);

                // make sure feature was added
                features = foo.features();
                assert.strictEqual(features.length, 2);
                assert.strictEqual(features[0].name, "set-test");
                assert.strictEqual(features[1].name, "get-test");

                assert.isUndefined(foo.test);
                var testArr = [];
                foo.config("set-test", testArr);
                assert.strictEqual(foo.test, testArr);
                assert.strictEqual(foo.config("get-test"), testArr);
                var testArr2 = [1, 2, 3];
                foo.config("set-test", testArr2);
                assert.strictEqual(foo.test, testArr2);
                assert.strictEqual(foo.config("get-test"), testArr2);
                assert.throws(() => {
                    foo.config("set-test", "test string");
                }, TypeError, "feature 'test' received argument of wrong type: test string");
                assert.throws(() => {
                    foo.config("set-test", null);
                }, TypeError, "feature 'test' received argument of wrong type: null");
                assert.throws(() => {
                    foo.config("set-test", undefined);
                }, TypeError, "feature 'test' received argument of wrong type: undefined");
                assert.throws(() => {
                    foo.config("set-test", 0);
                }, TypeError, "feature 'test' received argument of wrong type: 0");
                assert.throws(() => {
                    foo.config("set-test", {});
                }, TypeError, "feature 'test' received argument of wrong type: [object Object]");
            });

            it("feature works with type Map", function() {
                var features;
                // make sure we're starting at zero
                features = foo.features();
                assert.strictEqual(features.length, 0);

                // add feature
                foo.addSetterGetterFeature("test", Map);

                // make sure feature was added
                features = foo.features();
                assert.strictEqual(features.length, 2);
                assert.strictEqual(features[0].name, "set-test");
                assert.strictEqual(features[1].name, "get-test");

                assert.isUndefined(foo.test);
                var testMap = new Map([]);
                foo.config("set-test", testMap);
                assert.strictEqual(foo.test, testMap);
                assert.strictEqual(foo.config("get-test"), testMap);
                var testMap2 = new Map([[1, 2], [3, 4]]);
                foo.config("set-test", testMap2);
                assert.strictEqual(foo.config("get-test"), testMap2);
                assert.throws(() => {
                    foo.config("set-test", "test string");
                }, TypeError, "feature 'test' received argument of wrong type: test string");
                assert.throws(() => {
                    foo.config("set-test", null);
                }, TypeError, "feature 'test' received argument of wrong type: null");
                assert.throws(() => {
                    foo.config("set-test", undefined);
                }, TypeError, "feature 'test' received argument of wrong type: undefined");
                assert.throws(() => {
                    foo.config("set-test", 0);
                }, TypeError, "feature 'test' received argument of wrong type: 0");
                assert.throws(() => {
                    foo.config("set-test", {});
                }, TypeError, "feature 'test' received argument of wrong type: [object Object]");
            });

            it("sets default string", function() {
                // add feature
                foo.addSetterGetterFeature("test", "string", "happy");
                assert.strictEqual(foo.test, "happy");
                assert.strictEqual(foo.config("get-test"), "happy");
            });

            it("sets default Array", function() {
                var testArr = [1, 2, 3];
                // add feature
                foo.addSetterGetterFeature("test", Array, testArr);
                assert.strictEqual(foo.test, testArr);
                assert.strictEqual(foo.config("get-test"), testArr);
            });

            it("sets default number (0)", function() {
                var testNum = 0;
                // add feature
                foo.addSetterGetterFeature("test", "number", testNum);
                assert.strictEqual(foo.test, testNum);
                assert.strictEqual(foo.config("get-test"), testNum);
            });

            it("sets default boolean (false)", function() {
                var testBool = false;
                // add feature
                foo.addSetterGetterFeature("test", "boolean", testBool);
                assert.strictEqual(foo.test, testBool);
                assert.strictEqual(foo.config("get-test"), testBool);
            });

            it("throws if default is wrong type (string)", function() {
                assert.throws(() => {
                    foo.addSetterGetterFeature("test", "string", {});
                }, TypeError, "feature 'test' expected type string, got: object");
            });

            it("throws if default is wrong type (Array)", function() {
                assert.throws(() => {
                    foo.addSetterGetterFeature("test", Array, "not an array");
                }, TypeError, "feature 'test' received argument of wrong type: not an array");
            });

            it("converts camel case to kebab case", function() {
                var features;
                // make sure we're starting at zero
                features = foo.features();
                assert.strictEqual(features.length, 0);

                // add feature
                foo.addSetterGetterFeature("veryLongTest", "string", "yeppers");

                // check features
                assert.strictEqual(foo.veryLongTest, "yeppers");
                features = foo.features();
                assert.strictEqual(features.length, 2);
                assert.strictEqual(features[0].name, "set-very-long-test");
                assert.strictEqual(features[1].name, "get-very-long-test");
            });
        });

        describe("addEnableFeature", function() {
            it("adds an enabler", function() {
                var features;
                // make sure we're starting at zero
                features = foo.features();
                assert.strictEqual(features.length, 0);

                // add feature
                foo.addEnableFeature("test");

                // make sure feature was added
                features = foo.features();
                assert.strictEqual(features.length, 3);
                assert.strictEqual(features[0].name, "enable-test");
                assert.strictEqual(features[1].name, "disable-test");
                assert.strictEqual(features[2].name, "get-test");
            });

            it("throws if name is undefined", function() {
                assert.throws(() => {
                    foo.addEnableFeature();
                }, TypeError, "addEnableFeature expected 'name' to be String, got undefined");
            });

            it("throws if name isn't a string", function() {
                assert.throws(() => {
                    foo.addEnableFeature(42);
                }, TypeError, "addEnableFeature expected 'name' to be String, got number");
            });

            it("sets default to true", function() {
                // add feature
                foo.addEnableFeature("test", true);
                assert.strictEqual(foo.test, true);
            });

            it("sets default to false", function() {
                // add feature
                foo.addEnableFeature("test", false);
                assert.strictEqual(foo.test, false);
            });

            it("sets true if enable with no args", function() {
                // add feature
                foo.addEnableFeature("test");
                assert.strictEqual(foo.test, undefined);

                // get feature
                foo.config("enable-test");
                assert.strictEqual(foo.test, true);
                assert.strictEqual(foo.config("get-test"), true);
            });

            it("sets false if disable with no args", function() {
                // add feature
                foo.addEnableFeature("test");
                assert.strictEqual(foo.test, undefined);

                // get feature
                foo.config("disable-test");
                assert.strictEqual(foo.test, false);
                assert.strictEqual(foo.config("get-test"), false);
            });

            it("sets true if disable is false", function() {
                // add feature
                foo.addEnableFeature("test");
                assert.strictEqual(foo.test, undefined);

                // get feature
                foo.config("disable-test", true);
                assert.strictEqual(foo.test, false);
                assert.strictEqual(foo.config("get-test"), false);
            });

            it("sets false if disable is true", function() {
                // add feature
                foo.addEnableFeature("test");
                assert.strictEqual(foo.test, undefined);

                // get feature
                foo.config("disable-test", false);
                assert.strictEqual(foo.test, true);
                assert.strictEqual(foo.config("get-test"), true);
            });

            it("sets true if enable is true", function() {
                // add feature
                foo.addEnableFeature("test");
                assert.strictEqual(foo.test, undefined);

                // get feature
                foo.config("enable-test", true);
                assert.strictEqual(foo.test, true);
                assert.strictEqual(foo.config("get-test"), true);
            });

            it("sets false if enable is false", function() {
                // add feature
                foo.addEnableFeature("test");
                assert.strictEqual(foo.test, undefined);

                // get feature
                foo.config("enable-test", false);
                assert.strictEqual(foo.test, false);
                assert.strictEqual(foo.config("get-test"), false);
            });

            it("throws if setting with non-bool", function() {
                // add feature
                foo.addEnableFeature("test");

                assert.throws(() => {
                    foo.config("enable-test", "bob");
                }, TypeError, "feature 'test' expected 'val' to be Boolean, got string");
            });

            it("converts camel case to kebab case", function() {
                var features;
                // make sure we're starting at zero
                features = foo.features();
                assert.strictEqual(features.length, 0);

                // add feature
                foo.addEnableFeature("veryLongTest", true);

                // check features
                assert.strictEqual(foo.veryLongTest, true);
                features = foo.features();
                assert.strictEqual(features.length, 3);
                assert.strictEqual(features[0].name, "enable-very-long-test");
                assert.strictEqual(features[1].name, "disable-very-long-test");
                assert.strictEqual(features[2].name, "get-very-long-test");
            });
        });
    });

    describe("dependencies", function() {
        var foo;
        beforeEach(function() {
            foo = new Foo(dummyComponentManager);
        });

        it("starts empty", function() {
            assert.isArray(foo.dependencyList);
            assert.strictEqual(foo.dependencyList.length, 0);
        });

        describe("dependencies", function() {
            it("returns list", function() {
                var deps = foo.dependencies();
                assert.isArray(deps);
                assert.strictEqual(deps.length, 0);
            });
        });

        describe("addDependency", function() {
            it("adds a dependency", function() {
                // make sure we're starting empty
                assert.isArray(foo.dependencyList);
                assert.strictEqual(foo.dependencyList.length, 0);

                // add dependency
                foo.addDependency("mama");

                // make sure we got our new dependency
                assert.isArray(foo.dependencyList);
                assert.strictEqual(foo.dependencyList.length, 1);
                assert.deepEqual(foo.dependencyList[0], { name: "mama" });
            });

            it("throws if name is undefined", function() {
                assert.throws(() => {
                    foo.addDependency();
                }, TypeError, "addDependency expected 'name' to be string, got undefined");
            });

            it("throws if name isn't a string", function() {
                assert.throws(() => {
                    foo.addDependency(42);
                }, TypeError, "addDependency expected 'name' to be string, got number");
            });
        });

        describe("removeDependency", function() {
            it("removes a dependency");
            it("throws if name is undefined");
            it("throws if name isn't a string");
        });

        describe("addDependencyType", function() {
            it("adds a dependency type", function() {
                // make sure we're starting empty
                assert.isArray(foo.dependencyList);
                assert.strictEqual(foo.dependencyList.length, 0);

                // add dependency
                foo.addDependencyType("mama");

                // make sure we got our new dependency
                assert.isArray(foo.dependencyList);
                assert.strictEqual(foo.dependencyList.length, 1);
                assert.deepEqual(foo.dependencyList[0], { type: "mama" });
            });

            it("throws if name is undefined", function() {
                assert.throws(() => {
                    foo.addDependencyType();
                }, TypeError, "addDependencyType expected 'type' to be string, got undefined");
            });

            it("throws if name isn't a string", function() {
                assert.throws(() => {
                    foo.addDependencyType(42);
                }, TypeError, "addDependencyType expected 'type' to be string, got number");
            });
        });

        describe("removeDependencyType", function() {
            it("removes a type");
        });
    });
});
