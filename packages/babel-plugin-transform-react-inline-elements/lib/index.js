"use strict";

exports.__esModule = true;
exports.default = _default;

var _helperBuilderReactJsx = _interopRequireDefault(require("@babel/helper-builder-react-jsx"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  function hasRefOrSpread(attrs) {
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (_core.types.isJSXSpreadAttribute(attr)) return true;
      if (isJSXAttributeOfName(attr, "ref")) return true;
    }

    return false;
  }

  function isJSXAttributeOfName(attr, name) {
    return _core.types.isJSXAttribute(attr) && _core.types.isJSXIdentifier(attr.name, {
      name: name
    });
  }

  var visitor = (0, _helperBuilderReactJsx.default)({
    filter: function filter(node) {
      return !hasRefOrSpread(node.openingElement.attributes);
    },
    pre: function pre(state) {
      var tagName = state.tagName;
      var args = state.args;

      if (_core.types.react.isCompatTag(tagName)) {
        args.push(_core.types.stringLiteral(tagName));
      } else {
        args.push(state.tagExpr);
      }
    },
    post: function post(state, pass) {
      state.callee = pass.addHelper("jsx");
      var props = state.args[1];
      var hasKey = false;

      if (_core.types.isObjectExpression(props)) {
        var keyIndex = props.properties.findIndex(function (prop) {
          return _core.types.isIdentifier(prop.key, {
            name: "key"
          });
        });

        if (keyIndex > -1) {
          state.args.splice(2, 0, props.properties[keyIndex].value);
          props.properties.splice(keyIndex, 1);
          hasKey = true;
        }
      } else if (_core.types.isNullLiteral(props)) {
        state.args.splice(1, 1, _core.types.objectExpression([]));
      }

      if (!hasKey && state.args.length > 2) {
        state.args.splice(2, 0, _core.types.unaryExpression("void", _core.types.numericLiteral(0)));
      }
    }
  });
  return {
    visitor: visitor
  };
}