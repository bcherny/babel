"use strict";

exports.__esModule = true;
exports.default = void 0;

var _template = _interopRequireDefault(require("@babel/template"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var helpers = {};
var _default = helpers;
exports.default = _default;

var defineHelper = _template.default.program({
  placeholderPattern: false
});

helpers.typeof = defineHelper("\n  export default function _typeof(obj) {\n    if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") {\n      _typeof = function (obj) { return typeof obj; };\n    } else {\n      _typeof = function (obj) {\n        return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype\n          ? \"symbol\"\n          : typeof obj;\n      };\n    }\n\n    return _typeof(obj);\n  }\n");
helpers.jsx = defineHelper("\n  var REACT_ELEMENT_TYPE;\n\n  export default function _createRawReactElement(type, props, key, children) {\n    if (!REACT_ELEMENT_TYPE) {\n      REACT_ELEMENT_TYPE = (typeof Symbol === \"function\" && Symbol.for && Symbol.for(\"react.element\")) || 0xeac7;\n    }\n\n    var defaultProps = type && type.defaultProps;\n    var childrenLength = arguments.length - 3;\n\n    if (!props && childrenLength !== 0) {\n      // If we're going to assign props.children, we create a new object now\n      // to avoid mutating defaultProps.\n      props = {};\n    }\n    if (props && defaultProps) {\n      for (var propName in defaultProps) {\n        if (props[propName] === void 0) {\n          props[propName] = defaultProps[propName];\n        }\n      }\n    } else if (!props) {\n      props = defaultProps || {};\n    }\n\n    if (childrenLength === 1) {\n      props.children = children;\n    } else if (childrenLength > 1) {\n      var childArray = new Array(childrenLength);\n      for (var i = 0; i < childrenLength; i++) {\n        childArray[i] = arguments[i + 3];\n      }\n      props.children = childArray;\n    }\n\n    return {\n      $$typeof: REACT_ELEMENT_TYPE,\n      type: type,\n      key: key === undefined ? null : '' + key,\n      ref: null,\n      props: props,\n      _owner: null,\n    };\n  }\n");
helpers.asyncIterator = defineHelper("\n  export default function _asyncIterator(iterable) {\n    if (typeof Symbol === \"function\") {\n      if (Symbol.asyncIterator) {\n        var method = iterable[Symbol.asyncIterator];\n        if (method != null) return method.call(iterable);\n      }\n      if (Symbol.iterator) {\n        return iterable[Symbol.iterator]();\n      }\n    }\n    throw new TypeError(\"Object is not async iterable\");\n  }\n");
helpers.AwaitValue = defineHelper("\n  export default function _AwaitValue(value) {\n    this.wrapped = value;\n  }\n");
helpers.AsyncGenerator = defineHelper("\n  import AwaitValue from \"AwaitValue\";\n\n  export default function AsyncGenerator(gen) {\n    var front, back;\n\n    function send(key, arg) {\n      return new Promise(function (resolve, reject) {\n        var request = {\n          key: key,\n          arg: arg,\n          resolve: resolve,\n          reject: reject,\n          next: null,\n        };\n\n        if (back) {\n          back = back.next = request;\n        } else {\n          front = back = request;\n          resume(key, arg);\n        }\n      });\n    }\n\n    function resume(key, arg) {\n      try {\n        var result = gen[key](arg)\n        var value = result.value;\n        var wrappedAwait = value instanceof AwaitValue;\n\n        Promise.resolve(wrappedAwait ? value.wrapped : value).then(\n          function (arg) {\n            if (wrappedAwait) {\n              resume(\"next\", arg);\n              return\n            }\n\n            settle(result.done ? \"return\" : \"normal\", arg);\n          },\n          function (err) { resume(\"throw\", err); });\n      } catch (err) {\n        settle(\"throw\", err);\n      }\n    }\n\n    function settle(type, value) {\n      switch (type) {\n        case \"return\":\n          front.resolve({ value: value, done: true });\n          break;\n        case \"throw\":\n          front.reject(value);\n          break;\n        default:\n          front.resolve({ value: value, done: false });\n          break;\n      }\n\n      front = front.next;\n      if (front) {\n        resume(front.key, front.arg);\n      } else {\n        back = null;\n      }\n    }\n\n    this._invoke = send;\n\n    // Hide \"return\" method if generator return is not supported\n    if (typeof gen.return !== \"function\") {\n      this.return = undefined;\n    }\n  }\n\n  if (typeof Symbol === \"function\" && Symbol.asyncIterator) {\n    AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; };\n  }\n\n  AsyncGenerator.prototype.next = function (arg) { return this._invoke(\"next\", arg); };\n  AsyncGenerator.prototype.throw = function (arg) { return this._invoke(\"throw\", arg); };\n  AsyncGenerator.prototype.return = function (arg) { return this._invoke(\"return\", arg); };\n");
helpers.wrapAsyncGenerator = defineHelper("\n  import AsyncGenerator from \"AsyncGenerator\";\n\n  export default function _wrapAsyncGenerator(fn) {\n    return function () {\n      return new AsyncGenerator(fn.apply(this, arguments));\n    };\n  }\n");
helpers.awaitAsyncGenerator = defineHelper("\n  import AwaitValue from \"AwaitValue\";\n\n  export default function _awaitAsyncGenerator(value) {\n    return new AwaitValue(value);\n  }\n");
helpers.asyncGeneratorDelegate = defineHelper("\n  export default function _asyncGeneratorDelegate(inner, awaitWrap) {\n    var iter = {}, waiting = false;\n\n    function pump(key, value) {\n      waiting = true;\n      value = new Promise(function (resolve) { resolve(inner[key](value)); });\n      return { done: false, value: awaitWrap(value) };\n    };\n\n    if (typeof Symbol === \"function\" && Symbol.iterator) {\n      iter[Symbol.iterator] = function () { return this; };\n    }\n\n    iter.next = function (value) {\n      if (waiting) {\n        waiting = false;\n        return value;\n      }\n      return pump(\"next\", value);\n    };\n\n    if (typeof inner.throw === \"function\") {\n      iter.throw = function (value) {\n        if (waiting) {\n          waiting = false;\n          throw value;\n        }\n        return pump(\"throw\", value);\n      };\n    }\n\n    if (typeof inner.return === \"function\") {\n      iter.return = function (value) {\n        return pump(\"return\", value);\n      };\n    }\n\n    return iter;\n  }\n");
helpers.asyncToGenerator = defineHelper("\n  export default function _asyncToGenerator(fn) {\n    return function () {\n      var self = this, args = arguments;\n      return new Promise(function (resolve, reject) {\n        var gen = fn.apply(self, args);\n        function step(key, arg) {\n          try {\n            var info = gen[key](arg);\n            var value = info.value;\n          } catch (error) {\n            reject(error);\n            return;\n          }\n\n          if (info.done) {\n            resolve(value);\n          } else {\n            Promise.resolve(value).then(_next, _throw);\n          }\n        }\n        function _next(value) { step(\"next\", value); }\n        function _throw(err) { step(\"throw\", err); }\n\n        _next();\n      });\n    };\n  }\n");
helpers.classCallCheck = defineHelper("\n  export default function _classCallCheck(instance, Constructor) {\n    if (!(instance instanceof Constructor)) {\n      throw new TypeError(\"Cannot call a class as a function\");\n    }\n  }\n");
helpers.createClass = defineHelper("\n  function _defineProperties(target, props) {\n    for (var i = 0; i < props.length; i ++) {\n      var descriptor = props[i];\n      descriptor.enumerable = descriptor.enumerable || false;\n      descriptor.configurable = true;\n      if (\"value\" in descriptor) descriptor.writable = true;\n      Object.defineProperty(target, descriptor.key, descriptor);\n    }\n  }\n\n  export default function _createClass(Constructor, protoProps, staticProps) {\n    if (protoProps) _defineProperties(Constructor.prototype, protoProps);\n    if (staticProps) _defineProperties(Constructor, staticProps);\n    return Constructor;\n  }\n");
helpers.defineEnumerableProperties = defineHelper("\n  export default function _defineEnumerableProperties(obj, descs) {\n    for (var key in descs) {\n      var desc = descs[key];\n      desc.configurable = desc.enumerable = true;\n      if (\"value\" in desc) desc.writable = true;\n      Object.defineProperty(obj, key, desc);\n    }\n\n    // Symbols are not enumerated over by for-in loops. If native\n    // Symbols are available, fetch all of the descs object's own\n    // symbol properties and define them on our target object too.\n    if (Object.getOwnPropertySymbols) {\n      var objectSymbols = Object.getOwnPropertySymbols(descs);\n      for (var i = 0; i < objectSymbols.length; i++) {\n        var sym = objectSymbols[i];\n        var desc = descs[sym];\n        desc.configurable = desc.enumerable = true;\n        if (\"value\" in desc) desc.writable = true;\n        Object.defineProperty(obj, sym, desc);\n      }\n    }\n    return obj;\n  }\n");
helpers.defaults = defineHelper("\n  export default function _defaults(obj, defaults) {\n    var keys = Object.getOwnPropertyNames(defaults);\n    for (var i = 0; i < keys.length; i++) {\n      var key = keys[i];\n      var value = Object.getOwnPropertyDescriptor(defaults, key);\n      if (value && value.configurable && obj[key] === undefined) {\n        Object.defineProperty(obj, key, value);\n      }\n    }\n    return obj;\n  }\n");
helpers.defineProperty = defineHelper("\n  export default function _defineProperty(obj, key, value) {\n    // Shortcircuit the slow defineProperty path when possible.\n    // We are trying to avoid issues where setters defined on the\n    // prototype cause side effects under the fast path of simple\n    // assignment. By checking for existence of the property with\n    // the in operator, we can optimize most of this overhead away.\n    if (key in obj) {\n      Object.defineProperty(obj, key, {\n        value: value,\n        enumerable: true,\n        configurable: true,\n        writable: true\n      });\n    } else {\n      obj[key] = value;\n    }\n    return obj;\n  }\n");
helpers.extends = defineHelper("\n  export default function _extends() {\n    _extends = Object.assign || function (target) {\n      for (var i = 1; i < arguments.length; i++) {\n        var source = arguments[i];\n        for (var key in source) {\n          if (Object.prototype.hasOwnProperty.call(source, key)) {\n            target[key] = source[key];\n          }\n        }\n      }\n      return target;\n    };\n\n    return _extends.apply(this, arguments);\n  }\n");
helpers.get = defineHelper("\n  export default function _get(object, property, receiver) {\n    if (object === null) object = Function.prototype;\n\n    var desc = Object.getOwnPropertyDescriptor(object, property);\n\n    if (desc === undefined) {\n      var parent = Object.getPrototypeOf(object);\n\n      if (parent === null) {\n        return undefined;\n      } else {\n        return _get(parent, property, receiver);\n      }\n    } else if (\"value\" in desc) {\n      return desc.value;\n    } else {\n      var getter = desc.get;\n\n      if (getter === undefined) {\n        return undefined;\n      }\n\n      return getter.call(receiver);\n    }\n  }\n");
helpers.inherits = defineHelper("\n  export default function _inherits(subClass, superClass) {\n    if (typeof superClass !== \"function\" && superClass !== null) {\n      throw new TypeError(\"Super expression must either be null or a function\");\n    }\n    subClass.prototype = Object.create(superClass && superClass.prototype, {\n      constructor: {\n        value: subClass,\n        enumerable: false,\n        writable: true,\n        configurable: true\n      }\n    });\n    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;\n  }\n");
helpers.inheritsLoose = defineHelper("\n  export default function _inheritsLoose(subClass, superClass) {\n    subClass.prototype = Object.create(superClass.prototype);\n    subClass.prototype.constructor = subClass;\n    subClass.__proto__ = superClass;\n  }\n");
helpers.instanceof = defineHelper("\n  export default function _instanceof(left, right) {\n    if (right != null && typeof Symbol !== \"undefined\" && right[Symbol.hasInstance]) {\n      return right[Symbol.hasInstance](left);\n    } else {\n      return left instanceof right;\n    }\n  }\n");
helpers.interopRequireDefault = defineHelper("\n  export default function _interopRequireDefault(obj) {\n    return obj && obj.__esModule ? obj : { default: obj };\n  }\n");
helpers.interopRequireWildcard = defineHelper("\n  export default function _interopRequireWildcard(obj) {\n    if (obj && obj.__esModule) {\n      return obj;\n    } else {\n      var newObj = {};\n      if (obj != null) {\n        for (var key in obj) {\n          if (Object.prototype.hasOwnProperty.call(obj, key)) {\n            var desc = Object.defineProperty && Object.getOwnPropertyDescriptor\n              ? Object.getOwnPropertyDescriptor(obj, key)\n              : {};\n            if (desc.get || desc.set) {\n              Object.defineProperty(newObj, key, desc);\n            } else {\n              newObj[key] = obj[key];\n            }\n          }\n        }\n      }\n      newObj.default = obj;\n      return newObj;\n    }\n  }\n");
helpers.newArrowCheck = defineHelper("\n  export default function _newArrowCheck(innerThis, boundThis) {\n    if (innerThis !== boundThis) {\n      throw new TypeError(\"Cannot instantiate an arrow function\");\n    }\n  }\n");
helpers.objectDestructuringEmpty = defineHelper("\n  export default function _objectDestructuringEmpty(obj) {\n    if (obj == null) throw new TypeError(\"Cannot destructure undefined\");\n  }\n");
helpers.objectWithoutProperties = defineHelper("\n  export default function _objectWithoutProperties(source, excluded) {\n    if (source == null) return {};\n\n    var target = {};\n    var sourceKeys = Object.keys(source);\n    var key, i;\n\n    for (i = 0; i < sourceKeys.length; i++) {\n      key = sourceKeys[i];\n      if (excluded.indexOf(key) >= 0) continue;\n      target[key] = source[key];\n    }\n\n    if (Object.getOwnPropertySymbols) {\n      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);\n      for (i = 0; i < sourceSymbolKeys.length; i++) {\n        key = sourceSymbolKeys[i];\n        if (excluded.indexOf(key) >= 0) continue;\n        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;\n        target[key] = source[key];\n      }\n    }\n\n    return target;\n  }\n");
helpers.possibleConstructorReturn = defineHelper("\n  export default function _possibleConstructorReturn(self, call) {\n    if (call && (typeof call === \"object\" || typeof call === \"function\")) {\n      return call;\n    }\n    if (!self) {\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    }\n    return self;\n  }\n");
helpers.set = defineHelper("\n  export default function _set(object, property, value, receiver) {\n    var desc = Object.getOwnPropertyDescriptor(object, property);\n\n    if (desc === undefined) {\n      var parent = Object.getPrototypeOf(object);\n\n      if (parent !== null) {\n        _set(parent, property, value, receiver);\n      }\n    } else if (\"value\" in desc && desc.writable) {\n      desc.value = value;\n    } else {\n      var setter = desc.set;\n\n      if (setter !== undefined) {\n        setter.call(receiver, value);\n      }\n    }\n\n    return value;\n  }\n");
helpers.slicedToArray = defineHelper("\n  // Broken out into a separate function to avoid deoptimizations due to the try/catch for the\n  // array iterator case.\n  function _sliceIterator(arr, i) {\n    // this is an expanded form of `for...of` that properly supports abrupt completions of\n    // iterators etc. variable names have been minimised to reduce the size of this massive\n    // helper. sometimes spec compliancy is annoying :(\n    //\n    // _n = _iteratorNormalCompletion\n    // _d = _didIteratorError\n    // _e = _iteratorError\n    // _i = _iterator\n    // _s = _step\n\n    var _arr = [];\n    var _n = true;\n    var _d = false;\n    var _e = undefined;\n    try {\n      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {\n        _arr.push(_s.value);\n        if (i && _arr.length === i) break;\n      }\n    } catch (err) {\n      _d = true;\n      _e = err;\n    } finally {\n      try {\n        if (!_n && _i[\"return\"] != null) _i[\"return\"]();\n      } finally {\n        if (_d) throw _e;\n      }\n    }\n    return _arr;\n  }\n\n  export default function _slicedToArray(arr, i) {\n    if (Array.isArray(arr)) {\n      return arr;\n    } else if (Symbol.iterator in Object(arr)) {\n      return _sliceIterator(arr, i);\n    } else {\n      throw new TypeError(\"Invalid attempt to destructure non-iterable instance\");\n    }\n  }\n");
helpers.slicedToArrayLoose = defineHelper("\n  export default function _slicedToArrayLoose(arr, i) {\n    if (Array.isArray(arr)) {\n      return arr;\n    } else if (Symbol.iterator in Object(arr)) {\n      var _arr = [];\n      for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {\n        _arr.push(_step.value);\n        if (i && _arr.length === i) break;\n      }\n      return _arr;\n    } else {\n      throw new TypeError(\"Invalid attempt to destructure non-iterable instance\");\n    }\n  }\n");
helpers.taggedTemplateLiteral = defineHelper("\n  export default function _taggedTemplateLiteral(strings, raw) {\n    return Object.freeze(Object.defineProperties(strings, {\n        raw: { value: Object.freeze(raw) }\n    }));\n  }\n");
helpers.taggedTemplateLiteralLoose = defineHelper("\n  export default function _taggedTemplateLiteralLoose(strings, raw) {\n    strings.raw = raw;\n    return strings;\n  }\n");
helpers.temporalRef = defineHelper("\n  import undef from \"temporalUndefined\";\n\n  export default function _temporalRef(val, name) {\n    if (val === undef) {\n      throw new ReferenceError(name + \" is not defined - temporal dead zone\");\n    } else {\n      return val;\n    }\n  }\n");
helpers.readOnlyError = defineHelper("\n  export default function _readOnlyError(name) {\n    throw new Error(\"\\\"\" + name + \"\\\" is read-only\");\n  }\n");
helpers.classNameTDZError = defineHelper("\n  export default function _classNameTDZError(name) {\n    throw new Error(\"Class \\\"\" + name + \"\\\" cannot be referenced in computed property keys.\");\n  }\n");
helpers.temporalUndefined = defineHelper("\n  export default {};\n");
helpers.toArray = defineHelper("\n  export default function _toArray(arr) {\n    return Array.isArray(arr) ? arr : Array.from(arr);\n  }\n");
helpers.toConsumableArray = defineHelper("\n  export default function _toConsumableArray(arr) {\n    if (Array.isArray(arr)) {\n      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];\n      return arr2;\n    } else {\n      return Array.from(arr);\n    }\n  }\n");
helpers.skipFirstGeneratorNext = defineHelper("\n  export default function _skipFirstGeneratorNext(fn) {\n    return function () {\n      var it = fn.apply(this, arguments);\n      it.next();\n      return it;\n    }\n  }\n");
helpers.toPropertyKey = defineHelper("\n  export default function _toPropertyKey(key) {\n    if (typeof key === \"symbol\") {\n      return key;\n    } else {\n      return String(key);\n    }\n  }\n");