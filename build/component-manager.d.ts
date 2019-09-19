import { BaseComponent } from './components/base-component';
export declare class ComponentManager {
    components: {
        [name: string]: any;
    };
    componentRegistry: ComponentRegistry;
    clock: number;
    constructor(components: any[]);
    registerComponents(): Promise<void>;
    mdlSelectorComponentMap: {
        '.mdl-js-button': string;
        '.mdl-js-checkbox': string;
        '.mdl-js-data-table  ': string;
        '.mdl-js-icon-toggle': string;
        '.mdl-js-layout': string;
        '.mdl-js-menu': string;
        '.mdl-js-progress': string;
        '.mdl-js-radio': string;
        '.mdl-js-slider': string;
        '.mdl-js-snackbar': string;
        '.mdl-js-spinner': string;
        '.mdl-js-switch': string;
        '.mdl-js-ripple-effect': string;
        '.mdl-js-tabs': string;
        '.mdl-tabs__tab': string;
        '.mdl-layout__tab': string;
        '.mdl-js-textfield': string;
        '.mdl-tooltip': string;
    };
    unregisterComponents(): Promise<void>;
    private updateRequested;
    requestUpdate(): void;
    tick(): Promise<void>;
}
export interface ComponentRegistry {
    [element: string]: BaseComponent<any>;
}
