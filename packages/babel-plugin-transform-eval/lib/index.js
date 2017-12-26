"use strict";

exports.__esModule = true;
exports.default = _default;

function _default(_ref) {
  var parse = _ref.parse,
      traverse = _ref.traverse;
  return {
    visitor: {
      CallExpression: function CallExpression(path) {
        if (path.get("callee").isIdentifier({
          name: "eval"
        }) && path.node.arguments.length === 1) {
          var evaluate = path.get("arguments")[0].evaluate();
          if (!evaluate.confident) return;
          var code = evaluate.value;
          if (typeof code !== "string") return;
          var ast = parse(code);
          traverse.removeProperties(ast);
          return ast.program;
        }
      }
    }
  };
}