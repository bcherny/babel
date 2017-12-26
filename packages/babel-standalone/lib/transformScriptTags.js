"use strict";

exports.__esModule = true;
exports.runScripts = runScripts;
var scriptTypes = ["text/jsx", "text/babel"];
var headEl;
var inlineScriptCount = 0;

function transformCode(transformFn, script) {
  var source;

  if (script.url != null) {
    source = script.url;
  } else {
    source = "Inline Babel script";
    inlineScriptCount++;

    if (inlineScriptCount > 1) {
      source += " (" + inlineScriptCount + ")";
    }
  }

  return transformFn(script.content, Object.assign({
    filename: source
  }, buildBabelOptions(script))).code;
}

function buildBabelOptions(script) {
  return {
    presets: script.presets || ["react", "es2015"],
    plugins: script.plugins || ["proposal-class-properties", "proposal-object-rest-spread", "transform-flow-strip-types"],
    sourceMaps: "inline"
  };
}

function run(transformFn, script) {
  var scriptEl = document.createElement("script");
  scriptEl.text = transformCode(transformFn, script);
  headEl.appendChild(scriptEl);
}

function load(url, successCallback, errorCallback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);

  if ("overrideMimeType" in xhr) {
    xhr.overrideMimeType("text/plain");
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 0 || xhr.status === 200) {
        successCallback(xhr.responseText);
      } else {
        errorCallback();
        throw new Error("Could not load " + url);
      }
    }
  };

  return xhr.send(null);
}

function getPluginsOrPresetsFromScript(script, attributeName) {
  var rawValue = script.getAttribute(attributeName);

  if (rawValue === "") {
    return [];
  }

  if (!rawValue) {
    return null;
  }

  return rawValue.split(",").map(function (item) {
    return item.trim();
  });
}

function loadScripts(transformFn, scripts) {
  var result = [];
  var count = scripts.length;

  function check() {
    var script, i;

    for (i = 0; i < count; i++) {
      script = result[i];

      if (script.loaded && !script.executed) {
        script.executed = true;
        run(transformFn, script);
      } else if (!script.loaded && !script.error && !script.async) {
        break;
      }
    }
  }

  scripts.forEach(function (script, i) {
    var scriptData = {
      async: script.hasAttribute("async"),
      error: false,
      executed: false,
      plugins: getPluginsOrPresetsFromScript(script, "data-plugins"),
      presets: getPluginsOrPresetsFromScript(script, "data-presets")
    };

    if (script.src) {
      result[i] = Object.assign({}, scriptData, {
        content: null,
        loaded: false,
        url: script.src
      });
      load(script.src, function (content) {
        result[i].loaded = true;
        result[i].content = content;
        check();
      }, function () {
        result[i].error = true;
        check();
      });
    } else {
      result[i] = Object.assign({}, scriptData, {
        content: script.innerHTML,
        loaded: true,
        url: null
      });
    }
  });
  check();
}

function runScripts(transformFn, scripts) {
  headEl = document.getElementsByTagName("head")[0];

  if (!scripts) {
    scripts = document.getElementsByTagName("script");
  }

  var jsxScripts = [];

  for (var i = 0; i < scripts.length; i++) {
    var script = scripts.item(i);
    var type = script.type.split(";")[0];

    if (scriptTypes.indexOf(type) !== -1) {
      jsxScripts.push(script);
    }
  }

  if (jsxScripts.length === 0) {
    return;
  }

  console.warn("You are using the in-browser Babel transformer. Be sure to precompile " + "your scripts for production - https://babeljs.io/docs/setup/");
  loadScripts(transformFn, jsxScripts);
}