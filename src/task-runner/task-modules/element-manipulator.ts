import { Basic } from './basic';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class ElementManipulator extends Basic<ElementManipulatorConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: ElementManipulatorConfig, root: JQuery<HTMLElement>): Promise<any> {
    for (const [selector, rules] of Object.entries(config)) {
      let elements: JQuery<HTMLElement> | undefined;
      if (root) {
        elements =
          selector === '>' ? root :
          selector.startsWith('>') ? root.find(selector.substr(1)) :
          selector === '<' ? root.parent() :
          selector.startsWith('<') ? root.parents(selector.substr(1)) :
          $(selector);
      } else {
        elements =
          selector === '>' ? $('body') :
          selector.startsWith('>') ? $(selector.substr(1)) :
          selector === '<' ? $('head') :
          selector.startsWith('<') ? $('head ' + selector.substr(1)) :
          $(selector);
      }

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

      if (typeof rules.contents === 'string') {
        elements.html(rules.contents);
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
    }
  }
}

export interface ElementManipulatorConfig {
  [selector: string]: {
    addClass?: string | string[];
    removeClass?: string | string[];
    toggleClass?: string | string[];
    attributes?: {
      [attribute: string]: any
    };
    contents?: string;
    createElement?: CreateElementConfig | CreateElementConfig[];
  };
}

export interface CreateElementConfig {
  html: string;
  where: 'beforeStart'|'afterStart'|'beforeEnd'|'afterEnd';
}