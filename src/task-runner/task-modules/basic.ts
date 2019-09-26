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

  selectorResolver(rootElement: JQuery<any>, rules: string) {
    const selectors = rules.split(/\s*|\s*/g);
    let currentElement = rootElement;
    for (const selector of selectors) {
      if (selector === '' || selector === '>') {
        continue;
      } else if (selector === '<') {
        currentElement = currentElement.parent();
      } else if (selector.startsWith('>')) {
        currentElement = currentElement.find(selector.substr(1));
      } else if (selector.startsWith('<')) {
        currentElement = currentElement.parents(selector.substr(1));
      } else if (selector.startsWith('$$')) {
        currentElement = currentElement.siblings(selector.substr(2)).addBack();
      } else if (selector.startsWith('$')) {
        currentElement = currentElement.siblings(selector.substr(1));
      } else {
        currentElement = $(selector);
      }
    }
    return currentElement;
  }
}