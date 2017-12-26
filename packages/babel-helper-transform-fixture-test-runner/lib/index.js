"use strict";

exports.__esModule = true;
exports.runCodeInTestContext = runCodeInTestContext;
exports.default = _default;

var babel = _interopRequireWildcard(require("@babel/core"));

var _helperFixtures = _interopRequireDefault(require("@babel/helper-fixtures"));

var _sourceMap = _interopRequireDefault(require("source-map"));

var _codeFrame = require("@babel/code-frame");

var _defaults = _interopRequireDefault(require("lodash/defaults"));

var _includes = _interopRequireDefault(require("lodash/includes"));

var helpers = _interopRequireWildcard(require("./helpers"));

var _extend = _interopRequireDefault(require("lodash/extend"));

var _merge = _interopRequireDefault(require("lodash/merge"));

var _resolve = _interopRequireDefault(require("resolve"));

var _assert = _interopRequireDefault(require("assert"));

var _chai = _interopRequireDefault(require("chai"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _vm = _interopRequireDefault(require("vm"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var moduleCache = {};

var testContext = _vm.default.createContext(Object.assign({}, helpers, {
  process: process,
  transform: babel.transform,
  setTimeout: setTimeout,
  setImmediate: setImmediate
}));

testContext.global = testContext;

_vm.default.runInContext("(function(require) { global.assert=require('chai').assert; });", testContext, {
  displayErrors: true
})(function (id) {
  return runModuleInTestContext(id, __filename);
});

runModuleInTestContext("@babel/polyfill", __filename);
runCodeInTestContext((0, babel.buildExternalHelpers)());

function runModuleInTestContext(id, relativeFilename) {
  var filename = _resolve.default.sync(id, {
    basedir: _path.default.dirname(relativeFilename)
  });

  if (filename === id) return require(id);
  if (moduleCache[filename]) return moduleCache[filename].exports;
  var module = moduleCache[filename] = {
    id: filename,
    exports: {}
  };

  var dirname = _path.default.dirname(filename);

  var req = function req(id) {
    return runModuleInTestContext(id, filename);
  };

  var src = _fs.default.readFileSync(filename, "utf8");

  var code = "(function (exports, require, module, __filename, __dirname) {" + src + "\n});";

  _vm.default.runInContext(code, testContext, {
    filename: filename,
    displayErrors: true
  }).call(module.exports, module.exports, req, module, filename, dirname);

  return module.exports;
}

function runCodeInTestContext(code, opts) {
  if (opts === void 0) {
    opts = {};
  }

  var filename = opts.filename || null;
  var dirname = filename ? _path.default.dirname(filename) : null;
  var req = filename ? function (id) {
    return runModuleInTestContext(id, filename);
  } : null;
  var module = {
    id: filename,
    exports: {}
  };
  var src = "(function(exports, require, module, __filename, __dirname, opts) {" + code + "\n});";
  return _vm.default.runInContext(src, testContext, {
    filename: filename,
    displayErrors: true
  })(module.exports, req, module, filename, dirname, opts);
}

function wrapPackagesArray(type, names, optionsDir) {
  return (names || []).map(function (val) {
    if (typeof val === "string") val = [val];

    if (val[0][0] === ".") {
      if (!optionsDir) {
        throw new Error("Please provide an options.json in test dir when using a " + "relative plugin path.");
      }

      val[0] = _path.default.resolve(optionsDir, val[0]);
    } else {
      val[0] = __dirname + "/../../babel-" + type + "-" + val[0];
    }

    return val;
  });
}

function run(task) {
  var actual = task.actual;
  var expect = task.expect;
  var exec = task.exec;
  var opts = task.options;
  var optionsDir = task.optionsDir;

  function getOpts(self) {
    var newOpts = (0, _merge.default)({
      filename: self.loc
    }, opts);
    newOpts.plugins = wrapPackagesArray("plugin", newOpts.plugins, optionsDir);
    newOpts.presets = wrapPackagesArray("preset", newOpts.presets, optionsDir).map(function (val) {
      if (val.length > 2) {
        throw new Error("Unexpected extra options " + JSON.stringify(val.slice(2)) + " passed to preset.");
      }

      return val;
    });
    return newOpts;
  }

  var execCode = exec.code;
  var result;
  var resultExec;

  if (execCode) {
    var execOpts = getOpts(exec);
    result = babel.transform(execCode, execOpts);
    execCode = result.code;

    try {
      resultExec = runCodeInTestContext(execCode, execOpts);
    } catch (err) {
      err.message = exec.loc + ": " + err.message + "\n" + (0, _codeFrame.codeFrameColumns)(execCode, {});
      throw err;
    }
  }

  var actualCode = actual.code;
  var expectCode = expect.code;

  if (!execCode || actualCode) {
    result = babel.transform(actualCode, getOpts(actual));

    if (!expect.code && result.code && !opts.throws && _fs.default.statSync(_path.default.dirname(expect.loc)).isDirectory() && !process.env.CI) {
      console.log("New test file created: " + expect.loc);

      _fs.default.writeFileSync(expect.loc, result.code + "\n");
    } else {
      actualCode = result.code.trim();

      _chai.default.expect(actualCode).to.be.equal(expectCode, actual.loc + " !== " + expect.loc);
    }
  }

  if (task.sourceMap) {
    _chai.default.expect(result.map).to.deep.equal(task.sourceMap);
  }

  if (task.sourceMappings) {
    var consumer = new _sourceMap.default.SourceMapConsumer(result.map);
    task.sourceMappings.forEach(function (mapping) {
      var actual = mapping.original;
      var expect = consumer.originalPositionFor(mapping.generated);

      _chai.default.expect({
        line: expect.line,
        column: expect.column
      }).to.deep.equal(actual);
    });
  }

  if (execCode && resultExec) {
    return resultExec;
  }
}

function _default(fixturesLoc, name, suiteOpts, taskOpts, dynamicOpts) {
  if (suiteOpts === void 0) {
    suiteOpts = {};
  }

  if (taskOpts === void 0) {
    taskOpts = {};
  }

  var suites = (0, _helperFixtures.default)(fixturesLoc);

  var _loop = function _loop(testSuite) {
    if ((0, _includes.default)(suiteOpts.ignoreSuites, testSuite.title)) return "continue";
    describe(name + "/" + testSuite.title, function () {
      var _loop2 = function _loop2(task) {
        if ((0, _includes.default)(suiteOpts.ignoreTasks, task.title) || (0, _includes.default)(suiteOpts.ignoreTasks, testSuite.title + "/" + task.title)) {
          return "continue";
        }

        it(task.title, !task.disabled && function () {
          function runTask() {
            run(task);
          }

          (0, _defaults.default)(task.options, {
            filenameRelative: task.expect.filename,
            sourceFileName: task.actual.filename,
            sourceMapTarget: task.expect.filename,
            babelrc: false,
            sourceMap: !!(task.sourceMappings || task.sourceMap)
          });
          (0, _extend.default)(task.options, taskOpts);
          if (dynamicOpts) dynamicOpts(task.options, task);
          var throwMsg = task.options.throws;

          if (throwMsg) {
            delete task.options.throws;

            _assert.default.throws(runTask, function (err) {
              return throwMsg === true || err.message.indexOf(throwMsg) >= 0;
            });
          } else {
            if (task.exec.code) {
              var result = run(task);

              if (result && typeof result.then === "function") {
                return result;
              }
            } else {
              runTask();
            }
          }
        });
      };

      for (var _iterator2 = testSuite.tests, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray2) {
          if (_i2 >= _iterator2.length) break;
          _ref2 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done) break;
          _ref2 = _i2.value;
        }

        var task = _ref2;

        var _ret2 = _loop2(task);

        if (_ret2 === "continue") continue;
      }
    });
  };

  for (var _iterator = suites, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var testSuite = _ref;

    var _ret = _loop(testSuite);

    if (_ret === "continue") continue;
  }
}