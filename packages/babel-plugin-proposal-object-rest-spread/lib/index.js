"use strict";

exports.__esModule = true;
exports.default = _default;

var _pluginSyntaxObjectRestSpread = _interopRequireDefault(require("@babel/plugin-syntax-object-rest-spread"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(api, opts) {
  var _opts$useBuiltIns = opts.useBuiltIns,
      useBuiltIns = _opts$useBuiltIns === void 0 ? false : _opts$useBuiltIns;

  if (typeof useBuiltIns !== "boolean") {
    throw new Error(".useBuiltIns must be a boolean, or undefined");
  }

  function hasRestElement(path) {
    var foundRestElement = false;
    path.traverse({
      RestElement: function RestElement() {
        foundRestElement = true;
        path.stop();
      }
    });
    return foundRestElement;
  }

  function hasSpread(node) {
    for (var _iterator = node.properties, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var _prop = _ref;

      if (_core.types.isSpreadElement(_prop)) {
        return true;
      }
    }

    return false;
  }

  function extractNormalizedKeys(path) {
    var props = path.node.properties;
    var keys = [];
    var allLiteral = true;

    for (var _iterator2 = props, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var _prop2 = _ref2;

      if (_core.types.isIdentifier(_prop2.key) && !_prop2.computed) {
        keys.push(_core.types.stringLiteral(_prop2.key.name));
      } else if (_core.types.isLiteral(_prop2.key)) {
        keys.push(_core.types.stringLiteral(String(_prop2.key.value)));
      } else {
        keys.push(_prop2.key);
        allLiteral = false;
      }
    }

    return {
      keys: keys,
      allLiteral: allLiteral
    };
  }

  function replaceImpureComputedKeys(path) {
    var impureComputedPropertyDeclarators = [];

    for (var _iterator3 = path.get("properties"), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
      var _ref3;

      if (_isArray3) {
        if (_i3 >= _iterator3.length) break;
        _ref3 = _iterator3[_i3++];
      } else {
        _i3 = _iterator3.next();
        if (_i3.done) break;
        _ref3 = _i3.value;
      }

      var _propPath = _ref3;

      var key = _propPath.get("key");

      if (_propPath.node.computed && !key.isPure()) {
        var identifier = path.scope.generateUidIdentifierBasedOnNode(key.node);

        var declarator = _core.types.variableDeclarator(identifier, key.node);

        impureComputedPropertyDeclarators.push(declarator);
        key.replaceWith(identifier);
      }
    }

    return impureComputedPropertyDeclarators;
  }

  function createObjectSpread(path, file, objRef) {
    var props = path.get("properties");
    var last = props[props.length - 1];

    _core.types.assertRestElement(last.node);

    var restElement = _core.types.clone(last.node);

    last.remove();
    var impureComputedPropertyDeclarators = replaceImpureComputedKeys(path);

    var _extractNormalizedKey = extractNormalizedKeys(path),
        keys = _extractNormalizedKey.keys,
        allLiteral = _extractNormalizedKey.allLiteral;

    var keyExpression;

    if (!allLiteral) {
      keyExpression = _core.types.callExpression(_core.types.memberExpression(_core.types.arrayExpression(keys), _core.types.identifier("map")), [file.addHelper("toPropertyKey")]);
    } else {
      keyExpression = _core.types.arrayExpression(keys);
    }

    return [impureComputedPropertyDeclarators, restElement.argument, _core.types.callExpression(file.addHelper("objectWithoutProperties"), [objRef, keyExpression])];
  }

  function replaceRestElement(parentPath, paramPath, i, numParams) {
    if (paramPath.isAssignmentPattern()) {
      replaceRestElement(parentPath, paramPath.get("left"), i, numParams);
      return;
    }

    if (paramPath.isArrayPattern() && hasRestElement(paramPath)) {
      var elements = paramPath.get("elements");

      for (var _i4 = 0; _i4 < elements.length; _i4++) {
        replaceRestElement(parentPath, elements[_i4], _i4, elements.length);
      }
    }

    if (paramPath.isObjectPattern() && hasRestElement(paramPath)) {
      var uid = parentPath.scope.generateUidIdentifier("ref");

      var declar = _core.types.variableDeclaration("let", [_core.types.variableDeclarator(paramPath.node, uid)]);

      parentPath.ensureBlock();
      parentPath.get("body").unshiftContainer("body", declar);
      paramPath.replaceWith(uid);
    }
  }

  return {
    inherits: _pluginSyntaxObjectRestSpread.default,
    visitor: {
      Function: function Function(path) {
        var params = path.get("params");

        for (var i = params.length - 1; i >= 0; i--) {
          replaceRestElement(params[i].parentPath, params[i], i, params.length);
        }
      },
      VariableDeclarator: function VariableDeclarator(path, file) {
        if (!path.get("id").isObjectPattern()) {
          return;
        }

        var insertionPath = path;
        path.get("id").traverse({
          RestElement: function RestElement(path) {
            if (!path.parentPath.isObjectPattern()) {
              return;
            }

            if (this.originalPath.node.id.properties.length > 1 && !_core.types.isIdentifier(this.originalPath.node.init)) {
              var initRef = path.scope.generateUidIdentifierBasedOnNode(this.originalPath.node.init, "ref");
              this.originalPath.insertBefore(_core.types.variableDeclarator(initRef, this.originalPath.node.init));
              this.originalPath.replaceWith(_core.types.variableDeclarator(this.originalPath.node.id, initRef));
              return;
            }

            var ref = this.originalPath.node.init;
            var refPropertyPath = [];
            path.findParent(function (path) {
              if (path.isObjectProperty()) {
                refPropertyPath.unshift(path.node.key.name);
              } else if (path.isVariableDeclarator()) {
                return true;
              }
            });

            if (refPropertyPath.length) {
              refPropertyPath.forEach(function (prop) {
                ref = _core.types.memberExpression(ref, _core.types.identifier(prop));
              });
            }

            var objectPatternPath = path.findParent(function (path) {
              return path.isObjectPattern();
            });

            var _createObjectSpread = createObjectSpread(objectPatternPath, file, ref),
                impureComputedPropertyDeclarators = _createObjectSpread[0],
                argument = _createObjectSpread[1],
                callExpression = _createObjectSpread[2];

            _core.types.assertIdentifier(argument);

            insertionPath.insertBefore(impureComputedPropertyDeclarators);
            insertionPath.insertAfter(_core.types.variableDeclarator(argument, callExpression));
            insertionPath = insertionPath.getSibling(insertionPath.key + 1);

            if (objectPatternPath.node.properties.length === 0) {
              objectPatternPath.findParent(function (path) {
                return path.isObjectProperty() || path.isVariableDeclarator();
              }).remove();
            }
          }
        }, {
          originalPath: path
        });
      },
      ExportNamedDeclaration: function ExportNamedDeclaration(path) {
        var declaration = path.get("declaration");
        if (!declaration.isVariableDeclaration()) return;
        if (!hasRestElement(declaration)) return;
        var specifiers = [];

        for (var name in path.getOuterBindingIdentifiers(path)) {
          var id = _core.types.identifier(name);

          specifiers.push(_core.types.exportSpecifier(id, id));
        }

        path.replaceWith(declaration.node);
        path.insertAfter(_core.types.exportNamedDeclaration(null, specifiers));
      },
      CatchClause: function CatchClause(path) {
        var paramPath = path.get("param");
        replaceRestElement(paramPath.parentPath, paramPath);
      },
      AssignmentExpression: function AssignmentExpression(path, file) {
        var leftPath = path.get("left");

        if (leftPath.isObjectPattern() && hasRestElement(leftPath)) {
          var nodes = [];
          var ref = path.scope.generateUidIdentifierBasedOnNode(path.node.right, "ref");
          nodes.push(_core.types.variableDeclaration("var", [_core.types.variableDeclarator(ref, path.node.right)]));

          var _createObjectSpread2 = createObjectSpread(leftPath, file, ref),
              impureComputedPropertyDeclarators = _createObjectSpread2[0],
              argument = _createObjectSpread2[1],
              callExpression = _createObjectSpread2[2];

          if (impureComputedPropertyDeclarators.length > 0) {
            nodes.push(_core.types.variableDeclaration("var", impureComputedPropertyDeclarators));
          }

          var nodeWithoutSpread = _core.types.clone(path.node);

          nodeWithoutSpread.right = ref;
          nodes.push(_core.types.expressionStatement(nodeWithoutSpread));
          nodes.push(_core.types.toStatement(_core.types.assignmentExpression("=", argument, callExpression)));

          if (ref) {
            nodes.push(_core.types.expressionStatement(ref));
          }

          path.replaceWithMultiple(nodes);
        }
      },
      ForXStatement: function ForXStatement(path) {
        var node = path.node,
            scope = path.scope;
        var leftPath = path.get("left");
        var left = node.left;

        if (_core.types.isObjectPattern(left) && hasRestElement(leftPath)) {
          var temp = scope.generateUidIdentifier("ref");
          node.left = _core.types.variableDeclaration("var", [_core.types.variableDeclarator(temp)]);
          path.ensureBlock();
          node.body.body.unshift(_core.types.variableDeclaration("var", [_core.types.variableDeclarator(left, temp)]));
          return;
        }

        if (!_core.types.isVariableDeclaration(left)) return;
        var pattern = left.declarations[0].id;
        if (!_core.types.isObjectPattern(pattern)) return;
        var key = scope.generateUidIdentifier("ref");
        node.left = _core.types.variableDeclaration(left.kind, [_core.types.variableDeclarator(key, null)]);
        path.ensureBlock();
        node.body.body.unshift(_core.types.variableDeclaration(node.left.kind, [_core.types.variableDeclarator(pattern, key)]));
      },
      ObjectExpression: function ObjectExpression(path, file) {
        if (!hasSpread(path.node)) return;
        var args = [];
        var props = [];

        function push() {
          if (!props.length) return;
          args.push(_core.types.objectExpression(props));
          props = [];
        }

        var _arr = path.node.properties;

        for (var _i5 = 0; _i5 < _arr.length; _i5++) {
          var prop = _arr[_i5];

          if (_core.types.isSpreadElement(prop)) {
            push();
            args.push(prop.argument);
          } else {
            props.push(prop);
          }
        }

        push();

        if (!_core.types.isObjectExpression(args[0])) {
          args.unshift(_core.types.objectExpression([]));
        }

        var helper = useBuiltIns ? _core.types.memberExpression(_core.types.identifier("Object"), _core.types.identifier("assign")) : file.addHelper("extends");
        path.replaceWith(_core.types.callExpression(helper, args));
      }
    }
  };
}