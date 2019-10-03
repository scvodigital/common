import { RenderConfig, Renderer } from './renderer';

const JSON6 = require('json-6');

import { Basic } from './task-modules/basic';
import { ElementManipulator } from './task-modules/element-manipulator';
import { Delay } from './task-modules/delay';
import { DomReader } from './task-modules/dom-reader';
import { Request } from './task-modules/request';
import { Call } from './task-modules/call';
import { JsonLogic } from './task-modules/json-logic';
import { Switch } from './task-modules/switch';
import { Run } from './task-modules/run';
import { MultiTask } from './task-modules/multi-task';

import { FirebaseChangeEmail } from './task-modules/firebase-change-email';
import { FirebaseChangePassword } from './task-modules/firebase-change-password';
import { FirebaseCreateAccount } from './task-modules/firebase-create-account';
import { FirebaseDeleteUser } from './task-modules/firebase-delete-user';
import { FirebaseGetUser } from './task-modules/firebase-get-user';
import { FirebaseLinkProvider } from './task-modules/firebase-link-provider';
import { FirebaseSendPasswordReset } from './task-modules/firebase-send-password-reset';
import { FirebaseReAuthenticate } from './task-modules/firebase-re-authenticate';
import { FirebaseSignIn } from './task-modules/firebase-sign-in';
import { FirebaseSignOut } from './task-modules/firebase-sign-out';
import { FirebaseUnlinkProvider } from './task-modules/firebase-unlink-provider';

/**
 * TODO: Create the following tasks
 *  - Evaluate
 */

export interface ITaskRunnerContext {
  errors?: { [taskName: string]: Error };
  metadata?: any;
  data?: any;
  rootElement?: JQuery<any>;
}
export class TaskRunnerContext implements ITaskRunnerContext {
  errors: { [taskName: string]: Error } = {};
  metadata: any = {};
  data: any = {};
  rootElement: JQuery<any> = $(document);
  constructor (config?: ITaskRunnerContext) {
    Object.assign(this, config || {});
  };
}

export class TaskRunner {
  static taskModules: { [taskModuleName: string]: Basic<any> } = {
    elementManipulator: new ElementManipulator(),
    delay: new Delay(),
    request: new Request(),
    domReader: new DomReader(),
    call: new Call(),
    jsonLogic: new JsonLogic(),
    switch: new Switch(),
    run: new Run(),
    multiTask: new MultiTask(),
    firebaseChangeEmail: new FirebaseChangeEmail(),
    firebaseChangePassword: new FirebaseChangePassword(),
    firebaseCreateAccount: new FirebaseCreateAccount(),
    firebaseDeleteUser: new FirebaseDeleteUser(),
    firebaseGetUser: new FirebaseGetUser(),
    firebaseLinkProvider: new FirebaseLinkProvider(),
    firebaseSendPasswordReset: new FirebaseSendPasswordReset(),
    firebaseSignIn: new FirebaseSignIn(),
    firebaseSignOut: new FirebaseSignOut(),
    firebaseReAuthenticate: new FirebaseReAuthenticate(),
    firebaseUnlinkProvider: new FirebaseUnlinkProvider(),
    basic: new Basic()
  }

  static renderer = new Renderer();

  static async run(tasks: (TaskConfig | string)[], context: TaskRunnerContext = new TaskRunnerContext(), renderOutput?: RenderConfig): Promise<any> {
    console.log('About to run the following tasks', tasks);
    for (const taskItem of tasks) {
      let task: TaskConfig|undefined;

      if (typeof taskItem === 'string') {
        const taskJson = $(`script[data-task="${taskItem}"]`).html();
        task = JSON6.parse(taskJson) as TaskConfig;
      } else {
        task = taskItem;
      }

      const taskModule = TaskRunner.taskModules.hasOwnProperty(task.type) ? TaskRunner.taskModules[task.type] : TaskRunner.taskModules.basic;
      const taskName = task.name || taskModule.moduleType + '-' + Math.floor(Math.random() * (999999 - 100000 + 1) ) + 100000;

      console.log('Running task', taskName, task);

      try {
        const taskOutput = await taskModule.execute(context, task);
        console.log('Task output', taskOutput);
        context.data[taskName] = taskOutput;
        if (typeof taskOutput === 'object' && taskOutput.hasOwnProperty('__halt') && taskOutput.__halt === true) {
          break;
        }
      } catch (err) {
        console.error('Failed to run task', err, task);
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