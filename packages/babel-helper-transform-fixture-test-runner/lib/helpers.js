"use strict";

exports.__esModule = true;
exports.assertNoOwnProperties = assertNoOwnProperties;
exports.assertHasOwnProperty = assertHasOwnProperty;
exports.assertLacksOwnProperty = assertLacksOwnProperty;
exports.multiline = multiline;
exports.assertArrayEquals = void 0;

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function assertNoOwnProperties(obj) {
  _assert.default.equal(Object.getOwnPropertyNames(obj).length, 0);
}

function assertHasOwnProperty() {}

function assertLacksOwnProperty() {}

function multiline(arr) {
  return arr.join("\n");
}

var assertArrayEquals = _assert.default.deepEqual;
exports.assertArrayEquals = assertArrayEquals;