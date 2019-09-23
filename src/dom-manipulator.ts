import { DomReader, DomReaderRules } from './dom-reader';
import { Bristles } from 'bristles';

export function DomManipulator(rules: DomManipulatorRules, root: JQuery<HTMLElement>, data: any) {
  if (rules.domReader) {
    data.reader = DomReader(root, rules.domReader);
  }

  if (rules.addClasses) {
    rulesIterator(rules.addClasses, root, data, (element, classes: string[]) => {
      for (let className of classes) {
        className = Bristles.compile(className)(data);
        element.addClass(className);
      }
    });
  }

  if (rules.removeClasses) {
    rulesIterator(rules.removeClasses, root, data, (element, classes: string[]) => {
      for (let className of classes) {
        className = Bristles.compile(className)(data);
        element.removeClass(className);
      }
    });
  }

  if (rules.attributes) {
    rulesIterator(rules.attributes, root, data, (element, attributes: { [attribute: string]: string; }) => {
      for (const [attribute, value] of Object.entries(attributes)) {
        if (value === null) {
          element.removeAttr(attribute);
        } else {
          const renderedValue = Bristles.compile(value)(data);
          element.attr(attribute, renderedValue);
        }
      }
    });
  }

  if (rules.contents) {
    rulesIterator(rules.contents, root, data, (element, contents: string) => {
      const renderedContents = Bristles.compile(contents)(data);
      element.html(renderedContents);
    });
  }

  if (rules.styles) {
    rulesIterator(rules.styles, root, data, (element, styles: { [attribute: string]: string; }) => {
      for (const [property, value] of Object.entries(styles)) {
        if (value === null) {
          element.css(property, 'initial');
        } else {
          const renderedValue = Bristles.compile(value)(data);
          element.css(property, renderedValue);
        }
      }
    });
  }

  if (rules.deleteElements) {
    rulesIterator(rules.deleteElements, root, data, (element) => {
      element.remove();
    });
  }

  if (rules.createElements) {
    rulesIterator(rules.createElements, root, data, (element, config: CreateElementRule) => {
      const renderedHtml = Bristles.compile(config.template)(data);
      const newElement = $(renderedHtml);
      switch (config.where || 'beforeEnd') {
        case ('beforeStart'):
          newElement.insertBefore(element);
          break;
        case ('afterStart'):
          element.prepend(newElement);
          break;
        case ('afterEnd'):
          newElement.insertAfter(element);
          break;
        default:
          element.append(newElement);
      }
    });
  }

  if (rules.delayed) {
    for (const delayedRules of rules.delayed) {
      const delay = Number(delayedRules.delay) || 0;
      setTimeout(() => {
        DomManipulator(delayedRules.rules, root, data);
      }, delay);
    }
  }

  if (rules.run) {
    const functionCodes = Array.isArray(rules.run) ? rules.run : [rules.run];
    for (const functionCode of functionCodes) {
      try {
        const func = safeEval(functionCode);
        func.apply(data);
      } catch(err) {
        console.error('Failed to safely evaluate Dom Manipulator rule', err);
      }
    }
  }

  if (rules.focus && $(rules.focus)) {
    $(rules.focus)[0].focus();
  }

  function safeEval(fn: string) {
    return new Function('"use strict"; return ' + fn + ';');
  }
}

function rulesIterator(items: any, root: JQuery<HTMLElement>, context: any, callback: DomManipulatorRulesCallback) {
  const isArray = Array.isArray(items);
  const collection = isArray ? items : Object.keys(items);
  for (const selector of collection) {
    const data = isArray ? null : items[selector];
    const renderedSelector = Bristles.compile(selector)(context);
    const elements = renderedSelector === '>' ? root :
      renderedSelector.startsWith('>') ? root.find(renderedSelector.substr(1)) :
      renderedSelector === '<' ? root.parent() :
      renderedSelector.startsWith('<') ? root.parents(renderedSelector.substr(1)) :
      $(renderedSelector);
    elements.each((i, o) => {
      callback($(o), data);
    });
  }
}

export interface DomManipulatorRulesCallback {
  (element: JQuery<HTMLElement>, data?: any): void;
}

export interface DomManipulatorRules {
  domReader?: DomReaderRules;
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
  where?: 'beforeStart'|'afterStart'|'beforeEnd'|'afterEnd';
}