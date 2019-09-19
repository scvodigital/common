/// <reference types="jquery" />
import 'mapbox.js';
import { BaseComponent } from "./base-component";
import { ComponentManager } from '../component-manager';
export declare class LeafletMap extends BaseComponent<LeafletConfig> {
    map: L.Map;
    featureGroups: L.FeatureGroup[];
    constructor(element: Element | JQuery<HTMLElement>, componentManager: ComponentManager);
    init(): Promise<void>;
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
}
export interface LeafletMarkerClusterGroup {
    markers: LeafletMarker[];
    options?: L.MarkerClusterGroupOptions;
    boundToThis?: boolean;
}
export interface LeafletFeature<T extends L.InteractiveLayerOptions> {
    type: 'Rectangle' | 'Circle' | 'Polygon' | 'Marker';
    popupContent?: string;
    options?: T;
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
