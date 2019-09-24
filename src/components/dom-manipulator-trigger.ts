import { BaseComponent } from './base-component';
import { DomManipulator, DomManipulatorRules } from '../dom-manipulator';

export class DomManipulatorTrigger extends BaseComponent<DomManipulatorTriggerConfig> {
  async init() {
    this.bindToEvents();
  }

  bindToEvents() {
    for (const element of Array.from(this.element)) {
      for (const eventName of Object.keys(this.config)) {
        element.removeEventListener(eventName, this);
        element.addEventListener(eventName, this);
      }
    }
  }

  handleEvent(event: Event) {
    const context = {
      event,
      window,
      $,
      instance: this,
    };
    const rules = this.config[event.type];
    const target = $(event.currentTarget as HTMLElement || this.element);
    DomManipulator(rules, target, context)
      .then()
      .catch(err => {
        console.error('DOM Manipulator Failed', err);
      });
  }
}

export interface DomManipulatorTriggerConfig {
  [event: string]: DomManipulatorRules;
}