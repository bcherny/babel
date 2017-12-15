"use strict";

exports.__esModule = true;
exports.default = _default;

var _pluginTransformFlowStripTypes = _interopRequireDefault(require("@babel/plugin-transform-flow-strip-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    plugins: [_pluginTransformFlowStripTypes.default]
  };
}