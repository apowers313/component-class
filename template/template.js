var Component = require("component-class");
var log;

module.exports = class TemplateComponentName extends Component {
    constructor(cm) {
        super(cm);

        this.configTable["config-option"] = this.configOption;
    }

    dependencies() {
        return [
            "logger",
            "external-module-name"
        ];
    }

    init() {
        var logger = this.cm.get("logger");
        if (logger === undefined) {
            throw new Error("logger component not found");
        }
        log = logger.create("TemplateComponentName");

        log.debug ("Starting TemplateComponentName ...");

        // work with a external component
        var component = this.cm.get("external-module-name");
        if (component === undefined) {
            throw new Error("component not found");
        }
        var something = component.config("get-something");
        component.config("set-something", true);
    }

    shutdown() {
        log.debug ("Shutting down TemplateComponentName.");
    }

    configOption(opts) {
        log.debug ("Setting option to: ", opts);
    }
};