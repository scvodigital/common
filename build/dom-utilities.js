import * as Querystring from 'querystring';
import { Bristles } from 'bristles';
export function DomManipulator(rules, root, data) {
    if (rules.addClasses) {
        rulesIterator(rules.addClasses, root, data, function (element, classes) {
            for (var _i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
                var className = classes_1[_i];
                className = Bristles.compile(className)(data);
                element.addClass(className);
            }
        });
    }
    if (rules.removeClasses) {
        rulesIterator(rules.removeClasses, root, data, function (element, classes) {
            for (var _i = 0, classes_2 = classes; _i < classes_2.length; _i++) {
                var className = classes_2[_i];
                className = Bristles.compile(className)(data);
                element.removeClass(className);
            }
        });
    }
    if (rules.attributes) {
        rulesIterator(rules.attributes, root, data, function (element, attributes) {
            for (var _i = 0, _a = Object.entries(attributes); _i < _a.length; _i++) {
                var _b = _a[_i], attribute = _b[0], value = _b[1];
                if (value === null) {
                    element.removeAttr(attribute);
                }
                else {
                    var renderedValue = Bristles.compile(value)(data);
                    element.attr(attribute, renderedValue);
                }
            }
        });
    }
    if (rules.contents) {
        rulesIterator(rules.contents, root, data, function (element, contents) {
            var renderedContents = Bristles.compile(contents)(data);
            element.html(renderedContents);
        });
    }
    if (rules.styles) {
        rulesIterator(rules.styles, root, data, function (element, styles) {
            for (var _i = 0, _a = Object.entries(styles); _i < _a.length; _i++) {
                var _b = _a[_i], property = _b[0], value = _b[1];
                if (value === null) {
                    element.css(property, 'initial');
                }
                else {
                    var renderedValue = Bristles.compile(value)(data);
                    element.css(property, renderedValue);
                }
            }
        });
    }
    if (rules.deleteElements) {
        rulesIterator(rules.deleteElements, root, data, function (element) {
            element.remove();
        });
    }
    if (rules.createElements) {
        rulesIterator(rules.createElements, root, data, function (element, config) {
            var renderedHtml = Bristles.compile(config.template)(data);
            var newElement = $(renderedHtml);
            switch (config.where || 'beforeEnd') {
                case ('beforeStart'):
                    newElement.insertBefore(element);
                    break;
                case ('afterStart'):
                    element.prepend(newElement);
                    break;
                case ('afterEnd'):
                    newElement.insertAfter(element);
                    break;
                default:
                    element.append(newElement);
            }
        });
    }
    if (rules.delayed) {
        var _loop_1 = function (delayedRules) {
            var delay = Number(delayedRules.delay) || 0;
            setTimeout(function () {
                DomManipulator(delayedRules.rules, root, data);
            }, delay);
        };
        for (var _i = 0, _a = rules.delayed; _i < _a.length; _i++) {
            var delayedRules = _a[_i];
            _loop_1(delayedRules);
        }
    }
    if (rules.run) {
        var functionCodes = Array.isArray(rules.run) ? rules.run : [rules.run];
        for (var _b = 0, functionCodes_1 = functionCodes; _b < functionCodes_1.length; _b++) {
            var functionCode = functionCodes_1[_b];
            try {
                var func = safeEval(functionCode);
                func.apply(data);
            }
            catch (err) {
                console.error('Failed to safely evaluate Dom Manipulator rule', err);
            }
        }
    }
    if (rules.focus && $(rules.focus)) {
        $(rules.focus)[0].focus();
    }
    function safeEval(fn) {
        return new Function('"use strict"; return ' + fn + ';');
    }
}
function rulesIterator(items, root, context, callback) {
    var isArray = Array.isArray(items);
    var collection = isArray ? items : Object.keys(items);
    var _loop_2 = function (selector) {
        var data = isArray ? null : items[selector];
        var renderedSelector = Bristles.compile(selector)(context);
        var elements = renderedSelector === '>' ? root :
            renderedSelector.startsWith('>') ? root.find(renderedSelector.substr(1)) :
                renderedSelector === '<' ? root.parent() :
                    renderedSelector.startsWith('<') ? root.parents(renderedSelector.substr(1)) :
                        $(renderedSelector);
        elements.each(function (i, o) {
            callback($(o), data);
        });
    };
    for (var _i = 0, collection_1 = collection; _i < collection_1.length; _i++) {
        var selector = collection_1[_i];
        _loop_2(selector);
    }
}
var objectPathCache = {};
export function DomReader(rules, root) {
    var output = {};
    for (var _i = 0, _a = Object.entries(rules); _i < _a.length; _i++) {
        var _b = _a[_i], name_1 = _b[0], rule = _b[1];
        var value = void 0;
        if (rule.selector === 'window') {
            value = objectPath(window, rule.attribute);
        }
        else {
            var elements = rule.selector === '>' ? root :
                rule.selector.startsWith('>') ? root.find(rule.selector.substr(1)) :
                    rule.selector === '<' ? root.parent() :
                        rule.selector.startsWith('<') ? root.parents(rule.selector.substr(1)) :
                            $(rule.selector);
            if (elements.length === 0)
                continue;
            switch (rule.attribute) {
                case ('$serializedObject'):
                    value = Querystring.parse(elements.serialize());
                    break;
                case ('$serializedQuerystring'):
                    value = elements.serialize();
                    break;
                case ('$html'):
                    value = elements.html();
                    break;
                case ('$text'):
                    value = elements.text();
                    break;
                default:
                    value = elements.attr(rule.attribute);
            }
        }
        if (typeof value !== 'undefined') {
            if (Array.isArray(value) && !rule.array) {
                output[name_1] = value[0];
            }
            else {
                output[name_1] = value;
            }
        }
        else if (rule.default) {
            output[name_1] = rule.default;
        }
    }
    return output;
    function objectPath(obj, path) {
        if (!objectPathCache.hasOwnProperty(path)) {
            objectPathCache[path] = new Function("obj", "return obj." + path + ";");
        }
        var resolved = objectPathCache[path](obj);
        return resolved;
    }
}
//# sourceMappingURL=dom-utilities.js.map