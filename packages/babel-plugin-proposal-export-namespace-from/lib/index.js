"use strict";

exports.__esModule = true;
exports.default = _default;

var _pluginSyntaxExportNamespaceFrom = _interopRequireDefault(require("@babel/plugin-syntax-export-namespace-from"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    inherits: _pluginSyntaxExportNamespaceFrom.default,
    visitor: {
      ExportNamedDeclaration: function ExportNamedDeclaration(path) {
        var node = path.node,
            scope = path.scope;
        var specifiers = node.specifiers;
        var index = _core.types.isExportDefaultSpecifier(specifiers[0]) ? 1 : 0;
        if (!_core.types.isExportNamespaceSpecifier(specifiers[index])) return;
        var nodes = [];

        if (index === 1) {
          nodes.push(_core.types.exportNamedDeclaration(null, [specifiers.shift()], node.source));
        }

        var specifier = specifiers.shift();
        var exported = specifier.exported;
        var uid = scope.generateUidIdentifier(exported.name);
        nodes.push(_core.types.importDeclaration([_core.types.importNamespaceSpecifier(uid)], node.source), _core.types.exportNamedDeclaration(null, [_core.types.exportSpecifier(uid, exported)]));

        if (node.specifiers.length >= 1) {
          nodes.push(node);
        }

        path.replaceWithMultiple(nodes);
      }
    }
  };
}