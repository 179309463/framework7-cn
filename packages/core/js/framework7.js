/**
 * Framework7 5.8.1
 * Full featured mobile HTML framework for building iOS & Android apps
 * https://framework7.io/
 *
 * Copyright 2014-2020 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: May 15, 2020
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Framework7 = factory());
}(this, (function () { 'use strict';

  /**
   * Template7 1.4.2
   * Mobile-first HTML template engine
   * 
   * http://www.idangero.us/template7/
   * 
   * Copyright 2019, Vladimir Kharlampidi
   * The iDangero.us
   * http://www.idangero.us/
   * 
   * Licensed under MIT
   * 
   * Released on: June 14, 2019
   */

  var t7ctx;
  if (typeof window !== 'undefined') {
    t7ctx = window;
  } else if (typeof global !== 'undefined') {
    t7ctx = global;
  } else {
    t7ctx = undefined;
  }

  var Template7Context = t7ctx;

  var Template7Utils = {
    quoteSingleRexExp: new RegExp('\'', 'g'),
    quoteDoubleRexExp: new RegExp('"', 'g'),
    isFunction: function isFunction(func) {
      return typeof func === 'function';
    },
    escape: function escape(string) {
      if ( string === void 0 ) string = '';

      return string
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
    helperToSlices: function helperToSlices(string) {
      var quoteDoubleRexExp = Template7Utils.quoteDoubleRexExp;
      var quoteSingleRexExp = Template7Utils.quoteSingleRexExp;
      var helperParts = string.replace(/[{}#}]/g, '').trim().split(' ');
      var slices = [];
      var shiftIndex;
      var i;
      var j;
      for (i = 0; i < helperParts.length; i += 1) {
        var part = helperParts[i];
        var blockQuoteRegExp = (void 0);
        var openingQuote = (void 0);
        if (i === 0) { slices.push(part); }
        else if (part.indexOf('"') === 0 || part.indexOf('\'') === 0) {
          blockQuoteRegExp = part.indexOf('"') === 0 ? quoteDoubleRexExp : quoteSingleRexExp;
          openingQuote = part.indexOf('"') === 0 ? '"' : '\'';
          // Plain String
          if (part.match(blockQuoteRegExp).length === 2) {
            // One word string
            slices.push(part);
          } else {
            // Find closed Index
            shiftIndex = 0;
            for (j = i + 1; j < helperParts.length; j += 1) {
              part += " " + (helperParts[j]);
              if (helperParts[j].indexOf(openingQuote) >= 0) {
                shiftIndex = j;
                slices.push(part);
                break;
              }
            }
            if (shiftIndex) { i = shiftIndex; }
          }
        } else if (part.indexOf('=') > 0) {
          // Hash
          var hashParts = part.split('=');
          var hashName = hashParts[0];
          var hashContent = hashParts[1];
          if (!blockQuoteRegExp) {
            blockQuoteRegExp = hashContent.indexOf('"') === 0 ? quoteDoubleRexExp : quoteSingleRexExp;
            openingQuote = hashContent.indexOf('"') === 0 ? '"' : '\'';
          }
          if (hashContent.match(blockQuoteRegExp).length !== 2) {
            shiftIndex = 0;
            for (j = i + 1; j < helperParts.length; j += 1) {
              hashContent += " " + (helperParts[j]);
              if (helperParts[j].indexOf(openingQuote) >= 0) {
                shiftIndex = j;
                break;
              }
            }
            if (shiftIndex) { i = shiftIndex; }
          }
          var hash = [hashName, hashContent.replace(blockQuoteRegExp, '')];
          slices.push(hash);
        } else {
          // Plain variable
          slices.push(part);
        }
      }
      return slices;
    },
    stringToBlocks: function stringToBlocks(string) {
      var blocks = [];
      var i;
      var j;
      if (!string) { return []; }
      var stringBlocks = string.split(/({{[^{^}]*}})/);
      for (i = 0; i < stringBlocks.length; i += 1) {
        var block = stringBlocks[i];
        if (block === '') { continue; }
        if (block.indexOf('{{') < 0) {
          blocks.push({
            type: 'plain',
            content: block,
          });
        } else {
          if (block.indexOf('{/') >= 0) {
            continue;
          }
          block = block
            .replace(/{{([#/])*([ ])*/, '{{$1')
            .replace(/([ ])*}}/, '}}');
          if (block.indexOf('{#') < 0 && block.indexOf(' ') < 0 && block.indexOf('else') < 0) {
            // Simple variable
            blocks.push({
              type: 'variable',
              contextName: block.replace(/[{}]/g, ''),
            });
            continue;
          }
          // Helpers
          var helperSlices = Template7Utils.helperToSlices(block);
          var helperName = helperSlices[0];
          var isPartial = helperName === '>';
          var helperContext = [];
          var helperHash = {};
          for (j = 1; j < helperSlices.length; j += 1) {
            var slice = helperSlices[j];
            if (Array.isArray(slice)) {
              // Hash
              helperHash[slice[0]] = slice[1] === 'false' ? false : slice[1];
            } else {
              helperContext.push(slice);
            }
          }

          if (block.indexOf('{#') >= 0) {
            // Condition/Helper
            var helperContent = '';
            var elseContent = '';
            var toSkip = 0;
            var shiftIndex = (void 0);
            var foundClosed = false;
            var foundElse = false;
            var depth = 0;
            for (j = i + 1; j < stringBlocks.length; j += 1) {
              if (stringBlocks[j].indexOf('{{#') >= 0) {
                depth += 1;
              }
              if (stringBlocks[j].indexOf('{{/') >= 0) {
                depth -= 1;
              }
              if (stringBlocks[j].indexOf(("{{#" + helperName)) >= 0) {
                helperContent += stringBlocks[j];
                if (foundElse) { elseContent += stringBlocks[j]; }
                toSkip += 1;
              } else if (stringBlocks[j].indexOf(("{{/" + helperName)) >= 0) {
                if (toSkip > 0) {
                  toSkip -= 1;
                  helperContent += stringBlocks[j];
                  if (foundElse) { elseContent += stringBlocks[j]; }
                } else {
                  shiftIndex = j;
                  foundClosed = true;
                  break;
                }
              } else if (stringBlocks[j].indexOf('else') >= 0 && depth === 0) {
                foundElse = true;
              } else {
                if (!foundElse) { helperContent += stringBlocks[j]; }
                if (foundElse) { elseContent += stringBlocks[j]; }
              }
            }
            if (foundClosed) {
              if (shiftIndex) { i = shiftIndex; }
              if (helperName === 'raw') {
                blocks.push({
                  type: 'plain',
                  content: helperContent,
                });
              } else {
                blocks.push({
                  type: 'helper',
                  helperName: helperName,
                  contextName: helperContext,
                  content: helperContent,
                  inverseContent: elseContent,
                  hash: helperHash,
                });
              }
            }
          } else if (block.indexOf(' ') > 0) {
            if (isPartial) {
              helperName = '_partial';
              if (helperContext[0]) {
                if (helperContext[0].indexOf('[') === 0) { helperContext[0] = helperContext[0].replace(/[[\]]/g, ''); }
                else { helperContext[0] = "\"" + (helperContext[0].replace(/"|'/g, '')) + "\""; }
              }
            }
            blocks.push({
              type: 'helper',
              helperName: helperName,
              contextName: helperContext,
              hash: helperHash,
            });
          }
        }
      }
      return blocks;
    },
    parseJsVariable: function parseJsVariable(expression, replace, object) {
      return expression.split(/([+ \-*/^()&=|<>!%:?])/g).reduce(function (arr, part) {
        if (!part) {
          return arr;
        }
        if (part.indexOf(replace) < 0) {
          arr.push(part);
          return arr;
        }
        if (!object) {
          arr.push(JSON.stringify(''));
          return arr;
        }

        var variable = object;
        if (part.indexOf((replace + ".")) >= 0) {
          part.split((replace + "."))[1].split('.').forEach(function (partName) {
            if (partName in variable) { variable = variable[partName]; }
            else { variable = undefined; }
          });
        }
        if (
          (typeof variable === 'string')
          || Array.isArray(variable)
          || (variable.constructor && variable.constructor === Object)
        ) {
          variable = JSON.stringify(variable);
        }
        if (variable === undefined) { variable = 'undefined'; }

        arr.push(variable);
        return arr;
      }, []).join('');

    },
    parseJsParents: function parseJsParents(expression, parents) {
      return expression.split(/([+ \-*^()&=|<>!%:?])/g).reduce(function (arr, part) {
        if (!part) {
          return arr;
        }

        if (part.indexOf('../') < 0) {
          arr.push(part);
          return arr;
        }

        if (!parents || parents.length === 0) {
          arr.push(JSON.stringify(''));
          return arr;
        }

        var levelsUp = part.split('../').length - 1;
        var parentData = levelsUp > parents.length ? parents[parents.length - 1] : parents[levelsUp - 1];

        var variable = parentData;
        var parentPart = part.replace(/..\//g, '');
        parentPart.split('.').forEach(function (partName) {
          if (typeof variable[partName] !== 'undefined') { variable = variable[partName]; }
          else { variable = 'undefined'; }
        });
        if (variable === false || variable === true) {
          arr.push(JSON.stringify(variable));
          return arr;
        }
        if (variable === null || variable === 'undefined') {
          arr.push(JSON.stringify(''));
          return arr;
        }
        arr.push(JSON.stringify(variable));
        return arr;
      }, []).join('');
    },
    getCompileVar: function getCompileVar(name, ctx, data) {
      if ( data === void 0 ) data = 'data_1';

      var variable = ctx;
      var parts;
      var levelsUp = 0;
      var newDepth;
      if (name.indexOf('../') === 0) {
        levelsUp = name.split('../').length - 1;
        newDepth = variable.split('_')[1] - levelsUp;
        variable = "ctx_" + (newDepth >= 1 ? newDepth : 1);
        parts = name.split('../')[levelsUp].split('.');
      } else if (name.indexOf('@global') === 0) {
        variable = 'Template7.global';
        parts = name.split('@global.')[1].split('.');
      } else if (name.indexOf('@root') === 0) {
        variable = 'root';
        parts = name.split('@root.')[1].split('.');
      } else {
        parts = name.split('.');
      }
      for (var i = 0; i < parts.length; i += 1) {
        var part = parts[i];
        if (part.indexOf('@') === 0) {
          var dataLevel = data.split('_')[1];
          if (levelsUp > 0) {
            dataLevel = newDepth;
          }
          if (i > 0) {
            variable += "[(data_" + dataLevel + " && data_" + dataLevel + "." + (part.replace('@', '')) + ")]";
          } else {
            variable = "(data_" + dataLevel + " && data_" + dataLevel + "." + (part.replace('@', '')) + ")";
          }
        } else if (Number.isFinite ? Number.isFinite(part) : Template7Context.isFinite(part)) {
          variable += "[" + part + "]";
        } else if (part === 'this' || part.indexOf('this.') >= 0 || part.indexOf('this[') >= 0 || part.indexOf('this(') >= 0) {
          variable = part.replace('this', ctx);
        } else {
          variable += "." + part;
        }
      }
      return variable;
    },
    getCompiledArguments: function getCompiledArguments(contextArray, ctx, data) {
      var arr = [];
      for (var i = 0; i < contextArray.length; i += 1) {
        if (/^['"]/.test(contextArray[i])) { arr.push(contextArray[i]); }
        else if (/^(true|false|\d+)$/.test(contextArray[i])) { arr.push(contextArray[i]); }
        else {
          arr.push(Template7Utils.getCompileVar(contextArray[i], ctx, data));
        }
      }

      return arr.join(', ');
    },
  };

  /* eslint no-eval: "off" */

  var Template7Helpers = {
    _partial: function _partial(partialName, options) {
      var ctx = this;
      var p = Template7Class.partials[partialName];
      if (!p || (p && !p.template)) { return ''; }
      if (!p.compiled) {
        p.compiled = new Template7Class(p.template).compile();
      }
      Object.keys(options.hash).forEach(function (hashName) {
        ctx[hashName] = options.hash[hashName];
      });
      return p.compiled(ctx, options.data, options.root);
    },
    escape: function escape(context) {
      if (typeof context === 'undefined' || context === null) { return ''; }
      if (typeof context !== 'string') {
        throw new Error('Template7: Passed context to "escape" helper should be a string');
      }
      return Template7Utils.escape(context);
    },
    if: function if$1(context, options) {
      var ctx = context;
      if (Template7Utils.isFunction(ctx)) { ctx = ctx.call(this); }
      if (ctx) {
        return options.fn(this, options.data);
      }

      return options.inverse(this, options.data);
    },
    unless: function unless(context, options) {
      var ctx = context;
      if (Template7Utils.isFunction(ctx)) { ctx = ctx.call(this); }
      if (!ctx) {
        return options.fn(this, options.data);
      }

      return options.inverse(this, options.data);
    },
    each: function each(context, options) {
      var ctx = context;
      var ret = '';
      var i = 0;
      if (Template7Utils.isFunction(ctx)) { ctx = ctx.call(this); }
      if (Array.isArray(ctx)) {
        if (options.hash.reverse) {
          ctx = ctx.reverse();
        }
        for (i = 0; i < ctx.length; i += 1) {
          ret += options.fn(ctx[i], { first: i === 0, last: i === ctx.length - 1, index: i });
        }
        if (options.hash.reverse) {
          ctx = ctx.reverse();
        }
      } else {
        // eslint-disable-next-line
        for (var key in ctx) {
          i += 1;
          ret += options.fn(ctx[key], { key: key });
        }
      }
      if (i > 0) { return ret; }
      return options.inverse(this);
    },
    with: function with$1(context, options) {
      var ctx = context;
      if (Template7Utils.isFunction(ctx)) { ctx = context.call(this); }
      return options.fn(ctx);
    },
    join: function join(context, options) {
      var ctx = context;
      if (Template7Utils.isFunction(ctx)) { ctx = ctx.call(this); }
      return ctx.join(options.hash.delimiter || options.hash.delimeter);
    },
    js: function js(expression, options) {
      var data = options.data;
      var func;
      var execute = expression;
      ('index first last key').split(' ').forEach(function (prop) {
        if (typeof data[prop] !== 'undefined') {
          var re1 = new RegExp(("this.@" + prop), 'g');
          var re2 = new RegExp(("@" + prop), 'g');
          execute = execute
            .replace(re1, JSON.stringify(data[prop]))
            .replace(re2, JSON.stringify(data[prop]));
        }
      });
      if (options.root && execute.indexOf('@root') >= 0) {
        execute = Template7Utils.parseJsVariable(execute, '@root', options.root);
      }
      if (execute.indexOf('@global') >= 0) {
        execute = Template7Utils.parseJsVariable(execute, '@global', Template7Context.Template7.global);
      }
      if (execute.indexOf('../') >= 0) {
        execute = Template7Utils.parseJsParents(execute, options.parents);
      }
      if (execute.indexOf('return') >= 0) {
        func = "(function(){" + execute + "})";
      } else {
        func = "(function(){return (" + execute + ")})";
      }
      return eval(func).call(this);
    },
    js_if: function js_if(expression, options) {
      var data = options.data;
      var func;
      var execute = expression;
      ('index first last key').split(' ').forEach(function (prop) {
        if (typeof data[prop] !== 'undefined') {
          var re1 = new RegExp(("this.@" + prop), 'g');
          var re2 = new RegExp(("@" + prop), 'g');
          execute = execute
            .replace(re1, JSON.stringify(data[prop]))
            .replace(re2, JSON.stringify(data[prop]));
        }
      });
      if (options.root && execute.indexOf('@root') >= 0) {
        execute = Template7Utils.parseJsVariable(execute, '@root', options.root);
      }
      if (execute.indexOf('@global') >= 0) {
        execute = Template7Utils.parseJsVariable(execute, '@global', Template7Context.Template7.global);
      }
      if (execute.indexOf('../') >= 0) {
        execute = Template7Utils.parseJsParents(execute, options.parents);
      }
      if (execute.indexOf('return') >= 0) {
        func = "(function(){" + execute + "})";
      } else {
        func = "(function(){return (" + execute + ")})";
      }
      var condition = eval(func).call(this);
      if (condition) {
        return options.fn(this, options.data);
      }

      return options.inverse(this, options.data);
    },
  };
  Template7Helpers.js_compare = Template7Helpers.js_if;

  var Template7Options = {};
  var Template7Partials = {};

  var Template7Class = function Template7Class(template) {
    var t = this;
    t.template = template;
  };

  var staticAccessors = { options: { configurable: true },partials: { configurable: true },helpers: { configurable: true } };
  Template7Class.prototype.compile = function compile (template, depth) {
      if ( template === void 0 ) template = this.template;
      if ( depth === void 0 ) depth = 1;

    var t = this;
    if (t.compiled) { return t.compiled; }

    if (typeof template !== 'string') {
      throw new Error('Template7: Template must be a string');
    }
    var stringToBlocks = Template7Utils.stringToBlocks;
      var getCompileVar = Template7Utils.getCompileVar;
      var getCompiledArguments = Template7Utils.getCompiledArguments;

    var blocks = stringToBlocks(template);
    var ctx = "ctx_" + depth;
    var data = "data_" + depth;
    if (blocks.length === 0) {
      return function empty() { return ''; };
    }

    function getCompileFn(block, newDepth) {
      if (block.content) { return t.compile(block.content, newDepth); }
      return function empty() { return ''; };
    }
    function getCompileInverse(block, newDepth) {
      if (block.inverseContent) { return t.compile(block.inverseContent, newDepth); }
      return function empty() { return ''; };
    }

    var resultString = '';
    if (depth === 1) {
      resultString += "(function (" + ctx + ", " + data + ", root) {\n";
    } else {
      resultString += "(function (" + ctx + ", " + data + ") {\n";
    }
    if (depth === 1) {
      resultString += 'function isArray(arr){return Array.isArray(arr);}\n';
      resultString += 'function isFunction(func){return (typeof func === \'function\');}\n';
      resultString += 'function c(val, ctx) {if (typeof val !== "undefined" && val !== null) {if (isFunction(val)) {return val.call(ctx);} else return val;} else return "";}\n';
      resultString += 'root = root || ctx_1 || {};\n';
    }
    resultString += 'var r = \'\';\n';
    var i;
    for (i = 0; i < blocks.length; i += 1) {
      var block = blocks[i];
      // Plain block
      if (block.type === 'plain') {
        // eslint-disable-next-line
        resultString += "r +='" + ((block.content).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/'/g, '\\' + '\'')) + "';";
        continue;
      }
      var variable = (void 0);
      var compiledArguments = (void 0);
      // Variable block
      if (block.type === 'variable') {
        variable = getCompileVar(block.contextName, ctx, data);
        resultString += "r += c(" + variable + ", " + ctx + ");";
      }
      // Helpers block
      if (block.type === 'helper') {
        var parents = (void 0);
        if (ctx !== 'ctx_1') {
          var level = ctx.split('_')[1];
          var parentsString = "ctx_" + (level - 1);
          for (var j = level - 2; j >= 1; j -= 1) {
            parentsString += ", ctx_" + j;
          }
          parents = "[" + parentsString + "]";
        } else {
          parents = "[" + ctx + "]";
        }
        var dynamicHelper = (void 0);
        if (block.helperName.indexOf('[') === 0) {
          block.helperName = getCompileVar(block.helperName.replace(/[[\]]/g, ''), ctx, data);
          dynamicHelper = true;
        }
        if (dynamicHelper || block.helperName in Template7Helpers) {
          compiledArguments = getCompiledArguments(block.contextName, ctx, data);
          resultString += "r += (Template7Helpers" + (dynamicHelper ? ("[" + (block.helperName) + "]") : ("." + (block.helperName))) + ").call(" + ctx + ", " + (compiledArguments && ((compiledArguments + ", "))) + "{hash:" + (JSON.stringify(block.hash)) + ", data: " + data + " || {}, fn: " + (getCompileFn(block, depth + 1)) + ", inverse: " + (getCompileInverse(block, depth + 1)) + ", root: root, parents: " + parents + "});";
        } else if (block.contextName.length > 0) {
          throw new Error(("Template7: Missing helper: \"" + (block.helperName) + "\""));
        } else {
          variable = getCompileVar(block.helperName, ctx, data);
          resultString += "if (" + variable + ") {";
          resultString += "if (isArray(" + variable + ")) {";
          resultString += "r += (Template7Helpers.each).call(" + ctx + ", " + variable + ", {hash:" + (JSON.stringify(block.hash)) + ", data: " + data + " || {}, fn: " + (getCompileFn(block, depth + 1)) + ", inverse: " + (getCompileInverse(block, depth + 1)) + ", root: root, parents: " + parents + "});";
          resultString += '}else {';
          resultString += "r += (Template7Helpers.with).call(" + ctx + ", " + variable + ", {hash:" + (JSON.stringify(block.hash)) + ", data: " + data + " || {}, fn: " + (getCompileFn(block, depth + 1)) + ", inverse: " + (getCompileInverse(block, depth + 1)) + ", root: root, parents: " + parents + "});";
          resultString += '}}';
        }
      }
    }
    resultString += '\nreturn r;})';

    if (depth === 1) {
      // eslint-disable-next-line
      t.compiled = eval(resultString);
      return t.compiled;
    }
    return resultString;
  };
  staticAccessors.options.get = function () {
    return Template7Options;
  };
  staticAccessors.partials.get = function () {
    return Template7Partials;
  };
  staticAccessors.helpers.get = function () {
    return Template7Helpers;
  };

  Object.defineProperties( Template7Class, staticAccessors );

  function Template7() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var template = args[0];
    var data = args[1];
    if (args.length === 2) {
      var instance = new Template7Class(template);
      var rendered = instance.compile()(data);
      instance = null;
      return (rendered);
    }
    return new Template7Class(template);
  }
  Template7.registerHelper = function registerHelper(name, fn) {
    Template7Class.helpers[name] = fn;
  };
  Template7.unregisterHelper = function unregisterHelper(name) {
    Template7Class.helpers[name] = undefined;
    delete Template7Class.helpers[name];
  };
  Template7.registerPartial = function registerPartial(name, template) {
    Template7Class.partials[name] = { template: template };
  };
  Template7.unregisterPartial = function unregisterPartial(name) {
    if (Template7Class.partials[name]) {
      Template7Class.partials[name] = undefined;
      delete Template7Class.partials[name];
    }
  };
  Template7.compile = function compile(template, options) {
    var instance = new Template7Class(template, options);
    return instance.compile();
  };

  Template7.options = Template7Class.options;
  Template7.helpers = Template7Class.helpers;
  Template7.partials = Template7Class.partials;

  /**
   * SSR Window 1.0.1
   * Better handling for window object in SSR environment
   * https://github.com/nolimits4web/ssr-window
   *
   * Copyright 2018, Vladimir Kharlampidi
   *
   * Licensed under MIT
   *
   * Released on: July 18, 2018
   */
  var doc = (typeof document === 'undefined') ? {
    body: {},
    addEventListener: function addEventListener() {},
    removeEventListener: function removeEventListener() {},
    activeElement: {
      blur: function blur() {},
      nodeName: '',
    },
    querySelector: function querySelector() {
      return null;
    },
    querySelectorAll: function querySelectorAll() {
      return [];
    },
    getElementById: function getElementById() {
      return null;
    },
    createEvent: function createEvent() {
      return {
        initEvent: function initEvent() {},
      };
    },
    createElement: function createElement() {
      return {
        children: [],
        childNodes: [],
        style: {},
        setAttribute: function setAttribute() {},
        getElementsByTagName: function getElementsByTagName() {
          return [];
        },
      };
    },
    location: { hash: '' },
  } : document; // eslint-disable-line

  var win = (typeof window === 'undefined') ? {
    document: doc,
    navigator: {
      userAgent: '',
    },
    location: {},
    history: {},
    CustomEvent: function CustomEvent() {
      return this;
    },
    addEventListener: function addEventListener() {},
    removeEventListener: function removeEventListener() {},
    getComputedStyle: function getComputedStyle() {
      return {
        getPropertyValue: function getPropertyValue() {
          return '';
        },
      };
    },
    Image: function Image() {},
    Date: function Date() {},
    screen: {},
    setTimeout: function setTimeout() {},
    clearTimeout: function clearTimeout() {},
  } : window; // eslint-disable-line

  /**
   * Dom7 2.1.3
   * Minimalistic JavaScript library for DOM manipulation, with a jQuery-compatible API
   * http://framework7.io/docs/dom.html
   *
   * Copyright 2019, Vladimir Kharlampidi
   * The iDangero.us
   * http://www.idangero.us/
   *
   * Licensed under MIT
   *
   * Released on: February 11, 2019
   */

  var Dom7 = function Dom7(arr) {
    var self = this;
    // Create array-like object
    for (var i = 0; i < arr.length; i += 1) {
      self[i] = arr[i];
    }
    self.length = arr.length;
    // Return collection with methods
    return this;
  };

  function $(selector, context) {
    var arr = [];
    var i = 0;
    if (selector && !context) {
      if (selector instanceof Dom7) {
        return selector;
      }
    }
    if (selector) {
        // String
      if (typeof selector === 'string') {
        var els;
        var tempParent;
        var html = selector.trim();
        if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
          var toCreate = 'div';
          if (html.indexOf('<li') === 0) { toCreate = 'ul'; }
          if (html.indexOf('<tr') === 0) { toCreate = 'tbody'; }
          if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) { toCreate = 'tr'; }
          if (html.indexOf('<tbody') === 0) { toCreate = 'table'; }
          if (html.indexOf('<option') === 0) { toCreate = 'select'; }
          tempParent = doc.createElement(toCreate);
          tempParent.innerHTML = html;
          for (i = 0; i < tempParent.childNodes.length; i += 1) {
            arr.push(tempParent.childNodes[i]);
          }
        } else {
          if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
            // Pure ID selector
            els = [doc.getElementById(selector.trim().split('#')[1])];
          } else {
            // Other selectors
            els = (context || doc).querySelectorAll(selector.trim());
          }
          for (i = 0; i < els.length; i += 1) {
            if (els[i]) { arr.push(els[i]); }
          }
        }
      } else if (selector.nodeType || selector === win || selector === doc) {
        // Node/element
        arr.push(selector);
      } else if (selector.length > 0 && selector[0].nodeType) {
        // Array of elements or instance of Dom
        for (i = 0; i < selector.length; i += 1) {
          arr.push(selector[i]);
        }
      }
    }
    return new Dom7(arr);
  }

  $.fn = Dom7.prototype;
  $.Class = Dom7;
  $.Dom7 = Dom7;

  function unique(arr) {
    var uniqueArray = [];
    for (var i = 0; i < arr.length; i += 1) {
      if (uniqueArray.indexOf(arr[i]) === -1) { uniqueArray.push(arr[i]); }
    }
    return uniqueArray;
  }
  function toCamelCase(string) {
    return string.toLowerCase().replace(/-(.)/g, function (match, group1) { return group1.toUpperCase(); });
  }

  function requestAnimationFrame(callback) {
    if (win.requestAnimationFrame) { return win.requestAnimationFrame(callback); }
    else if (win.webkitRequestAnimationFrame) { return win.webkitRequestAnimationFrame(callback); }
    return win.setTimeout(callback, 1000 / 60);
  }
  function cancelAnimationFrame(id) {
    if (win.cancelAnimationFrame) { return win.cancelAnimationFrame(id); }
    else if (win.webkitCancelAnimationFrame) { return win.webkitCancelAnimationFrame(id); }
    return win.clearTimeout(id);
  }

  // Classes and attributes
  function addClass(className) {
    if (typeof className === 'undefined') {
      return this;
    }
    var classes = className.split(' ');
    for (var i = 0; i < classes.length; i += 1) {
      for (var j = 0; j < this.length; j += 1) {
        if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') { this[j].classList.add(classes[i]); }
      }
    }
    return this;
  }
  function removeClass(className) {
    var classes = className.split(' ');
    for (var i = 0; i < classes.length; i += 1) {
      for (var j = 0; j < this.length; j += 1) {
        if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') { this[j].classList.remove(classes[i]); }
      }
    }
    return this;
  }
  function hasClass(className) {
    if (!this[0]) { return false; }
    return this[0].classList.contains(className);
  }
  function toggleClass(className) {
    var classes = className.split(' ');
    for (var i = 0; i < classes.length; i += 1) {
      for (var j = 0; j < this.length; j += 1) {
        if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') { this[j].classList.toggle(classes[i]); }
      }
    }
    return this;
  }
  function attr(attrs, value) {
    var arguments$1 = arguments;

    if (arguments.length === 1 && typeof attrs === 'string') {
      // Get attr
      if (this[0]) { return this[0].getAttribute(attrs); }
      return undefined;
    }

    // Set attrs
    for (var i = 0; i < this.length; i += 1) {
      if (arguments$1.length === 2) {
        // String
        this[i].setAttribute(attrs, value);
      } else {
        // Object
        // eslint-disable-next-line
        for (var attrName in attrs) {
          this[i][attrName] = attrs[attrName];
          this[i].setAttribute(attrName, attrs[attrName]);
        }
      }
    }
    return this;
  }
  // eslint-disable-next-line
  function removeAttr(attr) {
    for (var i = 0; i < this.length; i += 1) {
      this[i].removeAttribute(attr);
    }
    return this;
  }
  // eslint-disable-next-line
  function prop(props, value) {
    var arguments$1 = arguments;

    if (arguments.length === 1 && typeof props === 'string') {
      // Get prop
      if (this[0]) { return this[0][props]; }
    } else {
      // Set props
      for (var i = 0; i < this.length; i += 1) {
        if (arguments$1.length === 2) {
          // String
          this[i][props] = value;
        } else {
          // Object
          // eslint-disable-next-line
          for (var propName in props) {
            this[i][propName] = props[propName];
          }
        }
      }
      return this;
    }
  }
  function data(key, value) {
    var el;
    if (typeof value === 'undefined') {
      el = this[0];
      // Get value
      if (el) {
        if (el.dom7ElementDataStorage && (key in el.dom7ElementDataStorage)) {
          return el.dom7ElementDataStorage[key];
        }

        var dataKey = el.getAttribute(("data-" + key));
        if (dataKey) {
          return dataKey;
        }
        return undefined;
      }
      return undefined;
    }

    // Set value
    for (var i = 0; i < this.length; i += 1) {
      el = this[i];
      if (!el.dom7ElementDataStorage) { el.dom7ElementDataStorage = {}; }
      el.dom7ElementDataStorage[key] = value;
    }
    return this;
  }
  function removeData(key) {
    for (var i = 0; i < this.length; i += 1) {
      var el = this[i];
      if (el.dom7ElementDataStorage && el.dom7ElementDataStorage[key]) {
        el.dom7ElementDataStorage[key] = null;
        delete el.dom7ElementDataStorage[key];
      }
    }
  }
  function dataset() {
    var el = this[0];
    if (!el) { return undefined; }
    var dataset = {}; // eslint-disable-line
    if (el.dataset) {
      // eslint-disable-next-line
      for (var dataKey in el.dataset) {
        dataset[dataKey] = el.dataset[dataKey];
      }
    } else {
      for (var i = 0; i < el.attributes.length; i += 1) {
        // eslint-disable-next-line
        var attr = el.attributes[i];
        if (attr.name.indexOf('data-') >= 0) {
          dataset[toCamelCase(attr.name.split('data-')[1])] = attr.value;
        }
      }
    }
    // eslint-disable-next-line
    for (var key in dataset) {
      if (dataset[key] === 'false') { dataset[key] = false; }
      else if (dataset[key] === 'true') { dataset[key] = true; }
      else if (parseFloat(dataset[key]) === dataset[key] * 1) { dataset[key] *= 1; }
    }
    return dataset;
  }
  function val(value) {
    var dom = this;
    if (typeof value === 'undefined') {
      if (dom[0]) {
        if (dom[0].multiple && dom[0].nodeName.toLowerCase() === 'select') {
          var values = [];
          for (var i = 0; i < dom[0].selectedOptions.length; i += 1) {
            values.push(dom[0].selectedOptions[i].value);
          }
          return values;
        }
        return dom[0].value;
      }
      return undefined;
    }

    for (var i$1 = 0; i$1 < dom.length; i$1 += 1) {
      var el = dom[i$1];
      if (Array.isArray(value) && el.multiple && el.nodeName.toLowerCase() === 'select') {
        for (var j = 0; j < el.options.length; j += 1) {
          el.options[j].selected = value.indexOf(el.options[j].value) >= 0;
        }
      } else {
        el.value = value;
      }
    }
    return dom;
  }
  // Transforms
  // eslint-disable-next-line
  function transform(transform) {
    for (var i = 0; i < this.length; i += 1) {
      var elStyle = this[i].style;
      elStyle.webkitTransform = transform;
      elStyle.transform = transform;
    }
    return this;
  }
  function transition(duration) {
    if (typeof duration !== 'string') {
      duration = duration + "ms"; // eslint-disable-line
    }
    for (var i = 0; i < this.length; i += 1) {
      var elStyle = this[i].style;
      elStyle.webkitTransitionDuration = duration;
      elStyle.transitionDuration = duration;
    }
    return this;
  }
  // Events
  function on() {
    var assign;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    var eventType = args[0];
    var targetSelector = args[1];
    var listener = args[2];
    var capture = args[3];
    if (typeof args[1] === 'function') {
      (assign = args, eventType = assign[0], listener = assign[1], capture = assign[2]);
      targetSelector = undefined;
    }
    if (!capture) { capture = false; }

    function handleLiveEvent(e) {
      var target = e.target;
      if (!target) { return; }
      var eventData = e.target.dom7EventData || [];
      if (eventData.indexOf(e) < 0) {
        eventData.unshift(e);
      }
      if ($(target).is(targetSelector)) { listener.apply(target, eventData); }
      else {
        var parents = $(target).parents(); // eslint-disable-line
        for (var k = 0; k < parents.length; k += 1) {
          if ($(parents[k]).is(targetSelector)) { listener.apply(parents[k], eventData); }
        }
      }
    }
    function handleEvent(e) {
      var eventData = e && e.target ? e.target.dom7EventData || [] : [];
      if (eventData.indexOf(e) < 0) {
        eventData.unshift(e);
      }
      listener.apply(this, eventData);
    }
    var events = eventType.split(' ');
    var j;
    for (var i = 0; i < this.length; i += 1) {
      var el = this[i];
      if (!targetSelector) {
        for (j = 0; j < events.length; j += 1) {
          var event = events[j];
          if (!el.dom7Listeners) { el.dom7Listeners = {}; }
          if (!el.dom7Listeners[event]) { el.dom7Listeners[event] = []; }
          el.dom7Listeners[event].push({
            listener: listener,
            proxyListener: handleEvent,
          });
          el.addEventListener(event, handleEvent, capture);
        }
      } else {
        // Live events
        for (j = 0; j < events.length; j += 1) {
          var event$1 = events[j];
          if (!el.dom7LiveListeners) { el.dom7LiveListeners = {}; }
          if (!el.dom7LiveListeners[event$1]) { el.dom7LiveListeners[event$1] = []; }
          el.dom7LiveListeners[event$1].push({
            listener: listener,
            proxyListener: handleLiveEvent,
          });
          el.addEventListener(event$1, handleLiveEvent, capture);
        }
      }
    }
    return this;
  }
  function off() {
    var assign;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    var eventType = args[0];
    var targetSelector = args[1];
    var listener = args[2];
    var capture = args[3];
    if (typeof args[1] === 'function') {
      (assign = args, eventType = assign[0], listener = assign[1], capture = assign[2]);
      targetSelector = undefined;
    }
    if (!capture) { capture = false; }

    var events = eventType.split(' ');
    for (var i = 0; i < events.length; i += 1) {
      var event = events[i];
      for (var j = 0; j < this.length; j += 1) {
        var el = this[j];
        var handlers = (void 0);
        if (!targetSelector && el.dom7Listeners) {
          handlers = el.dom7Listeners[event];
        } else if (targetSelector && el.dom7LiveListeners) {
          handlers = el.dom7LiveListeners[event];
        }
        if (handlers && handlers.length) {
          for (var k = handlers.length - 1; k >= 0; k -= 1) {
            var handler = handlers[k];
            if (listener && handler.listener === listener) {
              el.removeEventListener(event, handler.proxyListener, capture);
              handlers.splice(k, 1);
            } else if (listener && handler.listener && handler.listener.dom7proxy && handler.listener.dom7proxy === listener) {
              el.removeEventListener(event, handler.proxyListener, capture);
              handlers.splice(k, 1);
            } else if (!listener) {
              el.removeEventListener(event, handler.proxyListener, capture);
              handlers.splice(k, 1);
            }
          }
        }
      }
    }
    return this;
  }
  function once() {
    var assign;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    var dom = this;
    var eventName = args[0];
    var targetSelector = args[1];
    var listener = args[2];
    var capture = args[3];
    if (typeof args[1] === 'function') {
      (assign = args, eventName = assign[0], listener = assign[1], capture = assign[2]);
      targetSelector = undefined;
    }
    function onceHandler() {
      var eventArgs = [], len = arguments.length;
      while ( len-- ) eventArgs[ len ] = arguments[ len ];

      listener.apply(this, eventArgs);
      dom.off(eventName, targetSelector, onceHandler, capture);
      if (onceHandler.dom7proxy) {
        delete onceHandler.dom7proxy;
      }
    }
    onceHandler.dom7proxy = listener;
    return dom.on(eventName, targetSelector, onceHandler, capture);
  }
  function trigger() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var events = args[0].split(' ');
    var eventData = args[1];
    for (var i = 0; i < events.length; i += 1) {
      var event = events[i];
      for (var j = 0; j < this.length; j += 1) {
        var el = this[j];
        var evt = (void 0);
        try {
          evt = new win.CustomEvent(event, {
            detail: eventData,
            bubbles: true,
            cancelable: true,
          });
        } catch (e) {
          evt = doc.createEvent('Event');
          evt.initEvent(event, true, true);
          evt.detail = eventData;
        }
        // eslint-disable-next-line
        el.dom7EventData = args.filter(function (data, dataIndex) { return dataIndex > 0; });
        el.dispatchEvent(evt);
        el.dom7EventData = [];
        delete el.dom7EventData;
      }
    }
    return this;
  }
  function transitionEnd(callback) {
    var events = ['webkitTransitionEnd', 'transitionend'];
    var dom = this;
    var i;
    function fireCallBack(e) {
      /* jshint validthis:true */
      if (e.target !== this) { return; }
      callback.call(this, e);
      for (i = 0; i < events.length; i += 1) {
        dom.off(events[i], fireCallBack);
      }
    }
    if (callback) {
      for (i = 0; i < events.length; i += 1) {
        dom.on(events[i], fireCallBack);
      }
    }
    return this;
  }
  function animationEnd(callback) {
    var events = ['webkitAnimationEnd', 'animationend'];
    var dom = this;
    var i;
    function fireCallBack(e) {
      if (e.target !== this) { return; }
      callback.call(this, e);
      for (i = 0; i < events.length; i += 1) {
        dom.off(events[i], fireCallBack);
      }
    }
    if (callback) {
      for (i = 0; i < events.length; i += 1) {
        dom.on(events[i], fireCallBack);
      }
    }
    return this;
  }
  // Sizing/Styles
  function width() {
    if (this[0] === win) {
      return win.innerWidth;
    }

    if (this.length > 0) {
      return parseFloat(this.css('width'));
    }

    return null;
  }
  function outerWidth(includeMargins) {
    if (this.length > 0) {
      if (includeMargins) {
        // eslint-disable-next-line
        var styles = this.styles();
        return this[0].offsetWidth + parseFloat(styles.getPropertyValue('margin-right')) + parseFloat(styles.getPropertyValue('margin-left'));
      }
      return this[0].offsetWidth;
    }
    return null;
  }
  function height() {
    if (this[0] === win) {
      return win.innerHeight;
    }

    if (this.length > 0) {
      return parseFloat(this.css('height'));
    }

    return null;
  }
  function outerHeight(includeMargins) {
    if (this.length > 0) {
      if (includeMargins) {
        // eslint-disable-next-line
        var styles = this.styles();
        return this[0].offsetHeight + parseFloat(styles.getPropertyValue('margin-top')) + parseFloat(styles.getPropertyValue('margin-bottom'));
      }
      return this[0].offsetHeight;
    }
    return null;
  }
  function offset() {
    if (this.length > 0) {
      var el = this[0];
      var box = el.getBoundingClientRect();
      var body = doc.body;
      var clientTop = el.clientTop || body.clientTop || 0;
      var clientLeft = el.clientLeft || body.clientLeft || 0;
      var scrollTop = el === win ? win.scrollY : el.scrollTop;
      var scrollLeft = el === win ? win.scrollX : el.scrollLeft;
      return {
        top: (box.top + scrollTop) - clientTop,
        left: (box.left + scrollLeft) - clientLeft,
      };
    }

    return null;
  }
  function hide() {
    for (var i = 0; i < this.length; i += 1) {
      this[i].style.display = 'none';
    }
    return this;
  }
  function show() {
    for (var i = 0; i < this.length; i += 1) {
      var el = this[i];
      if (el.style.display === 'none') {
        el.style.display = '';
      }
      if (win.getComputedStyle(el, null).getPropertyValue('display') === 'none') {
        // Still not visible
        el.style.display = 'block';
      }
    }
    return this;
  }
  function styles() {
    if (this[0]) { return win.getComputedStyle(this[0], null); }
    return {};
  }
  function css(props, value) {
    var i;
    if (arguments.length === 1) {
      if (typeof props === 'string') {
        if (this[0]) { return win.getComputedStyle(this[0], null).getPropertyValue(props); }
      } else {
        for (i = 0; i < this.length; i += 1) {
          // eslint-disable-next-line
          for (var prop in props) {
            this[i].style[prop] = props[prop];
          }
        }
        return this;
      }
    }
    if (arguments.length === 2 && typeof props === 'string') {
      for (i = 0; i < this.length; i += 1) {
        this[i].style[props] = value;
      }
      return this;
    }
    return this;
  }

  // Dom manipulation
  function toArray() {
    var arr = [];
    for (var i = 0; i < this.length; i += 1) {
      arr.push(this[i]);
    }
    return arr;
  }
  // Iterate over the collection passing elements to `callback`
  function each(callback) {
    // Don't bother continuing without a callback
    if (!callback) { return this; }
    // Iterate over the current collection
    for (var i = 0; i < this.length; i += 1) {
      // If the callback returns false
      if (callback.call(this[i], i, this[i]) === false) {
        // End the loop early
        return this;
      }
    }
    // Return `this` to allow chained DOM operations
    return this;
  }
  function forEach(callback) {
    // Don't bother continuing without a callback
    if (!callback) { return this; }
    // Iterate over the current collection
    for (var i = 0; i < this.length; i += 1) {
      // If the callback returns false
      if (callback.call(this[i], this[i], i) === false) {
        // End the loop early
        return this;
      }
    }
    // Return `this` to allow chained DOM operations
    return this;
  }
  function filter(callback) {
    var matchedItems = [];
    var dom = this;
    for (var i = 0; i < dom.length; i += 1) {
      if (callback.call(dom[i], i, dom[i])) { matchedItems.push(dom[i]); }
    }
    return new Dom7(matchedItems);
  }
  function map(callback) {
    var modifiedItems = [];
    var dom = this;
    for (var i = 0; i < dom.length; i += 1) {
      modifiedItems.push(callback.call(dom[i], i, dom[i]));
    }
    return new Dom7(modifiedItems);
  }
  // eslint-disable-next-line
  function html(html) {
    if (typeof html === 'undefined') {
      return this[0] ? this[0].innerHTML : undefined;
    }

    for (var i = 0; i < this.length; i += 1) {
      this[i].innerHTML = html;
    }
    return this;
  }
  // eslint-disable-next-line
  function text(text) {
    if (typeof text === 'undefined') {
      if (this[0]) {
        return this[0].textContent.trim();
      }
      return null;
    }

    for (var i = 0; i < this.length; i += 1) {
      this[i].textContent = text;
    }
    return this;
  }
  function is(selector) {
    var el = this[0];
    var compareWith;
    var i;
    if (!el || typeof selector === 'undefined') { return false; }
    if (typeof selector === 'string') {
      if (el.matches) { return el.matches(selector); }
      else if (el.webkitMatchesSelector) { return el.webkitMatchesSelector(selector); }
      else if (el.msMatchesSelector) { return el.msMatchesSelector(selector); }

      compareWith = $(selector);
      for (i = 0; i < compareWith.length; i += 1) {
        if (compareWith[i] === el) { return true; }
      }
      return false;
    } else if (selector === doc) { return el === doc; }
    else if (selector === win) { return el === win; }

    if (selector.nodeType || selector instanceof Dom7) {
      compareWith = selector.nodeType ? [selector] : selector;
      for (i = 0; i < compareWith.length; i += 1) {
        if (compareWith[i] === el) { return true; }
      }
      return false;
    }
    return false;
  }
  function indexOf(el) {
    for (var i = 0; i < this.length; i += 1) {
      if (this[i] === el) { return i; }
    }
    return -1;
  }
  function index() {
    var child = this[0];
    var i;
    if (child) {
      i = 0;
      // eslint-disable-next-line
      while ((child = child.previousSibling) !== null) {
        if (child.nodeType === 1) { i += 1; }
      }
      return i;
    }
    return undefined;
  }
  // eslint-disable-next-line
  function eq(index) {
    if (typeof index === 'undefined') { return this; }
    var length = this.length;
    var returnIndex;
    if (index > length - 1) {
      return new Dom7([]);
    }
    if (index < 0) {
      returnIndex = length + index;
      if (returnIndex < 0) { return new Dom7([]); }
      return new Dom7([this[returnIndex]]);
    }
    return new Dom7([this[index]]);
  }
  function append() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var newChild;

    for (var k = 0; k < args.length; k += 1) {
      newChild = args[k];
      for (var i = 0; i < this.length; i += 1) {
        if (typeof newChild === 'string') {
          var tempDiv = doc.createElement('div');
          tempDiv.innerHTML = newChild;
          while (tempDiv.firstChild) {
            this[i].appendChild(tempDiv.firstChild);
          }
        } else if (newChild instanceof Dom7) {
          for (var j = 0; j < newChild.length; j += 1) {
            this[i].appendChild(newChild[j]);
          }
        } else {
          this[i].appendChild(newChild);
        }
      }
    }

    return this;
  }
  // eslint-disable-next-line
  function appendTo(parent) {
    $(parent).append(this);
    return this;
  }
  function prepend(newChild) {
    var i;
    var j;
    for (i = 0; i < this.length; i += 1) {
      if (typeof newChild === 'string') {
        var tempDiv = doc.createElement('div');
        tempDiv.innerHTML = newChild;
        for (j = tempDiv.childNodes.length - 1; j >= 0; j -= 1) {
          this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
        }
      } else if (newChild instanceof Dom7) {
        for (j = 0; j < newChild.length; j += 1) {
          this[i].insertBefore(newChild[j], this[i].childNodes[0]);
        }
      } else {
        this[i].insertBefore(newChild, this[i].childNodes[0]);
      }
    }
    return this;
  }
  // eslint-disable-next-line
  function prependTo(parent) {
    $(parent).prepend(this);
    return this;
  }
  function insertBefore(selector) {
    var before = $(selector);
    for (var i = 0; i < this.length; i += 1) {
      if (before.length === 1) {
        before[0].parentNode.insertBefore(this[i], before[0]);
      } else if (before.length > 1) {
        for (var j = 0; j < before.length; j += 1) {
          before[j].parentNode.insertBefore(this[i].cloneNode(true), before[j]);
        }
      }
    }
  }
  function insertAfter(selector) {
    var after = $(selector);
    for (var i = 0; i < this.length; i += 1) {
      if (after.length === 1) {
        after[0].parentNode.insertBefore(this[i], after[0].nextSibling);
      } else if (after.length > 1) {
        for (var j = 0; j < after.length; j += 1) {
          after[j].parentNode.insertBefore(this[i].cloneNode(true), after[j].nextSibling);
        }
      }
    }
  }
  function next(selector) {
    if (this.length > 0) {
      if (selector) {
        if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) {
          return new Dom7([this[0].nextElementSibling]);
        }
        return new Dom7([]);
      }

      if (this[0].nextElementSibling) { return new Dom7([this[0].nextElementSibling]); }
      return new Dom7([]);
    }
    return new Dom7([]);
  }
  function nextAll(selector) {
    var nextEls = [];
    var el = this[0];
    if (!el) { return new Dom7([]); }
    while (el.nextElementSibling) {
      var next = el.nextElementSibling; // eslint-disable-line
      if (selector) {
        if ($(next).is(selector)) { nextEls.push(next); }
      } else { nextEls.push(next); }
      el = next;
    }
    return new Dom7(nextEls);
  }
  function prev(selector) {
    if (this.length > 0) {
      var el = this[0];
      if (selector) {
        if (el.previousElementSibling && $(el.previousElementSibling).is(selector)) {
          return new Dom7([el.previousElementSibling]);
        }
        return new Dom7([]);
      }

      if (el.previousElementSibling) { return new Dom7([el.previousElementSibling]); }
      return new Dom7([]);
    }
    return new Dom7([]);
  }
  function prevAll(selector) {
    var prevEls = [];
    var el = this[0];
    if (!el) { return new Dom7([]); }
    while (el.previousElementSibling) {
      var prev = el.previousElementSibling; // eslint-disable-line
      if (selector) {
        if ($(prev).is(selector)) { prevEls.push(prev); }
      } else { prevEls.push(prev); }
      el = prev;
    }
    return new Dom7(prevEls);
  }
  function siblings(selector) {
    return this.nextAll(selector).add(this.prevAll(selector));
  }
  function parent(selector) {
    var parents = []; // eslint-disable-line
    for (var i = 0; i < this.length; i += 1) {
      if (this[i].parentNode !== null) {
        if (selector) {
          if ($(this[i].parentNode).is(selector)) { parents.push(this[i].parentNode); }
        } else {
          parents.push(this[i].parentNode);
        }
      }
    }
    return $(unique(parents));
  }
  function parents(selector) {
    var parents = []; // eslint-disable-line
    for (var i = 0; i < this.length; i += 1) {
      var parent = this[i].parentNode; // eslint-disable-line
      while (parent) {
        if (selector) {
          if ($(parent).is(selector)) { parents.push(parent); }
        } else {
          parents.push(parent);
        }
        parent = parent.parentNode;
      }
    }
    return $(unique(parents));
  }
  function closest(selector) {
    var closest = this; // eslint-disable-line
    if (typeof selector === 'undefined') {
      return new Dom7([]);
    }
    if (!closest.is(selector)) {
      closest = closest.parents(selector).eq(0);
    }
    return closest;
  }
  function find(selector) {
    var foundElements = [];
    for (var i = 0; i < this.length; i += 1) {
      var found = this[i].querySelectorAll(selector);
      for (var j = 0; j < found.length; j += 1) {
        foundElements.push(found[j]);
      }
    }
    return new Dom7(foundElements);
  }
  function children(selector) {
    var children = []; // eslint-disable-line
    for (var i = 0; i < this.length; i += 1) {
      var childNodes = this[i].childNodes;

      for (var j = 0; j < childNodes.length; j += 1) {
        if (!selector) {
          if (childNodes[j].nodeType === 1) { children.push(childNodes[j]); }
        } else if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector)) {
          children.push(childNodes[j]);
        }
      }
    }
    return new Dom7(unique(children));
  }
  function remove() {
    for (var i = 0; i < this.length; i += 1) {
      if (this[i].parentNode) { this[i].parentNode.removeChild(this[i]); }
    }
    return this;
  }
  function detach() {
    return this.remove();
  }
  function add() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var dom = this;
    var i;
    var j;
    for (i = 0; i < args.length; i += 1) {
      var toAdd = $(args[i]);
      for (j = 0; j < toAdd.length; j += 1) {
        dom[dom.length] = toAdd[j];
        dom.length += 1;
      }
    }
    return dom;
  }
  function empty() {
    for (var i = 0; i < this.length; i += 1) {
      var el = this[i];
      if (el.nodeType === 1) {
        for (var j = 0; j < el.childNodes.length; j += 1) {
          if (el.childNodes[j].parentNode) {
            el.childNodes[j].parentNode.removeChild(el.childNodes[j]);
          }
        }
        el.textContent = '';
      }
    }
    return this;
  }

  var Methods = /*#__PURE__*/Object.freeze({
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass,
    toggleClass: toggleClass,
    attr: attr,
    removeAttr: removeAttr,
    prop: prop,
    data: data,
    removeData: removeData,
    dataset: dataset,
    val: val,
    transform: transform,
    transition: transition,
    on: on,
    off: off,
    once: once,
    trigger: trigger,
    transitionEnd: transitionEnd,
    animationEnd: animationEnd,
    width: width,
    outerWidth: outerWidth,
    height: height,
    outerHeight: outerHeight,
    offset: offset,
    hide: hide,
    show: show,
    styles: styles,
    css: css,
    toArray: toArray,
    each: each,
    forEach: forEach,
    filter: filter,
    map: map,
    html: html,
    text: text,
    is: is,
    indexOf: indexOf,
    index: index,
    eq: eq,
    append: append,
    appendTo: appendTo,
    prepend: prepend,
    prependTo: prependTo,
    insertBefore: insertBefore,
    insertAfter: insertAfter,
    next: next,
    nextAll: nextAll,
    prev: prev,
    prevAll: prevAll,
    siblings: siblings,
    parent: parent,
    parents: parents,
    closest: closest,
    find: find,
    children: children,
    remove: remove,
    detach: detach,
    add: add,
    empty: empty
  });

  function scrollTo() {
    var assign;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    var left = args[0];
    var top = args[1];
    var duration = args[2];
    var easing = args[3];
    var callback = args[4];
    if (args.length === 4 && typeof easing === 'function') {
      callback = easing;
      (assign = args, left = assign[0], top = assign[1], duration = assign[2], callback = assign[3], easing = assign[4]);
    }
    if (typeof easing === 'undefined') { easing = 'swing'; }

    return this.each(function animate() {
      var el = this;
      var currentTop;
      var currentLeft;
      var maxTop;
      var maxLeft;
      var newTop;
      var newLeft;
      var scrollTop; // eslint-disable-line
      var scrollLeft; // eslint-disable-line
      var animateTop = top > 0 || top === 0;
      var animateLeft = left > 0 || left === 0;
      if (typeof easing === 'undefined') {
        easing = 'swing';
      }
      if (animateTop) {
        currentTop = el.scrollTop;
        if (!duration) {
          el.scrollTop = top;
        }
      }
      if (animateLeft) {
        currentLeft = el.scrollLeft;
        if (!duration) {
          el.scrollLeft = left;
        }
      }
      if (!duration) { return; }
      if (animateTop) {
        maxTop = el.scrollHeight - el.offsetHeight;
        newTop = Math.max(Math.min(top, maxTop), 0);
      }
      if (animateLeft) {
        maxLeft = el.scrollWidth - el.offsetWidth;
        newLeft = Math.max(Math.min(left, maxLeft), 0);
      }
      var startTime = null;
      if (animateTop && newTop === currentTop) { animateTop = false; }
      if (animateLeft && newLeft === currentLeft) { animateLeft = false; }
      function render(time) {
        if ( time === void 0 ) time = new Date().getTime();

        if (startTime === null) {
          startTime = time;
        }
        var progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
        var easeProgress = easing === 'linear' ? progress : (0.5 - (Math.cos(progress * Math.PI) / 2));
        var done;
        if (animateTop) { scrollTop = currentTop + (easeProgress * (newTop - currentTop)); }
        if (animateLeft) { scrollLeft = currentLeft + (easeProgress * (newLeft - currentLeft)); }
        if (animateTop && newTop > currentTop && scrollTop >= newTop) {
          el.scrollTop = newTop;
          done = true;
        }
        if (animateTop && newTop < currentTop && scrollTop <= newTop) {
          el.scrollTop = newTop;
          done = true;
        }
        if (animateLeft && newLeft > currentLeft && scrollLeft >= newLeft) {
          el.scrollLeft = newLeft;
          done = true;
        }
        if (animateLeft && newLeft < currentLeft && scrollLeft <= newLeft) {
          el.scrollLeft = newLeft;
          done = true;
        }

        if (done) {
          if (callback) { callback(); }
          return;
        }
        if (animateTop) { el.scrollTop = scrollTop; }
        if (animateLeft) { el.scrollLeft = scrollLeft; }
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
    });
  }
  // scrollTop(top, duration, easing, callback) {
  function scrollTop() {
    var assign;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    var top = args[0];
    var duration = args[1];
    var easing = args[2];
    var callback = args[3];
    if (args.length === 3 && typeof easing === 'function') {
      (assign = args, top = assign[0], duration = assign[1], callback = assign[2], easing = assign[3]);
    }
    var dom = this;
    if (typeof top === 'undefined') {
      if (dom.length > 0) { return dom[0].scrollTop; }
      return null;
    }
    return dom.scrollTo(undefined, top, duration, easing, callback);
  }
  function scrollLeft() {
    var assign;

    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    var left = args[0];
    var duration = args[1];
    var easing = args[2];
    var callback = args[3];
    if (args.length === 3 && typeof easing === 'function') {
      (assign = args, left = assign[0], duration = assign[1], callback = assign[2], easing = assign[3]);
    }
    var dom = this;
    if (typeof left === 'undefined') {
      if (dom.length > 0) { return dom[0].scrollLeft; }
      return null;
    }
    return dom.scrollTo(left, undefined, duration, easing, callback);
  }

  var Scroll = /*#__PURE__*/Object.freeze({
    scrollTo: scrollTo,
    scrollTop: scrollTop,
    scrollLeft: scrollLeft
  });

  function animate(initialProps, initialParams) {
    var els = this;
    var a = {
      props: Object.assign({}, initialProps),
      params: Object.assign({
        duration: 300,
        easing: 'swing', // or 'linear'
        /* Callbacks
        begin(elements)
        complete(elements)
        progress(elements, complete, remaining, start, tweenValue)
        */
      }, initialParams),

      elements: els,
      animating: false,
      que: [],

      easingProgress: function easingProgress(easing, progress) {
        if (easing === 'swing') {
          return 0.5 - (Math.cos(progress * Math.PI) / 2);
        }
        if (typeof easing === 'function') {
          return easing(progress);
        }
        return progress;
      },
      stop: function stop() {
        if (a.frameId) {
          cancelAnimationFrame(a.frameId);
        }
        a.animating = false;
        a.elements.each(function (index, el) {
          var element = el;
          delete element.dom7AnimateInstance;
        });
        a.que = [];
      },
      done: function done(complete) {
        a.animating = false;
        a.elements.each(function (index, el) {
          var element = el;
          delete element.dom7AnimateInstance;
        });
        if (complete) { complete(els); }
        if (a.que.length > 0) {
          var que = a.que.shift();
          a.animate(que[0], que[1]);
        }
      },
      animate: function animate(props, params) {
        if (a.animating) {
          a.que.push([props, params]);
          return a;
        }
        var elements = [];

        // Define & Cache Initials & Units
        a.elements.each(function (index, el) {
          var initialFullValue;
          var initialValue;
          var unit;
          var finalValue;
          var finalFullValue;

          if (!el.dom7AnimateInstance) { a.elements[index].dom7AnimateInstance = a; }

          elements[index] = {
            container: el,
          };
          Object.keys(props).forEach(function (prop) {
            initialFullValue = win.getComputedStyle(el, null).getPropertyValue(prop).replace(',', '.');
            initialValue = parseFloat(initialFullValue);
            unit = initialFullValue.replace(initialValue, '');
            finalValue = parseFloat(props[prop]);
            finalFullValue = props[prop] + unit;
            elements[index][prop] = {
              initialFullValue: initialFullValue,
              initialValue: initialValue,
              unit: unit,
              finalValue: finalValue,
              finalFullValue: finalFullValue,
              currentValue: initialValue,
            };
          });
        });

        var startTime = null;
        var time;
        var elementsDone = 0;
        var propsDone = 0;
        var done;
        var began = false;

        a.animating = true;

        function render() {
          time = new Date().getTime();
          var progress;
          var easeProgress;
          // let el;
          if (!began) {
            began = true;
            if (params.begin) { params.begin(els); }
          }
          if (startTime === null) {
            startTime = time;
          }
          if (params.progress) {
            // eslint-disable-next-line
            params.progress(els, Math.max(Math.min((time - startTime) / params.duration, 1), 0), ((startTime + params.duration) - time < 0 ? 0 : (startTime + params.duration) - time), startTime);
          }

          elements.forEach(function (element) {
            var el = element;
            if (done || el.done) { return; }
            Object.keys(props).forEach(function (prop) {
              if (done || el.done) { return; }
              progress = Math.max(Math.min((time - startTime) / params.duration, 1), 0);
              easeProgress = a.easingProgress(params.easing, progress);
              var ref = el[prop];
              var initialValue = ref.initialValue;
              var finalValue = ref.finalValue;
              var unit = ref.unit;
              el[prop].currentValue = initialValue + (easeProgress * (finalValue - initialValue));
              var currentValue = el[prop].currentValue;

              if (
                (finalValue > initialValue && currentValue >= finalValue) ||
                (finalValue < initialValue && currentValue <= finalValue)) {
                el.container.style[prop] = finalValue + unit;
                propsDone += 1;
                if (propsDone === Object.keys(props).length) {
                  el.done = true;
                  elementsDone += 1;
                }
                if (elementsDone === elements.length) {
                  done = true;
                }
              }
              if (done) {
                a.done(params.complete);
                return;
              }
              el.container.style[prop] = currentValue + unit;
            });
          });
          if (done) { return; }
          // Then call
          a.frameId = requestAnimationFrame(render);
        }
        a.frameId = requestAnimationFrame(render);
        return a;
      },
    };

    if (a.elements.length === 0) {
      return els;
    }

    var animateInstance;
    for (var i = 0; i < a.elements.length; i += 1) {
      if (a.elements[i].dom7AnimateInstance) {
        animateInstance = a.elements[i].dom7AnimateInstance;
      } else { a.elements[i].dom7AnimateInstance = a; }
    }
    if (!animateInstance) {
      animateInstance = a;
    }

    if (initialProps === 'stop') {
      animateInstance.stop();
    } else {
      animateInstance.animate(a.props, a.params);
    }

    return els;
  }

  function stop() {
    var els = this;
    for (var i = 0; i < els.length; i += 1) {
      if (els[i].dom7AnimateInstance) {
        els[i].dom7AnimateInstance.stop();
      }
    }
  }

  var Animate = /*#__PURE__*/Object.freeze({
    animate: animate,
    stop: stop
  });

  var noTrigger = ('resize scroll').split(' ');
  function eventShortcut(name) {
    var ref;

    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
    if (typeof args[0] === 'undefined') {
      for (var i = 0; i < this.length; i += 1) {
        if (noTrigger.indexOf(name) < 0) {
          if (name in this[i]) { this[i][name](); }
          else {
            $(this[i]).trigger(name);
          }
        }
      }
      return this;
    }
    return (ref = this).on.apply(ref, [ name ].concat( args ));
  }

  function click() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'click' ].concat( args ));
  }
  function blur() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'blur' ].concat( args ));
  }
  function focus() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'focus' ].concat( args ));
  }
  function focusin() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'focusin' ].concat( args ));
  }
  function focusout() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'focusout' ].concat( args ));
  }
  function keyup() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'keyup' ].concat( args ));
  }
  function keydown() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'keydown' ].concat( args ));
  }
  function keypress() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'keypress' ].concat( args ));
  }
  function submit() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'submit' ].concat( args ));
  }
  function change() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'change' ].concat( args ));
  }
  function mousedown() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'mousedown' ].concat( args ));
  }
  function mousemove() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'mousemove' ].concat( args ));
  }
  function mouseup() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'mouseup' ].concat( args ));
  }
  function mouseenter() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'mouseenter' ].concat( args ));
  }
  function mouseleave() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'mouseleave' ].concat( args ));
  }
  function mouseout() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'mouseout' ].concat( args ));
  }
  function mouseover() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'mouseover' ].concat( args ));
  }
  function touchstart() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'touchstart' ].concat( args ));
  }
  function touchend() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'touchend' ].concat( args ));
  }
  function touchmove() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'touchmove' ].concat( args ));
  }
  function resize() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'resize' ].concat( args ));
  }
  function scroll() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return eventShortcut.bind(this).apply(void 0, [ 'scroll' ].concat( args ));
  }

  var eventShortcuts = /*#__PURE__*/Object.freeze({
    click: click,
    blur: blur,
    focus: focus,
    focusin: focusin,
    focusout: focusout,
    keyup: keyup,
    keydown: keydown,
    keypress: keypress,
    submit: submit,
    change: change,
    mousedown: mousedown,
    mousemove: mousemove,
    mouseup: mouseup,
    mouseenter: mouseenter,
    mouseleave: mouseleave,
    mouseout: mouseout,
    mouseover: mouseover,
    touchstart: touchstart,
    touchend: touchend,
    touchmove: touchmove,
    resize: resize,
    scroll: scroll
  });

  [Methods, Scroll, Animate, eventShortcuts].forEach(function (group) {
    Object.keys(group).forEach(function (methodName) {
      $.fn[methodName] = group[methodName];
    });
  });

  /* eslint no-control-regex: "off" */

  // Remove Diacritics
  var defaultDiacriticsRemovalap = [
    { base: 'A', letters: '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F' },
    { base: 'AA', letters: '\uA732' },
    { base: 'AE', letters: '\u00C6\u01FC\u01E2' },
    { base: 'AO', letters: '\uA734' },
    { base: 'AU', letters: '\uA736' },
    { base: 'AV', letters: '\uA738\uA73A' },
    { base: 'AY', letters: '\uA73C' },
    { base: 'B', letters: '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181' },
    { base: 'C', letters: '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E' },
    { base: 'D', letters: '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779' },
    { base: 'DZ', letters: '\u01F1\u01C4' },
    { base: 'Dz', letters: '\u01F2\u01C5' },
    { base: 'E', letters: '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E' },
    { base: 'F', letters: '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B' },
    { base: 'G', letters: '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E' },
    { base: 'H', letters: '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D' },
    { base: 'I', letters: '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197' },
    { base: 'J', letters: '\u004A\u24BF\uFF2A\u0134\u0248' },
    { base: 'K', letters: '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2' },
    { base: 'L', letters: '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780' },
    { base: 'LJ', letters: '\u01C7' },
    { base: 'Lj', letters: '\u01C8' },
    { base: 'M', letters: '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C' },
    { base: 'N', letters: '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4' },
    { base: 'NJ', letters: '\u01CA' },
    { base: 'Nj', letters: '\u01CB' },
    { base: 'O', letters: '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C' },
    { base: 'OI', letters: '\u01A2' },
    { base: 'OO', letters: '\uA74E' },
    { base: 'OU', letters: '\u0222' },
    { base: 'OE', letters: '\u008C\u0152' },
    { base: 'oe', letters: '\u009C\u0153' },
    { base: 'P', letters: '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754' },
    { base: 'Q', letters: '\u0051\u24C6\uFF31\uA756\uA758\u024A' },
    { base: 'R', letters: '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782' },
    { base: 'S', letters: '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784' },
    { base: 'T', letters: '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786' },
    { base: 'TZ', letters: '\uA728' },
    { base: 'U', letters: '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244' },
    { base: 'V', letters: '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245' },
    { base: 'VY', letters: '\uA760' },
    { base: 'W', letters: '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72' },
    { base: 'X', letters: '\u0058\u24CD\uFF38\u1E8A\u1E8C' },
    { base: 'Y', letters: '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE' },
    { base: 'Z', letters: '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762' },
    { base: 'a', letters: '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250' },
    { base: 'aa', letters: '\uA733' },
    { base: 'ae', letters: '\u00E6\u01FD\u01E3' },
    { base: 'ao', letters: '\uA735' },
    { base: 'au', letters: '\uA737' },
    { base: 'av', letters: '\uA739\uA73B' },
    { base: 'ay', letters: '\uA73D' },
    { base: 'b', letters: '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253' },
    { base: 'c', letters: '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184' },
    { base: 'd', letters: '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A' },
    { base: 'dz', letters: '\u01F3\u01C6' },
    { base: 'e', letters: '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD' },
    { base: 'f', letters: '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C' },
    { base: 'g', letters: '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F' },
    { base: 'h', letters: '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265' },
    { base: 'hv', letters: '\u0195' },
    { base: 'i', letters: '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131' },
    { base: 'j', letters: '\u006A\u24D9\uFF4A\u0135\u01F0\u0249' },
    { base: 'k', letters: '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3' },
    { base: 'l', letters: '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747' },
    { base: 'lj', letters: '\u01C9' },
    { base: 'm', letters: '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F' },
    { base: 'n', letters: '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5' },
    { base: 'nj', letters: '\u01CC' },
    { base: 'o', letters: '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275' },
    { base: 'oi', letters: '\u01A3' },
    { base: 'ou', letters: '\u0223' },
    { base: 'oo', letters: '\uA74F' },
    { base: 'p', letters: '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755' },
    { base: 'q', letters: '\u0071\u24E0\uFF51\u024B\uA757\uA759' },
    { base: 'r', letters: '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783' },
    { base: 's', letters: '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B' },
    { base: 't', letters: '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787' },
    { base: 'tz', letters: '\uA729' },
    { base: 'u', letters: '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289' },
    { base: 'v', letters: '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C' },
    { base: 'vy', letters: '\uA761' },
    { base: 'w', letters: '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73' },
    { base: 'x', letters: '\u0078\u24E7\uFF58\u1E8B\u1E8D' },
    { base: 'y', letters: '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF' },
    { base: 'z', letters: '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763' } ];

  var diacriticsMap = {};
  for (var i = 0; i < defaultDiacriticsRemovalap.length; i += 1) {
    var letters = defaultDiacriticsRemovalap[i].letters;
    for (var j = 0; j < letters.length; j += 1) {
      diacriticsMap[letters[j]] = defaultDiacriticsRemovalap[i].base;
    }
  }

  var uniqueNumber = 1;

  var Utils = {
    uniqueNumber: function uniqueNumber$1() {
      uniqueNumber += 1;
      return uniqueNumber;
    },
    id: function id(mask, map) {
      if ( mask === void 0 ) mask = 'xxxxxxxxxx';
      if ( map === void 0 ) map = '0123456789abcdef';

      var length = map.length;
      return mask.replace(/x/g, function () { return map[Math.floor((Math.random() * length))]; });
    },
    mdPreloaderContent: "\n    <span class=\"preloader-inner\">\n      <span class=\"preloader-inner-gap\"></span>\n      <span class=\"preloader-inner-left\">\n          <span class=\"preloader-inner-half-circle\"></span>\n      </span>\n      <span class=\"preloader-inner-right\">\n          <span class=\"preloader-inner-half-circle\"></span>\n      </span>\n    </span>\n  ".trim(),
    iosPreloaderContent: ("\n    <span class=\"preloader-inner\">\n      " + ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function () { return '<span class="preloader-inner-line"></span>'; }).join('')) + "\n    </span>\n  ").trim(),
    auroraPreloaderContent: "\n    <span class=\"preloader-inner\">\n      <span class=\"preloader-inner-circle\"></span>\n    </span>\n  ",
    eventNameToColonCase: function eventNameToColonCase(eventName) {
      var hasColon;
      return eventName.split('').map(function (char, index) {
        if (char.match(/[A-Z]/) && index !== 0 && !hasColon) {
          hasColon = true;
          return (":" + (char.toLowerCase()));
        }
        return char.toLowerCase();
      }).join('');
    },
    deleteProps: function deleteProps(obj) {
      var object = obj;
      Object.keys(object).forEach(function (key) {
        try {
          object[key] = null;
        } catch (e) {
          // no setter for object
        }
        try {
          delete object[key];
        } catch (e$1) {
          // something got wrong
        }
      });
    },
    nextTick: function nextTick(callback, delay) {
      if ( delay === void 0 ) delay = 0;

      return setTimeout(callback, delay);
    },
    nextFrame: function nextFrame(callback) {
      return Utils.requestAnimationFrame(function () {
        Utils.requestAnimationFrame(callback);
      });
    },
    now: function now() {
      return Date.now();
    },
    requestAnimationFrame: function requestAnimationFrame(callback) {
      return win.requestAnimationFrame(callback);
    },
    cancelAnimationFrame: function cancelAnimationFrame(id) {
      return win.cancelAnimationFrame(id);
    },
    removeDiacritics: function removeDiacritics(str) {
      return str.replace(/[^\u0000-\u007E]/g, function (a) { return diacriticsMap[a] || a; });
    },
    parseUrlQuery: function parseUrlQuery(url) {
      var query = {};
      var urlToParse = url || win.location.href;
      var i;
      var params;
      var param;
      var length;
      if (typeof urlToParse === 'string' && urlToParse.length) {
        urlToParse = urlToParse.indexOf('?') > -1 ? urlToParse.replace(/\S*\?/, '') : '';
        params = urlToParse.split('&').filter(function (paramsPart) { return paramsPart !== ''; });
        length = params.length;

        for (i = 0; i < length; i += 1) {
          param = params[i].replace(/#\S+/g, '').split('=');
          query[decodeURIComponent(param[0])] = typeof param[1] === 'undefined' ? undefined : decodeURIComponent(param.slice(1).join('=')) || '';
        }
      }
      return query;
    },
    getTranslate: function getTranslate(el, axis) {
      if ( axis === void 0 ) axis = 'x';

      var matrix;
      var curTransform;
      var transformMatrix;

      var curStyle = win.getComputedStyle(el, null);

      if (win.WebKitCSSMatrix) {
        curTransform = curStyle.transform || curStyle.webkitTransform;
        if (curTransform.split(',').length > 6) {
          curTransform = curTransform.split(', ').map(function (a) { return a.replace(',', '.'); }).join(', ');
        }
        // Some old versions of Webkit choke when 'none' is passed; pass
        // empty string instead in this case
        transformMatrix = new win.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
      } else {
        transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
        matrix = transformMatrix.toString().split(',');
      }

      if (axis === 'x') {
        // Latest Chrome and webkits Fix
        if (win.WebKitCSSMatrix) { curTransform = transformMatrix.m41; }
        // Crazy IE10 Matrix
        else if (matrix.length === 16) { curTransform = parseFloat(matrix[12]); }
        // Normal Browsers
        else { curTransform = parseFloat(matrix[4]); }
      }
      if (axis === 'y') {
        // Latest Chrome and webkits Fix
        if (win.WebKitCSSMatrix) { curTransform = transformMatrix.m42; }
        // Crazy IE10 Matrix
        else if (matrix.length === 16) { curTransform = parseFloat(matrix[13]); }
        // Normal Browsers
        else { curTransform = parseFloat(matrix[5]); }
      }
      return curTransform || 0;
    },
    serializeObject: function serializeObject(obj, parents) {
      if ( parents === void 0 ) parents = [];

      if (typeof obj === 'string') { return obj; }
      var resultArray = [];
      var separator = '&';
      var newParents;
      function varName(name) {
        if (parents.length > 0) {
          var parentParts = '';
          for (var j = 0; j < parents.length; j += 1) {
            if (j === 0) { parentParts += parents[j]; }
            else { parentParts += "[" + (encodeURIComponent(parents[j])) + "]"; }
          }
          return (parentParts + "[" + (encodeURIComponent(name)) + "]");
        }
        return encodeURIComponent(name);
      }
      function varValue(value) {
        return encodeURIComponent(value);
      }
      Object.keys(obj).forEach(function (prop) {
        var toPush;
        if (Array.isArray(obj[prop])) {
          toPush = [];
          for (var i = 0; i < obj[prop].length; i += 1) {
            if (!Array.isArray(obj[prop][i]) && typeof obj[prop][i] === 'object') {
              newParents = parents.slice();
              newParents.push(prop);
              newParents.push(String(i));
              toPush.push(Utils.serializeObject(obj[prop][i], newParents));
            } else {
              toPush.push(((varName(prop)) + "[]=" + (varValue(obj[prop][i]))));
            }
          }
          if (toPush.length > 0) { resultArray.push(toPush.join(separator)); }
        } else if (obj[prop] === null || obj[prop] === '') {
          resultArray.push(((varName(prop)) + "="));
        } else if (typeof obj[prop] === 'object') {
          // Object, convert to named array
          newParents = parents.slice();
          newParents.push(prop);
          toPush = Utils.serializeObject(obj[prop], newParents);
          if (toPush !== '') { resultArray.push(toPush); }
        } else if (typeof obj[prop] !== 'undefined' && obj[prop] !== '') {
          // Should be string or plain value
          resultArray.push(((varName(prop)) + "=" + (varValue(obj[prop]))));
        } else if (obj[prop] === '') { resultArray.push(varName(prop)); }
      });
      return resultArray.join(separator);
    },
    isObject: function isObject(o) {
      return typeof o === 'object' && o !== null && o.constructor && o.constructor === Object;
    },
    merge: function merge() {
      var args = [], len$1 = arguments.length;
      while ( len$1-- ) args[ len$1 ] = arguments[ len$1 ];

      var to = args[0];
      args.splice(0, 1);
      var from = args;

      for (var i = 0; i < from.length; i += 1) {
        var nextSource = args[i];
        if (nextSource !== undefined && nextSource !== null) {
          var keysArray = Object.keys(Object(nextSource));
          for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    extend: function extend() {
      var args = [], len$1 = arguments.length;
      while ( len$1-- ) args[ len$1 ] = arguments[ len$1 ];

      var deep = true;
      var to;
      var from;
      if (typeof args[0] === 'boolean') {
        deep = args[0];
        to = args[1];
        args.splice(0, 2);
        from = args;
      } else {
        to = args[0];
        args.splice(0, 1);
        from = args;
      }
      for (var i = 0; i < from.length; i += 1) {
        var nextSource = args[i];
        if (nextSource !== undefined && nextSource !== null) {
          var keysArray = Object.keys(Object(nextSource));
          for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              if (!deep) {
                to[nextKey] = nextSource[nextKey];
              } else if (Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
                Utils.extend(to[nextKey], nextSource[nextKey]);
              } else if (!Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
                to[nextKey] = {};
                Utils.extend(to[nextKey], nextSource[nextKey]);
              } else {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
      }
      return to;
    },
    colorHexToRgb: function colorHexToRgb(hex) {
      var h = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (m, r, g, b) { return r + r + g + g + b + b; });
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
      return result
        ? result.slice(1).map(function (n) { return parseInt(n, 16); })
        : null;
    },
    colorRgbToHex: function colorRgbToHex(r, g, b) {
      var result = [r, g, b].map(function (n) {
        var hex = n.toString(16);
        return hex.length === 1 ? ("0" + hex) : hex;
      }).join('');
      return ("#" + result);
    },
    colorRgbToHsl: function colorRgbToHsl(r, g, b) {
      r /= 255; // eslint-disable-line
      g /= 255; // eslint-disable-line
      b /= 255; // eslint-disable-line
      var max = Math.max(r, g, b);
      var min = Math.min(r, g, b);
      var d = max - min;
      var h;
      if (d === 0) { h = 0; }
      else if (max === r) { h = ((g - b) / d) % 6; }
      else if (max === g) { h = (b - r) / d + 2; }
      else if (max === b) { h = (r - g) / d + 4; }
      var l = (min + max) / 2;
      var s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
      if (h < 0) { h = 360 / 60 + h; }
      return [h * 60, s, l];
    },
    colorHslToRgb: function colorHslToRgb(h, s, l) {
      var c = (1 - Math.abs(2 * l - 1)) * s;
      var hp = h / 60;
      var x = c * (1 - Math.abs((hp % 2) - 1));
      var rgb1;
      if (Number.isNaN(h) || typeof h === 'undefined') {
        rgb1 = [0, 0, 0];
      } else if (hp <= 1) { rgb1 = [c, x, 0]; }
      else if (hp <= 2) { rgb1 = [x, c, 0]; }
      else if (hp <= 3) { rgb1 = [0, c, x]; }
      else if (hp <= 4) { rgb1 = [0, x, c]; }
      else if (hp <= 5) { rgb1 = [x, 0, c]; }
      else if (hp <= 6) { rgb1 = [c, 0, x]; }
      var m = l - (c / 2);
      return rgb1.map(function (n) { return Math.max(0, Math.min(255, Math.round(255 * (n + m)))); });
    },
    colorHsbToHsl: function colorHsbToHsl(h, s, b) {
      var HSL = {
        h: h,
        s: 0,
        l: 0,
      };
      var HSB = { h: h, s: s, b: b };

      HSL.l = (2 - HSB.s) * HSB.b / 2;
      HSL.s = HSL.l && HSL.l < 1 ? HSB.s * HSB.b / (HSL.l < 0.5 ? HSL.l * 2 : 2 - HSL.l * 2) : HSL.s;

      return [HSL.h, HSL.s, HSL.l];
    },
    colorHslToHsb: function colorHslToHsb(h, s, l) {
      var HSB = {
        h: h,
        s: 0,
        b: 0,
      };
      var HSL = { h: h, s: s, l: l };

      var t = HSL.s * (HSL.l < 0.5 ? HSL.l : 1 - HSL.l);
      HSB.b = HSL.l + t;
      HSB.s = HSL.l > 0 ? 2 * t / HSB.b : HSB.s;

      return [HSB.h, HSB.s, HSB.b];
    },
    colorThemeCSSProperties: function colorThemeCSSProperties() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var hex;
      var rgb;
      if (args.length === 1) {
        hex = args[0];
        rgb = Utils.colorHexToRgb(hex);
      } else if (args.length === 3) {
        rgb = args;
        hex = Utils.colorRgbToHex.apply(Utils, rgb);
      }
      if (!rgb) { return {}; }
      var hsl = Utils.colorRgbToHsl.apply(Utils, rgb);
      var hslShade = [hsl[0], hsl[1], Math.max(0, (hsl[2] - 0.08))];
      var hslTint = [hsl[0], hsl[1], Math.max(0, (hsl[2] + 0.08))];
      var shade = Utils.colorRgbToHex.apply(Utils, Utils.colorHslToRgb.apply(Utils, hslShade));
      var tint = Utils.colorRgbToHex.apply(Utils, Utils.colorHslToRgb.apply(Utils, hslTint));
      return {
        '--f7-theme-color': hex,
        '--f7-theme-color-rgb': rgb.join(', '),
        '--f7-theme-color-shade': shade,
        '--f7-theme-color-tint': tint,
      };
    },
  };

  var Support = (function Support() {
    return {
      touch: (function checkTouch() {
        return !!((win.navigator.maxTouchPoints > 0) || ('ontouchstart' in win) || (win.DocumentTouch && doc instanceof win.DocumentTouch));
      }()),

      pointerEvents: !!win.PointerEvent,

      observer: (function checkObserver() {
        return ('MutationObserver' in win || 'WebkitMutationObserver' in win);
      }()),

      passiveListener: (function checkPassiveListener() {
        var supportsPassive = false;
        try {
          var opts = Object.defineProperty({}, 'passive', {
            // eslint-disable-next-line
            get: function get() {
              supportsPassive = true;
            },
          });
          win.addEventListener('testPassiveListener', null, opts);
        } catch (e) {
          // No support
        }
        return supportsPassive;
      }()),

      gestures: (function checkGestures() {
        return 'ongesturestart' in win;
      }()),

      intersectionObserver: (function checkObserver() {
        return ('IntersectionObserver' in win);
      }()),
    };
  }());

  var Device = (function Device() {
    var platform = win.navigator.platform;
    var ua = win.navigator.userAgent;

    var device = {
      ios: false,
      android: false,
      androidChrome: false,
      desktop: false,
      iphone: false,
      ipod: false,
      ipad: false,
      edge: false,
      ie: false,
      firefox: false,
      macos: false,
      windows: false,
      cordova: !!(win.cordova || win.phonegap),
      phonegap: !!(win.cordova || win.phonegap),
      electron: false,
      nwjs: false,
    };

    var screenWidth = win.screen.width;
    var screenHeight = win.screen.height;

    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
    var iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
    var ie = ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0;
    var edge = ua.indexOf('Edge/') >= 0;
    var firefox = ua.indexOf('Gecko/') >= 0 && ua.indexOf('Firefox/') >= 0;
    var windows = platform === 'Win32';
    var electron = ua.toLowerCase().indexOf('electron') >= 0;
    var nwjs = typeof nw !== 'undefined' && typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.nw !== 'undefined';
    var macos = platform === 'MacIntel';

    // iPadOs 13 fix
    var iPadScreens = [
      '1024x1366',
      '1366x1024',
      '834x1194',
      '1194x834',
      '834x1112',
      '1112x834',
      '768x1024',
      '1024x768' ];
    if (!ipad
      && macos
      && Support.touch
      && iPadScreens.indexOf((screenWidth + "x" + screenHeight)) >= 0
    ) {
      ipad = ua.match(/(Version)\/([\d.]+)/);
      if (!ipad) { ipad = [0, 1, '13_0_0']; }
      macos = false;
    }

    device.ie = ie;
    device.edge = edge;
    device.firefox = firefox;

    // Android
    if (android && !windows) {
      device.os = 'android';
      device.osVersion = android[2];
      device.android = true;
      device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
    }
    if (ipad || iphone || ipod) {
      device.os = 'ios';
      device.ios = true;
    }
    // iOS
    if (iphone && !ipod) {
      device.osVersion = iphone[2].replace(/_/g, '.');
      device.iphone = true;
    }
    if (ipad) {
      device.osVersion = ipad[2].replace(/_/g, '.');
      device.ipad = true;
    }
    if (ipod) {
      device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
      device.ipod = true;
    }
    // iOS 8+ changed UA
    if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
      if (device.osVersion.split('.')[0] === '10') {
        device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
      }
    }

    // Webview
    device.webView = !!((iphone || ipad || ipod) && (ua.match(/.*AppleWebKit(?!.*Safari)/i) || win.navigator.standalone))
      || (win.matchMedia && win.matchMedia('(display-mode: standalone)').matches);
    device.webview = device.webView;
    device.standalone = device.webView;

    // Desktop
    device.desktop = !(device.ios || device.android) || electron || nwjs;
    if (device.desktop) {
      device.electron = electron;
      device.nwjs = nwjs;
      device.macos = macos;
      device.windows = windows;
      if (device.macos) {
        device.os = 'macos';
      }
      if (device.windows) {
        device.os = 'windows';
      }
    }

    // Pixel Ratio
    device.pixelRatio = win.devicePixelRatio || 1;

    // Color Scheme
    var DARK = '(prefers-color-scheme: dark)';
    var LIGHT = '(prefers-color-scheme: light)';
    device.prefersColorScheme = function prefersColorTheme() {
      var theme;
      if (win.matchMedia && win.matchMedia(LIGHT).matches) {
        theme = 'light';
      }
      if (win.matchMedia && win.matchMedia(DARK).matches) {
        theme = 'dark';
      }
      return theme;
    };

    // Export object
    return device;
  }());

  var EventsClass = function EventsClass(parents) {
    if ( parents === void 0 ) parents = [];

    var self = this;
    self.eventsParents = parents;
    self.eventsListeners = {};
  };

  EventsClass.prototype.on = function on (events, handler, priority) {
    var self = this;
    if (typeof handler !== 'function') { return self; }
    var method = priority ? 'unshift' : 'push';
    events.split(' ').forEach(function (event) {
      if (!self.eventsListeners[event]) { self.eventsListeners[event] = []; }
      self.eventsListeners[event][method](handler);
    });
    return self;
  };

  EventsClass.prototype.once = function once (events, handler, priority) {
    var self = this;
    if (typeof handler !== 'function') { return self; }
    function onceHandler() {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

      self.off(events, onceHandler);
      if (onceHandler.f7proxy) {
        delete onceHandler.f7proxy;
      }
      handler.apply(self, args);
    }
    onceHandler.f7proxy = handler;
    return self.on(events, onceHandler, priority);
  };

  EventsClass.prototype.off = function off (events, handler) {
    var self = this;
    if (!self.eventsListeners) { return self; }
    events.split(' ').forEach(function (event) {
      if (typeof handler === 'undefined') {
        self.eventsListeners[event] = [];
      } else if (self.eventsListeners[event]) {
        self.eventsListeners[event].forEach(function (eventHandler, index) {
          if (eventHandler === handler || (eventHandler.f7proxy && eventHandler.f7proxy === handler)) {
            self.eventsListeners[event].splice(index, 1);
          }
        });
      }
    });
    return self;
  };

  EventsClass.prototype.emit = function emit () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

    var self = this;
    if (!self.eventsListeners) { return self; }
    var events;
    var data;
    var context;
    var eventsParents;
    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
      events = args[0];
      data = args.slice(1, args.length);
      context = self;
      eventsParents = self.eventsParents;
    } else {
      events = args[0].events;
      data = args[0].data;
      context = args[0].context || self;
      eventsParents = args[0].local ? [] : args[0].parents || self.eventsParents;
    }
    var eventsArray = Array.isArray(events) ? events : events.split(' ');
    var localEvents = eventsArray.map(function (eventName) { return eventName.replace('local::', ''); });
    var parentEvents = eventsArray.filter(function (eventName) { return eventName.indexOf('local::') < 0; });

    localEvents.forEach(function (event) {
      if (self.eventsListeners && self.eventsListeners[event]) {
        var handlers = [];
        self.eventsListeners[event].forEach(function (eventHandler) {
          handlers.push(eventHandler);
        });
        handlers.forEach(function (eventHandler) {
          eventHandler.apply(context, data);
        });
      }
    });
    if (eventsParents && eventsParents.length > 0) {
      eventsParents.forEach(function (eventsParent) {
        eventsParent.emit.apply(eventsParent, [ parentEvents ].concat( data ));
      });
    }
    return self;
  };

  var Framework7Class = /*@__PURE__*/(function (EventsClass) {
    function Framework7Class(params, parents) {
      if ( params === void 0 ) params = {};
      if ( parents === void 0 ) parents = [];

      EventsClass.call(this, parents);
      var self = this;
      self.params = params;

      if (self.params && self.params.on) {
        Object.keys(self.params.on).forEach(function (eventName) {
          self.on(eventName, self.params.on[eventName]);
        });
      }
    }

    if ( EventsClass ) Framework7Class.__proto__ = EventsClass;
    Framework7Class.prototype = Object.create( EventsClass && EventsClass.prototype );
    Framework7Class.prototype.constructor = Framework7Class;

    var staticAccessors = { components: { configurable: true } };

    // eslint-disable-next-line
    Framework7Class.prototype.useModuleParams = function useModuleParams (module, instanceParams) {
      if (module.params) {
        var originalParams = {};
        Object.keys(module.params).forEach(function (paramKey) {
          if (typeof instanceParams[paramKey] === 'undefined') { return; }
          originalParams[paramKey] = Utils.extend({}, instanceParams[paramKey]);
        });
        Utils.extend(instanceParams, module.params);
        Object.keys(originalParams).forEach(function (paramKey) {
          Utils.extend(instanceParams[paramKey], originalParams[paramKey]);
        });
      }
    };

    Framework7Class.prototype.useModulesParams = function useModulesParams (instanceParams) {
      var instance = this;
      if (!instance.modules) { return; }
      Object.keys(instance.modules).forEach(function (moduleName) {
        var module = instance.modules[moduleName];
        // Extend params
        if (module.params) {
          Utils.extend(instanceParams, module.params);
        }
      });
    };

    Framework7Class.prototype.useModule = function useModule (moduleName, moduleParams) {
      if ( moduleName === void 0 ) moduleName = '';
      if ( moduleParams === void 0 ) moduleParams = {};

      var instance = this;
      if (!instance.modules) { return; }
      var module = typeof moduleName === 'string' ? instance.modules[moduleName] : moduleName;
      if (!module) { return; }

      // Extend instance methods and props
      if (module.instance) {
        Object.keys(module.instance).forEach(function (modulePropName) {
          var moduleProp = module.instance[modulePropName];
          if (typeof moduleProp === 'function') {
            instance[modulePropName] = moduleProp.bind(instance);
          } else {
            instance[modulePropName] = moduleProp;
          }
        });
      }
      // Add event listeners
      if (module.on && instance.on) {
        Object.keys(module.on).forEach(function (moduleEventName) {
          instance.on(moduleEventName, module.on[moduleEventName]);
        });
      }
      // Add vnode hooks
      if (module.vnode) {
        if (!instance.vnodeHooks) { instance.vnodeHooks = {}; }
        Object.keys(module.vnode).forEach(function (vnodeId) {
          Object.keys(module.vnode[vnodeId]).forEach(function (hookName) {
            var handler = module.vnode[vnodeId][hookName];
            if (!instance.vnodeHooks[hookName]) { instance.vnodeHooks[hookName] = {}; }
            if (!instance.vnodeHooks[hookName][vnodeId]) { instance.vnodeHooks[hookName][vnodeId] = []; }
            instance.vnodeHooks[hookName][vnodeId].push(handler.bind(instance));
          });
        });
      }
      // Module create callback
      if (module.create) {
        module.create.bind(instance)(moduleParams);
      }
    };

    Framework7Class.prototype.useModules = function useModules (modulesParams) {
      if ( modulesParams === void 0 ) modulesParams = {};

      var instance = this;
      if (!instance.modules) { return; }
      Object.keys(instance.modules).forEach(function (moduleName) {
        var moduleParams = modulesParams[moduleName] || {};
        instance.useModule(moduleName, moduleParams);
      });
    };

    staticAccessors.components.set = function (components) {
      var Class = this;
      if (!Class.use) { return; }
      Class.use(components);
    };

    Framework7Class.installModule = function installModule (module) {
      var params = [], len = arguments.length - 1;
      while ( len-- > 0 ) params[ len ] = arguments[ len + 1 ];

      var Class = this;
      if (!Class.prototype.modules) { Class.prototype.modules = {}; }
      var name = module.name || (((Object.keys(Class.prototype.modules).length) + "_" + (Utils.now())));
      Class.prototype.modules[name] = module;
      // Prototype
      if (module.proto) {
        Object.keys(module.proto).forEach(function (key) {
          Class.prototype[key] = module.proto[key];
        });
      }
      // Class
      if (module.static) {
        Object.keys(module.static).forEach(function (key) {
          Class[key] = module.static[key];
        });
      }
      // Callback
      if (module.install) {
        module.install.apply(Class, params);
      }
      return Class;
    };

    Framework7Class.use = function use (module) {
      var params = [], len = arguments.length - 1;
      while ( len-- > 0 ) params[ len ] = arguments[ len + 1 ];

      var Class = this;
      if (Array.isArray(module)) {
        module.forEach(function (m) { return Class.installModule(m); });
        return Class;
      }
      return Class.installModule.apply(Class, [ module ].concat( params ));
    };

    Object.defineProperties( Framework7Class, staticAccessors );

    return Framework7Class;
  }(EventsClass));

  function ConstructorMethods (parameters) {
    if ( parameters === void 0 ) parameters = {};

    var defaultSelector = parameters.defaultSelector;
    var Constructor = parameters.constructor;
    var domProp = parameters.domProp;
    var app = parameters.app;
    var addMethods = parameters.addMethods;
    var methods = {
      create: function create() {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        if (app) { return new (Function.prototype.bind.apply( Constructor, [ null ].concat( [app], args) )); }
        return new (Function.prototype.bind.apply( Constructor, [ null ].concat( args) ));
      },
      get: function get(el) {
        if ( el === void 0 ) el = defaultSelector;

        if (el instanceof Constructor) { return el; }
        var $el = $(el);
        if ($el.length === 0) { return undefined; }
        return $el[0][domProp];
      },
      destroy: function destroy(el) {
        var instance = methods.get(el);
        if (instance && instance.destroy) { return instance.destroy(); }
        return undefined;
      },
    };
    if (addMethods && Array.isArray(addMethods)) {
      addMethods.forEach(function (methodName) {
        methods[methodName] = function (el) {
          if ( el === void 0 ) el = defaultSelector;
          var args = [], len = arguments.length - 1;
          while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

          var instance = methods.get(el);
          if (instance && instance[methodName]) { return instance[methodName].apply(instance, args); }
          return undefined;
        };
      });
    }
    return methods;
  }

  function ModalMethods (parameters) {
    if ( parameters === void 0 ) parameters = {};

    var defaultSelector = parameters.defaultSelector;
    var Constructor = parameters.constructor;
    var app = parameters.app;
    var methods = Utils.extend(
      ConstructorMethods({
        defaultSelector: defaultSelector,
        constructor: Constructor,
        app: app,
        domProp: 'f7Modal',
      }),
      {
        open: function open(el, animate, targetEl) {
          var $el = $(el);
          if ($el.length > 1 && targetEl) {
            // check if same modal in other page
            var $targetPage = $(targetEl).parents('.page');
            if ($targetPage.length) {
              $el.each(function (index, modalEl) {
                var $modalEl = $(modalEl);
                if ($modalEl.parents($targetPage)[0] === $targetPage[0]) {
                  $el = $modalEl;
                }
              });
            }
          }
          if ($el.length > 1) {
            $el = $el.eq($el.length - 1);
          }
          if (!$el.length) { return undefined; }
          var instance = $el[0].f7Modal;
          if (!instance) {
            var params = $el.dataset();
            instance = new Constructor(app, Object.assign({}, {el: $el}, params));
          }
          return instance.open(animate);
        },
        close: function close(el, animate, targetEl) {
          if ( el === void 0 ) el = defaultSelector;

          var $el = $(el);
          if (!$el.length) { return undefined; }
          if ($el.length > 1) {
            // check if close link (targetEl) in this modal
            var $parentEl;
            if (targetEl) {
              var $targetEl = $(targetEl);
              if ($targetEl.length) {
                $parentEl = $targetEl.parents($el);
              }
            }
            if ($parentEl && $parentEl.length > 0) {
              $el = $parentEl;
            } else {
              $el = $el.eq($el.length - 1);
            }
          }
          var instance = $el[0].f7Modal;
          if (!instance) {
            var params = $el.dataset();
            instance = new Constructor(app, Object.assign({}, {el: $el}, params));
          }
          return instance.close(animate);
        },
      }
    );
    return methods;
  }

  var fetchedModules = [];
  function loadModule(moduleToLoad) {
    var Framework7 = this;
    return new Promise(function (resolve, reject) {
      var app = Framework7.instance;
      var modulePath;
      var moduleObj;
      var moduleFunc;
      if (!moduleToLoad) {
        reject(new Error('Framework7: Lazy module must be specified'));
        return;
      }

      function install(module) {
        Framework7.use(module);

        if (app) {
          app.useModuleParams(module, app.params);
          app.useModule(module);
        }
      }

      if (typeof moduleToLoad === 'string') {
        var matchNamePattern = moduleToLoad.match(/([a-z0-9-]*)/i);
        if (moduleToLoad.indexOf('.') < 0 && matchNamePattern && matchNamePattern[0].length === moduleToLoad.length) {
          if (!app || (app && !app.params.lazyModulesPath)) {
            reject(new Error('Framework7: "lazyModulesPath" app parameter must be specified to fetch module by name'));
            return;
          }
          modulePath = (app.params.lazyModulesPath) + "/" + moduleToLoad + ".js";
        } else {
          modulePath = moduleToLoad;
        }
      } else if (typeof moduleToLoad === 'function') {
        moduleFunc = moduleToLoad;
      } else {
        // considering F7-Plugin object
        moduleObj = moduleToLoad;
      }

      if (moduleFunc) {
        var module = moduleFunc(Framework7, false);
        if (!module) {
          reject(new Error('Framework7: Can\'t find Framework7 component in specified component function'));
          return;
        }
        // Check if it was added
        if (Framework7.prototype.modules && Framework7.prototype.modules[module.name]) {
          resolve();
          return;
        }
        // Install It
        install(module);

        resolve();
      }
      if (moduleObj) {
        var module$1 = moduleObj;
        if (!module$1) {
          reject(new Error('Framework7: Can\'t find Framework7 component in specified component'));
          return;
        }
        // Check if it was added
        if (Framework7.prototype.modules && Framework7.prototype.modules[module$1.name]) {
          resolve();
          return;
        }
        // Install It
        install(module$1);

        resolve();
      }
      if (modulePath) {
        if (fetchedModules.indexOf(modulePath) >= 0) {
          resolve();
          return;
        }
        fetchedModules.push(modulePath);
        var scriptLoad = new Promise(function (resolveScript, rejectScript) {
          Framework7.request.get(
            modulePath,
            function (scriptContent) {
              var id = Utils.id();
              var callbackLoadName = "f7_component_loader_callback_" + id;

              var scriptEl = doc.createElement('script');
              scriptEl.innerHTML = "window." + callbackLoadName + " = function (Framework7, Framework7AutoInstallComponent) {return " + (scriptContent.trim()) + "}";
              $('head').append(scriptEl);

              var componentLoader = win[callbackLoadName];
              delete win[callbackLoadName];
              $(scriptEl).remove();

              var module = componentLoader(Framework7, false);

              if (!module) {
                rejectScript(new Error(("Framework7: Can't find Framework7 component in " + modulePath + " file")));
                return;
              }

              // Check if it was added
              if (Framework7.prototype.modules && Framework7.prototype.modules[module.name]) {
                resolveScript();
                return;
              }

              // Install It
              install(module);

              resolveScript();
            },
            function (xhr, status) {
              rejectScript(xhr, status);
            }
          );
        });
        var styleLoad = new Promise(function (resolveStyle) {
          Framework7.request.get(
            modulePath.replace('.js', app.rtl ? '.rtl.css' : '.css'),
            function (styleContent) {
              var styleEl = doc.createElement('style');
              styleEl.innerHTML = styleContent;
              $('head').append(styleEl);

              resolveStyle();
            },
            function () {
              resolveStyle();
            }
          );
        });

        Promise.all([scriptLoad, styleLoad]).then(function () {
          resolve();
        }).catch(function (err) {
          reject(err);
        });
      }
    });
  }

  var Framework7 = /*@__PURE__*/(function (Framework7Class) {
    function Framework7(params) {
      Framework7Class.call(this, params);
      if (Framework7.instance) {
        throw new Error('Framework7 is already initialized and can\'t be initialized more than once');
      }

      var passedParams = Utils.extend({}, params);

      // App Instance
      var app = this;

      Framework7.instance = app;

      // Default
      var defaults = {
        version: '1.0.0',
        id: 'io.framework7.testapp',
        root: 'body',
        theme: 'auto',
        language: win.navigator.language,
        routes: [],
        name: 'Framework7',
        lazyModulesPath: null,
        initOnDeviceReady: true,
        init: true,
        autoDarkTheme: false,
        iosTranslucentBars: true,
        iosTranslucentModals: true,
        component: undefined,
        componentUrl: undefined,
      };

      // Extend defaults with modules params
      app.useModulesParams(defaults);

      // Extend defaults with passed params
      app.params = Utils.extend(defaults, params);

      var $rootEl = $(app.params.root);

      Utils.extend(app, {
        // App Id
        id: app.params.id,
        // App Name
        name: app.params.name,
        // App version
        version: app.params.version,
        // Routes
        routes: app.params.routes,
        // Lang
        language: app.params.language,
        // Root
        root: $rootEl,
        // RTL
        rtl: $rootEl.css('direction') === 'rtl',
        // Theme
        theme: (function getTheme() {
          if (app.params.theme === 'auto') {
            if (Device.ios) { return 'ios'; }
            if (Device.desktop && Device.electron) { return 'aurora'; }
            return 'md';
          }
          return app.params.theme;
        }()),
        // Initially passed parameters
        passedParams: passedParams,
        online: win.navigator.onLine,
      });

      // Save Root
      if (app.root && app.root[0]) {
        app.root[0].f7 = app;
      }

      // Install Modules
      app.useModules();

      // Init Data & Methods
      app.initData();

      // Auto Dark Theme
      var DARK = '(prefers-color-scheme: dark)';
      var LIGHT = '(prefers-color-scheme: light)';
      app.mq = {};
      if (win.matchMedia) {
        app.mq.dark = win.matchMedia(DARK);
        app.mq.light = win.matchMedia(LIGHT);
      }
      app.colorSchemeListener = function colorSchemeListener(ref) {
        var matches = ref.matches;
        var media = ref.media;

        if (!matches) {
          return;
        }
        var html = doc.querySelector('html');
        if (media === DARK) {
          html.classList.add('theme-dark');
          app.darkTheme = true;
          app.emit('darkThemeChange', true);
        } else if (media === LIGHT) {
          html.classList.remove('theme-dark');
          app.darkTheme = false;
          app.emit('darkThemeChange', false);
        }
      };

      // Init
      if (app.params.init) {
        if (Device.cordova && app.params.initOnDeviceReady) {
          $(doc).on('deviceready', function () {
            app.init();
          });
        } else {
          app.init();
        }
      }

      // Return app instance
      return app;
    }

    if ( Framework7Class ) Framework7.__proto__ = Framework7Class;
    Framework7.prototype = Object.create( Framework7Class && Framework7Class.prototype );
    Framework7.prototype.constructor = Framework7;

    var prototypeAccessors = { $: { configurable: true },t7: { configurable: true } };
    var staticAccessors = { Dom7: { configurable: true },$: { configurable: true },Template7: { configurable: true },Class: { configurable: true },Events: { configurable: true } };

    Framework7.prototype.initData = function initData () {
      var app = this;

      // Data
      app.data = {};
      if (app.params.data && typeof app.params.data === 'function') {
        Utils.extend(app.data, app.params.data.bind(app)());
      } else if (app.params.data) {
        Utils.extend(app.data, app.params.data);
      }
      // Methods
      app.methods = {};
      if (app.params.methods) {
        Object.keys(app.params.methods).forEach(function (methodName) {
          if (typeof app.params.methods[methodName] === 'function') {
            app.methods[methodName] = app.params.methods[methodName].bind(app);
          } else {
            app.methods[methodName] = app.params.methods[methodName];
          }
        });
      }
    };

    Framework7.prototype.enableAutoDarkTheme = function enableAutoDarkTheme () {
      if (!win.matchMedia) { return; }
      var app = this;
      var html = doc.querySelector('html');
      if (app.mq.dark && app.mq.light) {
        app.mq.dark.addListener(app.colorSchemeListener);
        app.mq.light.addListener(app.colorSchemeListener);
      }
      if (app.mq.dark && app.mq.dark.matches) {
        html.classList.add('theme-dark');
        app.darkTheme = true;
        app.emit('darkThemeChange', true);
      } else if (app.mq.light && app.mq.light.matches) {
        html.classList.remove('theme-dark');
        app.darkTheme = false;
        app.emit('darkThemeChange', false);
      }
    };

    Framework7.prototype.disableAutoDarkTheme = function disableAutoDarkTheme () {
      if (!win.matchMedia) { return; }
      var app = this;
      if (app.mq.dark) { app.mq.dark.removeListener(app.colorSchemeListener); }
      if (app.mq.light) { app.mq.light.removeListener(app.colorSchemeListener); }
    };

    Framework7.prototype.initAppComponent = function initAppComponent (callback) {
      var app = this;
      app.router.componentLoader(
        app.params.component,
        app.params.componentUrl,
        { componentOptions: { el: app.root[0], root: true } },
        function (el) {
          app.root = $(el);
          app.root[0].f7 = app;
          app.rootComponent = el.f7Component;
          if (callback) { callback(); }
        },
        function () {}
      );
    };

    // eslint-disable-next-line
    Framework7.prototype._init = function _init () {
      var app = this;
      if (app.initialized) { return app; }

      app.root.addClass('framework7-initializing');

      // RTL attr
      if (app.rtl) {
        $('html').attr('dir', 'rtl');
      }

      // Auto Dark Theme
      if (app.params.autoDarkTheme) {
        app.enableAutoDarkTheme();
      }

      // Watch for online/offline state
      win.addEventListener('offline', function () {
        app.online = false;
        app.emit('offline');
        app.emit('connection', false);
      });
      win.addEventListener('online', function () {
        app.online = true;
        app.emit('online');
        app.emit('connection', true);
      });

      // Root class
      app.root.addClass('framework7-root');

      // Theme class
      $('html').removeClass('ios md aurora').addClass(app.theme);

      // iOS Translucent
      if (app.params.iosTranslucentBars && app.theme === 'ios' && Device.ios) {
        $('html').addClass('ios-translucent-bars');
      }
      if (app.params.iosTranslucentModals && app.theme === 'ios' && Device.ios) {
        $('html').addClass('ios-translucent-modals');
      }

      // Init class
      Utils.nextFrame(function () {
        app.root.removeClass('framework7-initializing');
      });
      // Emit, init other modules
      app.initialized = true;
      app.emit('init');

      return app;
    };

    Framework7.prototype.init = function init () {
      var app = this;
      if (app.params.component || app.params.componentUrl) {
        app.initAppComponent(function () {
          app._init(); // eslint-disable-line
        });
      } else {
        app._init(); // eslint-disable-line
      }
    };

    // eslint-disable-next-line
    Framework7.prototype.loadModule = function loadModule () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return Framework7.loadModule.apply(Framework7, args);
    };

    // eslint-disable-next-line
    Framework7.prototype.loadModules = function loadModules () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return Framework7.loadModules.apply(Framework7, args);
    };

    Framework7.prototype.getVnodeHooks = function getVnodeHooks (hook, id) {
      var app = this;
      if (!app.vnodeHooks || !app.vnodeHooks[hook]) { return []; }
      return app.vnodeHooks[hook][id] || [];
    };

    // eslint-disable-next-line
    prototypeAccessors.$.get = function () {
      return $;
    };
    // eslint-disable-next-line
    prototypeAccessors.t7.get = function () {
      return Template7;
    };

    staticAccessors.Dom7.get = function () {
      return $;
    };

    staticAccessors.$.get = function () {
      return $;
    };

    staticAccessors.Template7.get = function () {
      return Template7;
    };

    staticAccessors.Class.get = function () {
      return Framework7Class;
    };

    staticAccessors.Events.get = function () {
      return EventsClass;
    };

    Object.defineProperties( Framework7.prototype, prototypeAccessors );
    Object.defineProperties( Framework7, staticAccessors );

    return Framework7;
  }(Framework7Class));

  Framework7.ModalMethods = ModalMethods;
  Framework7.ConstructorMethods = ConstructorMethods;

  Framework7.loadModule = loadModule;
  Framework7.loadModules = function loadModules(modules) {
    return Promise.all(modules.map(function (module) { return Framework7.loadModule(module); }));
  };

  var DeviceModule = {
    name: 'device',
    proto: {
      device: Device,
    },
    static: {
      device: Device,
    },
    on: {
      init: function init() {
        var classNames = [];
        var html = doc.querySelector('html');
        var metaStatusbar = doc.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (!html) { return; }
        if (Device.standalone && Device.ios && metaStatusbar && metaStatusbar.content === 'black-translucent') {
          classNames.push('device-full-viewport');
        }

        // Pixel Ratio
        classNames.push(("device-pixel-ratio-" + (Math.floor(Device.pixelRatio))));
        // OS classes
        if (Device.os && !Device.desktop) {
          classNames.push(
            ("device-" + (Device.os))
          );
        } else if (Device.desktop) {
          classNames.push('device-desktop');
          if (Device.os) {
            classNames.push(("device-" + (Device.os)));
          }
        }
        if (Device.cordova || Device.phonegap) {
          classNames.push('device-cordova');
        }

        // Add html classes
        classNames.forEach(function (className) {
          html.classList.add(className);
        });
      },
    },
  };

  var SupportModule = {
    name: 'support',
    proto: {
      support: Support,
    },
    static: {
      support: Support,
    },
  };

  var UtilsModule = {
    name: 'utils',
    proto: {
      utils: Utils,
    },
    static: {
      utils: Utils,
    },
  };

  var ResizeModule = {
    name: 'resize',
    instance: {
      getSize: function getSize() {
        var app = this;
        if (!app.root[0]) { return { width: 0, height: 0, left: 0, top: 0 }; }
        var offset = app.root.offset();
        var ref = [app.root[0].offsetWidth, app.root[0].offsetHeight, offset.left, offset.top];
        var width = ref[0];
        var height = ref[1];
        var left = ref[2];
        var top = ref[3];
        app.width = width;
        app.height = height;
        app.left = left;
        app.top = top;
        return { width: width, height: height, left: left, top: top };
      },
    },
    on: {
      init: function init() {
        var app = this;

        // Get Size
        app.getSize();

        // Emit resize
        win.addEventListener('resize', function () {
          app.emit('resize');
        }, false);

        // Emit orientationchange
        win.addEventListener('orientationchange', function () {
          app.emit('orientationchange');
        });
      },
      orientationchange: function orientationchange() {
        var app = this;
        // Fix iPad weird body scroll
        if (app.device.ipad) {
          doc.body.scrollLeft = 0;
          setTimeout(function () {
            doc.body.scrollLeft = 0;
          }, 0);
        }
      },
      resize: function resize() {
        var app = this;
        app.getSize();
      },
    },
  };

  var globals = {};
  var jsonpRequests = 0;

  function Request(requestOptions) {
    var globalsNoCallbacks = Utils.extend({}, globals);
    ('beforeCreate beforeOpen beforeSend error complete success statusCode').split(' ').forEach(function (callbackName) {
      delete globalsNoCallbacks[callbackName];
    });
    var defaults = Utils.extend({
      url: win.location.toString(),
      method: 'GET',
      data: false,
      async: true,
      cache: true,
      user: '',
      password: '',
      headers: {},
      xhrFields: {},
      statusCode: {},
      processData: true,
      dataType: 'text',
      contentType: 'application/x-www-form-urlencoded',
      timeout: 0,
    }, globalsNoCallbacks);

    var options = Utils.extend({}, defaults, requestOptions);
    var proceedRequest;

    // Function to run XHR callbacks and events
    function fireCallback(callbackName) {
      var data = [], len = arguments.length - 1;
      while ( len-- > 0 ) data[ len ] = arguments[ len + 1 ];

      /*
        Callbacks:
        beforeCreate (options),
        beforeOpen (xhr, options),
        beforeSend (xhr, options),
        error (xhr, status, message),
        complete (xhr, stautus),
        success (response, status, xhr),
        statusCode ()
      */
      var globalCallbackValue;
      var optionCallbackValue;
      if (globals[callbackName]) {
        globalCallbackValue = globals[callbackName].apply(globals, data);
      }
      if (options[callbackName]) {
        optionCallbackValue = options[callbackName].apply(options, data);
      }
      if (typeof globalCallbackValue !== 'boolean') { globalCallbackValue = true; }
      if (typeof optionCallbackValue !== 'boolean') { optionCallbackValue = true; }
      return (globalCallbackValue && optionCallbackValue);
    }

    // Before create callback
    proceedRequest = fireCallback('beforeCreate', options);
    if (proceedRequest === false) { return undefined; }

    // For jQuery guys
    if (options.type) { options.method = options.type; }

    // Parameters Prefix
    var paramsPrefix = options.url.indexOf('?') >= 0 ? '&' : '?';

    // UC method
    var method = options.method.toUpperCase();

    // Data to modify GET URL
    if ((method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || method === 'DELETE') && options.data) {
      var stringData;
      if (typeof options.data === 'string') {
        // Should be key=value string
        if (options.data.indexOf('?') >= 0) { stringData = options.data.split('?')[1]; }
        else { stringData = options.data; }
      } else {
        // Should be key=value object
        stringData = Utils.serializeObject(options.data);
      }
      if (stringData.length) {
        options.url += paramsPrefix + stringData;
        if (paramsPrefix === '?') { paramsPrefix = '&'; }
      }
    }

    // JSONP
    if (options.dataType === 'json' && options.url.indexOf('callback=') >= 0) {
      var callbackName = "f7jsonp_" + (Date.now() + ((jsonpRequests += 1)));
      var abortTimeout;
      var callbackSplit = options.url.split('callback=');
      var requestUrl = (callbackSplit[0]) + "callback=" + callbackName;
      if (callbackSplit[1].indexOf('&') >= 0) {
        var addVars = callbackSplit[1].split('&').filter(function (el) { return el.indexOf('=') > 0; }).join('&');
        if (addVars.length > 0) { requestUrl += "&" + addVars; }
      }

      // Create script
      var script = doc.createElement('script');
      script.type = 'text/javascript';
      script.onerror = function onerror() {
        clearTimeout(abortTimeout);
        fireCallback('error', null, 'scripterror', 'scripterror');
        fireCallback('complete', null, 'scripterror');
      };
      script.src = requestUrl;

      // Handler
      win[callbackName] = function jsonpCallback(data) {
        clearTimeout(abortTimeout);
        fireCallback('success', data);
        script.parentNode.removeChild(script);
        script = null;
        delete win[callbackName];
      };
      doc.querySelector('head').appendChild(script);

      if (options.timeout > 0) {
        abortTimeout = setTimeout(function () {
          script.parentNode.removeChild(script);
          script = null;
          fireCallback('error', null, 'timeout', 'timeout');
        }, options.timeout);
      }

      return undefined;
    }

    // Cache for GET/HEAD requests
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || method === 'DELETE') {
      if (options.cache === false) {
        options.url += paramsPrefix + "_nocache" + (Date.now());
      }
    }

    // Create XHR
    var xhr = new XMLHttpRequest();

    // Save Request URL
    xhr.requestUrl = options.url;
    xhr.requestParameters = options;

    // Before open callback
    proceedRequest = fireCallback('beforeOpen', xhr, options);
    if (proceedRequest === false) { return xhr; }

    // Open XHR
    xhr.open(method, options.url, options.async, options.user, options.password);

    // Create POST Data
    var postData = null;

    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && options.data) {
      if (options.processData) {
        var postDataInstances = [ArrayBuffer, Blob, Document, FormData];
        // Post Data
        if (postDataInstances.indexOf(options.data.constructor) >= 0) {
          postData = options.data;
        } else {
          // POST Headers
          var boundary = "---------------------------" + (Date.now().toString(16));

          if (options.contentType === 'multipart/form-data') {
            xhr.setRequestHeader('Content-Type', ("multipart/form-data; boundary=" + boundary));
          } else {
            xhr.setRequestHeader('Content-Type', options.contentType);
          }
          postData = '';
          var data$1 = Utils.serializeObject(options.data);
          if (options.contentType === 'multipart/form-data') {
            data$1 = data$1.split('&');
            var newData = [];
            for (var i = 0; i < data$1.length; i += 1) {
              newData.push(("Content-Disposition: form-data; name=\"" + (data$1[i].split('=')[0]) + "\"\r\n\r\n" + (data$1[i].split('=')[1]) + "\r\n"));
            }
            postData = "--" + boundary + "\r\n" + (newData.join(("--" + boundary + "\r\n"))) + "--" + boundary + "--\r\n";
          } else if (options.contentType === 'application/json') {
            postData = JSON.stringify(options.data);
          } else {
            postData = data$1;
          }
        }
      } else {
        postData = options.data;
        xhr.setRequestHeader('Content-Type', options.contentType);
      }
    }
    if (options.dataType === 'json' && (!options.headers || !options.headers.Accept)) {
      xhr.setRequestHeader('Accept', 'application/json');
    }

    // Additional headers
    if (options.headers) {
      Object.keys(options.headers).forEach(function (headerName) {
        if (typeof options.headers[headerName] === 'undefined') { return; }
        xhr.setRequestHeader(headerName, options.headers[headerName]);
      });
    }

    // Check for crossDomain
    if (typeof options.crossDomain === 'undefined') {
      // eslint-disable-next-line
      options.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(options.url) && RegExp.$2 !== win.location.host;
    }

    if (!options.crossDomain) {
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }

    if (options.xhrFields) {
      Utils.extend(xhr, options.xhrFields);
    }


    // Handle XHR
    xhr.onload = function onload() {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
        var responseData;
        if (options.dataType === 'json') {
          var parseError;
          try {
            responseData = JSON.parse(xhr.responseText);
          } catch (err) {
            parseError = true;
          }
          if (!parseError) {
            fireCallback('success', responseData, xhr.status, xhr);
          } else {
            fireCallback('error', xhr, 'parseerror', 'parseerror');
          }
        } else {
          responseData = xhr.responseType === 'text' || xhr.responseType === '' ? xhr.responseText : xhr.response;
          fireCallback('success', responseData, xhr.status, xhr);
        }
      } else {
        fireCallback('error', xhr, xhr.status, xhr.statusText);
      }
      if (options.statusCode) {
        if (globals.statusCode && globals.statusCode[xhr.status]) { globals.statusCode[xhr.status](xhr); }
        if (options.statusCode[xhr.status]) { options.statusCode[xhr.status](xhr); }
      }
      fireCallback('complete', xhr, xhr.status);
    };

    xhr.onerror = function onerror() {
      fireCallback('error', xhr, xhr.status, xhr.status);
      fireCallback('complete', xhr, 'error');
    };

    // Timeout
    if (options.timeout > 0) {
      xhr.timeout = options.timeout;
      xhr.ontimeout = function () {
        fireCallback('error', xhr, 'timeout', 'timeout');
        fireCallback('complete', xhr, 'timeout');
      };
    }

    // Ajax start callback
    proceedRequest = fireCallback('beforeSend', xhr, options);
    if (proceedRequest === false) { return xhr; }

    // Send XHR
    xhr.send(postData);

    // Return XHR object
    return xhr;
  }
  function RequestShortcut(method) {
    var assign, assign$1;

    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
    var ref = [];
    var url = ref[0];
    var data = ref[1];
    var success = ref[2];
    var error = ref[3];
    var dataType = ref[4];
    if (typeof args[1] === 'function') {
      (assign = args, url = assign[0], success = assign[1], error = assign[2], dataType = assign[3]);
    } else {
      (assign$1 = args, url = assign$1[0], data = assign$1[1], success = assign$1[2], error = assign$1[3], dataType = assign$1[4]);
    }
    [success, error].forEach(function (callback) {
      if (typeof callback === 'string') {
        dataType = callback;
        if (callback === success) { success = undefined; }
        else { error = undefined; }
      }
    });
    dataType = dataType || (method === 'json' || method === 'postJSON' ? 'json' : undefined);
    var requestOptions = {
      url: url,
      method: method === 'post' || method === 'postJSON' ? 'POST' : 'GET',
      data: data,
      success: success,
      error: error,
      dataType: dataType,
    };
    if (method === 'postJSON') {
      Utils.extend(requestOptions, {
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: typeof data === 'string' ? data : JSON.stringify(data),
      });
    }
    return Request(requestOptions);
  }
  function RequestShortcutPromise(method) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    var url = args[0];
    var data = args[1];
    var dataType = args[2];
    return new Promise(function (resolve, reject) {
      RequestShortcut(
        method,
        url,
        data,
        function (responseData, status, xhr) {
          resolve({ data: responseData, status: status, xhr: xhr });
        },
        function (xhr, status, message) {
          // eslint-disable-next-line
          reject({ xhr: xhr, status: status, message: message });
        },
        dataType
      );
    });
  }
  Object.assign(Request, {
    get: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return RequestShortcut.apply(void 0, [ 'get' ].concat( args ));
  },
    post: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return RequestShortcut.apply(void 0, [ 'post' ].concat( args ));
  },
    json: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return RequestShortcut.apply(void 0, [ 'json' ].concat( args ));
  },
    getJSON: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return RequestShortcut.apply(void 0, [ 'json' ].concat( args ));
  },
    postJSON: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return RequestShortcut.apply(void 0, [ 'postJSON' ].concat( args ));
  },
  });

  Request.promise = function requestPromise(requestOptions) {
    return new Promise(function (resolve, reject) {
      Request(Object.assign(requestOptions, {
        success: function success(data, status, xhr) {
          resolve({ data: data, status: status, xhr: xhr });
        },
        error: function error(xhr, status, message) {
          // eslint-disable-next-line
          reject({ xhr: xhr, status: status, message: message });
        },
      }));
    });
  };
  Object.assign(Request.promise, {
    get: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return RequestShortcutPromise.apply(void 0, [ 'get' ].concat( args ));
  },
    post: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return RequestShortcutPromise.apply(void 0, [ 'post' ].concat( args ));
  },
    json: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return RequestShortcutPromise.apply(void 0, [ 'json' ].concat( args ));
  },
    getJSON: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return RequestShortcutPromise.apply(void 0, [ 'json' ].concat( args ));
  },
    postJSON: function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return RequestShortcutPromise.apply(void 0, [ 'postJSON' ].concat( args ));
  },
  });

  Request.setup = function setup(options) {
    if (options.type && !options.method) {
      Utils.extend(options, { method: options.type });
    }
    Utils.extend(globals, options);
  };

  /* eslint no-param-reassign: "off" */

  var RequestModule = {
    name: 'request',
    proto: {
      request: Request,
    },
    static: {
      request: Request,
    },
  };

  /* eslint-disable no-nested-ternary */

  function initTouch() {
    var app = this;
    var params = app.params.touch;
    var useRipple = params[((app.theme) + "TouchRipple")];

    if (Device.ios && Device.webView) {
      // Strange hack required for iOS 8 webview to work on inputs
      win.addEventListener('touchstart', function () {});
    }

    var touchStartX;
    var touchStartY;
    var targetElement;
    var isMoved;
    var tapHoldFired;
    var tapHoldTimeout;
    var preventClick;

    var activableElement;
    var activeTimeout;

    var rippleWave;
    var rippleTarget;
    var rippleTimeout;

    function findActivableElement(el) {
      var target = $(el);
      var parents = target.parents(params.activeStateElements);
      if (target.closest('.no-active-state').length) {
        return null;
      }
      var activable;
      if (target.is(params.activeStateElements)) {
        activable = target;
      }
      if (parents.length > 0) {
        activable = activable ? activable.add(parents) : parents;
      }
      if (activable && activable.length > 1) {
        var newActivable = [];
        var preventPropagation;
        for (var i = 0; i < activable.length; i += 1) {
          if (!preventPropagation) {
            newActivable.push(activable[i]);
            if (activable.eq(i).hasClass('prevent-active-state-propagation')
              || activable.eq(i).hasClass('no-active-state-propagation')
            ) {
              preventPropagation = true;
            }
          }
        }
        activable = $(newActivable);
      }
      return activable || target;
    }

    function isInsideScrollableView(el) {
      var pageContent = el.parents('.page-content');
      return pageContent.length > 0;
    }

    function addActive() {
      if (!activableElement) { return; }
      activableElement.addClass('active-state');
    }
    function removeActive() {
      if (!activableElement) { return; }
      activableElement.removeClass('active-state');
      activableElement = null;
    }

    // Ripple handlers
    function findRippleElement(el) {
      var rippleElements = params.touchRippleElements;
      var $el = $(el);
      if ($el.is(rippleElements)) {
        if ($el.hasClass('no-ripple')) {
          return false;
        }
        return $el;
      }
      if ($el.parents(rippleElements).length > 0) {
        var rippleParent = $el.parents(rippleElements).eq(0);
        if (rippleParent.hasClass('no-ripple')) {
          return false;
        }
        return rippleParent;
      }
      return false;
    }
    function createRipple($el, x, y) {
      if (!$el) { return; }
      rippleWave = app.touchRipple.create($el, x, y);
    }

    function removeRipple() {
      if (!rippleWave) { return; }
      rippleWave.remove();
      rippleWave = undefined;
      rippleTarget = undefined;
    }
    function rippleTouchStart(el) {
      rippleTarget = findRippleElement(el);
      if (!rippleTarget || rippleTarget.length === 0) {
        rippleTarget = undefined;
        return;
      }
      var inScrollable = isInsideScrollableView(rippleTarget);

      if (!inScrollable) {
        removeRipple();
        createRipple(rippleTarget, touchStartX, touchStartY);
      } else {
        clearTimeout(rippleTimeout);
        rippleTimeout = setTimeout(function () {
          removeRipple();
          createRipple(rippleTarget, touchStartX, touchStartY);
        }, 80);
      }
    }
    function rippleTouchMove() {
      clearTimeout(rippleTimeout);
      removeRipple();
    }
    function rippleTouchEnd() {
      if (!rippleWave && rippleTarget && !isMoved) {
        clearTimeout(rippleTimeout);
        createRipple(rippleTarget, touchStartX, touchStartY);
        setTimeout(removeRipple, 0);
      } else {
        removeRipple();
      }
    }

    // Mouse Handlers
    function handleMouseDown(e) {
      var $activableEl = findActivableElement(e.target);
      if ($activableEl) {
        $activableEl.addClass('active-state');
        if ('which' in e && e.which === 3) {
          setTimeout(function () {
            $('.active-state').removeClass('active-state');
          }, 0);
        }
      }

      if (useRipple) {
        touchStartX = e.pageX;
        touchStartY = e.pageY;
        rippleTouchStart(e.target, e.pageX, e.pageY);
      }
    }
    function handleMouseMove() {
      if (!params.activeStateOnMouseMove) {
        $('.active-state').removeClass('active-state');
      }
      if (useRipple) {
        rippleTouchMove();
      }
    }
    function handleMouseUp() {
      $('.active-state').removeClass('active-state');
      if (useRipple) {
        rippleTouchEnd();
      }
    }

    function handleTouchCancel() {
      targetElement = null;

      // Remove Active State
      clearTimeout(activeTimeout);
      clearTimeout(tapHoldTimeout);
      if (params.activeState) {
        removeActive();
      }

      // Remove Ripple
      if (useRipple) {
        rippleTouchEnd();
      }
    }

    function handleTouchStart(e) {
      isMoved = false;
      tapHoldFired = false;
      preventClick = false;
      if (e.targetTouches.length > 1) {
        if (activableElement) { removeActive(); }
        return true;
      }
      if (e.touches.length > 1 && activableElement) {
        removeActive();
      }
      if (params.tapHold) {
        if (tapHoldTimeout) { clearTimeout(tapHoldTimeout); }
        tapHoldTimeout = setTimeout(function () {
          if (e && e.touches && e.touches.length > 1) { return; }
          tapHoldFired = true;
          e.preventDefault();
          preventClick = true;
          $(e.target).trigger('taphold', e);
          app.emit('taphold', e);
        }, params.tapHoldDelay);
      }
      targetElement = e.target;
      touchStartX = e.targetTouches[0].pageX;
      touchStartY = e.targetTouches[0].pageY;

      if (params.activeState) {
        activableElement = findActivableElement(targetElement);
        if (activableElement && !isInsideScrollableView(activableElement)) {
          addActive();
        } else if (activableElement) {
          activeTimeout = setTimeout(addActive, 80);
        }
      }
      if (useRipple) {
        rippleTouchStart(targetElement);
      }
      return true;
    }
    function handleTouchMove(e) {
      var touch;
      var distance;
      if (e.type === 'touchmove') {
        touch = e.targetTouches[0];
        distance = params.touchClicksDistanceThreshold;
      }

      if (distance && touch) {
        var pageX = touch.pageX;
        var pageY = touch.pageY;
        if (Math.abs(pageX - touchStartX) > distance || Math.abs(pageY - touchStartY) > distance) {
          isMoved = true;
        }
      } else {
        isMoved = true;
      }
      if (isMoved) {
        preventClick = true;
        if (params.tapHold) {
          clearTimeout(tapHoldTimeout);
        }
        if (params.activeState) {
          clearTimeout(activeTimeout);
          removeActive();
        }
        if (useRipple) {
          rippleTouchMove();
        }
      }
    }
    function handleTouchEnd(e) {
      clearTimeout(activeTimeout);
      clearTimeout(tapHoldTimeout);
      if (doc.activeElement === e.target) {
        if (params.activeState) { removeActive(); }
        if (useRipple) {
          rippleTouchEnd();
        }
        return true;
      }
      if (params.activeState) {
        addActive();
        setTimeout(removeActive, 0);
      }
      if (useRipple) {
        rippleTouchEnd();
      }
      if ((params.tapHoldPreventClicks && tapHoldFired) || preventClick) {
        if (e.cancelable) { e.preventDefault(); }
        preventClick = true;
        return false;
      }
      return true;
    }
    function handleClick(e) {
      var isOverswipe = e && e.detail && e.detail === 'f7Overswipe';
      var localPreventClick = preventClick;
      if (targetElement && e.target !== targetElement) {
        if (isOverswipe) {
          localPreventClick = false;
        } else {
          localPreventClick = true;
        }
      }
      if (params.tapHold && params.tapHoldPreventClicks && tapHoldFired) {
        localPreventClick = true;
      }
      if (localPreventClick) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
      }

      if (params.tapHold) {
        tapHoldTimeout = setTimeout(
          function () {
            tapHoldFired = false;
          },
          (Device.ios || Device.androidChrome ? 100 : 400)
        );
      }
      preventClick = false;
      targetElement = null;

      return !localPreventClick;
    }

    function emitAppTouchEvent(name, e) {
      app.emit({
        events: name,
        data: [e],
      });
    }
    function appClick(e) {
      emitAppTouchEvent('click', e);
    }
    function appTouchStartActive(e) {
      emitAppTouchEvent('touchstart touchstart:active', e);
    }
    function appTouchMoveActive(e) {
      emitAppTouchEvent('touchmove touchmove:active', e);
    }
    function appTouchEndActive(e) {
      emitAppTouchEvent('touchend touchend:active', e);
    }
    function appTouchStartPassive(e) {
      emitAppTouchEvent('touchstart:passive', e);
    }
    function appTouchMovePassive(e) {
      emitAppTouchEvent('touchmove:passive', e);
    }
    function appTouchEndPassive(e) {
      emitAppTouchEvent('touchend:passive', e);
    }
    function appGestureActive(e) {
      emitAppTouchEvent(((e.type) + " " + (e.type) + ":active"), e);
    }
    function appGesturePassive(e) {
      emitAppTouchEvent(((e.type) + ":passive"), e);
    }


    var passiveListener = Support.passiveListener ? { passive: true } : false;
    var passiveListenerCapture = Support.passiveListener ? { passive: true, capture: true } : true;
    var activeListener = Support.passiveListener ? { passive: false } : false;
    var activeListenerCapture = Support.passiveListener ? { passive: false, capture: true } : true;

    doc.addEventListener('click', appClick, true);

    if (Support.passiveListener) {
      doc.addEventListener(app.touchEvents.start, appTouchStartActive, activeListenerCapture);
      doc.addEventListener(app.touchEvents.move, appTouchMoveActive, activeListener);
      doc.addEventListener(app.touchEvents.end, appTouchEndActive, activeListener);

      doc.addEventListener(app.touchEvents.start, appTouchStartPassive, passiveListenerCapture);
      doc.addEventListener(app.touchEvents.move, appTouchMovePassive, passiveListener);
      doc.addEventListener(app.touchEvents.end, appTouchEndPassive, passiveListener);
      if (Support.touch && Support.gestures) {
        doc.addEventListener('gesturestart', appGestureActive, activeListener);
        doc.addEventListener('gesturechange', appGestureActive, activeListener);
        doc.addEventListener('gestureend', appGestureActive, activeListener);

        doc.addEventListener('gesturestart', appGesturePassive, passiveListener);
        doc.addEventListener('gesturechange', appGesturePassive, passiveListener);
        doc.addEventListener('gestureend', appGesturePassive, passiveListener);
      }
    } else {
      doc.addEventListener(app.touchEvents.start, function (e) {
        appTouchStartActive(e);
        appTouchStartPassive(e);
      }, true);
      doc.addEventListener(app.touchEvents.move, function (e) {
        appTouchMoveActive(e);
        appTouchMovePassive(e);
      }, false);
      doc.addEventListener(app.touchEvents.end, function (e) {
        appTouchEndActive(e);
        appTouchEndPassive(e);
      }, false);
      if (Support.touch && Support.gestures) {
        doc.addEventListener('gesturestart', function (e) {
          appGestureActive(e);
          appGesturePassive(e);
        }, false);
        doc.addEventListener('gesturechange', function (e) {
          appGestureActive(e);
          appGesturePassive(e);
        }, false);
        doc.addEventListener('gestureend', function (e) {
          appGestureActive(e);
          appGesturePassive(e);
        }, false);
      }
    }

    if (Support.touch) {
      app.on('click', handleClick);
      app.on('touchstart', handleTouchStart);
      app.on('touchmove', handleTouchMove);
      app.on('touchend', handleTouchEnd);
      doc.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    } else if (params.activeState) {
      app.on('touchstart', handleMouseDown);
      app.on('touchmove', handleMouseMove);
      app.on('touchend', handleMouseUp);
      doc.addEventListener('pointercancel', handleMouseUp, { passive: true });
    }
    doc.addEventListener('contextmenu', function (e) {
      if (params.disableContextMenu && (Device.ios || Device.android || Device.cordova)) {
        e.preventDefault();
      }
      if (useRipple) {
        if (activableElement) { removeActive(); }
        rippleTouchEnd();
      }
    });
  }

  var TouchModule = {
    name: 'touch',
    params: {
      touch: {
        // Clicks
        touchClicksDistanceThreshold: 5,
        // ContextMenu
        disableContextMenu: false,
        // Tap Hold
        tapHold: false,
        tapHoldDelay: 750,
        tapHoldPreventClicks: true,
        // Active State
        activeState: true,
        activeStateElements: 'a, button, label, span, .actions-button, .stepper-button, .stepper-button-plus, .stepper-button-minus, .card-expandable, .menu-item, .link, .item-link, .accordion-item-toggle',
        activeStateOnMouseMove: false,
        mdTouchRipple: true,
        iosTouchRipple: false,
        auroraTouchRipple: false,
        touchRippleElements: '.ripple, .link, .item-link, .list-button, .links-list a, .button, button, .input-clear-button, .dialog-button, .tab-link, .item-radio, .item-checkbox, .actions-button, .searchbar-disable-button, .fab a, .checkbox, .radio, .data-table .sortable-cell:not(.input-cell), .notification-close-button, .stepper-button, .stepper-button-minus, .stepper-button-plus, .menu-item-content, .list.accordion-list .accordion-item-toggle',
      },
    },
    instance: {
      touchEvents: {
        start: Support.touch ? 'touchstart' : (Support.pointerEvents ? 'pointerdown' : 'mousedown'),
        move: Support.touch ? 'touchmove' : (Support.pointerEvents ? 'pointermove' : 'mousemove'),
        end: Support.touch ? 'touchend' : (Support.pointerEvents ? 'pointerup' : 'mouseup'),
      },
    },
    on: {
      init: initTouch,
    },
  };

  /**
   * Tokenize input string.
   */
  function lexer(str) {
      var tokens = [];
      var i = 0;
      while (i < str.length) {
          var char = str[i];
          if (char === "*" || char === "+" || char === "?") {
              tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
              continue;
          }
          if (char === "\\") {
              tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
              continue;
          }
          if (char === "{") {
              tokens.push({ type: "OPEN", index: i, value: str[i++] });
              continue;
          }
          if (char === "}") {
              tokens.push({ type: "CLOSE", index: i, value: str[i++] });
              continue;
          }
          if (char === ":") {
              var name = "";
              var j = i + 1;
              while (j < str.length) {
                  var code = str.charCodeAt(j);
                  if (
                  // `0-9`
                  (code >= 48 && code <= 57) ||
                      // `A-Z`
                      (code >= 65 && code <= 90) ||
                      // `a-z`
                      (code >= 97 && code <= 122) ||
                      // `_`
                      code === 95) {
                      name += str[j++];
                      continue;
                  }
                  break;
              }
              if (!name)
                  { throw new TypeError("Missing parameter name at " + i); }
              tokens.push({ type: "NAME", index: i, value: name });
              i = j;
              continue;
          }
          if (char === "(") {
              var count = 1;
              var pattern = "";
              var j = i + 1;
              if (str[j] === "?") {
                  throw new TypeError("Pattern cannot start with \"?\" at " + j);
              }
              while (j < str.length) {
                  if (str[j] === "\\") {
                      pattern += str[j++] + str[j++];
                      continue;
                  }
                  if (str[j] === ")") {
                      count--;
                      if (count === 0) {
                          j++;
                          break;
                      }
                  }
                  else if (str[j] === "(") {
                      count++;
                      if (str[j + 1] !== "?") {
                          throw new TypeError("Capturing groups are not allowed at " + j);
                      }
                  }
                  pattern += str[j++];
              }
              if (count)
                  { throw new TypeError("Unbalanced pattern at " + i); }
              if (!pattern)
                  { throw new TypeError("Missing pattern at " + i); }
              tokens.push({ type: "PATTERN", index: i, value: pattern });
              i = j;
              continue;
          }
          tokens.push({ type: "CHAR", index: i, value: str[i++] });
      }
      tokens.push({ type: "END", index: i, value: "" });
      return tokens;
  }
  /**
   * Parse a string for the raw tokens.
   */
  function parse(str, options) {
      if (options === void 0) { options = {}; }
      var tokens = lexer(str);
      var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
      var defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?";
      var result = [];
      var key = 0;
      var i = 0;
      var path = "";
      var tryConsume = function (type) {
          if (i < tokens.length && tokens[i].type === type)
              { return tokens[i++].value; }
      };
      var mustConsume = function (type) {
          var value = tryConsume(type);
          if (value !== undefined)
              { return value; }
          var _a = tokens[i], nextType = _a.type, index = _a.index;
          throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
      };
      var consumeText = function () {
          var result = "";
          var value;
          // tslint:disable-next-line
          while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
              result += value;
          }
          return result;
      };
      while (i < tokens.length) {
          var char = tryConsume("CHAR");
          var name = tryConsume("NAME");
          var pattern = tryConsume("PATTERN");
          if (name || pattern) {
              var prefix = char || "";
              if (prefixes.indexOf(prefix) === -1) {
                  path += prefix;
                  prefix = "";
              }
              if (path) {
                  result.push(path);
                  path = "";
              }
              result.push({
                  name: name || key++,
                  prefix: prefix,
                  suffix: "",
                  pattern: pattern || defaultPattern,
                  modifier: tryConsume("MODIFIER") || ""
              });
              continue;
          }
          var value = char || tryConsume("ESCAPED_CHAR");
          if (value) {
              path += value;
              continue;
          }
          if (path) {
              result.push(path);
              path = "";
          }
          var open = tryConsume("OPEN");
          if (open) {
              var prefix = consumeText();
              var name_1 = tryConsume("NAME") || "";
              var pattern_1 = tryConsume("PATTERN") || "";
              var suffix = consumeText();
              mustConsume("CLOSE");
              result.push({
                  name: name_1 || (pattern_1 ? key++ : ""),
                  pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                  prefix: prefix,
                  suffix: suffix,
                  modifier: tryConsume("MODIFIER") || ""
              });
              continue;
          }
          mustConsume("END");
      }
      return result;
  }
  /**
   * Compile a string to a template function for the path.
   */
  function compile(str, options) {
      return tokensToFunction(parse(str, options), options);
  }
  /**
   * Expose a method for transforming tokens into the path function.
   */
  function tokensToFunction(tokens, options) {
      if (options === void 0) { options = {}; }
      var reFlags = flags(options);
      var _a = options.encode, encode = _a === void 0 ? function (x) { return x; } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
      // Compile all the tokens into regexps.
      var matches = tokens.map(function (token) {
          if (typeof token === "object") {
              return new RegExp("^(?:" + token.pattern + ")$", reFlags);
          }
      });
      return function (data) {
          var path = "";
          for (var i = 0; i < tokens.length; i++) {
              var token = tokens[i];
              if (typeof token === "string") {
                  path += token;
                  continue;
              }
              var value = data ? data[token.name] : undefined;
              var optional = token.modifier === "?" || token.modifier === "*";
              var repeat = token.modifier === "*" || token.modifier === "+";
              if (Array.isArray(value)) {
                  if (!repeat) {
                      throw new TypeError("Expected \"" + token.name + "\" to not repeat, but got an array");
                  }
                  if (value.length === 0) {
                      if (optional)
                          { continue; }
                      throw new TypeError("Expected \"" + token.name + "\" to not be empty");
                  }
                  for (var j = 0; j < value.length; j++) {
                      var segment = encode(value[j], token);
                      if (validate && !matches[i].test(segment)) {
                          throw new TypeError("Expected all \"" + token.name + "\" to match \"" + token.pattern + "\", but got \"" + segment + "\"");
                      }
                      path += token.prefix + segment + token.suffix;
                  }
                  continue;
              }
              if (typeof value === "string" || typeof value === "number") {
                  var segment = encode(String(value), token);
                  if (validate && !matches[i].test(segment)) {
                      throw new TypeError("Expected \"" + token.name + "\" to match \"" + token.pattern + "\", but got \"" + segment + "\"");
                  }
                  path += token.prefix + segment + token.suffix;
                  continue;
              }
              if (optional)
                  { continue; }
              var typeOfMessage = repeat ? "an array" : "a string";
              throw new TypeError("Expected \"" + token.name + "\" to be " + typeOfMessage);
          }
          return path;
      };
  }
  /**
   * Escape a regular expression string.
   */
  function escapeString(str) {
      return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
  }
  /**
   * Get the flags for a regexp from the options.
   */
  function flags(options) {
      return options && options.sensitive ? "" : "i";
  }
  /**
   * Pull out keys from a regexp.
   */
  function regexpToRegexp(path, keys) {
      if (!keys)
          { return path; }
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);
      if (groups) {
          for (var i = 0; i < groups.length; i++) {
              keys.push({
                  name: i,
                  prefix: "",
                  suffix: "",
                  modifier: "",
                  pattern: ""
              });
          }
      }
      return path;
  }
  /**
   * Transform an array into a regexp.
   */
  function arrayToRegexp(paths, keys, options) {
      var parts = paths.map(function (path) { return pathToRegexp(path, keys, options).source; });
      return new RegExp("(?:" + parts.join("|") + ")", flags(options));
  }
  /**
   * Create a path regexp from string input.
   */
  function stringToRegexp(path, keys, options) {
      return tokensToRegexp(parse(path, options), keys, options);
  }
  /**
   * Expose a function for taking tokens and returning a RegExp.
   */
  function tokensToRegexp(tokens, keys, options) {
      if (options === void 0) { options = {}; }
      var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function (x) { return x; } : _d;
      var endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
      var delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
      var route = start ? "^" : "";
      // Iterate over the tokens and create our regexp string.
      for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
          var token = tokens_1[_i];
          if (typeof token === "string") {
              route += escapeString(encode(token));
          }
          else {
              var prefix = escapeString(encode(token.prefix));
              var suffix = escapeString(encode(token.suffix));
              if (token.pattern) {
                  if (keys)
                      { keys.push(token); }
                  if (prefix || suffix) {
                      if (token.modifier === "+" || token.modifier === "*") {
                          var mod = token.modifier === "*" ? "?" : "";
                          route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
                      }
                      else {
                          route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier;
                      }
                  }
                  else {
                      route += "(" + token.pattern + ")" + token.modifier;
                  }
              }
              else {
                  route += "(?:" + prefix + suffix + ")" + token.modifier;
              }
          }
      }
      if (end) {
          if (!strict)
              { route += delimiter + "?"; }
          route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
      }
      else {
          var endToken = tokens[tokens.length - 1];
          var isEndDelimited = typeof endToken === "string"
              ? delimiter.indexOf(endToken[endToken.length - 1]) > -1
              : // tslint:disable-next-line
                  endToken === undefined;
          if (!strict) {
              route += "(?:" + delimiter + "(?=" + endsWith + "))?";
          }
          if (!isEndDelimited) {
              route += "(?=" + delimiter + "|" + endsWith + ")";
          }
      }
      return new RegExp(route, flags(options));
  }
  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   */
  function pathToRegexp(path, keys, options) {
      if (path instanceof RegExp)
          { return regexpToRegexp(path, keys); }
      if (Array.isArray(path))
          { return arrayToRegexp(path, keys, options); }
      return stringToRegexp(path, keys, options);
  }

  var History = {
    queue: [],
    clearQueue: function clearQueue() {
      if (History.queue.length === 0) { return; }
      var currentQueue = History.queue.shift();
      currentQueue();
    },
    routerQueue: [],
    clearRouterQueue: function clearRouterQueue() {
      if (History.routerQueue.length === 0) { return; }
      var currentQueue = History.routerQueue.pop();
      var router = currentQueue.router;
      var stateUrl = currentQueue.stateUrl;
      var action = currentQueue.action;

      var animate = router.params.animate;
      if (router.params.pushStateAnimate === false) { animate = false; }

      if (action === 'back') {
        router.back({ animate: animate, pushState: false });
      }
      if (action === 'load') {
        router.navigate(stateUrl, { animate: animate, pushState: false });
      }
    },
    handle: function handle(e) {
      if (History.blockPopstate) { return; }
      var app = this;
      // const mainView = app.views.main;
      var state = e.state;
      History.previousState = History.state;
      History.state = state;

      History.allowChange = true;
      History.clearQueue();

      state = History.state;
      if (!state) { state = {}; }

      app.views.forEach(function (view) {
        var router = view.router;
        var viewState = state[view.id];
        if (!viewState && view.params.pushState) {
          viewState = {
            url: view.router.history[0],
          };
        }
        if (!viewState) { return; }
        var stateUrl = viewState.url || undefined;

        var animate = router.params.animate;
        if (router.params.pushStateAnimate === false) { animate = false; }

        if (stateUrl !== router.url) {
          if (router.history.indexOf(stateUrl) >= 0) {
            // Go Back
            if (router.allowPageChange) {
              router.back({ animate: animate, pushState: false });
            } else {
              History.routerQueue.push({
                action: 'back',
                router: router,
              });
            }
          } else if (router.allowPageChange) {
            // Load page
            router.navigate(stateUrl, { animate: animate, pushState: false });
          } else {
            History.routerQueue.unshift({
              action: 'load',
              stateUrl: stateUrl,
              router: router,
            });
          }
        }
      });
    },
    initViewState: function initViewState(viewId, viewState) {
      var obj;

      var newState = Utils.extend({}, (History.state || {}), ( obj = {}, obj[viewId] = viewState, obj ));
      History.state = newState;
      win.history.replaceState(newState, '');
    },
    push: function push(viewId, viewState, url) {
      var obj;

      if (!History.allowChange) {
        History.queue.push(function () {
          History.push(viewId, viewState, url);
        });
        return;
      }
      History.previousState = History.state;
      var newState = Utils.extend({}, (History.previousState || {}), ( obj = {}, obj[viewId] = viewState, obj ));
      History.state = newState;
      win.history.pushState(newState, '', url);
    },
    replace: function replace(viewId, viewState, url) {
      var obj;

      if (!History.allowChange) {
        History.queue.push(function () {
          History.replace(viewId, viewState, url);
        });
        return;
      }
      History.previousState = History.state;
      var newState = Utils.extend({}, (History.previousState || {}), ( obj = {}, obj[viewId] = viewState, obj ));
      History.state = newState;
      win.history.replaceState(newState, '', url);
    },
    go: function go(index) {
      History.allowChange = false;
      win.history.go(index);
    },
    back: function back() {
      History.allowChange = false;
      win.history.back();
    },
    allowChange: true,
    previousState: {},
    state: win.history.state,
    blockPopstate: true,
    init: function init(app) {
      $(win).on('load', function () {
        setTimeout(function () {
          History.blockPopstate = false;
        }, 0);
      });

      if (doc.readyState && doc.readyState === 'complete') {
        History.blockPopstate = false;
      }

      $(win).on('popstate', History.handle.bind(app));
    },
  };

  function SwipeBack(r) {
    var router = r;
    var $el = router.$el;
    var $navbarsEl = router.$navbarsEl;
    var app = router.app;
    var params = router.params;
    var isTouched = false;
    var isMoved = false;
    var touchesStart = {};
    var isScrolling;
    var $currentPageEl = [];
    var $previousPageEl = [];
    var viewContainerWidth;
    var touchesDiff;
    var allowViewTouchMove = true;
    var touchStartTime;
    var $currentNavbarEl = [];
    var $previousNavbarEl = [];
    var dynamicNavbar;
    var $pageShadowEl;
    var $pageOpacityEl;

    var animatableNavEls;

    var paramsSwipeBackAnimateShadow = params[((app.theme) + "SwipeBackAnimateShadow")];
    var paramsSwipeBackAnimateOpacity = params[((app.theme) + "SwipeBackAnimateOpacity")];
    var paramsSwipeBackActiveArea = params[((app.theme) + "SwipeBackActiveArea")];
    var paramsSwipeBackThreshold = params[((app.theme) + "SwipeBackThreshold")];

    var transformOrigin = app.rtl ? 'right center' : 'left center';
    var transformOriginTitleLarge = app.rtl
      ? 'calc(100% - var(--f7-navbar-large-title-padding-left) - var(--f7-safe-area-left)) center'
      : 'calc(var(--f7-navbar-large-title-padding-left) + var(--f7-safe-area-left)) center';


    function animatableNavElements() {
      var els = [];
      var inverter = app.rtl ? -1 : 1;
      var currentNavIsTransparent = $currentNavbarEl.hasClass('navbar-transparent') && !$currentNavbarEl.hasClass('navbar-large') && !$currentNavbarEl.hasClass('navbar-transparent-visible');
      var currentNavIsLarge = $currentNavbarEl.hasClass('navbar-large');
      var currentNavIsCollapsed = $currentNavbarEl.hasClass('navbar-large-collapsed');
      var currentNavIsLargeTransparent = $currentNavbarEl.hasClass('navbar-large-transparent')
        || (
          $currentNavbarEl.hasClass('navbar-large')
          && $currentNavbarEl.hasClass('navbar-transparent')
        );
      var previousNavIsTransparent = $previousNavbarEl.hasClass('navbar-transparent') && !$previousNavbarEl.hasClass('navbar-large') && !$previousNavbarEl.hasClass('navbar-transparent-visible');
      var previousNavIsLarge = $previousNavbarEl.hasClass('navbar-large');
      var previousNavIsCollapsed = $previousNavbarEl.hasClass('navbar-large-collapsed');
      var previousNavIsLargeTransparent = $previousNavbarEl.hasClass('navbar-large-transparent')
        || (
          $previousNavbarEl.hasClass('navbar-large')
          && $previousNavbarEl.hasClass('navbar-transparent')
        );
      var fromLarge = currentNavIsLarge && !currentNavIsCollapsed;
      var toLarge = previousNavIsLarge && !previousNavIsCollapsed;
      var $currentNavElements = $currentNavbarEl.find('.left, .title, .right, .subnavbar, .fading, .title-large, .navbar-bg');
      var $previousNavElements = $previousNavbarEl.find('.left, .title, .right, .subnavbar, .fading, .title-large, .navbar-bg');
      var activeNavBackIconText;
      var previousNavBackIconText;

      if (params.iosAnimateNavbarBackIcon) {
        if ($currentNavbarEl.hasClass('sliding') || $currentNavbarEl.find('.navbar-inner.sliding').length) {
          activeNavBackIconText = $currentNavbarEl.find('.left').find('.back .icon + span').eq(0);
        } else {
          activeNavBackIconText = $currentNavbarEl.find('.left.sliding').find('.back .icon + span').eq(0);
        }
        if ($previousNavbarEl.hasClass('sliding') || $previousNavbarEl.find('.navbar-inner.sliding').length) {
          previousNavBackIconText = $previousNavbarEl.find('.left').find('.back .icon + span').eq(0);
        } else {
          previousNavBackIconText = $previousNavbarEl.find('.left.sliding').find('.back .icon + span').eq(0);
        }
        if (activeNavBackIconText.length) {
          $previousNavElements.each(function (index, el) {
            if (!$(el).hasClass('title')) { return; }
            el.f7NavbarLeftOffset += activeNavBackIconText.prev('.icon')[0].offsetWidth;
          });
        }
      }
      $currentNavElements
        .each(function (index, navEl) {
          var $navEl = $(navEl);
          var isSubnavbar = $navEl.hasClass('subnavbar');
          var isLeft = $navEl.hasClass('left');
          var isTitle = $navEl.hasClass('title');
          var isBg = $navEl.hasClass('navbar-bg');
          if ((isTitle || isBg) && currentNavIsTransparent) { return; }
          if (!fromLarge && $navEl.hasClass('.title-large')) { return; }
          var el = {
            el: navEl,
          };
          if (fromLarge) {
            if (isTitle) { return; }
            if ($navEl.hasClass('title-large')) {
              if (els.indexOf(el) < 0) { els.push(el); }
              el.overflow = 'visible';
              $navEl.find('.title-large-text').each(function (subIndex, subNavEl) {
                els.push({
                  el: subNavEl,
                  transform: function (progress) { return ("translateX(" + (progress * 100 * inverter) + "%)"); },
                });
              });
              return;
            }
          }
          if (toLarge) {
            if (!fromLarge) {
              if ($navEl.hasClass('title-large')) {
                if (els.indexOf(el) < 0) { els.push(el); }
                el.opacity = 0;
              }
            }
            if (isLeft) {
              if (els.indexOf(el) < 0) { els.push(el); }
              el.opacity = function (progress) { return (1 - (Math.pow( progress, 0.33 ))); };
              $navEl.find('.back span').each(function (subIndex, subNavEl) {
                els.push({
                  el: subNavEl,
                  'transform-origin': transformOrigin,
                  transform: function (progress) { return ("translateX(calc(" + progress + " * (var(--f7-navbarTitleLargeOffset) - var(--f7-navbarLeftTextOffset)))) translateY(calc(" + progress + " * (var(--f7-navbar-large-title-height) - var(--f7-navbar-large-title-padding-vertical) / 2))) scale(" + (1 + (1 * progress)) + ")"); },
                });
              });
              return;
            }
          }
          if (isBg) {
            if (els.indexOf(el) < 0) { els.push(el); }
            if (!fromLarge && !toLarge) {
              if (currentNavIsCollapsed) {
                if (currentNavIsLargeTransparent) {
                  el.className = 'ios-swipeback-navbar-bg-large';
                }
                el.transform = function (progress) { return ("translateX(" + (100 * progress * inverter) + "%) translateY(calc(-1 * var(--f7-navbar-large-title-height)))"); };
              } else {
                el.transform = function (progress) { return ("translateX(" + (100 * progress * inverter) + "%)"); };
              }
            }
            if (!fromLarge && toLarge) {
              el.className = 'ios-swipeback-navbar-bg-large';
              el.transform = function (progress) { return ("translateX(" + (100 * progress * inverter) + "%) translateY(calc(-1 * " + (1 - progress) + " * var(--f7-navbar-large-title-height)))"); };
            }
            if (fromLarge && toLarge) {
              el.transform = function (progress) { return ("translateX(" + (100 * progress * inverter) + "%)"); };
            }
            if (fromLarge && !toLarge) {
              el.transform = function (progress) { return ("translateX(" + (100 * progress * inverter) + "%) translateY(calc(-" + progress + " * var(--f7-navbar-large-title-height)))"); };
            }
            return;
          }
          if ($navEl.hasClass('title-large')) { return; }
          var isSliding = $navEl.hasClass('sliding') || $navEl.parents('.navbar-inner.sliding').length;
          if (els.indexOf(el) < 0) { els.push(el); }
          if (!isSubnavbar || (isSubnavbar && !isSliding)) {
            el.opacity = function (progress) { return (1 - (Math.pow( progress, 0.33 ))); };
          }
          if (isSliding) {
            var transformTarget = el;
            if (isLeft && activeNavBackIconText.length && params.iosAnimateNavbarBackIcon) {
              var textEl = { el: activeNavBackIconText[0] };
              transformTarget = textEl;
              els.push(textEl);
            }
            transformTarget.transform = function (progress) {
              var activeNavTranslate = progress * transformTarget.el.f7NavbarRightOffset;
              if (Device.pixelRatio === 1) { activeNavTranslate = Math.round(activeNavTranslate); }
              if (isSubnavbar && currentNavIsLarge) {
                return ("translate3d(" + activeNavTranslate + "px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)");
              }
              return ("translate3d(" + activeNavTranslate + "px,0,0)");
            };
          }
        });
      $previousNavElements
        .each(function (index, navEl) {
          var $navEl = $(navEl);
          var isSubnavbar = $navEl.hasClass('subnavbar');
          var isLeft = $navEl.hasClass('left');
          var isTitle = $navEl.hasClass('title');
          var isBg = $navEl.hasClass('navbar-bg');
          if ((isTitle || isBg) && previousNavIsTransparent) { return; }
          var el = {
            el: navEl,
          };
          if (toLarge) {
            if (isTitle) { return; }
            if (els.indexOf(el) < 0) { els.push(el); }

            if ($navEl.hasClass('title-large')) {
              el.opacity = 1;
              el.overflow = 'visible';
              $navEl.find('.title-large-text').each(function (subIndex, subNavEl) {
                els.push({
                  el: subNavEl,
                  'transform-origin': transformOriginTitleLarge,
                  opacity: function (progress) { return (Math.pow( progress, 3 )); },
                  transform: function (progress) { return ("translateX(calc(" + (1 - progress) + " * (var(--f7-navbarLeftTextOffset) - var(--f7-navbarTitleLargeOffset)))) translateY(calc(" + (progress - 1) + " * var(--f7-navbar-large-title-height) + " + (1 - progress) + " * var(--f7-navbar-large-title-padding-vertical))) scale(" + (0.5 + progress * 0.5) + ")"); },
                });
              });
              return;
            }
          }
          if (isBg) {
            if (els.indexOf(el) < 0) { els.push(el); }
            if (!fromLarge && !toLarge) {
              if (previousNavIsCollapsed) {
                if (previousNavIsLargeTransparent) {
                  el.className = 'ios-swipeback-navbar-bg-large';
                }
                el.transform = function (progress) { return ("translateX(" + ((-100 + 100 * progress) * inverter) + "%) translateY(calc(-1 * var(--f7-navbar-large-title-height)))"); };
              } else {
                el.transform = function (progress) { return ("translateX(" + ((-100 + 100 * progress) * inverter) + "%)"); };
              }
            }
            if (!fromLarge && toLarge) {
              el.transform = function (progress) { return ("translateX(" + ((-100 + 100 * progress) * inverter) + "%) translateY(calc(-1 * " + (1 - progress) + " * var(--f7-navbar-large-title-height)))"); };
            }
            if (fromLarge && !toLarge) {
              el.className = 'ios-swipeback-navbar-bg-large';
              el.transform = function (progress) { return ("translateX(" + ((-100 + 100 * progress) * inverter) + "%) translateY(calc(-" + progress + " * var(--f7-navbar-large-title-height)))"); };
            }
            if (fromLarge && toLarge) {
              el.transform = function (progress) { return ("translateX(" + ((-100 + 100 * progress) * inverter) + "%)"); };
            }

            return;
          }
          if ($navEl.hasClass('title-large')) { return; }
          var isSliding = $navEl.hasClass('sliding') || $previousNavbarEl.children('.navbar-inner.sliding').length;
          if (els.indexOf(el) < 0) { els.push(el); }
          if (!isSubnavbar || (isSubnavbar && !isSliding)) {
            el.opacity = function (progress) { return (Math.pow( progress, 3 )); };
          }
          if (isSliding) {
            var transformTarget = el;
            if (isLeft && previousNavBackIconText.length && params.iosAnimateNavbarBackIcon) {
              var textEl = { el: previousNavBackIconText[0] };
              transformTarget = textEl;
              els.push(textEl);
            }
            transformTarget.transform = function (progress) {
              var previousNavTranslate = transformTarget.el.f7NavbarLeftOffset * (1 - progress);
              if (Device.pixelRatio === 1) { previousNavTranslate = Math.round(previousNavTranslate); }
              if (isSubnavbar && previousNavIsLarge) {
                return ("translate3d(" + previousNavTranslate + "px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)");
              }
              return ("translate3d(" + previousNavTranslate + "px,0,0)");
            };
          }
        });
      return els;
    }

    function setAnimatableNavElements(ref) {
      if ( ref === void 0 ) ref = {};
      var progress = ref.progress;
      var reset = ref.reset;
      var transition = ref.transition;

      var styles = ['overflow', 'transform', 'transform-origin', 'opacity'];
      for (var i = 0; i < animatableNavEls.length; i += 1) {
        var el = animatableNavEls[i];
        if (el && el.el) {
          if (transition === true) { el.el.classList.add('navbar-page-transitioning'); }
          if (transition === false) { el.el.classList.remove('navbar-page-transitioning'); }
          if (el.className && !el.classNameSet && !reset) {
            el.el.classList.add(el.className);
            el.classNameSet = true;
          }
          if (el.className && reset) {
            el.el.classList.remove(el.className);
          }
          for (var j = 0; j < styles.length; j += 1) {
            var styleProp = styles[j];
            if (el[styleProp]) {
              if (reset) {
                el.el.style[styleProp] = '';
              } else if (typeof el[styleProp] === 'function') {
                el.el.style[styleProp] = el[styleProp](progress);
              } else {
                el.el.style[styleProp] = el[styleProp];
              }
            }
          }
        }
      }
    }

    function handleTouchStart(e) {
      var swipeBackEnabled = params[((app.theme) + "SwipeBack")];
      if (!allowViewTouchMove || !swipeBackEnabled || isTouched || (app.swipeout && app.swipeout.el) || !router.allowPageChange) { return; }
      if ($(e.target).closest('.range-slider, .calendar-months').length > 0) { return; }
      if ($(e.target).closest('.page-master, .page-master-detail').length > 0 && params.masterDetailBreakpoint > 0 && app.width >= params.masterDetailBreakpoint) { return; }
      isMoved = false;
      isTouched = true;
      isScrolling = undefined;
      touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      touchStartTime = Utils.now();
      dynamicNavbar = router.dynamicNavbar;
    }
    function handleTouchMove(e) {
      if (!isTouched) { return; }
      var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
      var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
      if (typeof isScrolling === 'undefined') {
        isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x)) || (pageX < touchesStart.x && !app.rtl) || (pageX > touchesStart.x && app.rtl);
      }
      if (isScrolling || e.f7PreventSwipeBack || app.preventSwipeBack) {
        isTouched = false;
        return;
      }
      if (!isMoved) {
        // Calc values during first move fired
        var cancel = false;
        var target = $(e.target);

        var swipeout = target.closest('.swipeout');
        if (swipeout.length > 0) {
          if (!app.rtl && swipeout.find('.swipeout-actions-left').length > 0) { cancel = true; }
          if (app.rtl && swipeout.find('.swipeout-actions-right').length > 0) { cancel = true; }
        }

        $currentPageEl = target.closest('.page');
        if ($currentPageEl.hasClass('no-swipeback') || target.closest('.no-swipeback, .card-opened').length > 0) { cancel = true; }
        $previousPageEl = $el.find('.page-previous:not(.stacked)');
        if ($previousPageEl.length > 1) {
          $previousPageEl = $previousPageEl.eq($previousPageEl.length - 1);
        }
        var notFromBorder = touchesStart.x - $el.offset().left > paramsSwipeBackActiveArea;
        viewContainerWidth = $el.width();
        if (app.rtl) {
          notFromBorder = touchesStart.x < ($el.offset().left - $el[0].scrollLeft) + (viewContainerWidth - paramsSwipeBackActiveArea);
        } else {
          notFromBorder = touchesStart.x - $el.offset().left > paramsSwipeBackActiveArea;
        }
        if (notFromBorder) { cancel = true; }
        if ($previousPageEl.length === 0 || $currentPageEl.length === 0) { cancel = true; }
        if (cancel) {
          isTouched = false;
          return;
        }

        if (paramsSwipeBackAnimateShadow) {
          $pageShadowEl = $currentPageEl.find('.page-shadow-effect');
          if ($pageShadowEl.length === 0) {
            $pageShadowEl = $('<div class="page-shadow-effect"></div>');
            $currentPageEl.append($pageShadowEl);
          }
        }
        if (paramsSwipeBackAnimateOpacity) {
          $pageOpacityEl = $previousPageEl.find('.page-opacity-effect');
          if ($pageOpacityEl.length === 0) {
            $pageOpacityEl = $('<div class="page-opacity-effect"></div>');
            $previousPageEl.append($pageOpacityEl);
          }
        }

        if (dynamicNavbar) {
          $currentNavbarEl = $navbarsEl.find('.navbar-current:not(.stacked)');
          $previousNavbarEl = $navbarsEl.find('.navbar-previous:not(.stacked)');
          if ($previousNavbarEl.length > 1) {
            $previousNavbarEl = $previousNavbarEl.eq($previousNavbarEl.length - 1);
          }

          animatableNavEls = animatableNavElements();
        }

        // Close/Hide Any Picker
        if ($('.sheet.modal-in').length > 0 && app.sheet) {
          app.sheet.close($('.sheet.modal-in'));
        }
      }
      e.f7PreventSwipePanel = true;
      isMoved = true;
      app.preventSwipePanelBySwipeBack = true;
      e.preventDefault();

      // RTL inverter
      var inverter = app.rtl ? -1 : 1;

      // Touches diff
      touchesDiff = (pageX - touchesStart.x - paramsSwipeBackThreshold) * inverter;
      if (touchesDiff < 0) { touchesDiff = 0; }
      var percentage = Math.min(Math.max(touchesDiff / viewContainerWidth, 0), 1);

      // Swipe Back Callback
      var callbackData = {
        percentage: percentage,
        progress: percentage,
        currentPageEl: $currentPageEl[0],
        previousPageEl: $previousPageEl[0],
        currentNavbarEl: $currentNavbarEl[0],
        previousNavbarEl: $previousNavbarEl[0],
      };
      $el.trigger('swipeback:move', callbackData);
      router.emit('swipebackMove', callbackData);

      // Transform pages
      var currentPageTranslate = touchesDiff * inverter;
      var previousPageTranslate = ((touchesDiff / 5) - (viewContainerWidth / 5)) * inverter;
      if (!app.rtl) {
        currentPageTranslate = Math.min(currentPageTranslate, viewContainerWidth);
        previousPageTranslate = Math.min(previousPageTranslate, 0);
      } else {
        currentPageTranslate = Math.max(currentPageTranslate, -viewContainerWidth);
        previousPageTranslate = Math.max(previousPageTranslate, 0);
      }
      if (Device.pixelRatio === 1) {
        currentPageTranslate = Math.round(currentPageTranslate);
        previousPageTranslate = Math.round(previousPageTranslate);
      }

      router.swipeBackActive = true;
      $([$currentPageEl[0], $previousPageEl[0]]).addClass('page-swipeback-active');

      $currentPageEl.transform(("translate3d(" + currentPageTranslate + "px,0,0)"));
      if (paramsSwipeBackAnimateShadow) { $pageShadowEl[0].style.opacity = 1 - (1 * percentage); }

      if (app.theme === 'ios') {
        $previousPageEl.transform(("translate3d(" + previousPageTranslate + "px,0,0)"));
      }
      if (paramsSwipeBackAnimateOpacity) { $pageOpacityEl[0].style.opacity = 1 - (1 * percentage); }

      // Dynamic Navbars Animation
      if (!dynamicNavbar) { return; }

      setAnimatableNavElements({ progress: percentage });
    }
    function handleTouchEnd() {
      app.preventSwipePanelBySwipeBack = false;
      if (!isTouched || !isMoved) {
        isTouched = false;
        isMoved = false;
        return;
      }
      isTouched = false;
      isMoved = false;
      router.swipeBackActive = false;
      $([$currentPageEl[0], $previousPageEl[0]]).removeClass('page-swipeback-active');
      if (touchesDiff === 0) {
        $([$currentPageEl[0], $previousPageEl[0]]).transform('');
        if ($pageShadowEl && $pageShadowEl.length > 0) { $pageShadowEl.remove(); }
        if ($pageOpacityEl && $pageOpacityEl.length > 0) { $pageOpacityEl.remove(); }
        if (dynamicNavbar) {
          setAnimatableNavElements({ reset: true });
        }
        return;
      }
      var timeDiff = Utils.now() - touchStartTime;
      var pageChanged = false;
      // Swipe back to previous page
      if (
        (timeDiff < 300 && touchesDiff > 10)
        || (timeDiff >= 300 && touchesDiff > viewContainerWidth / 2)
      ) {
        $currentPageEl.removeClass('page-current').addClass(("page-next" + (app.theme !== 'ios' ? ' page-next-on-right' : '')));
        $previousPageEl.removeClass('page-previous').addClass('page-current').removeAttr('aria-hidden');
        if ($pageShadowEl) { $pageShadowEl[0].style.opacity = ''; }
        if ($pageOpacityEl) { $pageOpacityEl[0].style.opacity = ''; }
        if (dynamicNavbar) {
          router.setNavbarPosition($currentNavbarEl, 'next');
          router.setNavbarPosition($previousNavbarEl, 'current', false);
        }
        pageChanged = true;
      }
      // Reset custom styles
      // Add transitioning class for transition-duration
      $([$currentPageEl[0], $previousPageEl[0]]).addClass('page-transitioning page-transitioning-swipeback').transform('');

      if (dynamicNavbar) {
        setAnimatableNavElements({ progress: pageChanged ? 1 : 0, transition: true });
      }
      allowViewTouchMove = false;
      router.allowPageChange = false;

      // Swipe Back Callback
      var callbackData = {
        currentPageEl: $currentPageEl[0],
        previousPageEl: $previousPageEl[0],
        currentNavbarEl: $currentNavbarEl[0],
        previousNavbarEl: $previousNavbarEl[0],
      };

      if (pageChanged) {
        // Update Route
        router.currentRoute = $previousPageEl[0].f7Page.route;
        router.currentPage = $previousPageEl[0];

        // Page before animation callback
        router.pageCallback('beforeOut', $currentPageEl, $currentNavbarEl, 'current', 'next', { route: $currentPageEl[0].f7Page.route, swipeBack: true });
        router.pageCallback('beforeIn', $previousPageEl, $previousNavbarEl, 'previous', 'current', { route: $previousPageEl[0].f7Page.route, swipeBack: true }, $currentPageEl[0]);

        $el.trigger('swipeback:beforechange', callbackData);
        router.emit('swipebackBeforeChange', callbackData);
      } else {
        $el.trigger('swipeback:beforereset', callbackData);
        router.emit('swipebackBeforeReset', callbackData);
      }

      $currentPageEl.transitionEnd(function () {
        $([$currentPageEl[0], $previousPageEl[0]]).removeClass('page-transitioning page-transitioning-swipeback');
        if (dynamicNavbar) {
          setAnimatableNavElements({ reset: true, transition: false });
        }
        allowViewTouchMove = true;
        router.allowPageChange = true;
        if (pageChanged) {
          // Update History
          if (router.history.length === 1) {
            router.history.unshift(router.url);
          }
          router.history.pop();
          router.saveHistory();

          // Update push state
          if (params.pushState) {
            History.back();
          }

          // Page after animation callback
          router.pageCallback('afterOut', $currentPageEl, $currentNavbarEl, 'current', 'next', { route: $currentPageEl[0].f7Page.route, swipeBack: true });
          router.pageCallback('afterIn', $previousPageEl, $previousNavbarEl, 'previous', 'current', { route: $previousPageEl[0].f7Page.route, swipeBack: true });

          // Remove Old Page
          if (params.stackPages && router.initialPages.indexOf($currentPageEl[0]) >= 0) {
            $currentPageEl.addClass('stacked');
            if (dynamicNavbar) {
              $currentNavbarEl.addClass('stacked');
            }
          } else {
            router.pageCallback('beforeRemove', $currentPageEl, $currentNavbarEl, 'next', { swipeBack: true });
            router.removePage($currentPageEl);
            if (dynamicNavbar) {
              router.removeNavbar($currentNavbarEl);
            }
          }

          $el.trigger('swipeback:afterchange', callbackData);
          router.emit('swipebackAfterChange', callbackData);

          router.emit('routeChanged', router.currentRoute, router.previousRoute, router);

          if (params.preloadPreviousPage) {
            router.back(router.history[router.history.length - 2], { preload: true });
          }
        } else {
          $el.trigger('swipeback:afterreset', callbackData);
          router.emit('swipebackAfterReset', callbackData);
        }
        if ($pageShadowEl && $pageShadowEl.length > 0) { $pageShadowEl.remove(); }
        if ($pageOpacityEl && $pageOpacityEl.length > 0) { $pageOpacityEl.remove(); }
      });
    }

    function attachEvents() {
      var passiveListener = (app.touchEvents.start === 'touchstart' && Support.passiveListener) ? { passive: true, capture: false } : false;
      $el.on(app.touchEvents.start, handleTouchStart, passiveListener);
      app.on('touchmove:active', handleTouchMove);
      app.on('touchend:passive', handleTouchEnd);
    }
    function detachEvents() {
      var passiveListener = (app.touchEvents.start === 'touchstart' && Support.passiveListener) ? { passive: true, capture: false } : false;
      $el.off(app.touchEvents.start, handleTouchStart, passiveListener);
      app.off('touchmove:active', handleTouchMove);
      app.off('touchend:passive', handleTouchEnd);
    }

    attachEvents();

    router.on('routerDestroy', detachEvents);
  }

  function redirect (direction, route, options) {
    var router = this;
    var redirect = route.route.redirect;
    if (options.initial && router.params.pushState) {
      options.replaceState = true; // eslint-disable-line
      options.history = true; // eslint-disable-line
    }
    function redirectResolve(redirectUrl, redirectOptions) {
      if ( redirectOptions === void 0 ) redirectOptions = {};

      router.allowPageChange = true;
      router[direction](redirectUrl, Utils.extend({}, options, redirectOptions));
    }
    function redirectReject() {
      router.allowPageChange = true;
    }
    if (typeof redirect === 'function') {
      router.allowPageChange = false;
      var redirectUrl = redirect.call(router, route, redirectResolve, redirectReject);
      if (redirectUrl && typeof redirectUrl === 'string') {
        router.allowPageChange = true;
        return router[direction](redirectUrl, options);
      }
      return router;
    }
    return router[direction](redirect, options);
  }

  function processQueue(router, routerQueue, routeQueue, to, from, resolve, reject) {
    var queue = [];

    if (Array.isArray(routeQueue)) {
      queue.push.apply(queue, routeQueue);
    } else if (routeQueue && typeof routeQueue === 'function') {
      queue.push(routeQueue);
    }
    if (routerQueue) {
      if (Array.isArray(routerQueue)) {
        queue.push.apply(queue, routerQueue);
      } else {
        queue.push(routerQueue);
      }
    }

    function next() {
      if (queue.length === 0) {
        resolve();
        return;
      }
      var queueItem = queue.shift();

      queueItem.call(
        router,
        to,
        from,
        function () {
          next();
        },
        function () {
          reject();
        }
      );
    }
    next();
  }

  function processRouteQueue (to, from, resolve, reject) {
    var router = this;
    function enterNextRoute() {
      if (to && to.route && (router.params.routesBeforeEnter || to.route.beforeEnter)) {
        router.allowPageChange = false;
        processQueue(
          router,
          router.params.routesBeforeEnter,
          to.route.beforeEnter,
          to,
          from,
          function () {
            router.allowPageChange = true;
            resolve();
          },
          function () {
            reject();
          }
        );
      } else {
        resolve();
      }
    }
    function leaveCurrentRoute() {
      if (from && from.route && (router.params.routesBeforeLeave || from.route.beforeLeave)) {
        router.allowPageChange = false;
        processQueue(
          router,
          router.params.routesBeforeLeave,
          from.route.beforeLeave,
          to,
          from,
          function () {
            router.allowPageChange = true;
            enterNextRoute();
          },
          function () {
            reject();
          }
        );
      } else {
        enterNextRoute();
      }
    }
    leaveCurrentRoute();
  }

  function appRouterCheck (router, method) {
    if (!router.view) {
      throw new Error(("Framework7: it is not allowed to use router methods on global app router. Use router methods only on related View, e.g. app.views.main.router." + method + "(...)"));
    }
  }

  function asyncComponent (router, asyncComponent, resolve, reject) {
    function resolvePromise(componentPromise) {
      componentPromise
        .then(function (c) {
          // eslint-disable-next-line
          resolve({ component: c.default || c._default || c });
        })
        .catch(function (err) {
          reject();
          throw new Error(err);
        });
    }
    if (asyncComponent instanceof Promise) {
      resolvePromise(asyncComponent);
      return;
    }
    var asyncComponentResult = asyncComponent.call(router);
    if (asyncComponentResult instanceof Promise) {
      resolvePromise(asyncComponentResult);
    } else {
      resolve({ component: asyncComponentResult });
    }
  }

  function refreshPage() {
    var router = this;
    appRouterCheck(router, 'refreshPage');
    return router.navigate(router.currentRoute.url, {
      ignoreCache: true,
      reloadCurrent: true,
    });
  }

  function forward(el, forwardOptions) {
    if ( forwardOptions === void 0 ) forwardOptions = {};

    var router = this;
    var $el = $(el);
    var app = router.app;
    var view = router.view;
    var options = Utils.extend(false, {
      animate: router.params.animate,
      pushState: true,
      replaceState: false,
      history: true,
      reloadCurrent: router.params.reloadPages,
      reloadPrevious: false,
      reloadAll: false,
      clearPreviousHistory: false,
      reloadDetail: router.params.reloadDetail,
      on: {},
    }, forwardOptions);

    var masterDetailEnabled = router.params.masterDetailBreakpoint > 0;
    var isMaster = masterDetailEnabled && options.route && options.route.route && options.route.route.master === true;
    var masterPageEl;
    var otherDetailPageEl;

    var currentRouteIsModal = router.currentRoute.modal;
    var modalType;
    if (!currentRouteIsModal) {
      ('popup popover sheet loginScreen actions customModal panel').split(' ').forEach(function (modalLoadProp) {
        if (router.currentRoute && router.currentRoute.route && router.currentRoute.route[modalLoadProp]) {
          currentRouteIsModal = true;
          modalType = modalLoadProp;
        }
      });
    }

    if (currentRouteIsModal) {
      var modalToClose = router.currentRoute.modal
                           || router.currentRoute.route.modalInstance
                           || app[modalType].get();
      var previousUrl = router.history[router.history.length - 2];
      var previousRoute = router.findMatchingRoute(previousUrl);
      if (!previousRoute && previousUrl) {
        previousRoute = {
          url: previousUrl,
          path: previousUrl.split('?')[0],
          query: Utils.parseUrlQuery(previousUrl),
          route: {
            path: previousUrl.split('?')[0],
            url: previousUrl,
          },
        };
      }

      router.modalRemove(modalToClose);
    }

    var dynamicNavbar = router.dynamicNavbar;

    var $viewEl = router.$el;
    var $newPage = $el;
    var reload = options.reloadPrevious || options.reloadCurrent || options.reloadAll;
    var $oldPage;

    var $navbarsEl;
    var $newNavbarEl;
    var $oldNavbarEl;

    router.allowPageChange = false;
    if ($newPage.length === 0) {
      router.allowPageChange = true;
      return router;
    }

    if ($newPage.length) {
      // Remove theme elements
      router.removeThemeElements($newPage);
    }

    if (dynamicNavbar) {
      $newNavbarEl = $newPage.children('.navbar');
      $navbarsEl = router.$navbarsEl;
      if ($newNavbarEl.length === 0 && $newPage[0] && $newPage[0].f7Page) {
        // Try from pageData
        $newNavbarEl = $newPage[0].f7Page.$navbarEl;
      }
    }

    // Save Keep Alive Cache
    if (options.route && options.route.route && options.route.route.keepAlive && !options.route.route.keepAliveData) {
      options.route.route.keepAliveData = {
        pageEl: $el[0],
      };
    }

    // Pages In View
    var $pagesInView = $viewEl
      .children('.page:not(.stacked)')
      .filter(function (index, pageInView) { return pageInView !== $newPage[0]; });

    // Navbars In View
    var $navbarsInView;
    if (dynamicNavbar) {
      $navbarsInView = $navbarsEl
        .children('.navbar:not(.stacked)')
        .filter(function (index, navbarInView) { return navbarInView !== $newNavbarEl[0]; });
    }

    // Exit when reload previous and only 1 page in view so nothing ro reload
    if (options.reloadPrevious && $pagesInView.length < 2) {
      router.allowPageChange = true;
      return router;
    }

    // Find Detail' master page
    var isDetail;
    var reloadDetail;
    var isDetailRoot;
    if (masterDetailEnabled && !options.reloadAll) {
      for (var i = 0; i < $pagesInView.length; i += 1) {
        if (!masterPageEl
          && $pagesInView[i].classList.contains('page-master')
        ) {
          masterPageEl = $pagesInView[i];
          continue; // eslint-disable-line
        }
      }
      isDetail = !isMaster && masterPageEl;

      if (isDetail) {
        // Find Other Detail
        if (masterPageEl) {
          for (var i$1 = 0; i$1 < $pagesInView.length; i$1 += 1) {
            if ($pagesInView[i$1].classList.contains('page-master-detail')
            ) {
              otherDetailPageEl = $pagesInView[i$1];
              continue; // eslint-disable-line
            }
          }
        }
      }
      reloadDetail = isDetail && options.reloadDetail && app.width >= router.params.masterDetailBreakpoint && masterPageEl;
    }
    if (isDetail) {
      isDetailRoot = !otherDetailPageEl || reloadDetail || options.reloadAll || options.reloadCurrent;
    }

    // New Page
    var newPagePosition = 'next';
    if (options.reloadCurrent || options.reloadAll || reloadDetail) {
      newPagePosition = 'current';
    } else if (options.reloadPrevious) {
      newPagePosition = 'previous';
    }
    $newPage
      .removeClass('page-previous page-current page-next')
      .addClass(("page-" + newPagePosition + (isMaster ? ' page-master' : '') + (isDetail ? ' page-master-detail' : '') + (isDetailRoot ? ' page-master-detail-root' : '')))
      .removeClass('stacked')
      .trigger('page:unstack')
      .trigger('page:position', { position: newPagePosition });
    router.emit('pageUnstack', $newPage[0]);
    router.emit('pagePosition', $newPage[0], newPagePosition);

    if (isMaster || isDetail) {
      $newPage.trigger('page:role', { role: isMaster ? 'master' : 'detail', root: !!isDetailRoot });
      router.emit('pageRole', $newPage[0], { role: isMaster ? 'master' : 'detail', detailRoot: !!isDetailRoot });
    }

    if (dynamicNavbar && $newNavbarEl.length) {
      $newNavbarEl
        .removeClass('navbar-previous navbar-current navbar-next')
        .addClass(("navbar-" + newPagePosition + (isMaster ? ' navbar-master' : '') + (isDetail ? ' navbar-master-detail' : '') + (isDetailRoot ? ' navbar-master-detail-root' : '')))
        .removeClass('stacked');
      $newNavbarEl.trigger('navbar:position', { position: newPagePosition });
      router.emit('navbarPosition', $newNavbarEl[0], newPagePosition);
      if (isMaster || isDetail) {
        router.emit('navbarRole', $newNavbarEl[0], { role: isMaster ? 'master' : 'detail', detailRoot: !!isDetailRoot });
      }
    }

    // Find Old Page
    if (options.reloadCurrent || reloadDetail) {
      $oldPage = $pagesInView.eq($pagesInView.length - 1);
      if (dynamicNavbar) {
        // $oldNavbarEl = $navbarsInView.eq($pagesInView.length - 1);
        $oldNavbarEl = $(app.navbar.getElByPage($oldPage));
      }
    } else if (options.reloadPrevious) {
      $oldPage = $pagesInView.eq($pagesInView.length - 2);
      if (dynamicNavbar) {
        // $oldNavbarEl = $navbarsInView.eq($pagesInView.length - 2);
        $oldNavbarEl = $(app.navbar.getElByPage($oldPage));
      }
    } else if (options.reloadAll) {
      $oldPage = $pagesInView.filter(function (index, pageEl) { return pageEl !== $newPage[0]; });
      if (dynamicNavbar) {
        $oldNavbarEl = $navbarsInView.filter(function (index, navbarEl) { return navbarEl !== $newNavbarEl[0]; });
      }
    } else {
      var removedPageEls = [];
      var removedNavbarEls = [];
      if ($pagesInView.length > 1) {
        var i$2 = 0;
        for (i$2 = 0; i$2 < $pagesInView.length - 1; i$2 += 1) {
          if (masterPageEl
            && $pagesInView[i$2] === masterPageEl
          ) {
            $pagesInView.eq(i$2).addClass('page-master-stacked');
            $pagesInView.eq(i$2).trigger('page:masterstack');
            router.emit('pageMasterStack', $pagesInView[i$2]);
            if (dynamicNavbar) {
              $(app.navbar.getElByPage(masterPageEl)).addClass('navbar-master-stacked');
              router.emit('navbarMasterStack', app.navbar.getElByPage(masterPageEl));
            }
            continue; // eslint-disable-line
          }
          var oldNavbarEl = app.navbar.getElByPage($pagesInView.eq(i$2));
          if (router.params.stackPages) {
            $pagesInView.eq(i$2).addClass('stacked');
            $pagesInView.eq(i$2).trigger('page:stack');
            router.emit('pageStack', $pagesInView[i$2]);
            if (dynamicNavbar) {
              $(oldNavbarEl).addClass('stacked');
            }
          } else {
            // Page remove event
            removedPageEls.push($pagesInView[i$2]);
            router.pageCallback('beforeRemove', $pagesInView[i$2], $navbarsInView && $navbarsInView[i$2], 'previous', undefined, options);
            router.removePage($pagesInView[i$2]);
            if (dynamicNavbar && oldNavbarEl) {
              removedNavbarEls.push(oldNavbarEl);
              router.removeNavbar(oldNavbarEl);
            }
          }
        }
      }
      $oldPage = $viewEl
        .children('.page:not(.stacked)')
        .filter(function (index, pageEl) { return pageEl !== $newPage[0] && removedPageEls.indexOf(pageEl) < 0; });
      if (dynamicNavbar) {
        $oldNavbarEl = $navbarsEl
          .children('.navbar:not(.stacked)')
          .filter(function (index, navbarEl) { return navbarEl !== $newNavbarEl[0] && removedNavbarEls.indexOf(removedNavbarEls) < 0; });
      }
      removedPageEls = [];
      removedNavbarEls = [];
    }

    if (isDetail && !options.reloadAll) {
      if ($oldPage.length > 1 || reloadDetail) {
        $oldPage = $oldPage.filter(function (pageIndex, pageEl) { return !pageEl.classList.contains('page-master'); });
      }
      if ($oldNavbarEl && ($oldNavbarEl.length > 1 || reloadDetail)) {
        $oldNavbarEl = $oldNavbarEl.filter(function (navbarIndex, navbarEl) { return !navbarEl.classList.contains('navbar-master'); });
      }
    }

    // Push State
    if (router.params.pushState && (options.pushState || options.replaceState) && !options.reloadPrevious) {
      var pushStateRoot = router.params.pushStateRoot || '';
      History[options.reloadCurrent || (reloadDetail && otherDetailPageEl) || options.reloadAll || options.replaceState ? 'replace' : 'push'](
        view.id,
        {
          url: options.route.url,
        },
        pushStateRoot + router.params.pushStateSeparator + options.route.url
      );
    }

    if (!options.reloadPrevious) {
      // Current Page & Navbar
      router.currentPageEl = $newPage[0];
      if (dynamicNavbar && $newNavbarEl.length) {
        router.currentNavbarEl = $newNavbarEl[0];
      } else {
        delete router.currentNavbarEl;
      }

      // Current Route
      router.currentRoute = options.route;
    }

    // Update router history
    var url = options.route.url;

    if (options.history) {
      if (((options.reloadCurrent || (reloadDetail && otherDetailPageEl)) && router.history.length) > 0 || options.replaceState) {
        router.history[router.history.length - (options.reloadPrevious ? 2 : 1)] = url;
      } else if (options.reloadPrevious) {
        router.history[router.history.length - 2] = url;
      } else if (options.reloadAll) {
        router.history = [url];
      } else {
        router.history.push(url);
      }
    }
    router.saveHistory();

    // Insert new page and navbar
    var newPageInDom = $newPage.parents(doc).length > 0;
    var f7Component = $newPage[0].f7Component;
    if (options.reloadPrevious) {
      if (f7Component && !newPageInDom) {
        f7Component.$mount(function (componentEl) {
          $(componentEl).insertBefore($oldPage);
        });
      } else {
        $newPage.insertBefore($oldPage);
      }
      if (dynamicNavbar && $newNavbarEl.length) {
        if ($newNavbarEl.find('.title-large').length) {
          $newNavbarEl.addClass('navbar-large');
        }
        if ($oldNavbarEl.length) {
          $newNavbarEl.insertBefore($oldNavbarEl);
        } else {
          if (!router.$navbarsEl.parents(doc).length) {
            router.$el.prepend(router.$navbarsEl);
          }
          $navbarsEl.append($newNavbarEl);
        }
      }
    } else {
      if ($oldPage.next('.page')[0] !== $newPage[0]) {
        if (f7Component && !newPageInDom) {
          f7Component.$mount(function (componentEl) {
            $viewEl.append(componentEl);
          });
        } else {
          $viewEl.append($newPage[0]);
        }
      }
      if (dynamicNavbar && $newNavbarEl.length) {
        if ($newNavbarEl.find('.title-large').length) {
          $newNavbarEl.addClass('navbar-large');
        }
        if (!router.$navbarsEl.parents(doc).length) {
          router.$el.prepend(router.$navbarsEl);
        }
        $navbarsEl.append($newNavbarEl[0]);
      }
    }
    if (!newPageInDom) {
      router.pageCallback('mounted', $newPage, $newNavbarEl, newPagePosition, (reload ? newPagePosition : 'current'), options, $oldPage);
    } else if (options.route && options.route.route && options.route.route.keepAlive && !$newPage[0].f7PageMounted) {
      $newPage[0].f7PageMounted = true;
      router.pageCallback('mounted', $newPage, $newNavbarEl, newPagePosition, (reload ? newPagePosition : 'current'), options, $oldPage);
    }

    // Remove old page
    if ((options.reloadCurrent || reloadDetail) && $oldPage.length > 0) {
      if (router.params.stackPages && router.initialPages.indexOf($oldPage[0]) >= 0) {
        $oldPage.addClass('stacked');
        $oldPage.trigger('page:stack');
        router.emit('pageStack', $oldPage[0]);
        if (dynamicNavbar) {
          $oldNavbarEl.addClass('stacked');
        }
      } else {
        // Page remove event
        router.pageCallback('beforeOut', $oldPage, $oldNavbarEl, 'current', undefined, options);
        router.pageCallback('afterOut', $oldPage, $oldNavbarEl, 'current', undefined, options);
        router.pageCallback('beforeRemove', $oldPage, $oldNavbarEl, 'current', undefined, options);
        router.removePage($oldPage);
        if (dynamicNavbar && $oldNavbarEl && $oldNavbarEl.length) {
          router.removeNavbar($oldNavbarEl);
        }
      }
    } else if (options.reloadAll) {
      $oldPage.each(function (index, pageEl) {
        var $oldPageEl = $(pageEl);
        var $oldNavbarElEl = $(app.navbar.getElByPage($oldPageEl));
        if (router.params.stackPages && router.initialPages.indexOf($oldPageEl[0]) >= 0) {
          $oldPageEl.addClass('stacked');
          $oldPageEl.trigger('page:stack');
          router.emit('pageStack', $oldPageEl[0]);
          if (dynamicNavbar) {
            $oldNavbarElEl.addClass('stacked');
          }
        } else {
          // Page remove event
          if ($oldPageEl.hasClass('page-current')) {
            router.pageCallback('beforeOut', $oldPage, $oldNavbarEl, 'current', undefined, options);
            router.pageCallback('afterOut', $oldPage, $oldNavbarEl, 'current', undefined, options);
          }
          router.pageCallback('beforeRemove', $oldPageEl, $oldNavbarEl && $oldNavbarEl.eq(index), 'previous', undefined, options);
          router.removePage($oldPageEl);
          if (dynamicNavbar && $oldNavbarElEl.length) {
            router.removeNavbar($oldNavbarElEl);
          }
        }
      });
    } else if (options.reloadPrevious) {
      if (router.params.stackPages && router.initialPages.indexOf($oldPage[0]) >= 0) {
        $oldPage.addClass('stacked');
        $oldPage.trigger('page:stack');
        router.emit('pageStack', $oldPage[0]);
        if (dynamicNavbar) {
          $oldNavbarEl.addClass('stacked');
        }
      } else {
        // Page remove event
        router.pageCallback('beforeRemove', $oldPage, $oldNavbarEl, 'previous', undefined, options);
        router.removePage($oldPage);
        if (dynamicNavbar && $oldNavbarEl && $oldNavbarEl.length) {
          router.removeNavbar($oldNavbarEl);
        }
      }
    }

    // Load Tab
    if (options.route.route.tab) {
      router.tabLoad(options.route.route.tab, Utils.extend({}, options, {
        history: false,
        pushState: false,
      }));
    }

    // Check master detail
    if (masterDetailEnabled) {
      view.checkMasterDetailBreakpoint();
    }

    // Page init and before init events
    router.pageCallback('init', $newPage, $newNavbarEl, newPagePosition, reload ? newPagePosition : 'current', options, $oldPage);

    if (options.reloadCurrent || options.reloadAll || reloadDetail) {
      router.allowPageChange = true;
      router.pageCallback('beforeIn', $newPage, $newNavbarEl, newPagePosition, 'current', options);
      $newPage.removeAttr('aria-hidden');
      if (dynamicNavbar && $newNavbarEl) {
        $newNavbarEl.removeAttr('aria-hidden');
      }
      router.pageCallback('afterIn', $newPage, $newNavbarEl, newPagePosition, 'current', options);
      if (options.reloadCurrent && options.clearPreviousHistory) { router.clearPreviousHistory(); }
      if (reloadDetail) {
        router.setPagePosition($(masterPageEl), 'previous');
        if (masterPageEl.f7Page && masterPageEl.f7Page.navbarEl) {
          router.setNavbarPosition($(masterPageEl.f7Page.navbarEl), 'previous');
        }
      }
      return router;
    }
    if (options.reloadPrevious) {
      router.allowPageChange = true;
      return router;
    }

    // Before animation event
    router.pageCallback('beforeOut', $oldPage, $oldNavbarEl, 'current', 'previous', options);
    router.pageCallback('beforeIn', $newPage, $newNavbarEl, 'next', 'current', options);

    // Animation
    function afterAnimation() {
      router.setPagePosition($newPage, 'current', false);
      router.setPagePosition($oldPage, 'previous', !$oldPage.hasClass('page-master'));
      if (dynamicNavbar) {
        router.setNavbarPosition($newNavbarEl, 'current', false);
        router.setNavbarPosition($oldNavbarEl, 'previous', !$oldNavbarEl.hasClass('navbar-master'));
      }
      // After animation event
      router.allowPageChange = true;
      router.pageCallback('afterOut', $oldPage, $oldNavbarEl, 'current', 'previous', options);
      router.pageCallback('afterIn', $newPage, $newNavbarEl, 'next', 'current', options);

      var keepOldPage = (router.params.preloadPreviousPage || router.params[((app.theme) + "SwipeBack")]) && !isMaster;
      if (!keepOldPage) {
        if ($newPage.hasClass('smart-select-page') || $newPage.hasClass('photo-browser-page') || $newPage.hasClass('autocomplete-page') || $newPage.hasClass('color-picker-page')) {
          keepOldPage = true;
        }
      }
      if (!keepOldPage) {
        if (router.params.stackPages) {
          $oldPage.addClass('stacked');
          $oldPage.trigger('page:stack');
          router.emit('pageStack', $oldPage[0]);
          if (dynamicNavbar) {
            $oldNavbarEl.addClass('stacked');
          }
        } else if (!($newPage.attr('data-name') && $newPage.attr('data-name') === 'smart-select-page')) {
          // Remove event
          router.pageCallback('beforeRemove', $oldPage, $oldNavbarEl, 'previous', undefined, options);
          router.removePage($oldPage);
          if (dynamicNavbar && $oldNavbarEl.length) {
            router.removeNavbar($oldNavbarEl);
          }
        }
      }
      if (options.clearPreviousHistory) { router.clearPreviousHistory(); }
      router.emit('routeChanged', router.currentRoute, router.previousRoute, router);

      if (router.params.pushState) {
        History.clearRouterQueue();
      }
    }
    function setPositionClasses() {
      router.setPagePosition($oldPage, 'current', false);
      router.setPagePosition($newPage, 'next', false);
      if (dynamicNavbar) {
        router.setNavbarPosition($oldNavbarEl, 'current', false);
        router.setNavbarPosition($newNavbarEl, 'next', false);
      }
    }
    if (options.animate && !(isMaster && app.width >= router.params.masterDetailBreakpoint)) {
      var delay = router.params[((router.app.theme) + "PageLoadDelay")];
      var transition = router.params.transition;
      if (options.transition) { transition = options.transition; }
      if (!transition && router.currentRoute && router.currentRoute.route) {
        transition = router.currentRoute.route.transition;
      }
      if (!transition && router.currentRoute && router.currentRoute.route.options) {
        transition = router.currentRoute.route.options.transition;
      }
      if (transition) {
        $newPage[0].f7PageTransition = transition;
      }

      if (delay) {
        setTimeout(function () {
          setPositionClasses();
          router.animate($oldPage, $newPage, $oldNavbarEl, $newNavbarEl, 'forward', transition, function () {
            afterAnimation();
          });
        }, delay);
      } else {
        setPositionClasses();
        router.animate($oldPage, $newPage, $oldNavbarEl, $newNavbarEl, 'forward', transition, function () {
          afterAnimation();
        });
      }
    } else {
      afterAnimation();
    }
    return router;
  }
  function load(loadParams, loadOptions, ignorePageChange) {
    if ( loadParams === void 0 ) loadParams = {};
    if ( loadOptions === void 0 ) loadOptions = {};

    var router = this;
    if (!router.allowPageChange && !ignorePageChange) { return router; }
    var params = loadParams;
    var options = loadOptions;
    var url = params.url;
    var content = params.content;
    var el = params.el;
    var pageName = params.pageName;
    var template = params.template;
    var templateUrl = params.templateUrl;
    var component = params.component;
    var componentUrl = params.componentUrl;

    if (!options.reloadCurrent
      && options.route
      && options.route.route
      && options.route.route.parentPath
      && router.currentRoute.route
      && router.currentRoute.route.parentPath === options.route.route.parentPath) {
      // Do something nested
      if (options.route.url === router.url) {
        router.allowPageChange = true;
        return false;
      }
      // Check for same params
      var sameParams = Object.keys(options.route.params).length === Object.keys(router.currentRoute.params).length;
      if (sameParams) {
        // Check for equal params name
        Object.keys(options.route.params).forEach(function (paramName) {
          if (
            !(paramName in router.currentRoute.params)
            || (router.currentRoute.params[paramName] !== options.route.params[paramName])
          ) {
            sameParams = false;
          }
        });
      }
      if (sameParams) {
        if (options.route.route.tab) {
          return router.tabLoad(options.route.route.tab, options);
        }
        return false;
      }
      if (!sameParams
        && options.route.route.tab
        && router.currentRoute.route.tab
        && router.currentRoute.parentPath === options.route.parentPath
      ) {
        return router.tabLoad(options.route.route.tab, options);
      }
    }

    if (
      options.route
      && options.route.url
      && router.url === options.route.url
      && !(options.reloadCurrent || options.reloadPrevious)
      && !router.params.allowDuplicateUrls
    ) {
      router.allowPageChange = true;
      return false;
    }

    if (!options.route && url) {
      options.route = router.parseRouteUrl(url);
      Utils.extend(options.route, { route: { url: url, path: url } });
    }

    // Component Callbacks
    function resolve(pageEl, newOptions) {
      return router.forward(pageEl, Utils.extend(options, newOptions));
    }
    function reject() {
      router.allowPageChange = true;
      return router;
    }

    if (url || templateUrl || componentUrl) {
      router.allowPageChange = false;
    }

    // Proceed
    if (content) {
      router.forward(router.getPageEl(content), options);
    } else if (template || templateUrl) {
      // Parse template and send page element
      try {
        router.pageTemplateLoader(template, templateUrl, options, resolve, reject);
      } catch (err) {
        router.allowPageChange = true;
        throw err;
      }
    } else if (el) {
      // Load page from specified HTMLElement or by page name in pages container
      router.forward(router.getPageEl(el), options);
    } else if (pageName) {
      // Load page by page name in pages container
      router.forward(router.$el.children((".page[data-name=\"" + pageName + "\"]")).eq(0), options);
    } else if (component || componentUrl) {
      // Load from component (F7/Vue/React/...)
      try {
        router.pageComponentLoader(router.el, component, componentUrl, options, resolve, reject);
      } catch (err$1) {
        router.allowPageChange = true;
        throw err$1;
      }
    } else if (url) {
      // Load using XHR
      if (router.xhr) {
        router.xhr.abort();
        router.xhr = false;
      }
      router.xhrRequest(url, options)
        .then(function (pageContent) {
          router.forward(router.getPageEl(pageContent), options);
        })
        .catch(function () {
          router.allowPageChange = true;
        });
    }
    return router;
  }
  function navigate(navigateParams, navigateOptions) {
    if ( navigateOptions === void 0 ) navigateOptions = {};

    var router = this;
    if (router.swipeBackActive) { return router; }
    var url;
    var createRoute;
    var name;
    var query;
    var params;
    var route;
    if (typeof navigateParams === 'string') {
      url = navigateParams;
    } else {
      url = navigateParams.url;
      createRoute = navigateParams.route;
      name = navigateParams.name;
      query = navigateParams.query;
      params = navigateParams.params;
    }
    if (name) {
      url = router.generateUrl({ name: name, params: params, query: query });
      if (url) {
        return router.navigate(url, navigateOptions);
      }
      return router;
    }
    var app = router.app;
    appRouterCheck(router, 'navigate');
    if (url === '#' || url === '') {
      return router;
    }

    var navigateUrl = url.replace('./', '');
    if (navigateUrl[0] !== '/' && navigateUrl.indexOf('#') !== 0) {
      var currentPath = router.currentRoute.parentPath || router.currentRoute.path;
      navigateUrl = ((currentPath ? (currentPath + "/") : '/') + navigateUrl)
        .replace('///', '/')
        .replace('//', '/');
    }
    if (createRoute) {
      route = Utils.extend(router.parseRouteUrl(navigateUrl), {
        route: Utils.extend({}, createRoute),
      });
    } else {
      route = router.findMatchingRoute(navigateUrl);
    }

    if (!route) {
      return router;
    }
    if (route.route && route.route.viewName) {
      var anotherViewName = route.route.viewName;
      var anotherView = app.views[anotherViewName];
      if (!anotherView) {
        throw new Error(("Framework7: There is no View with \"" + anotherViewName + "\" name that was specified in this route"));
      }
      if (anotherView !== router.view) {
        return anotherView.router.navigate(navigateParams, navigateOptions);
      }
    }

    if (route.route.redirect) {
      return redirect.call(router, 'navigate', route, navigateOptions);
    }


    var options = {};
    if (route.route.options) {
      Utils.extend(options, route.route.options, navigateOptions);
    } else {
      Utils.extend(options, navigateOptions);
    }
    options.route = route;

    if (options && options.context) {
      route.context = options.context;
      options.route.context = options.context;
    }

    function resolve() {
      var routerLoaded = false;
      ('popup popover sheet loginScreen actions customModal panel').split(' ').forEach(function (modalLoadProp) {
        if (route.route[modalLoadProp] && !routerLoaded) {
          routerLoaded = true;
          router.modalLoad(modalLoadProp, route, options);
        }
      });
      if (route.route.keepAlive && route.route.keepAliveData) {
        router.load({ el: route.route.keepAliveData.pageEl }, options, false);
        routerLoaded = true;
      }
      ('url content component pageName el componentUrl template templateUrl').split(' ').forEach(function (pageLoadProp) {
        var obj;

        if (route.route[pageLoadProp] && !routerLoaded) {
          routerLoaded = true;
          router.load(( obj = {}, obj[pageLoadProp] = route.route[pageLoadProp], obj ), options, false);
        }
      });
      if (routerLoaded) { return; }
      // Async
      function asyncResolve(resolveParams, resolveOptions) {
        router.allowPageChange = false;
        var resolvedAsModal = false;
        if (resolveOptions && resolveOptions.context) {
          if (!route.context) { route.context = resolveOptions.context; }
          else { route.context = Utils.extend({}, route.context, resolveOptions.context); }
          options.route.context = route.context;
        }
        ('popup popover sheet loginScreen actions customModal panel').split(' ').forEach(function (modalLoadProp) {
          if (resolveParams[modalLoadProp]) {
            resolvedAsModal = true;
            var modalRoute = Utils.extend({}, route, { route: resolveParams });
            router.allowPageChange = true;
            router.modalLoad(modalLoadProp, modalRoute, Utils.extend(options, resolveOptions));
          }
        });
        if (resolvedAsModal) { return; }
        router.load(resolveParams, Utils.extend(options, resolveOptions), true);
      }
      function asyncReject() {
        router.allowPageChange = true;
      }
      if (route.route.async) {
        router.allowPageChange = false;
        route.route.async.call(router, options.route, router.currentRoute, asyncResolve, asyncReject);
      }
      if (route.route.asyncComponent) {
        asyncComponent(router, route.route.asyncComponent, asyncResolve, asyncReject);
      }
    }
    function reject() {
      router.allowPageChange = true;
    }

    if (router.params.masterDetailBreakpoint > 0 && route.route.masterRoute) {
      // load detail route
      var preloadMaster = true;
      var masterLoaded = false;
      if (router.currentRoute && router.currentRoute.route) {
        if (
          router.currentRoute.route.master
          && (
            router.currentRoute.route === route.route.masterRoute
            || router.currentRoute.route.path === route.route.masterRoute.path
          )
        ) {
          preloadMaster = false;
        }
        if (
          router.currentRoute.route.masterRoute
          && (router.currentRoute.route.masterRoute === route.route.masterRoute
            || router.currentRoute.route.masterRoute.path === route.route.masterRoute.path
          )
        ) {
          preloadMaster = false;
          masterLoaded = true;
        }
      }
      if (preloadMaster || (masterLoaded && navigateOptions.reloadAll)) {
        router.navigate(route.route.masterRoute.path, {
          animate: false,
          reloadAll: navigateOptions.reloadAll,
          reloadCurrent: navigateOptions.reloadCurrent,
          reloadPrevious: navigateOptions.reloadPrevious,
          pushState: !navigateOptions.initial,
          history: !navigateOptions.initial,
          once: {
            pageAfterIn: function pageAfterIn() {
              router.navigate(navigateParams, Utils.extend({}, navigateOptions, {
                animate: false,
                reloadAll: false,
                reloadCurrent: false,
                reloadPrevious: false,
                history: !navigateOptions.initial,
                pushState: !navigateOptions.initial,
              }));
            },
          },
        });
        return router;
      }
    }

    processRouteQueue.call(
      router,
      route,
      router.currentRoute,
      function () {
        if (route.route.modules) {
          app
            .loadModules(Array.isArray(route.route.modules) ? route.route.modules : [route.route.modules])
            .then(function () {
              resolve();
            })
            .catch(function () {
              reject();
            });
        } else {
          resolve();
        }
      },
      function () {
        reject();
      }
    );

    // Return Router
    return router;
  }

  function tabLoad(tabRoute, loadOptions) {
    if ( loadOptions === void 0 ) loadOptions = {};

    var router = this;
    var options = Utils.extend({
      animate: router.params.animate,
      pushState: true,
      history: true,
      parentPageEl: null,
      preload: false,
      on: {},
    }, loadOptions);

    var currentRoute;
    var previousRoute;
    if (options.route) {
      // Set Route
      if (!options.preload && options.route !== router.currentRoute) {
        previousRoute = router.previousRoute;
        router.currentRoute = options.route;
      }
      if (options.preload) {
        currentRoute = options.route;
        previousRoute = router.currentRoute;
      } else {
        currentRoute = router.currentRoute;
        if (!previousRoute) { previousRoute = router.previousRoute; }
      }

      // Update Browser History
      if (router.params.pushState && options.pushState && !options.reloadPrevious) {
        History.replace(
          router.view.id,
          {
            url: options.route.url,
          },
          (router.params.pushStateRoot || '') + router.params.pushStateSeparator + options.route.url
        );
      }

      // Update Router History
      if (options.history) {
        router.history[Math.max(router.history.length - 1, 0)] = options.route.url;
        router.saveHistory();
      }
    }

    // Show Tab
    var $parentPageEl = $(options.parentPageEl || router.currentPageEl);
    var tabEl;
    if ($parentPageEl.length && $parentPageEl.find(("#" + (tabRoute.id))).length) {
      tabEl = $parentPageEl.find(("#" + (tabRoute.id))).eq(0);
    } else if (router.view.selector) {
      tabEl = (router.view.selector) + " #" + (tabRoute.id);
    } else {
      tabEl = "#" + (tabRoute.id);
    }
    var tabShowResult = router.app.tab.show({
      tabEl: tabEl,
      animate: options.animate,
      tabRoute: options.route,
    });

    var $newTabEl = tabShowResult.$newTabEl;
    var $oldTabEl = tabShowResult.$oldTabEl;
    var animated = tabShowResult.animated;
    var onTabsChanged = tabShowResult.onTabsChanged;

    if ($newTabEl && $newTabEl.parents('.page').length > 0 && options.route) {
      var tabParentPageData = $newTabEl.parents('.page')[0].f7Page;
      if (tabParentPageData && options.route) {
        tabParentPageData.route = options.route;
      }
    }

    // Tab Content Loaded
    function onTabLoaded(contentEl) {
      // Remove theme elements
      router.removeThemeElements($newTabEl);

      var tabEventTarget = $newTabEl;
      if (typeof contentEl !== 'string') { tabEventTarget = $(contentEl); }

      tabEventTarget.trigger('tab:init tab:mounted', tabRoute);
      router.emit('tabInit tabMounted', $newTabEl[0], tabRoute);

      if ($oldTabEl && $oldTabEl.length) {
        if (animated) {
          onTabsChanged(function () {
            router.emit('routeChanged', router.currentRoute, router.previousRoute, router);
            if (router.params.unloadTabContent) {
              router.tabRemove($oldTabEl, $newTabEl, tabRoute);
            }
          });
        } else {
          router.emit('routeChanged', router.currentRoute, router.previousRoute, router);
          if (router.params.unloadTabContent) {
            router.tabRemove($oldTabEl, $newTabEl, tabRoute);
          }
        }
      }
    }

    if ($newTabEl[0].f7RouterTabLoaded) {
      if (!$oldTabEl || !$oldTabEl.length) { return router; }
      if (animated) {
        onTabsChanged(function () {
          router.emit('routeChanged', router.currentRoute, router.previousRoute, router);
        });
      } else {
        router.emit('routeChanged', router.currentRoute, router.previousRoute, router);
      }
      return router;
    }

    // Load Tab Content
    function loadTab(loadTabParams, loadTabOptions) {
      // Load Tab Props
      var url = loadTabParams.url;
      var content = loadTabParams.content;
      var el = loadTabParams.el;
      var template = loadTabParams.template;
      var templateUrl = loadTabParams.templateUrl;
      var component = loadTabParams.component;
      var componentUrl = loadTabParams.componentUrl;
      // Component/Template Callbacks
      function resolve(contentEl) {
        router.allowPageChange = true;
        if (!contentEl) { return; }
        if (typeof contentEl === 'string') {
          $newTabEl.html(contentEl);
        } else {
          $newTabEl.html('');
          if (contentEl.f7Component) {
            contentEl.f7Component.$mount(function (componentEl) {
              $newTabEl.append(componentEl);
            });
          } else {
            $newTabEl.append(contentEl);
          }
        }
        $newTabEl[0].f7RouterTabLoaded = true;
        onTabLoaded(contentEl);
      }
      function reject() {
        router.allowPageChange = true;
        return router;
      }

      if (content) {
        resolve(content);
      } else if (template || templateUrl) {
        try {
          router.tabTemplateLoader(template, templateUrl, loadTabOptions, resolve, reject);
        } catch (err) {
          router.allowPageChange = true;
          throw err;
        }
      } else if (el) {
        resolve(el);
      } else if (component || componentUrl) {
        // Load from component (F7/Vue/React/...)
        try {
          router.tabComponentLoader($newTabEl[0], component, componentUrl, loadTabOptions, resolve, reject);
        } catch (err$1) {
          router.allowPageChange = true;
          throw err$1;
        }
      } else if (url) {
        // Load using XHR
        if (router.xhr) {
          router.xhr.abort();
          router.xhr = false;
        }
        router.xhrRequest(url, loadTabOptions)
          .then(function (tabContent) {
            resolve(tabContent);
          })
          .catch(function () {
            router.allowPageChange = true;
          });
      }
    }

    var hasContentLoadProp;
    ('url content component el componentUrl template templateUrl').split(' ').forEach(function (tabLoadProp) {
      var obj;

      if (tabRoute[tabLoadProp]) {
        hasContentLoadProp = true;
        loadTab(( obj = {}, obj[tabLoadProp] = tabRoute[tabLoadProp], obj ), options);
      }
    });

    // Async
    function asyncResolve(resolveParams, resolveOptions) {
      loadTab(resolveParams, Utils.extend(options, resolveOptions));
    }
    function asyncReject() {
      router.allowPageChange = true;
    }
    if (tabRoute.async) {
      tabRoute.async.call(router, currentRoute, previousRoute, asyncResolve, asyncReject);
    } else if (tabRoute.asyncComponent) {
      asyncComponent(router, tabRoute.asyncComponent, asyncResolve, asyncReject);
    } else if (!hasContentLoadProp) {
      router.allowPageChange = true;
    }

    return router;
  }
  function tabRemove($oldTabEl, $newTabEl, tabRoute) {
    var router = this;

    var hasTabComponentChild;
    if ($oldTabEl[0]) {
      $oldTabEl[0].f7RouterTabLoaded = false;
      delete $oldTabEl[0].f7RouterTabLoaded;
    }
    $oldTabEl.children().each(function (index, tabChild) {
      if (tabChild.f7Component) {
        hasTabComponentChild = true;
        $(tabChild).trigger('tab:beforeremove', tabRoute);
        tabChild.f7Component.$destroy();
      }
    });
    if (!hasTabComponentChild) {
      $oldTabEl.trigger('tab:beforeremove', tabRoute);
    }
    router.emit('tabBeforeRemove', $oldTabEl[0], $newTabEl[0], tabRoute);
    router.removeTabContent($oldTabEl[0], tabRoute);
  }

  function modalLoad(modalType, route, loadOptions) {
    if ( loadOptions === void 0 ) loadOptions = {};

    var router = this;
    var app = router.app;
    var isPanel = modalType === 'panel';
    var modalOrPanel = isPanel ? 'panel' : 'modal';

    var options = Utils.extend({
      animate: router.params.animate,
      pushState: true,
      history: true,
      on: {},
    }, loadOptions);

    var modalParams = Utils.extend({}, route.route[modalType]);
    var modalRoute = route.route;

    function onModalLoaded() {
      // Create Modal
      var modal = app[modalType].create(modalParams);
      modalRoute.modalInstance = modal;

      var hasEl = modal.el;

      function closeOnSwipeBack() {
        modal.close();
      }
      modal.on((modalOrPanel + "Open"), function () {
        if (!hasEl) {
          // Remove theme elements
          router.removeThemeElements(modal.el);

          // Emit events
          modal.$el.trigger(((modalType.toLowerCase()) + ":init " + (modalType.toLowerCase()) + ":mounted"), route, modal);
          router.emit(((!isPanel ? 'modalInit' : '') + " " + modalType + "Init " + modalType + "Mounted"), modal.el, route, modal);
        }
        router.once('swipeBackMove', closeOnSwipeBack);
      });
      modal.on((modalOrPanel + "Close"), function () {
        router.off('swipeBackMove', closeOnSwipeBack);
        if (!modal.closeByRouter) {
          router.back();
        }
      });

      modal.on((modalOrPanel + "Closed"), function () {
        modal.$el.trigger(((modalType.toLowerCase()) + ":beforeremove"), route, modal);
        modal.emit(("" + (!isPanel ? 'modalBeforeRemove ' : '') + modalType + "BeforeRemove"), modal.el, route, modal);
        var modalComponent = modal.el.f7Component;
        if (modalComponent) {
          modalComponent.$destroy();
        }
        Utils.nextTick(function () {
          if (modalComponent || modalParams.component) {
            router.removeModal(modal.el);
          }
          modal.destroy();
          delete modal.route;
          delete modalRoute.modalInstance;
        });
      });

      if (options.route) {
        // Update Browser History
        if (router.params.pushState && options.pushState) {
          History.push(
            router.view.id,
            {
              url: options.route.url,
              modal: modalType,
            },
            (router.params.pushStateRoot || '') + router.params.pushStateSeparator + options.route.url
          );
        }

        // Set Route
        if (options.route !== router.currentRoute) {
          modal.route = Utils.extend(options.route, { modal: modal });
          router.currentRoute = modal.route;
        }

        // Update Router History
        if (options.history) {
          router.history.push(options.route.url);
          router.saveHistory();
        }
      }

      if (hasEl) {
        // Remove theme elements
        router.removeThemeElements(modal.el);

        // Emit events
        modal.$el.trigger(((modalType.toLowerCase()) + ":init " + (modalType.toLowerCase()) + ":mounted"), route, modal);
        router.emit((modalOrPanel + "Init " + modalType + "Init " + modalType + "Mounted"), modal.el, route, modal);
      }

      // Open
      modal.open();
    }

    // Load Modal Content
    function loadModal(loadModalParams, loadModalOptions) {
      // Load Modal Props
      var url = loadModalParams.url;
      var content = loadModalParams.content;
      var template = loadModalParams.template;
      var templateUrl = loadModalParams.templateUrl;
      var component = loadModalParams.component;
      var componentUrl = loadModalParams.componentUrl;

      // Component/Template Callbacks
      function resolve(contentEl) {
        if (contentEl) {
          if (typeof contentEl === 'string') {
            modalParams.content = contentEl;
          } else if (contentEl.f7Component) {
            contentEl.f7Component.$mount(function (componentEl) {
              modalParams.el = componentEl;
              app.root.append(componentEl);
            });
          } else {
            modalParams.el = contentEl;
          }
          onModalLoaded();
        }
      }
      function reject() {
        router.allowPageChange = true;
        return router;
      }

      if (content) {
        resolve(content);
      } else if (template || templateUrl) {
        try {
          router.modalTemplateLoader(template, templateUrl, loadModalOptions, resolve, reject);
        } catch (err) {
          router.allowPageChange = true;
          throw err;
        }
      } else if (component || componentUrl) {
        // Load from component (F7/Vue/React/...)
        try {
          router.modalComponentLoader(app.root[0], component, componentUrl, loadModalOptions, resolve, reject);
        } catch (err$1) {
          router.allowPageChange = true;
          throw err$1;
        }
      } else if (url) {
        // Load using XHR
        if (router.xhr) {
          router.xhr.abort();
          router.xhr = false;
        }
        router.xhrRequest(url, loadModalOptions)
          .then(function (modalContent) {
            modalParams.content = modalContent;
            onModalLoaded();
          })
          .catch(function () {
            router.allowPageChange = true;
          });
      } else {
        onModalLoaded();
      }
    }

    var foundLoadProp;
    ('url content component el componentUrl template templateUrl').split(' ').forEach(function (modalLoadProp) {
      var obj;

      if (modalParams[modalLoadProp] && !foundLoadProp) {
        foundLoadProp = true;
        loadModal(( obj = {}, obj[modalLoadProp] = modalParams[modalLoadProp], obj ), options);
      }
    });
    if (!foundLoadProp && modalType === 'actions') {
      onModalLoaded();
    }

    // Async
    function asyncResolve(resolveParams, resolveOptions) {
      loadModal(resolveParams, Utils.extend(options, resolveOptions));
    }
    function asyncReject() {
      router.allowPageChange = true;
    }
    if (modalParams.async) {
      modalParams.async.call(router, options.route, router.currentRoute, asyncResolve, asyncReject);
    }
    if (modalParams.asyncComponent) {
      asyncComponent(router, modalParams.asyncComponent, asyncResolve, asyncReject);
    }
    return router;
  }
  function modalRemove(modal) {
    Utils.extend(modal, { closeByRouter: true });
    modal.close();
  }

  function backward(el, backwardOptions) {
    var router = this;
    var $el = $(el);
    var app = router.app;
    var view = router.view;

    var options = Utils.extend({
      animate: router.params.animate,
      pushState: true,
      replaceState: false,
    }, backwardOptions);

    var masterDetailEnabled = router.params.masterDetailBreakpoint > 0;
    var isMaster = masterDetailEnabled && options.route && options.route.route && options.route.route.master === true;
    var masterPageEl;
    var masterPageRemoved;

    var dynamicNavbar = router.dynamicNavbar;

    var $newPage = $el;
    var $oldPage = router.$el.children('.page-current');
    var currentIsMaster = masterDetailEnabled && $oldPage.hasClass('page-master');

    if ($newPage.length) {
      // Remove theme elements
      router.removeThemeElements($newPage);
    }

    var $navbarsEl;
    var $newNavbarEl;
    var $oldNavbarEl;

    if (dynamicNavbar) {
      $newNavbarEl = $newPage.children('.navbar');
      $navbarsEl = router.$navbarsEl;
      if ($newNavbarEl.length === 0 && $newPage[0] && $newPage[0].f7Page) {
        // Try from pageData
        $newNavbarEl = $newPage[0].f7Page.$navbarEl;
      }
      $oldNavbarEl = $navbarsEl.find('.navbar-current');
    }

    router.allowPageChange = false;
    if ($newPage.length === 0 || $oldPage.length === 0) {
      router.allowPageChange = true;
      return router;
    }

    // Remove theme elements
    router.removeThemeElements($newPage);

    // Save Keep Alive Cache
    if (options.route && options.route.route && options.route.route.keepAlive && !options.route.route.keepAliveData) {
      options.route.route.keepAliveData = {
        pageEl: $el[0],
      };
    }

    // Pages In View
    var isDetail;
    var isDetailRoot;
    if (masterDetailEnabled) {
      var $pagesInView = router.$el
        .children('.page:not(.stacked)')
        .filter(function (index, pageInView) { return pageInView !== $newPage[0]; });

      // Find Detail' master page
      for (var i = 0; i < $pagesInView.length; i += 1) {
        if (!masterPageEl
          && $pagesInView[i].classList.contains('page-master')
        ) {
          masterPageEl = $pagesInView[i];
          continue; // eslint-disable-line
        }
      }

      isDetail = !isMaster
        && masterPageEl
        && (router.history.indexOf(options.route.url) > router.history.indexOf(masterPageEl.f7Page.route.url));

      if (!isDetail && !isMaster && masterPageEl && masterPageEl.f7Page && options.route.route.masterRoute) {
        isDetail = options.route.route.masterRoute.path === masterPageEl.f7Page.route.route.path;
      }
    }
    if (isDetail && masterPageEl && masterPageEl.f7Page) {
      isDetailRoot = router.history.indexOf(options.route.url) - router.history.indexOf(masterPageEl.f7Page.route.url) === 1;
    }

    // New Page
    $newPage
      .addClass(("page-previous" + (isMaster ? ' page-master' : '') + (isDetail ? ' page-master-detail' : '') + (isDetailRoot ? ' page-master-detail-root' : '')))
      .removeClass('stacked')
      .removeAttr('aria-hidden')
      .trigger('page:unstack')
      .trigger('page:position', { position: 'previous' });
    router.emit('pageUnstack', $newPage[0]);
    router.emit('pagePosition', $newPage[0], 'previous');
    if (isMaster || isDetail) {
      $newPage.trigger('page:role', { role: isMaster ? 'master' : 'detail', root: !!isDetailRoot });
      router.emit('pageRole', $newPage[0], { role: isMaster ? 'master' : 'detail', detailRoot: !!isDetailRoot });
    }

    if (dynamicNavbar && $newNavbarEl.length > 0) {
      $newNavbarEl
        .addClass(("navbar-previous" + (isMaster ? ' navbar-master' : '') + (isDetail ? ' navbar-master-detail' : '') + (isDetailRoot ? ' navbar-master-detail-root' : '')))
        .removeClass('stacked')
        .removeAttr('aria-hidden');
      $newNavbarEl.trigger('navbar:position', { position: 'previous' });
      router.emit('navbarPosition', $newNavbarEl[0], 'previous');
      if (isMaster || isDetailRoot) {
        router.emit('navbarRole', $newNavbarEl[0], { role: isMaster ? 'master' : 'detail', detailRoot: !!isDetailRoot });
      }
    }

    // Remove previous page in case of "forced"
    var backIndex;
    if (options.force) {
      if ($oldPage.prev('.page-previous:not(.stacked)').length > 0 || $oldPage.prev('.page-previous').length === 0) {
        if (router.history.indexOf(options.route.url) >= 0) {
          backIndex = router.history.length - router.history.indexOf(options.route.url) - 1;
          router.history = router.history.slice(0, router.history.indexOf(options.route.url) + 2);
          view.history = router.history;
        } else if (router.history[[router.history.length - 2]]) {
          router.history[router.history.length - 2] = options.route.url;
        } else {
          router.history.unshift(router.url);
        }

        if (backIndex && router.params.stackPages) {
          $oldPage.prevAll('.page-previous').each(function (index, pageToRemove) {
            var $pageToRemove = $(pageToRemove);
            var $navbarToRemove;
            if (dynamicNavbar) {
              // $navbarToRemove = $oldNavbarEl.prevAll('.navbar-previous').eq(index);
              $navbarToRemove = $(app.navbar.getElByPage($pageToRemove));
            }
            if ($pageToRemove[0] !== $newPage[0] && $pageToRemove.index() > $newPage.index()) {
              if (router.initialPages.indexOf($pageToRemove[0]) >= 0) {
                $pageToRemove.addClass('stacked');
                $pageToRemove.trigger('page:stack');
                router.emit('pageStack', $pageToRemove[0]);
                if (dynamicNavbar) {
                  $navbarToRemove.addClass('stacked');
                }
              } else {
                router.pageCallback('beforeRemove', $pageToRemove, $navbarToRemove, 'previous', undefined, options);
                if ($pageToRemove[0] === masterPageEl) {
                  masterPageRemoved = true;
                }
                router.removePage($pageToRemove);
                if (dynamicNavbar && $navbarToRemove.length > 0) {
                  router.removeNavbar($navbarToRemove);
                }
              }
            }
          });
        } else {
          var $pageToRemove = $oldPage.prev('.page-previous:not(.stacked)');
          var $navbarToRemove;
          if (dynamicNavbar) {
            // $navbarToRemove = $oldNavbarEl.prev('.navbar-inner:not(.stacked)');
            $navbarToRemove = $(app.navbar.getElByPage($pageToRemove));
          }
          if (router.params.stackPages && router.initialPages.indexOf($pageToRemove[0]) >= 0) {
            $pageToRemove.addClass('stacked');
            $pageToRemove.trigger('page:stack');
            router.emit('pageStack', $pageToRemove[0]);
            $navbarToRemove.addClass('stacked');
          } else if ($pageToRemove.length > 0) {
            router.pageCallback('beforeRemove', $pageToRemove, $navbarToRemove, 'previous', undefined, options);
            if ($pageToRemove[0] === masterPageEl) {
              masterPageRemoved = true;
            }
            router.removePage($pageToRemove);
            if (dynamicNavbar && $navbarToRemove.length) {
              router.removeNavbar($navbarToRemove);
            }
          }
        }
      }
    }

    // Insert new page
    var newPageInDom = $newPage.parents(doc).length > 0;
    var f7Component = $newPage[0].f7Component;

    function insertPage() {
      if ($newPage.next($oldPage).length === 0) {
        if (!newPageInDom && f7Component) {
          f7Component.$mount(function (componentEl) {
            $(componentEl).insertBefore($oldPage);
          });
        } else {
          $newPage.insertBefore($oldPage);
        }
      }
      if (dynamicNavbar && $newNavbarEl.length) {
        if ($newNavbarEl.find('.title-large').length) {
          $newNavbarEl.addClass('navbar-large');
        }
        $newNavbarEl.insertBefore($oldNavbarEl);
        if ($oldNavbarEl.length > 0) {
          $newNavbarEl.insertBefore($oldNavbarEl);
        } else {
          if (!router.$navbarsEl.parents(doc).length) {
            router.$el.prepend(router.$navbarsEl);
          }
          $navbarsEl.append($newNavbarEl);
        }
      }
      if (!newPageInDom) {
        router.pageCallback('mounted', $newPage, $newNavbarEl, 'previous', 'current', options, $oldPage);
      } else if (options.route && options.route.route && options.route.route.keepAlive && !$newPage[0].f7PageMounted) {
        $newPage[0].f7PageMounted = true;
        router.pageCallback('mounted', $newPage, $newNavbarEl, 'previous', 'current', options, $oldPage);
      }
    }

    if (options.preload) {
      // Insert Page
      insertPage();
      // Tab route
      if (options.route.route.tab) {
        router.tabLoad(options.route.route.tab, Utils.extend({}, options, {
          history: false,
          pushState: false,
          preload: true,
        }));
      }
      if (isMaster) {
        $newPage
          .removeClass('page-master-stacked')
          .trigger('page:masterunstack');
        router.emit('pageMasterUnstack', $newPage[0]);
        if (dynamicNavbar) {
          $(app.navbar.getElByPage($newPage)).removeClass('navbar-master-stacked');
          router.emit('navbarMasterUnstack', app.navbar.getElByPage($newPage));
        }
      }
      // Page init and before init events
      router.pageCallback('init', $newPage, $newNavbarEl, 'previous', 'current', options, $oldPage);
      var $previousPages = $newPage.prevAll('.page-previous:not(.stacked):not(.page-master)');
      if ($previousPages.length > 0) {
        $previousPages.each(function (index, pageToRemove) {
          var $pageToRemove = $(pageToRemove);
          var $navbarToRemove;
          if (dynamicNavbar) {
            // $navbarToRemove = $newNavbarEl.prevAll('.navbar-previous:not(.stacked)').eq(index);
            $navbarToRemove = $(app.navbar.getElByPage($pageToRemove));
          }
          if (router.params.stackPages && router.initialPages.indexOf(pageToRemove) >= 0) {
            $pageToRemove.addClass('stacked');
            $pageToRemove.trigger('page:stack');
            router.emit('pageStack', $pageToRemove[0]);
            if (dynamicNavbar) {
              $navbarToRemove.addClass('stacked');
            }
          } else {
            router.pageCallback('beforeRemove', $pageToRemove, $navbarToRemove, 'previous', undefined);
            router.removePage($pageToRemove);
            if (dynamicNavbar && $navbarToRemove.length) {
              router.removeNavbar($navbarToRemove);
            }
          }
        });
      }
      router.allowPageChange = true;
      return router;
    }

    // History State
    if (!(Device.ie || Device.edge || (Device.firefox && !Device.ios))) {
      if (router.params.pushState && options.pushState) {
        if (options.replaceState) {
          var pushStateRoot = router.params.pushStateRoot || '';
          History.replace(
            view.id,
            {
              url: options.route.url,
            },
            pushStateRoot + router.params.pushStateSeparator + options.route.url
          );
        } else if (backIndex) {
          History.go(-backIndex);
        } else {
          History.back();
        }
      }
    }

    // Update History
    if (options.replaceState) {
      router.history[router.history.length - 1] = options.route.url;
    } else {
      if (router.history.length === 1) {
        router.history.unshift(router.url);
      }
      router.history.pop();
    }
    router.saveHistory();

    // Current Page & Navbar
    router.currentPageEl = $newPage[0];
    if (dynamicNavbar && $newNavbarEl.length) {
      router.currentNavbarEl = $newNavbarEl[0];
    } else {
      delete router.currentNavbarEl;
    }

    // Current Route
    router.currentRoute = options.route;

    // History State
    if (Device.ie || Device.edge || (Device.firefox && !Device.ios)) {
      if (router.params.pushState && options.pushState) {
        if (options.replaceState) {
          var pushStateRoot$1 = router.params.pushStateRoot || '';
          History.replace(
            view.id,
            {
              url: options.route.url,
            },
            pushStateRoot$1 + router.params.pushStateSeparator + options.route.url
          );
        } else if (backIndex) {
          History.go(-backIndex);
        } else {
          History.back();
        }
      }
    }

    // Insert Page
    insertPage();

    // Load Tab
    if (options.route.route.tab) {
      router.tabLoad(options.route.route.tab, Utils.extend({}, options, {
        history: false,
        pushState: false,
      }));
    }

    // Check master detail

    if (masterDetailEnabled && (currentIsMaster || masterPageRemoved)) {
      view.checkMasterDetailBreakpoint(false);
    }

    // Page init and before init events
    router.pageCallback('init', $newPage, $newNavbarEl, 'previous', 'current', options, $oldPage);

    // Before animation callback
    router.pageCallback('beforeOut', $oldPage, $oldNavbarEl, 'current', 'next', options);
    router.pageCallback('beforeIn', $newPage, $newNavbarEl, 'previous', 'current', options);

    // Animation
    function afterAnimation() {
      // Set classes
      router.setPagePosition($newPage, 'current', false);
      router.setPagePosition($oldPage, 'next', true);
      if (dynamicNavbar) {
        router.setNavbarPosition($newNavbarEl, 'current', false);
        router.setNavbarPosition($oldNavbarEl, 'next', true);
      }

      // After animation event
      router.pageCallback('afterOut', $oldPage, $oldNavbarEl, 'current', 'next', options);
      router.pageCallback('afterIn', $newPage, $newNavbarEl, 'previous', 'current', options);

      // Remove Old Page
      if (router.params.stackPages && router.initialPages.indexOf($oldPage[0]) >= 0) {
        $oldPage.addClass('stacked');
        $oldPage.trigger('page:stack');
        router.emit('pageStack', $oldPage[0]);
        if (dynamicNavbar) {
          $oldNavbarEl.addClass('stacked');
        }
      } else {
        router.pageCallback('beforeRemove', $oldPage, $oldNavbarEl, 'next', undefined, options);
        router.removePage($oldPage);
        if (dynamicNavbar && $oldNavbarEl.length) {
          router.removeNavbar($oldNavbarEl);
        }
      }

      router.allowPageChange = true;
      router.emit('routeChanged', router.currentRoute, router.previousRoute, router);

      // Preload previous page
      var preloadPreviousPage = router.params.preloadPreviousPage || router.params[((app.theme) + "SwipeBack")];
      if (preloadPreviousPage && router.history[router.history.length - 2] && !isMaster) {
        router.back(router.history[router.history.length - 2], { preload: true });
      }
      if (router.params.pushState) {
        History.clearRouterQueue();
      }
    }

    function setPositionClasses() {
      router.setPagePosition($oldPage, 'current');
      router.setPagePosition($newPage, 'previous', false);
      if (dynamicNavbar) {
        router.setNavbarPosition($oldNavbarEl, 'current');
        router.setNavbarPosition($newNavbarEl, 'previous', false);
      }
    }

    if (options.animate && !(currentIsMaster && app.width >= router.params.masterDetailBreakpoint)) {
      var transition = router.params.transition;
      if ($oldPage[0] && $oldPage[0].f7PageTransition) {
        transition = $oldPage[0].f7PageTransition;
        delete $oldPage[0].f7PageTransition;
      }
      if (options.transition) { transition = options.transition; }
      if (!transition && router.previousRoute && router.previousRoute.route) {
        transition = router.previousRoute.route.transition;
      }
      if (!transition && router.previousRoute && router.previousRoute.route && router.previousRoute.route.options) {
        transition = router.previousRoute.route.options.transition;
      }
      setPositionClasses();
      router.animate($oldPage, $newPage, $oldNavbarEl, $newNavbarEl, 'backward', transition, function () {
        afterAnimation();
      });
    } else {
      afterAnimation();
    }

    return router;
  }
  function loadBack(backParams, backOptions, ignorePageChange) {
    var router = this;

    if (!router.allowPageChange && !ignorePageChange) { return router; }
    var params = backParams;
    var options = backOptions;
    var url = params.url;
    var content = params.content;
    var el = params.el;
    var pageName = params.pageName;
    var template = params.template;
    var templateUrl = params.templateUrl;
    var component = params.component;
    var componentUrl = params.componentUrl;

    if (
      options.route.url
      && router.url === options.route.url
      && !(options.reloadCurrent || options.reloadPrevious)
      && !router.params.allowDuplicateUrls
    ) {
      return false;
    }

    if (!options.route && url) {
      options.route = router.parseRouteUrl(url);
    }

    // Component Callbacks
    function resolve(pageEl, newOptions) {
      return router.backward(pageEl, Utils.extend(options, newOptions));
    }
    function reject() {
      router.allowPageChange = true;
      return router;
    }

    if (url || templateUrl || componentUrl) {
      router.allowPageChange = false;
    }

    // Proceed
    if (content) {
      router.backward(router.getPageEl(content), options);
    } else if (template || templateUrl) {
      // Parse template and send page element
      try {
        router.pageTemplateLoader(template, templateUrl, options, resolve, reject);
      } catch (err) {
        router.allowPageChange = true;
        throw err;
      }
    } else if (el) {
      // Load page from specified HTMLElement or by page name in pages container
      router.backward(router.getPageEl(el), options);
    } else if (pageName) {
      // Load page by page name in pages container
      router.backward(router.$el.children((".page[data-name=\"" + pageName + "\"]")).eq(0), options);
    } else if (component || componentUrl) {
      // Load from component (F7/Vue/React/...)
      try {
        router.pageComponentLoader(router.el, component, componentUrl, options, resolve, reject);
      } catch (err$1) {
        router.allowPageChange = true;
        throw err$1;
      }
    } else if (url) {
      // Load using XHR
      if (router.xhr) {
        router.xhr.abort();
        router.xhr = false;
      }
      router.xhrRequest(url, options)
        .then(function (pageContent) {
          router.backward(router.getPageEl(pageContent), options);
        })
        .catch(function () {
          router.allowPageChange = true;
        });
    }
    return router;
  }
  function back() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var router = this;
    if (router.swipeBackActive) { return router; }
    var navigateUrl;
    var navigateOptions;
    var route;
    if (typeof args[0] === 'object') {
      navigateOptions = args[0] || {};
    } else {
      navigateUrl = args[0];
      navigateOptions = args[1] || {};
    }

    var name = navigateOptions.name;
    var params = navigateOptions.params;
    var query = navigateOptions.query;
    if (name) {
      navigateUrl = router.generateUrl({ name: name, params: params, query: query });
      if (navigateUrl) {
        return router.back(navigateUrl, Utils.extend({}, navigateOptions, {
          name: null,
          params: null,
          query: null,
        }));
      }
      return router;
    }

    var app = router.app;
    appRouterCheck(router, 'back');

    var currentRouteIsModal = router.currentRoute.modal;
    var modalType;
    if (!currentRouteIsModal) {
      ('popup popover sheet loginScreen actions customModal panel').split(' ').forEach(function (modalLoadProp) {
        if (router.currentRoute.route[modalLoadProp]) {
          currentRouteIsModal = true;
          modalType = modalLoadProp;
        }
      });
    }
    if (currentRouteIsModal) {
      var modalToClose = router.currentRoute.modal
                           || router.currentRoute.route.modalInstance
                           || app[modalType].get();
      var previousUrl = router.history[router.history.length - 2];
      var previousRoute;
      // check if previous route is modal too
      if (modalToClose && modalToClose.$el) {
        var prevOpenedModals = modalToClose.$el.prevAll('.modal-in');
        if (prevOpenedModals.length && prevOpenedModals[0].f7Modal) {
          var modalEl = prevOpenedModals[0];
          // check if current router not inside of the modalEl
          if (!router.$el.parents(modalEl).length) {
            previousRoute = modalEl.f7Modal.route;
          }
        }
      }
      if (!previousRoute) {
        previousRoute = router.findMatchingRoute(previousUrl);
      }

      if (!previousRoute && previousUrl) {
        previousRoute = {
          url: previousUrl,
          path: previousUrl.split('?')[0],
          query: Utils.parseUrlQuery(previousUrl),
          route: {
            path: previousUrl.split('?')[0],
            url: previousUrl,
          },
        };
      }
      if (!navigateUrl || navigateUrl.replace(/[# ]/g, '').trim().length === 0) {
        if (!previousRoute || !modalToClose) {
          return router;
        }
      }
      var forceOtherUrl = navigateOptions.force && previousRoute && navigateUrl;
      if (previousRoute && modalToClose) {
        var isBrokenPushState = Device.ie || Device.edge || (Device.firefox && !Device.ios);
        var needHistoryBack = router.params.pushState && navigateOptions.pushState !== false;
        if (needHistoryBack && !isBrokenPushState) {
          History.back();
        }
        router.currentRoute = previousRoute;
        router.history.pop();
        router.saveHistory();

        if (needHistoryBack && isBrokenPushState) {
          History.back();
        }

        router.modalRemove(modalToClose);
        if (forceOtherUrl) {
          router.navigate(navigateUrl, { reloadCurrent: true });
        }
      } else if (modalToClose) {
        router.modalRemove(modalToClose);
        if (navigateUrl) {
          router.navigate(navigateUrl, { reloadCurrent: true });
        }
      }
      return router;
    }
    var $previousPage = router.$el.children('.page-current').prevAll('.page-previous:not(.page-master)').eq(0);

    var skipMaster;
    if (router.params.masterDetailBreakpoint > 0) {
      var $previousMaster = router.$el.children('.page-current').prevAll('.page-master').eq(0);
      if ($previousMaster.length) {
        var expectedPreviousPageUrl = router.history[router.history.length - 2];
        var expectedPreviousPageRoute = router.findMatchingRoute(expectedPreviousPageUrl);
        if (expectedPreviousPageRoute && expectedPreviousPageRoute.route === $previousMaster[0].f7Page.route.route) {
          $previousPage = $previousMaster;
          if (!navigateOptions.preload) {
            skipMaster = app.width >= router.params.masterDetailBreakpoint;
          }
        }
      }
    }
    if (!navigateOptions.force && $previousPage.length && !skipMaster) {
      if (router.params.pushState
        && $previousPage[0].f7Page
        && router.history[router.history.length - 2] !== $previousPage[0].f7Page.route.url
      ) {
        router.back(
          router.history[router.history.length - 2],
          Utils.extend(navigateOptions, { force: true })
        );
        return router;
      }
      var previousPageRoute = $previousPage[0].f7Page.route;

      processRouteQueue.call(
        router,
        previousPageRoute,
        router.currentRoute,
        function () {
          router.loadBack({ el: $previousPage }, Utils.extend(navigateOptions, {
            route: previousPageRoute,
          }));
        },
        function () {}
      );

      return router;
    }

    // Navigate URL
    if (navigateUrl === '#') {
      navigateUrl = undefined;
    }
    if (navigateUrl && navigateUrl[0] !== '/' && navigateUrl.indexOf('#') !== 0) {
      navigateUrl = ((router.path || '/') + navigateUrl).replace('//', '/');
    }
    if (!navigateUrl && router.history.length > 1) {
      navigateUrl = router.history[router.history.length - 2];
    }
    if (skipMaster && !navigateOptions.force && router.history[router.history.length - 3]) {
      return router.back(router.history[router.history.length - 3], Utils.extend({}, navigateOptions || {}, {
        force: true,
        animate: false,
      }));
    }
    if (skipMaster && !navigateOptions.force) {
      return router;
    }

    // Find route to load
    route = router.findMatchingRoute(navigateUrl);
    if (!route) {
      if (navigateUrl) {
        route = {
          url: navigateUrl,
          path: navigateUrl.split('?')[0],
          query: Utils.parseUrlQuery(navigateUrl),
          route: {
            path: navigateUrl.split('?')[0],
            url: navigateUrl,
          },
        };
      }
    }
    if (!route) {
      return router;
    }

    if (route.route.redirect) {
      return redirect.call(router, 'back', route, navigateOptions);
    }

    var options = {};
    if (route.route.options) {
      Utils.extend(options, route.route.options, navigateOptions);
    } else {
      Utils.extend(options, navigateOptions);
    }
    options.route = route;

    if (options && options.context) {
      route.context = options.context;
      options.route.context = options.context;
    }

    var backForceLoaded;
    if (options.force && router.params.stackPages) {
      router.$el.children('.page-previous.stacked').each(function (index, pageEl) {
        if (pageEl.f7Page && pageEl.f7Page.route && pageEl.f7Page.route.url === route.url) {
          backForceLoaded = true;
          router.loadBack({ el: pageEl }, options);
        }
      });
      if (backForceLoaded) {
        return router;
      }
    }
    function resolve() {
      var routerLoaded = false;
      if (route.route.keepAlive && route.route.keepAliveData) {
        router.loadBack({ el: route.route.keepAliveData.pageEl }, options);
        routerLoaded = true;
      }
      ('url content component pageName el componentUrl template templateUrl').split(' ').forEach(function (pageLoadProp) {
        var obj;

        if (route.route[pageLoadProp] && !routerLoaded) {
          routerLoaded = true;
          router.loadBack(( obj = {}, obj[pageLoadProp] = route.route[pageLoadProp], obj ), options);
        }
      });
      if (routerLoaded) { return; }
      // Async
      function asyncResolve(resolveParams, resolveOptions) {
        router.allowPageChange = false;
        if (resolveOptions && resolveOptions.context) {
          if (!route.context) { route.context = resolveOptions.context; }
          else { route.context = Utils.extend({}, route.context, resolveOptions.context); }
          options.route.context = route.context;
        }
        router.loadBack(resolveParams, Utils.extend(options, resolveOptions), true);
      }
      function asyncReject() {
        router.allowPageChange = true;
      }
      if (route.route.async) {
        router.allowPageChange = false;
        route.route.async.call(router, route, router.currentRoute, asyncResolve, asyncReject);
      }
      if (route.route.asyncComponent) {
        asyncComponent(router, route.route.asyncComponent, asyncResolve, asyncReject);
      }
    }
    function reject() {
      router.allowPageChange = true;
    }

    if (options.preload) {
      resolve();
    } else {
      processRouteQueue.call(
        router,
        route,
        router.currentRoute,
        function () {
          if (route.route.modules) {
            app
              .loadModules(Array.isArray(route.route.modules) ? route.route.modules : [route.route.modules])
              .then(function () {
                resolve();
              })
              .catch(function () {
                reject();
              });
          } else {
            resolve();
          }
        },
        function () {
          reject();
        }
      );
    }

    // Return Router
    return router;
  }

  function clearPreviousPages(router) {
    appRouterCheck(router, 'clearPreviousPages');
    var app = router.app;
    var dynamicNavbar = router.dynamicNavbar;

    var $pagesToRemove = router.$el
      .children('.page')
      .filter(function (index, pageInView) {
        if (router.currentRoute && (router.currentRoute.modal || router.currentRoute.panel)) { return true; }
        return pageInView !== router.currentPageEl;
      });

    $pagesToRemove.each(function (index, pageEl) {
      var $oldPageEl = $(pageEl);
      var $oldNavbarEl = $(app.navbar.getElByPage($oldPageEl));
      if (router.params.stackPages && router.initialPages.indexOf($oldPageEl[0]) >= 0) {
        $oldPageEl.addClass('stacked');
        if (dynamicNavbar) {
          $oldNavbarEl.addClass('stacked');
        }
      } else {
        // Page remove event
        router.pageCallback('beforeRemove', $oldPageEl, $oldNavbarEl, 'previous', undefined, {});
        router.removePage($oldPageEl);
        if (dynamicNavbar && $oldNavbarEl.length) {
          router.removeNavbar($oldNavbarEl);
        }
      }
    });
  }

  function clearPreviousHistory() {
    var router = this;
    appRouterCheck(router, 'clearPreviousHistory');
    var url = router.history[router.history.length - 1];

    clearPreviousPages(router);

    router.history = [url];
    router.view.history = [url];
    router.saveHistory();
  }

  var Router = /*@__PURE__*/(function (Framework7Class) {
    function Router(app, view) {
      Framework7Class.call(this, {}, [typeof view === 'undefined' ? app : view]);
      var router = this;

      // Is App Router
      router.isAppRouter = typeof view === 'undefined';

      if (router.isAppRouter) {
        // App Router
        Utils.extend(false, router, {
          app: app,
          params: app.params.view,
          routes: app.routes || [],
          cache: app.cache,
        });
      } else {
        // View Router
        Utils.extend(false, router, {
          app: app,
          view: view,
          viewId: view.id,
          params: view.params,
          routes: view.routes,
          $el: view.$el,
          el: view.el,
          $navbarsEl: view.$navbarsEl,
          navbarsEl: view.navbarsEl,
          history: view.history,
          scrollHistory: view.scrollHistory,
          cache: app.cache,
          dynamicNavbar: app.theme === 'ios' && view.params.iosDynamicNavbar,
          initialPages: [],
          initialNavbars: [],
        });
      }

      // Install Modules
      router.useModules();

      // Temporary Dom
      router.tempDom = doc.createElement('div');

      // AllowPageChage
      router.allowPageChange = true;

      // Current Route
      var currentRoute = {};
      var previousRoute = {};
      Object.defineProperty(router, 'currentRoute', {
        enumerable: true,
        configurable: true,
        set: function set(newRoute) {
          if ( newRoute === void 0 ) newRoute = {};

          previousRoute = Utils.extend({}, currentRoute);
          currentRoute = newRoute;
          if (!currentRoute) { return; }
          router.url = currentRoute.url;
          router.emit('routeChange', newRoute, previousRoute, router);
        },
        get: function get() {
          return currentRoute;
        },
      });
      Object.defineProperty(router, 'previousRoute', {
        enumerable: true,
        configurable: true,
        get: function get() {
          return previousRoute;
        },
        set: function set(newRoute) {
          previousRoute = newRoute;
        },
      });

      return router;
    }

    if ( Framework7Class ) Router.__proto__ = Framework7Class;
    Router.prototype = Object.create( Framework7Class && Framework7Class.prototype );
    Router.prototype.constructor = Router;

    Router.prototype.animatableNavElements = function animatableNavElements ($newNavbarEl, $oldNavbarEl, toLarge, fromLarge, direction) {
      var router = this;
      var dynamicNavbar = router.dynamicNavbar;
      var animateIcon = router.params.iosAnimateNavbarBackIcon;

      var newNavEls;
      var oldNavEls;
      function animatableNavEl($el, $navbarInner) {
        var isSliding = $el.hasClass('sliding') || $navbarInner.hasClass('sliding');
        var isSubnavbar = $el.hasClass('subnavbar');
        var needsOpacityTransition = isSliding ? !isSubnavbar : true;
        var $iconEl = $el.find('.back .icon');
        var isIconLabel;
        if (isSliding && animateIcon && $el.hasClass('left') && $iconEl.length > 0 && $iconEl.next('span').length) {
          $el = $iconEl.next('span'); // eslint-disable-line
          isIconLabel = true;
        }
        return {
          $el: $el,
          isIconLabel: isIconLabel,
          leftOffset: $el[0].f7NavbarLeftOffset,
          rightOffset: $el[0].f7NavbarRightOffset,
          isSliding: isSliding,
          isSubnavbar: isSubnavbar,
          needsOpacityTransition: needsOpacityTransition,
        };
      }
      if (dynamicNavbar) {
        newNavEls = [];
        oldNavEls = [];
        $newNavbarEl.children('.navbar-inner').children('.left, .right, .title, .subnavbar').each(function (index, navEl) {
          var $navEl = $(navEl);
          if ($navEl.hasClass('left') && fromLarge && direction === 'forward') { return; }
          if ($navEl.hasClass('title') && toLarge) { return; }
          newNavEls.push(animatableNavEl($navEl, $newNavbarEl.children('.navbar-inner')));
        });
        if (!($oldNavbarEl.hasClass('navbar-master') && router.params.masterDetailBreakpoint > 0 && router.app.width >= router.params.masterDetailBreakpoint)) {
          $oldNavbarEl.children('.navbar-inner').children('.left, .right, .title, .subnavbar').each(function (index, navEl) {
            var $navEl = $(navEl);
            if ($navEl.hasClass('left') && toLarge && !fromLarge && direction === 'forward') { return; }
            if ($navEl.hasClass('left') && toLarge && direction === 'backward') { return; }
            if ($navEl.hasClass('title') && fromLarge) {
              return;
            }
            oldNavEls.push(animatableNavEl($navEl, $oldNavbarEl.children('.navbar-inner')));
          });
        }
        [oldNavEls, newNavEls].forEach(function (navEls) {
          navEls.forEach(function (navEl) {
            var n = navEl;
            var isSliding = navEl.isSliding;
            var $el = navEl.$el;
            var otherEls = navEls === oldNavEls ? newNavEls : oldNavEls;
            if (!(isSliding && $el.hasClass('title') && otherEls)) { return; }
            otherEls.forEach(function (otherNavEl) {
              if (otherNavEl.isIconLabel) {
                var iconTextEl = otherNavEl.$el[0];
                n.leftOffset += iconTextEl ? (iconTextEl.offsetLeft || 0) : 0;
              }
            });
          });
        });
      }

      return { newNavEls: newNavEls, oldNavEls: oldNavEls };
    };

    Router.prototype.animate = function animate ($oldPageEl, $newPageEl, $oldNavbarEl, $newNavbarEl, direction, transition, callback) {
      var router = this;
      if (router.params.animateCustom) {
        router.params.animateCustom.apply(router, [$oldPageEl, $newPageEl, $oldNavbarEl, $newNavbarEl, direction, callback]);
        return;
      }
      var dynamicNavbar = router.dynamicNavbar;
      var ios = router.app.theme === 'ios';
      if (transition) {
        var routerCustomTransitionClass = "router-transition-custom router-transition-" + transition + "-" + direction;
        // Animate
        var onCustomTransitionDone = function () {
          router.$el.removeClass(routerCustomTransitionClass);
          if (dynamicNavbar && router.$navbarsEl.length) {
            if ($newNavbarEl) {
              router.$navbarsEl.prepend($newNavbarEl);
            }
            if ($oldNavbarEl) {
              router.$navbarsEl.prepend($oldNavbarEl);
            }
          }
          if (callback) { callback(); }
        };

        (direction === 'forward' ? $newPageEl : $oldPageEl).animationEnd(onCustomTransitionDone);
        if (dynamicNavbar) {
          if ($newNavbarEl && $newPageEl) {
            router.setNavbarPosition($newNavbarEl, '');
            $newNavbarEl.removeClass('navbar-next navbar-previous navbar-current');
            $newPageEl.prepend($newNavbarEl);
          }
          if ($oldNavbarEl && $oldPageEl) {
            router.setNavbarPosition($oldNavbarEl, '');
            $oldNavbarEl.removeClass('navbar-next navbar-previous navbar-current');
            $oldPageEl.prepend($oldNavbarEl);
          }
        }

        router.$el.addClass(routerCustomTransitionClass);
        return;
      }


      // Router Animation class
      var routerTransitionClass = "router-transition-" + direction + " router-transition";

      var newNavEls;
      var oldNavEls;

      var fromLarge;
      var toLarge;

      var oldIsLarge;
      var newIsLarge;

      if (ios && dynamicNavbar) {
        var betweenMasterAndDetail = router.params.masterDetailBreakpoint > 0 && router.app.width >= router.params.masterDetailBreakpoint
          && (
            ($oldNavbarEl.hasClass('navbar-master') && $newNavbarEl.hasClass('navbar-master-detail'))
            || ($oldNavbarEl.hasClass('navbar-master-detail') && $newNavbarEl.hasClass('navbar-master'))
          );
        if (!betweenMasterAndDetail) {
          oldIsLarge = $oldNavbarEl && $oldNavbarEl.hasClass('navbar-large');
          newIsLarge = $newNavbarEl && $newNavbarEl.hasClass('navbar-large');
          fromLarge = oldIsLarge && !$oldNavbarEl.hasClass('navbar-large-collapsed');
          toLarge = newIsLarge && !$newNavbarEl.hasClass('navbar-large-collapsed');
        }
        var navEls = router.animatableNavElements($newNavbarEl, $oldNavbarEl, toLarge, fromLarge, direction);
        newNavEls = navEls.newNavEls;
        oldNavEls = navEls.oldNavEls;
      }

      function animateNavbars(progress) {
        if (!(ios && dynamicNavbar)) { return; }
        if (progress === 1) {
          if (toLarge) {
            $newNavbarEl.addClass('router-navbar-transition-to-large');
            $oldNavbarEl.addClass('router-navbar-transition-to-large');
          }
          if (fromLarge) {
            $newNavbarEl.addClass('router-navbar-transition-from-large');
            $oldNavbarEl.addClass('router-navbar-transition-from-large');
          }
        }
        newNavEls.forEach(function (navEl) {
          var $el = navEl.$el;
          var offset = direction === 'forward' ? navEl.rightOffset : navEl.leftOffset;
          if (navEl.isSliding) {
            if (navEl.isSubnavbar && newIsLarge) {
              $el[0].style.setProperty('transform', ("translate3d(" + (offset * (1 - progress)) + "px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)"), 'important');
            } else {
              $el.transform(("translate3d(" + (offset * (1 - progress)) + "px,0,0)"));
            }
          }
        });
        oldNavEls.forEach(function (navEl) {
          var $el = navEl.$el;
          var offset = direction === 'forward' ? navEl.leftOffset : navEl.rightOffset;
          if (navEl.isSliding) {
            if (navEl.isSubnavbar && oldIsLarge) {
              $el.transform(("translate3d(" + (offset * (progress)) + "px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)"));
            } else {
              $el.transform(("translate3d(" + (offset * (progress)) + "px,0,0)"));
            }
          }
        });
      }

      // AnimationEnd Callback
      function onDone() {
        if (router.dynamicNavbar) {
          if ($newNavbarEl) {
            $newNavbarEl.removeClass('router-navbar-transition-to-large router-navbar-transition-from-large');
            $newNavbarEl.addClass('navbar-no-title-large-transition');
            Utils.nextFrame(function () {
              $newNavbarEl.removeClass('navbar-no-title-large-transition');
            });
          }
          if ($oldNavbarEl) {
            $oldNavbarEl.removeClass('router-navbar-transition-to-large router-navbar-transition-from-large');
          }
          if ($newNavbarEl.hasClass('sliding') || $newNavbarEl.children('.navbar-inner.sliding').length) {
            $newNavbarEl.find('.title, .left, .right, .left .icon, .subnavbar').transform('');
          } else {
            $newNavbarEl.find('.sliding').transform('');
          }
          if ($oldNavbarEl.hasClass('sliding') || $oldNavbarEl.children('.navbar-inner.sliding').length) {
            $oldNavbarEl.find('.title, .left, .right, .left .icon, .subnavbar').transform('');
          } else {
            $oldNavbarEl.find('.sliding').transform('');
          }
        }
        router.$el.removeClass(routerTransitionClass);
        if (callback) { callback(); }
      }

      (direction === 'forward' ? $newPageEl : $oldPageEl).animationEnd(function () {
        onDone();
      });

      // Animate
      if (dynamicNavbar) {
        // Prepare Navbars
        animateNavbars(0);
        Utils.nextFrame(function () {
          // Add class, start animation
          animateNavbars(1);
          router.$el.addClass(routerTransitionClass);
        });
      } else {
        // Add class, start animation
        router.$el.addClass(routerTransitionClass);
      }
    };

    Router.prototype.removeModal = function removeModal (modalEl) {
      var router = this;
      router.removeEl(modalEl);
    };
    // eslint-disable-next-line
    Router.prototype.removeTabContent = function removeTabContent (tabEl) {
      var $tabEl = $(tabEl);
      $tabEl.html('');
    };

    Router.prototype.removeNavbar = function removeNavbar (el) {
      var router = this;
      router.removeEl(el);
    };

    Router.prototype.removePage = function removePage (el) {
      var $el = $(el);
      var f7Page = $el && $el[0] && $el[0].f7Page;
      var router = this;
      if (f7Page && f7Page.route && f7Page.route.route && f7Page.route.route.keepAlive) {
        $el.remove();
        return;
      }
      router.removeEl(el);
    };

    Router.prototype.removeEl = function removeEl (el) {
      if (!el) { return; }
      var router = this;
      var $el = $(el);
      if ($el.length === 0) { return; }
      $el.find('.tab').each(function (tabIndex, tabEl) {
        $(tabEl).children().each(function (index, tabChild) {
          if (tabChild.f7Component) {
            $(tabChild).trigger('tab:beforeremove');
            tabChild.f7Component.$destroy();
          }
        });
      });
      if ($el[0].f7Component && $el[0].f7Component.$destroy) {
        $el[0].f7Component.$destroy();
      }
      if (!router.params.removeElements) {
        return;
      }
      if (router.params.removeElementsWithTimeout) {
        setTimeout(function () {
          $el.remove();
        }, router.params.removeElementsTimeout);
      } else {
        $el.remove();
      }
    };

    Router.prototype.getPageEl = function getPageEl (content) {
      var router = this;
      if (typeof content === 'string') {
        router.tempDom.innerHTML = content;
      } else {
        if ($(content).hasClass('page')) {
          return content;
        }
        router.tempDom.innerHTML = '';
        $(router.tempDom).append(content);
      }

      return router.findElement('.page', router.tempDom);
    };

    Router.prototype.findElement = function findElement (stringSelector, container, notStacked) {
      var router = this;
      var view = router.view;
      var app = router.app;

      // Modals Selector
      var modalsSelector = '.popup, .dialog, .popover, .actions-modal, .sheet-modal, .login-screen, .page';

      var $container = $(container);
      var selector = stringSelector;
      if (notStacked) { selector += ':not(.stacked)'; }

      var found = $container
        .find(selector)
        .filter(function (index, el) { return $(el).parents(modalsSelector).length === 0; });

      if (found.length > 1) {
        if (typeof view.selector === 'string') {
          // Search in related view
          found = $container.find(((view.selector) + " " + selector));
        }
        if (found.length > 1) {
          // Search in main view
          found = $container.find(("." + (app.params.viewMainClass) + " " + selector));
        }
      }
      if (found.length === 1) { return found; }

      // Try to find not stacked
      if (!notStacked) { found = router.findElement(selector, $container, true); }
      if (found && found.length === 1) { return found; }
      if (found && found.length > 1) { return $(found[0]); }
      return undefined;
    };

    Router.prototype.flattenRoutes = function flattenRoutes (routes) {
      if ( routes === void 0 ) routes = this.routes;

      var router = this;
      var flattenedRoutes = [];
      routes.forEach(function (route) {
        var hasTabRoutes = false;
        if ('tabs' in route && route.tabs) {
          var mergedPathsRoutes = route.tabs.map(function (tabRoute) {
            var tRoute = Utils.extend({}, route, {
              path: (((route.path) + "/" + (tabRoute.path))).replace('///', '/').replace('//', '/'),
              parentPath: route.path,
              tab: tabRoute,
            });
            delete tRoute.tabs;
            delete tRoute.routes;
            return tRoute;
          });
          hasTabRoutes = true;
          flattenedRoutes = flattenedRoutes.concat(router.flattenRoutes(mergedPathsRoutes));
        }
        if ('detailRoutes' in route) {
          var mergedPathsRoutes$1 = route.detailRoutes.map(function (detailRoute) {
            var dRoute = Utils.extend({}, detailRoute);
            dRoute.masterRoute = route;
            dRoute.masterRoutePath = route.path;
            return dRoute;
          });
          flattenedRoutes = flattenedRoutes.concat(route, router.flattenRoutes(mergedPathsRoutes$1));
        }
        if ('routes' in route) {
          var mergedPathsRoutes$2 = route.routes.map(function (childRoute) {
            var cRoute = Utils.extend({}, childRoute);
            cRoute.path = (((route.path) + "/" + (cRoute.path))).replace('///', '/').replace('//', '/');
            return cRoute;
          });
          if (hasTabRoutes) {
            flattenedRoutes = flattenedRoutes.concat(router.flattenRoutes(mergedPathsRoutes$2));
          } else {
            flattenedRoutes = flattenedRoutes.concat(route, router.flattenRoutes(mergedPathsRoutes$2));
          }
        }
        if (!('routes' in route) && !('tabs' in route && route.tabs) && !('detailRoutes' in route)) {
          flattenedRoutes.push(route);
        }
      });
      return flattenedRoutes;
    };

    // eslint-disable-next-line
    Router.prototype.parseRouteUrl = function parseRouteUrl (url) {
      if (!url) { return {}; }
      var query = Utils.parseUrlQuery(url);
      var hash = url.split('#')[1];
      var params = {};
      var path = url.split('#')[0].split('?')[0];
      return {
        query: query,
        hash: hash,
        params: params,
        url: url,
        path: path,
      };
    };

    Router.prototype.generateUrl = function generateUrl (parameters) {
      if ( parameters === void 0 ) parameters = {};

      if (typeof parameters === 'string') {
        return parameters;
      }
      var name = parameters.name;
      var params = parameters.params;
      var query = parameters.query;
      if (!name) {
        throw new Error('Framework7: name parameter is required');
      }
      var router = this;
      var route = router.findRouteByKey('name', name);
      if (!route) {
        throw new Error(("Framework7: route with name \"" + name + "\" not found"));
      }
      var url = router.constructRouteUrl(route, { params: params, query: query });
      if (!url) {
        throw new Error(("Framework7: can't construct URL for route with name \"" + name + "\""));
      }
      return url;
    };

    // eslint-disable-next-line
    Router.prototype.constructRouteUrl = function constructRouteUrl (route, ref) {
      if ( ref === void 0 ) ref = {};
      var params = ref.params;
      var query = ref.query;

      var path = route.path;
      var toUrl = compile(path);
      var url;
      try {
        url = toUrl(params || {});
      } catch (error) {
        throw new Error(("Framework7: error constructing route URL from passed params:\nRoute: " + path + "\n" + (error.toString())));
      }

      if (query) {
        if (typeof query === 'string') { url += "?" + query; }
        else { url += "?" + (Utils.serializeObject(query)); }
      }

      return url;
    };

    Router.prototype.findTabRoute = function findTabRoute (tabEl) {
      var router = this;
      var $tabEl = $(tabEl);
      var parentPath = router.currentRoute.route.parentPath;
      var tabId = $tabEl.attr('id');
      var flattenedRoutes = router.flattenRoutes(router.routes);
      var foundTabRoute;
      flattenedRoutes.forEach(function (route) {
        if (
          route.parentPath === parentPath
          && route.tab
          && route.tab.id === tabId
        ) {
          foundTabRoute = route;
        }
      });
      return foundTabRoute;
    };

    Router.prototype.findRouteByKey = function findRouteByKey (key, value) {
      var router = this;
      var routes = router.routes;
      var flattenedRoutes = router.flattenRoutes(routes);
      var matchingRoute;

      flattenedRoutes.forEach(function (route) {
        if (matchingRoute) { return; }
        if (route[key] === value) {
          matchingRoute = route;
        }
      });
      return matchingRoute;
    };

    Router.prototype.findMatchingRoute = function findMatchingRoute (url) {
      if (!url) { return undefined; }
      var router = this;
      var routes = router.routes;
      var flattenedRoutes = router.flattenRoutes(routes);
      var ref = router.parseRouteUrl(url);
      var path = ref.path;
      var query = ref.query;
      var hash = ref.hash;
      var params = ref.params;
      var matchingRoute;
      flattenedRoutes.forEach(function (route) {
        if (matchingRoute) { return; }
        var keys = [];

        var pathsToMatch = [route.path];
        if (route.alias) {
          if (typeof route.alias === 'string') { pathsToMatch.push(route.alias); }
          else if (Array.isArray(route.alias)) {
            route.alias.forEach(function (aliasPath) {
              pathsToMatch.push(aliasPath);
            });
          }
        }

        var matched;
        pathsToMatch.forEach(function (pathToMatch) {
          if (matched) { return; }
          matched = pathToRegexp(pathToMatch, keys).exec(path);
        });

        if (matched) {
          keys.forEach(function (keyObj, index) {
            if (typeof keyObj.name === 'number') { return; }
            var paramValue = matched[index + 1];
            if (typeof paramValue === 'undefined' || paramValue === null) {
              params[keyObj.name] = paramValue;
            } else {
              params[keyObj.name] = decodeURIComponent(paramValue);
            }
          });

          var parentPath;
          if (route.parentPath) {
            parentPath = path.split('/').slice(0, route.parentPath.split('/').length - 1).join('/');
          }

          matchingRoute = {
            query: query,
            hash: hash,
            params: params,
            url: url,
            path: path,
            parentPath: parentPath,
            route: route,
            name: route.name,
          };
        }
      });
      return matchingRoute;
    };

    // eslint-disable-next-line
    Router.prototype.replaceRequestUrlParams = function replaceRequestUrlParams (url, options) {
      if ( url === void 0 ) url = '';
      if ( options === void 0 ) options = {};

      var compiledUrl = url;
      if (typeof compiledUrl === 'string'
        && compiledUrl.indexOf('{{') >= 0
        && options
        && options.route
        && options.route.params
        && Object.keys(options.route.params).length
      ) {
        Object.keys(options.route.params).forEach(function (paramName) {
          var regExp = new RegExp(("{{" + paramName + "}}"), 'g');
          compiledUrl = compiledUrl.replace(regExp, options.route.params[paramName] || '');
        });
      }
      return compiledUrl;
    };

    Router.prototype.removeFromXhrCache = function removeFromXhrCache (url) {
      var router = this;
      var xhrCache = router.cache.xhr;
      var index = false;
      for (var i = 0; i < xhrCache.length; i += 1) {
        if (xhrCache[i].url === url) { index = i; }
      }
      if (index !== false) { xhrCache.splice(index, 1); }
    };

    Router.prototype.xhrRequest = function xhrRequest (requestUrl, options) {
      var router = this;
      var params = router.params;
      var ignoreCache = options.ignoreCache;
      var url = requestUrl;

      var hasQuery = url.indexOf('?') >= 0;
      if (params.passRouteQueryToRequest
        && options
        && options.route
        && options.route.query
        && Object.keys(options.route.query).length
      ) {
        url += "" + (hasQuery ? '&' : '?') + (Utils.serializeObject(options.route.query));
        hasQuery = true;
      }

      if (params.passRouteParamsToRequest
        && options
        && options.route
        && options.route.params
        && Object.keys(options.route.params).length
      ) {
        url += "" + (hasQuery ? '&' : '?') + (Utils.serializeObject(options.route.params));
        hasQuery = true;
      }

      if (url.indexOf('{{') >= 0) {
        url = router.replaceRequestUrlParams(url, options);
      }
      // should we ignore get params or not
      if (params.xhrCacheIgnoreGetParameters && url.indexOf('?') >= 0) {
        url = url.split('?')[0];
      }
      return new Promise(function (resolve, reject) {
        if (params.xhrCache && !ignoreCache && url.indexOf('nocache') < 0 && params.xhrCacheIgnore.indexOf(url) < 0) {
          for (var i = 0; i < router.cache.xhr.length; i += 1) {
            var cachedUrl = router.cache.xhr[i];
            if (cachedUrl.url === url) {
              // Check expiration
              if (Utils.now() - cachedUrl.time < params.xhrCacheDuration) {
                // Load from cache
                resolve(cachedUrl.content);
                return;
              }
            }
          }
        }
        router.xhr = router.app.request({
          url: url,
          method: 'GET',
          beforeSend: function beforeSend(xhr) {
            router.emit('routerAjaxStart', xhr, options);
          },
          complete: function complete(xhr, status) {
            router.emit('routerAjaxComplete', xhr);
            if ((status !== 'error' && status !== 'timeout' && (xhr.status >= 200 && xhr.status < 300)) || xhr.status === 0) {
              if (params.xhrCache && xhr.responseText !== '') {
                router.removeFromXhrCache(url);
                router.cache.xhr.push({
                  url: url,
                  time: Utils.now(),
                  content: xhr.responseText,
                });
              }
              router.emit('routerAjaxSuccess', xhr, options);
              resolve(xhr.responseText);
            } else {
              router.emit('routerAjaxError', xhr, options);
              reject(xhr);
            }
          },
          error: function error(xhr) {
            router.emit('routerAjaxError', xhr, options);
            reject(xhr);
          },
        });
      });
    };

    Router.prototype.setNavbarPosition = function setNavbarPosition ($el, position, ariaHidden) {
      var router = this;
      $el.removeClass('navbar-previous navbar-current navbar-next');
      if (position) {
        $el.addClass(("navbar-" + position));
      }

      if (ariaHidden === false) {
        $el.removeAttr('aria-hidden');
      } else if (ariaHidden === true) {
        $el.attr('aria-hidden', 'true');
      }
      $el.trigger('navbar:position', { position: position });
      router.emit('navbarPosition', $el[0], position);
    };

    Router.prototype.setPagePosition = function setPagePosition ($el, position, ariaHidden) {
      var router = this;
      $el.removeClass('page-previous page-current page-next');
      $el.addClass(("page-" + position));
      if (ariaHidden === false) {
        $el.removeAttr('aria-hidden');
      } else if (ariaHidden === true) {
        $el.attr('aria-hidden', 'true');
      }
      $el.trigger('page:position', { position: position });
      router.emit('pagePosition', $el[0], position);
    };

    // Remove theme elements
    Router.prototype.removeThemeElements = function removeThemeElements (el) {
      var router = this;
      var theme = router.app.theme;
      var toRemove;
      if (theme === 'ios') {
        toRemove = '.md-only, .aurora-only, .if-md, .if-aurora, .if-not-ios, .not-ios';
      } else if (theme === 'md') {
        toRemove = '.ios-only, .aurora-only, .if-ios, .if-aurora, .if-not-md, .not-md';
      } else if (theme === 'aurora') {
        toRemove = '.ios-only, .md-only, .if-ios, .if-md, .if-not-aurora, .not-aurora';
      }
      $(el).find(toRemove).remove();
    };

    Router.prototype.getPageData = function getPageData (pageEl, navbarEl, from, to, route, pageFromEl) {
      if ( route === void 0 ) route = {};

      var router = this;
      var $pageEl = $(pageEl).eq(0);
      var $navbarEl = $(navbarEl).eq(0);
      var currentPage = $pageEl[0].f7Page || {};
      var direction;
      var pageFrom;
      if ((from === 'next' && to === 'current') || (from === 'current' && to === 'previous')) { direction = 'forward'; }
      if ((from === 'current' && to === 'next') || (from === 'previous' && to === 'current')) { direction = 'backward'; }
      if (currentPage && !currentPage.fromPage) {
        var $pageFromEl = $(pageFromEl);
        if ($pageFromEl.length) {
          pageFrom = $pageFromEl[0].f7Page;
        }
      }
      pageFrom = currentPage.pageFrom || pageFrom;
      if (pageFrom && pageFrom.pageFrom) {
        pageFrom.pageFrom = null;
      }
      var page = {
        app: router.app,
        view: router.view,
        router: router,
        $el: $pageEl,
        el: $pageEl[0],
        $pageEl: $pageEl,
        pageEl: $pageEl[0],
        $navbarEl: $navbarEl,
        navbarEl: $navbarEl[0],
        name: $pageEl.attr('data-name'),
        position: from,
        from: from,
        to: to,
        direction: direction,
        route: currentPage.route ? currentPage.route : route,
        pageFrom: pageFrom,
      };

      $pageEl[0].f7Page = page;
      return page;
    };

    // Callbacks
    Router.prototype.pageCallback = function pageCallback (callback, pageEl, navbarEl, from, to, options, pageFromEl) {
      if ( options === void 0 ) options = {};

      if (!pageEl) { return; }
      var router = this;
      var $pageEl = $(pageEl);
      if (!$pageEl.length) { return; }
      var $navbarEl = $(navbarEl);
      var route = options.route;
      var restoreScrollTopOnBack = router.params.restoreScrollTopOnBack
        && !(
          router.params.masterDetailBreakpoint > 0
          && $pageEl.hasClass('page-master')
          && router.app.width >= router.params.masterDetailBreakpoint
        );
      var keepAlive = $pageEl[0].f7Page && $pageEl[0].f7Page.route && $pageEl[0].f7Page.route.route && $pageEl[0].f7Page.route.route.keepAlive;

      if (callback === 'beforeRemove' && keepAlive) {
        callback = 'beforeUnmount'; // eslint-disable-line
      }

      var camelName = "page" + (callback[0].toUpperCase() + callback.slice(1, callback.length));
      var colonName = "page:" + (callback.toLowerCase());

      var page = {};
      if (callback === 'beforeRemove' && $pageEl[0].f7Page) {
        page = Utils.extend($pageEl[0].f7Page, { from: from, to: to, position: from });
      } else {
        page = router.getPageData($pageEl[0], $navbarEl[0], from, to, route, pageFromEl);
      }
      page.swipeBack = !!options.swipeBack;

      var ref = options.route ? options.route.route : {};
      var on = ref.on; if ( on === void 0 ) on = {};
      var once = ref.once; if ( once === void 0 ) once = {};
      if (options.on) {
        Utils.extend(on, options.on);
      }
      if (options.once) {
        Utils.extend(once, options.once);
      }

      function attachEvents() {
        if ($pageEl[0].f7RouteEventsAttached) { return; }
        $pageEl[0].f7RouteEventsAttached = true;
        if (on && Object.keys(on).length > 0) {
          $pageEl[0].f7RouteEventsOn = on;
          Object.keys(on).forEach(function (eventName) {
            on[eventName] = on[eventName].bind(router);
            $pageEl.on(Utils.eventNameToColonCase(eventName), on[eventName]);
          });
        }
        if (once && Object.keys(once).length > 0) {
          $pageEl[0].f7RouteEventsOnce = once;
          Object.keys(once).forEach(function (eventName) {
            once[eventName] = once[eventName].bind(router);
            $pageEl.once(Utils.eventNameToColonCase(eventName), once[eventName]);
          });
        }
      }

      function detachEvents() {
        if (!$pageEl[0].f7RouteEventsAttached) { return; }
        if ($pageEl[0].f7RouteEventsOn) {
          Object.keys($pageEl[0].f7RouteEventsOn).forEach(function (eventName) {
            $pageEl.off(Utils.eventNameToColonCase(eventName), $pageEl[0].f7RouteEventsOn[eventName]);
          });
        }
        if ($pageEl[0].f7RouteEventsOnce) {
          Object.keys($pageEl[0].f7RouteEventsOnce).forEach(function (eventName) {
            $pageEl.off(Utils.eventNameToColonCase(eventName), $pageEl[0].f7RouteEventsOnce[eventName]);
          });
        }
        $pageEl[0].f7RouteEventsAttached = null;
        $pageEl[0].f7RouteEventsOn = null;
        $pageEl[0].f7RouteEventsOnce = null;
        delete $pageEl[0].f7RouteEventsAttached;
        delete $pageEl[0].f7RouteEventsOn;
        delete $pageEl[0].f7RouteEventsOnce;
      }

      if (callback === 'mounted') {
        attachEvents();
      }
      if (callback === 'init') {
        if (restoreScrollTopOnBack && (from === 'previous' || !from) && to === 'current' && router.scrollHistory[page.route.url] && !$pageEl.hasClass('no-restore-scroll')) {
          var $pageContent = $pageEl.find('.page-content');
          if ($pageContent.length > 0) {
            // eslint-disable-next-line
            $pageContent = $pageContent.filter(function (pageContentIndex, pageContentEl) {
              return (
                $(pageContentEl).parents('.tab:not(.tab-active)').length === 0
                && !$(pageContentEl).is('.tab:not(.tab-active)')
              );
            });
          }
          $pageContent.scrollTop(router.scrollHistory[page.route.url]);
        }
        attachEvents();
        if ($pageEl[0].f7PageInitialized) {
          $pageEl.trigger('page:reinit', page);
          router.emit('pageReinit', page);
          return;
        }
        $pageEl[0].f7PageInitialized = true;
      }
      if (restoreScrollTopOnBack && callback === 'beforeOut' && from === 'current' && to === 'previous') {
        // Save scroll position
        var $pageContent$1 = $pageEl.find('.page-content');
        if ($pageContent$1.length > 0) {
          // eslint-disable-next-line
          $pageContent$1 = $pageContent$1.filter(function (pageContentIndex, pageContentEl) {
            return (
              $(pageContentEl).parents('.tab:not(.tab-active)').length === 0
              && !$(pageContentEl).is('.tab:not(.tab-active)')
            );
          });
        }
        router.scrollHistory[page.route.url] = $pageContent$1.scrollTop();
      }
      if (restoreScrollTopOnBack && callback === 'beforeOut' && from === 'current' && to === 'next') {
        // Delete scroll position
        delete router.scrollHistory[page.route.url];
      }

      $pageEl.trigger(colonName, page);
      router.emit(camelName, page);

      if (callback === 'beforeRemove' || callback === 'beforeUnmount') {
        detachEvents();
        if (!keepAlive) {
          if ($pageEl[0].f7Page && $pageEl[0].f7Page.navbarEl) {
            delete $pageEl[0].f7Page.navbarEl.f7Page;
          }
          $pageEl[0].f7Page = null;
        }
      }
    };

    Router.prototype.saveHistory = function saveHistory () {
      var router = this;
      router.view.history = router.history;
      if (router.params.pushState) {
        win.localStorage[("f7router-" + (router.view.id) + "-history")] = JSON.stringify(router.history);
      }
    };

    Router.prototype.restoreHistory = function restoreHistory () {
      var router = this;
      if (router.params.pushState && win.localStorage[("f7router-" + (router.view.id) + "-history")]) {
        router.history = JSON.parse(win.localStorage[("f7router-" + (router.view.id) + "-history")]);
        router.view.history = router.history;
      }
    };

    Router.prototype.clearHistory = function clearHistory () {
      var router = this;
      router.history = [];
      if (router.view) { router.view.history = []; }
      router.saveHistory();
    };

    Router.prototype.updateCurrentUrl = function updateCurrentUrl (newUrl) {
      var router = this;
      appRouterCheck(router, 'updateCurrentUrl');
      // Update history
      if (router.history.length) {
        router.history[router.history.length - 1] = newUrl;
      } else {
        router.history.push(newUrl);
      }

      // Update current route params
      var ref = router.parseRouteUrl(newUrl);
      var query = ref.query;
      var hash = ref.hash;
      var params = ref.params;
      var url = ref.url;
      var path = ref.path;
      if (router.currentRoute) {
        Utils.extend(router.currentRoute, {
          query: query,
          hash: hash,
          params: params,
          url: url,
          path: path,
        });
      }

      if (router.params.pushState) {
        var pushStateRoot = router.params.pushStateRoot || '';
        History.replace(
          router.view.id,
          {
            url: newUrl,
          },
          pushStateRoot + router.params.pushStateSeparator + newUrl
        );
      }

      // Save History
      router.saveHistory();

      router.emit('routeUrlUpdate', router.currentRoute, router);
    };

    Router.prototype.init = function init () {
      var router = this;
      var app = router.app;
      var view = router.view;

      // Init Swipeback
      if (
        (view && router.params.iosSwipeBack && app.theme === 'ios')
        || (view && router.params.mdSwipeBack && app.theme === 'md')
        || (view && router.params.auroraSwipeBack && app.theme === 'aurora')
      ) {
        SwipeBack(router);
      }

      var initUrl = router.params.url;
      var documentUrl = doc.location.href.split(doc.location.origin)[1];
      var historyRestored;
      var ref = router.params;
      var pushState = ref.pushState;
      var pushStateOnLoad = ref.pushStateOnLoad;
      var pushStateSeparator = ref.pushStateSeparator;
      var pushStateAnimateOnLoad = ref.pushStateAnimateOnLoad;
      var ref$1 = router.params;
      var pushStateRoot = ref$1.pushStateRoot;
      if (win.cordova && pushState && !pushStateSeparator && !pushStateRoot && doc.location.pathname.indexOf('index.html')) {
        // eslint-disable-next-line
        console.warn('Framework7: wrong or not complete pushState configuration, trying to guess pushStateRoot');
        pushStateRoot = doc.location.pathname.split('index.html')[0];
      }
      if (!pushState || !pushStateOnLoad) {
        if (!initUrl) {
          initUrl = documentUrl;
        }
        if (doc.location.search && initUrl.indexOf('?') < 0) {
          initUrl += doc.location.search;
        }
        if (doc.location.hash && initUrl.indexOf('#') < 0) {
          initUrl += doc.location.hash;
        }
      } else {
        if (pushStateRoot && documentUrl.indexOf(pushStateRoot) >= 0) {
          documentUrl = documentUrl.split(pushStateRoot)[1];
          if (documentUrl === '') { documentUrl = '/'; }
        }
        if (pushStateSeparator.length > 0 && documentUrl.indexOf(pushStateSeparator) >= 0) {
          initUrl = documentUrl.split(pushStateSeparator)[1];
        } else {
          initUrl = documentUrl;
        }
        router.restoreHistory();
        if (router.history.indexOf(initUrl) >= 0) {
          router.history = router.history.slice(0, router.history.indexOf(initUrl) + 1);
        } else if (router.params.url === initUrl) {
          router.history = [initUrl];
        } else if (History.state && History.state[view.id] && History.state[view.id].url === router.history[router.history.length - 1]) {
          initUrl = router.history[router.history.length - 1];
        } else {
          router.history = [documentUrl.split(pushStateSeparator)[0] || '/', initUrl];
        }
        if (router.history.length > 1) {
          historyRestored = true;
        } else {
          router.history = [];
        }
        router.saveHistory();
      }
      var currentRoute;
      if (router.history.length > 1) {
        // Will load page
        currentRoute = router.findMatchingRoute(router.history[0]);
        if (!currentRoute) {
          currentRoute = Utils.extend(router.parseRouteUrl(router.history[0]), {
            route: {
              url: router.history[0],
              path: router.history[0].split('?')[0],
            },
          });
        }
      } else {
        // Don't load page
        currentRoute = router.findMatchingRoute(initUrl);
        if (!currentRoute) {
          currentRoute = Utils.extend(router.parseRouteUrl(initUrl), {
            route: {
              url: initUrl,
              path: initUrl.split('?')[0],
            },
          });
        }
      }

      if (router.params.stackPages) {
        router.$el.children('.page').each(function (index, pageEl) {
          var $pageEl = $(pageEl);
          router.initialPages.push($pageEl[0]);
          if (router.dynamicNavbar && $pageEl.children('.navbar').length > 0) {
            router.initialNavbars.push($pageEl.children('.navbar')[0]);
          }
        });
      }

      if (router.$el.children('.page:not(.stacked)').length === 0 && initUrl && router.params.loadInitialPage) {
        // No pages presented in DOM, reload new page
        router.navigate(initUrl, {
          initial: true,
          reloadCurrent: true,
          pushState: false,
        });
      } else if (router.$el.children('.page:not(.stacked)').length) {
        // Init current DOM page
        var hasTabRoute;
        router.currentRoute = currentRoute;
        router.$el.children('.page:not(.stacked)').each(function (index, pageEl) {
          var $pageEl = $(pageEl);
          var $navbarEl;
          router.setPagePosition($pageEl, 'current');
          if (router.dynamicNavbar) {
            $navbarEl = $pageEl.children('.navbar');
            if ($navbarEl.length > 0) {
              if (!router.$navbarsEl.parents(doc).length) {
                router.$el.prepend(router.$navbarsEl);
              }
              router.setNavbarPosition($navbarEl, 'current');
              router.$navbarsEl.append($navbarEl);
              if ($navbarEl.children('.title-large').length) {
                $navbarEl.addClass('navbar-large');
              }
              $pageEl.children('.navbar').remove();
            } else {
              router.$navbarsEl.addClass('navbar-hidden');
              if ($navbarEl.children('.title-large').length) {
                router.$navbarsEl.addClass('navbar-hidden navbar-large-hidden');
              }
            }
          }
          if (router.currentRoute && router.currentRoute.route && router.currentRoute.route.master && router.params.masterDetailBreakpoint > 0) {
            $pageEl.addClass('page-master');
            $pageEl.trigger('page:role', { role: 'master' });
            if ($navbarEl && $navbarEl.length) {
              $navbarEl.addClass('navbar-master');
            }
            view.checkMasterDetailBreakpoint();
          }
          var initOptions = {
            route: router.currentRoute,
          };
          if (router.currentRoute && router.currentRoute.route && router.currentRoute.route.options) {
            Utils.extend(initOptions, router.currentRoute.route.options);
          }
          router.currentPageEl = $pageEl[0];
          if (router.dynamicNavbar && $navbarEl.length) {
            router.currentNavbarEl = $navbarEl[0];
          }
          router.removeThemeElements($pageEl);
          if (router.dynamicNavbar && $navbarEl.length) {
            router.removeThemeElements($navbarEl);
          }
          if (initOptions.route.route.tab) {
            hasTabRoute = true;
            router.tabLoad(initOptions.route.route.tab, Utils.extend({}, initOptions));
          }
          router.pageCallback('init', $pageEl, $navbarEl, 'current', undefined, initOptions);
        });
        if (historyRestored) {
          router.navigate(initUrl, {
            initial: true,
            pushState: false,
            history: false,
            animate: pushStateAnimateOnLoad,
            once: {
              pageAfterIn: function pageAfterIn() {
                var preloadPreviousPage = router.params.preloadPreviousPage || router.params[((app.theme) + "SwipeBack")];
                if (preloadPreviousPage && router.history.length > 2) {
                  router.back({ preload: true });
                }
              },
            },
          });
        }
        if (!historyRestored && !hasTabRoute) {
          router.history.push(initUrl);
          router.saveHistory();
        }
      }
      if (initUrl && pushState && pushStateOnLoad && (!History.state || !History.state[view.id])) {
        History.initViewState(view.id, {
          url: initUrl,
        });
      }
      router.emit('local::init routerInit', router);
    };

    Router.prototype.destroy = function destroy () {
      var router = this;

      router.emit('local::destroy routerDestroy', router);

      // Delete props & methods
      Object.keys(router).forEach(function (routerProp) {
        router[routerProp] = null;
        delete router[routerProp];
      });

      router = null;
    };

    return Router;
  }(Framework7Class));

  // Load
  Router.prototype.forward = forward;
  Router.prototype.load = load;
  Router.prototype.navigate = navigate;
  Router.prototype.refreshPage = refreshPage;
  // Tab
  Router.prototype.tabLoad = tabLoad;
  Router.prototype.tabRemove = tabRemove;
  // Modal
  Router.prototype.modalLoad = modalLoad;
  Router.prototype.modalRemove = modalRemove;
  // Back
  Router.prototype.backward = backward;
  Router.prototype.loadBack = loadBack;
  Router.prototype.back = back;
  // Clear history
  Router.prototype.clearPreviousHistory = clearPreviousHistory;

  var RouterModule = {
    name: 'router',
    static: {
      Router: Router,
    },
    instance: {
      cache: {
        xhr: [],
        templates: [],
        components: [],
      },
    },
    create: function create() {
      var instance = this;
      if (instance.app) {
        // View Router
        if (instance.params.router) {
          instance.router = new Router(instance.app, instance);
        }
      } else {
        // App Router
        instance.router = new Router(instance);
      }
    },
  };

  function resizableView(view) {
    var app = view.app;
    if (view.resizableInitialized) { return; }
    Utils.extend(view, {
      resizable: true,
      resizableWidth: null,
      resizableInitialized: true,
    });
    var $htmlEl = $('html');
    var $el = view.$el;
    if (!$el) { return; }

    var $resizeHandlerEl;

    var isTouched;
    var isMoved;
    var touchesStart = {};
    var touchesDiff;
    var width;

    var minWidth;
    var maxWidth;

    function transformCSSWidth(v) {
      if (!v) { return null; }
      if (v.indexOf('%') >= 0 || v.indexOf('vw') >= 0) {
        return parseInt(v, 10) / 100 * app.width;
      }
      var newV = parseInt(v, 10);
      if (Number.isNaN(newV)) { return null; }
      return newV;
    }

    function isResizable() {
      return view.resizable && $el.hasClass('view-resizable') && $el.hasClass('view-master-detail');
    }

    function handleTouchStart(e) {
      if (!isResizable()) { return; }
      touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      isMoved = false;
      isTouched = true;
      var $pageMasterEl = $el.children('.page-master');
      minWidth = transformCSSWidth($pageMasterEl.css('min-width'));
      maxWidth = transformCSSWidth($pageMasterEl.css('max-width'));
    }
    function handleTouchMove(e) {
      if (!isTouched) { return; }
      e.f7PreventSwipePanel = true;
      var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;

      if (!isMoved) {
        width = $resizeHandlerEl[0].offsetLeft + $resizeHandlerEl[0].offsetWidth;
        $el.addClass('view-resizing');
        $htmlEl.css('cursor', 'col-resize');
      }

      isMoved = true;

      e.preventDefault();

      touchesDiff = (pageX - touchesStart.x);

      var newWidth = width + touchesDiff;
      if (minWidth && !Number.isNaN(minWidth)) {
        newWidth = Math.max(newWidth, minWidth);
      }
      if (maxWidth && !Number.isNaN(maxWidth)) {
        newWidth = Math.min(newWidth, maxWidth);
      }
      newWidth = Math.min(Math.max(newWidth, 0), app.width);

      view.resizableWidth = newWidth;
      $htmlEl[0].style.setProperty('--f7-page-master-width', (newWidth + "px"));

      $el.trigger('view:resize', newWidth);
      view.emit('local::resize viewResize', view, newWidth);
    }
    function handleTouchEnd() {
      $('html').css('cursor', '');
      if (!isTouched || !isMoved) {
        isTouched = false;
        isMoved = false;
        return;
      }
      isTouched = false;
      isMoved = false;

      $htmlEl[0].style.setProperty('--f7-page-master-width', ((view.resizableWidth) + "px"));
      $el.removeClass('view-resizing');
    }

    function handleResize() {
      if (!view.resizableWidth) { return; }
      minWidth = transformCSSWidth($resizeHandlerEl.css('min-width'));
      maxWidth = transformCSSWidth($resizeHandlerEl.css('max-width'));

      if (minWidth && !Number.isNaN(minWidth) && view.resizableWidth < minWidth) {
        view.resizableWidth = Math.max(view.resizableWidth, minWidth);
      }
      if (maxWidth && !Number.isNaN(maxWidth) && view.resizableWidth > maxWidth) {
        view.resizableWidth = Math.min(view.resizableWidth, maxWidth);
      }
      view.resizableWidth = Math.min(Math.max(view.resizableWidth, 0), app.width);

      $htmlEl[0].style.setProperty('--f7-page-master-width', ((view.resizableWidth) + "px"));
    }

    $resizeHandlerEl = view.$el.children('.view-resize-handler');
    if (!$resizeHandlerEl.length) {
      view.$el.append('<div class="view-resize-handler"></div>');
      $resizeHandlerEl = view.$el.children('.view-resize-handler');
    }
    view.$resizeHandlerEl = $resizeHandlerEl;

    $el.addClass('view-resizable');

    // Add Events
    var passive = Support.passiveListener ? { passive: true } : false;

    view.$el.on(app.touchEvents.start, '.view-resize-handler', handleTouchStart, passive);
    app.on('touchmove:active', handleTouchMove);
    app.on('touchend:passive', handleTouchEnd);
    app.on('resize', handleResize);
    view.on('beforeOpen', handleResize);

    view.once('viewDestroy', function () {
      $el.removeClass('view-resizable');
      view.$resizeHandlerEl.remove();
      view.$el.off(app.touchEvents.start, '.view-resize-handler', handleTouchStart, passive);
      app.off('touchmove:active', handleTouchMove);
      app.off('touchend:passive', handleTouchEnd);
      app.off('resize', handleResize);
      view.off('beforeOpen', handleResize);
    });
  }

  var View = /*@__PURE__*/(function (Framework7Class) {
    function View(appInstance, el, viewParams) {
      if ( viewParams === void 0 ) viewParams = {};

      Framework7Class.call(this, viewParams, [appInstance]);

      var app = appInstance;
      var $el = $(el);
      var view = this;

      var defaults = {
        routes: [],
        routesAdd: [],
      };

      if ($el.length === 0) {
        var message = 'Framework7: can\'t create a View instance because ';
        message += (typeof el === 'string')
          ? ("the selector \"" + el + "\" didn't match any element")
          : 'el must be an HTMLElement or Dom7 object';

        throw new Error(message);
      }

      // Default View params
      view.params = Utils.extend(defaults, app.params.view, viewParams);

      // Routes
      if (view.params.routes.length > 0) {
        view.routes = view.params.routes;
      } else {
        view.routes = [].concat(app.routes, view.params.routesAdd);
      }

      // Selector
      var selector;
      if (typeof el === 'string') { selector = el; }
      else {
        // Supposed to be HTMLElement or Dom7
        selector = ($el.attr('id') ? ("#" + ($el.attr('id'))) : '') + ($el.attr('class') ? ("." + ($el.attr('class').replace(/ /g, '.').replace('.active', ''))) : '');
      }

      // DynamicNavbar
      var $navbarsEl;
      if (app.theme === 'ios' && view.params.iosDynamicNavbar) {
        $navbarsEl = $el.children('.navbars').eq(0);
        if ($navbarsEl.length === 0) {
          $navbarsEl = $('<div class="navbars"></div>');
        }
      }

      // View Props
      Utils.extend(false, view, {
        app: app,
        $el: $el,
        el: $el[0],
        name: view.params.name,
        main: view.params.main || $el.hasClass('view-main'),
        $navbarsEl: $navbarsEl,
        navbarsEl: $navbarsEl ? $navbarsEl[0] : undefined,
        selector: selector,
        history: [],
        scrollHistory: {},
      });

      // Save in DOM
      $el[0].f7View = view;

      // Install Modules
      view.useModules();

      // Add to app
      app.views.push(view);
      if (view.main) {
        app.views.main = view;
      }
      if (view.name) {
        app.views[view.name] = view;
      }

      // Index
      view.index = app.views.indexOf(view);

      // View ID
      var viewId;
      if (view.name) {
        viewId = "view_" + (view.name);
      } else if (view.main) {
        viewId = 'view_main';
      } else {
        viewId = "view_" + (view.index);
      }
      view.id = viewId;

      // Init View
      if (app.initialized) {
        view.init();
      } else {
        app.on('init', function () {
          view.init();
        });
      }

      return view;
    }

    if ( Framework7Class ) View.__proto__ = Framework7Class;
    View.prototype = Object.create( Framework7Class && Framework7Class.prototype );
    View.prototype.constructor = View;

    View.prototype.destroy = function destroy () {
      var view = this;
      var app = view.app;

      view.$el.trigger('view:beforedestroy');
      view.emit('local::beforeDestroy viewBeforeDestroy', view);

      app.off('resize', view.checkMasterDetailBreakpoint);

      if (view.main) {
        app.views.main = null;
        delete app.views.main;
      } else if (view.name) {
        app.views[view.name] = null;
        delete app.views[view.name];
      }
      view.$el[0].f7View = null;
      delete view.$el[0].f7View;

      app.views.splice(app.views.indexOf(view), 1);

      // Destroy Router
      if (view.params.router && view.router) {
        view.router.destroy();
      }

      view.emit('local::destroy viewDestroy', view);

      // Delete props & methods
      Object.keys(view).forEach(function (viewProp) {
        view[viewProp] = null;
        delete view[viewProp];
      });

      view = null;
    };

    View.prototype.checkMasterDetailBreakpoint = function checkMasterDetailBreakpoint (force) {
      var view = this;
      var app = view.app;
      var wasMasterDetail = view.$el.hasClass('view-master-detail');
      var isMasterDetail = app.width >= view.params.masterDetailBreakpoint && view.$el.children('.page-master').length;
      if ((typeof force === 'undefined' && isMasterDetail) || force === true) {
        view.$el.addClass('view-master-detail');
        if (!wasMasterDetail) {
          view.emit('local::masterDetailBreakpoint viewMasterDetailBreakpoint', view);
          view.$el.trigger('view:masterDetailBreakpoint');
        }
      } else {
        view.$el.removeClass('view-master-detail');
        if (wasMasterDetail) {
          view.emit('local::masterDetailBreakpoint viewMasterDetailBreakpoint', view);
          view.$el.trigger('view:masterDetailBreakpoint');
        }
      }
    };

    View.prototype.initMasterDetail = function initMasterDetail () {
      var view = this;
      var app = view.app;
      view.checkMasterDetailBreakpoint = view.checkMasterDetailBreakpoint.bind(view);
      view.checkMasterDetailBreakpoint();
      if (view.params.masterDetailResizable) {
        resizableView(view);
      }
      app.on('resize', view.checkMasterDetailBreakpoint);
    };

    View.prototype.init = function init () {
      var view = this;
      if (view.params.router) {
        if (view.params.masterDetailBreakpoint > 0) {
          view.initMasterDetail();
        }
        view.router.init();
        view.$el.trigger('view:init');
        view.emit('local::init viewInit', view);
      }
    };

    return View;
  }(Framework7Class));

  // Use Router
  View.use(RouterModule);

  function initClicks(app) {
    function handleClicks(e) {
      var $clickedEl = $(e.target);
      var $clickedLinkEl = $clickedEl.closest('a');
      var isLink = $clickedLinkEl.length > 0;
      var url = isLink && $clickedLinkEl.attr('href');
      // const isTabLink = isLink && $clickedLinkEl.hasClass('tab-link') && ($clickedLinkEl.attr('data-tab') || (url && url.indexOf('#') === 0));

      // Check if link is external
      if (isLink) {
        // eslint-disable-next-line
        if ($clickedLinkEl.is(app.params.clicks.externalLinks) || (url && url.indexOf('javascript:') >= 0)) {
          var target = $clickedLinkEl.attr('target');
          if (
            url
            && win.cordova
            && win.cordova.InAppBrowser
            && (target === '_system' || target === '_blank')
          ) {
            e.preventDefault();
            win.cordova.InAppBrowser.open(url, target);
          }
          return;
        }
      }

      // Modules Clicks
      Object.keys(app.modules).forEach(function (moduleName) {
        var moduleClicks = app.modules[moduleName].clicks;
        if (!moduleClicks) { return; }
        if (e.preventF7Router) { return; }
        Object.keys(moduleClicks).forEach(function (clickSelector) {
          var matchingClickedElement = $clickedEl.closest(clickSelector).eq(0);
          if (matchingClickedElement.length > 0) {
            moduleClicks[clickSelector].call(app, matchingClickedElement, matchingClickedElement.dataset(), e);
          }
        });
      });

      // Load Page
      var clickedLinkData = {};
      if (isLink) {
        e.preventDefault();
        clickedLinkData = $clickedLinkEl.dataset();
      }

      // Prevent Router
      if (e.preventF7Router) { return; }
      if ($clickedLinkEl.hasClass('prevent-router') || $clickedLinkEl.hasClass('router-prevent')) { return; }

      var validUrl = url && url.length > 0 && url[0] !== '#';
      if (validUrl || $clickedLinkEl.hasClass('back')) {
        var view;
        if (clickedLinkData.view && clickedLinkData.view === 'current') {
          view = app.views.current;
        } else if (clickedLinkData.view) {
          view = $(clickedLinkData.view)[0].f7View;
        } else {
          view = $clickedEl.parents('.view')[0] && $clickedEl.parents('.view')[0].f7View;
          if (!$clickedLinkEl.hasClass('back') && view && view.params.linksView) {
            if (typeof view.params.linksView === 'string') { view = $(view.params.linksView)[0].f7View; }
            else if (view.params.linksView instanceof View) { view = view.params.linksView; }
          }
        }
        if (!view) {
          if (app.views.main) { view = app.views.main; }
        }
        if (!view || !view.router) { return; }
        if (clickedLinkData.context && typeof clickedLinkData.context === 'string') {
          try {
            clickedLinkData.context = JSON.parse(clickedLinkData.context);
          } catch (err) {
            // something wrong there
          }
        }
        if ($clickedLinkEl[0].f7RouteProps) {
          clickedLinkData.props = $clickedLinkEl[0].f7RouteProps;
        }
        if ($clickedLinkEl.hasClass('back')) { view.router.back(url, clickedLinkData); }
        else { view.router.navigate(url, clickedLinkData); }
      }
    }

    app.on('click', handleClicks);
  }
  var ClicksModule = {
    name: 'clicks',
    params: {
      clicks: {
        // External Links
        externalLinks: '.external',
      },
    },
    on: {
      init: function init() {
        var app = this;
        initClicks(app);
      },
    },
  };

  var RouterTemplateLoaderModule = {
    name: 'routerTemplateLoader',
    proto: {
      templateLoader: function templateLoader(template, templateUrl, options, resolve, reject) {
        var router = this;
        function compile(t) {
          var compiledHtml;
          var context;
          try {
            context = options.context || {};
            if (typeof context === 'function') { context = context.call(router); }
            else if (typeof context === 'string') {
              try {
                context = JSON.parse(context);
              } catch (err) {
                reject();
                throw (err);
              }
            }
            if (typeof t === 'function') {
              compiledHtml = t(context);
            } else {
              compiledHtml = Template7.compile(t)(Utils.extend({}, context || {}, {
                $app: router.app,
                $root: Utils.extend({}, router.app.data, router.app.methods),
                $route: options.route,
                $f7route: options.route,
                $router: router,
                $f7router: router,
                $theme: {
                  ios: router.app.theme === 'ios',
                  md: router.app.theme === 'md',
                  aurora: router.app.theme === 'aurora',
                },
              }));
            }
          } catch (err$1) {
            reject();
            throw (err$1);
          }
          resolve(compiledHtml, { context: context });
        }
        if (templateUrl) {
          // Load via XHR
          if (router.xhr) {
            router.xhr.abort();
            router.xhr = false;
          }
          router
            .xhrRequest(templateUrl, options)
            .then(function (templateContent) {
              compile(templateContent);
            })
            .catch(function () {
              reject();
            });
        } else {
          compile(template);
        }
      },

      modalTemplateLoader: function modalTemplateLoader(template, templateUrl, options, resolve, reject) {
        var router = this;
        return router.templateLoader(template, templateUrl, options, function (html) {
          resolve(html);
        }, reject);
      },

      tabTemplateLoader: function tabTemplateLoader(template, templateUrl, options, resolve, reject) {
        var router = this;
        return router.templateLoader(template, templateUrl, options, function (html) {
          resolve(html);
        }, reject);
      },

      pageTemplateLoader: function pageTemplateLoader(template, templateUrl, options, resolve, reject) {
        var router = this;
        return router.templateLoader(template, templateUrl, options, function (html, newOptions) {
          if ( newOptions === void 0 ) newOptions = {};

          resolve(router.getPageEl(html), newOptions);
        }, reject);
      },
    },
  };

  var RouterComponentLoaderModule = {
    name: 'routerComponentLoader',
    proto: {
      componentLoader: function componentLoader(component, componentUrl, options, resolve, reject) {
        if ( options === void 0 ) options = {};

        var router = this;
        var app = router.app;
        var url = typeof component === 'string' ? component : componentUrl;
        var compiledUrl = router.replaceRequestUrlParams(url, options);
        function compile(componentOptions) {
          var context = options.context || {};
          if (typeof context === 'function') { context = context.call(router); }
          else if (typeof context === 'string') {
            try {
              context = JSON.parse(context);
            } catch (err) {
              reject(err);
              throw (err);
            }
          }
          var extendContext = Utils.merge(
            {},
            context,
            {
              $route: options.route,
              $f7route: options.route,
              $router: router,
              $f7router: router,
              $theme: {
                ios: app.theme === 'ios',
                md: app.theme === 'md',
                aurora: app.theme === 'aurora',
              },
            }
          );
          if (options.componentOptions && options.componentOptions.el) {
            componentOptions.el = options.componentOptions.el;
          }
          if (options.componentOptions && options.componentOptions.root) {
            componentOptions.root = options.componentOptions.root;
          }
          app.component.create(componentOptions, extendContext)
            .then(function (createdComponent) {
              resolve(createdComponent.el);
            })
            .catch(function (err) {
              reject(err);
              throw new Error(err);
            });
        }
        var cachedComponent;
        if (compiledUrl && router.params.componentCache) {
          router.cache.components.forEach(function (cached) {
            if (cached.url === compiledUrl) { cachedComponent = cached.component; }
          });
        }
        if (compiledUrl && cachedComponent) {
          compile(cachedComponent);
        } else if (compiledUrl && !cachedComponent) {
          // Load via XHR
          if (router.xhr) {
            router.xhr.abort();
            router.xhr = false;
          }
          router
            .xhrRequest(url, options)
            .then(function (loadedComponent) {
              var parsedComponent = app.component.parse(loadedComponent);
              if (router.params.componentCache) {
                router.cache.components.push({
                  url: compiledUrl,
                  component: parsedComponent,
                });
              }
              compile(parsedComponent);
            })
            .catch(function (err) {
              reject();
              throw (err);
            });
        } else {
          compile(component);
        }
      },

      modalComponentLoader: function modalComponentLoader(rootEl, component, componentUrl, options, resolve, reject) {
        var router = this;
        router.componentLoader(component, componentUrl, options, function (el) {
          resolve(el);
        }, reject);
      },

      tabComponentLoader: function tabComponentLoader(tabEl, component, componentUrl, options, resolve, reject) {
        var router = this;
        router.componentLoader(component, componentUrl, options, function (el) {
          resolve(el);
        }, reject);
      },

      pageComponentLoader: function pageComponentLoader(routerEl, component, componentUrl, options, resolve, reject) {
        var router = this;
        router.componentLoader(component, componentUrl, options, function (el, newOptions) {
          if ( newOptions === void 0 ) newOptions = {};

          resolve(el, newOptions);
        }, reject);
      },
    },
  };

  function vnode(sel, data, children, text, elm) {
      var key = data === undefined ? undefined : data.key;
      return { sel: sel, data: data, children: children,
          text: text, elm: elm, key: key };
  }

  var array = Array.isArray;
  function primitive(s) {
      return typeof s === 'string' || typeof s === 'number';
  }

  function addNS(data, children, sel) {
      data.ns = 'http://www.w3.org/2000/svg';
      if (sel !== 'foreignObject' && children !== undefined) {
          for (var i = 0; i < children.length; ++i) {
              var childData = children[i].data;
              if (childData !== undefined) {
                  addNS(childData, children[i].children, children[i].sel);
              }
          }
      }
  }
  function h(sel, b, c) {
      var data = {}, children, text, i;
      if (c !== undefined) {
          data = b;
          if (array(c)) {
              children = c;
          }
          else if (primitive(c)) {
              text = c;
          }
          else if (c && c.sel) {
              children = [c];
          }
      }
      else if (b !== undefined) {
          if (array(b)) {
              children = b;
          }
          else if (primitive(b)) {
              text = b;
          }
          else if (b && b.sel) {
              children = [b];
          }
          else {
              data = b;
          }
      }
      if (array(children)) {
          for (i = 0; i < children.length; ++i) {
              if (primitive(children[i]))
                  { children[i] = vnode(undefined, undefined, undefined, children[i], undefined); }
          }
      }
      if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g' &&
          (sel.length === 3 || sel[3] === '.' || sel[3] === '#')) {
          addNS(data, children, sel);
      }
      return vnode(sel, data, children, text, undefined);
  }

  var customComponents = {};

  /* eslint no-use-before-define: "off" */

  var selfClosing = 'area base br col command embed hr img input keygen link menuitem meta param source track wbr'.split(' ');
  var propsAttrs = 'hidden checked disabled readonly selected autofocus autoplay required multiple value indeterminate'.split(' ');
  var booleanProps = 'hidden checked disabled readonly selected autofocus autoplay required multiple readOnly indeterminate'.split(' ');
  var tempDomDIV = doc.createElement('div');
  var tempDomTBODY;
  var tempDomTROW;

  function toCamelCase$1(name) {
    return name
      .split('-')
      .map(function (word, index) {
        if (index === 0) { return word.toLowerCase(); }
        return word[0].toUpperCase() + word.substr(1);
      })
      .join('');
  }
  function contextFromAttrs() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var context = {};
    args.forEach(function (obj) {
      if ( obj === void 0 ) obj = {};

      Object.keys(obj).forEach(function (key) {
        context[toCamelCase$1(key)] = obj[key];
      });
    });

    return context;
  }

  function createCustomComponent(ref) {
    var app = ref.app;
    var vnode = ref.vnode;
    var tagName = ref.tagName;
    var data = ref.data;

    app.component.create(
      Object.assign({ el: vnode.elm }, customComponents[tagName]),
      {
        $props: contextFromAttrs(data.attrs || {}, data.props || {}),
      },
      vnode.children
    ).then(function (c) {
      if (vnode.data && vnode.data.on && c && c.$el) {
        Object.keys(vnode.data.on).forEach(function (eventName) {
          c.$el.on(eventName, vnode.data.on[eventName]);
        });
      }
      // eslint-disable-next-line
      vnode.elm.__component__ = c;
    });
  }
  function updateCustomComponent(vnode) {
    // eslint-disable-next-line
    var component = vnode && vnode.elm && vnode.elm.__component__;
    if (!component) { return; }
    var newProps = contextFromAttrs(vnode.data.attrs || {}, vnode.data.props || {});
    component.$children = vnode.children;
    Object.assign(component.$props, newProps);
    component.$update();
  }
  function destroyCustomComponent(vnode) {
    // eslint-disable-next-line
    var component = vnode && vnode.elm && vnode.elm.__component__;

    if (component) {
      var el = component.el;
      var $el = component.$el;
      if (vnode.data && vnode.data.on && $el) {
        Object.keys(vnode.data.on).forEach(function (eventName) {
          $el.off(eventName, vnode.data.on[eventName]);
        });
      }
      if (component.$destroy) { component.$destroy(); }
      if (el && el.parentNode) { el.parentNode.removeChild(el); }
      delete vnode.elm.__component__; // eslint-disable-line
    }
  }

  function getHooks(data, app, initial, isRoot, tagName) {
    var hooks = {};
    var insert = [];
    var destroy = [];
    var update = [];
    var postpatch = [];
    var isFakeElement = false;
    if (data && data.attrs && data.attrs.component) {
      // eslint-disable-next-line
      tagName = data.attrs.component;
      delete data.attrs.component;
      isFakeElement = true;
    }
    var isCustomComponent = tagName && tagName.indexOf('-') > 0 && customComponents[tagName];
    if (isCustomComponent) {
      insert.push(function (vnode) {
        if (vnode.sel !== tagName && !isFakeElement) { return; }
        createCustomComponent({ app: app, vnode: vnode, tagName: tagName, data: data });
      });
      destroy.push(function (vnode) {
        destroyCustomComponent(vnode);
      });
      update.push(function (oldVnode, vnode) {
        updateCustomComponent(vnode);
      });
    }

    if (!isCustomComponent) {
      if (!data || !data.attrs || !data.attrs.class) { return hooks; }

      var classNames = data.attrs.class;
      classNames.split(' ').forEach(function (className) {
        if (!initial) {
          insert.push.apply(insert, app.getVnodeHooks('insert', className));
        }
        destroy.push.apply(destroy, app.getVnodeHooks('destroy', className));
        update.push.apply(update, app.getVnodeHooks('update', className));
        postpatch.push.apply(postpatch, app.getVnodeHooks('postpatch', className));
      });
    }

    if (isRoot && !initial) {
      postpatch.push(function (oldVnode, vnode) {
        var vn = vnode || oldVnode;
        if (!vn) { return; }
        if (vn.data && vn.data.context && vn.data.context.$options.updated) {
          vn.data.context.$hook('updated');
        }
      });
    }
    if (insert.length === 0 && destroy.length === 0 && update.length === 0 && postpatch.length === 0) {
      return hooks;
    }

    if (insert.length) {
      hooks.insert = function (vnode) {
        insert.forEach(function (f) { return f(vnode); });
      };
    }
    if (destroy.length) {
      hooks.destroy = function (vnode) {
        destroy.forEach(function (f) { return f(vnode); });
      };
    }
    if (update.length) {
      hooks.update = function (oldVnode, vnode) {
        update.forEach(function (f) { return f(oldVnode, vnode); });
      };
    }
    if (postpatch.length) {
      hooks.postpatch = function (oldVnode, vnode) {
        postpatch.forEach(function (f) { return f(oldVnode, vnode); });
      };
    }

    return hooks;
  }
  function getEventHandler(handlerString, context, ref) {
    if ( ref === void 0 ) ref = {};
    var stop = ref.stop;
    var prevent = ref.prevent;
    var once = ref.once;

    var fired = false;
    var methodName;
    var method;
    var customArgs = [];
    var needMethodBind = true;

    if (handlerString.indexOf('(') < 0) {
      methodName = handlerString;
    } else {
      methodName = handlerString.split('(')[0];
    }
    if (methodName.indexOf('.') >= 0) {
      methodName.split('.').forEach(function (path, pathIndex) {
        if (pathIndex === 0 && path === 'this') { return; }
        if (pathIndex === 0 && path === 'window') {
          // eslint-disable-next-line
          method = win;
          needMethodBind = false;
          return;
        }
        if (!method) { method = context; }
        if (method[path]) { method = method[path]; }
        else {
          throw new Error(("Framework7: Component doesn't have method \"" + (methodName.split('.').slice(0, pathIndex + 1).join('.')) + "\""));
        }
      });
    } else {
      if (!context[methodName]) {
        throw new Error(("Framework7: Component doesn't have method \"" + methodName + "\""));
      }
      method = context[methodName];
    }
    if (needMethodBind) {
      method = method.bind(context);
    }

    function handler() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var e = args[0];
      if (once && fired) { return; }
      if (stop) { e.stopPropagation(); }
      if (prevent) { e.preventDefault(); }
      fired = true;

      if (handlerString.indexOf('(') < 0) {
        customArgs = args;
      } else {
        var handlerArguments = handlerString
          .split('(')[1]
          .split(')')[0]
          .replace(/'[^']*'|"[^"]*"/g, function (a) { return a.replace(/,/g, '<_comma_>'); })
          .split(',')
          .map(function (a) { return a.replace(/<_comma_>/g, ','); });
        handlerArguments.forEach(function (argument) {
          var arg = argument.trim();
          // eslint-disable-next-line
          if (!isNaN(arg)) { arg = parseFloat(arg); }
          else if (arg === 'true') { arg = true; }
          else if (arg === 'false') { arg = false; }
          else if (arg === 'null') { arg = null; }
          else if (arg === 'undefined') { arg = undefined; }
          else if (arg[0] === '"') { arg = arg.replace(/"/g, ''); }
          else if (arg[0] === '\'') { arg = arg.replace(/'/g, ''); }
          else if (arg.indexOf('.') > 0) {
            var deepArg;
            arg.split('.').forEach(function (path) {
              if (!deepArg) { deepArg = context; }
              deepArg = deepArg[path];
            });
            arg = deepArg;
          } else {
            arg = context[arg];
          }
          customArgs.push(arg);
        });
      }

      method.apply(void 0, customArgs);
    }

    return handler;
  }

  function getData(el, context, app, initial, isRoot, tagName) {
    var data = { context: context };
    var attributes = el.attributes;
    Array.prototype.forEach.call(attributes, function (attr) {
      var attrName = attr.name;
      var attrValue = attr.value;
      if (propsAttrs.indexOf(attrName) >= 0) {
        // Props
        if (!data.props) { data.props = {}; }
        if (attrName === 'readonly') {
          attrName = 'readOnly';
        }
        if (booleanProps.indexOf(attrName) >= 0) {
          // eslint-disable-next-line
          data.props[attrName] = attrValue === false ? false : true;
        } else {
          data.props[attrName] = attrValue;
        }
      } else if (attrName === 'key') {
        // Key
        data.key = attrValue;
      } else if (attrName.indexOf('@') === 0) {
        // Events
        if (!data.on) { data.on = {}; }
        var eventName = attrName.substr(1);
        var stop = false;
        var prevent = false;
        var once = false;
        if (eventName.indexOf('.') >= 0) {
          eventName.split('.').forEach(function (eventNamePart, eventNameIndex) {
            if (eventNameIndex === 0) { eventName = eventNamePart; }
            else {
              if (eventNamePart === 'stop') { stop = true; }
              if (eventNamePart === 'prevent') { prevent = true; }
              if (eventNamePart === 'once') { once = true; }
            }
          });
        }
        data.on[eventName] = getEventHandler(attrValue, context, { stop: stop, prevent: prevent, once: once });
      } else if (attrName === 'style') {
        // Style
        if (attrValue.indexOf('{') >= 0 && attrValue.indexOf('}') >= 0) {
          try {
            data.style = JSON.parse(attrValue);
          } catch (e) {
            if (!data.attrs) { data.attrs = {}; }
            data.attrs.style = attrValue;
          }
        } else {
          if (!data.attrs) { data.attrs = {}; }
          data.attrs.style = attrValue;
        }
      } else {
        // Rest of attribures
        if (!data.attrs) { data.attrs = {}; }
        data.attrs[attrName] = attrValue;

        // ID -> Key
        if (attrName === 'id' && !data.key && !isRoot) {
          data.key = attrValue;
        }
      }
    });
    if (isRoot && context && context.$id && context.$style && context.$styleScoped) {
      if (!data.attrs) { data.attrs = {}; }
      data.attrs[("data-f7-" + (context.$id))] = '';
    }
    var hooks = getHooks(data, app, initial, isRoot, tagName);
    hooks.prepatch = function (oldVnode, vnode) {
      if (!oldVnode || !vnode) { return; }
      if (oldVnode && oldVnode.data && oldVnode.data.props) {
        Object.keys(oldVnode.data.props).forEach(function (key) {
          if (booleanProps.indexOf(key) < 0) { return; }
          if (!vnode.data) { vnode.data = {}; }
          if (!vnode.data.props) { vnode.data.props = {}; }
          if (oldVnode.data.props[key] === true && !(key in vnode.data.props)) {
            vnode.data.props[key] = false;
          }
        });
      }
    };
    if (hooks) {
      data.hook = hooks;
    }
    return data;
  }

  function getChildren(el, context, app, initial) {
    var children = [];
    var nodes = el.childNodes;
    for (var i = 0; i < nodes.length; i += 1) {
      var childNode = nodes[i];
      var child = elementToVNode(childNode, context, app, initial);
      if (Array.isArray(child)) {
        children.push.apply(children, child);
      } else if (child) {
        children.push(child);
      }
    }
    return children;
  }

  function getSlots(slotEl, context, app, initial) {
    var slotName = slotEl.getAttribute('name') || 'default';
    var slots = (context.$children || [])
      .filter(function (childEl) {
        var childSlotName = 'default';
        if (childEl.data) {
          childSlotName = (childEl.data.attrs && childEl.data.attrs.slot) || 'default';
        }
        return childSlotName === slotName;
      });
    if (slots.length === 0) {
      return getChildren(slotEl, context, app, initial);
    }
    return slots;
  }

  function elementToVNode(el, context, app, initial, isRoot) {
    if (el.nodeType === 3) {
      // text
      return el.textContent;
    }
    if (el.nodeType !== 1) { return null; }
    // element (statement adds inline SVG compatibility)
    var tagName = (el instanceof win.SVGElement) ? el.nodeName : el.nodeName.toLowerCase();
    if (tagName === 'slot') {
      return getSlots(el, context, app, initial);
    }
    return h(
      tagName,
      getData(el, context, app, initial, isRoot, tagName),
      selfClosing.indexOf(tagName) >= 0 ? [] : getChildren(el, context, app, initial)
    );
  }

  function vdom (html, context, initial) {
    if ( html === void 0 ) html = '';

    // Save to temp dom
    var htmlTrim = html.trim();
    var tempDom = tempDomDIV;
    if (htmlTrim.indexOf('<tr') === 0) {
      if (!tempDomTBODY) { tempDomTBODY = doc.createElement('tbody'); }
      tempDom = tempDomTBODY;
    }
    if (htmlTrim.indexOf('<td') === 0 || htmlTrim.indexOf('<th') === 0) {
      if (!tempDomTROW) { tempDomTROW = doc.createElement('tr'); }
      tempDom = tempDomTROW;
    }
    tempDom.innerHTML = htmlTrim;

    // Parse DOM
    var rootEl;
    for (var i = 0; i < tempDom.childNodes.length; i += 1) {
      if (!rootEl && tempDom.childNodes[i].nodeType === 1) {
        rootEl = tempDom.childNodes[i];
      }
    }
    var result = elementToVNode(rootEl, context, context.$app, initial, true);

    // Clean
    tempDom.innerHTML = '';

    return result;
  }

  function createElement(tagName) {
      return document.createElement(tagName);
  }
  function createElementNS(namespaceURI, qualifiedName) {
      return document.createElementNS(namespaceURI, qualifiedName);
  }
  function createTextNode(text) {
      return document.createTextNode(text);
  }
  function createComment(text) {
      return document.createComment(text);
  }
  function insertBefore$1(parentNode, newNode, referenceNode) {
      if (referenceNode && referenceNode.parentNode !== parentNode) {
        if (referenceNode.__component__) { referenceNode = referenceNode.__component__.el; }
      }
      parentNode.insertBefore(newNode, referenceNode);
  }
  function removeChild(node, child) {
      if (!node) { return; }
      node.removeChild(child);
  }
  function appendChild(node, child) {
      node.appendChild(child);
  }
  function parentNode(node) {
      return node.parentNode;
  }
  function nextSibling(node) {
      return node.nextSibling;
  }
  function tagName(elm) {
      return elm.tagName;
  }
  function setTextContent(node, text) {
      node.textContent = text;
  }
  function getTextContent(node) {
      return node.textContent;
  }
  function isElement(node) {
      return node.nodeType === 1;
  }
  function isText(node) {
      return node.nodeType === 3;
  }
  function isComment(node) {
      return node.nodeType === 8;
  }
  var htmlDomApi = {
      createElement: createElement,
      createElementNS: createElementNS,
      createTextNode: createTextNode,
      createComment: createComment,
      insertBefore: insertBefore$1,
      removeChild: removeChild,
      appendChild: appendChild,
      parentNode: parentNode,
      nextSibling: nextSibling,
      tagName: tagName,
      setTextContent: setTextContent,
      getTextContent: getTextContent,
      isElement: isElement,
      isText: isText,
      isComment: isComment,
  };

  function isUndef(s) { return s === undefined; }
  function isDef(s) { return s !== undefined; }
  var emptyNode = vnode('', {}, [], undefined, undefined);
  function sameVnode(vnode1, vnode2) {
      return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
  }
  function isVnode(vnode) {
      return vnode.sel !== undefined;
  }
  function createKeyToOldIdx(children, beginIdx, endIdx) {
      var i, map = {}, key, ch;
      for (i = beginIdx; i <= endIdx; ++i) {
          ch = children[i];
          if (ch != null) {
              key = ch.key;
              if (key !== undefined)
                  { map[key] = i; }
          }
      }
      return map;
  }
  var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
  function init(modules, domApi) {
      var i, j, cbs = {};
      var api = domApi !== undefined ? domApi : htmlDomApi;
      for (i = 0; i < hooks.length; ++i) {
          cbs[hooks[i]] = [];
          for (j = 0; j < modules.length; ++j) {
              var hook = modules[j][hooks[i]];
              if (hook !== undefined) {
                  cbs[hooks[i]].push(hook);
              }
          }
      }
      function emptyNodeAt(elm) {
          var id = elm.id ? '#' + elm.id : '';
          var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
          return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
      }
      function createRmCb(childElm, listeners) {
          return function rmCb() {
              if (--listeners === 0) {
                  var parent_1 = api.parentNode(childElm);
                  api.removeChild(parent_1, childElm);
              }
          };
      }
      function createElm(vnode, insertedVnodeQueue) {
          var i, data = vnode.data;
          if (data !== undefined) {
              if (isDef(i = data.hook) && isDef(i = i.init)) {
                  i(vnode);
                  data = vnode.data;
              }
          }
          var children = vnode.children, sel = vnode.sel;
          if (sel === '!') {
              if (isUndef(vnode.text)) {
                  vnode.text = '';
              }
              vnode.elm = api.createComment(vnode.text);
          }
          else if (sel !== undefined) {
              // Parse selector
              var hashIdx = sel.indexOf('#');
              var dotIdx = sel.indexOf('.', hashIdx);
              var hash = hashIdx > 0 ? hashIdx : sel.length;
              var dot = dotIdx > 0 ? dotIdx : sel.length;
              var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
              var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
                  : api.createElement(tag);
              if (hash < dot)
                  { elm.setAttribute('id', sel.slice(hash + 1, dot)); }
              if (dotIdx > 0)
                  { elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' ')); }
              for (i = 0; i < cbs.create.length; ++i)
                  { cbs.create[i](emptyNode, vnode); }
              if (array(children)) {
                  for (i = 0; i < children.length; ++i) {
                      var ch = children[i];
                      if (ch != null) {
                          api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                      }
                  }
              }
              else if (primitive(vnode.text)) {
                  api.appendChild(elm, api.createTextNode(vnode.text));
              }
              i = vnode.data.hook; // Reuse variable
              if (isDef(i)) {
                  if (i.create)
                      { i.create(emptyNode, vnode); }
                  if (i.insert)
                      { insertedVnodeQueue.push(vnode); }
              }
          }
          else {
              vnode.elm = api.createTextNode(vnode.text);
          }
          return vnode.elm;
      }
      function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
          for (; startIdx <= endIdx; ++startIdx) {
              var ch = vnodes[startIdx];
              if (ch != null) {
                  api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
              }
          }
      }
      function invokeDestroyHook(vnode) {
          var i, j, data = vnode.data;
          if (data !== undefined) {
              if (isDef(i = data.hook) && isDef(i = i.destroy))
                  { i(vnode); }
              for (i = 0; i < cbs.destroy.length; ++i)
                  { cbs.destroy[i](vnode); }
              if (vnode.children !== undefined) {
                  for (j = 0; j < vnode.children.length; ++j) {
                      i = vnode.children[j];
                      if (i != null && typeof i !== "string") {
                          invokeDestroyHook(i);
                      }
                  }
              }
          }
      }
      function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
          for (; startIdx <= endIdx; ++startIdx) {
              var i_1 = void 0, listeners = void 0, rm = void 0, ch = vnodes[startIdx];
              if (ch != null) {
                  if (isDef(ch.sel)) {
                      invokeDestroyHook(ch);
                      listeners = cbs.remove.length + 1;
                      rm = createRmCb(ch.elm, listeners);
                      for (i_1 = 0; i_1 < cbs.remove.length; ++i_1)
                          { cbs.remove[i_1](ch, rm); }
                      if (isDef(i_1 = ch.data) && isDef(i_1 = i_1.hook) && isDef(i_1 = i_1.remove)) {
                          i_1(ch, rm);
                      }
                      else {
                          rm();
                      }
                  }
                  else {
                      api.removeChild(parentElm, ch.elm);
                  }
              }
          }
      }
      function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
          var oldStartIdx = 0, newStartIdx = 0;
          var oldEndIdx = oldCh.length - 1;
          var oldStartVnode = oldCh[0];
          var oldEndVnode = oldCh[oldEndIdx];
          var newEndIdx = newCh.length - 1;
          var newStartVnode = newCh[0];
          var newEndVnode = newCh[newEndIdx];
          var oldKeyToIdx;
          var idxInOld;
          var elmToMove;
          var before;
          while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
              if (oldStartVnode == null) {
                  oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
              }
              else if (oldEndVnode == null) {
                  oldEndVnode = oldCh[--oldEndIdx];
              }
              else if (newStartVnode == null) {
                  newStartVnode = newCh[++newStartIdx];
              }
              else if (newEndVnode == null) {
                  newEndVnode = newCh[--newEndIdx];
              }
              else if (sameVnode(oldStartVnode, newStartVnode)) {
                  patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                  oldStartVnode = oldCh[++oldStartIdx];
                  newStartVnode = newCh[++newStartIdx];
              }
              else if (sameVnode(oldEndVnode, newEndVnode)) {
                  patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                  oldEndVnode = oldCh[--oldEndIdx];
                  newEndVnode = newCh[--newEndIdx];
              }
              else if (sameVnode(oldStartVnode, newEndVnode)) {
                  patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                  api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                  oldStartVnode = oldCh[++oldStartIdx];
                  newEndVnode = newCh[--newEndIdx];
              }
              else if (sameVnode(oldEndVnode, newStartVnode)) {
                  patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                  api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                  oldEndVnode = oldCh[--oldEndIdx];
                  newStartVnode = newCh[++newStartIdx];
              }
              else {
                  if (oldKeyToIdx === undefined) {
                      oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                  }
                  idxInOld = oldKeyToIdx[newStartVnode.key];
                  if (isUndef(idxInOld)) {
                      api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                      newStartVnode = newCh[++newStartIdx];
                  }
                  else {
                      elmToMove = oldCh[idxInOld];
                      if (elmToMove.sel !== newStartVnode.sel) {
                          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                      }
                      else {
                          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                          oldCh[idxInOld] = undefined;
                          api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                      }
                      newStartVnode = newCh[++newStartIdx];
                  }
              }
          }
          if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
              if (oldStartIdx > oldEndIdx) {
                  before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
                  addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
              }
              else {
                  removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
              }
          }
      }
      function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
          var i, hook;
          if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
              i(oldVnode, vnode);
          }
          var elm = vnode.elm = oldVnode.elm;
          var oldCh = oldVnode.children;
          var ch = vnode.children;
          if (oldVnode === vnode)
              { return; }
          if (vnode.data !== undefined) {
              for (i = 0; i < cbs.update.length; ++i)
                  { cbs.update[i](oldVnode, vnode); }
              i = vnode.data.hook;
              if (isDef(i) && isDef(i = i.update))
                  { i(oldVnode, vnode); }
          }
          if (isUndef(vnode.text)) {
              if (isDef(oldCh) && isDef(ch)) {
                  if (oldCh !== ch)
                      { updateChildren(elm, oldCh, ch, insertedVnodeQueue); }
              }
              else if (isDef(ch)) {
                  if (isDef(oldVnode.text))
                      { api.setTextContent(elm, ''); }
                  addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
              }
              else if (isDef(oldCh)) {
                  removeVnodes(elm, oldCh, 0, oldCh.length - 1);
              }
              else if (isDef(oldVnode.text)) {
                  api.setTextContent(elm, '');
              }
          }
          else if (oldVnode.text !== vnode.text) {
              api.setTextContent(elm, vnode.text);
          }
          if (isDef(hook) && isDef(i = hook.postpatch)) {
              i(oldVnode, vnode);
          }
      }
      return function patch(oldVnode, vnode) {
          var i, elm, parent;
          var insertedVnodeQueue = [];
          for (i = 0; i < cbs.pre.length; ++i)
              { cbs.pre[i](); }
          if (!isVnode(oldVnode)) {
              oldVnode = emptyNodeAt(oldVnode);
          }
          if (sameVnode(oldVnode, vnode)) {
              patchVnode(oldVnode, vnode, insertedVnodeQueue);
          }
          else {
              elm = oldVnode.elm;
              parent = api.parentNode(elm);
              createElm(vnode, insertedVnodeQueue);
              if (parent !== null) {
                  api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                  removeVnodes(parent, [oldVnode], 0, 0);
              }
          }
          for (i = 0; i < insertedVnodeQueue.length; ++i) {
              insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
          }
          for (i = 0; i < cbs.post.length; ++i)
              { cbs.post[i](); }
          return vnode;
      };
  }

  var xlinkNS = 'http://www.w3.org/1999/xlink';
  var xmlNS = 'http://www.w3.org/XML/1998/namespace';
  var colonChar = 58;
  var xChar = 120;
  function updateAttrs(oldVnode, vnode) {
      var key, elm = vnode.elm, oldAttrs = oldVnode.data.attrs, attrs = vnode.data.attrs;
      if (!oldAttrs && !attrs)
          { return; }
      if (oldAttrs === attrs)
          { return; }
      oldAttrs = oldAttrs || {};
      attrs = attrs || {};
      // update modified attributes, add new attributes
      for (key in attrs) {
          var cur = attrs[key];
          var old = oldAttrs[key];
          if (old !== cur) {
              if (cur === true) {
                  elm.setAttribute(key, "");
              }
              else if (cur === false) {
                  elm.removeAttribute(key);
              }
              else {
                  if (key.charCodeAt(0) !== xChar) {
                      elm.setAttribute(key, cur);
                  }
                  else if (key.charCodeAt(3) === colonChar) {
                      // Assume xml namespace
                      elm.setAttributeNS(xmlNS, key, cur);
                  }
                  else if (key.charCodeAt(5) === colonChar) {
                      // Assume xlink namespace
                      elm.setAttributeNS(xlinkNS, key, cur);
                  }
                  else {
                      elm.setAttribute(key, cur);
                  }
              }
          }
      }
      // remove removed attributes
      // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
      // the other option is to remove all attributes with value == undefined
      for (key in oldAttrs) {
          if (!(key in attrs)) {
              elm.removeAttribute(key);
          }
      }
  }
  var attributesModule = { create: updateAttrs, update: updateAttrs };

  function updateProps(oldVnode, vnode) {
      var key, cur, old, elm = vnode.elm, oldProps = oldVnode.data.props, props = vnode.data.props;
      if (!oldProps && !props)
          { return; }
      if (oldProps === props)
          { return; }
      oldProps = oldProps || {};
      props = props || {};
      for (key in oldProps) {
          if (!props[key]) {
              delete elm[key];
          }
      }
      for (key in props) {
          cur = props[key];
          old = oldProps[key];
          if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
              elm[key] = cur;
          }
      }
  }
  var propsModule = { create: updateProps, update: updateProps };

  var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
  var nextFrame = function (fn) { raf(function () { raf(fn); }); };
  function setNextFrame(obj, prop, val) {
      nextFrame(function () { obj[prop] = val; });
  }
  function updateStyle(oldVnode, vnode) {
      var cur, name, elm = vnode.elm, oldStyle = oldVnode.data.style, style = vnode.data.style;
      if (!oldStyle && !style)
          { return; }
      if (oldStyle === style)
          { return; }
      oldStyle = oldStyle || {};
      style = style || {};
      var oldHasDel = 'delayed' in oldStyle;
      for (name in oldStyle) {
          if (!style[name]) {
              if (name[0] === '-' && name[1] === '-') {
                  elm.style.removeProperty(name);
              }
              else {
                  elm.style[name] = '';
              }
          }
      }
      for (name in style) {
          cur = style[name];
          if (name === 'delayed' && style.delayed) {
              for (var name2 in style.delayed) {
                  cur = style.delayed[name2];
                  if (!oldHasDel || cur !== oldStyle.delayed[name2]) {
                      setNextFrame(elm.style, name2, cur);
                  }
              }
          }
          else if (name !== 'remove' && cur !== oldStyle[name]) {
              if (name[0] === '-' && name[1] === '-') {
                  elm.style.setProperty(name, cur);
              }
              else {
                  elm.style[name] = cur;
              }
          }
      }
  }
  function applyDestroyStyle(vnode) {
      var style, name, elm = vnode.elm, s = vnode.data.style;
      if (!s || !(style = s.destroy))
          { return; }
      for (name in style) {
          elm.style[name] = style[name];
      }
  }
  function applyRemoveStyle(vnode, rm) {
      var s = vnode.data.style;
      if (!s || !s.remove) {
          rm();
          return;
      }
      var name, elm = vnode.elm, i = 0, compStyle, style = s.remove, amount = 0, applied = [];
      for (name in style) {
          applied.push(name);
          elm.style[name] = style[name];
      }
      compStyle = getComputedStyle(elm);
      var props = compStyle['transition-property'].split(', ');
      for (; i < props.length; ++i) {
          if (applied.indexOf(props[i]) !== -1)
              { amount++; }
      }
      elm.addEventListener('transitionend', function (ev) {
          if (ev.target === elm)
              { --amount; }
          if (amount === 0)
              { rm(); }
      });
  }
  var styleModule = {
      create: updateStyle,
      update: updateStyle,
      destroy: applyDestroyStyle,
      remove: applyRemoveStyle
  };

  function invokeHandler(handler, event, args) {
    if (typeof handler === 'function') {
      // call function handler
      handler.apply(void 0, [ event ].concat( args ));
    }
  }
  function handleEvent(event, args, vnode) {
    var name = event.type;
    var on = vnode.data.on;
    // call event handler(s) if exists
    if (on && on[name]) {
      invokeHandler(on[name], event, args);
    }
  }
  function createListener() {
    return function handler(event) {
      var args = [], len = arguments.length - 1;
      while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

      handleEvent(event, args, handler.vnode);
    };
  }
  function updateEvents(oldVnode, vnode) {
    var oldOn = oldVnode.data.on;
    var oldListener = oldVnode.listener;
    var oldElm = oldVnode.elm;
    var on = vnode && vnode.data.on;
    var elm = (vnode && vnode.elm);
    // optimization for reused immutable handlers
    if (oldOn === on) {
      return;
    }
    // remove existing listeners which no longer used
    if (oldOn && oldListener) {
      // if element changed or deleted we remove all existing listeners unconditionally
      if (!on) {
        Object.keys(oldOn).forEach(function (name) {
          $(oldElm).off(name, oldListener);
        });
      } else {
        Object.keys(oldOn).forEach(function (name) {
          if (!on[name]) {
            $(oldElm).off(name, oldListener);
          }
        });
      }
    }
    // add new listeners which has not already attached
    if (on) {
      // reuse existing listener or create new
      var listener = oldVnode.listener || createListener();
      vnode.listener = listener;
      // update vnode for listener
      listener.vnode = vnode;
      // if element changed or added we add all needed listeners unconditionally
      if (!oldOn) {
        Object.keys(on).forEach(function (name) {
          $(elm).on(name, listener);
        });
      } else {
        Object.keys(on).forEach(function (name) {
          if (!oldOn[name]) {
            $(elm).on(name, listener);
          }
        });
      }
    }
  }

  var eventListenersModule = {
    create: updateEvents,
    update: updateEvents,
    destroy: updateEvents,
  };

  /* eslint import/no-named-as-default: off */

  var patch = init([
    attributesModule,
    propsModule,
    styleModule,
    eventListenersModule ]);

  var componentMixins = {};

  /* eslint no-underscore-dangle: "off" */

  var Component = function Component(app, options, extendContext, children) {
    if ( options === void 0 ) options = {};
    if ( extendContext === void 0 ) extendContext = {};

    var id = Utils.id();
    var self = this;
    Utils.merge(
      self,
      { $props: {} },
      extendContext,
      {
        $: $,
        $$: $,
        $dom7: $,
        $app: app,
        $f7: app,
        $options: Utils.extend({ id: id }, options),
        $id: options.isClassComponent ? self.constructor.id : (options.id || id),
        $mixins: options.isClassComponent ? self.constructor.mixins : options.mixins,
        $children: children || [],
        $isRootComponent: !!options.root,
      }
    );
    var $options = self.$options;


    if (self.$mixins && self.$mixins.length) {
      for (var i = self.$mixins.length - 1; i >= 0; i -= 1) {
        var mixin = self.$mixins[i];
        if (typeof mixin === 'string') {
          if (componentMixins[mixin]) { self.$mixins[i] = componentMixins[mixin]; }
          else { self.$mixins.splice(i, 1); }
        }
      }
    }

    Object.defineProperty(self, '$slots', {
      enumerable: true,
      configurable: true,
      get: function get() {
        var slots = {};
        self.$children.forEach(function (childVNode) {
          var childSlotName = 'default';
          if (childVNode.data) {
            childSlotName = (childVNode.data.attrs && childVNode.data.attrs.slot) || 'default';
          }
          if (!slots[childSlotName]) { slots[childSlotName] = []; }
          slots[childSlotName].push(childVNode);
        });
        return slots;
      },
    });


    // Root data and methods
    Object.defineProperty(self, '$root', {
      enumerable: true,
      configurable: true,
      get: function get() {
        if (self.$isRootComponent) {
          return self;
        }
        if (app.rootComponent) {
          if (!self.$onRootUpdated) {
            self.$onRootUpdated = function () { return self.$update(); };
            app.on('rootComponentUpdated', self.$onRootUpdated);
          }
          return app.rootComponent;
        }
        var root = Utils.merge({}, app.data, app.methods);
        if (win && win.Proxy) {
          root = new win.Proxy(root, {
            set: function set(target, name, val) {
              app.data[name] = val;
            },
            deleteProperty: function deleteProperty(target, name) {
              delete app.data[name];
              delete app.methods[name];
            },
            has: function has(target, name) {
              return (name in app.data || name in app.methods);
            },
          });
        }
        return root;
      },
      set: function set() {},
    });

    // Bind render
    if ($options.render) { $options.render = $options.render.bind(self); }

    // Bind methods
    var methods = {};
    if (self.$mixins && self.$mixins.length) {
      self.$mixins.forEach(function (mixin) {
        if (mixin.methods) { Object.assign(methods, mixin.methods); }
      });
    }
    if ($options.methods) {
      Object.assign(methods, $options.methods);
    }
    Object.keys(methods).forEach(function (methodName) {
      self[methodName] = methods[methodName].bind(self);
    });

    // Bind Events
    if ($options.on) {
      Object.keys($options.on).forEach(function (eventName) {
        $options.on[eventName] = $options.on[eventName].bind(self);
      });
    }
    if ($options.once) {
      Object.keys($options.once).forEach(function (eventName) {
        $options.once[eventName] = $options.once[eventName].bind(self);
      });
    }

    self.$style = $options.isClassComponent ? self.constructor.style : $options.style;
    self.$styleScoped = $options.isClassComponent ? self.constructor.styleScoped : $options.styleScoped;

    self.__updateQueue = [];

    return new Promise(function (resolve, reject) {
      self.$hook('data', true)
        .then(function (datas) {
          var data = {};
          datas.forEach(function (dt) {
            Object.assign(data, dt || {});
          });
          Utils.extend(self, data);
          self.$hook('beforeCreate');
          var html = self.$render();

          if (self.$options.el) {
            html = html.trim();
            self.$vnode = vdom(html, self, true);
            if (self.$style) {
              self.$styleEl = doc.createElement('style');
              self.$styleEl.innerHTML = self.$style;
            }
            self.el = self.$options.el;
            patch(self.el, self.$vnode);
            self.el = self.$vnode.elm;
            self.$el = $(self.el);

            self.$attachEvents();
            self.el.f7Component = self;
            self.$hook('created');
            self.$mount();
            resolve(self);
            return;
          }
          // Make Dom
          if (html && typeof html === 'string') {
            html = html.trim();
            self.$vnode = vdom(html, self, true);
            self.el = doc.createElement(self.$vnode.sel || 'div');
            patch(self.el, self.$vnode);
            self.$el = $(self.el);
          } else if (html) {
            self.el = html;
            self.$el = $(self.el);
          }
          if (self.$style) {
            self.$styleEl = doc.createElement('style');
            self.$styleEl.innerHTML = self.$style;
          }

          self.$attachEvents();

          if (self.el) {
            self.el.f7Component = self;
          }

          self.$hook('created');
          resolve(self);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  };

  Component.prototype.$attachEvents = function $attachEvents () {
    var self = this;
    var $options = self.$options;
      var $el = self.$el;
    if (self.$mixins && self.$mixins.length) {
      self.$detachEventsHandlers = {};
      self.$mixins.forEach(function (mixin) {
        if (mixin.on) {
          Object.keys(mixin.on).forEach(function (eventName) {
            var handler = mixin.on[eventName].bind(self);
            if (!self.$detachEventsHandlers[eventName]) { self.$detachEventsHandlers[eventName] = []; }
            self.$detachEventsHandlers[eventName].push(handler);
            $el.on(Utils.eventNameToColonCase(eventName), handler);
          });
        }
        if (mixin.once) {
          Object.keys(mixin.once).forEach(function (eventName) {
            var handler = mixin.once[eventName].bind(self);
            if (!self.$detachEventsHandlers[eventName]) { self.$detachEventsHandlers[eventName] = []; }
            self.$detachEventsHandlers[eventName].push(handler);
            $el.once(Utils.eventNameToColonCase(eventName), handler);
          });
        }
      });
    }
    if ($options.on) {
      Object.keys($options.on).forEach(function (eventName) {
        $el.on(Utils.eventNameToColonCase(eventName), $options.on[eventName]);
      });
    }
    if ($options.once) {
      Object.keys($options.once).forEach(function (eventName) {
        $el.once(Utils.eventNameToColonCase(eventName), $options.once[eventName]);
      });
    }
  };

  Component.prototype.$detachEvents = function $detachEvents () {
    var self = this;
    var $options = self.$options;
      var $el = self.$el;
    if ($options.on) {
      Object.keys($options.on).forEach(function (eventName) {
        $el.off(Utils.eventNameToColonCase(eventName), $options.on[eventName]);
      });
    }
    if ($options.once) {
      Object.keys($options.once).forEach(function (eventName) {
        $el.off(Utils.eventNameToColonCase(eventName), $options.once[eventName]);
      });
    }
    if (!self.$detachEventsHandlers) { return; }
    Object.keys(self.$detachEventsHandlers).forEach(function (eventName) {
      var handlers = self.$detachEventsHandlers[eventName];
      handlers.forEach(function (handler) {
        $el.off(Utils.eventNameToColonCase(eventName), handler);
      });
      self.$detachEventsHandlers[eventName] = [];
      delete self.$detachEventsHandlers[eventName];
    });
    self.$detachEventsHandlers = null;
    delete self.$detachEventsHandlers;
  };

  Component.prototype.$render = function $render () {
    var self = this;
    var $options = self.$options;
    var html = '';
    if ($options.render) {
      html = $options.render();
    } else if (self.render) {
      html = self.render.call(self);
    } else if ($options.template) {
      if (typeof $options.template === 'string') {
        html = Template7.compile($options.template)(self);
      } else {
        // Supposed to be function
        html = $options.template(self);
      }
    }
    return html;
  };

  Component.prototype.$startUpdateQueue = function $startUpdateQueue () {
    var self = this;
    if (self.__requestAnimationFrameId) { return; }
    function update() {
      var html = self.$render();

      // Make Dom
      if (html && typeof html === 'string') {
        html = html.trim();
        var newVNode = vdom(html, self, false);
        self.$vnode = patch(self.$vnode, newVNode);
      }
    }
    self.__requestAnimationFrameId = win.requestAnimationFrame(function () {
      if (self.__updateIsPending) { update(); }
      var resolvers = [].concat( self.__updateQueue );
      self.__updateQueue = [];
      self.__updateIsPending = false;
      win.cancelAnimationFrame(self.__requestAnimationFrameId);
      delete self.__requestAnimationFrameId;
      delete self.__updateIsPending;
      resolvers.forEach(function (resolver) { return resolver(); });
      resolvers = [];
    });
  };

  Component.prototype.$tick = function $tick (callback) {
    var self = this;
    return new Promise(function (resolve) {
      function resolver() {
        resolve();
        if (callback) { callback(); }
      }
      self.__updateQueue.push(resolver);
      self.$startUpdateQueue();
    });
  };

  Component.prototype.$update = function $update (callback) {
    var self = this;
    return new Promise(function (resolve) {
      function resolver() {
        resolve();
        if (callback) { callback(); }
        if (self.$isRootComponent) {
          self.$f7.emit('rootComponentUpdated');
        }
      }
      self.__updateIsPending = true;
      self.__updateQueue.push(resolver);
      self.$startUpdateQueue();
    });
  };

  Component.prototype.$setState = function $setState (mergeState, callback) {
      if ( mergeState === void 0 ) mergeState = {};

    var self = this;
    Utils.merge(self, mergeState);
    return self.$update(callback);
  };

  Component.prototype.$f7ready = function $f7ready (callback) {
      var this$1 = this;

    if (this.$f7.initialized) {
      callback(this.$f7);
      return;
    }
    this.$f7.once('init', function () {
      callback(this$1.$f7);
    });
  };

  Component.prototype.$mount = function $mount (mountMethod) {
    var self = this;
    self.$hook('beforeMount');
    if (self.$styleEl) { $('head').append(self.$styleEl); }
    if (mountMethod) { mountMethod(self.el); }
    self.$hook('mounted');
  };

  Component.prototype.$destroy = function $destroy () {
    var self = this;
    self.$hook('beforeDestroy');

    if (self.$styleEl) { $(self.$styleEl).remove(); }
    if (self.$onRootUpdated) {
      self.$f7.off('rootComponentUpdated', self.$onRootUpdated);
      delete self.$onRootUpdated;
    }

    self.$detachEvents();
    self.$hook('destroyed');
    // Delete component instance
    if (self.el && self.el.f7Component) {
      self.el.f7Component = null;
      delete self.el.f7Component;
    }
    // Patch with empty node
    if (self.$vnode) {
      self.$vnode = patch(self.$vnode, { sel: self.$vnode.sel, data: {} });
    }
    // Clear update queue
    win.cancelAnimationFrame(self.__requestAnimationFrameId);

    // Delete all props
    Utils.deleteProps(self);
  };

  Component.prototype.$hook = function $hook (name, async) {
    var self = this;
    if (async) {
      var promises = [];
      if (self.$mixins && self.$mixins.length) {
        self.$mixins.forEach(function (mixin) {
          if (mixin[name]) { promises.push(mixin[name].call(self)); }
        });
      }
      if (self[name] && typeof self[name] === 'function') {
        promises.push(self[name].call(self));
      }
      if (self.$options[name]) {
        promises.push(self.$options[name].call(self));
      }
      return Promise.all(promises);
    }
    if (self.$mixins && self.$mixins.length) {
      self.$mixins.forEach(function (mixin) {
        if (mixin[name] && typeof mixin[name] === 'function') {
          mixin[name].call(self);
        }
      });
    }
    if (self.$options[name]) { return self.$options[name].call(self); }
    if (self[name]) { return self[name].call(self); }
    return undefined;
  };

  function parseComponent(componentString) {
    var id = Utils.id();
    var callbackCreateName = "f7_component_create_callback_" + id;
    var callbackRenderName = "f7_component_render_callback_" + id;

    // Template
    var template;
    var hasTemplate = componentString.match(/<template([ ]?)([a-z0-9-]*)>/);
    var templateType = hasTemplate[2] || 't7';
    if (hasTemplate) {
      template = componentString
        .split(/<template[ ]?[a-z0-9-]*>/)
        .filter(function (item, index) { return index > 0; })
        .join('<template>')
        .split('</template>')
        .filter(function (item, index, arr) { return index < arr.length - 1; })
        .join('</template>')
        .replace(/{{#raw}}([ \n]*)<template/g, '{{#raw}}<template')
        .replace(/\/template>([ \n]*){{\/raw}}/g, '/template>{{/raw}}')
        .replace(/([ \n])<template/g, '$1{{#raw}}<template')
        .replace(/\/template>([ \n])/g, '/template>{{/raw}}$1');
    }

    // Parse Styles
    var style = null;
    var styleScoped = false;

    if (componentString.indexOf('<style>') >= 0) {
      style = componentString.split('<style>')[1].split('</style>')[0];
    } else if (componentString.indexOf('<style scoped>') >= 0) {
      styleScoped = true;
      style = componentString.split('<style scoped>')[1].split('</style>')[0];
      style = style
        .replace(/{{this}}/g, ("[data-f7-" + id + "]"))
        .replace(/[\n]?([^{^}]*){/ig, function (string, rules) {
          // eslint-disable-next-line
          rules = rules
            .split(',')
            .map(function (rule) {
              if (rule.indexOf('@') >= 0) { return rule; }
              if (rule.indexOf(("[data-f7-" + id + "]")) >= 0) { return rule; }
              return ("[data-f7-" + id + "] " + (rule.trim()));
            })
            .join(', ');

          return ("\n" + rules + " {");
        });
    }

    // Parse Script
    var scriptContent;
    var scriptEl;
    if (componentString.indexOf('<script>') >= 0) {
      var scripts = componentString.split('<script>');
      scriptContent = scripts[scripts.length - 1].split('</script>')[0].trim();
    } else {
      scriptContent = 'return {}';
    }
    if (!scriptContent || !scriptContent.trim()) { scriptContent = 'return {}'; }

    scriptContent = "window." + callbackCreateName + " = function () {" + scriptContent + "}";

    // Insert Script El
    scriptEl = doc.createElement('script');
    scriptEl.innerHTML = scriptContent;
    $('head').append(scriptEl);

    var component = win[callbackCreateName]();
    var isClassComponent = typeof component === 'function';

    // Remove Script El
    $(scriptEl).remove();
    win[callbackCreateName] = null;
    delete win[callbackCreateName];

    // Assign Template
    if (!component.template && !component.render) {
      component.template = template;
      component.templateType = templateType;
    }
    if (component.template) {
      if (component.templateType === 't7') {
        if (isClassComponent) {
          var templateFunction = Template7.compile(component.template);
          component.prototype.render = function render() {
            return templateFunction(this);
          };
        } else {
          component.template = Template7.compile(component.template);
        }
      }
      if (component.templateType === 'es') {
        var renderContent = "window." + callbackRenderName + " = function () {\n        return function render() {\n          return `" + (component.template) + "`;\n        }\n      }";
        scriptEl = doc.createElement('script');
        scriptEl.innerHTML = renderContent;
        $('head').append(scriptEl);

        if (isClassComponent) {
          component.prototype.render = component.template;
        } else {
          component.render = win[callbackRenderName]();
        }

        // Remove Script El
        $(scriptEl).remove();
        win[callbackRenderName] = null;
        delete win[callbackRenderName];
      }
    }

    if (isClassComponent) {
      delete component.template;
      delete component.templateType;
    }

    // Assign Style
    if (style) {
      component.style = style;
      component.styleScoped = styleScoped;
    }

    // Component ID
    component.id = id;
    return component;
  }

  function registerComponentMixin(name, mixin) {
    componentMixins[name] = mixin;
  }
  function registerComponent(tagName, component) {
    customComponents[tagName] = component;
  }
  var ComponentModule = {
    name: 'component',
    static: {
      Component: Component,
      registerComponentMixin: registerComponentMixin,
      registerComponent: registerComponent,
    },
    create: function create() {
      var app = this;
      app.component = {
        registerComponentMixin: registerComponentMixin,
        registerComponent: registerComponent,
        parse: function parse(componentString) {
          return parseComponent(componentString);
        },
        create: function create(options, context, children) {
          if (typeof options === 'function') {
            var root = options.root;
            var el = options.el;
            // eslint-disable-next-line
            return new options(app, { isClassComponent: true, root: root, el: el }, context, children);
          }
          return new Component(app, options, context, children);
        },
      };
    },
  };

  var HistoryModule = {
    name: 'history',
    static: {
      history: History,
    },
    on: {
      init: function init() {
        History.init(this);
      },
    },
  };

  var SW = {
    registrations: [],
    register: function register(path, scope) {
      var app = this;
      if (!('serviceWorker' in win.navigator) || !app.serviceWorker.container) {
        return new Promise(function (resolve, reject) {
          reject(new Error('Service worker is not supported'));
        });
      }
      return new Promise(function (resolve, reject) {
        app.serviceWorker.container.register(path, (scope ? { scope: scope } : {}))
          .then(function (reg) {
            SW.registrations.push(reg);
            app.emit('serviceWorkerRegisterSuccess', reg);
            resolve(reg);
          }).catch(function (error) {
            app.emit('serviceWorkerRegisterError', error);
            reject(error);
          });
      });
    },
    unregister: function unregister(registration) {
      var app = this;
      if (!('serviceWorker' in win.navigator) || !app.serviceWorker.container) {
        return new Promise(function (resolve, reject) {
          reject(new Error('Service worker is not supported'));
        });
      }
      var registrations;
      if (!registration) { registrations = SW.registrations; }
      else if (Array.isArray(registration)) { registrations = registration; }
      else { registrations = [registration]; }
      return Promise.all(registrations.map(function (reg) { return new Promise(function (resolve, reject) {
        reg.unregister()
          .then(function () {
            if (SW.registrations.indexOf(reg) >= 0) {
              SW.registrations.splice(SW.registrations.indexOf(reg), 1);
            }
            app.emit('serviceWorkerUnregisterSuccess', reg);
            resolve();
          })
          .catch(function (error) {
            app.emit('serviceWorkerUnregisterError', reg, error);
            reject(error);
          });
      }); }));
    },
  };

  var ServiceWorkerModule = {
    name: 'sw',
    params: {
      serviceWorker: {
        path: undefined,
        scope: undefined,
      },
    },
    create: function create() {
      var app = this;
      Utils.extend(app, {
        serviceWorker: {
          container: ('serviceWorker' in win.navigator) ? win.navigator.serviceWorker : undefined,
          registrations: SW.registrations,
          register: SW.register.bind(app),
          unregister: SW.unregister.bind(app),
        },
      });
    },
    on: {
      init: function init() {
        if (!('serviceWorker' in win.navigator)) { return; }
        var app = this;
        if (!app.serviceWorker.container) { return; }
        var paths = app.params.serviceWorker.path;
        var scope = app.params.serviceWorker.scope;
        if (!paths || (Array.isArray(paths) && !paths.length)) { return; }
        var toRegister = Array.isArray(paths) ? paths : [paths];
        toRegister.forEach(function (path) {
          app.serviceWorker.register(path, scope);
        });
      },
    },
  };

  var Statusbar = {
    hide: function hide() {
      if (Device.cordova && win.StatusBar) {
        win.StatusBar.hide();
      }
    },
    show: function show() {
      if (Device.cordova && win.StatusBar) {
        win.StatusBar.show();
      }
    },
    onClick: function onClick() {
      var app = this;
      var pageContent;
      if ($('.popup.modal-in').length > 0) {
        // Check for opened popup
        pageContent = $('.popup.modal-in').find('.page:not(.page-previous):not(.page-next):not(.cached)').find('.page-content');
      } else if ($('.panel.panel-in').length > 0) {
        // Check for opened panel
        pageContent = $('.panel.panel-in').find('.page:not(.page-previous):not(.page-next):not(.cached)').find('.page-content');
      } else if ($('.views > .view.tab-active').length > 0) {
        // View in tab bar app layout
        pageContent = $('.views > .view.tab-active').find('.page:not(.page-previous):not(.page-next):not(.cached)').find('.page-content');
      } else if ($('.views').length > 0) {
        pageContent = $('.views').find('.page:not(.page-previous):not(.page-next):not(.cached)').find('.page-content');
      } else {
        pageContent = app.root.children('.view').find('.page:not(.page-previous):not(.page-next):not(.cached)').find('.page-content');
      }

      if (pageContent && pageContent.length > 0) {
        // Check for tab
        if (pageContent.hasClass('tab')) {
          pageContent = pageContent.parent('.tabs').children('.page-content.tab-active');
        }
        if (pageContent.length > 0) { pageContent.scrollTop(0, 300); }
      }
    },
    setTextColor: function setTextColor(color) {
      if (Device.cordova && win.StatusBar) {
        if (color === 'white') {
          win.StatusBar.styleLightContent();
        } else {
          win.StatusBar.styleDefault();
        }
      }
    },
    setBackgroundColor: function setBackgroundColor(color) {
      if (Device.cordova && win.StatusBar) {
        win.StatusBar.backgroundColorByHexString(color);
      }
    },
    isVisible: function isVisible() {
      if (Device.cordova && win.StatusBar) {
        return win.StatusBar.isVisible;
      }
      return false;
    },
    overlaysWebView: function overlaysWebView(overlays) {
      if ( overlays === void 0 ) overlays = true;

      if (Device.cordova && win.StatusBar) {
        win.StatusBar.overlaysWebView(overlays);
      }
    },
    init: function init() {
      var app = this;
      var params = app.params.statusbar;
      if (!params.enabled) { return; }

      if (Device.cordova && win.StatusBar) {
        if (params.scrollTopOnClick) {
          $(win).on('statusTap', Statusbar.onClick.bind(app));
        }
        if (Device.ios) {
          if (params.iosOverlaysWebView) {
            win.StatusBar.overlaysWebView(true);
          } else {
            win.StatusBar.overlaysWebView(false);
          }
          if (params.iosTextColor === 'white') {
            win.StatusBar.styleLightContent();
          } else {
            win.StatusBar.styleDefault();
          }
        }
        if (Device.android) {
          if (params.androidOverlaysWebView) {
            win.StatusBar.overlaysWebView(true);
          } else {
            win.StatusBar.overlaysWebView(false);
          }
          if (params.androidTextColor === 'white') {
            win.StatusBar.styleLightContent();
          } else {
            win.StatusBar.styleDefault();
          }
        }
      }
      if (params.iosBackgroundColor && Device.ios) {
        Statusbar.setBackgroundColor(params.iosBackgroundColor);
      }
      if (params.androidBackgroundColor && Device.android) {
        Statusbar.setBackgroundColor(params.androidBackgroundColor);
      }
    },
  };

  var Statusbar$1 = {
    name: 'statusbar',
    params: {
      statusbar: {
        enabled: true,

        scrollTopOnClick: true,

        iosOverlaysWebView: true,
        iosTextColor: 'black',
        iosBackgroundColor: null,

        androidOverlaysWebView: false,
        androidTextColor: 'black',
        androidBackgroundColor: null,
      },
    },
    create: function create() {
      var app = this;
      Utils.extend(app, {
        statusbar: {
          hide: Statusbar.hide,
          show: Statusbar.show,
          overlaysWebView: Statusbar.overlaysWebView,
          setTextColor: Statusbar.setTextColor,
          setBackgroundColor: Statusbar.setBackgroundColor,
          isVisible: Statusbar.isVisible,
          init: Statusbar.init.bind(app),
        },
      });
    },
    on: {
      init: function init() {
        var app = this;
        Statusbar.init.call(app);
      },
    },
  };

  function getCurrentView(app) {
    var $popoverView = $('.popover.modal-in .view');
    var $popupView = $('.popup.modal-in .view');
    var $panelView = $('.panel.panel-in .view');
    var $viewsEl = $('.views');
    if ($viewsEl.length === 0) { $viewsEl = app.root; }
    // Find active view as tab
    var $viewEl = $viewsEl.children('.view');
    if ($viewEl.length === 0) {
      $viewEl = $viewsEl.children('.tabs').children('.view');
    }
    // Propably in tabs or split view
    if ($viewEl.length > 1) {
      if ($viewEl.hasClass('tab')) {
        // Tabs
        $viewEl = $viewsEl.children('.view.tab-active');
        if ($viewEl.length === 0) {
          $viewEl = $viewsEl.children('.tabs').children('.view.tab-active');
        }
      }
    }
    if ($popoverView.length > 0 && $popoverView[0].f7View) { return $popoverView[0].f7View; }
    if ($popupView.length > 0 && $popupView[0].f7View) { return $popupView[0].f7View; }
    if ($panelView.length > 0 && $panelView[0].f7View) { return $panelView[0].f7View; }
    if ($viewEl.length > 0) {
      if ($viewEl.length === 1 && $viewEl[0].f7View) { return $viewEl[0].f7View; }
      if ($viewEl.length > 1) {
        return app.views.main;
      }
    }
    return undefined;
  }

  var View$1 = {
    name: 'view',
    params: {
      view: {
        name: undefined,
        main: false,
        router: true,
        linksView: null,
        stackPages: false,
        xhrCache: true,
        xhrCacheIgnore: [],
        xhrCacheIgnoreGetParameters: false,
        xhrCacheDuration: 1000 * 60 * 10, // Ten minutes
        componentCache: true,
        preloadPreviousPage: true,
        allowDuplicateUrls: false,
        reloadPages: false,
        reloadDetail: false,
        masterDetailBreakpoint: 0,
        masterDetailResizable: false,
        removeElements: true,
        removeElementsWithTimeout: false,
        removeElementsTimeout: 0,
        restoreScrollTopOnBack: true,
        unloadTabContent: true,
        passRouteQueryToRequest: true,
        passRouteParamsToRequest: false,
        loadInitialPage: true,
        // Swipe Back
        iosSwipeBack: true,
        iosSwipeBackAnimateShadow: true,
        iosSwipeBackAnimateOpacity: true,
        iosSwipeBackActiveArea: 30,
        iosSwipeBackThreshold: 0,
        mdSwipeBack: false,
        mdSwipeBackAnimateShadow: true,
        mdSwipeBackAnimateOpacity: false,
        mdSwipeBackActiveArea: 30,
        mdSwipeBackThreshold: 0,
        auroraSwipeBack: false,
        auroraSwipeBackAnimateShadow: false,
        auroraSwipeBackAnimateOpacity: true,
        auroraSwipeBackActiveArea: 30,
        auroraSwipeBackThreshold: 0,
        // Push State
        pushState: false,
        pushStateRoot: undefined,
        pushStateAnimate: true,
        pushStateAnimateOnLoad: false,
        pushStateSeparator: '#!',
        pushStateOnLoad: true,
        // Animate Pages
        animate: true,
        // iOS Dynamic Navbar
        iosDynamicNavbar: true,
        // Animate iOS Navbar Back Icon
        iosAnimateNavbarBackIcon: true,
        // Delays
        iosPageLoadDelay: 0,
        mdPageLoadDelay: 0,
        auroraPageLoadDelay: 0,
        // Routes hooks
        routesBeforeEnter: null,
        routesBeforeLeave: null,
      },
    },
    static: {
      View: View,
    },
    create: function create() {
      var app = this;
      Utils.extend(app, {
        views: Utils.extend([], {
          create: function create(el, params) {
            return new View(app, el, params);
          },
          get: function get(viewEl) {
            var $viewEl = $(viewEl);
            if ($viewEl.length && $viewEl[0].f7View) { return $viewEl[0].f7View; }
            return undefined;
          },
        }),
      });
      Object.defineProperty(app.views, 'current', {
        enumerable: true,
        configurable: true,
        get: function get() {
          return getCurrentView(app);
        },
      });
      // Alias
      app.view = app.views;
    },
    on: {
      init: function init() {
        var app = this;
        $('.view-init').each(function (index, viewEl) {
          if (viewEl.f7View) { return; }
          var viewParams = $(viewEl).dataset();
          app.views.create(viewEl, viewParams);
        });
      },
      modalOpen: function modalOpen(modal) {
        var app = this;
        modal.$el.find('.view-init').each(function (index, viewEl) {
          if (viewEl.f7View) { return; }
          var viewParams = $(viewEl).dataset();
          app.views.create(viewEl, viewParams);
        });
      },
      modalBeforeDestroy: function modalBeforeDestroy(modal) {
        if (!modal || !modal.$el) { return; }
        modal.$el.find('.view-init').each(function (index, viewEl) {
          var view = viewEl.f7View;
          if (!view) { return; }
          view.destroy();
        });
      },
    },
    vnode: {
      'view-init': {
        insert: function insert(vnode) {
          var app = this;
          var viewEl = vnode.elm;
          if (viewEl.f7View) { return; }
          var viewParams = $(viewEl).dataset();
          app.views.create(viewEl, viewParams);
        },
        destroy: function destroy(vnode) {
          var viewEl = vnode.elm;
          var view = viewEl.f7View;
          if (!view) { return; }
          view.destroy();
        },
      },
    },
  };

  var Navbar = {
    size: function size(el) {
      var app = this;

      var $el = $(el);

      if ($el.hasClass('navbars')) {
        $el = $el.children('.navbar').each(function (index, navbarEl) {
          app.navbar.size(navbarEl);
        });
        return;
      }

      var $innerEl = $el.children('.navbar-inner');
      if (!$innerEl.length) { return; }

      var needCenterTitle = (
        $innerEl.hasClass('navbar-inner-centered-title')
        || app.params.navbar[((app.theme) + "CenterTitle")]
      );
      var needLeftTitle = app.theme === 'ios' && !app.params.navbar[((app.theme) + "CenterTitle")];

      if (!needCenterTitle && !needLeftTitle) { return; }

      if (
        $el.hasClass('stacked')
        || $el.parents('.stacked').length > 0
        || $el.parents('.tab:not(.tab-active)').length > 0
        || $el.parents('.popup:not(.modal-in)').length > 0
      ) {
        return;
      }

      if (app.theme !== 'ios' && app.params.navbar[((app.theme) + "CenterTitle")]) {
        $innerEl.addClass('navbar-inner-centered-title');
      }
      if (app.theme === 'ios' && !app.params.navbar.iosCenterTitle) {
        $innerEl.addClass('navbar-inner-left-title');
      }

      var $viewEl = $el.parents('.view').eq(0);
      var left = app.rtl ? $innerEl.children('.right') : $innerEl.children('.left');
      var right = app.rtl ? $innerEl.children('.left') : $innerEl.children('.right');
      var title = $innerEl.children('.title');
      var subnavbar = $innerEl.children('.subnavbar');
      var noLeft = left.length === 0;
      var noRight = right.length === 0;
      var leftWidth = noLeft ? 0 : left.outerWidth(true);
      var rightWidth = noRight ? 0 : right.outerWidth(true);
      var titleWidth = title.outerWidth(true);
      var navbarStyles = $innerEl.styles();
      var navbarWidth = $innerEl[0].offsetWidth;
      var navbarInnerWidth = navbarWidth - parseInt(navbarStyles.paddingLeft, 10) - parseInt(navbarStyles.paddingRight, 10);
      var isPrevious = $el.hasClass('navbar-previous');
      var sliding = $innerEl.hasClass('sliding');

      var router;
      var dynamicNavbar;

      if ($viewEl.length > 0 && $viewEl[0].f7View) {
        router = $viewEl[0].f7View.router;
        dynamicNavbar = router && router.dynamicNavbar;
      }

      var currLeft;
      var diff;
      if (noRight) {
        currLeft = navbarInnerWidth - titleWidth;
      }
      if (noLeft) {
        currLeft = 0;
      }
      if (!noLeft && !noRight) {
        currLeft = ((navbarInnerWidth - rightWidth - titleWidth) + leftWidth) / 2;
      }
      var requiredLeft = (navbarInnerWidth - titleWidth) / 2;
      if (navbarInnerWidth - leftWidth - rightWidth > titleWidth) {
        if (requiredLeft < leftWidth) {
          requiredLeft = leftWidth;
        }
        if (requiredLeft + titleWidth > navbarInnerWidth - rightWidth) {
          requiredLeft = navbarInnerWidth - rightWidth - titleWidth;
        }
        diff = requiredLeft - currLeft;
      } else {
        diff = 0;
      }

      // RTL inverter
      var inverter = app.rtl ? -1 : 1;

      if (dynamicNavbar && app.theme === 'ios') {
        if (title.hasClass('sliding') || (title.length > 0 && sliding)) {
          var titleLeftOffset = -(currLeft + diff) * inverter;
          var titleRightOffset = (navbarInnerWidth - currLeft - diff - titleWidth) * inverter;

          if (isPrevious) {
            if (router && router.params.iosAnimateNavbarBackIcon) {
              var activeNavbarBackLink = $el.parent().find('.navbar-current').children('.left.sliding').find('.back .icon ~ span');
              if (activeNavbarBackLink.length > 0) {
                titleLeftOffset += activeNavbarBackLink[0].offsetLeft;
              }
            }
          }
          title[0].f7NavbarLeftOffset = titleLeftOffset;
          title[0].f7NavbarRightOffset = titleRightOffset;
        }
        if (!noLeft && (left.hasClass('sliding') || sliding)) {
          if (app.rtl) {
            left[0].f7NavbarLeftOffset = (-(navbarInnerWidth - left[0].offsetWidth) / 2) * inverter;
            left[0].f7NavbarRightOffset = leftWidth * inverter;
          } else {
            left[0].f7NavbarLeftOffset = -leftWidth;
            left[0].f7NavbarRightOffset = ((navbarInnerWidth - left[0].offsetWidth) / 2);
            if (router && router.params.iosAnimateNavbarBackIcon && left.find('.back .icon').length > 0) {
              if (left.find('.back .icon ~ span').length) {
                var leftOffset = left[0].f7NavbarLeftOffset;
                var rightOffset = left[0].f7NavbarRightOffset;
                left[0].f7NavbarLeftOffset = 0;
                left[0].f7NavbarRightOffset = 0;
                left.find('.back .icon ~ span')[0].f7NavbarLeftOffset = leftOffset;
                left.find('.back .icon ~ span')[0].f7NavbarRightOffset = rightOffset - left.find('.back .icon')[0].offsetWidth;
              }
            }
          }
        }
        if (!noRight && (right.hasClass('sliding') || sliding)) {
          if (app.rtl) {
            right[0].f7NavbarLeftOffset = -rightWidth * inverter;
            right[0].f7NavbarRightOffset = ((navbarInnerWidth - right[0].offsetWidth) / 2) * inverter;
          } else {
            right[0].f7NavbarLeftOffset = -(navbarInnerWidth - right[0].offsetWidth) / 2;
            right[0].f7NavbarRightOffset = rightWidth;
          }
        }
        if (subnavbar.length && (subnavbar.hasClass('sliding') || sliding)) {
          subnavbar[0].f7NavbarLeftOffset = app.rtl ? subnavbar[0].offsetWidth : -subnavbar[0].offsetWidth;
          subnavbar[0].f7NavbarRightOffset = -subnavbar[0].f7NavbarLeftOffset;
        }
      }

      // Center title
      if (needCenterTitle) {
        var titleLeft = diff;
        if (app.rtl && noLeft && noRight && title.length > 0) { titleLeft = -titleLeft; }
        title.css({ left: (titleLeft + "px") });
      }
    },
    hide: function hide(el, animate, hideStatusbar) {
      if ( animate === void 0 ) animate = true;
      if ( hideStatusbar === void 0 ) hideStatusbar = false;

      var app = this;
      var $el = $(el);
      var isDynamic = $el.hasClass('navbar') && $el.parent('.navbars').length;
      if (isDynamic) { $el = $el.parents('.navbars'); }
      if (!$el.length) { return; }
      if ($el.hasClass('navbar-hidden')) { return; }
      var className = "navbar-hidden" + (animate ? ' navbar-transitioning' : '');
      var currentIsLarge = isDynamic
        ? $el.find('.navbar-current .title-large').length
        : $el.find('.title-large').length;
      if (currentIsLarge) {
        className += ' navbar-large-hidden';
      }
      if (hideStatusbar) {
        className += ' navbar-hidden-statusbar';
      }
      $el.transitionEnd(function () {
        $el.removeClass('navbar-transitioning');
      });
      $el.addClass(className);
      if (isDynamic) {
        $el.children('.navbar').each(function (index, subEl) {
          $(subEl).trigger('navbar:hide');
          app.emit('navbarHide', subEl);
        });
      } else {
        $el.trigger('navbar:hide');
        app.emit('navbarHide', $el[0]);
      }
    },
    show: function show(el, animate) {
      if ( el === void 0 ) el = '.navbar-hidden';
      if ( animate === void 0 ) animate = true;

      var app = this;
      var $el = $(el);
      var isDynamic = $el.hasClass('navbar') && $el.parent('.navbars').length;
      if (isDynamic) { $el = $el.parents('.navbars'); }
      if (!$el.length) { return; }
      if (!$el.hasClass('navbar-hidden')) { return; }
      if (animate) {
        $el.addClass('navbar-transitioning');
        $el.transitionEnd(function () {
          $el.removeClass('navbar-transitioning');
        });
      }
      $el.removeClass('navbar-hidden navbar-large-hidden navbar-hidden-statusbar');
      if (isDynamic) {
        $el.children('.navbar').each(function (index, subEl) {
          $(subEl).trigger('navbar:show');
          app.emit('navbarShow', subEl);
        });
      } else {
        $el.trigger('navbar:show');
        app.emit('navbarShow', $el[0]);
      }
    },
    getElByPage: function getElByPage(page) {
      var $pageEl;
      var $navbarEl;
      var pageData;
      if (page.$navbarEl || page.$el) {
        pageData = page;
        $pageEl = page.$el;
      } else {
        $pageEl = $(page);
        if ($pageEl.length > 0) { pageData = $pageEl[0].f7Page; }
      }
      if (pageData && pageData.$navbarEl && pageData.$navbarEl.length > 0) {
        $navbarEl = pageData.$navbarEl;
      } else if ($pageEl) {
        $navbarEl = $pageEl.children('.navbar');
      }
      if (!$navbarEl || ($navbarEl && $navbarEl.length === 0)) { return undefined; }
      return $navbarEl[0];
    },
    getPageByEl: function getPageByEl(navbarEl) {
      var $navbarEl = $(navbarEl);
      if ($navbarEl.parents('.page').length) {
        return $navbarEl.parents('.page')[0];
      }
      var pageEl;
      $navbarEl.parents('.view').find('.page').each(function (index, el) {
        if (el && el.f7Page && el.f7Page.navbarEl && $navbarEl[0] === el.f7Page.navbarEl) {
          pageEl = el;
        }
      });
      return pageEl;
    },

    collapseLargeTitle: function collapseLargeTitle(navbarEl) {
      var app = this;
      var $navbarEl = $(navbarEl);
      if ($navbarEl.hasClass('navbars')) {
        $navbarEl = $navbarEl.find('.navbar');
        if ($navbarEl.length > 1) {
          $navbarEl = $(navbarEl).find('.navbar-large.navbar-current');
        }
        if ($navbarEl.length > 1 || !$navbarEl.length) {
          return;
        }
      }
      var $pageEl = $(app.navbar.getPageByEl($navbarEl));
      $navbarEl.addClass('navbar-large-collapsed');
      $pageEl.eq(0).addClass('page-with-navbar-large-collapsed').trigger('page:navbarlargecollapsed');
      app.emit('pageNavbarLargeCollapsed', $pageEl[0]);
      $navbarEl.trigger('navbar:collapse');
      app.emit('navbarCollapse', $navbarEl[0]);
    },
    expandLargeTitle: function expandLargeTitle(navbarEl) {
      var app = this;
      var $navbarEl = $(navbarEl);
      if ($navbarEl.hasClass('navbars')) {
        $navbarEl = $navbarEl.find('.navbar-large');
        if ($navbarEl.length > 1) {
          $navbarEl = $(navbarEl).find('.navbar-large.navbar-current');
        }
        if ($navbarEl.length > 1 || !$navbarEl.length) {
          return;
        }
      }
      var $pageEl = $(app.navbar.getPageByEl($navbarEl));
      $navbarEl.removeClass('navbar-large-collapsed');
      $pageEl.eq(0).removeClass('page-with-navbar-large-collapsed').trigger('page:navbarlargeexpanded');
      app.emit('pageNavbarLargeExpanded', $pageEl[0]);
      $navbarEl.trigger('navbar:expand');
      app.emit('navbarExpand', $navbarEl[0]);
    },
    toggleLargeTitle: function toggleLargeTitle(navbarEl) {
      var app = this;
      var $navbarEl = $(navbarEl);
      if ($navbarEl.hasClass('navbars')) {
        $navbarEl = $navbarEl.find('.navbar-large');
        if ($navbarEl.length > 1) {
          $navbarEl = $(navbarEl).find('.navbar-large.navbar-current');
        }
        if ($navbarEl.length > 1 || !$navbarEl.length) {
          return;
        }
      }
      if ($navbarEl.hasClass('navbar-large-collapsed')) {
        app.navbar.expandLargeTitle($navbarEl);
      } else {
        app.navbar.collapseLargeTitle($navbarEl);
      }
    },
    initNavbarOnScroll: function initNavbarOnScroll(pageEl, navbarEl, needHide, needCollapse, needTransparent) {
      var app = this;
      var $pageEl = $(pageEl);
      var $navbarEl = $(navbarEl);
      var $titleLargeEl = $navbarEl.find('.title-large');
      var isLarge = $titleLargeEl.length || $navbarEl.hasClass('.navbar-large');
      var navbarHideHeight = 44;
      var snapPageScrollToLargeTitle = app.params.navbar.snapPageScrollToLargeTitle;
      var snapPageScrollToTransparentNavbar = app.params.navbar.snapPageScrollToTransparentNavbar;

      var previousScrollTop;
      var currentScrollTop;

      var scrollHeight;
      var offsetHeight;
      var reachEnd;
      var action;
      var navbarHidden;

      var navbarCollapsed;
      var navbarTitleLargeHeight;

      var navbarOffsetHeight;

      if (needCollapse || (needHide && isLarge)) {
        navbarTitleLargeHeight = $navbarEl.css('--f7-navbar-large-title-height');

        if (navbarTitleLargeHeight && navbarTitleLargeHeight.indexOf('px') >= 0) {
          navbarTitleLargeHeight = parseInt(navbarTitleLargeHeight, 10);
          if (Number.isNaN(navbarTitleLargeHeight) && $titleLargeEl.length) {
            navbarTitleLargeHeight = $titleLargeEl[0].offsetHeight;
          } else if (Number.isNaN(navbarTitleLargeHeight)) {
            if (app.theme === 'ios') { navbarTitleLargeHeight = 52; }
            else if (app.theme === 'md') { navbarTitleLargeHeight = 48; }
            else if (app.theme === 'aurora') { navbarTitleLargeHeight = 38; }
          }
        } else if ($titleLargeEl.length) {
          navbarTitleLargeHeight = $titleLargeEl[0].offsetHeight;
        } else { // eslint-disable-next-line
          if (app.theme === 'ios') { navbarTitleLargeHeight = 52; }
          else if (app.theme === 'md') { navbarTitleLargeHeight = 48; }
          else if (app.theme === 'aurora') { navbarTitleLargeHeight = 38; }
        }
      }

      if (needHide && isLarge) {
        navbarHideHeight += navbarTitleLargeHeight;
      }

      var scrollChanged;
      var scrollContent;
      var scrollTimeoutId;
      var touchEndTimeoutId;
      var touchSnapTimeout = 70;
      var desktopSnapTimeout = 300;

      function snapLargeNavbar() {
        var inSearchbarExpanded = $navbarEl.hasClass('with-searchbar-expandable-enabled');
        if (inSearchbarExpanded) { return; }
        if (!scrollContent || currentScrollTop < 0) { return; }
        if (currentScrollTop >= navbarTitleLargeHeight / 2 && currentScrollTop < navbarTitleLargeHeight) {
          $(scrollContent).scrollTop(navbarTitleLargeHeight, 100);
        } else if (currentScrollTop < navbarTitleLargeHeight) {
          $(scrollContent).scrollTop(0, 200);
        }
      }

      function snapTransparentNavbar() {
        var inSearchbarExpanded = $navbarEl.hasClass('with-searchbar-expandable-enabled');
        if (inSearchbarExpanded) { return; }
        if (!scrollContent || currentScrollTop < 0) { return; }
        if (currentScrollTop >= navbarOffsetHeight / 2 && currentScrollTop < navbarOffsetHeight) {
          $(scrollContent).scrollTop(navbarOffsetHeight, 100);
        } else if (currentScrollTop < navbarOffsetHeight) {
          $(scrollContent).scrollTop(0, 200);
        }
      }

      function handleNavbarTransparent() {
        var isHidden = $navbarEl.hasClass('navbar-hidden') || $navbarEl.parent('.navbars').hasClass('navbar-hidden');
        var inSearchbarExpanded = $navbarEl.hasClass('with-searchbar-expandable-enabled');
        if (inSearchbarExpanded || isHidden) { return; }
        if (!navbarOffsetHeight) {
          navbarOffsetHeight = navbarEl.offsetHeight;
        }
        var opacity = currentScrollTop / navbarOffsetHeight;
        var notTransparent = $navbarEl.hasClass('navbar-transparent-visible');
        opacity = Math.max(Math.min(opacity, 1), 0);

        if ((notTransparent && opacity === 1) || (!notTransparent && opacity === 0)) {
          $navbarEl.find('.navbar-bg, .title').css('opacity', '');
          return;
        }
        if (notTransparent && opacity === 0) {
          $navbarEl.trigger('navbar:transparenthide');
          app.emit('navbarTransparentHide', $navbarEl[0]);
          $navbarEl.removeClass('navbar-transparent-visible');
          $navbarEl.find('.navbar-bg, .title').css('opacity', '');
          return;
        }
        if (!notTransparent && opacity === 1) {
          $navbarEl.trigger('navbar:transparentshow');
          app.emit('navbarTransparentShow', $navbarEl[0]);
          $navbarEl.addClass('navbar-transparent-visible');
          $navbarEl.find('.navbar-bg, .title').css('opacity', '');
          return;
        }

        $navbarEl.find('.navbar-bg, .title').css('opacity', opacity);

        if (snapPageScrollToTransparentNavbar) {
          if (!Support.touch) {
            clearTimeout(scrollTimeoutId);
            scrollTimeoutId = setTimeout(function () {
              snapTransparentNavbar();
            }, desktopSnapTimeout);
          } else if (touchEndTimeoutId) {
            clearTimeout(touchEndTimeoutId);
            touchEndTimeoutId = null;
            touchEndTimeoutId = setTimeout(function () {
              snapTransparentNavbar();
              clearTimeout(touchEndTimeoutId);
              touchEndTimeoutId = null;
            }, touchSnapTimeout);
          }
        }
      }

      var previousCollapseProgress = null;
      var collapseProgress = null;
      function handleLargeNavbarCollapse() {
        var isHidden = $navbarEl.hasClass('navbar-hidden') || $navbarEl.parent('.navbars').hasClass('navbar-hidden');
        if (isHidden) { return; }
        var isLargeTransparent = $navbarEl.hasClass('navbar-large-transparent')
          || (
            $navbarEl.hasClass('navbar-large')
            && $navbarEl.hasClass('navbar-transparent')
          );
        previousCollapseProgress = collapseProgress;
        collapseProgress = Math.min(Math.max((currentScrollTop / navbarTitleLargeHeight), 0), 1);
        var previousCollapseWasInMiddle = previousCollapseProgress > 0 && previousCollapseProgress < 1;
        var inSearchbarExpanded = $navbarEl.hasClass('with-searchbar-expandable-enabled');
        if (inSearchbarExpanded) { return; }
        navbarCollapsed = $navbarEl.hasClass('navbar-large-collapsed');
        if (collapseProgress === 0 && navbarCollapsed) {
          app.navbar.expandLargeTitle($navbarEl[0]);
        } else if (collapseProgress === 1 && !navbarCollapsed) {
          app.navbar.collapseLargeTitle($navbarEl[0]);
        }
        if (
          (collapseProgress === 0 && navbarCollapsed)
          || (collapseProgress === 0 && previousCollapseWasInMiddle)
          || (collapseProgress === 1 && !navbarCollapsed)
          || (collapseProgress === 1 && previousCollapseWasInMiddle)
        ) {
          if (app.theme === 'md') {
            $navbarEl.find('.navbar-inner').css('overflow', '');
          }
          $navbarEl.find('.title').css('opacity', '');
          $navbarEl.find('.title-large-text, .subnavbar').css('transform', '');
          if (isLargeTransparent) {
            $navbarEl.find('.navbar-bg').css('opacity', '');
          } else {
            $navbarEl.find('.navbar-bg').css('transform', '');
          }
        } else if (collapseProgress > 0 && collapseProgress < 1) {
          if (app.theme === 'md') {
            $navbarEl.find('.navbar-inner').css('overflow', 'visible');
          }
          $navbarEl.find('.title').css('opacity', collapseProgress);
          $navbarEl.find('.title-large-text, .subnavbar').css('transform', ("translate3d(0px, " + (-1 * collapseProgress * navbarTitleLargeHeight) + "px, 0)"));
          if (isLargeTransparent) {
            $navbarEl.find('.navbar-bg').css('opacity', collapseProgress);
          } else {
            $navbarEl.find('.navbar-bg').css('transform', ("translate3d(0px, " + (-1 * collapseProgress * navbarTitleLargeHeight) + "px, 0)"));
          }
        }

        if (snapPageScrollToLargeTitle) {
          if (!Support.touch) {
            clearTimeout(scrollTimeoutId);
            scrollTimeoutId = setTimeout(function () {
              snapLargeNavbar();
            }, desktopSnapTimeout);
          } else if (touchEndTimeoutId) {
            clearTimeout(touchEndTimeoutId);
            touchEndTimeoutId = null;
            touchEndTimeoutId = setTimeout(function () {
              snapLargeNavbar();
              clearTimeout(touchEndTimeoutId);
              touchEndTimeoutId = null;
            }, touchSnapTimeout);
          }
        }
      }

      function handleTitleHideShow() {
        if ($pageEl.hasClass('page-with-card-opened')) { return; }
        scrollHeight = scrollContent.scrollHeight;
        offsetHeight = scrollContent.offsetHeight;
        reachEnd = currentScrollTop + offsetHeight >= scrollHeight;
        navbarHidden = $navbarEl.hasClass('navbar-hidden') || $navbarEl.parent('.navbars').hasClass('navbar-hidden');
        if (reachEnd) {
          if (app.params.navbar.showOnPageScrollEnd) {
            action = 'show';
          }
        } else if (previousScrollTop > currentScrollTop) {
          if (app.params.navbar.showOnPageScrollTop || currentScrollTop <= navbarHideHeight) {
            action = 'show';
          } else {
            action = 'hide';
          }
        } else if (currentScrollTop > navbarHideHeight) {
          action = 'hide';
        } else {
          action = 'show';
        }

        if (action === 'show' && navbarHidden) {
          app.navbar.show($navbarEl);
          navbarHidden = false;
        } else if (action === 'hide' && !navbarHidden) {
          app.navbar.hide($navbarEl);
          navbarHidden = true;
        }
        previousScrollTop = currentScrollTop;
      }

      function handleScroll(e) {
        scrollContent = this;
        if (e && e.target && e.target !== scrollContent) {
          return;
        }
        currentScrollTop = scrollContent.scrollTop;
        scrollChanged = currentScrollTop;
        if (needCollapse) {
          handleLargeNavbarCollapse();
        } else if (needTransparent) {
          handleNavbarTransparent();
        }
        if ($pageEl.hasClass('page-previous')) { return; }
        if (needHide) {
          handleTitleHideShow();
        }
      }
      function handeTouchStart() {
        scrollChanged = false;
      }
      function handleTouchEnd() {
        clearTimeout(touchEndTimeoutId);
        touchEndTimeoutId = null;
        touchEndTimeoutId = setTimeout(function () {
          if (scrollChanged !== false) {
            if (needTransparent && !needCollapse) {
              snapTransparentNavbar();
            } else {
              snapLargeNavbar();
            }
            clearTimeout(touchEndTimeoutId);
            touchEndTimeoutId = null;
          }
        }, touchSnapTimeout);
      }
      $pageEl.on('scroll', '.page-content', handleScroll, true);
      if (Support.touch && ((needCollapse && snapPageScrollToLargeTitle) || (needTransparent && snapPageScrollToTransparentNavbar))) {
        app.on('touchstart:passive', handeTouchStart);
        app.on('touchend:passive', handleTouchEnd);
      }
      if (needCollapse) {
        $pageEl.find('.page-content').each(function (pageContentIndex, pageContentEl) {
          if (pageContentEl.scrollTop > 0) { handleScroll.call(pageContentEl); }
        });
      } else if (needTransparent) {
        $pageEl.find('.page-content').each(function (pageContentIndex, pageContentEl) {
          if (pageContentEl.scrollTop > 0) { handleScroll.call(pageContentEl); }
        });
      }
      $pageEl[0].f7DetachNavbarScrollHandlers = function f7DetachNavbarScrollHandlers() {
        delete $pageEl[0].f7DetachNavbarScrollHandlers;
        $pageEl.off('scroll', '.page-content', handleScroll, true);
        if (Support.touch && ((needCollapse && snapPageScrollToLargeTitle) || (needTransparent && snapPageScrollToTransparentNavbar))) {
          app.off('touchstart:passive', handeTouchStart);
          app.off('touchend:passive', handleTouchEnd);
        }
      };
    },
  };
  var Navbar$1 = {
    name: 'navbar',
    create: function create() {
      var app = this;
      Utils.extend(app, {
        navbar: {
          size: Navbar.size.bind(app),
          hide: Navbar.hide.bind(app),
          show: Navbar.show.bind(app),
          getElByPage: Navbar.getElByPage.bind(app),
          getPageByEl: Navbar.getPageByEl.bind(app),
          collapseLargeTitle: Navbar.collapseLargeTitle.bind(app),
          expandLargeTitle: Navbar.expandLargeTitle.bind(app),
          toggleLargeTitle: Navbar.toggleLargeTitle.bind(app),
          initNavbarOnScroll: Navbar.initNavbarOnScroll.bind(app),
        },
      });
    },
    params: {
      navbar: {
        scrollTopOnTitleClick: true,
        iosCenterTitle: true,
        mdCenterTitle: false,
        auroraCenterTitle: true,
        hideOnPageScroll: false,
        showOnPageScrollEnd: true,
        showOnPageScrollTop: true,
        collapseLargeTitleOnScroll: true,
        snapPageScrollToLargeTitle: true,
        snapPageScrollToTransparentNavbar: true,
      },
    },
    on: {
      'panelBreakpoint panelCollapsedBreakpoint panelResize viewResize resize viewMasterDetailBreakpoint': function onPanelResize() {
        var app = this;
        $('.navbar').each(function (index, navbarEl) {
          app.navbar.size(navbarEl);
        });
      },
      pageBeforeRemove: function pageBeforeRemove(page) {
        if (page.$el[0].f7DetachNavbarScrollHandlers) {
          page.$el[0].f7DetachNavbarScrollHandlers();
        }
      },
      pageBeforeIn: function pageBeforeIn(page) {
        var app = this;
        if (app.theme !== 'ios') { return; }
        var $navbarsEl;
        var view = page.$el.parents('.view')[0].f7View;
        var navbarEl = app.navbar.getElByPage(page);
        if (!navbarEl) {
          $navbarsEl = page.$el.parents('.view').children('.navbars');
        } else {
          $navbarsEl = $(navbarEl).parents('.navbars');
        }
        if (page.$el.hasClass('no-navbar') || (view.router.dynamicNavbar && !navbarEl)) {
          var animate = !!(page.pageFrom && page.router.history.length > 0);
          app.navbar.hide($navbarsEl, animate);
        } else {
          app.navbar.show($navbarsEl);
        }
      },
      pageReinit: function pageReinit(page) {
        var app = this;
        var $navbarEl = $(app.navbar.getElByPage(page));
        if (!$navbarEl || $navbarEl.length === 0) { return; }
        app.navbar.size($navbarEl);
      },
      pageInit: function pageInit(page) {
        var app = this;
        var $navbarEl = $(app.navbar.getElByPage(page));
        if (!$navbarEl || $navbarEl.length === 0) { return; }

        // Size
        app.navbar.size($navbarEl);

        // Need Collapse On Scroll
        var needCollapseOnScrollHandler;
        if ($navbarEl.find('.title-large').length > 0) {
          $navbarEl.addClass('navbar-large');
        }
        if ($navbarEl.hasClass('navbar-large')) {
          if (app.params.navbar.collapseLargeTitleOnScroll) { needCollapseOnScrollHandler = true; }
          page.$el.addClass('page-with-navbar-large');
        }

        // Need transparent on scroll
        var needTransparentOnScroll;
        if (!needCollapseOnScrollHandler && $navbarEl.hasClass('navbar-transparent')) {
          needTransparentOnScroll = true;
        }

        // Need Hide On Scroll
        var needHideOnScrollHandler;
        if (
          app.params.navbar.hideOnPageScroll
          || page.$el.find('.hide-navbar-on-scroll').length
          || page.$el.hasClass('hide-navbar-on-scroll')
          || page.$el.find('.hide-bars-on-scroll').length
          || page.$el.hasClass('hide-bars-on-scroll')
        ) {
          if (
            page.$el.find('.keep-navbar-on-scroll').length
            || page.$el.hasClass('keep-navbar-on-scroll')
            || page.$el.find('.keep-bars-on-scroll').length
            || page.$el.hasClass('keep-bars-on-scroll')
          ) {
            needHideOnScrollHandler = false;
          } else {
            needHideOnScrollHandler = true;
          }
        }

        if (needCollapseOnScrollHandler || needHideOnScrollHandler || needTransparentOnScroll) {
          app.navbar.initNavbarOnScroll(page.el, $navbarEl[0], needHideOnScrollHandler, needCollapseOnScrollHandler, needTransparentOnScroll);
        }
      },
      'panelOpen panelSwipeOpen modalOpen': function onPanelModalOpen(instance) {
        var app = this;
        instance.$el.find('.navbar:not(.navbar-previous):not(.stacked)').each(function (index, navbarEl) {
          app.navbar.size(navbarEl);
        });
      },
      tabShow: function tabShow(tabEl) {
        var app = this;
        $(tabEl).find('.navbar:not(.navbar-previous):not(.stacked)').each(function (index, navbarEl) {
          app.navbar.size(navbarEl);
        });
      },
    },
    clicks: {
      '.navbar .title': function onTitleClick($clickedEl) {
        var app = this;
        if (!app.params.navbar.scrollTopOnTitleClick) { return; }
        if ($clickedEl.closest('a').length > 0) {
          return;
        }
        var $pageContentEl;

        // Find active page
        var $navbarEl = $clickedEl.parents('.navbar');
        var $navbarsEl = $navbarEl.parents('.navbars');

        // Static Layout
        $pageContentEl = $navbarEl.parents('.page-content');

        if ($pageContentEl.length === 0) {
          // Fixed Layout
          if ($navbarEl.parents('.page').length > 0) {
            $pageContentEl = $navbarEl.parents('.page').find('.page-content');
          }
          // Through Layout iOS
          if ($pageContentEl.length === 0 && $navbarsEl.length) {
            if ($navbarsEl.nextAll('.page-current:not(.stacked)').length > 0) {
              $pageContentEl = $navbarsEl.nextAll('.page-current:not(.stacked)').find('.page-content');
            }
          }
          // Through Layout
          if ($pageContentEl.length === 0) {
            if ($navbarEl.nextAll('.page-current:not(.stacked)').length > 0) {
              $pageContentEl = $navbarEl.nextAll('.page-current:not(.stacked)').find('.page-content');
            }
          }
        }
        if ($pageContentEl && $pageContentEl.length > 0) {
          // Check for tab
          if ($pageContentEl.hasClass('tab')) {
            $pageContentEl = $pageContentEl.parent('.tabs').children('.page-content.tab-active');
          }
          if ($pageContentEl.length > 0) { $pageContentEl.scrollTop(0, 300); }
        }
      },
    },
    vnode: {
      navbar: {
        postpatch: function postpatch(vnode) {
          var app = this;
          app.navbar.size(vnode.elm);
        },
      },
    },
  };

  var Toolbar = {
    setHighlight: function setHighlight(tabbarEl) {
      var app = this;
      if (app.theme !== 'md') { return; }

      var $tabbarEl = $(tabbarEl);

      if ($tabbarEl.length === 0 || !($tabbarEl.hasClass('tabbar') || $tabbarEl.hasClass('tabbar-labels'))) { return; }

      var $highlightEl = $tabbarEl.find('.tab-link-highlight');
      var tabLinksCount = $tabbarEl.find('.tab-link').length;
      if (tabLinksCount === 0) {
        $highlightEl.remove();
        return;
      }

      if ($highlightEl.length === 0) {
        $tabbarEl.children('.toolbar-inner').append('<span class="tab-link-highlight"></span>');
        $highlightEl = $tabbarEl.find('.tab-link-highlight');
      } else if ($highlightEl.next().length) {
        $tabbarEl.children('.toolbar-inner').append($highlightEl);
      }

      var $activeLink = $tabbarEl.find('.tab-link-active');
      var highlightWidth;
      var highlightTranslate;

      if ($tabbarEl.hasClass('tabbar-scrollable') && $activeLink && $activeLink[0]) {
        highlightWidth = ($activeLink[0].offsetWidth) + "px";
        highlightTranslate = ($activeLink[0].offsetLeft) + "px";
      } else {
        var activeIndex = $activeLink.index();
        highlightWidth = (100 / tabLinksCount) + "%";
        highlightTranslate = ((app.rtl ? -activeIndex : activeIndex) * 100) + "%";
      }

      Utils.nextFrame(function () {
        $highlightEl
          .css('width', highlightWidth)
          .transform(("translate3d(" + highlightTranslate + ",0,0)"));
      });
    },
    init: function init(tabbarEl) {
      var app = this;
      app.toolbar.setHighlight(tabbarEl);
    },
    hide: function hide(el, animate) {
      if ( animate === void 0 ) animate = true;

      var app = this;
      var $el = $(el);
      if ($el.hasClass('toolbar-hidden')) { return; }
      var className = "toolbar-hidden" + (animate ? ' toolbar-transitioning' : '');
      $el.transitionEnd(function () {
        $el.removeClass('toolbar-transitioning');
      });
      $el.addClass(className);
      $el.trigger('toolbar:hide');
      app.emit('toolbarHide', $el[0]);
    },
    show: function show(el, animate) {
      if ( animate === void 0 ) animate = true;

      var app = this;
      var $el = $(el);
      if (!$el.hasClass('toolbar-hidden')) { return; }
      if (animate) {
        $el.addClass('toolbar-transitioning');
        $el.transitionEnd(function () {
          $el.removeClass('toolbar-transitioning');
        });
      }
      $el.removeClass('toolbar-hidden');
      $el.trigger('toolbar:show');
      app.emit('toolbarShow', $el[0]);
    },
    initToolbarOnScroll: function initToolbarOnScroll(pageEl) {
      var app = this;
      var $pageEl = $(pageEl);
      var $toolbarEl = $pageEl.parents('.view').children('.toolbar');
      if ($toolbarEl.length === 0) {
        $toolbarEl = $pageEl.find('.toolbar');
      }
      if ($toolbarEl.length === 0) {
        $toolbarEl = $pageEl.parents('.views').children('.tabbar, .tabbar-labels');
      }
      if ($toolbarEl.length === 0) {
        return;
      }

      var previousScrollTop;
      var currentScrollTop;

      var scrollHeight;
      var offsetHeight;
      var reachEnd;
      var action;
      var toolbarHidden;
      function handleScroll(e) {
        if ($pageEl.hasClass('page-with-card-opened')) { return; }
        if ($pageEl.hasClass('page-previous')) { return; }
        var scrollContent = this;
        if (e && e.target && e.target !== scrollContent) {
          return;
        }
        currentScrollTop = scrollContent.scrollTop;
        scrollHeight = scrollContent.scrollHeight;
        offsetHeight = scrollContent.offsetHeight;
        reachEnd = currentScrollTop + offsetHeight >= scrollHeight;
        toolbarHidden = $toolbarEl.hasClass('toolbar-hidden');

        if (reachEnd) {
          if (app.params.toolbar.showOnPageScrollEnd) {
            action = 'show';
          }
        } else if (previousScrollTop > currentScrollTop) {
          if (app.params.toolbar.showOnPageScrollTop || currentScrollTop <= 44) {
            action = 'show';
          } else {
            action = 'hide';
          }
        } else if (currentScrollTop > 44) {
          action = 'hide';
        } else {
          action = 'show';
        }

        if (action === 'show' && toolbarHidden) {
          app.toolbar.show($toolbarEl);
          toolbarHidden = false;
        } else if (action === 'hide' && !toolbarHidden) {
          app.toolbar.hide($toolbarEl);
          toolbarHidden = true;
        }

        previousScrollTop = currentScrollTop;
      }
      $pageEl.on('scroll', '.page-content', handleScroll, true);
      $pageEl[0].f7ScrollToolbarHandler = handleScroll;
    },
  };
  var Toolbar$1 = {
    name: 'toolbar',
    create: function create() {
      var app = this;
      Utils.extend(app, {
        toolbar: {
          hide: Toolbar.hide.bind(app),
          show: Toolbar.show.bind(app),
          setHighlight: Toolbar.setHighlight.bind(app),
          initToolbarOnScroll: Toolbar.initToolbarOnScroll.bind(app),
          init: Toolbar.init.bind(app),
        },
      });
    },
    params: {
      toolbar: {
        hideOnPageScroll: false,
        showOnPageScrollEnd: true,
        showOnPageScrollTop: true,
      },
    },
    on: {
      pageBeforeRemove: function pageBeforeRemove(page) {
        if (page.$el[0].f7ScrollToolbarHandler) {
          page.$el.off('scroll', '.page-content', page.$el[0].f7ScrollToolbarHandler, true);
        }
      },
      pageBeforeIn: function pageBeforeIn(page) {
        var app = this;
        var $toolbarEl = page.$el.parents('.view').children('.toolbar');
        if ($toolbarEl.length === 0) {
          $toolbarEl = page.$el.parents('.views').children('.tabbar, .tabbar-labels');
        }
        if ($toolbarEl.length === 0) {
          $toolbarEl = page.$el.find('.toolbar');
        }
        if ($toolbarEl.length === 0) {
          return;
        }
        if (page.$el.hasClass('no-toolbar')) {
          app.toolbar.hide($toolbarEl);
        } else {
          app.toolbar.show($toolbarEl);
        }
      },
      pageInit: function pageInit(page) {
        var app = this;
        page.$el.find('.tabbar, .tabbar-labels').each(function (index, tabbarEl) {
          app.toolbar.init(tabbarEl);
        });
        if (
          app.params.toolbar.hideOnPageScroll
          || page.$el.find('.hide-toolbar-on-scroll').length
          || page.$el.hasClass('hide-toolbar-on-scroll')
          || page.$el.find('.hide-bars-on-scroll').length
          || page.$el.hasClass('hide-bars-on-scroll')
        ) {
          if (
            page.$el.find('.keep-toolbar-on-scroll').length
            || page.$el.hasClass('keep-toolbar-on-scroll')
            || page.$el.find('.keep-bars-on-scroll').length
            || page.$el.hasClass('keep-bars-on-scroll')
          ) {
            return;
          }
          app.toolbar.initToolbarOnScroll(page.el);
        }
      },
      init: function init() {
        var app = this;
        app.root.find('.tabbar, .tabbar-labels').each(function (index, tabbarEl) {
          app.toolbar.init(tabbarEl);
        });
      },
    },
    vnode: {
      tabbar: {
        insert: function insert(vnode) {
          var app = this;
          app.toolbar.init(vnode.elm);
        },
      },
    },
  };

  var Subnavbar = {
    name: 'subnavbar',
    on: {
      pageInit: function pageInit(page) {
        if (page.$navbarEl && page.$navbarEl.length && page.$navbarEl.find('.subnavbar').length) {
          page.$el.addClass('page-with-subnavbar');
        }
        if (page.$el.find('.subnavbar').length) {
          page.$el.addClass('page-with-subnavbar');
        }
      },
    },
  };

  var TouchRipple = function TouchRipple($el, x, y) {
    var ripple = this;
    if (!$el) { return undefined; }
    var box = $el[0].getBoundingClientRect();
    var center = {
      x: x - box.left,
      y: y - box.top,
    };
    var width = box.width;
    var height = box.height;
    var diameter = Math.max((Math.pow( ((Math.pow( height, 2 )) + (Math.pow( width, 2 ))), 0.5 )), 48);

    ripple.$rippleWaveEl = $(("<div class=\"ripple-wave\" style=\"width: " + diameter + "px; height: " + diameter + "px; margin-top:-" + (diameter / 2) + "px; margin-left:-" + (diameter / 2) + "px; left:" + (center.x) + "px; top:" + (center.y) + "px;\"></div>"));

    $el.prepend(ripple.$rippleWaveEl);

    ripple.rippleTransform = "translate3d(" + (-center.x + (width / 2)) + "px, " + (-center.y + (height / 2)) + "px, 0) scale(1)";

    Utils.nextFrame(function () {
      if (!ripple || !ripple.$rippleWaveEl) { return; }
      ripple.$rippleWaveEl.transform(ripple.rippleTransform);
    });

    return ripple;
  };

  TouchRipple.prototype.destroy = function destroy () {
    var ripple = this;
    if (ripple.$rippleWaveEl) {
      ripple.$rippleWaveEl.remove();
    }
    Object.keys(ripple).forEach(function (key) {
      ripple[key] = null;
      delete ripple[key];
    });
    ripple = null;
  };

  TouchRipple.prototype.remove = function remove () {
    var ripple = this;
    if (ripple.removing) { return; }
    var $rippleWaveEl = this.$rippleWaveEl;
    var rippleTransform = this.rippleTransform;
    var removeTimeout = Utils.nextTick(function () {
      ripple.destroy();
    }, 400);
    ripple.removing = true;
    $rippleWaveEl
      .addClass('ripple-wave-fill')
      .transform(rippleTransform.replace('scale(1)', 'scale(1.01)'))
      .transitionEnd(function () {
        clearTimeout(removeTimeout);
        Utils.nextFrame(function () {
          $rippleWaveEl
            .addClass('ripple-wave-out')
            .transform(rippleTransform.replace('scale(1)', 'scale(1.01)'));

          removeTimeout = Utils.nextTick(function () {
            ripple.destroy();
          }, 700);

          $rippleWaveEl.transitionEnd(function () {
            clearTimeout(removeTimeout);
            ripple.destroy();
          });
        });
      });
  };

  var TouchRipple$1 = {
    name: 'touch-ripple',
    static: {
      TouchRipple: TouchRipple,
    },
    create: function create() {
      var app = this;
      app.touchRipple = {
        create: function create() {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          return new (Function.prototype.bind.apply( TouchRipple, [ null ].concat( args) ));
        },
      };
    },
  };

  var openedModals = [];
  var dialogsQueue = [];
  function clearDialogsQueue() {
    if (dialogsQueue.length === 0) { return; }
    var dialog = dialogsQueue.shift();
    dialog.open();
  }
  var Modal = /*@__PURE__*/(function (Framework7Class) {
    function Modal(app, params) {
      Framework7Class.call(this, params, [app]);

      var modal = this;

      var defaults = {};

      // Extend defaults with modules params
      modal.useModulesParams(defaults);

      modal.params = Utils.extend(defaults, params);
      modal.opened = false;

      // Install Modules
      modal.useModules();

      return this;
    }

    if ( Framework7Class ) Modal.__proto__ = Framework7Class;
    Modal.prototype = Object.create( Framework7Class && Framework7Class.prototype );
    Modal.prototype.constructor = Modal;

    Modal.prototype.onOpen = function onOpen () {
      var modal = this;
      modal.opened = true;
      openedModals.push(modal);
      $('html').addClass(("with-modal-" + (modal.type.toLowerCase())));
      modal.$el.trigger(("modal:open " + (modal.type.toLowerCase()) + ":open"));
      modal.emit(("local::open modalOpen " + (modal.type) + "Open"), modal);
    };

    Modal.prototype.onOpened = function onOpened () {
      var modal = this;
      modal.$el.trigger(("modal:opened " + (modal.type.toLowerCase()) + ":opened"));
      modal.emit(("local::opened modalOpened " + (modal.type) + "Opened"), modal);
    };

    Modal.prototype.onClose = function onClose () {
      var modal = this;
      modal.opened = false;
      if (!modal.type || !modal.$el) { return; }
      openedModals.splice(openedModals.indexOf(modal), 1);
      $('html').removeClass(("with-modal-" + (modal.type.toLowerCase())));
      modal.$el.trigger(("modal:close " + (modal.type.toLowerCase()) + ":close"));
      modal.emit(("local::close modalClose " + (modal.type) + "Close"), modal);
    };

    Modal.prototype.onClosed = function onClosed () {
      var modal = this;
      if (!modal.type || !modal.$el) { return; }
      modal.$el.removeClass('modal-out');
      modal.$el.hide();
      modal.$el.trigger(("modal:closed " + (modal.type.toLowerCase()) + ":closed"));
      modal.emit(("local::closed modalClosed " + (modal.type) + "Closed"), modal);
    };

    Modal.prototype.open = function open (animateModal) {
      var modal = this;
      var app = modal.app;
      var $el = modal.$el;
      var $backdropEl = modal.$backdropEl;
      var type = modal.type;
      var animate = true;
      if (typeof animateModal !== 'undefined') { animate = animateModal; }
      else if (typeof modal.params.animate !== 'undefined') {
        animate = modal.params.animate;
      }

      if (!$el || $el.hasClass('modal-in')) {
        return modal;
      }

      if (type === 'dialog' && app.params.modal.queueDialogs) {
        var pushToQueue;
        if ($('.dialog.modal-in').length > 0) {
          pushToQueue = true;
        } else if (openedModals.length > 0) {
          openedModals.forEach(function (openedModal) {
            if (openedModal.type === 'dialog') { pushToQueue = true; }
          });
        }
        if (pushToQueue) {
          dialogsQueue.push(modal);
          return modal;
        }
      }

      var $modalParentEl = $el.parent();
      var wasInDom = $el.parents(doc).length > 0;
      if (app.params.modal.moveToRoot && !$modalParentEl.is(app.root)) {
        app.root.append($el);
        modal.once((type + "Closed"), function () {
          if (wasInDom) {
            $modalParentEl.append($el);
          } else {
            $el.remove();
          }
        });
      }
      // Show Modal
      $el.show();

      /* eslint no-underscore-dangle: ["error", { "allow": ["_clientLeft"] }] */
      modal._clientLeft = $el[0].clientLeft;

      // Modal
      function transitionEnd() {
        if ($el.hasClass('modal-out')) {
          modal.onClosed();
        } else if ($el.hasClass('modal-in')) {
          modal.onOpened();
        }
      }
      if (animate) {
        if ($backdropEl) {
          $backdropEl.removeClass('not-animated');
          $backdropEl.addClass('backdrop-in');
        }
        $el
          .animationEnd(function () {
            transitionEnd();
          });
        $el
          .transitionEnd(function () {
            transitionEnd();
          });
        $el
          .removeClass('modal-out not-animated')
          .addClass('modal-in');
        modal.onOpen();
      } else {
        if ($backdropEl) {
          $backdropEl.addClass('backdrop-in not-animated');
        }
        $el.removeClass('modal-out').addClass('modal-in not-animated');
        modal.onOpen();
        modal.onOpened();
      }

      return modal;
    };

    Modal.prototype.close = function close (animateModal) {
      var modal = this;
      var $el = modal.$el;
      var $backdropEl = modal.$backdropEl;

      var animate = true;
      if (typeof animateModal !== 'undefined') { animate = animateModal; }
      else if (typeof modal.params.animate !== 'undefined') {
        animate = modal.params.animate;
      }

      if (!$el || !$el.hasClass('modal-in')) {
        if (dialogsQueue.indexOf(modal) >= 0) {
          dialogsQueue.splice(dialogsQueue.indexOf(modal), 1);
        }
        return modal;
      }

      // backdrop
      if ($backdropEl) {
        var needToHideBackdrop = true;
        if (modal.type === 'popup') {
          modal.$el.prevAll('.popup.modal-in').each(function (index, popupEl) {
            var popupInstance = popupEl.f7Modal;
            if (!popupInstance) { return; }
            if (
              popupInstance.params.closeByBackdropClick
              && popupInstance.params.backdrop
              && popupInstance.backdropEl === modal.backdropEl
            ) {
              needToHideBackdrop = false;
            }
          });
        }
        if (needToHideBackdrop) {
          $backdropEl[animate ? 'removeClass' : 'addClass']('not-animated');
          $backdropEl.removeClass('backdrop-in');
        }
      }

      // Modal
      $el[animate ? 'removeClass' : 'addClass']('not-animated');
      function transitionEnd() {
        if ($el.hasClass('modal-out')) {
          modal.onClosed();
        } else if ($el.hasClass('modal-in')) {
          modal.onOpened();
        }
      }
      if (animate) {
        $el
          .animationEnd(function () {
            transitionEnd();
          });
        $el
          .transitionEnd(function () {
            transitionEnd();
          });
        $el
          .removeClass('modal-in')
          .addClass('modal-out');
        // Emit close
        modal.onClose();
      } else {
        $el
          .addClass('not-animated')
          .removeClass('modal-in')
          .addClass('modal-out');
        // Emit close
        modal.onClose();
        modal.onClosed();
      }

      if (modal.type === 'dialog') {
        clearDialogsQueue();
      }

      return modal;
    };

    Modal.prototype.destroy = function destroy () {
      var modal = this;
      if (modal.destroyed) { return; }
      modal.emit(("local::beforeDestroy modalBeforeDestroy " + (modal.type) + "BeforeDestroy"), modal);
      if (modal.$el) {
        modal.$el.trigger(("modal:beforedestroy " + (modal.type.toLowerCase()) + ":beforedestroy"));
        if (modal.$el.length && modal.$el[0].f7Modal) {
          delete modal.$el[0].f7Modal;
        }
      }
      Utils.deleteProps(modal);
      modal.destroyed = true;
    };

    return Modal;
  }(Framework7Class));

  var CustomModal = /*@__PURE__*/(function (Modal) {
    function CustomModal(app, params) {
      var extendedParams = Utils.extend({
        backdrop: true,
        closeByBackdropClick: true,
        on: {},
      }, params);

      // Extends with open/close Modal methods;
      Modal.call(this, app, extendedParams);

      var customModal = this;

      customModal.params = extendedParams;

      // Find Element
      var $el;
      if (!customModal.params.el) {
        $el = $(customModal.params.content);
      } else {
        $el = $(customModal.params.el);
      }

      if ($el && $el.length > 0 && $el[0].f7Modal) {
        return $el[0].f7Modal;
      }

      if ($el.length === 0) {
        return customModal.destroy();
      }
      var $backdropEl;
      if (customModal.params.backdrop) {
        $backdropEl = app.root.children('.custom-modal-backdrop');
        if ($backdropEl.length === 0) {
          $backdropEl = $('<div class="custom-modal-backdrop"></div>');
          app.root.append($backdropEl);
        }
      }

      function handleClick(e) {
        if (!customModal || customModal.destroyed) { return; }
        if ($backdropEl && e.target === $backdropEl[0]) {
          customModal.close();
        }
      }

      customModal.on('customModalOpened', function () {
        if (customModal.params.closeByBackdropClick && customModal.params.backdrop) {
          app.on('click', handleClick);
        }
      });
      customModal.on('customModalClose', function () {
        if (customModal.params.closeByBackdropClick && customModal.params.backdrop) {
          app.off('click', handleClick);
        }
      });

      Utils.extend(customModal, {
        app: app,
        $el: $el,
        el: $el[0],
        $backdropEl: $backdropEl,
        backdropEl: $backdropEl && $backdropEl[0],
        type: 'customModal',
      });

      $el[0].f7Modal = customModal;

      return customModal;
    }

    if ( Modal ) CustomModal.__proto__ = Modal;
    CustomModal.prototype = Object.create( Modal && Modal.prototype );
    CustomModal.prototype.constructor = CustomModal;

    return CustomModal;
  }(Modal));

  var Modal$1 = {
    name: 'modal',
    static: {
      Modal: Modal,
      CustomModal: CustomModal,
    },
    create: function create() {
      var app = this;
      app.customModal = {
        create: function create(params) {
          return new CustomModal(app, params);
        },
      };
    },
    params: {
      modal: {
        moveToRoot: true,
        queueDialogs: true,
      },
    },
  };

  function KeypadClassConstructor (Framework7Class) {
    return /*@__PURE__*/(function (Framework7Class) {
      function Keypad(app, params) {
        Framework7Class.call(this, params, [app]);

        var Utils = app.utils;
        var $ = app.$;
        var request = app.request;

        var keypad = this;
        keypad.app = app;

        var defaults = Utils.extend({
          on: {},
        }, app.params.keypad);

        keypad.params = Utils.extend(defaults, params);

        var $containerEl;

        if (keypad.params.containerEl) {
          $containerEl = $(keypad.params.containerEl);
          if ($containerEl.length === 0) { return keypad; }
        }

        if (!keypad.params.buttons || keypad.params.buttons.length === 0) {
          var ref = keypad.params;
          var dotCharacter = ref.dotCharacter;
          var dotButton = ref.dotButton;
          if (keypad.params.type === 'numpad') {
            keypad.params.buttons = [
              {
                html: '<span class="keypad-button-number">1</span><span class="keypad-button-letters"></span>',
                value: 1,
              },
              {
                html: '<span class="keypad-button-number">2</span><span class="keypad-button-letters">ABC</span>',
                value: 2,
              },
              {
                html: '<span class="keypad-button-number">3</span><span class="keypad-button-letters">DEF</span>',
                value: 3,
              },
              {
                html: '<span class="keypad-button-number">4</span><span class="keypad-button-letters">GHI</span>',
                value: 4,
              },
              {
                html: '<span class="keypad-button-number">5</span><span class="keypad-button-letters">JKL</span>',
                value: 5,
              },
              {
                html: '<span class="keypad-button-number">6</span><span class="keypad-button-letters">MNO</span>',
                value: 6,
              },
              {
                html: '<span class="keypad-button-number">7</span><span class="keypad-button-letters">PQRS</span>',
                value: 7,
              },
              {
                html: '<span class="keypad-button-number">8</span><span class="keypad-button-letters">TUV</span>',
                value: 8,
              },
              {
                html: '<span class="keypad-button-number">9</span><span class="keypad-button-letters">WXYZ</span>',
                value: 9,
              },
              {
                html: dotButton ? ("<span class=\"keypad-button-number\">" + dotCharacter + "</span>") : '',
                value: dotButton ? dotCharacter : undefined,
                dark: true,
                cssClass: dotButton ? '' : 'keypad-dummy-button',
              },
              {
                html: '<span class="keypad-button-number">0</span>',
                value: 0,
              },
              {
                html: '<i class="icon icon-keypad-delete"></i>',
                cssClass: 'keypad-delete-button',
                dark: true,
              } ];
          } else if (params.type === 'calculator') {
            keypad.params.buttons = [
              {
                html: '<span class="keypad-button-number">C</span>',
                value: 'C',
                dark: true,
              },
              {
                html: '<span class="keypad-button-number">±</span>',
                value: '±',
                dark: true,
              },
              {
                html: '<span class="keypad-button-number">%</span>',
                value: '%',
                dark: true,
              },
              {
                html: '<span class="keypad-button-number">÷</span>',
                value: '÷',
                cssClass: 'calc-operator-button',

              },
              {
                html: '<span class="keypad-button-number">7</span>',
                value: 7,
              },
              {
                html: '<span class="keypad-button-number">8</span>',
                value: 8,
              },
              {
                html: '<span class="keypad-button-number">9</span>',
                value: 9,
              },
              {
                html: '<span class="keypad-button-number">×</span>',
                value: '×',
                cssClass: 'calc-operator-button',
              },
              {
                html: '<span class="keypad-button-number">4</span>',
                value: 4,
              },
              {
                html: '<span class="keypad-button-number">5</span>',
                value: 5,
              },
              {
                html: '<span class="keypad-button-number">6</span>',
                value: 6,
              },
              {
                html: '<span class="keypad-button-number">-</span>',
                value: '-',
                cssClass: 'calc-operator-button',
              },
              {
                html: '<span class="keypad-button-number">1</span>',
                value: 1,
              },
              {
                html: '<span class="keypad-button-number">2</span>',
                value: 2,
              },
              {
                html: '<span class="keypad-button-number">3</span>',
                value: 3,
              },
              {
                html: '<span class="keypad-button-number">+</span>',
                value: '+',
                cssClass: 'calc-operator-button',
              },
              {
                html: '<span class="keypad-button-number">0</span>',
                value: 0,
                cssClass: 'keypad-button-double',
              },
              {
                html: '<span class="keypad-button-number">.</span>',
                value: dotCharacter,
              },
              {
                html: '<span class="keypad-button-number">=</span>',
                value: '=',
                cssClass: 'calc-operator-button calc-operator-button-equal',
              } ];
          }
        }

        var $inputEl;
        if (keypad.params.inputEl) {
          $inputEl = $(keypad.params.inputEl);
        }

        var view;
        if (keypad.params.view) {
          view = keypad.params.view;
        } else if ($inputEl && $inputEl.length) {
          view = $inputEl.parents('.view').length && $inputEl.parents('.view')[0].f7View;
        } else {
          view = app.views.get($inputEl);
        }
        if (!view) { view = app.views.main; }

        Utils.extend(keypad, {
          app: app,
          request: request,
          $containerEl: $containerEl,
          containerEl: $containerEl && $containerEl[0],
          inline: $containerEl && $containerEl.length > 0,
          $inputEl: $inputEl,
          inputEl: $inputEl && $inputEl[0],
          initialized: false,
          opened: false,
          view: view,
          url: keypad.params.url,
          calcValues: [],
          calcOperations: [],
          lastWasNumber: false,
        });

        // Events
        function onInputClick() {
          keypad.open();
        }
        function onInputFocus(e) {
          e.preventDefault();
        }
        function onHtmlClick(e) {
          var $targetEl = $(e.target);
          if (keypad.isPopover()) { return; }
          if (!keypad.opened) { return; }
          if ($targetEl.closest('[class*="backdrop"]').length) { return; }
          if ($inputEl && $inputEl.length > 0) {
            if ($targetEl[0] !== $inputEl[0] && $targetEl.closest('.sheet-modal, .keypad-modal').length === 0) {
              keypad.close();
            }
          } else if ($(e.target).closest('.sheet-modal, .keypad-modal').length === 0) {
            keypad.close();
          }
        }
        Utils.extend(keypad, {
          attachInputEvents: function attachInputEvents() {
            keypad.$inputEl.on('click', onInputClick);
            if (keypad.params.inputReadOnly) {
              keypad.$inputEl.on('focus mousedown', onInputFocus);
            }
          },
          detachInputEvents: function detachInputEvents() {
            keypad.$inputEl.off('click', onInputClick);
            if (keypad.params.inputReadOnly) {
              keypad.$inputEl.off('focus mousedown', onInputFocus);
            }
          },
          attachHtmlEvents: function attachHtmlEvents() {
            app.on('click', onHtmlClick);
          },
          detachHtmlEvents: function detachHtmlEvents() {
            app.off('click', onHtmlClick);
          },
        });

        function onButtonClick($buttonEl) {
          if ($buttonEl.length === 0) { return; }
          var button = keypad.params.buttons[$buttonEl.index()];
          var buttonValue = button.value;
          var currentValue = keypad.value;

          if (keypad.params.type === 'numpad') {
            if (typeof currentValue === 'undefined') { currentValue = ''; }
            if ($buttonEl.hasClass('keypad-delete-button')) {
              currentValue = currentValue.substring(0, currentValue.length - 1);
            } else if (typeof buttonValue !== 'undefined') {
              if (buttonValue === '.' && currentValue.indexOf('.') >= 0) {
                buttonValue = '';
              }
              currentValue += buttonValue;
            }
            if (typeof currentValue !== 'undefined') { keypad.setValue(currentValue); }
          }
          if (keypad.params.type === 'calculator') {
            keypad.calculator(button.value);
            var $buttonsEl = keypad.$el.find('.keypad-buttons');
            $buttonsEl.find('.calc-operator-active').removeClass('calc-operator-active');
            if ($buttonEl.hasClass('calc-operator-button') && !$buttonEl.hasClass('calc-operator-button-equal')) {
              $buttonEl.addClass('calc-operator-active');
            }
          }
          keypad.emit('local::buttonClick keypadButtonClick', keypad, button);
          if (button.onClick) {
            button.onClick(keypad, button);
          }
        }
        function handleClick(e) {
          var $buttonEl = $(e.target).closest('.keypad-button');
          if (!$buttonEl.length) { return; }
          onButtonClick($buttonEl);
        }

        var $touchedButtonEl;
        var touchStarted;
        var touchMoved;
        var touchStartX;
        var touchStartY;
        var maxTouchDistance = 10;

        function handleTouchStart(e) {
          if (touchStarted || touchMoved) { return; }
          var $buttonEl = $(e.target).closest('.keypad-button');
          if (!$buttonEl.length) {
            return;
          }
          $touchedButtonEl = $buttonEl;
          touchStarted = true;
          touchStartX = e.targetTouches[0].pageX;
          touchStartY = e.targetTouches[0].pageY;
        }
        function handleTouchMove(e) {
          if (!touchStarted) { return; }
          var pageX = (e.targetTouches[0] || e.changedTouches[0]).pageX;
          var pageY = (e.targetTouches[0] || e.changedTouches[0]).pageY;
          if (Math.abs(pageX - touchStartX) > maxTouchDistance || Math.abs(pageY - touchStartY) > maxTouchDistance) {
            touchMoved = true;
          }
        }
        function handleTouchEnd() {
          if (!touchStarted) { return; }
          if (touchMoved) {
            touchStarted = false;
            touchMoved = false;
            return;
          }
          touchStarted = false;
          touchMoved = false;
          onButtonClick($touchedButtonEl);
        }

        keypad.attachKeypadEvents = function attachKeypadEvents() {
          var $buttonsEl = keypad.$el.find('.keypad-buttons');

          if (app.support.touch) {
            $buttonsEl.on(app.touchEvents.start, handleTouchStart);
            app.on('touchmove', handleTouchMove);
            app.on('touchend', handleTouchEnd);
          } else {
            $buttonsEl.on('click', handleClick);
          }

          keypad.detachKeypadEvents = function detachKeypadEvents() {
            if (app.support.touch) {
              $buttonsEl.off(app.touchEvents.start, handleTouchStart);
              app.off('touchmove', handleTouchMove);
              app.off('touchend', handleTouchEnd);
            } else {
              $buttonsEl.off('click', handleClick);
            }
          };
        };

        if ($inputEl && $inputEl.length) {
          $inputEl[0].f7Keypad = Keypad;
        }
        if ($containerEl && $containerEl.length) {
          $containerEl[0].f7Keypad = Keypad;
        }

        keypad.init();

        return keypad;
      }

      if ( Framework7Class ) Keypad.__proto__ = Framework7Class;
      Keypad.prototype = Object.create( Framework7Class && Framework7Class.prototype );
      Keypad.prototype.constructor = Keypad;

      Keypad.prototype.initInput = function initInput () {
        var keypad = this;
        if (!keypad.$inputEl) { return; }
        if (keypad.params.inputReadOnly) { keypad.$inputEl.prop('readOnly', true); }
      };

      Keypad.prototype.isPopover = function isPopover () {
        var keypad = this;
        var app = keypad.app;
        var modal = keypad.modal;
        var params = keypad.params;
        if (params.openIn === 'sheet') { return false; }
        if (modal && modal.type !== 'popover') { return false; }

        if (!keypad.inline && keypad.inputEl) {
          if (params.openIn === 'popover') { return true; }
          if (app.device.ios) {
            return !!app.device.ipad;
          }
          if (app.width >= 768) {
            return true;
          }
        }
        return false;
      };

      Keypad.prototype.calculator = function calculator (value) {
        var keypad = this;
        var operators = ('+ - = × ÷ ± %').split(' ');
        var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '.'];
        var reset = 'C';
        var invert = '±';
        var perc = '%';
        function calc() {
          var toEval = '';
          for (var i = 0; i < keypad.calcOperations.length; i += 1) {
            var operation = keypad.calcOperations[i];
            // eslint-disable-next-line
            if (i === keypad.calcOperations.length - 1 && operators.indexOf(operation) >= 0) ; else if (operation) {
              if (operation === '.') {
                operation = 0;
              }
              toEval += (("" + (operation.toString())))
                .replace('×', '*')
                .replace('÷', '/');
            }
          }
          toEval = toEval.replace(/--/g, '+');
          // eslint-disable-next-line
          keypad.setValue(eval.call(window, toEval));
        }
        if (!keypad.value) { keypad.value = 0; }
        if (value === reset) {
          keypad.setValue(0);
          keypad.calcValues = [];
          keypad.calcOperations = [];
          return;
        }
        if (numbers.indexOf(value) >= 0) {
          if (value === '.') {
            if (keypad.lastWasNumber && keypad.value.toString().indexOf('.') >= 0) { return; }
          }
          if (operators.indexOf(keypad.calcValues[keypad.calcValues.length - 1]) >= 0) {
            keypad.setValue(value);
          } else {
            keypad.setValue(keypad.value ? ("" + (keypad.value) + value) : value);
          }
          keypad.lastWasNumber = true;
        }
        if (operators.indexOf(value) >= 0) {
          if (value === invert) {
            if (keypad.value === '.') { return; }
            keypad.setValue(-1 * keypad.value);
            keypad.lastWasNumber = true;
          } else if (value === perc) {
            if (keypad.calcOperations[keypad.calcOperations.length - 2]) {
              var percents = keypad.value / 100;
              keypad.setValue(keypad.calcOperations[keypad.calcOperations.length - 2] * percents);
            }
            keypad.lastWasNumber = true;
          } else {
            var lastOperation = keypad.calcOperations[keypad.calcOperations.length - 1];
            if (value === '=') {
              if (keypad.calcOperations[keypad.calcOperations.length - 1] === '=') {
                if (keypad.calcOperations.length < 2) { return; }
                keypad.calcOperations.pop();
                var val1 = keypad.calcOperations[keypad.calcOperations.length - 2];
                var val2 = keypad.calcOperations[keypad.calcOperations.length - 1];
                keypad.calcOperations.push(val1);
                keypad.calcOperations.push(val2);
              } else {
                keypad.calcOperations.push(keypad.value);
              }
              keypad.calcOperations.push('=');
              calc();
            } else if (['-', '+', '×', '÷', '='].indexOf(lastOperation) >= 0) {
              if (lastOperation === '=') {
                keypad.calcOperations = [keypad.value, value];
              }
              if (['-', '+', '×', '÷'].indexOf(lastOperation) >= 0) {
                if (keypad.lastWasNumber) {
                  if (['-', '+'].indexOf(lastOperation) >= 0 && ['×', '÷'].indexOf(value) >= 0) {
                    keypad.calcOperations.push(keypad.value);
                    keypad.calcOperations.push(value);
                  } else {
                    keypad.calcOperations.push(keypad.value);
                    keypad.calcOperations.push(value);
                    calc();
                  }
                } else {
                  keypad.calcOperations[keypad.calcOperations.length - 1] = value;
                }
              }
            } else {
              keypad.calcOperations.push(keypad.value);
              keypad.calcOperations.push(value);
              calc();
            }
            keypad.lastWasNumber = false;
          }
        }
        if (value !== invert && value !== perc) { keypad.calcValues.push(value); }
      };

      Keypad.prototype.formatValue = function formatValue (value) {
        var keypad = this;
        if (keypad.params.formatValue) { return keypad.params.formatValue.call(keypad, value); }
        return value;
      };

      Keypad.prototype.setValue = function setValue (value) {
        var keypad = this;
        keypad.updateValue(value);
      };

      Keypad.prototype.getValue = function getValue () {
        var keypad = this;
        return keypad.value;
      };

      Keypad.prototype.updateValue = function updateValue (newValue) {
        var keypad = this;
        keypad.value = newValue;
        if (keypad.params.valueMaxLength && keypad.value.length > keypad.params.valueMaxLength) {
          keypad.value = keypad.value.substring(0, keypad.params.valueMaxLength);
        }
        keypad.emit('local::change keypadChange', keypad, keypad.value);
        if (keypad.$inputEl && keypad.$inputEl.length > 0) {
          keypad.$inputEl.val(keypad.formatValue(keypad.value));
          keypad.$inputEl.trigger('change');
        }
      };

      Keypad.prototype.renderButtons = function renderButtons () {
        var keypad = this;
        var buttonsHTML = '';
        var buttonClass;
        var button;
        for (var i = 0; i < keypad.params.buttons.length; i += 1) {
          button = keypad.params.buttons[i];
          buttonClass = 'keypad-button';
          if (button.dark) { buttonClass += ' keypad-button-dark'; }
          if (button.cssClass) { buttonClass += " " + (button.cssClass); }
          buttonsHTML += "<span class=\"" + buttonClass + "\">" + (button.html || '') + "</span>";
        }
        return buttonsHTML;
      };

      Keypad.prototype.renderToolbar = function renderToolbar () {
        var keypad = this;
        if (keypad.params.renderToolbar) { return keypad.params.renderToolbar.call(keypad, keypad); }

        var toolbarHtml = "\n        <div class=\"toolbar\">\n          <div class=\"toolbar-inner\">\n            <div class=\"left\"></div>\n            <div class=\"right\">\n              <a href=\"#\" class=\"link sheet-close popover-close\">" + (keypad.params.toolbarCloseText) + "</a>\n            </div>\n          </div>\n        </div>\n      ";
        return toolbarHtml.trim();
      };

      Keypad.prototype.renderSheet = function renderSheet () {
        var keypad = this;
        if (keypad.params.renderSheet) { return keypad.params.renderSheet.call(keypad, keypad); }
        var ref = keypad.params;
        var cssClass = ref.cssClass;
        var toolbar = ref.toolbar;

        var sheetHtml = "\n        <div class=\"sheet-modal keypad keypad-sheet keypad-type-" + (keypad.params.type) + " " + (cssClass || '') + "\">\n          " + (toolbar ? keypad.renderToolbar() : '') + "\n          <div class=\"sheet-modal-inner keypad-buttons\">\n            " + (keypad.renderButtons()) + "\n          </div>\n        </div>\n      ";

        return sheetHtml;
      };

      Keypad.prototype.renderPopover = function renderPopover () {
        var keypad = this;
        if (keypad.params.renderPopover) { return keypad.params.renderPopover.call(keypad, keypad); }
        var ref = keypad.params;
        var cssClass = ref.cssClass;
        var toolbar = ref.toolbar;
        var popoverHtml = ("\n        <div class=\"popover keypad-popover\">\n          <div class=\"popover-inner\">\n            <div class=\"keypad keypad-type-" + (keypad.params.type) + " " + (cssClass || '') + "\">\n              " + (toolbar ? keypad.renderToolbar() : '') + "\n              <div class=\"keypad-buttons\">\n                " + (keypad.renderButtons()) + "\n              </div>\n            </div>\n          </div>\n        </div>\n      ").trim();

        return popoverHtml;
      };

      Keypad.prototype.renderInline = function renderInline () {
        var keypad = this;
        if (keypad.params.renderInline) { return keypad.params.renderInline.call(keypad, keypad); }
        var ref = keypad.params;
        var cssClass = ref.cssClass;
        var toolbar = ref.toolbar;

        var inlineHtml = "\n        <div class=\"keypad keypad-inline keypad-type-" + (keypad.params.type) + " " + (cssClass || '') + "\">\n          " + (toolbar ? keypad.renderToolbar() : '') + "\n          <div class=\"keypad-buttons\">\n            " + (keypad.renderButtons()) + "\n          </div>\n        </div>\n      ";

        return inlineHtml;
      };

      Keypad.prototype.render = function render () {
        var keypad = this;
        var params = keypad.params;
        if (params.render) { return params.render.call(keypad); }
        if (!keypad.inline) {
          var modalType = params.openIn;
          if (modalType === 'auto') { modalType = keypad.isPopover() ? 'popover' : 'sheet'; }

          if (modalType === 'popover') { return keypad.renderPopover(); }
          if (modalType === 'sheet') { return keypad.renderSheet(); }
        }
        return keypad.renderInline();
      };

      Keypad.prototype.onOpen = function onOpen () {
        var keypad = this;
        var initialized = keypad.initialized;
        var $el = keypad.$el;
        var app = keypad.app;
        var $inputEl = keypad.$inputEl;
        var inline = keypad.inline;
        var value = keypad.value;
        var params = keypad.params;
        keypad.opened = true;

        // Init main events
        keypad.attachKeypadEvents();

        // Set value
        if (!initialized) {
          if (value) { keypad.setValue(value); }
          else if (params.value) {
            keypad.setValue(params.value);
          }
        } else if (value) {
          keypad.setValue(value);
        }

        // Extra focus
        if (!inline && $inputEl.length && app.theme === 'md') {
          $inputEl.trigger('focus');
        }

        keypad.initialized = true;

        // Trigger events
        if ($el) {
          $el.trigger('keypad:open', keypad);
        }
        if ($inputEl) {
          $inputEl.trigger('keypad:open', keypad);
        }
        keypad.emit('local::open keypadOpen', keypad);
      };

      Keypad.prototype.onOpened = function onOpened () {
        var keypad = this;
        if (keypad.$el) {
          keypad.$el.trigger('keypad:opened', keypad);
        }
        if (keypad.$inputEl) {
          keypad.$inputEl.trigger('keypad:opened', keypad);
        }
        keypad.emit('local::opened keypadOpened', keypad);
      };

      Keypad.prototype.onClose = function onClose () {
        var keypad = this;
        var app = keypad.app;

        if (keypad.$inputEl && app.theme === 'md') {
          keypad.$inputEl.trigger('blur');
        }
        if (keypad.detachKeypadEvents) {
          keypad.detachKeypadEvents();
        }

        if (keypad.$el) {
          keypad.$el.trigger('keypad:close', keypad);
        }
        if (keypad.$inputEl) {
          keypad.$inputEl.trigger('keypad:close', keypad);
        }
        keypad.emit('local::close keypadClose', keypad);
      };

      Keypad.prototype.onClosed = function onClosed () {
        var keypad = this;
        keypad.opened = false;

        if (!keypad.inline) {
          keypad.app.utils.nextTick(function () {
            if (keypad.modal && keypad.modal.el && keypad.modal.destroy) {
              if (!keypad.params.routableModals) {
                keypad.modal.destroy();
              }
            }
            delete keypad.modal;
          });
        }
        if (keypad.$el) {
          keypad.$el.trigger('keypad:closed', keypad);
        }
        if (keypad.$inputEl) {
          keypad.$inputEl.trigger('keypad:closed', keypad);
        }
        keypad.emit('local::closed keypadClosed', keypad);
      };

      Keypad.prototype.open = function open () {
        var obj;

        var keypad = this;
        var app = keypad.app;
        var opened = keypad.opened;
        var inline = keypad.inline;
        var $inputEl = keypad.$inputEl;
        var params = keypad.params;
        if (opened) { return; }

        if (inline) {
          keypad.$el = app.$(keypad.render());
          keypad.$el[0].f7Keypad = keypad;
          keypad.$containerEl.append(keypad.$el);
          keypad.onOpen();
          keypad.onOpened();
          return;
        }
        var modalType = params.openIn;
        if (modalType === 'auto') {
          modalType = keypad.isPopover() ? 'popover' : 'sheet';
        }
        var modalContent = keypad.render();

        var modalParams = {
          targetEl: $inputEl,
          scrollToEl: keypad.params.scrollToInput ? $inputEl : undefined,
          content: modalContent,
          backdrop: typeof keypad.params.backdrop === 'undefined' ? modalType !== 'sheet' : keypad.params.backdrop,
          on: {
            open: function open() {
              var modal = this;
              keypad.modal = modal;
              keypad.$el = modalType === 'popover' ? modal.$el.find('.keypad') : modal.$el;
              keypad.$el[0].f7Keypad = keypad;
              keypad.onOpen();
            },
            opened: function opened() { keypad.onOpened(); },
            close: function close() { keypad.onClose(); },
            closed: function closed() { keypad.onClosed(); },
          },
        };
        if (keypad.params.routableModals) {
          keypad.view.router.navigate({
            url: keypad.url,
            route: ( obj = {
              path: keypad.url
            }, obj[modalType] = modalParams, obj ),
          });
        } else {
          keypad.modal = app[modalType].create(modalParams);
          keypad.modal.open();
        }
      };

      Keypad.prototype.close = function close () {
        var keypad = this;
        var opened = keypad.opened;
        var inline = keypad.inline;
        if (!opened) { return; }
        if (inline) {
          keypad.onClose();
          keypad.onClosed();
          return;
        }
        if (keypad.params.routableModals) {
          keypad.view.router.back();
        } else {
          keypad.modal.close();
        }
      };

      Keypad.prototype.init = function init () {
        var keypad = this;
        keypad.initInput();

        if (keypad.inline) {
          keypad.open();
          keypad.emit('local::init keypadInit', keypad);
          return;
        }

        if (!keypad.initialized && keypad.params.value) {
          keypad.setValue(keypad.params.value);
        }

        // Attach input Events
        if (keypad.$inputEl) {
          keypad.attachInputEvents();
        }
        if (keypad.params.closeByOutsideClick) {
          keypad.attachHtmlEvents();
        }
        keypad.emit('local::init keypadInit', keypad);
      };

      Keypad.prototype.destroy = function destroy () {
        var keypad = this;
        if (keypad.destroyed) { return; }
        var $el = keypad.$el;
        keypad.emit('local::beforeDestroy keypadBeforeDestroy', keypad);
        if ($el) { $el.trigger('keypad:beforedestroy', keypad); }

        keypad.close();

        // Detach Events
        if (keypad.$inputEl) {
          keypad.detachInputEvents();
        }
        if (keypad.params.closeByOutsideClick) {
          keypad.detachHtmlEvents();
        }

        if ($el && $el.length) { delete keypad.$el[0].f7Keypad; }
        keypad.app.utils.deleteProps(keypad);
        keypad.destroyed = true;
      };

      return Keypad;
    }(Framework7Class));
  }

  var Keypad;
  var Keypad$1 = {
    name: 'keypad',
    install: function install() {
      var Framework7 = this;
      Keypad = KeypadClassConstructor(Framework7.Class);
      Framework7.Keypad = Keypad;
    },
    params: {
      keypad: {
        type: 'numpad', // or 'calculator' or 'custom',
        openIn: 'auto', // or 'popover' or 'sheet'
        backdrop: undefined,
        inputEl: null,
        containerEl: null,
        value: null,
        valueMaxLength: null,
        dotButton: true,
        dotCharacter: '.',
        buttons: [],
        closeByOutsideClick: true,
        scrollToInput: true,
        inputReadOnly: true,
        onlyInPopover: false,
        cssClass: null,
        toolbar: true,
        toolbarCloseText: '完成',
        routableModals: true,
        view: null,
        url: 'select/',
        renderToolbar: null,
        renderPopover: null,
        renderSheet: null,
        renderInline: null,
        render: null,
      },
    },
    create: function create() {
      var app = this;
      var $ = app.$;
      app.keypad = {
        create: function create(params) {
          return new Keypad(app, params);
        },
        get: function get(el) {
          if ( el === void 0 ) el = '.keypad';

          if (el instanceof Keypad) { return el; }
          var $el = $(el);
          if ($el.length === 0) { return undefined; }
          return $el[0].f7Keypad;
        },
        destroy: function destroy(el) {
          if ( el === void 0 ) el = '.keypad';

          var instance = app.keypad.get(el);
          if (instance && instance.destroy) { return instance.destroy(); }
          return undefined;
        },
        close: function close(el) {
          if ( el === void 0 ) el = '.keypad';

          var $el = $(el);
          if ($el.length === 0) { return; }
          var keypad = $el[0].f7Keypad;
          if (!keypad || (keypad && !keypad.opened)) { return; }
          keypad.close();
        },
      };
    },
    on: {
      pageInit: function pageInit(page) {
        var $ = page.app.$;
        var app = page.app;
        page.$el.find('input[type="numpad"], input[type="calculator"]').each(function (index, inputEl) {
          var $inputEl = $(inputEl);
          var params = {
            inputEl: inputEl,
            type: $inputEl.attr('type'),
            value: $inputEl.val() || 0,
          };
          if ($inputEl.attr('maxlength')) { params.valueMaxLength = $inputEl.attr('maxlength'); }
          app.keypad.create(app.utils.extend(params, $inputEl.dataset()));
        });
      },
      pageBeforeRemove: function pageBeforeRemove(page) {
        page.$el.find('input[type="numpad"], input[type="calculator"]').each(function (index, inputEl) {
          page.app.keypad.destroy(inputEl);
        });
      },
    },
  };

  var Panels3d = {
    enable: function enable() {
      var app = this;
      app.panels3d.enabled = true;
      app.$('html').addClass('with-panels-3d');
    },
    disable: function disable() {
      var app = this;
      app.panels3d.enabled = false;
      app.$('html').removeClass('with-panels-3d');
    },
    onLeftPanelOpen: function onLeftPanelOpen() {
      var app = this;
      if (!app.panels3d.enabled) { return; }
      app.root.children('.views, .view').css({
        '-webkit-transform-origin': '100% center',
        'transform-origin': '100% center',
      });
    },
    onRightPanelOpen: function onRightPanelOpen() {
      var app = this;
      if (!app.panels3d.enabled) { return; }
      app.root.children('.views, .view').css({
        '-webkit-transform-origin': '0% center',
        'transform-origin': '0% center',
      });
    },
    onPanelSwipeOpen: function onPanelSwipeOpen(panel) {
      var app = this;
      panel.panels3dWidth = panel.el.offsetWidth; // eslint-disable-line
      panel.panels3dView = app.root.children('.view, .views'); // eslint-disable-line
    },
    onPanelSwipe: function onPanelSwipe(panel, percentage) {
      var panelWidth = panel.panels3dWidth;
      var $viewEl = panel.panels3dView;

      if (panel.side === 'left') {
        $viewEl.transform(("translate3d(" + (panelWidth * percentage) + "px,0,0) rotateY(" + (-30 * percentage) + "deg)"));
        $viewEl.css({
          '-webkit-transform-origin': '100% center',
          'transform-origin': '100% center',
        });
        panel.$el.transform(("translate3d(" + (-panelWidth * (1 - percentage)) + "px,0,0)"));
      }
      if (panel.side === 'right') {
        $viewEl.transform(("translate3d(" + (-panelWidth * percentage) + "px,0,0) rotateY(" + (30 * percentage) + "deg)"));
        $viewEl.css({
          '-webkit-transform-origin': '0% center',
          'transform-origin': '0% center',
        });
        panel.$el.transform(("translate3d(" + (panelWidth * (1 - percentage)) + "px,0,0)"));
      }
    },
  };

  var Panel3D = {
    name: 'panels3d',
    params: {
      panels3d: {
        enabled: false,
      },
    },
    create: function create() {
      var app = this;

      app.panels3d = {
        enabled: app.params.panels3d.enabled,
        enable: Panels3d.enable.bind(app),
        disable: Panels3d.disable.bind(app),
        onLeftPanelOpen: Panels3d.onLeftPanelOpen.bind(app),
        onRightPanelOpen: Panels3d.onRightPanelOpen.bind(app),
        onPanelSwipe: Panels3d.onPanelSwipe.bind(app),
        onPanelSwipeOpen: Panels3d.onPanelSwipeOpen.bind(app),
      };
    },
    on: {
      init: function init() {
        var app = this;
        if (app.params.panels3d.enabled) {
          app.panels3d.enable();
        }
      },
      panelOpen: function panelOpen(panel) {
        var app = this;
        if (!app.panels3d.enabled) { return; }
        if (panel.effect !== 'reveal') { return; }
        if (panel.side === 'left') { app.panels3d.onLeftPanelOpen(); }
        else { app.panels3d.onRightPanelOpen(); }
      },
      panelSwipeOpen: function panelSwipeOpen(panel) {
        var app = this;
        if (!app.panels3d.enabled) { return; }
        if (panel.effect !== 'reveal') { return; }
        app.panels3d.onPanelSwipeOpen(panel);
      },
      panelSwipe: function panelSwipe(panel, percentage) {
        var app = this;
        if (!app.panels3d.enabled) { return; }
        if (panel.effect !== 'reveal') { return; }
        app.panels3d.onPanelSwipe(panel, percentage);
      },
    },
  };

  {
    if (typeof window !== 'undefined') {
      // Template7
      if (!window.Template7) { window.Template7 = Template7; }

      // Dom7
      if (!window.Dom7) { window.Dom7 = $; }
    }
  }

  // Install Core Modules & Components
  Router.use([ //NO_LITE
    RouterTemplateLoaderModule, //NO_LITE
    RouterComponentLoaderModule ]); //NO_LITE

  Framework7.use([
    DeviceModule,
    SupportModule,
    UtilsModule,
    ResizeModule,
    RequestModule,
    TouchModule,
    ClicksModule,
    RouterModule,
    HistoryModule,
    ComponentModule, //NO_LITE
    ServiceWorkerModule,
    Statusbar$1,
    View$1,
    Navbar$1,
    Toolbar$1,
    Subnavbar,
    TouchRipple$1,
    Modal$1,
    Keypad$1,
    Panel3D ]);

  return Framework7;

})));
