"use strict";

exports.__esModule = true;
exports.default = _default;

var _presetStage = _interopRequireDefault(require("@babel/preset-stage-2"));

var _pluginProposalDecorators = _interopRequireDefault(require("@babel/plugin-proposal-decorators"));

var _pluginProposalExportDefaultFrom = _interopRequireDefault(require("@babel/plugin-proposal-export-default-from"));

var _pluginProposalOptionalChaining = _interopRequireDefault(require("@babel/plugin-proposal-optional-chaining"));

var _pluginProposalPipelineOperator = _interopRequireDefault(require("@babel/plugin-proposal-pipeline-operator"));

var _pluginProposalNullishCoalescingOperator = _interopRequireDefault(require("@babel/plugin-proposal-nullish-coalescing-operator"));

var _pluginProposalDoExpressions = _interopRequireDefault(require("@babel/plugin-proposal-do-expressions"));

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
    throw new Error("@babel/preset-stage-1 'loose' option must be a boolean.");
  }

  if (typeof useBuiltIns !== "boolean") {
    throw new Error("@babel/preset-stage-1 'useBuiltIns' option must be a boolean.");
  }

  return {
    presets: [[_presetStage.default, {
      loose: loose,
      useBuiltIns: useBuiltIns
    }]],
    plugins: [_pluginProposalDecorators.default, _pluginProposalExportDefaultFrom.default, [_pluginProposalOptionalChaining.default, {
      loose: loose
    }], _pluginProposalPipelineOperator.default, [_pluginProposalNullishCoalescingOperator.default, {
      loose: loose
    }], _pluginProposalDoExpressions.default]
  };
}