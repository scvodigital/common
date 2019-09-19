var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { BaseComponent } from "./base-component";
import { DomManipulator } from '../dom-utilities';
// tslint:disable-next-line: no-implicit-dependencies
require('imports-loader?define=>false!typeahead.js/dist/typeahead.jquery.min.js');
// tslint:disable-next-line: no-implicit-dependencies
var Bloodhound = require('imports-loader?define=>false!typeahead.js/dist/bloodhound.min.js');
export var BloodhoundTokenizers = {
    nonword: Bloodhound.tokenizers.nonword,
    whitespace: Bloodhound.tokenizers.whitespace,
    objNonword: Bloodhound.tokenizers.obj.nonword,
    objWhitespace: Bloodhound.tokenizers.obj.whitespace
};
var Typeahead = /** @class */ (function (_super) {
    __extends(Typeahead, _super);
    function Typeahead() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.autocompleted = false;
        _this.datasets = {};
        _this.textbox = _this.element.find('input');
        return _this;
    }
    Typeahead.prototype.isLocked = function () {
        return this.element.hasClass('typeahead-locked');
    };
    Typeahead.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setupTypeahead();
                return [2 /*return*/];
            });
        });
    };
    Typeahead.prototype.setupTypeahead = function () {
        var _this = this;
        var typeaheadArgs = [this.config.typeaheadOptions || {}];
        this.config.datasets = this.config.datasets.filter(Boolean);
        for (var _i = 0, _a = this.config.datasets; _i < _a.length; _i++) {
            var dataset = _a[_i];
            if (dataset.bloodhound.local) {
                for (var _b = 0, _c = dataset.bloodhound.local; _b < _c.length; _b++) {
                    var item = _c[_b];
                    item.datasetName = dataset.name;
                }
            }
            var datumTokenizerField = dataset.bloodhound.datumTokenizerField;
            var bloodhoundOptions = {
                datumTokenizer: datumTokenizerField ?
                    BloodhoundTokenizers[dataset.bloodhound.datumTokenizer](datumTokenizerField) :
                    BloodhoundTokenizers[dataset.bloodhound.datumTokenizer],
                queryTokenizer: BloodhoundTokenizers[dataset.bloodhound.queryTokenizer],
                local: dataset.bloodhound.local ? dataset.bloodhound.local.filter(Boolean) : [],
                initialize: dataset.bloodhound.hasOwnProperty('initialize') ? dataset.bloodhound.initialize : true,
                sufficient: dataset.bloodhound.sufficient || 5,
                prefetch: dataset.bloodhound.prefetch || undefined,
                remote: dataset.bloodhound.remote || undefined
            };
            var engine = new Bloodhound(bloodhoundOptions);
            dataset.source = engine;
            typeaheadArgs.push(dataset);
            this.datasets[dataset.name] = dataset;
        }
        this.typeahead = this.textbox.typeahead.apply(this.textbox, typeaheadArgs);
        this.typeahead
            .on('typeahead:select', function (ev, suggestion) {
            _this.autocompleted = true;
            _this.typeaheadSelect(ev, suggestion);
        })
            .on('typeahead:autocomplete', function (ev, suggestion) {
            _this.autocompleted = true;
            _this.typeaheadSelect(ev, suggestion);
        })
            .on('keydown', function (ev) {
            switch (ev.keyCode) {
                case (9):
                    if (_this.autocompleted) {
                        ev.preventDefault();
                    }
                    else {
                        _this.nothingSelected();
                    }
                    break;
                case (13):
                    if (_this.autocompleted) {
                        ev.preventDefault();
                    }
                    else {
                        _this.nothingSelected();
                    }
                    break;
            }
            _this.autocompleted = false;
        })
            .on('blur', function (ev) {
            if (!_this.autocompleted) {
                _this.nothingSelected();
            }
        });
    };
    Typeahead.prototype.typeaheadSelect = function (event, suggestion) {
        if (this.config.itemSelectedRules) {
            var dataset = this.datasets[suggestion.datasetName] || null;
            var context = {
                event: event,
                suggestion: suggestion,
                dataset: dataset,
                window: window,
                $: $,
                instance: this
            };
            DomManipulator(this.config.itemSelectedRules, this.element, context);
        }
    };
    Typeahead.prototype.nothingSelected = function () {
        console.log('Nothing selected');
        if (this.config.nothingSelectedRules && !this.isLocked) {
            var context = {
                event: event,
                window: window,
                $: $,
                instance: this
            };
            DomManipulator(this.config.nothingSelectedRules, this.element, context);
        }
    };
    return Typeahead;
}(BaseComponent));
export { Typeahead };
//# sourceMappingURL=typeahead.js.map