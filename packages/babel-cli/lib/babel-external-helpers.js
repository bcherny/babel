"use strict";

var _commander = _interopRequireDefault(require("commander"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function collect(value, previousValue) {
  if (typeof value !== "string") return previousValue;
  var values = value.split(",");
  return previousValue ? previousValue.concat(values) : values;
}

_commander.default.option("-l, --whitelist [whitelist]", "Whitelist of helpers to ONLY include", collect);

_commander.default.option("-t, --output-type [type]", "Type of output (global|umd|var)", "global");

_commander.default.usage("[options]");

_commander.default.parse(process.argv);

console.log((0, _core.buildExternalHelpers)(_commander.default.whitelist, _commander.default.outputType));