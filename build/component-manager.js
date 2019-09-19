var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
require('material-design-lite');
require('./components.scss');
var ComponentManager = /** @class */ (function () {
    function ComponentManager(components) {
        this.components = {};
        this.componentRegistry = {};
        this.clock = window.requestAnimationFrame(this.tick.bind(this));
        this.mdlSelectorComponentMap = {
            '.mdl-js-button': 'MaterialButton',
            '.mdl-js-checkbox': 'MaterialCheckbox',
            '.mdl-js-data-table  ': 'MaterialDataTable',
            '.mdl-js-icon-toggle': 'MaterialIconToggle',
            '.mdl-js-layout': 'MaterialLayout',
            '.mdl-js-menu': 'MaterialMenu',
            '.mdl-js-progress': 'MaterialProgress',
            '.mdl-js-radio': 'MaterialRadio',
            '.mdl-js-slider': 'MaterialSlider',
            '.mdl-js-snackbar': 'MaterialSnackbar',
            '.mdl-js-spinner': 'MaterialSpinner',
            '.mdl-js-switch': 'MaterialSwitch',
            '.mdl-js-ripple-effect': 'MaterialRipple',
            '.mdl-js-tabs': 'MaterialTabs',
            '.mdl-tabs__tab': 'MaterialTab',
            '.mdl-layout__tab': 'MaterialLayoutTab',
            '.mdl-js-textfield': 'MaterialTextfield',
            '.mdl-tooltip': 'MaterialTooltip'
        };
        this.updateRequested = false;
        for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
            var component = components_1[_i];
            this.components[component.name] = component;
        }
    }
    ComponentManager.prototype.registerComponents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var componentElements, _i, componentElements_1, componentElement, typeNames, _a, _b, typeName, uid, type, component;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        componentHandler.upgradeDom();
                        componentElements = Array.from($('[data-component]')).map(function (item) { return $(item); });
                        _i = 0, componentElements_1 = componentElements;
                        _c.label = 1;
                    case 1:
                        if (!(_i < componentElements_1.length)) return [3 /*break*/, 6];
                        componentElement = componentElements_1[_i];
                        typeNames = componentElement.data('component') || '';
                        _a = 0, _b = typeNames.split(',');
                        _c.label = 2;
                    case 2:
                        if (!(_a < _b.length)) return [3 /*break*/, 5];
                        typeName = _b[_a];
                        if (!this.components.hasOwnProperty(typeName))
                            throw new Error('Invalid component name: ' + typeName);
                        uid = componentElement.data(typeName + '-uid');
                        if (uid)
                            return [3 /*break*/, 4];
                        type = this.components[typeName];
                        component = new type(componentElement, this);
                        return [4 /*yield*/, component.init()];
                    case 3:
                        _c.sent();
                        this.componentRegistry[component.uid] = component;
                        _c.label = 4;
                    case 4:
                        _a++;
                        return [3 /*break*/, 2];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        componentHandler.upgradeDom();
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype.unregisterComponents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, component, _loop_1, _b, _c, _d, selector, componentName;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _i = 0, _a = Object.values(this.componentRegistry);
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        component = _a[_i];
                        return [4 /*yield*/, component.destroy()];
                    case 2:
                        _e.sent();
                        _e.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.componentRegistry = {};
                        _loop_1 = function (selector, componentName) {
                            var elements = $(selector);
                            elements.each(function (index, element) {
                                if (element.hasOwnProperty(componentName)) {
                                    componentHandler.downgradeElements(element);
                                }
                            });
                        };
                        for (_b = 0, _c = Object.entries(this.mdlSelectorComponentMap); _b < _c.length; _b++) {
                            _d = _c[_b], selector = _d[0], componentName = _d[1];
                            _loop_1(selector, componentName);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ComponentManager.prototype.requestUpdate = function () {
        this.updateRequested = true;
    };
    ComponentManager.prototype.tick = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        window.cancelAnimationFrame(this.clock);
                        if (!this.updateRequested) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.registerComponents()];
                    case 1:
                        _a.sent();
                        this.updateRequested = false;
                        _a.label = 2;
                    case 2:
                        this.clock = window.requestAnimationFrame(this.tick.bind(this));
                        return [2 /*return*/];
                }
            });
        });
    };
    return ComponentManager;
}());
export { ComponentManager };
//# sourceMappingURL=component-manager.js.map