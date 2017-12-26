"use strict";

exports.__esModule = true;
exports.default = _default;

var _core = require("@babel/core");

function _default() {
  return {
    visitor: {
      FunctionExpression: {
        exit: function exit(path) {
          var node = path.node;
          if (!node.id) return;
          path.replaceWith(_core.types.callExpression(_core.types.functionExpression(null, [], _core.types.blockStatement([_core.types.toStatement(node), _core.types.returnStatement(node.id)])), []));
        }
      }
    }
  };
}