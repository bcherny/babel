"use strict";

exports.__esModule = true;
exports.default = _default;

var _pluginTransformAsyncToGenerator = _interopRequireDefault(require("@babel/plugin-transform-async-to-generator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    plugins: [_pluginTransformAsyncToGenerator.default]
  };
}