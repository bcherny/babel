"use strict";

exports.__esModule = true;
exports.default = _default;

var _core = require("@babel/core");

function _default() {
  return {
    visitor: {
      MemberExpression: {
        exit: function exit(_ref) {
          var node = _ref.node;
          var prop = node.property;

          if (!node.computed && _core.types.isIdentifier(prop) && !_core.types.isValidES3Identifier(prop.name)) {
            node.property = _core.types.stringLiteral(prop.name);
            node.computed = true;
          }
        }
      }
    }
  };
}