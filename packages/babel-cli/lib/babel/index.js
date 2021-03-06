#!/usr/bin/env node
"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _commander = _interopRequireDefault(require("commander"));

var _core = require("@babel/core");

var _uniq = _interopRequireDefault(require("lodash/uniq"));

var _glob = _interopRequireDefault(require("glob"));

var _dir = _interopRequireDefault(require("./dir"));

var _file = _interopRequireDefault(require("./file"));

var _package = _interopRequireDefault(require("../../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function booleanify(val) {
  if (val === "true" || val == 1) {
    return true;
  }

  if (val === "false" || val == 0 || !val) {
    return false;
  }

  return val;
}

function collect(value, previousValue) {
  if (typeof value !== "string") return previousValue;
  var values = value.split(",");
  return previousValue ? previousValue.concat(values) : values;
}

_commander.default.option("-f, --filename [filename]", "filename to use when reading from stdin - this will be used in source-maps, errors etc");

_commander.default.option("--presets [list]", "comma-separated list of preset names", collect);

_commander.default.option("--plugins [list]", "comma-separated list of plugin names", collect);

_commander.default.option("--config-file [path]", "Path a to .babelrc file to use");

_commander.default.option("--env-name [name]", "The name of the 'env' to use when loading configs and plugins. " + "Defaults to the value of BABEL_ENV, or else NODE_ENV, or else 'development'.");

_commander.default.option("--source-type [script|module]", "");

_commander.default.option("--no-babelrc", "Whether or not to look up .babelrc and .babelignore files");

_commander.default.option("--ignore [list]", "list of glob paths to **not** compile", collect);

_commander.default.option("--only [list]", "list of glob paths to **only** compile", collect);

_commander.default.option("--no-highlight-code", "enable/disable ANSI syntax highlighting of code frames (on by default)");

_commander.default.option("--no-comments", "write comments to generated output (true by default)");

_commander.default.option("--retain-lines", "retain line numbers - will result in really ugly code");

_commander.default.option("--compact [true|false|auto]", "do not include superfluous whitespace characters and line terminators", booleanify);

_commander.default.option("--minified", "save as much bytes when printing [true|false]");

_commander.default.option("--auxiliary-comment-before [string]", "print a comment before any injected non-user code");

_commander.default.option("--auxiliary-comment-after [string]", "print a comment after any injected non-user code");

_commander.default.option("-s, --source-maps [true|false|inline|both]", "", booleanify);

_commander.default.option("--source-map-target [string]", "set `file` on returned source map");

_commander.default.option("--source-file-name [string]", "set `sources[0]` on returned source map");

_commander.default.option("--source-root [filename]", "the root from which all sources are relative");

_commander.default.option("--module-root [filename]", "optional prefix for the AMD module formatter that will be prepend to the filename on module definitions");

_commander.default.option("-M, --module-ids", "insert an explicit id for modules");

_commander.default.option("--module-id [string]", "specify a custom name for module ids");

_commander.default.option("-x, --extensions [extensions]", "List of extensions to compile when a directory has been input [.es6,.js,.es,.jsx,.mjs]", collect);

_commander.default.option("--keep-file-extension", "Preserve the file extensions of the input files");

_commander.default.option("-w, --watch", "Recompile files on changes");

_commander.default.option("--skip-initial-build", "Do not compile files before watching");

_commander.default.option("-o, --out-file [out]", "Compile all input files into a single file");

_commander.default.option("-d, --out-dir [out]", "Compile an input directory of modules into an output directory");

_commander.default.option("--relative", "Compile into an output directory relative to input directory or file. Requires --out-dir [out]");

_commander.default.option("-D, --copy-files", "When compiling a directory copy over non-compilable files");

_commander.default.option("--include-dotfiles", "Include dotfiles when compiling and copying non-compilable files");

_commander.default.option("-q, --quiet", "Don't log anything");

_commander.default.option("--delete-dir-on-start", "Delete the out directory before compilation");

_commander.default.version(_package.default.version + " (@babel/core " + _core.version + ")");

_commander.default.usage("[options] <files ...>");

_commander.default.parse(process.argv);

var errors = [];

var filenames = _commander.default.args.reduce(function (globbed, input) {
  var files = _glob.default.sync(input);

  if (!files.length) files = [input];
  return globbed.concat(files);
}, []);

filenames = (0, _uniq.default)(filenames);
filenames.forEach(function (filename) {
  if (!_fs.default.existsSync(filename)) {
    errors.push(filename + " doesn't exist");
  }
});

if (_commander.default.outDir && !filenames.length) {
  errors.push("filenames required for --out-dir");
}

if (_commander.default.outFile && _commander.default.outDir) {
  errors.push("cannot have --out-file and --out-dir");
}

if (_commander.default.relative && !_commander.default.outDir) {
  errors.push("output directory required for --relative");
}

if (_commander.default.watch) {
  if (!_commander.default.outFile && !_commander.default.outDir) {
    errors.push("--watch requires --out-file or --out-dir");
  }

  if (!filenames.length) {
    errors.push("--watch requires filenames");
  }
}

if (_commander.default.skipInitialBuild && !_commander.default.watch) {
  errors.push("--skip-initial-build requires --watch");
}

if (_commander.default.deleteDirOnStart && !_commander.default.outDir) {
  errors.push("--delete-dir-on-start requires --out-dir");
}

if (errors.length) {
  console.error(errors.join(". "));
  process.exit(2);
}

var opts = _commander.default.opts();

if (opts.configFile) {
  opts.extends = opts.configFile;
}

delete opts.version;
delete opts.extensions;
delete opts.watch;
delete opts.skipInitialBuild;
delete opts.outFile;
delete opts.outDir;
delete opts.copyFiles;
delete opts.includeDotfiles;
delete opts.quiet;
delete opts.configFile;
delete opts.deleteDirOnStart;
delete opts.keepFileExtension;
delete opts.relative;
if (opts.babelrc === true) opts.babelrc = undefined;
if (opts.comments === true) opts.comments = undefined;
if (opts.highlightCode === true) opts.highlightCode = undefined;
var fn = _commander.default.outDir ? _dir.default : _file.default;
fn(_commander.default, filenames, opts);