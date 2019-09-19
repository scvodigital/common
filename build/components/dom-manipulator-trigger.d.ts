import { BaseComponent } from './base-component';
import { DomManipulatorRules } from '../dom-utilities';
export declare class DomManipulatorTrigger extends BaseComponent<DomManipulatorTriggerConfig> {
    init(): Promise<void>;
    bindToEvents(): void;
    handleEvent(event: Event): void;
}
export interface DomManipulatorTriggerConfig {
    [event: string]: DomManipulatorRules;
}
