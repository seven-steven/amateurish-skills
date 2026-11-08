var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x3) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x3, {
  get: (a3, b) => (typeof require !== "undefined" ? require : a3)[b]
}) : x3)(function(x3) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x3 + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/js-yaml/lib/js-yaml/common.js
var require_common = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/common.js"(exports, module) {
    "use strict";
    function isNothing(subject) {
      return typeof subject === "undefined" || subject === null;
    }
    function isObject(subject) {
      return typeof subject === "object" && subject !== null;
    }
    function toArray(sequence) {
      if (Array.isArray(sequence)) return sequence;
      else if (isNothing(sequence)) return [];
      return [sequence];
    }
    function extend(target, source2) {
      var index, length, key, sourceKeys;
      if (source2) {
        sourceKeys = Object.keys(source2);
        for (index = 0, length = sourceKeys.length; index < length; index += 1) {
          key = sourceKeys[index];
          target[key] = source2[key];
        }
      }
      return target;
    }
    function repeat(string, count) {
      var result = "", cycle;
      for (cycle = 0; cycle < count; cycle += 1) {
        result += string;
      }
      return result;
    }
    function isNegativeZero(number) {
      return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
    }
    module.exports.isNothing = isNothing;
    module.exports.isObject = isObject;
    module.exports.toArray = toArray;
    module.exports.repeat = repeat;
    module.exports.isNegativeZero = isNegativeZero;
    module.exports.extend = extend;
  }
});

// node_modules/js-yaml/lib/js-yaml/exception.js
var require_exception = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/exception.js"(exports, module) {
    "use strict";
    function YAMLException(reason, mark) {
      Error.call(this);
      this.name = "YAMLException";
      this.reason = reason;
      this.mark = mark;
      this.message = (this.reason || "(unknown reason)") + (this.mark ? " " + this.mark.toString() : "");
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = new Error().stack || "";
      }
    }
    YAMLException.prototype = Object.create(Error.prototype);
    YAMLException.prototype.constructor = YAMLException;
    YAMLException.prototype.toString = function toString(compact) {
      var result = this.name + ": ";
      result += this.reason || "(unknown reason)";
      if (!compact && this.mark) {
        result += " " + this.mark.toString();
      }
      return result;
    };
    module.exports = YAMLException;
  }
});

// node_modules/js-yaml/lib/js-yaml/mark.js
var require_mark = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/mark.js"(exports, module) {
    "use strict";
    var common = require_common();
    function Mark(name, buffer, position, line, column) {
      this.name = name;
      this.buffer = buffer;
      this.position = position;
      this.line = line;
      this.column = column;
    }
    Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
      var head, start, tail, end, snippet;
      if (!this.buffer) return null;
      indent = indent || 4;
      maxLength = maxLength || 75;
      head = "";
      start = this.position;
      while (start > 0 && "\0\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(start - 1)) === -1) {
        start -= 1;
        if (this.position - start > maxLength / 2 - 1) {
          head = " ... ";
          start += 5;
          break;
        }
      }
      tail = "";
      end = this.position;
      while (end < this.buffer.length && "\0\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(end)) === -1) {
        end += 1;
        if (end - this.position > maxLength / 2 - 1) {
          tail = " ... ";
          end -= 5;
          break;
        }
      }
      snippet = this.buffer.slice(start, end);
      return common.repeat(" ", indent) + head + snippet + tail + "\n" + common.repeat(" ", indent + this.position - start + head.length) + "^";
    };
    Mark.prototype.toString = function toString(compact) {
      var snippet, where = "";
      if (this.name) {
        where += 'in "' + this.name + '" ';
      }
      where += "at line " + (this.line + 1) + ", column " + (this.column + 1);
      if (!compact) {
        snippet = this.getSnippet();
        if (snippet) {
          where += ":\n" + snippet;
        }
      }
      return where;
    };
    module.exports = Mark;
  }
});

// node_modules/js-yaml/lib/js-yaml/type.js
var require_type = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type.js"(exports, module) {
    "use strict";
    var YAMLException = require_exception();
    var TYPE_CONSTRUCTOR_OPTIONS = [
      "kind",
      "resolve",
      "construct",
      "instanceOf",
      "predicate",
      "represent",
      "defaultStyle",
      "styleAliases"
    ];
    var YAML_NODE_KINDS = [
      "scalar",
      "sequence",
      "mapping"
    ];
    function compileStyleAliases(map) {
      var result = {};
      if (map !== null) {
        Object.keys(map).forEach(function(style) {
          map[style].forEach(function(alias) {
            result[String(alias)] = style;
          });
        });
      }
      return result;
    }
    function Type(tag, options) {
      options = options || {};
      Object.keys(options).forEach(function(name) {
        if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
          throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
        }
      });
      this.tag = tag;
      this.kind = options["kind"] || null;
      this.resolve = options["resolve"] || function() {
        return true;
      };
      this.construct = options["construct"] || function(data) {
        return data;
      };
      this.instanceOf = options["instanceOf"] || null;
      this.predicate = options["predicate"] || null;
      this.represent = options["represent"] || null;
      this.defaultStyle = options["defaultStyle"] || null;
      this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
      if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
        throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
      }
    }
    module.exports = Type;
  }
});

// node_modules/js-yaml/lib/js-yaml/schema.js
var require_schema = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/schema.js"(exports, module) {
    "use strict";
    var common = require_common();
    var YAMLException = require_exception();
    var Type = require_type();
    function compileList(schema, name, result) {
      var exclude = [];
      schema.include.forEach(function(includedSchema) {
        result = compileList(includedSchema, name, result);
      });
      schema[name].forEach(function(currentType) {
        result.forEach(function(previousType, previousIndex) {
          if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
            exclude.push(previousIndex);
          }
        });
        result.push(currentType);
      });
      return result.filter(function(type, index) {
        return exclude.indexOf(index) === -1;
      });
    }
    function compileMap() {
      var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {}
      }, index, length;
      function collectType(type) {
        result[type.kind][type.tag] = result["fallback"][type.tag] = type;
      }
      for (index = 0, length = arguments.length; index < length; index += 1) {
        arguments[index].forEach(collectType);
      }
      return result;
    }
    function Schema(definition) {
      this.include = definition.include || [];
      this.implicit = definition.implicit || [];
      this.explicit = definition.explicit || [];
      this.implicit.forEach(function(type) {
        if (type.loadKind && type.loadKind !== "scalar") {
          throw new YAMLException("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
        }
      });
      this.compiledImplicit = compileList(this, "implicit", []);
      this.compiledExplicit = compileList(this, "explicit", []);
      this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
    }
    Schema.DEFAULT = null;
    Schema.create = function createSchema() {
      var schemas, types;
      switch (arguments.length) {
        case 1:
          schemas = Schema.DEFAULT;
          types = arguments[0];
          break;
        case 2:
          schemas = arguments[0];
          types = arguments[1];
          break;
        default:
          throw new YAMLException("Wrong number of arguments for Schema.create function");
      }
      schemas = common.toArray(schemas);
      types = common.toArray(types);
      if (!schemas.every(function(schema) {
        return schema instanceof Schema;
      })) {
        throw new YAMLException("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");
      }
      if (!types.every(function(type) {
        return type instanceof Type;
      })) {
        throw new YAMLException("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      }
      return new Schema({
        include: schemas,
        explicit: types
      });
    };
    module.exports = Schema;
  }
});

// node_modules/js-yaml/lib/js-yaml/type/str.js
var require_str = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/str.js"(exports, module) {
    "use strict";
    var Type = require_type();
    module.exports = new Type("tag:yaml.org,2002:str", {
      kind: "scalar",
      construct: function(data) {
        return data !== null ? data : "";
      }
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/seq.js
var require_seq = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/seq.js"(exports, module) {
    "use strict";
    var Type = require_type();
    module.exports = new Type("tag:yaml.org,2002:seq", {
      kind: "sequence",
      construct: function(data) {
        return data !== null ? data : [];
      }
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/map.js
var require_map = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/map.js"(exports, module) {
    "use strict";
    var Type = require_type();
    module.exports = new Type("tag:yaml.org,2002:map", {
      kind: "mapping",
      construct: function(data) {
        return data !== null ? data : {};
      }
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/schema/failsafe.js
var require_failsafe = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/schema/failsafe.js"(exports, module) {
    "use strict";
    var Schema = require_schema();
    module.exports = new Schema({
      explicit: [
        require_str(),
        require_seq(),
        require_map()
      ]
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/null.js
var require_null = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/null.js"(exports, module) {
    "use strict";
    var Type = require_type();
    function resolveYamlNull(data) {
      if (data === null) return true;
      var max = data.length;
      return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
    }
    function constructYamlNull() {
      return null;
    }
    function isNull(object) {
      return object === null;
    }
    module.exports = new Type("tag:yaml.org,2002:null", {
      kind: "scalar",
      resolve: resolveYamlNull,
      construct: constructYamlNull,
      predicate: isNull,
      represent: {
        canonical: function() {
          return "~";
        },
        lowercase: function() {
          return "null";
        },
        uppercase: function() {
          return "NULL";
        },
        camelcase: function() {
          return "Null";
        }
      },
      defaultStyle: "lowercase"
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/bool.js
var require_bool = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/bool.js"(exports, module) {
    "use strict";
    var Type = require_type();
    function resolveYamlBoolean(data) {
      if (data === null) return false;
      var max = data.length;
      return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
    }
    function constructYamlBoolean(data) {
      return data === "true" || data === "True" || data === "TRUE";
    }
    function isBoolean(object) {
      return Object.prototype.toString.call(object) === "[object Boolean]";
    }
    module.exports = new Type("tag:yaml.org,2002:bool", {
      kind: "scalar",
      resolve: resolveYamlBoolean,
      construct: constructYamlBoolean,
      predicate: isBoolean,
      represent: {
        lowercase: function(object) {
          return object ? "true" : "false";
        },
        uppercase: function(object) {
          return object ? "TRUE" : "FALSE";
        },
        camelcase: function(object) {
          return object ? "True" : "False";
        }
      },
      defaultStyle: "lowercase"
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/int.js
var require_int = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/int.js"(exports, module) {
    "use strict";
    var common = require_common();
    var Type = require_type();
    function isHexCode(c3) {
      return 48 <= c3 && c3 <= 57 || 65 <= c3 && c3 <= 70 || 97 <= c3 && c3 <= 102;
    }
    function isOctCode(c3) {
      return 48 <= c3 && c3 <= 55;
    }
    function isDecCode(c3) {
      return 48 <= c3 && c3 <= 57;
    }
    function resolveYamlInteger(data) {
      if (data === null) return false;
      var max = data.length, index = 0, hasDigits = false, ch;
      if (!max) return false;
      ch = data[index];
      if (ch === "-" || ch === "+") {
        ch = data[++index];
      }
      if (ch === "0") {
        if (index + 1 === max) return true;
        ch = data[++index];
        if (ch === "b") {
          index++;
          for (; index < max; index++) {
            ch = data[index];
            if (ch === "_") continue;
            if (ch !== "0" && ch !== "1") return false;
            hasDigits = true;
          }
          return hasDigits && ch !== "_";
        }
        if (ch === "x") {
          index++;
          for (; index < max; index++) {
            ch = data[index];
            if (ch === "_") continue;
            if (!isHexCode(data.charCodeAt(index))) return false;
            hasDigits = true;
          }
          return hasDigits && ch !== "_";
        }
        for (; index < max; index++) {
          ch = data[index];
          if (ch === "_") continue;
          if (!isOctCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && ch !== "_";
      }
      if (ch === "_") return false;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch === ":") break;
        if (!isDecCode(data.charCodeAt(index))) {
          return false;
        }
        hasDigits = true;
      }
      if (!hasDigits || ch === "_") return false;
      if (ch !== ":") return true;
      return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
    }
    function constructYamlInteger(data) {
      var value = data, sign = 1, ch, base, digits = [];
      if (value.indexOf("_") !== -1) {
        value = value.replace(/_/g, "");
      }
      ch = value[0];
      if (ch === "-" || ch === "+") {
        if (ch === "-") sign = -1;
        value = value.slice(1);
        ch = value[0];
      }
      if (value === "0") return 0;
      if (ch === "0") {
        if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
        if (value[1] === "x") return sign * parseInt(value, 16);
        return sign * parseInt(value, 8);
      }
      if (value.indexOf(":") !== -1) {
        value.split(":").forEach(function(v) {
          digits.unshift(parseInt(v, 10));
        });
        value = 0;
        base = 1;
        digits.forEach(function(d) {
          value += d * base;
          base *= 60;
        });
        return sign * value;
      }
      return sign * parseInt(value, 10);
    }
    function isInteger(object) {
      return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
    }
    module.exports = new Type("tag:yaml.org,2002:int", {
      kind: "scalar",
      resolve: resolveYamlInteger,
      construct: constructYamlInteger,
      predicate: isInteger,
      represent: {
        binary: function(obj) {
          return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
        },
        octal: function(obj) {
          return obj >= 0 ? "0" + obj.toString(8) : "-0" + obj.toString(8).slice(1);
        },
        decimal: function(obj) {
          return obj.toString(10);
        },
        /* eslint-disable max-len */
        hexadecimal: function(obj) {
          return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
        }
      },
      defaultStyle: "decimal",
      styleAliases: {
        binary: [2, "bin"],
        octal: [8, "oct"],
        decimal: [10, "dec"],
        hexadecimal: [16, "hex"]
      }
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/float.js
var require_float = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/float.js"(exports, module) {
    "use strict";
    var common = require_common();
    var Type = require_type();
    var YAML_FLOAT_PATTERN = new RegExp(
      // 2.5e4, 2.5 and integers
      "^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
    );
    function resolveYamlFloat(data) {
      if (data === null) return false;
      if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === "_") {
        return false;
      }
      return true;
    }
    function constructYamlFloat(data) {
      var value, sign, base, digits;
      value = data.replace(/_/g, "").toLowerCase();
      sign = value[0] === "-" ? -1 : 1;
      digits = [];
      if ("+-".indexOf(value[0]) >= 0) {
        value = value.slice(1);
      }
      if (value === ".inf") {
        return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      } else if (value === ".nan") {
        return NaN;
      } else if (value.indexOf(":") >= 0) {
        value.split(":").forEach(function(v) {
          digits.unshift(parseFloat(v, 10));
        });
        value = 0;
        base = 1;
        digits.forEach(function(d) {
          value += d * base;
          base *= 60;
        });
        return sign * value;
      }
      return sign * parseFloat(value, 10);
    }
    var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
    function representYamlFloat(object, style) {
      var res;
      if (isNaN(object)) {
        switch (style) {
          case "lowercase":
            return ".nan";
          case "uppercase":
            return ".NAN";
          case "camelcase":
            return ".NaN";
        }
      } else if (Number.POSITIVE_INFINITY === object) {
        switch (style) {
          case "lowercase":
            return ".inf";
          case "uppercase":
            return ".INF";
          case "camelcase":
            return ".Inf";
        }
      } else if (Number.NEGATIVE_INFINITY === object) {
        switch (style) {
          case "lowercase":
            return "-.inf";
          case "uppercase":
            return "-.INF";
          case "camelcase":
            return "-.Inf";
        }
      } else if (common.isNegativeZero(object)) {
        return "-0.0";
      }
      res = object.toString(10);
      return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
    }
    function isFloat(object) {
      return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
    }
    module.exports = new Type("tag:yaml.org,2002:float", {
      kind: "scalar",
      resolve: resolveYamlFloat,
      construct: constructYamlFloat,
      predicate: isFloat,
      represent: representYamlFloat,
      defaultStyle: "lowercase"
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/schema/json.js
var require_json = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/schema/json.js"(exports, module) {
    "use strict";
    var Schema = require_schema();
    module.exports = new Schema({
      include: [
        require_failsafe()
      ],
      implicit: [
        require_null(),
        require_bool(),
        require_int(),
        require_float()
      ]
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/schema/core.js
var require_core = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/schema/core.js"(exports, module) {
    "use strict";
    var Schema = require_schema();
    module.exports = new Schema({
      include: [
        require_json()
      ]
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/timestamp.js"(exports, module) {
    "use strict";
    var Type = require_type();
    var YAML_DATE_REGEXP = new RegExp(
      "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
    );
    var YAML_TIMESTAMP_REGEXP = new RegExp(
      "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
    );
    function resolveYamlTimestamp(data) {
      if (data === null) return false;
      if (YAML_DATE_REGEXP.exec(data) !== null) return true;
      if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
      return false;
    }
    function constructYamlTimestamp(data) {
      var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
      match = YAML_DATE_REGEXP.exec(data);
      if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
      if (match === null) throw new Error("Date resolve error");
      year = +match[1];
      month = +match[2] - 1;
      day = +match[3];
      if (!match[4]) {
        return new Date(Date.UTC(year, month, day));
      }
      hour = +match[4];
      minute = +match[5];
      second = +match[6];
      if (match[7]) {
        fraction = match[7].slice(0, 3);
        while (fraction.length < 3) {
          fraction += "0";
        }
        fraction = +fraction;
      }
      if (match[9]) {
        tz_hour = +match[10];
        tz_minute = +(match[11] || 0);
        delta = (tz_hour * 60 + tz_minute) * 6e4;
        if (match[9] === "-") delta = -delta;
      }
      date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
      if (delta) date.setTime(date.getTime() - delta);
      return date;
    }
    function representYamlTimestamp(object) {
      return object.toISOString();
    }
    module.exports = new Type("tag:yaml.org,2002:timestamp", {
      kind: "scalar",
      resolve: resolveYamlTimestamp,
      construct: constructYamlTimestamp,
      instanceOf: Date,
      represent: representYamlTimestamp
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/merge.js
var require_merge = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/merge.js"(exports, module) {
    "use strict";
    var Type = require_type();
    function resolveYamlMerge(data) {
      return data === "<<" || data === null;
    }
    module.exports = new Type("tag:yaml.org,2002:merge", {
      kind: "scalar",
      resolve: resolveYamlMerge
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/binary.js
var require_binary = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/binary.js"(exports, module) {
    "use strict";
    var NodeBuffer;
    try {
      _require = __require;
      NodeBuffer = _require("buffer").Buffer;
    } catch (__) {
    }
    var _require;
    var Type = require_type();
    var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
    function resolveYamlBinary(data) {
      if (data === null) return false;
      var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;
      for (idx = 0; idx < max; idx++) {
        code = map.indexOf(data.charAt(idx));
        if (code > 64) continue;
        if (code < 0) return false;
        bitlen += 6;
      }
      return bitlen % 8 === 0;
    }
    function constructYamlBinary(data) {
      var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map = BASE64_MAP, bits = 0, result = [];
      for (idx = 0; idx < max; idx++) {
        if (idx % 4 === 0 && idx) {
          result.push(bits >> 16 & 255);
          result.push(bits >> 8 & 255);
          result.push(bits & 255);
        }
        bits = bits << 6 | map.indexOf(input.charAt(idx));
      }
      tailbits = max % 4 * 6;
      if (tailbits === 0) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
      } else if (tailbits === 18) {
        result.push(bits >> 10 & 255);
        result.push(bits >> 2 & 255);
      } else if (tailbits === 12) {
        result.push(bits >> 4 & 255);
      }
      if (NodeBuffer) {
        return NodeBuffer.from ? NodeBuffer.from(result) : new NodeBuffer(result);
      }
      return result;
    }
    function representYamlBinary(object) {
      var result = "", bits = 0, idx, tail, max = object.length, map = BASE64_MAP;
      for (idx = 0; idx < max; idx++) {
        if (idx % 3 === 0 && idx) {
          result += map[bits >> 18 & 63];
          result += map[bits >> 12 & 63];
          result += map[bits >> 6 & 63];
          result += map[bits & 63];
        }
        bits = (bits << 8) + object[idx];
      }
      tail = max % 3;
      if (tail === 0) {
        result += map[bits >> 18 & 63];
        result += map[bits >> 12 & 63];
        result += map[bits >> 6 & 63];
        result += map[bits & 63];
      } else if (tail === 2) {
        result += map[bits >> 10 & 63];
        result += map[bits >> 4 & 63];
        result += map[bits << 2 & 63];
        result += map[64];
      } else if (tail === 1) {
        result += map[bits >> 2 & 63];
        result += map[bits << 4 & 63];
        result += map[64];
        result += map[64];
      }
      return result;
    }
    function isBinary(object) {
      return NodeBuffer && NodeBuffer.isBuffer(object);
    }
    module.exports = new Type("tag:yaml.org,2002:binary", {
      kind: "scalar",
      resolve: resolveYamlBinary,
      construct: constructYamlBinary,
      predicate: isBinary,
      represent: representYamlBinary
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/omap.js
var require_omap = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/omap.js"(exports, module) {
    "use strict";
    var Type = require_type();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var _toString = Object.prototype.toString;
    function resolveYamlOmap(data) {
      if (data === null) return true;
      var objectKeys = {}, index, length, pair, pairKey, pairHasKey, object = data;
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        pairHasKey = false;
        if (_toString.call(pair) !== "[object Object]") return false;
        for (pairKey in pair) {
          if (_hasOwnProperty.call(pair, pairKey)) {
            if (!pairHasKey) pairHasKey = true;
            else return false;
          }
        }
        if (!pairHasKey) return false;
        if (_hasOwnProperty.call(objectKeys, pairKey)) return false;
        Object.defineProperty(objectKeys, pairKey, { value: true });
      }
      return true;
    }
    function constructYamlOmap(data) {
      return data !== null ? data : [];
    }
    module.exports = new Type("tag:yaml.org,2002:omap", {
      kind: "sequence",
      resolve: resolveYamlOmap,
      construct: constructYamlOmap
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/pairs.js
var require_pairs = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/pairs.js"(exports, module) {
    "use strict";
    var Type = require_type();
    var _toString = Object.prototype.toString;
    function resolveYamlPairs(data) {
      if (data === null) return true;
      var index, length, pair, keys, result, object = data;
      result = new Array(object.length);
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        if (_toString.call(pair) !== "[object Object]") return false;
        keys = Object.keys(pair);
        if (keys.length !== 1) return false;
        result[index] = [keys[0], pair[keys[0]]];
      }
      return true;
    }
    function constructYamlPairs(data) {
      if (data === null) return [];
      var index, length, pair, keys, result, object = data;
      result = new Array(object.length);
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        keys = Object.keys(pair);
        result[index] = [keys[0], pair[keys[0]]];
      }
      return result;
    }
    module.exports = new Type("tag:yaml.org,2002:pairs", {
      kind: "sequence",
      resolve: resolveYamlPairs,
      construct: constructYamlPairs
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/set.js
var require_set = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/set.js"(exports, module) {
    "use strict";
    var Type = require_type();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    function resolveYamlSet(data) {
      if (data === null) return true;
      var key, object = data;
      for (key in object) {
        if (_hasOwnProperty.call(object, key)) {
          if (object[key] !== null) return false;
        }
      }
      return true;
    }
    function constructYamlSet(data) {
      return data !== null ? data : {};
    }
    module.exports = new Type("tag:yaml.org,2002:set", {
      kind: "mapping",
      resolve: resolveYamlSet,
      construct: constructYamlSet
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/schema/default_safe.js
var require_default_safe = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/schema/default_safe.js"(exports, module) {
    "use strict";
    var Schema = require_schema();
    module.exports = new Schema({
      include: [
        require_core()
      ],
      implicit: [
        require_timestamp(),
        require_merge()
      ],
      explicit: [
        require_binary(),
        require_omap(),
        require_pairs(),
        require_set()
      ]
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/js/undefined.js
var require_undefined = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/js/undefined.js"(exports, module) {
    "use strict";
    var Type = require_type();
    function resolveJavascriptUndefined() {
      return true;
    }
    function constructJavascriptUndefined() {
      return void 0;
    }
    function representJavascriptUndefined() {
      return "";
    }
    function isUndefined(object) {
      return typeof object === "undefined";
    }
    module.exports = new Type("tag:yaml.org,2002:js/undefined", {
      kind: "scalar",
      resolve: resolveJavascriptUndefined,
      construct: constructJavascriptUndefined,
      predicate: isUndefined,
      represent: representJavascriptUndefined
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/js/regexp.js
var require_regexp = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/js/regexp.js"(exports, module) {
    "use strict";
    var Type = require_type();
    function resolveJavascriptRegExp(data) {
      if (data === null) return false;
      if (data.length === 0) return false;
      var regexp = data, tail = /\/([gim]*)$/.exec(data), modifiers = "";
      if (regexp[0] === "/") {
        if (tail) modifiers = tail[1];
        if (modifiers.length > 3) return false;
        if (regexp[regexp.length - modifiers.length - 1] !== "/") return false;
      }
      return true;
    }
    function constructJavascriptRegExp(data) {
      var regexp = data, tail = /\/([gim]*)$/.exec(data), modifiers = "";
      if (regexp[0] === "/") {
        if (tail) modifiers = tail[1];
        regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
      }
      return new RegExp(regexp, modifiers);
    }
    function representJavascriptRegExp(object) {
      var result = "/" + object.source + "/";
      if (object.global) result += "g";
      if (object.multiline) result += "m";
      if (object.ignoreCase) result += "i";
      return result;
    }
    function isRegExp(object) {
      return Object.prototype.toString.call(object) === "[object RegExp]";
    }
    module.exports = new Type("tag:yaml.org,2002:js/regexp", {
      kind: "scalar",
      resolve: resolveJavascriptRegExp,
      construct: constructJavascriptRegExp,
      predicate: isRegExp,
      represent: representJavascriptRegExp
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/type/js/function.js
var require_function = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/type/js/function.js"(exports, module) {
    "use strict";
    var esprima;
    try {
      _require = __require;
      esprima = _require("esprima");
    } catch (_2) {
      if (typeof window !== "undefined") esprima = window.esprima;
    }
    var _require;
    var Type = require_type();
    function resolveJavascriptFunction(data) {
      if (data === null) return false;
      try {
        var source2 = "(" + data + ")", ast = esprima.parse(source2, { range: true });
        if (ast.type !== "Program" || ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement" || ast.body[0].expression.type !== "ArrowFunctionExpression" && ast.body[0].expression.type !== "FunctionExpression") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    function constructJavascriptFunction(data) {
      var source2 = "(" + data + ")", ast = esprima.parse(source2, { range: true }), params = [], body;
      if (ast.type !== "Program" || ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement" || ast.body[0].expression.type !== "ArrowFunctionExpression" && ast.body[0].expression.type !== "FunctionExpression") {
        throw new Error("Failed to resolve function");
      }
      ast.body[0].expression.params.forEach(function(param) {
        params.push(param.name);
      });
      body = ast.body[0].expression.body.range;
      if (ast.body[0].expression.body.type === "BlockStatement") {
        return new Function(params, source2.slice(body[0] + 1, body[1] - 1));
      }
      return new Function(params, "return " + source2.slice(body[0], body[1]));
    }
    function representJavascriptFunction(object) {
      return object.toString();
    }
    function isFunction(object) {
      return Object.prototype.toString.call(object) === "[object Function]";
    }
    module.exports = new Type("tag:yaml.org,2002:js/function", {
      kind: "scalar",
      resolve: resolveJavascriptFunction,
      construct: constructJavascriptFunction,
      predicate: isFunction,
      represent: representJavascriptFunction
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/schema/default_full.js
var require_default_full = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/schema/default_full.js"(exports, module) {
    "use strict";
    var Schema = require_schema();
    module.exports = Schema.DEFAULT = new Schema({
      include: [
        require_default_safe()
      ],
      explicit: [
        require_undefined(),
        require_regexp(),
        require_function()
      ]
    });
  }
});

// node_modules/js-yaml/lib/js-yaml/loader.js
var require_loader = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/loader.js"(exports, module) {
    "use strict";
    var common = require_common();
    var YAMLException = require_exception();
    var Mark = require_mark();
    var DEFAULT_SAFE_SCHEMA = require_default_safe();
    var DEFAULT_FULL_SCHEMA = require_default_full();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var CONTEXT_FLOW_IN = 1;
    var CONTEXT_FLOW_OUT = 2;
    var CONTEXT_BLOCK_IN = 3;
    var CONTEXT_BLOCK_OUT = 4;
    var CHOMPING_CLIP = 1;
    var CHOMPING_STRIP = 2;
    var CHOMPING_KEEP = 3;
    var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
    var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
    var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
    var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
    var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
    function _class(obj) {
      return Object.prototype.toString.call(obj);
    }
    function is_EOL(c3) {
      return c3 === 10 || c3 === 13;
    }
    function is_WHITE_SPACE(c3) {
      return c3 === 9 || c3 === 32;
    }
    function is_WS_OR_EOL(c3) {
      return c3 === 9 || c3 === 32 || c3 === 10 || c3 === 13;
    }
    function is_FLOW_INDICATOR(c3) {
      return c3 === 44 || c3 === 91 || c3 === 93 || c3 === 123 || c3 === 125;
    }
    function fromHexCode(c3) {
      var lc2;
      if (48 <= c3 && c3 <= 57) {
        return c3 - 48;
      }
      lc2 = c3 | 32;
      if (97 <= lc2 && lc2 <= 102) {
        return lc2 - 97 + 10;
      }
      return -1;
    }
    function escapedHexLen(c3) {
      if (c3 === 120) {
        return 2;
      }
      if (c3 === 117) {
        return 4;
      }
      if (c3 === 85) {
        return 8;
      }
      return 0;
    }
    function fromDecimalCode(c3) {
      if (48 <= c3 && c3 <= 57) {
        return c3 - 48;
      }
      return -1;
    }
    function simpleEscapeSequence(c3) {
      return c3 === 48 ? "\0" : c3 === 97 ? "\x07" : c3 === 98 ? "\b" : c3 === 116 ? "	" : c3 === 9 ? "	" : c3 === 110 ? "\n" : c3 === 118 ? "\v" : c3 === 102 ? "\f" : c3 === 114 ? "\r" : c3 === 101 ? "\x1B" : c3 === 32 ? " " : c3 === 34 ? '"' : c3 === 47 ? "/" : c3 === 92 ? "\\" : c3 === 78 ? "\x85" : c3 === 95 ? "\xA0" : c3 === 76 ? "\u2028" : c3 === 80 ? "\u2029" : "";
    }
    function charFromCodepoint(c3) {
      if (c3 <= 65535) {
        return String.fromCharCode(c3);
      }
      return String.fromCharCode(
        (c3 - 65536 >> 10) + 55296,
        (c3 - 65536 & 1023) + 56320
      );
    }
    function setProperty(object, key, value) {
      if (key === "__proto__") {
        Object.defineProperty(object, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value
        });
      } else {
        object[key] = value;
      }
    }
    var simpleEscapeCheck = new Array(256);
    var simpleEscapeMap = new Array(256);
    for (i2 = 0; i2 < 256; i2++) {
      simpleEscapeCheck[i2] = simpleEscapeSequence(i2) ? 1 : 0;
      simpleEscapeMap[i2] = simpleEscapeSequence(i2);
    }
    var i2;
    function State(input, options) {
      this.input = input;
      this.filename = options["filename"] || null;
      this.schema = options["schema"] || DEFAULT_FULL_SCHEMA;
      this.onWarning = options["onWarning"] || null;
      this.legacy = options["legacy"] || false;
      this.json = options["json"] || false;
      this.listener = options["listener"] || null;
      this.maxTotalMergeKeys = typeof options["maxTotalMergeKeys"] === "number" ? options["maxTotalMergeKeys"] : 1e4;
      this.implicitTypes = this.schema.compiledImplicit;
      this.typeMap = this.schema.compiledTypeMap;
      this.length = input.length;
      this.position = 0;
      this.line = 0;
      this.lineStart = 0;
      this.lineIndent = 0;
      this.totalMergeKeys = 0;
      this.documents = [];
    }
    function generateError(state, message) {
      return new YAMLException(
        message,
        new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart)
      );
    }
    function throwError(state, message) {
      throw generateError(state, message);
    }
    function throwWarning(state, message) {
      if (state.onWarning) {
        state.onWarning.call(null, generateError(state, message));
      }
    }
    var directiveHandlers = {
      YAML: function handleYamlDirective(state, name, args) {
        var match, major, minor;
        if (state.version !== null) {
          throwError(state, "duplication of %YAML directive");
        }
        if (args.length !== 1) {
          throwError(state, "YAML directive accepts exactly one argument");
        }
        match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
        if (match === null) {
          throwError(state, "ill-formed argument of the YAML directive");
        }
        major = parseInt(match[1], 10);
        minor = parseInt(match[2], 10);
        if (major !== 1) {
          throwError(state, "unacceptable YAML version of the document");
        }
        state.version = args[0];
        state.checkLineBreaks = minor < 2;
        if (minor !== 1 && minor !== 2) {
          throwWarning(state, "unsupported YAML version of the document");
        }
      },
      TAG: function handleTagDirective(state, name, args) {
        var handle, prefix;
        if (args.length !== 2) {
          throwError(state, "TAG directive accepts exactly two arguments");
        }
        handle = args[0];
        prefix = args[1];
        if (!PATTERN_TAG_HANDLE.test(handle)) {
          throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
        }
        if (_hasOwnProperty.call(state.tagMap, handle)) {
          throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
        }
        if (!PATTERN_TAG_URI.test(prefix)) {
          throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
        }
        state.tagMap[handle] = prefix;
      }
    };
    function captureSegment(state, start, end, checkJson) {
      var _position, _length, _character, _result;
      if (start < end) {
        _result = state.input.slice(start, end);
        if (checkJson) {
          for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
            _character = _result.charCodeAt(_position);
            if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
              throwError(state, "expected valid JSON character");
            }
          }
        } else if (PATTERN_NON_PRINTABLE.test(_result)) {
          throwError(state, "the stream contains non-printable characters");
        }
        state.result += _result;
      }
    }
    function chargeMergeWork(state) {
      state.totalMergeKeys += 1;
      if (state.maxTotalMergeKeys !== -1 && state.totalMergeKeys > state.maxTotalMergeKeys) {
        throwError(state, "merge keys exceeded maxTotalMergeKeys (" + state.maxTotalMergeKeys + ")");
      }
    }
    function mergeMappings(state, destination, source2, overridableKeys) {
      var sourceKeys, key, index, quantity;
      if (!common.isObject(source2)) {
        throwError(state, "cannot merge mappings; the provided source object is unacceptable");
      }
      chargeMergeWork(state);
      sourceKeys = Object.keys(source2);
      for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
        key = sourceKeys[index];
        chargeMergeWork(state);
        if (!_hasOwnProperty.call(destination, key)) {
          setProperty(destination, key, source2[key]);
          overridableKeys[key] = true;
        }
      }
    }
    function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
      var index, quantity;
      if (Array.isArray(keyNode)) {
        keyNode = Array.prototype.slice.call(keyNode);
        for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
          if (Array.isArray(keyNode[index])) {
            throwError(state, "nested arrays are not supported inside keys");
          }
          if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
            keyNode[index] = "[object Object]";
          }
        }
      }
      if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
        keyNode = "[object Object]";
      }
      keyNode = String(keyNode);
      if (_result === null) {
        _result = {};
      }
      if (keyTag === "tag:yaml.org,2002:merge") {
        if (Array.isArray(valueNode)) {
          if (valueNode.length > 100) {
            throwError(state, "abnormal merge sequence size");
          }
          for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
            mergeMappings(state, _result, valueNode[index], overridableKeys);
          }
        } else {
          mergeMappings(state, _result, valueNode, overridableKeys);
        }
      } else {
        if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
          state.line = startLine || state.line;
          state.position = startPos || state.position;
          throwError(state, "duplicated mapping key");
        }
        setProperty(_result, keyNode, valueNode);
        delete overridableKeys[keyNode];
      }
      return _result;
    }
    function readLineBreak(state) {
      var ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 10) {
        state.position++;
      } else if (ch === 13) {
        state.position++;
        if (state.input.charCodeAt(state.position) === 10) {
          state.position++;
        }
      } else {
        throwError(state, "a line break is expected");
      }
      state.line += 1;
      state.lineStart = state.position;
    }
    function skipSeparationSpace(state, allowComments, checkIndent) {
      var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (allowComments && ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 10 && ch !== 13 && ch !== 0);
        }
        if (is_EOL(ch)) {
          readLineBreak(state);
          ch = state.input.charCodeAt(state.position);
          lineBreaks++;
          state.lineIndent = 0;
          while (ch === 32) {
            state.lineIndent++;
            ch = state.input.charCodeAt(++state.position);
          }
        } else {
          break;
        }
      }
      if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
        throwWarning(state, "deficient indentation");
      }
      return lineBreaks;
    }
    function testDocumentSeparator(state) {
      var _position = state.position, ch;
      ch = state.input.charCodeAt(_position);
      if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
        _position += 3;
        ch = state.input.charCodeAt(_position);
        if (ch === 0 || is_WS_OR_EOL(ch)) {
          return true;
        }
      }
      return false;
    }
    function writeFoldedLines(state, count) {
      if (count === 1) {
        state.result += " ";
      } else if (count > 1) {
        state.result += common.repeat("\n", count - 1);
      }
    }
    function readPlainScalar(state, nodeIndent, withinFlowCollection) {
      var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
      ch = state.input.charCodeAt(state.position);
      if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
        return false;
      }
      if (ch === 63 || ch === 45) {
        following = state.input.charCodeAt(state.position + 1);
        if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
          return false;
        }
      }
      state.kind = "scalar";
      state.result = "";
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
      while (ch !== 0) {
        if (ch === 58) {
          following = state.input.charCodeAt(state.position + 1);
          if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
            break;
          }
        } else if (ch === 35) {
          preceding = state.input.charCodeAt(state.position - 1);
          if (is_WS_OR_EOL(preceding)) {
            break;
          }
        } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
          break;
        } else if (is_EOL(ch)) {
          _line = state.line;
          _lineStart = state.lineStart;
          _lineIndent = state.lineIndent;
          skipSeparationSpace(state, false, -1);
          if (state.lineIndent >= nodeIndent) {
            hasPendingContent = true;
            ch = state.input.charCodeAt(state.position);
            continue;
          } else {
            state.position = captureEnd;
            state.line = _line;
            state.lineStart = _lineStart;
            state.lineIndent = _lineIndent;
            break;
          }
        }
        if (hasPendingContent) {
          captureSegment(state, captureStart, captureEnd, false);
          writeFoldedLines(state, state.line - _line);
          captureStart = captureEnd = state.position;
          hasPendingContent = false;
        }
        if (!is_WHITE_SPACE(ch)) {
          captureEnd = state.position + 1;
        }
        ch = state.input.charCodeAt(++state.position);
      }
      captureSegment(state, captureStart, captureEnd, false);
      if (state.result) {
        return true;
      }
      state.kind = _kind;
      state.result = _result;
      return false;
    }
    function readSingleQuotedScalar(state, nodeIndent) {
      var ch, captureStart, captureEnd;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 39) {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      state.position++;
      captureStart = captureEnd = state.position;
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 39) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);
          if (ch === 39) {
            captureStart = state.position;
            state.position++;
            captureEnd = state.position;
          } else {
            return true;
          }
        } else if (is_EOL(ch)) {
          captureSegment(state, captureStart, captureEnd, true);
          writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
          captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
          throwError(state, "unexpected end of the document within a single quoted scalar");
        } else {
          state.position++;
          captureEnd = state.position;
        }
      }
      throwError(state, "unexpected end of the stream within a single quoted scalar");
    }
    function readDoubleQuotedScalar(state, nodeIndent) {
      var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 34) {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      state.position++;
      captureStart = captureEnd = state.position;
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 34) {
          captureSegment(state, captureStart, state.position, true);
          state.position++;
          return true;
        } else if (ch === 92) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);
          if (is_EOL(ch)) {
            skipSeparationSpace(state, false, nodeIndent);
          } else if (ch < 256 && simpleEscapeCheck[ch]) {
            state.result += simpleEscapeMap[ch];
            state.position++;
          } else if ((tmp = escapedHexLen(ch)) > 0) {
            hexLength = tmp;
            hexResult = 0;
            for (; hexLength > 0; hexLength--) {
              ch = state.input.charCodeAt(++state.position);
              if ((tmp = fromHexCode(ch)) >= 0) {
                hexResult = (hexResult << 4) + tmp;
              } else {
                throwError(state, "expected hexadecimal character");
              }
            }
            state.result += charFromCodepoint(hexResult);
            state.position++;
          } else {
            throwError(state, "unknown escape sequence");
          }
          captureStart = captureEnd = state.position;
        } else if (is_EOL(ch)) {
          captureSegment(state, captureStart, captureEnd, true);
          writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
          captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
          throwError(state, "unexpected end of the document within a double quoted scalar");
        } else {
          state.position++;
          captureEnd = state.position;
        }
      }
      throwError(state, "unexpected end of the stream within a double quoted scalar");
    }
    function readFlowCollection(state, nodeIndent) {
      var readNext = true, _line, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = {}, keyNode, keyTag, valueNode, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 91) {
        terminator = 93;
        isMapping = false;
        _result = [];
      } else if (ch === 123) {
        terminator = 125;
        isMapping = true;
        _result = {};
      } else {
        return false;
      }
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(++state.position);
      while (ch !== 0) {
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === terminator) {
          state.position++;
          state.tag = _tag;
          state.anchor = _anchor;
          state.kind = isMapping ? "mapping" : "sequence";
          state.result = _result;
          return true;
        } else if (!readNext) {
          throwError(state, "missed comma between flow collection entries");
        }
        keyTag = keyNode = valueNode = null;
        isPair = isExplicitPair = false;
        if (ch === 63) {
          following = state.input.charCodeAt(state.position + 1);
          if (is_WS_OR_EOL(following)) {
            isPair = isExplicitPair = true;
            state.position++;
            skipSeparationSpace(state, true, nodeIndent);
          }
        }
        _line = state.line;
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        keyTag = state.tag;
        keyNode = state.result;
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if ((isExplicitPair || state.line === _line) && ch === 58) {
          isPair = true;
          ch = state.input.charCodeAt(++state.position);
          skipSeparationSpace(state, true, nodeIndent);
          composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
          valueNode = state.result;
        }
        if (isMapping) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
        } else if (isPair) {
          _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
        } else {
          _result.push(keyNode);
        }
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === 44) {
          readNext = true;
          ch = state.input.charCodeAt(++state.position);
        } else {
          readNext = false;
        }
      }
      throwError(state, "unexpected end of the stream within a flow collection");
    }
    function readBlockScalar(state, nodeIndent) {
      var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 124) {
        folding = false;
      } else if (ch === 62) {
        folding = true;
      } else {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      while (ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
        if (ch === 43 || ch === 45) {
          if (CHOMPING_CLIP === chomping) {
            chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
          } else {
            throwError(state, "repeat of a chomping mode identifier");
          }
        } else if ((tmp = fromDecimalCode(ch)) >= 0) {
          if (tmp === 0) {
            throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
          } else if (!detectedIndent) {
            textIndent = nodeIndent + tmp - 1;
            detectedIndent = true;
          } else {
            throwError(state, "repeat of an indentation width identifier");
          }
        } else {
          break;
        }
      }
      if (is_WHITE_SPACE(ch)) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (is_WHITE_SPACE(ch));
        if (ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (!is_EOL(ch) && ch !== 0);
        }
      }
      while (ch !== 0) {
        readLineBreak(state);
        state.lineIndent = 0;
        ch = state.input.charCodeAt(state.position);
        while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
        if (!detectedIndent && state.lineIndent > textIndent) {
          textIndent = state.lineIndent;
        }
        if (is_EOL(ch)) {
          emptyLines++;
          continue;
        }
        if (state.lineIndent < textIndent) {
          if (chomping === CHOMPING_KEEP) {
            state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
          } else if (chomping === CHOMPING_CLIP) {
            if (didReadContent) {
              state.result += "\n";
            }
          }
          break;
        }
        if (folding) {
          if (is_WHITE_SPACE(ch)) {
            atMoreIndented = true;
            state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
          } else if (atMoreIndented) {
            atMoreIndented = false;
            state.result += common.repeat("\n", emptyLines + 1);
          } else if (emptyLines === 0) {
            if (didReadContent) {
              state.result += " ";
            }
          } else {
            state.result += common.repeat("\n", emptyLines);
          }
        } else {
          state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        }
        didReadContent = true;
        detectedIndent = true;
        emptyLines = 0;
        captureStart = state.position;
        while (!is_EOL(ch) && ch !== 0) {
          ch = state.input.charCodeAt(++state.position);
        }
        captureSegment(state, captureStart, state.position, false);
      }
      return true;
    }
    function readBlockSequence(state, nodeIndent) {
      var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        if (ch !== 45) {
          break;
        }
        following = state.input.charCodeAt(state.position + 1);
        if (!is_WS_OR_EOL(following)) {
          break;
        }
        detected = true;
        state.position++;
        if (skipSeparationSpace(state, true, -1)) {
          if (state.lineIndent <= nodeIndent) {
            _result.push(null);
            ch = state.input.charCodeAt(state.position);
            continue;
          }
        }
        _line = state.line;
        composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
        _result.push(state.result);
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
          throwError(state, "bad indentation of a sequence entry");
        } else if (state.lineIndent < nodeIndent) {
          break;
        }
      }
      if (detected) {
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = "sequence";
        state.result = _result;
        return true;
      }
      return false;
    }
    function readBlockMapping(state, nodeIndent, flowIndent) {
      var following, allowCompact, _line, _pos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = {}, keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        following = state.input.charCodeAt(state.position + 1);
        _line = state.line;
        _pos = state.position;
        if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
          if (ch === 63) {
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = true;
            allowCompact = true;
          } else if (atExplicitKey) {
            atExplicitKey = false;
            allowCompact = true;
          } else {
            throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
          }
          state.position += 1;
          ch = following;
        } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
          if (state.line === _line) {
            ch = state.input.charCodeAt(state.position);
            while (is_WHITE_SPACE(ch)) {
              ch = state.input.charCodeAt(++state.position);
            }
            if (ch === 58) {
              ch = state.input.charCodeAt(++state.position);
              if (!is_WS_OR_EOL(ch)) {
                throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
              }
              if (atExplicitKey) {
                storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
                keyTag = keyNode = valueNode = null;
              }
              detected = true;
              atExplicitKey = false;
              allowCompact = false;
              keyTag = state.tag;
              keyNode = state.result;
            } else if (detected) {
              throwError(state, "can not read an implicit mapping pair; a colon is missed");
            } else {
              state.tag = _tag;
              state.anchor = _anchor;
              return true;
            }
          } else if (detected) {
            throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true;
          }
        } else {
          break;
        }
        if (state.line === _line || state.lineIndent > nodeIndent) {
          if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
            if (atExplicitKey) {
              keyNode = state.result;
            } else {
              valueNode = state.result;
            }
          }
          if (!atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _pos);
            keyTag = keyNode = valueNode = null;
          }
          skipSeparationSpace(state, true, -1);
          ch = state.input.charCodeAt(state.position);
        }
        if (state.lineIndent > nodeIndent && ch !== 0) {
          throwError(state, "bad indentation of a mapping entry");
        } else if (state.lineIndent < nodeIndent) {
          break;
        }
      }
      if (atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
      }
      if (detected) {
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = "mapping";
        state.result = _result;
      }
      return detected;
    }
    function readTagProperty(state) {
      var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 33) return false;
      if (state.tag !== null) {
        throwError(state, "duplication of a tag property");
      }
      ch = state.input.charCodeAt(++state.position);
      if (ch === 60) {
        isVerbatim = true;
        ch = state.input.charCodeAt(++state.position);
      } else if (ch === 33) {
        isNamed = true;
        tagHandle = "!!";
        ch = state.input.charCodeAt(++state.position);
      } else {
        tagHandle = "!";
      }
      _position = state.position;
      if (isVerbatim) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && ch !== 62);
        if (state.position < state.length) {
          tagName = state.input.slice(_position, state.position);
          ch = state.input.charCodeAt(++state.position);
        } else {
          throwError(state, "unexpected end of the stream within a verbatim tag");
        }
      } else {
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          if (ch === 33) {
            if (!isNamed) {
              tagHandle = state.input.slice(_position - 1, state.position + 1);
              if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
                throwError(state, "named tag handle cannot contain such characters");
              }
              isNamed = true;
              _position = state.position + 1;
            } else {
              throwError(state, "tag suffix cannot contain exclamation marks");
            }
          }
          ch = state.input.charCodeAt(++state.position);
        }
        tagName = state.input.slice(_position, state.position);
        if (PATTERN_FLOW_INDICATORS.test(tagName)) {
          throwError(state, "tag suffix cannot contain flow indicator characters");
        }
      }
      if (tagName && !PATTERN_TAG_URI.test(tagName)) {
        throwError(state, "tag name cannot contain such characters: " + tagName);
      }
      if (isVerbatim) {
        state.tag = tagName;
      } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
        state.tag = state.tagMap[tagHandle] + tagName;
      } else if (tagHandle === "!") {
        state.tag = "!" + tagName;
      } else if (tagHandle === "!!") {
        state.tag = "tag:yaml.org,2002:" + tagName;
      } else {
        throwError(state, 'undeclared tag handle "' + tagHandle + '"');
      }
      return true;
    }
    function readAnchorProperty(state) {
      var _position, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 38) return false;
      if (state.anchor !== null) {
        throwError(state, "duplication of an anchor property");
      }
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (state.position === _position) {
        throwError(state, "name of an anchor node must contain at least one character");
      }
      state.anchor = state.input.slice(_position, state.position);
      return true;
    }
    function readAlias(state) {
      var _position, alias, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 42) return false;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (state.position === _position) {
        throwError(state, "name of an alias node must contain at least one character");
      }
      alias = state.input.slice(_position, state.position);
      if (!_hasOwnProperty.call(state.anchorMap, alias)) {
        throwError(state, 'unidentified alias "' + alias + '"');
      }
      state.result = state.anchorMap[alias];
      skipSeparationSpace(state, true, -1);
      return true;
    }
    function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
      var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, type, flowIndent, blockIndent;
      if (state.listener !== null) {
        state.listener("open", state);
      }
      state.tag = null;
      state.anchor = null;
      state.kind = null;
      state.result = null;
      allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
      if (allowToSeek) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        }
      }
      if (indentStatus === 1) {
        while (readTagProperty(state) || readAnchorProperty(state)) {
          if (skipSeparationSpace(state, true, -1)) {
            atNewLine = true;
            allowBlockCollections = allowBlockStyles;
            if (state.lineIndent > parentIndent) {
              indentStatus = 1;
            } else if (state.lineIndent === parentIndent) {
              indentStatus = 0;
            } else if (state.lineIndent < parentIndent) {
              indentStatus = -1;
            }
          } else {
            allowBlockCollections = false;
          }
        }
      }
      if (allowBlockCollections) {
        allowBlockCollections = atNewLine || allowCompact;
      }
      if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
        if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
          flowIndent = parentIndent;
        } else {
          flowIndent = parentIndent + 1;
        }
        blockIndent = state.position - state.lineStart;
        if (indentStatus === 1) {
          if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
            hasContent = true;
          } else {
            if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
              hasContent = true;
            } else if (readAlias(state)) {
              hasContent = true;
              if (state.tag !== null || state.anchor !== null) {
                throwError(state, "alias node should not have any properties");
              }
            } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
              hasContent = true;
              if (state.tag === null) {
                state.tag = "?";
              }
            }
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
          }
        } else if (indentStatus === 0) {
          hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
        }
      }
      if (state.tag !== null && state.tag !== "!") {
        if (state.tag === "?") {
          if (state.result !== null && state.kind !== "scalar") {
            throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
          }
          for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
            type = state.implicitTypes[typeIndex];
            if (type.resolve(state.result)) {
              state.result = type.construct(state.result);
              state.tag = type.tag;
              if (state.anchor !== null) {
                state.anchorMap[state.anchor] = state.result;
              }
              break;
            }
          }
        } else if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag)) {
          type = state.typeMap[state.kind || "fallback"][state.tag];
          if (state.result !== null && type.kind !== state.kind) {
            throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
          }
          if (!type.resolve(state.result)) {
            throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
          } else {
            state.result = type.construct(state.result);
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
          }
        } else {
          throwError(state, "unknown tag !<" + state.tag + ">");
        }
      }
      if (state.listener !== null) {
        state.listener("close", state);
      }
      return state.tag !== null || state.anchor !== null || hasContent;
    }
    function readDocument(state) {
      var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
      state.version = null;
      state.checkLineBreaks = state.legacy;
      state.tagMap = {};
      state.anchorMap = {};
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if (state.lineIndent > 0 || ch !== 37) {
          break;
        }
        hasDirectives = true;
        ch = state.input.charCodeAt(++state.position);
        _position = state.position;
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        directiveName = state.input.slice(_position, state.position);
        directiveArgs = [];
        if (directiveName.length < 1) {
          throwError(state, "directive name must not be less than one character in length");
        }
        while (ch !== 0) {
          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          if (ch === 35) {
            do {
              ch = state.input.charCodeAt(++state.position);
            } while (ch !== 0 && !is_EOL(ch));
            break;
          }
          if (is_EOL(ch)) break;
          _position = state.position;
          while (ch !== 0 && !is_WS_OR_EOL(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          directiveArgs.push(state.input.slice(_position, state.position));
        }
        if (ch !== 0) readLineBreak(state);
        if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
          directiveHandlers[directiveName](state, directiveName, directiveArgs);
        } else {
          throwWarning(state, 'unknown document directive "' + directiveName + '"');
        }
      }
      skipSeparationSpace(state, true, -1);
      if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      } else if (hasDirectives) {
        throwError(state, "directives end mark is expected");
      }
      composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
      skipSeparationSpace(state, true, -1);
      if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
        throwWarning(state, "non-ASCII line breaks are interpreted as content");
      }
      state.documents.push(state.result);
      if (state.position === state.lineStart && testDocumentSeparator(state)) {
        if (state.input.charCodeAt(state.position) === 46) {
          state.position += 3;
          skipSeparationSpace(state, true, -1);
        }
        return;
      }
      if (state.position < state.length - 1) {
        throwError(state, "end of the stream or a document separator is expected");
      } else {
        return;
      }
    }
    function loadDocuments(input, options) {
      input = String(input);
      options = options || {};
      if (input.length !== 0) {
        if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
          input += "\n";
        }
        if (input.charCodeAt(0) === 65279) {
          input = input.slice(1);
        }
      }
      var state = new State(input, options);
      var nullpos = input.indexOf("\0");
      if (nullpos !== -1) {
        state.position = nullpos;
        throwError(state, "null byte is not allowed in input");
      }
      state.input += "\0";
      while (state.input.charCodeAt(state.position) === 32) {
        state.lineIndent += 1;
        state.position += 1;
      }
      while (state.position < state.length - 1) {
        readDocument(state);
      }
      return state.documents;
    }
    function loadAll(input, iterator, options) {
      if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
        options = iterator;
        iterator = null;
      }
      var documents = loadDocuments(input, options);
      if (typeof iterator !== "function") {
        return documents;
      }
      for (var index = 0, length = documents.length; index < length; index += 1) {
        iterator(documents[index]);
      }
    }
    function load(input, options) {
      var documents = loadDocuments(input, options);
      if (documents.length === 0) {
        return void 0;
      } else if (documents.length === 1) {
        return documents[0];
      }
      throw new YAMLException("expected a single document in the stream, but found more");
    }
    function safeLoadAll(input, iterator, options) {
      if (typeof iterator === "object" && iterator !== null && typeof options === "undefined") {
        options = iterator;
        iterator = null;
      }
      return loadAll(input, iterator, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
    }
    function safeLoad(input, options) {
      return load(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
    }
    module.exports.loadAll = loadAll;
    module.exports.load = load;
    module.exports.safeLoadAll = safeLoadAll;
    module.exports.safeLoad = safeLoad;
  }
});

// node_modules/js-yaml/lib/js-yaml/dumper.js
var require_dumper = __commonJS({
  "node_modules/js-yaml/lib/js-yaml/dumper.js"(exports, module) {
    "use strict";
    var common = require_common();
    var YAMLException = require_exception();
    var DEFAULT_FULL_SCHEMA = require_default_full();
    var DEFAULT_SAFE_SCHEMA = require_default_safe();
    var _toString = Object.prototype.toString;
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var CHAR_TAB = 9;
    var CHAR_LINE_FEED = 10;
    var CHAR_CARRIAGE_RETURN = 13;
    var CHAR_SPACE = 32;
    var CHAR_EXCLAMATION = 33;
    var CHAR_DOUBLE_QUOTE = 34;
    var CHAR_SHARP = 35;
    var CHAR_PERCENT = 37;
    var CHAR_AMPERSAND = 38;
    var CHAR_SINGLE_QUOTE = 39;
    var CHAR_ASTERISK = 42;
    var CHAR_COMMA = 44;
    var CHAR_MINUS = 45;
    var CHAR_COLON = 58;
    var CHAR_EQUALS = 61;
    var CHAR_GREATER_THAN = 62;
    var CHAR_QUESTION = 63;
    var CHAR_COMMERCIAL_AT = 64;
    var CHAR_LEFT_SQUARE_BRACKET = 91;
    var CHAR_RIGHT_SQUARE_BRACKET = 93;
    var CHAR_GRAVE_ACCENT = 96;
    var CHAR_LEFT_CURLY_BRACKET = 123;
    var CHAR_VERTICAL_LINE = 124;
    var CHAR_RIGHT_CURLY_BRACKET = 125;
    var ESCAPE_SEQUENCES = {};
    ESCAPE_SEQUENCES[0] = "\\0";
    ESCAPE_SEQUENCES[7] = "\\a";
    ESCAPE_SEQUENCES[8] = "\\b";
    ESCAPE_SEQUENCES[9] = "\\t";
    ESCAPE_SEQUENCES[10] = "\\n";
    ESCAPE_SEQUENCES[11] = "\\v";
    ESCAPE_SEQUENCES[12] = "\\f";
    ESCAPE_SEQUENCES[13] = "\\r";
    ESCAPE_SEQUENCES[27] = "\\e";
    ESCAPE_SEQUENCES[34] = '\\"';
    ESCAPE_SEQUENCES[92] = "\\\\";
    ESCAPE_SEQUENCES[133] = "\\N";
    ESCAPE_SEQUENCES[160] = "\\_";
    ESCAPE_SEQUENCES[8232] = "\\L";
    ESCAPE_SEQUENCES[8233] = "\\P";
    var DEPRECATED_BOOLEANS_SYNTAX = [
      "y",
      "Y",
      "yes",
      "Yes",
      "YES",
      "on",
      "On",
      "ON",
      "n",
      "N",
      "no",
      "No",
      "NO",
      "off",
      "Off",
      "OFF"
    ];
    function compileStyleMap(schema, map) {
      var result, keys, index, length, tag, style, type;
      if (map === null) return {};
      result = {};
      keys = Object.keys(map);
      for (index = 0, length = keys.length; index < length; index += 1) {
        tag = keys[index];
        style = String(map[tag]);
        if (tag.slice(0, 2) === "!!") {
          tag = "tag:yaml.org,2002:" + tag.slice(2);
        }
        type = schema.compiledTypeMap["fallback"][tag];
        if (type && _hasOwnProperty.call(type.styleAliases, style)) {
          style = type.styleAliases[style];
        }
        result[tag] = style;
      }
      return result;
    }
    function encodeHex(character) {
      var string, handle, length;
      string = character.toString(16).toUpperCase();
      if (character <= 255) {
        handle = "x";
        length = 2;
      } else if (character <= 65535) {
        handle = "u";
        length = 4;
      } else if (character <= 4294967295) {
        handle = "U";
        length = 8;
      } else {
        throw new YAMLException("code point within a string may not be greater than 0xFFFFFFFF");
      }
      return "\\" + handle + common.repeat("0", length - string.length) + string;
    }
    function State(options) {
      this.schema = options["schema"] || DEFAULT_FULL_SCHEMA;
      this.indent = Math.max(1, options["indent"] || 2);
      this.noArrayIndent = options["noArrayIndent"] || false;
      this.skipInvalid = options["skipInvalid"] || false;
      this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
      this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
      this.sortKeys = options["sortKeys"] || false;
      this.lineWidth = options["lineWidth"] || 80;
      this.noRefs = options["noRefs"] || false;
      this.noCompatMode = options["noCompatMode"] || false;
      this.condenseFlow = options["condenseFlow"] || false;
      this.implicitTypes = this.schema.compiledImplicit;
      this.explicitTypes = this.schema.compiledExplicit;
      this.tag = null;
      this.result = "";
      this.duplicates = [];
      this.usedDuplicates = null;
    }
    function indentString(string, spaces) {
      var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
      while (position < length) {
        next = string.indexOf("\n", position);
        if (next === -1) {
          line = string.slice(position);
          position = length;
        } else {
          line = string.slice(position, next + 1);
          position = next + 1;
        }
        if (line.length && line !== "\n") result += ind;
        result += line;
      }
      return result;
    }
    function generateNextLine(state, level) {
      return "\n" + common.repeat(" ", state.indent * level);
    }
    function testImplicitResolving(state, str) {
      var index, length, type;
      for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
        type = state.implicitTypes[index];
        if (type.resolve(str)) {
          return true;
        }
      }
      return false;
    }
    function isWhitespace(c3) {
      return c3 === CHAR_SPACE || c3 === CHAR_TAB;
    }
    function isPrintable(c3) {
      return 32 <= c3 && c3 <= 126 || 161 <= c3 && c3 <= 55295 && c3 !== 8232 && c3 !== 8233 || 57344 <= c3 && c3 <= 65533 && c3 !== 65279 || 65536 <= c3 && c3 <= 1114111;
    }
    function isNsChar(c3) {
      return isPrintable(c3) && !isWhitespace(c3) && c3 !== 65279 && c3 !== CHAR_CARRIAGE_RETURN && c3 !== CHAR_LINE_FEED;
    }
    function isPlainSafe(c3, prev) {
      return isPrintable(c3) && c3 !== 65279 && c3 !== CHAR_COMMA && c3 !== CHAR_LEFT_SQUARE_BRACKET && c3 !== CHAR_RIGHT_SQUARE_BRACKET && c3 !== CHAR_LEFT_CURLY_BRACKET && c3 !== CHAR_RIGHT_CURLY_BRACKET && c3 !== CHAR_COLON && (c3 !== CHAR_SHARP || prev && isNsChar(prev));
    }
    function isPlainSafeFirst(c3) {
      return isPrintable(c3) && c3 !== 65279 && !isWhitespace(c3) && c3 !== CHAR_MINUS && c3 !== CHAR_QUESTION && c3 !== CHAR_COLON && c3 !== CHAR_COMMA && c3 !== CHAR_LEFT_SQUARE_BRACKET && c3 !== CHAR_RIGHT_SQUARE_BRACKET && c3 !== CHAR_LEFT_CURLY_BRACKET && c3 !== CHAR_RIGHT_CURLY_BRACKET && c3 !== CHAR_SHARP && c3 !== CHAR_AMPERSAND && c3 !== CHAR_ASTERISK && c3 !== CHAR_EXCLAMATION && c3 !== CHAR_VERTICAL_LINE && c3 !== CHAR_EQUALS && c3 !== CHAR_GREATER_THAN && c3 !== CHAR_SINGLE_QUOTE && c3 !== CHAR_DOUBLE_QUOTE && c3 !== CHAR_PERCENT && c3 !== CHAR_COMMERCIAL_AT && c3 !== CHAR_GRAVE_ACCENT;
    }
    function needIndentIndicator(string) {
      var leadingSpaceRe = /^\n* /;
      return leadingSpaceRe.test(string);
    }
    var STYLE_PLAIN = 1;
    var STYLE_SINGLE = 2;
    var STYLE_LITERAL = 3;
    var STYLE_FOLDED = 4;
    var STYLE_DOUBLE = 5;
    function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
      var i2;
      var char, prev_char;
      var hasLineBreak = false;
      var hasFoldableLine = false;
      var shouldTrackWidth = lineWidth !== -1;
      var previousLineBreak = -1;
      var plain = isPlainSafeFirst(string.charCodeAt(0)) && !isWhitespace(string.charCodeAt(string.length - 1));
      if (singleLineOnly) {
        for (i2 = 0; i2 < string.length; i2++) {
          char = string.charCodeAt(i2);
          if (!isPrintable(char)) {
            return STYLE_DOUBLE;
          }
          prev_char = i2 > 0 ? string.charCodeAt(i2 - 1) : null;
          plain = plain && isPlainSafe(char, prev_char);
        }
      } else {
        for (i2 = 0; i2 < string.length; i2++) {
          char = string.charCodeAt(i2);
          if (char === CHAR_LINE_FEED) {
            hasLineBreak = true;
            if (shouldTrackWidth) {
              hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
              i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
              previousLineBreak = i2;
            }
          } else if (!isPrintable(char)) {
            return STYLE_DOUBLE;
          }
          prev_char = i2 > 0 ? string.charCodeAt(i2 - 1) : null;
          plain = plain && isPlainSafe(char, prev_char);
        }
        hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
      }
      if (!hasLineBreak && !hasFoldableLine) {
        return plain && !testAmbiguousType(string) ? STYLE_PLAIN : STYLE_SINGLE;
      }
      if (indentPerLevel > 9 && needIndentIndicator(string)) {
        return STYLE_DOUBLE;
      }
      return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
    }
    function writeScalar(state, string, level, iskey) {
      state.dump = (function() {
        if (string.length === 0) {
          return "''";
        }
        if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
          return "'" + string + "'";
        }
        var indent = state.indent * Math.max(1, level);
        var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
        var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
        function testAmbiguity(string2) {
          return testImplicitResolving(state, string2);
        }
        switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
          case STYLE_PLAIN:
            return string;
          case STYLE_SINGLE:
            return "'" + string.replace(/'/g, "''") + "'";
          case STYLE_LITERAL:
            return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
          case STYLE_FOLDED:
            return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
          case STYLE_DOUBLE:
            return '"' + escapeString(string, lineWidth) + '"';
          default:
            throw new YAMLException("impossible error: invalid scalar style");
        }
      })();
    }
    function blockHeader(string, indentPerLevel) {
      var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
      var clip = string[string.length - 1] === "\n";
      var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
      var chomp = keep ? "+" : clip ? "" : "-";
      return indentIndicator + chomp + "\n";
    }
    function dropEndingNewline(string) {
      return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
    }
    function foldString(string, width) {
      var lineRe = /(\n+)([^\n]*)/g;
      var result = (function() {
        var nextLF = string.indexOf("\n");
        nextLF = nextLF !== -1 ? nextLF : string.length;
        lineRe.lastIndex = nextLF;
        return foldLine(string.slice(0, nextLF), width);
      })();
      var prevMoreIndented = string[0] === "\n" || string[0] === " ";
      var moreIndented;
      var match;
      while (match = lineRe.exec(string)) {
        var prefix = match[1], line = match[2];
        moreIndented = line[0] === " ";
        result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
        prevMoreIndented = moreIndented;
      }
      return result;
    }
    function foldLine(line, width) {
      if (line === "" || line[0] === " ") return line;
      var breakRe = / [^ ]/g;
      var match;
      var start = 0, end, curr = 0, next = 0;
      var result = "";
      while (match = breakRe.exec(line)) {
        next = match.index;
        if (next - start > width) {
          end = curr > start ? curr : next;
          result += "\n" + line.slice(start, end);
          start = end + 1;
        }
        curr = next;
      }
      result += "\n";
      if (line.length - start > width && curr > start) {
        result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
      } else {
        result += line.slice(start);
      }
      return result.slice(1);
    }
    function escapeString(string) {
      var result = "";
      var char, nextChar;
      var escapeSeq;
      for (var i2 = 0; i2 < string.length; i2++) {
        char = string.charCodeAt(i2);
        if (char >= 55296 && char <= 56319) {
          nextChar = string.charCodeAt(i2 + 1);
          if (nextChar >= 56320 && nextChar <= 57343) {
            result += encodeHex((char - 55296) * 1024 + nextChar - 56320 + 65536);
            i2++;
            continue;
          }
        }
        escapeSeq = ESCAPE_SEQUENCES[char];
        result += !escapeSeq && isPrintable(char) ? string[i2] : escapeSeq || encodeHex(char);
      }
      return result;
    }
    function writeFlowSequence(state, level, object) {
      var _result = "", _tag = state.tag, index, length;
      for (index = 0, length = object.length; index < length; index += 1) {
        if (writeNode(state, level, object[index], false, false)) {
          if (index !== 0) _result += "," + (!state.condenseFlow ? " " : "");
          _result += state.dump;
        }
      }
      state.tag = _tag;
      state.dump = "[" + _result + "]";
    }
    function writeBlockSequence(state, level, object, compact) {
      var _result = "", _tag = state.tag, index, length;
      for (index = 0, length = object.length; index < length; index += 1) {
        if (writeNode(state, level + 1, object[index], true, true)) {
          if (!compact || index !== 0) {
            _result += generateNextLine(state, level);
          }
          if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            _result += "-";
          } else {
            _result += "- ";
          }
          _result += state.dump;
        }
      }
      state.tag = _tag;
      state.dump = _result || "[]";
    }
    function writeFlowMapping(state, level, object) {
      var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
      for (index = 0, length = objectKeyList.length; index < length; index += 1) {
        pairBuffer = "";
        if (index !== 0) pairBuffer += ", ";
        if (state.condenseFlow) pairBuffer += '"';
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (!writeNode(state, level, objectKey, false, false)) {
          continue;
        }
        if (state.dump.length > 1024) pairBuffer += "? ";
        pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
        if (!writeNode(state, level, objectValue, false, false)) {
          continue;
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
      }
      state.tag = _tag;
      state.dump = "{" + _result + "}";
    }
    function writeBlockMapping(state, level, object, compact) {
      var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
      if (state.sortKeys === true) {
        objectKeyList.sort();
      } else if (typeof state.sortKeys === "function") {
        objectKeyList.sort(state.sortKeys);
      } else if (state.sortKeys) {
        throw new YAMLException("sortKeys must be a boolean or a function");
      }
      for (index = 0, length = objectKeyList.length; index < length; index += 1) {
        pairBuffer = "";
        if (!compact || index !== 0) {
          pairBuffer += generateNextLine(state, level);
        }
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (!writeNode(state, level + 1, objectKey, true, true, true)) {
          continue;
        }
        explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
        if (explicitPair) {
          if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            pairBuffer += "?";
          } else {
            pairBuffer += "? ";
          }
        }
        pairBuffer += state.dump;
        if (explicitPair) {
          pairBuffer += generateNextLine(state, level);
        }
        if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
          continue;
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += ":";
        } else {
          pairBuffer += ": ";
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
      }
      state.tag = _tag;
      state.dump = _result || "{}";
    }
    function detectType(state, object, explicit) {
      var _result, typeList, index, length, type, style;
      typeList = explicit ? state.explicitTypes : state.implicitTypes;
      for (index = 0, length = typeList.length; index < length; index += 1) {
        type = typeList[index];
        if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === "object" && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
          state.tag = explicit ? type.tag : "?";
          if (type.represent) {
            style = state.styleMap[type.tag] || type.defaultStyle;
            if (_toString.call(type.represent) === "[object Function]") {
              _result = type.represent(object, style);
            } else if (_hasOwnProperty.call(type.represent, style)) {
              _result = type.represent[style](object, style);
            } else {
              throw new YAMLException("!<" + type.tag + '> tag resolver accepts not "' + style + '" style');
            }
            state.dump = _result;
          }
          return true;
        }
      }
      return false;
    }
    function writeNode(state, level, object, block, compact, iskey) {
      state.tag = null;
      state.dump = object;
      if (!detectType(state, object, false)) {
        detectType(state, object, true);
      }
      var type = _toString.call(state.dump);
      if (block) {
        block = state.flowLevel < 0 || state.flowLevel > level;
      }
      var objectOrArray = type === "[object Object]" || type === "[object Array]", duplicateIndex, duplicate;
      if (objectOrArray) {
        duplicateIndex = state.duplicates.indexOf(object);
        duplicate = duplicateIndex !== -1;
      }
      if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
        compact = false;
      }
      if (duplicate && state.usedDuplicates[duplicateIndex]) {
        state.dump = "*ref_" + duplicateIndex;
      } else {
        if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
          state.usedDuplicates[duplicateIndex] = true;
        }
        if (type === "[object Object]") {
          if (block && Object.keys(state.dump).length !== 0) {
            writeBlockMapping(state, level, state.dump, compact);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + state.dump;
            }
          } else {
            writeFlowMapping(state, level, state.dump);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + " " + state.dump;
            }
          }
        } else if (type === "[object Array]") {
          var arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
          if (block && state.dump.length !== 0) {
            writeBlockSequence(state, arrayLevel, state.dump, compact);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + state.dump;
            }
          } else {
            writeFlowSequence(state, arrayLevel, state.dump);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + " " + state.dump;
            }
          }
        } else if (type === "[object String]") {
          if (state.tag !== "?") {
            writeScalar(state, state.dump, level, iskey);
          }
        } else {
          if (state.skipInvalid) return false;
          throw new YAMLException("unacceptable kind of an object to dump " + type);
        }
        if (state.tag !== null && state.tag !== "?") {
          state.dump = "!<" + state.tag + "> " + state.dump;
        }
      }
      return true;
    }
    function getDuplicateReferences(object, state) {
      var objects = [], duplicatesIndexes = [], index, length;
      inspectNode(object, objects, duplicatesIndexes);
      for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
        state.duplicates.push(objects[duplicatesIndexes[index]]);
      }
      state.usedDuplicates = new Array(length);
    }
    function inspectNode(object, objects, duplicatesIndexes) {
      var objectKeyList, index, length;
      if (object !== null && typeof object === "object") {
        index = objects.indexOf(object);
        if (index !== -1) {
          if (duplicatesIndexes.indexOf(index) === -1) {
            duplicatesIndexes.push(index);
          }
        } else {
          objects.push(object);
          if (Array.isArray(object)) {
            for (index = 0, length = object.length; index < length; index += 1) {
              inspectNode(object[index], objects, duplicatesIndexes);
            }
          } else {
            objectKeyList = Object.keys(object);
            for (index = 0, length = objectKeyList.length; index < length; index += 1) {
              inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
            }
          }
        }
      }
    }
    function dump(input, options) {
      options = options || {};
      var state = new State(options);
      if (!state.noRefs) getDuplicateReferences(input, state);
      if (writeNode(state, 0, input, true, true)) return state.dump + "\n";
      return "";
    }
    function safeDump(input, options) {
      return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
    }
    module.exports.dump = dump;
    module.exports.safeDump = safeDump;
  }
});

// node_modules/js-yaml/lib/js-yaml.js
var require_js_yaml = __commonJS({
  "node_modules/js-yaml/lib/js-yaml.js"(exports, module) {
    "use strict";
    var loader = require_loader();
    var dumper = require_dumper();
    function deprecated(name) {
      return function() {
        throw new Error("Function " + name + " is deprecated and cannot be used.");
      };
    }
    module.exports.Type = require_type();
    module.exports.Schema = require_schema();
    module.exports.FAILSAFE_SCHEMA = require_failsafe();
    module.exports.JSON_SCHEMA = require_json();
    module.exports.CORE_SCHEMA = require_core();
    module.exports.DEFAULT_SAFE_SCHEMA = require_default_safe();
    module.exports.DEFAULT_FULL_SCHEMA = require_default_full();
    module.exports.load = loader.load;
    module.exports.loadAll = loader.loadAll;
    module.exports.safeLoad = loader.safeLoad;
    module.exports.safeLoadAll = loader.safeLoadAll;
    module.exports.dump = dumper.dump;
    module.exports.safeDump = dumper.safeDump;
    module.exports.YAMLException = require_exception();
    module.exports.MINIMAL_SCHEMA = require_failsafe();
    module.exports.SAFE_SCHEMA = require_default_safe();
    module.exports.DEFAULT_SCHEMA = require_default_full();
    module.exports.scan = deprecated("scan");
    module.exports.parse = deprecated("parse");
    module.exports.compose = deprecated("compose");
    module.exports.addConstructor = deprecated("addConstructor");
  }
});

// node_modules/js-yaml/index.js
var require_js_yaml2 = __commonJS({
  "node_modules/js-yaml/index.js"(exports, module) {
    "use strict";
    var yaml2 = require_js_yaml();
    module.exports = yaml2;
  }
});

// node_modules/front-matter/index.js
var require_front_matter = __commonJS({
  "node_modules/front-matter/index.js"(exports, module) {
    var parser = require_js_yaml2();
    var optionalByteOrderMark = "\\ufeff?";
    var platform = typeof process !== "undefined" ? process.platform : "";
    var pattern = "^(" + optionalByteOrderMark + "(= yaml =|---)$([\\s\\S]*?)^(?:\\2|\\.\\.\\.)\\s*$" + (platform === "win32" ? "\\r?" : "") + "(?:\\n)?)";
    var regex = new RegExp(pattern, "m");
    module.exports = extractor;
    module.exports.test = test;
    function extractor(string, options) {
      string = string || "";
      var defaultOptions = { allowUnsafe: false };
      options = options instanceof Object ? { ...defaultOptions, ...options } : defaultOptions;
      options.allowUnsafe = Boolean(options.allowUnsafe);
      var lines = string.split(/(\r?\n)/);
      if (lines[0] && /= yaml =|---/.test(lines[0])) {
        return parse(string, options.allowUnsafe);
      } else {
        return {
          attributes: {},
          body: string,
          bodyBegin: 1
        };
      }
    }
    function computeLocation(match, body) {
      var line = 1;
      var pos = body.indexOf("\n");
      var offset = match.index + match[0].length;
      while (pos !== -1) {
        if (pos >= offset) {
          return line;
        }
        line++;
        pos = body.indexOf("\n", pos + 1);
      }
      return line;
    }
    function parse(string, allowUnsafe) {
      var match = regex.exec(string);
      if (!match) {
        return {
          attributes: {},
          body: string,
          bodyBegin: 1
        };
      }
      var loader = allowUnsafe ? parser.load : parser.safeLoad;
      var yaml2 = match[match.length - 1].replace(/^\s+|\s+$/g, "");
      var attributes = loader(yaml2) || {};
      var body = string.replace(match[0], "");
      var line = computeLocation(match, string);
      return {
        attributes,
        body,
        bodyBegin: line,
        frontmatter: yaml2
      };
    }
    function test(string) {
      string = string || "";
      return regex.test(string);
    }
  }
});

// node_modules/highlight.js/lib/core.js
var require_core2 = __commonJS({
  "node_modules/highlight.js/lib/core.js"(exports, module) {
    function deepFreeze(obj) {
      if (obj instanceof Map) {
        obj.clear = obj.delete = obj.set = function() {
          throw new Error("map is read-only");
        };
      } else if (obj instanceof Set) {
        obj.add = obj.clear = obj.delete = function() {
          throw new Error("set is read-only");
        };
      }
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach((name) => {
        const prop = obj[name];
        const type = typeof prop;
        if ((type === "object" || type === "function") && !Object.isFrozen(prop)) {
          deepFreeze(prop);
        }
      });
      return obj;
    }
    var Response = class {
      /**
       * @param {CompiledMode} mode
       */
      constructor(mode) {
        if (mode.data === void 0) mode.data = {};
        this.data = mode.data;
        this.isMatchIgnored = false;
      }
      ignoreMatch() {
        this.isMatchIgnored = true;
      }
    };
    function escapeHTML(value) {
      return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    }
    function inherit$1(original, ...objects) {
      const result = /* @__PURE__ */ Object.create(null);
      for (const key in original) {
        result[key] = original[key];
      }
      objects.forEach(function(obj) {
        for (const key in obj) {
          result[key] = obj[key];
        }
      });
      return (
        /** @type {T} */
        result
      );
    }
    var SPAN_CLOSE = "</span>";
    var emitsWrappingTags = (node) => {
      return !!node.scope;
    };
    var scopeToCSSClass = (name, { prefix }) => {
      if (name.startsWith("language:")) {
        return name.replace("language:", "language-");
      }
      if (name.includes(".")) {
        const pieces = name.split(".");
        return [
          `${prefix}${pieces.shift()}`,
          ...pieces.map((x3, i2) => `${x3}${"_".repeat(i2 + 1)}`)
        ].join(" ");
      }
      return `${prefix}${name}`;
    };
    var HTMLRenderer = class {
      /**
       * Creates a new HTMLRenderer
       *
       * @param {Tree} parseTree - the parse tree (must support `walk` API)
       * @param {{classPrefix: string}} options
       */
      constructor(parseTree, options) {
        this.buffer = "";
        this.classPrefix = options.classPrefix;
        parseTree.walk(this);
      }
      /**
       * Adds texts to the output stream
       *
       * @param {string} text */
      addText(text) {
        this.buffer += escapeHTML(text);
      }
      /**
       * Adds a node open to the output stream (if needed)
       *
       * @param {Node} node */
      openNode(node) {
        if (!emitsWrappingTags(node)) return;
        const className = scopeToCSSClass(
          node.scope,
          { prefix: this.classPrefix }
        );
        this.span(className);
      }
      /**
       * Adds a node close to the output stream (if needed)
       *
       * @param {Node} node */
      closeNode(node) {
        if (!emitsWrappingTags(node)) return;
        this.buffer += SPAN_CLOSE;
      }
      /**
       * returns the accumulated buffer
      */
      value() {
        return this.buffer;
      }
      // helpers
      /**
       * Builds a span element
       *
       * @param {string} className */
      span(className) {
        this.buffer += `<span class="${className}">`;
      }
    };
    var newNode = (opts = {}) => {
      const result = { children: [] };
      Object.assign(result, opts);
      return result;
    };
    var TokenTree = class _TokenTree {
      constructor() {
        this.rootNode = newNode();
        this.stack = [this.rootNode];
      }
      get top() {
        return this.stack[this.stack.length - 1];
      }
      get root() {
        return this.rootNode;
      }
      /** @param {Node} node */
      add(node) {
        this.top.children.push(node);
      }
      /** @param {string} scope */
      openNode(scope) {
        const node = newNode({ scope });
        this.add(node);
        this.stack.push(node);
      }
      closeNode() {
        if (this.stack.length > 1) {
          return this.stack.pop();
        }
        return void 0;
      }
      closeAllNodes() {
        while (this.closeNode()) ;
      }
      toJSON() {
        return JSON.stringify(this.rootNode, null, 4);
      }
      /**
       * @typedef { import("./html_renderer").Renderer } Renderer
       * @param {Renderer} builder
       */
      walk(builder) {
        return this.constructor._walk(builder, this.rootNode);
      }
      /**
       * @param {Renderer} builder
       * @param {Node} node
       */
      static _walk(builder, node) {
        if (typeof node === "string") {
          builder.addText(node);
        } else if (node.children) {
          builder.openNode(node);
          node.children.forEach((child) => this._walk(builder, child));
          builder.closeNode(node);
        }
        return builder;
      }
      /**
       * @param {Node} node
       */
      static _collapse(node) {
        if (typeof node === "string") return;
        if (!node.children) return;
        if (node.children.every((el) => typeof el === "string")) {
          node.children = [node.children.join("")];
        } else {
          node.children.forEach((child) => {
            _TokenTree._collapse(child);
          });
        }
      }
    };
    var TokenTreeEmitter = class extends TokenTree {
      /**
       * @param {*} options
       */
      constructor(options) {
        super();
        this.options = options;
      }
      /**
       * @param {string} text
       */
      addText(text) {
        if (text === "") {
          return;
        }
        this.add(text);
      }
      /** @param {string} scope */
      startScope(scope) {
        this.openNode(scope);
      }
      endScope() {
        this.closeNode();
      }
      /**
       * @param {Emitter & {root: DataNode}} emitter
       * @param {string} name
       */
      __addSublanguage(emitter, name) {
        const node = emitter.root;
        if (name) node.scope = `language:${name}`;
        this.add(node);
      }
      toHTML() {
        const renderer = new HTMLRenderer(this, this.options);
        return renderer.value();
      }
      finalize() {
        this.closeAllNodes();
        return true;
      }
    };
    function source2(re2) {
      if (!re2) return null;
      if (typeof re2 === "string") return re2;
      return re2.source;
    }
    function lookahead2(re2) {
      return concat2("(?=", re2, ")");
    }
    function anyNumberOfTimes(re2) {
      return concat2("(?:", re2, ")*");
    }
    function optional(re2) {
      return concat2("(?:", re2, ")?");
    }
    function concat2(...args) {
      const joined = args.map((x3) => source2(x3)).join("");
      return joined;
    }
    function stripOptionsFromArgs2(args) {
      const opts = args[args.length - 1];
      if (typeof opts === "object" && opts.constructor === Object) {
        args.splice(args.length - 1, 1);
        return opts;
      } else {
        return {};
      }
    }
    function either2(...args) {
      const opts = stripOptionsFromArgs2(args);
      const joined = "(" + (opts.capture ? "" : "?:") + args.map((x3) => source2(x3)).join("|") + ")";
      return joined;
    }
    function countMatchGroups(re2) {
      return new RegExp(re2.toString() + "|").exec("").length - 1;
    }
    function startsWith(re2, lexeme) {
      const match = re2 && re2.exec(lexeme);
      return match && match.index === 0;
    }
    var BACKREF_RE = new RegExp(either2(
      /\[(?:[^\\\]]|\\.)*\]/,
      // a character class, inside which ( and \ lose their meaning
      /\(\?<(?![=!])[^>]+>/,
      // a named capture group `(?<name>` (not a lookbehind `(?<=` / `(?<!`)
      /\(\?'[^']+'/,
      // a named capture group `(?'name'`
      /\(\??/,
      // an opening parenthesis, capturing or non-capturing / lookahead
      /\\([1-9][0-9]*)/,
      // a backreference like `\1`
      /\\./
      // any other escape sequence
    ));
    function _rewriteBackreferences(regexps, { joinWith }) {
      let numCaptures = 0;
      return regexps.map((regex) => {
        numCaptures += 1;
        const offset = numCaptures;
        let re2 = source2(regex);
        let out = "";
        while (re2.length > 0) {
          const match = BACKREF_RE.exec(re2);
          if (!match) {
            out += re2;
            break;
          }
          out += re2.substring(0, match.index);
          re2 = re2.substring(match.index + match[0].length);
          if (match[0][0] === "\\" && match[1]) {
            out += "\\" + String(Number(match[1]) + offset);
          } else {
            out += match[0];
            if (match[0] === "(" || /^\(\?[<']/.test(match[0])) {
              numCaptures++;
            }
          }
        }
        return out;
      }).map((re2) => `(${re2})`).join(joinWith);
    }
    var MATCH_NOTHING_RE = /\b\B/;
    var IDENT_RE3 = "[a-zA-Z]\\w*";
    var UNDERSCORE_IDENT_RE = "[a-zA-Z_]\\w*";
    var NUMBER_RE = "\\b\\d+(\\.\\d+)?";
    var C_NUMBER_RE = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";
    var BINARY_NUMBER_RE = "\\b(0b[01]+)";
    var RE_STARTERS_RE = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
    var SHEBANG = (opts = {}) => {
      const beginShebang = /^#![ ]*\//;
      if (opts.binary) {
        opts.begin = concat2(
          beginShebang,
          /.*\b/,
          opts.binary,
          /\b.*/
        );
      }
      return inherit$1({
        scope: "meta",
        begin: beginShebang,
        end: /$/,
        relevance: 0,
        /** @type {ModeCallback} */
        "on:begin": (m, resp) => {
          if (m.index !== 0) resp.ignoreMatch();
        }
      }, opts);
    };
    var BACKSLASH_ESCAPE = {
      begin: "\\\\[\\s\\S]",
      relevance: 0
    };
    var APOS_STRING_MODE = {
      scope: "string",
      begin: "'",
      end: "'",
      illegal: "\\n",
      contains: [BACKSLASH_ESCAPE]
    };
    var QUOTE_STRING_MODE = {
      scope: "string",
      begin: '"',
      end: '"',
      illegal: "\\n",
      contains: [BACKSLASH_ESCAPE]
    };
    var PHRASAL_WORDS_MODE = {
      begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    };
    var COMMENT = function(begin, end, modeOptions = {}) {
      const mode = inherit$1(
        {
          scope: "comment",
          begin,
          end,
          contains: []
        },
        modeOptions
      );
      mode.contains.push({
        scope: "doctag",
        // hack to avoid the space from being included. the space is necessary to
        // match here to prevent the plain text rule below from gobbling up doctags
        begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
        end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
        excludeBegin: true,
        relevance: 0
      });
      const ENGLISH_WORD = either2(
        // list of common 1 and 2 letter words in English
        "I",
        "a",
        "is",
        "so",
        "us",
        "to",
        "at",
        "if",
        "in",
        "it",
        "on",
        // note: this is not an exhaustive list of contractions, just popular ones
        /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
        // contractions - can't we'd they're let's, etc
        /[A-Za-z]+[-][a-z]+/,
        // `no-way`, etc.
        /[A-Za-z][a-z]{2,}/
        // allow capitalized words at beginning of sentences
      );
      mode.contains.push(
        {
          // TODO: how to include ", (, ) without breaking grammars that use these for
          // comment delimiters?
          // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
          // ---
          // this tries to find sequences of 3 english words in a row (without any
          // "programming" type syntax) this gives us a strong signal that we've
          // TRULY found a comment - vs perhaps scanning with the wrong language.
          // It's possible to find something that LOOKS like the start of the
          // comment - but then if there is no readable text - good chance it is a
          // false match and not a comment.
          //
          // for a visual example please see:
          // https://github.com/highlightjs/highlight.js/issues/2827
          begin: concat2(
            /[ ]+/,
            // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
            "(",
            ENGLISH_WORD,
            /[.]?[:]?([.][ ]|[ ])/,
            "){3}"
          )
          // look for 3 words in a row
        }
      );
      return mode;
    };
    var C_LINE_COMMENT_MODE = COMMENT("//", "$");
    var C_BLOCK_COMMENT_MODE = COMMENT("/\\*", "\\*/");
    var HASH_COMMENT_MODE = COMMENT("#", "$");
    var NUMBER_MODE = {
      scope: "number",
      begin: NUMBER_RE,
      relevance: 0
    };
    var C_NUMBER_MODE = {
      scope: "number",
      begin: C_NUMBER_RE,
      relevance: 0
    };
    var BINARY_NUMBER_MODE = {
      scope: "number",
      begin: BINARY_NUMBER_RE,
      relevance: 0
    };
    var REGEXP_MODE = {
      scope: "regexp",
      begin: /\/(?=[^/\n]*\/)/,
      end: /\/[gimuy]*/,
      contains: [
        BACKSLASH_ESCAPE,
        {
          begin: /\[/,
          end: /\]/,
          relevance: 0,
          contains: [BACKSLASH_ESCAPE]
        }
      ]
    };
    var TITLE_MODE = {
      scope: "title",
      begin: IDENT_RE3,
      relevance: 0
    };
    var UNDERSCORE_TITLE_MODE = {
      scope: "title",
      begin: UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    var METHOD_GUARD = {
      // excludes method names from keyword processing
      begin: "\\.\\s*" + UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    var END_SAME_AS_BEGIN = function(mode) {
      return Object.assign(
        mode,
        {
          /** @type {ModeCallback} */
          "on:begin": (m, resp) => {
            resp.data._beginMatch = m[1];
          },
          /** @type {ModeCallback} */
          "on:end": (m, resp) => {
            if (resp.data._beginMatch !== m[1]) resp.ignoreMatch();
          }
        }
      );
    };
    var MODES4 = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      APOS_STRING_MODE,
      BACKSLASH_ESCAPE,
      BINARY_NUMBER_MODE,
      BINARY_NUMBER_RE,
      COMMENT,
      C_BLOCK_COMMENT_MODE,
      C_LINE_COMMENT_MODE,
      C_NUMBER_MODE,
      C_NUMBER_RE,
      END_SAME_AS_BEGIN,
      HASH_COMMENT_MODE,
      IDENT_RE: IDENT_RE3,
      MATCH_NOTHING_RE,
      METHOD_GUARD,
      NUMBER_MODE,
      NUMBER_RE,
      PHRASAL_WORDS_MODE,
      QUOTE_STRING_MODE,
      REGEXP_MODE,
      RE_STARTERS_RE,
      SHEBANG,
      TITLE_MODE,
      UNDERSCORE_IDENT_RE,
      UNDERSCORE_TITLE_MODE
    });
    function skipIfHasPrecedingDot(match, response) {
      const before = match.input[match.index - 1];
      if (before === ".") {
        response.ignoreMatch();
      }
    }
    function scopeClassName(mode, _parent) {
      if (mode.className !== void 0) {
        mode.scope = mode.className;
        delete mode.className;
      }
    }
    function beginKeywords(mode, parent) {
      if (!parent) return;
      if (!mode.beginKeywords) return;
      mode.begin = "\\b(" + mode.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)";
      mode.__beforeBegin = skipIfHasPrecedingDot;
      mode.keywords = mode.keywords || mode.beginKeywords;
      delete mode.beginKeywords;
      if (mode.relevance === void 0) mode.relevance = 0;
    }
    function compileIllegal(mode, _parent) {
      if (!Array.isArray(mode.illegal)) return;
      mode.illegal = either2(...mode.illegal);
    }
    function compileMatch(mode, _parent) {
      if (!mode.match) return;
      if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");
      mode.begin = mode.match;
      delete mode.match;
    }
    function compileRelevance(mode, _parent) {
      if (mode.relevance === void 0) mode.relevance = 1;
    }
    var beforeMatchExt = (mode, parent) => {
      if (!mode.beforeMatch) return;
      if (mode.starts) throw new Error("beforeMatch cannot be used with starts");
      const originalMode = Object.assign({}, mode);
      Object.keys(mode).forEach((key) => {
        delete mode[key];
      });
      mode.keywords = originalMode.keywords;
      mode.begin = concat2(originalMode.beforeMatch, lookahead2(originalMode.begin));
      mode.starts = {
        relevance: 0,
        contains: [
          Object.assign(originalMode, { endsParent: true })
        ]
      };
      mode.relevance = 0;
      delete originalMode.beforeMatch;
    };
    var COMMON_KEYWORDS = [
      "of",
      "and",
      "for",
      "in",
      "not",
      "or",
      "if",
      "then",
      "parent",
      // common variable name
      "list",
      // common variable name
      "value"
      // common variable name
    ];
    var DEFAULT_KEYWORD_SCOPE = "keyword";
    function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
      const compiledKeywords = /* @__PURE__ */ Object.create(null);
      if (typeof rawKeywords === "string") {
        compileList(scopeName, rawKeywords.split(" "));
      } else if (Array.isArray(rawKeywords)) {
        compileList(scopeName, rawKeywords);
      } else {
        Object.keys(rawKeywords).forEach(function(scopeName2) {
          Object.assign(
            compiledKeywords,
            compileKeywords(rawKeywords[scopeName2], caseInsensitive, scopeName2)
          );
        });
      }
      return compiledKeywords;
      function compileList(scopeName2, keywordList) {
        if (caseInsensitive) {
          keywordList = keywordList.map((x3) => x3.toLowerCase());
        }
        keywordList.forEach(function(keyword) {
          const pair = keyword.split("|");
          compiledKeywords[pair[0]] = [scopeName2, scoreForKeyword(pair[0], pair[1])];
        });
      }
    }
    function scoreForKeyword(keyword, providedScore) {
      if (providedScore) {
        return Number(providedScore);
      }
      return commonKeyword(keyword) ? 0 : 1;
    }
    function commonKeyword(keyword) {
      return COMMON_KEYWORDS.includes(keyword.toLowerCase());
    }
    var seenDeprecations = {};
    var error = (message) => {
      console.error(message);
    };
    var warn = (message, ...args) => {
      console.log(`WARN: ${message}`, ...args);
    };
    var deprecated = (version2, message) => {
      if (seenDeprecations[`${version2}/${message}`]) return;
      console.log(`Deprecated as of ${version2}. ${message}`);
      seenDeprecations[`${version2}/${message}`] = true;
    };
    var MultiClassError = new Error();
    function remapScopeNames(mode, regexes, { key }) {
      let offset = 0;
      const scopeNames = mode[key];
      const emit = {};
      const positions = {};
      for (let i2 = 1; i2 <= regexes.length; i2++) {
        positions[i2 + offset] = scopeNames[i2];
        emit[i2 + offset] = true;
        offset += countMatchGroups(regexes[i2 - 1]);
      }
      mode[key] = positions;
      mode[key]._emit = emit;
      mode[key]._multi = true;
    }
    function beginMultiClass(mode) {
      if (!Array.isArray(mode.begin)) return;
      if (mode.skip || mode.excludeBegin || mode.returnBegin) {
        error("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
        throw MultiClassError;
      }
      if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
        error("beginScope must be object");
        throw MultiClassError;
      }
      remapScopeNames(mode, mode.begin, { key: "beginScope" });
      mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
    }
    function endMultiClass(mode) {
      if (!Array.isArray(mode.end)) return;
      if (mode.skip || mode.excludeEnd || mode.returnEnd) {
        error("skip, excludeEnd, returnEnd not compatible with endScope: {}");
        throw MultiClassError;
      }
      if (typeof mode.endScope !== "object" || mode.endScope === null) {
        error("endScope must be object");
        throw MultiClassError;
      }
      remapScopeNames(mode, mode.end, { key: "endScope" });
      mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
    }
    function scopeSugar(mode) {
      if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
        mode.beginScope = mode.scope;
        delete mode.scope;
      }
    }
    function MultiClass(mode) {
      scopeSugar(mode);
      if (typeof mode.beginScope === "string") {
        mode.beginScope = { _wrap: mode.beginScope };
      }
      if (typeof mode.endScope === "string") {
        mode.endScope = { _wrap: mode.endScope };
      }
      beginMultiClass(mode);
      endMultiClass(mode);
    }
    function compileLanguage(language) {
      function langRe(value, global2) {
        return new RegExp(
          source2(value),
          "m" + (language.case_insensitive ? "i" : "") + (language.unicodeRegex ? "u" : "") + (global2 ? "g" : "")
        );
      }
      class MultiRegex {
        constructor() {
          this.matchIndexes = {};
          this.regexes = [];
          this.matchAt = 1;
          this.position = 0;
        }
        // @ts-ignore
        addRule(re2, opts) {
          opts.position = this.position++;
          this.matchIndexes[this.matchAt] = opts;
          this.regexes.push([opts, re2]);
          this.matchAt += countMatchGroups(re2) + 1;
        }
        compile() {
          if (this.regexes.length === 0) {
            this.exec = () => null;
          }
          const terminators = this.regexes.map((el) => el[1]);
          this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: "|" }), true);
          this.lastIndex = 0;
        }
        /** @param {string} s */
        exec(s) {
          this.matcherRe.lastIndex = this.lastIndex;
          const match = this.matcherRe.exec(s);
          if (!match) {
            return null;
          }
          const i2 = match.findIndex((el, i3) => i3 > 0 && el !== void 0);
          const matchData = this.matchIndexes[i2];
          match.splice(0, i2);
          return Object.assign(match, matchData);
        }
      }
      class ResumableMultiRegex {
        constructor() {
          this.rules = [];
          this.multiRegexes = [];
          this.count = 0;
          this.lastIndex = 0;
          this.regexIndex = 0;
        }
        // @ts-ignore
        getMatcher(index) {
          if (this.multiRegexes[index]) return this.multiRegexes[index];
          const matcher = new MultiRegex();
          this.rules.slice(index).forEach(([re2, opts]) => matcher.addRule(re2, opts));
          matcher.compile();
          this.multiRegexes[index] = matcher;
          return matcher;
        }
        resumingScanAtSamePosition() {
          return this.regexIndex !== 0;
        }
        considerAll() {
          this.regexIndex = 0;
        }
        // @ts-ignore
        addRule(re2, opts) {
          this.rules.push([re2, opts]);
          if (opts.type === "begin") this.count++;
        }
        /** @param {string} s */
        exec(s) {
          const m = this.getMatcher(this.regexIndex);
          m.lastIndex = this.lastIndex;
          let result = m.exec(s);
          if (this.resumingScanAtSamePosition()) {
            if (result && result.index === this.lastIndex) ;
            else {
              const m2 = this.getMatcher(0);
              m2.lastIndex = this.lastIndex + 1;
              result = m2.exec(s);
            }
          }
          if (result) {
            this.regexIndex += result.position + 1;
            if (this.regexIndex === this.count) {
              this.considerAll();
            }
          }
          return result;
        }
      }
      function buildModeRegex(mode) {
        const mm = new ResumableMultiRegex();
        mode.contains.forEach((term) => mm.addRule(term.begin, { rule: term, type: "begin" }));
        if (mode.terminatorEnd) {
          mm.addRule(mode.terminatorEnd, { type: "end" });
        }
        if (mode.illegal) {
          mm.addRule(mode.illegal, { type: "illegal" });
        }
        return mm;
      }
      function compileMode(mode, parent) {
        const cmode = (
          /** @type CompiledMode */
          mode
        );
        if (mode.isCompiled) return cmode;
        [
          scopeClassName,
          // do this early so compiler extensions generally don't have to worry about
          // the distinction between match/begin
          compileMatch,
          MultiClass,
          beforeMatchExt
        ].forEach((ext) => ext(mode, parent));
        language.compilerExtensions.forEach((ext) => ext(mode, parent));
        mode.__beforeBegin = null;
        [
          beginKeywords,
          // do this later so compiler extensions that come earlier have access to the
          // raw array if they wanted to perhaps manipulate it, etc.
          compileIllegal,
          // default to 1 relevance if not specified
          compileRelevance
        ].forEach((ext) => ext(mode, parent));
        mode.isCompiled = true;
        let keywordPattern = null;
        if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
          mode.keywords = Object.assign({}, mode.keywords);
          keywordPattern = mode.keywords.$pattern;
          delete mode.keywords.$pattern;
        }
        keywordPattern = keywordPattern || /\w+/;
        if (mode.keywords) {
          mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
        }
        cmode.keywordPatternRe = langRe(keywordPattern, true);
        if (parent) {
          if (!mode.begin) mode.begin = /\B|\b/;
          cmode.beginRe = langRe(cmode.begin);
          if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
          if (mode.end) cmode.endRe = langRe(cmode.end);
          cmode.terminatorEnd = source2(cmode.end) || "";
          if (mode.endsWithParent && parent.terminatorEnd) {
            cmode.terminatorEnd += (mode.end ? "|" : "") + parent.terminatorEnd;
          }
        }
        if (mode.illegal) cmode.illegalRe = langRe(
          /** @type {RegExp | string} */
          mode.illegal
        );
        if (!mode.contains) mode.contains = [];
        mode.contains = [].concat(...mode.contains.map(function(c3) {
          return expandOrCloneMode(c3 === "self" ? mode : c3);
        }));
        mode.contains.forEach(function(c3) {
          compileMode(
            /** @type Mode */
            c3,
            cmode
          );
        });
        if (mode.starts) {
          compileMode(mode.starts, parent);
        }
        cmode.matcher = buildModeRegex(cmode);
        return cmode;
      }
      if (!language.compilerExtensions) language.compilerExtensions = [];
      if (language.contains && language.contains.includes("self")) {
        throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
      }
      language.classNameAliases = inherit$1(language.classNameAliases || {});
      return compileMode(
        /** @type Mode */
        language
      );
    }
    function dependencyOnParent(mode) {
      if (!mode) return false;
      return mode.endsWithParent || dependencyOnParent(mode.starts);
    }
    function expandOrCloneMode(mode) {
      if (mode.variants && !mode.cachedVariants) {
        mode.cachedVariants = mode.variants.map(function(variant) {
          return inherit$1(mode, { variants: null }, variant);
        });
      }
      if (mode.cachedVariants) {
        return mode.cachedVariants;
      }
      if (dependencyOnParent(mode)) {
        return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
      }
      if (Object.isFrozen(mode)) {
        return inherit$1(mode);
      }
      return mode;
    }
    var version = "11.12.0";
    var HTMLInjectionError = class extends Error {
      constructor(reason, html) {
        super(reason);
        this.name = "HTMLInjectionError";
        this.html = html;
      }
    };
    var escape = escapeHTML;
    var inherit = inherit$1;
    var NO_MATCH = /* @__PURE__ */ Symbol("nomatch");
    var MAX_KEYWORD_HITS = 7;
    var HLJS = function(hljs) {
      const languages = /* @__PURE__ */ Object.create(null);
      const aliases = /* @__PURE__ */ Object.create(null);
      const plugins = [];
      let SAFE_MODE = true;
      const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
      const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: "Plain text", contains: [] };
      let options = {
        ignoreUnescapedHTML: false,
        throwUnescapedHTML: false,
        noHighlightRe: /^(no-?highlight)$/i,
        languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
        classPrefix: "hljs-",
        cssSelector: "pre code",
        languages: null,
        // beta configuration options, subject to change, welcome to discuss
        // https://github.com/highlightjs/highlight.js/issues/1086
        __emitter: TokenTreeEmitter
      };
      function shouldNotHighlight(languageName) {
        return options.noHighlightRe.test(languageName);
      }
      function blockLanguage(block) {
        let classes = block.className + " ";
        classes += block.parentNode ? block.parentNode.className : "";
        const match = options.languageDetectRe.exec(classes);
        if (match) {
          const language = getLanguage(match[1]);
          if (!language) {
            warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
            warn("Falling back to no-highlight mode for this block.", block);
          }
          return language ? match[1] : "no-highlight";
        }
        return classes.split(/\s+/).find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
      }
      function highlight2(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
        let code = "";
        let languageName = "";
        if (typeof optionsOrCode === "object") {
          code = codeOrLanguageName;
          ignoreIllegals = optionsOrCode.ignoreIllegals;
          languageName = optionsOrCode.language;
        } else {
          deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
          deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
          languageName = codeOrLanguageName;
          code = optionsOrCode;
        }
        if (ignoreIllegals === void 0) {
          ignoreIllegals = true;
        }
        const context = {
          code,
          language: languageName
        };
        fire("before:highlight", context);
        const result = context.result ? context.result : _highlight(context.language, context.code, ignoreIllegals);
        result.code = context.code;
        fire("after:highlight", result);
        return result;
      }
      function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
        const keywordHits = /* @__PURE__ */ Object.create(null);
        function keywordData(mode, matchText) {
          return mode.keywords[matchText];
        }
        function processKeywords() {
          if (!top.keywords) {
            emitter.addText(modeBuffer);
            return;
          }
          let lastIndex = 0;
          top.keywordPatternRe.lastIndex = 0;
          let match = top.keywordPatternRe.exec(modeBuffer);
          let buf = "";
          while (match) {
            buf += modeBuffer.substring(lastIndex, match.index);
            const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
            const data = keywordData(top, word);
            if (data) {
              const [kind, keywordRelevance] = data;
              emitter.addText(buf);
              buf = "";
              keywordHits[word] = (keywordHits[word] || 0) + 1;
              if (keywordHits[word] <= MAX_KEYWORD_HITS) relevance += keywordRelevance;
              if (kind.startsWith("_")) {
                buf += match[0];
              } else {
                const cssClass = language.classNameAliases[kind] || kind;
                emitKeyword(match[0], cssClass);
              }
            } else {
              buf += match[0];
            }
            lastIndex = top.keywordPatternRe.lastIndex;
            match = top.keywordPatternRe.exec(modeBuffer);
          }
          buf += modeBuffer.substring(lastIndex);
          emitter.addText(buf);
        }
        function processSubLanguage() {
          if (modeBuffer === "") return;
          let result2 = null;
          if (typeof top.subLanguage === "string") {
            if (!languages[top.subLanguage]) {
              emitter.addText(modeBuffer);
              return;
            }
            result2 = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
            continuations[top.subLanguage] = /** @type {CompiledMode} */
            result2._top;
          } else {
            result2 = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
          }
          if (top.relevance > 0) {
            relevance += result2.relevance;
          }
          emitter.__addSublanguage(result2._emitter, result2.language);
        }
        function processBuffer() {
          if (top.subLanguage != null) {
            processSubLanguage();
          } else {
            processKeywords();
          }
          modeBuffer = "";
        }
        function emitKeyword(keyword, scope) {
          if (keyword === "") return;
          emitter.startScope(scope);
          emitter.addText(keyword);
          emitter.endScope();
        }
        function emitMultiClass(scope, match) {
          let i2 = 1;
          const max = match.length - 1;
          while (i2 <= max) {
            if (!scope._emit[i2]) {
              i2++;
              continue;
            }
            const klass = language.classNameAliases[scope[i2]] || scope[i2];
            const text = match[i2];
            if (klass) {
              emitKeyword(text, klass);
            } else {
              modeBuffer = text;
              processKeywords();
              modeBuffer = "";
            }
            i2++;
          }
        }
        function startNewMode(mode, match) {
          if (mode.scope && typeof mode.scope === "string") {
            emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
          }
          if (mode.beginScope) {
            if (mode.beginScope._wrap) {
              emitKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
              modeBuffer = "";
            } else if (mode.beginScope._multi) {
              emitMultiClass(mode.beginScope, match);
              modeBuffer = "";
            }
          }
          top = Object.create(mode, { parent: { value: top } });
          return top;
        }
        function endOfMode(mode, match, matchPlusRemainder) {
          let matched = startsWith(mode.endRe, matchPlusRemainder);
          if (matched) {
            if (mode["on:end"]) {
              const resp = new Response(mode);
              mode["on:end"](match, resp);
              if (resp.isMatchIgnored) matched = false;
            }
            if (matched) {
              while (mode.endsParent && mode.parent) {
                mode = mode.parent;
              }
              return mode;
            }
          }
          if (mode.endsWithParent) {
            return endOfMode(mode.parent, match, matchPlusRemainder);
          }
        }
        function doIgnore(lexeme) {
          if (top.matcher.regexIndex === 0) {
            modeBuffer += lexeme[0];
            return 1;
          } else {
            resumeScanAtSamePosition = true;
            return 0;
          }
        }
        function doBeginMatch(match) {
          const lexeme = match[0];
          const newMode = match.rule;
          const resp = new Response(newMode);
          const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
          for (const cb of beforeCallbacks) {
            if (!cb) continue;
            cb(match, resp);
            if (resp.isMatchIgnored) return doIgnore(lexeme);
          }
          if (newMode.skip) {
            modeBuffer += lexeme;
          } else {
            if (newMode.excludeBegin) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (!newMode.returnBegin && !newMode.excludeBegin) {
              modeBuffer = lexeme;
            }
          }
          startNewMode(newMode, match);
          return newMode.returnBegin ? 0 : lexeme.length;
        }
        function doEndMatch(match) {
          const lexeme = match[0];
          const matchPlusRemainder = codeToHighlight.substring(match.index);
          const endMode = endOfMode(top, match, matchPlusRemainder);
          if (!endMode) {
            return NO_MATCH;
          }
          const origin = top;
          if (top.endScope && top.endScope._wrap) {
            processBuffer();
            emitKeyword(lexeme, top.endScope._wrap);
          } else if (top.endScope && top.endScope._multi) {
            processBuffer();
            emitMultiClass(top.endScope, match);
          } else if (origin.skip) {
            modeBuffer += lexeme;
          } else {
            if (!(origin.returnEnd || origin.excludeEnd)) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (origin.excludeEnd) {
              modeBuffer = lexeme;
            }
          }
          do {
            if (top.scope) {
              emitter.closeNode();
            }
            if (!top.skip && !top.subLanguage) {
              relevance += top.relevance;
            }
            top = top.parent;
          } while (top !== endMode.parent);
          if (endMode.starts) {
            startNewMode(endMode.starts, match);
          }
          return origin.returnEnd ? 0 : lexeme.length;
        }
        function processContinuations() {
          const list = [];
          for (let current = top; current !== language; current = current.parent) {
            if (current.scope) {
              list.unshift(current.scope);
            }
          }
          list.forEach((item) => emitter.openNode(item));
        }
        let lastMatch = {};
        function processLexeme(textBeforeMatch, match) {
          const lexeme = match && match[0];
          modeBuffer += textBeforeMatch;
          if (lexeme == null) {
            processBuffer();
            return 0;
          }
          if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
            modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
            if (!SAFE_MODE) {
              const err = new Error(`0 width match regex (${languageName})`);
              err.languageName = languageName;
              err.badRule = lastMatch.rule;
              throw err;
            }
            return 1;
          }
          lastMatch = match;
          if (match.type === "begin") {
            return doBeginMatch(match);
          } else if (match.type === "illegal" && !ignoreIllegals) {
            const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || "<unnamed>") + '"');
            err.mode = top;
            throw err;
          } else if (match.type === "end") {
            const processed = doEndMatch(match);
            if (processed !== NO_MATCH) {
              return processed;
            }
          }
          if (match.type === "illegal" && lexeme === "") {
            if (match.index === codeToHighlight.length) ;
            else {
              modeBuffer += "\n";
            }
            return 1;
          }
          if (iterations > 1e5 && iterations > match.index * 3) {
            const err = new Error("potential infinite loop, way more iterations than matches");
            throw err;
          }
          modeBuffer += lexeme;
          return lexeme.length;
        }
        const language = getLanguage(languageName);
        if (!language) {
          error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
          throw new Error('Unknown language: "' + languageName + '"');
        }
        const md = compileLanguage(language);
        let result = "";
        let top = continuation || md;
        const continuations = {};
        const emitter = new options.__emitter(options);
        processContinuations();
        let modeBuffer = "";
        let relevance = 0;
        let index = 0;
        let iterations = 0;
        let resumeScanAtSamePosition = false;
        try {
          if (!language.__emitTokens) {
            top.matcher.considerAll();
            for (; ; ) {
              iterations++;
              if (resumeScanAtSamePosition) {
                resumeScanAtSamePosition = false;
              } else {
                top.matcher.considerAll();
              }
              top.matcher.lastIndex = index;
              const match = top.matcher.exec(codeToHighlight);
              if (!match) break;
              const beforeMatch = codeToHighlight.substring(index, match.index);
              const processedCount = processLexeme(beforeMatch, match);
              index = match.index + processedCount;
            }
            processLexeme(codeToHighlight.substring(index));
          } else {
            language.__emitTokens(codeToHighlight, emitter);
          }
          emitter.finalize();
          result = emitter.toHTML();
          return {
            language: languageName,
            value: result,
            relevance,
            illegal: false,
            _emitter: emitter,
            _top: top
          };
        } catch (err) {
          if (err.message && err.message.includes("Illegal")) {
            return {
              language: languageName,
              value: escape(codeToHighlight),
              illegal: true,
              relevance: 0,
              _illegalBy: {
                message: err.message,
                index,
                context: codeToHighlight.slice(index - 100, index + 100),
                mode: err.mode,
                resultSoFar: result
              },
              _emitter: emitter
            };
          } else if (SAFE_MODE) {
            return {
              language: languageName,
              value: escape(codeToHighlight),
              illegal: false,
              relevance: 0,
              errorRaised: err,
              _emitter: emitter,
              _top: top
            };
          } else {
            throw err;
          }
        }
      }
      function justTextHighlightResult(code) {
        const result = {
          value: escape(code),
          illegal: false,
          relevance: 0,
          _top: PLAINTEXT_LANGUAGE,
          _emitter: new options.__emitter(options)
        };
        result._emitter.addText(code);
        return result;
      }
      function highlightAuto(code, languageSubset) {
        languageSubset = languageSubset || options.languages || Object.keys(languages);
        const plaintext2 = justTextHighlightResult(code);
        const results = languageSubset.filter(getLanguage).filter(autoDetection).map(
          (name) => _highlight(name, code, false)
        );
        results.unshift(plaintext2);
        const sorted = results.sort((a3, b) => {
          if (a3.relevance !== b.relevance) return b.relevance - a3.relevance;
          if (a3.language && b.language) {
            if (getLanguage(a3.language).supersetOf === b.language) {
              return 1;
            } else if (getLanguage(b.language).supersetOf === a3.language) {
              return -1;
            }
          }
          return 0;
        });
        const [best, secondBest] = sorted;
        const result = best;
        result.secondBest = secondBest;
        return result;
      }
      function updateClassName(element, currentLang, resultLang) {
        const language = currentLang && aliases[currentLang] || resultLang;
        element.classList.add("hljs");
        element.classList.add(`language-${language}`);
      }
      function highlightElement(element) {
        let node = null;
        const language = blockLanguage(element);
        if (shouldNotHighlight(language)) return;
        fire(
          "before:highlightElement",
          { el: element, language }
        );
        if (element.dataset.highlighted) {
          console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", element);
          return;
        }
        if (element.children.length > 0) {
          if (!options.ignoreUnescapedHTML) {
            console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
            console.warn("https://github.com/highlightjs/highlight.js/wiki/security");
            console.warn("The element with unescaped HTML:");
            console.warn(element);
          }
          if (options.throwUnescapedHTML) {
            const err = new HTMLInjectionError(
              "One of your code blocks includes unescaped HTML.",
              element.innerHTML
            );
            throw err;
          }
        }
        node = element;
        const text = node.textContent;
        const result = language ? highlight2(text, { language, ignoreIllegals: true }) : highlightAuto(text);
        element.innerHTML = result.value;
        element.dataset.highlighted = "yes";
        updateClassName(element, language, result.language);
        element.result = {
          language: result.language,
          // TODO: remove with version 11.0
          re: result.relevance,
          relevance: result.relevance
        };
        if (result.secondBest) {
          element.secondBest = {
            language: result.secondBest.language,
            relevance: result.secondBest.relevance
          };
        }
        fire("after:highlightElement", { el: element, result, text });
      }
      function configure(userOptions) {
        options = inherit(options, userOptions);
      }
      const initHighlighting = () => {
        highlightAll();
        deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
      };
      function initHighlightingOnLoad() {
        highlightAll();
        deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
      }
      let wantsHighlight = false;
      function highlightAll() {
        function boot() {
          highlightAll();
        }
        if (document.readyState === "loading") {
          if (!wantsHighlight) {
            window.addEventListener("DOMContentLoaded", boot, false);
          }
          wantsHighlight = true;
          return;
        }
        const blocks = document.querySelectorAll(options.cssSelector);
        blocks.forEach(highlightElement);
      }
      function registerLanguage(languageName, languageDefinition) {
        let lang = null;
        try {
          lang = languageDefinition(hljs);
        } catch (error$1) {
          error("Language definition for '{}' could not be registered.".replace("{}", languageName));
          if (!SAFE_MODE) {
            throw error$1;
          } else {
            error(error$1);
          }
          lang = PLAINTEXT_LANGUAGE;
        }
        if (!lang.name) lang.name = languageName;
        languages[languageName] = lang;
        lang.rawDefinition = languageDefinition.bind(null, hljs);
        if (lang.aliases) {
          registerAliases(lang.aliases, { languageName });
        }
      }
      function unregisterLanguage(languageName) {
        delete languages[languageName];
        for (const alias of Object.keys(aliases)) {
          if (aliases[alias] === languageName) {
            delete aliases[alias];
          }
        }
      }
      function listLanguages() {
        return Object.keys(languages);
      }
      function getLanguage(name) {
        name = (name || "").toLowerCase();
        return languages[name] || languages[aliases[name]];
      }
      function registerAliases(aliasList, { languageName }) {
        if (typeof aliasList === "string") {
          aliasList = [aliasList];
        }
        aliasList.forEach((alias) => {
          aliases[alias.toLowerCase()] = languageName;
        });
      }
      function autoDetection(name) {
        const lang = getLanguage(name);
        return lang && !lang.disableAutodetect;
      }
      function upgradePluginAPI(plugin) {
        if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
          plugin["before:highlightElement"] = (data) => {
            plugin["before:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
        if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
          plugin["after:highlightElement"] = (data) => {
            plugin["after:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
      }
      function addPlugin(plugin) {
        upgradePluginAPI(plugin);
        plugins.push(plugin);
      }
      function removePlugin(plugin) {
        const index = plugins.indexOf(plugin);
        if (index !== -1) {
          plugins.splice(index, 1);
        }
      }
      function fire(event, args) {
        const cb = event;
        plugins.forEach(function(plugin) {
          if (plugin[cb]) {
            plugin[cb](args);
          }
        });
      }
      function deprecateHighlightBlock(el) {
        deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
        deprecated("10.7.0", "Please use highlightElement now.");
        return highlightElement(el);
      }
      Object.assign(hljs, {
        highlight: highlight2,
        highlightAuto,
        highlightAll,
        highlightElement,
        // TODO: Remove with v12 API
        highlightBlock: deprecateHighlightBlock,
        configure,
        initHighlighting,
        initHighlightingOnLoad,
        registerLanguage,
        unregisterLanguage,
        listLanguages,
        getLanguage,
        registerAliases,
        autoDetection,
        inherit,
        addPlugin,
        removePlugin
      });
      hljs.debugMode = function() {
        SAFE_MODE = false;
      };
      hljs.safeMode = function() {
        SAFE_MODE = true;
      };
      hljs.versionString = version;
      hljs.regex = {
        concat: concat2,
        lookahead: lookahead2,
        either: either2,
        optional,
        anyNumberOfTimes
      };
      for (const key in MODES4) {
        if (typeof MODES4[key] === "object") {
          deepFreeze(MODES4[key]);
        }
      }
      Object.assign(hljs, MODES4);
      return hljs;
    };
    var highlight = HLJS({});
    highlight.newInstance = () => HLJS({});
    module.exports = highlight;
    highlight.HighlightJS = highlight;
    highlight.default = highlight;
  }
});

// node_modules/reading-time/lib/reading-time.js
var require_reading_time = __commonJS({
  "node_modules/reading-time/lib/reading-time.js"(exports, module) {
    "use strict";
    function codeIsInRanges(number, arrayOfRanges) {
      return arrayOfRanges.some(
        ([lowerBound, upperBound]) => lowerBound <= number && number <= upperBound
      );
    }
    function isCJK(c3) {
      if ("string" !== typeof c3) {
        return false;
      }
      const charCode = c3.charCodeAt(0);
      return codeIsInRanges(
        charCode,
        [
          // Hiragana (Katakana not included on purpose,
          // context: https://github.com/ngryman/reading-time/pull/35#issuecomment-853364526)
          // If you think Katakana should be included and have solid reasons, improvement is welcomed
          [12352, 12447],
          // CJK Unified ideographs
          [19968, 40959],
          // Hangul
          [44032, 55203],
          // CJK extensions
          [131072, 191456]
        ]
      );
    }
    function isAnsiWordBound(c3) {
      return " \n\r	".includes(c3);
    }
    function isPunctuation(c3) {
      if ("string" !== typeof c3) {
        return false;
      }
      const charCode = c3.charCodeAt(0);
      return codeIsInRanges(
        charCode,
        [
          [33, 47],
          [58, 64],
          [91, 96],
          [123, 126],
          // CJK Symbols and Punctuation
          [12288, 12351],
          // Full-width ASCII punctuation variants
          [65280, 65519]
        ]
      );
    }
    function readingTime2(text, options = {}) {
      let words = 0, start = 0, end = text.length - 1;
      const wordsPerMinute = options.wordsPerMinute || 200;
      const isWordBound = options.wordBound || isAnsiWordBound;
      while (isWordBound(text[start])) start++;
      while (isWordBound(text[end])) end--;
      const normalizedText = `${text}
`;
      for (let i2 = start; i2 <= end; i2++) {
        if (isCJK(normalizedText[i2]) || !isWordBound(normalizedText[i2]) && (isWordBound(normalizedText[i2 + 1]) || isCJK(normalizedText[i2 + 1]))) {
          words++;
        }
        if (isCJK(normalizedText[i2])) {
          while (i2 <= end && (isPunctuation(normalizedText[i2 + 1]) || isWordBound(normalizedText[i2 + 1]))) {
            i2++;
          }
        }
      }
      const minutes = words / wordsPerMinute;
      const time = Math.round(minutes * 60 * 1e3);
      const displayed = Math.ceil(minutes.toFixed(2));
      return {
        text: displayed + " min read",
        minutes,
        time,
        words
      };
    }
    module.exports = readingTime2;
  }
});

// node_modules/reading-time/lib/stream.js
var require_stream = __commonJS({
  "node_modules/reading-time/lib/stream.js"(exports, module) {
    "use strict";
    var readingTime2 = require_reading_time();
    var Transform = __require("stream").Transform;
    var util = __require("util");
    function ReadingTimeStream(options) {
      if (!(this instanceof ReadingTimeStream)) {
        return new ReadingTimeStream(options);
      }
      Transform.call(this, { objectMode: true });
      this.options = options || {};
      this.stats = {
        minutes: 0,
        time: 0,
        words: 0
      };
    }
    util.inherits(ReadingTimeStream, Transform);
    ReadingTimeStream.prototype._transform = function(chunk, encoding, callback) {
      const stats = readingTime2(chunk.toString(encoding), this.options);
      this.stats.minutes += stats.minutes;
      this.stats.time += stats.time;
      this.stats.words += stats.words;
      callback();
    };
    ReadingTimeStream.prototype._flush = function(callback) {
      this.stats.text = Math.ceil(this.stats.minutes.toFixed(2)) + " min read";
      this.push(this.stats);
      callback();
    };
    module.exports = ReadingTimeStream;
  }
});

// node_modules/reading-time/index.js
var require_reading_time2 = __commonJS({
  "node_modules/reading-time/index.js"(exports, module) {
    module.exports.default = module.exports = require_reading_time();
    module.exports.readingTimeStream = require_stream();
  }
});

// node_modules/md/packages/core/src/utils/basicHelpers.ts
function escapeHtml(text) {
  return text.replace(/&/g, `&amp;`).replace(/</g, `&lt;`).replace(/>/g, `&gt;`).replace(/"/g, `&quot;`).replace(/'/g, `&#39;`);
}
function ucfirst(str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
}

// node_modules/md/packages/core/src/utils/initializeMermaid.ts
async function initializeMermaid() {
  if (typeof window !== `undefined` && window.mermaid) {
    const mermaid = window.mermaid;
    mermaid.initialize({ startOnLoad: false });
  } else {
    const mermaid = await import("mermaid");
    mermaid.default.initialize({ startOnLoad: false });
  }
}

// dompurify-shim.mjs
var dompurify_shim_default = { sanitize: (html) => html };

// node_modules/marked/lib/marked.esm.js
function H() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var S = H();
function se(a3) {
  S = a3;
}
var B = { exec: () => null };
function D(a3) {
  let e = [];
  return (t) => {
    let n = Math.max(0, Math.min(3, t - 1)), s = e[n];
    return s || (s = a3(n), e[n] = s), s;
  };
}
function c(a3, e = "") {
  let t = typeof a3 == "string" ? a3 : a3.source, n = { replace: (s, r2) => {
    let o = typeof r2 == "string" ? r2 : r2.source;
    return o = o.replace(T.caret, "$1"), t = t.replace(s, o), n;
  }, getRegex: () => new RegExp(t, e) };
  return n;
}
var Te = ((a3 = "") => {
  try {
    return !!new RegExp("(?<=1)(?<!1)" + a3);
  } catch {
    return false;
  }
})();
var T = { codeRemoveIndent: /^(?: {0,3}\t| {1,4})/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, endingSpaceTabChar: /[ \t]$/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, leadingSpaceTab: /^[ \t]+/, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+)[ \t]*)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, blockquoteMarkerWhitespace: /^( {0,3}>)([ \t]+)/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\][ \t]+\S/, listReplaceTask: /^\[[ xX]\][ \t]+/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, numericCharacterReference: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/, numericCharacterReferenceOrAmpersand: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (a3) => new RegExp(`^( {0,3}${a3})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: D((a3) => new RegExp(`^ {0,${a3}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)), hrRegex: D((a3) => new RegExp(`^ {0,${a3}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)), fencesBeginRegex: D((a3) => new RegExp(`^ {0,${a3}}(?:\`\`\`|~~~)`)), headingBeginRegex: D((a3) => new RegExp(`^ {0,${a3}}#{1,6}(?:\\s|$)`)), pedanticHeadingBeginRegex: D((a3) => new RegExp(`^ {0,${a3}}#`)), htmlBeginRegex: D((a3) => new RegExp(`^ {0,${a3}}(?:</?(?:${K})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`, "i")), blockquoteBeginRegex: D((a3) => new RegExp(`^ {0,${a3}}>`)) };
var ve = /^(?:[ \t]*(?:\n|$))+/;
var Ze = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var He = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}(?:(?=`)\1`*|(?=~)\1~*) *(?=\n|$)|$)/;
var W = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var je = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var oe = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
var Oe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+)[ \t]*(?:\n+|$)/;
var we = c(Oe).replace(/bull/g, oe).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var Ge = c(Oe).replace(/bull/g, oe).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var ae = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/;
var Ne = /^[^\n]+/;
var le = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\\n]|\n(?![ \t]*\n))+/;
var Fe = c(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", le).replace("title", /(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\\n]|\n(?!\n))*'|\((?:\\[\s\S]|[^()\\])*\))/).getRegex();
var Qe = c(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, oe).getRegex();
var K = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var ue = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var Ue = c("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?:[ \\t]+|\\n|/?>|$)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", ue).replace("tag", K).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var Pe = (a3) => c(ae).replace("hr", W).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", a3).replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex();
var We = Pe(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/);
var Ke = Pe(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/);
var Xe = c(/^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(paragraph)|[^\n]*)(?:\n|$))+/).replace("paragraph", Ke).getRegex();
var pe = { blockquote: Xe, code: Ze, def: Fe, fences: He, heading: je, hr: W, html: Ue, lheading: we, list: Qe, newline: ve, paragraph: We, table: B, text: Ne };
var xe = c("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", W).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex();
var Ve = { ...pe, lheading: Ge, table: xe, paragraph: c(ae).replace("hr", W).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", xe).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex() };
var Je = { ...pe, html: c(`^ *(?:comment(?: *\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1>(?: *\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?>(?: *\\n{2,}|\\s*$))`).replace("comment", ue).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: B, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: c(ae).replace("hr", W).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", we).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
var Ye = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var et = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var Se = /^( {2,}|\\)\n(?!\s*$)[ \t]*/;
var tt = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var $ = /[\p{P}\p{S}]/u;
var j = /[\s\p{P}\p{S}]/u;
var X = /[^\s\p{P}\p{S}]/u;
var nt = c(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, j).getRegex();
var rt = /[\p{Pi}\p{Ps}"']/u;
var ye = /(?!~)[\p{P}\p{S}]/u;
var st = /(?!~)[\s\p{P}\p{S}]/u;
var it = /(?:[^\s\p{P}\p{S}]|~)/u;
var ot = c(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Te ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
var _e = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/;
var at = c(_e, "u").replace(/punct/g, $).getRegex();
var lt = c(_e, "u").replace(/punct/g, ye).getRegex();
var ut = /^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/;
var pt = c(ut, "u").replace(/openQuote/g, rt).replace(/punct/g, $).getRegex();
var $e = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var ct = c($e, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, j).replace(/punct/g, $).getRegex();
var ht = c($e, "gu").replace(/notPunctSpace/g, it).replace(/punctSpace/g, st).replace(/punct/g, ye).getRegex();
var dt = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)";
var gt = c(dt, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, j).replace(/punct/g, $).getRegex();
var kt = c("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, j).replace(/punct/g, $).getRegex();
var ft = "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)";
var mt = c(ft, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, j).replace(/punct/g, $).getRegex();
var xt = c(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, $).getRegex();
var bt = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)";
var Rt = c(bt, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, j).replace(/punct/g, $).getRegex();
var Tt = c(/\\(punct)/, "gu").replace(/punct/g, $).getRegex();
var Ot = c(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/, "gu").replace(/punct/g, $).getRegex();
var wt = c(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var Pt = c(ue).replace("(?:-->|$)", "-->").getRegex();
var St = c("^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Pt).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var Le = /\[(?:\\[\s\S]|[^\[\]\\])*\]/;
var re = c(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace("brackets", Le).getRegex();
var yt = c(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace("label", re).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\((?:\\[\s\S]|[^)\\])*\)/).getRegex();
var _t = c(/^!?\[(label)\]\[(ref)\]/).replace("label", re).replace("ref", le).getRegex();
var $t = c(/^!?\[(ref)\](?:\[\])?/).replace("ref", le).getRegex();
var be = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/;
var Lt = c(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace("brackets", Le).getRegex();
var Ct = c("reflink|nolink(?!\\()", "g").replace("reflink", c(/^!?\[(label)\]\[(ref)\]/).replace("label", Lt).replace("ref", be).getRegex()).replace("nolink", c(/^!?\[(ref)\](?:\[\])?/).replace("ref", be).getRegex()).getRegex();
var Re = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
var It = /[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/;
var At = c(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g, It).getRegex();
var ce = { _backpedal: B, anyPunctuation: Tt, anyPunctuationOutsideCode: Ot, autolink: wt, blockSkip: ot, br: Se, code: et, del: B, delLDelim: B, delRDelim: B, emStrongLDelim: at, emStrongRDelimAst: ct, emStrongRDelimUnd: kt, escape: Ye, link: yt, nolink: $t, punctuation: nt, reflink: _t, reflinkSearch: Ct, tag: St, text: tt, url: B };
var Et = { ...ce, emStrongLDelim: pt, emStrongRDelimAst: gt, emStrongRDelimUnd: mt, link: c(/^!?\[(label)\]\((.*?)\)/).replace("label", re).getRegex(), reflink: c(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", re).getRegex() };
var ie = { ...ce, emStrongRDelimAst: ht, emStrongLDelim: lt, delLDelim: xt, delRDelim: Rt, url: c(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("emailProtocol", At).replace("protocol", Re).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: c(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|wwwStart|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace("protocol", Re).replace(/emailProtocol/g, /(?:mailto|xmpp):/).replace("wwwStart", Te ? "(?<![^\\s*_~(])www\\." : "www\\.").getRegex() };
var zt = { ...ie, br: c(Se).replace("{2,}", "*").getRegex(), text: c(ie.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
var V = { normal: pe, gfm: Ve, pedantic: Je };
var G = { normal: ce, gfm: ie, breaks: zt, pedantic: Et };
var Mt = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var Ce = (a3) => Mt[a3];
function P(a3, e) {
  if (e) {
    if (T.escapeTest.test(a3)) return a3.replace(T.escapeReplace, Ce);
  } else if (T.escapeTestNoEncode.test(a3)) return a3.replace(T.escapeReplaceNoEncode, Ce);
  return a3;
}
function Ie(a3) {
  return T.numericCharacterReference.test(a3) ? a3.replace(T.numericCharacterReferenceOrAmpersand, (e, t, n) => {
    if (t === void 0 && n === void 0) return "&amp;";
    let s = t === void 0 ? Number.parseInt(n, 16) : Number.parseInt(t, 10);
    return s === 0 || s > 1114111 || s >= 55296 && s <= 57343 ? "\uFFFD" : s === 38 ? "&amp;" : String.fromCodePoint(s);
  }) : a3;
}
function he(a3) {
  try {
    a3 = encodeURI(a3).replace(T.percentDecode, "%");
  } catch {
    return null;
  }
  return a3;
}
function de(a3, e) {
  let t = a3.replace(T.findPipe, (r2, o, i2) => {
    let l = false, p = o;
    for (; --p >= 0 && i2[p] === "\\"; ) l = !l;
    return l ? "|" : " |";
  }), n = t.split(T.splitPipe), s = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e) if (n.length > e) n.splice(e);
  else for (; n.length < e; ) n.push("");
  for (; s < n.length; s++) n[s] = n[s].trim().replace(T.slashPipe, "|");
  return n;
}
function L(a3, e, t) {
  let n = a3.length;
  if (n === 0) return "";
  let s = 0;
  for (; s < n; ) {
    let r2 = a3.charAt(n - s - 1);
    if (r2 === e && !t) s++;
    else if (r2 !== e && t) s++;
    else break;
  }
  return a3.slice(0, n - s);
}
function ge(a3) {
  let e = a3.split(`
`), t = e.length - 1;
  for (; t >= 0 && T.blankLine.test(e[t]); ) t--;
  return e.length - t <= 2 ? a3 : e.slice(0, t + 1).join(`
`);
}
function F(a3) {
  return a3.trim().replace(T.multipleSpaceGlobal, " ").toLowerCase().toUpperCase().toLowerCase();
}
function ke(a3, e) {
  if (a3.indexOf(e[0]) === -1 && a3.indexOf(e[1]) === -1) return -1;
  let t = 0;
  for (let n = 0; n < a3.length; n++) if (a3[n] === "\\") n++;
  else if (a3[n] === e[0]) t++;
  else if (a3[n] === e[1] && (t--, t < 0)) return n;
  return t > 0 ? -2 : -1;
}
var N = /* @__PURE__ */ new WeakMap();
function fe(a3) {
  let e = { "*": -1, _: -1 }, t = -1, n = a3.length;
  for (let s = 0; s < n; s++) {
    let r2 = a3[s];
    if (r2 !== "*" && r2 !== "_" && r2 !== "~") continue;
    let o = s === 0 ? `
` : a3[s - 1], i2 = s + 1;
    for (; i2 < n && a3[i2] === r2; ) i2++;
    o !== " " && o !== "	" && o !== `
` && o !== "\r" && o !== "\f" && (r2 === "~" ? t = s : e[r2] = s), s = i2 - 1;
  }
  return { maskedSrc: a3, lastPossibleEmStrongCloserIndex: e, lastPossibleDelCloserIndex: t };
}
function Ae(a3, e) {
  let t = fe(e), n = N.get(a3);
  n ? n.push(t) : N.set(a3, [t]);
}
function Ee(a3) {
  let e = N.get(a3);
  e && (e.pop(), e.length === 0 && N.delete(a3));
}
function ze(a3, e, t) {
  let n = N.get(a3)?.at(-1);
  return n && n.maskedSrc === e ? n.lastPossibleEmStrongCloserIndex[t] : fe(e).lastPossibleEmStrongCloserIndex[t];
}
function Me(a3, e) {
  let t = N.get(a3)?.at(-1);
  return t && t.maskedSrc === e ? t.lastPossibleDelCloserIndex : fe(e).lastPossibleDelCloserIndex;
}
function J(a3, e = 0) {
  let t = e, n = "";
  for (let s of a3) if (s === "	") {
    let r2 = 4 - t % 4;
    n += " ".repeat(r2), t += r2;
  } else n += s, t++;
  return n;
}
function De(a3, e, t, n, s) {
  let r2 = e.href, o = e.title || null, i2 = a3[1].replace(s.other.outputLinkReplace, "$1"), l = a3[0].charAt(0) === "!", p = n.state.inLink, h = n.state.linkEmitted, u = n.state.inRawBlock;
  n.state.inLink = true, n.state.linkEmitted = false;
  let d = n.inlineTokens(i2), k = n.state.linkEmitted;
  if (n.state.linkEmitted = h, n.state.inLink = p, !l) {
    if (k) {
      n.state.inRawBlock = u;
      return;
    }
    n.state.linkEmitted = true;
  }
  return { type: l ? "image" : "link", raw: t, href: r2, title: o, text: i2, tokens: d };
}
function Dt(a3, e, t) {
  let n = a3.match(t.other.indentCodeCompensation);
  if (n === null) return e;
  let s = n[1];
  return e.split(`
`).map((r2) => {
    let o = r2.match(t.other.beginningSpace);
    if (o === null) return r2;
    let [i2] = o;
    return r2.slice(Math.min(i2.length, s.length));
  }).join(`
`);
}
function Be(a3, e, t, n) {
  if (!e.includes("<")) return false;
  for (let s = 0; s < e.length; s++) {
    if (e[s] === "\\") {
      s++;
      continue;
    }
    if (e[s] === "`") {
      let i2 = n.inline.code.exec(e.slice(s));
      if (i2) {
        s += i2[0].length - 1;
        continue;
      }
    }
    if (e[s] !== "<") continue;
    let r2 = a3.slice(t + s), o = n.inline.tag.exec(r2) || n.inline.autolink.exec(r2);
    if (o) {
      if (o[0].length > e.length - s) return true;
      s += o[0].length - 1;
    }
  }
  return false;
}
var _ = class {
  options;
  rules;
  lexer;
  constructor(e) {
    this.options = e || S;
  }
  space(e) {
    let t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0) return { type: "space", raw: t[0] };
  }
  code(e) {
    let t = this.rules.block.code.exec(e);
    if (t) {
      let n = this.options.pedantic ? t[0] : ge(t[0]), s = n.replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: n, codeBlockStyle: "indented", text: s };
    }
  }
  fences(e) {
    let t = this.rules.block.fences.exec(e);
    if (t) {
      let n = t[0], s = Dt(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: s };
    }
  }
  heading(e) {
    let t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let s = L(n, "#");
        (this.options.pedantic || !s || this.rules.other.endingSpaceTabChar.test(s)) && (n = s.trim());
      }
      return { type: "heading", raw: L(t[0], `
`), depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t = this.rules.block.hr.exec(e);
    if (t) return { type: "hr", raw: L(t[0], `
`) };
  }
  blockquote(e) {
    let t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = L(t[0], `
`).split(`
`), s = "", r2 = "", o = [];
      for (; n.length > 0; ) {
        let i2 = false, l = [], p;
        for (p = 0; p < n.length; p++) if (this.rules.other.blockquoteStart.test(n[p])) l.push(n[p]), i2 = true;
        else if (!i2) l.push(n[p]);
        else break;
        n = n.slice(p);
        let h = l.join(`
`), u = h.replace(this.rules.other.blockquoteMarkerWhitespace, (g, b, m) => b + J(m, b.length)).replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${h}` : h, r2 = r2 ? `${r2}
${u}` : u;
        let d = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(u, o, true), this.lexer.state.top = d, n.length === 0) break;
        let k = o.at(-1);
        if (k?.type === "code" || k?.type === "heading" || k?.type === "hr" || k?.type === "html" || k?.type === "table") break;
        if (k?.type === "blockquote") {
          let g = k, b = n.join(`
`), m = g.raw + `
` + b.replace(this.rules.other.blockquoteSetextReplace2, ""), f = this.blockquote(m);
          o[o.length - 1] = f;
          let y = m.substring(f.raw.length).replace(/^\n/, ""), R = y ? y.split(`
`).length : 0, A = R ? n.slice(0, -R) : n;
          if (A.length > 0 && (s = `${s}
${A.join(`
`)}`), r2 = r2.substring(0, r2.length - g.text.length) + f.text, n = n.slice(A.length), n.length > 0 && this.rules.other.blockquoteStart.test(n[0])) continue;
          break;
        } else if (k?.type === "list") {
          let g = k, b = g.raw + `
` + n.join(`
`), m = this.list(b);
          o[o.length - 1] = m;
          let f = m.raw.length > g.raw.length ? b.slice(g.raw.length + 1, m.raw.length).split(`
`).length : 0;
          if (f > 0) {
            let y = n.slice(0, f).join(`
`);
            s = `${s}
${y}`, r2 = `${r2}
${y}`;
          }
          n = n.slice(f);
          continue;
        }
      }
      return { type: "blockquote", raw: s, tokens: o, text: r2 };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = e, s = () => n.length - e.length, r2 = t[1].trim(), o = r2.length > 1, i2 = { type: "list", raw: "", ordered: o, start: o ? +r2.slice(0, -1) : "", loose: false, items: [] };
      r2 = o ? `\\d{1,9}\\${r2.slice(-1)}` : `\\${r2}`, this.options.pedantic && (r2 = o ? r2 : "[*+-]");
      let l = this.rules.other.listItemRegex(r2), p = false;
      for (; e; ) {
        let u = false, d = "";
        if (!(t = l.exec(e)) || this.rules.block.hr.test(e)) break;
        let k = s();
        e = e.substring(t[0].length);
        let g = t[2].split(`
`, 1)[0], b = t[1].length, m = this.options.pedantic ? J(g, b) : g.replace(this.rules.other.leadingSpaceTab, (v) => J(v, b)), f = e.split(`
`, 1)[0], y = !m.trim(), R = 0;
        if (this.options.pedantic ? (R = 2, d = m.trimStart()) : y ? R = b + 1 : (R = m.search(this.rules.other.nonSpaceChar), R = R > 4 ? 1 : R, d = m.slice(R), R += b), y && this.rules.other.blankLine.test(f) && (e = e.substring(f.length + 1), u = true), !u) {
          let v = this.rules.other.nextBulletRegex(R), Q = this.rules.other.hrRegex(R), ee = this.rules.other.fencesBeginRegex(R), te = this.options.pedantic ? this.rules.other.pedanticHeadingBeginRegex(R) : this.rules.other.headingBeginRegex(R), M = this.rules.other.htmlBeginRegex(R), ne = this.rules.other.blockquoteBeginRegex(R);
          for (; e; ) {
            let U = e.split(`
`, 1)[0], Z;
            if (f = U, this.options.pedantic ? (f = f.replace(this.rules.other.listReplaceNesting, "  "), Z = f) : Z = f.replace(this.rules.other.leadingSpaceTab, (me) => J(me)), ee.test(f) || te.test(f) || M.test(f) || ne.test(f) || v.test(f) || Q.test(f)) break;
            if (Z.search(this.rules.other.nonSpaceChar) >= R || !f.trim()) d += `
` + Z.slice(R);
            else {
              if (y || m.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ee.test(m) || te.test(m) || M.test(m) || Q.test(m)) break;
              let qe = !this.options.pedantic && /^ {0,3}(?:=+|-+) *$/.test(f) && this.rules.block.lheading.test(`${m}
${f}`) ? `    ${Z.replace(/^ {0,3}/, "")}` : f;
              d += `
` + qe;
            }
            y = !f.trim(), e = e.substring(U.length + 1), m = Z.slice(R);
          }
        }
        let A = n.slice(k, s());
        i2.loose || (p ? i2.loose = true : this.rules.other.doubleBlankLine.test(A) && (p = true)), i2.items.push({ type: "list_item", raw: A, task: !!this.options.gfm && this.rules.other.listIsTask.test(d), loose: false, text: d, tokens: [] });
      }
      let h = i2.items.at(-1);
      if (h) h.raw = h.raw.trimEnd(), h.text = h.text.trimEnd();
      else return;
      i2.raw = n.slice(0, s()).trimEnd();
      for (let u of i2.items) if (this.lexer.state.top = false, u.tokens = this.lexer.blockTokens(u.text, []), !i2.loose) {
        let d = u.tokens.filter((g) => g.type === "space"), k = d.length > 0 && d.some((g) => this.rules.other.anyLine.test(g.raw));
        i2.loose = k;
      }
      for (let u of i2.items) {
        let d = u.tokens[0];
        if (u.task && (d?.type === "text" || d?.type === "paragraph")) {
          u.text = u.text.replace(this.rules.other.listReplaceTask, ""), d.raw = d.raw.replace(this.rules.other.listReplaceTask, ""), d.text = d.text.replace(this.rules.other.listReplaceTask, "");
          for (let g = this.lexer.inlineQueue.length - 1; g >= 0; g--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[g].src)) {
            this.lexer.inlineQueue[g].src = this.lexer.inlineQueue[g].src.replace(this.rules.other.listReplaceTask, "");
            break;
          }
          let k = this.rules.other.listTaskCheckbox.exec(u.raw);
          if (k) {
            let g = { type: "checkbox", raw: k[0] + " ", checked: k[0] !== "[ ]" };
            u.checked = g.checked, i2.loose ? u.tokens[0] && ["paragraph", "text"].includes(u.tokens[0].type) && "tokens" in u.tokens[0] && u.tokens[0].tokens ? (u.tokens[0].raw = g.raw + u.tokens[0].raw, u.tokens[0].text = g.raw + u.tokens[0].text, u.tokens[0].tokens.unshift(g)) : u.tokens.unshift({ type: "paragraph", raw: g.raw, text: g.raw, tokens: [g] }) : u.tokens.unshift(g);
          }
        } else u.task && (u.task = false);
      }
      if (i2.loose) for (let u of i2.items) {
        u.loose = true;
        for (let d of u.tokens) d.type === "text" && (d.type = "paragraph");
      }
      return i2;
    }
  }
  html(e) {
    let t = this.rules.block.html.exec(e);
    if (t) {
      let n = ge(t[0]);
      return { type: "html", block: true, raw: n, pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: n };
    }
  }
  def(e) {
    let t = this.rules.block.def.exec(e);
    if (t) {
      if (!this.rules.other.startAngleBracket.test(t[2]) && ke(t[2], "()") !== -1) return;
      let n = F(t[1]), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r2 = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: L(t[0], `
`), href: s, title: r2 };
    }
  }
  table(e) {
    let t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
    let n = de(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r2 = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], o = { type: "table", raw: L(t[0], `
`), header: [], align: [], rows: [] };
    if (n.length === s.length) {
      for (let i2 of s) this.rules.other.tableAlignRight.test(i2) ? o.align.push("right") : this.rules.other.tableAlignCenter.test(i2) ? o.align.push("center") : this.rules.other.tableAlignLeft.test(i2) ? o.align.push("left") : o.align.push(null);
      for (let i2 = 0; i2 < n.length; i2++) o.header.push({ text: n[i2], tokens: this.lexer.inline(n[i2]), header: true, align: o.align[i2] });
      for (let i2 of r2) o.rows.push(de(i2, o.header.length).map((l, p) => ({ text: l, tokens: this.lexer.inline(l), header: false, align: o.align[p] })));
      return o;
    }
  }
  lheading(e) {
    let t = this.rules.block.lheading.exec(e);
    if (t) {
      let n = t[1].trim();
      return { type: "heading", raw: L(t[0], `
`), depth: t[2].charAt(0) === "=" ? 1 : 2, text: n, tokens: this.lexer.inline(n) };
    }
  }
  paragraph(e) {
    let t = this.rules.block.paragraph.exec(e);
    if (t) {
      let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t = this.rules.block.text.exec(e);
    if (t) return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    let t = this.rules.inline.escape.exec(e);
    if (t) return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    let t = this.rules.inline.tag.exec(e);
    if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
  }
  link(e) {
    if (this.lexer.state.linkParenPossible === false) return;
    let t = this.rules.inline.link.exec(e);
    if (t) {
      let n = t[0].charAt(0) === "!" ? 2 : 1;
      if (!this.options.pedantic && Be(e, t[1], n, this.rules)) return;
      let s = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(s)) {
        if (!this.rules.other.endAngleBracket.test(s)) return;
        let l = L(s.slice(0, -1), "\\");
        if ((s.length - l.length) % 2 === 0) return;
      } else {
        let l = ke(t[2], "()");
        if (l === -2) return;
        if (l > -1) {
          let h = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + l;
          t[2] = t[2].substring(0, l), t[0] = t[0].substring(0, h).trim(), t[3] = "";
        }
      }
      let r2 = L(t[0].slice(0, -1), "\\");
      if ((t[0].length - r2.length) % 2 === 0) return;
      let o = t[2], i2 = "";
      if (this.options.pedantic) {
        let l = this.rules.other.pedanticHrefTitle.exec(o);
        l && (o = l[1], i2 = l[3]);
      } else i2 = t[3] ? t[3].slice(1, -1) : "";
      return o = o.trim(), this.rules.other.startAngleBracket.test(o) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(s) ? o = o.slice(1) : o = o.slice(1, -1)), De(t, { href: o && o.replace(this.rules.inline.anyPunctuation, "$1"), title: i2 && i2.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let s = n[0].charAt(0) === "!" ? 2 : 1;
      if (!this.options.pedantic && Be(e, n[1], s, this.rules)) return;
      let r2 = t[F(n[2] || n[1])];
      if (!r2) {
        let o = n[0].charAt(0);
        return { type: "text", raw: o, text: o };
      }
      return De(n, r2, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || !s[1] && !s[2] && !s[3] && !s[4]) return;
    let r2 = s[0][0], o = n === r2, i2 = t.length - e.length, l = i2;
    for (; !this.options.pedantic && l > 0 && t[l - 1] === r2; ) l--;
    let p = [...t.slice(Math.max(0, l - 2), l)].at(-1) ?? "", h = p === "*" || p === "_" || !!this.rules.inline.punctuation.exec(p);
    l < i2 && (n = p);
    let u = l < i2 ? h : !!this.rules.inline.punctuation.exec(n);
    if (s[4] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    let d = s[1] || s[3] || "";
    if (!d || !n || u) {
      let k = [...s[0]].length - 1, g, b, m = k, f = 0, y = i2 - l + k, R = !this.options.pedantic && !!p.trim() && (!!d || r2 === "*" && !h);
      if (r2 !== "*" && r2 !== "_") return;
      let A = r2 === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd, v = ze(this, t, r2), Q = t.length - e.length + k;
      if (v < Q) return;
      t = t.slice(-1 * e.length + k);
      let ee = v - Q;
      for (A.lastIndex = 0; (s = A.exec(t)) !== null && !(s.index > ee); ) {
        if (g = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !g) continue;
        if (b = [...g].length, s[3] || s[4]) {
          m += b;
          continue;
        } else if (s[5] || s[6] || R) {
          if (o && (s[5] || s[6])) break;
          if (y % 3 && !((y + b) % 3)) {
            f += b;
            continue;
          }
        }
        if (m -= b, m > 0) continue;
        b = Math.min(b, b + m + f);
        let te = [...s[0]][0].length, M = e.slice(0, k + s.index + te + b);
        if (Math.min(k, b) % 2) {
          let U = M.slice(1, -1);
          return { type: "em", raw: M, text: U, tokens: this.lexer.inlineTokens(U) };
        }
        let ne = M.slice(2, -2);
        return { type: "strong", raw: M, text: ne, tokens: this.lexer.inlineTokens(ne) };
      }
    }
  }
  codespan(e) {
    let t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), s = this.rules.other.nonSpaceChar.test(n), r2 = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return s && r2 && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    let t = this.rules.inline.br.exec(e);
    if (t) return { type: "br", raw: t[0] };
  }
  del(e, t, n = "") {
    let s = this.rules.inline.delLDelim.exec(e);
    if (!s) return;
    if (!(s[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let o = [...s[0]].length - 1, i2, l, p = o, h = this.rules.inline.delRDelim, u = Me(this, t), d = t.length - e.length + o;
      if (u < d) return;
      t = t.slice(-1 * e.length + o);
      let k = u - d;
      for (h.lastIndex = 0; (s = h.exec(t)) !== null && !(s.index > k); ) {
        if (i2 = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !i2 || (l = [...i2].length, l !== o)) continue;
        if (s[3] || s[4]) {
          p += l;
          continue;
        }
        if (p -= l, p > 0) continue;
        l = Math.min(l, l + p);
        let g = [...s[0]][0].length, b = e.slice(0, o + s.index + g + l), m = b.slice(o, -o);
        return { type: "del", raw: b, text: m, tokens: this.lexer.inlineTokens(m) };
      }
    }
  }
  autolink(e) {
    let t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, s;
      return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), { type: "link", raw: t[0], text: n, href: s, autolink: true, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let n, s;
      if (t[2] === "@") n = t[0], s = "mailto:" + n;
      else {
        let r2;
        do
          r2 = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (r2 !== t[0]);
        n = t[0], t[1] === "www." ? s = "http://" + t[0] : s = t[0];
      }
      return { type: "link", raw: t[0], text: n, href: s, autolink: true, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t = this.rules.inline.text.exec(e);
    if (t) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: n ? t[0] : Ie(t[0]), escaped: n };
    }
  }
};
var O = class a {
  tokens;
  options;
  state;
  inlineQueue;
  tokenizer;
  constructor(e) {
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || S, this.options.tokenizer = this.options.tokenizer || new _(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, linkEmitted: false, linkParenPossible: true, top: true };
    let t = { other: T, block: V.normal, inline: G.normal };
    this.options.pedantic ? (t.block = V.pedantic, t.inline = G.pedantic) : this.options.gfm && (t.block = V.gfm, this.options.breaks ? t.inline = G.breaks : t.inline = G.gfm), this.tokenizer.rules = t;
  }
  static get rules() {
    return { block: V, inline: G };
  }
  static lex(e, t) {
    return new a(t).lex(e);
  }
  static lexInline(e, t) {
    return new a(t).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(T.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0; t < this.inlineQueue.length; t++) {
      let n = this.inlineQueue[t];
      this.state.inRawBlock = false, this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = [], n = false) {
    this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(T.tabCharGlobal, "    ").replace(T.spaceLine, ""));
    let s = 1 / 0;
    for (; e; ) {
      if (e.length < s) s = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      let r2;
      if (this.options.extensions?.block?.some((i2) => (r2 = i2.call({ lexer: this }, e, t)) ? (e = e.substring(r2.raw.length), t.push(r2), true) : false)) continue;
      if (r2 = this.tokenizer.space(e)) {
        e = e.substring(r2.raw.length);
        let i2 = t.at(-1);
        r2.raw.length === 1 && i2 !== void 0 ? i2.raw += `
` : t.push(r2);
        continue;
      }
      if (r2 = this.tokenizer.code(e)) {
        e = e.substring(r2.raw.length);
        let i2 = t.at(-1);
        i2?.type === "paragraph" || i2?.type === "text" ? (i2.raw += (i2.raw.endsWith(`
`) ? "" : `
`) + r2.raw, i2.text += `
` + r2.text, this.inlineQueue.at(-1).src = i2.text) : t.push(r2);
        continue;
      }
      if (r2 = this.tokenizer.fences(e)) {
        e = e.substring(r2.raw.length), t.push(r2);
        continue;
      }
      if (r2 = this.tokenizer.heading(e)) {
        e = e.substring(r2.raw.length), t.push(r2);
        continue;
      }
      if (r2 = this.tokenizer.hr(e)) {
        e = e.substring(r2.raw.length), t.push(r2);
        continue;
      }
      if (r2 = this.tokenizer.blockquote(e)) {
        e = e.substring(r2.raw.length), t.push(r2);
        continue;
      }
      if (r2 = this.tokenizer.list(e)) {
        e = e.substring(r2.raw.length), t.push(r2);
        continue;
      }
      if (r2 = this.tokenizer.html(e)) {
        e = e.substring(r2.raw.length), t.push(r2);
        continue;
      }
      if (r2 = this.tokenizer.def(e)) {
        e = e.substring(r2.raw.length);
        let i2 = t.at(-1);
        i2?.type === "paragraph" || i2?.type === "text" ? (i2.raw += (i2.raw.endsWith(`
`) ? "" : `
`) + r2.raw, i2.text += `
` + r2.raw, this.inlineQueue.at(-1).src = i2.text) : (this.tokens.links[r2.tag] || (this.tokens.links[r2.tag] = { href: r2.href, title: r2.title }), t.push(r2));
        continue;
      }
      if (r2 = this.tokenizer.table(e)) {
        e = e.substring(r2.raw.length), t.push(r2);
        continue;
      }
      if (r2 = this.tokenizer.lheading(e)) {
        e = e.substring(r2.raw.length), t.push(r2);
        continue;
      }
      let o = e;
      if (this.options.extensions?.startBlock) {
        let i2 = 1 / 0, l = e.slice(1), p;
        this.options.extensions.startBlock.forEach((h) => {
          p = h.call({ lexer: this }, l), typeof p == "number" && p >= 0 && (i2 = Math.min(i2, p));
        }), i2 < 1 / 0 && i2 >= 0 && (o = e.substring(0, i2 + 1));
      }
      if (this.state.top && (r2 = this.tokenizer.paragraph(o))) {
        let i2 = t.at(-1);
        n && i2?.type === "paragraph" ? (i2.raw += (i2.raw.endsWith(`
`) ? "" : `
`) + r2.raw, i2.text += `
` + r2.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = i2.text) : t.push(r2), n = o.length !== e.length, e = e.substring(r2.raw.length);
        continue;
      }
      if (r2 = this.tokenizer.text(e)) {
        e = e.substring(r2.raw.length);
        let i2 = t.at(-1);
        i2?.type === "text" ? (i2.raw += (i2.raw.endsWith(`
`) ? "" : `
`) + r2.raw, i2.text += `
` + r2.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = i2.text) : t.push(r2);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return this.state.top = true, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  linkInText(e) {
    if (!e.includes("[")) return false;
    let t = this.tokenizer.rules.inline.link;
    for (let n of e.matchAll(this.tokenizer.rules.inline.blockSkip)) if (t.test(n[0]) && e.charAt(n.index - 1) !== "!") return true;
    for (let n of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)) {
      let s = n[0], r2 = s.lastIndexOf("[");
      if (!(s.charAt(0) === "!" || !Object.hasOwn(this.tokens.links, F(s.slice(r2 + 1, -1)))) && !(r2 > 1 && this.linkInText(s.slice(1, r2 - 1)))) return true;
    }
    return false;
  }
  inlineTokens(e, t = []) {
    this.tokenizer.lexer = this;
    let n = this.state.linkParenPossible;
    this.state.linkParenPossible = n && e.includes(")");
    try {
      return this.#e(e, t);
    } finally {
      this.state.linkParenPossible = n;
    }
  }
  #e(e, t) {
    let n = e.includes("*") || e.includes("_") || e.includes("~") || this.options.hooks?.emStrongMask || this.tokenizer.emStrong !== _.prototype.emStrong || this.tokenizer.del !== _.prototype.del ? this.#n(e) : e;
    Ae(this.tokenizer, n);
    try {
      return this.#t(e, n, t);
    } finally {
      Ee(this.tokenizer);
    }
  }
  #t(e, t, n) {
    let s = false, r2 = "", o = 1 / 0;
    for (; e; ) {
      if (e.length < o) o = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      s || (r2 = ""), s = false;
      let i2;
      if (this.options.extensions?.inline?.some((p) => (i2 = p.call({ lexer: this }, e, n)) ? (e = e.substring(i2.raw.length), n.push(i2), true) : false)) continue;
      if (i2 = this.tokenizer.escape(e)) {
        e = e.substring(i2.raw.length), n.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.tag(e)) {
        e = e.substring(i2.raw.length), n.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.link(e)) {
        e = e.substring(i2.raw.length), n.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(i2.raw.length);
        let p = n.at(-1);
        i2.type === "text" && p?.type === "text" ? (p.raw += i2.raw, p.text += i2.text) : n.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.emStrong(e, t, r2)) {
        e = e.substring(i2.raw.length), n.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.codespan(e)) {
        e = e.substring(i2.raw.length), n.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.br(e)) {
        e = e.substring(i2.raw.length), n.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.del(e, t, r2)) {
        e = e.substring(i2.raw.length), n.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.autolink(e)) {
        e = e.substring(i2.raw.length), n.push(i2);
        continue;
      }
      if (!this.state.inLink && (i2 = this.tokenizer.url(e))) {
        e = e.substring(i2.raw.length), n.push(i2);
        continue;
      }
      let l = e;
      if (this.options.extensions?.startInline) {
        let p = 1 / 0, h = e.slice(1), u;
        this.options.extensions.startInline.forEach((d) => {
          u = d.call({ lexer: this }, h), typeof u == "number" && u >= 0 && (p = Math.min(p, u));
        }), p < 1 / 0 && p >= 0 && (l = e.substring(0, p + 1));
      }
      if (i2 = this.tokenizer.inlineText(l)) {
        e = e.substring(i2.raw.length), i2.raw.slice(-1) !== "_" && (r2 = i2.raw.slice(-1)), s = true;
        let p = n.at(-1);
        p?.type === "text" ? (p.raw += i2.raw, p.text += i2.text) : n.push(i2);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return n;
  }
  #n(e) {
    let t = e;
    if (this.tokens.links && e.includes("[")) {
      let n = this.tokenizer.rules.inline.reflinkSearch, s = (r2) => {
        let o = r2.lastIndexOf("[");
        if (!Object.hasOwn(this.tokens.links, F(r2.slice(o + 1, -1)))) return r2;
        if (o > 1 && r2.charAt(0) !== "!") {
          let i2 = r2.slice(1, o - 1);
          if (this.linkInText(i2)) return "[" + i2.replace(n, s) + "][" + "a".repeat(r2.length - o - 2) + "]";
        }
        return "[" + "a".repeat(r2.length - 2) + "]";
      };
      t = t.replace(n, s);
    }
    return t = t.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode, (n, s, r2) => r2 ? "+".repeat(n.length) : s ? s + n.slice(s.length, -s.length).replace(/`/g, "+") + s : n), t = t.replace(this.tokenizer.rules.inline.blockSkip, (n, s, r2) => {
      let o = r2 ? r2.length : 0;
      return n.slice(0, o) + "[" + "a".repeat(n.length - o - 2) + "]";
    }), t = this.options.hooks?.emStrongMask?.call({ lexer: this }, t) ?? t, t;
  }
  infiniteLoopError(e) {
    let t = "Infinite loop on byte: " + e;
    if (this.options.silent) console.error(t);
    else throw new Error(t);
  }
};
var C = class {
  options;
  parser;
  constructor(e) {
    this.options = e || S;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    let s = (t || "").match(T.notSpaceStart)?.[0], r2 = e ? e.replace(T.endingNewline, "") + `
` : "";
    return s ? '<pre><code class="language-' + P(s) + '">' + (n ? r2 : P(r2, true)) + `</code></pre>
` : "<pre><code>" + (n ? r2 : P(r2, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let t = e.ordered, n = e.start, s = "";
    for (let i2 = 0; i2 < e.items.length; i2++) {
      let l = e.items[i2];
      s += this.listitem(l);
    }
    let r2 = t ? "ol" : "ul", o = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + r2 + o + `>
` + s + "</" + r2 + `>
`;
  }
  listitem(e) {
    return `<li>${this.parser.parse(e.tokens)}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let r2 = 0; r2 < e.header.length; r2++) n += this.tablecell(e.header[r2]);
    t += this.tablerow({ text: n });
    let s = "";
    for (let r2 = 0; r2 < e.rows.length; r2++) {
      let o = e.rows[r2];
      n = "";
      for (let i2 = 0; i2 < o.length; i2++) n += this.tablecell(o[i2]);
      s += this.tablerow({ text: n });
    }
    return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + s + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${P(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, text: n, tokens: s, autolink: r2 }) {
    let o = r2 ? P(n, true) : this.parser.parseInline(s), i2 = he(e);
    if (i2 === null) return o;
    e = P(i2, r2);
    let l = '<a href="' + e + '"';
    return t && (l += ' title="' + P(t) + '"'), l += ">" + o + "</a>", l;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    let r2 = he(e);
    if (r2 === null) return P(n);
    e = r2;
    let o = `<img src="${P(e)}" alt="${P(n)}"`;
    return t && (o += ` title="${P(t)}"`), o += ">", o;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : P(e.text);
  }
};
var E = class {
  parser;
  strong({ text: e, tokens: t }) {
    return t ? this.parser.parseInline(t, this) : e;
  }
  em({ text: e, tokens: t }) {
    return t ? this.parser.parseInline(t, this) : e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e, tokens: t }) {
    return t ? this.parser.parseInline(t, this) : e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e, tokens: t }) {
    return t ? this.parser.parseInline(t, this) : e;
  }
  image({ text: e, tokens: t }) {
    return t ? this.parser.parseInline(t, this) : e;
  }
  br() {
    return "";
  }
  checkbox({ raw: e }) {
    return e;
  }
};
var w = class a2 {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || S, this.options.renderer = this.options.renderer || new C(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new E(), this.textRenderer.parser = this;
  }
  static parse(e, t) {
    return new a2(t).parse(e);
  }
  static parseInline(e, t) {
    return new a2(t).parseInline(e);
  }
  parse(e) {
    this.renderer.parser = this;
    let t = "";
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      if (this.options.extensions?.renderers?.[s.type]) {
        let o = s, i2 = this.options.extensions.renderers[o.type].call({ parser: this }, o);
        if (i2 !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "checkbox", "html", "def", "paragraph", "text"].includes(o.type)) {
          t += i2 || "";
          continue;
        }
      }
      let r2 = s;
      switch (r2.type) {
        case "space": {
          t += this.renderer.space(r2);
          break;
        }
        case "hr": {
          t += this.renderer.hr(r2);
          break;
        }
        case "heading": {
          t += this.renderer.heading(r2);
          break;
        }
        case "code": {
          t += this.renderer.code(r2);
          break;
        }
        case "table": {
          t += this.renderer.table(r2);
          break;
        }
        case "blockquote": {
          t += this.renderer.blockquote(r2);
          break;
        }
        case "list": {
          t += this.renderer.list(r2);
          break;
        }
        case "checkbox": {
          t += this.renderer.checkbox(r2);
          break;
        }
        case "html": {
          t += this.renderer.html(r2);
          break;
        }
        case "def": {
          t += this.renderer.def(r2);
          break;
        }
        case "paragraph": {
          t += this.renderer.paragraph(r2);
          break;
        }
        case "text": {
          t += this.renderer.text(r2);
          break;
        }
        default: {
          let o = 'Token with "' + r2.type + '" type was not found.';
          if (this.options.silent) return console.error(o), "";
          throw new Error(o);
        }
      }
    }
    return t;
  }
  parseInline(e, t = this.renderer) {
    this.renderer.parser = this;
    let n = "";
    for (let s = 0; s < e.length; s++) {
      let r2 = e[s];
      if (this.options.extensions?.renderers?.[r2.type]) {
        let i2 = this.options.extensions.renderers[r2.type].call({ parser: this }, r2);
        if (i2 !== false || !["escape", "html", "link", "image", "checkbox", "strong", "em", "codespan", "br", "del", "text"].includes(r2.type)) {
          n += i2 || "";
          continue;
        }
      }
      let o = r2;
      switch (o.type) {
        case "escape": {
          n += t.text(o);
          break;
        }
        case "html": {
          n += t.html(o);
          break;
        }
        case "link": {
          n += t.link(o);
          break;
        }
        case "image": {
          n += t.image(o);
          break;
        }
        case "checkbox": {
          n += t.checkbox(o);
          break;
        }
        case "strong": {
          n += t.strong(o);
          break;
        }
        case "em": {
          n += t.em(o);
          break;
        }
        case "codespan": {
          n += t.codespan(o);
          break;
        }
        case "br": {
          n += t.br(o);
          break;
        }
        case "del": {
          n += t.del(o);
          break;
        }
        case "text": {
          n += t.text(o);
          break;
        }
        default: {
          let i2 = 'Token with "' + o.type + '" type was not found.';
          if (this.options.silent) return console.error(i2), "";
          throw new Error(i2);
        }
      }
    }
    return n;
  }
};
var I = class {
  options;
  block;
  constructor(e) {
    this.options = e || S;
  }
  static passThroughHooks = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  emStrongMask(e) {
    return e;
  }
  provideLexer(e = this.block) {
    return e ? O.lex : O.lexInline;
  }
  provideParser(e = this.block) {
    return e ? w.parse : w.parseInline;
  }
};
function z(a3, e) {
  if (Array.isArray(e)) for (let t = 0; t < e.length; t++) a3.push(e[t]);
  else a3.push(e);
}
var Y = class {
  defaults = H();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = w;
  Renderer = C;
  TextRenderer = E;
  Lexer = O;
  Tokenizer = _;
  Hooks = I;
  constructor(...e) {
    this.use(...e);
  }
  walkTokens(e, t) {
    let n = [];
    for (let s of e) switch (z(n, t.call(this, s)), s.type) {
      case "table": {
        let r2 = s;
        for (let o of r2.header) z(n, this.walkTokens(o.tokens, t));
        for (let o of r2.rows) for (let i2 of o) z(n, this.walkTokens(i2.tokens, t));
        break;
      }
      case "list": {
        let r2 = s;
        z(n, this.walkTokens(r2.items, t));
        break;
      }
      default: {
        let r2 = s;
        this.defaults.extensions?.childTokens?.[r2.type] ? this.defaults.extensions.childTokens[r2.type].forEach((o) => {
          let i2 = r2[o].flat(1 / 0);
          z(n, this.walkTokens(i2, t));
        }) : r2.tokens && z(n, this.walkTokens(r2.tokens, t));
      }
    }
    return n;
  }
  use(...e) {
    let t = this.defaults.extensions || { renderers: /* @__PURE__ */ Object.create(null), childTokens: /* @__PURE__ */ Object.create(null) };
    return e.forEach((n) => {
      let s = { ...n };
      if (s.async = this.defaults.async || s.async || false, n.extensions && (n.extensions.forEach((r2) => {
        if (!r2.name) throw new Error("extension name required");
        if ("renderer" in r2) {
          let o = t.renderers[r2.name];
          o ? t.renderers[r2.name] = function(...i2) {
            let l = r2.renderer.apply(this, i2);
            return l === false && (l = o.apply(this, i2)), l;
          } : t.renderers[r2.name] = r2.renderer;
        }
        if ("tokenizer" in r2) {
          if (!r2.level || r2.level !== "block" && r2.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
          let o = t[r2.level];
          o ? o.unshift(r2.tokenizer) : t[r2.level] = [r2.tokenizer], r2.start && (r2.level === "block" ? t.startBlock ? t.startBlock.push(r2.start) : t.startBlock = [r2.start] : r2.level === "inline" && (t.startInline ? t.startInline.push(r2.start) : t.startInline = [r2.start]));
        }
        "childTokens" in r2 && r2.childTokens && (t.childTokens[r2.name] = r2.childTokens);
      }), s.extensions = t), n.renderer) {
        let r2 = this.defaults.renderer || new C(this.defaults);
        for (let o in n.renderer) {
          if (!(o in r2)) throw new Error(`renderer '${o}' does not exist`);
          if (["options", "parser"].includes(o)) continue;
          let i2 = o, l = n.renderer[i2], p = r2[i2];
          r2[i2] = (...h) => {
            let u = l.apply(r2, h);
            return u === false && (u = p.apply(r2, h)), u === false ? "" : u ?? "";
          };
        }
        s.renderer = r2;
      }
      if (n.tokenizer) {
        let r2 = this.defaults.tokenizer || new _(this.defaults);
        for (let o in n.tokenizer) {
          if (!(o in r2)) throw new Error(`tokenizer '${o}' does not exist`);
          if (["options", "rules", "lexer"].includes(o)) continue;
          let i2 = o, l = n.tokenizer[i2], p = r2[i2];
          r2[i2] = (...h) => {
            let u = l.apply(r2, h);
            return u === false && (u = p.apply(r2, h)), u;
          };
        }
        s.tokenizer = r2;
      }
      if (n.hooks) {
        let r2 = this.defaults.hooks || new I();
        for (let o in n.hooks) {
          if (!(o in r2)) throw new Error(`hook '${o}' does not exist`);
          if (["options", "block"].includes(o)) continue;
          let i2 = o, l = n.hooks[i2], p = r2[i2];
          I.passThroughHooks.has(o) ? r2[i2] = (h) => {
            if (r2.options.async && I.passThroughHooksRespectAsync.has(o)) return (async () => {
              let d = await l.call(r2, h);
              return p.call(r2, d);
            })();
            let u = l.call(r2, h);
            return p.call(r2, u);
          } : r2[i2] = (...h) => {
            if (r2.options.async) return (async () => {
              let d = await l.apply(r2, h);
              return d === false && (d = await p.apply(r2, h)), d;
            })();
            let u = l.apply(r2, h);
            return u === false && (u = p.apply(r2, h)), u;
          };
        }
        s.hooks = r2;
      }
      if (n.walkTokens) {
        let r2 = this.defaults.walkTokens, o = n.walkTokens;
        s.walkTokens = function(i2) {
          let l = [];
          return z(l, o.call(this, i2)), r2 && z(l, r2.call(this, i2)), l;
        };
      }
      this.defaults = { ...this.defaults, ...s };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return O.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return w.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, s) => {
      let r2 = { ...s }, o = { ...this.defaults, ...r2 }, i2 = this.onError(!!o.silent, !!o.async);
      if (this.defaults.async === true && r2.async === false) return i2(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null) return i2(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string") return i2(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (o.hooks && (o.hooks.options = o, o.hooks.block = e), o.async) return (async () => {
        let l = o.hooks ? await o.hooks.preprocess(n) : n, h = await (o.hooks ? await o.hooks.provideLexer(e) : e ? O.lex : O.lexInline)(l, o), u = o.hooks ? await o.hooks.processAllTokens(h) : h;
        o.walkTokens && await Promise.all(this.walkTokens(u, o.walkTokens));
        let k = await (o.hooks ? await o.hooks.provideParser(e) : e ? w.parse : w.parseInline)(u, o);
        return o.hooks ? await o.hooks.postprocess(k) : k;
      })().catch(i2);
      try {
        o.hooks && (n = o.hooks.preprocess(n));
        let p = (o.hooks ? o.hooks.provideLexer(e) : e ? O.lex : O.lexInline)(n, o);
        o.hooks && (p = o.hooks.processAllTokens(p)), o.walkTokens && this.walkTokens(p, o.walkTokens);
        let u = (o.hooks ? o.hooks.provideParser(e) : e ? w.parse : w.parseInline)(p, o);
        return o.hooks && (u = o.hooks.postprocess(u)), u;
      } catch (l) {
        return i2(l);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let s = "<p>An error occurred:</p><pre>" + P(n.message + "", true) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t) return Promise.reject(n);
      throw n;
    };
  }
};
var q = new Y();
function x(a3, e) {
  return q.parse(a3, e);
}
x.options = x.setOptions = function(a3) {
  return q.setOptions(a3), x.defaults = q.defaults, se(x.defaults), x;
};
x.getDefaults = H;
x.defaults = S;
function Bt(...a3) {
  return q.use(...a3), x.defaults = q.defaults, se(x.defaults), x;
}
x.use = Bt;
x.walkTokens = function(a3, e) {
  return q.walkTokens(a3, e);
};
x.parseInline = q.parseInline;
x.Parser = w;
x.parser = w.parse;
x.Renderer = C;
x.TextRenderer = E;
x.Lexer = O;
x.lexer = O.lex;
x.Tokenizer = _;
x.Hooks = I;
x.parse = x;
var _n = x.options;
var $n = x.setOptions;
var Ln = x.walkTokens;
var Cn = x.parseInline;
var An = w.parse;
var En = O.lex;

// node_modules/md/packages/core/src/utils/markdownHelpers.ts
function renderMarkdown(raw, renderer) {
  const { markdownContent, readingTime: readingTime2 } = renderer.parseFrontMatterAndContent(raw);
  let html = x.parse(markdownContent);
  html = dompurify_shim_default.sanitize(html, { ADD_TAGS: [`mp-common-profile`] });
  return { html, readingTime: readingTime2 };
}
function postProcessHtml(baseHtml, reading, renderer) {
  let html = baseHtml;
  html = renderer.buildReadingTime(reading) + html;
  html = html.replace(/(style=".*?)"/, `$1;margin-top: 0"`);
  html += renderer.buildFootnotes();
  html += renderer.buildAddition();
  html += `
    <style>
      .hljs.code__pre > .mac-sign {
        display: ${renderer.getOpts().isMacCodeBlock ? `flex` : `none`};
      }
    </style>
  `;
  html += `
    <style>
      .code__pre {
        padding: 0 !important;
      }

      .hljs.code__pre code {
        display: -webkit-box;
        padding: 0.5em 1em 1em;
        overflow-x: auto;
        text-indent: 0;
      }
      h2 strong {
        color: inherit !important;
      }
    </style>
  `;
  return renderer.createContainer(html);
}
function modifyHtmlContent(content, renderer) {
  const {
    markdownContent,
    readingTime: readingTimeResult
  } = renderer.parseFrontMatterAndContent(content);
  let html = x.parse(markdownContent);
  html = dompurify_shim_default.sanitize(html, {
    ADD_TAGS: [`mp-common-profile`]
  });
  return postProcessHtml(html, readingTimeResult, renderer);
}

// node_modules/md/packages/core/src/utils/themeHelpers.ts
function customizeTheme(theme, options) {
  const newTheme = JSON.parse(JSON.stringify(theme));
  const { fontSize, color } = options;
  if (fontSize) {
    for (let i2 = 1; i2 <= 6; i2++) {
      const v = newTheme.block[`h${i2}`][`font-size`];
      newTheme.block[`h${i2}`][`font-size`] = `${fontSize * Number.parseFloat(v)}px`;
    }
  }
  if (color) {
    newTheme.base[`--md-primary-color`] = color;
  }
  return newTheme;
}
function customCssWithTemplate(jsonString, color, theme) {
  const newTheme = customizeTheme(theme, { color });
  const mergeProperties = (target, source2, keys) => {
    keys.forEach((key) => {
      if (source2[key]) {
        target[key] = Object.assign(target[key] || {}, source2[key]);
      }
    });
  };
  const blockKeys = [
    `container`,
    `h1`,
    `h2`,
    `h3`,
    `h4`,
    `h5`,
    `h6`,
    `code`,
    `code_pre`,
    `p`,
    `hr`,
    `blockquote`,
    `blockquote_note`,
    `blockquote_tip`,
    `blockquote_important`,
    `blockquote_warning`,
    `blockquote_caution`,
    `blockquote_p`,
    `blockquote_p_note`,
    `blockquote_p_tip`,
    `blockquote_p_important`,
    `blockquote_p_warning`,
    `blockquote_p_caution`,
    `blockquote_title`,
    `blockquote_title_note`,
    `blockquote_title_tip`,
    `blockquote_title_important`,
    `blockquote_title_warning`,
    `blockquote_title_caution`,
    `image`,
    `ul`,
    `ol`,
    `block_katex`
  ];
  const inlineKeys = [`listitem`, `codespan`, `link`, `wx_link`, `strong`, `table`, `thead`, `th`, `td`, `footnote`, `figcaption`, `em`, `inline_katex`];
  mergeProperties(newTheme.block, jsonString, blockKeys);
  mergeProperties(newTheme.inline, jsonString, inlineKeys);
  return newTheme;
}
function getStyleString(style) {
  const css = Object.entries(style ?? {}).map(([key, value]) => key + ": " + value).join("; ");
  return css.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// node_modules/md/packages/core/src/extensions/alert.ts
function markedAlert(options = {}) {
  const { className = `markdown-alert`, variants = [], withoutStyle = false } = options;
  const resolvedVariants = resolveVariants(variants);
  function buildMeta(variantType, matchedVariant, fromContainer = false) {
    const { styles } = options;
    return {
      className,
      variant: variantType,
      icon: matchedVariant.icon,
      title: matchedVariant.title ?? ucfirst(variantType),
      titleClassName: `${className}-title`,
      fromContainer,
      wrapperStyle: {
        ...styles?.blockquote,
        ...styles?.[`blockquote_${variantType}`]
      },
      titleStyle: {
        ...styles?.blockquote_title,
        ...styles?.[`blockquote_title_${variantType}`]
      },
      contentStyle: {
        ...styles?.blockquote_p,
        ...styles?.[`blockquote_p_${variantType}`]
      }
    };
  }
  function renderAlert(token) {
    const { meta, tokens = [] } = token;
    let text = this.parser.parse(tokens);
    text = text.replace(/<p .*?>/g, `<p style="${getStyleString(meta.contentStyle)}">`);
    let tmpl = `<blockquote class="${meta.className} ${meta.className}-${meta.variant}" style="${getStyleString(meta.wrapperStyle)}">
`;
    tmpl += `<p class="${meta.titleClassName}" style="${getStyleString(meta.titleStyle)}">`;
    if (!withoutStyle) {
      tmpl += meta.icon.replace(
        `<svg`,
        `<svg style="fill: ${meta.titleStyle?.color ?? `inherit`}"`
      );
    }
    tmpl += meta.title;
    tmpl += `</p>
`;
    tmpl += text;
    tmpl += `</blockquote>
`;
    return tmpl;
  }
  return {
    walkTokens(token) {
      if (token.type !== `blockquote`)
        return;
      const matchedVariant = resolvedVariants.find(
        ({ type }) => new RegExp(createSyntaxPattern(type), `i`).test(token.text)
      );
      if (matchedVariant) {
        const { type: variantType } = matchedVariant;
        const typeRegexp = new RegExp(createSyntaxPattern(variantType), `i`);
        Object.assign(token, {
          type: `alert`,
          meta: buildMeta(variantType, matchedVariant)
        });
        const firstLine = token.tokens?.[0];
        const firstLineText = firstLine.raw?.replace(typeRegexp, ``).trim();
        if (firstLineText) {
          const patternToken = firstLine.tokens[0];
          Object.assign(patternToken, {
            raw: patternToken.raw.replace(typeRegexp, ``),
            text: patternToken.text.replace(typeRegexp, ``)
          });
          if (firstLine.tokens[1]?.type === `br`) {
            firstLine.tokens.splice(1, 1);
          }
        } else {
          token.tokens?.shift();
        }
      }
    },
    extensions: [
      {
        name: `alert`,
        level: `block`,
        renderer: renderAlert
      },
      {
        name: `alertContainer`,
        level: `block`,
        start(src) {
          return src.match(/^:::/)?.index;
        },
        tokenizer(src, _tokens) {
          const match = /^:::\s*(\w+)\s*\n([\s\S]*?)\n:::/.exec(src);
          if (match) {
            const [raw, variant, content] = match;
            const matchedVariant = resolvedVariants.find((v) => v.type === variant);
            if (!matchedVariant)
              return;
            return {
              type: `alert`,
              raw,
              text: content.trim(),
              tokens: this.lexer.blockTokens(content.trim()),
              meta: buildMeta(variant, matchedVariant, true)
            };
          }
        },
        renderer: renderAlert
      }
    ]
  };
}
var defaultAlertVariant = [
  {
    type: `note`,
    icon: `<svg class="octicon octicon-info" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`
  },
  {
    type: `info`,
    icon: `<svg class="octicon octicon-info" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`
  },
  {
    type: `tip`,
    icon: `<svg class="octicon octicon-light-bulb" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>`
  },
  {
    type: `important`,
    icon: `<svg class="octicon octicon-report" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>`
  },
  {
    type: `warning`,
    icon: `<svg class="octicon octicon-alert" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>`
  },
  {
    type: `caution`,
    icon: `<svg class="octicon octicon-stop" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`
  }
];
function resolveVariants(variants) {
  if (!variants.length)
    return defaultAlertVariant;
  return Object.values(
    [...defaultAlertVariant, ...variants].reduce(
      (map, item) => {
        map[item.type] = item;
        return map;
      },
      {}
    )
  );
}
function createSyntaxPattern(type) {
  return `^(?:\\[!${type}])\\s*?
*`;
}

// node_modules/md/packages/core/src/extensions/footnotes.ts
var fnMap = /* @__PURE__ */ new Map();
function markedFootnotes() {
  return {
    extensions: [
      {
        name: `footnoteDef`,
        level: `block`,
        start(src) {
          fnMap.clear();
          return src.match(/^\[\^/)?.index;
        },
        tokenizer(src) {
          const match = src.match(/^\[\^(.*)\]:(.*)/);
          if (match) {
            const [raw, fnId, text] = match;
            const index = fnMap.size + 1;
            fnMap.set(fnId, { index, text });
            return {
              type: `footnoteDef`,
              raw,
              fnId,
              index,
              text
            };
          }
          return void 0;
        },
        renderer(token) {
          const { index, text, fnId } = token;
          const fnInner = `
                <code>${index}.</code> 
                <span>${text}</span> 
                    <a id="fnDef-${fnId}" href="#fnRef-${fnId}" style="color: var(--md-primary-color);">\u21A9\uFE0E</a>
                <br>`;
          if (index === 1) {
            return `
            <p style="font-size: 80%;margin: 0.5em 8px;word-break:break-all;">${fnInner}`;
          }
          if (index === fnMap.size) {
            return `${fnInner}</p>`;
          }
          return fnInner;
        }
      },
      {
        name: `footnoteRef`,
        level: `inline`,
        start(src) {
          return src.match(/\[\^/)?.index;
        },
        tokenizer(src) {
          const match = src.match(/^\[\^(.*?)\]/);
          if (match) {
            const [raw, fnId] = match;
            if (fnMap.has(fnId)) {
              return {
                type: `footnoteRef`,
                raw,
                fnId
              };
            }
          }
        },
        renderer(token) {
          const { fnId } = token;
          const { index } = fnMap.get(fnId);
          return `<sup style="color: var(--md-primary-color);">
                    <a href="#fnDef-${fnId}" id="fnRef-${fnId}">[${index}]</a>
                </sup>`;
        }
      }
    ]
  };
}

// node_modules/md/packages/core/src/extensions/katex.ts
var inlineRule = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1(?=[\s?!.,:？！。，：]|$)/;
var inlineRuleNonStandard = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1/;
var blockRule = /^\s{0,3}(\${1,2})[ \t]*\n([\s\S]+?)\n\s{0,3}\1[ \t]*(?:\n|$)/;
var inlineLatexRule = /^\\\(([^\\]*(?:\\.[^\\]*)*?)\\\)/;
var blockLatexRule = /^\\\[([^\\]*(?:\\.[^\\]*)*?)\\\]/;
function createRenderer(display, inlineStyle, blockStyle, withStyle = true) {
  return (token) => {
    window.MathJax.texReset();
    const mjxContainer = window.MathJax.tex2svg(token.text, { display });
    const svg = mjxContainer.firstChild;
    const width = svg.style[`min-width`] || svg.getAttribute(`width`);
    svg.removeAttribute(`width`);
    if (withStyle) {
      svg.style.display = `initial`;
      svg.style.setProperty(`max-width`, `300vw`, `important`);
      svg.style.flexShrink = `0`;
      svg.style.width = width;
    }
    if (!display) {
      return `<span ${inlineStyle}>${svg.outerHTML}</span>`;
    }
    return `<section ${blockStyle}>${svg.outerHTML}</section>`;
  };
}
function inlineKatex(options, renderer) {
  const nonStandard = options && options.nonStandard;
  const ruleReg = nonStandard ? inlineRuleNonStandard : inlineRule;
  return {
    name: `inlineKatex`,
    level: `inline`,
    start(src) {
      let index;
      let indexSrc = src;
      while (indexSrc) {
        index = indexSrc.indexOf(`$`);
        if (index === -1) {
          return;
        }
        const f = nonStandard ? index > -1 : index === 0 || indexSrc.charAt(index - 1) === ` `;
        if (f) {
          const possibleKatex = indexSrc.substring(index);
          if (possibleKatex.match(ruleReg)) {
            return index;
          }
        }
        indexSrc = indexSrc.substring(index + 1).replace(/^\$+/, ``);
      }
    },
    tokenizer(src) {
      const match = src.match(ruleReg);
      if (match) {
        return {
          type: `inlineKatex`,
          raw: match[0],
          text: match[2].trim(),
          displayMode: match[1].length === 2
        };
      }
    },
    renderer
  };
}
function blockKatex(_options, renderer) {
  return {
    name: `blockKatex`,
    level: `block`,
    tokenizer(src) {
      const match = src.match(blockRule);
      if (match) {
        return {
          type: `blockKatex`,
          raw: match[0],
          text: match[2].trim(),
          displayMode: match[1].length === 2
        };
      }
    },
    renderer
  };
}
function inlineLatexKatex(_options, renderer) {
  return {
    name: `inlineLatexKatex`,
    level: `inline`,
    start(src) {
      const index = src.indexOf(`\\(`);
      return index !== -1 ? index : void 0;
    },
    tokenizer(src) {
      const match = src.match(inlineLatexRule);
      if (match) {
        return {
          type: `inlineLatexKatex`,
          raw: match[0],
          text: match[1].trim(),
          displayMode: false
        };
      }
    },
    renderer
  };
}
function blockLatexKatex(_options, renderer) {
  return {
    name: `blockLatexKatex`,
    level: `block`,
    start(src) {
      const index = src.indexOf(`\\[`);
      return index !== -1 ? index : void 0;
    },
    tokenizer(src) {
      const match = src.match(blockLatexRule);
      if (match) {
        return {
          type: `blockLatexKatex`,
          raw: match[0],
          text: match[1].trim(),
          displayMode: true
        };
      }
    },
    renderer
  };
}
function MDKatex(options, inlineStyle, blockStyle, withStyle = true) {
  return {
    extensions: [
      inlineKatex(options, createRenderer(false, inlineStyle, blockStyle, withStyle)),
      blockKatex(options, createRenderer(true, inlineStyle, blockStyle, withStyle)),
      inlineLatexKatex(options, createRenderer(false, inlineStyle, blockStyle, withStyle)),
      blockLatexKatex(options, createRenderer(true, inlineStyle, blockStyle, withStyle))
    ]
  };
}

// node_modules/md/packages/core/src/extensions/markup.ts
function markedMarkup(options = {}) {
  const { styles } = options;
  return {
    extensions: [
      // 高亮语法 ==文本==
      {
        name: `markup_highlight`,
        level: `inline`,
        start(src) {
          return src.match(/==(?!=)/)?.index;
        },
        tokenizer(src) {
          const rule = /^==((?:[^=]|=(?!=))+)==/;
          const match = rule.exec(src);
          if (match) {
            return {
              type: `markup_highlight`,
              raw: match[0],
              text: match[1]
            };
          }
        },
        renderer(token) {
          const style = getStyleString(styles?.markup_highlight ?? {});
          return `<span class="markup-highlight" style="${style}">${token.text}</span>`;
        }
      },
      // 下划线语法 ++文本++
      {
        name: `markup_underline`,
        level: `inline`,
        start(src) {
          return src.match(/\+\+(?!\+)/)?.index;
        },
        tokenizer(src) {
          const rule = /^\+\+((?:[^+]|\+(?!\+))+)\+\+/;
          const match = rule.exec(src);
          if (match) {
            return {
              type: `markup_underline`,
              raw: match[0],
              text: match[1]
            };
          }
        },
        renderer(token) {
          const style = getStyleString(styles?.markup_underline ?? {});
          return `<span class="markup-underline" style="${style}">${token.text}</span>`;
        }
      },
      // 波浪线语法 ~文本~
      {
        name: `markup_wavyline`,
        level: `inline`,
        start(src) {
          return src.match(/~(?!~)/)?.index;
        },
        tokenizer(src) {
          const rule = /^~([^~\n]+)~(?!~)/;
          const match = rule.exec(src);
          if (match) {
            return {
              type: `markup_wavyline`,
              raw: match[0],
              text: match[1]
            };
          }
        },
        renderer(token) {
          const style = getStyleString(styles?.markup_wavyline ?? {});
          return `<span class="markup-wavyline" style="${style}">${token.text}</span>`;
        }
      }
    ]
  };
}

// node_modules/fflate/esm/index.mjs
import { createRequire } from "module";
var require2 = createRequire("/");
var _a;
var Worker;
var isMarkedAsUntransferable;
try {
  _a = require2("worker_threads"), Worker = _a.Worker, isMarkedAsUntransferable = _a.isMarkedAsUntransferable;
} catch (e) {
}
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i2 = 0; i2 < 31; ++i2) {
    b[i2] = start += 1 << eb[i2 - 1];
  }
  var r2 = new i32(b[30]);
  for (var i2 = 1; i2 < 30; ++i2) {
    for (var j2 = b[i2]; j2 < b[i2 + 1]; ++j2) {
      r2[j2] = j2 - b[i2] << 5 | i2;
    }
  }
  return { b, r: r2 };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x2 = (i & 43690) >> 1 | (i & 21845) << 1;
  x2 = (x2 & 52428) >> 2 | (x2 & 13107) << 2;
  x2 = (x2 & 61680) >> 4 | (x2 & 3855) << 4;
  rev[i] = ((x2 & 65280) >> 8 | (x2 & 255) << 8) >> 1;
}
var x2;
var i;
var hMap = (function(cd, mb, r2) {
  var s = cd.length;
  var i2 = 0;
  var l = new u16(mb);
  for (; i2 < s; ++i2) {
    if (cd[i2])
      ++l[cd[i2] - 1];
  }
  var le2 = new u16(mb);
  for (i2 = 1; i2 < mb; ++i2) {
    le2[i2] = le2[i2 - 1] + l[i2 - 1] << 1;
  }
  var co;
  if (r2) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        var sv = i2 << 4 | cd[i2];
        var r_1 = mb - cd[i2];
        var v = le2[cd[i2] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        co[i2] = rev[le2[cd[i2] - 1]++] >> 15 - cd[i2];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var wbits = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
};
var wbits16 = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
};
var hTree = function(d, mb) {
  var t = [];
  for (var i2 = 0; i2 < d.length; ++i2) {
    if (d[i2])
      t.push({ s: i2, f: d[i2] });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s)
    return { t: et2, l: 0 };
  if (s == 1) {
    var v = new u8(t[0].s + 1);
    v[t[0].s] = 1;
    return { t: v, l: 1 };
  }
  t.sort(function(a3, b) {
    return a3.f - b.f;
  });
  t.push({ s: -1, f: 25001 });
  var l = t[0], r2 = t[1], i0 = 0, i1 = 1, i22 = 2;
  t[0] = { s: -1, f: l.f + r2.f, l, r: r2 };
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i22].f ? i0++ : i22++];
    r2 = t[i0 != i1 && t[i0].f < t[i22].f ? i0++ : i22++];
    t[i1++] = { s: -1, f: l.f + r2.f, l, r: r2 };
  }
  var maxSym = t2[0].s;
  for (var i2 = 1; i2 < s; ++i2) {
    if (t2[i2].s > maxSym)
      maxSym = t2[i2].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i2 = 0, dt2 = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a3, b) {
      return tr[b.s] - tr[a3.s] || a3.f - b.f;
    });
    for (; i2 < s; ++i2) {
      var i2_1 = t2[i2].s;
      if (tr[i2_1] > mb) {
        dt2 += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt2 >>= lft;
    while (dt2 > 0) {
      var i2_2 = t2[i2].s;
      if (tr[i2_2] < mb)
        dt2 -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i2;
    }
    for (; i2 >= 0 && dt2; --i2) {
      var i2_3 = t2[i2].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt2;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
};
var lc = function(c3) {
  var s = c3.length;
  while (s && !c3[--s])
    ;
  var cl = new u16(++s);
  var cli = 0, cln = c3[0], cls = 1;
  var w2 = function(v) {
    cl[cli++] = v;
  };
  for (var i2 = 1; i2 <= s; ++i2) {
    if (c3[i2] == cln && i2 != s)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w2(32754);
        if (cls > 2) {
          w2(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w2(cln), --cls;
        for (; cls > 6; cls -= 6)
          w2(8304);
        if (cls > 2)
          w2(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w2(cln);
      cls = 1;
      cln = c3[i2];
    }
  }
  return { c: cl.subarray(0, cli), n: s };
};
var clen = function(cf, cl) {
  var l = 0;
  for (var i2 = 0; i2 < cl.length; ++i2)
    l += cf[i2] * cl[i2];
  return l;
};
var wfblk = function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i2 = 0; i2 < s; ++i2)
    out[o + i2 + 4] = dat[i2];
  return (o + 4 + s) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i2 = 0; i2 < lclt.length; ++i2)
    ++lcfreq[lclt[i2] & 31];
  for (var i2 = 0; i2 < lcdt.length; ++i2)
    ++lcfreq[lcdt[i2] & 31];
  var _e2 = hTree(lcfreq, 7), lct = _e2.t, mlcb = _e2.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i2 = 0; i2 < nlcc; ++i2)
      wbits(out, p + 3 * i2, lct[clim[i2]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it2 = 0; it2 < 2; ++it2) {
      var clct = lcts[it2];
      for (var i2 = 0; i2 < clct.length; ++i2) {
        var len = clct[i2] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15)
          wbits(out, p, clct[i2] >> 5 & 127), p += clct[i2] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i2 = 0; i2 < li; ++i2) {
    var sym = syms[i2];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7)
        wbits(out, p, sym >> 23 & 31), p += fleb[len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3)
        wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[sym]), p += ll[sym];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et2 = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st2) {
  var s = st2.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w2 = o.subarray(pre, o.length - post);
  var lst = st2.l;
  var pos = (st2.r || 0) & 7;
  if (lvl) {
    if (pos)
      w2[0] = st2.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c3 = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st2.p || new u16(32768), head = st2.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i3) {
      return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i2 = st2.i || 0, li = 0, wi = st2.w || 0, bs = 0;
    for (; i2 + 2 < s; ++i2) {
      var hv = hsh(i2);
      var imod = i2 & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i2) {
        var rem = s - i2;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w2, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
          li = lc_1 = eb = 0, bs = i2;
          for (var j2 = 0; j2 < 286; ++j2)
            lf[j2] = 0;
          for (var j2 = 0; j2 < 30; ++j2)
            df[j2] = 0;
        }
        var l = 2, d = 0, ch_1 = c3, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i2 - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i2);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i2 + l] == dat[i2 + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                ;
              if (nl > l) {
                l = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j2 = 0; j2 < mmd; ++j2) {
                  var ti = i2 - dif + j2 & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i2 + l;
          ++lc_1;
        } else {
          syms[li++] = dat[i2];
          ++lf[dat[i2]];
        }
      }
    }
    for (i2 = Math.max(i2, wi); i2 < s; ++i2) {
      syms[li++] = dat[i2];
      ++lf[dat[i2]];
    }
    pos = wblk(dat, w2, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
    if (!lst) {
      st2.r = pos & 7 | w2[pos / 8 | 0] << 3;
      pos -= 7;
      st2.h = head, st2.p = prev, st2.i = i2, st2.w = wi;
    }
  } else {
    for (var i2 = st2.w || 0; i2 < s + lst; i2 += 65535) {
      var e = i2 + 65535;
      if (e >= s) {
        w2[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w2, pos + 1, dat.subarray(i2, e));
    }
    st2.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
var dopt = function(dat, opt, pre, post, st2) {
  if (!st2) {
    st2 = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st2.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st2.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st2);
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et2, { stream: true });
  tds = 1;
} catch (e) {
}

// node_modules/md/packages/core/src/extensions/plantuml.ts
function encode6bit(b) {
  if (b < 10) {
    return String.fromCharCode(48 + b);
  }
  b -= 10;
  if (b < 26) {
    return String.fromCharCode(65 + b);
  }
  b -= 26;
  if (b < 26) {
    return String.fromCharCode(97 + b);
  }
  b -= 26;
  if (b === 0) {
    return `-`;
  }
  if (b === 1) {
    return `_`;
  }
  return `?`;
}
function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c22 = (b1 & 3) << 4 | b2 >> 4;
  const c3 = (b2 & 15) << 2 | b3 >> 6;
  const c4 = b3 & 63;
  let r2 = ``;
  r2 += encode6bit(c1 & 63);
  r2 += encode6bit(c22 & 63);
  r2 += encode6bit(c3 & 63);
  r2 += encode6bit(c4 & 63);
  return r2;
}
function encode64(data) {
  let r2 = ``;
  for (let i2 = 0; i2 < data.length; i2 += 3) {
    if (i2 + 2 === data.length) {
      r2 += append3bytes(data.charCodeAt(i2), data.charCodeAt(i2 + 1), 0);
    } else if (i2 + 1 === data.length) {
      r2 += append3bytes(data.charCodeAt(i2), 0, 0);
    } else {
      r2 += append3bytes(data.charCodeAt(i2), data.charCodeAt(i2 + 1), data.charCodeAt(i2 + 2));
    }
  }
  return r2;
}
function performDeflate(input) {
  try {
    const inputBytes = new TextEncoder().encode(input);
    const compressed = deflateSync(inputBytes, { level: 9 });
    return String.fromCharCode(...compressed);
  } catch (error) {
    console.warn(`Deflate compression failed:`, error);
    return input;
  }
}
function encodePlantUML(plantumlCode) {
  try {
    const deflated = performDeflate(plantumlCode);
    return encode64(deflated);
  } catch (error) {
    console.warn(`PlantUML encoding failed, using fallback:`, error);
    const utf8Bytes = new TextEncoder().encode(plantumlCode);
    const base64 = btoa(String.fromCharCode(...utf8Bytes));
    return `~1${base64.replace(/\+/g, `-`).replace(/\//g, `_`).replace(/=/g, ``)}`;
  }
}
function generatePlantUMLUrl(code, options) {
  const encoded = encodePlantUML(code);
  const formatPath = options.format === `svg` ? `svg` : `png`;
  return `${options.serverUrl}/${formatPath}/${encoded}`;
}
function renderPlantUMLDiagram(token, options) {
  const { text: code } = token;
  const finalCode = !code.trim().includes(`@start`) || !code.trim().includes(`@end`) ? `@startuml
${code.trim()}
@enduml` : code;
  const imageUrl = generatePlantUMLUrl(finalCode, options);
  if (options.inlineSvg && options.format === `svg`) {
    const placeholder = `plantuml-placeholder-${Math.random().toString(36).slice(2, 11)}`;
    fetchSvgContent(imageUrl).then((svgContent) => {
      const placeholderElement = document.querySelector(`[data-placeholder="${placeholder}"]`);
      if (placeholderElement) {
        placeholderElement.outerHTML = createPlantUMLHTML(imageUrl, options, svgContent);
      }
    });
    const containerStyles = options.styles.container ? Object.entries(options.styles.container).map(([key, value]) => `${key.replace(/([A-Z])/g, `-$1`).toLowerCase()}: ${value}`).join(`; `) : ``;
    return `<div class="${options.className}" style="${containerStyles}" data-placeholder="${placeholder}">
      <div style="color: #666; font-style: italic;">\u6B63\u5728\u52A0\u8F7DPlantUML\u56FE\u8868...</div>
    </div>`;
  }
  return createPlantUMLHTML(imageUrl, options);
}
async function fetchSvgContent(svgUrl) {
  try {
    const response = await fetch(svgUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const svgContent = await response.text();
    return svgContent.replace(/(<svg[^>]*)\swidth="[^"]*"/g, `$1`).replace(/(<svg[^>]*)\sheight="[^"]*"/g, `$1`).replace(/(<svg[^>]*style="[^"]*?)width:[^;]*;?/g, `$1`).replace(/(<svg[^>]*style="[^"]*?)height:[^;]*;?/g, `$1`);
  } catch (error) {
    console.warn(`Failed to fetch SVG content from ${svgUrl}:`, error);
    return `<div style="color: #666; font-style: italic;">PlantUML\u56FE\u8868\u52A0\u8F7D\u5931\u8D25</div>`;
  }
}
function createPlantUMLHTML(imageUrl, options, svgContent) {
  const containerStyles = options.styles.container ? Object.entries(options.styles.container).map(([key, value]) => `${key.replace(/([A-Z])/g, `-$1`).toLowerCase()}: ${value}`).join(`; `) : ``;
  if (svgContent) {
    return `<div class="${options.className}" style="${containerStyles}">
      ${svgContent}
    </div>`;
  }
  return `<div class="${options.className}" style="${containerStyles}">
    <img src="${imageUrl}" alt="PlantUML Diagram" style="max-width: 100%; height: auto;" />
  </div>`;
}
function markedPlantUML(options = {}) {
  const resolvedOptions = {
    serverUrl: options.serverUrl || `https://www.plantuml.com/plantuml`,
    format: options.format || `svg`,
    className: options.className || `plantuml-diagram`,
    inlineSvg: options.inlineSvg || false,
    styles: {
      container: {
        textAlign: `center`,
        margin: `16px 8px`,
        overflowX: `auto`,
        ...options.styles?.container
      }
    }
  };
  return {
    extensions: [
      {
        name: `plantuml`,
        level: `block`,
        start(src) {
          return src.match(/^```plantuml/m)?.index;
        },
        tokenizer(src) {
          const match = /^```plantuml\r?\n([\s\S]*?)\r?\n```/.exec(src);
          if (match) {
            const [raw, code] = match;
            return {
              type: `plantuml`,
              raw,
              text: code.trim()
            };
          }
        },
        renderer(token) {
          return renderPlantUMLDiagram(token, resolvedOptions);
        }
      }
    ],
    walkTokens(token) {
      if (token.type === `code` && token.lang === `plantuml`) {
        token.type = `plantuml`;
      }
    }
  };
}

// node_modules/md/packages/core/src/extensions/ruby.ts
function markedRuby() {
  return {
    extensions: [
      {
        name: `ruby`,
        level: `inline`,
        start(src) {
          return src.match(/\[/)?.index;
        },
        tokenizer(src) {
          const rule1 = /^\[([^\]]+)\]\{([^}]+)\}/;
          let match = rule1.exec(src);
          if (match) {
            return {
              type: `ruby`,
              raw: match[0],
              text: match[1].trim(),
              ruby: match[2].trim(),
              format: `basic`
            };
          }
          const rule2 = /^\[([^\]]+)\]\^\(([^)]+)\)/;
          match = rule2.exec(src);
          if (match) {
            return {
              type: `ruby`,
              raw: match[0],
              text: match[1].trim(),
              ruby: match[2].trim(),
              format: `basic-hat`
            };
          }
          return void 0;
        },
        renderer(token) {
          const { text, ruby: ruby2, format } = token;
          const separatorRegex = /[・．。-]/g;
          const hasSeparators = separatorRegex.test(ruby2);
          if (hasSeparators) {
            const rubyParts = ruby2.split(separatorRegex).filter((part) => part.trim() !== ``);
            const textChars = text.split(``);
            const result = [];
            if (textChars.length >= rubyParts.length) {
              let currentIndex = 0;
              for (let i2 = 0; i2 < rubyParts.length; i2++) {
                const rubyPart = rubyParts[i2];
                const remainingChars = textChars.length - currentIndex;
                const remainingParts = rubyParts.length - i2;
                let charCount = 1;
                if (remainingParts === 1) {
                  charCount = remainingChars;
                }
                const currentText = textChars.slice(currentIndex, currentIndex + charCount).join(``);
                result.push(`<ruby data-text="${currentText}" data-ruby="${rubyPart}" data-format="${format}">${currentText}<rp>(</rp><rt>${rubyPart}</rt><rp>)</rp></ruby>`);
                currentIndex += charCount;
              }
              if (currentIndex < textChars.length) {
                result.push(textChars.slice(currentIndex).join(``));
              }
            } else {
              for (let i2 = 0; i2 < textChars.length; i2++) {
                const char = textChars[i2];
                const rubyPart = rubyParts[i2] || ``;
                if (rubyPart) {
                  result.push(`<ruby data-text="${char}" data-ruby="${rubyPart}" data-format="${format}">${char}<rp>(</rp><rt>${rubyPart}</rt><rp>)</rp></ruby>`);
                } else {
                  result.push(char);
                }
              }
            }
            return result.join(``);
          }
          return `<ruby data-text="${text}" data-ruby="${ruby2}" data-format="${format}">${text}<rp>(</rp><rt>${ruby2}</rt><rp>)</rp></ruby>`;
        }
      }
    ]
  };
}

// node_modules/md/packages/core/src/extensions/slider.ts
function markedSlider(options = {}) {
  return {
    extensions: [
      {
        name: `horizontalSlider`,
        level: `block`,
        start(src) {
          return src.match(/^<!\[/)?.index;
        },
        tokenizer(src) {
          const rule = /^<(!\[.*?\]\(.*?\)(?:,!\[.*?\]\(.*?\))*)>/;
          const match = src.match(rule);
          if (match) {
            return {
              type: `horizontalSlider`,
              raw: match[0],
              text: match[1]
            };
          }
          return void 0;
        },
        renderer(token) {
          const { text } = token;
          const imageMatches = text.match(/!\[(.*?)\]\((.*?)\)/g) || [];
          if (imageMatches.length === 0) {
            return ``;
          }
          const images = imageMatches.map((img) => {
            const altMatch = img.match(/!\[(.*?)\]/) || [];
            const srcMatch = img.match(/\]\((.*?)\)/) || [];
            const alt = altMatch[1] || ``;
            const src = srcMatch[1] || ``;
            const { styles } = options;
            const imgStyles = styles ? getStyleString(styles.image) : ``;
            return { src, alt, imgStyles };
          });
          return `
            <section style="box-sizing: border-box; font-size: 16px;">
              <section data-role="outer" style="font-family: \u5FAE\u8F6F\u96C5\u9ED1; font-size: 16px;">
                <section data-role="paragraph" style="margin: 0px auto; box-sizing: border-box; width: 100%;">
                  <section style="margin: 0px auto; text-align: center;">
                    <section style="display: inline-block; width: 100%;">
                      <!-- \u5FAE\u4FE1\u516C\u4F17\u53F7\u652F\u6301\u7684\u6ED1\u52A8\u56FE\u7247\u5BB9\u5668 -->
                      <section style="overflow-x: scroll; -webkit-overflow-scrolling: touch; white-space: nowrap; width: 100%; text-align: center;">
                        ${images.map((img, _index) => `<section style="display: inline-block; width: 100%; margin-right: 0; vertical-align: top;">
                          <img src="${img.src}" alt="${img.alt}" title="${img.alt}" style="${img.imgStyles}; width: 100%; height: auto; border-radius: 4px; vertical-align: top;"/>
                          <p style="margin-top: 5px; font-size: 14px; color: #666; text-align: center; white-space: normal;">${img.alt}</p>
                        </section>`).join(``)}
                      </section>
                    </section>
                  </section>
                </section>
              </section>
              <p style="font-size: 14px; color: #999; text-align: center; margin-top: 5px;"><<< \u5DE6\u53F3\u6ED1\u52A8\u770B\u66F4\u591A >>></p>
            </section>
          `;
        }
      }
    ]
  };
}

// node_modules/md/packages/core/src/extensions/toc.ts
function markedToc() {
  let headings = [];
  let firstToken = true;
  return {
    walkTokens(token) {
      if (firstToken) {
        headings = [];
        firstToken = false;
      }
      if (token.type === `heading`) {
        const text = token.text || ``;
        const depth = token.depth || 1;
        const index = headings.length;
        headings.push({ text, depth, index });
      }
    },
    extensions: [
      {
        name: `toc`,
        level: `block`,
        start(src) {
          const match = src.match(/^\s*\[TOC\]\s*$/m);
          return match ? match.index : void 0;
        },
        tokenizer(src) {
          const match = /^\[TOC\]/.exec(src);
          if (match) {
            return {
              type: `toc`,
              raw: match[0]
            };
          }
        },
        renderer() {
          if (!headings.length)
            return ``;
          let html = `<nav class="markdown-toc"><ul class="toc-ul toc-level-1 pl-4 border-l ml-2">`;
          let lastDepth = 1;
          headings.forEach(({ text, depth, index }) => {
            if (depth > lastDepth) {
              for (let i2 = lastDepth + 1; i2 <= depth; i2++) {
                html += `<ul class="toc-ul toc-level-${i2} pl-4 border-l ml-2">`;
              }
            } else if (depth < lastDepth) {
              for (let i2 = lastDepth; i2 > depth; i2--) {
                html += `</ul>`;
              }
            }
            html += `<li class="toc-li toc-level-${depth} mb-1"><a class="text-gray-700 hover:text-blue-600 underline transition-colors" href="#${index}">${text}</a></li>`;
            lastDepth = depth;
          });
          for (let i2 = lastDepth; i2 > 1; i2--) {
            html += `</ul>`;
          }
          html += `</ul></nav>`;
          firstToken = true;
          return html;
        }
      }
    ]
  };
}

// node_modules/es-toolkit/dist/_internal/globalThis.mjs
var globalThis_ = typeof globalThis === "object" && globalThis || typeof window === "object" && window || typeof self === "object" && self || typeof global === "object" && global || /* @__PURE__ */ (function() {
  return this;
})();

// node_modules/es-toolkit/dist/predicate/isPrimitive.mjs
function isPrimitive(value) {
  return value == null || typeof value !== "object" && typeof value !== "function";
}

// node_modules/es-toolkit/dist/predicate/isTypedArray.mjs
function isTypedArray(x3) {
  return ArrayBuffer.isView(x3) && !(x3 instanceof DataView);
}

// node_modules/es-toolkit/dist/object/clone.mjs
function clone(obj) {
  if (isPrimitive(obj)) return obj;
  if (Array.isArray(obj) || isTypedArray(obj) || obj instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && obj instanceof SharedArrayBuffer) return obj.slice(0);
  const prototype = Object.getPrototypeOf(obj);
  if (prototype == null) return Object.assign(Object.create(prototype), obj);
  const Constructor = prototype.constructor;
  if (obj instanceof Date || obj instanceof Map || obj instanceof Set) return new Constructor(obj);
  if (obj instanceof RegExp) {
    const newRegExp = new Constructor(obj);
    newRegExp.lastIndex = obj.lastIndex;
    return newRegExp;
  }
  if (obj instanceof DataView) return new Constructor(obj.buffer.slice(0), obj.byteOffset, obj.byteLength);
  if (obj instanceof Error) {
    let newError;
    if (obj instanceof AggregateError) newError = new Constructor(obj.errors, obj.message, { cause: obj.cause });
    else newError = new Constructor(obj.message, { cause: obj.cause });
    newError.stack = obj.stack;
    Object.assign(newError, obj);
    return newError;
  }
  if (typeof File !== "undefined" && obj instanceof File) return new Constructor([obj], obj.name, {
    type: obj.type,
    lastModified: obj.lastModified
  });
  if (typeof obj === "object") {
    const newObject = Object.create(prototype);
    return Object.assign(newObject, obj);
  }
  return obj;
}

// node_modules/es-toolkit/dist/predicate/isBuffer.mjs
function isBuffer(x3) {
  return typeof globalThis_.Buffer !== "undefined" && globalThis_.Buffer.isBuffer(x3);
}

// node_modules/es-toolkit/dist/compat/_internal/getSymbols.mjs
function getSymbols(object) {
  return Object.getOwnPropertySymbols(object).filter((symbol) => Object.prototype.propertyIsEnumerable.call(object, symbol));
}

// node_modules/es-toolkit/dist/compat/_internal/getTag.mjs
function getTag(value) {
  if (value == null) return value === void 0 ? "[object Undefined]" : "[object Null]";
  return Object.prototype.toString.call(value);
}

// node_modules/es-toolkit/dist/compat/_internal/tags.mjs
var regexpTag = "[object RegExp]";
var stringTag = "[object String]";
var numberTag = "[object Number]";
var booleanTag = "[object Boolean]";
var argumentsTag = "[object Arguments]";
var symbolTag = "[object Symbol]";
var dateTag = "[object Date]";
var mapTag = "[object Map]";
var setTag = "[object Set]";
var arrayTag = "[object Array]";
var arrayBufferTag = "[object ArrayBuffer]";
var objectTag = "[object Object]";
var dataViewTag = "[object DataView]";
var uint8ArrayTag = "[object Uint8Array]";
var uint8ClampedArrayTag = "[object Uint8ClampedArray]";
var uint16ArrayTag = "[object Uint16Array]";
var uint32ArrayTag = "[object Uint32Array]";
var int8ArrayTag = "[object Int8Array]";
var int16ArrayTag = "[object Int16Array]";
var int32ArrayTag = "[object Int32Array]";
var float32ArrayTag = "[object Float32Array]";
var float64ArrayTag = "[object Float64Array]";

// node_modules/es-toolkit/dist/object/cloneDeepWith.mjs
function cloneDeepWithImpl(valueToClone, keyToClone, objectToClone, stack = /* @__PURE__ */ new Map(), cloneValue) {
  const cloned = cloneValue?.(valueToClone, keyToClone, objectToClone, stack);
  if (cloned !== void 0) return cloned;
  if (isPrimitive(valueToClone)) return valueToClone;
  if (stack.has(valueToClone)) return stack.get(valueToClone);
  if (Array.isArray(valueToClone)) {
    const result = new Array(valueToClone.length);
    stack.set(valueToClone, result);
    for (let i2 = 0; i2 < valueToClone.length; i2++) result[i2] = cloneDeepWithImpl(valueToClone[i2], i2, objectToClone, stack, cloneValue);
    if (Object.hasOwn(valueToClone, "index")) result.index = valueToClone.index;
    if (Object.hasOwn(valueToClone, "input")) result.input = valueToClone.input;
    return result;
  }
  if (valueToClone instanceof Date) return new Date(valueToClone.getTime());
  if (valueToClone instanceof RegExp) {
    const result = new RegExp(valueToClone.source, valueToClone.flags);
    result.lastIndex = valueToClone.lastIndex;
    return result;
  }
  if (valueToClone instanceof Map) {
    const result = /* @__PURE__ */ new Map();
    stack.set(valueToClone, result);
    for (const [key, value] of valueToClone) result.set(key, cloneDeepWithImpl(value, key, objectToClone, stack, cloneValue));
    return result;
  }
  if (valueToClone instanceof Set) {
    const result = /* @__PURE__ */ new Set();
    stack.set(valueToClone, result);
    for (const value of valueToClone) result.add(cloneDeepWithImpl(value, void 0, objectToClone, stack, cloneValue));
    return result;
  }
  if (isBuffer(valueToClone)) return valueToClone.subarray();
  if (isTypedArray(valueToClone)) {
    const result = new (Object.getPrototypeOf(valueToClone)).constructor(valueToClone.length);
    stack.set(valueToClone, result);
    for (let i2 = 0; i2 < valueToClone.length; i2++) result[i2] = cloneDeepWithImpl(valueToClone[i2], i2, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && valueToClone instanceof SharedArrayBuffer) return valueToClone.slice(0);
  if (valueToClone instanceof DataView) {
    const result = new DataView(valueToClone.buffer.slice(0), valueToClone.byteOffset, valueToClone.byteLength);
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (typeof File !== "undefined" && valueToClone instanceof File) {
    const result = new File([valueToClone], valueToClone.name, { type: valueToClone.type });
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (typeof Blob !== "undefined" && valueToClone instanceof Blob) {
    const result = new Blob([valueToClone], { type: valueToClone.type });
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof Error) {
    const result = structuredClone(valueToClone);
    stack.set(valueToClone, result);
    result.message = valueToClone.message;
    result.name = valueToClone.name;
    result.stack = valueToClone.stack;
    result.cause = valueToClone.cause;
    result.constructor = valueToClone.constructor;
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof Boolean) {
    const result = new Boolean(valueToClone.valueOf());
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof Number) {
    const result = new Number(valueToClone.valueOf());
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof String) {
    const result = new String(valueToClone.valueOf());
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (typeof valueToClone === "object" && isCloneableObject(valueToClone)) {
    const result = Object.create(Object.getPrototypeOf(valueToClone));
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  return valueToClone;
}
function copyProperties(target, source2, objectToClone = target, stack, cloneValue) {
  const keys = [...Object.keys(source2), ...getSymbols(source2)];
  for (let i2 = 0; i2 < keys.length; i2++) {
    const key = keys[i2];
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    if (descriptor == null || descriptor.writable) target[key] = cloneDeepWithImpl(source2[key], key, objectToClone, stack, cloneValue);
  }
}
function isCloneableObject(object) {
  switch (getTag(object)) {
    case argumentsTag:
    case arrayTag:
    case arrayBufferTag:
    case dataViewTag:
    case booleanTag:
    case dateTag:
    case float32ArrayTag:
    case float64ArrayTag:
    case int8ArrayTag:
    case int16ArrayTag:
    case int32ArrayTag:
    case mapTag:
    case numberTag:
    case objectTag:
    case regexpTag:
    case setTag:
    case stringTag:
    case symbolTag:
    case uint8ArrayTag:
    case uint8ClampedArrayTag:
    case uint16ArrayTag:
    case uint32ArrayTag:
      return true;
    default:
      return false;
  }
}

// node_modules/es-toolkit/dist/object/cloneDeep.mjs
function cloneDeep(obj) {
  return cloneDeepWithImpl(obj, void 0, obj, /* @__PURE__ */ new Map(), void 0);
}

// node_modules/es-toolkit/dist/predicate/isPlainObject.mjs
function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  if (!(proto === null || proto === Object.prototype || Object.getPrototypeOf(proto) === null)) return false;
  return Object.prototype.toString.call(value) === "[object Object]";
}

// node_modules/es-toolkit/dist/_internal/isMergeableValue.mjs
function isMergeableValue(value) {
  return isPlainObject(value) || Array.isArray(value);
}

// node_modules/es-toolkit/dist/_internal/isUnsafeProperty.mjs
function isUnsafeProperty(key) {
  return key === "__proto__";
}

// node_modules/es-toolkit/dist/object/mergeWith.mjs
function mergeWith(target, source2, merge) {
  const sourceKeys = Object.keys(source2);
  for (let i2 = 0; i2 < sourceKeys.length; i2++) {
    const key = sourceKeys[i2];
    if (isUnsafeProperty(key)) continue;
    const sourceValue = source2[key];
    const targetValue = target[key];
    const merged = merge(targetValue, sourceValue, key, target, source2);
    if (merged !== void 0) target[key] = merged;
    else if (isMergeableValue(sourceValue) && isMergeableValue(targetValue)) target[key] = mergeWith(targetValue, sourceValue, merge);
    else if (Array.isArray(sourceValue)) target[key] = mergeWith([], sourceValue, merge);
    else if (isPlainObject(sourceValue)) target[key] = mergeWith({}, sourceValue, merge);
    else if (targetValue === void 0 || sourceValue !== void 0) target[key] = sourceValue;
  }
  return target;
}

// node_modules/es-toolkit/dist/object/toMerged.mjs
function toMerged(target, source2) {
  return mergeWith(cloneDeep(target), source2, function mergeRecursively(targetValue, sourceValue) {
    if (isMergeableValue(sourceValue) && isMergeableValue(targetValue)) return mergeWith(clone(targetValue), sourceValue, mergeRecursively);
    else if (Array.isArray(sourceValue)) return mergeWith([], sourceValue, mergeRecursively);
    else if (isPlainObject(sourceValue)) return mergeWith({}, sourceValue, mergeRecursively);
  });
}

// node_modules/md/packages/core/src/renderer/renderer-impl.ts
var import_front_matter = __toESM(require_front_matter(), 1);

// node_modules/highlight.js/es/core.js
var import_core = __toESM(require_core2(), 1);
var core_default = import_core.default;

// node_modules/md/packages/core/src/renderer/renderer-impl.ts
var import_reading_time = __toESM(require_reading_time2(), 1);

// node_modules/highlight.js/es/languages/bash.js
function bash(hljs) {
  const regex = hljs.regex;
  const VAR = {};
  const BRACED_VAR = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [VAR]
      }
      // default values
    ]
  };
  Object.assign(VAR, {
    className: "variable",
    variants: [
      { begin: regex.concat(
        /\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        `(?![\\w\\d])(?![$])`
      ) },
      BRACED_VAR
    ]
  });
  const SUBST = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  const COMMENT = hljs.inherit(
    hljs.COMMENT(),
    {
      match: [
        /(^|\s)/,
        /#.*$/
      ],
      scope: {
        2: "comment"
      }
    }
  );
  const HERE_DOC = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      hljs.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: "string"
      })
    ] }
  };
  const QUOTE_STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VAR,
      SUBST
    ]
  };
  SUBST.contains.push(QUOTE_STRING);
  const ESCAPED_QUOTE = {
    match: /\\"/
  };
  const APOS_STRING = {
    className: "string",
    begin: /'/,
    end: /'/
  };
  const ESCAPED_APOS = {
    match: /\\'/
  };
  const ARITHMETIC = {
    begin: /\$?\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      hljs.NUMBER_MODE,
      VAR
    ]
  };
  const SH_LIKE_SHELLS = [
    "fish",
    "bash",
    "zsh",
    "sh",
    "csh",
    "ksh",
    "tcsh",
    "dash",
    "scsh"
  ];
  const KNOWN_SHEBANG = hljs.SHEBANG({
    binary: `(${SH_LIKE_SHELLS.join("|")})`,
    relevance: 10
  });
  const FUNCTION = {
    className: "function",
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: true,
    contains: [hljs.inherit(hljs.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
    relevance: 0
  };
  const KEYWORDS3 = [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "time",
    "for",
    "while",
    "until",
    "in",
    "do",
    "done",
    "case",
    "esac",
    "coproc",
    "function",
    "select"
  ];
  const LITERALS3 = [
    "true",
    "false"
  ];
  const PATH_MODE = { match: /(\/[a-z._-]+)+/ };
  const SHELL_BUILT_INS = [
    "break",
    "cd",
    "continue",
    "eval",
    "exec",
    "exit",
    "export",
    "getopts",
    "hash",
    "pwd",
    "readonly",
    "return",
    "shift",
    "test",
    "times",
    "trap",
    "umask",
    "unset"
  ];
  const BASH_BUILT_INS = [
    "alias",
    "bind",
    "builtin",
    "caller",
    "command",
    "declare",
    "echo",
    "enable",
    "help",
    "let",
    "local",
    "logout",
    "mapfile",
    "printf",
    "read",
    "readarray",
    "source",
    "sudo",
    "type",
    "typeset",
    "ulimit",
    "unalias"
  ];
  const ZSH_BUILT_INS = [
    "autoload",
    "bg",
    "bindkey",
    "bye",
    "cap",
    "chdir",
    "clone",
    "comparguments",
    "compcall",
    "compctl",
    "compdescribe",
    "compfiles",
    "compgroups",
    "compquote",
    "comptags",
    "comptry",
    "compvalues",
    "dirs",
    "disable",
    "disown",
    "echotc",
    "echoti",
    "emulate",
    "fc",
    "fg",
    "float",
    "functions",
    "getcap",
    "getln",
    "history",
    "integer",
    "jobs",
    "kill",
    "limit",
    "log",
    "noglob",
    "popd",
    "print",
    "pushd",
    "pushln",
    "rehash",
    "sched",
    "setcap",
    "setopt",
    "stat",
    "suspend",
    "ttyctl",
    "unfunction",
    "unhash",
    "unlimit",
    "unsetopt",
    "vared",
    "wait",
    "whence",
    "where",
    "which",
    "zcompile",
    "zformat",
    "zftp",
    "zle",
    "zmodload",
    "zparseopts",
    "zprof",
    "zpty",
    "zregexparse",
    "zsocket",
    "zstyle",
    "ztcp"
  ];
  const GNU_CORE_UTILS = [
    "chcon",
    "chgrp",
    "chown",
    "chmod",
    "cp",
    "dd",
    "df",
    "dir",
    "dircolors",
    "ln",
    "ls",
    "mkdir",
    "mkfifo",
    "mknod",
    "mktemp",
    "mv",
    "realpath",
    "rm",
    "rmdir",
    "shred",
    "sync",
    "touch",
    "truncate",
    "vdir",
    "b2sum",
    "base32",
    "base64",
    "cat",
    "cksum",
    "comm",
    "csplit",
    "cut",
    "expand",
    "fmt",
    "fold",
    "head",
    "join",
    "md5sum",
    "nl",
    "numfmt",
    "od",
    "paste",
    "ptx",
    "pr",
    "sha1sum",
    "sha224sum",
    "sha256sum",
    "sha384sum",
    "sha512sum",
    "shuf",
    "sort",
    "split",
    "sum",
    "tac",
    "tail",
    "tr",
    "tsort",
    "unexpand",
    "uniq",
    "wc",
    "arch",
    "basename",
    "chroot",
    "date",
    "dirname",
    "du",
    "echo",
    "env",
    "expr",
    "factor",
    // "false", // keyword literal already
    "groups",
    "hostid",
    "id",
    "link",
    "logname",
    "nice",
    "nohup",
    "nproc",
    "pathchk",
    "pinky",
    "printenv",
    "printf",
    "pwd",
    "readlink",
    "runcon",
    "seq",
    "sleep",
    "stat",
    "stdbuf",
    "stty",
    "tee",
    "test",
    "timeout",
    // "true", // keyword literal already
    "tty",
    "uname",
    "unlink",
    "uptime",
    "users",
    "who",
    "whoami",
    "yes"
  ];
  return {
    name: "Bash",
    aliases: [
      "sh",
      "zsh"
    ],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: KEYWORDS3,
      literal: LITERALS3,
      built_in: [
        ...SHELL_BUILT_INS,
        ...BASH_BUILT_INS,
        // Shell modifiers
        "set",
        "shopt",
        ...ZSH_BUILT_INS,
        ...GNU_CORE_UTILS
      ]
    },
    contains: [
      KNOWN_SHEBANG,
      // to catch known shells and boost relevancy
      hljs.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      FUNCTION,
      ARITHMETIC,
      COMMENT,
      HERE_DOC,
      PATH_MODE,
      QUOTE_STRING,
      ESCAPED_QUOTE,
      APOS_STRING,
      ESCAPED_APOS,
      VAR
    ]
  };
}

// node_modules/highlight.js/es/languages/c.js
function c2(hljs) {
  const regex = hljs.regex;
  const C_LINE_COMMENT_MODE = hljs.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] });
  const DECLTYPE_AUTO_RE = "decltype\\(auto\\)";
  const NAMESPACE_RE = "[a-zA-Z_]\\w*::";
  const TEMPLATE_ARGUMENT_RE = "<[^<>]+>";
  const FUNCTION_TYPE_RE = "(" + DECLTYPE_AUTO_RE + "|" + regex.optional(NAMESPACE_RE) + "[a-zA-Z_]\\w*" + regex.optional(TEMPLATE_ARGUMENT_RE) + ")";
  const ATOMIC_TYPES = regex.concat(/\batomic_/, regex.either(
    "bool",
    "char",
    "schar",
    "uchar",
    "short",
    "ushort",
    "int",
    "uint",
    "long",
    "ulong",
    "llong",
    "ullong",
    "char16_t",
    "char32_t",
    "wchar_t",
    "int_least8_t",
    "uint_least8_t",
    "int_least16_t",
    "uint_least16_t",
    "int_least32_t",
    "uint_least32_t",
    "int_least64_t",
    "uint_least64_t",
    "int_fast8_t",
    "uint_fast8_t",
    "int_fast16_t",
    "uint_fast16_t",
    "int_fast32_t",
    "uint_fast32_t",
    "int_fast64_t",
    "uint_fast64_t",
    "intptr_t",
    "uintptr_t",
    "size_t",
    "ptrdiff_t",
    "intmax_t",
    "uintmax_t"
  ), /\b/);
  const TYPES3 = {
    className: "type",
    variants: [
      { begin: "\\b[a-z\\d_]*_t\\b" },
      { match: ATOMIC_TYPES }
    ]
  };
  const CHARACTER_ESCAPES = "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)";
  const STRINGS = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + CHARACTER_ESCAPES + "|.)",
        end: "'",
        illegal: "."
      },
      // https://en.cppreference.com/w/cpp/language/string_literal
      // a d-char-sequence never contains parentheses, backslashes or whitespace;
      // quotes are excluded as well so the closing delimiter cannot swallow the
      // quote that actually terminates the literal
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\\s"]{0,16})\(/,
        end: /\)([^()\\\s"]{0,16})"/
      })
    ]
  };
  const NUMBERS = {
    className: "number",
    variants: [
      { match: /\b(0b[01']+)/ },
      { match: /(-?)\b([\d']+(\.[\d']*)?|\.[\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)/ },
      { match: /(-?)\b(0[xX][a-fA-F0-9]+(?:'[a-fA-F0-9]+)*(?:\.[a-fA-F0-9]*(?:'[a-fA-F0-9]*)*)?(?:[pP][-+]?[0-9]+)?(l|L)?(u|U)?)/ },
      { match: /(-?)\b\d+(?:'\d+)*(?:\.\d*(?:'\d*)*)?(?:[eE][-+]?\d+)?/ }
    ],
    relevance: 0
  };
  const PREPROCESSOR_INCLUDE = {
    scope: "meta",
    begin: /#\s*include\b/,
    end: /$/,
    keywords: { keyword: "include" },
    contains: [
      {
        // the `\` at the end of a line signaling continuation
        begin: /\\\n/
      },
      STRINGS,
      {
        scope: "string",
        begin: /<.*?>/
      },
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };
  const PREPROCESSOR = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef elifdef elifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      hljs.inherit(STRINGS, { className: "string" }),
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };
  const PREPROCESSORS = [
    PREPROCESSOR_INCLUDE,
    PREPROCESSOR
  ];
  const TITLE_MODE = {
    className: "title",
    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
    relevance: 0
  };
  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + "\\s*\\(";
  const MAX_FUNCTION_TYPE_TOKENS = 12;
  const C_KEYWORDS = [
    "asm",
    "auto",
    "break",
    "case",
    "continue",
    "default",
    "do",
    "else",
    "enum",
    "extern",
    "for",
    "fortran",
    "goto",
    "if",
    "inline",
    "register",
    "restrict",
    "return",
    "sizeof",
    "typeof",
    "typeof_unqual",
    "struct",
    "switch",
    "typedef",
    "union",
    "volatile",
    "while",
    "_Alignas",
    "_Alignof",
    "_Atomic",
    "_Generic",
    "_Noreturn",
    "_Static_assert",
    "_Thread_local",
    // aliases
    "alignas",
    "alignof",
    "noreturn",
    "static_assert",
    "thread_local",
    // not a C keyword but is, for all intents and purposes, treated exactly like one.
    "_Pragma"
  ];
  const C_TYPES = [
    "float",
    "double",
    "signed",
    "unsigned",
    "int",
    "short",
    "long",
    "char",
    "void",
    "_Bool",
    "_BitInt",
    "_Complex",
    "_Imaginary",
    "_Decimal32",
    "_Decimal64",
    "_Decimal96",
    "_Decimal128",
    "_Decimal64x",
    "_Decimal128x",
    "_Float16",
    "_Float32",
    "_Float64",
    "_Float128",
    "_Float32x",
    "_Float64x",
    "_Float128x",
    // modifiers
    "const",
    "static",
    "constexpr",
    // aliases
    "complex",
    "bool",
    "imaginary"
  ];
  const KEYWORDS3 = {
    keyword: C_KEYWORDS,
    type: C_TYPES,
    literal: "true false NULL",
    // TODO: apply hinting work similar to what was done in cpp.js
    built_in: "std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf endl initializer_list unique_ptr"
  };
  const EXPRESSION_CONTAINS = [
    ...PREPROCESSORS,
    TYPES3,
    C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    NUMBERS,
    STRINGS
  ];
  const EXPRESSION_CONTEXT = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: KEYWORDS3,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: KEYWORDS3,
        contains: EXPRESSION_CONTAINS.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  };
  const FUNCTION_DECLARATION = {
    begin: "(" + FUNCTION_TYPE_RE + "[\\*&\\s]+){1," + MAX_FUNCTION_TYPE_TOKENS + "}" + FUNCTION_TITLE,
    returnBegin: true,
    end: /[{;=]/,
    excludeEnd: true,
    keywords: KEYWORDS3,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: KEYWORDS3,
        relevance: 0
      },
      {
        begin: FUNCTION_TITLE,
        returnBegin: true,
        contains: [hljs.inherit(TITLE_MODE, { className: "title.function" })],
        relevance: 0
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: KEYWORDS3,
        relevance: 0,
        contains: [
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          STRINGS,
          NUMBERS,
          TYPES3,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: KEYWORDS3,
            relevance: 0,
            contains: [
              "self",
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS,
              TYPES3
            ]
          }
        ]
      },
      TYPES3,
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ...PREPROCESSORS
    ]
  };
  return {
    name: "C",
    aliases: ["h"],
    keywords: KEYWORDS3,
    // Until differentiations are added between `c` and `cpp`, `c` will
    // not be auto-detected to avoid auto-detect conflicts between C and C++
    disableAutodetect: true,
    illegal: "</",
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      EXPRESSION_CONTAINS,
      [
        ...PREPROCESSORS,
        {
          begin: hljs.IDENT_RE + "::",
          keywords: KEYWORDS3
        },
        {
          className: "class",
          beginKeywords: "enum class struct union",
          end: /[{;:<>=]/,
          contains: [
            { beginKeywords: "final class struct" },
            hljs.TITLE_MODE
          ]
        }
      ]
    ),
    exports: {
      preprocessor: PREPROCESSOR,
      strings: STRINGS,
      keywords: KEYWORDS3
    }
  };
}

// node_modules/highlight.js/es/languages/cpp.js
function cpp(hljs) {
  const regex = hljs.regex;
  const C_LINE_COMMENT_MODE = hljs.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] });
  const DECLTYPE_AUTO_RE = "decltype\\(auto\\)";
  const NAMESPACE_RE = "[a-zA-Z_]\\w*::";
  const TEMPLATE_ARGUMENT_RE = "<[^<>]+>";
  const FUNCTION_TYPE_RE = "(?!struct)(" + DECLTYPE_AUTO_RE + "|" + regex.optional(NAMESPACE_RE) + "[a-zA-Z_]\\w*" + regex.optional(TEMPLATE_ARGUMENT_RE) + ")";
  const CPP_PRIMITIVE_TYPES = {
    className: "type",
    begin: "\\b[a-z\\d_]*_t\\b"
  };
  const CHARACTER_ESCAPES = "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)";
  const STRINGS = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + CHARACTER_ESCAPES + "|.)",
        end: "'",
        illegal: "."
      },
      // https://en.cppreference.com/w/cpp/language/string_literal
      // a d-char-sequence never contains parentheses, backslashes or whitespace;
      // quotes are excluded as well so the closing delimiter cannot swallow the
      // quote that actually terminates the literal
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\\s"]{0,16})\(/,
        end: /\)([^()\\\s"]{0,16})"/
      })
    ]
  };
  const NUMBERS = {
    className: "number",
    variants: [
      // Floating-point literal.
      {
        begin: "[+-]?(?:(?:\\b[0-9](?:'?[0-9])*\\.(?:[0-9](?:'?[0-9])*)?|\\.[0-9](?:'?[0-9])*)(?:[Ee][+-]?[0-9](?:'?[0-9])*)?|\\b[0-9](?:'?[0-9])*[Ee][+-]?[0-9](?:'?[0-9])*|\\b0[Xx](?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*(?:\\.(?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)?)?|\\.[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)[Pp][+-]?[0-9](?:'?[0-9])*)(?:[Ff](?:16|32|64|128)?|(BF|bf)16|[Ll]|)"
      },
      // Integer literal.
      {
        begin: "[+-]?\\b(?:0[Bb][01](?:'?[01])*|0[Xx][0-9A-Fa-f](?:'?[0-9A-Fa-f])*|0(?:'?[0-7])*|[1-9](?:'?[0-9])*)(?:[Uu](?:LL?|ll?)|[Uu][Zz]?|(?:LL?|ll?)[Uu]?|[Zz][Uu]|)"
        // Note: there are user-defined literal suffixes too, but perhaps having the custom suffix not part of the
        // literal highlight actually makes it stand out more.
      }
    ],
    relevance: 0
  };
  const PREPROCESSOR_INCLUDE = {
    scope: "meta",
    begin: /#\s*include\b/,
    end: /$/,
    keywords: { keyword: "include" },
    contains: [
      {
        // the `\` at the end of a line signaling continuation
        begin: /\\\n/
      },
      STRINGS,
      {
        scope: "string",
        begin: /<.*?>/
      },
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };
  const PREPROCESSOR = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      hljs.inherit(STRINGS, { className: "string" }),
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };
  const PREPROCESSORS = [
    PREPROCESSOR_INCLUDE,
    PREPROCESSOR
  ];
  const TITLE_MODE = {
    className: "title",
    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
    relevance: 0
  };
  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + "\\s*\\(";
  const MAX_FUNCTION_TYPE_TOKENS = 12;
  const RESERVED_KEYWORDS = [
    "alignas",
    "alignof",
    "and",
    "and_eq",
    "asm",
    "atomic_cancel",
    "atomic_commit",
    "atomic_noexcept",
    "auto",
    "bitand",
    "bitor",
    "break",
    "case",
    "catch",
    "class",
    "co_await",
    "co_return",
    "co_yield",
    "compl",
    "concept",
    "const_cast|10",
    "consteval",
    "constexpr",
    "constinit",
    "continue",
    "decltype",
    "default",
    "delete",
    "do",
    "dynamic_cast|10",
    "else",
    "enum",
    "explicit",
    "export",
    "extern",
    "false",
    "final",
    "for",
    "friend",
    "goto",
    "if",
    "import",
    "inline",
    "module",
    "mutable",
    "namespace",
    "new",
    "noexcept",
    "not",
    "not_eq",
    "nullptr",
    "operator",
    "or",
    "or_eq",
    "override",
    "private",
    "protected",
    "public",
    "reflexpr",
    "register",
    "reinterpret_cast|10",
    "requires",
    "return",
    "sizeof",
    "static_assert",
    "static_cast|10",
    "struct",
    "switch",
    "synchronized",
    "template",
    "this",
    "thread_local",
    "throw",
    "transaction_safe",
    "transaction_safe_dynamic",
    "true",
    "try",
    "typedef",
    "typeid",
    "typename",
    "union",
    "using",
    "virtual",
    "volatile",
    "while",
    "xor",
    "xor_eq"
  ];
  const RESERVED_TYPES = [
    "bool",
    "char",
    "char16_t",
    "char32_t",
    "char8_t",
    "double",
    "float",
    "int",
    "long",
    "short",
    "void",
    "wchar_t",
    "unsigned",
    "signed",
    "const",
    "static"
  ];
  const TYPE_HINTS = [
    "any",
    "auto_ptr",
    "barrier",
    "binary_semaphore",
    "bitset",
    "complex",
    "condition_variable",
    "condition_variable_any",
    "counting_semaphore",
    "deque",
    "false_type",
    "flat_map",
    "flat_set",
    "future",
    "imaginary",
    "initializer_list",
    "istringstream",
    "jthread",
    "latch",
    "lock_guard",
    "multimap",
    "multiset",
    "mutex",
    "optional",
    "ostringstream",
    "packaged_task",
    "pair",
    "promise",
    "priority_queue",
    "queue",
    "recursive_mutex",
    "recursive_timed_mutex",
    "scoped_lock",
    "set",
    "shared_future",
    "shared_lock",
    "shared_mutex",
    "shared_timed_mutex",
    "shared_ptr",
    "stack",
    "string_view",
    "stringstream",
    "timed_mutex",
    "thread",
    "true_type",
    "tuple",
    "unique_lock",
    "unique_ptr",
    "unordered_map",
    "unordered_multimap",
    "unordered_multiset",
    "unordered_set",
    "variant",
    "vector",
    "weak_ptr",
    "wstring",
    "wstring_view"
  ];
  const FUNCTION_HINTS = [
    "abort",
    "abs",
    "acos",
    "apply",
    "as_const",
    "asin",
    "atan",
    "atan2",
    "calloc",
    "ceil",
    "cerr",
    "cin",
    "clog",
    "cos",
    "cosh",
    "cout",
    "declval",
    "endl",
    "exchange",
    "exit",
    "exp",
    "fabs",
    "floor",
    "fmod",
    "forward",
    "fprintf",
    "fputs",
    "free",
    "frexp",
    "fscanf",
    "future",
    "invoke",
    "isalnum",
    "isalpha",
    "iscntrl",
    "isdigit",
    "isgraph",
    "islower",
    "isprint",
    "ispunct",
    "isspace",
    "isupper",
    "isxdigit",
    "labs",
    "launder",
    "ldexp",
    "log",
    "log10",
    "make_pair",
    "make_shared",
    "make_shared_for_overwrite",
    "make_tuple",
    "make_unique",
    "malloc",
    "memchr",
    "memcmp",
    "memcpy",
    "memset",
    "modf",
    "move",
    "pow",
    "printf",
    "putchar",
    "puts",
    "realloc",
    "scanf",
    "sin",
    "sinh",
    "snprintf",
    "sprintf",
    "sqrt",
    "sscanf",
    "std",
    "stderr",
    "stdin",
    "stdout",
    "strcat",
    "strchr",
    "strcmp",
    "strcpy",
    "strcspn",
    "strlen",
    "strncat",
    "strncmp",
    "strncpy",
    "strpbrk",
    "strrchr",
    "strspn",
    "strstr",
    "swap",
    "tan",
    "tanh",
    "terminate",
    "to_underlying",
    "tolower",
    "toupper",
    "vfprintf",
    "visit",
    "vprintf",
    "vsprintf"
  ];
  const LITERALS3 = [
    "NULL",
    "false",
    "nullopt",
    "nullptr",
    "true"
  ];
  const BUILT_IN = ["_Pragma"];
  const CPP_KEYWORDS = {
    type: RESERVED_TYPES,
    keyword: RESERVED_KEYWORDS,
    literal: LITERALS3,
    built_in: BUILT_IN,
    _type_hints: TYPE_HINTS
  };
  const FUNCTION_DISPATCH = {
    className: "function.dispatch",
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: FUNCTION_HINTS
    },
    begin: regex.concat(
      /\b/,
      `(?!${RESERVED_KEYWORDS.join("|")})`,
      hljs.IDENT_RE,
      regex.lookahead(/(<[^<>]+>|)\s*\(/)
    )
  };
  const EXPRESSION_CONTAINS = [
    FUNCTION_DISPATCH,
    ...PREPROCESSORS,
    CPP_PRIMITIVE_TYPES,
    C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    NUMBERS,
    STRINGS
  ];
  const EXPRESSION_CONTEXT = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: CPP_KEYWORDS,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        contains: EXPRESSION_CONTAINS.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  };
  const FUNCTION_DECLARATION = {
    className: "function",
    begin: "(" + FUNCTION_TYPE_RE + "[\\*&\\s]+){1," + MAX_FUNCTION_TYPE_TOKENS + "}" + FUNCTION_TITLE,
    returnBegin: true,
    end: /[{;=]/,
    excludeEnd: true,
    keywords: CPP_KEYWORDS,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: CPP_KEYWORDS,
        relevance: 0
      },
      {
        begin: FUNCTION_TITLE,
        returnBegin: true,
        contains: [TITLE_MODE],
        relevance: 0
      },
      // needed because we do not have look-behind on the below rule
      // to prevent it from grabbing the final : in a :: pair
      {
        begin: /::/,
        relevance: 0
      },
      // initializers
      {
        begin: /:/,
        endsWithParent: true,
        contains: [
          STRINGS,
          NUMBERS
        ]
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        relevance: 0,
        contains: [
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          STRINGS,
          NUMBERS,
          CPP_PRIMITIVE_TYPES,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: CPP_KEYWORDS,
            relevance: 0,
            contains: [
              "self",
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS,
              CPP_PRIMITIVE_TYPES
            ]
          }
        ]
      },
      CPP_PRIMITIVE_TYPES,
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ...PREPROCESSORS
    ]
  };
  return {
    name: "C++",
    aliases: [
      "cc",
      "c++",
      "h++",
      "hpp",
      "hh",
      "hxx",
      "cxx"
    ],
    keywords: CPP_KEYWORDS,
    illegal: "</",
    classNameAliases: { "function.dispatch": "built_in" },
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      FUNCTION_DISPATCH,
      EXPRESSION_CONTAINS,
      [
        ...PREPROCESSORS,
        {
          // containers: ie, `vector <int> rooms (9);`
          begin: "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)",
          end: ">",
          keywords: CPP_KEYWORDS,
          contains: [
            "self",
            CPP_PRIMITIVE_TYPES
          ]
        },
        {
          begin: hljs.IDENT_RE + "::",
          keywords: CPP_KEYWORDS
        },
        {
          match: [
            // extra complexity to deal with `enum class` and `enum struct`
            /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
            /\s+/,
            /\w+/
          ],
          className: {
            1: "keyword",
            3: "title.class"
          }
        }
      ]
    )
  };
}

// node_modules/highlight.js/es/languages/csharp.js
function csharp(hljs) {
  const BUILT_IN_KEYWORDS = [
    "bool",
    "byte",
    "char",
    "decimal",
    "delegate",
    "double",
    "dynamic",
    "enum",
    "float",
    "int",
    "long",
    "nint",
    "nuint",
    "object",
    "sbyte",
    "short",
    "string",
    "ulong",
    "uint",
    "ushort"
  ];
  const FUNCTION_MODIFIERS = [
    "public",
    "private",
    "protected",
    "static",
    "internal",
    "protected",
    "abstract",
    "async",
    "extern",
    "override",
    "unsafe",
    "virtual",
    "new",
    "sealed",
    "partial"
  ];
  const LITERAL_KEYWORDS = [
    "default",
    "false",
    "null",
    "true"
  ];
  const NORMAL_KEYWORDS = [
    "abstract",
    "as",
    "base",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "do",
    "else",
    "event",
    "explicit",
    "extern",
    "finally",
    "fixed",
    "for",
    "foreach",
    "goto",
    "if",
    "implicit",
    "in",
    "interface",
    "internal",
    "is",
    "lock",
    "namespace",
    "new",
    "operator",
    "out",
    "override",
    "params",
    "private",
    "protected",
    "public",
    "readonly",
    "record",
    "ref",
    "return",
    "scoped",
    "sealed",
    "sizeof",
    "stackalloc",
    "static",
    "struct",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "unchecked",
    "unsafe",
    "using",
    "virtual",
    "void",
    "volatile",
    "while"
  ];
  const CONTEXTUAL_KEYWORDS = [
    "add",
    "alias",
    "and",
    "ascending",
    "args",
    "async",
    "await",
    "by",
    "descending",
    "dynamic",
    "equals",
    "file",
    "from",
    "get",
    "global",
    "group",
    "init",
    "into",
    "join",
    "let",
    "nameof",
    "not",
    "notnull",
    "on",
    "or",
    "orderby",
    "partial",
    "record",
    "remove",
    "required",
    "scoped",
    "select",
    "set",
    "unmanaged",
    "value|0",
    "var",
    "when",
    "where",
    "with",
    "yield"
  ];
  const KEYWORDS3 = {
    keyword: NORMAL_KEYWORDS.concat(CONTEXTUAL_KEYWORDS),
    built_in: BUILT_IN_KEYWORDS,
    literal: LITERAL_KEYWORDS
  };
  const TITLE_MODE = hljs.inherit(hljs.TITLE_MODE, { begin: "[a-zA-Z](\\.?\\w)*" });
  const DIGITS = "\\d(_*\\d)*";
  const INTEGER_SUFFIX = "([uU][lL]?|[lL][uU]?)?";
  const REAL_SUFFIX = "([fFdDmM]|[uU][lL]?|[lL][uU]?)?";
  const NUMBERS = {
    className: "number",
    variants: [
      { begin: "\\b0[bB]_*[01](_*[01])*" + INTEGER_SUFFIX },
      { begin: "(-?)\\b0[xX]_*[a-fA-F0-9](_*[a-fA-F0-9])*" + INTEGER_SUFFIX },
      { begin: "(-?)(\\b" + DIGITS + "(\\.(" + DIGITS + ")?)?|\\." + DIGITS + ")([eE][-+]?" + DIGITS + ")?" + REAL_SUFFIX }
    ],
    relevance: 0
  };
  const RAW_STRING = {
    className: "string",
    begin: /"""("*)(?!")(.|\n)*?"""\1/,
    relevance: 1
  };
  const VERBATIM_STRING = {
    className: "string",
    begin: '@"',
    end: '"',
    contains: [{ begin: '""' }]
  };
  const VERBATIM_STRING_NO_LF = hljs.inherit(VERBATIM_STRING, { illegal: /\n/ });
  const SUBST = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS3
  };
  const SUBST_NO_LF = hljs.inherit(SUBST, { illegal: /\n/ });
  const INTERPOLATED_STRING = {
    className: "string",
    begin: /\$"/,
    end: '"',
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      hljs.BACKSLASH_ESCAPE,
      SUBST_NO_LF
    ]
  };
  const INTERPOLATED_VERBATIM_STRING = {
    className: "string",
    begin: /\$@"/,
    end: '"',
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      SUBST
    ]
  };
  const INTERPOLATED_VERBATIM_STRING_NO_LF = hljs.inherit(INTERPOLATED_VERBATIM_STRING, {
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      SUBST_NO_LF
    ]
  });
  SUBST.contains = [
    INTERPOLATED_VERBATIM_STRING,
    INTERPOLATED_STRING,
    VERBATIM_STRING,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    NUMBERS,
    hljs.C_BLOCK_COMMENT_MODE
  ];
  SUBST_NO_LF.contains = [
    INTERPOLATED_VERBATIM_STRING_NO_LF,
    INTERPOLATED_STRING,
    VERBATIM_STRING_NO_LF,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    NUMBERS,
    hljs.inherit(hljs.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
  ];
  const STRING = { variants: [
    RAW_STRING,
    INTERPOLATED_VERBATIM_STRING,
    INTERPOLATED_STRING,
    VERBATIM_STRING,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ] };
  const GENERIC_MODIFIER = {
    begin: "<",
    end: ">",
    contains: [
      { beginKeywords: "in out" },
      TITLE_MODE
    ]
  };
  const TYPE_IDENT_RE = hljs.IDENT_RE + "(<" + hljs.IDENT_RE + "(\\s*,\\s*" + hljs.IDENT_RE + ")*>)?(\\[\\])?";
  const AT_IDENTIFIER = {
    // prevents expressions like `@class` from incorrect flagging
    // `class` as a keyword
    begin: "@" + hljs.IDENT_RE,
    relevance: 0
  };
  return {
    name: "C#",
    aliases: [
      "cs",
      "c#"
    ],
    keywords: KEYWORDS3,
    illegal: /::/,
    contains: [
      hljs.COMMENT(
        "///",
        "$",
        {
          returnBegin: true,
          contains: [
            {
              className: "doctag",
              variants: [
                {
                  begin: "///",
                  relevance: 0
                },
                { begin: "<!--|-->" },
                {
                  begin: "</?",
                  end: ">"
                }
              ]
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "meta",
        begin: "#",
        end: "$",
        keywords: { keyword: "if else elif endif define undef warning error line region endregion pragma checksum" }
      },
      STRING,
      NUMBERS,
      {
        beginKeywords: "class interface",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:,]/,
        contains: [
          { beginKeywords: "where class" },
          TITLE_MODE,
          GENERIC_MODIFIER,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          TITLE_MODE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "record",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          TITLE_MODE,
          GENERIC_MODIFIER,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // [Attributes("")]
        className: "meta",
        begin: "^\\s*\\[(?=[\\w])",
        excludeBegin: true,
        end: "\\]",
        excludeEnd: true,
        contains: [
          {
            className: "string",
            begin: /"/,
            end: /"/
          }
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: "new return throw await else",
        relevance: 0
      },
      {
        className: "function",
        begin: "(" + TYPE_IDENT_RE + "\\s+)+" + hljs.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
        returnBegin: true,
        end: /\s*[{;=]/,
        excludeEnd: true,
        keywords: KEYWORDS3,
        contains: [
          // prevents these from being highlighted `title`
          {
            beginKeywords: FUNCTION_MODIFIERS.join(" "),
            relevance: 0
          },
          {
            begin: hljs.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
            returnBegin: true,
            contains: [
              hljs.TITLE_MODE,
              GENERIC_MODIFIER
            ],
            relevance: 0
          },
          { match: /\(\)/ },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS3,
            relevance: 0,
            contains: [
              STRING,
              NUMBERS,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      AT_IDENTIFIER
    ]
  };
}

// node_modules/highlight.js/es/languages/css.js
var MODES = (hljs) => {
  return {
    IMPORTANT: {
      scope: "meta",
      begin: "!important"
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: "number",
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    UNICODE_RANGE: {
      scope: "number",
      begin: /\b[Uu]\+[0-9A-Fa-f][0-9A-Fa-f?]{0,5}(-[0-9A-Fa-f][0-9A-Fa-f]{0,5})?/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: "selector-attr",
      begin: /\[/,
      end: /\]/,
      illegal: "$",
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: "number",
      begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};
var HTML_TAGS = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
];
var SVG_TAGS = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
];
var TAGS = [
  ...HTML_TAGS,
  ...SVG_TAGS
];
var MEDIA_FEATURES = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse();
var PSEUDO_CLASSES = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse();
var PSEUDO_ELEMENTS = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse();
var ATTRIBUTES = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "corner-bottom-left-shape",
  "corner-bottom-right-shape",
  "corner-shape",
  "corner-top-left-shape",
  "corner-top-right-shape",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "unicode-range",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
function css(hljs) {
  const regex = hljs.regex;
  const modes = MODES(hljs);
  const VENDOR_PREFIX = { begin: /-(webkit|moz|ms|o)-(?=[a-z])/ };
  const AT_MODIFIERS = "and or not only";
  const AT_PROPERTY_RE = /@-?\w[\w]*(-\w+)*/;
  const IDENT_RE3 = "[a-zA-Z-][a-zA-Z0-9_-]*";
  const STRINGS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ];
  return {
    name: "CSS",
    case_insensitive: true,
    illegal: /[=|'\$]/,
    keywords: { keyframePosition: "from to" },
    classNameAliases: {
      // for visual continuity with `tag {}` and because we
      // don't have a great class for this?
      keyframePosition: "selector-tag"
    },
    contains: [
      modes.BLOCK_COMMENT,
      VENDOR_PREFIX,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      modes.CSS_NUMBER_MODE,
      {
        className: "selector-id",
        begin: /#[A-Za-z0-9_-]+/,
        relevance: 0
      },
      {
        className: "selector-class",
        begin: "\\." + IDENT_RE3,
        relevance: 0
      },
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        variants: [
          { begin: ":(" + PSEUDO_CLASSES.join("|") + ")" },
          { begin: ":(:)?(" + PSEUDO_ELEMENTS.join("|") + ")" }
        ]
      },
      // we may actually need this (12/2020)
      // { // pseudo-selector params
      //   begin: /\(/,
      //   end: /\)/,
      //   contains: [ hljs.CSS_NUMBER_MODE ]
      // },
      modes.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + ATTRIBUTES.join("|") + ")\\b"
      },
      // attribute values
      {
        begin: /:/,
        end: /[;}{]/,
        contains: [
          modes.BLOCK_COMMENT,
          modes.HEXCOLOR,
          modes.IMPORTANT,
          modes.CSS_NUMBER_MODE,
          modes.UNICODE_RANGE,
          ...STRINGS,
          // needed to highlight these as strings and to avoid issues with
          // illegal characters that might be inside urls that would trigger the
          // languages illegal stack
          {
            begin: /(url|data-uri)\(/,
            end: /\)/,
            relevance: 0,
            // from keywords
            keywords: { built_in: "url data-uri" },
            contains: [
              ...STRINGS,
              {
                className: "string",
                // any character other than `)` as in `url()` will be the start
                // of a string, which ends with `)` (from the parent mode)
                begin: /[^)]/,
                endsWithParent: true,
                excludeEnd: true
              }
            ]
          },
          modes.FUNCTION_DISPATCH
        ]
      },
      {
        begin: regex.lookahead(/@/),
        end: "[{;]",
        relevance: 0,
        illegal: /:/,
        // break on Less variables @var: ...
        contains: [
          {
            className: "keyword",
            begin: AT_PROPERTY_RE
          },
          {
            begin: /\s/,
            endsWithParent: true,
            excludeEnd: true,
            relevance: 0,
            keywords: {
              $pattern: /[a-z-]+/,
              keyword: AT_MODIFIERS,
              attribute: MEDIA_FEATURES.join(" ")
            },
            contains: [
              {
                begin: /[a-z-]+(?=:)/,
                className: "attribute"
              },
              ...STRINGS,
              modes.CSS_NUMBER_MODE
            ]
          }
        ]
      },
      {
        className: "selector-tag",
        begin: "\\b(" + TAGS.join("|") + ")\\b"
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/diff.js
function diff(hljs) {
  const regex = hljs.regex;
  return {
    name: "Diff",
    aliases: ["patch"],
    contains: [
      {
        className: "meta",
        relevance: 10,
        match: regex.either(
          /^@@ +-\d+,\d+ +\+\d+,\d+ +@@/,
          // @@ -1,2 +1,2 @@
          /^@@ +-\d+ +\+\d+,\d+ +@@/,
          // @@ -1 +1,2 @@
          /^@@ +-\d+,\d+ +\+\d+ +@@/,
          // @@ -1,2 +1 @@
          /^@@ +-\d+ +\+\d+ +@@/,
          // @@ -1 +1 @@
          /^\*\*\* +\d+,\d+ +\*\*\*\*$/,
          /^--- +\d+,\d+ +----$/
        )
      },
      {
        className: "comment",
        variants: [
          {
            begin: regex.either(
              /Index: /,
              /^index/,
              /={3,}/,
              /^-{3}/,
              /^\*{3} /,
              /^\+{3}/,
              /^diff --git/
            ),
            end: /$/
          },
          { match: /^\*{15}$/ }
        ]
      },
      {
        className: "addition",
        begin: /^\+/,
        end: /$/
      },
      {
        className: "deletion",
        begin: /^-/,
        end: /$/
      },
      {
        className: "addition",
        begin: /^!/,
        end: /$/
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/go.js
function go(hljs) {
  const LITERALS3 = [
    "true",
    "false",
    "iota",
    "nil"
  ];
  const BUILT_INS3 = [
    "append",
    "cap",
    "close",
    "complex",
    "copy",
    "imag",
    "len",
    "make",
    "new",
    "panic",
    "print",
    "println",
    "real",
    "recover",
    "delete"
  ];
  const TYPES3 = [
    "bool",
    "byte",
    "complex64",
    "complex128",
    "error",
    "float32",
    "float64",
    "int8",
    "int16",
    "int32",
    "int64",
    "string",
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "int",
    "uint",
    "uintptr",
    "rune"
  ];
  const KWS = [
    "break",
    "case",
    "chan",
    "const",
    "continue",
    "default",
    "defer",
    "else",
    "fallthrough",
    "for",
    "func",
    "go",
    "goto",
    "if",
    "import",
    "interface",
    "map",
    "package",
    "range",
    "return",
    "select",
    "struct",
    "switch",
    "type",
    "var"
  ];
  const KEYWORDS3 = {
    keyword: KWS,
    type: TYPES3,
    literal: LITERALS3,
    built_in: BUILT_INS3
  };
  return {
    name: "Go",
    aliases: ["golang"],
    keywords: KEYWORDS3,
    illegal: "</",
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "string",
        variants: [
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          {
            begin: "`",
            end: "`"
          }
        ]
      },
      {
        className: "number",
        variants: [
          {
            match: /-?\b0[xX]\.[a-fA-F0-9](_?[a-fA-F0-9])*[pP][+-]?\d(_?\d)*i?/,
            // hex without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b0[xX](_?[a-fA-F0-9])+((\.([a-fA-F0-9](_?[a-fA-F0-9])*)?)?[pP][+-]?\d(_?\d)*)?i?/,
            // hex with a present digit before . (making a digit afterwards optional)
            relevance: 0
          },
          {
            match: /-?\b0[oO](_?[0-7])*i?/,
            // leading 0o octal
            relevance: 0
          },
          {
            match: /-?\b0[bB](_?[01])*i?/,
            // leading 0b binary
            relevance: 0
          },
          {
            match: /-?\.\d(_?\d)*([eE][+-]?\d(_?\d)*)?i?/,
            // decimal without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b\d(_?\d)*(\.(\d(_?\d)*)?)?([eE][+-]?\d(_?\d)*)?i?/,
            // decimal with a present digit before . (making a digit afterwards optional)
            relevance: 0
          }
        ]
      },
      {
        begin: /:=/
        // relevance booster
      },
      {
        className: "function",
        beginKeywords: "func",
        end: "\\s*(\\{|$)",
        excludeEnd: true,
        contains: [
          hljs.TITLE_MODE,
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: true,
            keywords: KEYWORDS3,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/graphql.js
function graphql(hljs) {
  const regex = hljs.regex;
  const GQL_NAME = /[_A-Za-z][_0-9A-Za-z]*/;
  return {
    name: "GraphQL",
    aliases: ["gql"],
    case_insensitive: true,
    disableAutodetect: false,
    keywords: {
      keyword: [
        "query",
        "mutation",
        "subscription",
        "type",
        "input",
        "schema",
        "directive",
        "interface",
        "union",
        "scalar",
        "fragment",
        "enum",
        "on"
      ],
      literal: [
        "true",
        "false",
        "null"
      ]
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.NUMBER_MODE,
      {
        scope: "punctuation",
        match: /[.]{3}/,
        relevance: 0
      },
      {
        scope: "punctuation",
        begin: /[\!\(\)\:\=\[\]\{\|\}]{1}/,
        relevance: 0
      },
      {
        scope: "variable",
        begin: /\$/,
        end: /\W/,
        excludeEnd: true,
        relevance: 0
      },
      {
        scope: "meta",
        match: /@\w+/,
        excludeEnd: true
      },
      {
        scope: "symbol",
        begin: regex.concat(GQL_NAME, regex.lookahead(/\s*:/)),
        relevance: 0
      }
    ],
    illegal: [
      /[;<']/,
      /BEGIN/
    ]
  };
}

// node_modules/highlight.js/es/languages/ini.js
function ini(hljs) {
  const regex = hljs.regex;
  const NUMBERS = {
    className: "number",
    relevance: 0,
    variants: [
      { begin: /([+-]+)?[\d]+_[\d_]+/ },
      { begin: hljs.NUMBER_RE }
    ]
  };
  const COMMENTS = hljs.COMMENT();
  COMMENTS.variants = [
    {
      begin: /;/,
      end: /$/
    },
    {
      begin: /#/,
      end: /$/
    }
  ];
  const VARIABLES = {
    className: "variable",
    variants: [
      { begin: /\$[\w\d"][\w\d_]*/ },
      { begin: /\$\{(.*?)\}/ }
    ]
  };
  const LITERALS3 = {
    className: "literal",
    begin: /\bon|off|true|false|yes|no\b/
  };
  const STRINGS = {
    className: "string",
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: "'''",
        end: "'''",
        relevance: 10
      },
      {
        begin: '"""',
        end: '"""',
        relevance: 10
      },
      {
        begin: '"',
        end: '"'
      },
      {
        begin: "'",
        end: "'"
      }
    ]
  };
  const ARRAY = {
    begin: /\[/,
    end: /\]/,
    contains: [
      COMMENTS,
      LITERALS3,
      VARIABLES,
      STRINGS,
      NUMBERS,
      "self"
    ],
    relevance: 0
  };
  const BARE_KEY = /[A-Za-z0-9_-]+/;
  const QUOTED_KEY_DOUBLE_QUOTE = /"(\\"|[^"])*"/;
  const QUOTED_KEY_SINGLE_QUOTE = /'[^']*'/;
  const ANY_KEY = regex.either(
    BARE_KEY,
    QUOTED_KEY_DOUBLE_QUOTE,
    QUOTED_KEY_SINGLE_QUOTE
  );
  const DOTTED_KEY = regex.concat(
    ANY_KEY,
    "(\\s*\\.\\s*",
    ANY_KEY,
    ")*",
    regex.lookahead(/\s*=\s*[^#\s]/)
  );
  return {
    name: "TOML, also INI",
    aliases: ["toml"],
    case_insensitive: true,
    illegal: /\S/,
    contains: [
      COMMENTS,
      {
        className: "section",
        begin: /\[+/,
        end: /\]+/
      },
      {
        begin: DOTTED_KEY,
        className: "attr",
        starts: {
          end: /$/,
          contains: [
            COMMENTS,
            ARRAY,
            LITERALS3,
            VARIABLES,
            STRINGS,
            NUMBERS
          ]
        }
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/java.js
var decimalDigits = "[0-9](_*[0-9])*";
var frac = `\\.(${decimalDigits})`;
var hexDigits = "[0-9a-fA-F](_*[0-9a-fA-F])*";
var NUMERIC = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${frac})[fFdD]?\\b` },
    { begin: `\\b(${decimalDigits})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))[pP][+-]?(${decimalDigits})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function recurRegex(re2, substitution, depth) {
  if (depth === -1) return "";
  return re2.replace(substitution, (_2) => {
    return recurRegex(re2, substitution, depth - 1);
  });
}
function java(hljs) {
  const regex = hljs.regex;
  const JAVA_IDENT_RE = "[\xC0-\u02B8a-zA-Z_$][\xC0-\u02B8a-zA-Z_$0-9]*";
  const ARRAY_BRACKETS_OPTIONAL_RE = "(?:(?:\\s*\\[\\s*])+)?";
  const SIMPLE_TYPE_RE = JAVA_IDENT_RE + "<@@@>" + ARRAY_BRACKETS_OPTIONAL_RE;
  const WILDCARD_TYPE_RE = "\\?(?:\\s+(?:extends|super)\\s+" + SIMPLE_TYPE_RE + ")?";
  const TYPE_ARG_RE = "(?:" + WILDCARD_TYPE_RE + "|" + SIMPLE_TYPE_RE + ")";
  const TYPE_ARGS_OPTIONAL_RE = recurRegex(
    "(?:\\s*<\\s*" + TYPE_ARG_RE + "(?:\\s*,\\s*" + TYPE_ARG_RE + ")*\\s*>)?",
    /<@@@>/g,
    2
  );
  const MAIN_KEYWORDS = [
    "synchronized",
    "abstract",
    "private",
    "var",
    "static",
    "if",
    "const ",
    "for",
    "while",
    "strictfp",
    "finally",
    "protected",
    "import",
    "native",
    "final",
    "void",
    "enum",
    "else",
    "break",
    "transient",
    "catch",
    "instanceof",
    "volatile",
    "case",
    "assert",
    "package",
    "default",
    "public",
    "try",
    "switch",
    "continue",
    "throws",
    "protected",
    "public",
    "private",
    "module",
    "requires",
    "exports",
    "do",
    "sealed",
    "yield",
    "permits",
    "goto",
    "when"
  ];
  const BUILT_INS3 = [
    "super",
    "this"
  ];
  const LITERALS3 = [
    "false",
    "true",
    "null"
  ];
  const TYPES3 = [
    "char",
    "boolean",
    "long",
    "float",
    "int",
    "byte",
    "short",
    "double"
  ];
  const KEYWORDS3 = {
    keyword: MAIN_KEYWORDS,
    literal: LITERALS3,
    type: TYPES3,
    built_in: BUILT_INS3
  };
  const ANNOTATION = {
    className: "meta",
    begin: "@" + JAVA_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: ["self"]
        // allow nested () inside our annotation
      }
    ]
  };
  const PARAMS = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS3,
    relevance: 0,
    contains: [hljs.C_BLOCK_COMMENT_MODE],
    endsParent: true
  };
  return {
    name: "Java",
    aliases: ["jsp"],
    keywords: KEYWORDS3,
    illegal: /<\/|#/,
    contains: [
      hljs.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              // eat up @'s in emails to prevent them to be recognized as doctags
              begin: /\w+@/,
              relevance: 0
            },
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      // relevance boost
      {
        begin: /import java\.[a-z]+\./,
        keywords: "import",
        relevance: 2
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        begin: /"""/,
        end: /"""/,
        className: "string",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        match: [
          /\b(?:class|interface|enum|extends|implements|new)/,
          /\s+/,
          JAVA_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        // Exceptions for hyphenated keywords
        match: /non-sealed/,
        scope: "keyword"
      },
      {
        // Expression keywords prevent keyword-led expressions from being
        // recognized as variable or method declarations.
        beginKeywords: "new throw return else yield assert",
        relevance: 0
      },
      {
        begin: [
          JAVA_IDENT_RE,
          regex.concat(TYPE_ARGS_OPTIONAL_RE, ARRAY_BRACKETS_OPTIONAL_RE, /\s+/),
          JAVA_IDENT_RE,
          ARRAY_BRACKETS_OPTIONAL_RE,
          /\s*/,
          /=(?!=)/
        ],
        className: {
          1: "type",
          3: "variable",
          6: "operator"
        }
      },
      {
        begin: [
          /record/,
          /\s+/,
          JAVA_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        },
        contains: [
          PARAMS,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        begin: [
          JAVA_IDENT_RE,
          regex.concat(TYPE_ARGS_OPTIONAL_RE, ARRAY_BRACKETS_OPTIONAL_RE, /\s+/),
          JAVA_IDENT_RE,
          /\s*(?=\()/
        ],
        className: {
          1: "type",
          3: "title.function"
        },
        keywords: KEYWORDS3,
        contains: [
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            keywords: KEYWORDS3,
            relevance: 0,
            contains: [
              ANNOTATION,
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE,
              NUMERIC,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      NUMERIC,
      ANNOTATION
    ]
  };
}

// node_modules/highlight.js/es/languages/javascript.js
var IDENT_RE = "[A-Za-z$_][0-9A-Za-z$_]*";
var KEYWORDS = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
];
var LITERALS = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
];
var TYPES = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
];
var ERROR_TYPES = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
];
var BUILT_IN_GLOBALS = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
];
var BUILT_IN_VARIABLES = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "self",
  "global"
  // Node.js
];
var BUILT_INS = [].concat(
  BUILT_IN_GLOBALS,
  TYPES,
  ERROR_TYPES
);
function javascript(hljs) {
  const regex = hljs.regex;
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };
  const IDENT_RE$1 = IDENT_RE;
  const FRAGMENT = {
    begin: "<>",
    end: "</>"
  };
  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
  const XML_TAG = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        nextChar === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
      ) {
        response.ignoreMatch();
        return;
      }
      if (nextChar === ">") {
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }
      let m;
      const afterMatch = match.input.substring(afterMatchIndex);
      if (m = afterMatch.match(/^\s*=/)) {
        response.ignoreMatch();
        return;
      }
      if (m = afterMatch.match(/^\s+extends\s+/)) {
        if (m.index === 0) {
          response.ignoreMatch();
          return;
        }
      }
    }
  };
  const KEYWORDS$1 = {
    $pattern: IDENT_RE,
    keyword: KEYWORDS,
    literal: LITERALS,
    built_in: BUILT_INS,
    "variable.language": BUILT_IN_VARIABLES
  };
  const decimalDigits3 = "[0-9](_?[0-9])*";
  const frac3 = `\\.(${decimalDigits3})`;
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac3})|\\.)?|(${frac3}))[eE][+-]?(${decimalDigits3})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac3})\\b|\\.)?|(${frac3})\\b` },
      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  };
  const SUBST = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: KEYWORDS$1,
    contains: []
    // defined later
  };
  const HTML_TEMPLATE = {
    begin: ".?html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "xml"
    }
  };
  const CSS_TEMPLATE = {
    begin: ".?css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "css"
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: ".?gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "graphql"
    }
  };
  const TEMPLATE_STRING = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    "\\*/",
    {
      relevance: 0,
      contains: [
        {
          begin: "(?=@[A-Za-z]+)",
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            },
            {
              className: "type",
              begin: "\\{",
              end: "\\}",
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: "variable",
              begin: IDENT_RE$1 + "(?=\\s*(-)|$)",
              endsParent: true,
              relevance: 0
            },
            // eat spaces (not newlines) so we can find
            // types or variables
            {
              begin: /(?=[^\n])\s/,
              relevance: 0
            }
          ]
        }
      ]
    }
  );
  const COMMENT = {
    className: "comment",
    variants: [
      JSDOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const SUBST_INTERNALS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    HTML_TEMPLATE,
    CSS_TEMPLATE,
    GRAPHQL_TEMPLATE,
    TEMPLATE_STRING,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    NUMBER
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS$1,
    contains: [
      "self"
    ].concat(SUBST_INTERNALS)
  });
  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: KEYWORDS$1,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$1,
    contains: PARAMS_CONTAINS
  };
  const CLASS_OR_EXTENDS = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1,
          /\s+/,
          /extends/,
          /\s+/,
          regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  };
  const CLASS_REFERENCE = {
    relevance: 0,
    match: regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...TYPES,
        ...ERROR_TYPES
      ]
    }
  };
  const USE_STRICT = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  };
  const FUNCTION_DEFINITION = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          IDENT_RE$1,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [PARAMS],
    illegal: /%/
  };
  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function noneOf(list) {
    return regex.concat("(?!", list.join("|"), ")");
  }
  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS,
        "super",
        "import",
        "await"
      ].map((x3) => `${x3}\\s*\\(`)),
      IDENT_RE$1,
      regex.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  };
  const PROPERTY_ACCESS = {
    begin: regex.concat(/\./, regex.lookahead(
      regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
    )),
    end: IDENT_RE$1,
    excludeBegin: true,
    keywords: "prototype",
    className: "property",
    relevance: 0
  };
  const GETTER_OR_SETTER = {
    match: [
      /get|set/,
      /\s+/,
      IDENT_RE$1,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };
  const FUNC_LEAD_IN_RE = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + hljs.UNDERSCORE_IDENT_RE + ")\\s*=>";
  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/,
      /\s+/,
      IDENT_RE$1,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      regex.lookahead(FUNC_LEAD_IN_RE)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: KEYWORDS$1,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
    illegal: /#(?![$_A-Za-z])/,
    contains: [
      hljs.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      USE_STRICT,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      HTML_TEMPLATE,
      CSS_TEMPLATE,
      GRAPHQL_TEMPLATE,
      TEMPLATE_STRING,
      COMMENT,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        scope: "attr",
        match: IDENT_RE$1 + regex.lookahead(":"),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      {
        // "value" container
        begin: "(" + hljs.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          COMMENT,
          hljs.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: hljs.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: true
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: true,
                    excludeEnd: true,
                    keywords: KEYWORDS$1,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      FUNCTION_DEFINITION,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + hljs.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: true,
        label: "func.def",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      PROPERTY_ACCESS,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + IDENT_RE$1,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [PARAMS]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/json.js
var EXTENDED_NUMBER_RE = "([-+]?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)|NaN|[-+]?Infinity";
var EXTENDED_NUMBER_MODE = {
  scope: "number",
  match: EXTENDED_NUMBER_RE,
  relevance: 0
};
function json(hljs) {
  const ATTRIBUTE = {
    className: "attr",
    begin: /(("(\\.|[^\\"\r\n])*")|('(\\.|[^\\'\r\n])*'))(?=\s*:)/,
    relevance: 1.01
  };
  const PUNCTUATION = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  };
  const LITERALS3 = [
    "true",
    "false",
    "null"
  ];
  const LITERALS_MODE = {
    scope: "literal",
    beginKeywords: LITERALS3.join(" ")
  };
  return {
    name: "JSON",
    aliases: ["jsonc", "json5"],
    keywords: {
      literal: LITERALS3
    },
    contains: [
      ATTRIBUTE,
      PUNCTUATION,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      LITERALS_MODE,
      EXTENDED_NUMBER_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}

// node_modules/highlight.js/es/languages/kotlin.js
var decimalDigits2 = "[0-9](_*[0-9])*";
var frac2 = `\\.(${decimalDigits2})`;
var hexDigits2 = "[0-9a-fA-F](_*[0-9a-fA-F])*";
var NUMERIC2 = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${decimalDigits2})((${frac2})|\\.)?|(${frac2}))[eE][+-]?(${decimalDigits2})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${decimalDigits2})((${frac2})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${frac2})[fFdD]?\\b` },
    { begin: `\\b(${decimalDigits2})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${hexDigits2})\\.?|(${hexDigits2})?\\.(${hexDigits2}))[pP][+-]?(${decimalDigits2})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${hexDigits2})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function kotlin(hljs) {
  const KEYWORDS3 = {
    keyword: "abstract as val var vararg get set class object open private protected public noinline crossinline dynamic final enum if else do while for when throw try catch finally import package is in fun override companion reified inline lateinit init interface annotation data sealed internal infix operator out by constructor super tailrec where const inner suspend typealias external expect actual",
    built_in: "Byte Short Char Int Long Boolean Float Double Void Unit Nothing",
    literal: "true false null"
  };
  const KEYWORDS_WITH_LABEL = {
    className: "keyword",
    begin: /\b(break|continue|return|this)\b/,
    starts: { contains: [
      {
        className: "symbol",
        begin: /@\w+/
      }
    ] }
  };
  const LABEL = {
    className: "symbol",
    begin: hljs.UNDERSCORE_IDENT_RE + "@"
  };
  const SUBST = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    contains: [hljs.C_NUMBER_MODE]
  };
  const VARIABLE = {
    className: "variable",
    begin: "\\$" + hljs.UNDERSCORE_IDENT_RE
  };
  const STRING = {
    className: "string",
    variants: [
      {
        begin: '"""',
        end: '"""(?=[^"])',
        contains: [
          VARIABLE,
          SUBST
        ]
      },
      // Can't use built-in modes easily, as we want to use STRING in the meta
      // context as 'meta-string' and there's no syntax to remove explicitly set
      // classNames in built-in modes.
      {
        begin: "'",
        end: "'",
        illegal: /\n/,
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: '"',
        end: '"',
        illegal: /\n/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          VARIABLE,
          SUBST
        ]
      }
    ]
  };
  SUBST.contains.push(STRING);
  const ANNOTATION_USE_SITE = {
    className: "meta",
    begin: "@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*" + hljs.UNDERSCORE_IDENT_RE + ")?"
  };
  const ANNOTATION = {
    className: "meta",
    begin: "@" + hljs.UNDERSCORE_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          hljs.inherit(STRING, { className: "string" }),
          "self"
        ]
      }
    ]
  };
  const KOTLIN_NUMBER_MODE = NUMERIC2;
  const KOTLIN_NESTED_COMMENT = hljs.COMMENT(
    "/\\*",
    "\\*/",
    { contains: [hljs.C_BLOCK_COMMENT_MODE] }
  );
  const KOTLIN_PAREN_TYPE = { variants: [
    {
      className: "type",
      begin: hljs.UNDERSCORE_IDENT_RE
    },
    {
      begin: /\(/,
      end: /\)/,
      contains: []
      // defined later
    }
  ] };
  const KOTLIN_PAREN_TYPE2 = KOTLIN_PAREN_TYPE;
  KOTLIN_PAREN_TYPE2.variants[1].contains = [KOTLIN_PAREN_TYPE];
  KOTLIN_PAREN_TYPE.variants[1].contains = [KOTLIN_PAREN_TYPE2];
  return {
    name: "Kotlin",
    aliases: [
      "kt",
      "kts",
      "ktm",
      "ktx"
    ],
    keywords: KEYWORDS3,
    contains: [
      hljs.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      KOTLIN_NESTED_COMMENT,
      KEYWORDS_WITH_LABEL,
      LABEL,
      ANNOTATION_USE_SITE,
      ANNOTATION,
      {
        className: "function",
        beginKeywords: "fun",
        end: "[(]|$",
        returnBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS3,
        relevance: 5,
        contains: [
          {
            begin: hljs.UNDERSCORE_IDENT_RE + "\\s*\\(",
            returnBegin: true,
            relevance: 0,
            contains: [hljs.UNDERSCORE_TITLE_MODE]
          },
          {
            className: "type",
            begin: /</,
            end: />/,
            keywords: "reified",
            relevance: 0
          },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: true,
            keywords: KEYWORDS3,
            relevance: 0,
            contains: [
              {
                begin: /:/,
                end: /[=,\/]/,
                endsWithParent: true,
                contains: [
                  KOTLIN_PAREN_TYPE,
                  hljs.C_LINE_COMMENT_MODE,
                  KOTLIN_NESTED_COMMENT
                ],
                relevance: 0
              },
              hljs.C_LINE_COMMENT_MODE,
              KOTLIN_NESTED_COMMENT,
              ANNOTATION_USE_SITE,
              ANNOTATION,
              STRING,
              hljs.C_NUMBER_MODE
            ]
          },
          KOTLIN_NESTED_COMMENT
        ]
      },
      {
        begin: [
          /class|interface|trait/,
          /\s+/,
          hljs.UNDERSCORE_IDENT_RE
        ],
        beginScope: {
          3: "title.class"
        },
        keywords: "class interface trait",
        end: /[:\{(]|$/,
        excludeEnd: true,
        illegal: "extends implements",
        contains: [
          { beginKeywords: "public protected internal private constructor" },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: "type",
            begin: /</,
            end: />/,
            excludeBegin: true,
            excludeEnd: true,
            relevance: 0
          },
          {
            className: "type",
            begin: /[,:]\s*/,
            end: /[<\(,){\s]|$/,
            excludeBegin: true,
            returnEnd: true
          },
          ANNOTATION_USE_SITE,
          ANNOTATION
        ]
      },
      STRING,
      {
        className: "meta",
        begin: "^#!/usr/bin/env",
        end: "$",
        illegal: "\n"
      },
      KOTLIN_NUMBER_MODE
    ]
  };
}

// node_modules/highlight.js/es/languages/less.js
var MODES2 = (hljs) => {
  return {
    IMPORTANT: {
      scope: "meta",
      begin: "!important"
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: "number",
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    UNICODE_RANGE: {
      scope: "number",
      begin: /\b[Uu]\+[0-9A-Fa-f][0-9A-Fa-f?]{0,5}(-[0-9A-Fa-f][0-9A-Fa-f]{0,5})?/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: "selector-attr",
      begin: /\[/,
      end: /\]/,
      illegal: "$",
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: "number",
      begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};
var HTML_TAGS2 = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
];
var SVG_TAGS2 = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
];
var TAGS2 = [
  ...HTML_TAGS2,
  ...SVG_TAGS2
];
var MEDIA_FEATURES2 = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse();
var PSEUDO_CLASSES2 = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse();
var PSEUDO_ELEMENTS2 = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse();
var ATTRIBUTES2 = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "corner-bottom-left-shape",
  "corner-bottom-right-shape",
  "corner-shape",
  "corner-top-left-shape",
  "corner-top-right-shape",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "unicode-range",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
var PSEUDO_SELECTORS = PSEUDO_CLASSES2.concat(PSEUDO_ELEMENTS2).sort().reverse();
function less(hljs) {
  const modes = MODES2(hljs);
  const PSEUDO_SELECTORS$1 = PSEUDO_SELECTORS;
  const AT_MODIFIERS = "and or not only";
  const IDENT_RE3 = "[\\w-]+";
  const INTERP_IDENT_RE = "(" + IDENT_RE3 + "|@\\{" + IDENT_RE3 + "\\})";
  const RULES = [];
  const VALUE_MODES = [];
  const STRING_MODE = function(c3) {
    return {
      // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
      className: "string",
      begin: "~?" + c3 + ".*?" + c3
    };
  };
  const IDENT_MODE = function(name, begin, relevance) {
    return {
      className: name,
      begin,
      relevance
    };
  };
  const AT_KEYWORDS = {
    $pattern: /[a-z-]+/,
    keyword: AT_MODIFIERS,
    attribute: MEDIA_FEATURES2.join(" ")
  };
  const PARENS_MODE = {
    // used only to properly balance nested parens inside mixin call, def. arg list
    begin: "\\(",
    end: "\\)",
    contains: VALUE_MODES,
    keywords: AT_KEYWORDS,
    relevance: 0
  };
  VALUE_MODES.push(
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    STRING_MODE("'"),
    STRING_MODE('"'),
    modes.CSS_NUMBER_MODE,
    // fixme: it does not include dot for numbers like .5em :(
    {
      begin: "(url|data-uri)\\(",
      starts: {
        className: "string",
        end: "[\\)\\n]",
        excludeEnd: true
      }
    },
    modes.UNICODE_RANGE,
    modes.HEXCOLOR,
    PARENS_MODE,
    IDENT_MODE("variable", "@@?" + IDENT_RE3, 10),
    IDENT_MODE("variable", "@\\{" + IDENT_RE3 + "\\}"),
    IDENT_MODE("built_in", "~?`[^`]*?`"),
    // inline javascript (or whatever host language) *multiline* string
    {
      // @media features (it’s here to not duplicate things in AT_RULE_MODE with extra PARENS_MODE overriding):
      className: "attribute",
      begin: IDENT_RE3 + "\\s*:",
      end: ":",
      returnBegin: true,
      excludeEnd: true
    },
    modes.IMPORTANT,
    { beginKeywords: "and not" },
    modes.FUNCTION_DISPATCH
  );
  const VALUE_WITH_RULESETS = VALUE_MODES.concat({
    begin: /\{/,
    end: /\}/,
    contains: RULES
  });
  const MIXIN_GUARD_MODE = {
    beginKeywords: "when",
    endsWithParent: true,
    contains: [{ beginKeywords: "and not" }].concat(VALUE_MODES)
    // using this form to override VALUE’s 'function' match
  };
  const RULE_MODE = {
    begin: INTERP_IDENT_RE + "\\s*:",
    returnBegin: true,
    end: /[;}]/,
    relevance: 0,
    contains: [
      { begin: /-(webkit|moz|ms|o)-/ },
      modes.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + ATTRIBUTES2.join("|") + ")\\b",
        end: /(?=:)/,
        starts: {
          endsWithParent: true,
          illegal: "[<=$]",
          relevance: 0,
          contains: VALUE_MODES
        }
      }
    ]
  };
  const AT_RULE_MODE = {
    className: "keyword",
    begin: "@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b",
    starts: {
      end: "[;{}]",
      keywords: AT_KEYWORDS,
      returnEnd: true,
      contains: VALUE_MODES,
      relevance: 0
    }
  };
  const VAR_RULE_MODE = {
    className: "variable",
    variants: [
      // using more strict pattern for higher relevance to increase chances of Less detection.
      // this is *the only* Less specific statement used in most of the sources, so...
      // (we’ll still often loose to the css-parser unless there's '//' comment,
      // simply because 1 variable just can't beat 99 properties :)
      {
        begin: "@" + IDENT_RE3 + "\\s*:",
        relevance: 15
      },
      { begin: "@" + IDENT_RE3 }
    ],
    starts: {
      end: "[;}]",
      returnEnd: true,
      contains: VALUE_WITH_RULESETS
    }
  };
  const SELECTOR_MODE = {
    // first parse unambiguous selectors (i.e. those not starting with tag)
    // then fall into the scary lookahead-discriminator variant.
    // this mode also handles mixin definitions and calls
    variants: [
      {
        begin: "[\\.#:&\\[>]",
        end: "[;{}]"
        // mixin calls end with ';'
      },
      {
        begin: INTERP_IDENT_RE,
        end: /\{/
      }
    ],
    returnBegin: true,
    returnEnd: true,
    illegal: `[<='$"]`,
    relevance: 0,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      MIXIN_GUARD_MODE,
      IDENT_MODE("keyword", "all\\b"),
      IDENT_MODE("variable", "@\\{" + IDENT_RE3 + "\\}"),
      // otherwise it’s identified as tag
      {
        begin: "\\b(" + TAGS2.join("|") + ")\\b",
        className: "selector-tag"
      },
      modes.CSS_NUMBER_MODE,
      IDENT_MODE("selector-tag", INTERP_IDENT_RE, 0),
      IDENT_MODE("selector-id", "#" + INTERP_IDENT_RE),
      IDENT_MODE("selector-class", "\\." + INTERP_IDENT_RE, 0),
      IDENT_MODE("selector-tag", "&", 0),
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        begin: ":(" + PSEUDO_CLASSES2.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + PSEUDO_ELEMENTS2.join("|") + ")"
      },
      {
        begin: /\(/,
        end: /\)/,
        relevance: 0,
        contains: VALUE_WITH_RULESETS
      },
      // argument list of parametric mixins
      { begin: "!important" },
      // eat !important after mixin call or it will be colored as tag
      modes.FUNCTION_DISPATCH
    ]
  };
  const PSEUDO_SELECTOR_MODE = {
    begin: IDENT_RE3 + `:(:)?(${PSEUDO_SELECTORS$1.join("|")})`,
    returnBegin: true,
    contains: [SELECTOR_MODE]
  };
  RULES.push(
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    AT_RULE_MODE,
    VAR_RULE_MODE,
    PSEUDO_SELECTOR_MODE,
    RULE_MODE,
    SELECTOR_MODE,
    MIXIN_GUARD_MODE,
    modes.FUNCTION_DISPATCH
  );
  return {
    name: "Less",
    case_insensitive: true,
    illegal: `[=>'/<($"]`,
    contains: RULES
  };
}

// node_modules/highlight.js/es/languages/lua.js
function lua(hljs) {
  const OPENING_LONG_BRACKET = "\\[=*\\[";
  const CLOSING_LONG_BRACKET = "\\]=*\\]";
  const LONG_BRACKETS = {
    begin: OPENING_LONG_BRACKET,
    end: CLOSING_LONG_BRACKET,
    contains: ["self"]
  };
  const COMMENTS = [
    hljs.COMMENT("--(?!" + OPENING_LONG_BRACKET + ")", "$"),
    hljs.COMMENT(
      "--" + OPENING_LONG_BRACKET,
      CLOSING_LONG_BRACKET,
      {
        contains: [LONG_BRACKETS],
        relevance: 10
      }
    )
  ];
  return {
    name: "Lua",
    aliases: ["pluto"],
    keywords: {
      $pattern: hljs.UNDERSCORE_IDENT_RE,
      literal: "true false nil",
      keyword: "and break do else elseif end for goto if in local global not or repeat return then until while",
      built_in: (
        // Metatags and globals:
        "_G _ENV _VERSION __index __newindex __mode __call __metatable __tostring __len __gc __add __sub __mul __div __mod __pow __concat __unm __eq __lt __le assert collectgarbage dofile error getfenv getmetatable ipairs load loadfile loadstring module next pairs pcall print rawequal rawget rawset require select setfenv setmetatable tonumber tostring type unpack xpcall arg self coroutine resume yield status wrap create running debug getupvalue debug sethook getmetatable gethook setmetatable setlocal traceback setfenv getinfo setupvalue getlocal getregistry getfenv io lines write close flush open output type read stderr stdin input stdout popen tmpfile math log max acos huge ldexp pi cos tanh pow deg tan cosh sinh random randomseed frexp ceil floor rad abs sqrt modf asin min mod fmod log10 atan2 exp sin atan os exit setlocale date getenv difftime remove time clock tmpname rename execute package preload loadlib loaded loaders cpath config path seeall string sub upper len gfind rep find match char dump gmatch reverse byte format gsub lower table setn insert getn foreachi maxn foreach concat sort remove"
      )
    },
    contains: COMMENTS.concat([
      {
        className: "function",
        beginKeywords: "function",
        end: "\\)",
        contains: [
          hljs.inherit(hljs.TITLE_MODE, { begin: "([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*" }),
          {
            className: "params",
            begin: "\\(",
            endsWithParent: true,
            contains: COMMENTS
          }
        ].concat(COMMENTS)
      },
      hljs.C_NUMBER_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: "string",
        begin: OPENING_LONG_BRACKET,
        end: CLOSING_LONG_BRACKET,
        contains: [LONG_BRACKETS],
        relevance: 5
      }
    ])
  };
}

// node_modules/highlight.js/es/languages/makefile.js
function makefile(hljs) {
  const VARIABLE = {
    className: "variable",
    variants: [
      {
        begin: "\\$\\(" + hljs.UNDERSCORE_IDENT_RE + "\\)",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      { begin: /\$[@%<?\^\+\*]/ }
    ]
  };
  const QUOTE_STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VARIABLE
    ]
  };
  const FUNC = {
    className: "variable",
    begin: /\$\([\w-]+\s/,
    end: /\)/,
    keywords: { built_in: "subst patsubst strip findstring filter filter-out sort word wordlist firstword lastword dir notdir suffix basename addsuffix addprefix join wildcard realpath abspath error warning shell origin flavor foreach if or and call eval file value" },
    contains: [
      VARIABLE,
      QUOTE_STRING
      // Added QUOTE_STRING as they can be a part of functions
    ]
  };
  const ASSIGNMENT = { begin: "^" + hljs.UNDERSCORE_IDENT_RE + "\\s*(?=[:+?]?=)" };
  const META = {
    className: "meta",
    begin: /^\.PHONY:/,
    end: /$/,
    keywords: {
      $pattern: /[\.\w]+/,
      keyword: ".PHONY"
    }
  };
  const TARGET = {
    className: "section",
    begin: /^[^\s]+:/,
    end: /$/,
    contains: [VARIABLE]
  };
  return {
    name: "Makefile",
    aliases: [
      "mk",
      "mak",
      "make"
    ],
    keywords: {
      $pattern: /[\w-]+/,
      keyword: "define endef undefine ifdef ifndef ifeq ifneq else endif include -include sinclude override export unexport private vpath"
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      VARIABLE,
      QUOTE_STRING,
      FUNC,
      ASSIGNMENT,
      META,
      TARGET
    ]
  };
}

// node_modules/highlight.js/es/languages/markdown.js
function markdown(hljs) {
  const regex = hljs.regex;
  const INLINE_HTML = {
    begin: /<\/?[A-Za-z_]/,
    end: ">",
    subLanguage: "xml",
    relevance: 0
  };
  const HORIZONTAL_RULE = { match: /^ {0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}$/ };
  const CODE = {
    className: "code",
    variants: [
      // TODO: fix to allow these to work with sublanguage also
      { begin: "(`{3,})[^`](.|\\n)*?\\1`*[ ]*" },
      { begin: "(~{3,})[^~](.|\\n)*?\\1~*[ ]*" },
      // needed to allow markdown as a sublanguage to work
      {
        begin: "```",
        end: "```+[ ]*$"
      },
      {
        begin: "~~~",
        end: "~~~+[ ]*$"
      },
      { begin: "`.+?`" },
      {
        begin: "(?=^( {4}|\\t))",
        // use contains to gobble up multiple lines to allow the block to be whatever size
        // but only have a single open/close tag vs one per line
        contains: [
          {
            begin: "^( {4}|\\t)",
            end: "(\\n)$"
          }
        ],
        relevance: 0
      }
    ]
  };
  const LIST = {
    className: "bullet",
    begin: "^[ 	]*([*+-]|(\\d+\\.))(?=\\s+)",
    end: "\\s+",
    excludeEnd: true
  };
  const LINK_REFERENCE = {
    begin: /^\[[^\n]+\]:/,
    returnBegin: true,
    contains: [
      {
        className: "symbol",
        begin: /\[/,
        end: /\]/,
        excludeBegin: true,
        excludeEnd: true
      },
      {
        className: "link",
        begin: /:\s*/,
        end: /$/,
        excludeBegin: true
      }
    ]
  };
  const URL_SCHEME = /[A-Za-z][A-Za-z0-9+.-]*/;
  const LINK = {
    variants: [
      // too much like nested array access in so many languages
      // to have any real relevance
      {
        begin: /\[.+?\]\[.*?\]/,
        relevance: 0
      },
      // popular internet URLs
      {
        begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
        relevance: 2
      },
      {
        begin: regex.concat(/\[.+?\]\(/, URL_SCHEME, /:\/\/.*?\)/),
        relevance: 2
      },
      // relative urls
      {
        begin: /\[.+?\]\([./?&#].*?\)/,
        relevance: 1
      },
      // whatever else, lower relevance (might not be a link at all)
      {
        begin: /\[.*?\]\(.*?\)/,
        relevance: 0
      }
    ],
    returnBegin: true,
    contains: [
      {
        // empty strings for alt or link text
        match: /\[(?=\])/
      },
      {
        className: "string",
        relevance: 0,
        begin: "\\[",
        end: "\\]",
        excludeBegin: true,
        returnEnd: true
      },
      {
        className: "link",
        relevance: 0,
        begin: "\\]\\(",
        end: "\\)",
        excludeBegin: true,
        excludeEnd: true
      },
      {
        className: "symbol",
        relevance: 0,
        begin: "\\]\\[",
        end: "\\]",
        excludeBegin: true,
        excludeEnd: true
      }
    ]
  };
  const BOLD = {
    className: "strong",
    contains: [],
    // defined later
    variants: [
      {
        begin: /_{2}(?!\s)/,
        end: /_{2}/
      },
      {
        begin: /\*{2}(?!\s)/,
        end: /\*{2}/
      }
    ]
  };
  const ITALIC = {
    className: "emphasis",
    contains: [],
    // defined later
    variants: [
      {
        begin: /\*(?![*\s])/,
        end: /\*/
      },
      {
        begin: /_(?![_\s])/,
        end: /_/,
        relevance: 0
      }
    ]
  };
  const BOLD_WITHOUT_ITALIC = hljs.inherit(BOLD, { contains: [] });
  const ITALIC_WITHOUT_BOLD = hljs.inherit(ITALIC, { contains: [] });
  BOLD.contains.push(ITALIC_WITHOUT_BOLD);
  ITALIC.contains.push(BOLD_WITHOUT_ITALIC);
  let CONTAINABLE = [
    INLINE_HTML,
    LINK
  ];
  [
    BOLD,
    ITALIC,
    BOLD_WITHOUT_ITALIC,
    ITALIC_WITHOUT_BOLD
  ].forEach((m) => {
    m.contains = m.contains.concat(CONTAINABLE);
  });
  CONTAINABLE = CONTAINABLE.concat(BOLD, ITALIC);
  const HEADER = {
    className: "section",
    variants: [
      {
        begin: "^#{1,6}",
        end: "$",
        contains: CONTAINABLE
      },
      {
        begin: "(?=^.+?\\n[=-]{2,}$)",
        contains: [
          { begin: "^[=-]*$" },
          {
            begin: "^",
            end: "\\n",
            contains: CONTAINABLE
          }
        ]
      }
    ]
  };
  const BLOCKQUOTE = {
    className: "quote",
    begin: "^>\\s+",
    contains: CONTAINABLE,
    end: "$"
  };
  const ENTITY = {
    //https://spec.commonmark.org/0.31.2/#entity-references
    scope: "literal",
    match: /&([a-zA-Z0-9]+|#[0-9]{1,7}|#[Xx][0-9a-fA-F]{1,6});/
  };
  return {
    name: "Markdown",
    aliases: [
      "md",
      "mkdown",
      "mkd"
    ],
    contains: [
      HEADER,
      INLINE_HTML,
      LIST,
      // must come before BOLD/ITALIC so that a `***` or `___` thematic break
      // isn't mistaken for the start of bold text
      HORIZONTAL_RULE,
      BOLD,
      ITALIC,
      BLOCKQUOTE,
      CODE,
      LINK,
      LINK_REFERENCE,
      ENTITY
    ]
  };
}

// node_modules/highlight.js/es/languages/objectivec.js
function objectivec(hljs) {
  const API_CLASS = {
    className: "built_in",
    begin: "\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+"
  };
  const IDENTIFIER_RE = /[a-zA-Z@][a-zA-Z0-9_]*/;
  const TYPES3 = [
    "int",
    "float",
    "char",
    "unsigned",
    "signed",
    "short",
    "long",
    "double",
    "wchar_t",
    "unichar",
    "void",
    "bool",
    "BOOL",
    "id|0",
    "_Bool"
  ];
  const KWS = [
    "while",
    "export",
    "sizeof",
    "typedef",
    "const",
    "struct",
    "for",
    "union",
    "volatile",
    "static",
    "mutable",
    "if",
    "do",
    "return",
    "goto",
    "enum",
    "else",
    "break",
    "extern",
    "asm",
    "case",
    "default",
    "register",
    "explicit",
    "typename",
    "switch",
    "continue",
    "inline",
    "readonly",
    "assign",
    "readwrite",
    "self",
    "@synchronized",
    "id",
    "typeof",
    "nonatomic",
    "IBOutlet",
    "IBAction",
    "strong",
    "weak",
    "copy",
    "in",
    "out",
    "inout",
    "bycopy",
    "byref",
    "oneway",
    "__strong",
    "__weak",
    "__block",
    "__autoreleasing",
    "@private",
    "@protected",
    "@public",
    "@try",
    "@property",
    "@end",
    "@throw",
    "@catch",
    "@finally",
    "@autoreleasepool",
    "@synthesize",
    "@dynamic",
    "@selector",
    "@optional",
    "@required",
    "@encode",
    "@package",
    "@import",
    "@defs",
    "@compatibility_alias",
    "__bridge",
    "__bridge_transfer",
    "__bridge_retained",
    "__bridge_retain",
    "__covariant",
    "__contravariant",
    "__kindof",
    "_Nonnull",
    "_Nullable",
    "_Null_unspecified",
    "__FUNCTION__",
    "__PRETTY_FUNCTION__",
    "__attribute__",
    "getter",
    "setter",
    "retain",
    "unsafe_unretained",
    "nonnull",
    "nullable",
    "null_unspecified",
    "null_resettable",
    "class",
    "instancetype",
    "NS_DESIGNATED_INITIALIZER",
    "NS_UNAVAILABLE",
    "NS_REQUIRES_SUPER",
    "NS_RETURNS_INNER_POINTER",
    "NS_INLINE",
    "NS_AVAILABLE",
    "NS_DEPRECATED",
    "NS_ENUM",
    "NS_OPTIONS",
    "NS_SWIFT_UNAVAILABLE",
    "NS_ASSUME_NONNULL_BEGIN",
    "NS_ASSUME_NONNULL_END",
    "NS_REFINED_FOR_SWIFT",
    "NS_SWIFT_NAME",
    "NS_SWIFT_NOTHROW",
    "NS_DURING",
    "NS_HANDLER",
    "NS_ENDHANDLER",
    "NS_VALUERETURN",
    "NS_VOIDRETURN"
  ];
  const LITERALS3 = [
    "false",
    "true",
    "FALSE",
    "TRUE",
    "nil",
    "YES",
    "NO",
    "NULL"
  ];
  const BUILT_INS3 = [
    "dispatch_once_t",
    "dispatch_queue_t",
    "dispatch_sync",
    "dispatch_async",
    "dispatch_once"
  ];
  const KEYWORDS3 = {
    "variable.language": [
      "this",
      "super"
    ],
    $pattern: IDENTIFIER_RE,
    keyword: KWS,
    literal: LITERALS3,
    built_in: BUILT_INS3,
    type: TYPES3
  };
  const CLASS_KEYWORDS = {
    $pattern: IDENTIFIER_RE,
    keyword: [
      "@interface",
      "@class",
      "@protocol",
      "@implementation"
    ]
  };
  return {
    name: "Objective-C",
    aliases: [
      "mm",
      "objc",
      "obj-c",
      "obj-c++",
      "objective-c++"
    ],
    keywords: KEYWORDS3,
    illegal: "</",
    contains: [
      API_CLASS,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      {
        className: "string",
        variants: [
          {
            begin: '@"',
            end: '"',
            illegal: "\\n",
            contains: [hljs.BACKSLASH_ESCAPE]
          }
        ]
      },
      {
        className: "meta",
        begin: /#\s*[a-z]+\b/,
        end: /$/,
        keywords: { keyword: "if else elif endif define undef warning error line pragma ifdef ifndef include" },
        contains: [
          {
            begin: /\\\n/,
            relevance: 0
          },
          hljs.inherit(hljs.QUOTE_STRING_MODE, { className: "string" }),
          {
            className: "string",
            begin: /<.*?>/,
            end: /$/,
            illegal: "\\n"
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        className: "class",
        begin: "(" + CLASS_KEYWORDS.keyword.join("|") + ")\\b",
        end: /(\{|$)/,
        excludeEnd: true,
        keywords: CLASS_KEYWORDS,
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      },
      {
        begin: "\\." + hljs.UNDERSCORE_IDENT_RE,
        relevance: 0
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/perl.js
function perl(hljs) {
  const regex = hljs.regex;
  const KEYWORDS3 = [
    "abs",
    "accept",
    "alarm",
    "and",
    "atan2",
    "bind",
    "binmode",
    "bless",
    "break",
    "caller",
    "chdir",
    "chmod",
    "chomp",
    "chop",
    "chown",
    "chr",
    "chroot",
    "class",
    "close",
    "closedir",
    "connect",
    "continue",
    "cos",
    "crypt",
    "dbmclose",
    "dbmopen",
    "defined",
    "delete",
    "die",
    "do",
    "dump",
    "each",
    "else",
    "elsif",
    "endgrent",
    "endhostent",
    "endnetent",
    "endprotoent",
    "endpwent",
    "endservent",
    "eof",
    "eval",
    "exec",
    "exists",
    "exit",
    "exp",
    "fcntl",
    "field",
    "fileno",
    "flock",
    "for",
    "foreach",
    "fork",
    "format",
    "formline",
    "getc",
    "getgrent",
    "getgrgid",
    "getgrnam",
    "gethostbyaddr",
    "gethostbyname",
    "gethostent",
    "getlogin",
    "getnetbyaddr",
    "getnetbyname",
    "getnetent",
    "getpeername",
    "getpgrp",
    "getpriority",
    "getprotobyname",
    "getprotobynumber",
    "getprotoent",
    "getpwent",
    "getpwnam",
    "getpwuid",
    "getservbyname",
    "getservbyport",
    "getservent",
    "getsockname",
    "getsockopt",
    "given",
    "glob",
    "gmtime",
    "goto",
    "grep",
    "gt",
    "hex",
    "if",
    "index",
    "int",
    "ioctl",
    "join",
    "keys",
    "kill",
    "last",
    "lc",
    "lcfirst",
    "length",
    "link",
    "listen",
    "local",
    "localtime",
    "log",
    "lstat",
    "lt",
    "ma",
    "map",
    "method",
    "mkdir",
    "msgctl",
    "msgget",
    "msgrcv",
    "msgsnd",
    "my",
    "ne",
    "next",
    "no",
    "not",
    "oct",
    "open",
    "opendir",
    "or",
    "ord",
    "our",
    "pack",
    "package",
    "pipe",
    "pop",
    "pos",
    "print",
    "printf",
    "prototype",
    "push",
    "q|0",
    "qq",
    "quotemeta",
    "qw",
    "qx",
    "rand",
    "read",
    "readdir",
    "readline",
    "readlink",
    "readpipe",
    "recv",
    "redo",
    "ref",
    "rename",
    "require",
    "reset",
    "return",
    "reverse",
    "rewinddir",
    "rindex",
    "rmdir",
    "say",
    "scalar",
    "seek",
    "seekdir",
    "select",
    "semctl",
    "semget",
    "semop",
    "send",
    "setgrent",
    "sethostent",
    "setnetent",
    "setpgrp",
    "setpriority",
    "setprotoent",
    "setpwent",
    "setservent",
    "setsockopt",
    "shift",
    "shmctl",
    "shmget",
    "shmread",
    "shmwrite",
    "shutdown",
    "sin",
    "sleep",
    "socket",
    "socketpair",
    "sort",
    "splice",
    "split",
    "sprintf",
    "sqrt",
    "srand",
    "stat",
    "state",
    "study",
    "sub",
    "substr",
    "symlink",
    "syscall",
    "sysopen",
    "sysread",
    "sysseek",
    "system",
    "syswrite",
    "tell",
    "telldir",
    "tie",
    "tied",
    "time",
    "times",
    "tr",
    "truncate",
    "uc",
    "ucfirst",
    "umask",
    "undef",
    "unless",
    "unlink",
    "unpack",
    "unshift",
    "untie",
    "until",
    "use",
    "utime",
    "values",
    "vec",
    "wait",
    "waitpid",
    "wantarray",
    "warn",
    "when",
    "while",
    "write",
    "x|0",
    "xor",
    "y|0"
  ];
  const REGEX_MODIFIERS = /[dualxmsipngr]{0,12}/;
  const PERL_KEYWORDS = {
    $pattern: /[\w.]+/,
    keyword: KEYWORDS3.join(" ")
  };
  const SUBST = {
    className: "subst",
    begin: "[$@]\\{",
    end: "\\}",
    keywords: PERL_KEYWORDS
  };
  const METHOD = {
    begin: /->\{/,
    end: /\}/
    // contains defined later
  };
  const ATTR = {
    scope: "attr",
    match: /\s+:\s*\w+(\s*\(.*?\))?/
  };
  const VAR = {
    scope: "variable",
    variants: [
      { begin: /\$\d/ },
      {
        begin: regex.concat(
          /[$%@](?!")(\^\w\b|#\w+(::\w+)*|\{\w+\}|\w+(::\w*)*)/,
          // negative look-ahead tries to avoid matching patterns that are not
          // Perl at all like $ident$, @ident@, etc.
          `(?![A-Za-z])(?![@$%])`
        )
      },
      {
        // Only $= is a special Perl variable and one can't declare @= or %=.
        begin: /[$%@](?!")[^\s\w{=]|\$=/,
        relevance: 0
      }
    ],
    contains: [ATTR]
  };
  const NUMBER = {
    className: "number",
    variants: [
      // decimal numbers:
      // include the case where a number starts with a dot (eg. .9), and
      // the leading 0? avoids mixing the first and second match on 0.x cases
      { match: /0?\.[0-9][0-9_]+\b/ },
      // include the special versioned number (eg. v5.38)
      { match: /\bv?(0|[1-9][0-9_]*(\.[0-9_]+)?|[1-9][0-9_]*)\b/ },
      // non-decimal numbers:
      { match: /\b0[0-7][0-7_]*\b/ },
      { match: /\b0x[0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { match: /\b0b[0-1][0-1_]*\b/ }
    ],
    relevance: 0
  };
  const STRING_CONTAINS = [
    hljs.BACKSLASH_ESCAPE,
    SUBST,
    VAR
  ];
  const REGEX_DELIMS = [
    /!/,
    /\//,
    /\|/,
    /\?/,
    /'/,
    /"/,
    // valid but infrequent and weird
    /#/
    // valid but infrequent and weird
  ];
  const PAIRED_DOUBLE_RE = (prefix, open, close = "\\1") => {
    const middle = close === "\\1" ? close : regex.concat(close, open);
    return regex.concat(
      regex.concat("(?:", prefix, ")"),
      open,
      /(?:\\.|[^\\\/])*?/,
      middle,
      /(?:\\.|[^\\\/])*?/,
      close,
      REGEX_MODIFIERS
    );
  };
  const PAIRED_RE = (prefix, open, close) => {
    return regex.concat(
      regex.concat("(?:", prefix, ")"),
      open,
      /(?:\\.|[^\\\/])*?/,
      close,
      REGEX_MODIFIERS
    );
  };
  const PERL_DEFAULT_CONTAINS = [
    VAR,
    hljs.HASH_COMMENT_MODE,
    hljs.COMMENT(
      /^=\w/,
      /=cut/,
      { endsWithParent: true }
    ),
    METHOD,
    {
      className: "string",
      contains: STRING_CONTAINS,
      variants: [
        {
          begin: "q[qwxr]?\\s*\\(",
          end: "\\)",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\[",
          end: "\\]",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\{",
          end: "\\}",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\|",
          end: "\\|",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*<",
          end: ">",
          relevance: 5
        },
        {
          begin: "qw\\s+q",
          end: "q",
          relevance: 5
        },
        {
          begin: "'",
          end: "'",
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: '"',
          end: '"'
        },
        {
          begin: "`",
          end: "`",
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: /\{\w+\}/,
          relevance: 0
        },
        {
          begin: "-?\\w+\\s*=>",
          relevance: 0
        }
      ]
    },
    NUMBER,
    {
      // regexp container
      begin: "(\\/\\/|" + hljs.RE_STARTERS_RE + "|\\b(split|return|print|reverse|grep)\\b)\\s*",
      keywords: "split return print reverse grep",
      relevance: 0,
      contains: [
        hljs.HASH_COMMENT_MODE,
        {
          className: "regexp",
          variants: [
            // allow matching common delimiters
            { begin: PAIRED_DOUBLE_RE("s|tr|y", regex.either(...REGEX_DELIMS, { capture: true })) },
            // and then paired delmis
            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\(", "\\)") },
            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\[", "\\]") },
            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\{", "\\}") }
          ],
          relevance: 2
        },
        {
          className: "regexp",
          variants: [
            {
              // could be a comment in many languages so do not count
              // as relevant
              begin: /(m|qr)\/\//,
              relevance: 0
            },
            // prefix is optional with /regex/
            { begin: PAIRED_RE("(?:m|qr)?", /\//, /\//) },
            // allow matching common delimiters
            { begin: PAIRED_RE("m|qr", regex.either(...REGEX_DELIMS, { capture: true }), /\1/) },
            // allow common paired delmins
            { begin: PAIRED_RE("m|qr", /\(/, /\)/) },
            { begin: PAIRED_RE("m|qr", /\[/, /\]/) },
            { begin: PAIRED_RE("m|qr", /\{/, /\}/) }
          ]
        }
      ]
    },
    {
      className: "function",
      beginKeywords: "sub method",
      end: "(\\s*\\(.*?\\))?[;{]",
      excludeEnd: true,
      relevance: 5,
      contains: [hljs.TITLE_MODE, ATTR]
    },
    {
      className: "class",
      beginKeywords: "class",
      end: "[;{]",
      excludeEnd: true,
      relevance: 5,
      contains: [hljs.TITLE_MODE, ATTR, NUMBER]
    },
    {
      begin: "-\\w\\b",
      relevance: 0
    },
    {
      begin: "^__DATA__$",
      end: "^__END__$",
      subLanguage: "mojolicious",
      contains: [
        {
          begin: "^@@.*",
          end: "$",
          className: "comment"
        }
      ]
    }
  ];
  SUBST.contains = PERL_DEFAULT_CONTAINS;
  METHOD.contains = PERL_DEFAULT_CONTAINS;
  return {
    name: "Perl",
    aliases: [
      "pl",
      "pm"
    ],
    keywords: PERL_KEYWORDS,
    contains: PERL_DEFAULT_CONTAINS
  };
}

// node_modules/highlight.js/es/languages/php.js
function php(hljs) {
  const regex = hljs.regex;
  const NOT_PERL_ETC = /(?![A-Za-z0-9])(?![$])/;
  const IDENT_RE3 = regex.concat(
    /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
    NOT_PERL_ETC
  );
  const PASCAL_CASE_CLASS_NAME_RE = regex.concat(
    /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
    NOT_PERL_ETC
  );
  const UPCASE_NAME_RE = regex.concat(
    /[A-Z]+/,
    NOT_PERL_ETC
  );
  const VARIABLE = {
    scope: "variable",
    match: "\\$+" + IDENT_RE3
  };
  const PREPROCESSOR = {
    scope: "meta",
    variants: [
      { begin: /<\?php/, relevance: 10 },
      // boost for obvious PHP
      { begin: /<\?=/ },
      // less relevant per PSR-1 which says not to use short-tags
      { begin: /<\?/, relevance: 0.1 },
      { begin: /\?>/ }
      // end php tag
    ]
  };
  const SUBST = {
    scope: "subst",
    variants: [
      { begin: /\$\w+/ },
      {
        begin: /\{\$/,
        end: /\}/
      }
    ]
  };
  const SINGLE_QUOTED = hljs.inherit(hljs.APOS_STRING_MODE, { illegal: null });
  const DOUBLE_QUOTED = hljs.inherit(hljs.QUOTE_STRING_MODE, {
    illegal: null,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST)
  });
  const HEREDOC = {
    begin: /<<<[ \t]*(?:(\w+)|"(\w+)")\n/,
    end: /[ \t]*(\w+)\b/,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
    "on:begin": (m, resp) => {
      resp.data._beginMatch = m[1] || m[2];
    },
    "on:end": (m, resp) => {
      if (resp.data._beginMatch !== m[1]) resp.ignoreMatch();
    }
  };
  const NOWDOC = hljs.END_SAME_AS_BEGIN({
    begin: /<<<[ \t]*'(\w+)'\n/,
    end: /[ \t]*(\w+)\b/
  });
  const WHITESPACE = "[ 	\n]";
  const STRING = {
    scope: "string",
    variants: [
      DOUBLE_QUOTED,
      SINGLE_QUOTED,
      HEREDOC,
      NOWDOC
    ]
  };
  const NUMBER = {
    scope: "number",
    variants: [
      { begin: `\\b0[bB][01]+(?:_[01]+)*\\b` },
      // Binary w/ underscore support
      { begin: `\\b0[oO][0-7]+(?:_[0-7]+)*\\b` },
      // Octals w/ underscore support
      { begin: `\\b0[xX][\\da-fA-F]+(?:_[\\da-fA-F]+)*\\b` },
      // Hex w/ underscore support
      // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
      { begin: `(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:[eE][+-]?\\d+)?` }
    ],
    relevance: 0
  };
  const LITERALS3 = [
    "false",
    "null",
    "true"
  ];
  const KWS = [
    // Magic constants:
    // <https://www.php.net/manual/en/language.constants.predefined.php>
    "__CLASS__",
    "__DIR__",
    "__FILE__",
    "__FUNCTION__",
    "__COMPILER_HALT_OFFSET__",
    "__LINE__",
    "__METHOD__",
    "__NAMESPACE__",
    "__TRAIT__",
    // Function that look like language construct or language construct that look like function:
    // List of keywords that may not require parenthesis
    "die",
    "echo",
    "exit",
    "include",
    "include_once",
    "print",
    "require",
    "require_once",
    // These are not language construct (function) but operate on the currently-executing function and can access the current symbol table
    // 'compact extract func_get_arg func_get_args func_num_args get_called_class get_parent_class ' +
    // Other keywords:
    // <https://www.php.net/manual/en/reserved.php>
    // <https://www.php.net/manual/en/language.types.type-juggling.php>
    "array",
    "abstract",
    "and",
    "as",
    "binary",
    "bool",
    "boolean",
    "break",
    "callable",
    "case",
    "catch",
    "class",
    "clone",
    "const",
    "continue",
    "declare",
    "default",
    "do",
    "double",
    "else",
    "elseif",
    "empty",
    "enddeclare",
    "endfor",
    "endforeach",
    "endif",
    "endswitch",
    "endwhile",
    "enum",
    "eval",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "foreach",
    "from",
    "global",
    "goto",
    "if",
    "implements",
    "instanceof",
    "insteadof",
    "int",
    "integer",
    "interface",
    "isset",
    "iterable",
    "list",
    "match|0",
    "mixed",
    "new",
    "never",
    "object",
    "or",
    "private",
    "protected",
    "public",
    "readonly",
    "real",
    "return",
    "string",
    "switch",
    "throw",
    "trait",
    "try",
    "unset",
    "use",
    "var",
    "void",
    "while",
    "xor",
    "yield"
  ];
  const BUILT_INS3 = [
    // Standard PHP library:
    // <https://www.php.net/manual/en/book.spl.php>
    "Error|0",
    "AppendIterator",
    "ArgumentCountError",
    "ArithmeticError",
    "ArrayIterator",
    "ArrayObject",
    "AssertionError",
    "BadFunctionCallException",
    "BadMethodCallException",
    "CachingIterator",
    "CallbackFilterIterator",
    "CompileError",
    "Countable",
    "DirectoryIterator",
    "DivisionByZeroError",
    "DomainException",
    "EmptyIterator",
    "ErrorException",
    "Exception",
    "FilesystemIterator",
    "FilterIterator",
    "GlobIterator",
    "InfiniteIterator",
    "InvalidArgumentException",
    "IteratorIterator",
    "LengthException",
    "LimitIterator",
    "LogicException",
    "MultipleIterator",
    "NoRewindIterator",
    "OutOfBoundsException",
    "OutOfRangeException",
    "OuterIterator",
    "OverflowException",
    "ParentIterator",
    "ParseError",
    "RangeException",
    "RecursiveArrayIterator",
    "RecursiveCachingIterator",
    "RecursiveCallbackFilterIterator",
    "RecursiveDirectoryIterator",
    "RecursiveFilterIterator",
    "RecursiveIterator",
    "RecursiveIteratorIterator",
    "RecursiveRegexIterator",
    "RecursiveTreeIterator",
    "RegexIterator",
    "RuntimeException",
    "SeekableIterator",
    "SplDoublyLinkedList",
    "SplFileInfo",
    "SplFileObject",
    "SplFixedArray",
    "SplHeap",
    "SplMaxHeap",
    "SplMinHeap",
    "SplObjectStorage",
    "SplObserver",
    "SplPriorityQueue",
    "SplQueue",
    "SplStack",
    "SplSubject",
    "SplTempFileObject",
    "TypeError",
    "UnderflowException",
    "UnexpectedValueException",
    "UnhandledMatchError",
    // Reserved interfaces:
    // <https://www.php.net/manual/en/reserved.interfaces.php>
    "ArrayAccess",
    "BackedEnum",
    "Closure",
    "Fiber",
    "Generator",
    "Iterator",
    "IteratorAggregate",
    "Serializable",
    "Stringable",
    "Throwable",
    "Traversable",
    "UnitEnum",
    "WeakReference",
    "WeakMap",
    // Reserved classes:
    // <https://www.php.net/manual/en/reserved.classes.php>
    "Directory",
    "__PHP_Incomplete_Class",
    "parent",
    "php_user_filter",
    "self",
    "static",
    "stdClass"
  ];
  const dualCase = (items) => {
    const result = [];
    items.forEach((item) => {
      result.push(item);
      if (item.toLowerCase() === item) {
        result.push(item.toUpperCase());
      } else {
        result.push(item.toLowerCase());
      }
    });
    return result;
  };
  const KEYWORDS3 = {
    keyword: KWS,
    literal: dualCase(LITERALS3),
    built_in: BUILT_INS3
  };
  const normalizeKeywords = (items) => {
    return items.map((item) => {
      return item.replace(/\|\d+$/, "");
    });
  };
  const CONSTRUCTOR_CALL = { variants: [
    {
      match: [
        /new/,
        regex.concat(WHITESPACE, "+"),
        // to prevent built ins from being confused as the class constructor call
        regex.concat("(?!", normalizeKeywords(BUILT_INS3).join("\\b|"), "\\b)"),
        PASCAL_CASE_CLASS_NAME_RE
      ],
      scope: {
        1: "keyword",
        4: "title.class"
      }
    }
  ] };
  const CONSTANT_REFERENCE = regex.concat(IDENT_RE3, "\\b(?!\\()");
  const LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON = { variants: [
    {
      match: [
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE
      ],
      scope: { 2: "variable.constant" }
    },
    {
      match: [
        /::/,
        /class/
      ],
      scope: { 2: "variable.language" }
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE
      ],
      scope: {
        1: "title.class",
        3: "variable.constant"
      }
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          "::",
          regex.lookahead(/(?!class\b)/)
        )
      ],
      scope: { 1: "title.class" }
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        /::/,
        /class/
      ],
      scope: {
        1: "title.class",
        3: "variable.language"
      }
    }
  ] };
  const NAMED_ARGUMENT = {
    scope: "attr",
    match: regex.concat(IDENT_RE3, regex.lookahead(":"), regex.lookahead(/(?!::)/))
  };
  const PARAMS_MODE = {
    relevance: 0,
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS3,
    contains: [
      NAMED_ARGUMENT,
      VARIABLE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      STRING,
      NUMBER,
      CONSTRUCTOR_CALL
    ]
  };
  const FUNCTION_INVOKE = {
    relevance: 0,
    match: [
      /\b/,
      // to prevent keywords from being confused as the function title
      regex.concat("(?!fn\\b|function\\b|", normalizeKeywords(KWS).join("\\b|"), "|", normalizeKeywords(BUILT_INS3).join("\\b|"), "\\b)"),
      IDENT_RE3,
      regex.concat(WHITESPACE, "*"),
      regex.lookahead(/(?=\()/)
    ],
    scope: { 3: "title.function.invoke" },
    contains: [PARAMS_MODE]
  };
  PARAMS_MODE.contains.push(FUNCTION_INVOKE);
  const ATTRIBUTE_CONTAINS = [
    NAMED_ARGUMENT,
    LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
    hljs.C_BLOCK_COMMENT_MODE,
    hljs.C_LINE_COMMENT_MODE,
    hljs.HASH_COMMENT_MODE,
    STRING,
    NUMBER,
    CONSTRUCTOR_CALL
  ];
  const ATTRIBUTES4 = {
    begin: regex.concat(
      /#\[\s*\\?/,
      regex.either(
        PASCAL_CASE_CLASS_NAME_RE,
        UPCASE_NAME_RE
      )
    ),
    beginScope: "meta",
    end: /]/,
    endScope: "meta",
    keywords: {
      literal: LITERALS3,
      keyword: [
        "new",
        "array"
      ]
    },
    contains: [
      {
        begin: /\[/,
        end: /]/,
        keywords: {
          literal: LITERALS3,
          keyword: [
            "new",
            "array"
          ]
        },
        contains: [
          "self",
          ...ATTRIBUTE_CONTAINS
        ]
      },
      ...ATTRIBUTE_CONTAINS,
      {
        scope: "meta",
        variants: [
          { match: PASCAL_CASE_CLASS_NAME_RE },
          { match: UPCASE_NAME_RE }
        ]
      }
    ]
  };
  return {
    case_insensitive: false,
    keywords: KEYWORDS3,
    contains: [
      ATTRIBUTES4,
      hljs.HASH_COMMENT_MODE,
      hljs.COMMENT("//", "$"),
      hljs.COMMENT(
        "/\\*",
        "\\*/",
        { contains: [
          {
            scope: "doctag",
            match: "@[A-Za-z]+"
          }
        ] }
      ),
      {
        match: /__halt_compiler\(\);/,
        keywords: "__halt_compiler",
        starts: {
          scope: "comment",
          end: hljs.MATCH_NOTHING_RE,
          contains: [
            {
              match: /\?>/,
              scope: "meta",
              endsParent: true
            }
          ]
        }
      },
      PREPROCESSOR,
      {
        scope: "variable.language",
        match: /\$this\b/
      },
      VARIABLE,
      FUNCTION_INVOKE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      {
        match: [
          /const/,
          /\s/,
          IDENT_RE3
        ],
        scope: {
          1: "keyword",
          3: "variable.constant"
        }
      },
      CONSTRUCTOR_CALL,
      {
        scope: "function",
        relevance: 0,
        beginKeywords: "fn function",
        end: /[;{]/,
        excludeEnd: true,
        illegal: "[$%\\[]",
        contains: [
          { beginKeywords: "use" },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            begin: "=>",
            // No markup, just a relevance booster
            endsParent: true
          },
          {
            scope: "params",
            begin: "\\(",
            end: "\\)",
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS3,
            contains: [
              "self",
              ATTRIBUTES4,
              VARIABLE,
              LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
              hljs.C_BLOCK_COMMENT_MODE,
              hljs.C_LINE_COMMENT_MODE,
              hljs.HASH_COMMENT_MODE,
              STRING,
              NUMBER
            ]
          }
        ]
      },
      {
        scope: "class",
        variants: [
          {
            beginKeywords: "enum",
            illegal: /[($"]/
          },
          {
            beginKeywords: "class interface trait",
            illegal: /[:($"]/
          }
        ],
        relevance: 0,
        end: /\{/,
        excludeEnd: true,
        contains: [
          { beginKeywords: "extends implements" },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      // both use and namespace still use "old style" rules (vs multi-match)
      // because the namespace name can include `\` and we still want each
      // element to be treated as its own *individual* title
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: ";",
        illegal: /[.']/,
        contains: [hljs.inherit(hljs.UNDERSCORE_TITLE_MODE, { scope: "title.class" })]
      },
      {
        beginKeywords: "use",
        relevance: 0,
        end: ";",
        contains: [
          // TODO: title.function vs title.class
          {
            match: /\b(as|const|function)\b/,
            scope: "keyword"
          },
          // TODO: could be title.class or title.function
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      STRING,
      NUMBER
    ]
  };
}

// node_modules/highlight.js/es/languages/php-template.js
function phpTemplate(hljs) {
  return {
    name: "PHP template",
    subLanguage: "xml",
    contains: [
      {
        begin: /<\?(php|=)?/,
        end: /\?>/,
        subLanguage: "php",
        contains: [
          // We don't want the php closing tag ?> to close the PHP block when
          // inside any of the following blocks:
          {
            begin: "/\\*",
            end: "\\*/",
            skip: true
          },
          {
            begin: 'b"',
            end: '"',
            skip: true
          },
          {
            begin: "b'",
            end: "'",
            skip: true
          },
          hljs.inherit(hljs.APOS_STRING_MODE, {
            illegal: null,
            className: null,
            contains: null,
            skip: true
          }),
          hljs.inherit(hljs.QUOTE_STRING_MODE, {
            illegal: null,
            className: null,
            contains: null,
            skip: true
          })
        ]
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/plaintext.js
function plaintext(hljs) {
  return {
    name: "Plain text",
    aliases: [
      "text",
      "txt"
    ],
    disableAutodetect: true
  };
}

// node_modules/highlight.js/es/languages/python.js
function python(hljs) {
  const regex = hljs.regex;
  const IDENT_RE3 = /[\p{XID_Start}_]\p{XID_Continue}*/u;
  const RESERVED_WORDS = [
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "case",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "lazy",
    "match",
    "nonlocal|10",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield"
  ];
  const BUILT_INS3 = [
    "__import__",
    "abs",
    "aiter",
    "all",
    "anext",
    "any",
    "ascii",
    "bin",
    "bool",
    "breakpoint",
    "bytearray",
    "bytes",
    "callable",
    "chr",
    "classmethod",
    "compile",
    "complex",
    "delattr",
    "dict",
    "dir",
    "divmod",
    "enumerate",
    "eval",
    "exec",
    "filter",
    "float",
    "format",
    "frozendict",
    "frozenset",
    "getattr",
    "globals",
    "hasattr",
    "hash",
    "help",
    "hex",
    "id",
    "input",
    "int",
    "isinstance",
    "issubclass",
    "iter",
    "len",
    "list",
    "locals",
    "map",
    "max",
    "memoryview",
    "min",
    "next",
    "object",
    "oct",
    "open",
    "ord",
    "pow",
    "print",
    "property",
    "range",
    "repr",
    "reversed",
    "round",
    "sentinel",
    "set",
    "setattr",
    "slice",
    "sorted",
    "staticmethod",
    "str",
    "sum",
    "super",
    "tuple",
    "type",
    "vars",
    "zip"
  ];
  const LITERALS3 = [
    "__debug__",
    "Ellipsis",
    "False",
    "None",
    "NotImplemented",
    "True"
  ];
  const TYPES3 = [
    "Any",
    "Callable",
    "Coroutine",
    "Dict",
    "List",
    "Literal",
    "Generic",
    "Optional",
    "Sequence",
    "Set",
    "Tuple",
    "Type",
    "Union"
  ];
  const KEYWORDS3 = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: RESERVED_WORDS,
    built_in: BUILT_INS3,
    literal: LITERALS3,
    type: TYPES3
  };
  const PROMPT = {
    className: "meta",
    begin: /^(>>>|\.\.\.) /
  };
  const SUBST = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS3,
    illegal: /#/
  };
  const LITERAL_BRACKET = {
    begin: /\{\{/,
    relevance: 0
  };
  const STRING = {
    className: "string",
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT
        ],
        relevance: 10
      },
      {
        begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])'''/,
        end: /'''/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])"""/,
        end: /"""/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([uU]|[rR])'/,
        end: /'/,
        relevance: 10
      },
      {
        begin: /([uU]|[rR])"/,
        end: /"/,
        relevance: 10
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])'/,
        end: /'/
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])"/,
        end: /"/
      },
      {
        begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])'/,
        end: /'/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])"/,
        end: /"/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ]
  };
  const digitpart = "[0-9](_?[0-9])*";
  const pointfloat = `(\\b(${digitpart}))?\\.(${digitpart})|\\b(${digitpart})\\.`;
  const lookahead2 = `\\b|${RESERVED_WORDS.join("|")}`;
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      // exponentfloat, pointfloat
      // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
      // optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      // Note: no leading \b because floats can start with a decimal point
      // and we don't want to mishandle e.g. `fn(.5)`,
      // no trailing \b for pointfloat because it can end with a decimal point
      // and we don't want to mishandle e.g. `0..hex()`; this should be safe
      // because both MUST contain a decimal point and so cannot be confused with
      // the interior part of an identifier
      {
        begin: `(\\b(${digitpart})|(${pointfloat}))[eE][+-]?(${digitpart})[jJ]?(?=${lookahead2})`
      },
      {
        begin: `(${pointfloat})[jJ]?`
      },
      // decinteger, bininteger, octinteger, hexinteger
      // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
      // optionally "long" in Python 2
      // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
      // decinteger is optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${lookahead2})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${lookahead2})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${lookahead2})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${lookahead2})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${digitpart})[jJ](?=${lookahead2})`
      }
    ]
  };
  const COMMENT_TYPE = {
    className: "comment",
    begin: regex.lookahead(/# type:/),
    end: /$/,
    keywords: KEYWORDS3,
    contains: [
      {
        // prevent keywords from coloring `type`
        begin: /# type:/
      },
      // comment within a datatype comment includes no keywords
      {
        begin: /#/,
        end: /\b\B/,
        endsWithParent: true
      }
    ]
  };
  const PARAMS = {
    className: "params",
    variants: [
      // Exclude params in functions without params
      {
        className: "",
        begin: /\(\s*\)/,
        skip: true
      },
      {
        begin: /\(/,
        end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS3,
        contains: [
          "self",
          PROMPT,
          NUMBER,
          STRING,
          hljs.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  SUBST.contains = [
    STRING,
    NUMBER,
    PROMPT
  ];
  return {
    name: "Python",
    aliases: [
      "py",
      "gyp",
      "ipython"
    ],
    unicodeRegex: true,
    keywords: KEYWORDS3,
    illegal: /(<\/|\?)|=>/,
    contains: [
      PROMPT,
      NUMBER,
      {
        // very common convention
        scope: "variable.language",
        match: /\bself\b/
      },
      {
        // eat "if" prior to string so that it won't accidentally be
        // labeled as an f-string
        beginKeywords: "if",
        relevance: 0
      },
      { match: /\bor\b/, scope: "keyword" },
      STRING,
      COMMENT_TYPE,
      hljs.HASH_COMMENT_MODE,
      {
        match: [
          /\bdef/,
          /\s+/,
          IDENT_RE3
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [PARAMS]
      },
      {
        variants: [
          {
            match: [
              /\bclass/,
              /\s+/,
              IDENT_RE3,
              /\s*/,
              /\(\s*/,
              IDENT_RE3,
              /\s*\)/
            ]
          },
          {
            match: [
              /\bclass/,
              /\s+/,
              IDENT_RE3
            ]
          }
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          6: "title.class.inherited"
        }
      },
      {
        className: "meta",
        begin: /^[\t ]*@/,
        end: /(?=#)|$/,
        contains: [
          NUMBER,
          PARAMS,
          STRING
        ]
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/python-repl.js
function pythonRepl(hljs) {
  return {
    aliases: ["pycon"],
    contains: [
      {
        className: "meta.prompt",
        starts: {
          // a space separates the REPL prefix from the actual code
          // this is purely for cleaner HTML output
          end: / |$/,
          starts: {
            end: "$",
            subLanguage: "python"
          }
        },
        variants: [
          { begin: /^>>>(?=[ ]|$)/ },
          { begin: /^\.\.\.(?=[ ]|$)/ }
        ]
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/r.js
function r(hljs) {
  const regex = hljs.regex;
  const IDENT_RE3 = /(?:(?:[a-zA-Z]|\.[._a-zA-Z])[._a-zA-Z0-9]*)|\.(?!\d)/;
  const NUMBER_TYPES_RE = regex.either(
    // Special case: only hexadecimal binary powers can contain fractions
    /0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/,
    // Hexadecimal numbers without fraction and optional binary power
    /0[xX][0-9a-fA-F]+(?:[pP][+-]?\d+)?[Li]?/,
    // Decimal numbers
    /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[Li]?/
  );
  const OPERATORS_RE = /[=!<>:]=|\|\||&&|:::?|<-|<<-|->>|->|\|>|[-+*\/?!$&|:<=>@^~]|\*\*/;
  const PUNCTUATION_RE = regex.either(
    /[()]/,
    /[{}]/,
    /\[\[/,
    /[[\]]/,
    /\\/,
    /,/
  );
  return {
    name: "R",
    keywords: {
      $pattern: IDENT_RE3,
      keyword: "function if in break next repeat else for while",
      literal: "NULL NA TRUE FALSE Inf NaN NA_integer_|10 NA_real_|10 NA_character_|10 NA_complex_|10",
      built_in: (
        // Builtin constants
        "LETTERS letters month.abb month.name pi T F abs acos acosh all any anyNA Arg as.call as.character as.complex as.double as.environment as.integer as.logical as.null.default as.numeric as.raw asin asinh atan atanh attr attributes baseenv browser c call ceiling class Conj cos cosh cospi cummax cummin cumprod cumsum digamma dim dimnames emptyenv exp expression floor forceAndCall gamma gc.time globalenv Im interactive invisible is.array is.atomic is.call is.character is.complex is.double is.environment is.expression is.finite is.function is.infinite is.integer is.language is.list is.logical is.matrix is.na is.name is.nan is.null is.numeric is.object is.pairlist is.raw is.recursive is.single is.symbol lazyLoadDBfetch length lgamma list log max min missing Mod names nargs nzchar oldClass on.exit pos.to.env proc.time prod quote range Re rep retracemem return round seq_along seq_len seq.int sign signif sin sinh sinpi sqrt standardGeneric substitute sum switch tan tanh tanpi tracemem trigamma trunc unclass untracemem UseMethod xtfrm"
      )
    },
    contains: [
      // Roxygen comments
      hljs.COMMENT(
        /#'/,
        /$/,
        { contains: [
          {
            // Handle `@examples` separately to cause all subsequent code
            // until the next `@`-tag on its own line to be kept as-is,
            // preventing highlighting. This code is example R code, so nested
            // doctags shouldn’t be treated as such. See
            // `test/markup/r/roxygen.txt` for an example.
            scope: "doctag",
            match: /@examples/,
            starts: {
              end: regex.lookahead(regex.either(
                // end if another doc comment
                /\n^#'\s*(?=@[a-zA-Z]+)/,
                // or a line with no comment
                /\n^(?!#')/
              )),
              endsParent: true
            }
          },
          {
            // Handle `@param` to highlight the parameter name following
            // after.
            scope: "doctag",
            begin: "@param",
            end: /$/,
            contains: [
              {
                scope: "variable",
                variants: [
                  { match: IDENT_RE3 },
                  { match: /`(?:\\.|[^`\\])+`/ }
                ],
                endsParent: true
              }
            ]
          },
          {
            scope: "doctag",
            match: /@[a-zA-Z]+/
          },
          {
            scope: "keyword",
            match: /\\[a-zA-Z]+/
          }
        ] }
      ),
      hljs.HASH_COMMENT_MODE,
      {
        scope: "string",
        contains: [hljs.BACKSLASH_ESCAPE],
        variants: [
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\(/,
            end: /\)(-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\{/,
            end: /\}(-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\[/,
            end: /\](-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\(/,
            end: /\)(-*)'/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\{/,
            end: /\}(-*)'/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\[/,
            end: /\](-*)'/
          }),
          {
            begin: '"',
            end: '"',
            relevance: 0
          },
          {
            begin: "'",
            end: "'",
            relevance: 0
          }
        ]
      },
      // Matching numbers immediately following punctuation and operators is
      // tricky since we need to look at the character ahead of a number to
      // ensure the number is not part of an identifier, and we cannot use
      // negative look-behind assertions. So instead we explicitly handle all
      // possible combinations of (operator|punctuation), number.
      // TODO: replace with negative look-behind when available
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/ },
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+([pP][+-]?\d+)?[Li]?/ },
      // { begin: /(?<![a-zA-Z0-9._])(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[Li]?/ }
      {
        relevance: 0,
        variants: [
          {
            scope: {
              1: "operator",
              2: "number"
            },
            match: [
              OPERATORS_RE,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: {
              1: "operator",
              2: "number"
            },
            match: [
              /%[^%]*%/,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: {
              1: "punctuation",
              2: "number"
            },
            match: [
              PUNCTUATION_RE,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: { 2: "number" },
            match: [
              /[^a-zA-Z0-9._]|^/,
              // not part of an identifier, or start of document
              NUMBER_TYPES_RE
            ]
          }
        ]
      },
      // Operators/punctuation when they're not directly followed by numbers
      {
        // Relevance boost for the most common assignment form.
        scope: { 3: "operator" },
        match: [
          IDENT_RE3,
          /\s+/,
          /<-/,
          /\s+/
        ]
      },
      {
        scope: "operator",
        relevance: 0,
        variants: [
          { match: OPERATORS_RE },
          { match: /%[^%]*%/ }
        ]
      },
      {
        scope: "punctuation",
        relevance: 0,
        match: PUNCTUATION_RE
      },
      {
        // Escaped identifier
        begin: "`",
        end: "`",
        contains: [{ begin: /\\./ }]
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/ruby.js
function ruby(hljs) {
  const regex = hljs.regex;
  const RUBY_METHOD_RE = "([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)";
  const CLASS_NAME_RE = regex.either(
    /\b([A-Z]+[a-z0-9]+)+/,
    // ends in caps
    /\b([A-Z]+[a-z0-9]+)+[A-Z]+/
  );
  const CLASS_NAME_WITH_NAMESPACE_RE = regex.concat(CLASS_NAME_RE, /(::\w+)*/);
  const PSEUDO_KWS = [
    "include",
    "extend",
    "prepend",
    "public",
    "private",
    "protected",
    "raise",
    "throw"
  ];
  const RUBY_KEYWORDS = {
    "variable.constant": [
      "__FILE__",
      "__LINE__",
      "__ENCODING__"
    ],
    "variable.language": [
      "self",
      "super"
    ],
    keyword: [
      "alias",
      "and",
      "begin",
      "BEGIN",
      "break",
      "case",
      "class",
      "defined",
      "do",
      "else",
      "elsif",
      "end",
      "END",
      "ensure",
      "for",
      "if",
      "in",
      "module",
      "next",
      "not",
      "or",
      "redo",
      "require",
      "rescue",
      "retry",
      "return",
      "then",
      "undef",
      "unless",
      "until",
      "when",
      "while",
      "yield",
      ...PSEUDO_KWS
    ],
    built_in: [
      "proc",
      "lambda",
      "attr_accessor",
      "attr_reader",
      "attr_writer",
      "define_method",
      "private_constant",
      "module_function"
    ],
    literal: [
      "true",
      "false",
      "nil"
    ]
  };
  const YARDOCTAG = {
    className: "doctag",
    begin: "@[A-Za-z]+"
  };
  const IRB_OBJECT = {
    begin: "#<",
    end: ">"
  };
  const COMMENT_MODES = [
    hljs.COMMENT(
      "#",
      "$",
      { contains: [YARDOCTAG] }
    ),
    hljs.COMMENT(
      "^=begin",
      "^=end",
      {
        contains: [YARDOCTAG],
        relevance: 10
      }
    ),
    hljs.COMMENT("^__END__", hljs.MATCH_NOTHING_RE)
  ];
  const SUBST = {
    className: "subst",
    begin: /#\{/,
    end: /\}/,
    keywords: RUBY_KEYWORDS
  };
  const STRING = {
    className: "string",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ],
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /"/,
        end: /"/
      },
      {
        begin: /`/,
        end: /`/
      },
      {
        begin: /%[qQwWx]?\(/,
        end: /\)/
      },
      {
        begin: /%[qQwWx]?\[/,
        end: /\]/
      },
      {
        begin: /%[qQwWx]?\{/,
        end: /\}/
      },
      {
        begin: /%[qQwWx]?</,
        end: />/
      },
      {
        begin: /%[qQwWx]?\//,
        end: /\//
      },
      {
        begin: /%[qQwWx]?%/,
        end: /%/
      },
      {
        begin: /%[qQwWx]?-/,
        end: /-/
      },
      {
        begin: /%[qQwWx]?\|/,
        end: /\|/
      },
      // in the following expressions, \B in the beginning suppresses recognition of ?-sequences
      // where ? is the last character of a preceding identifier, as in: `func?4`
      { begin: /\B\?(\\\d{1,3})/ },
      { begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/ },
      { begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/ },
      { begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/ },
      { begin: /\B\?\\(c|C-)[\x20-\x7e]/ },
      { begin: /\B\?\\?\S/ },
      // heredocs
      {
        // this guard makes sure that we have an entire heredoc and not a false
        // positive (auto-detect, etc.)
        begin: regex.concat(
          /<<[-~]?'?/,
          regex.lookahead(/(\w+)(?=\W)[^\n]*\n(?:[^\n]*\n)*?\s*\1\b/)
        ),
        contains: [
          hljs.END_SAME_AS_BEGIN({
            begin: /(\w+)/,
            end: /(\w+)/,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
            ]
          })
        ]
      }
    ]
  };
  const decimal = "[1-9](_?[0-9])*|0";
  const digits = "[0-9](_?[0-9])*";
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal integer/float, optionally exponential or rational, optionally imaginary
      { begin: `\\b(${decimal})(\\.(${digits}))?([eE][+-]?(${digits})|r)?i?\\b` },
      // explicit decimal/binary/octal/hexadecimal integer,
      // optionally rational and/or imaginary
      { begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b" },
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b" },
      // 0-prefixed implicit octal integer, optionally rational and/or imaginary
      { begin: "\\b0(_?[0-7])+r?i?\\b" }
    ]
  };
  const PARAMS = {
    variants: [
      {
        match: /\(\)/
      },
      {
        className: "params",
        begin: /\(/,
        end: /(?=\))/,
        excludeBegin: true,
        endsParent: true,
        keywords: RUBY_KEYWORDS
      }
    ]
  };
  const INCLUDE_EXTEND = {
    match: [
      /(include|extend)\s+/,
      CLASS_NAME_WITH_NAMESPACE_RE
    ],
    scope: {
      2: "title.class"
    },
    keywords: RUBY_KEYWORDS
  };
  const CLASS_DEFINITION = {
    variants: [
      {
        match: [
          /class\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE,
          /\s+<\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE
        ]
      },
      {
        match: [
          /\b(class|module)\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE
        ]
      }
    ],
    scope: {
      2: "title.class",
      4: "title.class.inherited"
    },
    keywords: RUBY_KEYWORDS
  };
  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  const METHOD_DEFINITION = {
    match: [
      /def/,
      /\s+/,
      RUBY_METHOD_RE
    ],
    scope: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };
  const OBJECT_CREATION = {
    relevance: 0,
    match: [
      CLASS_NAME_WITH_NAMESPACE_RE,
      /\.new[. (]/
    ],
    scope: {
      1: "title.class"
    }
  };
  const CLASS_REFERENCE = {
    relevance: 0,
    match: CLASS_NAME_RE,
    scope: "title.class"
  };
  const RUBY_DEFAULT_CONTAINS = [
    STRING,
    CLASS_DEFINITION,
    INCLUDE_EXTEND,
    OBJECT_CREATION,
    UPPER_CASE_CONSTANT,
    CLASS_REFERENCE,
    METHOD_DEFINITION,
    {
      // swallow the scope resolution operator so `::` is not read as a symbol
      begin: "::"
    },
    {
      className: "symbol",
      begin: hljs.UNDERSCORE_IDENT_RE + "(!|\\?)?:",
      relevance: 0
    },
    {
      className: "symbol",
      begin: ":(?!\\s)",
      contains: [
        STRING,
        { begin: RUBY_METHOD_RE }
      ],
      relevance: 0
    },
    NUMBER,
    {
      // negative-look forward attempts to prevent false matches like:
      // @ident@ or $ident$ that might indicate this is not ruby at all
      className: "variable",
      begin: `(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])(?![A-Za-z])(?![@$?'])`
    },
    {
      className: "params",
      begin: /\|(?!=)/,
      end: /\|/,
      excludeBegin: true,
      excludeEnd: true,
      relevance: 0,
      // this could be a lot of things (in other languages) other than params
      keywords: RUBY_KEYWORDS
    },
    {
      // regexp container
      begin: "(" + hljs.RE_STARTERS_RE + "|unless)\\s*",
      keywords: "unless",
      contains: [
        {
          className: "regexp",
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          illegal: /\n/,
          variants: [
            {
              begin: "/",
              end: "/[a-z]*"
            },
            {
              begin: /%r\{/,
              end: /\}[a-z]*/
            },
            {
              begin: "%r\\(",
              end: "\\)[a-z]*"
            },
            {
              begin: "%r!",
              end: "![a-z]*"
            },
            {
              begin: "%r\\[",
              end: "\\][a-z]*"
            }
          ]
        }
      ].concat(IRB_OBJECT, COMMENT_MODES),
      relevance: 0
    }
  ].concat(IRB_OBJECT, COMMENT_MODES);
  SUBST.contains = RUBY_DEFAULT_CONTAINS;
  PARAMS.contains = RUBY_DEFAULT_CONTAINS;
  const SIMPLE_PROMPT = "[>?]>";
  const DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+[>*]";
  const RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>";
  const IRB_DEFAULT = [
    {
      begin: /^\s*=>/,
      starts: {
        end: "$",
        contains: RUBY_DEFAULT_CONTAINS
      }
    },
    {
      className: "meta.prompt",
      begin: "^(" + SIMPLE_PROMPT + "|" + DEFAULT_PROMPT + "|" + RVM_PROMPT + ")(?=[ ])",
      starts: {
        end: "$",
        keywords: RUBY_KEYWORDS,
        contains: RUBY_DEFAULT_CONTAINS
      }
    }
  ];
  COMMENT_MODES.unshift(IRB_OBJECT);
  return {
    name: "Ruby",
    aliases: [
      "rb",
      "gemspec",
      "podspec",
      "thor",
      "irb"
    ],
    keywords: RUBY_KEYWORDS,
    illegal: /\/\*/,
    contains: [hljs.SHEBANG({ binary: "ruby" })].concat(IRB_DEFAULT).concat(COMMENT_MODES).concat(RUBY_DEFAULT_CONTAINS)
  };
}

// node_modules/highlight.js/es/languages/rust.js
function rust(hljs) {
  const regex = hljs.regex;
  const RAW_IDENTIFIER = /(r#)?/;
  const UNDERSCORE_IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.UNDERSCORE_IDENT_RE);
  const IDENT_RE3 = regex.concat(RAW_IDENTIFIER, hljs.IDENT_RE);
  const FUNCTION_INVOKE = {
    scope: "title.function.invoke",
    relevance: 0,
    begin: regex.concat(
      /\b/,
      /(?!(?:let|for|while|if|else|match)\b)/,
      IDENT_RE3,
      regex.lookahead(/\s*\(/)
    )
  };
  const NUMBER_SUFFIX = "([ui](8|16|32|64|128|size)|f(16|32|64|128))?";
  const KEYWORDS3 = [
    "abstract",
    "as",
    "async",
    "await",
    "become",
    "box",
    "break",
    "const",
    "continue",
    "crate",
    "do",
    "dyn",
    "else",
    "enum",
    "extern",
    "false",
    "final",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "macro",
    "match",
    "mod",
    "move",
    "mut",
    "override",
    "priv",
    "pub",
    "raw",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "try",
    "type",
    "typeof",
    "union",
    "unsafe",
    "unsized",
    "use",
    "virtual",
    "where",
    "while",
    "yield"
  ];
  const LITERALS3 = [
    "true",
    "false",
    "Some",
    "None",
    "Ok",
    "Err"
  ];
  const BUILTINS = [
    // functions
    "drop ",
    // traits
    "Copy",
    "Send",
    "Sized",
    "Sync",
    "Drop",
    "Fn",
    "FnMut",
    "FnOnce",
    "ToOwned",
    "Clone",
    "Debug",
    "PartialEq",
    "PartialOrd",
    "Eq",
    "Ord",
    "AsRef",
    "AsMut",
    "Into",
    "From",
    "Default",
    "Iterator",
    "Extend",
    "IntoIterator",
    "DoubleEndedIterator",
    "ExactSizeIterator",
    "SliceConcatExt",
    "ToString",
    // macros
    "assert!",
    "assert_eq!",
    "bitflags!",
    "bytes!",
    "cfg!",
    "col!",
    "concat!",
    "concat_idents!",
    "debug_assert!",
    "debug_assert_eq!",
    "env!",
    "eprintln!",
    "panic!",
    "file!",
    "format!",
    "format_args!",
    "include_bytes!",
    "include_str!",
    "line!",
    "local_data_key!",
    "module_path!",
    "option_env!",
    "print!",
    "println!",
    "select!",
    "stringify!",
    "try!",
    "unimplemented!",
    "unreachable!",
    "vec!",
    "write!",
    "writeln!",
    "macro_rules!",
    "assert_ne!",
    "debug_assert_ne!"
  ];
  const TYPES3 = [
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "isize",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "usize",
    "f16",
    "f32",
    "f64",
    "f128",
    "str",
    "char",
    "bool",
    "Box",
    "Option",
    "Result",
    "String",
    "Vec"
  ];
  return {
    name: "Rust",
    aliases: ["rs"],
    keywords: {
      $pattern: hljs.IDENT_RE + "!?",
      type: TYPES3,
      keyword: KEYWORDS3,
      literal: LITERALS3,
      built_in: BUILTINS
    },
    illegal: "</",
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.COMMENT("/\\*", "\\*/", { contains: ["self"] }),
      hljs.inherit(hljs.QUOTE_STRING_MODE, {
        begin: /b?"/,
        illegal: null
      }),
      {
        scope: "symbol",
        // negative lookahead to avoid matching `'`
        begin: /'[a-zA-Z_][a-zA-Z0-9_]*(?!')/
      },
      {
        scope: "string",
        variants: [
          { begin: /b?r(#*)"(.|\n)*?"\1(?!#)/ },
          {
            begin: /b?'/,
            end: /'/,
            contains: [
              {
                scope: "char.escape",
                match: /\\('|"|\\|\w|x\w{2}|u\w{4}|U\w{8})/
              }
            ]
          }
        ]
      },
      {
        scope: "number",
        variants: [
          { begin: "\\b0b([01_]+)" + NUMBER_SUFFIX },
          { begin: "\\b0o([0-7_]+)" + NUMBER_SUFFIX },
          { begin: "\\b0x([A-Fa-f0-9_]+)" + NUMBER_SUFFIX },
          { begin: "\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)" + NUMBER_SUFFIX }
        ],
        relevance: 0
      },
      {
        begin: [
          /\bsafe/,
          /\s+/,
          /extern/
        ],
        scope: {
          1: "keyword",
          3: "keyword"
        }
      },
      {
        begin: [
          /fn/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        }
      },
      {
        scope: "meta",
        begin: "#!?\\[",
        end: "\\]",
        contains: [
          {
            scope: "string",
            begin: /"/,
            end: /"/,
            contains: [
              hljs.BACKSLASH_ESCAPE
            ]
          }
        ]
      },
      {
        begin: [
          /let/,
          /\s+/,
          /(?:mut\s+)?/,
          UNDERSCORE_IDENT_RE
        ],
        scope: {
          1: "keyword",
          3: "keyword",
          4: "variable"
        }
      },
      // must come before impl/for rule later
      {
        begin: [
          /for/,
          /\s+/,
          UNDERSCORE_IDENT_RE,
          /\s+/,
          /in/
        ],
        scope: {
          1: "keyword",
          3: "variable",
          5: "keyword"
        }
      },
      {
        begin: [
          /type/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: [
          /(?:trait|enum|struct|union|impl|for)/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: hljs.IDENT_RE + "::",
        keywords: {
          keyword: "Self",
          built_in: BUILTINS,
          type: TYPES3
        }
      },
      {
        scope: "punctuation",
        begin: "->"
      },
      FUNCTION_INVOKE
    ]
  };
}

// node_modules/highlight.js/es/languages/scss.js
var MODES3 = (hljs) => {
  return {
    IMPORTANT: {
      scope: "meta",
      begin: "!important"
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: "number",
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    UNICODE_RANGE: {
      scope: "number",
      begin: /\b[Uu]\+[0-9A-Fa-f][0-9A-Fa-f?]{0,5}(-[0-9A-Fa-f][0-9A-Fa-f]{0,5})?/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: "selector-attr",
      begin: /\[/,
      end: /\]/,
      illegal: "$",
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: "number",
      begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};
var HTML_TAGS3 = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
];
var SVG_TAGS3 = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
];
var TAGS3 = [
  ...HTML_TAGS3,
  ...SVG_TAGS3
];
var MEDIA_FEATURES3 = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse();
var PSEUDO_CLASSES3 = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse();
var PSEUDO_ELEMENTS3 = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse();
var ATTRIBUTES3 = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "corner-bottom-left-shape",
  "corner-bottom-right-shape",
  "corner-shape",
  "corner-top-left-shape",
  "corner-top-right-shape",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "unicode-range",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
function scss(hljs) {
  const modes = MODES3(hljs);
  const PSEUDO_ELEMENTS$1 = PSEUDO_ELEMENTS3;
  const PSEUDO_CLASSES$1 = PSEUDO_CLASSES3;
  const AT_IDENTIFIER = "@[a-z-]+";
  const AT_MODIFIERS = "and or not only";
  const IDENT_RE3 = "[a-zA-Z-][a-zA-Z0-9_-]*";
  const VARIABLE = {
    className: "variable",
    begin: "(\\$" + IDENT_RE3 + ")\\b",
    relevance: 0
  };
  return {
    name: "SCSS",
    case_insensitive: true,
    illegal: "[=/|']",
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      modes.CSS_NUMBER_MODE,
      {
        className: "selector-id",
        begin: "#[A-Za-z0-9_-]+",
        relevance: 0
      },
      {
        className: "selector-class",
        begin: "\\.[A-Za-z0-9_-]+",
        relevance: 0
      },
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-tag",
        begin: "\\b(" + TAGS3.join("|") + ")\\b",
        // was there, before, but why?
        relevance: 0
      },
      {
        className: "selector-pseudo",
        begin: ":(" + PSEUDO_CLASSES$1.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + PSEUDO_ELEMENTS$1.join("|") + ")"
      },
      VARIABLE,
      {
        // pseudo-selector params
        begin: /\(/,
        end: /\)/,
        contains: [modes.CSS_NUMBER_MODE]
      },
      modes.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + ATTRIBUTES3.join("|") + ")\\b"
      },
      { begin: "\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b" },
      {
        begin: /:/,
        end: /[;}{]/,
        relevance: 0,
        contains: [
          modes.BLOCK_COMMENT,
          VARIABLE,
          modes.HEXCOLOR,
          modes.CSS_NUMBER_MODE,
          modes.UNICODE_RANGE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          modes.IMPORTANT,
          modes.FUNCTION_DISPATCH
        ]
      },
      // matching these here allows us to treat them more like regular CSS
      // rules so everything between the {} gets regular rule highlighting,
      // which is what we want for page and font-face
      {
        begin: "@(page|font-face)",
        keywords: {
          $pattern: AT_IDENTIFIER,
          keyword: "@page @font-face"
        }
      },
      {
        begin: "@",
        end: "[{;]",
        returnBegin: true,
        keywords: {
          $pattern: /[a-z-]+/,
          keyword: AT_MODIFIERS,
          attribute: MEDIA_FEATURES3.join(" ")
        },
        contains: [
          {
            begin: AT_IDENTIFIER,
            className: "keyword"
          },
          {
            begin: /[a-z-]+(?=:)/,
            className: "attribute"
          },
          VARIABLE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          modes.HEXCOLOR,
          modes.CSS_NUMBER_MODE
        ]
      },
      modes.FUNCTION_DISPATCH
    ]
  };
}

// node_modules/highlight.js/es/languages/shell.js
function shell(hljs) {
  return {
    name: "Shell Session",
    aliases: [
      "console",
      "shellsession"
    ],
    contains: [
      {
        className: "meta.prompt",
        // We cannot add \s (spaces) in the regular expression otherwise it will be too broad and produce unexpected result.
        // For instance, in the following example, it would match "echo /path/to/home >" as a prompt:
        // echo /path/to/home > t.exe
        begin: /^\s{0,3}[./~\w\d[\]()@-]*[>%$#][ ]?/,
        starts: {
          end: /[^\\](?=\s*$)/,
          subLanguage: "bash"
        }
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/sql.js
function sql(hljs) {
  const regex = hljs.regex;
  const COMMENT_MODE = hljs.COMMENT("--", "$");
  const STRING = {
    scope: "string",
    variants: [
      {
        begin: /'/,
        end: /'/,
        contains: [{ match: /''/ }]
      }
    ]
  };
  const QUOTED_IDENTIFIER = {
    begin: /"/,
    end: /"/,
    contains: [{ match: /""/ }]
  };
  const LITERALS3 = [
    "true",
    "false",
    // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
    // "null",
    "unknown"
  ];
  const MULTI_WORD_TYPES = [
    "double precision",
    "large object",
    "with timezone",
    "without timezone"
  ];
  const TYPES3 = [
    "bigint",
    "binary",
    "blob",
    "boolean",
    "char",
    "character",
    "clob",
    "date",
    "dec",
    "decfloat",
    "decimal",
    "float",
    "int",
    "integer",
    "interval",
    "nchar",
    "nclob",
    "national",
    "numeric",
    "real",
    "row",
    "smallint",
    "time",
    "timestamp",
    "varchar",
    "varying",
    // modifier (character varying)
    "varbinary"
  ];
  const NON_RESERVED_WORDS = [
    "add",
    "asc",
    "collation",
    "desc",
    "final",
    "first",
    "last",
    "view"
  ];
  const RESERVED_WORDS = [
    "abs",
    "acos",
    "all",
    "allocate",
    "alter",
    "and",
    "any",
    "are",
    "array",
    "array_agg",
    "array_max_cardinality",
    "as",
    "asensitive",
    "asin",
    "asymmetric",
    "at",
    "atan",
    "atomic",
    "authorization",
    "avg",
    "begin",
    "begin_frame",
    "begin_partition",
    "between",
    "bigint",
    "binary",
    "blob",
    "boolean",
    "both",
    "by",
    "call",
    "called",
    "cardinality",
    "cascaded",
    "case",
    "cast",
    "ceil",
    "ceiling",
    "char",
    "char_length",
    "character",
    "character_length",
    "check",
    "classifier",
    "clob",
    "close",
    "coalesce",
    "collate",
    "collect",
    "column",
    "commit",
    "condition",
    "connect",
    "constraint",
    "contains",
    "convert",
    "copy",
    "corr",
    "corresponding",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "create",
    "cross",
    "cube",
    "cume_dist",
    "current",
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_row",
    "current_schema",
    "current_time",
    "current_timestamp",
    "current_path",
    "current_role",
    "current_transform_group_for_type",
    "current_user",
    "cursor",
    "cycle",
    "date",
    "day",
    "deallocate",
    "dec",
    "decimal",
    "decfloat",
    "declare",
    "default",
    "define",
    "delete",
    "dense_rank",
    "deref",
    "describe",
    "deterministic",
    "disconnect",
    "distinct",
    "double",
    "drop",
    "dynamic",
    "each",
    "element",
    "else",
    "empty",
    "end",
    "end_frame",
    "end_partition",
    "end-exec",
    "equals",
    "escape",
    "every",
    "except",
    "exec",
    "execute",
    "exists",
    "exp",
    "external",
    "extract",
    "false",
    "fetch",
    "filter",
    "first_value",
    "float",
    "floor",
    "for",
    "foreign",
    "frame_row",
    "free",
    "from",
    "full",
    "function",
    "fusion",
    "get",
    "global",
    "grant",
    "group",
    "grouping",
    "groups",
    "having",
    "hold",
    "hour",
    "identity",
    "in",
    "indicator",
    "initial",
    "inner",
    "inout",
    "insensitive",
    "insert",
    "int",
    "integer",
    "intersect",
    "intersection",
    "interval",
    "into",
    "is",
    "join",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "language",
    "large",
    "last_value",
    "lateral",
    "lead",
    "leading",
    "left",
    "like",
    "like_regex",
    "listagg",
    "ln",
    "local",
    "localtime",
    "localtimestamp",
    "log",
    "log10",
    "lower",
    "match",
    "match_number",
    "match_recognize",
    "matches",
    "max",
    "member",
    "merge",
    "method",
    "min",
    "minute",
    "mod",
    "modifies",
    "module",
    "month",
    "multiset",
    "national",
    "natural",
    "nchar",
    "nclob",
    "new",
    "no",
    "none",
    "normalize",
    "not",
    "nth_value",
    "ntile",
    "null",
    "nullif",
    "numeric",
    "octet_length",
    "occurrences_regex",
    "of",
    "offset",
    "old",
    "omit",
    "on",
    "one",
    "only",
    "open",
    "or",
    "order",
    "out",
    "outer",
    "over",
    "overlaps",
    "overlay",
    "parameter",
    "partition",
    "pattern",
    "per",
    "percent",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "period",
    "portion",
    "position",
    "position_regex",
    "power",
    "precedes",
    "precision",
    "prepare",
    "primary",
    "procedure",
    "ptf",
    "range",
    "rank",
    "reads",
    "real",
    "recursive",
    "ref",
    "references",
    "referencing",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "release",
    "result",
    "return",
    "returns",
    "revoke",
    "right",
    "rollback",
    "rollup",
    "row",
    "row_number",
    "rows",
    "running",
    "savepoint",
    "scope",
    "scroll",
    "search",
    "second",
    "seek",
    "select",
    "sensitive",
    "session_user",
    "set",
    "show",
    "similar",
    "sin",
    "sinh",
    "skip",
    "smallint",
    "some",
    "specific",
    "specifictype",
    "sql",
    "sqlexception",
    "sqlstate",
    "sqlwarning",
    "sqrt",
    "start",
    "static",
    "stddev_pop",
    "stddev_samp",
    "submultiset",
    "subset",
    "substring",
    "substring_regex",
    "succeeds",
    "sum",
    "symmetric",
    "system",
    "system_time",
    "system_user",
    "table",
    "tablesample",
    "tan",
    "tanh",
    "then",
    "time",
    "timestamp",
    "timezone_hour",
    "timezone_minute",
    "to",
    "trailing",
    "translate",
    "translate_regex",
    "translation",
    "treat",
    "trigger",
    "trim",
    "trim_array",
    "true",
    "truncate",
    "uescape",
    "union",
    "unique",
    "unknown",
    "unnest",
    "update",
    "upper",
    "user",
    "using",
    "value",
    "values",
    "value_of",
    "var_pop",
    "var_samp",
    "varbinary",
    "varchar",
    "varying",
    "versioning",
    "when",
    "whenever",
    "where",
    "width_bucket",
    "window",
    "with",
    "within",
    "without",
    "year"
  ];
  const RESERVED_FUNCTIONS = [
    "abs",
    "acos",
    "array_agg",
    "asin",
    "atan",
    "avg",
    "cast",
    "ceil",
    "ceiling",
    "coalesce",
    "corr",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "cume_dist",
    "dense_rank",
    "deref",
    "element",
    "exp",
    "extract",
    "first_value",
    "floor",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "last_value",
    "lead",
    "listagg",
    "ln",
    "log",
    "log10",
    "lower",
    "max",
    "min",
    "mod",
    "nth_value",
    "ntile",
    "nullif",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "position",
    "position_regex",
    "power",
    "rank",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "row_number",
    "sin",
    "sinh",
    "sqrt",
    "stddev_pop",
    "stddev_samp",
    "substring",
    "substring_regex",
    "sum",
    "tan",
    "tanh",
    "translate",
    "translate_regex",
    "treat",
    "trim",
    "trim_array",
    "unnest",
    "upper",
    "value_of",
    "var_pop",
    "var_samp",
    "width_bucket"
  ];
  const POSSIBLE_WITHOUT_PARENS = [
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_schema",
    "current_transform_group_for_type",
    "current_user",
    "session_user",
    "system_time",
    "system_user",
    "current_time",
    "localtime",
    "current_timestamp",
    "localtimestamp"
  ];
  const COMBOS = [
    "create table",
    "insert into",
    "primary key",
    "foreign key",
    "not null",
    "alter table",
    "add constraint",
    "grouping sets",
    "on overflow",
    "character set",
    "respect nulls",
    "ignore nulls",
    "nulls first",
    "nulls last",
    "depth first",
    "breadth first"
  ];
  const FUNCTIONS = RESERVED_FUNCTIONS;
  const KEYWORDS3 = [
    ...RESERVED_WORDS,
    ...NON_RESERVED_WORDS
  ].filter((keyword) => {
    return !RESERVED_FUNCTIONS.includes(keyword);
  });
  const VARIABLE = {
    scope: "variable",
    match: /@[a-z0-9][a-z0-9_]*/
  };
  const OPERATOR = {
    scope: "operator",
    match: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
    relevance: 0
  };
  const FUNCTION_CALL = {
    match: regex.concat(/\b/, regex.either(...FUNCTIONS), /\s*\(/),
    relevance: 0,
    keywords: { built_in: FUNCTIONS }
  };
  function kws_to_regex(list) {
    return regex.concat(
      /\b/,
      regex.either(...list.map((kw) => {
        return kw.replace(/\s+/, "\\s+");
      })),
      /\b/
    );
  }
  const MULTI_WORD_KEYWORDS = {
    scope: "keyword",
    match: kws_to_regex(COMBOS),
    relevance: 0
  };
  function reduceRelevancy(list, {
    exceptions,
    when
  } = {}) {
    const qualifyFn = when;
    exceptions = exceptions || [];
    return list.map((item) => {
      if (item.match(/\|\d+$/) || exceptions.includes(item)) {
        return item;
      } else if (qualifyFn(item)) {
        return `${item}|0`;
      } else {
        return item;
      }
    });
  }
  return {
    name: "SQL",
    case_insensitive: true,
    // does not include {} or HTML tags `</`
    illegal: /[{}]|<\//,
    keywords: {
      $pattern: /\b[\w\.]+/,
      keyword: reduceRelevancy(KEYWORDS3, { when: (x3) => x3.length < 3 }),
      literal: LITERALS3,
      type: TYPES3,
      built_in: POSSIBLE_WITHOUT_PARENS
    },
    contains: [
      {
        scope: "type",
        match: kws_to_regex(MULTI_WORD_TYPES)
      },
      MULTI_WORD_KEYWORDS,
      FUNCTION_CALL,
      VARIABLE,
      STRING,
      QUOTED_IDENTIFIER,
      hljs.C_NUMBER_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE,
      OPERATOR
    ]
  };
}

// node_modules/highlight.js/es/languages/swift.js
function source(re2) {
  if (!re2) return null;
  if (typeof re2 === "string") return re2;
  return re2.source;
}
function lookahead(re2) {
  return concat("(?=", re2, ")");
}
function concat(...args) {
  const joined = args.map((x3) => source(x3)).join("");
  return joined;
}
function stripOptionsFromArgs(args) {
  const opts = args[args.length - 1];
  if (typeof opts === "object" && opts.constructor === Object) {
    args.splice(args.length - 1, 1);
    return opts;
  } else {
    return {};
  }
}
function either(...args) {
  const opts = stripOptionsFromArgs(args);
  const joined = "(" + (opts.capture ? "" : "?:") + args.map((x3) => source(x3)).join("|") + ")";
  return joined;
}
new RegExp(either(
  /\[(?:[^\\\]]|\\.)*\]/,
  // a character class, inside which ( and \ lose their meaning
  /\(\?<(?![=!])[^>]+>/,
  // a named capture group `(?<name>` (not a lookbehind `(?<=` / `(?<!`)
  /\(\?'[^']+'/,
  // a named capture group `(?'name'`
  /\(\??/,
  // an opening parenthesis, capturing or non-capturing / lookahead
  /\\([1-9][0-9]*)/,
  // a backreference like `\1`
  /\\./
  // any other escape sequence
));
var keywordWrapper = (keyword) => concat(
  /\b/,
  keyword,
  /\w$/.test(keyword) ? /\b/ : /\B/
);
var dotKeywords = [
  "Protocol",
  // contextual
  "Type"
  // contextual
].map(keywordWrapper);
var optionalDotKeywords = [
  "init",
  "self"
].map(keywordWrapper);
var keywordTypes = [
  "Any",
  "Self"
];
var keywords = [
  // strings below will be fed into the regular `keywords` engine while regex
  // will result in additional modes being created to scan for those keywords to
  // avoid conflicts with other rules
  "actor",
  "any",
  // contextual
  "associatedtype",
  "async",
  "await",
  /as\?/,
  // operator
  /as!/,
  // operator
  "as",
  // operator
  "borrowing",
  // contextual
  "break",
  "case",
  "catch",
  "class",
  "consume",
  // contextual
  "consuming",
  // contextual
  "continue",
  "convenience",
  // contextual
  "copy",
  // contextual
  "default",
  "defer",
  "deinit",
  "didSet",
  // contextual
  "distributed",
  "do",
  "dynamic",
  // contextual
  "each",
  "else",
  "enum",
  "extension",
  "fallthrough",
  /fileprivate\(set\)/,
  "fileprivate",
  "final",
  // contextual
  "for",
  "func",
  "get",
  // contextual
  "guard",
  "if",
  "import",
  "indirect",
  // contextual
  "infix",
  // contextual
  /init\?/,
  /init!/,
  "inout",
  /internal\(set\)/,
  "internal",
  "in",
  "is",
  // operator
  "isolated",
  // contextual
  "nonisolated",
  // contextual
  "lazy",
  // contextual
  "let",
  "macro",
  "mutating",
  // contextual
  "nonmutating",
  // contextual
  /open\(set\)/,
  // contextual
  "open",
  // contextual
  "operator",
  "optional",
  // contextual
  "override",
  // contextual
  "package",
  "postfix",
  // contextual
  "precedencegroup",
  "prefix",
  // contextual
  /private\(set\)/,
  "private",
  "protocol",
  /public\(set\)/,
  "public",
  "repeat",
  "required",
  // contextual
  "rethrows",
  "return",
  "set",
  // contextual
  "some",
  // contextual
  "static",
  "struct",
  "subscript",
  "super",
  "switch",
  "throws",
  "throw",
  /try\?/,
  // operator
  /try!/,
  // operator
  "try",
  // operator
  "typealias",
  /unowned\(safe\)/,
  // contextual
  /unowned\(unsafe\)/,
  // contextual
  "unowned",
  // contextual
  "var",
  "weak",
  // contextual
  "where",
  "while",
  "willSet"
  // contextual
];
var literals = [
  "false",
  "nil",
  "true"
];
var precedencegroupKeywords = [
  "assignment",
  "associativity",
  "higherThan",
  "left",
  "lowerThan",
  "none",
  "right"
];
var numberSignKeywords = [
  "#colorLiteral",
  "#column",
  "#dsohandle",
  "#else",
  "#elseif",
  "#endif",
  "#error",
  "#file",
  "#fileID",
  "#fileLiteral",
  "#filePath",
  "#function",
  "#if",
  "#imageLiteral",
  "#keyPath",
  "#line",
  "#selector",
  "#sourceLocation",
  "#warning"
];
var builtIns = [
  "abs",
  "all",
  "any",
  "assert",
  "assertionFailure",
  "debugPrint",
  "dump",
  "fatalError",
  "getVaList",
  "isKnownUniquelyReferenced",
  "max",
  "min",
  "numericCast",
  "pointwiseMax",
  "pointwiseMin",
  "precondition",
  "preconditionFailure",
  "print",
  "readLine",
  "repeatElement",
  "sequence",
  "stride",
  "swap",
  "swift_unboxFromSwiftValueWithType",
  "transcode",
  "type",
  "unsafeBitCast",
  "unsafeDowncast",
  "withExtendedLifetime",
  "withUnsafeMutablePointer",
  "withUnsafePointer",
  "withVaList",
  "withoutActuallyEscaping",
  "zip"
];
var operatorHead = either(
  /[/=\-+!*%<>&|^~?]/,
  /[\u00A1-\u00A7]/,
  /[\u00A9\u00AB]/,
  /[\u00AC\u00AE]/,
  /[\u00B0\u00B1]/,
  /[\u00B6\u00BB\u00BF\u00D7\u00F7]/,
  /[\u2016-\u2017]/,
  /[\u2020-\u2027]/,
  /[\u2030-\u203E]/,
  /[\u2041-\u2053]/,
  /[\u2055-\u205E]/,
  /[\u2190-\u23FF]/,
  /[\u2500-\u2775]/,
  /[\u2794-\u2BFF]/,
  /[\u2E00-\u2E7F]/,
  /[\u3001-\u3003]/,
  /[\u3008-\u3020]/,
  /[\u3030]/
);
var operatorCharacter = either(
  operatorHead,
  /[\u0300-\u036F]/,
  /[\u1DC0-\u1DFF]/,
  /[\u20D0-\u20FF]/,
  /[\uFE00-\uFE0F]/,
  /[\uFE20-\uFE2F]/
  // TODO: The following characters are also allowed, but the regex isn't supported yet.
  // /[\u{E0100}-\u{E01EF}]/u
);
var operator = concat(operatorHead, operatorCharacter, "*");
var identifierHead = either(
  /[a-zA-Z_]/,
  /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/,
  /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/,
  /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/,
  /[\u1E00-\u1FFF]/,
  /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/,
  /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/,
  /[\u2C00-\u2DFF\u2E80-\u2FFF]/,
  /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/,
  /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/,
  /[\uFE47-\uFEFE\uFF00-\uFFFD]/
  // Should be /[\uFE47-\uFFFD]/, but we have to exclude FEFF.
  // The following characters are also allowed, but the regexes aren't supported yet.
  // /[\u{10000}-\u{1FFFD}\u{20000-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]/u,
  // /[\u{50000}-\u{5FFFD}\u{60000-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}]/u,
  // /[\u{90000}-\u{9FFFD}\u{A0000-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}]/u,
  // /[\u{D0000}-\u{DFFFD}\u{E0000-\u{EFFFD}]/u
);
var identifierCharacter = either(
  identifierHead,
  /\d/,
  /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
);
var identifier = concat(identifierHead, identifierCharacter, "*");
var typeIdentifier = concat(/[A-Z]/, identifierCharacter, "*");
var keywordAttributes = [
  "attached",
  "autoclosure",
  concat(/convention\(/, either("swift", "block", "c"), /\)/),
  "discardableResult",
  "dynamicCallable",
  "dynamicMemberLookup",
  "escaping",
  "freestanding",
  "frozen",
  "GKInspectable",
  "IBAction",
  "IBDesignable",
  "IBInspectable",
  "IBOutlet",
  "IBSegueAction",
  "inlinable",
  "main",
  "nonobjc",
  "NSApplicationMain",
  "NSCopying",
  "NSManaged",
  concat(/objc\(/, identifier, /\)/),
  "objc",
  "objcMembers",
  "propertyWrapper",
  "requires_stored_property_inits",
  "resultBuilder",
  "Sendable",
  "testable",
  "UIApplicationMain",
  "unchecked",
  "unknown",
  "usableFromInline",
  "warn_unqualified_access"
];
var availabilityKeywords = [
  "iOS",
  "iOSApplicationExtension",
  "macOS",
  "macOSApplicationExtension",
  "macCatalyst",
  "macCatalystApplicationExtension",
  "watchOS",
  "watchOSApplicationExtension",
  "tvOS",
  "tvOSApplicationExtension",
  "swift"
];
function swift(hljs) {
  const WHITESPACE = {
    match: /\s+/,
    relevance: 0
  };
  const BLOCK_COMMENT = hljs.COMMENT(
    "/\\*",
    "\\*/",
    { contains: ["self"] }
  );
  const COMMENTS = [
    hljs.C_LINE_COMMENT_MODE,
    BLOCK_COMMENT
  ];
  const DOT_KEYWORD = {
    match: [
      /\./,
      either(...dotKeywords, ...optionalDotKeywords)
    ],
    className: { 2: "keyword" }
  };
  const KEYWORD_GUARD = {
    // Consume .keyword to prevent highlighting properties and methods as keywords.
    match: concat(/\./, either(...keywords)),
    relevance: 0
  };
  const PLAIN_KEYWORDS = keywords.filter((kw) => typeof kw === "string").concat(["_|0"]);
  const REGEX_KEYWORDS = keywords.filter((kw) => typeof kw !== "string").concat(keywordTypes).map(keywordWrapper);
  const KEYWORD = { variants: [
    {
      className: "keyword",
      match: either(...REGEX_KEYWORDS, ...optionalDotKeywords)
    }
  ] };
  const KEYWORDS3 = {
    $pattern: either(
      /\b\w+/,
      // regular keywords
      /#\w+/
      // number keywords
    ),
    keyword: PLAIN_KEYWORDS.concat(numberSignKeywords),
    literal: literals
  };
  const KEYWORD_MODES = [
    DOT_KEYWORD,
    KEYWORD_GUARD,
    KEYWORD
  ];
  const BUILT_IN_GUARD = {
    // Consume .built_in to prevent highlighting properties and methods.
    match: concat(/\./, either(...builtIns)),
    relevance: 0
  };
  const BUILT_IN = {
    className: "built_in",
    match: concat(/\b/, either(...builtIns), /(?=\()/)
  };
  const BUILT_INS3 = [
    BUILT_IN_GUARD,
    BUILT_IN
  ];
  const OPERATOR_GUARD = {
    // Prevent -> from being highlighting as an operator.
    match: /->/,
    relevance: 0
  };
  const OPERATOR = {
    className: "operator",
    relevance: 0,
    variants: [
      { match: operator },
      {
        // dot-operator: only operators that start with a dot are allowed to use dots as
        // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
        // characters that may also include dots.
        match: `\\.(\\.|${operatorCharacter})+`
      }
    ]
  };
  const OPERATORS = [
    OPERATOR_GUARD,
    OPERATOR
  ];
  const decimalDigits3 = "([0-9]_*)+";
  const hexDigits3 = "([0-9a-fA-F]_*)+";
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal floating-point-literal (subsumes decimal-literal)
      { match: `\\b(${decimalDigits3})(\\.(${decimalDigits3}))?([eE][+-]?(${decimalDigits3}))?\\b` },
      // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
      { match: `\\b0x(${hexDigits3})(\\.(${hexDigits3}))?([pP][+-]?(${decimalDigits3}))?\\b` },
      // octal-literal
      { match: /\b0o([0-7]_*)+\b/ },
      // binary-literal
      { match: /\b0b([01]_*)+\b/ }
    ]
  };
  const ESCAPED_CHARACTER = (rawDelimiter = "") => ({
    className: "subst",
    variants: [
      { match: concat(/\\/, rawDelimiter, /[0\\tnr"']/) },
      { match: concat(/\\/, rawDelimiter, /u\{[0-9a-fA-F]{1,8}\}/) }
    ]
  });
  const ESCAPED_NEWLINE = (rawDelimiter = "") => ({
    className: "subst",
    match: concat(/\\/, rawDelimiter, /[\t ]*(?:[\r\n]|\r\n)/)
  });
  const INTERPOLATION = (rawDelimiter = "") => ({
    className: "subst",
    label: "interpol",
    begin: concat(/\\/, rawDelimiter, /\(/),
    end: /\)/
  });
  const MULTILINE_STRING = (rawDelimiter = "") => ({
    begin: concat(rawDelimiter, /"""/),
    end: concat(/"""/, rawDelimiter),
    contains: [
      ESCAPED_CHARACTER(rawDelimiter),
      ESCAPED_NEWLINE(rawDelimiter),
      INTERPOLATION(rawDelimiter)
    ]
  });
  const SINGLE_LINE_STRING = (rawDelimiter = "") => ({
    begin: concat(rawDelimiter, /"/),
    end: concat(/"/, rawDelimiter),
    contains: [
      ESCAPED_CHARACTER(rawDelimiter),
      INTERPOLATION(rawDelimiter)
    ]
  });
  const STRING = {
    className: "string",
    variants: [
      MULTILINE_STRING(),
      MULTILINE_STRING("#"),
      MULTILINE_STRING("##"),
      MULTILINE_STRING("###"),
      SINGLE_LINE_STRING(),
      SINGLE_LINE_STRING("#"),
      SINGLE_LINE_STRING("##"),
      SINGLE_LINE_STRING("###")
    ]
  };
  const REGEXP_CONTENTS = [
    hljs.BACKSLASH_ESCAPE,
    {
      begin: /\[/,
      end: /\]/,
      relevance: 0,
      contains: [hljs.BACKSLASH_ESCAPE]
    }
  ];
  const BARE_REGEXP_LITERAL = {
    begin: /\/[^\s](?=[^/\n]*\/)/,
    end: /\//,
    contains: REGEXP_CONTENTS
  };
  const EXTENDED_REGEXP_LITERAL = (rawDelimiter) => {
    const begin = concat(rawDelimiter, /\//);
    const end = concat(/\//, rawDelimiter);
    return {
      begin,
      end,
      contains: [
        ...REGEXP_CONTENTS,
        {
          scope: "comment",
          begin: `#(?!.*${end})`,
          end: /$/
        }
      ]
    };
  };
  const REGEXP = {
    scope: "regexp",
    variants: [
      EXTENDED_REGEXP_LITERAL("###"),
      EXTENDED_REGEXP_LITERAL("##"),
      EXTENDED_REGEXP_LITERAL("#"),
      BARE_REGEXP_LITERAL
    ]
  };
  const QUOTED_IDENTIFIER = { match: concat(/`/, identifier, /`/) };
  const IMPLICIT_PARAMETER = {
    className: "variable",
    match: /\$\d+/
  };
  const PROPERTY_WRAPPER_PROJECTION = {
    className: "variable",
    match: `\\$${identifierCharacter}+`
  };
  const IDENTIFIERS = [
    QUOTED_IDENTIFIER,
    IMPLICIT_PARAMETER,
    PROPERTY_WRAPPER_PROJECTION
  ];
  const AVAILABLE_ATTRIBUTE = {
    match: /(@|#(un)?)available/,
    scope: "keyword",
    starts: { contains: [
      {
        begin: /\(/,
        end: /\)/,
        keywords: availabilityKeywords,
        contains: [
          ...OPERATORS,
          NUMBER,
          STRING
        ]
      }
    ] }
  };
  const KEYWORD_ATTRIBUTE = {
    scope: "keyword",
    match: concat(/@/, either(...keywordAttributes), lookahead(either(/\(/, /\s+/)))
  };
  const USER_DEFINED_ATTRIBUTE = {
    scope: "meta",
    match: concat(/@/, identifier)
  };
  const ATTRIBUTES4 = [
    AVAILABLE_ATTRIBUTE,
    KEYWORD_ATTRIBUTE,
    USER_DEFINED_ATTRIBUTE
  ];
  const TYPE = {
    match: lookahead(/\b[A-Z]/),
    relevance: 0,
    contains: [
      {
        // Common Apple frameworks, for relevance boost
        className: "type",
        match: concat(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, identifierCharacter, "+")
      },
      {
        // Type identifier
        className: "type",
        match: typeIdentifier,
        relevance: 0
      },
      {
        // Optional type
        match: /[?!]+/,
        relevance: 0
      },
      {
        // Variadic parameter
        match: /\.\.\./,
        relevance: 0
      },
      {
        // Protocol composition
        match: concat(/\s+&\s+/, lookahead(typeIdentifier)),
        relevance: 0
      }
    ]
  };
  const GENERIC_ARGUMENTS = {
    begin: /</,
    end: />/,
    keywords: KEYWORDS3,
    contains: [
      ...COMMENTS,
      ...KEYWORD_MODES,
      ...ATTRIBUTES4,
      OPERATOR_GUARD,
      TYPE
    ]
  };
  TYPE.contains.push(GENERIC_ARGUMENTS);
  const TUPLE_ELEMENT_NAME = {
    match: concat(identifier, /\s*:/),
    keywords: "_|0",
    relevance: 0
  };
  const TUPLE = {
    begin: /\(/,
    end: /\)/,
    relevance: 0,
    keywords: KEYWORDS3,
    contains: [
      "self",
      TUPLE_ELEMENT_NAME,
      ...COMMENTS,
      REGEXP,
      ...KEYWORD_MODES,
      ...BUILT_INS3,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS,
      ...ATTRIBUTES4,
      TYPE
    ]
  };
  const GENERIC_PARAMETERS = {
    begin: /</,
    end: />/,
    keywords: "repeat each",
    contains: [
      ...COMMENTS,
      TYPE
    ]
  };
  const FUNCTION_PARAMETER_NAME = {
    begin: either(
      lookahead(concat(identifier, /\s*:/)),
      lookahead(concat(identifier, /\s+/, identifier, /\s*:/))
    ),
    end: /:/,
    relevance: 0,
    contains: [
      {
        className: "keyword",
        match: /\b_\b/
      },
      {
        className: "params",
        match: identifier
      }
    ]
  };
  const FUNCTION_PARAMETERS = {
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS3,
    contains: [
      FUNCTION_PARAMETER_NAME,
      ...COMMENTS,
      ...KEYWORD_MODES,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...ATTRIBUTES4,
      TYPE,
      TUPLE
    ],
    endsParent: true,
    illegal: /["']/
  };
  const FUNCTION_OR_MACRO = {
    match: [
      /(func|macro)/,
      /\s+/,
      either(QUOTED_IDENTIFIER.match, identifier, operator)
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      GENERIC_PARAMETERS,
      FUNCTION_PARAMETERS,
      WHITESPACE
    ],
    illegal: [
      /\[/,
      /%/
    ]
  };
  const INIT_SUBSCRIPT = {
    match: [
      /\b(?:subscript|init[?!]?)/,
      /\s*(?=[<(])/
    ],
    className: { 1: "keyword" },
    contains: [
      GENERIC_PARAMETERS,
      FUNCTION_PARAMETERS,
      WHITESPACE
    ],
    illegal: /\[|%/
  };
  const OPERATOR_DECLARATION = {
    match: [
      /operator/,
      /\s+/,
      operator
    ],
    className: {
      1: "keyword",
      3: "title"
    }
  };
  const PRECEDENCEGROUP = {
    begin: [
      /precedencegroup/,
      /\s+/,
      typeIdentifier
    ],
    className: {
      1: "keyword",
      3: "title"
    },
    contains: [TYPE],
    keywords: [
      ...precedencegroupKeywords,
      ...literals
    ],
    end: /}/
  };
  const CLASS_FUNC_DECLARATION = {
    match: [
      /class\b/,
      /\s+/,
      /func\b/,
      /\s+/,
      /\b[A-Za-z_][A-Za-z0-9_]*\b/
    ],
    scope: {
      1: "keyword",
      3: "keyword",
      5: "title.function"
    }
  };
  const CLASS_VAR_DECLARATION = {
    match: [
      /class\b/,
      /\s+/,
      /var\b/
    ],
    scope: {
      1: "keyword",
      3: "keyword"
    }
  };
  const TYPE_DECLARATION = {
    begin: [
      /(struct|protocol|class|extension|enum|actor)/,
      /\s+/,
      identifier,
      /\s*/
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    },
    keywords: KEYWORDS3,
    contains: [
      GENERIC_PARAMETERS,
      ...KEYWORD_MODES,
      {
        begin: /:/,
        end: /\{/,
        keywords: KEYWORDS3,
        contains: [
          {
            scope: "title.class.inherited",
            match: typeIdentifier
          },
          ...KEYWORD_MODES
        ],
        relevance: 0
      }
    ]
  };
  for (const variant of STRING.variants) {
    const interpolation = variant.contains.find((mode) => mode.label === "interpol");
    interpolation.keywords = KEYWORDS3;
    const submodes = [
      ...KEYWORD_MODES,
      ...BUILT_INS3,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS
    ];
    interpolation.contains = [
      ...submodes,
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          "self",
          ...submodes
        ]
      }
    ];
  }
  return {
    name: "Swift",
    keywords: KEYWORDS3,
    contains: [
      ...COMMENTS,
      FUNCTION_OR_MACRO,
      INIT_SUBSCRIPT,
      CLASS_FUNC_DECLARATION,
      CLASS_VAR_DECLARATION,
      TYPE_DECLARATION,
      OPERATOR_DECLARATION,
      PRECEDENCEGROUP,
      {
        beginKeywords: "import",
        end: /$/,
        contains: [...COMMENTS],
        relevance: 0
      },
      REGEXP,
      ...KEYWORD_MODES,
      ...BUILT_INS3,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS,
      ...ATTRIBUTES4,
      TYPE,
      TUPLE
    ]
  };
}

// node_modules/highlight.js/es/languages/typescript.js
var IDENT_RE2 = "[A-Za-z$_][0-9A-Za-z$_]*";
var KEYWORDS2 = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
];
var LITERALS2 = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
];
var TYPES2 = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
];
var ERROR_TYPES2 = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
];
var BUILT_IN_GLOBALS2 = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
];
var BUILT_IN_VARIABLES2 = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "self",
  "global"
  // Node.js
];
var BUILT_INS2 = [].concat(
  BUILT_IN_GLOBALS2,
  TYPES2,
  ERROR_TYPES2
);
function javascript2(hljs) {
  const regex = hljs.regex;
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };
  const IDENT_RE$1 = IDENT_RE2;
  const FRAGMENT = {
    begin: "<>",
    end: "</>"
  };
  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
  const XML_TAG = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        nextChar === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
      ) {
        response.ignoreMatch();
        return;
      }
      if (nextChar === ">") {
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }
      let m;
      const afterMatch = match.input.substring(afterMatchIndex);
      if (m = afterMatch.match(/^\s*=/)) {
        response.ignoreMatch();
        return;
      }
      if (m = afterMatch.match(/^\s+extends\s+/)) {
        if (m.index === 0) {
          response.ignoreMatch();
          return;
        }
      }
    }
  };
  const KEYWORDS$1 = {
    $pattern: IDENT_RE2,
    keyword: KEYWORDS2,
    literal: LITERALS2,
    built_in: BUILT_INS2,
    "variable.language": BUILT_IN_VARIABLES2
  };
  const decimalDigits3 = "[0-9](_?[0-9])*";
  const frac3 = `\\.(${decimalDigits3})`;
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac3})|\\.)?|(${frac3}))[eE][+-]?(${decimalDigits3})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac3})\\b|\\.)?|(${frac3})\\b` },
      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  };
  const SUBST = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: KEYWORDS$1,
    contains: []
    // defined later
  };
  const HTML_TEMPLATE = {
    begin: ".?html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "xml"
    }
  };
  const CSS_TEMPLATE = {
    begin: ".?css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "css"
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: ".?gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "graphql"
    }
  };
  const TEMPLATE_STRING = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    "\\*/",
    {
      relevance: 0,
      contains: [
        {
          begin: "(?=@[A-Za-z]+)",
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            },
            {
              className: "type",
              begin: "\\{",
              end: "\\}",
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: "variable",
              begin: IDENT_RE$1 + "(?=\\s*(-)|$)",
              endsParent: true,
              relevance: 0
            },
            // eat spaces (not newlines) so we can find
            // types or variables
            {
              begin: /(?=[^\n])\s/,
              relevance: 0
            }
          ]
        }
      ]
    }
  );
  const COMMENT = {
    className: "comment",
    variants: [
      JSDOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const SUBST_INTERNALS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    HTML_TEMPLATE,
    CSS_TEMPLATE,
    GRAPHQL_TEMPLATE,
    TEMPLATE_STRING,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    NUMBER
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS$1,
    contains: [
      "self"
    ].concat(SUBST_INTERNALS)
  });
  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: KEYWORDS$1,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$1,
    contains: PARAMS_CONTAINS
  };
  const CLASS_OR_EXTENDS = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1,
          /\s+/,
          /extends/,
          /\s+/,
          regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  };
  const CLASS_REFERENCE = {
    relevance: 0,
    match: regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...TYPES2,
        ...ERROR_TYPES2
      ]
    }
  };
  const USE_STRICT = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  };
  const FUNCTION_DEFINITION = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          IDENT_RE$1,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [PARAMS],
    illegal: /%/
  };
  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function noneOf(list) {
    return regex.concat("(?!", list.join("|"), ")");
  }
  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS2,
        "super",
        "import",
        "await"
      ].map((x3) => `${x3}\\s*\\(`)),
      IDENT_RE$1,
      regex.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  };
  const PROPERTY_ACCESS = {
    begin: regex.concat(/\./, regex.lookahead(
      regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
    )),
    end: IDENT_RE$1,
    excludeBegin: true,
    keywords: "prototype",
    className: "property",
    relevance: 0
  };
  const GETTER_OR_SETTER = {
    match: [
      /get|set/,
      /\s+/,
      IDENT_RE$1,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };
  const FUNC_LEAD_IN_RE = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + hljs.UNDERSCORE_IDENT_RE + ")\\s*=>";
  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/,
      /\s+/,
      IDENT_RE$1,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      regex.lookahead(FUNC_LEAD_IN_RE)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: KEYWORDS$1,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
    illegal: /#(?![$_A-Za-z])/,
    contains: [
      hljs.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      USE_STRICT,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      HTML_TEMPLATE,
      CSS_TEMPLATE,
      GRAPHQL_TEMPLATE,
      TEMPLATE_STRING,
      COMMENT,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        scope: "attr",
        match: IDENT_RE$1 + regex.lookahead(":"),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      {
        // "value" container
        begin: "(" + hljs.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          COMMENT,
          hljs.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: hljs.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: true
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: true,
                    excludeEnd: true,
                    keywords: KEYWORDS$1,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      FUNCTION_DEFINITION,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + hljs.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: true,
        label: "func.def",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      PROPERTY_ACCESS,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + IDENT_RE$1,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [PARAMS]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function typescript(hljs) {
  const regex = hljs.regex;
  const tsLanguage = javascript2(hljs);
  const IDENT_RE$1 = IDENT_RE2;
  const TYPES3 = [
    "any",
    "void",
    "number",
    "boolean",
    "string",
    "object",
    "never",
    "symbol",
    "bigint",
    "unknown"
  ];
  const NAMESPACE = {
    begin: [
      /namespace/,
      /\s+/,
      hljs.IDENT_RE
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    }
  };
  const INTERFACE = {
    beginKeywords: "interface",
    end: /\{/,
    excludeEnd: true,
    keywords: {
      keyword: "interface extends",
      built_in: TYPES3
    },
    contains: [tsLanguage.exports.CLASS_REFERENCE]
  };
  const USE_STRICT = {
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use strict['"]/
  };
  const TS_SPECIFIC_KEYWORDS = [
    "type",
    // "namespace",
    "interface",
    "public",
    "private",
    "protected",
    "implements",
    "declare",
    "abstract",
    "readonly",
    "enum",
    "override",
    "satisfies"
  ];
  const KEYWORDS$1 = {
    $pattern: IDENT_RE2,
    keyword: KEYWORDS2.concat(TS_SPECIFIC_KEYWORDS),
    literal: LITERALS2,
    built_in: BUILT_INS2.concat(TYPES3),
    "variable.language": BUILT_IN_VARIABLES2
  };
  const DECORATOR = {
    className: "meta",
    begin: "@" + IDENT_RE$1
  };
  const swapMode = (mode, label, replacement) => {
    const indx = mode.contains.findIndex((m) => m.label === label);
    if (indx === -1) {
      throw new Error("can not find mode to replace");
    }
    mode.contains.splice(indx, 1, replacement);
  };
  Object.assign(tsLanguage.keywords, KEYWORDS$1);
  tsLanguage.exports.PARAMS_CONTAINS.push(DECORATOR);
  const ATTRIBUTE_HIGHLIGHT = tsLanguage.contains.find((c3) => c3.scope === "attr");
  const OPTIONAL_KEY_OR_ARGUMENT = Object.assign(
    {},
    ATTRIBUTE_HIGHLIGHT,
    { match: regex.concat(IDENT_RE$1, regex.lookahead(/\s*\?:/)) }
  );
  tsLanguage.exports.PARAMS_CONTAINS.push([
    tsLanguage.exports.CLASS_REFERENCE,
    // class reference for highlighting the params types
    ATTRIBUTE_HIGHLIGHT,
    // highlight the params key
    OPTIONAL_KEY_OR_ARGUMENT
    // Added for optional property assignment highlighting
  ]);
  tsLanguage.contains = tsLanguage.contains.concat([
    DECORATOR,
    NAMESPACE,
    INTERFACE,
    OPTIONAL_KEY_OR_ARGUMENT
    // Added for optional property assignment highlighting
  ]);
  swapMode(tsLanguage, "shebang", hljs.SHEBANG());
  swapMode(tsLanguage, "use_strict", USE_STRICT);
  const functionDeclaration = tsLanguage.contains.find((m) => m.label === "func.def");
  functionDeclaration.relevance = 0;
  Object.assign(tsLanguage, {
    name: "TypeScript",
    aliases: [
      "ts",
      "tsx",
      "mts",
      "cts"
    ]
  });
  return tsLanguage;
}

// node_modules/highlight.js/es/languages/vbnet.js
function vbnet(hljs) {
  const regex = hljs.regex;
  const CHARACTER = {
    className: "string",
    begin: /"(""|[^/n])"C\b/
  };
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    illegal: /\n/,
    contains: [
      {
        // double quote escape
        begin: /""/
      }
    ]
  };
  const MM_DD_YYYY = /\d{1,2}\/\d{1,2}\/\d{4}/;
  const YYYY_MM_DD = /\d{4}-\d{1,2}-\d{1,2}/;
  const TIME_12H = /(\d|1[012])(:\d+){0,2} *(AM|PM)/;
  const TIME_24H = /\d{1,2}(:\d{1,2}){1,2}/;
  const DATE = {
    className: "literal",
    variants: [
      {
        // #YYYY-MM-DD# (ISO-Date) or #M/D/YYYY# (US-Date)
        begin: regex.concat(/# */, regex.either(YYYY_MM_DD, MM_DD_YYYY), / *#/)
      },
      {
        // #H:mm[:ss]# (24h Time)
        begin: regex.concat(/# */, TIME_24H, / *#/)
      },
      {
        // #h[:mm[:ss]] A# (12h Time)
        begin: regex.concat(/# */, TIME_12H, / *#/)
      },
      {
        // date plus time
        begin: regex.concat(
          /# */,
          regex.either(YYYY_MM_DD, MM_DD_YYYY),
          / +/,
          regex.either(TIME_12H, TIME_24H),
          / *#/
        )
      }
    ]
  };
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      {
        // Float
        begin: /\b\d[\d_]*((\.[\d_]+(E[+-]?[\d_]+)?)|(E[+-]?[\d_]+))[RFD@!#]?/
      },
      {
        // Integer (base 10)
        begin: /\b\d[\d_]*((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 16)
        begin: /&H[\dA-F_]+((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 8)
        begin: /&O[0-7_]+((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 2)
        begin: /&B[01_]+((U?[SIL])|[%&])?/
      }
    ]
  };
  const LABEL = {
    className: "label",
    begin: /^\w+:/
  };
  const DOC_COMMENT = hljs.COMMENT(/'''/, /$/, { contains: [
    {
      className: "doctag",
      begin: /<\/?/,
      end: />/
    }
  ] });
  const COMMENT = hljs.COMMENT(null, /$/, { variants: [
    { begin: /'/ },
    {
      // TODO: Use multi-class for leading spaces
      begin: /([\t ]|^)REM(?=\s)/
    }
  ] });
  const DIRECTIVES = {
    className: "meta",
    // TODO: Use multi-class for indentation once available
    begin: /[\t ]*#(const|disable|else|elseif|enable|end|externalsource|if|region)\b/,
    end: /$/,
    keywords: { keyword: "const disable else elseif enable end externalsource if region then" },
    contains: [COMMENT]
  };
  return {
    name: "Visual Basic .NET",
    aliases: ["vb"],
    case_insensitive: true,
    classNameAliases: { label: "symbol" },
    keywords: {
      keyword: "addhandler alias aggregate ansi as async assembly auto binary by byref byval call case catch class compare const continue custom declare default delegate dim distinct do each equals else elseif end enum erase error event exit explicit finally for friend from function get global goto group handles if implements imports in inherits interface into iterator join key let lib loop me mid module mustinherit mustoverride mybase myclass namespace narrowing new next notinheritable notoverridable of off on operator option optional order overloads overridable overrides paramarray partial preserve private property protected public raiseevent readonly redim removehandler resume return select set shadows shared skip static step stop structure strict sub synclock take text then throw to try unicode until using when where while widening with withevents writeonly yield",
      built_in: (
        // Operators https://docs.microsoft.com/dotnet/visual-basic/language-reference/operators
        "addressof and andalso await directcast gettype getxmlnamespace is isfalse isnot istrue like mod nameof new not or orelse trycast typeof xor cbool cbyte cchar cdate cdbl cdec cint clng cobj csbyte cshort csng cstr cuint culng cushort"
      ),
      type: (
        // Data types https://docs.microsoft.com/dotnet/visual-basic/language-reference/data-types
        "boolean byte char date decimal double integer long object sbyte short single string uinteger ulong ushort"
      ),
      literal: "true false nothing"
    },
    illegal: "//|\\{|\\}|endif|gosub|variant|wend|^\\$ ",
    contains: [
      CHARACTER,
      STRING,
      DATE,
      NUMBER,
      LABEL,
      DOC_COMMENT,
      COMMENT,
      DIRECTIVES
    ]
  };
}

// node_modules/highlight.js/es/languages/wasm.js
function wasm(hljs) {
  hljs.regex;
  const BLOCK_COMMENT = hljs.COMMENT(/\(;/, /;\)/);
  BLOCK_COMMENT.contains.push("self");
  const LINE_COMMENT = hljs.COMMENT(/;;/, /$/);
  const KWS = [
    "anyfunc",
    "block",
    "br",
    "br_if",
    "br_table",
    "call",
    "call_indirect",
    "data",
    "drop",
    "elem",
    "else",
    "end",
    "export",
    "func",
    "global.get",
    "global.set",
    "local.get",
    "local.set",
    "local.tee",
    "get_global",
    "get_local",
    "global",
    "if",
    "import",
    "local",
    "loop",
    "memory",
    "memory.grow",
    "memory.size",
    "module",
    "mut",
    "nop",
    "offset",
    "param",
    "result",
    "return",
    "select",
    "set_global",
    "set_local",
    "start",
    "table",
    "tee_local",
    "then",
    "type",
    "unreachable"
  ];
  const FUNCTION_REFERENCE = {
    begin: [
      /(?:func|call|call_indirect)/,
      /\s+/,
      /\$[^\s)]+/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    }
  };
  const ARGUMENT = {
    className: "variable",
    begin: /\$[\w_]+/
  };
  const PARENS = {
    match: /(\((?!;)|\))+/,
    className: "punctuation",
    relevance: 0
  };
  const NUMBER = {
    className: "number",
    relevance: 0,
    // borrowed from Prism, TODO: split out into variants
    match: /[+-]?\b(?:\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?|0x[\da-fA-F](?:_?[\da-fA-F])*(?:\.[\da-fA-F](?:_?[\da-fA-D])*)?(?:[pP][+-]?\d(?:_?\d)*)?)\b|\binf\b|\bnan(?::0x[\da-fA-F](?:_?[\da-fA-D])*)?\b/
  };
  const TYPE = {
    // look-ahead prevents us from gobbling up opcodes
    match: /(i32|i64|f32|f64)(?!\.)/,
    className: "type"
  };
  const MATH_OPERATIONS = {
    className: "keyword",
    // borrowed from Prism, TODO: split out into variants
    match: /\b(f32|f64|i32|i64)(?:\.(?:abs|add|and|ceil|clz|const|convert_[su]\/i(?:32|64)|copysign|ctz|demote\/f64|div(?:_[su])?|eqz?|extend_[su]\/i32|floor|ge(?:_[su])?|gt(?:_[su])?|le(?:_[su])?|load(?:(?:8|16|32)_[su])?|lt(?:_[su])?|max|min|mul|nearest|neg?|or|popcnt|promote\/f32|reinterpret\/[fi](?:32|64)|rem_[su]|rot[lr]|shl|shr_[su]|store(?:8|16|32)?|sqrt|sub|trunc(?:_[su]\/f(?:32|64))?|wrap\/i64|xor))\b/
  };
  const OFFSET_ALIGN = {
    match: [
      /(?:offset|align)/,
      /\s*/,
      /=/
    ],
    className: {
      1: "keyword",
      3: "operator"
    }
  };
  return {
    name: "WebAssembly",
    keywords: {
      $pattern: /[\w.]+/,
      keyword: KWS
    },
    contains: [
      LINE_COMMENT,
      BLOCK_COMMENT,
      OFFSET_ALIGN,
      ARGUMENT,
      PARENS,
      FUNCTION_REFERENCE,
      hljs.QUOTE_STRING_MODE,
      TYPE,
      MATH_OPERATIONS,
      NUMBER
    ]
  };
}

// node_modules/highlight.js/es/languages/xml.js
function xml(hljs) {
  const regex = hljs.regex;
  const TAG_NAME_RE = regex.concat(/[\p{L}_]/u, regex.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u);
  const XML_IDENT_RE = /[\p{L}0-9._:-]+/u;
  const XML_ENTITIES = {
    className: "symbol",
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  };
  const XML_META_KEYWORDS = {
    begin: /\s/,
    contains: [
      {
        className: "keyword",
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  };
  const XML_META_PAR_KEYWORDS = hljs.inherit(XML_META_KEYWORDS, {
    begin: /\(/,
    end: /\)/
  });
  const APOS_META_STRING_MODE = hljs.inherit(hljs.APOS_STRING_MODE, { className: "string" });
  const QUOTE_META_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, { className: "string" });
  const TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: "attr",
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: "string",
            endsParent: true,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [XML_ENTITIES]
              },
              {
                begin: /'/,
                end: /'/,
                contains: [XML_ENTITIES]
              },
              { begin: /[^\s"'=<>`]+/ }
            ]
          }
        ]
      }
    ]
  };
  return {
    name: "HTML, XML",
    aliases: [
      "html",
      "xhtml",
      "rss",
      "atom",
      "xjb",
      "xsd",
      "xsl",
      "plist",
      "wsf",
      "svg"
    ],
    case_insensitive: true,
    unicodeRegex: true,
    contains: [
      {
        className: "meta",
        begin: /<![a-z]/,
        end: />/,
        relevance: 10,
        contains: [
          XML_META_KEYWORDS,
          QUOTE_META_STRING_MODE,
          APOS_META_STRING_MODE,
          XML_META_PAR_KEYWORDS,
          {
            begin: /\[/,
            end: /\]/,
            contains: [
              {
                className: "meta",
                begin: /<![a-z]/,
                end: />/,
                contains: [
                  XML_META_KEYWORDS,
                  XML_META_PAR_KEYWORDS,
                  QUOTE_META_STRING_MODE,
                  APOS_META_STRING_MODE
                ]
              }
            ]
          }
        ]
      },
      hljs.COMMENT(
        /<!--/,
        /-->/,
        { relevance: 10 }
      ),
      {
        begin: /<!\[CDATA\[/,
        end: /\]\]>/,
        relevance: 10
      },
      XML_ENTITIES,
      // xml processing instructions
      {
        className: "meta",
        end: /\?>/,
        variants: [
          {
            begin: /<\?xml/,
            relevance: 10,
            contains: [
              QUOTE_META_STRING_MODE
            ]
          },
          {
            begin: /<\?[a-z][a-z0-9]+/
          }
        ]
      },
      {
        className: "tag",
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending bracket.
        */
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: "style" },
        contains: [TAG_INTERNALS],
        starts: {
          end: /<\/style>/,
          returnEnd: true,
          subLanguage: "css"
        }
      },
      {
        className: "tag",
        // See the comment in the <style tag about the lookahead pattern
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: "script" },
        contains: [TAG_INTERNALS],
        starts: {
          end: /<\/script>/,
          returnEnd: true,
          subLanguage: "javascript"
        }
      },
      // we need this for now for jSX
      {
        className: "tag",
        begin: /<>|<\/>/
      },
      // open tag
      {
        className: "tag",
        begin: regex.concat(
          /</,
          regex.lookahead(regex.concat(
            TAG_NAME_RE,
            // <tag/>
            // <tag>
            // <tag ...
            regex.either(/\/>/, />/, /\s/)
          ))
        ),
        end: /\/?>/,
        contains: [
          {
            className: "name",
            begin: TAG_NAME_RE,
            relevance: 0,
            starts: TAG_INTERNALS
          }
        ]
      },
      // close tag
      {
        className: "tag",
        begin: regex.concat(
          /<\//,
          regex.lookahead(regex.concat(
            TAG_NAME_RE,
            />/
          ))
        ),
        contains: [
          {
            className: "name",
            begin: TAG_NAME_RE,
            relevance: 0
          },
          {
            begin: />/,
            relevance: 0,
            endsParent: true
          }
        ]
      }
    ]
  };
}

// node_modules/highlight.js/es/languages/yaml.js
function yaml(hljs) {
  const LITERALS3 = "true false yes no null";
  const URI_CHARACTERS = "[\\w#;/?:@&=+$,.~*'()[\\]]+";
  const KEY = {
    className: "attr",
    variants: [
      // added brackets support and special char support
      { begin: /[\w*@][\w*@ :()\./-]*:(?=[ \t]|$)/ },
      {
        // double quoted keys - with brackets and special char support
        begin: /"[\w*@][\w*@ :()\./-]*":(?=[ \t]|$)/
      },
      {
        // single quoted keys - with brackets and special char support
        begin: /'[\w*@][\w*@ :()\./-]*':(?=[ \t]|$)/
      }
    ]
  };
  const TEMPLATE_VARIABLES = {
    className: "template-variable",
    variants: [
      {
        // jinja templates Ansible
        begin: /\{\{/,
        end: /\}\}/
      },
      {
        // Ruby i18n
        begin: /%\{/,
        end: /\}/
      }
    ]
  };
  const SINGLE_QUOTE_STRING = {
    className: "string",
    relevance: 0,
    begin: /'/,
    end: /'/,
    contains: [
      {
        match: /''/,
        scope: "char.escape",
        relevance: 0
      }
    ]
  };
  const STRING = {
    className: "string",
    relevance: 0,
    variants: [
      {
        begin: /"/,
        end: /"/
      },
      { begin: /\S+/ }
    ],
    contains: [
      hljs.BACKSLASH_ESCAPE,
      TEMPLATE_VARIABLES
    ]
  };
  const CONTAINER_STRING = hljs.inherit(STRING, { variants: [
    {
      begin: /'/,
      end: /'/,
      contains: [
        {
          begin: /''/,
          relevance: 0
        }
      ]
    },
    {
      begin: /"/,
      end: /"/
    },
    { begin: /[^\s,{}[\]]+/ }
  ] });
  const DATE_RE = "[0-9]{4}(-[0-9][0-9]){0,2}";
  const TIME_RE = "([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?";
  const FRACTION_RE = "(\\.[0-9]*)?";
  const ZONE_RE = "([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?";
  const TIMESTAMP = {
    className: "number",
    begin: "\\b" + DATE_RE + TIME_RE + FRACTION_RE + ZONE_RE + "\\b"
  };
  const VALUE_CONTAINER = {
    end: ",",
    endsWithParent: true,
    excludeEnd: true,
    keywords: LITERALS3,
    relevance: 0
  };
  const OBJECT = {
    begin: /\{/,
    end: /\}/,
    contains: [VALUE_CONTAINER],
    illegal: "\\n",
    relevance: 0
  };
  const ARRAY = {
    begin: "\\[",
    end: "\\]",
    contains: [VALUE_CONTAINER],
    illegal: "\\n",
    relevance: 0
  };
  const MODES4 = [
    KEY,
    {
      className: "meta",
      begin: "^---\\s*$",
      relevance: 10
    },
    {
      // multi line string
      // Blocks start with a | or > followed by a newline
      //
      // Indentation of subsequent lines must be the same to
      // be considered part of the block
      className: "string",
      begin: "[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*"
    },
    {
      // Ruby/Rails erb
      begin: "<%[%=-]?",
      end: "[%-]?%>",
      subLanguage: "ruby",
      excludeBegin: true,
      excludeEnd: true,
      relevance: 0
    },
    {
      // named tags
      className: "type",
      begin: "!\\w+!" + URI_CHARACTERS
    },
    // https://yaml.org/spec/1.2/spec.html#id2784064
    {
      // verbatim tags
      className: "type",
      begin: "!<" + URI_CHARACTERS + ">"
    },
    {
      // primary tags
      className: "type",
      begin: "!" + URI_CHARACTERS
    },
    {
      // secondary tags
      className: "type",
      begin: "!!" + URI_CHARACTERS
    },
    {
      // fragment id &ref
      className: "meta",
      begin: "&" + hljs.UNDERSCORE_IDENT_RE + "$"
    },
    {
      // fragment reference *ref
      className: "meta",
      begin: "\\*" + hljs.UNDERSCORE_IDENT_RE + "$"
    },
    {
      // array listing
      className: "bullet",
      // TODO: remove |$ hack when we have proper look-ahead support
      begin: "-(?=[ ]|$)",
      relevance: 0
    },
    hljs.HASH_COMMENT_MODE,
    {
      beginKeywords: LITERALS3,
      keywords: { literal: LITERALS3 }
    },
    TIMESTAMP,
    // numbers are any valid C-style number that
    // sit isolated from other words
    {
      className: "number",
      begin: hljs.C_NUMBER_RE + "\\b",
      relevance: 0
    },
    OBJECT,
    ARRAY,
    SINGLE_QUOTE_STRING,
    STRING
  ];
  const VALUE_MODES = [...MODES4];
  VALUE_MODES.pop();
  VALUE_MODES.push(CONTAINER_STRING);
  VALUE_CONTAINER.contains = VALUE_MODES;
  return {
    name: "YAML",
    case_insensitive: true,
    aliases: ["yml"],
    contains: MODES4
  };
}

// node_modules/md/packages/core/src/utils/languages.ts
var COMMON_LANGUAGES = {
  bash,
  c: c2,
  cpp,
  csharp,
  css,
  diff,
  go,
  graphql,
  ini,
  java,
  javascript,
  json,
  kotlin,
  less,
  lua,
  makefile,
  markdown,
  objectivec,
  perl,
  php,
  "php-template": phpTemplate,
  plaintext,
  python,
  "python-repl": pythonRepl,
  r,
  ruby,
  rust,
  scss,
  shell,
  sql,
  swift,
  typescript,
  vbnet,
  wasm,
  xml,
  yaml
};

// node_modules/md/packages/core/src/renderer/renderer-impl.ts
Object.entries(COMMON_LANGUAGES).forEach(([name, lang]) => {
  core_default.registerLanguage(name, lang);
});
x.setOptions({
  breaks: true
});
x.use(markedSlider());
function buildTheme({ theme: _theme, fonts, size, isUseIndent, isUseJustify }) {
  const theme = cloneDeep(_theme);
  const base = toMerged(theme.base, {
    "font-family": fonts,
    "font-size": size
  });
  if (isUseIndent) {
    theme.block.p = {
      "text-indent": `2em`,
      ...theme.block.p
    };
  }
  if (isUseJustify) {
    theme.block.p = {
      "text-align": `justify`,
      ...theme.block.p
    };
  }
  const mergeStyles = (styles) => Object.fromEntries(
    Object.entries(styles).map(([ele, style]) => [ele, toMerged(base, style)])
  );
  return {
    ...mergeStyles(theme.inline),
    ...mergeStyles(theme.block)
  };
}
function escapeHtml2(text) {
  return text.replace(/&/g, `&amp;`).replace(/</g, `&lt;`).replace(/>/g, `&gt;`).replace(/"/g, `&quot;`).replace(/'/g, `&#39;`).replace(/`/g, `&#96;`);
}
function buildAddition() {
  return `
    <style>
      .preview-wrapper pre::before {
        position: absolute;
        top: 0;
        right: 0;
        color: #ccc;
        text-align: center;
        font-size: 0.8em;
        padding: 5px 10px 0;
        line-height: 15px;
        height: 15px;
        font-weight: 600;
      }
    </style>
  `;
}
function getStyles(styleMapping, tokenName, addition = ``) {
  const dict = styleMapping[tokenName];
  if (!dict) {
    return ``;
  }
  const styles = getStyleString(dict);
  return `style="${styles}${addition}"`;
}
function buildFootnoteArray(footnotes) {
  return footnotes.map(
    ([index, title, link]) => link === title ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>` : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`
  ).join(`
`);
}
function transform(legend, text, title) {
  const options = legend.split(`-`);
  for (const option of options) {
    if (option === `alt` && text) {
      return text;
    }
    if (option === `title` && title) {
      return title;
    }
  }
  return ``;
}
var macCodeSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
    <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
    <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
    <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
  </svg>
`.trim();
function parseFrontMatterAndContent(markdownText) {
  try {
    const parsed = (0, import_front_matter.default)(markdownText);
    const yamlData = parsed.attributes;
    const markdownContent = parsed.body;
    const readingTimeResult = (0, import_reading_time.default)(markdownContent);
    return {
      yamlData,
      markdownContent,
      readingTime: readingTimeResult
    };
  } catch (error) {
    console.error(`Error parsing front-matter:`, error);
    return {
      yamlData: {},
      markdownContent: markdownText,
      readingTime: (0, import_reading_time.default)(markdownText)
    };
  }
}
function initRenderer(opts) {
  const footnotes = [];
  let footnoteIndex = 0;
  let styleMapping = buildTheme(opts);
  let codeIndex = 0;
  const listOrderedStack = [];
  const listCounters = [];
  function getOpts() {
    return opts;
  }
  function styles(tag, addition = ``) {
    return getStyles(styleMapping, tag, addition);
  }
  function styledContent(styleLabel, content, tagName) {
    const tag = tagName ?? styleLabel;
    return `<${tag} ${/^h\d$/.test(tag) ? `data-heading="true"` : ``} ${styles(styleLabel)}>${content}</${tag}>`;
  }
  function addFootnote(title, link) {
    const existingFootnote = footnotes.find(([, , existingLink]) => existingLink === link);
    if (existingFootnote) {
      return existingFootnote[0];
    }
    footnotes.push([++footnoteIndex, title, link]);
    return footnoteIndex;
  }
  function reset(newOpts) {
    footnotes.length = 0;
    footnoteIndex = 0;
    setOptions(newOpts);
  }
  function setOptions(newOpts) {
    opts = { ...opts, ...newOpts };
    const oldStyle = JSON.stringify(styleMapping);
    styleMapping = buildTheme(opts);
    const newStyle = JSON.stringify(styleMapping);
    if (oldStyle !== newStyle) {
      x.use(markedAlert({ styles: styleMapping }));
      x.use(
        MDKatex(
          { nonStandard: true },
          styles(`inline_katex`, `;line-height: 1;`),
          styles(`block_katex`, `;text-align: center;`)
        )
      );
      x.use(markedMarkup({ styles: styleMapping }));
    }
  }
  function buildReadingTime(readingTime2) {
    if (!opts.countStatus) {
      return ``;
    }
    if (!readingTime2.words) {
      return ``;
    }
    return `
      <blockquote ${styles(`blockquote`)}>
        <p ${styles(`blockquote_p`)}>\u5B57\u6570 ${readingTime2?.words}\uFF0C\u9605\u8BFB\u5927\u7EA6\u9700 ${Math.ceil(readingTime2?.minutes)} \u5206\u949F</p>
      </blockquote>
    `;
  }
  const buildFootnotes = () => {
    if (!footnotes.length) {
      return ``;
    }
    return styledContent(`h4`, `\u5F15\u7528\u94FE\u63A5`) + styledContent(`footnotes`, buildFootnoteArray(footnotes), `p`);
  };
  const renderer = {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const tag = `h${depth}`;
      // Inline the h2 strong color rule from postProcessHtml as well.
      const headingText = depth === 2
        ? text.replace(/(<strong\b[^>]*style="[^"]*)"/g, '$1; color: inherit"')
        : text;
      const contentKey = tag + "_content";
      const content = styleMapping[contentKey]
        ? '<span class="content" ' + styles(contentKey) + '>' + headingText + '</span>'
        : headingText;
      return styledContent(tag, content);
    },
    paragraph({ tokens }) {
      const text = this.parser.parseInline(tokens);
      const isFigureImage = text.includes(`<figure`) && text.includes(`<img`);
      const isEmpty = text.trim() === ``;
      if (isFigureImage || isEmpty) {
        return text;
      }
      return styledContent(`p`, text);
    },
    blockquote({ tokens }) {
      let text = this.parser.parse(tokens);
      text = text.replace(/<p .*?>/g, `<p ${styles(`blockquote_p`)}>`);
      return styledContent(`blockquote`, text);
    },
    code({ text, lang = `` }) {
      if (lang.startsWith(`mermaid`)) {
        clearTimeout(codeIndex);
        codeIndex = setTimeout(async () => {
          if (typeof window !== `undefined` && window.mermaid) {
            const mermaid = window.mermaid;
            await mermaid.run();
          } else {
            const mermaid = await import("mermaid");
            await mermaid.default.run();
          }
        }, 0);
        return `<pre class="mermaid">${text}</pre>`;
      }
      const langText = lang.split(` `)[0];
      const language = core_default.getLanguage(langText) ? langText : `plaintext`;
      let highlighted = ``;
      if (opts.isShowLineNumber) {
        const rawLines = text.replace(/\r\n/g, `
`).split(`
`);
        const highlightedLines = rawLines.map((lineRaw) => {
          let lineHtml = core_default.highlight(lineRaw, { language }).value;
          lineHtml = lineHtml.replace(/(<span[^>]*>[^<]*<\/span>)(\s+)(<span[^>]*>[^<]*<\/span>)/g, (_2, span1, spaces, span2) => span1 + span2.replace(/^(<span[^>]*>)/, `$1${spaces}`));
          lineHtml = lineHtml.replace(/(\s+)(<span[^>]*>)/g, (_2, spaces, span2) => span2.replace(/^(<span[^>]*>)/, `$1${spaces}`));
          lineHtml = lineHtml.replace(/\t/g, `    `);
          lineHtml = lineHtml.replace(/(>[^<]+)|(^[^<]+)/g, (str) => str.replace(/\s/g, `&nbsp;`));
          return lineHtml === `` ? `&nbsp;` : lineHtml;
        });
        const lineNumbersHtml = highlightedLines.map((_2, idx) => `<section style="padding:0 10px 0 0;line-height:1.75">${idx + 1}</section>`).join(``);
        const codeInnerHtml = highlightedLines.join(`<br/>`);
        const codeLinesHtml = `<div style="white-space:pre;min-width:max-content;line-height:1.75">${codeInnerHtml}</div>`;
        const lineNumberColumnStyles = `text-align:right;padding:8px 0;border-right:1px solid rgba(0,0,0,0.04);user-select:none;background:var(--code-bg,transparent);`;
        highlighted = `
          <section style="display:flex;align-items:flex-start;overflow-x:hidden;overflow-y:auto;width:100%;max-width:100%;padding:0;box-sizing:border-box">
            <section class="line-numbers" style="${lineNumberColumnStyles}">${lineNumbersHtml}</section>
            <section class="code-scroll" style="flex:1 1 auto;overflow-x:auto;overflow-y:visible;padding:8px;min-width:0;box-sizing:border-box">${codeLinesHtml}</section>
          </section>
        `;
      } else {
        highlighted = core_default.highlight(text, { language }).value;
        highlighted = highlighted.replace(/(<span[^>]*>[^<]*<\/span>)(\s+)(<span[^>]*>[^<]*<\/span>)/g, (_2, span1, spaces, span2) => span1 + span2.replace(/^(<span[^>]*>)/, `$1${spaces}`));
        highlighted = highlighted.replace(/(\s+)(<span[^>]*>)/g, (_2, spaces, span2) => span2.replace(/^(<span[^>]*>)/, `$1${spaces}`));
        highlighted = highlighted.replace(/\t/g, `    `);
        highlighted = highlighted.replace(/\r\n/g, `<br/>`).replace(/\n/g, `<br/>`).replace(/(>[^<]+)|(^[^<]+)/g, (str) => str.replace(/\s/g, `&nbsp;`));
      }
      const span = `<span class="mac-sign" style="display: ${opts.isMacCodeBlock ? "flex" : "none"}; padding: 10px 14px 0;">${macCodeSvg}</span>`;
      const code = `<code class="language-${lang}" ${styles(`code`, `;display: block; white-space: ${opts.isShowLineNumber ? "normal" : "pre"}; padding: 0.5em 1em 1em; overflow-x: auto; text-indent: 0`)}>${highlighted}</code>`;
      return `<pre class="hljs code__pre" ${styles(`code_pre`, `;padding: 0`)}>${span}${code}</pre>`;
    },
    codespan({ text }) {
      const escapedText = escapeHtml2(text);
      return styledContent(`codespan`, escapedText, `code`);
    },
    list({ ordered, items, start = 1 }) {
      listOrderedStack.push(ordered);
      listCounters.push(Number(start));
      const html = items.map((item) => this.listitem(item)).join(``);
      listOrderedStack.pop();
      listCounters.pop();
      return styledContent(
        ordered ? `ol` : `ul`,
        html
      );
    },
    // 2. listitem：从栈顶取 ordered + counter，计算 prefix 并自增
    listitem(token) {
      const ordered = listOrderedStack[listOrderedStack.length - 1];
      const idx = listCounters[listCounters.length - 1];
      listCounters[listCounters.length - 1] = idx + 1;
      const prefix = ordered ? `${idx}. ` : `\u2022 `;
      let content;
      try {
        content = this.parser.parseInline(token.tokens);
      } catch {
        content = this.parser.parse(token.tokens).replace(/^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/, `$1`);
      }
      return styledContent(
        `listitem`,
        `${prefix}${content}`,
        `li`
      );
    },
    image({ href, title, text }) {
      const subText = styledContent(`figcaption`, transform(opts.legend, text, title));
      const figureStyles = styles(`figure`);
      const imgStyles = styles(`image`);
      return `<figure ${figureStyles}><img ${imgStyles} src="${href}" title="${title}" alt="${text}"/>${subText}</figure>`;
    },
    link({ href, title, text, tokens }) {
      const parsedText = this.parser.parseInline(tokens);
      if (/^https?:\/\/mp\.weixin\.qq\.com/.test(href)) {
        return `<a href="${href}" title="${title || text}" ${styles(`wx_link`)}>${parsedText}</a>`;
      }
      if (href === text) {
        return parsedText;
      }
      if (opts.citeStatus) {
        const ref = addFootnote(title || text, href);
        return `<span ${styles(`link`)}>${parsedText}<sup>[${ref}]</sup></span>`;
      }
      return styledContent(`link`, parsedText, `span`);
    },
    strong({ tokens }) {
      return styledContent(`strong`, this.parser.parseInline(tokens));
    },
    em({ tokens }) {
      return styledContent(`em`, this.parser.parseInline(tokens), `span`);
    },
    table({ header, rows }) {
      const headerRow = header.map((cell) => {
        const text = this.parser.parseInline(cell.tokens);
        return styledContent(`th`, text);
      }).join(``);
      const body = rows.map((row) => {
        const rowContent = row.map((cell) => this.tablecell(cell)).join(``);
        return styledContent(`tr`, rowContent);
      }).join(``);
      return `
        <section style="max-width: 100%; overflow: auto">
          <table class="preview-table" ${styles(`table`)}>
            <thead ${styles(`thead`)}>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `;
    },
    tablecell(token) {
      const text = this.parser.parseInline(token.tokens);
      return styledContent(`td`, text);
    },
    hr(_2) {
      return styledContent(`hr`, ``);
    }
  };
  x.use({ renderer });
  x.use(markedMarkup({ styles: styleMapping }));
  x.use(markedToc());
  x.use(markedSlider({ styles: styleMapping }));
  x.use(markedAlert({ styles: styleMapping }));
  x.use(
    MDKatex(
      { nonStandard: true },
      styles(`inline_katex`, `;line-height: 1;`),
      styles(`block_katex`, `;text-align: center;`)
    )
  );
  x.use(markedFootnotes());
  x.use(markedPlantUML({
    inlineSvg: true
    // 启用SVG内嵌，适用于微信公众号
  }));
  x.use(markedRuby());
  return {
    buildAddition,
    buildFootnotes,
    setOptions,
    reset,
    parseFrontMatterAndContent,
    buildReadingTime,
    createContainer(content) {
      return styledContent(`container`, content, `section`);
    },
    getOpts
  };
}

// node_modules/md/packages/shared/src/configs/theme.ts
var defaultTheme = {
  base: {
    "--md-primary-color": `#000000`,
    "text-align": `left`,
    "line-height": `1.75`
  },
  block: {
    container: {},
    // 一级标题
    h1: {
      "display": `table`,
      "padding": `0 1em`,
      "border-bottom": `2px solid var(--md-primary-color)`,
      "margin": `2em auto 1em`,
      "color": `hsl(var(--foreground))`,
      "font-size": `1.2em`,
      "font-weight": `bold`,
      "text-align": `center`
    },
    // 二级标题
    h2: {
      "display": `table`,
      "padding": `0 0.2em`,
      "margin": `4em auto 2em`,
      "color": `#fff`,
      "background": `var(--md-primary-color)`,
      "font-size": `1.2em`,
      "font-weight": `bold`,
      "text-align": `center`
    },
    // 三级标题
    h3: {
      "padding-left": `8px`,
      "border-left": `3px solid var(--md-primary-color)`,
      "margin": `2em 8px 0.75em 0`,
      "color": `hsl(var(--foreground))`,
      "font-size": `1.1em`,
      "font-weight": `bold`,
      "line-height": `1.2`
    },
    // 四级标题
    h4: {
      "margin": `2em 8px 0.5em`,
      "color": `var(--md-primary-color)`,
      "font-size": `1em`,
      "font-weight": `bold`
    },
    // 五级标题
    h5: {
      "margin": `1.5em 8px 0.5em`,
      "color": `var(--md-primary-color)`,
      "font-size": `1em`,
      "font-weight": `bold`
    },
    // 六级标题
    h6: {
      "margin": `1.5em 8px 0.5em`,
      "font-size": `1em`,
      "color": `var(--md-primary-color)`
    },
    // 段落
    p: {
      "margin": `1.5em 8px`,
      "letter-spacing": `0.1em`,
      "color": `hsl(var(--foreground))`
    },
    // 引用
    blockquote: {
      "font-style": `normal`,
      "padding": `1em`,
      "border-left": `4px solid var(--md-primary-color)`,
      "border-radius": `6px`,
      "color": `rgba(0,0,0,0.5)`,
      "background": `var(--blockquote-background)`,
      "margin-bottom": `1em`
    },
    // 引用内容
    blockquote_p: {
      "display": `block`,
      "font-size": `1em`,
      "letter-spacing": `0.1em`,
      "color": `hsl(var(--foreground))`
    },
    blockquote_note: {},
    blockquote_tip: {},
    blockquote_info: {},
    blockquote_important: {},
    blockquote_warning: {},
    blockquote_caution: {},
    // GFM 警告块标题
    blockquote_title: {
      "display": `flex`,
      "align-items": `center`,
      "gap": `0.5em`,
      "margin-bottom": `0.5em`
    },
    blockquote_title_note: {
      color: `#478be6`
    },
    blockquote_title_tip: {
      color: `#57ab5a`
    },
    blockquote_title_info: {
      color: `#93c5fd`
    },
    blockquote_title_important: {
      color: `#986ee2`
    },
    blockquote_title_warning: {
      color: `#c69026`
    },
    blockquote_title_caution: {
      color: `#e5534b`
    },
    blockquote_p_note: {},
    blockquote_p_tip: {},
    blockquote_p_info: {},
    blockquote_p_important: {},
    blockquote_p_warning: {},
    blockquote_p_caution: {},
    // 代码块
    code_pre: {
      "font-size": `90%`,
      "overflow-x": `auto`,
      "border-radius": `8px`,
      "padding": `1em`,
      "line-height": `1.5`,
      "margin": `10px 8px`
    },
    // 行内代码
    code: {
      "margin": 0,
      "white-space": `nowrap`,
      "font-size": `90%`,
      "font-family": `Menlo, Operator Mono, Consolas, Monaco, monospace`
    },
    // 图片
    image: {
      "display": `block`,
      "max-width": `100%`,
      "margin": `0.1em auto 0.5em`,
      "border-radius": `4px`
    },
    // 有序列表
    ol: {
      "padding-left": `1em`,
      "margin-left": `0`,
      "color": `hsl(var(--foreground))`
    },
    // 无序列表
    ul: {
      "list-style": `circle`,
      "padding-left": `1em`,
      "margin-left": `0`,
      "color": `hsl(var(--foreground))`
    },
    footnotes: {
      "margin": `0.5em 8px`,
      "font-size": `80%`,
      "color": `hsl(var(--foreground))`
    },
    figure: {
      margin: `1.5em 8px`,
      color: `hsl(var(--foreground))`
    },
    hr: {
      "border-style": `solid`,
      "border-width": `2px 0 0`,
      "border-color": `rgba(0,0,0,0.1)`,
      "-webkit-transform-origin": `0 0`,
      "-webkit-transform": `scale(1, 0.5)`,
      "transform-origin": `0 0`,
      "transform": `scale(1, 0.5)`,
      "height": `0.4em`,
      "margin": `1.5em 0`
    },
    block_katex: {
      "max-width": `100%`,
      "overflow-x": `auto`,
      "-webkit-overflow-scrolling": `touch`,
      "padding": `0.5em 0`
    }
  },
  inline: {
    listitem: {
      display: `block`,
      margin: `0.2em 8px`,
      color: `hsl(var(--foreground))`
    },
    codespan: {
      "font-size": `90%`,
      "color": `#d14`,
      "background": `rgba(27,31,35,.05)`,
      "padding": `3px 5px`,
      "border-radius": `4px`
      // 'word-break': `break-all`,
    },
    em: {
      "font-style": `italic`,
      "font-size": `inherit`
    },
    link: {
      color: `#576b95`
    },
    wx_link: {
      "color": `#576b95`,
      "text-decoration": `none`
    },
    // 字体加粗样式
    strong: {
      "color": `var(--md-primary-color)`,
      "font-weight": `bold`,
      "font-size": `inherit`
    },
    table: {
      color: `hsl(var(--foreground))`
    },
    thead: {
      "font-weight": `bold`,
      "color": `hsl(var(--foreground))`
    },
    th: {
      "border": `1px solid #dfdfdf`,
      "padding": `0.25em 0.5em`,
      "color": `hsl(var(--foreground))`,
      "word-break": `keep-all`,
      "background": `rgba(0, 0, 0, 0.05)`
    },
    td: {
      "border": `1px solid #dfdfdf`,
      "padding": `0.25em 0.5em`,
      "color": `hsl(var(--foreground))`,
      "word-break": `keep-all`
    },
    footnote: {
      "font-size": `12px`,
      "color": `hsl(var(--foreground))`
    },
    figcaption: {
      "text-align": `center`,
      "color": `#888`,
      "font-size": `0.8em`
    },
    inline_katex: {
      "max-width": `100%`,
      "overflow-x": `auto`
    },
    markup_highlight: {
      "background-color": `var(--md-primary-color)`,
      "padding": `2px 4px`,
      "border-radius": `2px`,
      "color": `#fff`
    },
    markup_underline: {
      "text-decoration": `underline`,
      "text-decoration-color": `var(--md-primary-color)`
    },
    markup_wavyline: {
      "text-decoration": `underline wavy`,
      "text-decoration-color": `var(--md-primary-color)`,
      "text-decoration-thickness": `2px`
    }
  }
};
var graceTheme = toMerged(defaultTheme, {
  base: {},
  block: {
    "container": {},
    "h1": {
      "padding": `0.5em 1em`,
      "border-bottom": `2px solid var(--md-primary-color)`,
      "font-size": `1.4em`,
      "text-shadow": `2px 2px 4px rgba(0,0,0,0.1)`
    },
    "h2": {
      "padding": `0.3em 1em`,
      "border-radius": `8px`,
      "font-size": `1.3em`,
      "box-shadow": `0 4px 6px rgba(0,0,0,0.1)`
    },
    "h3": {
      "padding-left": `12px`,
      "font-size": `1.2em`,
      "border-left": `4px solid var(--md-primary-color)`,
      "border-bottom": `1px dashed var(--md-primary-color)`
    },
    "h4": {
      "font-size": `1.1em`
    },
    "h5": {
      "font-size": `1em`
    },
    "h6": {
      "font-size": `1em`
    },
    "p": {},
    "blockquote": {
      "font-style": `italic`,
      "padding": `1em 1em 1em 2em`,
      "border-left": `4px solid var(--md-primary-color)`,
      "border-radius": `6px`,
      "color": `rgba(0,0,0,0.6)`,
      "box-shadow": `0 4px 6px rgba(0,0,0,0.05)`,
      "margin-bottom": `1em`
    },
    "blockquote_p": {},
    "markdown-alert": {
      "font-style": `italic`
    },
    "code_pre": {
      "box-shadow": `inset 0 0 10px rgba(0,0,0,0.05)`
    },
    "code": {
      "font-family": `'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace`
    },
    "image": {
      "border-radius": `8px`,
      "box-shadow": `0 4px 8px rgba(0,0,0,0.1)`
    },
    "ol": {
      "padding-left": `1.5em`
    },
    "ul": {
      "list-style": `none`,
      "padding-left": `1.5em`
    },
    "footnotes": {},
    "figure": {},
    "hr": {
      height: `1px`,
      border: `none`,
      margin: `2em 0`,
      background: `linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.1), rgba(0,0,0,0))`
    }
  },
  inline: {
    listitem: {
      margin: `0.5em 8px`
    },
    codespan: {},
    em: {},
    link: {},
    wx_link: {},
    strong: {},
    table: {
      "border-collapse": `separate`,
      "border-spacing": `0`,
      "border-radius": `8px`,
      "margin": `1em 8px`,
      "color": `hsl(var(--foreground))`,
      "box-shadow": `0 4px 6px rgba(0,0,0,0.1)`,
      "overflow": `hidden`
    },
    thead: {
      color: `#fff`
    },
    td: {
      padding: `0.5em 1em`
    },
    footnote: {
      color: `rgba(0,0,0,0.5)`
    },
    figcaption: {}
  }
});
var simpleTheme = toMerged(defaultTheme, {
  base: {},
  block: {
    container: {},
    h1: {
      "padding": `0.5em 1em`,
      "font-size": `1.4em`,
      "text-shadow": `1px 1px 3px rgba(0,0,0,0.05)`
    },
    h2: {
      "padding": `0.3em 1.2em`,
      "font-size": `1.3em`,
      "border-radius": `8px 24px 8px 24px`,
      "box-shadow": `0 2px 6px rgba(0,0,0,0.06)`
    },
    h3: {
      "padding-left": `12px`,
      "font-size": `1.2em`,
      "border-radius": `6px`,
      "line-height": `2.4em`,
      "border-left": `4px solid var(--md-primary-color)`,
      "border-right": `1px solid color-mix(in srgb, var(--md-primary-color) 10%, transparent)`,
      "border-bottom": `1px solid color-mix(in srgb, var(--md-primary-color) 10%, transparent)`,
      "border-top": `1px solid color-mix(in srgb, var(--md-primary-color) 10%, transparent)`,
      "background": `color-mix(in srgb, var(--md-primary-color) 8%, transparent)`
    },
    h4: {
      "font-size": `1.1em`,
      "border-radius": `6px`
    },
    h5: {
      "border-radius": `6px`
    },
    h6: {
      "border-radius": `6px`
    },
    blockquote: {
      "font-style": `italic`,
      "padding": `1em 1em 1em 2em`,
      "color": `rgba(0,0,0,0.6)`,
      "border-bottom": `0.2px solid rgba(0, 0, 0, 0.04)`,
      "border-top": `0.2px solid rgba(0, 0, 0, 0.04)`,
      "border-right": `0.2px solid rgba(0, 0, 0, 0.04)`
    },
    blockquote_note: {
      "font-style": `italic`
    },
    blockquote_tip: {
      "font-style": `italic`
    },
    blockquote_info: {
      "font-style": `italic`
    },
    blockquote_important: {
      "font-style": `italic`
    },
    blockquote_warning: {
      "font-style": `italic`
    },
    blockquote_caution: {
      "font-style": `italic`
    },
    blockquote_title: {},
    blockquote_title_note: {},
    blockquote_title_tip: {},
    blockquote_title_info: {},
    blockquote_title_important: {},
    blockquote_title_warning: {},
    blockquote_title_caution: {},
    blockquote_p_note: {},
    blockquote_p_tip: {},
    blockquote_p_info: {},
    blockquote_p_important: {},
    blockquote_p_warning: {},
    blockquote_p_caution: {},
    code_pre: {
      border: `1px solid rgba(0, 0, 0, 0.04)`
    },
    code: {
      "font-family": `'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace`
    },
    image: {
      "border-radius": `8px`,
      "border": `1px solid rgba(0, 0, 0, 0.04)`
    },
    ol: {
      "padding-left": `1.5em`
    },
    ul: {
      "list-style": `none`,
      "padding-left": `1.5em`
    },
    hr: {
      height: `1px`,
      border: `none`,
      margin: `2em 0`,
      background: `linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.1), rgba(0,0,0,0))`
    }
  },
  inline: {
    listitem: {
      margin: `0.5em 8px`
    }
  }
});
var themeMap = {
  default: defaultTheme,
  grace: graceTheme,
  simple: simpleTheme
};
var themeOptions = [
  {
    label: `\u7ECF\u5178`,
    value: `default`,
    desc: ``
  },
  {
    label: `\u4F18\u96C5`,
    value: `grace`,
    desc: `@brzhang`
  },
  {
    label: `\u7B80\u6D01`,
    value: `simple`,
    desc: `@okooo5km`
  }
];

// geek-black.theme.mjs
var sans = '"Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif';
var quoteSans = '-apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif';
var accent = "rgb(239, 112, 96)";
var overrides = {
  base: {
    "--md-primary-color": "#212122",
    color: "#000000"
  },
  // Match the reference's plain, numbered code blocks (no macOS traffic lights).
  renderOptions: {
    isMacCodeBlock: false,
    isShowLineNumber: true
  },
  block: {
    container: {
      padding: "30px",
      "box-sizing": "border-box"
    },
    p: {
      "box-sizing": "border-box",
      margin: "10px 0",
      "margin-bottom": "16px",
      padding: "8px 0",
      "font-family": sans,
      "font-size": "15px",
      "text-align": "start",
      "white-space": "normal",
      "text-size-adjust": "auto",
      "line-height": "1.75em",
      "letter-spacing": "normal",
      color: "#000000"
    },
    h1: {
      display: "block",
      margin: "-0.46em 0 0.1em",
      padding: "0",
      "border-bottom": "2px solid rgb(198, 196, 196)",
      "box-sizing": "border-box",
      "text-align": "start",
      "font-size": "13px"
    },
    h1_content: {
      "padding-top": "5px",
      "padding-bottom": "5px",
      color: "rgb(160, 160, 160)",
      "font-size": "13px",
      "line-height": "2",
      "box-sizing": "border-box"
    },
    h2: {
      display: "block",
      margin: "10px auto",
      padding: "0",
      height: "40px",
      background: "none",
      "background-color": "rgb(251, 251, 251)",
      "border-bottom": "1px solid rgb(246, 246, 246)",
      overflow: "hidden",
      "box-sizing": "border-box",
      "text-align": "start",
      "font-size": "16px",
      color: "#000000"
    },
    h2_content: {
      "margin-left": "-10px",
      display: "inline-block",
      width: "auto",
      height: "40px",
      "background-color": "rgb(33, 33, 34)",
      "border-bottom-right-radius": "100px",
      color: "rgb(255, 255, 255)",
      "padding-right": "30px",
      "padding-left": "30px",
      "line-height": "40px",
      "font-size": "16px"
    },
    h3: {
      display: "block",
      margin: "20px auto 5px",
      padding: "0",
      "border-left": "none",
      "border-top": "1px solid rgb(221, 221, 221)",
      "box-sizing": "border-box",
      color: "#000000"
    },
    h3_content: {
      "margin-top": "-1px",
      padding: "6px 5px 0",
      "font-size": "17px",
      "border-top": "2px solid rgb(33, 33, 34)",
      display: "inline-block",
      "line-height": "1.1"
    },
    h4: {
      display: "block",
      margin: "10px auto -1px",
      padding: "0",
      "border-top": "1px solid rgb(221, 221, 221)",
      "box-sizing": "border-box",
      color: "#000000"
    },
    h4_content: {
      "margin-top": "-1px",
      padding: "6px 5px 0",
      "font-size": "16px",
      "border-top": "2px solid rgb(33, 33, 34)",
      display: "inline-block",
      "line-height": "1.1"
    },
    blockquote: {
      "border-left": "4px solid rgb(221, 221, 221)",
      "border-radius": "0",
      background: "#f4f4f4",
      margin: "1.2em 0",
      padding: "10px 1em",
      color: "rgb(119, 119, 119)",
      quotes: "none"
    },
    blockquote_p: {
      margin: "0",
      padding: "8px 0",
      "font-size": "15px",
      "font-family": quoteSans,
      color: "rgb(119, 119, 119)",
      "line-height": "1.75em",
      "letter-spacing": "normal"
    },
    code: {
      "font-size": "14px"
    },
    code_pre: {
      margin: "16px 0",
      background: "#f8f8f8",
      border: "1px solid #eeeeee",
      "border-radius": "0",
      "font-size": "13px"
    },
    hr: {
      border: "none",
      "border-top": "1px solid #000000",
      height: "0",
      margin: "10px 0",
      transform: "none",
      "-webkit-transform": "none"
    }
  },
  inline: {
    listitem: {
      "font-size": "15px",
      "font-family": sans,
      color: "#000000"
    },
    link: { color: accent, "border-bottom": `1px solid ${accent}` },
    wx_link: { color: accent, "border-bottom": `1px solid ${accent}` },
    codespan: { color: accent },
    // In particular, bold text inside the black h2 ribbon must remain white.
    strong: { color: "inherit" },
    footnote: { color: "#ff3502" }
  }
};
function deepMerge(base, over) {
  if (base === null || over === null || typeof base !== "object" || typeof over !== "object") return over;
  const out = { ...base };
  for (const [key, value] of Object.entries(over)) {
    out[key] = key in out ? deepMerge(base[key], value) : value;
  }
  return out;
}
function registerGeekBlack(themeMap2, themeOptions2) {
  themeMap2["geek-black"] = deepMerge(themeMap2.default, overrides);
  if (!themeOptions2.some((option) => option.value === "geek-black")) {
    themeOptions2.push({ label: "\u6781\u5BA2\u9ED1", value: "geek-black", desc: "" });
  }
}

// entry.mjs
registerGeekBlack(themeMap, themeOptions);
export {
  MDKatex,
  createSyntaxPattern,
  customCssWithTemplate,
  customizeTheme,
  escapeHtml,
  getStyleString,
  initRenderer,
  initializeMermaid,
  markedAlert,
  markedFootnotes,
  markedMarkup,
  markedPlantUML,
  markedRuby,
  markedSlider,
  markedToc,
  modifyHtmlContent,
  postProcessHtml,
  renderMarkdown,
  resolveVariants,
  themeMap,
  themeOptions,
  ucfirst
};
/*! Bundled license information:

reading-time/lib/reading-time.js:
reading-time/lib/stream.js:
  (*!
   * reading-time
   * Copyright (c) Nicolas Gryman <ngryman@gmail.com>
   * MIT Licensed
   *)
*/
