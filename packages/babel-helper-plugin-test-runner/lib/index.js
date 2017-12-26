"use strict";

exports.__esModule = true;
exports.default = _default;

var _helperTransformFixtureTestRunner = _interopRequireDefault(require("@babel/helper-transform-fixture-test-runner"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(loc) {
  var name = _path.default.basename(_path.default.dirname(loc));

  (0, _helperTransformFixtureTestRunner.default)(loc + "/fixtures", name);
}