"use strict";

exports.__esModule = true;
exports.default = _default;

var _helperWrapFunction = _interopRequireDefault(require("@babel/helper-wrap-function"));

var _helperAnnotateAsPure = _interopRequireDefault(require("@babel/helper-annotate-as-pure"));

var t = _interopRequireWildcard(require("@babel/types"));

var _forAwait = _interopRequireDefault(require("./for-await"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var awaitVisitor = {
  Function: function Function(path) {
    path.skip();
  },
  AwaitExpression: function AwaitExpression(path, _ref) {
    var wrapAwait = _ref.wrapAwait;
    var argument = path.get("argument");

    if (path.parentPath.isYieldExpression()) {
      path.replaceWith(argument.node);
      return;
    }

    path.replaceWith(t.yieldExpression(wrapAwait ? t.callExpression(wrapAwait, [argument.node]) : argument.node));
  },
  ForOfStatement: function ForOfStatement(path, _ref2) {
    var file = _ref2.file,
        wrapAwait = _ref2.wrapAwait;
    var node = path.node;
    if (!node.await) return;
    var build = (0, _forAwait.default)(path, {
      getAsyncIterator: file.addHelper("asyncIterator"),
      wrapAwait: wrapAwait
    });
    var declar = build.declar,
        loop = build.loop;
    var block = loop.body;
    path.ensureBlock();

    if (declar) {
      block.body.push(declar);
    }

    block.body = block.body.concat(node.body.body);
    t.inherits(loop, node);
    t.inherits(loop.body, node.body);

    if (build.replaceParent) {
      path.parentPath.replaceWithMultiple(build.node);
    } else {
      path.replaceWithMultiple(build.node);
    }
  }
};

function _default(path, file, helpers) {
  path.traverse(awaitVisitor, {
    file: file,
    wrapAwait: helpers.wrapAwait
  });
  var isIIFE = path.parentPath.isCallExpression({
    callee: path.node
  });
  path.node.async = false;
  path.node.generator = true;
  (0, _helperWrapFunction.default)(path, helpers.wrapAsync);
  var isProperty = path.isObjectMethod() || path.isClassMethod() || path.parentPath.isObjectProperty() || path.parentPath.isClassProperty();

  if (!isProperty && !isIIFE && path.isExpression()) {
    (0, _helperAnnotateAsPure.default)(path);
  }
}