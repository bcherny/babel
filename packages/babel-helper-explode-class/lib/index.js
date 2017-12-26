"use strict";

exports.__esModule = true;
exports.default = _default;

var _helperBindifyDecorators = _interopRequireDefault(require("@babel/helper-bindify-decorators"));

var t = _interopRequireWildcard(require("@babel/types"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(classPath) {
  classPath.assertClass();
  var memoisedExpressions = [];

  function maybeMemoise(path) {
    if (!path.node || path.isPure()) return;
    var uid = classPath.scope.generateDeclaredUidIdentifier();
    memoisedExpressions.push(t.assignmentExpression("=", uid, path.node));
    path.replaceWith(uid);
  }

  function memoiseDecorators(paths) {
    if (!Array.isArray(paths) || !paths.length) return;
    paths = paths.reverse();
    (0, _helperBindifyDecorators.default)(paths);

    for (var _iterator = paths, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var _path = _ref;
      maybeMemoise(_path);
    }
  }

  maybeMemoise(classPath.get("superClass"));
  memoiseDecorators(classPath.get("decorators"), true);
  var methods = classPath.get("body.body");

  for (var _iterator2 = methods, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref2;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref2 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref2 = _i2.value;
    }

    var _methodPath = _ref2;

    if (_methodPath.is("computed")) {
      maybeMemoise(_methodPath.get("key"));
    }

    if (_methodPath.has("decorators")) {
      memoiseDecorators(classPath.get("decorators"));
    }
  }

  if (memoisedExpressions) {
    classPath.insertBefore(memoisedExpressions.map(function (expr) {
      return t.expressionStatement(expr);
    }));
  }
}