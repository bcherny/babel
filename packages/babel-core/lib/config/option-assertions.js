"use strict";

exports.__esModule = true;
exports.assertSourceMaps = assertSourceMaps;
exports.assertCompact = assertCompact;
exports.assertSourceType = assertSourceType;
exports.assertInputSourceMap = assertInputSourceMap;
exports.assertString = assertString;
exports.assertFunction = assertFunction;
exports.assertBoolean = assertBoolean;
exports.assertObject = assertObject;
exports.assertIgnoreList = assertIgnoreList;
exports.assertPluginList = assertPluginList;

function assertSourceMaps(key, value) {
  if (value !== undefined && typeof value !== "boolean" && value !== "inline" && value !== "both") {
    throw new Error("." + key + " must be a boolean, \"inline\", \"both\", or undefined");
  }

  return value;
}

function assertCompact(key, value) {
  if (value !== undefined && typeof value !== "boolean" && value !== "auto") {
    throw new Error("." + key + " must be a boolean, \"auto\", or undefined");
  }

  return value;
}

function assertSourceType(key, value) {
  if (value !== undefined && value !== "module" && value !== "script" && value !== "unambiguous") {
    throw new Error("." + key + " must be \"module\", \"script\", \"unambiguous\", or undefined");
  }

  return value;
}

function assertInputSourceMap(key, value) {
  if (value !== undefined && typeof value !== "boolean" && (typeof value !== "object" || !value)) {
    throw new Error(".inputSourceMap must be a boolean, object, or undefined");
  }

  return value;
}

function assertString(key, value) {
  if (value !== undefined && typeof value !== "string") {
    throw new Error("." + key + " must be a string, or undefined");
  }

  return value;
}

function assertFunction(key, value) {
  if (value !== undefined && typeof value !== "function") {
    throw new Error("." + key + " must be a function, or undefined");
  }

  return value;
}

function assertBoolean(key, value) {
  if (value !== undefined && typeof value !== "boolean") {
    throw new Error("." + key + " must be a boolean, or undefined");
  }

  return value;
}

function assertObject(key, value) {
  if (value !== undefined && (typeof value !== "object" || Array.isArray(value) || !value)) {
    throw new Error("." + key + " must be an object, or undefined");
  }

  return value;
}

function assertIgnoreList(key, value) {
  var arr = assertArray(key, value);

  if (arr) {
    arr.forEach(function (item, i) {
      return assertIgnoreItem(key, i, item);
    });
  }

  return arr;
}

function assertIgnoreItem(key, index, value) {
  if (typeof value !== "string" && typeof value !== "function" && !(value instanceof RegExp)) {
    throw new Error("." + key + "[" + index + "] must be an array of string/Funtion/RegExp values, or or undefined");
  }

  return value;
}

function assertPluginList(key, value) {
  var arr = assertArray(key, value);

  if (arr) {
    arr.forEach(function (item, i) {
      return assertPluginItem(key, i, item);
    });
  }

  return arr;
}

function assertPluginItem(key, index, value) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      throw new Error("." + key + "[" + index + "] must include an object");
    }

    if (value.length > 3) {
      throw new Error("." + key + "[" + index + "] may only be a two-tuple or three-tuple");
    }

    assertPluginTarget(key, index, true, value[0]);

    if (value.length > 1) {
      var opts = value[1];

      if (opts !== undefined && opts !== false && (typeof opts !== "object" || Array.isArray(opts))) {
        throw new Error("." + key + "[" + index + "][1] must be an object, false, or undefined");
      }
    }

    if (value.length === 3) {
      var name = value[2];

      if (name !== undefined && typeof name !== "string") {
        throw new Error("." + key + "[" + index + "][2] must be a string, or undefined");
      }
    }
  } else {
    assertPluginTarget(key, index, false, value);
  }

  return value;
}

function assertPluginTarget(key, index, inArray, value) {
  if ((typeof value !== "object" || !value) && typeof value !== "string" && typeof value !== "function") {
    throw new Error("." + key + "[" + index + "]" + (inArray ? "[0]" : "") + " must be a string, object, function");
  }

  return value;
}

function assertArray(key, value) {
  if (value != null && !Array.isArray(value)) {
    throw new Error("." + key + " must be an array, or undefined");
  }

  return value;
}