"use strict";

exports.__esModule = true;
exports.default = normalizeFile;

var t = _interopRequireWildcard(require("@babel/types"));

var _convertSourceMap = _interopRequireDefault(require("convert-source-map"));

var _babylon = require("babylon");

var _codeFrame = require("@babel/code-frame");

var _file = _interopRequireDefault(require("./file/file"));

var _missingPluginHelper = _interopRequireDefault(require("./util/missing-plugin-helper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var shebangRegex = /^#!.*/;

function normalizeFile(pluginPasses, options, code, ast) {
  code = "" + (code || "");
  var shebang = null;
  var inputMap = null;

  if (options.inputSourceMap !== false) {
    inputMap = _convertSourceMap.default.fromSource(code);

    if (inputMap) {
      code = _convertSourceMap.default.removeComments(code);
    } else if (typeof options.inputSourceMap === "object") {
      inputMap = _convertSourceMap.default.fromObject(options.inputSourceMap);
    }
  }

  var shebangMatch = shebangRegex.exec(code);

  if (shebangMatch) {
    shebang = shebangMatch[0];
    code = code.replace(shebangRegex, "");
  }

  if (ast) {
    if (ast.type === "Program") {
      ast = t.file(ast, [], []);
    } else if (ast.type !== "File") {
      throw new Error("AST root must be a Program or File node");
    }
  } else {
    ast = parser(pluginPasses, options, code);
  }

  return new _file.default(options, {
    code: code,
    ast: ast,
    shebang: shebang,
    inputMap: inputMap
  });
}

function parser(pluginPasses, options, code) {
  try {
    var results = [];

    for (var _iterator = pluginPasses, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var _plugins = _ref;

      for (var _iterator2 = _plugins, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray2) {
          if (_i2 >= _iterator2.length) break;
          _ref2 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done) break;
          _ref2 = _i2.value;
        }

        var _plugin = _ref2;
        var parserOverride = _plugin.parserOverride;

        if (parserOverride) {
          var _ast = parserOverride(code, options.parserOpts, _babylon.parse);

          if (_ast !== undefined) results.push(_ast);
        }
      }
    }

    if (results.length === 0) {
      return (0, _babylon.parse)(code, options.parserOpts);
    } else if (results.length === 1) {
      if (typeof results[0].then === "function") {
        throw new Error("You appear to be using an async codegen plugin, " + "which your current version of Babel does not support. " + "If you're using a published plugin, you may need to upgrade " + "your @babel/core version.");
      }

      return results[0];
    }

    throw new Error("More than one plugin attempted to override parsing.");
  } catch (err) {
    var loc = err.loc,
        missingPlugin = err.missingPlugin;

    if (loc) {
      err.loc = null;
      var codeFrame = (0, _codeFrame.codeFrameColumns)(code, {
        start: {
          line: loc.line,
          column: loc.column + 1
        }
      }, options);

      if (missingPlugin) {
        err.message = (options.filename || "unknown") + ": " + (0, _missingPluginHelper.default)(missingPlugin[0], loc, codeFrame);
      } else {
        err.message = (options.filename || "unknown") + ": " + err.message + "\n\n" + codeFrame;
      }
    }

    throw err;
  }
}