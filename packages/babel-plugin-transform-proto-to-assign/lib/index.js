"use strict";

exports.__esModule = true;
exports.default = _default;

var _pull = _interopRequireDefault(require("lodash/pull"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  function isProtoKey(node) {
    return _core.types.isLiteral(_core.types.toComputedKey(node, node.key), {
      value: "__proto__"
    });
  }

  function isProtoAssignmentExpression(node) {
    var left = node.left;
    return _core.types.isMemberExpression(left) && _core.types.isLiteral(_core.types.toComputedKey(left, left.property), {
      value: "__proto__"
    });
  }

  function buildDefaultsCallExpression(expr, ref, file) {
    return _core.types.expressionStatement(_core.types.callExpression(file.addHelper("defaults"), [ref, expr.right]));
  }

  return {
    visitor: {
      AssignmentExpression: function AssignmentExpression(path, file) {
        if (!isProtoAssignmentExpression(path.node)) return;
        var nodes = [];
        var left = path.node.left.object;
        var temp = path.scope.maybeGenerateMemoised(left);

        if (temp) {
          nodes.push(_core.types.expressionStatement(_core.types.assignmentExpression("=", temp, left)));
        }

        nodes.push(buildDefaultsCallExpression(path.node, temp || left, file));
        if (temp) nodes.push(temp);
        path.replaceWithMultiple(nodes);
      },
      ExpressionStatement: function ExpressionStatement(path, file) {
        var expr = path.node.expression;
        if (!_core.types.isAssignmentExpression(expr, {
          operator: "="
        })) return;

        if (isProtoAssignmentExpression(expr)) {
          path.replaceWith(buildDefaultsCallExpression(expr, expr.left.object, file));
        }
      },
      ObjectExpression: function ObjectExpression(path, file) {
        var proto;
        var node = path.node;
        var _arr = node.properties;

        for (var _i = 0; _i < _arr.length; _i++) {
          var prop = _arr[_i];

          if (isProtoKey(prop)) {
            proto = prop.value;
            (0, _pull.default)(node.properties, prop);
          }
        }

        if (proto) {
          var args = [_core.types.objectExpression([]), proto];
          if (node.properties.length) args.push(node);
          path.replaceWith(_core.types.callExpression(file.addHelper("extends"), args));
        }
      }
    }
  };
}