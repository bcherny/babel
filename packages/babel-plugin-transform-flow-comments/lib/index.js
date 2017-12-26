"use strict";

exports.__esModule = true;
exports.default = _default;

var _pluginSyntaxFlow = _interopRequireDefault(require("@babel/plugin-syntax-flow"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  function wrapInFlowComment(path, parent) {
    var attach = path.getPrevSibling();
    var where = "trailing";

    if (!attach.node) {
      attach = path.parentPath;
      where = "inner";
    }

    attach.addComment(where, generateComment(path, parent));
    path.remove();
  }

  function generateComment(path, parent) {
    var comment = path.getSource().replace(/\*-\//g, "*-ESCAPED/").replace(/\*\//g, "*-/");
    if (parent && parent.optional) comment = "?" + comment;
    if (comment[0] !== ":") comment = ":: " + comment;
    return comment;
  }

  return {
    inherits: _pluginSyntaxFlow.default,
    visitor: {
      TypeCastExpression: function TypeCastExpression(path) {
        var node = path.node;
        path.get("expression").addComment("trailing", generateComment(path.get("typeAnnotation")));
        path.replaceWith(_core.types.parenthesizedExpression(node.expression));
      },
      Identifier: function Identifier(path) {
        if (path.parentPath.isFlow()) {
          return;
        }

        var node = path.node;

        if (node.typeAnnotation) {
          var typeAnnotation = path.get("typeAnnotation");
          path.addComment("trailing", generateComment(typeAnnotation, node));
          typeAnnotation.remove();

          if (node.optional) {
            node.optional = false;
          }
        } else if (node.optional) {
          path.addComment("trailing", ":: ?");
          node.optional = false;
        }
      },
      AssignmentPattern: {
        exit: function exit(_ref) {
          var node = _ref.node;
          var left = node.left;

          if (left.optional) {
            left.optional = false;
          }
        }
      },
      Function: function Function(path) {
        if (path.isDeclareFunction()) return;
        var node = path.node;

        if (node.returnType) {
          var returnType = path.get("returnType");
          var typeAnnotation = returnType.get("typeAnnotation");
          var block = path.get("body");
          block.addComment("leading", generateComment(returnType, typeAnnotation.node));
          returnType.remove();
        }

        if (node.typeParameters) {
          var typeParameters = path.get("typeParameters");
          var id = path.get("id");
          id.addComment("trailing", generateComment(typeParameters, typeParameters.node));
          typeParameters.remove();
        }
      },
      ClassProperty: function ClassProperty(path) {
        var node = path.node,
            parent = path.parent;

        if (!node.value) {
          wrapInFlowComment(path, parent);
        } else if (node.typeAnnotation) {
          var typeAnnotation = path.get("typeAnnotation");
          path.get("key").addComment("trailing", generateComment(typeAnnotation, typeAnnotation.node));
          typeAnnotation.remove();
        }
      },
      ExportNamedDeclaration: function ExportNamedDeclaration(path) {
        var node = path.node,
            parent = path.parent;

        if (node.exportKind !== "type" && !_core.types.isFlow(node.declaration)) {
          return;
        }

        wrapInFlowComment(path, parent);
      },
      ImportDeclaration: function ImportDeclaration(path) {
        var node = path.node,
            parent = path.parent;

        if (node.importKind !== "type" && node.importKind !== "typeof") {
          return;
        }

        wrapInFlowComment(path, parent);
      },
      Flow: function Flow(path) {
        var parent = path.parent;
        wrapInFlowComment(path, parent);
      },
      Class: function Class(path) {
        var node = path.node;

        if (node.typeParameters) {
          var typeParameters = path.get("typeParameters");
          var block = path.get("body");
          block.addComment("leading", generateComment(typeParameters, typeParameters.node));
          typeParameters.remove();
        }
      }
    }
  };
}