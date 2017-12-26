"use strict";

exports.__esModule = true;
exports.default = _default;

var _core = require("@babel/core");

function _default() {
  return {
    visitor: {
      "BindingIdentifier|ReferencedIdentifier": function BindingIdentifierReferencedIdentifier(path) {
        if (!_core.types.isValidES3Identifier(path.node.name)) {
          path.scope.rename(path.node.name);
        }
      }
    }
  };
}