"use strict";

var path = require("path");
var thisPackage = require(path.join(__dirname, "../package.json"));

/**
 * The main class for things managed by Simple Component Manager
 */
module.exports = class Component {
    /**
     * Creates a new instance of this component.
     * @param {Object} cm An instance of a ComponentManager
     * @return {Object} A Component object
     * @throws {TypeError} if a Component manager is not passwed to the contructor
     */
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

    /**
     * Returns a list of Components that this component is dependent on
     * @return {Array.<String>} An Array of Strings, where each string is the name of
     * a component that this component depends on. This Will be used to create a 
     * dependency tree so that modules can be loaded prior to the modules that depend
     * on them.
     */
    dependencies() {
        return this.dependencyList;
    }

    /**
     * Adds a dependency to the dependency list.
     * @param {String} name The name of the module that this module depends on.
     */
    addDependency(name) {
        if (typeof name !== "string") {
            throw new TypeError("addDependency expected 'name' to be string, got " + typeof name);
        }

        this.dependencyList.push({ name: name });
    }

    // TODO: removeDependency()

    /**
     * Adds a dependency on the type of Component. This allows dependencies based on
     * the Component type rather than a specific Component name.
     * @param {String} type The name of the type that this Component depends on.
     */
    addDependencyType(type) {
        if (typeof type !== "string") {
            throw new TypeError("addDependencyType expected 'type' to be string, got " + typeof type);
        }

        this.dependencyList.push({ type: type });
    }

    // TODO: removeDependencyType()

    /**
     * Returns a list of features provided by this component. Components are
     * attributes that can be set, functionality that can be enabled, configuration
     * parameters, etc.
     * @return {Array.<Object>} An Array of features. Each feature is an Object
     * conataining two properties:
     * 
     * 1. `name` - the name of the features
     * 2. `fn` - the function to call to invoke the feature
     */
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

    /**
     * Adds a new feature to this Component.
     * @param {String} name The name of the feature to be addeed. Should be in "kebab 
     * case" (e.g. "set-my-cool-feature")
     * @param {Function} fn The Function that will be invoked for the feature
     */
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

    /**
     * Convenience function for {@link addFeature}. Adds a new feature that allows
     * setting or getting variable named `name`. This will create two new features:
     * "get-name" and "set-name" and will create a helper function that ensures that
     * the variable is of the right `type` when it is set.
     * @param {String} name The name of the new feature. This should be in "camel 
     * case" (e.g. - myVariableName) and will automatically be converted to "kebab 
     * case" for the setter / getter features. The variable can be referenced at
     * `this.name` within the Component and will initially be `undefined` unless a
     * default is specified with the `deflt` parameter.
     * @param {String|Function} type The type that this feature is expected to be. If
     * the value of `type` is a string, it values will be evaluated with `typeof` and 
     * setting will cause an Error to be thrown if the `typeof` the value does not
     * match the specified type. If the `type` is a Function, it will be assumed to
     * be a class constructor and setting the value will cause an Error to be thrown
     * if value is not an `instanceof` the `type`.
     * @param [Any] deflt The default value of this feature. Must be of the type
     * specified by `type` or an Error will be thrown.
     */
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

    /**
     * A convenience function for {@link addFeature}. This will define two new
     * features: "enable-name" and "disable-name". The feature can be referenced at
     * `this.name` and will be `true` if the feature is enabled and `false` if the
     * feature is disabled. The "enable-name" feaure is straight forward -- it will
     * set the value of `this.name` to the Boolean value provided to it. The
     * "disable-name" feature will do the inverse of the Boolean value provided: if
     * "disable-name" is `true` the value of `this.name` will be `false`.
     * @param {String} name The name of the new feature. This should be in "camel 
     * case" (e.g. - myVariableName) and will automatically be converted to "kebab 
     * case" for the setter / getter features. The variable can be referenced at
     * `this.name` within the Component and will initially be `undefined` unless a
     * default is specified with the `deflt` parameter.
     * @param {Boolean} deflt The default value for this feature, either `true` or
     * `false`.
     */
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

    /**
     * Removes the specified feature
     * @param {String} name The name of the feature to remove.
     */
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

    /**
     * Configures this component by calling the specified feature with the specified
     * value.
     * @param {String} feature The name of the feature to configure
     * @param {String} value The value to pass to the feature.
     */
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

    /**
     * Initializes the Component. Virtual method intended to be extended by the child
     * class, if necessary.
     */
    init() {}

    /**
     * Graefully shuts down this Component. Virutal method intended to be extended by
     * the child class, if necessary.
     */
    shutdown() {}
};

function camelCaseToKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
