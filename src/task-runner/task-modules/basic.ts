import { ObjectCompiler } from '../object-compiler';
import { TaskConfig, TaskRunnerContext } from '../task-runner';

export class Basic<T> {
  get moduleType(): string {
    return this.constructor.name;
  }

  async execute(context: TaskRunnerContext, task: TaskConfig): Promise<any> {
    const coreConfig = await ObjectCompiler.compile(task.config, context) as T;
    const output = await this.main(context, task, coreConfig);
    return output;
  }

  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: T): Promise<any> {
    return config;
  }

  async selectorResolver(rootElement: JQuery<any>, rules: string, context: TaskRunnerContext) {
    const selectors = rules.split(/\|/g);
    let currentElement = rootElement;
    for (let selector of selectors) {
      const renderConfig = {
        __template: selector.trim(),
        __parser: 'string'
      };
      const ruleContext = JSON.parse(JSON.stringify(context));
      ruleContext.currentElement = currentElement;
      selector = await ObjectCompiler.renderer.render(renderConfig, context) as string;

      selector = selector.trim().replace(/(?:{)([\w-]+)(?:})/g, (_match: string, attribute: string) => {
        const value = currentElement.attr(attribute);
        return value || '';
      });

      if (selector === '' || selector === '>') {
        continue;
      } else if (selector === '<') {
        currentElement = currentElement.parent();
      } else if (selector.startsWith('>')) {
        currentElement = currentElement.find(selector.substr(1));
      } else if (selector.startsWith('<')) {
        currentElement = currentElement.parents(selector.substr(1));
      } else if (selector.startsWith('$')) {
        currentElement = currentElement.siblings(selector.substr(1));
      } else {
        currentElement = $(selector);
      }
    }
    return currentElement;
  }
}