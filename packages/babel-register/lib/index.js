exports = module.exports = function () {
  return register.apply(void 0, arguments);
};

exports.__esModule = true;

var node = require("./node");

var register = node.default;
Object.assign(exports, node);