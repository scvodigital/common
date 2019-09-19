/// <reference types="jquery" />
import { BaseComponent } from "./base-component";
import { DomManipulatorRules } from '../dom-utilities';
export declare const BloodhoundTokenizers: {
    nonword: any;
    whitespace: any;
    objNonword: any;
    objWhitespace: any;
};
export declare class Typeahead extends BaseComponent<TypeaheadConfig> {
    typeahead: any;
    selectedItem: any;
    autocompleted: boolean;
    datasets: {
        [name: string]: TypeaheadDataset;
    };
    textbox: JQuery<HTMLElement>;
    isLocked(): boolean;
    init(): Promise<void>;
    setupTypeahead(): void;
    typeaheadSelect(event: any, suggestion: any): void;
    nothingSelected(): void;
}
export interface TypeaheadConfig {
    typeaheadOptions?: TypeaheadOptions;
    itemSelectedRules?: DomManipulatorRules;
    nothingSelectedRules?: DomManipulatorRules;
    datasets: TypeaheadDataset[];
}
export interface TypeaheadOptions {
    highlight?: boolean;
    hint?: boolean;
    minLength?: number;
    className?: TypeaheadClassNames;
}
export interface TypeaheadClassNames {
    input?: string;
    hint?: string;
    menu?: string;
    dataset?: string;
    suggestion?: string;
    empty?: string;
    open?: string;
    cursor?: string;
    highlight?: string;
}
export interface TypeaheadDataset {
    name: string;
    limit?: number;
    display?: string;
    templates?: TypeaheadDatasetTemplates;
    bloodhound: BloodhoundOptions;
    source?: any;
}
export interface TypeaheadDatasetTemplates {
    notFound?: string;
    pending?: string;
    header?: string;
    footer?: string;
    suggestion?: string;
}
export interface BloodhoundOptions {
    datumTokenizer: 'nonword' | 'whitespace' | 'objNonword' | 'objWhitespace';
    datumTokenizerField: string;
    queryTokenizer: 'nonword' | 'whitespace' | 'objNonword' | 'objWhitespace';
    initialize?: boolean;
    sufficient?: number;
    local?: any[];
    prefetch?: string | BloodhoundPrefetchOptions;
    remote?: string | BloodhoundRemoteOptions;
}
export interface BloodhoundPrefetchOptions {
    url: string;
    cache?: boolean;
    ttl?: number;
    cacheKey?: string;
    thumbprint?: string;
}
export interface BloodhoundRemoteOptions {
    url: string;
    wildcard?: string;
    rateLimitBy?: 'debounce' | 'throttle';
    rateLimitWait?: number;
}
