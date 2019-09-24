import * as Leaflet from 'leaflet';
require('leaflet');
require('leaflet.markercluster');
// tslint:disable-next-line: no-import-side-effect
import 'mapbox.js';

import { BaseComponent } from "./base-component";
import { ComponentManager } from '../component-manager';
import { DomManipulatorRules, DomManipulator } from '../dom-manipulator';

const L = (window as any).L as typeof Leaflet;

const defaultIcon = L.icon({
  iconRetinaUrl: require('../../node_modules/leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('../../node_modules/leaflet/dist/images/marker-icon.png'),
  iconAnchor: [13, 41],
  shadowUrl: require('../../node_modules/leaflet/dist/images/marker-shadow.png')
});

L.Marker.prototype.options.icon = defaultIcon;

export class LeafletMap extends BaseComponent<LeafletConfig> {
  map: L.Map;
  featureGroups: L.FeatureGroup[] = [];

  constructor(element: Element | JQuery<HTMLElement>, componentManager: ComponentManager) {
    super(element, componentManager);
    this.map = L.map(this.element[0], this.config.mapOptions);
    this.map.setView(this.config.initialLatLng, this.config.initialZoom);

    const osmAttrib = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
    L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
      attribution: osmAttrib,
      minZoom: 5,
      maxZoom: 17,
      opacity: 0.9
    }).addTo(this.map);
    L.control.scale().addTo(this.map);
  }

  async init() {
    let bounds: Leaflet.LatLngBounds | undefined;
    if (this.config.featureGroups) {
      for (const featureGroupConfig of this.config.featureGroups) {
        const featureGroup = new L.FeatureGroup(undefined, featureGroupConfig.options);
        for (const featureConfig of featureGroupConfig.features) {
          let feature: L.Rectangle | L.Circle | L.Polygon | L.Marker | undefined;

          switch (featureConfig.type) {
            case ('Rectangle'):
              feature = new L.Rectangle((featureConfig as LeafletRectangle).latLngBounds, featureConfig.options);
              break;
            case ('Circle'):
              feature = new L.Circle((featureConfig as LeafletCircle).latLng, featureConfig.options);
              break;
            case ('Polygon'):
              feature = new L.Polygon((featureConfig as LeafletPolygon).latLngs, featureConfig.options);
              break;
            case ('Marker'):
              if ((featureConfig as any).options && (featureConfig as any).options.icon) {
                (featureConfig as any).options.icon = L.icon((featureConfig as any).options.icon);
              }
              feature = new L.Marker((featureConfig as LeafletMarker).latLng, featureConfig.options);
              break;
          }

          if (feature) {
            if (featureConfig.popupContent) {
              feature.bindPopup(featureConfig.popupContent);
            }

            if (featureConfig.events) {
              for (const [eventName, rules] of Object.entries(featureConfig.events)) {
                feature.on(eventName, async (event) => {
                  const context = {
                    event,
                    feature,
                    featureConfig,
                    featureGroupConfig
                  };
                  await DomManipulator(rules, this.element, context);
                });
              }
            }

            featureGroup.addLayer(feature);
          }
        }
        this.map.addLayer(featureGroup);

        if (featureGroupConfig.boundToThis) {
          const groupBounds = featureGroup.getBounds();
          if (!bounds) {
            bounds = groupBounds;
          } else {
            bounds.extend(groupBounds);
          }
        }

        if (featureGroupConfig.events) {
          for (const [eventName, rules] of Object.entries(featureGroupConfig.events)) {
            featureGroup.on(eventName, async (event) => {
              const context = {
                event,
                featureGroup,
                featureGroupConfig
              };
              await DomManipulator(rules, this.element, context);
            });
          }
        }
      }
    }

    if (this.config.markerClusterGroups) {
      for (const markerClusterGroupConfig of this.config.markerClusterGroups) {
        const markerClusterGroup = new (L.markerClusterGroup as any)(markerClusterGroupConfig.options) as L.MarkerClusterGroup;

        for (const markerConfig of markerClusterGroupConfig.markers) {
          const marker = L.marker(markerConfig.latLng, markerConfig.options);

          if (markerConfig.popupContent) {
            marker.bindPopup(markerConfig.popupContent);
          }

          if (markerConfig.events) {
            for (const [eventName, rules] of Object.entries(markerConfig.events)) {
              marker.on(eventName, async (event) => {
                const context = {
                  event,
                  feature: marker,
                  featureConfig: markerConfig,
                  featureGroupConfig: markerClusterGroupConfig
                };
                await DomManipulator(rules, this.element, context);
              });
            }
          }

          markerClusterGroup.addLayer(marker);
        }

        this.map.addLayer(markerClusterGroup);

        if (markerClusterGroupConfig.boundToThis) {
          const groupBounds = markerClusterGroup.getBounds();
          if (!bounds) {
            bounds = groupBounds;
          } else {
            bounds.extend(groupBounds);
          }
        }

        if (markerClusterGroupConfig.events) {
          for (const [eventName, rules] of Object.entries(markerClusterGroupConfig.events)) {
            markerClusterGroup.on(eventName, async (event) => {
              const context = {
                event,
                featureGroup: markerClusterGroup,
                featureGroupConfig: markerClusterGroupConfig
              };
              await DomManipulator(rules, this.element, context);
            });
          }
        }
      }
    }

    if (bounds) {
      this.map.fitBounds(bounds);
    }
  }
}

export interface LeafletConfig {
  mapOptions: L.MapOptions;
  initialLatLng: L.LatLngExpression;
  initialZoom: number;
  featureGroups?: LeafletFeatureGroup[];
  markerClusterGroups?: LeafletMarkerClusterGroup[];
}

export interface LeafletFeatureGroup {
  features: LeafletFeature<L.InteractiveLayerOptions>[];
  options?: L.LayerOptions;
  boundToThis?: boolean;
  events?: { [event: string]: DomManipulatorRules };
}

export interface LeafletMarkerClusterGroup {
  markers: LeafletMarker[];
  options?: L.MarkerClusterGroupOptions;
  boundToThis?: boolean;
  events?: { [event: string]: DomManipulatorRules };
}

export interface LeafletFeature<T extends L.InteractiveLayerOptions> {
  type: 'Rectangle' | 'Circle' | 'Polygon' | 'Marker';
  popupContent?: string;
  options?: T;
  events?: { [event: string]: DomManipulatorRules };
  [key: string]: any;
}

export interface LeafletRectangle extends LeafletFeature<L.PolylineOptions> {
  latLngBounds: L.LatLngBoundsExpression;
}

export interface LeafletCircle extends LeafletFeature<L.CircleMarkerOptions> {
  latLng: L.LatLngExpression;
}

export interface LeafletPolygon extends LeafletFeature<L.PolylineOptions> {
  latLngs: L.LatLngExpression[];
}

export interface LeafletMarker extends LeafletFeature<L.MarkerOptions> {
  latLng: [number, number];
}