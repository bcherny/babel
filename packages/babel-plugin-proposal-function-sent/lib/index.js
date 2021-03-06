"use strict";

exports.__esModule = true;
exports.default = _default;

var _pluginSyntaxFunctionSent = _interopRequireDefault(require("@babel/plugin-syntax-function-sent"));

var _helperWrapFunction = _interopRequireDefault(require("@babel/helper-wrap-function"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  var isFunctionSent = function isFunctionSent(node) {
    return _core.types.isIdentifier(node.meta, {
      name: "function"
    }) && _core.types.isIdentifier(node.property, {
      name: "sent"
    });
  };

  var yieldVisitor = {
    Function: function Function(path) {
      path.skip();
    },
    YieldExpression: function YieldExpression(path) {
      var replaced = _core.types.isAssignmentExpression(path.parent, {
        left: this.sentId
      });

      if (!replaced) {
        path.replaceWith(_core.types.assignmentExpression("=", this.sentId, path.node));
      }
    },
    MetaProperty: function MetaProperty(path) {
      if (isFunctionSent(path.node)) {
        path.replaceWith(this.sentId);
      }
    }
  };
  return {
    inherits: _pluginSyntaxFunctionSent.default,
    visitor: {
      MetaProperty: function MetaProperty(path, state) {
        if (!isFunctionSent(path.node)) return;
        var fnPath = path.getFunctionParent();

        if (!fnPath.node.generator) {
          throw new Error("Parent generator function not found");
        }

        var sentId = path.scope.generateUidIdentifier("function.sent");
        fnPath.traverse(yieldVisitor, {
          sentId: sentId
        });
        fnPath.node.body.body.unshift(_core.types.variableDeclaration("let", [_core.types.variableDeclarator(sentId, _core.types.yieldExpression())]));
        (0, _helperWrapFunction.default)(fnPath, state.addHelper("skipFirstGeneratorNext"));
      }
    }
  };
}