/// <reference types="jquery" />
export declare function DomManipulator(rules: DomManipulatorRules, root: JQuery<HTMLElement>, data: any): void;
export declare function DomReader(rules: DomReaderRules, root: JQuery<HTMLElement>): any;
export interface DomReaderRules {
    [name: string]: {
        selector: string;
        attribute: string;
        default?: string;
        array?: boolean;
    };
}
export interface DomManipulatorRulesCallback {
    (element: JQuery<HTMLElement>, data?: any): void;
}
export interface DomManipulatorRules {
    addClasses?: RulesMap<string[]>;
    removeClasses?: RulesMap<string[]>;
    attributes?: RulesMap<RulesMap<string>>;
    contents?: RulesMap<string>;
    styles?: RulesMap<RulesMap<string>>;
    deleteElements?: string[];
    createElements?: RulesMap<CreateElementRule>;
    run?: any;
    delayed?: DelayedRules[];
    focus?: string;
}
export interface RulesMap<T> {
    [selector: string]: T;
}
export interface DelayedRules {
    delay: number;
    rules: DomManipulatorRules;
}
export interface CreateElementRule {
    template: string;
    where?: 'beforeStart' | 'afterStart' | 'beforeEnd' | 'afterEnd';
}
