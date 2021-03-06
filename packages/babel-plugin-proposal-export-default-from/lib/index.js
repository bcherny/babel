"use strict";

exports.__esModule = true;
exports.default = _default;

var _pluginSyntaxExportDefaultFrom = _interopRequireDefault(require("@babel/plugin-syntax-export-default-from"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    inherits: _pluginSyntaxExportDefaultFrom.default,
    visitor: {
      ExportNamedDeclaration: function ExportNamedDeclaration(path) {
        var node = path.node,
            scope = path.scope;
        var specifiers = node.specifiers;
        if (!_core.types.isExportDefaultSpecifier(specifiers[0])) return;
        var specifier = specifiers.shift();
        var exported = specifier.exported;
        var uid = scope.generateUidIdentifier(exported.name);
        var nodes = [_core.types.importDeclaration([_core.types.importDefaultSpecifier(uid)], node.source), _core.types.exportNamedDeclaration(null, [_core.types.exportSpecifier(uid, exported)])];

        if (specifiers.length >= 1) {
          nodes.push(node);
        }

        path.replaceWithMultiple(nodes);
      }
    }
  };
}