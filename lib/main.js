var path = require("path");

module.exports = class Component {
    constructor() {
        this.configTable = Object.create(null);

        var myPackage = require(path.join(__dirname, "../package.json"));
        this.componentVersion = myPackage.version;
    }

    dependencies() {
        return [];
    }

    features() {
        var featureList = [];
        for (let feature in this.configTable) {
            featureList.push(feature);
        }
        return featureList;
    }

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