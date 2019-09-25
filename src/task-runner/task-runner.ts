import { RenderConfig, Renderer } from './renderer';

import { Basic } from './task-modules/basic';
import { ElementManipulator } from './task-modules/element-manipulator';
import { Delay } from './task-modules/delay';
import { DomReader } from './task-modules/dom-reader';
import { Request } from './task-modules/request';
import { Call } from './task-modules/call';
import { JsonLogic } from './task-modules/json-logic';

/**
 * TODO: Create the following tasks
 *  - Evaluate
 */


export class TaskRunnerContext {
  errors: { [taskName: string]: Error } = {};
  constructor (public metaData: any = {}, public data: any = {}) { }
}

export class TaskRunner {
  static taskModules: { [taskModuleName: string]: Basic<any> } = {
    elementManipulator: new ElementManipulator(),
    delay: new Delay(),
    request: new Request(),
    domReader: new DomReader(),
    call: new Call(),
    jsonLogic: new JsonLogic(),
    basic: new Basic()
  }

  static renderer = new Renderer();

  static async run(tasks: TaskConfig[], context: TaskRunnerContext = new TaskRunnerContext(), root?: JQuery<HTMLElement>, renderOutput?: RenderConfig): Promise<any> {
    console.log('About to run the following tasks', tasks);
    for (const task of tasks) {
      const taskModule = TaskRunner.taskModules.hasOwnProperty(task.type) ? TaskRunner.taskModules[task.type] : TaskRunner.taskModules.basic;
      const taskName = task.name || taskModule.moduleType + '-' + Math.floor(Math.random() * (999999 - 100000 + 1) ) + 100000;

      console.log('Running task', taskName, task);

      try {
        const taskOutput = await taskModule.execute(context, task, root);
        console.log('Task output', taskOutput);
        context.data[taskName] = taskOutput;
        if (typeof taskOutput === 'object' && taskOutput.hasOwnProperty('__halt') && taskOutput.__halt === true) {
          break;
        }
      } catch (err) {
        console.error('Failed to run task', err);
        context.errors[taskName] = err;
        if (task.haltOnError) {
          break;
        }
      }
    }

    if (renderOutput) {
      const output = await TaskRunner.renderer.render(renderOutput, context);
      return output;
    }
  }
}

export interface TaskConfig {
  name?: string;
  type: string;
  config: string;
  haltOnError?: boolean;
}