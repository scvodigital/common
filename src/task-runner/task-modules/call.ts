import { Exception } from '../../exception';

import { Basic } from './basic';
import { TaskRunnerContext, TaskConfig } from '../task-runner';
import { ObjectCompiler } from '../object-compiler';

export class Call extends Basic<CallConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: CallConfig, root: JQuery<HTMLElement>): Promise<any> {
    const owner = this.objectResolver(config.owner, context, root);
    const callContext = config.context ? this.objectResolver(config.context, context, root) : owner;

    if (typeof owner[config.functionName] !== 'function') {
      throw new Error(`Could not find function '${config.functionName} on '${JSON.stringify(config.owner)}`);
    }

    try {
      if (config.isAsync) {
        return await owner[config.functionName].apply(callContext, config.arguments || []);
      } else {
        return owner[config.functionName].apply(callContext, config.arguments || []);
      }
    } catch (err) {
      throw new Exception(`Failed to call method. Config: ${JSON.stringify(config)}`, err);
    }
  }

  objectResolver(targetConfig: CallObject | CallElement, context: TaskRunnerContext, root: JQuery): any {
    let target: Object|undefined;
    let query = '';

    if (targetConfig.type === 'Window' || targetConfig.type === 'Context') {
      query = targetConfig.path;
      const targetContext = targetConfig.type === 'Window' ? window : context;
      target = ObjectCompiler.objectPath(targetContext, query);
    } else if (targetConfig.type === 'JQuery' || targetConfig.type === 'HTMLElement') {
      query = targetConfig.selector;
      let elements: JQuery<HTMLElement> | undefined;
      if (root) {
        elements =
          query === '>' ? root :
          query.startsWith('>') ? root.find(query.substr(1)) :
          query === '<' ? root.parent() :
          query.startsWith('<') ? root.parents(query.substr(1)) :
          $(query);
      } else {
        elements =
          query === '>' ? $('body') :
          query.startsWith('>') ? $(query.substr(1)) :
          query === '<' ? $('head') :
          query.startsWith('<') ? $('head ' + query.substr(1)) :
          $(query);
      }
      if (elements.length > 0) {
        target = targetConfig.type === 'JQuery' ? elements : elements[0];
      }
    }

    if (typeof target !== 'object' || target === null) {
      throw Error(`Could not find target '${targetConfig.type} > ${query}`)
    }

    return target;
  }
}

export interface CallConfig {
  owner: CallObject | CallElement;
  context?: CallObject | CallElement;
  functionName: string;
  arguments?: any[];
  isAsync?: boolean;
}

export interface CallObject {
  type: 'Window' | 'Context';
  path: string;
}

export interface CallElement {
  type: 'HTMLElement' | 'JQuery';
  selector: string;
}