/// <reference types="jquery" />
import { ComponentManager } from '../component-manager';
export declare class BaseComponent<T> {
    componentManager: ComponentManager;
    config: T;
    uid: string;
    element: JQuery<HTMLElement>;
    readonly componentType: string;
    constructor(element: Element | JQuery<HTMLElement>, componentManager: ComponentManager);
    init(): Promise<void>;
    destroy(): Promise<void>;
}
