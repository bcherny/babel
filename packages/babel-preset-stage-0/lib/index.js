"use strict";

exports.__esModule = true;
exports.default = _default;

var _presetStage = _interopRequireDefault(require("@babel/preset-stage-1"));

var _pluginProposalFunctionBind = _interopRequireDefault(require("@babel/plugin-proposal-function-bind"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(context, opts) {
  if (opts === void 0) {
    opts = {};
  }

  var loose = false;
  var useBuiltIns = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
    if (opts.useBuiltIns !== undefined) useBuiltIns = opts.useBuiltIns;
  }

  if (typeof loose !== "boolean") {
    throw new Error("@babel/preset-stage-0 'loose' option must be a boolean.");
  }

  if (typeof useBuiltIns !== "boolean") {
    throw new Error("@babel/preset-stage-0 'useBuiltIns' option must be a boolean.");
  }

  return {
    presets: [[_presetStage.default, {
      loose: loose,
      useBuiltIns: useBuiltIns
    }]],
    plugins: [_pluginProposalFunctionBind.default]
  };
}