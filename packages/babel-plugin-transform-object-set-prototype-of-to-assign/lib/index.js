"use strict";

exports.__esModule = true;
exports.default = _default;

function _default() {
  return {
    visitor: {
      CallExpression: function CallExpression(path, file) {
        if (path.get("callee").matchesPattern("Object.setPrototypeOf")) {
          path.node.callee = file.addHelper("defaults");
        }
      }
    }
  };
}