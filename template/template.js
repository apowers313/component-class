"use strict";

var Component = require("component-class");
var log;

module.exports = class TemplateComponentName extends Component {
    constructor(cm) {
        super(cm);

        this.configTable["config-option"] = this.configOption;

        this.addDependency("logger");
        this.addDependency("external-module-name");
    }

    init() {
        var logger = this.cm.get("logger");
        if (logger === undefined) {
            throw new Error("logger component not found");
        }
        log = logger.create("TemplateComponentName");

        log.debug("Starting TemplateComponentName ...");
    }

    shutdown() {
        // log.debug ("Shutting down TemplateComponentName.");
    }

    configOption(opts) {
        log.debug("Setting option to: ", opts);
    }
};
