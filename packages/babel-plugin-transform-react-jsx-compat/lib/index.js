"use strict";

exports.__esModule = true;
exports.default = _default;

var _helperBuilderReactJsx = _interopRequireDefault(require("@babel/helper-builder-react-jsx"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    manipulateOptions: function manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("jsx");
    },
    visitor: (0, _helperBuilderReactJsx.default)({
      pre: function pre(state) {
        state.callee = state.tagExpr;
      },
      post: function post(state) {
        if (_core.types.react.isCompatTag(state.tagName)) {
          state.call = _core.types.callExpression(_core.types.memberExpression(_core.types.memberExpression(_core.types.identifier("React"), _core.types.identifier("DOM")), state.tagExpr, _core.types.isLiteral(state.tagExpr)), state.args);
        }
      },
      compat: true
    })
  };
}