/// <reference types="jquery" />
import { BaseComponent } from './base-component';
export declare class MultiSelect extends BaseComponent<MultiSelectConfig> {
    checkboxElements: JQuery<HTMLElement>;
    menuItemElements: JQuery<HTMLElement>;
    selectedCountElement: JQuery<HTMLElement>;
    menuElement: JQuery<HTMLElement>;
    buttonElement: JQuery<HTMLElement>;
    materialMenu: any;
    selectedCount: number;
    init(): Promise<void>;
    updateSelectedCount(): void;
}
export interface MultiSelectConfig {
    selectedListLimit: number;
}
