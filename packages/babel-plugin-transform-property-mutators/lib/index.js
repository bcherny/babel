"use strict";

exports.__esModule = true;
exports.default = _default;

var defineMap = _interopRequireWildcard(require("@babel/helper-define-map"));

var _core = require("@babel/core");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _default() {
  return {
    visitor: {
      ObjectExpression: function ObjectExpression(path, file) {
        var node = path.node;
        var hasAny = false;
        var _arr = node.properties;

        for (var _i = 0; _i < _arr.length; _i++) {
          var prop = _arr[_i];

          if (prop.kind === "get" || prop.kind === "set") {
            hasAny = true;
            break;
          }
        }

        if (!hasAny) return;
        var mutatorMap = {};
        node.properties = node.properties.filter(function (prop) {
          if (!prop.computed && (prop.kind === "get" || prop.kind === "set")) {
            defineMap.push(mutatorMap, prop, null, file);
            return false;
          } else {
            return true;
          }
        });
        path.replaceWith(_core.types.callExpression(_core.types.memberExpression(_core.types.identifier("Object"), _core.types.identifier("defineProperties")), [node, defineMap.toDefineObject(mutatorMap)]));
      }
    }
  };
}