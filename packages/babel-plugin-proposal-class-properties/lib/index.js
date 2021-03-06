"use strict";

exports.__esModule = true;
exports.default = _default;

var _helperFunctionName = _interopRequireDefault(require("@babel/helper-function-name"));

var _pluginSyntaxClassProperties = _interopRequireDefault(require("@babel/plugin-syntax-class-properties"));

var _core = require("@babel/core");

var _templateObject = _taggedTemplateLiteralLoose(["\n      Object.defineProperty(REF, KEY, {\n        configurable: true,\n        enumerable: true,\n        writable: true,\n        value: VALUE\n      });\n    "], ["\n      Object.defineProperty(REF, KEY, {\n        configurable: true,\n        enumerable: true,\n        writable: true,\n        value: VALUE\n      });\n    "]),
    _templateObject2 = _taggedTemplateLiteralLoose(["MEMBER = VALUE"], ["MEMBER = VALUE"]);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }

function _default(api, options) {
  var loose = options.loose;
  var findBareSupers = {
    Super: function Super(path) {
      if (path.parentPath.isCallExpression({
        callee: path.node
      })) {
        this.push(path.parentPath);
      }
    }
  };
  var referenceVisitor = {
    "TSTypeAnnotation|TypeAnnotation": function TSTypeAnnotationTypeAnnotation(path) {
      path.skip();
    },
    ReferencedIdentifier: function ReferencedIdentifier(path) {
      if (this.scope.hasOwnBinding(path.node.name)) {
        this.collision = true;
        path.skip();
      }
    }
  };
  var ClassFieldDefinitionEvaluationTDZVisitor = {
    Expression: function Expression(path) {
      if (path === this.shouldSkip) {
        path.skip();
      }
    },
    ReferencedIdentifier: function ReferencedIdentifier(path) {
      if (this.classRef === path.scope.getBinding(path.node.name)) {
        var classNameTDZError = this.file.addHelper("classNameTDZError");

        var throwNode = _core.types.callExpression(classNameTDZError, [_core.types.stringLiteral(path.node.name)]);

        path.replaceWith(_core.types.sequenceExpression([throwNode, path.node]));
        path.skip();
      }
    }
  };

  var buildClassPropertySpec = function buildClassPropertySpec(ref, _ref, scope) {
    var key = _ref.key,
        value = _ref.value,
        computed = _ref.computed;
    return _core.template.statement(_templateObject)({
      REF: ref,
      KEY: _core.types.isIdentifier(key) && !computed ? _core.types.stringLiteral(key.name) : key,
      VALUE: value || scope.buildUndefinedNode()
    });
  };

  var buildClassPropertyLoose = function buildClassPropertyLoose(ref, _ref2, scope) {
    var key = _ref2.key,
        value = _ref2.value,
        computed = _ref2.computed;
    return _core.template.statement(_templateObject2)({
      MEMBER: _core.types.memberExpression(ref, key, computed || _core.types.isLiteral(key)),
      VALUE: value || scope.buildUndefinedNode()
    });
  };

  var buildClassProperty = loose ? buildClassPropertyLoose : buildClassPropertySpec;
  return {
    inherits: _pluginSyntaxClassProperties.default,
    visitor: {
      Class: function Class(path) {
        var isDerived = !!path.node.superClass;
        var constructor;
        var props = [];
        var computedPaths = [];
        var body = path.get("body");

        for (var _iterator = body.get("body"), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref3;

          if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref3 = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref3 = _i.value;
          }

          var _path2 = _ref3;

          if (_path2.node.computed) {
            computedPaths.push(_path2);
          }

          if (_path2.isClassProperty()) {
            props.push(_path2);
          } else if (_path2.isClassMethod({
            kind: "constructor"
          })) {
            constructor = _path2;
          }
        }

        if (!props.length) return;
        var ref;

        if (path.isClassExpression() || !path.node.id) {
          (0, _helperFunctionName.default)(path);
          ref = path.scope.generateUidIdentifier("class");
        } else {
          ref = path.node.id;
        }

        var computedNodes = [];
        var staticNodes = [];
        var instanceBody = [];

        for (var _i2 = 0; _i2 < computedPaths.length; _i2++) {
          var computedPath = computedPaths[_i2];
          var computedNode = computedPath.node;

          if (!computedPath.get("key").isConstantExpression()) {
            computedPath.traverse(ClassFieldDefinitionEvaluationTDZVisitor, {
              classRef: path.scope.getBinding(ref.name),
              file: this.file,
              shouldSkip: computedPath.get("value")
            });
            var ident = path.scope.generateUidIdentifierBasedOnNode(computedNode.key);
            computedNodes.push(_core.types.variableDeclaration("var", [_core.types.variableDeclarator(ident, computedNode.key)]));
            computedNode.key = _core.types.clone(ident);
          }
        }

        for (var _i3 = 0; _i3 < props.length; _i3++) {
          var prop = props[_i3];
          var propNode = prop.node;
          if (propNode.decorators && propNode.decorators.length > 0) continue;

          if (propNode.static) {
            staticNodes.push(buildClassProperty(ref, propNode, path.scope));
          } else {
            instanceBody.push(buildClassProperty(_core.types.thisExpression(), propNode, path.scope));
          }
        }

        var nodes = computedNodes.concat(staticNodes);

        if (instanceBody.length) {
          if (!constructor) {
            var newConstructor = _core.types.classMethod("constructor", _core.types.identifier("constructor"), [], _core.types.blockStatement([]));

            if (isDerived) {
              newConstructor.params = [_core.types.restElement(_core.types.identifier("args"))];
              newConstructor.body.body.push(_core.types.returnStatement(_core.types.callExpression(_core.types.super(), [_core.types.spreadElement(_core.types.identifier("args"))])));
            }

            var _body$unshiftContaine = body.unshiftContainer("body", newConstructor);

            constructor = _body$unshiftContaine[0];
          }

          var collisionState = {
            collision: false,
            scope: constructor.scope
          };

          for (var _i4 = 0; _i4 < props.length; _i4++) {
            var _prop = props[_i4];

            _prop.traverse(referenceVisitor, collisionState);

            if (collisionState.collision) break;
          }

          if (collisionState.collision) {
            var initialisePropsRef = path.scope.generateUidIdentifier("initialiseProps");
            nodes.push(_core.types.variableDeclaration("var", [_core.types.variableDeclarator(initialisePropsRef, _core.types.functionExpression(null, [], _core.types.blockStatement(instanceBody)))]));
            instanceBody = [_core.types.expressionStatement(_core.types.callExpression(_core.types.memberExpression(initialisePropsRef, _core.types.identifier("call")), [_core.types.thisExpression()]))];
          }

          if (isDerived) {
            var bareSupers = [];
            constructor.traverse(findBareSupers, bareSupers);

            for (var _i5 = 0; _i5 < bareSupers.length; _i5++) {
              var bareSuper = bareSupers[_i5];
              bareSuper.insertAfter(instanceBody);
            }
          } else {
            constructor.get("body").unshiftContainer("body", instanceBody);
          }
        }

        for (var _i6 = 0; _i6 < props.length; _i6++) {
          var _prop2 = props[_i6];

          _prop2.remove();
        }

        if (!nodes.length) return;

        if (path.isClassExpression()) {
          path.scope.push({
            id: ref
          });
          path.replaceWith(_core.types.assignmentExpression("=", ref, path.node));
        } else if (!path.node.id) {
          path.node.id = ref;
        }

        path.insertAfter(nodes);
      }
    }
  };
}