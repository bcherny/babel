"use strict";

exports.__esModule = true;
exports.default = get;
exports.multiple = multiple;
exports.readFile = readFile;

var _assert = _interopRequireDefault(require("assert"));

var _cloneDeep = _interopRequireDefault(require("lodash/cloneDeep"));

var _trimEnd = _interopRequireDefault(require("lodash/trimEnd"));

var _tryResolve = _interopRequireDefault(require("try-resolve"));

var _clone = _interopRequireDefault(require("lodash/clone"));

var _extend = _interopRequireDefault(require("lodash/extend"));

var _semver = _interopRequireDefault(require("semver"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nodeVersion = _semver.default.clean(process.version.slice(1));

function humanize(val, noext) {
  if (noext) val = _path.default.basename(val, _path.default.extname(val));
  return val.replace(/-/g, " ");
}

function assertDirectory(loc) {
  if (!_fs.default.statSync(loc).isDirectory()) {
    throw new Error("Expected " + loc + " to be a directory.");
  }
}

function shouldIgnore(name, blacklist) {
  if (blacklist && blacklist.indexOf(name) >= 0) {
    return true;
  }

  var ext = _path.default.extname(name);

  var base = _path.default.basename(name, ext);

  return name[0] === "." || ext === ".md" || base === "LICENSE" || base === "options";
}

function get(entryLoc) {
  var suites = [];
  var rootOpts = {};
  var rootOptsLoc = (0, _tryResolve.default)(entryLoc + "/options");
  if (rootOptsLoc) rootOpts = require(rootOptsLoc);

  var _loop = function _loop(suiteName) {
    if (shouldIgnore(suiteName)) return "continue";
    var suite = {
      options: (0, _clone.default)(rootOpts),
      tests: [],
      title: humanize(suiteName),
      filename: entryLoc + "/" + suiteName
    };
    assertDirectory(suite.filename);
    suites.push(suite);
    var suiteOptsLoc = (0, _tryResolve.default)(suite.filename + "/options");
    if (suiteOptsLoc) suite.options = require(suiteOptsLoc);

    for (var _iterator2 = _fs.default.readdirSync(suite.filename), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var _taskName = _ref2;
      push(_taskName, suite.filename + "/" + _taskName);
    }

    function push(taskName, taskDir) {
      var actualLocAlias = suiteName + "/" + taskName + "/actual.js";
      var expectLocAlias = suiteName + "/" + taskName + "/expected.js";
      var execLocAlias = suiteName + "/" + taskName + "/exec.js";
      var actualLoc = taskDir + "/actual.js";
      var expectLoc = taskDir + "/expected.js";
      var execLoc = taskDir + "/exec.js";

      var hasExecJS = _fs.default.existsSync(execLoc);

      var hasExecMJS = _fs.default.existsSync(asMJS(execLoc));

      if (hasExecMJS) {
        (0, _assert.default)(!hasExecJS, asMJS(execLoc) + ": Found conflicting .js");
        execLoc = asMJS(execLoc);
        execLocAlias = asMJS(execLocAlias);
      }

      var hasExpectJS = _fs.default.existsSync(expectLoc);

      var hasExpectMJS = _fs.default.existsSync(asMJS(expectLoc));

      if (hasExpectMJS) {
        (0, _assert.default)(!hasExpectJS, asMJS(expectLoc) + ": Found conflicting .js");
        expectLoc = asMJS(expectLoc);
        expectLocAlias = asMJS(expectLocAlias);
      }

      var hasActualJS = _fs.default.existsSync(actualLoc);

      var hasActualMJS = _fs.default.existsSync(asMJS(actualLoc));

      if (hasActualMJS) {
        (0, _assert.default)(!hasActualJS, asMJS(actualLoc) + ": Found conflicting .js");
        actualLoc = asMJS(actualLoc);
        actualLocAlias = asMJS(actualLocAlias);
      }

      if (_fs.default.statSync(taskDir).isFile()) {
        var ext = _path.default.extname(taskDir);

        if (ext !== ".js" && ext !== ".mjs") return;
        execLoc = taskDir;
      }

      if (_tryResolve.default.relative(expectLoc + "on")) {
        expectLoc += "on";
        expectLocAlias += "on";
      }

      var taskOpts = (0, _cloneDeep.default)(suite.options);
      var taskOptsLoc = (0, _tryResolve.default)(taskDir + "/options");
      if (taskOptsLoc) (0, _extend.default)(taskOpts, require(taskOptsLoc));
      var test = {
        optionsDir: taskOptsLoc ? _path.default.dirname(taskOptsLoc) : null,
        title: humanize(taskName, true),
        disabled: taskName[0] === ".",
        options: taskOpts,
        exec: {
          loc: execLoc,
          code: readFile(execLoc),
          filename: execLocAlias
        },
        actual: {
          loc: actualLoc,
          code: readFile(actualLoc),
          filename: actualLocAlias
        },
        expect: {
          loc: expectLoc,
          code: readFile(expectLoc),
          filename: expectLocAlias
        }
      };

      if (taskOpts.minNodeVersion) {
        var minimumVersion = _semver.default.clean(taskOpts.minNodeVersion);

        if (minimumVersion == null) {
          throw new Error("'minNodeVersion' has invalid semver format: " + taskOpts.minNodeVersion);
        }

        if (_semver.default.lt(nodeVersion, minimumVersion)) {
          return;
        }

        delete taskOpts.minNodeVersion;
      }

      if (test.exec.code.indexOf("// Async.") >= 0) {
        return;
      }

      suite.tests.push(test);
      var sourceMappingsLoc = taskDir + "/source-mappings.json";

      if (_fs.default.existsSync(sourceMappingsLoc)) {
        test.sourceMappings = JSON.parse(readFile(sourceMappingsLoc));
      }

      var sourceMapLoc = taskDir + "/source-map.json";

      if (_fs.default.existsSync(sourceMapLoc)) {
        test.sourceMap = JSON.parse(readFile(sourceMapLoc));
      }
    }
  };

  for (var _iterator = _fs.default.readdirSync(entryLoc), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var suiteName = _ref;

    var _ret = _loop(suiteName);

    if (_ret === "continue") continue;
  }

  return suites;
}

function multiple(entryLoc, ignore) {
  var categories = {};

  for (var _iterator3 = _fs.default.readdirSync(entryLoc), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
    var _ref3;

    if (_isArray3) {
      if (_i3 >= _iterator3.length) break;
      _ref3 = _iterator3[_i3++];
    } else {
      _i3 = _iterator3.next();
      if (_i3.done) break;
      _ref3 = _i3.value;
    }

    var _name = _ref3;
    if (shouldIgnore(_name, ignore)) continue;

    var _loc2 = _path.default.join(entryLoc, _name);

    assertDirectory(_loc2);
    categories[_name] = get(_loc2);
  }

  return categories;
}

function asMJS(filepath) {
  return filepath.replace(/\.js$/, ".mjs");
}

function readFile(filename) {
  if (_fs.default.existsSync(filename)) {
    var file = (0, _trimEnd.default)(_fs.default.readFileSync(filename, "utf8"));
    file = file.replace(/\r\n/g, "\n");
    return file;
  } else {
    return "";
  }
}