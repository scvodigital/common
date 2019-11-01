import { Basic } from './basic';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class ElementManipulator extends Basic<ElementManipulatorConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: ElementManipulatorConfig): Promise<any> {
    for (const [selector, rules] of Object.entries(config)) {
      const elements = await this.selectorResolver(context.rootElement, selector, context);

      if (rules.addClass) {
        elements.addClass(rules.addClass);
      }

      if (rules.removeClass) {
        elements.removeClass(rules.removeClass);
      }

      if (rules.toggleClass) {
        elements.toggleClass(rules.toggleClass);
      }

      if (typeof rules.attributes === 'object') {
        for (const [attribute, value] of Object.entries(rules.attributes)) {
          if (value === null) {
             elements.removeAttr(attribute);
          } else {
            elements.attr(attribute, value);
          }
        }
      }

      if (typeof rules.styles === 'object') {
        for (const [property, value] of Object.entries(rules.styles)) {
          if (value === null) {
            elements.css(property, 'initial');
          } else {
            elements.css(property, value);
          }
        }
      }

      if (typeof rules.data === 'object') {
        for (const [key, value] of Object.entries(rules.data)) {
          elements.data(key, value);
        }
      }

      if (typeof rules.contents !== 'undefined') {
        elements.html(rules.contents);
      }

      if (typeof rules.value !== 'undefined') {
        elements.val(rules.value);
      }

      if (rules.createElement) {
        if (!Array.isArray(rules.createElement)) {
          rules.createElement = [rules.createElement];
        }
        for (const newElements of rules.createElement) {
          const newElement = $(newElements.html);
          switch (newElements.where || 'beforeEnd') {
            case ('beforeStart'):
              newElement.insertBefore(elements);
              break;
            case ('afterStart'):
              elements.prepend(newElement);
              break;
            case ('afterEnd'):
              newElement.insertAfter(elements);
              break;
            default:
              elements.append(newElement);
          }
        }
      }

      if (rules.focus) {
        setTimeout(() => {
          elements.focus();
        }, 100);
      }

      if (rules.delete) {
        elements.remove();
      }
    }
  }
}

export interface ElementManipulatorConfig {
  [selector: string]: {
    addClass?: string | string[];
    removeClass?: string | string[];
    toggleClass?: string | string[];
    styles?: {
      [property: string]: string;
    };
    attributes?: {
      [attribute: string]: string;
    };
    data?: {
      [key: string]: any;
    }
    contents?: string;
    value?: string;
    createElement?: CreateElementConfig | CreateElementConfig[];
    focus?: boolean;
    delete?: boolean;
  };
}

export interface CreateElementConfig {
  html: string;
  where: 'beforeStart'|'afterStart'|'beforeEnd'|'afterEnd';
}