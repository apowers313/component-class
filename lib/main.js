"use strict";

var path = require("path");

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

        this.configTable = Object.create(null);

        var myPackage = require(path.join(__dirname, "../package.json")); // eslint-disable-line global-require
        this.componentVersion = myPackage.version;
        this.dependencyList = [];
    }

    dependencies() {
        return this.dependencyList;
    }

    addDependency(name) {
        if (typeof name !== "string") {
            throw new TypeError("addDependency expected 'name' to be string, got" + typeof name);
        }

        this.dependencyList.push({ name: name });
    }

    // TODO: removeDependency()

    addDependencyType(type) {
        if (typeof type !== "string") {
            throw new TypeError("addDependency expected 'type' to be string, got" + typeof type);
        }

        this.dependencyList.push({ type: type });
    }

    // TODO: removeDependencyType()

    features() {
        var featureList = [];
        for (let feature in this.configTable) {
            featureList.push(feature);
        }
        return featureList;
    }

    // TODO: addFeature
    // TODO: removeFeature

    config(feature, value) {
        var featureFn = this.configTable[feature];
        if (typeof featureFn === "undefined") {
            throw new TypeError(`${feature} not found during config`);
        }
        if (typeof featureFn !== "function") {
            throw new TypeError(`configTable misconfigured for ${feature}: expected a function, got ${typeof featureFn}`);
        }
        return featureFn.call(this, value);
    }

    init() {}

    shutdown() {}
};
