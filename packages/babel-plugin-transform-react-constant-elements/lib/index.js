"use strict";

exports.__esModule = true;
exports.default = transformReactConstantElement;

var _core = require("@babel/core");

function transformReactConstantElement(api, options) {
  var allowMutablePropsOnTags = options.allowMutablePropsOnTags;

  if (allowMutablePropsOnTags != null && !Array.isArray(allowMutablePropsOnTags)) {
    throw new Error(".allowMutablePropsOnTags must be an array, null, or undefined.");
  }

  var HOISTED = new WeakSet();
  var immutabilityVisitor = {
    enter: function enter(path, state) {
      var stop = function stop() {
        state.isImmutable = false;
        path.stop();
      };

      if (path.isJSXClosingElement()) {
        path.skip();
        return;
      }

      if (path.isJSXIdentifier({
        name: "ref"
      }) && path.parentPath.isJSXAttribute({
        name: path.node
      })) {
        return stop();
      }

      if (path.isJSXIdentifier() || path.isIdentifier() || path.isJSXMemberExpression()) {
        return;
      }

      if (!path.isImmutable()) {
        if (path.isPure()) {
          var expressionResult = path.evaluate();

          if (expressionResult.confident) {
            var value = expressionResult.value;
            var isMutable = !state.mutablePropsAllowed && value && typeof value === "object" || typeof value === "function";

            if (!isMutable) {
              path.skip();
              return;
            }
          } else if (_core.types.isIdentifier(expressionResult.deopt)) {
            return;
          }
        }

        stop();
      }
    }
  };
  return {
    visitor: {
      JSXElement: function JSXElement(path) {
        if (HOISTED.has(path.node)) return;
        HOISTED.add(path.node);
        var state = {
          isImmutable: true
        };

        if (allowMutablePropsOnTags != null) {
          var namePath = path.get("openingElement.name");

          while (namePath.isJSXMemberExpression()) {
            namePath = namePath.get("property");
          }

          var elementName = namePath.node.name;
          state.mutablePropsAllowed = allowMutablePropsOnTags.indexOf(elementName) > -1;
        }

        path.traverse(immutabilityVisitor, state);

        if (state.isImmutable) {
          path.hoist();
        }
      }
    }
  };
}