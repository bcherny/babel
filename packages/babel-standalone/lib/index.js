"use strict";

exports.__esModule = true;
exports.transform = transform;
exports.transformFromAst = transformFromAst;
exports.registerPlugin = registerPlugin;
exports.registerPlugins = registerPlugins;
exports.registerPreset = registerPreset;
exports.registerPresets = registerPresets;
exports.transformScriptTags = transformScriptTags;
exports.disableScriptTags = disableScriptTags;
exports.version = exports.buildExternalHelpers = exports.availablePresets = exports.availablePlugins = void 0;

var Babel = _interopRequireWildcard(require("@babel/core"));

var _transformScriptTags = require("./transformScriptTags");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var isArray = Array.isArray || function (arg) {
  return Object.prototype.toString.call(arg) === "[object Array]";
};

function loadBuiltin(builtinTable, name) {
  if (isArray(name) && typeof name[0] === "string") {
    if (builtinTable.hasOwnProperty(name[0])) {
      return [builtinTable[name[0]]].concat(name.slice(1));
    }

    return;
  } else if (typeof name === "string") {
    return builtinTable[name];
  }

  return name;
}

function processOptions(options) {
  var presets = (options.presets || []).map(function (presetName) {
    var preset = loadBuiltin(availablePresets, presetName);

    if (preset) {
      if (isArray(preset) && typeof preset[0] === "object" && preset[0].hasOwnProperty("buildPreset")) {
        preset[0] = Object.assign({}, preset[0], {
          buildPreset: preset[0].buildPreset
        });
      }
    } else {
      throw new Error("Invalid preset specified in Babel options: \"" + presetName + "\"");
    }

    return preset;
  });
  var plugins = (options.plugins || []).map(function (pluginName) {
    var plugin = loadBuiltin(availablePlugins, pluginName);

    if (!plugin) {
      throw new Error("Invalid plugin specified in Babel options: \"" + pluginName + "\"");
    }

    return plugin;
  });
  return Object.assign({
    babelrc: false
  }, options, {
    presets: presets,
    plugins: plugins
  });
}

function transform(code, options) {
  return Babel.transform(code, processOptions(options));
}

function transformFromAst(ast, code, options) {
  return Babel.transformFromAst(ast, code, processOptions(options));
}

var availablePlugins = {};
exports.availablePlugins = availablePlugins;
var availablePresets = {};
exports.availablePresets = availablePresets;
var buildExternalHelpers = Babel.buildExternalHelpers;
exports.buildExternalHelpers = buildExternalHelpers;

function registerPlugin(name, plugin) {
  if (availablePlugins.hasOwnProperty(name)) {
    console.warn("A plugin named \"" + name + "\" is already registered, it will be overridden");
  }

  availablePlugins[name] = plugin;
}

function registerPlugins(newPlugins) {
  Object.keys(newPlugins).forEach(function (name) {
    return registerPlugin(name, newPlugins[name]);
  });
}

function registerPreset(name, preset) {
  if (availablePresets.hasOwnProperty(name)) {
    console.warn("A preset named \"" + name + "\" is already registered, it will be overridden");
  }

  availablePresets[name] = preset;
}

function registerPresets(newPresets) {
  Object.keys(newPresets).forEach(function (name) {
    return registerPreset(name, newPresets[name]);
  });
}

