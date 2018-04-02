"use strict";

var path = require("path");
var thisPackage = require(path.join(__dirname, "../package.json"));

module.exports = class Component {
    constructor(cm) {
        // I'd love to do 'instanceof ComponentManager' here,
        // but that creates a dependency on the simple-component-manager package
        // that I don't want to pull in
        if (typeof cm !== "object" ||
            typeof cm.registerType !== "function" ||
            typeof cm.getType !== "function" ||
            typeof cm.register !== "function" ||
            typeof cm.get !== "function" ||
            typeof cm.clear !== "function" ||
            typeof cm.config !== "function" ||
            typeof cm.init !== "function" ||
            typeof cm.shutdown !== "function" ||
            !(cm.componentList instanceof Map) ||
            !(cm.typeList instanceof Map)
        ) {
            throw new TypeError("Component constructor: expected 'cm' parameter to be instance of ComponentManager");
        }
        this.cm = cm;

        this.configMap = new Map();

        this.componentVersion = thisPackage.version;
        this.dependencyList = [];
    }

    dependencies() {
        return this.dependencyList;
    }

    addDependency(name) {
        if (typeof name !== "string") {
            throw new TypeError("addDependency expected 'name' to be string, got " + typeof name);
        }

        this.dependencyList.push({ name: name });
    }

    // TODO: removeDependency()

    addDependencyType(type) {
        if (typeof type !== "string") {
            throw new TypeError("addDependencyType expected 'type' to be string, got " + typeof type);
        }

        this.dependencyList.push({ type: type });
    }

    // TODO: removeDependencyType()

    features() {
        var featureList = [];
        for (let kv of this.configMap) {
            let feature = {
                name: kv[0],
                fn: kv[1]
            };
            featureList.push(feature);
        }
        return featureList;
    }

    addFeature(name, fn) {
        if (typeof name !== "string") {
            throw new TypeError("addFeature expected 'name' to be String, got " + typeof name);
        }

        if (typeof fn !== "function") {
            throw new TypeError("addFeature expected 'fn' to be Function, got " + typeof fn);
        }

        if (this.configMap.has(name)) {
            throw new Error(`addFeature already has feature named: '${name}'`);
        }

        this.configMap.set(name, fn);
    }

    addSetterGetterFeature(name, type, deflt) {
        var checkFn;
        var featureSetter = (val) => {
            checkFn(val);

            this[name] = val;
        };

        var featureGetter = () => this[name];

        function checkBuiltin(t, val) {
            if (typeof val !== t) {
                throw new TypeError(`feature '${name}' expected type ${t}, got: ` + typeof val);
            }
        }

        function checkObject(t, val) {
            if (!(val instanceof t)) {
                throw new TypeError(`feature '${name}' received argument of wrong type: ${val}`);
            }
        }

        if (typeof name !== "string") {
            throw new TypeError("addSetterGetterFeature expected 'name' to be String, got " + typeof name);
        }

        if (type === "null" || type === "undefined") {
            throw new TypeError("addSetterGetterFeature doesn't make sense with type " + type);
        }

        switch (typeof type) {
            case "string":
                checkFn = checkBuiltin.bind(this, type);
                break;
            case "function":
                checkFn = checkObject.bind(this, type);
                break;
            default:
                throw new TypeError("addSetterGetterFeature bad type: " + type);
        }

        if (deflt !== undefined) {
            checkFn(deflt);
            this[name] = deflt;
        }

        this.addFeature("set-" + camelCaseToKebabCase(name), featureSetter);
        this.addFeature("get-" + camelCaseToKebabCase(name), featureGetter);
    }

    addEnableFeature(name, deflt) {
        var enableFeature = (val) => {
            val = checkBool(val, true);

            this[name] = val;
        };

        var disableFeature = (val) => {
            val = checkBool(val);

            this[name] = !val;
        };

        function checkBool(val) {
            if (val === undefined) return true;

            if (typeof val !== "boolean") {
                throw new TypeError(`feature '${name}' expected 'val' to be Boolean, got ${typeof val}`);
            }

            return val;
        }

        if (typeof name !== "string") {
            throw new TypeError("addEnableFeature expected 'name' to be String, got " + typeof name);
        }

        if (deflt !== undefined) {
            checkBool(deflt);
            this[name] = deflt;
        }

        this.addFeature("enable-" + camelCaseToKebabCase(name), enableFeature);
        this.addFeature("disable-" + camelCaseToKebabCase(name), disableFeature);
        this.addFeature("get-" + camelCaseToKebabCase(name), () => this[name]);
    }

    removeFeature(name) {
        if (typeof name !== "string") {
            throw new TypeError("removeFeature expected 'name' to be String, got " + typeof name);
        }

        if (!this.configMap.has(name)) {
            throw new Error(`removeFeature didn't have feature named: '${name}'`);
        }

        this.configMap.delete(name);
    }

    get configTable() {
        throw new Error("Component: direct access to config table is deprecated");
    }

    set configTable(val) {
        throw new Error("Component: direct access to config table is deprecated");
    }

    config(feature, value) {
        var featureFn = this.configMap.get(feature);

        if (typeof featureFn === "undefined") {
            throw new Error(`'${feature}' not found during config`);
        }

        if (typeof featureFn !== "function") {
            throw new TypeError(`configTable misconfigured for ${feature}: expected a function, got ${typeof featureFn}`);
        }

        return featureFn.call(this, value);
    }

    init() {}

    shutdown() {}
};

function camelCaseToKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
