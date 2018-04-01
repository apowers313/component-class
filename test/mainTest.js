"use strict";

var Component = require("../index.js");
var assert = require("chai").assert;

var dummyComponentManager = {
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

describe("component", function() {
    it("has init", function() {
        class Foo extends Component {

        }
        var foo = new Foo(dummyComponentManager);
        assert.isFunction(foo.init);
        foo.init();
    });
    it("has shutdown");
    it("returns empty dependency list");
    it("errors on config");
    it("has version", function() {
        var c = new Component(dummyComponentManager);
        assert.strictEqual(c.componentVersion, "1.0.0");
    });
});
