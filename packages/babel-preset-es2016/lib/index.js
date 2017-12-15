"use strict";

exports.__esModule = true;
exports.default = _default;

var _pluginTransformExponentiationOperator = _interopRequireDefault(require("@babel/plugin-transform-exponentiation-operator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    plugins: [_pluginTransformExponentiationOperator.default]
  };
}