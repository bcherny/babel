"use strict";

exports.__esModule = true;
exports.default = _default;

var _helperModuleImports = require("@babel/helper-module-imports");

var _core = require("@babel/core");

var _definitions = _interopRequireDefault(require("./definitions"));

exports.definitions = _definitions.default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(api, options) {
  var helpers = options.helpers,
      _options$moduleName = options.moduleName,
      moduleName = _options$moduleName === void 0 ? "@babel/runtime" : _options$moduleName,
      polyfill = options.polyfill,
      regenerator = options.regenerator,
      useBuiltIns = options.useBuiltIns,
      useESModules = options.useESModules;
  var regeneratorEnabled = regenerator !== false;
  var notPolyfillOrDoesUseBuiltIns = polyfill === false || useBuiltIns;
  var isPolyfillAndUseBuiltIns = polyfill && useBuiltIns;
  var baseHelpersDir = useBuiltIns ? "helpers/builtin" : "helpers";
  var helpersDir = useESModules ? baseHelpersDir + "/es6" : baseHelpersDir;

  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  var HEADER_HELPERS = ["interopRequireWildcard", "interopRequireDefault"];
  return {
    pre: function pre(file) {
      var _this = this;

      if (helpers !== false) {
        file.set("helperGenerator", function (name) {
          var isInteropHelper = HEADER_HELPERS.indexOf(name) !== -1;
          var blockHoist = isInteropHelper && !(0, _helperModuleImports.isModule)(file.path) ? 4 : undefined;
          return _this.addDefaultImport(moduleName + "/" + helpersDir + "/" + name, name, blockHoist);
        });
      }

      if (isPolyfillAndUseBuiltIns) {
        throw new Error("The polyfill option conflicts with useBuiltIns; use one or the other");
      }

      this.moduleName = moduleName;
      var cache = new Map();

      this.addDefaultImport = function (source, nameHint, blockHoist) {
        var cacheKey = (0, _helperModuleImports.isModule)(file.path);
        var key = source + ":" + nameHint + ":" + (cacheKey || "");
        var cached = cache.get(key);

        if (cached) {
          cached = _core.types.cloneDeep(cached);
        } else {
          cached = (0, _helperModuleImports.addDefault)(file.path, source, {
            importedInterop: "uncompiled",
            nameHint: nameHint,
            blockHoist: blockHoist
          });
          cache.set(key, cached);
        }

        return cached;
      };
    },
    visitor: {
      ReferencedIdentifier: function ReferencedIdentifier(path) {
        var node = path.node,
            parent = path.parent,
            scope = path.scope;

        if (node.name === "regeneratorRuntime" && regeneratorEnabled) {
          path.replaceWith(this.addDefaultImport(this.moduleName + "/regenerator", "regeneratorRuntime"));
          return;
        }

        if (notPolyfillOrDoesUseBuiltIns) return;
        if (_core.types.isMemberExpression(parent)) return;
        if (!has(_definitions.default.builtins, node.name)) return;
        if (scope.getBindingIdentifier(node.name)) return;
        path.replaceWith(this.addDefaultImport(moduleName + "/core-js/" + _definitions.default.builtins[node.name], node.name));
      },
      CallExpression: function CallExpression(path) {
        if (notPolyfillOrDoesUseBuiltIns) return;
        if (path.node.arguments.length) return;
        var callee = path.node.callee;
        if (!_core.types.isMemberExpression(callee)) return;
        if (!callee.computed) return;

        if (!path.get("callee.property").matchesPattern("Symbol.iterator")) {
          return;
        }

        path.replaceWith(_core.types.callExpression(this.addDefaultImport(moduleName + "/core-js/get-iterator", "getIterator"), [callee.object]));
      },
      BinaryExpression: function BinaryExpression(path) {
        if (notPolyfillOrDoesUseBuiltIns) return;
        if (path.node.operator !== "in") return;
        if (!path.get("left").matchesPattern("Symbol.iterator")) return;
        path.replaceWith(_core.types.callExpression(this.addDefaultImport(moduleName + "/core-js/is-iterable", "isIterable"), [path.node.right]));
      },
      MemberExpression: {
        enter: function enter(path) {
          if (notPolyfillOrDoesUseBuiltIns) return;
          if (!path.isReferenced()) return;
          var node = path.node;
          var obj = node.object;
          var prop = node.property;
          if (!_core.types.isReferenced(obj, node)) return;
          if (node.computed) return;
          if (!has(_definitions.default.methods, obj.name)) return;
          var methods = _definitions.default.methods[obj.name];
          if (!has(methods, prop.name)) return;
          if (path.scope.getBindingIdentifier(obj.name)) return;

          if (obj.name === "Object" && prop.name === "defineProperty" && path.parentPath.isCallExpression()) {
            var call = path.parentPath.node;

            if (call.arguments.length === 3 && _core.types.isLiteral(call.arguments[1])) {
              return;
            }
          }

          path.replaceWith(this.addDefaultImport(moduleName + "/core-js/" + methods[prop.name], obj.name + "$" + prop.name));
        },
        exit: function exit(path) {
          if (notPolyfillOrDoesUseBuiltIns) return;
          if (!path.isReferenced()) return;
          var node = path.node;
          var obj = node.object;
          if (!has(_definitions.default.builtins, obj.name)) return;
          if (path.scope.getBindingIdentifier(obj.name)) return;
          path.replaceWith(_core.types.memberExpression(this.addDefaultImport(moduleName + "/core-js/" + _definitions.default.builtins[obj.name], obj.name), node.property, node.computed));
        }
      }
    }
  };
}