registerPlugins({
  "check-constants": require("@babel/plugin-check-constants"),
  "external-helpers": require("@babel/plugin-external-helpers"),
  "syntax-async-generators": require("@babel/plugin-syntax-async-generators"),
  "syntax-class-properties": require("@babel/plugin-syntax-class-properties"),
  "syntax-decorators": require("@babel/plugin-syntax-decorators"),
  "syntax-do-expressions": require("@babel/plugin-syntax-do-expressions"),
  "syntax-dynamic-import": require("@babel/plugin-syntax-dynamic-import"),
  "syntax-export-default-from": require("@babel/plugin-syntax-export-default-from"),
  "syntax-export-namespace-from": require("@babel/plugin-syntax-export-namespace-from"),
  "syntax-flow": require("@babel/plugin-syntax-flow"),
  "syntax-function-bind": require("@babel/plugin-syntax-function-bind"),
  "syntax-function-sent": require("@babel/plugin-syntax-function-sent"),
  "syntax-import-meta": require("@babel/plugin-syntax-import-meta"),
  "syntax-jsx": require("@babel/plugin-syntax-jsx"),
  "syntax-object-rest-spread": require("@babel/plugin-syntax-object-rest-spread"),
  "syntax-optional-catch-binding": require("@babel/plugin-syntax-optional-catch-binding"),
  "syntax-pipeline-operator": require("@babel/plugin-syntax-pipeline-operator"),
  "transform-async-to-generator": require("@babel/plugin-transform-async-to-generator"),
  "proposal-class-properties": require("@babel/plugin-proposal-class-properties"),
  "proposal-decorators": require("@babel/plugin-proposal-decorators"),
  "proposal-do-expressions": require("@babel/plugin-proposal-do-expressions"),
  "proposal-export-default-from": require("@babel/plugin-proposal-export-default-from"),
  "proposal-export-namespace-from": require("@babel/plugin-proposal-export-namespace-from"),
  "proposal-pipeline-operator": require("@babel/plugin-proposal-pipeline-operator"),
  "transform-arrow-functions": require("@babel/plugin-transform-arrow-functions"),
  "transform-block-scoped-functions": require("@babel/plugin-transform-block-scoped-functions"),
  "transform-block-scoping": require("@babel/plugin-transform-block-scoping"),
  "transform-classes": require("@babel/plugin-transform-classes"),
  "transform-computed-properties": require("@babel/plugin-transform-computed-properties"),
  "transform-destructuring": require("@babel/plugin-transform-destructuring"),
  "transform-duplicate-keys": require("@babel/plugin-transform-duplicate-keys"),
  "transform-for-of": require("@babel/plugin-transform-for-of"),
  "transform-function-name": require("@babel/plugin-transform-function-name"),
  "transform-instanceof": require("@babel/plugin-transform-instanceof"),
  "transform-literals": require("@babel/plugin-transform-literals"),
  "transform-modules-amd": require("@babel/plugin-transform-modules-amd"),
  "transform-modules-commonjs": require("@babel/plugin-transform-modules-commonjs"),
  "transform-modules-systemjs": require("@babel/plugin-transform-modules-systemjs"),
  "transform-modules-umd": require("@babel/plugin-transform-modules-umd"),
  "transform-object-super": require("@babel/plugin-transform-object-super"),
  "transform-parameters": require("@babel/plugin-transform-parameters"),
  "transform-shorthand-properties": require("@babel/plugin-transform-shorthand-properties"),
  "transform-spread": require("@babel/plugin-transform-spread"),
  "transform-sticky-regex": require("@babel/plugin-transform-sticky-regex"),
  "transform-template-literals": require("@babel/plugin-transform-template-literals"),
  "transform-typeof-symbol": require("@babel/plugin-transform-typeof-symbol"),
  "transform-unicode-regex": require("@babel/plugin-transform-unicode-regex"),
  "transform-member-expression-literals": require("@babel/plugin-transform-member-expression-literals"),
  "transform-property-literals": require("@babel/plugin-transform-property-literals"),
  "transform-property-mutators": require("@babel/plugin-transform-property-mutators"),
  "transform-eval": require("@babel/plugin-transform-eval"),
  "transform-exponentiation-operator": require("@babel/plugin-transform-exponentiation-operator"),
  "transform-flow-comments": require("@babel/plugin-transform-flow-comments"),
  "transform-flow-strip-types": require("@babel/plugin-transform-flow-strip-types"),
  "proposal-function-bind": require("@babel/plugin-proposal-function-bind"),
  "transform-jscript": require("@babel/plugin-transform-jscript"),
  "transform-new-target": require("@babel/plugin-transform-new-target"),
  "transform-object-assign": require("@babel/plugin-transform-object-assign"),
  "proposal-object-rest-spread": require("@babel/plugin-proposal-object-rest-spread"),
  "transform-object-set-prototype-of-to-assign": require("@babel/plugin-transform-object-set-prototype-of-to-assign"),
  "proposal-optional-catch-binding": require("@babel/plugin-proposal-optional-catch-binding"),
  "transform-proto-to-assign": require("@babel/plugin-transform-proto-to-assign"),
  "transform-react-constant-elements": require("@babel/plugin-transform-react-constant-elements"),
  "transform-react-display-name": require("@babel/plugin-transform-react-display-name"),
  "transform-react-inline-elements": require("@babel/plugin-transform-react-inline-elements"),
  "transform-react-jsx": require("@babel/plugin-transform-react-jsx"),
  "transform-react-jsx-compat": require("@babel/plugin-transform-react-jsx-compat"),
  "transform-react-jsx-self": require("@babel/plugin-transform-react-jsx-self"),
  "transform-react-jsx-source": require("@babel/plugin-transform-react-jsx-source"),
  "transform-regenerator": require("@babel/plugin-transform-regenerator"),
  "transform-runtime": require("@babel/plugin-transform-runtime"),
  "transform-strict-mode": require("@babel/plugin-transform-strict-mode"),
  "proposal-unicode-property-regex": require("@babel/plugin-proposal-unicode-property-regex")
});
registerPresets({
  es2015: require("@babel/preset-es2015"),
  es2016: require("@babel/preset-es2016"),
  es2017: require("@babel/preset-es2017"),
  react: require("@babel/preset-react"),
  "stage-0": require("@babel/preset-stage-0"),
  "stage-1": require("@babel/preset-stage-1"),
  "stage-2": require("@babel/preset-stage-2"),
  "stage-3": require("@babel/preset-stage-3"),
  "es2015-loose": {
    presets: [[require("@babel/preset-es2015"), {
      loose: true
    }]]
  },
  "es2015-no-commonjs": {
    presets: [[require("@babel/preset-es2015"), {
      modules: false
    }]]
  },
  typescript: require("@babel/preset-typescript"),
  flow: require("@babel/preset-flow")
});
var version = VERSION;
exports.version = version;

if (typeof window !== "undefined" && window && window.addEventListener) {
  window.addEventListener("DOMContentLoaded", function () {
    return transformScriptTags();
  }, false);
}

function transformScriptTags(scriptTags) {
  (0, _transformScriptTags.runScripts)(transform, scriptTags);
}

function disableScriptTags() {
  window.removeEventListener("DOMContentLoaded", transformScriptTags);
}