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
require('leaflet');
require('leaflet.markercluster');
// tslint:disable-next-line: no-import-side-effect
import 'mapbox.js';
import { BaseComponent } from "./base-component";
var L = window.L;
var defaultIcon = L.icon({
    iconRetinaUrl: require('../../node_modules/leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('../../node_modules/leaflet/dist/images/marker-icon.png'),
    iconAnchor: [13, 41],
    shadowUrl: require('../../node_modules/leaflet/dist/images/marker-shadow.png')
});
L.Marker.prototype.options.icon = defaultIcon;
var LeafletMap = /** @class */ (function (_super) {
    __extends(LeafletMap, _super);
    function LeafletMap(element, componentManager) {
        var _this = _super.call(this, element, componentManager) || this;
        _this.featureGroups = [];
        _this.map = L.map(_this.element[0], _this.config.mapOptions);
        _this.map.setView(_this.config.initialLatLng, _this.config.initialZoom);
        var osmAttrib = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
        L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
            attribution: osmAttrib,
            minZoom: 5,
            maxZoom: 17,
            opacity: 0.9
        }).addTo(_this.map);
        L.control.scale().addTo(_this.map);
        return _this;
    }
    LeafletMap.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bounds, _i, _a, featureGroupConfig, featureGroup, _b, _c, featureConfig, feature, groupBounds, _d, _e, markerClusterGroupConfig, markerClusterGroup, _f, _g, markerConfig, marker, groupBounds;
            return __generator(this, function (_h) {
                if (this.config.featureGroups) {
                    for (_i = 0, _a = this.config.featureGroups; _i < _a.length; _i++) {
                        featureGroupConfig = _a[_i];
                        featureGroup = new L.FeatureGroup(undefined, featureGroupConfig.options);
                        for (_b = 0, _c = featureGroupConfig.features; _b < _c.length; _b++) {
                            featureConfig = _c[_b];
                            feature = void 0;
                            switch (featureConfig.type) {
                                case ('Rectangle'):
                                    feature = new L.Rectangle(featureConfig.latLngBounds, featureConfig.options);
                                    break;
                                case ('Circle'):
                                    feature = new L.Circle(featureConfig.latLng, featureConfig.options);
                                    break;
                                case ('Polygon'):
                                    feature = new L.Polygon(featureConfig.latLngs, featureConfig.options);
                                    break;
                                case ('Marker'):
                                    if (featureConfig.options.icon) {
                                        featureConfig.options.icon = L.icon(featureConfig.options.icon);
                                    }
                                    feature = new L.Marker(featureConfig.latLng, featureConfig.options);
                                    break;
                            }
                            if (feature) {
                                if (featureConfig.popupContent) {
                                    feature.bindPopup(featureConfig.popupContent);
                                }
                                featureGroup.addLayer(feature);
                            }
                        }
                        this.map.addLayer(featureGroup);
                        if (featureGroupConfig.boundToThis) {
                            groupBounds = featureGroup.getBounds();
                            if (!bounds) {
                                bounds = groupBounds;
                            }
                            else {
                                bounds.extend(groupBounds);
                            }
                        }
                    }
                }
                if (this.config.markerClusterGroups) {
                    for (_d = 0, _e = this.config.markerClusterGroups; _d < _e.length; _d++) {
                        markerClusterGroupConfig = _e[_d];
                        markerClusterGroup = new L.markerClusterGroup(markerClusterGroupConfig.options);
                        for (_f = 0, _g = markerClusterGroupConfig.markers; _f < _g.length; _f++) {
                            markerConfig = _g[_f];
                            marker = L.marker(markerConfig.latLng, markerConfig.options);
                            if (markerConfig.popupContent) {
                                marker.bindPopup(markerConfig.popupContent);
                            }
                            markerClusterGroup.addLayer(marker);
                        }
                        this.map.addLayer(markerClusterGroup);
                        if (markerClusterGroupConfig.boundToThis) {
                            groupBounds = markerClusterGroup.getBounds();
                            if (!bounds) {
                                bounds = groupBounds;
                            }
                            else {
                                bounds.extend(groupBounds);
                            }
                        }
                    }
                }
                if (bounds) {
                    this.map.fitBounds(bounds);
                }
                return [2 /*return*/];
            });
        });
    };
    return LeafletMap;
}(BaseComponent));
export { LeafletMap };
//# sourceMappingURL=leaflet-map.js.map