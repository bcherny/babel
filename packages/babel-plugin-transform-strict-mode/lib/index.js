"use strict";

exports.__esModule = true;
exports.default = _default;

var _core = require("@babel/core");

function _default() {
  return {
    visitor: {
      Program: function Program(path) {
        var node = path.node;
        var _arr = node.directives;

        for (var _i = 0; _i < _arr.length; _i++) {
          var directive = _arr[_i];
          if (directive.value.value === "use strict") return;
        }

        path.unshiftContainer("directives", _core.types.directive(_core.types.directiveLiteral("use strict")));
      }
    }
  };
}