var Component = require("../index.js");
var assert = require("chai").assert;

describe("component", function() {
    it("has init", function() {
        class Foo extends Component {

        }
        var foo = new Foo();
        assert.isFunction(foo.init);
        foo.init();
    });
    it("has shutdown");
    it("returns empty dependency list");
    it("errors on config");
    it("has version", function() {
        var c = new Component();
        assert.strictEqual(c.componentVersion, "0.8.0");
    });
});