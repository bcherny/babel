"use strict";

exports.__esModule = true;
exports.default = _default;

var _tdz = require("./tdz");

var _values = _interopRequireDefault(require("lodash/values"));

var _extend = _interopRequireDefault(require("lodash/extend"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DONE = new WeakSet();

function _default(api, opts) {
  var _opts$throwIfClosureR = opts.throwIfClosureRequired,
      throwIfClosureRequired = _opts$throwIfClosureR === void 0 ? false : _opts$throwIfClosureR,
      _opts$tdz = opts.tdz,
      tdzEnabled = _opts$tdz === void 0 ? false : _opts$tdz;

  if (typeof throwIfClosureRequired !== "boolean") {
    throw new Error(".throwIfClosureRequired must be a boolean, or undefined");
  }

  if (typeof tdzEnabled !== "boolean") {
    throw new Error(".throwIfClosureRequired must be a boolean, or undefined");
  }

  return {
    visitor: {
      VariableDeclaration: function VariableDeclaration(path) {
        var node = path.node,
            parent = path.parent,
            scope = path.scope;
        if (!isBlockScoped(node)) return;
        convertBlockScopedToVar(path, null, parent, scope, true);

        if (node._tdzThis) {
          var nodes = [node];

          for (var i = 0; i < node.declarations.length; i++) {
            var decl = node.declarations[i];

            if (decl.init) {
              var assign = _core.types.assignmentExpression("=", decl.id, decl.init);

              assign._ignoreBlockScopingTDZ = true;
              nodes.push(_core.types.expressionStatement(assign));
            }

            decl.init = this.addHelper("temporalUndefined");
          }

          node._blockHoist = 2;

          if (path.isCompletionRecord()) {
            nodes.push(_core.types.expressionStatement(scope.buildUndefinedNode()));
          }

          path.replaceWithMultiple(nodes);
        }
      },
      Loop: function Loop(path) {
        var parent = path.parent,
            scope = path.scope;
        path.ensureBlock();
        var blockScoping = new BlockScoping(path, path.get("body"), parent, scope, throwIfClosureRequired, tdzEnabled);
        var replace = blockScoping.run();
        if (replace) path.replaceWith(replace);
      },
      CatchClause: function CatchClause(path) {
        var parent = path.parent,
            scope = path.scope;
        var blockScoping = new BlockScoping(null, path.get("body"), parent, scope, throwIfClosureRequired, tdzEnabled);
        blockScoping.run();
      },
      "BlockStatement|SwitchStatement|Program": function BlockStatementSwitchStatementProgram(path) {
        if (!ignoreBlock(path)) {
          var blockScoping = new BlockScoping(null, path, path.parent, path.scope, throwIfClosureRequired, tdzEnabled);
          blockScoping.run();
        }
      }
    }
  };
}

function ignoreBlock(path) {
  return _core.types.isLoop(path.parent) || _core.types.isCatchClause(path.parent);
}

var buildRetCheck = (0, _core.template)("\n  if (typeof RETURN === \"object\") return RETURN.v;\n");

function isBlockScoped(node) {
  if (!_core.types.isVariableDeclaration(node)) return false;
  if (node[_core.types.BLOCK_SCOPED_SYMBOL]) return true;
  if (node.kind !== "let" && node.kind !== "const") return false;
  return true;
}

function isInLoop(path) {
  var loopOrFunctionParent = path.find(function (path) {
    return path.isLoop() || path.isFunction();
  });
  return loopOrFunctionParent && loopOrFunctionParent.isLoop();
}

function convertBlockScopedToVar(path, node, parent, scope, moveBindingsToParent) {
  if (moveBindingsToParent === void 0) {
    moveBindingsToParent = false;
  }

  if (!node) {
    node = path.node;
  }

  if (isInLoop(path) && !_core.types.isFor(parent)) {
    for (var i = 0; i < node.declarations.length; i++) {
      var declar = node.declarations[i];
      declar.init = declar.init || scope.buildUndefinedNode();
    }
  }

  node[_core.types.BLOCK_SCOPED_SYMBOL] = true;
  node.kind = "var";

  if (moveBindingsToParent) {
    var parentScope = scope.getFunctionParent() || scope.getProgramParent();
    var ids = path.getBindingIdentifiers();

    for (var name in ids) {
      var binding = scope.getOwnBinding(name);
      if (binding) binding.kind = "var";
      scope.moveBindingTo(name, parentScope);
    }
  }
}

function isVar(node) {
  return _core.types.isVariableDeclaration(node, {
    kind: "var"
  }) && !isBlockScoped(node);
}

var letReferenceBlockVisitor = _core.traverse.visitors.merge([{
  Loop: {
    enter: function enter(path, state) {
      state.loopDepth++;
    },
    exit: function exit(path, state) {
      state.loopDepth--;
    }
  },
  Function: function Function(path, state) {
    if (state.loopDepth > 0) {
      path.traverse(letReferenceFunctionVisitor, state);
    }

    return path.skip();
  }
}, _tdz.visitor]);

var letReferenceFunctionVisitor = _core.traverse.visitors.merge([{
  ReferencedIdentifier: function ReferencedIdentifier(path, state) {
    var ref = state.letReferences[path.node.name];
    if (!ref) return;
    var localBinding = path.scope.getBindingIdentifier(path.node.name);
    if (localBinding && localBinding !== ref) return;
    state.closurify = true;
  }
}, _tdz.visitor]);

var hoistVarDeclarationsVisitor = {
  enter: function enter(path, self) {
    var node = path.node,
        parent = path.parent;

    if (path.isForStatement()) {
      if (isVar(node.init, node)) {
        var nodes = self.pushDeclar(node.init);

        if (nodes.length === 1) {
          node.init = nodes[0];
        } else {
          node.init = _core.types.sequenceExpression(nodes);
        }
      }
    } else if (path.isFor()) {
      if (isVar(node.left, node)) {
        self.pushDeclar(node.left);
        node.left = node.left.declarations[0].id;
      }
    } else if (isVar(node, parent)) {
      path.replaceWithMultiple(self.pushDeclar(node).map(function (expr) {
        return _core.types.expressionStatement(expr);
      }));
    } else if (path.isFunction()) {
      return path.skip();
    }
  }
};
var loopLabelVisitor = {
  LabeledStatement: function LabeledStatement(_ref, state) {
    var node = _ref.node;
    state.innerLabels.push(node.label.name);
  }
};
var continuationVisitor = {
  enter: function enter(path, state) {
    if (path.isAssignmentExpression() || path.isUpdateExpression()) {
      var bindings = path.getBindingIdentifiers();

      for (var name in bindings) {
        if (state.outsideReferences[name] !== path.scope.getBindingIdentifier(name)) {
          continue;
        }

        state.reassignments[name] = true;
      }
    } else if (path.isReturnStatement()) {
      state.returnStatements.push(path);
    }
  }
};

function loopNodeTo(node) {
  if (_core.types.isBreakStatement(node)) {
    return "break";
  } else if (_core.types.isContinueStatement(node)) {
    return "continue";
  }
}

var loopVisitor = {
  Loop: function Loop(path, state) {
    var oldIgnoreLabeless = state.ignoreLabeless;
    state.ignoreLabeless = true;
    path.traverse(loopVisitor, state);
    state.ignoreLabeless = oldIgnoreLabeless;
    path.skip();
  },
  Function: function Function(path) {
    path.skip();
  },
  SwitchCase: function SwitchCase(path, state) {
    var oldInSwitchCase = state.inSwitchCase;
    state.inSwitchCase = true;
    path.traverse(loopVisitor, state);
    state.inSwitchCase = oldInSwitchCase;
    path.skip();
  },
  "BreakStatement|ContinueStatement|ReturnStatement": function BreakStatementContinueStatementReturnStatement(path, state) {
    var node = path.node,
        parent = path.parent,
        scope = path.scope;
    if (node[this.LOOP_IGNORE]) return;
    var replace;
    var loopText = loopNodeTo(node);

    if (loopText) {
      if (node.label) {
        if (state.innerLabels.indexOf(node.label.name) >= 0) {
          return;
        }

        loopText = loopText + "|" + node.label.name;
      } else {
        if (state.ignoreLabeless) return;
        if (_core.types.isBreakStatement(node) && _core.types.isSwitchCase(parent)) return;
      }

      state.hasBreakContinue = true;
      state.map[loopText] = node;
      replace = _core.types.stringLiteral(loopText);
    }

    if (path.isReturnStatement()) {
      state.hasReturn = true;
      replace = _core.types.objectExpression([_core.types.objectProperty(_core.types.identifier("v"), node.argument || scope.buildUndefinedNode())]);
    }

    if (replace) {
      replace = _core.types.returnStatement(replace);
      replace[this.LOOP_IGNORE] = true;
      path.skip();
      path.replaceWith(_core.types.inherits(replace, node));
    }
  }
};

var BlockScoping = function () {
  function BlockScoping(loopPath, blockPath, parent, scope, throwIfClosureRequired, tdzEnabled) {
    this.parent = parent;
    this.scope = scope;
    this.throwIfClosureRequired = throwIfClosureRequired;
    this.tdzEnabled = tdzEnabled;
    this.blockPath = blockPath;
    this.block = blockPath.node;
    this.outsideLetReferences = Object.create(null);
    this.hasLetReferences = false;
    this.letReferences = Object.create(null);
    this.body = [];

    if (loopPath) {
      this.loopParent = loopPath.parent;
      this.loopLabel = _core.types.isLabeledStatement(this.loopParent) && this.loopParent.label;
      this.loopPath = loopPath;
      this.loop = loopPath.node;
    }
  }

  var _proto = BlockScoping.prototype;

  _proto.run = function run() {
    var block = this.block;
    if (DONE.has(block)) return;
    DONE.add(block);
    var needsClosure = this.getLetReferences();

    if (_core.types.isFunction(this.parent) || _core.types.isProgram(this.block)) {
      this.updateScopeInfo();
      return;
    }

    if (!this.hasLetReferences) return;

    if (needsClosure) {
      this.wrapClosure();
    } else {
      this.remap();
    }

    this.updateScopeInfo(needsClosure);

    if (this.loopLabel && !_core.types.isLabeledStatement(this.loopParent)) {
      return _core.types.labeledStatement(this.loopLabel, this.loop);
    }
  };

  _proto.updateScopeInfo = function updateScopeInfo(wrappedInClosure) {
    var scope = this.scope;
    var parentScope = scope.getFunctionParent() || scope.getProgramParent();
    var letRefs = this.letReferences;

    for (var key in letRefs) {
      var ref = letRefs[key];
      var binding = scope.getBinding(ref.name);
      if (!binding) continue;

      if (binding.kind === "let" || binding.kind === "const") {
        binding.kind = "var";

        if (wrappedInClosure) {
          scope.removeBinding(ref.name);
        } else {
          scope.moveBindingTo(ref.name, parentScope);
        }
      }
    }
  };

  _proto.remap = function remap() {
    var letRefs = this.letReferences;
    var scope = this.scope;

    for (var key in letRefs) {
      var ref = letRefs[key];

      if (scope.parentHasBinding(key) || scope.hasGlobal(key)) {
        if (scope.hasOwnBinding(key)) {
          scope.rename(ref.name);
        }

        if (this.blockPath.scope.hasOwnBinding(key)) {
          this.blockPath.scope.rename(ref.name);
        }
      }
    }
  };

  _proto.wrapClosure = function wrapClosure() {
    if (this.throwIfClosureRequired) {
      throw this.blockPath.buildCodeFrameError("Compiling let/const in this block would add a closure " + "(throwIfClosureRequired).");
    }

    var block = this.block;
    var outsideRefs = this.outsideLetReferences;

    if (this.loop) {
      for (var name in outsideRefs) {
        var id = outsideRefs[name];

        if (this.scope.hasGlobal(id.name) || this.scope.parentHasBinding(id.name)) {
          delete outsideRefs[id.name];
          delete this.letReferences[id.name];
          this.scope.rename(id.name);
          this.letReferences[id.name] = id;
          outsideRefs[id.name] = id;
        }
      }
    }

    this.has = this.checkLoop();
    this.hoistVarDeclarations();
    var args = (0, _values.default)(outsideRefs);
    var params = args.map(function (id) {
      return _core.types.clone(id);
    });
    var isSwitch = this.blockPath.isSwitchStatement();

    var fn = _core.types.functionExpression(null, params, _core.types.blockStatement(isSwitch ? [block] : block.body));

    this.addContinuations(fn);

    var call = _core.types.callExpression(_core.types.nullLiteral(), args);

    var basePath = ".callee";

    var hasYield = _core.traverse.hasType(fn.body, "YieldExpression", _core.types.FUNCTION_TYPES);

    if (hasYield) {
      fn.generator = true;
      call = _core.types.yieldExpression(call, true);
      basePath = ".argument" + basePath;
    }

    var hasAsync = _core.traverse.hasType(fn.body, "AwaitExpression", _core.types.FUNCTION_TYPES);

    if (hasAsync) {
      fn.async = true;
      call = _core.types.awaitExpression(call);
      basePath = ".argument" + basePath;
    }

    var placeholderPath;
    var index;

    if (this.has.hasReturn || this.has.hasBreakContinue) {
      var ret = this.scope.generateUidIdentifier("ret");
      this.body.push(_core.types.variableDeclaration("var", [_core.types.variableDeclarator(ret, call)]));
      placeholderPath = "declarations.0.init" + basePath;
      index = this.body.length - 1;
      this.buildHas(ret);
    } else {
      this.body.push(_core.types.expressionStatement(call));
      placeholderPath = "expression" + basePath;
      index = this.body.length - 1;
    }

    var callPath;

    if (isSwitch) {
      var _blockPath = this.blockPath,
          parentPath = _blockPath.parentPath,
          listKey = _blockPath.listKey,
          key = _blockPath.key;
      this.blockPath.replaceWithMultiple(this.body);
      callPath = parentPath.get(listKey)[key + index];
    } else {
      block.body = this.body;
      callPath = this.blockPath.get("body")[index];
    }

    var placeholder = callPath.get(placeholderPath);
    var fnPath;

    if (this.loop) {
      var ref = this.scope.generateUidIdentifier("loop");
      var p = this.loopPath.insertBefore(_core.types.variableDeclaration("var", [_core.types.variableDeclarator(ref, fn)]));
      placeholder.replaceWith(ref);
      fnPath = p[0].get("declarations.0.init");
    } else {
      placeholder.replaceWith(fn);
      fnPath = placeholder;
    }

    fnPath.unwrapFunctionEnvironment();
  };

  _proto.addContinuations = function addContinuations(fn) {
    var _this = this;

    var state = {
      reassignments: {},
      returnStatements: [],
      outsideReferences: this.outsideLetReferences
    };
    this.scope.traverse(fn, continuationVisitor, state);

    var _loop = function _loop(i) {
      var param = fn.params[i];
      if (!state.reassignments[param.name]) return "continue";

      var newParam = _this.scope.generateUidIdentifier(param.name);

      fn.params[i] = newParam;

      _this.scope.rename(param.name, newParam.name, fn);

      state.returnStatements.forEach(function (returnStatement) {
        returnStatement.insertBefore(_core.types.expressionStatement(_core.types.assignmentExpression("=", param, newParam)));
      });
      fn.body.body.push(_core.types.expressionStatement(_core.types.assignmentExpression("=", param, newParam)));
    };

    for (var i = 0; i < fn.params.length; i++) {
      var _ret = _loop(i);

      if (_ret === "continue") continue;
    }
  };

  _proto.getLetReferences = function getLetReferences() {
    var _this2 = this;

    var block = this.block;
    var declarators = [];

    if (this.loop) {
      var init = this.loop.left || this.loop.init;

      if (isBlockScoped(init)) {
        declarators.push(init);
        (0, _extend.default)(this.outsideLetReferences, _core.types.getBindingIdentifiers(init));
      }
    }

    var addDeclarationsFromChild = function addDeclarationsFromChild(path, node) {
      node = node || path.node;

      if (_core.types.isClassDeclaration(node) || _core.types.isFunctionDeclaration(node) || isBlockScoped(node)) {
        if (isBlockScoped(node)) {
          convertBlockScopedToVar(path, node, block, _this2.scope);
        }

        declarators = declarators.concat(node.declarations || node);
      }

      if (_core.types.isLabeledStatement(node)) {
        addDeclarationsFromChild(path.get("body"), node.body);
      }
    };

    if (block.body) {
      for (var i = 0; i < block.body.length; i++) {
        var declarPath = this.blockPath.get("body")[i];
        addDeclarationsFromChild(declarPath);
      }
    }

    if (block.cases) {
      for (var _i = 0; _i < block.cases.length; _i++) {
        var consequents = block.cases[_i].consequent;

        for (var j = 0; j < consequents.length; j++) {
          var _declarPath = this.blockPath.get("cases")[_i];

          var declar = consequents[j];
          addDeclarationsFromChild(_declarPath, declar);
        }
      }
    }

    for (var _i2 = 0; _i2 < declarators.length; _i2++) {
      var _declar = declarators[_i2];

      var keys = _core.types.getBindingIdentifiers(_declar, false, true);

      (0, _extend.default)(this.letReferences, keys);
      this.hasLetReferences = true;
    }

    if (!this.hasLetReferences) return;
    var state = {
      letReferences: this.letReferences,
      closurify: false,
      loopDepth: 0,
      tdzEnabled: this.tdzEnabled,
      addHelper: function addHelper(name) {
        return _this2.addHelper(name);
      }
    };

    if (isInLoop(this.blockPath)) {
      state.loopDepth++;
    }

    this.blockPath.traverse(letReferenceBlockVisitor, state);
    return state.closurify;
  };

  _proto.checkLoop = function checkLoop() {
    var state = {
      hasBreakContinue: false,
      ignoreLabeless: false,
      inSwitchCase: false,
      innerLabels: [],
      hasReturn: false,
      isLoop: !!this.loop,
      map: {},
      LOOP_IGNORE: Symbol()
    };
    this.blockPath.traverse(loopLabelVisitor, state);
    this.blockPath.traverse(loopVisitor, state);
    return state;
  };

  _proto.hoistVarDeclarations = function hoistVarDeclarations() {
    this.blockPath.traverse(hoistVarDeclarationsVisitor, this);
  };

  _proto.pushDeclar = function pushDeclar(node) {
    var declars = [];

    var names = _core.types.getBindingIdentifiers(node);

    for (var name in names) {
      declars.push(_core.types.variableDeclarator(names[name]));
    }

    this.body.push(_core.types.variableDeclaration(node.kind, declars));
    var replace = [];

    for (var i = 0; i < node.declarations.length; i++) {
      var declar = node.declarations[i];
      if (!declar.init) continue;

      var expr = _core.types.assignmentExpression("=", declar.id, declar.init);

      replace.push(_core.types.inherits(expr, declar));
    }

    return replace;
  };

  _proto.buildHas = function buildHas(ret) {
    var body = this.body;
    var retCheck;
    var has = this.has;
    var cases = [];

    if (has.hasReturn) {
      retCheck = buildRetCheck({
        RETURN: ret
      });
    }

    if (has.hasBreakContinue) {
      for (var key in has.map) {
        cases.push(_core.types.switchCase(_core.types.stringLiteral(key), [has.map[key]]));
      }

      if (has.hasReturn) {
        cases.push(_core.types.switchCase(null, [retCheck]));
      }

      if (cases.length === 1) {
        var single = cases[0];
        body.push(_core.types.ifStatement(_core.types.binaryExpression("===", ret, single.test), single.consequent[0]));
      } else {
        if (this.loop) {
          for (var i = 0; i < cases.length; i++) {
            var caseConsequent = cases[i].consequent[0];

            if (_core.types.isBreakStatement(caseConsequent) && !caseConsequent.label) {
              caseConsequent.label = this.loopLabel = this.loopLabel || this.scope.generateUidIdentifier("loop");
            }
          }
        }

        body.push(_core.types.switchStatement(ret, cases));
      }
    } else {
      if (has.hasReturn) {
        body.push(retCheck);
      }
    }
  };

  return BlockScoping;
}();