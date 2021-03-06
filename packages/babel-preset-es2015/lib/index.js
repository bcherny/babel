"use strict";

exports.__esModule = true;
exports.default = _default;

var _pluginTransformTemplateLiterals = _interopRequireDefault(require("@babel/plugin-transform-template-literals"));

var _pluginTransformLiterals = _interopRequireDefault(require("@babel/plugin-transform-literals"));

var _pluginTransformFunctionName = _interopRequireDefault(require("@babel/plugin-transform-function-name"));

var _pluginTransformArrowFunctions = _interopRequireDefault(require("@babel/plugin-transform-arrow-functions"));

var _pluginTransformBlockScopedFunctions = _interopRequireDefault(require("@babel/plugin-transform-block-scoped-functions"));

var _pluginTransformClasses = _interopRequireDefault(require("@babel/plugin-transform-classes"));

var _pluginTransformObjectSuper = _interopRequireDefault(require("@babel/plugin-transform-object-super"));

var _pluginTransformShorthandProperties = _interopRequireDefault(require("@babel/plugin-transform-shorthand-properties"));

var _pluginTransformDuplicateKeys = _interopRequireDefault(require("@babel/plugin-transform-duplicate-keys"));

var _pluginTransformComputedProperties = _interopRequireDefault(require("@babel/plugin-transform-computed-properties"));

var _pluginTransformForOf = _interopRequireDefault(require("@babel/plugin-transform-for-of"));

var _pluginTransformStickyRegex = _interopRequireDefault(require("@babel/plugin-transform-sticky-regex"));

var _pluginTransformUnicodeRegex = _interopRequireDefault(require("@babel/plugin-transform-unicode-regex"));

var _pluginCheckConstants = _interopRequireDefault(require("@babel/plugin-check-constants"));

var _pluginTransformSpread = _interopRequireDefault(require("@babel/plugin-transform-spread"));

var _pluginTransformParameters = _interopRequireDefault(require("@babel/plugin-transform-parameters"));

var _pluginTransformDestructuring = _interopRequireDefault(require("@babel/plugin-transform-destructuring"));

var _pluginTransformBlockScoping = _interopRequireDefault(require("@babel/plugin-transform-block-scoping"));

var _pluginTransformTypeofSymbol = _interopRequireDefault(require("@babel/plugin-transform-typeof-symbol"));

var _pluginTransformModulesCommonjs = _interopRequireDefault(require("@babel/plugin-transform-modules-commonjs"));

var _pluginTransformModulesSystemjs = _interopRequireDefault(require("@babel/plugin-transform-modules-systemjs"));

var _pluginTransformModulesAmd = _interopRequireDefault(require("@babel/plugin-transform-modules-amd"));

var _pluginTransformModulesUmd = _interopRequireDefault(require("@babel/plugin-transform-modules-umd"));

var _pluginTransformInstanceof = _interopRequireDefault(require("@babel/plugin-transform-instanceof"));

var _pluginTransformRegenerator = _interopRequireDefault(require("@babel/plugin-transform-regenerator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(api, opts) {
  if (opts === void 0) {
    opts = {};
  }

  var moduleTypes = ["commonjs", "amd", "umd", "systemjs"];
  var loose = false;
  var modules = "commonjs";
  var spec = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
    if (opts.modules !== undefined) modules = opts.modules;
    if (opts.spec !== undefined) spec = opts.spec;
  }

  if (typeof loose !== "boolean") {
    throw new Error("Preset es2015 'loose' option must be a boolean.");
  }

  if (typeof spec !== "boolean") {
    throw new Error("Preset es2015 'spec' option must be a boolean.");
  }

  if (modules !== false && moduleTypes.indexOf(modules) === -1) {
    throw new Error("Preset es2015 'modules' option must be 'false' to indicate no modules\n" + "or a module type which be be one of: 'commonjs' (default), 'amd', 'umd', 'systemjs'");
  }

  var optsLoose = {
    loose: loose
  };
  return {
    plugins: [[_pluginTransformTemplateLiterals.default, {
      loose: loose,
      spec: spec
    }], _pluginTransformLiterals.default, _pluginTransformFunctionName.default, [_pluginTransformArrowFunctions.default, {
      spec: spec
    }], _pluginTransformBlockScopedFunctions.default, [_pluginTransformClasses.default, optsLoose], _pluginTransformObjectSuper.default, _pluginTransformShorthandProperties.default, _pluginTransformDuplicateKeys.default, [_pluginTransformComputedProperties.default, optsLoose], [_pluginTransformForOf.default, optsLoose], _pluginTransformStickyRegex.default, _pluginTransformUnicodeRegex.default, _pluginCheckConstants.default, [_pluginTransformSpread.default, optsLoose], [_pluginTransformParameters.default, optsLoose], [_pluginTransformDestructuring.default, optsLoose], _pluginTransformBlockScoping.default, _pluginTransformTypeofSymbol.default, _pluginTransformInstanceof.default, modules === "commonjs" && [_pluginTransformModulesCommonjs.default, optsLoose], modules === "systemjs" && [_pluginTransformModulesSystemjs.default, optsLoose], modules === "amd" && [_pluginTransformModulesAmd.default, optsLoose], modules === "umd" && [_pluginTransformModulesUmd.default, optsLoose], [_pluginTransformRegenerator.default, {
      async: false,
      asyncGenerators: false
    }]].filter(Boolean)
  };
}